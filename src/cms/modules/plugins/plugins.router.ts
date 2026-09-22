import { Hono } from 'hono';
import { getDb } from '../../db';
import { plugins as pluginsTable } from '../../db/schema';
import { eq } from 'drizzle-orm';

const plugins = new Hono<{ Bindings: any }>();

const defaultPlugins = [
  {
    id: 'aggregator',
    name: 'Sindikasi Berita (Aggregator)',
    description: 'Menarik berita otomatis dari portal media wilayah, daerah, dan institusi Muhammadiyah melalui WP REST API, RSS Feed, dan Web Scraper.',
    author: 'CMSMu Core Team',
    version: '2.1.0',
    active: 1
  },
  {
    id: 'newsroom',
    name: 'Meja Kurasi (Newsroom Curation)',
    description: 'Antrean meja kurasi redaksi untuk meninjau, menyunting, dan menerbitkan artikel berita dari sindikasi media ke portal utama.',
    author: 'CMSMu Core Team',
    version: '1.8.0',
    active: 1
  },
  {
    id: 'sso-muhammadiyah',
    name: 'Single Sign-On (Muhammadiyah ID SSO)',
    description: 'Integrasi autentikasi identitas digital terpadu warga persyarikatan berbasis OAuth 2.0 Muhammadiyah ID.',
    author: 'Majelis Pustaka dan Informasi',
    version: '1.2.0',
    active: 1
  },
  {
    id: 'emagazine',
    name: 'e-Magazine Digital Reader',
    description: 'Modul publikasi dan pembaca majalah/dokumen PDF interaktif berbasis flipbook digital dengan proteksi konten subscriber.',
    author: 'CMSMu Core Team',
    version: '1.5.0',
    active: 1
  },
  {
    id: 'ota',
    name: 'Over-The-Air Update Engine (OTA)',
    description: 'Modul distribusi pembaruan sistem, manifest rilis, dan push update ke seluruh instance pengguna CMSMu tanpa downtime.',
    author: 'CMSMu Core Team',
    version: '1.0.0',
    active: 1
  }
];

// GET: List Plugins (with auto-seeding default plugins if empty)
plugins.get('/', async (c) => {
  try {
    const db = getDb(c.env.DB);
    let results = await db.select().from(pluginsTable);
    
    // Auto seed default plugins jika masih kosong
    if (!results || results.length === 0) {
      for (const p of defaultPlugins) {
        try {
          await db.insert(pluginsTable).values(p).run();
        } catch (seedErr) {}
      }
      results = await db.select().from(pluginsTable);
    }

    return c.json({ success: true, data: results || [] });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// POST: Toggle Plugin Status (Activate/Deactivate)
plugins.post('/toggle', async (c) => {
  try {
    const body = await c.req.json();
    const targetId = body.plugin_id || body.pluginId || body.id;
    const active = body.active ? 1 : 0;

    if (!targetId) return c.json({ success: false, message: 'ID Plugin kosong' }, 400);

    const db = getDb(c.env.DB);
    const result = await db.update(pluginsTable)
      .set({ active })
      .where(eq(pluginsTable.id, targetId))
      .run();

    if (result.success) {
      return c.json({ success: true, message: `Plugin ${active ? 'berhasil diaktifkan' : 'berhasil dinonaktifkan'}!` });
    }
    
    return c.json({ success: false, message: 'Gagal mengupdate status plugin' }, 400);
  } catch (e: any) {
    console.error(e);
    return c.json({ success: false, error: e.message }, 500);
  }
});

// POST: Toggle with param :id
plugins.post('/toggle/:id', async (c) => {
  try {
    const targetId = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const active = body.active !== undefined ? (body.active ? 1 : 0) : 1;

    const db = getDb(c.env.DB);
    const result = await db.update(pluginsTable)
      .set({ active })
      .where(eq(pluginsTable.id, targetId))
      .run();

    if (result.success) {
      return c.json({ success: true, message: `Plugin ${active ? 'berhasil diaktifkan' : 'berhasil dinonaktifkan'}!` });
    }
    return c.json({ success: false, message: 'Gagal mengupdate status plugin' }, 400);
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// POST: Add / Register new plugin
plugins.post('/', async (c) => {
  try {
    const body = await c.req.json();
    if (!body.id || !body.name) {
      return c.json({ success: false, error: 'ID dan Nama Plugin wajib diisi' }, 400);
    }
    const db = getDb(c.env.DB);
    await db.insert(pluginsTable)
      .values({
        id: String(body.id).toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
        name: body.name,
        description: body.description || '',
        author: body.author || 'CMSMu Contributor',
        version: body.version || '1.0.0',
        active: body.active ? 1 : 0
      }).run();
    return c.json({ success: true, message: 'Plugin baru berhasil didaftarkan' });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// DELETE: Delete Plugin
plugins.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    if (id === 'ota') {
      return c.json({ 
        success: false, 
        message: 'Plugin Over-The-Air Update (OTA) adalah komponen inti sistem CMSMu dan tidak dapat dihapus.' 
      }, 403);
    }
    const db = getDb(c.env.DB);
    await db.delete(pluginsTable).where(eq(pluginsTable.id, id)).run();
    return c.json({ success: true, message: 'Plugin berhasil dihapus dari sistem' });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

export default plugins;
