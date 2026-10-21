import { Hono } from "hono";
import { getDb } from "@cmsmu/db";
import { users as usersTable, mediaMeta } from "@cmsmu/db";
import { eq, or, desc, and, sql } from "drizzle-orm";
import { getStorageBucket } from "../../storage/r2-adapter";
import {
  sha256,
  generateUserToken,
  verifyUserToken,
  getJwtSecret,
} from "./auth.helper";
import { adminOnlyMiddleware } from "../../middleware/auth";
import { processSsoLogin } from "./sso.service";

type Bindings = {
  DB: D1Database;
  SSO_CLIENT_ID: string;
  SSO_CLIENT_SECRET: string;
  JWT_SECRET?: string;
};

const usersRouter = new Hono<{ Bindings: Bindings; Variables: { user?: any } }>();

// ---------------------------------------------------------------------
// 1. GET ALL USERS (ADMIN ONLY)
// ---------------------------------------------------------------------
usersRouter.get("/", adminOnlyMiddleware, async c => {
  try {
    if (!c.env.DB) return c.json({ error: "Database Error" }, 500);
    const db = getDb(c.env.DB);
    const results = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        subscription_plan: usersTable.subscriptionPlan,
        subscription_expires_at: usersTable.subscriptionExpiresAt,
        created_at: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt));
    return c.json({ success: true, data: results || [] });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// ---------------------------------------------------------------------
// 2. CREATE USER (ADMIN ONLY - POST /)
// ---------------------------------------------------------------------
usersRouter.post("/", adminOnlyMiddleware, async c => {
  try {
    const body = await c.req.json();
    const {
      username,
      password,
      email,
      role,
      name,
      subscription_plan,
      subscription_expires_at,
    } = body;

    if (!username || !password)
      return c.json({ error: "Username & Password wajib" }, 400);

    const finalPass = await sha256(password);

    const db = getDb(c.env.DB);
    const res = await db
      .insert(usersTable)
      .values({
        username,
        password: finalPass,
        email: email || "",
        role: role || "editor",
        name: name || "",
        subscriptionPlan: subscription_plan || null,
        subscriptionExpiresAt: subscription_expires_at || null,
        createdAt: new Date().toISOString(),
      })
      .run();

    if (res.success) {
      return c.json({ success: true, message: "User berhasil dibuat" });
    } else {
      return c.json({ error: "Gagal membuat user" }, 500);
    }
  } catch (e: any) {
    return c.json({ error: "Error: " + e.message }, 500);
  }
});

// ---------------------------------------------------------------------
// 2B. UPDATE PROFILE PASSWORD (PUT /profile-password)
// ---------------------------------------------------------------------
usersRouter.put("/profile-password", async c => {
  try {
    const authHeader = c.req.header("Authorization");
    let token = authHeader ? authHeader.replace(/^Bearer\s+/i, "").trim() : "";

    if (!token) {
      const cookieHeader = c.req.header("Cookie") || "";
      const parts = cookieHeader.split(";");
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i].trim();
        if (p.indexOf("labmu_token=") === 0) {
          token = decodeURIComponent(p.substring(12));
          break;
        }
      }
    }

    if (!token) {
      return c.json({ error: "Autentikasi diperlukan" }, 401);
    }

    const payload = await verifyUserToken(token, getJwtSecret(c.env));
    if (!payload || !payload.id) {
      return c.json({ error: "Token pengguna tidak valid" }, 401);
    }

    const body = await c.req.json().catch(() => null);
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    if (!currentPassword || !newPassword) {
      return c.json(
        { error: "Password saat ini dan password baru wajib diisi" },
        400
      );
    }
    if (newPassword.length < 6) {
      return c.json({ error: "Password baru minimal 6 karakter" }, 400);
    }

    const db = getDb(c.env.DB);
    const user = await db
      .select({ id: usersTable.id, password: usersTable.password })
      .from(usersTable)
      .where(eq(usersTable.id, Number(payload.id)))
      .get();

    if (!user) {
      return c.json({ error: "Akun pengguna tidak ditemukan" }, 404);
    }

    const hashedCurrent = await sha256(currentPassword);
    const dbPass = String(user.password || "");
    if (hashedCurrent !== dbPass && currentPassword !== dbPass) {
      return c.json({ error: "Password saat ini tidak sesuai" }, 400);
    }

    const hashedNew = await sha256(newPassword);
    const res = await db
      .update(usersTable)
      .set({ password: hashedNew })
      .where(eq(usersTable.id, user.id))
      .run();

    if (res.success) {
      return c.json({ success: true, message: "Password berhasil diperbarui" });
    }
    return c.json({ error: "Gagal memperbarui password" }, 500);
  } catch (e: any) {
    return c.json({ error: e.message || "Gagal memperbarui password" }, 500);
  }
});

