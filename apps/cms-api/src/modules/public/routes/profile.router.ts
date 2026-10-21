import { Hono } from "hono";
import type { Bindings } from "../../../types";
import { getDb } from "@cmsmu/db";
import {
  users as usersTable,
  posts as postsTable,
  mediaMeta as mediaMetaTable,
} from "@cmsmu/db";
import { eq, desc, and, or, like, sql } from "drizzle-orm";
import { getStorageBucket } from "../../../storage/r2-adapter";
import { getGlobalData, getRenderer, formatPostForFrontend } from "../helpers";

const profileRouter = new Hono<{ Bindings: Bindings }>();

// ============================================================
// PUBLIC USER PROFILE /@:username & SUBSCRIBER PRO DASHBOARD
// ============================================================
export async function handleUserProfile(c: any, rawUsername: string) {
  try {
    let usernameParam = decodeURIComponent(rawUsername || "")
      .replace(/^@/, "")
      .trim();
    if (!usernameParam) return c.redirect("/");

    const db = c.env.DB;
    const orm = getDb(db);
    const { settings, menus } = await getGlobalData(db);
    const { Renderer } = await getRenderer(db);

    const user = await orm
      .select({
        id: usersTable.id,
        username: usersTable.username,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        avatar: usersTable.avatar,
        subscriptionPlan: usersTable.subscriptionPlan,
        subscriptionExpiresAt: usersTable.subscriptionExpiresAt,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(
        or(
          sql`lower(${usersTable.username}) = lower(${usernameParam})`,
          sql`lower(${usersTable.email}) = lower(${usernameParam})`
        )
      )
      .get();

    if (!user) {
      return c.html(
        Renderer?.render404
          ? Renderer.render404({ site: settings, menus, data: null })
          : "Pengguna tidak ditemukan",
        404
      );
    }

    // 1. Artikel Tulisan / Kiriman Penulis (jika penulis, kontributor, editor, admin)
    let authorPostsList: any[] = [];
    try {
      authorPostsList = await orm
        .select({
          id: postsTable.id,
          title: postsTable.title,
          slug: postsTable.slug,
          excerpt: postsTable.excerpt,
          category: postsTable.category,
          featuredImage: postsTable.featuredImage,
          type: postsTable.type,
          videoUrl: postsTable.videoUrl,
          views: postsTable.views,
          status: postsTable.status,
          author: postsTable.author,
          createdAt: postsTable.createdAt,
        })
        .from(postsTable)
        .where(
          or(
            eq(postsTable.authorId, user.id),
            sql`lower(${postsTable.author}) = lower(${user.name || user.username})`,
            sql`lower(${postsTable.author}) = lower(${user.username})`
          )
        )
        .orderBy(desc(postsTable.createdAt))
        .limit(30);
    } catch (e) {}

    // 2. Antrean Kurasi (opsional jika plugin terpasang)
    let curationList: any[] = [];

    // 3. Artikel Favorit / Bookmark / Bacaan Tersimpan (Subscriber)
    let savedPostsList: any[] = [];
    try {
      savedPostsList = await orm
        .select({
          id: postsTable.id,
          title: postsTable.title,
          slug: postsTable.slug,
          excerpt: postsTable.excerpt,
          category: postsTable.category,
          featuredImage: postsTable.featuredImage,
          views: postsTable.views,
          createdAt: postsTable.createdAt,
        })
        .from(postsTable)
        .where(eq(postsTable.status, "publish"))
        .orderBy(desc(postsTable.views))
        .limit(12);
    } catch (e) {}

    const context: any = {
      site: settings,
      menus,
      profileUser: user,
      authorPosts: (authorPostsList || []).map(formatPostForFrontend),
      curationItems: curationList || [],
      savedPosts: (savedPostsList || []).map(formatPostForFrontend),
    };

    if (Renderer?.renderUserProfile) {
      return c.html(Renderer.renderUserProfile(context));
    }

    return c.html(
      Renderer?.renderPage
        ? Renderer.renderPage(context)
        : "Laman profil belum tersedia."
    );
  } catch (e: any) {
    return c.text("Profile Page Error: " + e.message, 500);
  }
}

profileRouter.get("/@:username", async c =>
  handleUserProfile(c, c.req.param("username") || "")
);

// Endpoint Upload Avatar Pengguna Publik (Maksimal 1MB)
profileRouter.post("/api/public/profile/upload-avatar", async c => {
  try {
    const authHeader = c.req.header("Authorization") || "";
    if (!authHeader)
      return c.json({ error: "Sesi tidak sah. Silakan login kembali." }, 401);

    const token = authHeader.replace("Bearer ", "").trim();
    let decoded: any = null;
    try {
      let b64 = token;
      if (token.includes(".")) {
        b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      }
      decoded = JSON.parse(atob(b64));
    } catch (e) {
      return c.json({ error: "Token tidak valid" }, 401);
    }

    if (!decoded || !decoded.id) {
      return c.json({ error: "Data otentikasi tidak ditemukan" }, 401);
    }

    const body = await c.req.parseBody().catch(() => null);
    if (!body) return c.json({ error: "Data form tidak valid" }, 400);

    const file = body["avatar"] || body["file"];
    if (!file || typeof file === "string") {
      return c.json({ error: "Berkas avatar wajib disertakan" }, 400);
    }

    const MAX_SIZE = 1024 * 1024; // 1MB
    if (file.size > MAX_SIZE) {
      return c.json(
        { error: "Ukuran foto avatar melebihi batas maksimal 1MB!" },
        400
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
      return c.json(
        {
          error:
            "Format berkas tidak didukung! Gunakan format JPG, PNG, atau WebP.",
        },
        400
      );
    }

    const r2 = getStorageBucket(c);
    if (!r2) {
      return c.json(
        { error: "Penyimpanan media (R2) tidak terhubung di server." },
        500
      );
    }

    const date = new Date();
    const folder = `avatars/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}`;
    const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
    const key = `${folder}/user-${decoded.id}-${Date.now()}.${ext}`;

    await r2.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type || "image/jpeg" },
    });
    const url = `/api/media/file/${key}`;

    const db = c.env.DB;
    const orm = getDb(db);
    try {
      await orm
        .insert(mediaMetaTable)
        .values({
          key,
          url,
          type: file.type || "image/jpeg",
          size: file.size,
          title: `Avatar User #${decoded.id}`,
          createdAt: new Date().toISOString(),
        })
        .run();
    } catch (err) {}

    await orm
      .update(usersTable)
      .set({ avatar: url })
      .where(eq(usersTable.id, decoded.id))
      .run();

    const updatedUser = await orm
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.id))
      .get();
    let newToken = token;
    if (updatedUser) {
      const tokenPayload = {
        ...decoded,
        n: updatedUser.name || updatedUser.username,
        name: updatedUser.name || updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar || url,
        role: updatedUser.role,
        subPlan: updatedUser.subscriptionPlan,
        subExp: updatedUser.subscriptionExpiresAt,
      };
      newToken = btoa(JSON.stringify(tokenPayload));
    }

    return c.json({
      success: true,
      url,
      token: newToken,
      message: "Foto avatar berhasil diunggah!",
    });
  } catch (e: any) {
    return c.json({ error: "Gagal mengunggah avatar: " + e.message }, 500);
  }
});

