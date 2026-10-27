import { sqliteTable, integer, text, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").unique(),
  password: text("password"),
  email: text("email"),
  name: text("name"),
  role: text("role").default("author"),
  avatar: text("avatar"),
  subscriptionPlan: text("subscription_plan"),
  subscriptionExpiresAt: text("subscription_expires_at"),
  createdAt: text("created_at").default(String(Date.now())),
});

export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title"),
    slug: text("slug").unique(),
    body: text("body"),
    excerpt: text("excerpt"),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    status: text("status").default("draft"),
    category: text("category").default("Uncategorized"),
    tags: text("tags"),
    featuredImage: text("featured_image"),
    author: text("author").default("Admin"),
    authorId: integer("author_id").references(() => users.id),
    type: text("type").default("post"),
    videoUrl: text("video_url").default(""),
    views: integer("views").default(0),
    allowComments: integer("allow_comments").default(1),
    isPremium: integer("is_premium").default(0),
    createdAt: text("created_at").default(String(Date.now())),
    updatedAt: text("updated_at").default(String(Date.now())),
  },
  table => ({
    statusCatDateIdx: index("idx_posts_status_cat_date").on(
      table.status,
      table.category,
      table.createdAt
    ),
    statusViewsIdx: index("idx_posts_status_views").on(
      table.status,
      table.views,
      table.createdAt
    ),
    statusDateIdx: index("idx_posts_status_date").on(
      table.status,
      table.createdAt
    ),
    statusTypeDateIdx: index("idx_posts_status_type_date").on(
      table.status,
      table.type,
      table.createdAt
    ),
    slugIdx: uniqueIndex("idx_posts_slug").on(table.slug),
  })
);

export const pages = sqliteTable(
  "pages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title"),
    slug: text("slug").unique(),
    body: text("body"),
    excerpt: text("excerpt"),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    status: text("status").default("publish"),
    featuredImage: text("featured_image"),
    layout: text("layout").default("standard"),
    views: integer("views").default(0),
    authorId: integer("author_id").references(() => users.id),
    createdAt: text("created_at").default(String(Date.now())),
    updatedAt: text("updated_at").default(String(Date.now())),
  },
  table => ({
    statusSlugIdx: index("idx_pages_status_slug").on(table.status, table.slug),
    viewsIdx: index("idx_pages_views").on(table.views),
  })
);

export const mediaMeta = sqliteTable(
  "media_meta",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    key: text("key").notNull(),
    url: text("url").notNull(),
    type: text("type"),
    size: integer("size"),
    alt: text("alt"),
    title: text("title"),
    description: text("description"),
    caption: text("caption"),
    createdAt: text("created_at").default(String(Date.now())),
  },
  table => ({
    keyIdx: index("idx_media_meta_key").on(table.key),
  })
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
});

export const options = sqliteTable("options", {
  key: text("key").primaryKey(),
  value: text("value"),
  autoload: integer("autoload").default(0),
});

export const menus = sqliteTable("menus", {
  id: text("id").primaryKey(),
  label: text("label"),
  url: text("url"),
  orderNum: integer("order_num").default(0),
  parentId: text("parent_id"),
});

export const themes = sqliteTable("themes", {
  id: text("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  author: text("author"),
  version: text("version"),
  active: integer("active").default(0),
});

export const plugins = sqliteTable("plugins", {
  id: text("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  author: text("author"),
  version: text("version"),
  active: integer("active").default(0),
});

export const comments = sqliteTable(
  "comments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    status: text("status").default("approved"),
    createdAt: text("created_at").default(String(Date.now())),
  },
  table => ({
    postStatusIdx: index("idx_comments_post_status").on(
      table.postId,
      table.status,
      table.createdAt
    ),
  })
);

export const visitors = sqliteTable("visitors", {
  ip: text("ip").primaryKey(),
  lastSeen: text("last_seen").default(String(Date.now())),
});

export const dailyStats = sqliteTable(
  "daily_stats",
  {
    date: text("date").primaryKey(),
    views: integer("views").default(0),
    visitors: integer("visitors").default(0),
    updatedAt: text("updated_at").default(String(Date.now())),
  },
  table => ({
    dateIdx: index("idx_daily_stats_date").on(table.date),
  })
);

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  title: text("title"),
  message: text("message"),
  type: text("type").default("warning"),
  link: text("link"),
  read: integer("read").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const contents = sqliteTable(
  "contents",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title"),
    slug: text("slug").unique(),
    body: text("body"),
    type: text("type").default("post"),
    status: text("status").default("draft"),
    authorId: integer("author_id"),
    category: text("category"),
    tags: text("tags"),
    featuredImage: text("featured_image"),
    wpId: integer("wp_id"),
    oldUrl: text("old_url"),
    attributes: text("attributes"),
    createdAt: text("created_at").default(String(Date.now())),
    updatedAt: text("updated_at").default(String(Date.now())),
  },
  table => ({
    statusTypeDateIdx: index("idx_contents_status_type_date").on(
      table.status,
      table.type,
      table.createdAt
    ),
    slugIdx: uniqueIndex("idx_contents_slug").on(table.slug),
  })
);

export const postTags = sqliteTable(
  "post_tags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    tagSlug: text("tag_slug").notNull(),
    createdAt: text("created_at").default(String(Date.now())),
  },
  table => ({
    slugDateIdx: index("idx_post_tags_slug_date").on(table.tagSlug, table.createdAt),
    postIdIdx: index("idx_post_tags_post_id").on(table.postId),
  })
);

