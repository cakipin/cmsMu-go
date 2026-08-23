import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

const themeEditorRouter = new Hono<{ Bindings: Bindings }>();

async function activeTheme(db: D1Database) {
  const row: any = await db.prepare('SELECT id FROM themes WHERE active = 1 LIMIT 1').first();
  return String(row?.id || 'labmu-default');
}

const homeStorageSlug = (themeId: string) => `__theme_home_${themeId}`;

themeEditorRouter.get('/context', async (c) => {
  const themeId = await activeTheme(c.env.DB);
  const setting: any = await c.env.DB.prepare("SELECT value FROM settings WHERE key = 'site_homepage_slug'").first();
  return c.json({ success: true, themeId, homeSlug: setting?.value || 'home', editor: ['labmu-pro', 'newspaper-mu'].includes(themeId) ? themeId : 'universal' });
});

// GET /api/theme-editor/page?slug=about
themeEditorRouter.get('/page', async (c) => {
  const slug = c.req.query('slug');
  if (!slug) return c.json({ error: 'Slug required' }, 400);

  try {
    const themeId = await activeTheme(c.env.DB);
    const storageSlug = slug === 'home' ? homeStorageSlug(themeId) : slug;
    const page: any = await c.env.DB.prepare('SELECT body FROM pages WHERE slug = ?').bind(storageSlug).first();
    if (page) {
      return c.json({ success: true, data: page, themeId });
    } else {
      if (slug === 'home') {
        return c.json({ success: true, data: null, themeId });
      }
      return c.json({ success: true, data: null, themeId }); // Data belum ada
    }
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET /api/theme-editor/pages
themeEditorRouter.get('/pages', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT id, title, slug FROM pages WHERE slug NOT LIKE '__theme_home_%' ORDER BY title ASC").all();
    
    // Get homepage slug from settings
    const settingRow = await c.env.DB.prepare("SELECT value FROM settings WHERE key = 'site_homepage_slug'").first();
    const homeSlug = settingRow ? settingRow.value : 'home';
    
    return c.json({ success: true, data: results || [], homeSlug: homeSlug });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// POST /api/theme-editor/page
themeEditorRouter.post('/page', async (c) => {
  try {
    const body = await c.req.json();
    const { slug, body: content, theme_id: requestedTheme } = body;
    if (!slug) return c.json({ error: 'Slug required' }, 400);
    const themeId = await activeTheme(c.env.DB);
    if (requestedTheme && requestedTheme !== themeId) return c.json({ error: 'Theme aktif telah berubah. Muat ulang editor.' }, 409);
    const storageSlug = slug === 'home' ? homeStorageSlug(themeId) : slug;

    // Cek apakah halaman sudah ada
    const exists = await c.env.DB.prepare('SELECT id FROM pages WHERE slug = ?').bind(storageSlug).first();
    
    // Judul otomatis (Capitalize slug)
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

    if (exists) {
      // Update
      await c.env.DB.prepare(`
        UPDATE pages SET body=?, updated_at=datetime('now') WHERE slug=?
      `).bind(content, storageSlug).run();
    } else {
      // Insert baru
      await c.env.DB.prepare(`
        INSERT INTO pages (title, slug, body, status, created_at, updated_at)
        VALUES (?, ?, ?, 'publish', datetime('now'), datetime('now'))
      `).bind(slug === 'home' ? `Beranda (${themeId})` : title, storageSlug, content).run();
    }
    
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default themeEditorRouter;
