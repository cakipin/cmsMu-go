import { Hono } from "hono";
import { getDb } from "@cmsmu/db";
import { plugins as pluginsTable } from "@cmsmu/db";
import { eq } from "drizzle-orm";

const plugins = new Hono<{ Bindings: any }>();

const defaultPlugins = [
  {
    id: "aggregator",
    name: "Sindikasi Berita (Aggregator)",
    description:
      "Menarik berita otomatis dari portal media wilayah, daerah, dan institusi Muhammadiyah melalui WP REST API, RSS Feed, dan Web Scraper.",
    author: "CMSMu Core Team",
    version: "2.1.0",
    active: 1,
  },
  {
    id: "newsroom",
    name: "Meja Kurasi (Newsroom Curation)",
    description:
      "Antrean meja kurasi redaksi untuk meninjau, menyunting, dan menerbitkan artikel berita dari sindikasi media ke portal utama.",
    author: "CMSMu Core Team",
    version: "1.8.0",
    active: 1,
  },
  {
    id: "sso-muhammadiyah",
    name: "Single Sign-On (Muhammadiyah ID SSO)",
    description:
      "Integrasi autentikasi identitas digital terpadu warga persyarikatan berbasis OAuth 2.0 Muhammadiyah ID.",
    author: "Majelis Pustaka dan Informasi",
    version: "1.2.0",
    active: 1,
  },
  {
    id: "ota",
    name: "Over-The-Air Update Engine (OTA)",
    description:
      "Modul distribusi pembaruan sistem, manifest rilis, dan push update ke seluruh instance pengguna CMSMu tanpa downtime.",
    author: "CMSMu Core Team",
    version: "1.0.0",
    active: 1,
  },
];

