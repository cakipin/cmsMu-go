# Skema Database & Relasi (Cloudflare D1 & Drizzle ORM)
## Platform Newsroom & Media Aggregator Muhammadiyah

Dokumen ini mendefinisikan rancangan skema basis data relasional (*database schema*) lengkap yang diimplementasikan menggunakan **Drizzle ORM** untuk **Cloudflare D1 (Serverless SQLite at the Edge)**.

---

## 1. Konfigurasi Drizzle & Cloudflare D1

File konfigurasi `drizzle.config.ts`:
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_API_TOKEN!,
  },
});
```

---

## 2. Definisi Skema Tabel (Drizzle ORM Code)

File: `src/db/schema/index.ts`

```typescript
import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ==========================================
// 1. PENGGUNA & REDAKSI (SSO MUHAMMADIYAH ID)
// ==========================================
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID v4 / nanoid
  midUid: text('mid_uid').unique(), // UID dari Muhammadiyah ID SSO
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { 
    enum: ['superadmin', 'editor_in_chief', 'editor', 'journalist', 'contributor', 'reader'] 
  }).default('contributor').notNull(),
  regionCode: text('region_code'), // Misal: PWM-JATIM, PDM-SURABAYA, AUM-UMY
  avatarUrl: text('avatar_url'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
  midUidIdx: uniqueIndex('users_mid_uid_idx').on(table.midUid),
  roleIdx: index('users_role_idx').on(table.role),
}));

// ==========================================
// 2. SUMBER MEDIA AGREGASI (PWM / PDM / AUM)
// ==========================================
export const mediaSources = sqliteTable('media_sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // Contoh: 'PWMU.CO', 'Suara Muhammadiyah'
  slug: text('slug').notNull().unique(),
  siteUrl: text('site_url').notNull(), // https://pwmu.co
  feedUrl: text('feed_url').notNull(), // https://pwmu.co/feed/
  feedType: text('feed_type', { enum: ['rss', 'atom', 'json_feed', 'scraper'] }).default('rss').notNull(),
  regionCode: text('region_code'), // Wilayah PWM/PDM terkait
  categoryScope: text('category_scope'), // Default scope ortom/kategori
  fetchIntervalMinutes: integer('fetch_interval_minutes').default(15).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  lastFetchedAt: integer('last_fetched_at', { mode: 'timestamp' }),
  lastEtag: text('last_etag'), // Untuk HTTP Conditional GET (hemat bandwidth)
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('sources_slug_idx').on(table.slug),
  isActiveIdx: index('sources_active_idx').on(table.isActive),
}));

// ==========================================
// 3. ARTIKEL BERITA (ORISINAL & AGREGASI)
// ==========================================
export const articles = sqliteTable('articles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'), // Ringkasan artikel (1-2 paragraf)
  
  // Konten Bersih & Arsip Mentah
  rawContent: text('raw_content'), // Konten mentah dari scraper (arsip)
  cleanContent: text('clean_content').notNull(), // Konten sanitasi murni (standar semantik)
  
  // Tipe & Asal Sumber
  sourceType: text('source_type', { enum: ['original', 'aggregated'] }).default('original').notNull(),
  sourceId: text('source_id').references(() => mediaSources.id, { onDelete: 'set null' }),
  originalUrl: text('original_url'), // Link artikel pada media asal
  originalAuthorName: text('original_author_name'), // Nama jurnalis asal jika agregasi
  
  // Aset Sampul (Cloudflare R2)
  coverImageR2Key: text('cover_image_r2_key'), // r2://news/2026/09/slug/cover.webp
  coverImageUrl: text('cover_image_url'), // https://cdn.muhammadiyah.id/news/...
  coverImageCaption: text('cover_image_caption'),

  // Kepengarangan & Redaksi Internal
  authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }),
  editorId: text('editor_id').references(() => users.id, { onDelete: 'set null' }),
  
  // Status Siklus Hidup Artikel
  status: text('status', { 
    enum: ['draft', 'in_review', 'pending_curation', 'published', 'scheduled', 'rejected', 'archived', 'dropped'] 
  }).default('draft').notNull(),
  
  isHeadline: integer('is_headline', { mode: 'boolean' }).default(false).notNull(),
  isCurated: integer('is_curated', { mode: 'boolean' }).default(false).notNull(),
  readingTimeMinutes: integer('reading_time_minutes').default(1).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('articles_slug_idx').on(table.slug),
  statusIdx: index('articles_status_idx').on(table.status),
  publishedAtIdx: index('articles_published_at_idx').on(table.publishedAt),
  sourceTypeIdx: index('articles_source_type_idx').on(table.sourceType),
  isHeadlineIdx: index('articles_headline_idx').on(table.isHeadline),
}));

