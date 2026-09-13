import { Hono } from 'hono';
import type { Bindings } from './types';

const migration = new Hono<{ Bindings: Bindings }>();

migration.get('/', async (c) => {
  try {
    const logs = [];
    
    // DAFTAR PERUBAHAN STRUKTUR DATABASE
    const alterations = [
      // 1. Konten & Media
      "ALTER TABLE contents ADD COLUMN featured_image_caption TEXT",
      "ALTER TABLE media_meta ADD COLUMN caption TEXT",

      // 2. User Update
      "ALTER TABLE users ADD COLUMN name TEXT",
      "ALTER TABLE users ADD COLUMN created_at TEXT",
      "ALTER TABLE users ADD COLUMN role TEXT",
      "ALTER TABLE users ADD COLUMN email TEXT",

      // 3. Tabel Settings (Pengaturan)
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        value TEXT
      )`,

      // 4. TABEL BARU: MENUS (Navigasi)
      `CREATE TABLE IF NOT EXISTS menus (
          id TEXT PRIMARY KEY,
          label TEXT,
          url TEXT,
          order_num INTEGER DEFAULT 0,
          parent_id TEXT DEFAULT NULL
      )`
    ];

    // EKSEKUSI SATU PER SATU
    for (const sql of alterations) {
      try {
        await c.env.DB.prepare(sql).run();
        logs.push(`✅ Sukses: ${sql}`);
      } catch (e: any) {
        // Error diabaikan jika kolom/tabel sudah ada
        logs.push(`ℹ️ Skip: ${sql}`); 
      }
    }

    // SEED DATA DEFAULT (Jika Settings Masih Kosong)
    try {
        const check = await c.env.DB.prepare("SELECT count(*) as count FROM settings").first();
        if (check && check.count === 0) {
            await c.env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").bind('site_title', 'LabMu CMS').run();
            await c.env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").bind('site_desc', 'Just another CMS site').run();
            logs.push("✅ Seed Default Settings");
        }
    } catch(e) {}

    return c.json({ success: true, message: "Upgrade Database Selesai!", logs });
  } catch (e: any) {
    return c.json({ success: false, error: e.message });
  }
});

export default migration;