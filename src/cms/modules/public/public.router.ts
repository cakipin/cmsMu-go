import { Hono } from 'hono';
import type { Bindings } from '../../types';
import { getDb } from '../../db';
import { posts as postsTable, pages as pagesTable } from '../../db/schema';
import { eq, desc, asc, and, or, like, sql } from 'drizzle-orm';
import { translateTextWithAI } from '../../services/ai-translate';
import { getGlobalData, getRenderer, formatPostForFrontend } from './helpers';
import { isPuckJson, renderPuckHtml } from '../theme-builder';

// Import Modular Sub-Routers
import seoRouter from './routes/seo.router';
import profileRouter, { handleUserProfile } from './routes/profile.router';
import sourcesRouter from './routes/sources.router';
import emagazinePublicRouter from './routes/emagazine.router';

const publicRouter = new Hono<{ Bindings: Bindings }>();

// Mount Sub-Routers
publicRouter.route('/', seoRouter);
publicRouter.route('/', profileRouter);
publicRouter.route('/', sourcesRouter);
publicRouter.route('/', emagazinePublicRouter);

// ============================================================
// 1. ROUTE HOMEPAGE (Multi-Language & Pagination)
// ============================================================
async function renderHomePage(c: any, lang?: 'en' | 'ar') {
  try {
    const { settings, menus, categories, topics, sources } = await getGlobalData(c.env.DB);
    const { Renderer } = await getRenderer(c.env.DB);

    const db = getDb(c.env.DB);
    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const limit = 12; // 12 artikel per halaman reguler

    // Hitung total seluruh artikel yang publish
    const totalRow: any = await db.select({ total: sql<number>`count(*)` })
      .from(postsTable)
      .where(eq(postsTable.status, 'publish'))
      .get();
    const totalItems = Number(totalRow?.total || 0);

    // Ambil 9 artikel teratas untuk Hero 3-Kolom Editorial
    const heroPosts = await db.select()
      .from(postsTable)
      .where(eq(postsTable.status, 'publish'))
      .orderBy(desc(postsTable.createdAt))
      .limit(9);

    // Untuk grid reguler:
    // Pada halaman 1: lewati 9 artikel hero, ambil 12 artikel berikutnya (offset 9, limit 12)
    // Pada halaman 2+: ambil 12 artikel sesuai halaman (offset 9 + (page - 2) * 12)
    const gridOffset = page === 1 ? 9 : (9 + (page - 2) * limit);
    const regularPostsRaw = await db.select()
      .from(postsTable)
      .where(eq(postsTable.status, 'publish'))
      .orderBy(desc(postsTable.createdAt))
      .limit(limit)
      .offset(gridOffset);

    // Total halaman dihitung dari sisa artikel setelah 9 artikel hero (atau minimal 1)
    const remainingAfterHero = Math.max(0, totalItems - 9);
    const totalPages = Math.max(1, 1 + Math.ceil(remainingAfterHero / limit));

    const mapList = (list: any[]) => (list || []).map(formatPostForFrontend);
    let structuredData: Record<string, any> = {
      heroPosts: mapList(heroPosts),
      regularPosts: mapList(regularPostsRaw),
      latest: mapList([...heroPosts, ...regularPostsRaw]),
    };

    // ─── THEME DATA HOOK ────────────────────────────────────────────────
    // Core tidak tahu & tidak peduli data apa yang tema butuhkan.
    // Jika tema aktif mengimplementasikan loadHomeData(), panggil dan merge.
    // Tema yang tidak mengimplementasikannya tetap mendapat data generic di atas.
    if (Renderer && typeof Renderer.loadHomeData === 'function') {
      try {
        const themeData = await Renderer.loadHomeData(c.env.DB, settings, structuredData);
        if (themeData && typeof themeData === 'object') {
          structuredData = { ...structuredData, ...themeData };
        }
      } catch (hookErr) {
        console.error('[Core] theme.loadHomeData() hook error:', hookErr);
        // Graceful fallback: lanjut dengan generic data, tidak crash
      }
    }
    // ────────────────────────────────────────────────────────────────────

    if (lang === 'en' || lang === 'ar') {
      if (structuredData.heroPosts && structuredData.heroPosts.length > 0) {
        await Promise.all(structuredData.heroPosts.slice(0, 5).map(async (item: any) => {
          if (item && item.title) {
            item.title = await translateTextWithAI(item.title, lang, `trans:${lang}:${item.slug}:title`, c.env, false);
          }
        }));
      }
    }

    const homeSlug = settings.site_homepage_slug || 'home';
    const customHome: any = await db.select().from(pagesTable).where(eq(pagesTable.slug, homeSlug)).get();

    if (customHome && customHome.body) {
      try {
        await db.update(pagesTable).set({ views: sql`${pagesTable.views} + 1` }).where(eq(pagesTable.id, customHome.id));
      } catch (err) {}

      // Jika halaman berformat visual Puck
      if (isPuckJson(customHome.body)) {
        let latestPosts: any[] = [];
        try {
          latestPosts = await db.select().from(postsTable).where(eq(postsTable.status, 'publish')).orderBy(desc(postsTable.createdAt)).limit(9).all();
        } catch (e) {}

        return c.html(renderPuckHtml({
          site: settings,
          menus,
          page: customHome,
          canonical: new URL(c.req.url).origin + (lang ? `/${lang}` : '/'),
          latestPosts: (latestPosts || []).map(formatPostForFrontend)
        }));
      }

      // Jika administrator memilih halaman statis khusus non-Puck selain '__default__'
      if (homeSlug !== '__default__') {
        const pageContext = {
          site: settings,
          menus: menus,
          categories: categories,
          topics: topics,
          sources: sources,
          data: formatPostForFrontend(customHome),
          canonical: new URL(c.req.url).origin + (lang ? `/${lang}` : '/'),
          ogImage: customHome.featured_image || new URL(c.req.url).origin + '/default-og.jpg',
        };
        if (Renderer && typeof Renderer.renderPage === 'function') {
          return c.html(Renderer.renderPage(pageContext));
        }
      }
    }

    const pagination = {
      currentPage: page,
      totalPages,
      totalItems,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      baseUrl: '/'
    };

    const context = {
      site: settings,
      menus: menus,
      categories: categories,
      topics: topics,
      sources: sources,
      data: structuredData,
      pagination: pagination,
      pageData: customHome || null,
      canonical: new URL(c.req.url).origin + (lang ? `/${lang}` : '/'),
      ogImage: new URL(c.req.url).origin + '/default-og.jpg',
    };
    return c.html(Renderer.renderHome(context));
  } catch (e: any) {
    return c.text('Error: ' + e.message, 500);
  }
}

