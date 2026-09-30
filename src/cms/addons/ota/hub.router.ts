/**
 * 📦 OTA Hub Endpoints Router
 * Dipisahkan sesuai SOP Rule 20 (Clean Architecture & Batas < 1000 Baris)
 */
import { Hono } from "hono";
import { otaAddonService, CORE_VERSION } from "./services/ota.service";

export const otaHubRouter = new Hono<{ Bindings: any }>();

// 9. GET /clients - Daftar downstream clients terdaftar di Hub beserta ringkasan status rollout
otaHubRouter.get('/clients', async (c) => {
    try {
        const db = c.env?.DB;
        if (!db) return c.json({ success: true, data: [] });
        await db.prepare(`
            CREATE TABLE IF NOT EXISTS ota_clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_url TEXT UNIQUE NOT NULL,
                site_name TEXT,
                is_active INTEGER DEFAULT 1,
                installed_version TEXT DEFAULT '0.1.1',
                target_version TEXT,
                rollout_status TEXT DEFAULT 'pending',
                error_reason TEXT,
                last_reported_at DATETIME,
                last_synced_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `).run().catch(() => {});

        // Alter table migrations fallback jika kolom belum ada
        const cols = ['installed_version', 'target_version', 'rollout_status', 'error_reason', 'last_reported_at'];
        for (const col of cols) {
            await db.prepare(`ALTER TABLE ota_clients ADD COLUMN ${col} TEXT;`).run().catch(() => {});
        }

        const res = await db.prepare("SELECT * FROM ota_clients ORDER BY created_at DESC").all();
        const clients = res.results || [];

        // Hitung ringkasan status rollout
        const summary = {
            total: clients.length,
            updated: clients.filter((k: any) => k.rollout_status === 'updated').length,
            received: clients.filter((k: any) => k.rollout_status === 'received').length,
            failed: clients.filter((k: any) => k.rollout_status === 'failed').length,
            pending: clients.filter((k: any) => !k.rollout_status || k.rollout_status === 'pending').length
        };

        return c.json({ success: true, data: clients, summary });
    } catch(e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

// 9b. POST /clients/clear - Kosongkan seluruh riwayat instansi klien di Hub
otaHubRouter.post('/clients/clear', async (c) => {
    try {
        const db = c.env?.DB;
        if (!db) return c.json({ success: false, error: 'Database binding (DB) tidak ditemukan.' }, 500);
        await db.prepare("DELETE FROM ota_clients").run().catch(() => {});
        return c.json({
            success: true,
            message: 'Seluruh riwayat instansi klien berhasil dikosongkan dari database.'
        });
    } catch (err: any) {
        return c.json({ success: false, error: err.message }, 500);
    }
});

// 10. POST /clients/report-status - Laporan balik status pembaruan dari instansi Klien ke Hub
otaHubRouter.post('/clients/report-status', async (c) => {
    try {
        const db = c.env?.DB;
        if (!db) return c.json({ success: false, error: 'DB binding tidak ditemukan' }, 500);
        const body = await c.req.json().catch(() => ({}));
        const { client_url, site_name, installed_version, target_version, rollout_status, error_reason } = body;

        if (!client_url || typeof client_url !== 'string') {
            return c.json({ success: false, error: 'client_url wajib diisi' }, 400);
        }

        const cleanUrl = client_url.trim().replace(/\/+$/, '');
        let statusVal = rollout_status || 'received'; // 'received' | 'updated' | 'failed'
        let finalError = error_reason || null;
        if (installed_version && target_version && otaAddonService.compareVersions(installed_version, target_version) >= 0) {
            statusVal = 'updated';
            finalError = null;
        }

        await db.prepare(`
            CREATE TABLE IF NOT EXISTS ota_clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_url TEXT UNIQUE NOT NULL,
                site_name TEXT,
                is_active INTEGER DEFAULT 1,
                installed_version TEXT DEFAULT '0.1.1',
                target_version TEXT,
                rollout_status TEXT DEFAULT 'pending',
                error_reason TEXT,
                last_reported_at DATETIME,
                last_synced_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `).run().catch(() => {});

        for (const col of ['installed_version', 'target_version', 'rollout_status', 'error_reason', 'last_reported_at']) {
            await db.prepare(`ALTER TABLE ota_clients ADD COLUMN ${col} TEXT;`).run().catch(() => {});
        }

        await db.prepare(`
            INSERT INTO ota_clients (client_url, site_name, installed_version, target_version, rollout_status, error_reason, is_active, last_reported_at, last_synced_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT(client_url) DO UPDATE SET
                site_name = COALESCE(excluded.site_name, ota_clients.site_name),
                installed_version = COALESCE(excluded.installed_version, ota_clients.installed_version),
                target_version = COALESCE(excluded.target_version, ota_clients.target_version),
                rollout_status = excluded.rollout_status,
                error_reason = excluded.error_reason,
                last_reported_at = CURRENT_TIMESTAMP,
                last_synced_at = CURRENT_TIMESTAMP
        `).bind(
            cleanUrl,
            site_name || cleanUrl,
            installed_version || '0.1.1',
            target_version || '0.1.2',
            statusVal,
            finalError
        ).run();

        return c.json({
            success: true,
            message: `Status pembaruan klien '${cleanUrl}' berhasil dicatat: ${statusVal}`,
            data: { client_url: cleanUrl, rollout_status: statusVal }
        });
    } catch(e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

// 11. POST /clients/register & /clients/heartbeat - Pendaftaran & heartbeat otomatis klien downstream ke Hub
const handleClientRegister = async (c: any) => {
    try {
        const db = c.env?.DB;
        if (!db) return c.json({ success: false, error: 'DB binding tidak ditemukan' }, 500);
        const body = await c.req.json().catch(() => ({}));
        const { client_url, site_name, installed_version, target_version, rollout_status, error_reason } = body;
        if (!client_url || typeof client_url !== 'string') {
            return c.json({ success: false, error: 'client_url wajib diisi' }, 400);
        }
        const cleanUrl = client_url.trim().replace(/\/+$/, '');
        let statusVal = rollout_status || 'received';
        let finalError = error_reason || null;
        if (installed_version && target_version && otaAddonService.compareVersions(installed_version, target_version) >= 0) {
            statusVal = 'updated';
            finalError = null;
        }

        await db.prepare(`
            CREATE TABLE IF NOT EXISTS ota_clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_url TEXT UNIQUE NOT NULL,
                site_name TEXT,
                is_active INTEGER DEFAULT 1,
                installed_version TEXT DEFAULT '0.1.1',
                target_version TEXT,
                rollout_status TEXT DEFAULT 'pending',
                error_reason TEXT,
                last_reported_at DATETIME,
                last_synced_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `).run().catch(() => {});

        for (const col of ['installed_version', 'target_version', 'rollout_status', 'error_reason', 'last_reported_at']) {
            await db.prepare(`ALTER TABLE ota_clients ADD COLUMN ${col} TEXT;`).run().catch(() => {});
        }

        await db.prepare(`
            INSERT INTO ota_clients (client_url, site_name, installed_version, target_version, rollout_status, error_reason, is_active, last_reported_at, last_synced_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT(client_url) DO UPDATE SET
                site_name = COALESCE(excluded.site_name, ota_clients.site_name),
                installed_version = COALESCE(excluded.installed_version, ota_clients.installed_version),
                target_version = COALESCE(excluded.target_version, ota_clients.target_version),
                rollout_status = excluded.rollout_status,
                error_reason = excluded.error_reason,
                is_active = 1,
                last_reported_at = CURRENT_TIMESTAMP,
                last_synced_at = CURRENT_TIMESTAMP
        `).bind(
            cleanUrl,
            site_name || cleanUrl,
            installed_version || '0.1.1',
            target_version || '0.1.2',
            statusVal,
            finalError
        ).run();

        return c.json({
            success: true,
            message: 'Klien downstream berhasil terdaftar dan tersinkronkan ke Hub',
            data: {
                client_url: cleanUrl,
                rollout_status: statusVal
            }
        });
    } catch(e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
};

otaHubRouter.post('/clients/register', handleClientRegister);
otaHubRouter.post('/clients/heartbeat', handleClientRegister);

// 12. GET /git-status - Status sinkronisasi rilis Hub ke upstream Git (cakipin/cmsMu-go)
otaHubRouter.get('/git-status', async (c) => {
    try {
        const db = c.env?.DB;
        const url = new URL(c.req.url);
        const baseUrl = `${url.protocol}//${url.host}`;
        const manifest = await otaAddonService.getDynamicManifest(db, baseUrl);
        const hubVersion = manifest.version || CORE_VERSION;

        let latestGitTag = '0.1.2';
        let lastPushedAt = null;
        if (db) {
            try {
                await db.prepare(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);`).run().catch(() => {});
                const row: any = await db.prepare("SELECT value FROM settings WHERE key = 'latest_git_pushed_version' LIMIT 1").first();
                if (row?.value) latestGitTag = row.value.trim();

                const timeRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'latest_git_pushed_at' LIMIT 1").first();
                if (timeRow?.value) lastPushedAt = timeRow.value.trim();
            } catch (_) {}
        }

        const isSynced = otaAddonService.compareVersions(latestGitTag, hubVersion) >= 0;

        // Ambil riwayat rilis untuk log git
        let releaseLogs: any[] = [];
        if (db) {
            try {
                const res = await db.prepare("SELECT id, version, changelog, channel, is_active, created_at FROM ota_releases ORDER BY created_at DESC LIMIT 10").all();
                releaseLogs = (res.results || []).map((r: any) => ({
                    id: r.id || `${r.version}-${r.created_at}`,
                    version: r.version,
                    tag: r.version.startsWith('v') ? r.version : `v${r.version}`,
                    changelog: r.changelog,
                    date: r.created_at,
                    status: (otaAddonService.compareVersions(latestGitTag, r.version) >= 0) ? 'pushed' : 'pending'
                }));
            } catch (_) {}
        }

        return c.json({
            success: true,
            data: {
                repository: 'https://github.com/cakipin/cmsMu-go',
                remote: 'public-release',
                branch: 'main',
                hubVersion,
                latestGitTag,
                lastPushedAt,
                isSynced,
                syncStatus: isSynced ? 'synced' : 'pending_push',
                quickCommand: 'npm run release:git',
                cliCommand: 'git push public-release main --tags',
                logs: releaseLogs
            }
        });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

// 13. POST /git-push - Tandai dan simpan konfirmasi push rilis ke upstream Git
otaHubRouter.post('/git-push', async (c) => {
    try {
        const db = c.env?.DB;
        if (!db) return c.json({ success: false, error: 'Database binding (DB) tidak ditemukan.' }, 500);
        const body = await c.req.json().catch(() => ({}));
        const version = (body.version || CORE_VERSION).replace(/^v/, '');

        await db.prepare(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);`).run().catch(() => {});
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

        await db.prepare(`
            INSERT INTO settings (key, value) VALUES ('latest_git_pushed_version', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `).bind(version).run();

        await db.prepare(`
            INSERT INTO settings (key, value) VALUES ('latest_git_pushed_at', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `).bind(now).run();

        return c.json({
            success: true,
            message: `Rilis v${version} berhasil dicatat sebagai tersinkronkan ke repositori Git cmsMu-go!`,
            data: { version, pushed_at: now }
        });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});
