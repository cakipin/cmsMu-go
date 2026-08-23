import { Hono } from 'hono';
import type { Bindings } from '../../types';
import { getActiveTheme } from '../../themes/registry';

// Import Helper SEO
// (SEO Plugin Removed)

const publicRouter = new Hono<{ Bindings: Bindings }>();

// --- HELPER DATABASE ---
async function getGlobalData(db: any) {
    let settings: any = {};
    let menus: any[] = [];
    try {
        const { results: settingRows } = await db.prepare("SELECT key, value FROM settings").all();
        if(settingRows) settingRows.forEach((row: any) => { settings[row.key] = row.value; });
        const { results: menuRows } = await db.prepare("SELECT * FROM menus ORDER BY order_num ASC").all();
        menus = menuRows || [];
    } catch (e) { console.error("Error global data", e); }
    return { settings, menus };
}

async function getRenderer(db: any) {
  try {
    const activeThemeRow = await db.prepare("SELECT id FROM themes WHERE active = 1").first();
    const themeId = activeThemeRow ? activeThemeRow.id : 'labmu-default';
    const theme = getActiveTheme(themeId);
    return { Renderer: theme || getActiveTheme('labmu-default'), themeId };
  } catch (e) {
      return { Renderer: getActiveTheme('labmu-default'), themeId: 'labmu-default' };
  }
}

// ============================================================
// 1. ROUTE HOMEPAGE
// ============================================================
publicRouter.get('/', async (c) => {
  try {
    const { settings, menus } = await getGlobalData(c.env.DB);
    const { Renderer, themeId } = await getRenderer(c.env.DB);

    if (themeId === 'labmu-quran') {
        const context = { site: settings, menus: menus, data: [] };
        return c.html(Renderer.renderHome(context));
    } else {
        // Fetch posts for "Berita & Artikel" section
        const { results: posts } = await c.env.DB.prepare("SELECT * FROM posts WHERE status = 'publish' ORDER BY created_at DESC LIMIT 10").all();

        // Check if custom 'home' page exists for overriding texts
        const homeSlug = settings.site_homepage_slug || 'home';
        const customHome: any = await c.env.DB.prepare("SELECT * FROM pages WHERE slug = ?").bind(homeSlug).first();

        // Track home page view
        if (customHome) {
            try {
                await c.env.DB.prepare("UPDATE pages SET views = views + 1 WHERE id = ?").bind(customHome.id).run();
            } catch (err) {}
        }

        const context = { site: settings, menus: menus, data: posts || [], pageData: customHome || null };
        return c.html(Renderer.renderHome(context));
    }
  } catch(e: any) { return c.text('Error: ' + e.message, 500); }
});


// 2. ROUTE PENCARIAN DENGAN PAGINATION
// ============================================================
// LPEK ROUTES — Tambahan route khusus LPEK
// ============================================================

// LPEK: /berita — Daftar berita dengan pagination
publicRouter.get('/berita', async (c) => {
    const page = parseInt(c.req.query('page') || '1');
    const limit = 12;
    const offset = (page - 1) * limit;
    try {
        const db = c.env.DB;
        const { settings, menus } = await getGlobalData(db);
        const { Renderer } = await getRenderer(db);
        const totalRow: any = await db.prepare("SELECT count(*) as total FROM posts WHERE status = 'publish'").first();
        const totalItems = totalRow?.total || 0;
        const totalPages = Math.ceil(totalItems / limit);
        const { results: posts } = await db.prepare("SELECT * FROM posts WHERE status = 'publish' ORDER BY created_at DESC LIMIT ? OFFSET ?").bind(limit, offset).all();
        const context: any = {
            site: settings, menus,
            data: posts || [],
            categoryName: 'Berita & Artikel',
            pagination: { currentPage: page, totalPages, totalItems, hasNext: page < totalPages, hasPrev: page > 1, baseUrl: '/berita' }
        };
        if (Renderer?.renderCategory) return c.html(Renderer.renderCategory(context));
        return c.html(Renderer.renderHome(context));
    } catch (e: any) { return c.text('Berita Error: ' + e.message, 500); }
});

