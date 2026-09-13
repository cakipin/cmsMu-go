import { Hono } from 'hono';
import { getDb } from '../../db';
import { posts } from '../../db/schema';
import { eq, desc, inArray } from 'drizzle-orm';

const postsRouter = new Hono<{ Bindings: any }>();

// 1. GET ALL POSTS
postsRouter.get('/', async (c) => {
    try {
        const db = getDb(c.env.DB);
        const results = await db.select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            excerpt: posts.excerpt,
            meta_title: posts.metaTitle,
            meta_description: posts.metaDescription,
            status: posts.status,
            category: posts.category,
            tags: posts.tags,
            featured_image: posts.featuredImage,
            author: posts.author,
            allow_comments: posts.allowComments,
            is_premium: posts.isPremium,
            views: posts.views,
            type: posts.type,
            video_url: posts.videoUrl,
            created_at: posts.createdAt
        })
        .from(posts)
        .orderBy(desc(posts.createdAt));
        
        return c.json(results || []);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 2. GET SINGLE POST
postsRouter.get('/:id', async (c) => {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    try {
        const db = getDb(c.env.DB);
        const post = await db.select().from(posts).where(eq(posts.id, id)).get();
        if (!post) return c.json({ error: 'Post not found' }, 404);
        
        // Remap to match what UI expects
        return c.json({
            ...post,
            meta_title: post.metaTitle,
            meta_description: post.metaDescription,
            featured_image: post.featuredImage,
            allow_comments: post.allowComments,
            type: post.type || 'post',
            video_url: post.videoUrl || '',
            created_at: post.createdAt,
            updated_at: post.updatedAt,
            author_id: post.authorId
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Helper Function for SEO Tags
function generateTags(title: string): string {
    const stopwords = new Set([
        'dan', 'di', 'ke', 'dari', 'yang', 'untuk', 'dengan', 'pada', 'adalah', 'ini', 'itu', 
        'atau', 'dalam', 'akan', 'sebagai', 'tidak', 'juga', 'oleh', 'karena', 'saat', 'sudah', 
        'telah', 'bisa', 'menjadi', 'lagi', 'serta', 'bagi', 'tentang', 'atas', 'bahwa', 'bila',
        'jika', 'maka', 'namun', 'tetapi', 'saja', 'ada', 'hingga', 'kepada', 'kami', 'kita',
        'lebih', 'paling', 'baru', 'hari', 'tahun', 'banyak', 'beberapa', 'suatu', 'sebuah'
    ]);
    const cleanTitle = (title || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const words = cleanTitle.split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));
    return [...new Set(words)].slice(0, 6).join(', ');
}

// Helper Function for Default YouTube Thumbnail
function getYoutubeThumbnail(url?: string): string {
    if (!url) return '';
    const str = url.trim();
    let videoId = '';
    if (str.includes('youtu.be/')) {
        videoId = str.split('youtu.be/')[1]?.split('?')[0]?.split('/')[0] || '';
    } else if (str.includes('shorts/')) {
        videoId = str.split('shorts/')[1]?.split('?')[0]?.split('/')[0] || '';
    } else if (str.includes('embed/')) {
        videoId = str.split('embed/')[1]?.split('?')[0]?.split('/')[0] || '';
    } else if (str.includes('v=')) {
        const match = str.match(/[?&]v=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) videoId = match[1];
    }
    if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return '';
}

// 3. CREATE POST
postsRouter.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const now = new Date().toISOString();

        // Validasi Status
        let status = (body.status || 'draft').toLowerCase();
        if(status.includes('pub')) status = 'publish';
        else if(status.includes('cura') || status.includes('kura')) status = 'curated';

        const finalTitle = body.title || 'Untitled';
        const finalTags = body.tags && body.tags.trim() !== '' ? body.tags : generateTags(finalTitle);

        let finalImage = body.featured_image || '';
        if (!finalImage && (body.type === 'video' || body.video_url)) {
            finalImage = getYoutubeThumbnail(body.video_url);
        }

        const db = getDb(c.env.DB);
        
        await db.insert(posts).values({
            title: finalTitle,
            slug: body.slug,
            body: body.body || '',
            excerpt: body.excerpt || '',
            metaTitle: body.meta_title || '',
            metaDescription: body.meta_description || '',
            status: status,
            category: body.category || 'Uncategorized',
            tags: finalTags,
            featuredImage: finalImage,
            author: body.author || 'Admin',
            authorId: body.author_id ? parseInt(body.author_id, 10) : (body.authorId ? parseInt(body.authorId, 10) : null),
            allowComments: body.allow_comments !== undefined ? (body.allow_comments ? 1 : 0) : 1,
            isPremium: body.is_premium ? 1 : 0,
            type: body.type || 'post',
            videoUrl: body.video_url || '',
            createdAt: body.created_at || now,
            updatedAt: now
        }).run();

        return c.json({ success: true, message: 'Post Created' });
    } catch (e: any) {
        if (e.message.includes('UNIQUE constraint failed')) {
            return c.json({ error: 'Slug sudah digunakan, ganti judul atau slug.' }, 409);
        }
        return c.json({ error: e.message }, 500);
    }
});

// 4. UPDATE POST
postsRouter.put('/:id', async (c) => {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    try {
        const body = await c.req.json();
        
        let status = (body.status || 'draft').toLowerCase();
        if(status.includes('pub')) status = 'publish';
        else if(status.includes('cura') || status.includes('kura')) status = 'curated';

        const finalTags = body.tags && body.tags.trim() !== '' ? body.tags : generateTags(body.title || '');

        let finalImage = body.featured_image || '';
        if (!finalImage && (body.type === 'video' || body.video_url)) {
            finalImage = getYoutubeThumbnail(body.video_url);
        }

        const db = getDb(c.env.DB);
        
        const result = await db.update(posts).set({
            title: body.title,
            slug: body.slug,
            body: body.body,
            excerpt: body.excerpt || '',
            metaTitle: body.meta_title || '',
            metaDescription: body.meta_description || '',
            status: status,
            category: body.category || 'Uncategorized',
            tags: finalTags,
            featuredImage: finalImage,
            allowComments: body.allow_comments !== undefined ? (body.allow_comments ? 1 : 0) : 1,
            isPremium: body.is_premium ? 1 : 0,
            type: body.type || 'post',
            videoUrl: body.video_url !== undefined ? body.video_url : '',
            createdAt: body.created_at,
            updatedAt: new Date().toISOString()
        })
        .where(eq(posts.id, id))
        .run();

        return c.json({ success: true, message: 'Post Updated' });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 5. DELETE POST
postsRouter.delete('/:id', async (c) => {
    const idParam = c.req.param('id');
    const db = getDb(c.env.DB);
    
    try {
        // SUPPORT BULK DELETE (Dipisahkan koma)
        if (idParam.includes(',')) {
            const ids = idParam.split(',').map(i => parseInt(i.trim(), 10)).filter(i => !isNaN(i));
            if (ids.length > 0) {
                await db.delete(posts).where(inArray(posts.id, ids)).run();
            }
            return c.json({ success: true, message: 'Bulk Deleted' });
        }

        const id = parseInt(idParam, 10);
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        await db.delete(posts).where(eq(posts.id, id)).run();
        
        return c.json({ success: true, message: 'Deleted' });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 6. TAXONOMY MANAGEMENT (CATEGORY & TAGS)
postsRouter.post('/taxonomy/rename-category', async (c) => {
    try {
        const body = await c.req.json();
        const oldName = (body.oldName || '').trim();
        const newName = (body.newName || '').trim();

        if (!oldName || !newName) {
            return c.json({ error: 'Nama kategori lama dan baru wajib diisi' }, 400);
        }

        const db = getDb(c.env.DB);
        await db.update(posts)
            .set({ category: newName, updatedAt: new Date().toISOString() })
            .where(eq(posts.category, oldName))
            .run();

        return c.json({ success: true, message: `Kategori berhasil diubah dari '${oldName}' menjadi '${newName}'` });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

postsRouter.post('/taxonomy/delete-category', async (c) => {
    try {
        const body = await c.req.json();
        const name = (body.name || '').trim();

        if (!name || name === 'Uncategorized') {
            return c.json({ error: 'Kategori tidak valid atau tidak bisa dihapus' }, 400);
        }

        const db = getDb(c.env.DB);
        await db.update(posts)
            .set({ category: 'Uncategorized', updatedAt: new Date().toISOString() })
            .where(eq(posts.category, name))
            .run();

        return c.json({ success: true, message: `Kategori '${name}' berhasil dihapus (artikel dialihkan ke Uncategorized)` });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

postsRouter.post('/taxonomy/rename-tag', async (c) => {
    try {
        const body = await c.req.json();
        const oldTag = (body.oldTag || '').trim();
        const newTag = (body.newTag || '').trim();

        if (!oldTag || !newTag) {
            return c.json({ error: 'Tag lama dan baru wajib diisi' }, 400);
        }

        const db = getDb(c.env.DB);
        // Ambil semua artikel yang memiliki tags
        const allPosts = await db.select({ id: posts.id, tags: posts.tags }).from(posts).all();
        
        let updatedCount = 0;
        for (const p of allPosts) {
            if (!p.tags) continue;
            const tagArr = p.tags.split(',').map((t: string) => t.trim());
            if (tagArr.includes(oldTag)) {
                const updatedArr = tagArr.map((t: string) => t === oldTag ? newTag : t);
                const uniqueArr = Array.from(new Set(updatedArr)).filter(Boolean);
                await db.update(posts)
                    .set({ tags: uniqueArr.join(','), updatedAt: new Date().toISOString() })
                    .where(eq(posts.id, p.id))
                    .run();
                updatedCount++;
            }
        }

        return c.json({ success: true, message: `Tag berhasil diperbarui di ${updatedCount} artikel`, updatedCount });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

postsRouter.post('/taxonomy/delete-tag', async (c) => {
    try {
        const body = await c.req.json();
        const tag = (body.tag || '').trim();

        if (!tag) {
            return c.json({ error: 'Tag wajib diisi' }, 400);
        }

        const db = getDb(c.env.DB);
        const allPosts = await db.select({ id: posts.id, tags: posts.tags }).from(posts).all();
        
        let updatedCount = 0;
        for (const p of allPosts) {
            if (!p.tags) continue;
            const tagArr = p.tags.split(',').map((t: string) => t.trim());
            if (tagArr.includes(tag)) {
                const updatedArr = tagArr.filter((t: string) => t !== tag);
                await db.update(posts)
                    .set({ tags: updatedArr.join(','), updatedAt: new Date().toISOString() })
                    .where(eq(posts.id, p.id))
                    .run();
                updatedCount++;
            }
        }

        return c.json({ success: true, message: `Tag '${tag}' berhasil dihapus dari ${updatedCount} artikel`, updatedCount });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

export default postsRouter;
