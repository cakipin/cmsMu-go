import { Hono } from 'hono';
import { getDb, mediaMeta } from '@cmsmu/db';
import { eq, desc } from 'drizzle-orm';
import { requireAuth, requireRole, type ApiEnv } from '../middleware/auth.middleware';

const mediaRouter = new Hono<ApiEnv>();

// 1. LIST MEDIA FILES
mediaRouter.get('/', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const items = await db.select().from(mediaMeta).orderBy(desc(mediaMeta.createdAt)).limit(100);
    return c.json(items || []);
  } catch (e: any) {
    return c.json({ error: 'Gagal mengambil daftar media: ' + e.message }, 500);
  }
});

// 2. GET FILE FROM R2 BUCKET (STREAMING)
mediaRouter.get('/file/*', async (c) => {
  try {
    const rawPath = c.req.path.replace(/^\/api\/media\/file\/?/, '');
    const key = decodeURIComponent(rawPath);

    if (!key) return c.json({ error: 'Key file tidak valid' }, 400);
    if (!c.env.BUCKET) return c.json({ error: 'Storage R2 tidak terkonfigurasi' }, 500);

    const object = await c.env.BUCKET.get(key);
    if (!object) return c.json({ error: 'File tidak ditemukan di storage' }, 404);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000, immutable');

    return new Response(object.body, { headers });
  } catch (e: any) {
    return c.json({ error: 'Gagal mengambil file: ' + e.message }, 500);
  }
});

// 3. UPLOAD FILE TO R2 BUCKET (Protected: Admin & Editor)
mediaRouter.post('/upload', requireAuth, requireRole(['admin', 'editor', 'author']), async (c) => {
  try {
    if (!c.env.BUCKET) return c.json({ error: 'Storage R2 tidak terkonfigurasi' }, 500);

    const formData = await c.req.formData().catch(() => null);
    if (!formData) return c.json({ error: 'Form data tidak valid' }, 400);

    const file = formData.get('file') as File | null;
    if (!file) return c.json({ error: 'File tidak ditemukan dalam request' }, 400);

    const filename = file.name || 'upload.jpg';
    const ext = filename.split('.').pop() || 'bin';
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `uploads/${timestamp}_${randomSuffix}_${cleanName}`;

    const arrayBuffer = await file.arrayBuffer();
    const contentType = file.type || 'application/octet-stream';

    // Simpan ke Cloudflare R2
    await c.env.BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: contentType,
      },
    });

    const publicUrl = `/api/media/file/${key}`;
    const now = String(timestamp);
    const db = getDb(c.env.DB);

    // Simpan metadata ke D1
    const metaRecord = await db.insert(mediaMeta).values({
      key: key,
      url: publicUrl,
      type: contentType,
      size: file.size,
      alt: filename,
      title: filename,
      createdAt: now
    }).returning().get();

    return c.json({
      success: true,
      message: 'File berhasil diunggah',
      file: {
        id: metaRecord?.id,
        key: key,
        url: publicUrl,
        size: file.size,
        type: contentType,
        name: filename
      }
    }, 201);
  } catch (e: any) {
    return c.json({ error: 'Gagal mengunggah file: ' + e.message }, 500);
  }
});

// 4. DELETE MEDIA (Protected: Admin Only)
mediaRouter.delete('/:idOrKey', requireAuth, requireRole(['admin']), async (c) => {
  try {
    const idOrKey = c.req.param('idOrKey') || '';
    const db = getDb(c.env.DB);
    const numId = parseInt(idOrKey, 10);

    const record = !isNaN(numId)
      ? await db.select().from(mediaMeta).where(eq(mediaMeta.id, numId)).get()
      : await db.select().from(mediaMeta).where(eq(mediaMeta.key, idOrKey)).get();

    if (!record) return c.json({ error: 'Data media tidak ditemukan' }, 404);

    // Hapus dari R2 jika binding tersedia
    if (c.env.BUCKET && record.key) {
      await c.env.BUCKET.delete(record.key).catch(() => {});
    }

    // Hapus dari database D1
    await db.delete(mediaMeta).where(eq(mediaMeta.id, record.id)).run();

    return c.json({ success: true, message: 'Media berhasil dihapus' });
  } catch (e: any) {
    return c.json({ error: 'Gagal menghapus media: ' + e.message }, 500);
  }
});

export default mediaRouter;
