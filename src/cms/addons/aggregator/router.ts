import { Hono } from 'hono';
import { getStorageBucket } from '../../storage/r2-adapter';

export const aggregatorRouter = new Hono<{ Bindings: any }>();

// Inisialisasi dan migrasi tabel media_sources & curation_queue
async function ensureSourceTable(db: any) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS media_sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      base_url TEXT NOT NULL,
      feed_url TEXT,
      feed_type TEXT DEFAULT 'wp_api',
      region_code TEXT,
      trust_score INTEGER DEFAULT 100,
      is_active INTEGER DEFAULT 1,
      auto_sync INTEGER DEFAULT 1,
      sync_interval INTEGER DEFAULT 15,
      last_fetched_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS curation_queue (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      raw_title TEXT NOT NULL,
      raw_content_html TEXT NOT NULL,
      raw_url TEXT NOT NULL UNIQUE,
      raw_published_at DATETIME,
      raw_image TEXT,
      raw_description TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  // Pastikan kolom baru ada pada tabel media_sources
  const sourceColumns = [
    "feed_type TEXT DEFAULT 'wp_api'",
    "auto_sync INTEGER DEFAULT 1",
    "sync_interval INTEGER DEFAULT 15",
    "website_category TEXT DEFAULT 'Berita'",
    "default_category TEXT DEFAULT 'Berita Daerah'",
    "auto_publish INTEGER DEFAULT 0",
    "description TEXT"
  ];
  for (const col of sourceColumns) {
    try {
      await db.prepare(`ALTER TABLE media_sources ADD COLUMN ${col}`).run();
    } catch (e) {}
  }

  // Pastikan kolom baru ada pada tabel curation_queue
  const queueColumns = [
    "raw_image TEXT",
    "raw_description TEXT",
    "default_category TEXT DEFAULT 'Berita Daerah'"
  ];
  for (const col of queueColumns) {
    try {
      await db.prepare(`ALTER TABLE curation_queue ADD COLUMN ${col}`).run();
    } catch (e) {}
  }

  // Seed sumber default jika kosong
  const countRes = await db.prepare("SELECT COUNT(*) as count FROM media_sources").first();
  if (!countRes || countRes.count === 0) {
    await db.prepare(`
      INSERT INTO media_sources (id, name, slug, base_url, feed_url, feed_type, region_code, trust_score, is_active, auto_sync, sync_interval, description)
      VALUES 
      ('src-pwmu', 'PWMU.CO', 'pwmu-co', 'https://pwmu.co', 'https://pwmu.co/wp-json/wp/v2/posts?per_page=10&_embed', 'wp_api', 'PWM-JATIM', 95, 1, 1, 15, 'Portal Berita Berkemajuan Pimpinan Wilayah Muhammadiyah Jawa Timur.'),
      ('src-menaramu', 'MenaraMu', 'menaramu-id', 'https://menaramu.id', 'https://menaramu.id/wp-json/wp/v2/posts?per_page=10&_embed', 'wp_api', 'PWM-JATENG', 90, 1, 1, 15, 'Media Informasi dan Inspirasi Warga Muhammadiyah Jawa Tengah.'),
      ('src-suaramu', 'Suara Muhammadiyah', 'suara-muhammadiyah', 'https://suaramuhammadiyah.id', 'https://suaramuhammadiyah.id/feed/', 'rss', 'PP-MUHAMMADIYAH', 100, 1, 1, 15, 'Majalah & Portal Berita Resmi Pimpinan Pusat Muhammadiyah.');
    `).run();
  }
}

/**
 * Helper: Mengunduh gambar artikel, mengonversinya ke WebP dengan sharp,
 * mengunggahnya ke Cloudflare R2, dan mencatatnya ke media_meta CMSMu.
 */
