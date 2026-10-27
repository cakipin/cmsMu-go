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
    id: "2026_01_01_001_core_tables",
    version: "0.1.0",
    name: "Core Baseline Tables (options, users, posts, categories, tags, media, settings)",
    up: async (db: any) => {
      // Options & Users
      await db
        .prepare(
          `CREATE TABLE IF NOT EXISTS options (key TEXT PRIMARY KEY, value TEXT, autoload INTEGER DEFAULT 0);`
        )
        .run();
      await db
        .prepare(
          `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, email TEXT, name TEXT, role TEXT DEFAULT 'author', subscription_plan TEXT, subscription_expires_at TEXT, avatar TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`
        )
        .run();

      // Posts & Pages
      await db
        .prepare(
          `CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, slug TEXT UNIQUE, content TEXT, excerpt TEXT, type TEXT DEFAULT 'post', status TEXT DEFAULT 'draft', author_id INTEGER, category_id INTEGER, featured_image TEXT, views_count INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`
        )
        .run();
      await db
        .prepare(
          `CREATE TABLE IF NOT EXISTS pages (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, content TEXT, status TEXT DEFAULT 'draft', author_id INTEGER, template TEXT DEFAULT 'default', puck_data TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`
        )
        .run();

      // Media & Menus
      await db
        .prepare(
          `CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT, original_name TEXT, mime_type TEXT, size INTEGER, url TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`
        )
        .run();
      await db
        .prepare(
          `CREATE TABLE IF NOT EXISTS menus (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL, url TEXT NOT NULL, order_num INTEGER DEFAULT 0, parent_id INTEGER, target TEXT DEFAULT '_self', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`
        )
        .run();
    },
  },
  {
    id: "2026_02_15_002_plugins_and_addons",
    version: "0.1.0",
    name: "Addons & Plugins System (plugins)",
    up: async (db: any) => {
      // Plugins Table
      await db
        .prepare(
          `CREATE TABLE IF NOT EXISTS plugins (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, author TEXT, version TEXT, active INTEGER DEFAULT 1, config TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`
        )
        .run();

      // Default Plugins Seeding (SSO & OTA)
      const defaultPlugins = [
        {
          id: "sso-muhammadiyah",
          name: "SSO Muhammadiyah ID",
          desc: "Integrasi autentikasi tunggal akun SatuMuhammadiyah",
          ver: "1.0.0",
        },
        {
          id: "ota",
          name: "Over-The-Air Update Engine",
          desc: "Distribusi pembaruan sistem dan patch runtime mandiri",
          ver: "1.0.0",
        },
      ];

      for (const p of defaultPlugins) {
        try {
          await db
            .prepare(
              `INSERT OR IGNORE INTO plugins (id, name, description, author, version, active) VALUES (?, ?, ?, 'CMSMu Core', ?, 1)`
            )
            .bind(p.id, p.name, p.desc, p.ver)
            .run();
        } catch (e) {}
      }
    },
  },
  {
    id: "2026_09_21_003_ota_and_comments",
    version: "0.1.0",
    name: "OTA Update Tracking, Comments & Notifications",
    up: async (db: any) => {
      // Comments & Notifications
      await db
        .prepare(
          `CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, author_name TEXT NOT NULL, author_email TEXT, content TEXT NOT NULL, status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`
        )
        .run();
      await db
        .prepare(
          `CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT, message TEXT, type TEXT DEFAULT 'info', link TEXT, read INTEGER DEFAULT 0, is_read INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`
        )
        .run();

      // Column safety additions
      try {
        await db
          .prepare(
            "ALTER TABLE notifications ADD COLUMN read INTEGER DEFAULT 0;"
          )
          .run();
      } catch (e) {}
      try {
        await db
          .prepare(
            "ALTER TABLE notifications ADD COLUMN is_read INTEGER DEFAULT 0;"
          )
          .run();
      } catch (e) {}
      try {
        await db
          .prepare("ALTER TABLE users ADD COLUMN subscription_plan TEXT;")
          .run();
      } catch (e) {}
      try {
        await db
          .prepare("ALTER TABLE users ADD COLUMN subscription_expires_at TEXT;")
          .run();
      } catch (e) {}
      try {
        await db.prepare("ALTER TABLE users ADD COLUMN avatar TEXT;").run();
      } catch (e) {}
    },
  },
  {
    id: "2026_09_23_004_pages_schema_alignment",
    version: "0.1.2",
    name: "Align pages table schema with Drizzle ORM model",
    up: async (db: any) => {
      try {
        await db.prepare("ALTER TABLE pages ADD COLUMN excerpt TEXT;").run();
      } catch (e) {}
      try {
        await db.prepare("ALTER TABLE pages ADD COLUMN meta_title TEXT;").run();
      } catch (e) {}
      try {
        await db
          .prepare("ALTER TABLE pages ADD COLUMN meta_description TEXT;")
          .run();
      } catch (e) {}
      try {
        await db
          .prepare("ALTER TABLE pages ADD COLUMN author_id INTEGER;")
          .run();
      } catch (e) {}
    },
  },
  {
    id: "2026_10_18_005_pages_views_column",
    version: "0.1.7",
    name: "Add views counter column to pages table",
    up: async (db: any) => {
      try {
        await db
          .prepare("ALTER TABLE pages ADD COLUMN views INTEGER DEFAULT 0;")
          .run();
      } catch (e) {}
    },
  },
  {
    id: "2026_10_22_007_d1_performance_indexes",
    version: "0.1.9",
    name: "D1 Performance Composite Indexes (Anti-Full-Scan & Zero Rows Read Exhaustion)",
    up: async (db: any) => {
      // 1. Composite indexes for posts queries
      await db
        .prepare(
          `CREATE INDEX IF NOT EXISTS idx_posts_status_date ON posts(status, created_at DESC);`
        )
        .run();
      await db
        .prepare(
          `CREATE INDEX IF NOT EXISTS idx_posts_status_cat_date ON posts(status, category, created_at DESC);`
        )
        .run();
      await db
        .prepare(
          `CREATE INDEX IF NOT EXISTS idx_posts_status_views ON posts(status, views DESC, created_at DESC);`
        )
        .run();
      await db
        .prepare(
          `CREATE INDEX IF NOT EXISTS idx_posts_status_type_date ON posts(status, type, created_at DESC);`
        )
        .run();
      await db
        .prepare(`CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title);`)
        .run();

      // 2. Indexes for pages, media, comments, and menus
      await db
        .prepare(
          `CREATE INDEX IF NOT EXISTS idx_pages_status_slug ON pages(status, slug);`
        )
        .run();
      await db
        .prepare(
          `CREATE INDEX IF NOT EXISTS idx_media_meta_key ON media_meta(key);`
        )
        .run();
      await db
        .prepare(
          `CREATE INDEX IF NOT EXISTS idx_media_meta_created ON media_meta(created_at DESC);`
        )
        .run();
      await db
        .prepare(
          `CREATE INDEX IF NOT EXISTS idx_comments_post_status ON comments(post_id, status, created_at DESC);`
        )
        .run();
      await db
        .prepare(
          `CREATE INDEX IF NOT EXISTS idx_menus_order ON menus(order_num ASC);`
        )
        .run();
    },
  },
  {
    id: "2026_10_23_008_d1_performance_lock",
    version: "0.2.0",
    name: "D1 Performance Lock (Visitors Table & High-Traffic Composite Indexes)",
    up: async (db: any) => {
      // 1. Visitors table & index
      await db
        .prepare(
          `CREATE TABLE IF NOT EXISTS visitors (
            ip TEXT PRIMARY KEY,
            last_seen TEXT DEFAULT CURRENT_TIMESTAMP
          );`
        )
        .run();
      await db
        .prepare(
          `CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON visitors(last_seen DESC);`
        )
        .run();

      // 2. High-traffic composite indexes for posts, pages & options
      await db
        .prepare(
          `CREATE INDEX IF NOT EXISTS idx_posts_category_status ON posts(category, status);`
        )
        .run();
      await db
        .prepare(
          `CREATE INDEX IF NOT EXISTS idx_posts_author_status ON posts(author_id, status);`
        )
        .run();
      await db
        .prepare(
          `CREATE INDEX IF NOT EXISTS idx_pages_views ON pages(views DESC);`
        )
        .run();
      await db
        .prepare(
          `CREATE INDEX IF NOT EXISTS idx_options_autoload ON options(autoload);`
        )
        .run();
    },
  },
];