// ---------------------------------------------------------------------
// 2C. UPLOAD PROFILE AVATAR (POST /profile-avatar)
// ---------------------------------------------------------------------
usersRouter.post("/profile-avatar", async c => {
  try {
    const authHeader = c.req.header("Authorization");
    let token = authHeader ? authHeader.replace(/^Bearer\s+/i, "").trim() : "";

    if (!token) {
      const cookieHeader = c.req.header("Cookie") || "";
      const match = cookieHeader.match(/labmu_token=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }

    if (!token) {
      return c.json({ error: "Autentikasi diperlukan" }, 401);
    }

    let payload: any = null;
    try {
      payload = await verifyUserToken(token, getJwtSecret(c.env));
    } catch (_) {
      try {
        let b64 = token;
        if (token.includes(".")) {
          b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        }
        payload = JSON.parse(atob(b64));
      } catch (err) {}
    }

    if (!payload || !payload.id) {
      return c.json({ error: "Token pengguna tidak valid" }, 401);
    }

    const userId = Number(payload.id);
    const body = await c.req.parseBody().catch(() => null);
    const file = (body?.["avatar"] || body?.["file"]) as File | undefined;

    if (!file || typeof file === "string") {
      return c.json({ error: "Berkas foto wajib diunggah" }, 400);
    }

    // Maksimal 2MB
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return c.json({ error: "Ukuran foto melebihi batas maksimal 2MB" }, 400);
    }

    const allowedMime = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (file.type && !allowedMime.includes(file.type.toLowerCase())) {
      return c.json(
        { error: "Format berkas tidak didukung! Gunakan format JPG, PNG, atau WebP" },
        400
      );
    }

    const r2 = getStorageBucket(c);
    if (!r2) {
      return c.json({ error: "Penyimpanan media (R2) tidak terhubung di server" }, 500);
    }

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const folder = `avatars/${year}/${month}`;
    const extMatch = (file.name || "").match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
    const key = `${folder}/user-${userId}-${Date.now()}.${ext}`;

    const fileBuffer = await file.arrayBuffer();
    await r2.put(key, fileBuffer, {
      httpMetadata: { contentType: file.type || "image/jpeg" },
    });
    const url = `/${key}`;

    const db = getDb(c.env.DB);
    try {
      await db
        .insert(mediaMeta)
        .values({
          key,
          url,
          type: file.type || "image/jpeg",
          size: file.size,
          title: `Avatar User #${userId}`,
          alt: `Avatar ${payload.name || payload.username || "User"}`,
          createdAt: new Date().toISOString(),
        })
        .run();
    } catch (_) {}

    await db
      .update(usersTable)
      .set({ avatar: url })
      .where(eq(usersTable.id, userId))
      .run();

    const updatedUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .get();

    const newToken = await generateUserToken(
      {
        id: userId,
        username: updatedUser?.username || payload.username,
        name: updatedUser?.name || payload.name,
        role: updatedUser?.role || payload.role,
        avatar: url,
      },
      getJwtSecret(c.env)
    );

    return c.json({
      success: true,
      url,
      token: newToken,
      message: "Foto profil berhasil diperbarui!",
    });
  } catch (e: any) {
    return c.json({ error: "Gagal mengunggah foto: " + (e.message || "Terjadi kesalahan") }, 500);
  }
});


