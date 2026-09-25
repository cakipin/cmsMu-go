import { Hono } from 'hono';
import { getDb, settings, options } from '@cmsmu/db';
import { eq } from 'drizzle-orm';
import { requireAuth, requireRole, type ApiEnv } from '../middleware/auth.middleware';

const settingsRouter = new Hono<ApiEnv>();

// 1. GET ALL SETTINGS AS KEY-VALUE OBJECT
settingsRouter.get('/', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const rows = await db.select().from(settings);
    
    const settingsMap: Record<string, string> = {};
    for (const row of rows) {
      if (row.key) {
        settingsMap[row.key] = row.value || '';
      }
    }

    return c.json(settingsMap);
  } catch (e: any) {
    return c.json({ error: 'Gagal memuat pengaturan: ' + e.message }, 500);
  }
});

// 2. BULK UPDATE SETTINGS (Protected: Admin Only)
settingsRouter.post('/', requireAuth, requireRole(['admin']), async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return c.json({ error: 'Payload pengaturan tidak valid' }, 400);
    }

    const db = getDb(c.env.DB);

    for (const [key, val] of Object.entries(body)) {
      const strVal = typeof val === 'string' ? val : JSON.stringify(val);
      const existing = await db.select().from(settings).where(eq(settings.key, key)).get();

      if (existing) {
        await db.update(settings).set({ value: strVal }).where(eq(settings.key, key)).run();
      } else {
        await db.insert(settings).values({ key, value: strVal }).run();
      }
    }

    return c.json({ success: true, message: 'Pengaturan berhasil disimpan' });
  } catch (e: any) {
    return c.json({ error: 'Gagal menyimpan pengaturan: ' + e.message }, 500);
  }
});

// 3. GET AUTOLOAD OPTIONS
settingsRouter.get('/options', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const rows = await db.select().from(options).where(eq(options.autoload, 1));
    
    const optionsMap: Record<string, string> = {};
    for (const row of rows) {
      if (row.key) {
        optionsMap[row.key] = row.value || '';
      }
    }

    return c.json(optionsMap);
  } catch (e: any) {
    return c.json({ error: 'Gagal memuat opsi: ' + e.message }, 500);
  }
});

export default settingsRouter;