// LPEK: /kegiatan — Daftar kegiatan/event
publicRouter.get('/kegiatan', async (c) => {
    const page = parseInt(c.req.query('page') || '1');
    const limit = 10;
    const offset = (page - 1) * limit;
    try {
        const db = c.env.DB;
        const { settings, menus } = await getGlobalData(db);
        const { Renderer } = await getRenderer(db);
        const sql = `SELECT * FROM posts WHERE status = 'publish' AND (category = 'kegiatan' OR type = 'kegiatan') ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        const countSql = `SELECT count(*) as total FROM posts WHERE status = 'publish' AND (category = 'kegiatan' OR type = 'kegiatan')`;
        const totalRow: any = await db.prepare(countSql).first();
        const totalItems = totalRow?.total || 0;
        const totalPages = Math.ceil(totalItems / limit);
        const { results: posts } = await db.prepare(sql).bind(limit, offset).all();
        const context: any = {
            site: settings, menus,
            data: posts || [],
            categoryName: 'Kegiatan Terdekat',
            pagination: { currentPage: page, totalPages, totalItems, hasNext: page < totalPages, hasPrev: page > 1 }
        };
        if (Renderer?.renderKegiatan) return c.html(Renderer.renderKegiatan(context));
        if (Renderer?.renderCategory) return c.html(Renderer.renderCategory(context));
        return c.html(Renderer.renderHome(context));
    } catch (e: any) { return c.text('Kegiatan Error: ' + e.message, 500); }
});

// LPEK: /program-lpek — Daftar semua program (halaman overview)
publicRouter.get('/program-lpek', async (c) => {
    try {
        const db = c.env.DB;
        const { settings, menus } = await getGlobalData(db);
        const { Renderer } = await getRenderer(db);

        // Fetch posts for the generic 'program' view
        const { results: posts } = await db.prepare("SELECT * FROM posts WHERE status = 'publish' AND (category = 'program' OR type = 'program') ORDER BY created_at DESC LIMIT 20").all();
        const page: any = await db.prepare("SELECT * FROM pages WHERE slug = 'program-lpek' AND status = 'publish'").first();

        const context: any = { site: settings, menus, data: page || posts || [], pageData: page || null, posts: posts || [], categoryName: 'Program LPEK', currentSlug: '' };
        if (page && Renderer?.renderPage) return c.html(Renderer.renderPage(context));
        if (Renderer?.renderCategory) return c.html(Renderer.renderCategory(context));
        return c.html(Renderer.renderHome(context));
    } catch (e: any) { return c.text('Program Error: ' + e.message, 500); }
});

// LPEK: /program-lpek/:sub — Sub-program (pariwisata-berkemajuan, dll)
publicRouter.get('/program-lpek/:sub', async (c) => {
    const sub = c.req.param('sub').toLowerCase();
    const programNames: Record<string, string> = {
        'pariwisata-berkemajuan':        'Pariwisata Berkemajuan',
        'ekonomi-kreatif-berkemajuan':   'Ekonomi Kreatif Berkemajuan',
        'desa-wisata-berkemajuan':       'Desa Wisata Berkemajuan',
        'umkm-berkemajuan':              'UMKM Berkemajuan',
        'wellness-heritage-berkemajuan': 'Wellness Heritage Berkemajuan',
    };
    try {
        const db = c.env.DB;
        const { settings, menus } = await getGlobalData(db);
        const { Renderer } = await getRenderer(db);
        const catName = programNames[sub] || sub;

        // Cek apakah ada halaman (page) khusus untuk sub-program ini
        let page: any = await db.prepare("SELECT * FROM pages WHERE slug = ? AND status = 'publish'").bind(sub).first();

        // Fetch posts
        const sql = `SELECT * FROM posts WHERE status = 'publish' AND (lower(category) = ? OR lower(category) = ?) ORDER BY created_at DESC LIMIT 20`;
        const { results: posts } = await db.prepare(sql).bind(sub, catName.toLowerCase()).all();

        if (page) {
            const context: any = { site: settings, menus, data: page, posts: posts || [], categoryName: catName, currentSlug: sub };
            if (Renderer?.renderPage) return c.html(Renderer.renderPage(context));
        }

        const masterPage: any = await db.prepare("SELECT * FROM pages WHERE slug = 'program-lpek' AND status = 'publish'").first();
        if (masterPage) {
            const context: any = { site: settings, menus, data: masterPage, posts: posts || [], categoryName: catName, currentSlug: sub };
            if (Renderer?.renderPage) return c.html(Renderer.renderPage(context));
        }

        const context: any = { site: settings, menus, data: posts || [], categoryName: catName, currentSlug: sub };
        if (Renderer?.renderProgram) return c.html(Renderer.renderProgram(context));

        return c.html(Renderer.renderHome(context));
    } catch (e: any) { return c.text('Program Error: ' + e.message, 500); }
});

// LPEK: /direktori — Overview direktori
publicRouter.get('/direktori', async (c) => {
    try {
        const db = c.env.DB;
        const { settings, menus } = await getGlobalData(db);
        const { Renderer } = await getRenderer(db);
        const context: any = { site: settings, menus, data: [], categoryName: 'Direktori LPEK', subType: 'destinasi' };
        if (Renderer?.renderDirektori) return c.html(Renderer.renderDirektori(context));
        return c.html(Renderer.renderHome(context));
    } catch (e: any) { return c.text('Direktori Error: ' + e.message, 500); }
});

// LPEK: /direktori/:sub — Sub-direktori (destinasi, umkm, restoran, mitra)
publicRouter.get('/direktori/:sub', async (c) => {
    const sub = c.req.param('sub').toLowerCase();
    const validSubs = ['destinasi', 'umkm', 'restoran', 'mitra'];
    const subName: Record<string, string> = { destinasi:'Destinasi Wisata', umkm:'UMKM Kreatif', restoran:'Restoran Halal', mitra:'Mitra Strategis' };
    try {
        const db = c.env.DB;
        const { settings, menus } = await getGlobalData(db);
        const { Renderer } = await getRenderer(db);
        const catName = subName[sub] || sub;
        const { results: posts } = await db.prepare("SELECT * FROM posts WHERE status = 'publish' AND lower(category) = ? ORDER BY created_at DESC LIMIT 30").bind(sub).all();
        const context: any = { site: settings, menus, data: posts || [], categoryName: catName, subType: validSubs.includes(sub) ? sub : 'destinasi' };
        if (Renderer?.renderDirektori) return c.html(Renderer.renderDirektori(context));
        if (Renderer?.renderCategory) return c.html(Renderer.renderCategory(context));
        return c.html(Renderer.renderHome(context));
    } catch (e: any) { return c.text('Direktori Error: ' + e.message, 500); }
});

// LPEK: /akademi — Overview akademi
publicRouter.get('/akademi', async (c) => {
    try {
        const db = c.env.DB;
        const { settings, menus } = await getGlobalData(db);
        const { Renderer } = await getRenderer(db);

        // Cek jika user membuat custom page untuk slug 'akademi'
        const page: any = await db.prepare("SELECT * FROM pages WHERE slug = 'akademi' AND status = 'publish'").first();
        if (page) {
            const context: any = { site: settings, menus, data: page };
            if (Renderer?.renderPage) return c.html(Renderer.renderPage(context));
        }

        const { results: posts } = await db.prepare("SELECT * FROM posts WHERE status = 'publish' AND (category = 'pelatihan' OR category = 'akademi') ORDER BY created_at DESC LIMIT 20").all();
        const context: any = { site: settings, menus, data: posts || [], categoryName: 'Akademi LPEK', subType: 'pelatihan' };
        if (Renderer?.renderAkademi) return c.html(Renderer.renderAkademi(context));
        if (Renderer?.renderCategory) return c.html(Renderer.renderCategory(context));
        return c.html(Renderer.renderHome(context));
    } catch (e: any) { return c.text('Akademi Error: ' + e.message, 500); }
});

// LPEK: /akademi/:sub — Sub-akademi (pelatihan, webinar, sertifikasi, modul)
publicRouter.get('/akademi/:sub', async (c) => {
    const sub = c.req.param('sub').toLowerCase();
    const subName: Record<string, string> = { pelatihan:'Pelatihan', webinar:'Webinar', sertifikasi:'Sertifikasi', modul:'Modul Pembelajaran' };
    try {
        const db = c.env.DB;
        const { settings, menus } = await getGlobalData(db);
        const { Renderer } = await getRenderer(db);

        // Cek jika user membuat custom page untuk slug 'akademi/sub' atau 'akademi-sub'
        let page: any = await db.prepare("SELECT * FROM pages WHERE (slug = ? OR slug = ?) AND status = 'publish'").bind(`akademi/${sub}`, `akademi-${sub}`).first();
        // Fallback cek jika slugnya cuma nama sub
        if (!page) {
            page = await db.prepare("SELECT * FROM pages WHERE slug = ? AND status = 'publish'").bind(sub).first();
        }

        if (page) {
            const context: any = { site: settings, menus, data: page };
            if (Renderer?.renderPage) return c.html(Renderer.renderPage(context));
        }

        const catName = subName[sub] || sub;
        const { results: posts } = await db.prepare("SELECT * FROM posts WHERE status = 'publish' AND lower(category) = ? ORDER BY created_at DESC LIMIT 20").bind(sub).all();
        const context: any = { site: settings, menus, data: posts || [], categoryName: catName, subType: sub };
        if (Renderer?.renderAkademi) return c.html(Renderer.renderAkademi(context));
        if (Renderer?.renderCategory) return c.html(Renderer.renderCategory(context));
        return c.html(Renderer.renderHome(context));
    } catch (e: any) { return c.text('Akademi Error: ' + e.message, 500); }
});

// LPEK: /kolaborasi
publicRouter.get('/kolaborasi', async (c) => {
    try {
        const db = c.env.DB;
        const { settings, menus } = await getGlobalData(db);
        const { Renderer } = await getRenderer(db);
        const page: any = await db.prepare("SELECT * FROM pages WHERE slug = 'kolaborasi' AND status = 'publish'").first();
        const context: any = { site: settings, menus, data: page || null };
        if (Renderer?.renderKolaborasi) return c.html(Renderer.renderKolaborasi(context));
        if (page && Renderer?.renderPage) return c.html(Renderer.renderPage(context));
        return c.html(Renderer.renderHome(context));
    } catch (e: any) { return c.text('Kolaborasi Error: ' + e.message, 500); }
});

// ============================================================
// 2. ROUTE PENCARIAN DENGAN PAGINATION
publicRouter.get('/search', async (c) => {
    const query = c.req.query('q');
    const page = parseInt(c.req.query('page') || '1'); // Default hal 1
    const limit = 10; // Jumlah per halaman
    const offset = (page - 1) * limit;

    // Jika kosong, kembalikan ke home
    if (!query) return c.redirect('/');

    const cleanQuery = query.toLowerCase().trim();

    try {
        const db = c.env.DB;
        const { settings, menus } = await getGlobalData(db);
        const { Renderer } = await getRenderer(db);

        // A. HITUNG TOTAL DATA (Untuk Pagination)
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
        const totalItems = totalRow.total || 0;
        const totalPages = Math.ceil(totalItems / limit);

        // B. AMBIL DATA SESUAI HALAMAN (LIMIT OFFSET)
        const sql = `
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

        const { results: posts } = await db.prepare(sql).bind(bindVal, bindVal, bindVal, limit, offset).all();

        // C. KIRIM DATA KE TEMA
        const context = {
            site: settings,
            menus: menus,
            data: posts || [],
            query: query,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };

        if (Renderer && typeof Renderer.renderSearch === 'function') {
            return c.html(Renderer.renderSearch(context));
        }

        // Fallback
        context.categoryName = `Pencarian: "${query}"`;
        if (Renderer && typeof Renderer.renderCategory === 'function') {
            return c.html(Renderer.renderCategory(context));
        } else {
            return c.html(Renderer.renderHome(context));
        }

    } catch (e: any) { return c.text("Search Error: " + e.message, 500); }
});

