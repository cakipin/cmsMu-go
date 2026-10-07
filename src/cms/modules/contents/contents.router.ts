import { Hono } from "hono";
import { sign } from "hono/jwt";

const usersRouter = new Hono<{
  Bindings: { DB: D1Database; JWT_SECRET: string };
}>();

usersRouter.post("/login", async c => {
  try {
    const body = await c.req.json();
    // UBAH DARI EMAIL KE USERNAME SESUAI DB
    const { username, password } = body;

    if (!username || !password) {
      return c.json({ error: "Username dan password wajib diisi." }, 400);
    }

    // 1. QUERY SESUAI KOLOM DI SCREENSHOT (username)
    const user = await c.env.DB.prepare(
      "SELECT * FROM users WHERE username = ?"
    )
      .bind(username)
      .first();

    if (!user) {
      return c.json({ error: "User tidak ditemukan." }, 401);
    }

    // 2. CEK PASSWORD
    // Karena di screenshot 'admin3' passwordnya '123451' (plain), kita cek langsung string-nya.
    // Jika nanti mau login 'admin' (yang hash), butuh logika hash khusus.
    if (user.password !== password) {
      return c.json({ error: "Password salah." }, 401);
    }

    // 3. GENERATE TOKEN
    const secret = c.env.JWT_SECRET || "labmu_rahasia";
    const token = await sign(
      {
        id: user.id,
        username: user.username, // Pakai username
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 86400 * 7,
      },
      secret
    );

    return c.json({ success: true, token: token });
  } catch (e: any) {
    // Tampilkan error asli biar ketahuan kalau ada salah kolom lagi
    return c.json({ error: "DB Error: " + e.message }, 500);
  }
});

export default usersRouter;
