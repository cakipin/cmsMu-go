import { Hono } from "hono";
import { renderAdmin } from "./view";
import { editorPage } from "./blocks/editor.page";
import { getDb } from "@cmsmu/db";
import { users } from "@cmsmu/db";
import { desc } from "drizzle-orm";

// Definisikan tipe Bindings agar TypeScript tidak error saat akses c.env.DB
interface Bindings {
  DB: D1Database;
}

const admin = new Hono<{ Bindings: Bindings }>();

// 1. DASHBOARD UTAMA
admin.get("/", c => {
  // PERBAIKAN 2: Kirim object kosong {} agar view tidak error membaca properti undefined
  return c.html(renderAdmin({}));
});

// 2. EDITOR ROUTES (Menangani Post & Page)
// Route untuk membuat baru: /admin/post/new ATAU /admin/page/new
admin.get("/:type/new", c => {
  const type = c.req.param("type");
  // Validasi: hanya boleh 'post' atau 'page'
  if (type !== "post" && type !== "page") {
    return c.redirect("/admin");
  }
  return c.html(editorPage);
});

// Route untuk edit: /admin/post/123/edit ATAU /admin/page/123/edit
admin.get("/:type/:id/edit", c => {
  // Kita tidak perlu validasi ID di sini, biarkan UI Editor yang handle jika ID tidak ketemu
  return c.html(editorPage);
});

// 3. API INTERNAL (Data Users)
// Endpoint ini bisa dipanggil oleh fetch di ui/views.ts untuk loadUsers()
admin.get("/data/users", async c => {
  try {
    // PERBAIKAN 3: Cek Koneksi DB agar tidak Error 500 Meledak
    if (!c.env.DB) {
      return c.json(
        {
          success: false,
          error: "Database Binding (DB) belum terhubung di wrangler.toml",
        },
        500
      );
    }

    // Gunakan query yang aman
    const db = getDb(c.env.DB);
    const results = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        role: users.role,
        created_at: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.id))
      .all();

    return c.json({ success: true, data: results || [] });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

export default admin;
