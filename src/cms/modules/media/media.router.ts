import { Hono } from 'hono';

// [PERBAIKAN] Sesuaikan tipe ini dengan Log Wrangler Anda (MY_BUCKET)
type Bindings = {
  DB: D1Database;
  MY_BUCKET: R2Bucket; // <--- Ubah jadi Wajib sesuai log
  // Fallback types (Opsional)
  MEDIA_BUCKET?: R2Bucket;
  BUCKET?: R2Bucket;
  R2?: R2Bucket;
};

const mediaRouter = new Hono<{ Bindings: Bindings }>();

// Helper untuk mencari Binding R2 yang aktif (Prioritas ke MY_BUCKET)
const getBucket = (c: any) => {
    return c.env.MY_BUCKET || c.env.MEDIA_BUCKET || c.env.BUCKET || c.env.R2;
};

// Setup destructive dinonaktifkan di runtime production.
mediaRouter.get('/setup', async (c) => {
    return c.json({ error: 'Endpoint setup media dinonaktifkan' }, 404);
});

// 2. GET LIST
mediaRouter.get('/', async (c) => {
    try {
        const { results } = await c.env.DB.prepare('SELECT * FROM media_meta ORDER BY created_at DESC').all();
        return c.json(results || []);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 3. UPLOAD
mediaRouter.post('/', async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body['file'];
        if (!file || typeof file === 'string') return c.json({ error: 'File wajib ada' }, 400);
        if (file.size > 10 * 1024 * 1024) return c.json({ error: 'Ukuran file maksimal 10 MB' }, 413);
        const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
        if (!allowed.has(file.type)) return c.json({ error: 'Format file tidak diizinkan' }, 415);
        const bytes = new Uint8Array(await file.arrayBuffer());
        const valid = file.type === 'image/jpeg' ? bytes[0] === 0xff && bytes[1] === 0xd8
          : file.type === 'image/png' ? bytes.slice(0, 8).every((b, i) => b === [137,80,78,71,13,10,26,10][i])
          : file.type === 'image/webp' ? new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP'
          : new TextDecoder().decode(bytes.slice(4, 12)).includes('ftypavif');
        if (!valid) return c.json({ error: 'Isi file tidak cocok dengan formatnya' }, 415);

        const r2 = getBucket(c);
        if (!r2) return c.json({ error: 'R2 Putus (Cek MY_BUCKET)' }, 500);

        const date = new Date();
        const folder = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        // Bersihkan nama file
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
        const key = `${folder}/${Date.now()}-${cleanName}`;

        await r2.put(key, bytes, { httpMetadata: { contentType: file.type } });

        const url = `/api/media/file/${key}`;

        // Pastikan tabel ada sebelum insert
        await c.env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS media_meta (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL,
                url TEXT NOT NULL,
                type TEXT,
                size INTEGER,
                alt TEXT,
                title TEXT,
                description TEXT,
                caption TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        await c.env.DB.prepare(
            'INSERT INTO media_meta (key, url, type, size, title, alt, caption, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))'
        ).bind(
            key, url, file.type, file.size,
            body['title'] || '', body['alt'] || '', body['caption'] || '', body['description'] || ''
        ).run();

        return c.json({ success: true, url });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 4. UPDATE / EDIT METADATA
mediaRouter.put('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const body = await c.req.json();

        await c.env.DB.prepare(`
            UPDATE media_meta
            SET alt = ?, title = ?, description = ?, caption = ?
            WHERE id = ?
        `).bind(
            body.alt || '',
            body.title || '',
            body.description || '',
            body.caption || '',
            id
        ).run();

        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 5. SERVE FILE
mediaRouter.get('/file/*', async (c) => {
    const key = c.req.path.replace('/api/media/file/', '');
    const r2 = getBucket(c);
    if (!r2) return c.text('R2 Putus', 500);

    const obj = await r2.get(decodeURIComponent(key));
    if (!obj) return c.text('Not found', 404);

    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('etag', obj.httpEtag);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Content-Security-Policy', "default-src 'none'; sandbox");

    // [FIX] Paksa Header Gambar jika R2 memberikannya kosong
    const currentType = headers.get('Content-Type');
    if (!currentType || currentType === 'application/octet-stream') {
        if (key.match(/\.(jpg|jpeg)$/i)) headers.set('Content-Type', 'image/jpeg');
        else if (key.match(/\.png$/i)) headers.set('Content-Type', 'image/png');
        else if (key.match(/\.webp$/i)) headers.set('Content-Type', 'image/webp');
    }

    return new Response(obj.body, { headers });
});

// 6. DELETE
mediaRouter.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const r2 = getBucket(c);

    // Ambil Key dari DB berdasarkan ID
    const file: any = await c.env.DB.prepare('SELECT key FROM media_meta WHERE id=?').bind(id).first();

    if(file && r2) {
        await r2.delete(file.key);
        await c.env.DB.prepare('DELETE FROM media_meta WHERE id=?').bind(id).run();
    }
    return c.json({ success: true });
});

export default mediaRouter;
