import { Hono } from 'hono';
import type { Bindings } from '../../../types';
import { getDb } from '../../../db';
import { posts as postsTable } from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { getGlobalData, getRenderer, formatPostForFrontend } from '../helpers';

const sourcesRouter = new Hono<{ Bindings: Bindings }>();

// ============================================================
// DIREKTORI SUMBER MEDIA: /sumber & /sumber/:slug
// ============================================================
sourcesRouter.get('/sumber', async (c) => {
  try {
    const db = c.env.DB;
    const { settings, menus, categories, topics, sources: dbSources } = await getGlobalData(db);
    const { Renderer } = await getRenderer(db);

    let sources: any[] = [];
    try {
      const res = await db.prepare(`
        SELECT id, name, slug, base_url, feed_url, feed_type, region_code, trust_score, is_active, description
        FROM media_sources 
        WHERE is_active = 1
        ORDER BY trust_score DESC, name ASC
      `).all();
      sources = res.results || [];
    } catch (dbErr) {
      console.error('Failed to query media_sources:', dbErr);
    }

    const allPosts = await getDb(db).select({
      id: postsTable.id,
      body: postsTable.body,
      author: postsTable.author
    }).from(postsTable).where(eq(postsTable.status, 'publish'));

    for (const src of sources) {
      const domain = (src.base_url || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').toLowerCase();
      const srcName = (src.name || '').toLowerCase();
      const srcSlug = (src.slug || '').toLowerCase();

      let count = 0;
      for (const p of allPosts) {
        const b = (p.body || '').toLowerCase();
        const a = (p.author || '').toLowerCase();
        if (
          (domain && b.includes(domain)) ||
          (srcName && b.includes(srcName)) ||
          (srcName && a.includes(srcName)) ||
          (srcSlug && b.includes(srcSlug))
        ) {
          count++;
        }
      }
      src.postCount = count;
    }

    const context: any = {
      site: settings,
      menus,
      categories,
      topics,
      sources: dbSources || sources,
      data: sources,
      categoryName: 'Jejaring Sumber Berita'
    };

    if (Renderer?.renderSourceList) {
      return c.html(Renderer.renderSourceList(context));
    }
    return c.text('Direktori sumber berita belum didukung pada tema aktif.', 404);
  } catch (e: any) {
    return c.text('Sumber List Error: ' + e.message, 500);
  }
});

sourcesRouter.get('/sumber/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const db = c.env.DB;
    const { settings, menus, categories, topics, sources: dbSources } = await getGlobalData(db);
    const { Renderer } = await getRenderer(db);

    let source: any = null;
    try {
      source = await db.prepare(`
        SELECT id, name, slug, base_url, feed_url, feed_type, region_code, trust_score, is_active, description
        FROM media_sources 
        WHERE slug = ?
      `).bind(slug).first();
    } catch (dbErr) {
      console.error('Failed to query media_source by slug:', dbErr);
    }

    if (!source) {
      try {
        const allSources = await db.prepare("SELECT * FROM media_sources WHERE is_active = 1").all();
        const sourcesList = allSources.results || [];
        const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');

        // 1. Coba cocokkan slug yang dinormalisasi atau exact name
        source = sourcesList.find((s: any) => {
          const norm = (s.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const cleanSrcSlug = (s.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return norm === slug || s.slug === slug || cleanSrcSlug === cleanSlug;
        });

        // 2. Jika belum ketemu, coba cocokkan berdasarkan keyword domain atau singkatan
        if (!source) {
          source = sourcesList.find((s: any) => {
            const sSlug = (s.slug || '').toLowerCase();
            const sName = (s.name || '').toLowerCase();
            const sBase = (s.base_url || '').toLowerCase();

            // Cek jika slug request mengandung slug sumber (misal: 'mdmc-indonesia-bencana' mengandung 'mdmc')
            const slugParts = slug.split('-');
            const firstPart = slugParts[0]; // misal 'mdmc'
            if (firstPart && firstPart.length >= 3 && (sSlug.includes(firstPart) || sName.includes(firstPart) || sBase.includes(firstPart))) {
              return true;
            }

            // Cek jika salah satu kata kunci signifikan cocok
            return slugParts.some((part: string) => part.length >= 4 && (sSlug.includes(part) || sName.includes(part)));
          });
        }
      } catch (e) {
        console.error('Error during fallback source matching:', e);
      }
    }

    if (!source) {
      return c.html(Renderer?.render404 ? Renderer.render404({ site: settings, menus }) : 'Sumber Berita Tidak Ditemukan', 404);
    }

    const domain = (source.base_url || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').toLowerCase();
    const srcName = (source.name || '').toLowerCase();
    const srcSlug = (source.slug || '').toLowerCase();

    const allPublishedPosts = await getDb(db).select()
      .from(postsTable)
      .where(eq(postsTable.status, 'publish'))
      .orderBy(desc(postsTable.createdAt));

    const matchedPosts = allPublishedPosts.filter((p: any) => {
      const b = (p.body || '').toLowerCase();
      const a = (p.author || '').toLowerCase();
      return (
        (domain && b.includes(domain)) ||
        (srcName && b.includes(srcName)) ||
        (srcName && a.includes(srcName)) ||
        (srcSlug && b.includes(srcSlug))
      );
    }).map(formatPostForFrontend);

    const context: any = {
      site: settings,
      menus,
      categories,
      topics,
      sources: dbSources || [],
      data: matchedPosts,
      pageData: { source },
      categoryName: `Berita dari ${source.name}`
    };

    if (Renderer?.renderSourceDetail) {
      return c.html(Renderer.renderSourceDetail(context));
    }
    if (Renderer?.renderCategory) {
      return c.html(Renderer.renderCategory(context));
    }
    return c.text('Arsip sumber berita belum didukung pada tema aktif.', 404);
  } catch (e: any) {
    return c.text('Sumber Detail Error: ' + e.message, 500);
  }
});

export default sourcesRouter;
