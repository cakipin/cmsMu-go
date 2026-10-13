import { Hono } from 'hono';
import { getDb } from '@cmsmu/db';
import { magazines, subscriptions, users, settings } from '@cmsmu/db';
import { eq, desc, and, or } from 'drizzle-orm';
import { verifyUserToken, getJwtSecret } from '../../apps/cms-api/src/modules/users/auth.helper';
import { getStorageBucket } from '../../apps/cms-api/src/storage/r2-adapter';

type Bindings = {
  DB: D1Database;
  MEDIA_BUCKET?: R2Bucket;
  BUCKET?: R2Bucket;
  MY_BUCKET?: R2Bucket;
  R2?: R2Bucket;
  JWT_SECRET?: string;
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
};

export const emagazineRouter = new Hono<{ Bindings: Bindings }>();
export const publicEmagazineRouter = new Hono<{ Bindings: Bindings }>();

export const DEFAULT_PLANS_CONFIG = {
  plans: [
    { id: '1_bulan', name: '1 Bulan', months: 1, price: 50000, badge: '', desc: 'Akses Penuh 30 Hari', active: true },
    { id: '3_bulan', name: '3 Bulan', months: 3, price: 135000, badge: 'HEMAT 10%', desc: 'Rp 45.000 / bln', active: true },
    { id: '6_bulan', name: '6 Bulan', months: 6, price: 255000, badge: 'HEMAT 15%', desc: 'Rp 42.500 / bln', active: true },
    { id: '1_tahun', name: '1 Tahun', months: 12, price: 480000, badge: '⭐ PALING HEMAT', desc: 'Rp 40.000 / bln (20% Off)', active: true }
  ],
  bank1: { name: 'Bank Syariah Indonesia (BSI)', account: '8877665544', holder: "Suara 'Aisyiyah" },
  bank2: { name: 'Bank Central Asia (BCA)', account: '', holder: "Suara 'Aisyiyah" },
  qrisImage: '',
  whatsapp: '081234567890',
  instructions: 'Transfer sesuai nominal paket ke rekening resmi di atas, kemudian unggah foto bukti transfer pada formulir pembayaran.',
  defaultPreviewPages: 5
};

export async function getPlansConfig(db: any) {
  try {
    const row = await getDb(db).select().from(settings).where(eq(settings.key, 'emagazine_plans_config')).get();
    if (row && row.value) {
      const parsed = JSON.parse(row.value);
      return {
        ...DEFAULT_PLANS_CONFIG,
        ...parsed,
        plans: parsed.plans && Array.isArray(parsed.plans) && parsed.plans.length > 0 ? parsed.plans : DEFAULT_PLANS_CONFIG.plans,
        bank1: { ...DEFAULT_PLANS_CONFIG.bank1, ...(parsed.bank1 || {}) },
        bank2: { ...DEFAULT_PLANS_CONFIG.bank2, ...(parsed.bank2 || {}) }
      };
    }
  } catch (e) {
    console.error('Error getPlansConfig:', e);
  }
  return DEFAULT_PLANS_CONFIG;
}

const getBucket = (c: any): R2Bucket | undefined => {
  return getStorageBucket(c);
};

const JWT_FALLBACK_SECRET = 'suara-aisyiyah-secret-key-2026';

