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

export function clearGlobalDataCache(kv?: any) {
  memoryGlobalCache = null;
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
      kv = dbOrEnv.sa_cache || dbOrEnv.cache || dbOrEnv.CACHE;
    }
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
          "SELECT DISTINCT category FROM posts WHERE status = 'publish' AND category IS NOT NULL AND trim(category) != '' AND category != 'Uncategorized' ORDER BY category ASC"
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

export async function getRenderer(db: any) {
  try {
    const activeThemeRow = await getDb(db)
      .select({ id: themesTable.id })
      .from(themesTable)
      .where(eq(themesTable.active, 1))
      .get();
    const themeId = activeThemeRow ? activeThemeRow.id : "newsroom";
    const theme = getActiveTheme(themeId);
    return { Renderer: theme || getActiveTheme("newsroom"), themeId };
  } catch (e) {
    return { Renderer: getActiveTheme("newsroom"), themeId: "newsroom" };
  }
}
