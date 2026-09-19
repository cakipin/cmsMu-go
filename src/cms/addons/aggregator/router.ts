import { Hono } from 'hono';
import { processArticleInlineImages } from './services/image-processor';
import { ensureSourceTable, ingestFromSource } from './services/sync-engine';

export const aggregatorRouter = new Hono<{ Bindings: any }>();

// 1. GET /api/addons/aggregator/sources
aggregatorRouter.get('/sources', async (c) => {
  try {
    const db = c.env.DB;
    await ensureSourceTable(db);
    const sources = await db.prepare("SELECT * FROM media_sources ORDER BY trust_score DESC, created_at DESC").all();
    return c.json({ success: true, data: sources.results || [] });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 2. POST /api/addons/aggregator/sources
aggregatorRouter.post('/sources', async (c) => {
  try {
    const db = c.env.DB;
    await ensureSourceTable(db);
    const body = await c.req.json();
    const { name, baseUrl, feedUrl, feedType, regionCode, websiteCategory, trustScore, autoSync, syncInterval, defaultCategory, autoPublish, description } = body;
    if (!name || !baseUrl) return c.json({ success: false, error: 'Nama dan Base URL wajib diisi' }, 400);

    const cleanBase = baseUrl.replace(/\/+$/, '');
    const cleanFeed = feedUrl ? feedUrl.trim() : (feedType === 'wp_api' ? `${cleanBase}/wp-json/wp/v2/posts?per_page=10&_embed` : `${cleanBase}/feed/`);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `src-${Date.now()}`;

    await db.prepare(`
      INSERT INTO media_sources (id, name, slug, base_url, feed_url, feed_type, region_code, website_category, trust_score, is_active, auto_sync, sync_interval, default_category, auto_publish, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
    `).bind(
      id, 
      name, 
      slug, 
      cleanBase, 
      cleanFeed, 
      feedType || 'wp_api', 
      regionCode || '', 
      websiteCategory || 'Berita',
      Number(trustScore) || 90,
      autoSync !== undefined ? (autoSync ? 1 : 0) : 1,
      Number(syncInterval) || 15,
      defaultCategory || 'Berita Daerah',
      autoPublish !== undefined ? (autoPublish ? 1 : 0) : 0,
      description || ''
    ).run();

    return c.json({ success: true, message: 'Sumber media berhasil ditambahkan' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 3. PUT /api/addons/aggregator/sources/:id
aggregatorRouter.put('/sources/:id', async (c) => {
  try {
    const db = c.env.DB;
    await ensureSourceTable(db);
    const id = c.req.param('id');
    const body = await c.req.json();
    const { name, baseUrl, feedUrl, feedType, regionCode, websiteCategory, trustScore, isActive, autoSync, syncInterval, defaultCategory, autoPublish, description } = body;

    if (!name || !baseUrl) return c.json({ success: false, error: 'Nama dan Base URL wajib diisi' }, 400);

    const cleanBase = baseUrl.replace(/\/+$/, '');
    const cleanFeed = feedUrl ? feedUrl.trim() : (feedType === 'wp_api' ? `${cleanBase}/wp-json/wp/v2/posts?per_page=10&_embed` : `${cleanBase}/feed/`);

    await db.prepare(`
      UPDATE media_sources 
      SET name = ?, base_url = ?, feed_url = ?, feed_type = ?, region_code = ?, website_category = ?, trust_score = ?, is_active = ?, auto_sync = ?, sync_interval = ?, default_category = ?, auto_publish = ?, description = ?
      WHERE id = ?
    `).bind(
      name,
      cleanBase,
      cleanFeed,
      feedType || 'wp_api',
      regionCode || '',
      websiteCategory || 'Berita',
      Number(trustScore) || 90,
      isActive !== undefined ? (isActive ? 1 : 0) : 1,
      autoSync !== undefined ? (autoSync ? 1 : 0) : 1,
      Number(syncInterval) || 15,
      defaultCategory || 'Berita Daerah',
      autoPublish !== undefined ? (autoPublish ? 1 : 0) : 0,
      description !== undefined ? description : '',
      id
    ).run();

    return c.json({ success: true, message: 'Sumber media berhasil diperbarui' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 4. PATCH /api/addons/aggregator/sources/:id/toggle-auto-sync - Toggle On/Off Cepat Auto Sync
aggregatorRouter.patch('/sources/:id/toggle-auto-sync', async (c) => {
  try {
    const db = c.env.DB;
    await ensureSourceTable(db);
    const id = c.req.param('id');
    const src = await db.prepare("SELECT auto_sync FROM media_sources WHERE id = ?").bind(id).first();
    if (!src) return c.json({ success: false, error: 'Sumber tidak ditemukan' }, 404);

    const nextState = src.auto_sync ? 0 : 1;
    await db.prepare("UPDATE media_sources SET auto_sync = ? WHERE id = ?").bind(nextState, id).run();

    return c.json({ success: true, auto_sync: nextState });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 4b. PATCH /api/addons/aggregator/sources/:id/toggle-auto-publish - Toggle On/Off Cepat Bypass Kurasi
aggregatorRouter.patch('/sources/:id/toggle-auto-publish', async (c) => {
  try {
    const db = c.env.DB;
    await ensureSourceTable(db);
    const id = c.req.param('id');
    const src = await db.prepare("SELECT auto_publish FROM media_sources WHERE id = ?").bind(id).first();
    if (!src) return c.json({ success: false, error: 'Sumber tidak ditemukan' }, 404);

    const nextState = src.auto_publish ? 0 : 1;
    await db.prepare("UPDATE media_sources SET auto_publish = ? WHERE id = ?").bind(nextState, id).run();

    return c.json({ success: true, auto_publish: nextState });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 5. DELETE /api/addons/aggregator/sources/:id
aggregatorRouter.delete('/sources/:id', async (c) => {
  try {
    const db = c.env.DB;
    await ensureSourceTable(db);
    const id = c.req.param('id');
    await db.prepare("DELETE FROM media_sources WHERE id = ?").bind(id).run();
    return c.json({ success: true, message: 'Sumber media berhasil dihapus' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 6. POST /api/addons/aggregator/sources/:id/sync - Manual Sync Khusus 1 Sumber
aggregatorRouter.post('/sources/:id/sync', async (c) => {
  try {
    const db = c.env.DB;
    await ensureSourceTable(db);
    const id = c.req.param('id');
    const src = await db.prepare("SELECT * FROM media_sources WHERE id = ?").bind(id).first();
    if (!src) return c.json({ success: false, error: 'Sumber media tidak ditemukan' }, 404);

    const count = await ingestFromSource(src, db, c);
    return c.json({
      success: true,
      count,
      message: `Manual sync selesai: ${count} berita baru ditarik dari ${src.name}.`
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 6b. POST /api/addons/aggregator/test-feed - Live Testing Koneksi & Feed Sebelum Simpan
aggregatorRouter.post('/test-feed', async (c) => {
  try {
    const body = await c.req.json();
    const { baseUrl, feedUrl, feedType } = body;

    if (!baseUrl && !feedUrl) {
      return c.json({ success: false, error: 'Base URL atau Endpoint Feed wajib diisi untuk pengetesan' }, 400);
    }

    const cleanBase = (baseUrl || '').replace(/\/+$/, '');
    const detectedType = feedType || (feedUrl && feedUrl.includes('wp-json') ? 'wp_api' : 'rss');
    const targetUrl = feedUrl ? feedUrl.trim() : (detectedType === 'wp_api' ? `${cleanBase}/wp-json/wp/v2/posts?per_page=5&_embed` : `${cleanBase}/feed/`);

    // 1. Tes WordPress REST API
    if (detectedType === 'wp_api' || targetUrl.includes('wp-json')) {
      try {
        const res = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/json',
          },
        });

        if (!res.ok) {
          return c.json({ success: false, error: `HTTP ${res.status} ${res.statusText}: Gagal mengakses endpoint WordPress API.` }, 400);
        }

        const posts = await res.json();
        if (!Array.isArray(posts)) {
          return c.json({ success: false, error: 'Format response bukan list artikel WordPress yang valid.' }, 400);
        }

        if (posts.length === 0) {
          return c.json({ success: true, count: 0, sampleTitle: '-', message: 'Koneksi WP API berhasil, namun belum ada artikel yang ditemukan.' });
        }

        const firstTitle = posts[0].title?.rendered || 'Tanpa Judul';
        const sampleDate = posts[0].date ? new Date(posts[0].date).toLocaleDateString('id-ID') : '-';
        return c.json({
          success: true,
          count: posts.length,
          sampleTitle: firstTitle.replace(/<[^>]+>/g, ''),
          sampleDate,
          feedType: 'WordPress REST API',
          message: `Koneksi berhasil! Ditemukan ${posts.length} artikel dari WP REST API.`
        });
      } catch (err: any) {
        return c.json({ success: false, error: `Koneksi WP API gagal: ${err.message}` }, 400);
      }
    }

    // 2. Tes RSS / XML Feed
    if (detectedType === 'rss') {
      try {
        const res = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/rss+xml, application/xml, text/xml, */*',
          },
        });

        if (!res.ok) {
          return c.json({ success: false, error: `HTTP ${res.status} ${res.statusText}: Gagal mengakses feed RSS XML.` }, 400);
        }

        const xml = await res.text();
        const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];

        if (itemMatches.length === 0) {
          return c.json({ success: false, error: 'Feed XML berhasil dibuka, tetapi tidak ditemukan tag <item> artikel.' }, 400);
        }

        const firstItem = itemMatches[0];
        const titleMatch = firstItem.match(/<title>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/i);
        const sampleTitle = (titleMatch?.[1] || titleMatch?.[2] || 'Artikel RSS').trim();

        return c.json({
          success: true,
          count: itemMatches.length,
          sampleTitle,
          feedType: 'RSS XML Feed',
          message: `Koneksi berhasil! Ditemukan ${itemMatches.length} item artikel dari RSS XML.`
        });
      } catch (err: any) {
        return c.json({ success: false, error: `Koneksi RSS gagal: ${err.message}` }, 400);
      }
    }

    // 3. Tes HTML Scraper (Portal Non-WordPress seperti UM Surabaya)
    try {
      const targetListUrl = targetUrl.includes('/news') || targetUrl.includes('/berita') ? targetUrl : `${cleanBase}/news`;
      const res = await fetch(targetListUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!res.ok) {
        return c.json({ success: false, error: `HTTP ${res.status} ${res.statusText}: Gagal mengakses halaman portal berita.` }, 400);
      }

      const html = await res.text();
      const urlMatches = [...html.matchAll(/https?:\/\/[^\s"'<>]+(?:\/news\/|\/berita\/|\/article\/)([a-zA-Z0-9_-]+)/gi)];
      const candidateUrls = [...new Set(urlMatches.map(m => m[0]))]
        .filter(u => !u.endsWith('/category') && !u.endsWith('/tag') && !u.endsWith('/arsip') && !u.includes('/page/'));

      if (candidateUrls.length === 0) {
        return c.json({ success: false, error: 'Halaman berhasil dibuka, tetapi tidak ditemukan link artikel berita.' }, 400);
      }

      // Ambil sampel judul artikel pertama
      let sampleTitle = 'Artikel Portal Web';
      try {
        const sampleResp = await fetch(candidateUrls[0], {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CMSMuBot/1.0)' }
        });
        if (sampleResp.ok) {
          const sampleHtml = await sampleResp.text();
          const tMatch = sampleHtml.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                         sampleHtml.match(/<title>([^<]+)<\/title>/i);
          if (tMatch) sampleTitle = tMatch[1].trim().replace(/\s*-\s*Universitas Muhammadiyah.*$/i, '');
        }
      } catch (e) {}

      return c.json({
        success: true,
        count: candidateUrls.length,
        sampleTitle,
        feedType: 'Web HTML Scraper',
        message: `Koneksi berhasil! Ditemukan ${candidateUrls.length} link artikel dari Web Scraper.`
      });
    } catch (err: any) {
      return c.json({ success: false, error: `Scraper gagal: ${err.message}` }, 400);
    }
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 7. POST /api/addons/aggregator/sync - Menarik Berita Global dari Semua Sumber Aktif
aggregatorRouter.post('/sync', async (c) => {
  try {
    const db = c.env.DB;
    await ensureSourceTable(db);

    const sources = await db.prepare("SELECT * FROM media_sources WHERE is_active = 1").all();
    let totalIngested = 0;

    for (const src of sources.results || []) {
      const ingested = await ingestFromSource(src, db, c);
      totalIngested += ingested;
    }

    return c.json({ 
      success: true, 
      message: `Sinkronisasi selesai. ${totalIngested} berita baru berhasil ditarik ke meja kurasi.`, 
      count: totalIngested 
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 8. GET /api/addons/aggregator/auto-sync-check - Pengecekan berkala otomatis sesuai interval
aggregatorRouter.get('/auto-sync-check', async (c) => {
  try {
    const db = c.env.DB;
    await ensureSourceTable(db);

    const sources = await db.prepare("SELECT * FROM media_sources WHERE is_active = 1 AND auto_sync = 1").all();
    let totalIngested = 0;
    let syncedSources = 0;

    const now = Date.now();
    for (const src of sources.results || []) {
      const intervalMinutes = Number(src.sync_interval) || 15;
      const lastFetched = src.last_fetched_at ? new Date(src.last_fetched_at).getTime() : 0;
      const elapsedMinutes = (now - lastFetched) / (1000 * 60);

      if (elapsedMinutes >= intervalMinutes) {
        const count = await ingestFromSource(src, db, c);
        totalIngested += count;
        syncedSources++;
      }
    }

    return c.json({
      success: true,
      syncedSources,
      totalIngested,
      message: `${syncedSources} sumber auto-sync diperiksa, ${totalIngested} berita baru ditambahkan.`
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 9. POST /api/addons/aggregator/migrate-inline-images - Migrasi batch seluruh gambar inline eksternal di posts ke R2 WebP
aggregatorRouter.post('/migrate-inline-images', async (c) => {
  try {
    const db = c.env.DB;
    const posts = await db.prepare("SELECT id, title, body, author FROM posts WHERE body LIKE '%<img%src=\"http%'").all();
    let updatedCount = 0;

    for (const post of posts.results || []) {
      const oldBody = post.body || '';
      let newBody = await processArticleInlineImages(oldBody, post.title || 'Foto Artikel', post.author || 'Redaksi', 'migrated', c);

      newBody = newBody.replace(/<figure([^>]*)>/gi, (_match: string, attrs: string) => {
        let cleanAttrs = attrs
          .replace(/style="([^"]*)"/gi, (_m: string, s: string) => {
            const filtered = s.replace(/(?:max-)?width\s*:\s*[^;]+;?/gi, '').trim();
            return filtered ? `style="${filtered}"` : '';
          })
          .replace(/\s*width="[^"]*"/gi, '');
        return `<figure${cleanAttrs}>`;
      });

      if (newBody !== oldBody) {
        await db.prepare("UPDATE posts SET body = ? WHERE id = ?").bind(newBody, post.id).run();
        updatedCount++;
      }
    }

    return c.json({
      success: true,
      message: `Migrasi gambar inline selesai. ${updatedCount} artikel berhasil diperbarui dengan WebP di R2.`,
      updatedCount
    });
  } catch (err: any) {
    console.error('Migrate inline images error:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});
