import { Hono } from 'hono';
import { otaService, CORE_VERSION } from './ota.service';
import { runAutoMigration, getMigrationStatus } from '../../db/migration-runner';

export const otaRouter = new Hono<{ Bindings: any }>();

// 1. GET /api/ota/manifest - Manifest versi & kemampuan Core CMSMu
otaRouter.get('/manifest', (c) => {
    const url = new URL(c.req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const manifest = otaService.getManifest(baseUrl);
    return c.json({ success: true, data: manifest });
});

// 2. GET /api/ota/bundle/admin.js - Distribusi script runtime admin OTA
otaRouter.get('/bundle/admin.js', (c) => {
    const bundleScript = otaService.getAdminBundle();
    return new Response(bundleScript, {
        headers: {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
            'X-CMSMu-Core-Version': CORE_VERSION,
            'Access-Control-Allow-Origin': '*'
        }
    });
});

// 3. GET /api/ota/check-update - Cek status versi dan auto-migration status
otaRouter.get('/check-update', async (c) => {
    try {
        const db = c.env?.DB;
        const migrationInfo = await getMigrationStatus(db);
        const clientVersion = c.req.query('client_version') || CORE_VERSION;
        
        const hasCoreUpdate = otaService.compareVersions(CORE_VERSION, clientVersion) > 0;
        const hasDbPending = migrationInfo.appliedCount < migrationInfo.totalMigrations;

        return c.json({
            success: true,
            data: {
                coreVersion: CORE_VERSION,
                clientVersion,
                hasCoreUpdate,
                hasDbPending,
                dbSchema: migrationInfo,
                upToDate: !hasCoreUpdate && !hasDbPending
            }
        });
    } catch (err: any) {
        return c.json({ success: false, error: err.message }, 500);
    }
});

// 4. POST /api/ota/migrate - Jalankan auto-migration skema database D1
otaRouter.post('/migrate', async (c) => {
    try {
        const db = c.env?.DB;
        if (!db) {
            return c.json({ success: false, error: 'Database binding (DB) tidak ditemukan.' }, 500);
        }

        const result = await runAutoMigration(db);
        return c.json({
            success: true,
            message: result.applied.length > 0 
                ? `Berhasil mengaplikasikan ${result.applied.length} migrasi skema database baru.`
                : 'Skema database sudah versi terbaru (up-to-date).',
            data: result
        });
    } catch (err: any) {
        return c.json({ success: false, error: err.message }, 500);
    }
});

// 5. GET /api/ota/status - Ringkasan status OTA & Runtime Core CMSMu
otaRouter.get('/status', async (c) => {
    try {
        const db = c.env?.DB;
        const migrationInfo = await getMigrationStatus(db);
        return c.json({
            success: true,
            data: {
                engine: 'CMSMu Over-The-Air Update Engine',
                coreVersion: CORE_VERSION,
                schemaVersion: migrationInfo.currentSchemaVersion,
                targetSchemaVersion: migrationInfo.targetSchemaVersion,
                migrationsApplied: migrationInfo.appliedCount,
                migrationsTotal: migrationInfo.totalMigrations
            }
        });
    } catch (err: any) {
        return c.json({ success: false, error: err.message }, 500);
    }
});
