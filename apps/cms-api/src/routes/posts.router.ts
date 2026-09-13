import { Hono } from 'hono';
import { getDb, posts } from '@cmsmu/db';
import { eq, desc, inArray } from 'drizzle-orm';
import { generateSeoTags, getYoutubeThumbnail } from '@cmsmu/core';

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

// 3. CREATE POST
postsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const now = new Date().toISOString();

    let status = (body.status || 'draft').toLowerCase();
    if (status.includes('pub')) status = 'publish';
    else if (status.includes('cura') || status.includes('kura')) status = 'curated';

    const finalTitle = body.title || 'Untitled';
    const finalTags = body.tags && body.tags.trim() !== '' ? body.tags : generateSeoTags(finalTitle);

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
      allowComments: body.allow_comments !== undefined ? (body.allow_comments ? 1 : 0) : 1,
      isPremium: body.is_premium ? 1 : 0,
      type: body.type || 'post',
      videoUrl: body.video_url || '',
      createdAt: body.created_at || now,
      updatedAt: now
    }).run();

    return c.json({ success: true, message: 'Post Created' });
  } catch (e: any) {
    if (e.message && e.message.includes('UNIQUE constraint failed')) {
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
    if (status.includes('pub')) status = 'publish';
    else if (status.includes('cura') || status.includes('kura')) status = 'curated';

    const finalTags = body.tags && body.tags.trim() !== '' ? body.tags : generateSeoTags(body.title || '');

    let finalImage = body.featured_image || '';
    if (!finalImage && (body.type === 'video' || body.video_url)) {
      finalImage = getYoutubeThumbnail(body.video_url);
    }

    const db = getDb(c.env.DB);
    
    await db.update(posts).set({
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

export default postsRouter;
