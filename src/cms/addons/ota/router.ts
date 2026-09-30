import { Hono } from 'hono';
import { otaAddonService, CORE_VERSION, CORE_BUILD_DATE, isHubMode, DEFAULT_UPSTREAM_URL, DEFAULT_UPDATED_COMPONENTS } from './services/ota.service';
import { runAutoMigration, getMigrationStatus } from '../../db/migration-runner';

export const otaRouter = new Hono<{ Bindings: any }>();

// 0. OPTIONS /* - Handle CORS preflight requests
otaRouter.options('*', (c) => c.text('', 204));

// 1. GET /manifest - Manifest publik versi Core CMSMu
otaRouter.get('/manifest', async (c) => {
    const url = new URL(c.req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const db = c.env?.DB;
    const manifest = await otaAddonService.getDynamicManifest(db, baseUrl);

    // Auto-discovery downstream klien saat mengecek manifest rilis ke Hub
    if (db) {
        try {
            const rawClient = c.req.query('client_url') || c.req.header('Origin') || c.req.header('Referer') || '';
            if (rawClient && !rawClient.includes('cms.labmu.dev') && !rawClient.includes('localhost')) {
                const parsed = new URL(rawClient);
                const clientOrigin = `${parsed.protocol}//${parsed.host}`;
                const rawClientVer = c.req.query('client_version');
                const siteName = c.req.query('site_name') || parsed.hostname;
                const targetVersion = manifest?.version || '0.1.3';

                let isUpdated = false;
                if (rawClientVer) {
                    isUpdated = otaAddonService.compareVersions(rawClientVer, targetVersion) >= 0;
                }
                const rolloutStatus = isUpdated ? 'updated' : (rawClientVer ? 'received' : 'pending');
                const errorReason = isUpdated ? null : (rawClientVer ? 'Notifikasi diterima oleh klien, menunggu aksi update' : null);

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

                await db.prepare(`
                    INSERT INTO ota_clients (client_url, site_name, installed_version, target_version, rollout_status, error_reason, is_active, last_reported_at, last_synced_at)
                    VALUES (?, ?, COALESCE(?, '0.1.1'), ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    ON CONFLICT(client_url) DO UPDATE SET
                        site_name = COALESCE(excluded.site_name, ota_clients.site_name),
                        installed_version = CASE 
                            WHEN ? IS NOT NULL THEN excluded.installed_version 
                            ELSE ota_clients.installed_version 
                        END,
                        target_version = COALESCE(excluded.target_version, ota_clients.target_version),
                        rollout_status = CASE 
                            WHEN excluded.rollout_status = 'updated' THEN 'updated'
                            WHEN ota_clients.rollout_status = 'updated' THEN 'updated'
                            WHEN ? IS NOT NULL THEN excluded.rollout_status
                            ELSE ota_clients.rollout_status
                        END,
                        error_reason = CASE 
                            WHEN excluded.rollout_status = 'updated' OR ota_clients.rollout_status = 'updated' THEN NULL
                            WHEN ? IS NOT NULL THEN excluded.error_reason
                            ELSE ota_clients.error_reason
                        END,
                        is_active = 1,
                        last_reported_at = CURRENT_TIMESTAMP,
                        last_synced_at = CURRENT_TIMESTAMP
                `).bind(
                    clientOrigin, 
                    siteName, 
                    rawClientVer, 
                    targetVersion, 
                    rolloutStatus, 
                    errorReason,
                    rawClientVer,
                    rawClientVer,
                    rawClientVer
                ).run().catch(() => {});
            }
        } catch (_) {}
    }

    return c.json({ success: true, data: manifest });
});

// 2. GET /mode - Mendeteksi mode operasional instans (Hub vs Client)
otaRouter.get('/mode', async (c) => {
    const url = new URL(c.req.url);
    const host = url.host;
    const isHub = isHubMode(host);
    return c.json({
        success: true,
        data: {
            mode: isHub ? 'hub' : 'client',
            isHub,
            host,
            upstreamUrl: DEFAULT_UPSTREAM_URL,
            version: CORE_VERSION
        }
    });
});

// 3. GET /check-update - Pengecekan status versi oleh klien CMSMu
otaRouter.get('/check-update', async (c) => {
    try {
        const db = c.env?.DB;
        const migrationInfo = await getMigrationStatus(db);

        let currentInstalledVersion = CORE_VERSION;
        if (db) {
            try {
                const verRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'installed_core_version' LIMIT 1").first();
                if (verRow && verRow.value && verRow.value.trim()) {
                    currentInstalledVersion = verRow.value.trim();
                }
            } catch (_) {}
        }
        const clientVersion = c.req.query('client_version') || currentInstalledVersion;
        
        const url = new URL(c.req.url);
        const baseUrl = `${url.protocol}//${url.host}`;
        const isHub = isHubMode(url.host);

        let latestVersion = CORE_VERSION;
        let changelog = 'Pembaruan sistem CMSMu.';
        let channel: 'stable' | 'beta' = 'stable';
        let hasCoreUpdate = false;

        let hasDeployHook = false;
        if (db) {
            try {
                const hookRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'ota_deploy_hook_url' LIMIT 1").first();
                hasDeployHook = !!(hookRow && hookRow.value && hookRow.value.trim());
            } catch (_) {}
        }

        let upstreamManifest: any = null;
        let upstreamSource: string = 'hub';

        if (isHub) {
            // Mode Hub: Periksa manifest lokal dinamis dari D1 pusat
            const latestManifest = await otaAddonService.getDynamicManifest(db, baseUrl);
            latestVersion = latestManifest.version || CORE_VERSION;
            changelog = latestManifest.changelog || changelog;
            channel = latestManifest.channel || 'stable';
            hasCoreUpdate = otaAddonService.compareVersions(latestVersion, clientVersion) > 0;
            upstreamManifest = latestManifest;

            // Jika ada sinyal client_url masuk ke Hub, otomatis catat/perbarui di tabel ota_clients
            const incomingClient = c.req.query('client_url') || c.req.header('Origin') || c.req.header('Referer');
            if (incomingClient && db) {
                try {
                    const parsedUrl = new URL(incomingClient);
                    const clientOrigin = `${parsedUrl.protocol}//${parsedUrl.host}`;
                    if (!clientOrigin.includes('cms.labmu.dev')) {
                        const clientName = c.req.query('site_name') || clientOrigin;
                        await db.prepare(`
                            INSERT INTO ota_clients (client_url, site_name, installed_version, target_version, rollout_status, is_active, last_synced_at)
                            VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
                            ON CONFLICT(client_url) DO UPDATE SET
                                site_name = COALESCE(excluded.site_name, ota_clients.site_name),
                                installed_version = excluded.installed_version,
                                target_version = excluded.target_version,
                                rollout_status = excluded.rollout_status,
                                is_active = 1,
                                last_synced_at = CURRENT_TIMESTAMP
                        `).bind(
                            clientOrigin,
                            clientName,
                            clientVersion,
                            latestVersion,
                            hasCoreUpdate ? 'received' : 'updated'
                        ).run();
                    }
                } catch (_) {}
            }
        } else {
            // Mode Client: Periksa manifest ke upstream (GitHub cmsMu-go / Hub)
            const upstream = await otaAddonService.checkUpstreamUpdate(clientVersion);
            latestVersion = upstream.upstreamVersion;
            changelog = upstream.changelog || changelog;
            channel = upstream.channel || 'stable';
            hasCoreUpdate = upstream.hasUpdate;
            upstreamManifest = upstream.manifest;
            upstreamSource = upstream.source || 'hub';

            // Jika ada update baru, otomatis suntikkan notifikasi ke tabel notifications lokal klien
            if (hasCoreUpdate && db) {
                await otaAddonService.injectLocalNotification(db, latestVersion, changelog);
            }

            // Laporkan status penerimaan sinyal rilis ke Upstream Hub secara non-blocking
            try {
                let siteName = url.host;
                if (db) {
                    try {
                        const nameRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'site_title' OR key = 'site_name' LIMIT 1").first();
                        if (nameRow?.value) siteName = nameRow.value;
                    } catch (_) {}
                }

                const statusVal = hasCoreUpdate ? 'received' : 'updated';
                const reasonVal = hasCoreUpdate ? 'Notifikasi diterima oleh klien, menunggu aksi update' : null;
                const reportPromise = fetch(`${DEFAULT_UPSTREAM_URL}/api/addons/ota/clients/report-status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        client_url: baseUrl,
                        site_name: siteName,
                        installed_version: currentInstalledVersion,
                        target_version: latestVersion,
                        rollout_status: statusVal,
                        error_reason: reasonVal
                    })
                }).catch(() => {});

                if ((c as any).executionCtx && typeof (c as any).executionCtx.waitUntil === 'function') {
                    (c as any).executionCtx.waitUntil(reportPromise);
                } else {
                    await reportPromise;
                }
            } catch (_) {}
        }

        const hasDbPending = migrationInfo.appliedCount < migrationInfo.totalMigrations;

        return c.json({
            success: true,
            data: {
                coreVersion: currentInstalledVersion,
                latestVersion,
                clientVersion,
                channel,
                changelog,
                hasCoreUpdate,
                hasDbPending,
                isHub,
                dbSchema: migrationInfo,
                manifest: upstreamManifest,
                source: upstreamSource,
                hasDeployHook,
                upToDate: !hasCoreUpdate && !hasDbPending
            }
        });
    } catch (err: any) {
        return c.json({ success: false, error: err.message }, 500);
    }
});

// 4. GET /releases - Daftar riwayat rilis OTA
otaRouter.get('/releases', async (c) => {
    try {
        const db = c.env?.DB;
        const releases = await otaAddonService.getAllReleases(db);
        return c.json({ success: true, data: releases });
    } catch (err: any) {
        return c.json({ success: false, error: err.message }, 500);
    }
});

// 4b. POST /releases/clear - Bersihkan riwayat rilis OTA (arsip log lama)
otaRouter.post('/releases/clear', async (c) => {
    try {
        const db = c.env?.DB;
        if (!db) return c.json({ success: false, error: 'Database binding (DB) tidak ditemukan.' }, 500);
        const body = await c.req.json().catch(() => ({}));
        const clearAll = !!body.all;

        if (clearAll) {
            await db.prepare("DELETE FROM ota_releases").run().catch(() => {});
        } else {
            // Hapus rilis arsip (is_active = 0) dan sisakan rilis aktif terkini
            await db.prepare("DELETE FROM ota_releases WHERE is_active = 0").run().catch(() => {});
        }

        return c.json({
            success: true,
            message: clearAll ? 'Seluruh riwayat rilis berhasil dikosongkan.' : 'Log riwayat rilis arsip berhasil dibersihkan.'
        });
    } catch (err: any) {
        return c.json({ success: false, error: err.message }, 500);
    }
});

// 5. POST /push - Push rilis pembaruan baru ke pengguna CMSMu
otaRouter.post('/push', async (c) => {
    try {
        const db = c.env?.DB;
        if (!db) {
            return c.json({ success: false, error: 'Database binding (DB) tidak ditemukan.' }, 500);
        }
        const body = await c.req.json().catch(() => ({}));
        const { version, changelog, channel } = body;

        if (!version || typeof version !== 'string' || !version.trim()) {
            return c.json({ success: false, error: 'Nomor versi pembaruan wajib diisi (misal: 0.1.1)' }, 400);
        }

        const cleanVersion = version.trim().replace(/^v/, '');
        const today = new Date().toISOString().split('T')[0];
        const releaseChannel = channel || 'stable';
        const releaseChangelog = (changelog || 'Pembaruan core engine dan peningkatan stabilitas CMSMu.').trim();
        const releaseId = `rel-${Date.now()}`;

        // 1. Buat tabel jika belum ada
        await db.prepare(`
            CREATE TABLE IF NOT EXISTS ota_releases (
                id TEXT PRIMARY KEY,
                version TEXT NOT NULL,
                build_date TEXT NOT NULL,
                changelog TEXT,
                channel TEXT DEFAULT 'stable',
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `).run();

        // 2. Nonaktifkan rilis sebelumnya pada channel yang sama
        try {
            await db.prepare("UPDATE ota_releases SET is_active = 0 WHERE channel = ?").bind(releaseChannel).run();
        } catch (e) {}

        // 3. Simpan record rilis baru
        await db.prepare(`
            INSERT INTO ota_releases (id, version, build_date, changelog, channel, is_active)
            VALUES (?, ?, ?, ?, ?, 1)
        `).bind(releaseId, cleanVersion, today, releaseChangelog, releaseChannel).run();

        // 4. Siarkan notifikasi sistem lokal ke tabel notifications
        try {
            await db.prepare(`
                CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    type TEXT DEFAULT 'info',
                    link TEXT,
                    read INTEGER DEFAULT 0,
                    is_read INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `).run();

            const notifTitle = `Pembaruan CMSMu v${cleanVersion} Tersedia! 🚀`;
            const notifMsg = `Versi baru (${releaseChannel}) telah dirilis: ${releaseChangelog}`;
            await db.prepare(`
                INSERT INTO notifications (title, message, type, link, read, is_read)
                VALUES (?, ?, 'warning', '/admin/settings', 0, 0)
            `).bind(notifTitle, notifMsg).run();
        } catch (notifErr) {}

        // 5. Siarkan webhook ke downstream clients terdaftar di database D1 (SOP 13 Zero Hardcode)
        let downstreamClients: string[] = [];
        try {
            await db.prepare(`
                CREATE TABLE IF NOT EXISTS ota_clients (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    client_url TEXT UNIQUE NOT NULL,
                    site_name TEXT,
                    is_active INTEGER DEFAULT 1,
                    last_synced_at DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `).run();

            const clientRows = await db.prepare(
                "SELECT client_url FROM ota_clients WHERE is_active = 1"
            ).all();
            if (clientRows && clientRows.results) {
                downstreamClients = clientRows.results.map((r: any) => r.client_url).filter(Boolean);
            }
        } catch (dbClientErr) {}

        for (const clientUrl of downstreamClients) {
            try {
                fetch(`${clientUrl.replace(/\/+$/, '')}/api/ota/webhook-notify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        version: cleanVersion,
                        changelog: releaseChangelog,
                        channel: releaseChannel
                    })
                }).catch(() => {});
            } catch (e) {}
        }

        return c.json({
            success: true,
            message: `Pembaruan CMSMu v${cleanVersion} (${releaseChannel}) berhasil di-push ke seluruh pengguna!`,
            data: {
                id: releaseId,
                version: cleanVersion,
                buildDate: today,
                channel: releaseChannel,
                changelog: releaseChangelog
            }
        });
    } catch (err: any) {
        return c.json({ success: false, error: err.message }, 500);
    }
});