// Endpoint Update Profil Pengguna Publik
profileRouter.post("/api/public/profile/update", async c => {
  try {
    const authHeader = c.req.header("Authorization") || "";
    if (!authHeader)
      return c.json({ error: "Sesi tidak sah. Silakan login kembali." }, 401);

    const token = authHeader.replace("Bearer ", "").trim();
    let decoded: any = null;
    try {
      let b64 = token;
      if (token.includes(".")) {
        b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      }
      decoded = JSON.parse(atob(b64));
    } catch (e) {
      return c.json({ error: "Token tidak valid" }, 401);
    }

    if (!decoded || !decoded.id) {
      return c.json({ error: "Data otentikasi tidak ditemukan" }, 401);
    }

    const body = await c.req.json().catch(() => null);
    if (!body) return c.json({ error: "Data request tidak valid" }, 400);

    const { name, username, email, avatar } = body;
    const db = c.env.DB;
    const orm = getDb(db);

    const updateData: any = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (email !== undefined)
      updateData.email = String(email).trim().toLowerCase();
    if (avatar !== undefined) updateData.avatar = String(avatar).trim();

    let usernameChanged = false;
    if (username !== undefined) {
      const cleanUsername = String(username)
        .trim()
        .toLowerCase()
        .replace(/^@/, "");
      if (!cleanUsername) {
        return c.json({ error: "Username tidak boleh kosong!" }, 400);
      }
      if (cleanUsername.length < 3 || cleanUsername.length > 40) {
        return c.json(
          { error: "Username harus terdiri dari 3 - 40 karakter." },
          400
        );
      }
      if (!/^[a-zA-Z0-9._@-]+$/.test(cleanUsername)) {
        return c.json(
          {
            error:
              "Username hanya boleh menggunakan huruf, angka, titik, underscore, atau tanda hubung (-).",
          },
          400
        );
      }

      const conflictUser = await orm
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(
          and(
            sql`lower(${usersTable.username}) = lower(${cleanUsername})`,
            sql`id != ${decoded.id}`
          )
        )
        .get();

      if (conflictUser) {
        return c.json(
          {
            error: `Username @${cleanUsername} sudah digunakan pengguna lain. Silakan pilih username lain.`,
          },
          400
        );
      }

      updateData.username = cleanUsername;
      usernameChanged = true;
    }

    await orm
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, decoded.id))
      .run();

    const updatedUser = await orm
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.id))
      .get();
    let newToken = token;
    if (updatedUser) {
      const tokenPayload = {
        ...decoded,
        id: updatedUser.id,
        username: updatedUser.username,
        n: updatedUser.name || updatedUser.username,
        name: updatedUser.name || updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar || "",
        role: updatedUser.role,
        subPlan: updatedUser.subscriptionPlan,
        subExp: updatedUser.subscriptionExpiresAt,
      };
      newToken = btoa(JSON.stringify(tokenPayload));
    }

    return c.json({
      success: true,
      message: "Profil berhasil diperbarui!",
      token: newToken,
      user: updatedUser,
      usernameChanged: usernameChanged,
      newUsername: updatedUser?.username || decoded.username,
    });
  } catch (e: any) {
    return c.json({ error: "Gagal memperbarui profil: " + e.message }, 500);
  }
});