publicRouter.get('/', async (c) => renderHomePage(c));
publicRouter.get('/en', async (c) => renderHomePage(c, 'en'));
publicRouter.get('/ar', async (c) => renderHomePage(c, 'ar'));

// ============================================================
// 2. ROUTE BERITA & KEGIATAN
// ============================================================
publicRouter.get('/berita', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = 12;
  const offset = (page - 1) * limit;
  try {
    const db = c.env.DB;
    const { settings, menus } = await getGlobalData(db);
    const { Renderer } = await getRenderer(db);
    const totalRow: any = await getDb(db).select({ total: sql<number>`count(*)` }).from(postsTable).where(eq(postsTable.status, 'publish')).get();
    const totalItems = totalRow?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const posts = await getDb(db).select().from(postsTable).where(eq(postsTable.status, 'publish')).orderBy(desc(postsTable.createdAt)).limit(limit).offset(offset);
    const context: any = {
      site: settings, menus,
      data: (posts || []).map(formatPostForFrontend),
      categoryName: 'Berita & Artikel',
      pagination: { currentPage: page, totalPages, totalItems, hasNext: page < totalPages, hasPrev: page > 1, baseUrl: '/berita' }
    };
    if (Renderer?.renderCategory) return c.html(Renderer.renderCategory(context));
    return c.html(Renderer.renderHome(context));
  } catch (e: any) {
    return c.text('Berita Error: ' + e.message, 500);
  }
});

