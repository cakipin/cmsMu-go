import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').unique(),
  password: text('password'),
  email: text('email'),
  name: text('name'),
  role: text('role').default('author'),
  avatar: text('avatar'),
  subscriptionPlan: text('subscription_plan'),
  subscriptionExpiresAt: text('subscription_expires_at'),
  createdAt: text('created_at').default(String(Date.now())),
});

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title'),
  slug: text('slug').unique(),
  body: text('body'),
  excerpt: text('excerpt'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  status: text('status').default('draft'),
  category: text('category').default('Uncategorized'),
  tags: text('tags'),
  featuredImage: text('featured_image'),
  author: text('author').default('Admin'),
  authorId: integer('author_id').references(() => users.id),
  type: text('type').default('post'),
  videoUrl: text('video_url').default(''),
  views: integer('views').default(0),
  allowComments: integer('allow_comments').default(1),
  isPremium: integer('is_premium').default(0),
  createdAt: text('created_at').default(String(Date.now())),
  updatedAt: text('updated_at').default(String(Date.now())),
}, (table) => ({
  statusCatDateIdx: index('idx_posts_status_cat_date').on(table.status, table.category, table.createdAt),
  statusViewsIdx: index('idx_posts_status_views').on(table.status, table.views, table.createdAt),
  statusDateIdx: index('idx_posts_status_date').on(table.status, table.createdAt),
}));

export const pages = sqliteTable('pages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title'),
  slug: text('slug').unique(),
  body: text('body'),
  excerpt: text('excerpt'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  status: text('status').default('publish'),
  featuredImage: text('featured_image'),
  layout: text('layout').default('standard'),
  authorId: integer('author_id').references(() => users.id),
  createdAt: text('created_at').default(String(Date.now())),
  updatedAt: text('updated_at').default(String(Date.now())),
});

export const mediaMeta = sqliteTable('media_meta', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull(),
  url: text('url').notNull(),
  type: text('type'),
  size: integer('size'),
  alt: text('alt'),
  title: text('title'),
  description: text('description'),
  caption: text('caption'),
  createdAt: text('created_at').default(String(Date.now())),
}, (table) => ({
  keyIdx: index('idx_media_meta_key').on(table.key),
}));

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value'),
});

export const options = sqliteTable('options', {
  key: text('key').primaryKey(),
  value: text('value'),
  autoload: integer('autoload').default(0),
});

export const menus = sqliteTable('menus', {
  id: text('id').primaryKey(),
  label: text('label'),
  url: text('url'),
  orderNum: integer('order_num').default(0),
  parentId: text('parent_id'),
});

export const themes = sqliteTable('themes', {
  id: text('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  author: text('author'),
  version: text('version'),
  active: integer('active').default(0),
});

export const plugins = sqliteTable('plugins', {
  id: text('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  author: text('author'),
  version: text('version'),
  active: integer('active').default(0),
});

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  status: text('status').default('approved'),
  createdAt: text('created_at').default(String(Date.now())),
});

export const visitors = sqliteTable('visitors', {
  ip: text('ip').primaryKey(),
  lastSeen: text('last_seen').default(String(Date.now())),
});

export const dailyStats = sqliteTable('daily_stats', {
  date: text('date').primaryKey(),
  views: integer('views').default(0),
  visitors: integer('visitors').default(0),
  updatedAt: text('updated_at').default(String(Date.now())),
}, (table) => ({
  dateIdx: index('idx_daily_stats_date').on(table.date),
}));

export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  email: text('email'),
  plan: text('plan'),
  durationMonths: integer('duration_months').default(1),
  amount: integer('amount'),
  paymentProof: text('payment_proof'),
  notes: text('notes'),
  status: text('status').default('active'),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at'),
});

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  title: text('title'),
  message: text('message'),
  type: text('type').default('warning'),
  link: text('link'),
  read: integer('read').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const contents = sqliteTable('contents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title'),
  slug: text('slug').unique(),
  body: text('body'),
  type: text('type').default('post'),
  status: text('status').default('draft'),
  authorId: integer('author_id'),
  category: text('category'),
  tags: text('tags'),
  featuredImage: text('featured_image'),
  wpId: integer('wp_id'),
  oldUrl: text('old_url'),
  attributes: text('attributes'),
  createdAt: text('created_at').default(String(Date.now())),
  updatedAt: text('updated_at').default(String(Date.now())),
});

export const agens = sqliteTable('agens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  address: text('address'),
  area: text('area'),
  mapLink: text('map_link'),
  createdAt: text('created_at').default(String(Date.now())),
  updatedAt: text('updated_at').default(String(Date.now())),
});

export const ayat = sqliteTable('ayat', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  teksIndonesia: text('teksIndonesia'),
});

export const magazines = sqliteTable('magazines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  editionNumber: text('edition_number'),
  publicationDate: text('publication_date'),
  coverImage: text('cover_image').notNull(),
  pdfR2Key: text('pdf_r2_key').notNull(),
  totalPages: integer('total_pages').default(0),
  previewPages: integer('preview_pages').default(5),
  status: text('status').default('published'),
  isFree: integer('is_free').default(0),
  createdAt: text('created_at').default(String(Date.now())),
  updatedAt: text('updated_at').default(String(Date.now())),
});

export const mediaSources = sqliteTable('media_sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  baseUrl: text('base_url').notNull(),
  feedUrl: text('feed_url'),
  feedType: text('feed_type').default('wp_api'),
  regionCode: text('region_code'),
  websiteCategory: text('website_category').default('Berita'), // PTMA, Dikdasmen, Kesehatan, Berita, Ortom
  defaultCategory: text('default_category').default('Berita Daerah'),
  trustScore: integer('trust_score').default(100),
  isActive: integer('is_active').default(1),
  autoSync: integer('auto_sync').default(1),
  syncInterval: integer('sync_interval').default(15),
  autoPublish: integer('auto_publish').default(0),
  description: text('description'),
  lastFetchedAt: text('last_fetched_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const curationQueue = sqliteTable('curation_queue', {
  id: text('id').primaryKey(),
  sourceId: text('source_id').notNull(),
  rawTitle: text('raw_title').notNull(),
  rawContentHtml: text('raw_content_html').notNull(),
  rawUrl: text('raw_url').notNull().unique(),
  rawPublishedAt: text('raw_published_at'),
  rawImage: text('raw_image'),
  rawDescription: text('raw_description'),
  defaultCategory: text('default_category').default('Berita Daerah'),
  status: text('status').default('pending'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const consultations = sqliteTable('consultations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category').notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  region: text('region'),
  question: text('question').notNull(),
  status: text('status').default('pending'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const translations = sqliteTable('translations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cacheKey: text('cache_key').unique().notNull(),
  lang: text('lang').notNull(),
  originalText: text('original_text'),
  translatedText: text('translated_text').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});


