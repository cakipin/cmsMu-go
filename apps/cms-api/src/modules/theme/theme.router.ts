import { Hono } from "hono";
import { availableThemes } from "../../themes/registry";
import { getDb } from "@cmsmu/db";
import { themes } from "@cmsmu/db";
import { eq } from "drizzle-orm";

const theme = new Hono<{ Bindings: any }>();

// GET: List Themes
theme.get("/", async c => {
  try {
    const db = getDb(c.env.DB);
    const dbThemes = await db
      .select({ id: themes.id, active: themes.active })
      .from(themes);

    let data = availableThemes.map(t => {
      const dbEntry = dbThemes?.find((d: any) => d.id === t.id);
      return {
        ...t,
        active: dbEntry ? dbEntry.active === 1 : false,
        deleted: dbEntry ? dbEntry.active === -1 : false,
        thumbnail: `https://placehold.co/600x400/2563eb/ffffff?text=${encodeURIComponent(t.name)}`,
      };
    });

    data = data.filter(t => !t.deleted);

    return c.json({ success: true, data });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// POST: Activate Theme (FIXED LOGIC)
theme.post("/activate", async c => {
  try {
    const body = await c.req.json();
    const targetId = body.theme_id || body.themeId;

    if (!targetId)
      return c.json({ success: false, message: "ID Tema kosong" }, 400);

    const db = getDb(c.env.DB);

    // 1. Matikan semua tema dulu (Set active = 0)
    await db.update(themes).set({ active: 0 }).run();

    // 2. Cek apakah tema target sudah ada di DB?
    const exists = await db
      .select({ id: themes.id })
      .from(themes)
      .where(eq(themes.id, targetId))
      .get();

    if (!exists) {
      // KASUS OM SEKARANG: Belum ada di DB, jadi kita INSERT manual
      const info = availableThemes.find(t => t.id === targetId);

      if (info) {
        // Masukkan ke DB
        await db
          .insert(themes)
          .values({
            id: info.id,
            name: info.name,
            description: info.description || "",
            author: info.author || "",
            version: info.version || "",
            active: 1,
          })
          .run();
      } else {
        return c.json(
          { success: false, message: "Tema tidak ditemukan di registry" },
          404
        );
      }
    } else {
      // Kalau sudah ada, tinggal switch jadi ON
      await db
        .update(themes)
        .set({ active: 1 })
        .where(eq(themes.id, targetId))
        .run();
    }

    return c.json({ success: true, message: "Tema Berhasil Diaktifkan!" });
  } catch (e: any) {
    console.error(e);
    return c.json({ success: false, error: e.message }, 500);
  }
});

// DELETE: Delete Theme
theme.delete("/:id", async c => {
  try {
    const id = c.req.param("id");
    const db = getDb(c.env.DB);

    // Check if theme is active
    const activeCheck = await db
      .select({ active: themes.active })
      .from(themes)
      .where(eq(themes.id, id))
      .get();
    if (activeCheck && activeCheck.active === 1) {
      return c.json(
        {
          success: false,
          message: "Tidak bisa menghapus tema yang sedang aktif",
        },
        400
      );
    }

    // Insert or replace with active = -1 (soft delete)
    const info = availableThemes.find(t => t.id === id);
    if (info) {
      // Hapus hard dari DB dulu kalau ada (untuk jaga-jaga) lalu insert ulang sebagai deleted
      await db.delete(themes).where(eq(themes.id, id)).run();
      await db
        .insert(themes)
        .values({
          id: info.id,
          name: info.name,
          description: info.description || "",
          author: info.author || "",
          version: info.version || "",
          active: -1,
        })
        .run();
    }

    return c.json({ success: true, message: "Tema berhasil dihapus" });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

export default theme;
