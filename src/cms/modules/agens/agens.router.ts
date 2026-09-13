import { Hono } from 'hono';
import { getDb } from '../../db';
import { agens } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';

type Bindings = {
  DB: D1Database;
};

const agensRouter = new Hono<{ Bindings: Bindings }>();

// GET ALL AGENS
agensRouter.get('/', async (c) => {
    try {
        if (!c.env.DB) return c.json({ error: 'Database Error' }, 500);
        const db = getDb(c.env.DB);
        const results = await db.select({
            id: agens.id,
            name: agens.name,
            phone: agens.phone,
            whatsapp: agens.whatsapp,
            address: agens.address,
            area: agens.area,
            map_link: agens.mapLink,
            created_at: agens.createdAt,
            updated_at: agens.updatedAt
        })
        .from(agens)
        .orderBy(asc(agens.area), asc(agens.name));

        return c.json({ success: true, data: results });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

// CREATE AGEN
agensRouter.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const { name, phone, whatsapp, address, area, map_link } = body;
        const db = getDb(c.env.DB);
        
        await db.insert(agens).values({
            name: name || '',
            phone: phone || '',
            whatsapp: whatsapp || '',
            address: address || '',
            area: area || '',
            mapLink: map_link || ''
        }).run();
        
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

// UPDATE AGEN
agensRouter.put('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'));
        const body = await c.req.json();
        const { name, phone, whatsapp, address, area, map_link } = body;
        const db = getDb(c.env.DB);
        
        await db.update(agens).set({
            name: name || '',
            phone: phone || '',
            whatsapp: whatsapp || '',
            address: address || '',
            area: area || '',
            mapLink: map_link || '',
            updatedAt: new Date().toISOString()
        })
        .where(eq(agens.id, id))
        .run();
        
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

// DELETE AGEN
agensRouter.delete('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'));
        const db = getDb(c.env.DB);
        await db.delete(agens).where(eq(agens.id, id)).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

export default agensRouter;
