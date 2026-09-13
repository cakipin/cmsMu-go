import { Hono } from 'hono';
import { eq, asc } from 'drizzle-orm';
import { getDb } from '../../db';
import { menus } from '../../db/schema';

const menusRouter = new Hono<{ Bindings: any }>();

// 1. GET ALL MENUS
menusRouter.get('/', async (c) => {
    try {
        const db = getDb(c.env.DB);
        const results = await db.select().from(menus).orderBy(asc(menus.orderNum));
        
        const mapped = (results || []).map((m: any) => ({
            id: m.id,
            label: m.label,
            url: m.url,
            order_num: m.orderNum,
            parent_id: m.parentId,
            orderNum: m.orderNum,
            parentId: m.parentId
        }));

        return c.json({ success: true, data: mapped });
    } catch (e: any) {
        return c.json({ success: true, data: [] });
    }
});

// 2. ADD / CREATE MENU
menusRouter.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const db = getDb(c.env.DB);
        
        const parentId = body.parent_id || body.parentId || null;
        const orderNum = Number(body.order_num !== undefined ? body.order_num : (body.orderNum || 0));

        await db.insert(menus).values({
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

        await db.update(menus).set({
            label: body.label,
            url: body.url,
            orderNum: isNaN(orderNum) ? 0 : orderNum,
            parentId: parentId ? String(parentId) : null
        }).where(eq(menus.id, targetId)).run();

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
        await db.delete(menus).where(eq(menus.id, id)).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

export default menusRouter;