export async function ensureMigrationTable(db: any) {
  await db
    .prepare(
      `
        CREATE TABLE IF NOT EXISTS system_migrations (
            id TEXT PRIMARY KEY,
            version TEXT NOT NULL,
            name TEXT NOT NULL,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `
    )
    .run();
}

export async function runAutoMigration(db: any): Promise<{
  applied: string[];
  appliedCount: number;
  total: number;
  latestVersion: string;
  currentVersion: string;
  history: any[];
}> {
  if (!db) {
    return {
      applied: [],
      appliedCount: 0,
      total: 0,
      latestVersion: "0.0.0",
      currentVersion: "0.0.0",
      history: [],
    };
  }

  await ensureMigrationTable(db);

  const executedRecords = await db
    .prepare("SELECT id FROM system_migrations")
    .all();
  const executedIds = new Set(
    (executedRecords.results || []).map((r: any) => r.id)
  );

  const applied: string[] = [];

  for (const mig of MIGRATIONS) {
    if (!executedIds.has(mig.id)) {
      console.log(`⏳ Applying DB migration [${mig.id}]: ${mig.name}...`);
      await mig.up(db);
      await db
        .prepare(
          `
                INSERT INTO system_migrations (id, version, name)
                VALUES (?, ?, ?)
            `
        )
        .bind(mig.id, mig.version, mig.name)
        .run();
      applied.push(mig.id);
      console.log(`✅ Applied DB migration [${mig.id}] successfully.`);
    }
  }

  const historyRows = await db
    .prepare("SELECT * FROM system_migrations ORDER BY applied_at DESC")
    .all()
    .catch(() => ({ results: [] }));
  const history = historyRows?.results || [];
  const latest = MIGRATIONS[MIGRATIONS.length - 1];
  const latestVer = latest ? latest.version : "0.1.0";

  return {
    applied,
    appliedCount: applied.length,
    total: MIGRATIONS.length,
    latestVersion: latestVer,
    currentVersion: latestVer,
    history,
  };
}

