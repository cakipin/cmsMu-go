import { Hono } from 'hono';
import { getDb } from '../../db';
import { users as usersTable, subscriptions as subscriptionsTable } from '../../db/schema';
import { eq, or, desc, and, sql } from 'drizzle-orm';
import { sha256, generateUserToken } from './auth.helper';
import { processSsoLogin } from './sso.service';

type Bindings = {
  DB: D1Database;
  SSO_CLIENT_ID: string;
  SSO_CLIENT_SECRET: string;
};

const usersRouter = new Hono<{ Bindings: Bindings }>();

// ---------------------------------------------------------------------
// 1. GET ALL USERS
// ---------------------------------------------------------------------
usersRouter.get('/', async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: 'Database Error' }, 500);
    const db = getDb(c.env.DB);
    const results = await db.select({
      id: usersTable.id,
      username: usersTable.username,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      subscription_plan: usersTable.subscriptionPlan,
      subscription_expires_at: usersTable.subscriptionExpiresAt,
      created_at: usersTable.createdAt
    }).from(usersTable).orderBy(desc(usersTable.createdAt));
    return c.json({ success: true, data: results || [] });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// ---------------------------------------------------------------------
// 2. CREATE USER (POST /)
// ---------------------------------------------------------------------
usersRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password, email, role, name, subscription_plan, subscription_expires_at } = body;

    if (!username || !password) return c.json({ error: 'Username & Password wajib' }, 400);

    const finalPass = password; 

    const db = getDb(c.env.DB);
    const res = await db.insert(usersTable).values({
      username,
      password: finalPass,
      email: email || '',
      role: role || 'editor',
      name: name || '',
      subscriptionPlan: subscription_plan || null,
      subscriptionExpiresAt: subscription_expires_at || null,
      createdAt: new Date().toISOString()
    }).run();

    if (res.success) {
      if (role === 'subscriber_pro') {
        const createdUser = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, username)).get();
        if (createdUser) {
          await db.insert(subscriptionsTable).values({
            userId: createdUser.id,
            email: email || '',
            plan: subscription_plan || '1_bulan',
            status: 'approved',
            notes: 'Ditetapkan dari Manajemen User',
            expiresAt: subscription_expires_at || null
          }).run().catch(() => {});
        }
      }
      return c.json({ success: true, message: 'User berhasil dibuat' });
    } else {
      return c.json({ error: 'Gagal membuat user' }, 500);
    }
  } catch (e: any) {
    return c.json({ error: 'Error: ' + e.message }, 500);
  }
});

// ---------------------------------------------------------------------
// 3. UPDATE USER (PUT /:id)
// ---------------------------------------------------------------------
usersRouter.put('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const { username, email, role, name, password, subscription_plan, subscription_expires_at } = body;

    const db = getDb(c.env.DB);
    const updateData: any = { username, email, role, name };

    if (subscription_plan !== undefined) updateData.subscriptionPlan = subscription_plan;
    if (subscription_expires_at !== undefined) updateData.subscriptionExpiresAt = subscription_expires_at;

    if (password && password.trim() !== '') {
      updateData.password = password;
    }

    const res = await db.update(usersTable).set(updateData).where(eq(usersTable.id, id)).run();

    if (res.success) {
      if (role === 'subscriber_pro') {
        const existingSub = await db.select({ id: subscriptionsTable.id }).from(subscriptionsTable).where(eq(subscriptionsTable.userId, id)).get();
        if (!existingSub) {
          await db.insert(subscriptionsTable).values({
            userId: id,
            email: email || '',
            plan: subscription_plan || '1_bulan',
            status: 'approved',
            notes: 'Ditetapkan dari Manajemen User',
            expiresAt: subscription_expires_at || null
          }).run().catch(() => {});
        } else {
          await db.update(subscriptionsTable).set({
            status: 'approved',
            plan: subscription_plan || '1_bulan',
            expiresAt: subscription_expires_at || null,
            updatedAt: sql`CURRENT_TIMESTAMP`
          }).where(eq(subscriptionsTable.userId, id)).run().catch(() => {});
        }
      } else if (role === 'subscriber') {
        await db.update(subscriptionsTable).set({
          status: 'expired',
          updatedAt: sql`CURRENT_TIMESTAMP`
        }).where(and(eq(subscriptionsTable.userId, id), eq(subscriptionsTable.status, 'approved'))).run().catch(() => {});
      }
      return c.json({ success: true });
    } else {
      return c.json({ error: 'Gagal update user' }, 500);
    }
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// ---------------------------------------------------------------------
// 4. DELETE USER (DELETE /:id)
// ---------------------------------------------------------------------
usersRouter.delete('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const db = getDb(c.env.DB);
    const res = await db.delete(usersTable).where(eq(usersTable.id, id)).run();

    if (res.success) {
      return c.json({ success: true });
    } else {
      return c.json({ error: 'Gagal menghapus user' }, 500);
    }
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// ---------------------------------------------------------------------
// 5. MANUAL LOGIN (POST /login)
// ---------------------------------------------------------------------
usersRouter.post('/login', async (c) => {
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

    const token = generateUserToken(user);

    return c.json({ 
      success: true, 
      token, 
      user: { id: user.id, username: user.username, name: user.name, role: user.role, avatar: user.avatar || '' } 
    });
  } catch (e: any) {
    return c.json({ error: 'Gagal Login: ' + e.message }, 500);
  }
});

// ---------------------------------------------------------------------
// 6. SSO LOGIN (POST /sso)
// ---------------------------------------------------------------------
usersRouter.post('/sso', async (c) => {
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

export default usersRouter;