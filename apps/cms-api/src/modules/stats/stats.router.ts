import { Hono } from "hono";
import { getDb } from "@cmsmu/db";
import {
  visitors,
  posts,
  pages,
  mediaMeta,
  users,
  dailyStats,
  options,
} from "@cmsmu/db";
import { sql, eq } from "drizzle-orm";

type Bindings = {
  DB: D1Database;
  CACHE?: KVNamespace;
  cmsmu_cache?: KVNamespace;
  SESSION?: KVNamespace;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ZONE_ID?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
};

const statsRouter = new Hono<{ Bindings: Bindings }>();

// Multi-Tier Cache Store (RAM Isolate)
let memoryRealtimeCache: { count: number; expiry: number } | null = null;
let memoryDashboardCache: { data: any; expiry: number } | null = null;
let memoryHistoryCache: { data: any; expiry: number } | null = null;
let memoryCloudflareAnalyticsCache: { data: any; expiry: number } | null = null;

const TTL_REALTIME_MS = 15 * 1000;       // 15 detik di RAM
const TTL_DASHBOARD_MS = 60 * 1000;      // 60 detik di RAM
const TTL_HISTORY_MS = 300 * 1000;       // 5 menit di RAM
const TTL_CF_ANALYTICS_MS = 300 * 1000;  // 5 menit di RAM

const KV_REALTIME_KEY = "cmsmu:stats:realtime";
const KV_DASHBOARD_KEY = "cmsmu:stats:dashboard";
const KV_HISTORY_KEY = "cmsmu:stats:history";
const KV_CF_ANALYTICS_KEY = "cmsmu:stats:cloudflare";

function getKv(env: any): KVNamespace | null {
  return env.CACHE || env.cmsmu_cache || env.SESSION || null;
}