// 6. POST /webhook-notify - Menerima sinyal push update seketika dari Hub ke Klien
otaRouter.post('/webhook-notify', async (c) => {
    try {
        const db = c.env?.DB;
        if (!db) {
            return c.json({ success: false, error: 'Database binding tidak ditemukan' }, 500);
        }

        const body = await c.req.json().catch(() => ({}));
        const { version, changelog, channel } = body;

        if (!version || typeof version !== 'string') {
            return c.json({ success: false, error: 'Versi rilis tidak valid' }, 400);
        }

        const cleanVersion = version.trim().replace(/^v/, '');
        const releaseChangelog = (changelog || 'Pembaruan core engine CMSMu telah dirilis.').trim();

        // Cek apakah konfigurasi auto-update diaktifkan
        let isAutoUpdate = true;
        try {
            const confRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'ota_auto_update' LIMIT 1").first();
            if (confRow && (confRow.value === '0' || confRow.value === 'false')) {
                isAutoUpdate = false;
            }
        } catch(e) {}

        let autoApplied = false;
        if (isAutoUpdate) {
            // Otomatis terapkan migrasi database D1 jika auto-update aktif
            try {
                await runAutoMigration(db);
                autoApplied = true;
            } catch(migErr) {}
        }

        // Suntikkan langsung notifikasi ke tabel notifications lokal instans ini
        const notifMsg = autoApplied
            ? `Pembaruan CMSMu v${cleanVersion} telah berhasil diterapkan secara otomatis!`
            : releaseChangelog;
        const injected = await otaAddonService.injectLocalNotification(db, cleanVersion, notifMsg);

        return c.json({
            success: true,
            message: injected
                ? `Notifikasi pembaruan v${cleanVersion} berhasil diterima${autoApplied ? ' & diterapkan otomatis' : ''}!`
                : `Notifikasi v${cleanVersion} sudah aktif sebelumnya.`,
            data: {
                version: cleanVersion,
                changelog: releaseChangelog,
                channel: channel || 'stable',
                notified: injected,
                autoApplied
            }
        });
    } catch (err: any) {
        return c.json({ success: false, error: err.message }, 500);
    }
});