publicRouter.get('/kegiatan', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = 10;
  const offset = (page - 1) * limit;
  try {
    const db = c.env.DB;
    const { settings, menus } = await getGlobalData(db);
    const { Renderer } = await getRenderer(db);
    const totalRow: any = await getDb(db).select({ total: sql<number>`count(*)` }).from(postsTable)
      .where(and(eq(postsTable.status, 'publish'), or(eq(postsTable.category, 'kegiatan'), eq(postsTable.type, 'kegiatan')))).get();
    const totalItems = totalRow?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const posts = await getDb(db).select().from(postsTable)
      .where(and(eq(postsTable.status, 'publish'), or(eq(postsTable.category, 'kegiatan'), eq(postsTable.type, 'kegiatan'))))
      .orderBy(desc(postsTable.createdAt)).limit(limit).offset(offset);
    const context: any = {
      site: settings, menus,
      data: (posts || []).map(formatPostForFrontend),
      categoryName: 'Kegiatan Terdekat',
      pagination: { currentPage: page, totalPages, totalItems, hasNext: page < totalPages, hasPrev: page > 1 }
    };
    if (Renderer?.renderKegiatan) return c.html(Renderer.renderKegiatan(context));
    if (Renderer?.renderCategory) return c.html(Renderer.renderCategory(context));
    return c.html(Renderer.renderHome(context));
  } catch (e: any) {
    return c.text('Kegiatan Error: ' + e.message, 500);
  }
});

