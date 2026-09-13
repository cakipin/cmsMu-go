import { Hono } from 'hono';
import { getDb } from '../../db';
import { visitors, posts, pages, mediaMeta, users } from '../../db/schema';
import { sql, desc, eq } from 'drizzle-orm';

type Bindings = {
  DB: D1Database;
};

const statsRouter = new Hono<{ Bindings: Bindings }>();

// 1. GET Realtime Users (Active in last 5 minutes)
statsRouter.get('/realtime', async (c) => {
    try {
        const db = getDb(c.env.DB);
        const result = await db.select({ count: sql<number>`COUNT(DISTINCT ${visitors.ip})` })
            .from(visitors)
            .where(sql`${visitors.lastSeen} > datetime('now', '-5 minutes')`)
            .get();
        return c.json({ count: result?.count || 0 });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 1.5 GET History (6 months visitors)
statsRouter.get('/history', async (c) => {
    try {
        const db = getDb(c.env.DB);
        const results = await db.select({
            month: sql<string>`strftime('%Y-%m', ${visitors.lastSeen})`,
            count: sql<number>`COUNT(DISTINCT ${visitors.ip})`
        })
        .from(visitors)
        .where(sql`${visitors.lastSeen} >= date('now', '-6 months')`)
        .groupBy(sql`strftime('%Y-%m', ${visitors.lastSeen})`)
        .orderBy(sql`strftime('%Y-%m', ${visitors.lastSeen}) ASC`)
        .all();
        
        return c.json({ visitors: results || [] });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});


// 1.8 GET Dashboard Aggregate Stats
statsRouter.get('/dashboard', async (c) => {
    try {
        const db = getDb(c.env.DB);
        const postsCount = await db.select({ c: sql<number>`COUNT(${posts.id})` }).from(posts).get();
        const pagesCount = await db.select({ c: sql<number>`COUNT(${pages.id})` }).from(pages).get();
        const mediaCount = await db.select({ c: sql<number>`COUNT(${mediaMeta.id})` }).from(mediaMeta).get();
        const usersCount = await db.select({ c: sql<number>`COUNT(${users.id})` }).from(users).get();
        
        let sourcesCount = 0;
        try {
            const srcRes: any = await c.env.DB.prepare("SELECT COUNT(*) as c FROM media_sources WHERE is_active = 1").first();
            sourcesCount = srcRes?.c || 0;
        } catch(e) {}

        return c.json({
            posts: postsCount?.c || 0,
            pages: pagesCount?.c || 0,
            media: mediaCount?.c || 0,
            users: usersCount?.c || 0,
            sources: sourcesCount || 0
        });
    } catch(e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 2. POST Ping (Track active user)
statsRouter.post('/ping', async (c) => {
    try {
        const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
        if (ip !== 'unknown') {
            const db = getDb(c.env.DB);
            await db.insert(visitors)
                .values({ ip, lastSeen: sql`datetime('now')` })
                .onConflictDoUpdate({ target: visitors.ip, set: { lastSeen: sql`datetime('now')` } })
                .run();
        }
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 3. POST Track Post View
statsRouter.post('/view/:id', async (c) => {
    const id = parseInt(c.req.param('id'), 10);
    try {
        const db = getDb(c.env.DB);
        await db.update(posts)
            .set({ views: sql`${posts.views} + 1` })
            .where(eq(posts.id, id))
            .run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

export default statsRouter;
