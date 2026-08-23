import { Hono } from 'hono';
import type { Bindings } from '../../types';
import { getActiveTheme } from '../../themes/registry';

// Import Helper SEO
// (SEO Plugin Removed)

const publicRouter = new Hono<{ Bindings: Bindings }>();

const escapeComment = (value: unknown) => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

function injectComments(page: string, post: any, comments: any[]) {
  const items = comments.length ? comments.map(comment => `
    <article class="cmsmu-comment">
      <div class="cmsmu-comment-avatar">${escapeComment((comment.user_name || comment.username || 'P').slice(0, 1).toUpperCase())}</div>
      <div><div class="cmsmu-comment-meta"><strong>${escapeComment(comment.user_name || comment.username || 'Pengguna')}</strong><time>${escapeComment(new Date(comment.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }))}</time></div><p>${escapeComment(comment.content)}</p></div>
    </article>`).join('') : '<p class="cmsmu-comment-empty">Belum ada komentar. Jadilah yang pertama berkomentar.</p>';
  const form = `
    <form id="cmsmu-comment-form" class="cmsmu-comment-form" hidden>
      <label for="cmsmu-comment-content">Tulis komentar sebagai <strong id="cmsmu-comment-user"></strong></label>
      <textarea id="cmsmu-comment-content" maxlength="2000" required placeholder="Tulis komentar yang relevan dan santun..."></textarea>
      <div><small>Komentar akan tampil setelah disetujui editor.</small><button type="submit">Kirim komentar</button></div>
      <p id="cmsmu-comment-status" role="status" aria-live="polite"></p>
    </form><p id="cmsmu-comment-login" class="cmsmu-comment-login" hidden><a href="/admin/login">Masuk</a> untuk menulis komentar.</p>`;
  const widget = `
  <section id="cmsmu-comments" class="cmsmu-comments" aria-labelledby="cmsmu-comments-title">
    <style>
      .cmsmu-comments{box-sizing:border-box;max-width:800px;margin:48px auto;padding:28px;background:#fff;border:1px solid #e2e8f0;border-radius:14px;color:#1e293b;font-family:system-ui,sans-serif}.cmsmu-comments h2{margin:0 0 24px;font-size:24px}.cmsmu-comment{display:grid;grid-template-columns:42px 1fr;gap:14px;padding:18px 0;border-top:1px solid #e2e8f0}.cmsmu-comment-avatar{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#0d9488;color:#fff;font-weight:700}.cmsmu-comment-meta{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.cmsmu-comment-meta time{color:#64748b;font-size:13px}.cmsmu-comment p{margin:7px 0 0;white-space:pre-wrap;line-height:1.65}.cmsmu-comment-empty,.cmsmu-comment-login{padding:18px;background:#f8fafc;border-radius:8px}.cmsmu-comment-form{margin-top:24px;padding-top:24px;border-top:1px solid #e2e8f0}.cmsmu-comment-form label{display:block;margin-bottom:10px}.cmsmu-comment-form textarea{box-sizing:border-box;width:100%;min-height:120px;padding:12px;border:1px solid #cbd5e1;border-radius:8px;font:inherit}.cmsmu-comment-form>div{display:flex;gap:16px;justify-content:space-between;align-items:center;margin-top:12px}.cmsmu-comment-form button{border:0;border-radius:8px;padding:10px 18px;background:#0d9488;color:#fff;font-weight:700;cursor:pointer}.cmsmu-comment-form button:disabled{opacity:.6;cursor:not-allowed}#cmsmu-comment-status{margin:12px 0 0;font-size:14px}@media(max-width:600px){.cmsmu-comments{margin:32px 14px;padding:20px}.cmsmu-comment-form>div{align-items:flex-start;flex-direction:column}}
    </style>
    <h2 id="cmsmu-comments-title">Komentar (${comments.length})</h2>${items}${form}
  </section>
  <script>(()=>{const form=document.getElementById('cmsmu-comment-form');const login=document.getElementById('cmsmu-comment-login');const user=document.getElementById('cmsmu-comment-user');fetch('/api/users/session').then(response=>response.json()).then(session=>{if(session.authenticated&&session.user){user.textContent=session.user.name||session.user.username;form.hidden=false}else{login.hidden=false}}).catch(()=>{login.hidden=false});form.addEventListener('submit',async event=>{event.preventDefault();const button=form.querySelector('button');const status=document.getElementById('cmsmu-comment-status');const content=document.getElementById('cmsmu-comment-content').value.trim();if(!content)return;button.disabled=true;status.textContent='Mengirim...';try{const response=await fetch('/api/comments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({post_id:${Number(post.id)},content})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Komentar gagal dikirim');status.textContent=result.message;form.reset()}catch(error){status.textContent=error.message}finally{button.disabled=false}})})();</script>`;
  const mainEnd = page.lastIndexOf('</main>');
  return mainEnd >= 0 ? page.slice(0, mainEnd) + widget + page.slice(mainEnd) : page.replace('</body>', `${widget}</body>`);
}

