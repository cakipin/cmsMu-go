ALTER TABLE posts ADD COLUMN excerpt TEXT;
ALTER TABLE posts ADD COLUMN meta_title TEXT;
ALTER TABLE posts ADD COLUMN meta_description TEXT;
ALTER TABLE posts ADD COLUMN tags TEXT;
ALTER TABLE posts ADD COLUMN featured_image TEXT;
ALTER TABLE posts ADD COLUMN author TEXT;

ALTER TABLE pages ADD COLUMN excerpt TEXT;
ALTER TABLE pages ADD COLUMN meta_title TEXT;
ALTER TABLE pages ADD COLUMN meta_description TEXT;
ALTER TABLE pages ADD COLUMN featured_image TEXT;
ALTER TABLE pages ADD COLUMN layout TEXT DEFAULT 'standard';
