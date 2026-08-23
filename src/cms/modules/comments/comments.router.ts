import { Hono } from 'hono';
import { readSession, requireEditor } from '../../middleware/auth';

const commentsRouter = new Hono<{ Bindings: any }>();

// ================================================================
// STATIC ROUTES FIRST (must be before /:postId or /:id)
// ================================================================

// GET /api/comments/pending - All pending comments for admin
commentsRouter.get('/pending', requireEditor, async (c) => {
    try {
        const { results } = await c.env.DB.prepare(`
            SELECT c.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role, p.title as post_title
            FROM comments c
            JOIN users u ON c.user_id = u.id
            JOIN posts p ON c.post_id = p.id
            WHERE c.status = 'pending'
            ORDER BY c.created_at DESC
        `).all();
        return c.json(results || []);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// GET /api/comments/all - All comments (approved + disabled + pending) for admin
commentsRouter.get('/all', requireEditor, async (c) => {
    try {
        const { results } = await c.env.DB.prepare(`
            SELECT c.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role, p.title as post_title
            FROM comments c
            JOIN users u ON c.user_id = u.id
            JOIN posts p ON c.post_id = p.id
            ORDER BY c.created_at DESC
        `).all();
        return c.json(results || []);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// POST /api/comments - Submit a new comment
commentsRouter.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const { post_id, content } = body;
        const session = await readSession(c);

        if (!session || !post_id || !content) {
            return c.json({ error: 'Data komentar tidak lengkap' }, 400);
        }
        const cleanContent = String(content).replace(/<[^>]*>/g, '').trim();
        if (!cleanContent || cleanContent.length > 2000) return c.json({ error: 'Komentar harus berisi 1–2000 karakter' }, 400);
        const post: any = await c.env.DB.prepare("SELECT id, allow_comments FROM posts WHERE id = ? AND status = 'publish'").bind(post_id).first();
        if (!post || post.allow_comments === 0) return c.json({ error: 'Komentar tidak tersedia untuk artikel ini' }, 400);

        const { success } = await c.env.DB.prepare(`
            INSERT INTO comments (post_id, user_id, content, status, created_at)
            VALUES (?, ?, ?, 'pending', ?)
        `).bind(
            post_id,
            session.id,
            cleanContent,
            new Date().toISOString()
        ).run();

        if (success) {
            try {
                const userQuery = await c.env.DB.prepare('SELECT name FROM users WHERE id = ?').bind(session.id).first();
                const postQuery = await c.env.DB.prepare('SELECT title FROM posts WHERE id = ?').bind(post_id).first();
                const userName = userQuery ? (userQuery as any).name : 'Pengguna';
                const postTitle = postQuery ? (postQuery as any).title : 'Artikel';

                await c.env.DB.prepare(`
                    INSERT INTO notifications (title, message, type)
                    VALUES ('Komentar Baru', ?, 'warning')
                `).bind(`${userName} mengirim komentar baru di artikel "${postTitle}".`).run();
            } catch (e) {
                // Ignore notification error
            }
            return c.json({ success: true, message: 'Komentar ditambahkan dan menunggu persetujuan.' });
        } else {
            return c.json({ error: 'Gagal menambahkan komentar' }, 500);
        }
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// ================================================================
// DYNAMIC ROUTES WITH STATIC SUFFIX SECOND
// ================================================================

// PUT /api/comments/:id/approve
commentsRouter.put('/:id/approve', requireEditor, async (c) => {
    const id = c.req.param('id');
    try {
        await c.env.DB.prepare("UPDATE comments SET status = 'approved' WHERE id = ?").bind(id).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// PUT /api/comments/:id/disable
commentsRouter.put('/:id/disable', requireEditor, async (c) => {
    const id = c.req.param('id');
    try {
        await c.env.DB.prepare("UPDATE comments SET status = 'disabled' WHERE id = ?").bind(id).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// PATCH /api/comments/:id - Edit a comment
commentsRouter.patch('/:id', requireEditor, async (c) => {
    const id = c.req.param('id');
    try {
        const { content } = await c.req.json();
        if (!content) return c.json({ error: 'Konten tidak boleh kosong' }, 400);
        await c.env.DB.prepare('UPDATE comments SET content = ? WHERE id = ?').bind(content, id).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// DELETE /api/comments/:id
commentsRouter.delete('/:id', requireEditor, async (c) => {
    const id = c.req.param('id');
    try {
        await c.env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// ================================================================
// LAST: Generic post comments (by post ID)
// ================================================================

// GET /api/comments/:postId - Public: approved comments for a post
commentsRouter.get('/:postId', async (c) => {
    const postId = c.req.param('postId');
    try {
        const { results } = await c.env.DB.prepare(`
            SELECT c.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ? AND c.status = 'approved'
            ORDER BY c.created_at DESC
        `).bind(postId).all();
        return c.json(results || []);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

export { commentsRouter };