// ---------------------------------------------------------------------
// 3. UPDATE USER (ADMIN ONLY - PUT /:id)
// ---------------------------------------------------------------------
usersRouter.put("/:id", adminOnlyMiddleware, async c => {
  try {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const {
      username,
      email,
      role,
      name,
      password,
      subscription_plan,
      subscription_expires_at,
    } = body;

    const db = getDb(c.env.DB);
    const updateData: any = {};

    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (name !== undefined) updateData.name = name;
    if (subscription_plan !== undefined)
      updateData.subscriptionPlan = subscription_plan;
    if (subscription_expires_at !== undefined)
      updateData.subscriptionExpiresAt = subscription_expires_at;

    if (password && String(password).trim() !== "") {
      updateData.password = await sha256(String(password));
    }

    if (Object.keys(updateData).length === 0) {
      return c.json({ error: "Tidak ada data yang diperbarui" }, 400);
    }

    const res = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, id))
      .run();

    if (res.success) {
      return c.json({ success: true });
    } else {
      return c.json({ error: "Gagal update user" }, 500);
    }
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// ---------------------------------------------------------------------
// 4. DELETE USER (ADMIN ONLY - DELETE /:id)
// ---------------------------------------------------------------------
usersRouter.delete("/:id", adminOnlyMiddleware, async c => {
  try {
    const id = Number(c.req.param("id"));
    const currentUser = c.get("user");
    if (currentUser && Number(currentUser.id) === id) {
      return c.json(
        {
          error:
            "Dilarang menghapus akun Anda sendiri yang sedang aktif login!",
        },
        400
      );
    }

    const db = getDb(c.env.DB);
    const res = await db.delete(usersTable).where(eq(usersTable.id, id)).run();

    if (res.success) {
      return c.json({ success: true });
    } else {
      return c.json({ error: "Gagal menghapus user" }, 500);
    }
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// ---------------------------------------------------------------------
// 5. MANUAL LOGIN (POST /login)
// ---------------------------------------------------------------------
usersRouter.post("/login", async c => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body) return c.json({ error: "Data login tidak lengkap" }, 400);

    const { username, password } = body;
    if (!username || !password)
      return c.json({ error: "Username dan Password wajib diisi" }, 400);
    if (!c.env.DB) return c.json({ error: "Database tidak terhubung" }, 500);

    const identifier = String(username).trim();
    const lowerId = identifier.toLowerCase();

    const db = getDb(c.env.DB);
    const user = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        name: usersTable.name,
        password: usersTable.password,
        role: usersTable.role,
        avatar: usersTable.avatar,
      })
      .from(usersTable)
      .where(
        or(
          eq(sql`lower(${usersTable.username})`, lowerId),
          eq(sql`lower(${usersTable.email})`, lowerId),
          eq(sql`lower(${usersTable.name})`, lowerId)
        )
      )
      .get();

    if (!user)
      return c.json({ error: "Username atau email tidak terdaftar" }, 401);

    const inputPassword = String(password);
    const dbPassword = String(user.password);

    const isPlainMatch = inputPassword === dbPassword;
    const hashedInput = await sha256(inputPassword);
    const isHashMatch = hashedInput === dbPassword;

    if (!isPlainMatch && !isHashMatch)
      return c.json({ error: "Password salah" }, 401);

    if (!isHashMatch) {
      // Auto-upgrade password plaintext lama ke SHA-256
      await db
        .update(usersTable)
        .set({ password: hashedInput })
        .where(eq(usersTable.id, user.id))
        .run()
        .catch(() => {});
    }

    const token = await generateUserToken(
      {
        id: user.id,
        username: user.username || "",
        name: user.name || "",
        role: user.role || "subscriber",
      },
      getJwtSecret(c.env)
    );

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  } catch (e: any) {
    return c.json({ error: "Gagal Login: " + e.message }, 500);
  }
});

