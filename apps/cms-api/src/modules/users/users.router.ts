import { Hono } from "hono";
import { getDb } from "@cmsmu/db";
import { users as usersTable } from "@cmsmu/db";
import { eq, or, desc, and, sql } from "drizzle-orm";
import { sha256, generateUserToken, getJwtSecret } from "./auth.helper";
import { adminOnlyMiddleware } from "../../middleware/auth";
import { processSsoLogin } from "./sso.service";

type Bindings = {
  DB: D1Database;
  SSO_CLIENT_ID: string;
  SSO_CLIENT_SECRET: string;
  JWT_SECRET?: string;
};

const usersRouter = new Hono<{ Bindings: Bindings }>();

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
    const updateData: any = { username, email, role, name };

    if (subscription_plan !== undefined)
      updateData.subscriptionPlan = subscription_plan;
    if (subscription_expires_at !== undefined)
      updateData.subscriptionExpiresAt = subscription_expires_at;

    if (password && password.trim() !== "") {
      updateData.password = await sha256(password);
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