// Helper: Verifikasi apakah user adalah subscriber_pro aktif atau admin/editor
async function checkSubscriberOrAdmin(c: any): Promise<boolean> {
  try {
    let token = '';
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const cookieHeader = c.req.header('Cookie') || '';
      const match = cookieHeader.match(/(?:^|;\s*)labmu_token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      } else {
        token = c.req.query('token') || '';
      }
    }

    if (!token) return false;

    // Decode token: dukung format base64 JSON (cmsMu default) atau verify
    let payload: any = null;
    try {
      payload = await verifyUserToken(token, getJwtSecret(c.env));
    } catch {
      payload = null;
    }

    if (!payload) return false;

    const role = (payload.role || '').toLowerCase();
    if (role === 'admin' || role === 'editor') return true;

    const db = getDb(c.env.DB);

    // Kumpulkan kondisi identifikasi user (ID, username, email)
    const userConditions: any[] = [];
    if (payload.id && !isNaN(Number(payload.id))) userConditions.push(eq(users.id, Number(payload.id)));
    if (payload.username) userConditions.push(eq(users.username, String(payload.username)));
    if (payload.email) userConditions.push(eq(users.email, String(payload.email)));
    if (payload.username && String(payload.username).includes('@')) userConditions.push(eq(users.email, String(payload.username)));

    let user: any = null;
    if (userConditions.length > 0) {
      user = await db.select({
        id: users.id,
        role: users.role,
        email: users.email,
        subscriptionExpiresAt: users.subscriptionExpiresAt
      }).from(users).where(or(...userConditions)).get();
    }

    // 1. Cek User langsung: role subscriber_pro dan masa aktif kuota
    if (user) {
      const userRole = (user.role || '').toLowerCase();
      if (['subscriber_pro', 'pro', 'premium'].includes(userRole)) {
        if (!user.subscriptionExpiresAt) return true;
        const normalizedDate = String(user.subscriptionExpiresAt).replace(' ', 'T');
        if (new Date(normalizedDate) > new Date()) return true;
      }
    }

    // 2. Fallback: Cek tabel subscriptions jika ada record approved yang belum expired
    const targetUserId = user ? user.id : (payload.id && !isNaN(Number(payload.id)) ? Number(payload.id) : null);
    const subConditions: any[] = [];
    if (targetUserId) subConditions.push(eq(subscriptions.userId, targetUserId));
    if (user && user.email) subConditions.push(eq(subscriptions.email, user.email));
    if (payload.email) subConditions.push(eq(subscriptions.email, String(payload.email)));

    if (subConditions.length > 0) {
      const sub = await db.select({ id: subscriptions.id, status: subscriptions.status, expiresAt: subscriptions.expiresAt })
        .from(subscriptions)
        .where(and(or(...subConditions), or(eq(subscriptions.status, 'approved'), eq(subscriptions.status, 'active'))))
        .get();

      if (sub) {
        if (!sub.expiresAt) return true;
        const normalizedSubDate = String(sub.expiresAt).replace(' ', 'T');
        if (new Date(normalizedSubDate) > new Date()) return true;
      }
    }

    // 3. Fallback jika role di token pengguna adalah subscriber_pro/pro
    if (['subscriber_pro', 'pro', 'premium'].includes(role) && !user) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// ==========================================
// 1. ADMIN ENDPOINTS (Protected by auth)
// ==========================================

// GET /api/emagazine/plans-config -> Get subscription plans and payment setup
emagazineRouter.get('/plans-config', async (c) => {
  const config = await getPlansConfig(c.env.DB);
  return c.json(config);
});

// POST /api/emagazine/plans-config -> Save subscription plans and payment setup
emagazineRouter.post('/plans-config', async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body) return c.json({ error: 'Data pengaturan tidak valid' }, 400);

    const db = getDb(c.env.DB);
    const existing = await db.select().from(settings).where(eq(settings.key, 'emagazine_plans_config')).get();

    const jsonValue = JSON.stringify(body);
    if (existing) {
      await db.update(settings).set({ value: jsonValue }).where(eq(settings.key, 'emagazine_plans_config')).run();
    } else {
      await db.insert(settings).values({ key: 'emagazine_plans_config', value: jsonValue }).run();
    }

    return c.json({ success: true, message: 'Pengaturan paket & harga berhasil disimpan', config: body });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET /api/emagazine -> List all magazines
emagazineRouter.get('/', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const list = await db.select().from(magazines).orderBy(desc(magazines.id));
    return c.json(list || []);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET /api/emagazine/:id -> Single magazine
emagazineRouter.get('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const db = getDb(c.env.DB);
    const item = await db.select().from(magazines).where(eq(magazines.id, id)).get();
    if (!item) return c.json({ error: 'Edisi majalah tidak ditemukan' }, 404);
    return c.json(item);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// POST /api/emagazine -> Upload PDF and create magazine
emagazineRouter.post('/', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['pdf_file'];
    const coverFile = body['cover_file'];
    const title = (body['title'] as string) || '';
    let slug = (body['slug'] as string) || '';
    const editionNumber = (body['edition_number'] as string) || '';
    const publicationDate = (body['publication_date'] as string) || '';
    let coverImage = (body['cover_image'] as string) || '';
    const description = (body['description'] as string) || '';
    const totalPages = Number(body['total_pages']) || 0;
    const previewPages = Number(body['preview_pages']) || 5;
    const isFree = Number(body['is_free']) || 0;
    const status = (body['status'] as string) || 'published';

    if (!title) return c.json({ error: 'Judul edisi majalah wajib diisi' }, 400);

    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const r2 = getBucket(c);
    if (!r2) return c.json({ error: 'R2 storage tidak terhubung' }, 500);

    // 1. Upload Cover Image jika diunggah berkas
    if (coverFile && typeof coverFile !== 'string') {
      const date = new Date();
      const folder = 'magazines/covers/' + date.getFullYear() + '/' + String(date.getMonth() + 1).padStart(2, '0');
      const cleanCoverName = (coverFile.name || 'cover.jpg').replace(/[^a-zA-Z0-9._-]/g, '');
      const coverKey = folder + '/' + Date.now() + '-' + cleanCoverName;
      await r2.put(coverKey, await coverFile.arrayBuffer(), {
        httpMetadata: { contentType: coverFile.type || 'image/jpeg' },
      });
      coverImage = '/api/media/file/' + coverKey;
    }

    // 2. Upload PDF Majalah
    let pdfKey = '';
    if (file && typeof file !== 'string') {
      const date = new Date();
      const folder = 'magazines/' + date.getFullYear() + '/' + String(date.getMonth() + 1).padStart(2, '0');
      const cleanName = (file.name || 'magazine.pdf').replace(/[^a-zA-Z0-9._-]/g, '');
      pdfKey = folder + '/' + Date.now() + '-' + cleanName;

      await r2.put(pdfKey, await file.arrayBuffer(), {
        httpMetadata: { contentType: 'application/pdf' },
      });
    } else {
      pdfKey = (body['pdf_r2_key'] as string) || '';
    }

    if (!pdfKey) {
      return c.json({ error: 'Berkas PDF majalah wajib diunggah' }, 400);
    }

    const db = getDb(c.env.DB);
    const res = await db.insert(magazines).values({
      title,
      slug,
      description,
      editionNumber,
      publicationDate,
      coverImage: coverImage || '/api/media/file/images/default-cover.jpg',
      pdfR2Key: pdfKey,
      totalPages,
      previewPages,
      status,
      isFree,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).run();

    if (!res.success) return c.json({ error: 'Gagal menyimpan ke database' }, 500);

    return c.json({ success: true, message: 'Edisi majalah berhasil ditambahkan!' });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// PUT /api/emagazine/:id -> Update magazine
emagazineRouter.put('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const body = await c.req.parseBody().catch(async () => await c.req.json());
    const db = getDb(c.env.DB);

    const existing = await db.select().from(magazines).where(eq(magazines.id, id)).get();
    if (!existing) return c.json({ error: 'Edisi majalah tidak ditemukan' }, 404);

    const r2 = getBucket(c);

    // 1. Upload Cover Image Baru jika ada
    let coverUrl = (body['cover_image'] as string) ?? existing.coverImage;
    const coverFile = body['cover_file'];
    if (coverFile && typeof coverFile !== 'string') {
      if (r2) {
        const date = new Date();
        const folder = 'magazines/covers/' + date.getFullYear() + '/' + String(date.getMonth() + 1).padStart(2, '0');
        const cleanCoverName = (coverFile.name || 'cover.jpg').replace(/[^a-zA-Z0-9._-]/g, '');
        const coverKey = folder + '/' + Date.now() + '-' + cleanCoverName;
        await r2.put(coverKey, await coverFile.arrayBuffer(), {
          httpMetadata: { contentType: coverFile.type || 'image/jpeg' },
        });
        coverUrl = '/api/media/file/' + coverKey;
      }
    }

    // 2. Upload PDF Baru jika ada
    let pdfKey = existing.pdfR2Key;
    const file = body['pdf_file'];
    if (file && typeof file !== 'string') {
      if (r2) {
        const date = new Date();
        const folder = 'magazines/' + date.getFullYear() + '/' + String(date.getMonth() + 1).padStart(2, '0');
        const cleanName = (file.name || 'magazine.pdf').replace(/[^a-zA-Z0-9._-]/g, '');
        pdfKey = folder + '/' + Date.now() + '-' + cleanName;
        await r2.put(pdfKey, await file.arrayBuffer(), {
          httpMetadata: { contentType: 'application/pdf' },
        });
      }
    }

    await db.update(magazines).set({
      title: (body['title'] as string) ?? existing.title,
      slug: (body['slug'] as string) ?? existing.slug,
      description: (body['description'] as string) ?? existing.description,
      editionNumber: (body['edition_number'] as string) ?? existing.editionNumber,
      publicationDate: (body['publication_date'] as string) ?? existing.publicationDate,
      coverImage: coverUrl,
      pdfR2Key: pdfKey,
      totalPages: body['total_pages'] !== undefined ? Number(body['total_pages']) : existing.totalPages,
      previewPages: body['preview_pages'] !== undefined ? Number(body['preview_pages']) : existing.previewPages,
      status: (body['status'] as string) ?? existing.status,
      isFree: body['is_free'] !== undefined ? Number(body['is_free']) : existing.isFree,
      updatedAt: new Date().toISOString(),
    }).where(eq(magazines.id, id)).run();

    return c.json({ success: true, message: 'Edisi majalah berhasil diperbarui!' });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// DELETE /api/emagazine/:id -> Delete magazine
emagazineRouter.delete('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const db = getDb(c.env.DB);
    const existing = await db.select().from(magazines).where(eq(magazines.id, id)).get();
    if (existing) {
      const r2 = getBucket(c);
      if (r2 && existing.pdfR2Key) {
        await r2.delete(existing.pdfR2Key).catch(() => {});
      }
      await db.delete(magazines).where(eq(magazines.id, id)).run();
    }
    return c.json({ success: true, message: 'Edisi majalah berhasil dihapus.' });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// ==========================================
// 2. PUBLIC ENDPOINTS
// ==========================================

// GET /api/public/emagazine -> Public catalog of published magazines
publicEmagazineRouter.get('/', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const list = await db.select({
      id: magazines.id,
      title: magazines.title,
      slug: magazines.slug,
      description: magazines.description,
      editionNumber: magazines.editionNumber,
      publicationDate: magazines.publicationDate,
      coverImage: magazines.coverImage,
      totalPages: magazines.totalPages,
      previewPages: magazines.previewPages,
      isFree: magazines.isFree,
      createdAt: magazines.createdAt,
    })
    .from(magazines)
    .where(eq(magazines.status, 'published'))
    .orderBy(desc(magazines.id));

    return c.json(list || []);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET /api/public/emagazine/plans-config -> Public subscription plans and payment info
publicEmagazineRouter.get('/plans-config', async (c) => {
  const config = await getPlansConfig(c.env.DB);
  return c.json(config);
});

// GET /api/public/emagazine/:slug -> Public single magazine metadata
publicEmagazineRouter.get('/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const db = getDb(c.env.DB);
    const item = await db.select({
      id: magazines.id,
      title: magazines.title,
      slug: magazines.slug,
      description: magazines.description,
      editionNumber: magazines.editionNumber,
      publicationDate: magazines.publicationDate,
      coverImage: magazines.coverImage,
      totalPages: magazines.totalPages,
      previewPages: magazines.previewPages,
      isFree: magazines.isFree,
      pdfR2Key: magazines.pdfR2Key,
    })
    .from(magazines)
    .where(and(eq(magazines.slug, slug), eq(magazines.status, 'published')))
    .get();

    if (!item) return c.json({ error: 'Majalah tidak ditemukan' }, 404);

    let hasPdf = false;
    const r2 = getBucket(c);
    if (r2 && item.pdfR2Key) {
      try {
        const head = await r2.head(item.pdfR2Key);
        if (head) hasPdf = true;
      } catch {
        hasPdf = false;
      }
    }

    const isSub = await checkSubscriberOrAdmin(c);
    const { pdfR2Key, ...safeItem } = item;
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    return c.json({ ...safeItem, hasPdf, isSubscriber: isSub });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET & HEAD /api/public/emagazine/:slug/stream -> Stream PDF with Range Support (HTTP 206)
publicEmagazineRouter.on(['GET', 'HEAD'], '/:slug/stream', async (c) => {
  try {
    const slug = c.req.param('slug');
    const db = getDb(c.env.DB);
    const item = await db.select().from(magazines).where(eq(magazines.slug, slug)).get();
    if (!item) return c.text('Edisi majalah tidak ditemukan', 404);

    const r2 = getBucket(c);
    if (!r2) return c.text('R2 storage tidak terhubung', 500);

    // Proteksi Keamanan: Cegah unduhan PDF mentah secara langsung via URL / address bar
    const secFetchDest = c.req.header('sec-fetch-dest');
    const secFetchMode = c.req.header('sec-fetch-mode');
    const upgradeReq = c.req.header('upgrade-insecure-requests');
    const accept = c.req.header('accept') || '';
    if (secFetchDest === 'document' || secFetchMode === 'navigate' || upgradeReq === '1' || accept.includes('text/html')) {
      return c.redirect('/majalah/' + encodeURIComponent(slug));
    }

    const isSub = await checkSubscriberOrAdmin(c);

    // If HEAD request, respond with fast metadata
    if (c.req.method === 'HEAD') {
      const headObj = await r2.head(item.pdfR2Key);
      if (!headObj) return c.text('Berkas PDF tidak ditemukan di storage', 404);
      const headers = new Headers();
      headObj.writeHttpMetadata(headers);
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Content-Type', 'application/pdf');
      headers.set('Content-Length', String(headObj.size));
      headers.set('Content-Disposition', 'inline; filename="' + slug + '.pdf"');
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      headers.set('X-Preview-Pages', String(item.previewPages || 5));
      headers.set('X-Is-Free', String(item.isFree || 0));
      headers.set('X-Is-Subscriber', isSub ? '1' : '0');
      return new Response(null, { status: 200, headers });
    }

    // Parse Range Header for Partial Content (HTTP 206)
    const rangeHeader = c.req.header('range');
    let range: any = undefined;
    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
      if (match) {
        const startStr = match[1];
        const endStr = match[2];
        if (startStr && endStr) {
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          range = { offset: start, length: end - start + 1 };
        } else if (startStr) {
          range = { offset: parseInt(startStr, 10) };
        } else if (endStr) {
          range = { suffix: parseInt(endStr, 10) };
        }
      }
    }

    const obj = await r2.get(item.pdfR2Key, range ? { range } : undefined);
    if (!obj) return c.text('Berkas PDF tidak ditemukan di storage', 404);

    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', 'inline; filename="' + slug + '.pdf"');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    headers.set('X-Preview-Pages', String(item.previewPages || 5));
    headers.set('X-Is-Free', String(item.isFree || 0));
    headers.set('X-Is-Subscriber', isSub ? '1' : '0');

    if (range && 'range' in obj && (obj as any).range) {
      const r = (obj as any).range;
      headers.set('Content-Range', `bytes ${r.offset}-${r.offset + r.length - 1}/${obj.size}`);
      headers.set('Content-Length', String(r.length));
      return new Response(obj.body, { status: 206, headers });
    } else {
      headers.set('Content-Length', String(obj.size));
      return new Response(obj.body, { status: 200, headers });
    }
  } catch (e: any) {
    return c.text(e.message, 500);
  }
});
