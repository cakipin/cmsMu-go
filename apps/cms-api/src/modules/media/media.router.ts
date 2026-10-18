import { Hono } from "hono";
import { getDb } from "@cmsmu/db";
import { mediaMeta } from "@cmsmu/db";
import { eq, desc } from "drizzle-orm";
import { getStorageBucket } from "../../storage/r2-adapter";
import { adminOnlyMiddleware } from "../../middleware/auth";

type Bindings = {
  DB: D1Database;
  MY_BUCKET?: R2Bucket;
  MEDIA_BUCKET?: R2Bucket;
  BUCKET?: R2Bucket;
  R2?: R2Bucket;
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
};

const mediaRouter = new Hono<{ Bindings: Bindings }>();

const getBucket = (c: any) => {
  return getStorageBucket(c);
};

// 1. ENDPOINT SETUP (RESET & SYNC - ADMIN ONLY)
mediaRouter.get("/setup", adminOnlyMiddleware, async c => {
  try {
    if (!c.env.DB) throw new Error(`DB Error! Binding 'DB' hilang.`);
    const r2 = getBucket(c);
    if (!r2) throw new Error(`R2 Error! Binding 'MY_BUCKET' tidak ditemukan.`);

    await c.env.DB.prepare("DROP TABLE IF EXISTS media_meta").run();

    await c.env.DB.prepare(
      `
            CREATE TABLE media_meta (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL,
                url TEXT NOT NULL,
                type TEXT,
                size INTEGER,
                alt TEXT,
                title TEXT,
                description TEXT,
                caption TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `
    ).run();

    const listed = await r2.list();
    let count = 0;
    let skipped = 0;
    const db = getDb(c.env.DB);

    for (const obj of listed.objects) {
      if (obj.key.endsWith("/")) {
        skipped++;
        continue;
      }

      let url = `/${obj.key}`;
      if (
        !url.startsWith("/uploads/") &&
        !url.startsWith("/wp-content/uploads/")
      ) {
        url = `/uploads/${obj.key}`;
      }
      let type = "application/octet-stream";
      if (obj.key.match(/\.(jpg|jpeg)$/i)) type = "image/jpeg";
      else if (obj.key.match(/\.png$/i)) type = "image/png";
      else if (obj.key.match(/\.webp$/i)) type = "image/webp";
      else if (obj.key.match(/\.svg$/i)) type = "image/svg+xml";

      await db
        .insert(mediaMeta)
        .values({
          key: obj.key,
          url: url,
          type: type,
          size: obj.size,
          createdAt: new Date().toISOString(),
        })
        .run();
      count++;
    }

    return c.json({
      success: true,
      message: `BERHASIL! ${count} file dipulihkan. (${skipped} folder dibuang)`,
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 2. GET LIST
mediaRouter.get("/", async c => {
  try {
    const db = getDb(c.env.DB);
    const results = await db
      .select()
      .from(mediaMeta)
      .orderBy(desc(mediaMeta.createdAt));
    return c.json(results || []);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 3. UPLOAD
mediaRouter.post("/", async c => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];
    if (!file || typeof file === "string")
      return c.json({ error: "File wajib ada" }, 400);

    const r2 = getBucket(c);
    if (!r2) return c.json({ error: "R2 Putus (Cek MY_BUCKET)" }, 500);

    const sourceFolder =
      (body["source"]
        ? String(body["source"])
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "")
        : "uploads") || "uploads";
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const folder = `${sourceFolder}/${year}/${month}`;

    let fileBuffer: Uint8Array = new Uint8Array(await file.arrayBuffer());
    let mimeType = file.type;
    let baseName =
      file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .slice(0, 40) || "image";
    let key = `${folder}/${Date.now()}-${baseName}`;

    if (file.type.startsWith("image/") && !file.type.includes("svg")) {
      try {
        const sharpModule = await new Function('return import("sharp")')();
        const sharpFn = sharpModule.default || sharpModule;
        fileBuffer = await sharpFn(fileBuffer).webp({ quality: 82 }).toBuffer();
        mimeType = "image/webp";
        key = `${key}.webp`;
      } catch (sharpErr) {
        const ext = file.name.split(".").pop() || "jpg";
        key = `${key}.${ext}`;
      }
    } else {
      const ext = file.name.split(".").pop() || "bin";
      key = `${key}.${ext}`;
    }

    await r2.put(key, fileBuffer, { httpMetadata: { contentType: mimeType } });

    const url = `/${key}`;
    const db = getDb(c.env.DB);

    await db
      .insert(mediaMeta)
      .values({
        key,
        url,
        type: mimeType,
        size: fileBuffer.length,
        title: (body["title"] as string) || baseName,
        alt: (body["alt"] as string) || baseName,
        caption: (body["caption"] as string) || "",
        description: (body["description"] as string) || "",
        createdAt: new Date().toISOString(),
      })
      .run();

    return c.json({ success: true, url, key });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 4. UPDATE / EDIT METADATA
mediaRouter.put("/:id", async c => {
  try {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const db = getDb(c.env.DB);

    await db
      .update(mediaMeta)
      .set({
        alt: body.alt || "",
        title: body.title || "",
        description: body.description || "",
        caption: body.caption || "",
      })
      .where(eq(mediaMeta.id, id))
      .run();

    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 5. SERVE FILE
mediaRouter.get("/file/*", async c => {
  const key = c.req.path.replace("/api/media/file/", "");
  const r2 = getBucket(c);
  if (!r2) return c.text("R2 Putus", 500);

  const obj = await r2.get(decodeURIComponent(key));
  if (!obj) return c.text("Not found", 404);

  const headers = new Headers();
  obj.writeHttpMetadata(headers as any);
  headers.set("etag", obj.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000");

  const currentType = headers.get("Content-Type");
  if (!currentType || currentType === "application/octet-stream") {
    if (key.match(/\.(jpg|jpeg)$/i)) headers.set("Content-Type", "image/jpeg");
    else if (key.match(/\.png$/i)) headers.set("Content-Type", "image/png");
    else if (key.match(/\.webp$/i)) headers.set("Content-Type", "image/webp");
  }

  return new Response(obj.body as any, { headers });
});

// 6. DELETE
mediaRouter.delete("/:id", async c => {
  const id = Number(c.req.param("id"));
  const r2 = getBucket(c);
  const db = getDb(c.env.DB);

  const file = await db
    .select({ key: mediaMeta.key })
    .from(mediaMeta)
    .where(eq(mediaMeta.id, id))
    .get();

  if (file && r2) {
    await r2.delete(file.key);
    await db.delete(mediaMeta).where(eq(mediaMeta.id, id)).run();
  }
  return c.json({ success: true });
});

export default mediaRouter;
