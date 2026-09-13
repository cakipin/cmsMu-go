import { Hono } from 'hono';
import { eq, asc } from 'drizzle-orm';
import { getDb, menus as menusTable } from '@cmsmu/db';
import { resolveDynamicMenus } from '@cmsmu/core';

const menusRouter = new Hono<{ Bindings: any }>();

// 1. GET ALL MENUS (dengan Fallback Dinamis Zero Hardcode)
menusRouter.get('/', async (c) => {
  try {
    const list = await resolveDynamicMenus(c.env.DB);
    return c.json({ success: true, data: list });
  } catch (e: any) {
    return c.json({ success: false, error: e.message, data: [] }, 500);
  }
});

// 2. ADD / CREATE MENU
menusRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const db = getDb(c.env.DB);
    
    const parentId = body.parent_id || body.parentId || null;
    const orderNum = Number(body.order_num !== undefined ? body.order_num : (body.orderNum || 0));

    await db.insert(menusTable).values({
      id: crypto.randomUUID(),
      label: body.label,
      url: body.url,
      orderNum: isNaN(orderNum) ? 0 : orderNum,
      parentId: parentId ? String(parentId) : null
    }).run();

    return c.json({ success: true, message: 'Menu saved' });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// 3. EDIT / UPDATE MENU
menusRouter.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const db = getDb(c.env.DB);
    
    const parentId = body.parent_id || body.parentId || null;
    const orderNum = Number(body.order_num !== undefined ? body.order_num : (body.orderNum || 0));
    const targetId = id || body.id;

    await db.update(menusTable).set({
      label: body.label,
      url: body.url,
      orderNum: isNaN(orderNum) ? 0 : orderNum,
      parentId: parentId ? String(parentId) : null
    }).where(eq(menusTable.id, targetId)).run();

    return c.json({ success: true, message: 'Menu updated' });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// 4. DELETE MENU
menusRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const db = getDb(c.env.DB);
    await db.delete(menusTable).where(eq(menusTable.id, id)).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

export default menusRouter;