async function processAndUploadImage(imageUrl: string, title: string, sourceName: string, sourceSlug: string, c: any): Promise<string> {
  if (!imageUrl || !imageUrl.startsWith('http')) return '';
  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });
    if (!res.ok) return imageUrl;

    const arrayBuffer = await res.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength < 100) return imageUrl;

    // Konversi gambar ke WebP menggunakan sharp jika runtime mendukung
    let webpBuffer: any = Buffer.from(arrayBuffer);
    try {
      const sharpModule = await (new Function('return import("sharp")')());
      const sharpFn = sharpModule.default || sharpModule;
      webpBuffer = await sharpFn(Buffer.from(arrayBuffer))
        .webp({ quality: 80 })
        .toBuffer();
    } catch (sharpErr) {
      console.warn('Sharp conversion not available in current runtime, using original buffer:', sharpErr);
    }

    const bucket = getStorageBucket(c);
    if (!bucket) {
      return imageUrl; // Fallback jika R2 belum siap
    }

    const cleanSource = (sourceSlug || 'agregator')
      .toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'agregator';
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const folder = `${cleanSource}/${year}/${month}`;
    const cleanSlug = title
      ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40)
      : 'foto';
    const key = `${folder}/${Date.now()}-${cleanSlug}.webp`;

    await bucket.put(key, webpBuffer, {
      httpMetadata: { contentType: 'image/webp' }
    });

    const fileUrl = `/api/media/file/${key}`;

    // Catat ke tabel media_meta CMSMu agar muncul di Media Library
    try {
      await c.env.DB.prepare(`
        INSERT INTO media_meta (key, url, type, size, title, alt, caption, created_at)
        VALUES (?, ?, 'image/webp', ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        key,
        fileUrl,
        webpBuffer.length,
        title || 'Foto Berita Agregator',
        title || 'Foto Berita Agregator',
        sourceName ? `Foto: Dok. ${sourceName}` : ''
      ).run();
    } catch (metaErr) {}

    return fileUrl;
  } catch (err) {
    console.error('Failed to process and upload image to R2:', err);
    return imageUrl;
  }
}

/**
 * Helper: Memindai seluruh <img> di dalam isi artikel, mengunduhnya,
 * mengonversinya ke WebP, mengunggah ke R2 ({sourceSlug}/{year}/{month}/...),
 * dan menggantikan src asli dengan URL R2 internal.
 */
async function processArticleInlineImages(htmlContent: string, title: string, sourceName: string, sourceSlug: string, c: any): Promise<string> {
  if (!htmlContent) return '';

  const imgRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
  const matches = [...htmlContent.matchAll(imgRegex)];
  if (!matches.length) return htmlContent;

  let updatedContent = htmlContent;
  let idx = 1;

  for (const match of matches) {
    const origSrc = match[1];
    if (!origSrc || origSrc.startsWith('/api/media/')) continue;

    try {
      const inlineTitle = `${title}-inline-${idx}`;
      const r2Url = await processAndUploadImage(origSrc, inlineTitle, sourceName, sourceSlug, c);
      if (r2Url && r2Url !== origSrc) {
        updatedContent = updatedContent.split(origSrc).join(r2Url);
      }
      idx++;
    } catch(e) {
      console.warn('Gagal memproses inline image:', origSrc, e);
    }
  }

  return updatedContent;
}

/**
 * Helper: Membersihkan artikel dari tautan/link eksternal (<a ...>...</a> -> teks murni)
 * dan menghapus tag iklan, script, style, embed yang mengganggu.
 */
function sanitizeArticleContent(rawHtml: string): string {
  if (!rawHtml) return '';
  let clean = rawHtml;

  // 1. Hapus script, style, iframe, ins (adsense), noscript, form, button
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  clean = clean.replace(/<ins\b[^<]*(?:(?!<\/ins>)<[^<]*)*<\/ins>/gi, '');
  clean = clean.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');

  // 2. Hapus blok iklan umum / elemen sponsor / widget sosmed / related posts eksternal
  clean = clean.replace(/<div[^>]*class=["'][^"']*(?:ads|ad-banner|advertisement|wp-block-embed|sharedaddy|jp-relatedposts|xs_social_share_widget|xs_share_url|wslu-style|wslu-share-box|social-share|share-box|share-buttons|social-buttons|share-section|share-title|share-btn|bagikan|addtoany|heateor_sss_sharing_container|yarpp-related)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
  clean = clean.replace(/<div[^>]*class=["'][^"']*share-section[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
  clean = clean.replace(/<h[1-6][^>]*>\s*(?:<[^>]+>\s*)*(?:Bagikan Artikel|Bagikan Berita|Share this)[\s\S]*?<\/div>\s*<\/div>/gi, '');

  // 2b. Hapus list ul/ol sosmed share yang berdiri sendiri
  clean = clean.replace(/<ul[^>]*class=["'][^"']*(?:share|social|wslu)[^"']*["'][^>]*>[\s\S]*?<\/ul>/gi, '');

  // 2c. Hapus kontainer layout eksternal yang tidak diperlukan
  clean = clean.replace(/<div[^>]*class=["'][^"']*(?:container mx-auto|max-w-4xl|article-content-card|article-body|prose-modern)[^"']*["'][^>]*>/gi, '');

  // 2d. Hapus wrapper featured-image dari naskah
  clean = clean.replace(/<div[^>]*class=["'][^"']*(?:featured-image-wrapper|featured-image|featured_image|post-thumbnail|entry-thumbnail)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');

  // 2e. Hapus seluruh foto/gambar/figure di bagian paling atas naskah (sebelum teks narasi) pada SEMUA sumber
  let topCleaned = false;
  while (!topCleaned) {
    const before = clean;
    clean = clean.replace(/^\s*(?:<div[^>]*>\s*)*<figure[^>]*>[\s\S]*?<\/figure>(?:\s*<\/div>)*/i, '');
    clean = clean.replace(/^\s*(?:<div[^>]*>\s*)*<p[^>]*>\s*<figure[^>]*>[\s\S]*?<\/figure>\s*<\/p>(?:\s*<\/div>)*/i, '');
    clean = clean.replace(/^\s*(?:<div[^>]*>\s*)*<p[^>]*>\s*(?:<a[^>]*>\s*)?<img[^>]*>(?:\s*<\/a>)?\s*<\/p>(?:\s*<\/div>)*/i, '');
    clean = clean.replace(/^\s*(?:<div[^>]*>\s*)*<p[^>]*>\s*<figure[^>]*>[\s\S]*?<\/figure>/i, '<p>');
    clean = clean.replace(/^\s*(?:<div[^>]*>\s*)*<p[^>]*>\s*(?:<a[^>]*>\s*)?<img[^>]*>(?:\s*<\/a>)?/i, '<p>');
    clean = clean.replace(/^\s*(?:<div[^>]*>\s*)*<img[^>]*>(?:\s*<\/div>)*/i, '');
    clean = clean.replace(/^\s*<div[^>]*class=["'][^"']*(?:wp-caption|featured)[^"']*["'][^>]*>[\s\S]*?<\/div>/i, '');
    if (clean === before) {
      topCleaned = true;
    }
  }

  // 3. Bersihkan seluruh link tautan: ubah <a ...>teks</a> menjadi teks biasa (hilangkan hyperlink)
  clean = clean.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1');
  clean = clean.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1');

  // 4. Bersihkan komentar HTML
  clean = clean.replace(/<!--[\s\S]*?-->/g, '');

  // 5. Bersihkan footer promosi WordPress feed RSS
  clean = clean.replace(/<p[^>]*>\s*The post\s+[\s\S]*?\s+appeared first on\s+[\s\S]*?<\/p>/gi, '');
  clean = clean.replace(/The post\s+[\s\S]*?\s+appeared first on\s+[^\n.<]+/gi, '');

  // 6. Hapus kontainer caption/div kosong yang sering terbawa dari WordPress
  clean = clean.replace(/<div[^>]*class=["'][^"']*wp-caption[^"']*["'][^>]*>\s*<\/div>/gi, '');
  clean = clean.replace(/<div[^>]*>\s*<\/div>/gi, '');

  // 7. Bersihkan tag <p><p ...> bersarang yang sering digenerate WordPress Gutenberg
  clean = clean.replace(/<p[^>]*>\s*<p[^>]*>/gi, '<p>');
  clean = clean.replace(/<\/p>\s*<\/p>/gi, '</p>');

  // 8. Bersihkan tag <br> yang berdiri sendiri di antara tag </p> dan <p>
  clean = clean.replace(/<\/p>\s*(?:<br\s*\/?>\s*)+<p[^>]*>/gi, '</p><p>');

  // 9. Bersihkan atribut inline seperti dir="ltr"
  clean = clean.replace(/<p\s+dir=["'][a-z]+["']>/gi, '<p>');

  // 10. Bersihkan tag <p> kosong atau hanya berisi spasi / &nbsp; / <br>
  clean = clean.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi, '');

  // 11. Normalisasi spasi antar paragraf
  clean = clean.replace(/(?:<br\s*\/?>\s*){2,}/gi, '<br>');

  // 12. Bersihkan inline style width pada figure dan img agar tidak menyebabkan overflow
  clean = clean.replace(/<figure([^>]*)>/gi, (_match, attrs) => {
    let cleanAttrs = attrs
      .replace(/style="([^"]*)"/gi, (_m: string, s: string) => {
        const filtered = s.replace(/(?:max-)?width\s*:\s*[^;]+;?/gi, '').trim();
        return filtered ? `style="${filtered}"` : '';
      })
      .replace(/\s*width="[^"]*"/gi, '');
    return `<figure${cleanAttrs}>`;
  });

  return clean.trim();
}

/**
 * Menarik artikel dari 1 sumber media spesifik (WP REST API / RSS),
 * mengunduh gambar ke R2 (WebP), dan menyimpannya ke curation_queue.
 */
async function ingestFromSource(src: any, db: any, c: any): Promise<number> {
  let ingestedFromSource = 0;
  const limit = 10;
  const cleanBase = (src.base_url || '').replace(/\/+$/, '');
  const feedType = src.feed_type || 'wp_api';

  // 1. Coba WordPress REST API jika feed_type wp_api atau URL mengandung wp-json
  if (feedType === 'wp_api' || (src.feed_url && src.feed_url.includes('wp-json'))) {
    try {
      const wpApiUrl = src.feed_url || `${cleanBase}/wp-json/wp/v2/posts?per_page=10&_embed`;
      const res = await fetch(wpApiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        const posts = await res.json();
        if (Array.isArray(posts)) {
          for (const post of posts) {
            const title = post.title?.rendered || '';
            const link = post.link || '';
            const content = post.content?.rendered || post.excerpt?.rendered || '';
            const pubDate = post.date || new Date().toISOString();
            const rawExcerpt = post.excerpt?.rendered ? post.excerpt.rendered.replace(/<[^>]+>/g, '').trim().slice(0, 200) : '';

            // Deteksi URL gambar asli
            let origImageUrl = '';
            if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
              origImageUrl = post._embedded['wp:featuredmedia'][0].source_url || '';
            } else if (post.jetpack_featured_media_url) {
              origImageUrl = post.jetpack_featured_media_url;
            } else if (post.yoast_head_json?.og_image?.[0]?.url) {
              origImageUrl = post.yoast_head_json.og_image[0].url;
            } else {
              const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
              if (imgMatch) origImageUrl = imgMatch[1];
            }

            if (title && link) {
              const existing = await db.prepare("SELECT id FROM curation_queue WHERE raw_url = ?").bind(link).first();
              if (!existing) {
                // Bersihkan artikel dari link dan kode html iklan
                const sanitizedContent = sanitizeArticleContent(content);
                const plainText = sanitizedContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                if (plainText.length < 150) {
                  continue;
                }

                const defaultCat = src.default_category || 'Berita Daerah';

                // Download, konversi ke WebP, dan upload gambar sampul ke R2
                let webpUrl = '';
                if (origImageUrl) {
                  webpUrl = await processAndUploadImage(origImageUrl, title, src.name, src.slug, c);
                }

                // Proses seluruh foto di dalam naskah artikel (unduh, konversi WebP, dan simpan ke R2)
                const processedBody = await processArticleInlineImages(sanitizedContent, title, src.name, src.slug, c);

                const queueId = `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                const isAutoPublish = Number(src.auto_publish) === 1;

                if (isAutoPublish) {
                  // Cek apakah judul artikel yang sama sudah pernah ter-publish
                  const existingPost = await db.prepare("SELECT id FROM posts WHERE title = ?").bind(title).first();
                  if (existingPost) {
                    continue;
                  }

                  // Direct publish ke tabel posts CMSMu!
                  try {
                    const postSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80) + '-' + Date.now().toString(36);
                    const finalBody = processedBody + `
<blockquote class="attribution-box border-l-4 border-emerald-600 pl-4 py-2 my-4 bg-emerald-50 text-slate-700 text-sm">
  <strong>Sumber Berita:</strong> Disadur dari <a href="${link}" target="_blank" rel="noopener canonical" class="text-emerald-700 font-semibold underline">${src.name}</a> untuk kepentingan syiar dakwah persyarikatan.
</blockquote>`;
                    let validPubDate = new Date().toISOString();
                    try {
                      const parsed = new Date(pubDate);
                      if (!isNaN(parsed.getTime())) validPubDate = parsed.toISOString();
                    } catch (e) {}

                    await db.prepare(`
                      INSERT INTO posts (title, slug, body, status, category, featured_image, author, excerpt, created_at, updated_at)
                      VALUES (?, ?, ?, 'publish', ?, ?, ?, ?, ?, ?)
                    `).bind(title, postSlug, finalBody, defaultCat, webpUrl, src.name || 'Redaksi CMSMu', rawExcerpt, validPubDate, validPubDate).run();

                    // Catat ke antrean dengan status published
                    await db.prepare(`
                      INSERT INTO curation_queue (id, source_id, raw_title, raw_content_html, raw_url, raw_published_at, raw_image, raw_description, default_category, status)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
                    `).bind(queueId, src.id, title, processedBody, link, pubDate, webpUrl, rawExcerpt, defaultCat).run();
                    ingestedFromSource++;
                  } catch (postErr) {
                    console.error(`Error auto-publishing post ${title}:`, postErr);
                  }
                } else {
                  // Simpan ke meja kurasi sebagai pending
                  try {
                    await db.prepare(`
                      INSERT INTO curation_queue (id, source_id, raw_title, raw_content_html, raw_url, raw_published_at, raw_image, raw_description, default_category, status)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
                    `).bind(queueId, src.id, title, processedBody, link, pubDate, webpUrl, rawExcerpt, defaultCat).run();
                    ingestedFromSource++;
                  } catch (dupErr) {}
                }
              }
            }
          }
        }
      }
    } catch (wpErr) {
      console.error(`Error WP API ${src.name}:`, wpErr);
    }
  }

  // 2. Jika bukan wp_api atau jika wp_api gagal dapat berita dan ada feed_url RSS
  if (ingestedFromSource === 0 && src.feed_url) {
    try {
      const rssUrl = src.feed_url.includes('wp-json') ? `${cleanBase}/feed/` : src.feed_url;
      const res = await fetch(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
      });

      if (res.ok) {
        const xml = await res.text();
        const itemRegex = /<item[\s\S]*?<\/item>/gi;
        let match;

        while ((match = itemRegex.exec(xml)) !== null) {
          const itemXml = match[0];
          const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/i);
          const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/link>/i);
          
          // Prioritaskan <content:encoded> untuk mengambil seluruh isi artikel secara utuh!
          const contentEncodedMatch = itemXml.match(/<content:encoded>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/content:encoded>/i);
          const descOnlyMatch = itemXml.match(/<description>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/description>/i);
          const rawFullContent = (contentEncodedMatch?.[1] || contentEncodedMatch?.[2] || '').trim();
          const rawDescContent = (descOnlyMatch?.[1] || descOnlyMatch?.[2] || '').trim();
          const rawChosenContent = rawFullContent || rawDescContent;

          const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
          const encMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
          const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
          
          // Deteksi gambar dari tag khusus atau dari dalam isi konten
          const imgInsideContent = rawChosenContent.match(/<img[^>]+src=["']([^"']+)["']/i);
          let origImageUrl = encMatch?.[1] || mediaMatch?.[1] || imgInsideContent?.[1] || '';

          const title = (titleMatch?.[1] || titleMatch?.[2] || '').trim();
          const link = (linkMatch?.[1] || linkMatch?.[2] || '').trim();
          const content = rawChosenContent;
          const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
          const rawExcerpt = rawDescContent.replace(/<[^>]+>/g, '').trim().slice(0, 200);

          if (title && link) {
            const existing = await db.prepare("SELECT id FROM curation_queue WHERE raw_url = ?").bind(link).first();
            if (!existing) {
              // Jika gambar masih kosong, coba fetch ringan og:image dari link halaman aslinya
              if (!origImageUrl && link.startsWith('http')) {
                try {
                  const pageRes = await fetch(link, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
                  });
                  if (pageRes.ok) {
                    const pageHtml = await pageRes.text();
                    const ogMatch = pageHtml.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
                                 || pageHtml.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
                    if (ogMatch && ogMatch[1]) {
                      origImageUrl = ogMatch[1];
                    }
                  }
                } catch (ogErr) {}
              }

              // Bersihkan artikel dari link dan kode html iklan
              const sanitizedContent = sanitizeArticleContent(content);
              const plainText = sanitizedContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
              if (plainText.length < 150) {
                continue;
              }

              const defaultCat = src.default_category || 'Berita Daerah';

              // Download, konversi ke WebP, dan upload gambar sampul ke R2
              let webpUrl = '';
              if (origImageUrl) {
                webpUrl = await processAndUploadImage(origImageUrl, title, src.name, src.slug, c);
              }

              // Proses seluruh foto di dalam naskah artikel (unduh, konversi WebP, dan simpan ke R2)
              const processedBody = await processArticleInlineImages(sanitizedContent, title, src.name, src.slug, c);

              const queueId = `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
              const isAutoPublish = Number(src.auto_publish) === 1;

              if (isAutoPublish) {
                // Cek apakah judul artikel yang sama sudah pernah ter-publish
                const existingPost = await db.prepare("SELECT id FROM posts WHERE title = ?").bind(title).first();
                if (existingPost) {
                  continue;
                }

                // Direct publish ke tabel posts CMSMu!
                try {
                  const postSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80) + '-' + Date.now().toString(36);
                  const finalBody = processedBody + `
<blockquote class="attribution-box border-l-4 border-emerald-600 pl-4 py-2 my-4 bg-emerald-50 text-slate-700 text-sm">
  <strong>Sumber Berita:</strong> Disadur dari <a href="${link}" target="_blank" rel="noopener canonical" class="text-emerald-700 font-semibold underline">${src.name}</a> untuk kepentingan syiar dakwah persyarikatan.
</blockquote>`;
                  let validPubDate = new Date().toISOString();
                  try {
                    const parsed = new Date(pubDate);
                    if (!isNaN(parsed.getTime())) validPubDate = parsed.toISOString();
                  } catch (e) {}

                  await db.prepare(`
                    INSERT INTO posts (title, slug, body, status, category, featured_image, author, excerpt, created_at, updated_at)
                    VALUES (?, ?, ?, 'publish', ?, ?, ?, ?, ?, ?)
                  `).bind(title, postSlug, finalBody, defaultCat, webpUrl, src.name || 'Redaksi CMSMu', rawExcerpt, validPubDate, validPubDate).run();

                  // Catat ke antrean dengan status published
                  await db.prepare(`
                    INSERT INTO curation_queue (id, source_id, raw_title, raw_content_html, raw_url, raw_published_at, raw_image, raw_description, default_category, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
                  `).bind(queueId, src.id, title, processedBody, link, pubDate, webpUrl, rawExcerpt, defaultCat).run();
                  ingestedFromSource++;
                } catch (postErr) {
                  console.error(`Error auto-publishing post ${title}:`, postErr);
                }
              } else {
                // Simpan ke antrean meja kurasi
                try {
                  await db.prepare(`
                    INSERT INTO curation_queue (id, source_id, raw_title, raw_content_html, raw_url, raw_published_at, raw_image, raw_description, default_category, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
                  `).bind(queueId, src.id, title, processedBody, link, pubDate, webpUrl, rawExcerpt, defaultCat).run();
                  ingestedFromSource++;
                } catch (dupErr) {}
              }
            }
          }
        }
      }
    } catch (rssErr) {
      console.error(`Error RSS ${src.name}:`, rssErr);
    }
  }

  // 3. Jalur HTML Scraper Otomatis (Portal Non-WordPress seperti UM Surabaya / CodeIgniter)
  if (ingestedFromSource === 0 && (feedType === 'html_scraper' || (src.feed_url && (src.feed_url.includes('/news') || src.feed_url.includes('/berita'))))) {
    try {
      const targetListUrl = src.feed_url || `${cleanBase}/news`;
      const resp = await fetch(targetListUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (resp.ok) {
        const html = await resp.text();
        // Deteksi pola link artikel berita
        const urlMatches = [...html.matchAll(/https?:\/\/[^\s"'<>]+(?:\/news\/|\/berita\/|\/article\/)([a-zA-Z0-9_-]+)/gi)];
        const candidateUrls = [...new Set(urlMatches.map(m => m[0]))]
          .filter(u => {
            const lower = u.toLowerCase();
            return !lower.includes('/category/') &&
                   !lower.includes('/kategori/') &&
                   !lower.includes('/tag/') &&
                   !lower.includes('/tags/') &&
                   !lower.includes('/author/') &&
                   !lower.includes('/penulis/') &&
                   !lower.includes('/arsip/') &&
                   !lower.includes('/archive/') &&
                   !lower.includes('/page/') &&
                   !lower.includes('/feed/') &&
                   !lower.endsWith('/category') &&
                   !lower.endsWith('/kategori') &&
                   !lower.endsWith('/tag') &&
                   !lower.endsWith('/arsip');
          });

        for (const link of candidateUrls) {
          if (ingestedFromSource >= limit) break;

          const existing = await db.prepare("SELECT id FROM curation_queue WHERE raw_url = ?").bind(link).first();
          if (!existing) {
            try {
              const artResp = await fetch(link, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
              });
              if (!artResp.ok) continue;

              const artHtml = await artResp.text();
              const ogTitleMatch = artHtml.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                                   artHtml.match(/<title>([^<]+)<\/title>/i);
              let title = ogTitleMatch ? ogTitleMatch[1].trim() : '';
              title = title.replace(/\s*-\s*Universitas Muhammadiyah.*$/i, '').trim();

              const lowerTitle = title.toLowerCase().trim();
              const invalidTitles = [
                'penelitian', 'kabar fakultas', 'artikel', 'prestasi', 'pengabdian',
                'riset dan inovasi', 'seminar dan workshop', 'berita', 'news', 'arsip',
                'kategori', 'category', 'home', 'beranda', 'daftar berita', 'indeks berita'
              ];
              if (invalidTitles.includes(lowerTitle) || (src.name && lowerTitle === src.name.toLowerCase().trim())) {
                continue;
              }

              const ogImgMatch = artHtml.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
              const origImageUrl = ogImgMatch ? ogImgMatch[1].trim() : '';

              const ogDescMatch = artHtml.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
              const rawExcerpt = ogDescMatch ? ogDescMatch[1].trim().slice(0, 200) : '';

              // Ekstraksi Konten Artikel Pintar (Pilih kontainer dengan narasi teks terpanjang)
              let content = '';
              const articleTagMatch = artHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
              const specificDivMatch = artHtml.match(/<div[^>]*class=["'][^"']*\b(?:prose-modern|article-body|prose|entry-content|post-content|news-content)\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
              const kontenIdMatch = artHtml.match(/<div[^>]*id=["'](?:konten|content)["'][^>]*>([\s\S]*?)<\/div>/i);

              const candidates = [specificDivMatch, articleTagMatch, kontenIdMatch]
                .filter(Boolean)
                .map(m => m ? m[1] : '');

              for (const cand of candidates) {
                const candText = cand.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                const currText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                if (candText.length > currText.length) {
                  content = cand;
                }
              }

              if (title && content) {
                const sanitizedContent = sanitizeArticleContent(content);
                const plainText = sanitizedContent
                  .replace(/<blockquote[^>]*class=["'][^"']*attribution-box[\s\S]*?<\/blockquote>/gi, '')
                  .replace(/<[^>]+>/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();

                // Tolak naskah jika teks narasi kurang dari 150 karakter
                if (plainText.length < 150) {
                  continue;
                }

                const defaultCat = src.default_category || 'Berita Daerah';

                // Download, konversi ke WebP, dan upload gambar sampul ke R2
                let webpUrl = '';
                if (origImageUrl) {
                  webpUrl = await processAndUploadImage(origImageUrl, title, src.name, src.slug, c);
                }

                // Proses seluruh foto di dalam naskah artikel (unduh, konversi WebP, dan simpan ke R2)
                const processedBody = await processArticleInlineImages(sanitizedContent, title, src.name, src.slug, c);

                const queueId = `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                const isAutoPublish = Number(src.auto_publish) === 1;
                const pubDate = new Date().toISOString();

                if (isAutoPublish) {
                  // Cek apakah judul artikel yang sama sudah pernah ter-publish
                  const existingPost = await db.prepare("SELECT id FROM posts WHERE title = ?").bind(title).first();
                  if (existingPost) {
                    continue;
                  }
                  try {
                    const postSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80) + '-' + Date.now().toString(36);
                    const finalBody = processedBody + `
<blockquote class="attribution-box border-l-4 border-emerald-600 pl-4 py-2 my-4 bg-emerald-50 text-slate-700 text-sm">
  <strong>Sumber Berita:</strong> Disadur dari <a href="${link}" target="_blank" rel="noopener canonical" class="text-emerald-700 font-semibold underline">${src.name}</a> untuk kepentingan syiar dakwah persyarikatan.
</blockquote>`;
                    await db.prepare(`
                      INSERT INTO posts (title, slug, body, status, category, featured_image, author, excerpt, created_at, updated_at)
                      VALUES (?, ?, ?, 'publish', ?, ?, ?, ?, ?, ?)
                    `).bind(title, postSlug, finalBody, defaultCat, webpUrl, src.name || 'Redaksi CMSMu', rawExcerpt, pubDate, pubDate).run();

                    await db.prepare(`
                      INSERT INTO curation_queue (id, source_id, raw_title, raw_content_html, raw_url, raw_published_at, raw_image, raw_description, default_category, status)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
                    `).bind(queueId, src.id, title, processedBody, link, pubDate, webpUrl, rawExcerpt, defaultCat).run();
                    ingestedFromSource++;
                  } catch (postErr) {
                    console.error(`Error auto-publishing scraper post ${title}:`, postErr);
                  }
                } else {
                  try {
                    await db.prepare(`
                      INSERT INTO curation_queue (id, source_id, raw_title, raw_content_html, raw_url, raw_published_at, raw_image, raw_description, default_category, status)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
                    `).bind(queueId, src.id, title, processedBody, link, pubDate, webpUrl, rawExcerpt, defaultCat).run();
                    ingestedFromSource++;
                  } catch (dupErr) {}
                }
              }
            } catch (artErr) {
              console.error(`Error scraping article ${link}:`, artErr);
            }
          }
        }
      }
    } catch (scraperErr) {
      console.error(`Error HTML scraper ${src.name}:`, scraperErr);
    }
  }

  await db.prepare("UPDATE media_sources SET last_fetched_at = CURRENT_TIMESTAMP WHERE id = ?").bind(src.id).run();
  return ingestedFromSource;
}

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

    // Ambil semua sumber aktif yang auto_sync = 1
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
    let totalImagesConverted = 0;

    for (const post of posts.results || []) {
      const oldBody = post.body || '';
      // Proses konversi gambar inline ke WebP R2
      let newBody = await processArticleInlineImages(oldBody, post.title || 'Foto Artikel', post.author || 'Redaksi', 'migrated', c);

      // Bersihkan juga hardcoded inline style width pada figure dan img
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