// 1. GET Realtime Users (Active in last 5 minutes) - Multi-Tier Zero D1 Read
statsRouter.get("/realtime", async c => {
  const now = Date.now();

  // Tier 1: RAM Isolate (< 0.1ms, 0 D1 read)
  if (memoryRealtimeCache && memoryRealtimeCache.expiry > now) {
    c.header("Cache-Control", "private, max-age=15, stale-while-revalidate=30");
    return c.json({ count: memoryRealtimeCache.count, cached: true, source: "ram" });
  }

  const kv = getKv(c.env);

  // Tier 2: Cloudflare KV (~15ms, 0 D1 read)
  if (kv && typeof kv.get === "function") {
    try {
      const cachedVal = await kv.get(KV_REALTIME_KEY);
      if (cachedVal !== null) {
        const count = Number(cachedVal) || 0;
        memoryRealtimeCache = { count, expiry: now + TTL_REALTIME_MS };
        c.header("Cache-Control", "private, max-age=15, stale-while-revalidate=30");
        return c.json({ count, cached: true, source: "kv" });
      }
    } catch (_) {}
  }

  // Tier 3: Fallback D1 Query (dengan index seek idx_visitors_last_seen)
  try {
    const db = getDb(c.env.DB);
    const result = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${visitors.ip})` })
      .from(visitors)
      .where(sql`${visitors.lastSeen} > datetime('now', '-5 minutes')`)
      .get();

    const count = result?.count || 0;
    memoryRealtimeCache = { count, expiry: now + TTL_REALTIME_MS };

    if (kv && typeof kv.put === "function") {
      await kv.put(KV_REALTIME_KEY, String(count), { expirationTtl: 30 }).catch(() => {});
    }

    c.header("Cache-Control", "private, max-age=15, stale-while-revalidate=30");
    return c.json({ count, cached: false, source: "d1" });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 1.5 GET History (6 months visitors & 30 days daily visitors & daily views) - Multi-Tier Zero D1 Read
statsRouter.get("/history", async c => {
  const now = Date.now();

  // Tier 1: RAM Isolate (< 0.1ms)
  if (memoryHistoryCache && memoryHistoryCache.expiry > now) {
    c.header("Cache-Control", "private, max-age=300, stale-while-revalidate=3600");
    return c.json({ ...memoryHistoryCache.data, cached: true, source: "ram" });
  }

  const kv = getKv(c.env);

  // Tier 2: Cloudflare KV (0 D1 read)
  if (kv && typeof kv.get === "function") {
    try {
      const cachedVal = await kv.get(KV_HISTORY_KEY);
      if (cachedVal !== null) {
        const parsed = JSON.parse(cachedVal);
        memoryHistoryCache = { data: parsed, expiry: now + TTL_HISTORY_MS };
        c.header("Cache-Control", "private, max-age=300, stale-while-revalidate=3600");
        return c.json({ ...parsed, cached: true, source: "kv" });
      }
    } catch (_) {}
  }

  // Tier 3: Fallback D1 Query
  try {
    const db = getDb(c.env.DB);
    const monthResults = await db
      .select({
        month: sql<string>`strftime('%Y-%m', ${visitors.lastSeen})`,
        count: sql<number>`COUNT(DISTINCT ${visitors.ip})`,
      })
      .from(visitors)
      .where(sql`${visitors.lastSeen} >= date('now', '-6 months')`)
      .groupBy(sql`strftime('%Y-%m', ${visitors.lastSeen})`)
      .orderBy(sql`strftime('%Y-%m', ${visitors.lastSeen}) ASC`)
      .all();

    const dayResults = await db
      .select({
        day: sql<string>`strftime('%Y-%m-%d', ${visitors.lastSeen})`,
        count: sql<number>`COUNT(DISTINCT ${visitors.ip})`,
      })
      .from(visitors)
      .where(sql`${visitors.lastSeen} >= date('now', '-30 days')`)
      .groupBy(sql`strftime('%Y-%m-%d', ${visitors.lastSeen})`)
      .orderBy(sql`strftime('%Y-%m-%d', ${visitors.lastSeen}) ASC`)
      .all();

    const dailyStatsResults = await db
      .select({
        day: dailyStats.date,
        views: dailyStats.views,
        visitors: dailyStats.visitors,
      })
      .from(dailyStats)
      .where(sql`${dailyStats.date} >= date('now', '-30 days')`)
      .orderBy(sql`${dailyStats.date} ASC`)
      .all();

    const resultData = {
      visitors: [...(monthResults || []), ...(dayResults || [])],
      dailyStats: dailyStatsResults || [],
    };

    memoryHistoryCache = { data: resultData, expiry: now + TTL_HISTORY_MS };

    if (kv && typeof kv.put === "function") {
      await kv.put(KV_HISTORY_KEY, JSON.stringify(resultData), { expirationTtl: 3600 }).catch(() => {});
    }

    c.header("Cache-Control", "private, max-age=300, stale-while-revalidate=3600");
    return c.json({ ...resultData, cached: false, source: "d1" });
  } catch (e: any) {
    console.warn("[Stats History Warning]:", e.message);
    return c.json({ visitors: [], dailyStats: [] });
  }
});

// 1.8 GET Dashboard Aggregate Stats (Cached in RAM & Cloudflare KV)
statsRouter.get("/dashboard", async c => {
  const now = Date.now();

  // Tier 1: RAM Isolate
  if (memoryDashboardCache && memoryDashboardCache.expiry > now) {
    c.header("Cache-Control", "private, max-age=60, stale-while-revalidate=300");
    return c.json({ ...memoryDashboardCache.data, cached: true, source: "ram" });
  }

  const kv = getKv(c.env);

  // Tier 2: Cloudflare KV
  if (kv && typeof kv.get === "function") {
    try {
      const cachedVal = await kv.get(KV_DASHBOARD_KEY);
      if (cachedVal !== null) {
        const parsed = JSON.parse(cachedVal);
        memoryDashboardCache = { data: parsed, expiry: now + TTL_DASHBOARD_MS };
        c.header("Cache-Control", "private, max-age=60, stale-while-revalidate=300");
        return c.json({ ...parsed, cached: true, source: "kv" });
      }
    } catch (_) {}
  }

  // Tier 3: Fallback D1 Query
  try {
    const db = getDb(c.env.DB);
    const postsCount = await db
      .select({ c: sql<number>`COUNT(${posts.id})` })
      .from(posts)
      .get();
    const pagesCount = await db
      .select({ c: sql<number>`COUNT(${pages.id})` })
      .from(pages)
      .get();
    const mediaCount = await db
      .select({ c: sql<number>`COUNT(${mediaMeta.id})` })
      .from(mediaMeta)
      .get();
    const usersCount = await db
      .select({ c: sql<number>`COUNT(${users.id})` })
      .from(users)
      .get();
    const viewsResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${posts.views}), 0)` })
      .from(posts)
      .get();

    const resultData = {
      posts: postsCount?.c || 0,
      pages: pagesCount?.c || 0,
      media: mediaCount?.c || 0,
      users: usersCount?.c || 0,
      totalViews: viewsResult?.total || 0,
    };

    memoryDashboardCache = { data: resultData, expiry: now + TTL_DASHBOARD_MS };

    if (kv && typeof kv.put === "function") {
      await kv.put(KV_DASHBOARD_KEY, JSON.stringify(resultData), { expirationTtl: 300 }).catch(() => {});
    }

    c.header("Cache-Control", "private, max-age=60, stale-while-revalidate=300");
    return c.json({ ...resultData, cached: false, source: "d1" });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 1.9 GET Cloudflare Edge Web Analytics (GraphQL API - 0% D1 Load)