// ============================================================
// 3. ROUTE PENCARIAN DENGAN PAGINATION
// ============================================================
publicRouter.get('/search', async (c) => {
  const query = c.req.query('q') || '';
  const page = parseInt(c.req.query('page') || '1');
  const limit = 10;
  const offset = (page - 1) * limit;
  const cleanQuery = query.toLowerCase().trim();

  try {
    const db = c.env.DB;
    const { settings, menus } = await getGlobalData(db);
    const { Renderer } = await getRenderer(db);

    if (!cleanQuery) {
      const context: any = {
        site: settings,
        menus: menus,
        data: [],
        query: '',
        pagination: {
          currentPage: 1, totalPages: 0, totalItems: 0,
          hasNext: false, hasPrev: false, baseUrl: '/search'
        }
      };
      if (Renderer && typeof Renderer.renderSearch === 'function') {
        return c.html(Renderer.renderSearch(context));
      }
      context.categoryName = 'Pencarian Artikel';
      if (Renderer && typeof Renderer.renderCategory === 'function') {
        return c.html(Renderer.renderCategory(context));
      }
      return c.html(Renderer.renderHome(context));
    }

    const countSql = `
      SELECT count(*) as total FROM posts 
      WHERE status = 'publish' 
      AND (
        lower(title) LIKE ? 
        OR lower(body) LIKE ? 
        OR lower(tags) LIKE ?
      )
    `;
    const bindVal = `%${cleanQuery}%`;
    const totalRow: any = await db.prepare(countSql).bind(bindVal, bindVal, bindVal).first();
    const totalItems = totalRow?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const sqlStr = `
      SELECT * FROM posts 
      WHERE status = 'publish' 
      AND (
        lower(title) LIKE ? 
        OR lower(body) LIKE ? 
        OR lower(tags) LIKE ?
      )
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const { results: posts } = await db.prepare(sqlStr).bind(bindVal, bindVal, bindVal, limit, offset).all();

    const context: any = {
      site: settings,
      menus: menus,
      data: (posts || []).map(formatPostForFrontend),
      query: query,
      pagination: {
        currentPage: page, totalPages, totalItems,
        hasNext: page < totalPages, hasPrev: page > 1,
        baseUrl: `/search?q=${encodeURIComponent(query)}`
      }
    };

    if (Renderer && typeof Renderer.renderSearch === 'function') {
      return c.html(Renderer.renderSearch(context));
    }

    context.categoryName = `Pencarian: "${query}"`;
    if (Renderer && typeof Renderer.renderCategory === 'function') {
      return c.html(Renderer.renderCategory(context));
    }
    return c.html(Renderer.renderHome(context));
  } catch (e: any) {
    return c.text("Search Error: " + e.message, 500);
  }
});

// ============================================================
// 4. ROUTE TAGAR DENGAN PAGINATION (/tag/:slug)
// ============================================================
publicRouter.get('/tag/:slug', async (c) => {
  const rawSlug = c.req.param('slug') || '';
  const cleanSlug = decodeURIComponent(rawSlug).toLowerCase().trim().replace(/^#/, '');
  const page = parseInt(c.req.query('page') || '1');
  const limit = 10;
  const offset = (page - 1) * limit;

  if (!cleanSlug) return c.redirect('/');

  try {
    const db = c.env.DB;
    const { settings, menus } = await getGlobalData(db);
    const { Renderer } = await getRenderer(db);

    const tagWithSpaces = cleanSlug.replace(/-/g, ' ');
    const countSql = `
      SELECT count(*) as total FROM posts 
      WHERE status = 'publish' 
      AND (
        lower(tags) LIKE ? 
        OR lower(tags) LIKE ?
      )
    `;
    const bindPattern1 = `%${cleanSlug}%`;
    const bindPattern2 = `%${tagWithSpaces}%`;
    const totalRow: any = await db.prepare(countSql).bind(bindPattern1, bindPattern2).first();
    const totalItems = totalRow?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const sqlStr = `
      SELECT * FROM posts 
      WHERE status = 'publish' 
      AND (
        lower(tags) LIKE ? 
        OR lower(tags) LIKE ?
      )
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const { results: posts } = await db.prepare(sqlStr).bind(bindPattern1, bindPattern2, limit, offset).all();
    const displayTagName = tagWithSpaces.replace(/\b\w/g, (l: string) => l.toUpperCase());

    const context: any = {
      site: settings,
      menus: menus,
      data: (posts || []).map(formatPostForFrontend),
      tag: displayTagName,
      slug: cleanSlug,
      categoryName: `Tagar #${displayTagName}`,
      pagination: {
        currentPage: page, totalPages, totalItems,
        hasNext: page < totalPages, hasPrev: page > 1,
        baseUrl: `/tag/${encodeURIComponent(cleanSlug)}`
      }
    };

    if (Renderer && typeof Renderer.renderTag === 'function') {
      return c.html(Renderer.renderTag(context));
    }
    if (Renderer && typeof Renderer.renderCategory === 'function') {
      return c.html(Renderer.renderCategory(context));
    }
    return c.html(Renderer.renderHome(context));
  } catch (e: any) {
    return c.text("Tag Error: " + e.message, 500);
  }
});

// ============================================================
// 5. ROUTE /INFO (ARTIKEL DENGAN PAGINATION)
// ============================================================
publicRouter.get('/info', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = 12;
  const offset = (page - 1) * limit;

  try {
    const db = c.env.DB;
    const { settings, menus } = await getGlobalData(db);
    const { Renderer } = await getRenderer(db);

    const totalRow: any = await getDb(db).select({ total: sql<number>`count(*)` }).from(postsTable)
      .where(and(eq(postsTable.status, 'publish'), or(eq(postsTable.category, 'kegiatan'), eq(postsTable.type, 'kegiatan')))).get();
    const totalItems = totalRow?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const posts = await getDb(db).select().from(postsTable)
      .where(and(eq(postsTable.status, 'publish'), or(eq(postsTable.category, 'kegiatan'), eq(postsTable.type, 'kegiatan'))))
      .orderBy(desc(postsTable.createdAt)).limit(limit).offset(offset);

    const context: any = {
      site: settings, menus,
      data: (posts || []).map(formatPostForFrontend),
      categoryName: 'Informasi & Artikel',
      pagination: {
        currentPage: page, totalPages, totalItems,
        hasNext: page < totalPages, hasPrev: page > 1,
        baseUrl: '/info'
      }
    };

    if (Renderer && typeof Renderer.renderCategory === 'function') {
      return c.html(Renderer.renderCategory(context));
    }
    return c.html(Renderer.renderHome(context));
  } catch (e: any) {
    return c.text("Info Error: " + e.message, 500);
  }
});

