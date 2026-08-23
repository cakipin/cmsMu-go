ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN avatar TEXT;

ALTER TABLE posts ADD COLUMN type TEXT DEFAULT 'post';
ALTER TABLE posts ADD COLUMN views INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN author_id INTEGER;
ALTER TABLE posts ADD COLUMN allow_comments INTEGER DEFAULT 1;
ALTER TABLE pages ADD COLUMN views INTEGER DEFAULT 0;
ALTER TABLE pages ADD COLUMN author_id INTEGER;

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visitors (
  ip TEXT PRIMARY KEY,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fingerprint TEXT NOT NULL,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_fingerprint_time
  ON login_attempts(fingerprint, attempted_at);
CREATE INDEX IF NOT EXISTS idx_posts_status_created
  ON posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pages_slug_status
  ON pages(slug, status);
CREATE INDEX IF NOT EXISTS idx_comments_post_status_created
  ON comments(post_id, status, created_at DESC);

UPDATE users SET role = 'administrator' WHERE lower(role) IN ('admin', 'administrator');
UPDATE users SET role = 'subscriber' WHERE role IS NULL OR lower(role) NOT IN ('administrator', 'editor', 'author', 'subscriber');
