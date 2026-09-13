import { Hono } from 'hono';
import { approveAndPublishQueueItem, rejectQueueItem } from '@cmsmu/core';

const newsroomRouter = new Hono<{ Bindings: any }>();

// 1. GET /queue - Ambil antrean kurasi berita
newsroomRouter.get('/queue', async (c) => {
  try {
    const db = c.env.DB;
    const status = c.req.query('status') || 'pending';
    const page = Number(c.req.query('page') || 1);
    const limit = Number(c.req.query('limit') || 20);
    const offset = (page - 1) * limit;

    const items: any = await db.prepare(`
      SELECT q.*, s.name as source_name, s.base_url as source_url
      FROM curation_queue q
      LEFT JOIN media_sources s ON q.source_id = s.id
      WHERE q.status = ?
      ORDER BY q.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(status, limit, offset).all();

    const countRes: any = await db.prepare("SELECT COUNT(*) as total FROM curation_queue WHERE status = ?").bind(status).first();

    return c.json({
      success: true,
      data: items.results || [],
      pagination: {
        page,
        limit,
        total: countRes?.total || 0,
      }
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 2. POST /queue/:id/publish - Menerbitkan langsung ke tabel posts
newsroomRouter.post('/queue/:id/publish', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const body = await c.req.json();

    const result = await approveAndPublishQueueItem(db, id, body);
    if (!result.success) {
      return c.json(result, 400);
    }
    return c.json(result);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 3. POST /queue/:id/reject - Mengabaikan berita
newsroomRouter.post('/queue/:id/reject', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const result = await rejectQueueItem(db, id);
    return c.json(result);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default newsroomRouter;
