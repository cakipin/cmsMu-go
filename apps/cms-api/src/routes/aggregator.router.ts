import { Hono } from 'hono';
import { getDb, mediaSources, curationQueue } from '@cmsmu/db';
import { eq, desc } from 'drizzle-orm';
import { sanitizeArticleContent } from '@cmsmu/core';

export const aggregatorRouter = new Hono<{ Bindings: any }>();

// GET /api/aggregator/sources
aggregatorRouter.get('/sources', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const sources = await db.select().from(mediaSources).orderBy(desc(mediaSources.createdAt));
    return c.json(sources || []);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET /api/aggregator/queue
aggregatorRouter.get('/queue', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const queue = await db.select().from(curationQueue).orderBy(desc(curationQueue.createdAt));
    return c.json(queue || []);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default aggregatorRouter;