// ==========================================
// 4. ASET MEDIA HASIL SIDELOADING (R2 STORAGE)
// ==========================================
export const mediaAssets = sqliteTable('media_assets', {
  id: text('id').primaryKey(),
  articleId: text('article_id').references(() => articles.id, { onDelete: 'cascade' }),
  originalRemoteUrl: text('original_remote_url').notNull(), // Link gambar eksternal awal
  r2StorageKey: text('r2_storage_key').notNull(), // media/2026/09/slug/uuid.webp
  cdnUrl: text('cdn_url').notNull(), // Public URL dari Cloudflare CDN
  mimeType: text('mime_type').default('image/webp').notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  widthPx: integer('width_px'),
  heightPx: integer('height_px'),
  isCover: integer('is_cover', { mode: 'boolean' }).default(false).notNull(),
  caption: text('caption'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  articleIdIdx: index('media_article_id_idx').on(table.articleId),
  r2KeyIdx: uniqueIndex('media_r2_key_idx').on(table.r2StorageKey),
}));

// ==========================================
// 5. TAKSONOMI & KATEGORISASI PERSYARIKATAN
// ==========================================
export const taxonomies = sqliteTable('taxonomies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // 'Majelis Tarjih', 'Aisyiyah', 'Pendidikan', 'PWM Jatim'
  slug: text('slug').notNull().unique(),
  type: text('type', { 
    enum: ['category', 'ortom', 'majelis_lembaga', 'region_pwm', 'tag'] 
  }).notNull(),
  description: text('description'),
  iconUrl: text('icon_url'),
}, (table) => ({
  slugIdx: uniqueIndex('taxonomies_slug_idx').on(table.slug),
  typeIdx: index('taxonomies_type_idx').on(table.type),
}));

export const articleTaxonomies = sqliteTable('article_taxonomies', {
  articleId: text('article_id').references(() => articles.id, { onDelete: 'cascade' }).notNull(),
  taxonomyId: text('taxonomy_id').references(() => taxonomies.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
  pk: index('article_tax_pk').on(table.articleId, table.taxonomyId),
}));

// ==========================================
// 6. KOMENTAR PEMBACA (TERAUTENTIKASI SSO M-ID)
// ==========================================
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  articleId: text('article_id').references(() => articles.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  status: text('status', { enum: ['approved', 'pending_review', 'spam', 'deleted'] }).default('approved').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  articleIdIdx: index('comments_article_id_idx').on(table.articleId),
  userIdIdx: index('comments_user_id_idx').on(table.userId),
}));

