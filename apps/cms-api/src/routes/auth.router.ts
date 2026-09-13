import { Hono } from 'hono';
import { getDb, users as usersTable } from '@cmsmu/db';
import { eq, or, sql } from 'drizzle-orm';
import { sha256, generateUserToken, processSsoLogin } from '@cmsmu/core';

const authRouter = new Hono<{ Bindings: any }>();

// 1. MANUAL LOGIN
authRouter.post('/login', async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body) return c.json({ error: 'Data login tidak lengkap' }, 400);

    const { username, password } = body; 
    if (!username || !password) return c.json({ error: 'Username dan Password wajib diisi' }, 400);
    if (!c.env.DB) return c.json({ error: 'Database tidak terhubung' }, 500);

    const identifier = String(username).trim();
    const lowerId = identifier.toLowerCase();

    const db = getDb(c.env.DB);
    const user = await db.select({
      id: usersTable.id,
      username: usersTable.username,
      name: usersTable.name,
      password: usersTable.password,
      role: usersTable.role,
      avatar: usersTable.avatar
    }).from(usersTable).where(
      or(
        eq(sql`lower(${usersTable.username})`, lowerId),
        eq(sql`lower(${usersTable.email})`, lowerId),
        eq(sql`lower(${usersTable.name})`, lowerId)
      )
    ).get();

    if (!user) return c.json({ error: 'Username atau email tidak terdaftar' }, 401);

    const inputPassword = String(password);
    const dbPassword = String(user.password);
    
    const isPlainMatch = inputPassword === dbPassword;
    const hashedInput = await sha256(inputPassword);
    const isHashMatch = hashedInput === dbPassword;

    if (!isPlainMatch && !isHashMatch) return c.json({ error: 'Password salah' }, 401);

    const token = generateUserToken({
      id: user.id,
      username: user.username || 'user',
      name: user.name,
      role: user.role,
      avatar: user.avatar
    });

    return c.json({ 
      success: true, 
      token, 
      user: { id: user.id, username: user.username || '', name: user.name, role: user.role, avatar: user.avatar || '' } 
    });
  } catch (e: any) {
    return c.json({ error: 'Gagal Login: ' + e.message }, 500);
  }
});

// 2. SSO LOGIN (MUHAMMADIYAH ID)
authRouter.post('/sso', async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body || !body.code || !body.redirectUri) {
      return c.json({ error: 'Data otorisasi tidak lengkap' }, 400);
    }
    if (!c.env.DB) return c.json({ error: 'Database tidak terhubung' }, 500);

    const db = getDb(c.env.DB);
    const result = await processSsoLogin(c, db, body);

    if (result.error) {
      return c.json({ error: result.error }, result.status || 500);
    }

    return c.json(result);
  } catch (e: any) {
    return c.json({ error: 'Terjadi kesalahan sistem saat memproses SSO: ' + e.message }, 500);
  }
});

export default authRouter;
