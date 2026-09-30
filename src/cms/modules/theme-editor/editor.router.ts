import { Hono } from 'hono';
import { getDb } from '../../db';
import { pages, settings } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';

type Bindings = {
  DB: D1Database;
};

const themeEditorRouter = new Hono<{ Bindings: Bindings }>();

// GET /api/theme-editor/page?slug=about
themeEditorRouter.get('/page', async (c) => {
  const slug = c.req.query('slug');
  if (!slug) return c.json({ error: 'Slug required' }, 400);

  try {
    const db = getDb(c.env.DB);
    const page = await db.select({ body: pages.body }).from(pages).where(eq(pages.slug, slug)).get();
    if (page) {
      return c.json({ success: true, data: page });
    } else {
      if (slug === 'home') {
        const defaultHomePuck = {
          content: [
            { type: "SiteHeader", props: { id: "SiteHeader-1" } },
            { type: "Hero", props: { id: "Hero-1" } },
            { type: "Partners", props: { id: "Partners-1" } },
            { type: "FeatureGrid", props: { id: "FeatureGrid-1" } },
            { type: "Testimonial", props: { id: "Testimonial-1" } },
            { type: "RecentPosts", props: { id: "RecentPosts-1" } },
            { type: "CallToAction", props: { id: "CallToAction-1" } },
            { type: "SiteFooter", props: { id: "SiteFooter-1" } }
          ],
          root: { props: { title: "Beranda Utama" } },
          zones: {}
        };
        return c.json({ success: true, data: { body: JSON.stringify(defaultHomePuck) } });
      }
      return c.json({ success: true, data: null });
    }
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET /api/theme-editor/pages
themeEditorRouter.get('/pages', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const results = await db.select({ id: pages.id, title: pages.title, slug: pages.slug }).from(pages).orderBy(asc(pages.title));
    
    const settingRow = await db.select({ value: settings.value }).from(settings).where(eq(settings.key, 'site_homepage_slug')).get();
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
    const { slug, body: content } = body;
    if (!slug) return c.json({ error: 'Slug required' }, 400);

    const db = getDb(c.env.DB);
    const exists = await db.select({ id: pages.id }).from(pages).where(eq(pages.slug, slug)).get();
    
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    const now = new Date().toISOString();

    if (exists) {
      await db.update(pages).set({
        body: content,
        status: 'publish',
        updatedAt: now
      }).where(eq(pages.slug, slug)).run();
    } else {
      await db.insert(pages).values({
        title,
        slug,
        body: content,
        excerpt: '',
        metaTitle: title,
        metaDescription: '',
        status: 'publish',
        layout: 'standard',
        createdAt: now,
        updatedAt: now
      }).run();
    }
    
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default themeEditorRouter;