// ==========================================
// 7. AUDIT LOG INGESTI CRAWLER / RSS
// ==========================================
export const ingestionLogs = sqliteTable('ingestion_logs', {
  id: text('id').primaryKey(),
  sourceId: text('source_id').references(() => mediaSources.id, { onDelete: 'cascade' }).notNull(),
  articlesDiscovered: integer('articles_discovered').default(0).notNull(),
  articlesCleaned: integer('articles_cleaned').default(0).notNull(),
  imagesSideloaded: integer('images_sideloaded').default(0).notNull(),
  status: text('status', { enum: ['success', 'partial_error', 'failed'] }).notNull(),
  errorMessage: text('error_message'),
  durationMs: integer('duration_ms').notNull(),
  executedAt: integer('executed_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  sourceExecutedIdx: index('ingest_source_executed_idx').on(table.sourceId, table.executedAt),
}));
```

---

## 3. Relasi & Integritas Foreign Key

1. **`articles` $\leftrightarrow$ `mediaSources` (1:N):** Setiap berita agregasi terikat ke satu sumber media. Jika sumber dihapus, `source_id` diset `NULL` agar histori berita tidak terhapus.
2. **`articles` $\leftrightarrow$ `mediaAssets` (1:N):** Satu artikel memiliki banyak gambar yang disideload ke R2. Jika artikel dihapus permanen, relasi ber-cascade (`onDelete: 'cascade'`).
3. **`articles` $\leftrightarrow$ `taxonomies` (M:N via `articleTaxonomies`):** Sebuah berita dapat bertema ganda, misal: Masuk kategori *"Pendidikan"*, Ortom *"IPM"*, dan Wilayah *"PWM Jawa Tengah"*.
4. **`articles` $\leftrightarrow$ `comments` $\leftrightarrow$ `users` (1:N):** Komentar terikat ke artikel dan diverifikasi langsung ke `users` yang memiliki token valid dari **Muhammadiyah ID SSO**.

---

## 4. Skema Modular Multi-Language (i18n) & Translation Groups

Untuk mendukung lokalisasi konten (ID, EN, AR) tanpa melanggar `core-lock.json`, skema i18n didefinisikan modular pada `packages/db/src/schema-i18n.ts`:

```typescript
import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

// 1. Tabel Master Bahasa (Locales)
export const locales = sqliteTable('locales', {
  code: text('code', { length: 10 }).primaryKey(), // 'id', 'en', 'ar'
  name: text('name', { length: 50 }).notNull(),     // 'Bahasa Indonesia', 'English', 'العربية'
  direction: text('direction', { length: 3 }).default('ltr'), // 'ltr' | 'rtl'
  isDefault: integer('is_default').default(0),
  isActive: integer('is_active').default(1),
});

