import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
  SESSION_SECRET: string;
};

const statsRouter = new Hono<{ Bindings: Bindings }>();

// 1. GET Realtime Users (Active in last 5 minutes)
statsRouter.get('/realtime', async (c) => {
    try {
        const result = await c.env.DB.prepare(
            "SELECT COUNT(DISTINCT ip) as count FROM visitors WHERE last_seen > datetime('now', '-5 minutes')"
        ).first();
        return c.json({ count: result?.count || 0 });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 1.5 GET History (6 months visitors)
statsRouter.get('/history', async (c) => {
    try {
        const { results } = await c.env.DB.prepare(`
            SELECT strftime('%Y-%m', last_seen) as month, COUNT(DISTINCT ip) as count
            FROM visitors
            WHERE last_seen >= date('now', '-6 months')
            GROUP BY month ORDER BY month ASC
        `).all();
        return c.json({ visitors: results || [] });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 2. POST Ping (Track active user)
statsRouter.post('/ping', async (c) => {
    try {
        const rawIp = c.req.header('cf-connecting-ip') || 'unknown';
        const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(c.env.SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawIp)));
        const ip = btoa(String.fromCharCode(...signature));
        if (ip !== 'unknown') {
            await c.env.DB.prepare(
                "INSERT INTO visitors (ip, last_seen) VALUES (?, datetime('now')) ON CONFLICT(ip) DO UPDATE SET last_seen = datetime('now')"
            ).bind(ip).run();
        }
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 3. POST Track Post View
statsRouter.post('/view/:id', async (c) => {
    const id = c.req.param('id');
    try {
        await c.env.DB.prepare(
            "UPDATE posts SET views = views + 1 WHERE id = ?"
        ).bind(id).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

export default statsRouter;
