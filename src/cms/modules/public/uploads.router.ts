import { Hono } from 'hono';
import { getStorageBucket } from '../../storage/r2-adapter';

type Bindings = {
  DB: D1Database;
  MEDIA_BUCKET?: R2Bucket;
  BUCKET?: R2Bucket;
  MY_BUCKET?: R2Bucket;
  R2?: R2Bucket;
  WP_ORIGIN_URL?: string;
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
};

const uploadsRouter = new Hono<{ Bindings: Bindings }>();

const getBucket = (env: any): R2Bucket | undefined => {
  return getStorageBucket(env);
};

function getContentType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'avif':
      return 'image/avif';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

// Regex pendeteksi ukuran thumbnail WordPress (contoh: -300x169.jpg, -1024x576.jpeg)
const THUMB_REGEX = /-([0-9]+)x([0-9]+)(\.[a-zA-Z0-9]+)$/i;

uploadsRouter.get('*', async (c) => {
  try {
    const fullPath = c.req.path;
    const subpath = fullPath.replace(/^(\/wp-content\/uploads\/|\/uploads\/)/i, '');
    if (!subpath) {
      return c.text('Not Found', 404);
    }

    const decodedSubpath = decodeURIComponent(subpath);
    const bucket = getBucket(c.env);

    const defaultOrigin = 'https://suaraaisyiyah.id';
    const wpOrigin = (c.env.WP_ORIGIN_URL || defaultOrigin).replace(/\/+$/, '');
    const reqHost = c.req.header('host') || '';
    const isSelfHost = wpOrigin.includes(reqHost);

    const isThumbnail = THUMB_REGEX.test(decodedSubpath);

    // =========================================================================
    // SKENARIO A: REQUEST ADALAH THUMBNAIL (Ukuran Turunan WordPress)
    // Sesuai instruksi: "thumbnail jangan disimpan di r2 cukup file gambar aseli"
    // =========================================================================
    if (isThumbnail) {
      // Dapatkan nama file gambar aslinya (buang suffix ukuran -WxH)
      const origSubpath = decodedSubpath.replace(THUMB_REGEX, '$3');

      // Kandidat nama file asli jika ada suffix edit WP (-e123456789)
      const candidates = [origSubpath];
      const strippedEdit = origSubpath.replace(/-e[0-9]+(\.[a-zA-Z0-9]+)$/i, '$1');
      if (strippedEdit !== origSubpath) {
        candidates.push(strippedEdit);
      }

      // 1. Cek apakah gambar aslinya sudah ada di R2
      if (bucket) {
        for (const cand of candidates) {
          const keys = [`wp-content/uploads/${cand}`, `uploads/${cand}`, cand];
          for (const key of keys) {
            const obj = await bucket.get(key);
            if (obj) {
              const headers = new Headers();
              obj.writeHttpMetadata(headers);
              headers.set('etag', obj.httpEtag);
              headers.set('Cache-Control', 'public, max-age=31536000, immutable');
              headers.set('Access-Control-Allow-Origin', '*');
              headers.set('X-Storage-Source', 'R2-ORIGINAL-FOR-THUMBNAIL');
              if (!headers.get('Content-Type') || headers.get('Content-Type') === 'application/octet-stream') {
                headers.set('Content-Type', getContentType(cand));
              }
              return new Response(obj.body, { headers });
            }
          }
        }
      }

      // 2. Gambar asli belum ada di R2 -> Ambil GAMBAR ASLINYA dari origin & simpan HANYA gambar aslinya ke R2
      if (!isSelfHost || !reqHost.includes('suaraaisyiyah.id') || c.env.WP_ORIGIN_URL) {
        for (const cand of candidates) {
          const originOrigUrl = `${wpOrigin}/wp-content/uploads/${encodeURI(cand)}`;
          try {
            const originRes = await fetch(originOrigUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*'
              }
            });

            if (originRes.ok && originRes.status === 200) {
              const contentType = originRes.headers.get('content-type') || getContentType(cand);
              const bodyBuffer = await originRes.arrayBuffer();

              // Simpan HANYA file gambar asli ke R2
              if (bucket) {
                try {
                  const storeKey = `wp-content/uploads/${cand}`;
                  await bucket.put(storeKey, bodyBuffer, {
                    httpMetadata: { contentType }
                  });
                } catch (e: any) {
                  console.warn('[R2 Put Original Error]:', e.message);
                }
              }

              const resHeaders = new Headers();
              resHeaders.set('Content-Type', contentType);
              resHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
              resHeaders.set('Access-Control-Allow-Origin', '*');
              resHeaders.set('X-Storage-Source', 'ORIGIN-FETCH-SAVED-ORIGINAL-TO-R2');

              return new Response(bodyBuffer, { headers: resHeaders });
            }
          } catch (err: any) {
            console.warn(`[Origin Fetch Original (${cand}) Error]:`, err.message);
          }
        }

        // 3. Fallback jika gambar asli tidak ditemukan di origin:
        // Ambil thumbnail dari origin dan sajikan LANGSUNG ke user TANPA disimpan ke R2
        const originThumbUrl = `${wpOrigin}/wp-content/uploads/${encodeURI(decodedSubpath)}`;
        try {
          const thumbRes = await fetch(originThumbUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': '*/*'
            }
          });

          if (thumbRes.ok && thumbRes.status === 200) {
            const contentType = thumbRes.headers.get('content-type') || getContentType(decodedSubpath);
            const bodyBuffer = await thumbRes.arrayBuffer();
            // JANGAN SIMPAN THUMBNAIL KE R2! Cukup sajikan langsung ke user
            const resHeaders = new Headers();
            resHeaders.set('Content-Type', contentType);
            resHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
            resHeaders.set('Access-Control-Allow-Origin', '*');
            resHeaders.set('X-Storage-Source', 'ORIGIN-THUMBNAIL-DIRECT-NO-R2');
            return new Response(bodyBuffer, { headers: resHeaders });
          }
        } catch (err: any) {
          console.warn('[Origin Thumb Fetch Error]:', err.message);
        }
      }

      return c.text('Image Not Found', 404);
    }

    // =========================================================================
    // SKENARIO B: REQUEST ADALAH GAMBAR ASLI (Bukan Thumbnail)
    // =========================================================================
    // 1. Cek langsung ke Cloudflare R2
    if (bucket) {
      const r2KeysToCheck = [
        `uploads/${decodedSubpath}`,
        `wp-content/uploads/${decodedSubpath}`,
        decodedSubpath
      ];

      for (const key of r2KeysToCheck) {
        const obj = await bucket.get(key);
        if (obj) {
          const headers = new Headers();
          obj.writeHttpMetadata(headers);
          headers.set('etag', obj.httpEtag);
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
          headers.set('Access-Control-Allow-Origin', '*');
          headers.set('X-Storage-Source', 'R2-EXACT-ORIGINAL');
          if (!headers.get('Content-Type') || headers.get('Content-Type') === 'application/octet-stream') {
            headers.set('Content-Type', getContentType(decodedSubpath));
          }
          return new Response(obj.body, { headers });
        }
      }
    }

    // 2. Jika belum ada di R2 -> Ambil dari Origin & simpan ke R2
    if (!isSelfHost || !reqHost.includes('suaraaisyiyah.id') || c.env.WP_ORIGIN_URL) {
      const targetOriginUrl = `${wpOrigin}/wp-content/uploads/${encodeURI(decodedSubpath)}`;
      try {
        const originRes = await fetch(targetOriginUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*'
          }
        });

        if (originRes.ok && originRes.status === 200) {
          const contentType = originRes.headers.get('content-type') || getContentType(decodedSubpath);
          const bodyBuffer = await originRes.arrayBuffer();

          // Simpan gambar asli ke R2
          if (bucket) {
            try {
              const storeKey = `wp-content/uploads/${decodedSubpath}`;
              await bucket.put(storeKey, bodyBuffer, {
                httpMetadata: { contentType }
              });
            } catch (e: any) {
              console.warn('[R2 Put Original Error]:', e.message);
            }
          }

          const resHeaders = new Headers();
          resHeaders.set('Content-Type', contentType);
          resHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
          resHeaders.set('Access-Control-Allow-Origin', '*');
          resHeaders.set('X-Storage-Source', 'ORIGIN-FETCH-SAVED-TO-R2');

          return new Response(bodyBuffer, { headers: resHeaders });
        }
      } catch (err: any) {
        console.warn('[Origin Fetch Error]:', err.message);
      }
    }

    return c.text('Image Not Found', 404);
  } catch (err: any) {
    return c.text(`Uploads router error: ${err.message}`, 500);
  }
});

export default uploadsRouter;