function renderUniversalHome(body: string, posts: any[]) {
  let data: any;
  try { data = JSON.parse(body); } catch { return null; }
  if (data?.root?.props?.editorType !== 'universal-home' || !Array.isArray(data.content)) return null;
  return data.content.map((block: any) => {
    const props = block.props || {};
    if (block.type === 'HomeHero') return `<section style="padding:80px 24px;text-align:center;background:${escapeComment(props.background || '#0f766e')};color:${escapeComment(props.textColor || '#fff')}"><small style="text-transform:uppercase;letter-spacing:.14em;font-weight:700">${escapeComment(props.eyebrow)}</small><h1 style="font-size:clamp(2rem,5vw,4rem);margin:14px auto;max-width:900px">${escapeComment(props.title)}</h1><p style="max-width:720px;margin:0 auto 28px;font-size:18px">${escapeComment(props.description)}</p>${props.buttonText ? `<a href="${escapeComment(props.buttonUrl || '#')}" style="display:inline-block;padding:12px 22px;border-radius:8px;background:${escapeComment(props.textColor || '#fff')};color:${escapeComment(props.background || '#0f766e')};font-weight:700">${escapeComment(props.buttonText)}</a>` : ''}</section>`;
    if (block.type === 'HomeText') return `<section style="max-width:1100px;margin:0 auto;padding:64px 24px;text-align:${props.align === 'center' ? 'center' : 'left'}"><h2 style="font-size:32px">${escapeComment(props.title)}</h2><p style="font-size:17px;line-height:1.8;white-space:pre-wrap">${escapeComment(props.content)}</p></section>`;
    if (block.type === 'HomeCallToAction') return `<section style="padding:64px 24px;text-align:center;background:${escapeComment(props.background || '#f1f5f9')}"><h2>${escapeComment(props.title)}</h2><p>${escapeComment(props.description)}</p><a href="${escapeComment(props.buttonUrl || '#')}" style="display:inline-block;margin-top:12px;padding:11px 20px;background:#0f172a;color:#fff;border-radius:8px">${escapeComment(props.buttonText)}</a></section>`;
    if (block.type === 'HomeLatestPosts') {
      const limit = Math.max(1, Math.min(Number(props.limit) || 6, 12));
      return `<section style="max-width:1100px;margin:0 auto;padding:48px 24px"><h2>${escapeComment(props.title || 'Artikel Terbaru')}</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:22px">${posts.slice(0, limit).map(post => `<article style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#fff">${post.featured_image ? `<img src="${escapeComment(post.featured_image)}" alt="${escapeComment(post.title)}" style="width:100%;height:170px;object-fit:cover">` : ''}<div style="padding:18px"><h3 style="margin:0 0 10px"><a href="/${escapeComment(post.slug)}">${escapeComment(post.title)}</a></h3><p>${escapeComment(post.excerpt || '')}</p></div></article>`).join('')}</div></section>`;
    }
    return '';
  }).join('');
}

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
        const themedHome: any = await c.env.DB.prepare("SELECT * FROM pages WHERE slug = ?").bind(`__theme_home_${themeId}`).first();
        const legacyHome: any = ['labmu-pro', 'newspaper-mu'].includes(themeId)
          ? await c.env.DB.prepare("SELECT * FROM pages WHERE slug = ?").bind(homeSlug).first()
          : null;
        const customHome: any = themedHome || legacyHome;

        // Track home page view
        if (customHome) {
            try {
                await c.env.DB.prepare("UPDATE pages SET views = views + 1 WHERE id = ?").bind(customHome.id).run();
            } catch (err) {}
        }

        const context = { site: settings, menus: menus, data: posts || [], pageData: customHome || null };
        if (customHome?.body && !['labmu-pro', 'newspaper-mu'].includes(themeId)) {
            const editableHome = renderUniversalHome(customHome.body, posts || []);
            if (editableHome && typeof (Renderer as any)._layout === 'function') {
                return c.html((Renderer as any)._layout(editableHome, 'Beranda', context));
            }
        }
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
        const rendered = Renderer.renderSingle(context);
        if (Number(content.allow_comments) !== 1) return c.html(rendered);
        const { results: comments } = await db.prepare(`
          SELECT c.content, c.created_at, u.name AS user_name, u.username
          FROM comments c JOIN users u ON u.id = c.user_id
          WHERE c.post_id = ? AND c.status = 'approved'
          ORDER BY c.created_at DESC
        `).bind(content.id).all();
        return c.html(injectComments(rendered, content, comments || []));
    }

    return c.html(Renderer.render404({ site: settings, menus, data: null }), 404);

  } catch (e: any) { return c.text('Error System: ' + e.message, 500); }
});

export default publicRouter;
