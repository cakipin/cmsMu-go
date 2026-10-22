import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * 🌐 Tabel Master Bahasa (Locales)
 * Menyimpan konfigurasi bahasa aktif, arah baca teks (LTR/RTL), dan bahasa bawaan.
 */
export const locales = sqliteTable("locales", {
  code: text("code", { length: 10 }).primaryKey(), // 'id', 'en', 'ar'
  name: text("name", { length: 50 }).notNull(), // 'Bahasa Indonesia', 'English', 'العربية'
  direction: text("direction", { length: 3 }).default("ltr"), // 'ltr' | 'rtl'
  isDefault: integer("is_default").default(0),
  isActive: integer("is_active").default(1),
});

/**
 * 🔗 Tabel Grup Terjemahan (Translation Groups)
 * Menghubungkan berbagai versi bahasa dari suatu entitas (post, page, atau block canvas).
 */
export const translationGroups = sqliteTable("translation_groups", {
  id: text("id", { length: 36 }).primaryKey(),
  type: text("type", { length: 20 }).notNull(), // 'post' | 'page' | 'block'
  createdAt: text("created_at").notNull(),
});

export type Locale = typeof locales.$inferSelect;
export type NewLocale = typeof locales.$inferInsert;
export type TranslationGroup = typeof translationGroups.$inferSelect;
export type NewTranslationGroup = typeof translationGroups.$inferInsert;