// GET: List Plugins (with auto-seeding default plugins if empty)
plugins.get("/", async c => {
  try {
    const db = getDb(c.env.DB);
    let results = await db.select().from(pluginsTable);

    // Auto seed default plugins jika masih kosong
    if (!results || results.length === 0) {
      for (const p of defaultPlugins) {
        try {
          await db.insert(pluginsTable).values(p).run();
        } catch (seedErr) {}
      }
      results = await db.select().from(pluginsTable);
    }

    return c.json({ success: true, data: results || [] });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// POST: Toggle Plugin Status (Activate/Deactivate)
plugins.post("/toggle", async c => {
  try {
    const body = await c.req.json();
    const targetId = body.plugin_id || body.pluginId || body.id;
    const active = body.active ? 1 : 0;

    if (!targetId)
      return c.json({ success: false, message: "ID Plugin kosong" }, 400);

    const db = getDb(c.env.DB);
    const result = await db
      .update(pluginsTable)
      .set({ active })
      .where(eq(pluginsTable.id, targetId))
      .run();

    if (result.success) {
      return c.json({
        success: true,
        message: `Plugin ${active ? "berhasil diaktifkan" : "berhasil dinonaktifkan"}!`,
      });
    }

    return c.json(
      { success: false, message: "Gagal mengupdate status plugin" },
      400
    );
  } catch (e: any) {
    console.error(e);
    return c.json({ success: false, error: e.message }, 500);
  }
});

// POST: Toggle with param :id
plugins.post("/toggle/:id", async c => {
  try {
    const targetId = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const active = body.active !== undefined ? (body.active ? 1 : 0) : 1;

    const db = getDb(c.env.DB);
    const result = await db
      .update(pluginsTable)
      .set({ active })
      .where(eq(pluginsTable.id, targetId))
      .run();

    if (result.success) {
      return c.json({
        success: true,
        message: `Plugin ${active ? "berhasil diaktifkan" : "berhasil dinonaktifkan"}!`,
      });
    }
    return c.json(
      { success: false, message: "Gagal mengupdate status plugin" },
      400
    );
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// POST: Upload or Import Plugin (Zip, JSON manifest, or Remote URL)
plugins.post("/upload", async c => {
  try {
    const contentType = c.req.header("content-type") || "";
    let pluginData: {
      id: string;
      name: string;
      description?: string;
      author?: string;
      version?: string;
      active?: number;
    } | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await c.req.formData();
      const file = formData.get("file") as File | null;
      const manifestField = formData.get("manifest") as string | null;

      if (manifestField) {
        try {
          pluginData = JSON.parse(manifestField);
        } catch (_) {}
      }

      if (!pluginData && file) {
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith(".json")) {
          const text = await file.text();
          pluginData = JSON.parse(text);
        } else if (fileName.endsWith(".zip")) {
          const baseName = fileName
            .replace(/\.zip$/i, "")
            .replace(/[^a-z0-9_-]/gi, "-");
          pluginData = {
            id: (formData.get("id") as string) || baseName,
            name:
              (formData.get("name") as string) ||
              baseName
                .split("-")
                .map(s => s.charAt(0).toUpperCase() + s.slice(1))
                .join(" "),
            description:
              (formData.get("description") as string) ||
              `Plugin bundle dari ${file.name}`,
            author: (formData.get("author") as string) || "CMSMu Contributor",
            version: (formData.get("version") as string) || "1.0.0",
            active: 1,
          };
        }
      }
    } else {
      const body = await c.req.json().catch(() => ({}));
      if (body.url_source) {
        const fetchRes = await fetch(body.url_source);
        if (!fetchRes.ok) {
          return c.json(
            {
              success: false,
              error: `Gagal mengunduh manifest dari URL (HTTP ${fetchRes.status})`,
            },
            400
          );
        }
        pluginData = await fetchRes.json();
      } else {
        pluginData = body;
      }
    }

    if (!pluginData || !pluginData.id || !pluginData.name) {
      return c.json(
        {
          success: false,
          error:
            'Manifest plugin tidak valid. Atribut "id" dan "name" wajib diisi.',
        },
        400
      );
    }

    const cleanId = String(pluginData.id)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-");
    const db = getDb(c.env.DB);

    const existingList = await db
      .select()
      .from(pluginsTable)
      .where(eq(pluginsTable.id, cleanId))
      .limit(1);
    if (existingList && existingList.length > 0) {
      await db
        .update(pluginsTable)
        .set({
          name: pluginData.name,
          description: pluginData.description || "",
          author: pluginData.author || "CMSMu Contributor",
          version: pluginData.version || "1.0.0",
          active:
            pluginData.active !== undefined ? (pluginData.active ? 1 : 0) : 1,
        })
        .where(eq(pluginsTable.id, cleanId))
        .run();
    } else {
      await db
        .insert(pluginsTable)
        .values({
          id: cleanId,
          name: pluginData.name,
          description: pluginData.description || "",
          author: pluginData.author || "CMSMu Contributor",
          version: pluginData.version || "1.0.0",
          active:
            pluginData.active !== undefined ? (pluginData.active ? 1 : 0) : 1,
        })
        .run();
    }

    return c.json({
      success: true,
      message: `Plugin "${pluginData.name}" berhasil diinstal dan diintegrasikan ke sistem!`,
      data: {
        id: cleanId,
        name: pluginData.name,
        version: pluginData.version || "1.0.0",
      },
    });
  } catch (e: any) {
    return c.json(
      { success: false, error: e.message || "Gagal memproses unggah plugin" },
      500
    );
  }
});

// POST: Add / Register new plugin
plugins.post("/", async c => {
  try {
    const body = await c.req.json();
    if (!body.id || !body.name) {
      return c.json(
        { success: false, error: "ID dan Nama Plugin wajib diisi" },
        400
      );
    }
    const db = getDb(c.env.DB);
    await db
      .insert(pluginsTable)
      .values({
        id: String(body.id)
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "-"),
        name: body.name,
        description: body.description || "",
        author: body.author || "CMSMu Contributor",
        version: body.version || "1.0.0",
        active: body.active ? 1 : 0,
      })
      .run();
    return c.json({
      success: true,
      message: "Plugin baru berhasil didaftarkan",
    });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// DELETE: Delete Plugin
plugins.delete("/:id", async c => {
  try {
    const id = c.req.param("id");
    if (id === "ota") {
      return c.json(
        {
          success: false,
          message:
            "Plugin Over-The-Air Update (OTA) adalah komponen inti sistem CMSMu dan tidak dapat dihapus.",
        },
        403
      );
    }
    const db = getDb(c.env.DB);
    await db.delete(pluginsTable).where(eq(pluginsTable.id, id)).run();
    return c.json({
      success: true,
      message: "Plugin berhasil dihapus dari sistem",
    });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

export default plugins;