statsRouter.get("/cloudflare", async c => {
  const now = Date.now();

  // Tier 1: RAM Isolate
  if (memoryCloudflareAnalyticsCache && memoryCloudflareAnalyticsCache.expiry > now) {
    c.header("Cache-Control", "private, max-age=300");
    return c.json(memoryCloudflareAnalyticsCache.data);
  }

  const kv = getKv(c.env);

  // Tier 2: KV
  if (kv && typeof kv.get === "function") {
    try {
      const cachedVal = await kv.get(KV_CF_ANALYTICS_KEY);
      if (cachedVal !== null) {
        const parsed = JSON.parse(cachedVal);
        memoryCloudflareAnalyticsCache = { data: parsed, expiry: now + TTL_CF_ANALYTICS_MS };
        c.header("Cache-Control", "private, max-age=300");
        return c.json(parsed);
      }
    } catch (_) {}
  }

  // Resolve API Token and Zone ID
  let apiToken = c.env.CLOUDFLARE_API_TOKEN;
  let zoneId = c.env.CLOUDFLARE_ZONE_ID;

  if (!apiToken || !zoneId) {
    try {
      const db = getDb(c.env.DB);
      const optRows = await db
        .select()
        .from(options)
        .where(sql`${options.key} IN ('cf_api_token', 'cf_zone_id')`)
        .all();

      for (const row of optRows || []) {
        if (row.key === "cf_api_token" && row.value) apiToken = row.value;
        if (row.key === "cf_zone_id" && row.value) zoneId = row.value;
      }
    } catch (_) {}
  }

  if (!apiToken || !zoneId) {
    return c.json({
      configured: false,
      message: "Cloudflare Analytics API Token atau Zone ID belum dikonfigurasi. Masukkan di Settings atau Environment.",
      data: null,
    });
  }

  try {
    const date30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const date24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const query = `
      query GetZoneAnalytics($zoneTag: String!, $date24h: String!, $date30d: String!) {
        viewer {
          zones(filter: { zoneTag: $zoneTag }) {
            httpRequests1dGroups(
              limit: 30
              filter: { date_geq: $date30d }
              orderBy: [date_ASC]
            ) {
              dimensions { date }
              sum { requests pageViews bytes }
              uniq { uniques }
            }
            httpRequestsAdaptiveGroups(
              limit: 10
              filter: { datetime_geq: $date24h }
              orderBy: [count_DESC]
            ) {
              count
              dimensions { clientCountryName }
            }
          }
        }
      }
    `;

    const cfRes = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        query,
        variables: { zoneTag: zoneId, date24h, date30d },
      }),
    });

    if (!cfRes.ok) {
      const errText = await cfRes.text();
      return c.json({
        configured: true,
        error: `Cloudflare GraphQL API error: ${cfRes.status} ${errText}`,
        data: null,
      }, 502);
    }

    const cfJson: any = await cfRes.json();
    const zoneData = cfJson?.data?.viewer?.zones?.[0];

    const history30d = (zoneData?.httpRequests1dGroups || []).map((g: any) => ({
      date: g.dimensions?.date,
      requests: g.sum?.requests || 0,
      pageViews: g.sum?.pageViews || 0,
      bytes: g.sum?.bytes || 0,
      uniques: g.uniq?.uniques || 0,
    }));

    const topCountries = (zoneData?.httpRequestsAdaptiveGroups || []).map((g: any) => ({
      country: g.dimensions?.clientCountryName || "Unknown",
      count: g.count || 0,
    }));

    const totals24h = history30d.length > 0 ? history30d[history30d.length - 1] : { requests: 0, pageViews: 0, uniques: 0 };

    const payload = {
      configured: true,
      source: "cloudflare_edge",
      data: {
        totalRequests24h: totals24h.requests,
        totalPageViews24h: totals24h.pageViews,
        uniqueVisitors24h: totals24h.uniques,
        history30d,
        topCountries,
        cachedAt: new Date().toISOString(),
      },
    };

    memoryCloudflareAnalyticsCache = { data: payload, expiry: now + TTL_CF_ANALYTICS_MS };

    if (kv && typeof kv.put === "function") {
      await kv.put(KV_CF_ANALYTICS_KEY, JSON.stringify(payload), { expirationTtl: 300 }).catch(() => {});
    }

    c.header("Cache-Control", "private, max-age=300");
    return c.json(payload);
  } catch (err: any) {
    return c.json({
      configured: true,
      error: err.message,
      data: null,
    }, 500);
  }
});

