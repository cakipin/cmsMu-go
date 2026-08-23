// src/modules/posts/posts.router.ts
import { Hono } from 'hono';
import { boundedText, cleanSlug, sanitizeHtml } from '../../core/security';

const postsRouter = new Hono<{ Bindings: any }>();

// 1. GET ALL POSTS
postsRouter.get('/', async (c) => {
    try {
        const { results } = await c.env.DB.prepare(
            "SELECT * FROM posts ORDER BY created_at DESC"
        ).all();
        // Memastikan hasil dikembalikan sebagai array
        return c.json(results || []);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 2. GET SINGLE POST
postsRouter.get('/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const post = await c.env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
        if (!post) return c.json({ error: 'Post not found' }, 404);
        return c.json(post);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 3. CREATE POST
postsRouter.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const now = new Date().toISOString();

        // Validasi Status
        let status = (body.status || 'draft').toLowerCase();
        if(status.includes('pub')) status = 'publish';

        // PENTING: Pastikan kolom category dan tags ada di bind parameters
        const { success } = await c.env.DB.prepare(`
            INSERT INTO posts (title, slug, body, excerpt, meta_title, meta_description, status, category, tags, featured_image, author, allow_comments, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            boundedText(body.title || 'Untitled', 250),
            cleanSlug(body.slug || body.title),
            sanitizeHtml(body.body || ''),
            boundedText(body.excerpt, 500),
            boundedText(body.meta_title, 70),
            boundedText(body.meta_description, 180),
            status,
            boundedText(body.category || 'Uncategorized', 100),
            boundedText(body.tags, 500),
            boundedText(body.featured_image, 2048),
            boundedText(body.author || 'Admin', 120),
            body.allow_comments !== undefined ? (body.allow_comments ? 1 : 0) : 1,
            body.created_at || now
        ).run();

        if (success) {
            return c.json({ success: true, message: 'Post Created' });
        } else {
            return c.json({ error: 'Failed to create post' }, 400);
        }
    } catch (e: any) {
        if (e.message.includes('UNIQUE constraint failed')) {
            return c.json({ error: 'Slug sudah digunakan, ganti judul atau slug.' }, 409);
        }
        return c.json({ error: e.message }, 500);
    }
});

// 4. UPDATE POST (FIX: Kalender, Kategori, & Tags)
postsRouter.put('/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const body = await c.req.json();

        let status = (body.status || 'draft').toLowerCase();
        if(status.includes('pub')) status = 'publish';

        // FIX: Menyertakan category dan tags dalam query UPDATE agar list post terupdate
        const { success } = await c.env.DB.prepare(`
            UPDATE posts SET
                title = ?,
                slug = ?,
                body = ?,
                excerpt = ?,
                meta_title = ?,
                meta_description = ?,
                status = ?,
                category = ?,
                tags = ?,
                featured_image = ?,
                allow_comments = ?,
                created_at = ?
            WHERE id = ?
        `).bind(
            boundedText(body.title, 250),
            cleanSlug(body.slug || body.title),
            sanitizeHtml(body.body),
            boundedText(body.excerpt, 500),
            boundedText(body.meta_title, 70),
            boundedText(body.meta_description, 180),
            status,
            boundedText(body.category || 'Uncategorized', 100),
            boundedText(body.tags, 500),
            boundedText(body.featured_image, 2048),
            body.allow_comments !== undefined ? (body.allow_comments ? 1 : 0) : 1,
            body.created_at, // Nilai tanggal dari UI
            id
        ).run();

        if (success) {
            return c.json({ success: true, message: 'Post Updated' });
        } else {
            return c.json({ error: 'Post not found or no changes' }, 404);
        }
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 5. DELETE POST
postsRouter.delete('/:id', async (c) => {
    const id = c.req.param('id');

    // SUPPORT BULK DELETE (Dipisahkan koma)
    if (id.includes(',')) {
        const ids = id.split(',');
        const stmts = ids.map(i => c.env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(i.trim()));
        await c.env.DB.batch(stmts);
        return c.json({ success: true, message: 'Bulk Deleted' });
    }

    try {
        const { success } = await c.env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();

        if (success) {
            return c.json({ success: true, message: 'Deleted' });
        } else {
            return c.json({ success: true, message: 'Deleted (or already gone)' });
        }
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

export default postsRouter;
