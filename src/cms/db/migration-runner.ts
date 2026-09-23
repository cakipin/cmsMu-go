/**
 * 📦 SYSTEM MIGRATION RUNNER (AUTO D1 MIGRATIONS)
 * Mengelola versi skema database secara otomatis, bertahap, dan idempoten.
 */

export interface MigrationStep {
    id: string;
    version: string;
    name: string;
    up: (db: any) => Promise<void>;
}

export const MIGRATIONS: MigrationStep[] = [
    {
        id: '2026_01_01_001_core_tables',
        version: '0.1.0',
        name: 'Core Baseline Tables (options, users, posts, categories, tags, media, settings)',
        up: async (db: any) => {
            // Options & Users
            await db.prepare(`CREATE TABLE IF NOT EXISTS options (key TEXT PRIMARY KEY, value TEXT, autoload INTEGER DEFAULT 0);`).run();
            await db.prepare(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, email TEXT, name TEXT, role TEXT DEFAULT 'author', subscription_plan TEXT, subscription_expires_at TEXT, avatar TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
            
            // Posts & Pages
            await db.prepare(`CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, slug TEXT UNIQUE, content TEXT, excerpt TEXT, type TEXT DEFAULT 'post', status TEXT DEFAULT 'draft', author_id INTEGER, category_id INTEGER, featured_image TEXT, views_count INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
            await db.prepare(`CREATE TABLE IF NOT EXISTS pages (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, content TEXT, status TEXT DEFAULT 'draft', author_id INTEGER, template TEXT DEFAULT 'default', puck_data TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
            
            // Media & Menus
            await db.prepare(`CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT, original_name TEXT, mime_type TEXT, size INTEGER, url TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
            await db.prepare(`CREATE TABLE IF NOT EXISTS menus (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL, url TEXT NOT NULL, order_num INTEGER DEFAULT 0, parent_id INTEGER, target TEXT DEFAULT '_self', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
        }
    },
    {
        id: '2026_02_15_002_plugins_and_addons',
        version: '0.1.0',
        name: 'Addons & Plugins System (plugins, media_sources, curation_queue)',
        up: async (db: any) => {
            // Plugins Table
            await db.prepare(`CREATE TABLE IF NOT EXISTS plugins (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, author TEXT, version TEXT, active INTEGER DEFAULT 1, config TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
            
            // Aggregator & Curation Queue
            await db.prepare(`CREATE TABLE IF NOT EXISTS media_sources (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, base_url TEXT NOT NULL, feed_url TEXT, feed_type TEXT DEFAULT 'wp_api', region_code TEXT, website_category TEXT DEFAULT 'Berita', default_category TEXT DEFAULT 'Berita Daerah', trust_score INTEGER DEFAULT 100, is_active INTEGER DEFAULT 1, auto_sync INTEGER DEFAULT 1, sync_interval INTEGER DEFAULT 15, auto_publish INTEGER DEFAULT 0, description TEXT, last_fetched_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
            await db.prepare(`CREATE TABLE IF NOT EXISTS curation_queue (id TEXT PRIMARY KEY, source_id TEXT NOT NULL, raw_title TEXT NOT NULL, raw_content_html TEXT NOT NULL, raw_url TEXT NOT NULL UNIQUE, raw_published_at DATETIME, raw_image TEXT, raw_description TEXT, default_category TEXT DEFAULT 'Berita Daerah', status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();

            // Default Plugins Seeding
            const defaultPlugins = [
                { id: 'aggregator', name: 'Sumber Agregator Berita', desc: 'Otomasi agregasi berita dari jaringan media Muhammadiyah & Aisyiyah', ver: '1.0.0' },
                { id: 'newsroom', name: 'Meja Kurasi Redaksi', desc: 'Alur kerja kurasi dan penerbitan satu klik dari antrean agregator ke berita CMS', ver: '1.0.0' },
                { id: 'sso-muhammadiyah', name: 'SSO Muhammadiyah ID', desc: 'Integrasi autentikasi tunggal akun SatuMuhammadiyah', ver: '1.0.0' },
                { id: 'emagazine', name: 'e-Magazine & Publikasi Digital', desc: 'Katalog majalah, buletin, dan dokumen digital interaktif', ver: '1.0.0' }
            ];

            for (const p of defaultPlugins) {
                try {
                    await db.prepare(`INSERT OR IGNORE INTO plugins (id, name, description, author, version, active) VALUES (?, ?, ?, 'CMSMu Core', ?, 1)`).bind(p.id, p.name, p.desc, p.ver).run();
                } catch(e) {}
            }
        }
    },
    {
        id: '2026_09_21_003_ota_and_subscribers',
        version: '0.1.0',
        name: 'OTA Update Tracking & System Subscriptions',
        up: async (db: any) => {
            // Subscribers, Subscriptions & Agens
            await db.prepare(`CREATE TABLE IF NOT EXISTS subscribers (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, name TEXT, is_active INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
            await db.prepare(`CREATE TABLE IF NOT EXISTS subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, email TEXT, plan TEXT, duration_months INTEGER DEFAULT 1, amount INTEGER, payment_proof TEXT, notes TEXT, status TEXT DEFAULT 'active', expires_at TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME);`).run();
            await db.prepare(`CREATE TABLE IF NOT EXISTS agens (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT, whatsapp TEXT, address TEXT, area TEXT, map_link TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
            
            // Comments & Notifications
            await db.prepare(`CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, author_name TEXT NOT NULL, author_email TEXT, content TEXT NOT NULL, status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
            await db.prepare(`CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT, message TEXT, type TEXT DEFAULT 'info', link TEXT, read INTEGER DEFAULT 0, is_read INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`).run();
            
            // Column safety additions
            try { await db.prepare("ALTER TABLE notifications ADD COLUMN read INTEGER DEFAULT 0;").run(); } catch(e) {}
            try { await db.prepare("ALTER TABLE notifications ADD COLUMN is_read INTEGER DEFAULT 0;").run(); } catch(e) {}
            try { await db.prepare("ALTER TABLE users ADD COLUMN subscription_plan TEXT;").run(); } catch(e) {}
            try { await db.prepare("ALTER TABLE users ADD COLUMN subscription_expires_at TEXT;").run(); } catch(e) {}
            try { await db.prepare("ALTER TABLE users ADD COLUMN avatar TEXT;").run(); } catch(e) {}
            try { await db.prepare("ALTER TABLE media_sources ADD COLUMN auto_publish INTEGER DEFAULT 0;").run(); } catch(e) {}
            try { await db.prepare("ALTER TABLE curation_queue ADD COLUMN default_category TEXT DEFAULT 'Berita Daerah';").run(); } catch(e) {}
        }
    },
    {
        id: '2026_09_23_004_pages_schema_alignment',
        version: '0.1.2',
        name: 'Align pages table schema with Drizzle ORM model',
        up: async (db: any) => {
            try { await db.prepare("ALTER TABLE pages ADD COLUMN excerpt TEXT;").run(); } catch(e) {}
            try { await db.prepare("ALTER TABLE pages ADD COLUMN meta_title TEXT;").run(); } catch(e) {}
            try { await db.prepare("ALTER TABLE pages ADD COLUMN meta_description TEXT;").run(); } catch(e) {}
            try { await db.prepare("ALTER TABLE pages ADD COLUMN author_id INTEGER;").run(); } catch(e) {}
        }
    }
];

export async function ensureMigrationTable(db: any) {
    await db.prepare(`
        CREATE TABLE IF NOT EXISTS system_migrations (
            id TEXT PRIMARY KEY,
            version TEXT NOT NULL,
            name TEXT NOT NULL,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `).run();
}

export async function runAutoMigration(db: any): Promise<{ applied: string[]; total: number; latestVersion: string }> {
    if (!db) {
        return { applied: [], total: 0, latestVersion: '0.0.0' };
    }

    await ensureMigrationTable(db);

    const executedRecords = await db.prepare("SELECT id FROM system_migrations").all();
    const executedIds = new Set((executedRecords.results || []).map((r: any) => r.id));

    const applied: string[] = [];

    for (const mig of MIGRATIONS) {
        if (!executedIds.has(mig.id)) {
            console.log(`⏳ Applying DB migration [${mig.id}]: ${mig.name}...`);
            await mig.up(db);
            await db.prepare(`
                INSERT INTO system_migrations (id, version, name)
                VALUES (?, ?, ?)
            `).bind(mig.id, mig.version, mig.name).run();
            applied.push(mig.id);
            console.log(`✅ Applied DB migration [${mig.id}] successfully.`);
        }
    }

    const latest = MIGRATIONS[MIGRATIONS.length - 1];
    return {
        applied,
        total: MIGRATIONS.length,
        latestVersion: latest ? latest.version : '0.1.0'
    };
}

export async function getMigrationStatus(db: any) {
    if (!db) return { status: 'no_database', appliedCount: 0, latestVersion: '0.0.0' };
    
    await ensureMigrationTable(db);
    const appliedRows = await db.prepare("SELECT * FROM system_migrations ORDER BY applied_at DESC").all();
    const applied = appliedRows.results || [];
    const latest = MIGRATIONS[MIGRATIONS.length - 1];

    return {
        currentSchemaVersion: applied.length > 0 ? (applied[0] as any).version : '0.1.0',
        targetSchemaVersion: latest.version,
        appliedCount: applied.length,
        totalMigrations: MIGRATIONS.length,
        history: applied
    };
}
