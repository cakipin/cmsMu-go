-- 1. Users: Pengelola CMS
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'editor', -- admin, editor, author
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Themes: Tema CMS
DROP TABLE IF EXISTS themes;
CREATE TABLE IF NOT EXISTS themes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    active INTEGER DEFAULT 0
);

-- 3. Settings: Global settings
DROP TABLE IF EXISTS settings;
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- 4. Menus: Menu Navigasi
DROP TABLE IF EXISTS menus;
CREATE TABLE IF NOT EXISTS menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    order_num INTEGER DEFAULT 0,
    parent_id INTEGER DEFAULT NULL
);

-- 5. Posts: Artikel/Berita
DROP TABLE IF EXISTS posts;
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    body TEXT,
    excerpt TEXT,
    meta_title TEXT,
    meta_description TEXT,
    category TEXT,
    tags TEXT,
    featured_image TEXT,
    author TEXT,
    type TEXT DEFAULT 'post',
    status TEXT DEFAULT 'draft',
    views INTEGER DEFAULT 0,
    author_id INTEGER,
    allow_comments INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- 6. Comments: Komentar pada Post
DROP TABLE IF EXISTS comments;
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Pages: Halaman Statis
DROP TABLE IF EXISTS pages;
CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    body TEXT,
    excerpt TEXT,
    meta_title TEXT,
    meta_description TEXT,
    featured_image TEXT,
    layout TEXT DEFAULT 'standard',
    status TEXT DEFAULT 'draft',
    author_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Indexing biar ngebut saat query
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_pages_slug ON pages(slug);

CREATE TABLE IF NOT EXISTS daily_stats (
    date TEXT PRIMARY KEY,
    views INTEGER DEFAULT 0,
    visitors INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);