export async function getMigrationStatus(db: any): Promise<{
  status?: string;
  currentSchemaVersion: string;
  targetSchemaVersion: string;
  appliedCount: number;
  totalMigrations: number;
  latestVersion: string;
  history: any[];
}> {
  const latest = MIGRATIONS[MIGRATIONS.length - 1];
  const targetVer = latest ? latest.version : "0.1.0";

  if (!db) {
    return {
      status: "no_database",
      currentSchemaVersion: "0.0.0",
      targetSchemaVersion: targetVer,
      appliedCount: 0,
      totalMigrations: MIGRATIONS.length,
      latestVersion: "0.0.0",
      history: [],
    };
  }

  await ensureMigrationTable(db);
  const appliedRows = await db
    .prepare("SELECT * FROM system_migrations ORDER BY applied_at DESC")
    .all();
  const applied = appliedRows.results || [];
  const currentVer =
    applied.length > 0 ? (applied[0] as any).version : "0.1.0";

  return {
    status: applied.length === MIGRATIONS.length ? "synced" : "pending",
    currentSchemaVersion: currentVer,
    targetSchemaVersion: targetVer,
    appliedCount: applied.length,
    totalMigrations: MIGRATIONS.length,
    latestVersion: currentVer,
    history: applied,
  };
}
