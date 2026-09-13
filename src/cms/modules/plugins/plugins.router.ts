import { Hono } from 'hono';
import { getDb } from '../../db';
import { plugins as pluginsTable } from '../../db/schema';
import { eq } from 'drizzle-orm';

const plugins = new Hono<{ Bindings: any }>();

// GET: List Plugins
plugins.get('/', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const results = await db.select().from(pluginsTable);
    return c.json({ success: true, data: results || [] });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// POST: Toggle Plugin Status (Activate/Deactivate)
plugins.post('/toggle', async (c) => {
  try {
    const body = await c.req.json();
    const targetId = body.plugin_id || body.pluginId;
    const active = body.active ? 1 : 0;

    if (!targetId) return c.json({ success: false, message: 'ID Plugin kosong' }, 400);

    const db = getDb(c.env.DB);
    // Update the plugin's active status
    const result = await db.update(pluginsTable)
      .set({ active })
      .where(eq(pluginsTable.id, targetId))
      .run();

    if (result.success) {
      return c.json({ success: true, message: "Plugin " + (active ? 'Diaktifkan' : 'Dinonaktifkan') + "!" });
    }
    
    return c.json({ success: false, message: 'Gagal mengupdate status plugin' }, 400);
  } catch (e: any) {
    console.error(e);
    return c.json({ success: false, error: e.message }, 500);
  }
});

// POST: Add mock plugin (For testing)
plugins.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const db = getDb(c.env.DB);
    await db.insert(pluginsTable)
      .values({
        id: body.id,
        name: body.name,
        description: body.description,
        author: body.author,
        version: body.version,
        active: 0
      }).run();
    return c.json({ success: true, message: 'Plugin ditambahkan' });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// DELETE: Delete Plugin
plugins.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDb(c.env.DB);
    await db.delete(pluginsTable).where(eq(pluginsTable.id, id)).run();
    return c.json({ success: true, message: 'Plugin berhasil dihapus' });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

export default plugins;
