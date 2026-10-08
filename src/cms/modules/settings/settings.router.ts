import { Hono } from "hono";
// Pastikan path imports ini sesuai dengan struktur folder Anda
import type { Bindings } from "../../types";
import { authMiddleware } from "../../middleware/auth";
import { getDb } from "../../db";
import { settings as settingsTable } from "../../db/schema";
import { sql } from "drizzle-orm";
import { clearGlobalDataCache } from "../public/helpers";

const settings = new Hono<{ Bindings: Bindings }>();

// GET ALL SETTINGS (Format Object: { site_title: '...', ... })
// Endpoint Publik: Tidak mengembalikan data rahasia
settings.get("/", async c => {
  try {
    const db = getDb(c.env.DB);
    const results = await db.select().from(settingsTable);

    // Convert Array [{key:'a', value:'1'}] -> Object {a: '1'}
    const data: any = {};
    if (results) {
      results.forEach((row: any) => {
        // Sembunyikan secret dari public
        if (!row.key.includes("secret")) {
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
settings.get("/admin", authMiddleware, async c => {
  try {
    const db = getDb(c.env.DB);
    const results = await db.select().from(settingsTable);

    const data: any = {};
    if (results) {
      results.forEach((row: any) => {
        data[row.key] = row.value;
      });
    }
    return c.json({ success: true, data });
  } catch (e: any) {
    console.error("GET Settings Admin Error:", e);
    return c.json({ error: e.message }, 500);
  }
});

// SAVE SETTINGS (Terima Object, Simpan Loop)
settings.post("/", authMiddleware, async c => {
  try {
    const body = await c.req.json();

    const db = getDb(c.env.DB);
    const batchData = [];

    for (const key in body) {
      let val = body[key];
      if (typeof val !== "string") {
        val = JSON.stringify(val);
      }
      batchData.push({ key, value: val });
    }

    if (batchData.length > 0) {
      const statements = batchData.map(item =>
        db
          .insert(settingsTable)
          .values(item)
          .onConflictDoUpdate({
            target: settingsTable.key,
            set: { value: item.value },
          })
      );
      await db.batch(statements as any);
    }

    // Bersihkan Global Data Cache (In-Memory & KV) saat settings diperbarui
    clearGlobalDataCache(
      (c.env as any).sa_cache || (c.env as any).cache || (c.env as any).CACHE
    );

    return c.json({ success: true, message: "Settings saved" });
  } catch (e: any) {
    console.error("SAVE Settings Error:", e);
    return c.json({ error: e.message }, 500);
  }
});

// PURGE CACHE (Admin Only)
settings.post("/purge-cache", authMiddleware, async c => {
  try {
    let clearedCount = 0;
    const env = c.env as any;

    // 1. Purge Cloudflare KV Cache (sa_cache / cache / CACHE)
    const kv = env.sa_cache || env.cache || env.CACHE;
    if (kv && typeof kv.list === "function") {
      let cursor: string | undefined = undefined;
      do {
        const listResult = await kv.list({ cursor });
        cursor = listResult.list_complete ? undefined : listResult.cursor;
        for (const key of listResult.keys) {
          await kv.delete(key.name);
          clearedCount++;
        }
      } while (cursor);
    }

    // 2. Purge In-Memory Cache
    clearGlobalDataCache(kv);

    return c.json({
      success: true,
      message: `Cache berhasil dibersihkan (${clearedCount} entri KV dihapus).`,
      cleared: clearedCount,
    });
  } catch (e: any) {
    console.error("Purge Cache Error:", e);
    return c.json({ success: false, error: e.message }, 500);
  }
});

export default settings;