// ---------------------------------------------------------------------
// 5B. PUBLIC REGISTRATION (POST /register)
// ---------------------------------------------------------------------
usersRouter.post("/register", async c => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body)
      return c.json(
        { success: false, error: "Data pendaftaran tidak valid" },
        400
      );

    const name = String(body.name || "").trim();
    const rawUsername = String(body.username || "")
      .trim()
      .toLowerCase();
    const username = rawUsername.replace(/[^a-z0-9_.-]/g, "");
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!name)
      return c.json({ success: false, error: "Nama Lengkap wajib diisi" }, 400);
    if (!username || username.length < 3)
      return c.json(
        { success: false, error: "Username minimal 3 karakter" },
        400
      );
    if (!email || !email.includes("@"))
      return c.json({ success: false, error: "Format email tidak valid" }, 400);
    if (!password || password.length < 6)
      return c.json(
        { success: false, error: "Password minimal 6 karakter" },
        400
      );

    if (!c.env.DB)
      return c.json({ success: false, error: "Database tidak terhubung" }, 500);
    const db = getDb(c.env.DB);

    // Cek apakah username atau email sudah ada
    const existing = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
      })
      .from(usersTable)
      .where(
        or(
          eq(sql`lower(${usersTable.username})`, username),
          eq(sql`lower(${usersTable.email})`, email)
        )
      )
      .get();

    if (existing) {
      if ((existing.username || "").toLowerCase() === username) {
        return c.json(
          {
            success: false,
            error: "Username sudah digunakan. Silakan pilih username lain.",
          },
          400
        );
      }
      return c.json(
        {
          success: false,
          error: "Alamat email sudah terdaftar. Silakan masuk ke akun Anda.",
        },
        400
      );
    }

    // Hash password menggunakan sha256 agar sesuai format auth
    const hashedPassword = await sha256(password);

    const res = await db
      .insert(usersTable)
      .values({
        name,
        username,
        email,
        password: hashedPassword,
        role: "subscriber",
        createdAt: new Date().toISOString(),
      })
      .run();

    if (!res.success) {
      return c.json({ success: false, error: "Gagal membuat akun" }, 500);
    }

    const createdUser = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        name: usersTable.name,
        role: usersTable.role,
        avatar: usersTable.avatar,
      })
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .get();

    if (!createdUser) {
      return c.json(
        { success: false, error: "Gagal memuat data akun baru" },
        500
      );
    }

    const token = await generateUserToken(
      {
        id: createdUser.id,
        username: createdUser.username || "",
        name: createdUser.name || "",
        role: createdUser.role || "subscriber",
      },
      getJwtSecret(c.env)
    );

    return c.json({
      success: true,
      message: "Pendaftaran berhasil",
      token,
      user: {
        id: createdUser.id,
        username: createdUser.username,
        name: createdUser.name,
        role: createdUser.role,
        avatar: createdUser.avatar || "",
      },
    });
  } catch (e: any) {
    return c.json(
      { success: false, error: "Terjadi kesalahan sistem: " + e.message },
      500
    );
  }
});

// ---------------------------------------------------------------------
// 6. SSO LOGIN (POST /sso)
// ---------------------------------------------------------------------
usersRouter.post("/sso", async c => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body || !body.code || !body.redirectUri) {
      return c.json({ error: "Data otorisasi tidak lengkap" }, 400);
    }
    if (!c.env.DB) return c.json({ error: "Database tidak terhubung" }, 500);

    const db = getDb(c.env.DB);
    const result = await processSsoLogin(c, db, body);

    if (result.error) {
      return c.json({ error: result.error }, (result.status || 500) as any);
    }

    return c.json(result);
  } catch (e: any) {
    return c.json(
      { error: "Terjadi kesalahan sistem saat memproses SSO: " + e.message },
      500
    );
  }
});

export default usersRouter;