// Endpoint Ganti Password Pengguna Publik
profileRouter.post("/api/public/profile/change-password", async c => {
  try {
    const authHeader = c.req.header("Authorization") || "";
    if (!authHeader)
      return c.json({ error: "Sesi tidak sah. Silakan login kembali." }, 401);

    const token = authHeader.replace("Bearer ", "").trim();
    let decoded: any = null;
    try {
      let b64 = token;
      if (token.includes(".")) {
        b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      }
      decoded = JSON.parse(atob(b64));
    } catch (e) {
      return c.json({ error: "Token tidak valid" }, 401);
    }

    if (!decoded || !decoded.id) {
      return c.json({ error: "Data otentikasi tidak ditemukan" }, 401);
    }

    const body = await c.req.json().catch(() => null);
    if (!body || !body.oldPassword || !body.newPassword) {
      return c.json(
        { error: "Password lama dan password baru wajib diisi" },
        400
      );
    }

    if (body.newPassword.length < 6) {
      return c.json({ error: "Password baru minimal 6 karakter" }, 400);
    }

    const db = c.env.DB;
    const orm = getDb(db);
    const currentUser = await orm
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.id))
      .get();
    if (!currentUser) return c.json({ error: "Pengguna tidak ditemukan" }, 404);

    if (currentUser.password !== body.oldPassword) {
      return c.json({ error: "Password lama salah!" }, 400);
    }

    await orm
      .update(usersTable)
      .set({ password: body.newPassword })
      .where(eq(usersTable.id, decoded.id))
      .run();

    return c.json({ success: true, message: "Password berhasil diperbarui!" });
  } catch (e: any) {
    return c.json({ error: "Gagal mengganti password: " + e.message }, 500);
  }
});

export default profileRouter;
