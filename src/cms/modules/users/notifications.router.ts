import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

const notificationsRouter = new Hono<{ Bindings: Bindings }>();

// 1. GET ALL UNREAD NOTIFICATIONS
notificationsRouter.get('/', async (c) => {
    try {
        if (!c.env.DB) return c.json({ error: 'Database Error' }, 500);

        // Retrieve last 10 unread notifications
        const { results } = await c.env.DB.prepare(
            'SELECT id, title, message, type, created_at FROM notifications WHERE is_read = 0 ORDER BY created_at DESC LIMIT 10'
        ).all();

        return c.json({ success: true, data: results });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

// 2. MARK NOTIFICATION AS READ
notificationsRouter.post('/read', async (c) => {
    try {
        const body = await c.req.json().catch(() => ({}));

        if (body.id) {
            // Mark single notification as read
            await c.env.DB.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').bind(body.id).run();
        } else {
            // Mark all as read
            await c.env.DB.prepare('UPDATE notifications SET is_read = 1').run();
        }

        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

export default notificationsRouter;
