import { Hono } from "hono";
import { getDb } from "@cmsmu/db";
import {
  posts,
  pages,
  mediaMeta,
  users,
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

let memoryCfCredsCache: { creds: { apiToken?: string; zoneId?: string }; expiry: number } | null = null;

/**
 * Mengambil Cloudflare API Token & Zone ID secara aman
 * dari Environment Variables atau tabel options (dengan RAM cache 5 menit).
 */
async function getCloudflareCredentials(env: any): Promise<{ apiToken?: string; zoneId?: string }> {
  let apiToken = env.CLOUDFLARE_API_TOKEN;
  let zoneId = env.CLOUDFLARE_ZONE_ID;

  if (apiToken && zoneId) {
    return { apiToken, zoneId };
  }

  const now = Date.now();
  if (memoryCfCredsCache && memoryCfCredsCache.expiry > now) {
    return memoryCfCredsCache.creds;
  }

  if (!apiToken || !zoneId) {
    try {
      const db = getDb(env.DB);
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

  const creds = { apiToken, zoneId };
  memoryCfCredsCache = { creds, expiry: now + 300 * 1000 };
  return creds;
}

// 1. GET Realtime Users (Active in last 15 minutes) - MURNI CLOUDFLARE EDGE & 0 D1 READ
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

  // Tier 3: Cloudflare GraphQL Edge Analytics (0 D1 read)
  let count = 0;
  const { apiToken, zoneId } = await getCloudflareCredentials(c.env);
  if (apiToken && zoneId) {
    try {
      const date15m = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const query = `
        query GetRealtimeAnalytics($zoneTag: String!, $date15m: String!) {
          viewer {
            zones(filter: { zoneTag: $zoneTag }) {
              httpRequestsAdaptiveGroups(
                limit: 10
                filter: { datetime_geq: $date15m }
              ) {
                count
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
          variables: { zoneTag: zoneId, date15m },
        }),
      });
      if (cfRes.ok) {
        const cfJson: any = await cfRes.json();
        const groups = cfJson?.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || [];
        const totalRecentReqs = groups.reduce((acc: number, g: any) => acc + (g.count || 0), 0);
        count = Math.max(1, Math.round(totalRecentReqs / 5));
      }
    } catch (_) {}
  }

  memoryRealtimeCache = { count, expiry: now + TTL_REALTIME_MS };

  if (kv && typeof kv.put === "function") {
    await kv.put(KV_REALTIME_KEY, String(count), { expirationTtl: 30 }).catch(() => {});
  }

  c.header("Cache-Control", "private, max-age=15, stale-while-revalidate=30");
  return c.json({ count, cached: false, source: "cloudflare_edge" });
});

// 1.5 GET History (30 Days & Monthly Analytics) - MURNI CLOUDFLARE GRAPHQL & 0 D1 READ
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

  // Tier 3: Fetch directly from Cloudflare GraphQL API (0 D1 read)
  const { apiToken, zoneId } = await getCloudflareCredentials(c.env);
  let visitorsData: any[] = [];
  let dailyStatsData: any[] = [];

  if (apiToken && zoneId) {
    try {
      const date30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const query = `
        query GetHistoryAnalytics($zoneTag: String!, $date30d: String!) {
          viewer {
            zones(filter: { zoneTag: $zoneTag }) {
              httpRequests1dGroups(
                limit: 30
                filter: { date_geq: $date30d }
                orderBy: [date_ASC]
              ) {
                dimensions { date }
                sum { pageViews requests }
                uniq { uniques }
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
          variables: { zoneTag: zoneId, date30d },
        }),
      });

      if (cfRes.ok) {
        const cfJson: any = await cfRes.json();
        const groups = cfJson?.data?.viewer?.zones?.[0]?.httpRequests1dGroups || [];
        visitorsData = groups.map((g: any) => ({
          day: g.dimensions?.date,
          month: g.dimensions?.date ? g.dimensions.date.substring(0, 7) : "",
          count: g.uniq?.uniques || 0,
        }));
        dailyStatsData = groups.map((g: any) => ({
          day: g.dimensions?.date,
          date: g.dimensions?.date,
          views: g.sum?.pageViews || 0,
          visitors: g.uniq?.uniques || 0,
        }));
      }
    } catch (err) {
      console.warn("[Cloudflare GraphQL History Warning]:", err);
    }
  }

  const resultData = {
    visitors: visitorsData,
    dailyStats: dailyStatsData,
    source: "cloudflare_graphql",
  };

  memoryHistoryCache = { data: resultData, expiry: now + TTL_HISTORY_MS };

  if (kv && typeof kv.put === "function") {
    await kv.put(KV_HISTORY_KEY, JSON.stringify(resultData), { expirationTtl: 3600 }).catch(() => {});
  }

  c.header("Cache-Control", "private, max-age=300, stale-while-revalidate=3600");
  return c.json({ ...resultData, cached: false, source: "cloudflare_edge" });
});

// 1.8 GET Dashboard Aggregate Stats (Cached in RAM & Cloudflare KV - Zero Visitor Table Scans)
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

  // Tier 3: D1 Counts for Content Entities Only (Anti-Scan: No queries to visitors or daily_stats)
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
    return c.json({ ...resultData, cached: false, source: "d1_entities" });
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
  const { apiToken, zoneId } = await getCloudflareCredentials(c.env);

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

// 2. Ping (MURNI CLOUDFLARE EDGE - 0% D1 WRITE & 0% D1 READ)
const handlePing = async (c: any) => {
  // Traffic analitik dicatat secara otomatis oleh jaringan global Cloudflare Edge.
  // Tidak ada penulisan atau pembacaan ke D1 sama sekali.
  c.header("Cache-Control", "no-store, no-cache, must-revalidate");
  return c.json({
    success: true,
    tracking: "cloudflare_edge",
    recordedAt: new Date().toISOString(),
  });
};
statsRouter.post("/ping", handlePing);
statsRouter.get("/ping", handlePing);

// 3. POST Track Post View (Asynchronous via waitUntil - 0 daily_stats write)
statsRouter.post("/view/:id", async c => {
  const id = parseInt(c.req.param("id"), 10);
  try {
    const db = getDb(c.env.DB);
    const updateTask = async () => {
      try {
        await db
          .update(posts)
          .set({ views: sql`${posts.views} + 1` })
          .where(eq(posts.id, id))
          .run();
      } catch (_) {}
    };

    if (c.executionCtx && typeof (c.executionCtx as any).waitUntil === "function") {
      (c.executionCtx as any).waitUntil(updateTask());
    } else {
      await updateTask();
    }

    return c.json({ success: true, tracking: "post_counter" });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default statsRouter;
