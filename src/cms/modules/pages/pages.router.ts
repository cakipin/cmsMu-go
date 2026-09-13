import { Hono } from 'hono';
import { getDb } from '../../db';
import { pages } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';

type Bindings = {
  DB: D1Database;
};

const pagesRouter = new Hono<{ Bindings: Bindings }>();

// 1. GET ALL (Tabel)
pagesRouter.get('/', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const results = await db.select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      status: pages.status,
      featured_image: pages.featuredImage,
      layout: pages.layout,
      created_at: pages.createdAt,
    }).from(pages).orderBy(desc(pages.createdAt));
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 2. GET SINGLE (Untuk Edit)
pagesRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const db = getDb(c.env.DB);
    const page = await db.select().from(pages).where(eq(pages.id, Number(id))).get();
    return page ? c.json(page) : c.json({ error: 'Page not found' }, 404);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 3. CREATE (Simpan Baru)
pagesRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { title, slug, body: content, excerpt, meta_title, meta_description, status, featured_image, layout } = body;
    
    const db = getDb(c.env.DB);
    await db.insert(pages).values({
      title,
      slug,
      body: content,
      excerpt: excerpt || '',
      metaTitle: meta_title || '',
      metaDescription: meta_description || '',
      status: status || 'publish',
      featuredImage: featured_image || '',
      layout: layout || 'standard',
      createdAt: String(Date.now()),
      updatedAt: String(Date.now()),
    }).run();
    
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
    
    const db = getDb(c.env.DB);
    await db.update(pages).set({
      title: body.title,
      slug: body.slug,
      body: body.body,
      excerpt: body.excerpt || '',
      metaTitle: body.meta_title || '',
      metaDescription: body.meta_description || '',
      status: body.status,
      featuredImage: body.featured_image || '',
      layout: body.layout || 'standard',
      updatedAt: String(Date.now()),
    }).where(eq(pages.id, Number(id))).run();
    
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

    const db = getDb(c.env.DB);
    await db.delete(pages).where(eq(pages.id, Number(id))).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default pagesRouter;