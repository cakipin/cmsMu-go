import { Hono } from 'hono';
// Pastikan path imports ini sesuai dengan struktur folder Anda
import type { Bindings } from '../../types';
import { requireAdmin } from '../../middleware/auth';

const settings = new Hono<{ Bindings: Bindings }>();

// GET ALL SETTINGS (Format Object: { site_title: '...', ... })
// Endpoint Publik: Tidak mengembalikan data rahasia
settings.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT key, value FROM settings").all();

    // Convert Array [{key:'a', value:'1'}] -> Object {a: '1'}
    const data: any = {};
    if(results){
        results.forEach((row: any) => {
            // Sembunyikan secret dari public
            if (!row.key.includes('secret')) {
                data[row.key] = row.value;
            }
        });
    }
    return c.json({ success: true, data });
  } catch (e: any) {
    console.error("GET Settings Error:", e);
    return c.json({ error: e.message }, 500);
  }
});

// GET ALL SETTINGS (Admin Only: Mengembalikan semua termasuk secret)
settings.get('/admin', requireAdmin, async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT key, value FROM settings").all();

    const data: any = {};
    if(results){
        results.forEach((row: any) => {
            data[row.key] = row.key.includes('secret') ? '' : row.value;
        });
    }
    return c.json({ success: true, data });
  } catch (e: any) {
    console.error("GET Settings Admin Error:", e);
    return c.json({ error: e.message }, 500);
  }
});

// SAVE SETTINGS (Terima Object, Simpan Loop)
settings.post('/', requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const forbidden = Object.keys(body).filter(key => key.toLowerCase().includes('secret'));
    if (forbidden.length) return c.json({ error: 'Secret harus dikonfigurasi melalui Cloudflare Secrets' }, 400);

    // [PERBAIKAN] Gunakan INSERT OR REPLACE (Lebih aman untuk SQLite/D1)
    // Ini otomatis Update jika key ada, atau Insert jika belum ada.
    const stmt = c.env.DB.prepare(`
      INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
    `);

    const batch = [];
    for (const key in body) {
        // [PERBAIKAN] Pastikan value selalu String agar tidak error di DB
        let val = body[key];
        if (typeof val !== 'string') {
            val = JSON.stringify(val);
        }

        batch.push(stmt.bind(key, val));
    }

    // [PERBAIKAN] Hanya eksekusi jika ada data
    if (batch.length > 0) {
        await c.env.DB.batch(batch);
    }

    return c.json({ success: true, message: 'Settings saved' });
  } catch (e: any) {
    console.error("SAVE Settings Error:", e);
    return c.json({ error: e.message }, 500);
  }
});

export default settings;
