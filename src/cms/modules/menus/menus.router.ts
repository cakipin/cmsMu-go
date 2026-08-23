import { Hono } from 'hono';

const menusRouter = new Hono();
const safeUrl = (value: unknown) => {
    const url = String(value || '').trim();
    return /^(?:\/|https:\/\/)/.test(url) && !/^\/\//.test(url) ? url.slice(0, 2048) : '/';
};

// 1. GET ALL MENUS
menusRouter.get('/', async (c) => {
    try {
        // Ambil data menu urut berdasarkan order_num
        const { results } = await c.env.DB.prepare(
            "SELECT * FROM menus ORDER BY order_num ASC"
        ).all();

        return c.json({ success: true, data: results || [] });
    } catch (e: any) {
        // Jika tabel belum ada, return kosong (jangan error 500)
        return c.json({ success: true, data: [] });
    }
});

// 2. ADD / CREATE MENU
menusRouter.post('/', async (c) => {
    try {
        const body = await c.req.json();

        await c.env.DB.prepare(
            "INSERT INTO menus (label, url, order_num) VALUES (?, ?, ?)"
        ).bind(String(body.label || '').trim().slice(0, 100), safeUrl(body.url), Number(body.order_num) || 0).run();

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

        await c.env.DB.prepare(
            "UPDATE menus SET label = ?, url = ?, order_num = ? WHERE id = ?"
        ).bind(String(body.label || '').trim().slice(0, 100), safeUrl(body.url), Number(body.order_num) || 0, id).run();

        return c.json({ success: true, message: 'Menu updated' });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

// 4. DELETE MENU
menusRouter.delete('/:id', async (c) => {
    const id = c.req.param('id');
    try {
        await c.env.DB.prepare("DELETE FROM menus WHERE id = ?").bind(id).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

export default menusRouter;
