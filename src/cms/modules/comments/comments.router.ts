import { Hono } from "hono";
import { eq, desc, and } from "drizzle-orm";
import { getDb } from "../../db";
import { comments, users, posts, notifications } from "../../db/schema";

const commentsRouter = new Hono<{ Bindings: any }>();

// ================================================================
// STATIC ROUTES FIRST (must be before /:postId or /:id)
// ================================================================

// GET /api/comments/pending - All pending comments for admin
commentsRouter.get("/pending", async c => {
  try {
    const db = getDb(c.env.DB);
    const results = await db
      .select({
        id: comments.id,
        post_id: comments.postId,
        user_id: comments.userId,
        content: comments.content,
        status: comments.status,
        created_at: comments.createdAt,
        user_name: users.name,
        user_avatar: users.avatar,
        user_role: users.role,
        post_title: posts.title,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .innerJoin(posts, eq(comments.postId, posts.id))
      .where(eq(comments.status, "pending"))
      .orderBy(desc(comments.createdAt))
      .all();

    return c.json(results || []);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET /api/comments/all - All comments (approved + disabled + pending) for admin
commentsRouter.get("/all", async c => {
  try {
    const db = getDb(c.env.DB);
    const results = await db
      .select({
        id: comments.id,
        post_id: comments.postId,
        user_id: comments.userId,
        content: comments.content,
        status: comments.status,
        created_at: comments.createdAt,
        user_name: users.name,
        user_avatar: users.avatar,
        user_role: users.role,
        post_title: posts.title,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .innerJoin(posts, eq(comments.postId, posts.id))
      .orderBy(desc(comments.createdAt))
      .all();

    return c.json(results || []);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// POST /api/comments - Submit a new comment
commentsRouter.post("/", async c => {
  try {
    const body = await c.req.json();
    const { post_id, user_id, content } = body;

    if (!post_id || !user_id || !content) {
      return c.json({ error: "Data komentar tidak lengkap" }, 400);
    }

    const db = getDb(c.env.DB);

    await db
      .insert(comments)
      .values({
        postId: post_id,
        userId: user_id,
        content: content,
        status: "pending",
        createdAt: new Date().toISOString(),
      })
      .run();

    try {
      const userQuery = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, user_id))
        .get();
      const postQuery = await db
        .select({ title: posts.title })
        .from(posts)
        .where(eq(posts.id, post_id))
        .get();
      const userName = userQuery ? userQuery.name : "Pengguna";
      const postTitle = postQuery ? postQuery.title : "Artikel";

      await db
        .insert(notifications)
        .values({
          title: "Komentar Baru",
          message: `${userName} mengirim komentar baru di artikel "${postTitle}".`,
          // @ts-ignore - type doesn't exist in schema but was in original raw query
          type: "warning",
        })
        .run();
    } catch (e) {
      // Ignore notification error
    }

    return c.json({
      success: true,
      message: "Komentar ditambahkan dan menunggu persetujuan.",
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// ================================================================
// DYNAMIC ROUTES WITH STATIC SUFFIX SECOND
// ================================================================

// PUT /api/comments/:id/approve
commentsRouter.put("/:id/approve", async c => {
  const id = Number(c.req.param("id"));
  try {
    const db = getDb(c.env.DB);
    await db
      .update(comments)
      .set({ status: "approved" })
      .where(eq(comments.id, id))
      .run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// PUT /api/comments/:id/disable
commentsRouter.put("/:id/disable", async c => {
  const id = Number(c.req.param("id"));
  try {
    const db = getDb(c.env.DB);
    await db
      .update(comments)
      .set({ status: "disabled" })
      .where(eq(comments.id, id))
      .run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// PATCH /api/comments/:id - Edit a comment
commentsRouter.patch("/:id", async c => {
  const id = Number(c.req.param("id"));
  try {
    const { content } = await c.req.json();
    if (!content) return c.json({ error: "Konten tidak boleh kosong" }, 400);

    const db = getDb(c.env.DB);
    await db.update(comments).set({ content }).where(eq(comments.id, id)).run();

    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// DELETE /api/comments/:id
commentsRouter.delete("/:id", async c => {
  const id = Number(c.req.param("id"));
  try {
    const db = getDb(c.env.DB);
    await db.delete(comments).where(eq(comments.id, id)).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// ================================================================
// LAST: Generic post comments (by post ID)
// ================================================================

// GET /api/comments/:postId - Public: approved comments for a post
commentsRouter.get("/:postId", async c => {
  const postId = Number(c.req.param("postId"));
  try {
    const db = getDb(c.env.DB);
    const results = await db
      .select({
        id: comments.id,
        post_id: comments.postId,
        user_id: comments.userId,
        content: comments.content,
        status: comments.status,
        created_at: comments.createdAt,
        user_name: users.name,
        user_avatar: users.avatar,
        user_role: users.role,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(and(eq(comments.postId, postId), eq(comments.status, "approved")))
      .orderBy(desc(comments.createdAt))
      .all();

    return c.json(results || []);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export { commentsRouter };