// ============================================================
// 6. ROUTE SINGLE (Kategori, Post, Page)
// ============================================================
async function renderSinglePage(c: any, rawSlug: string, lang?: 'en' | 'ar') {
  // Tangani profil pengguna (@username atau @email)
  if (rawSlug && rawSlug.startsWith('@')) {
    return handleUserProfile(c, rawSlug);
  }

  const slug = (rawSlug || '').toLowerCase();

  if (slug.includes('.') || slug === 'favicon.ico') return c.notFound();

  try {
    const { settings, menus, categories, topics, sources } = await getGlobalData(c.env.DB);
    const { Renderer } = await getRenderer(c.env.DB);
    const db = c.env.DB;

    // A. Cek Kategori
    const slugSpace = slug.replace(/-/g, ' ');
    const page = parseInt(c.req.query('page') || '1');
    const limit = 12;
    const offset = (page - 1) * limit;

    const countSql = `SELECT count(*) as total FROM posts WHERE (lower(category) = ? OR lower(category) = ?) AND status='publish'`;
    const countRow: any = await db.prepare(countSql).bind(slug, slugSpace).first();
    const totalItems = countRow?.total || 0;

    if (totalItems > 0) {
      const totalPages = Math.ceil(totalItems / limit);
      const catQuery = `SELECT * FROM posts WHERE (lower(category) = ? OR lower(category) = ?) AND status='publish' ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      const { results: catPosts } = await db.prepare(catQuery).bind(slug, slugSpace, limit, offset).all();

      const realCategoryName = catPosts?.[0]?.category || slugSpace;
      let title = realCategoryName.replace(/\b\w/g, (l: string) => l.toUpperCase());
      if (lang === 'en' || lang === 'ar') {
        title = await translateTextWithAI(title, lang, `trans:${lang}:cat:${slug}`, c.env, false);
      }
      const context = {
        site: settings,
        menus,
        categories,
        topics,
        sources,
        data: (catPosts || []).map(formatPostForFrontend),
        categoryName: title,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          baseUrl: `/${slug}`
        }
      };
      if (Renderer && typeof Renderer.renderCategory === 'function') {
        return c.html(Renderer.renderCategory(context));
      }
      return c.html(Renderer.renderHome(context));
    }

    // A2. Cek Kategori Standar di Menu Dinamis atau Daftar Kategori DB (Zero Hardcode Policy)
    const normalizedMenus = Array.isArray(menus) ? menus : [];
    const matchedMenu = normalizedMenus.find((m: any) => {
      const url = (m.url || '').replace(/^\/+|\/+$/g, '').toLowerCase();
      return url === slug;
    });

    const matchedCategory = (categories || []).find((c: string) => {
      const cSlug = c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return cSlug === slug;
    });

    if (matchedMenu || matchedCategory) {
      const title = matchedMenu ? matchedMenu.label : matchedCategory;
      const context = { 
        site: settings, 
        menus, 
        categories,
        topics,
        sources,
        data: [], 
        categoryName: title 
      };
      if (Renderer && typeof Renderer.renderCategory === 'function') {
        return c.html(Renderer.renderCategory(context));
      }
      return c.html(Renderer.renderHome(context));
    }

    // B. Cek Post & Page
    const orm = getDb(c.env.DB);
    let content: any = await orm.select().from(postsTable).where(and(eq(postsTable.slug, slug), eq(postsTable.status, 'publish'))).get();
    if (content) content = formatPostForFrontend(content);
    let type = 'post';
    if (!content) {
      content = await orm.select().from(pagesTable).where(and(eq(pagesTable.slug, slug), eq(pagesTable.status, 'publish'))).get();
      if (!content && slug === 'home') {
        content = await orm.select().from(pagesTable).where(eq(pagesTable.slug, 'home')).get();
      }
      if (content) content = formatPostForFrontend(content);
      type = 'page';
    }

    if (content) {
      if (type === 'post') {
        try {
          await orm.update(postsTable).set({ views: sql`views + 1` }).where(eq(postsTable.id, content.id)).run();
        } catch (err) {}
      }

      let relatedPosts: any[] = [];
      if (type === 'post' && content.category) {
        relatedPosts = await orm.select({
          title: postsTable.title,
          slug: postsTable.slug,
          featured_image: postsTable.featuredImage,
          category: postsTable.category,
          created_at: postsTable.createdAt
        })
        .from(postsTable)
        .where(and(eq(postsTable.category, content.category), eq(postsTable.status, 'publish'), sql`id != ${content.id}`))
        .orderBy(desc(postsTable.createdAt))
        .limit(6);
      }

      const contentType = type === 'page' ? 'page' : (content.type || 'post');
      content.type = contentType;

      if (lang === 'en' || lang === 'ar') {
        const titleKey = `trans:${lang}:${content.slug}:title`;
        const bodyKey = `trans:${lang}:${content.slug}:body`;

        const [translatedTitle, translatedBody] = await Promise.all([
          translateTextWithAI(content.title, lang, titleKey, c.env, false),
          translateTextWithAI(content.body, lang, bodyKey, c.env, true)
        ]);

        content.title = translatedTitle;
        content.body = translatedBody;
      }

      const origin = new URL(c.req.url).origin;
      const canonicalUrl = `${origin}/${lang ? lang + '/' : ''}${content.slug}`;
      const ogImg = content.featured_image || content.featuredImage || (origin + '/default-og.jpg');
      const rawDesc = (content.excerpt || content.body || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 160);

      const context = {
        site: settings, 
        menus, 
        categories,
        topics,
        sources,
        data: content,
        canonical: canonicalUrl, ogImage: ogImg, metaDesc: rawDesc,
        relatedPosts: (relatedPosts || []).map(formatPostForFrontend),
        user: null
      };

      if (type === 'page') {
        if (isPuckJson(content.body)) {
          let latestPosts: any[] = [];
          try {
            latestPosts = await orm.select().from(postsTable).where(eq(postsTable.status, 'publish')).orderBy(desc(postsTable.createdAt)).limit(9).all();
          } catch (e) {}

          return c.html(renderPuckHtml({
            site: settings,
            menus,
            page: content,
            canonical: canonicalUrl,
            latestPosts: (latestPosts || []).map(formatPostForFrontend)
          }));
        }
        if (Renderer.renderPage) return c.html(Renderer.renderPage(context));
      }
      if ((contentType === 'video' || (content.video_url && content.video_url.trim() !== '')) && Renderer.renderSingleVideo) {
        return c.html(Renderer.renderSingleVideo(context));
      }
      return c.html(Renderer.renderSingle(context));
    }

    return c.html(Renderer.render404({ site: settings, menus, data: null }), 404);
  } catch (e: any) {
    return c.text('Error System: ' + e.message, 500);
  }
}

publicRouter.get('/p/:slug', async (c) => c.redirect('/' + c.req.param('slug'), 301));
publicRouter.get('/en/:slug', async (c) => renderSinglePage(c, c.req.param('slug'), 'en'));
publicRouter.get('/ar/:slug', async (c) => renderSinglePage(c, c.req.param('slug'), 'ar'));
publicRouter.get('/:slug', async (c) => renderSinglePage(c, c.req.param('slug')));

export default publicRouter;