// 2. Tabel Grup Terjemahan (Translation Groups)
export const translationGroups = sqliteTable('translation_groups', {
  id: text('id', { length: 36 }).primaryKey(),
  type: text('type', { length: 20 }).notNull(), // 'post' | 'page' | 'block'
  createdAt: text('created_at').notNull(),
});
```

---

## 5. Skema Control Plane: 1-Click BYOC Deployer & Centralized Activity Logs

Untuk mendukung deployment instance cmsMu-go ke akun Cloudflare pengguna dan pemantauan aktivitas log terpusat di `cms.labmu.dev` (`packages/db/src/schema-deployer.ts`):

```typescript
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// 1. Proyek Pengguna (user_projects)
export const userProjects = sqliteTable('user_projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  cfAccountId: text('cf_account_id').notNull(),
  cfProjectName: text('cf_project_name').notNull(),
  d1DatabaseId: text('d1_database_id').notNull(),
  r2BucketName: text('r2_bucket_name').notNull(),
  kvCacheId: text('kv_cache_id').notNull(),
  kvSessionId: text('kv_session_id').notNull(),
  productionUrl: text('production_url').notNull(),
  customDomain: text('custom_domain'),
  telemetryApiKey: text('telemetry_api_key').notNull().unique(),
  status: text('status', { enum: ['provisioning', 'active', 'suspended', 'error'] }).default('provisioning').notNull(),
  lastHeartbeatAt: text('last_heartbeat_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 2. Log Aktivitas Terpusat (instance_activity_logs)
export const instanceActivityLogs = sqliteTable('instance_activity_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => userProjects.id, { onDelete: 'cascade' }),
  eventCategory: text('event_category', { enum: ['AUTH', 'CONTENT', 'MEDIA', 'THEME', 'SETTINGS', 'SYSTEM', 'SECURITY'] }).notNull(),
  action: text('action').notNull(),
  severity: text('severity', { enum: ['INFO', 'WARN', 'ERROR', 'CRITICAL'] }).default('INFO').notNull(),
  actorEmail: text('actor_email'),
  ipAddress: text('ip_address'),
  description: text('description').notNull(),
  metadataJson: text('metadata_json'),
  createdAt: text('created_at').notNull(),
});

// 3. Riwayat Detak Jantung Uptime (instance_heartbeats)
export const instanceHeartbeats = sqliteTable('instance_heartbeats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => userProjects.id, { onDelete: 'cascade' }),
  coreVersion: text('core_version').notNull(),
  postCount: integer('post_count').default(0).notNull(),
  mediaCount: integer('media_count').default(0).notNull(),
  memoryUsageMb: integer('memory_usage_mb'),
  responseTimeMs: integer('response_time_ms'),
  status: text('status').default('OK').notNull(),
  recordedAt: text('recorded_at').notNull(),
});
```

---

## 6. Indeks Komposit Performa Tinggi & Proteksi Cloudflare D1 Rows Read (cmsMu-go Lock)

Untuk memitigasi *Rows Read Exhaustion* pada tier gratis Cloudflare D1 (5 Juta rows read/hari), seluruh instance `cmsMu-go` (baru maupun existing) dikunci dengan indeks komposit berikut dan pembatasan query:

### 6.1. Indeks Komposit & Tabel Visitors (`initial-schema.sql.ts` & `migration-runner.ts`)
```sql
-- 1. Pelacak Pengunjung Aktif (Mencegah Full Scan pada Dashboard Stats)
CREATE TABLE IF NOT EXISTS visitors (
  ip TEXT PRIMARY KEY,
  last_seen TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON visitors(last_seen DESC);

-- 2. Indeks Komposit Pencarian & Filter Konten Terbit
CREATE INDEX IF NOT EXISTS idx_posts_status_date ON posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category_status ON posts(category, status);
CREATE INDEX IF NOT EXISTS idx_posts_author_status ON posts(author_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_status_views ON posts(status, views DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status_type_date ON posts(status, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title);

-- 3. Halaman & Opsi
CREATE INDEX IF NOT EXISTS idx_pages_status_slug ON pages(status, slug);
CREATE INDEX IF NOT EXISTS idx_pages_views ON pages(views DESC);
CREATE INDEX IF NOT EXISTS idx_options_autoload ON options(autoload);
```

### 6.2. Aturan Pembatasan Query (Query Bounds & Counter Caching)
1. **Multi-tier Counter Caching (`getCachedPublishedPostCount`)**: Query `COUNT(*)` pada rute publik (`/`, `/berita`, `/kegiatan`) dicache bertingkat:
   - **Tingkat 1**: RAM Isolate Worker (60 detik, $<0.1\text{ms}$, 0 D1 row read).
   - **Tingkat 2**: Cloudflare KV (`cmsmu:count:published_posts`, 300 detik, 0 D1 row read).
   - **Tingkat 3**: Fallback D1 query dengan penulisan balik ke KV dan RAM.
2. **Hard Limit Projection (`getD1Posts.ts`, `getD1Pages.ts`)**:
   - Seluruh query RSS dan feed feed dibatasi maksimal `.limit(50)`.
   - Proyeksi kolom hanya mengambil metadata (id, title, slug, excerpt, category, tags, author, createdAt), tidak mengambil kolom `body` (HTML penuh) untuk menghemat transfer bandwidth dan memori.
3. **Agregasi Dashboard Caching (`stats.router.ts`)**:
   - Hasil kalkulasi `SUM(posts.views)`, `COUNT(posts)`, dan `COUNT(media)` disimpan pada in-memory cache isolate selama 60 detik dengan header HTTP `Cache-Control: private, max-age=60`.