// 2. Ping (Track active user - Subquery Full-Scan REMOVED)
const handlePing = async (c: any) => {
  try {
    const ip =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for") ||
      "unknown";

    if (ip !== "unknown") {
      const db = getDb(c.env.DB);
      await db
        .insert(visitors)
        .values({ ip, lastSeen: sql`datetime('now')` })
        .onConflictDoUpdate({
          target: visitors.ip,
          set: { lastSeen: sql`datetime('now')` },
        })
        .run();

      // Update daily_stats TANPA pemindaian subquery SELECT COUNT(*) pada setiap hit.
      // Hanya menghitung ulang pengunjung jika selang waktu update > 15 menit.
      try {
        await c.env.DB.prepare(
          `
            INSERT INTO daily_stats (date, views, visitors, updated_at)
            VALUES (date('now', '+7 hours'), 0, 1, datetime('now'))
            ON CONFLICT(date) DO UPDATE SET 
                visitors = CASE 
                    WHEN updated_at < datetime('now', '-15 minutes') 
                    THEN (SELECT COUNT(*) FROM visitors WHERE last_seen >= date('now', '+7 hours'))
                    ELSE visitors 
                END,
                updated_at = datetime('now')
          `
        ).run();
      } catch (e) {}
    }
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
};
statsRouter.post("/ping", handlePing);
statsRouter.get("/ping", handlePing);

// 3. POST Track Post View
statsRouter.post("/view/:id", async c => {
  const id = parseInt(c.req.param("id"), 10);
  try {
    const db = getDb(c.env.DB);
    await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.id, id))
      .run();

    try {
      await c.env.DB.prepare(
        `
          INSERT INTO daily_stats (date, views, visitors, updated_at)
          VALUES (date('now', '+7 hours'), 1, 0, datetime('now'))
          ON CONFLICT(date) DO UPDATE SET views = views + 1, updated_at = datetime('now')
        `
      ).run();
    } catch (e) {}
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default statsRouter;
