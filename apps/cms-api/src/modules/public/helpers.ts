import { getDb } from "@cmsmu/db";
import {
  settings as settingsTable,
  menus as menusTable,
  themes as themesTable,
  options as optionsTable,
} from "@cmsmu/db";
import { eq, asc } from "drizzle-orm";
import { getActiveTheme } from "../../themes/registry";

export function getYoutubeThumbnail(url?: string): string {
  if (!url) return "";
  const str = String(url).trim();
  if (str.includes("youtube.com") || str.includes("youtu.be")) {
    let videoId = "";
    if (str.includes("youtu.be/")) {
      videoId = str.split("youtu.be/")[1].split("?")[0].split("/")[0];
    } else if (str.includes("shorts/")) {
      videoId = str.split("shorts/")[1].split("?")[0].split("/")[0];
    } else if (str.includes("embed/")) {
      videoId = str.split("embed/")[1].split("?")[0].split("/")[0];
    } else {
      const m = str.match(/[?&]v=([a-zA-Z0-9_-]+)/);
      if (m && m[1]) videoId = m[1];
    }
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return "";
}

export function formatPostForFrontend(post: any) {
  if (!post) return post;
  const customImg = post.featured_image || post.featuredImage || "";
  const videoUrl = post.video_url || post.videoUrl || "";
  const finalImage = customImg || getYoutubeThumbnail(videoUrl) || "";
  return {
    ...post,
    body: post.body || post.content || "",
    content: post.body || post.content || "",
    featured_image: finalImage,
    created_at: post.created_at || post.createdAt || new Date().toISOString(),
    updated_at: post.updated_at || post.updatedAt || new Date().toISOString(),
    meta_title: post.meta_title || post.metaTitle || "",
    meta_description: post.meta_description || post.metaDescription || "",
    allow_comments:
      post.allow_comments !== undefined
        ? post.allow_comments
        : post.allowComments,
    is_premium:
      post.is_premium !== undefined ? post.is_premium : post.isPremium,
    type: post.type || "post",
    video_url: videoUrl,
    author_id: post.author_id || post.authorId,
  };
}

interface GlobalDataCacheEntry {
  data: any;
  expiry: number;
}

let memoryGlobalCache: GlobalDataCacheEntry | null = null;
const MEMORY_CACHE_TTL_MS = 60 * 1000; // 60 detik RAM Worker isolate
const KV_CACHE_TTL_SECONDS = 300; // 300 detik (5 menit) Cloudflare KV
const GLOBAL_DATA_CACHE_KEY = "cmsmu:global_data_v1";

let d1IndexesEnsured = false;

/**
 * Memastikan indeks komposit D1 SQLite terpasang secara idempoten pada runtime (1x per isolate).
 * Melindungi pengguna existing yang belum menjalankan manual migration agar tidak mengalami full-table scan.
 */
export async function ensureD1PerformanceIndexes(db: any) {
  if (d1IndexesEnsured || !db || typeof db.prepare !== "function") return;
  d1IndexesEnsured = true;
  try {
    const stmts = [
      "CREATE TABLE IF NOT EXISTS visitors (ip TEXT PRIMARY KEY, last_seen TEXT DEFAULT CURRENT_TIMESTAMP);",
      "CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON visitors(last_seen DESC);",
      "CREATE INDEX IF NOT EXISTS idx_posts_status_date ON posts(status, created_at DESC);",
      "CREATE INDEX IF NOT EXISTS idx_posts_status_cat_date ON posts(status, category, created_at DESC);",
      "CREATE INDEX IF NOT EXISTS idx_posts_status_views ON posts(status, views DESC, created_at DESC);",
      "CREATE INDEX IF NOT EXISTS idx_posts_status_type_date ON posts(status, type, created_at DESC);",
      "CREATE INDEX IF NOT EXISTS idx_posts_category_status ON posts(category, status);",
      "CREATE INDEX IF NOT EXISTS idx_posts_author_status ON posts(author_id, status);",
      "CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title);",
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);",
      "CREATE INDEX IF NOT EXISTS idx_pages_status_slug ON pages(status, slug);",
      "CREATE INDEX IF NOT EXISTS idx_pages_views ON pages(views DESC);",
      "CREATE INDEX IF NOT EXISTS idx_media_meta_key ON media_meta(key);",
      "CREATE INDEX IF NOT EXISTS idx_media_meta_created ON media_meta(created_at DESC);",
      "CREATE INDEX IF NOT EXISTS idx_comments_post_status ON comments(post_id, status, created_at DESC);",
      "CREATE INDEX IF NOT EXISTS idx_menus_order ON menus(order_num ASC);",
      "CREATE INDEX IF NOT EXISTS idx_options_autoload ON options(autoload);",
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_contents_slug ON contents(slug);",
      "CREATE INDEX IF NOT EXISTS idx_contents_status_type_date ON contents(status, type, created_at DESC);"
    ];
    for (const sql of stmts) {
      await db.prepare(sql).run().catch(() => {});
    }
  } catch (err) {
    console.warn("[ensureD1PerformanceIndexes warning]:", err);
  }
}

