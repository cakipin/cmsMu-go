import type { D1Database } from '@cloudflare/workers-types';
import { runAutoMigration } from './migration-runner';

export const updateSchema = async (db: D1Database) => {
  const logs = [];

  try {
    // 1. TABEL OPTIONS
    // Menyimpan konfigurasi autoload
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS options (
        key TEXT PRIMARY KEY, 
        value TEXT,
        autoload INTEGER DEFAULT 0
      );
    `).run();
    logs.push("✅ Table 'options' checked (Safe).");

    // 2. TABEL USERS
    // Menyimpan data login admin/editor
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        email TEXT,
        name TEXT,
        role TEXT DEFAULT 'author',
        subscription_plan TEXT,
        subscription_expires_at TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
    try { await db.prepare("ALTER TABLE users ADD COLUMN subscription_plan TEXT;").run(); } catch(e) {}
    try { await db.prepare("ALTER TABLE users ADD COLUMN subscription_expires_at TEXT;").run(); } catch(e) {}
    try { await db.prepare("ALTER TABLE users ADD COLUMN avatar TEXT;").run(); } catch(e) {}
    logs.push("✅ Table 'users' checked (Safe).");

    // 3. TABEL CONTENTS (Legacy/Alternative)
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS contents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        slug TEXT UNIQUE,
        body TEXT,
        type TEXT DEFAULT 'post',
        status TEXT DEFAULT 'draft',
        author_id INTEGER,
        category TEXT,
        tags TEXT,
        featured_image TEXT,
        wp_id INTEGER, 
        old_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
    logs.push("✅ Table 'contents' checked (Safe).");

    // 3A. TABEL POSTS
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        slug TEXT UNIQUE,
        body TEXT,
        status TEXT DEFAULT 'draft',
        category TEXT DEFAULT 'Uncategorized',
        tags TEXT,
        featured_image TEXT,
        author TEXT DEFAULT 'Admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
    logs.push("✅ Table 'posts' checked (Safe).");

    // 3B. TABEL PAGES
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        slug TEXT UNIQUE,
        body TEXT,
        status TEXT DEFAULT 'publish',
        featured_image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
    logs.push("✅ Table 'pages' checked (Safe).");

    try {
        await db.prepare("ALTER TABLE pages ADD COLUMN layout TEXT DEFAULT 'standard';").run();
        logs.push("✅ Added 'layout' column to 'pages' table.");
    } catch (e: any) {
        // Kolom mungkin sudah ada
    }

    // 3C. TABEL MEDIA_META
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS media_meta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL,
        url TEXT NOT NULL,
        type TEXT,
        size INTEGER,
        alt TEXT,
        title TEXT,
        description TEXT,
        caption TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
    logs.push("✅ Table 'media_meta' checked (Safe).");

    // 4. TABEL SETTINGS
    // Menyimpan Judul Situs, Favicon, Deskripsi
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `).run();
    logs.push("✅ Table 'settings' checked (Safe).");

    // 5. TABEL MENUS (FIXED & STABLE)
    // ID menggunakan TEXT agar support UUID
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS menus (
        id TEXT PRIMARY KEY, 
        label TEXT,
        url TEXT,
        order_num INTEGER DEFAULT 0,
        parent_id TEXT DEFAULT NULL
      );
    `).run();
    logs.push("✅ Table 'menus' checked (Safe - ID TEXT with parent_id).");

    // 6. TABEL THEMES
    // Menyimpan daftar tema dan status aktif
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS themes (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        author TEXT,
        version TEXT,
        active INTEGER DEFAULT 0
      );
    `).run();
    logs.push("✅ Table 'themes' checked (Safe).");

    // 7. TABEL PLUGINS
    // Menyimpan daftar plugin
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS plugins (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        author TEXT,
        version TEXT,
        active INTEGER DEFAULT 0
      );
    `).run();
    logs.push("✅ Table 'plugins' checked (Safe).");

    // 8. TABEL NOTIFICATIONS
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        message TEXT,
        type TEXT DEFAULT 'warning',
        link TEXT,
        read INTEGER DEFAULT 0,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
    try { await db.prepare("ALTER TABLE notifications ADD COLUMN read INTEGER DEFAULT 0;").run(); } catch(e) {}
    try { await db.prepare("ALTER TABLE notifications ADD COLUMN is_read INTEGER DEFAULT 0;").run(); } catch(e) {}
    logs.push("✅ Table 'notifications' checked (Safe).");

    // 8B. TABEL AGENS
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS agens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        whatsapp TEXT,
        address TEXT,
        area TEXT,
        map_link TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
    logs.push("✅ Table 'agens' checked (Safe).");

    // 8C. TABEL SUBSCRIPTIONS
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        email TEXT,
        plan TEXT,
        duration_months INTEGER DEFAULT 1,
        amount INTEGER,
        payment_proof TEXT,
        notes TEXT,
        status TEXT DEFAULT 'active',
        expires_at TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME
      );
    `).run();
    logs.push("✅ Table 'subscriptions' checked (Safe).");

    // 9. TABEL MEDIA_SOURCES & CURATION_QUEUE
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS media_sources (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        base_url TEXT NOT NULL,
        feed_url TEXT,
        feed_type TEXT DEFAULT 'wp_api',
        region_code TEXT,
        website_category TEXT DEFAULT 'Berita',
        default_category TEXT DEFAULT 'Berita Daerah',
        trust_score INTEGER DEFAULT 100,
        is_active INTEGER DEFAULT 1,
        auto_sync INTEGER DEFAULT 1,
        sync_interval INTEGER DEFAULT 15,
        auto_publish INTEGER DEFAULT 0,
        description TEXT,
        last_fetched_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
    try { await db.prepare("ALTER TABLE media_sources ADD COLUMN website_category TEXT DEFAULT 'Berita';").run(); } catch(e) {}
    try { await db.prepare("ALTER TABLE media_sources ADD COLUMN default_category TEXT DEFAULT 'Berita Daerah';").run(); } catch(e) {}
    try { await db.prepare("ALTER TABLE media_sources ADD COLUMN auto_publish INTEGER DEFAULT 0;").run(); } catch(e) {}
    logs.push("✅ Table 'media_sources' checked (Safe).");

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS curation_queue (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        raw_title TEXT NOT NULL,
        raw_content_html TEXT NOT NULL,
        raw_url TEXT NOT NULL UNIQUE,
        raw_published_at DATETIME,
        raw_image TEXT,
        raw_description TEXT,
        default_category TEXT DEFAULT 'Berita Daerah',
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
    try { await db.prepare("ALTER TABLE curation_queue ADD COLUMN default_category TEXT DEFAULT 'Berita Daerah';").run(); } catch(e) {}
    logs.push("✅ Table 'curation_queue' checked (Safe).");

    // 10. AUTO MIGRATIONS RUNNER (Incremental Version Tracking)
    try {
      const migResult = await runAutoMigration(db);
      if (migResult.applied.length > 0) {
        logs.push(`✅ Auto-applied ${migResult.applied.length} new migrations: ${migResult.applied.join(', ')}`);
      } else {
        logs.push(`✅ System migrations up-to-date (Version: ${migResult.latestVersion}).`);
      }
    } catch(migErr: any) {
      logs.push(`⚠️ Migration runner note: ${migErr.message}`);
    }

    return logs;

  } catch (e: any) {
    console.error("Schema Update Error:", e);
    // Kita return error log biar tampil di browser/API
    logs.push("❌ ERROR: " + e.message);
    return logs;
  }
};