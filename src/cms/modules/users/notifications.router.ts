import { Hono } from "hono";
import { getDb } from "../../db";
import { notifications } from "../../db/schema";
import { eq, desc } from "drizzle-orm";

type Bindings = {
  DB: D1Database;
};

const notificationsRouter = new Hono<{ Bindings: Bindings }>();

// 1. GET ALL UNREAD NOTIFICATIONS
notificationsRouter.get("/", async c => {
  try {
    if (!c.env.DB) return c.json({ success: true, data: [] });

    const db = getDb(c.env.DB);
    const results = await db
      .select({
        id: notifications.id,
        title: notifications.title,
        message: notifications.message,
        type: notifications.type,
        link: notifications.link,
        created_at: notifications.createdAt,
      })
      .from(notifications)
      .where(eq(notifications.read, 0))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    return c.json({ success: true, data: results || [] });
  } catch (e: any) {
    return c.json({ success: true, data: [] });
  }
});

// 2. MARK NOTIFICATION AS READ
notificationsRouter.post("/read", async c => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const db = getDb(c.env.DB);

    if (body.id) {
      await db
        .update(notifications)
        .set({ read: 1 })
        .where(eq(notifications.id, Number(body.id)))
        .run();
    } else {
      await db.update(notifications).set({ read: 1 }).run();
    }

    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

export default notificationsRouter;