// ─── COUNTER CACHE BERTINGKAT (ANTI-COUNT(*) FULL TABLE SCAN) ───────────────
let memoryPostCountCache: { count: number; expiry: number } | null = null;
const COUNT_CACHE_KEY = "cmsmu:count:published_posts";

export async function getCachedPublishedPostCount(dbOrEnv: any, maybeKv?: any): Promise<number> {
  let db: any = dbOrEnv;
  let kv: any = maybeKv;

  if (dbOrEnv && typeof dbOrEnv === "object" && dbOrEnv.DB) {
    db = dbOrEnv.DB;
    if (!kv) kv = dbOrEnv.CACHE || dbOrEnv.cache || dbOrEnv.sa_cache;
  }

  const now = Date.now();
  // 1. RAM Isolate (< 0.1ms, 0 rows read)
  if (memoryPostCountCache && memoryPostCountCache.expiry > now) {
    return memoryPostCountCache.count;
  }

  // 2. Cloudflare KV Edge Cache (~15ms, 0 rows read ke D1)
  if (kv && typeof kv.get === "function") {
    try {
      const cachedVal = await kv.get(COUNT_CACHE_KEY);
      if (cachedVal !== null && !isNaN(Number(cachedVal))) {
        const count = Number(cachedVal);
        memoryPostCountCache = { count, expiry: now + 60 * 1000 };
        return count;
      }
    } catch (errKv) {
      console.warn("[KV getCachedPublishedPostCount error]:", errKv);
    }
  }

  // 3. Fallback: D1 Database Query
  try {
    const row: any = await db.prepare("SELECT count(*) as total FROM posts WHERE status = 'publish'").first();
    const count = Number(row?.total || 0);
    memoryPostCountCache = { count, expiry: now + 60 * 1000 };

    if (kv && typeof kv.put === "function") {
      kv.put(COUNT_CACHE_KEY, String(count), { expirationTtl: 300 }).catch(() => {});
    }
    return count;
  } catch (_) {
    return 0;
  }
}

export function clearPostCountCache(kv?: any) {
  memoryPostCountCache = null;
  if (kv && typeof kv.delete === "function") {
    kv.delete(COUNT_CACHE_KEY).catch(() => {});
  }
}

export function clearGlobalDataCache(kv?: any) {
  memoryGlobalCache = null;
  clearPostCountCache(kv);
  if (kv && typeof kv.delete === "function") {
    kv.delete(GLOBAL_DATA_CACHE_KEY).catch((err: any) => {
      console.warn("[clearGlobalDataCache KV delete error]:", err);
    });
  }
}

