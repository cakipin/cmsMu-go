import { Hono } from 'hono';
import { getDb, magazines, settings } from '@cmsmu/db';
import { eq, desc, and } from 'drizzle-orm';
import { getPlansConfig, parseRangeHeader } from '@cmsmu/core';

export const emagazineRouter = new Hono<{ Bindings: any }>();

// GET /api/emagazine/plans-config
emagazineRouter.get('/plans-config', async (c) => {
  const config = await getPlansConfig(c.env.DB);
  return c.json(config);
});

// POST /api/emagazine/plans-config
emagazineRouter.post('/plans-config', async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body) return c.json({ error: 'Data pengaturan tidak valid' }, 400);

    const db = getDb(c.env.DB);
    const existing = await db.select().from(settings).where(eq(settings.key, 'emagazine_plans_config')).get();
    const jsonValue = JSON.stringify(body);

    if (existing) {
      await db.update(settings).set({ value: jsonValue }).where(eq(settings.key, 'emagazine_plans_config')).run();
    } else {
      await db.insert(settings).values({ key: 'emagazine_plans_config', value: jsonValue }).run();
    }

    return c.json({ success: true, message: 'Pengaturan paket berhasil disimpan', config: body });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET /api/emagazine
emagazineRouter.get('/', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const list = await db.select().from(magazines).orderBy(desc(magazines.id));
    return c.json(list || []);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET /api/emagazine/:id
emagazineRouter.get('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const db = getDb(c.env.DB);
    const item = await db.select().from(magazines).where(eq(magazines.id, id)).get();
    if (!item) return c.json({ error: 'Edisi majalah tidak ditemukan' }, 404);
    return c.json(item);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default emagazineRouter;