// 2.5 ROUTE /INFO (SEMUA ARTIKEL DENGAN PAGINATION)
publicRouter.get('/info', async (c) => {
    const page = parseInt(c.req.query('page') || '1');
    const limit = 12; // Batasi jumlah artikel 12
    const offset = (page - 1) * limit;

    try {
        const db = c.env.DB;
        const { settings, menus } = await getGlobalData(db);
        const { Renderer } = await getRenderer(db);

        // A. HITUNG TOTAL DATA
        const countSql = `SELECT count(*) as total FROM posts WHERE status = 'publish'`;
        const totalRow: any = await db.prepare(countSql).first();
        const totalItems = totalRow.total || 0;
        const totalPages = Math.ceil(totalItems / limit);

        // B. AMBIL DATA
        const sql = `SELECT * FROM posts WHERE status = 'publish' ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        const { results: posts } = await db.prepare(sql).bind(limit, offset).all();

        // C. KIRIM DATA KE TEMA
        const context: any = {
            site: settings,
            menus: menus,
            data: posts || [],
            categoryName: 'Informasi & Artikel',
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                baseUrl: '/info'
            }
        };

        if (Renderer && typeof Renderer.renderCategory === 'function') {
            return c.html(Renderer.renderCategory(context));
        }
        return c.html(Renderer.renderHome(context));
    } catch (e: any) { return c.text("Info Error: " + e.message, 500); }
});


// ============================================================
// 3. ROUTE MAGIC (Kategori, Post, Page, Quran)
// ============================================================
publicRouter.get('/:slug', async (c) => {
  const slug = c.req.param('slug').toLowerCase();

  // Filter file system
  if (slug.includes('.') || slug === 'favicon.ico') return c.notFound();

  try {
    const { settings, menus } = await getGlobalData(c.env.DB);
    const { Renderer } = await getRenderer(c.env.DB);
    const db = c.env.DB;

    // A. CEK KATEGORI
    const slugSpace = slug.replace(/-/g, ' ');
    const catQuery = `SELECT * FROM posts WHERE (lower(category) = ? OR lower(category) = ?) AND status='publish' ORDER BY created_at DESC`;
    const { results: catPosts } = await db.prepare(catQuery).bind(slug, slugSpace).all();

    if (catPosts && catPosts.length > 0) {
        const realCategoryName = catPosts[0].category || slugSpace;
        const title = realCategoryName.replace(/\b\w/g, (l: string) => l.toUpperCase());
        const context = { site: settings, menus, data: catPosts, categoryName: title };
        if (Renderer && typeof Renderer.renderCategory === 'function') {
            return c.html(Renderer.renderCategory(context));
        }
        return c.html(Renderer.renderHome(context));
    }

    // B. CEK QURAN (Removed)

    // C. CEK POST & PAGE
    let content: any = await db.prepare("SELECT * FROM posts WHERE slug = ? AND status = 'publish'").bind(slug).first();
    let type = 'post';

    if (!content) {
        content = await db.prepare("SELECT * FROM pages WHERE slug = ? AND status = 'publish'").bind(slug).first();
        type = 'page';
    }

    if (content) {
        try {
            if (type === 'post') {
                await db.prepare("UPDATE posts SET views = views + 1 WHERE id = ?").bind(content.id).run();
            } else if (type === 'page') {
                await db.prepare("UPDATE pages SET views = views + 1 WHERE id = ?").bind(content.id).run();
            }
        } catch (err) { console.error('Failed to update views:', err); }

        content.type = type;
        const context = { site: settings, menus, data: content };
        if (type === 'page' && Renderer.renderPage) return c.html(Renderer.renderPage(context));
        return c.html(Renderer.renderSingle(context));
    }

    return c.html(Renderer.render404({ site: settings, menus, data: null }), 404);

  } catch (e: any) { return c.text('Error System: ' + e.message, 500); }
});

export default publicRouter;