export async function getGlobalData(dbOrEnv: any, maybeKv?: any) {
  let db: any = dbOrEnv;
  let kv: any = maybeKv;

  // Handle jika dipanggil dengan env object (misal c.env)
  if (
    dbOrEnv &&
    typeof dbOrEnv === "object" &&
    dbOrEnv.DB &&
    typeof dbOrEnv.DB.prepare === "function"
  ) {
    db = dbOrEnv.DB;
    if (!kv) {
      kv = dbOrEnv.CACHE || dbOrEnv.cache || dbOrEnv.sa_cache;
    }
  }

  // Jalankan auto-check index 1x per isolate (non-blocking) untuk memproteksi user existing
  if (db && typeof db.prepare === "function") {
    ensureD1PerformanceIndexes(db).catch(() => {});
  }

  const now = Date.now();

  // 1. Cek In-Memory Isolate Cache (< 0.1ms)
  if (memoryGlobalCache && memoryGlobalCache.expiry > now) {
    return memoryGlobalCache.data;
  }

  // 2. Cek Cloudflare KV Edge Cache (~15ms)
  if (kv && typeof kv.get === "function") {
    try {
      const cached = await kv.get(GLOBAL_DATA_CACHE_KEY, "json");
      if (cached && typeof cached === "object" && cached.settings) {
        memoryGlobalCache = {
          data: cached,
          expiry: now + MEMORY_CACHE_TTL_MS,
        };
        return cached;
      }
    } catch (errKv) {
      console.warn("[KV getGlobalData read error]:", errKv);
    }
  }

  // 3. Fallback: Query Cloudflare D1 Database
  let settingsData: any = {};
  let menusData: any[] = [];
  let categoriesData: string[] = [];
  let topicsData: { name: string; slug: string }[] = [];
  let sourcesData: any[] = [];

  try {
    const optionRows = await getDb(db).select().from(optionsTable);
    if (optionRows)
      optionRows.forEach((row: any) => {
        settingsData[row.key] = row.value;
      });
    const settingRows = await getDb(db).select().from(settingsTable);
    if (settingRows)
      settingRows.forEach((row: any) => {
        settingsData[row.key] = row.value;
      });
    const menuRows = await getDb(db)
      .select()
      .from(menusTable)
      .orderBy(asc(menusTable.orderNum));
    menusData = (menuRows || []).map((m: any) => ({
      ...m,
      parent_id: m.parent_id ?? m.parentId ?? null,
      order_num: m.order_num ?? m.orderNum ?? 0,
    }));

    // Media sources (default empty in clean core)
    sourcesData = [];

    // Ambil distinct categories dari posts yang dipublikasikan (Real DB)
    try {
      const catRows: any = await db
        .prepare(
          "SELECT DISTINCT category FROM posts WHERE status = 'publish' AND category IS NOT NULL AND trim(category) != '' AND category != 'Uncategorized' ORDER BY category ASC LIMIT 50"
        )
        .all();
      if (catRows?.results) {
        categoriesData = catRows.results
          .map((r: any) => r.category.trim())
          .filter(Boolean);
      }
    } catch (errCat) {
      console.error("Error querying categories:", errCat);
    }

    // Ambil distinct tags dari posts untuk sorotan/trending (Real DB)
    try {
      const tagRows: any = await db
        .prepare(
          "SELECT tags FROM posts WHERE status = 'publish' AND tags IS NOT NULL AND trim(tags) != '' LIMIT 100"
        )
        .all();
      if (tagRows?.results) {
        const tagMap = new Map<string, string>();
        for (const row of tagRows.results) {
          const parts = String(row.tags || "").split(",");
          for (let p of parts) {
            p = p.trim();
            if (p && p !== "-" && p !== "null" && p.length > 1) {
              const slug = p
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
              if (slug && !tagMap.has(slug)) {
                tagMap.set(slug, p);
              }
            }
          }
        }
        topicsData = Array.from(tagMap.entries())
          .slice(0, 8)
          .map(([slug, name]) => ({
            name,
            slug,
          }));
      }
    } catch (errTag) {
      console.error("Error querying tags:", errTag);
    }
  } catch (e) {
    console.error("Error global data", e);
  }

  const result = {
    settings: settingsData,
    menus: menusData,
    categories: categoriesData,
    topics: topicsData,
    sources: sourcesData,
  };

  // 4. Update In-Memory & Cloudflare KV Edge Cache
  memoryGlobalCache = { data: result, expiry: now + MEMORY_CACHE_TTL_MS };

  if (kv && typeof kv.put === "function") {
    try {
      await kv.put(GLOBAL_DATA_CACHE_KEY, JSON.stringify(result), {
        expirationTtl: KV_CACHE_TTL_SECONDS,
      });
    } catch (errKv) {
      console.warn("[KV putGlobalData write error]:", errKv);
    }
  }

  return result;
}

let memoryActiveThemeCache: { themeId: string; expiry: number } | null = null;
const THEME_CACHE_TTL_MS = 60 * 1000;

export function invalidateActiveThemeCache() {
  memoryActiveThemeCache = null;
}

export async function getRenderer(db: any) {
  const now = Date.now();
  if (memoryActiveThemeCache && memoryActiveThemeCache.expiry > now) {
    const theme = getActiveTheme(memoryActiveThemeCache.themeId);
    return { Renderer: theme || getActiveTheme("default"), themeId: memoryActiveThemeCache.themeId };
  }

  try {
    const activeThemeRow = await getDb(db)
      .select({ id: themesTable.id })
      .from(themesTable)
      .where(eq(themesTable.active, 1))
      .get();
    const themeId = activeThemeRow ? activeThemeRow.id : "default";
    memoryActiveThemeCache = { themeId, expiry: now + THEME_CACHE_TTL_MS };
    const theme = getActiveTheme(themeId);
    return { Renderer: theme || getActiveTheme("default"), themeId };
  } catch (e) {
    return { Renderer: getActiveTheme("default"), themeId: "default" };
  }
}

// ─── CLOUDFLARE KV HTML CACHE HELPERS (ZERO D1 ROWS READ ON HIT) ───────────
export function getPublicKv(env: any): any {
  if (!env) return null;
  return env.CACHE || env.cache || env.sa_cache || env.cmsmu_cache || null;
}

export async function getCachedHtml(kv: any, key: string): Promise<string | null> {
  if (!kv || typeof kv.get !== "function") return null;
  try {
    return await kv.get(key);
  } catch (err) {
    console.warn("[getCachedHtml KV read warning]:", err);
    return null;
  }
}

export function setCachedHtml(
  ctx: any,
  kv: any,
  key: string,
  html: string,
  ttlSeconds = 600
): void {
  if (!kv || typeof kv.put !== "function" || !html) return;
  const promise = kv.put(key, html, { expirationTtl: ttlSeconds }).catch((err: any) => {
    console.warn("[setCachedHtml KV write warning]:", err);
  });
  if (ctx && typeof ctx.waitUntil === "function") {
    ctx.waitUntil(promise);
  }
}

