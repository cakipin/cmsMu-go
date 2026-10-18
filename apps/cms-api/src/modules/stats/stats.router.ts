import { Hono } from "hono";
import { getDb } from "@cmsmu/db";
import {
  visitors,
  posts,
  pages,
  mediaMeta,
  users,
  dailyStats,
} from "@cmsmu/db";
import { sql, desc, eq } from "drizzle-orm";

type Bindings = {
  DB: D1Database;
};

const statsRouter = new Hono<{ Bindings: Bindings }>();

// 1. GET Realtime Users (Active in last 5 minutes)
statsRouter.get("/realtime", async c => {
  try {
    const db = getDb(c.env.DB);
    const result = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${visitors.ip})` })
      .from(visitors)
      .where(sql`${visitors.lastSeen} > datetime('now', '-5 minutes')`)
      .get();
    return c.json({ count: result?.count || 0 });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 1.5 GET History (6 months visitors & 30 days daily visitors & daily views)
statsRouter.get("/history", async c => {
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

    return c.json({
      visitors: [...(monthResults || []), ...(dayResults || [])],
      dailyStats: dailyStatsResults || [],
    });
  } catch (e: any) {
    console.warn("[Stats History Warning]:", e.message);
    return c.json({ visitors: [], dailyStats: [] });
  }
});

// 1.8 GET Dashboard Aggregate Stats
statsRouter.get("/dashboard", async c => {
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

    return c.json({
      posts: postsCount?.c || 0,
      pages: pagesCount?.c || 0,
      media: mediaCount?.c || 0,
      users: usersCount?.c || 0,
      totalViews: viewsResult?.total || 0,
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 2. Ping (Track active user - supports GET and POST)
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
      try {
        await c.env.DB.prepare(
          `
                    INSERT INTO daily_stats (date, views, visitors, updated_at)
                    VALUES (date('now', '+7 hours'), 0, 1, datetime('now'))
                    ON CONFLICT(date) DO UPDATE SET 
                        visitors = (SELECT COUNT(*) FROM visitors WHERE date(last_seen, '+7 hours') = date('now', '+7 hours')),
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
