import { Hono } from 'hono';
import { getDb, pages } from '@cmsmu/db';
import { eq, desc } from 'drizzle-orm';
import { requireAuth, requireRole, type ApiEnv } from '../middleware/auth.middleware';

const pagesRouter = new Hono<ApiEnv>();

// 1. GET ALL PAGES (Public / Filter by status)
pagesRouter.get('/', async (c) => {
  try {
    const statusQuery = c.req.query('status');
    const db = getDb(c.env.DB);

    let query = db.select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      excerpt: pages.excerpt,
      meta_title: pages.metaTitle,
      meta_description: pages.metaDescription,
      status: pages.status,
      featured_image: pages.featuredImage,
      layout: pages.layout,
      author_id: pages.authorId,
      created_at: pages.createdAt,
      updated_at: pages.updatedAt
    })
    .from(pages);

    const results = statusQuery 
      ? await query.where(eq(pages.status, statusQuery)).orderBy(desc(pages.createdAt))
      : await query.orderBy(desc(pages.createdAt));

    return c.json(results || []);
  } catch (e: any) {
    return c.json({ error: 'Gagal mengambil data halaman: ' + e.message }, 500);
  }
});

// 2. GET SINGLE PAGE BY SLUG OR ID
pagesRouter.get('/:slugOrId', async (c) => {
  try {
    const slugOrId = c.req.param('slugOrId');
    const db = getDb(c.env.DB);
    const numId = parseInt(slugOrId, 10);

    const page = !isNaN(numId)
      ? await db.select().from(pages).where(eq(pages.id, numId)).get()
      : await db.select().from(pages).where(eq(pages.slug, slugOrId)).get();

    if (!page) {
      return c.json({ error: 'Halaman tidak ditemukan' }, 404);
    }

    return c.json({
      ...page,
      meta_title: page.metaTitle,
      meta_description: page.metaDescription,
      featured_image: page.featuredImage,
      author_id: page.authorId,
      created_at: page.createdAt,
      updated_at: page.updatedAt
    });
  } catch (e: any) {
    return c.json({ error: 'Gagal mengambil detail halaman: ' + e.message }, 500);
  }
});

// 3. CREATE NEW PAGE (Protected: Admin & Editor)
pagesRouter.post('/', requireAuth, requireRole(['admin', 'editor']), async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body || !body.title || !body.slug) {
      return c.json({ error: 'Judul dan slug halaman wajib diisi' }, 400);
    }

    const now = String(Date.now());
    const db = getDb(c.env.DB);

    const inserted = await db.insert(pages).values({
      title: String(body.title).trim(),
      slug: String(body.slug).trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      body: body.body || '',
      excerpt: body.excerpt || '',
      metaTitle: body.meta_title || body.metaTitle || body.title,
      metaDescription: body.meta_description || body.metaDescription || '',
      status: body.status || 'publish',
      featuredImage: body.featured_image || body.featuredImage || '',
      layout: body.layout || 'standard',
      authorId: body.author_id || (c.get('userId') ? Number(c.get('userId')) : null),
      createdAt: now,
      updatedAt: now
    }).returning().get();

    return c.json({ success: true, message: 'Halaman berhasil dibuat', page: inserted }, 201);
  } catch (e: any) {
    return c.json({ error: 'Gagal membuat halaman: ' + e.message }, 500);
  }
});

// 4. UPDATE PAGE (Protected: Admin & Editor)
pagesRouter.put('/:id', requireAuth, requireRole(['admin', 'editor']), async (c) => {
  try {
    const id = parseInt(c.req.param('id') || '', 10);
    if (isNaN(id)) return c.json({ error: 'ID halaman tidak valid' }, 400);

    const body = await c.req.json().catch(() => null);
    if (!body) return c.json({ error: 'Payload pembaruan kosong' }, 400);

    const db = getDb(c.env.DB);
    const existing = await db.select().from(pages).where(eq(pages.id, id)).get();
    if (!existing) return c.json({ error: 'Halaman tidak ditemukan' }, 404);

    const now = String(Date.now());

    await db.update(pages).set({
      title: body.title !== undefined ? String(body.title).trim() : existing.title,
      slug: body.slug !== undefined ? String(body.slug).trim().toLowerCase() : existing.slug,
      body: body.body !== undefined ? body.body : existing.body,
      excerpt: body.excerpt !== undefined ? body.excerpt : existing.excerpt,
      metaTitle: body.meta_title !== undefined ? body.meta_title : (body.metaTitle !== undefined ? body.metaTitle : existing.metaTitle),
      metaDescription: body.meta_description !== undefined ? body.meta_description : (body.metaDescription !== undefined ? body.metaDescription : existing.metaDescription),
      status: body.status !== undefined ? body.status : existing.status,
      featuredImage: body.featured_image !== undefined ? body.featured_image : (body.featuredImage !== undefined ? body.featuredImage : existing.featuredImage),
      layout: body.layout !== undefined ? body.layout : existing.layout,
      updatedAt: now
    }).where(eq(pages.id, id)).run();

    return c.json({ success: true, message: 'Halaman berhasil diperbarui' });
  } catch (e: any) {
    return c.json({ error: 'Gagal memperbarui halaman: ' + e.message }, 500);
  }
});

// 5. DELETE PAGE (Protected: Admin Only)
pagesRouter.delete('/:id', requireAuth, requireRole(['admin']), async (c) => {
  try {
    const id = parseInt(c.req.param('id') || '', 10);
    if (isNaN(id)) return c.json({ error: 'ID halaman tidak valid' }, 400);

    const db = getDb(c.env.DB);
    const existing = await db.select().from(pages).where(eq(pages.id, id)).get();
    if (!existing) return c.json({ error: 'Halaman tidak ditemukan' }, 404);

    await db.delete(pages).where(eq(pages.id, id)).run();
    return c.json({ success: true, message: 'Halaman berhasil dihapus' });
  } catch (e: any) {
    return c.json({ error: 'Gagal menghapus halaman: ' + e.message }, 500);
  }
});

export default pagesRouter;