// 7. POST /apply-update - Terapkan migrasi database otomatis dan picu pembaruan kode
otaRouter.post('/apply-update', async (c) => {
    const url = new URL(c.req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const db = c.env?.DB;
    const body = await c.req.json().catch(() => ({}));
    const isManual = !!body.manual || !!body.force;
    
    let siteName = url.host;
    if (db) {
        try {
            const nameRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'site_title' OR key = 'site_name' LIMIT 1").first();
            if (nameRow?.value) siteName = nameRow.value;
        } catch (_) {}
    }

    let targetVersion = CORE_VERSION;
    try {
        const upstream = await otaAddonService.checkUpstreamUpdate(CORE_VERSION);
        if (upstream && upstream.upstreamVersion) {
            targetVersion = upstream.upstreamVersion;
        }
    } catch (_) {}

    try {
        // 1. Jalankan auto-migration skema database D1
        const migrationResult = await runAutoMigration(db);

        // 2. Simpan versi terpasang baru ke database settings
        if (db && targetVersion) {
            try {
                await db.prepare(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);`).run().catch(() => {});
                await db.prepare(`
                    INSERT INTO settings (key, value) VALUES ('installed_core_version', ?)
                    ON CONFLICT(key) DO UPDATE SET value = excluded.value
                `).bind(targetVersion).run();
            } catch (_) {}
        }

        // 3. Laporkan status updated ke Upstream Hub secara non-blocking
        if (!isHubMode(url.host)) {
            try {
                const reportPromise = fetch(`${DEFAULT_UPSTREAM_URL}/api/addons/ota/clients/report-status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        client_url: baseUrl,
                        site_name: siteName,
                        installed_version: targetVersion,
                        target_version: targetVersion,
                        rollout_status: 'updated',
                        error_reason: null
                    })
                }).catch(() => {});

                if ((c as any).executionCtx && typeof (c as any).executionCtx.waitUntil === 'function') {
                    (c as any).executionCtx.waitUntil(reportPromise);
                } else {
                    await reportPromise;
                }
            } catch (_) {}
        }

        let msg = '';
        if (migrationResult.appliedCount > 0) {
            msg = `Berhasil menerapkan ${migrationResult.appliedCount} migrasi skema database D1 dan memperbarui core ke v${targetVersion}!`;
        } else {
            msg = `Sistem berhasil diselaraskan dan diperbarui ke versi v${targetVersion}!`;
        }

        return c.json({
            success: true,
            message: msg,
            data: {
                coreVersion: targetVersion,
                schemaVersion: migrationResult.currentVersion,
                appliedCount: migrationResult.appliedCount,
                history: migrationResult.history,
                isManual,
                updatedComponents: DEFAULT_UPDATED_COMPONENTS
            }
        });
    } catch (err: any) {
        // Laporkan kegagalan update ke Upstream Hub beserta error_reason
        if (!isHubMode(url.host)) {
            try {
                fetch(`${DEFAULT_UPSTREAM_URL}/api/addons/ota/clients/report-status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        client_url: baseUrl,
                        site_name: siteName,
                        installed_version: CORE_VERSION,
                        target_version: targetVersion,
                        rollout_status: 'failed',
                        error_reason: err.message || 'Gagal menerapkan pembaruan sistem'
                    })
                }).catch(() => {});
            } catch (_) {}
        }

        return c.json({ success: false, error: err.message }, 500);
    }
});

// 7b. GET /config - Mengambil konfigurasi Auto-Update klien
otaRouter.get('/config', async (c) => {
    try {
        const db = c.env?.DB;
        if (!db) return c.json({ success: true, data: { auto_update: true } });
        const row: any = await db.prepare("SELECT value FROM settings WHERE key = 'ota_auto_update' LIMIT 1").first();
        const autoUpdate = row ? (row.value === '1' || row.value === 'true') : true; // Default ON
        return c.json({ success: true, data: { auto_update: autoUpdate } });
    } catch(e: any) {
        return c.json({ success: true, data: { auto_update: true } });
    }
});

// 7c. POST /config - Mengubah status On/Off Auto-Update klien
otaRouter.post('/config', async (c) => {
    try {
        const db = c.env?.DB;
        if (!db) return c.json({ success: false, error: 'Database binding tidak ditemukan' }, 500);
        const body = await c.req.json().catch(() => ({}));
        const autoUpdate = !!body.auto_update;
        const valStr = autoUpdate ? '1' : '0';
        await db.prepare(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            );
        `).run().catch(() => {});

        await db.prepare(`
            INSERT INTO settings (key, value) VALUES ('ota_auto_update', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `).bind(valStr).run();
        return c.json({
            success: true,
            message: `Pembaruan otomatis berhasil ${autoUpdate ? 'diaktifkan' : 'dinonaktifkan'}!`,
            data: { auto_update: autoUpdate }
        });
    } catch(e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

// 7d. GET /deploy-hook - Status konfigurasi Cloudflare Deploy Hook
otaRouter.get('/deploy-hook', async (c) => {
    try {
        const db = c.env?.DB;
        if (!db) return c.json({ success: true, data: { configured: false } });
        const row: any = await db.prepare("SELECT value FROM settings WHERE key = 'ota_deploy_hook_url' LIMIT 1").first();
        const configured = !!(row && row.value && row.value.trim());
        const hookUrl = configured ? row.value.trim() : '';
        const masked = configured ? (hookUrl.substring(0, 20) + '...' + hookUrl.substring(hookUrl.length - 8)) : '';
        return c.json({ success: true, data: { configured, masked } });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

// 7e. POST /deploy-hook - Simpan Cloudflare Deploy Hook URL
otaRouter.post('/deploy-hook', async (c) => {
    try {
        const db = c.env?.DB;
        if (!db) return c.json({ success: false, error: 'Database binding tidak ditemukan' }, 500);
        const body = await c.req.json().catch(() => ({}));
        const hookUrl = (body.deploy_hook_url || '').trim();

        await db.prepare(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);`).run().catch(() => {});
        await db.prepare(`
            INSERT INTO settings (key, value) VALUES ('ota_deploy_hook_url', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `).bind(hookUrl).run();

        return c.json({
            success: true,
            message: hookUrl ? 'Cloudflare Deploy Hook berhasil disimpan!' : 'Deploy Hook dihapus.',
            data: { configured: !!hookUrl }
        });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

// 7f. POST /trigger-deploy - Picu Cloudflare Pages Rebuild & Deploy via Deploy Hook
otaRouter.post('/trigger-deploy', async (c) => {
    try {
        const db = c.env?.DB;
        if (!db) return c.json({ success: false, error: 'Database binding tidak ditemukan' }, 500);
        const row: any = await db.prepare("SELECT value FROM settings WHERE key = 'ota_deploy_hook_url' LIMIT 1").first();
        const hookUrl = row?.value ? row.value.trim() : '';

        if (!hookUrl) {
            return c.json({
                success: false,
                error: 'Deploy Hook belum dikonfigurasi. Masukkan URL Deploy Hook Cloudflare Pages di formulir pengaturan.'
            }, 400);
        }

        const res = await fetch(hookUrl, { method: 'POST' });
        if (res.ok) {
            return c.json({
                success: true,
                message: 'Sinyal Deploy Hook berhasil dikirim! Cloudflare Pages sedang melakukan proses build & deploy pembaruan kode terbaru di latar belakang.'
            });
        } else {
            return c.json({
                success: false,
                error: `Deploy Hook gagal merespons (HTTP ${res.status}). Pastikan URL Deploy Hook Cloudflare Anda valid.`
            }, 500);
        }
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

// 8. GET /status - Status engine OTA
otaRouter.get('/status', async (c) => {
    const db = c.env?.DB;
    const migrationInfo = await getMigrationStatus(db);
    const url = new URL(c.req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const manifest = await otaAddonService.getDynamicManifest(db, baseUrl);
    const isHub = isHubMode(url.host);

    let currentCoreVersion = CORE_VERSION;
    if (db && !isHub) {
        try {
            const verRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'installed_core_version' LIMIT 1").first();
            if (verRow && verRow.value && verRow.value.trim()) {
                currentCoreVersion = verRow.value.trim();
            }
        } catch (_) {}
    }

    return c.json({
        success: true,
        data: {
            engine: 'CMSMu Over-The-Air Update Engine (Plugin Addon)',
            role: isHub ? 'hub' : 'client',
            isHub,
            currentCoreVersion,
            activeManifestVersion: manifest.version,
            buildDate: CORE_BUILD_DATE,
            databaseIntegrity: {
                schemaVersion: migrationInfo.currentVersion,
                status: migrationInfo.appliedCount === migrationInfo.totalMigrations ? 'synced' : 'pending',
                appliedMigrations: migrationInfo.appliedCount,
                totalMigrations: migrationInfo.totalMigrations
            }
        }
    });
});

// Mount OTA Hub Sub-Router (SOP Poin 20 Modular Architecture)
import { otaHubRouter } from "./hub.router";
otaRouter.route("/", otaHubRouter);
