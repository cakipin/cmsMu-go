/**
 * 🏛️ Template DDL Skema Basis Data Awal cmsMu-go
 * Digunakan untuk inisialisasi tabel, relasi, index, dan seeding awal pada database D1 pengguna.
 */

export async function hashSha256(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateInitialSchemaSql(options: {
  adminEmail: string;
  adminPasswordHash: string;
  projectName: string;
  siteSlug: string;
}): string[] {
  const now = new Date().toISOString();

  return [
    // 1. Users
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      email TEXT,
      name TEXT,
      role TEXT DEFAULT 'admin',
      avatar TEXT,
      subscription_plan TEXT,
      subscription_expires_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`,

    // 2. Posts
    `CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      slug TEXT UNIQUE,
      body TEXT,
      excerpt TEXT,
      meta_title TEXT,
      meta_description TEXT,
      status TEXT DEFAULT 'publish',
      category TEXT DEFAULT 'Berita',
      tags TEXT,
      featured_image TEXT,
      author TEXT DEFAULT 'Administrator',
      author_id INTEGER,
      type TEXT DEFAULT 'post',
      video_url TEXT DEFAULT '',
      views INTEGER DEFAULT 0,
      allow_comments INTEGER DEFAULT 1,
      is_premium INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );`,

    // 3. Pages
    `CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      slug TEXT UNIQUE,
      body TEXT,
      excerpt TEXT,
      meta_title TEXT,
      meta_description TEXT,
      status TEXT DEFAULT 'publish',
      featured_image TEXT,
      layout TEXT DEFAULT 'standard',
      views INTEGER DEFAULT 0,
      author_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );`,

    // 4. Media Meta
    `CREATE TABLE IF NOT EXISTS media_meta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT,
      size INTEGER,
      alt TEXT,
      title TEXT,
      description TEXT,
      caption TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );`,

    // 5. Settings & Options
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );`,

    `CREATE TABLE IF NOT EXISTS options (
      key TEXT PRIMARY KEY,
      value TEXT,
      autoload INTEGER DEFAULT 0
    );`,

    // 6. Menus
    `CREATE TABLE IF NOT EXISTS menus (
      id TEXT PRIMARY KEY,
      label TEXT,
      url TEXT,
      order_num INTEGER DEFAULT 0,
      parent_id TEXT
    );`,

    // 7. Themes & Plugins
    `CREATE TABLE IF NOT EXISTS themes (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      author TEXT,
      version TEXT,
      active INTEGER DEFAULT 0
    );`,

    `CREATE TABLE IF NOT EXISTS plugins (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      author TEXT,
      version TEXT,
      active INTEGER DEFAULT 0
    );`,

    // 8. Comments & Stats
    `CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'approved',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS daily_stats (
      date TEXT PRIMARY KEY,
      views INTEGER DEFAULT 0,
      visitors INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    // 9. Multi-Language (i18n) & Translation Groups
    `CREATE TABLE IF NOT EXISTS locales (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      direction TEXT DEFAULT 'ltr',
      is_default INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );`,

    `CREATE TABLE IF NOT EXISTS translation_groups (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );`,

    // 10. Performance Composite Indexes (Anti-Full-Scan & Zero Rows Read Exhaustion)
    `CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);`,
    `CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);`,
    `CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);`,
    `CREATE INDEX IF NOT EXISTS idx_posts_status_date ON posts(status, created_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_posts_status_cat_date ON posts(status, category, created_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_posts_status_views ON posts(status, views DESC, created_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_posts_status_type_date ON posts(status, type, created_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title);`,
    `CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);`,
    `CREATE INDEX IF NOT EXISTS idx_pages_status_slug ON pages(status, slug);`,
    `CREATE INDEX IF NOT EXISTS idx_media_meta_key ON media_meta(key);`,
    `CREATE INDEX IF NOT EXISTS idx_media_meta_created ON media_meta(created_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_comments_post_status ON comments(post_id, status, created_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_menus_order ON menus(order_num ASC);`,

    // 11. Seeding Data Awal (Settings, Locales, Admin User)
    `INSERT OR IGNORE INTO locales (code, name, direction, is_default, is_active) VALUES
      ('id', 'Bahasa Indonesia', 'ltr', 1, 1),
      ('en', 'English', 'ltr', 0, 1),
      ('ar', 'العربية', 'rtl', 0, 1);`,

    `INSERT OR REPLACE INTO settings (key, value) VALUES
      ('site_name', '${options.projectName.replace(/'/g, "''")}'),
      ('site_description', 'Portal resmi berbasis cmsMu Serverless'),
      ('site_homepage_slug', 'home'),
      ('installed_at', '${now}');`,

    `INSERT OR IGNORE INTO users (id, username, email, password, name, role, created_at) VALUES
      (1, 'admin', '${options.adminEmail.replace(/'/g, "''")}', '${options.adminPasswordHash}', 'Administrator', 'superadmin', '${now}');`,

    `INSERT OR IGNORE INTO pages (id, title, slug, body, status, created_at) VALUES
      (1, 'Home', 'home', '{"content":[{"type":"SiteHeader","props":{"siteTitle":"${options.projectName.replace(/'/g, "''")}","headerBgColor":"#0a6134"}},{"type":"Hero","props":{"title":"Selamat Datang di ${options.projectName.replace(/'/g, "''")}","subtitle":"Platform Berita & Konten Digital Berkemajuan"}}]}', 'publish', '${now}');`
  ];
}
