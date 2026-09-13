import { Hono } from 'hono';

export const newsroomRouter = new Hono<{ Bindings: any }>();

// 1. GET /api/addons/newsroom/queue - Antrean kurasi berita dengan filter lengkap
newsroomRouter.get('/queue', async (c) => {
  try {
    const db = c.env.DB;
    // Pastikan tabel ada
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS curation_queue (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        raw_title TEXT NOT NULL,
        raw_content_html TEXT NOT NULL,
        raw_url TEXT NOT NULL UNIQUE,
        raw_published_at DATETIME,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    const search = c.req.query('search') || '';
    const sourceId = c.req.query('source_id') || '';
    const startDate = c.req.query('start_date') || '';
    const endDate = c.req.query('end_date') || '';

    let query = `
      SELECT q.*, s.name as source_name, s.region_code 
      FROM curation_queue q
      LEFT JOIN media_sources s ON q.source_id = s.id
      WHERE q.status = 'pending'
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (q.raw_title LIKE ? OR q.raw_content_html LIKE ? OR q.raw_url LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (sourceId) {
      query += ` AND q.source_id = ?`;
      params.push(sourceId);
    }

    if (startDate) {
      query += ` AND (date(q.raw_published_at) >= date(?) OR date(q.created_at) >= date(?))`;
      params.push(startDate, startDate);
    }

    if (endDate) {
      query += ` AND (date(q.raw_published_at) <= date(?) OR date(q.created_at) <= date(?))`;
      params.push(endDate, endDate);
    }

    query += ` ORDER BY q.created_at DESC LIMIT 200`;

    let stmt = db.prepare(query);
    if (params.length > 0) {
      stmt = stmt.bind(...params);
    }

    const queue = await stmt.all();

    // Ambil juga list sources unik untuk dropdown media
    const sources = await db.prepare(`
      SELECT DISTINCT s.id, s.name 
      FROM media_sources s
      ORDER BY s.name ASC
    `).all();

    return c.json({ 
      success: true, 
      data: queue.results || [],
      sources: sources.results || []
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 2. POST /api/addons/newsroom/queue/:id/publish - Menerbitkan langsung ke tabel posts CMSMu
newsroomRouter.post('/queue/:id/publish', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const body = await c.req.json();

    const { title, excerpt, contentHtml, category, author, featured_image, tags } = body;
    if (!title || !contentHtml) {
      return c.json({ success: false, error: 'Judul dan konten wajib diisi' }, 400);
    }

    // Ambil info antrean dan sumber asli
    const queueItem: any = await db.prepare("SELECT * FROM curation_queue WHERE id = ?").bind(id).first();
    const sourceName = queueItem ? (await db.prepare("SELECT name FROM media_sources WHERE id = ?").bind(queueItem.source_id).first())?.name : '';

    // Buat slug unik
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    // Format final body dengan atribusi jika belum ada
    let finalBody = contentHtml;
    if (queueItem && queueItem.raw_url && !finalBody.includes('attribution-box')) {
      finalBody += `
<blockquote class="attribution-box border-l-4 border-emerald-600 pl-4 py-2 my-4 bg-emerald-50 text-slate-700 text-sm">
  <strong>Sumber Berita:</strong> Disadur dari <a href="${queueItem.raw_url}" target="_blank" rel="noopener canonical" class="text-emerald-700 font-semibold underline">${sourceName || 'Media Terkait'}</a> untuk kepentingan syiar dakwah persyarikatan.
</blockquote>`;
    }

    const postCategory = category || queueItem?.default_category || 'Berita Daerah';
    const postImage = featured_image || queueItem?.raw_image || '';
    const postExcerpt = excerpt || queueItem?.raw_description || title;
    const postAuthor = author || sourceName || 'Redaksi Newsroom';
    const postTags = tags || `Muhammadiyah, ${postCategory}`;

    // Gunakan WAKTU RILIS ASLI sebagai created_at
    const rawPublishedAt = body.published_at || queueItem?.raw_published_at;
    let publishCreatedAt = new Date().toISOString();
    if (rawPublishedAt) {
      try {
        const parsedDate = new Date(rawPublishedAt);
        if (!isNaN(parsedDate.getTime())) {
          publishCreatedAt = parsedDate.toISOString();
        }
      } catch (e) {}
    }

    // Insert ke tabel posts resmi CMSMu!
    await db.prepare(`
      INSERT INTO posts (
        title, slug, body, status, category, author, 
        featured_image, excerpt, meta_title, meta_description, tags,
        created_at, updated_at
      )
      VALUES (?, ?, ?, 'publish', ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      title,
      slug,
      finalBody,
      postCategory,
      postAuthor,
      postImage,
      postExcerpt ? postExcerpt.slice(0, 200) : '',
      title,
      postExcerpt ? postExcerpt.slice(0, 160) : '',
      postTags,
      publishCreatedAt
    ).run();

    // Update status di antrean kurasi
    await db.prepare("UPDATE curation_queue SET status = 'published' WHERE id = ?").bind(id).run();

    return c.json({
      success: true,
      message: 'Berita berhasil disetujui dan langsung diterbitkan ke portal utama!',
      slug,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 3. POST /api/addons/newsroom/queue/:id/reject - Mengabaikan berita
newsroomRouter.post('/queue/:id/reject', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    await db.prepare("UPDATE curation_queue SET status = 'rejected' WHERE id = ?").bind(id).run();
    return c.json({ success: true, message: 'Berita berhasil diabaikan dari antrean' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 4. POST /api/addons/newsroom/queue/:id/resolve - Menandai antrean telah diterbitkan via editor post resmi
newsroomRouter.post('/queue/:id/resolve', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    await db.prepare("UPDATE curation_queue SET status = 'published' WHERE id = ?").bind(id).run();
    return c.json({ success: true, message: 'Status antrean kurasi diperbarui ke published' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
