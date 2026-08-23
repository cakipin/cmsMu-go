import { Hono } from 'hono';
import { boundedText, cleanSlug, sanitizeHtml } from '../../core/security';

type Bindings = {
  DB: D1Database;
};

const pagesRouter = new Hono<{ Bindings: Bindings }>();

// 1. GET ALL (Tabel)
pagesRouter.get('/', async (c) => {
  try {
    // [UPDATE] Ambil featured_image juga jika nanti mau ditampilkan di tabel
    const { results } = await c.env.DB.prepare(
      "SELECT id, title, slug, status, featured_image, layout, created_at FROM pages ORDER BY created_at DESC"
    ).all();
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 2. GET SINGLE (Untuk Edit)
pagesRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const page = await c.env.DB.prepare('SELECT * FROM pages WHERE id = ?').bind(id).first();
    return page ? c.json(page) : c.json({ error: 'Page not found' }, 404);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 3. CREATE (Simpan Baru)
pagesRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    // [UPDATE] Ambil featured_image dari body
    const { title, slug, body: content, excerpt, meta_title, meta_description, status, featured_image, layout } = body;

    await c.env.DB.prepare(`
      INSERT INTO pages (title, slug, body, excerpt, meta_title, meta_description, status, featured_image, layout, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(boundedText(title, 250), cleanSlug(slug || title), sanitizeHtml(content), boundedText(excerpt, 500), boundedText(meta_title, 70), boundedText(meta_description, 180), status === 'draft' ? 'draft' : 'publish', boundedText(featured_image, 2048), boundedText(layout || 'standard', 50)).run();

    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 4. UPDATE (Simpan Perubahan)
pagesRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const body = await c.req.json();
    // [UPDATE] Update featured_image
    await c.env.DB.prepare(`
      UPDATE pages SET title=?, slug=?, body=?, excerpt=?, meta_title=?, meta_description=?, status=?, featured_image=?, layout=?, updated_at=datetime('now')
      WHERE id=?
    `).bind(boundedText(body.title, 250), cleanSlug(body.slug || body.title), sanitizeHtml(body.body), boundedText(body.excerpt, 500), boundedText(body.meta_title, 70), boundedText(body.meta_description, 180), body.status === 'draft' ? 'draft' : 'publish', boundedText(body.featured_image, 2048), boundedText(body.layout || 'standard', 50), id).run();

    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 5. DELETE
pagesRouter.delete('/', async (c) => {
  try {
    let id;
    try {
        const body = await c.req.json();
        id = body.id;
    } catch(e) {
        id = c.req.query('id');
    }
    if (!id) return c.json({ error: 'ID required' }, 400);

    await c.env.DB.prepare('DELETE FROM pages WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default pagesRouter;
