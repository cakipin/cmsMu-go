import { Hono } from 'hono';
import { getDb, users } from '@cmsmu/db';
import { eq, desc } from 'drizzle-orm';
import { sha256 } from '@cmsmu/core';
import { requireAuth, requireRole, type ApiEnv } from '../middleware/auth.middleware';

const usersRouter = new Hono<ApiEnv>();

// 1. GET CURRENT USER PROFILE
usersRouter.get('/me', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const db = getDb(c.env.DB);
    const user = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
      avatar: users.avatar,
      subscriptionPlan: users.subscriptionPlan,
      subscriptionExpiresAt: users.subscriptionExpiresAt,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, Number(userId))).get();

    if (!user) return c.json({ error: 'Pengguna tidak ditemukan' }, 404);
    return c.json(user);
  } catch (e: any) {
    return c.json({ error: 'Gagal memuat profil: ' + e.message }, 500);
  }
});

// 2. UPDATE CURRENT USER PROFILE
usersRouter.put('/me', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json().catch(() => null);
    if (!body) return c.json({ error: 'Payload tidak valid' }, 400);

    const db = getDb(c.env.DB);
    const updateData: Record<string, any> = {};

    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.email !== undefined) updateData.email = String(body.email).trim().toLowerCase();
    if (body.avatar !== undefined) updateData.avatar = String(body.avatar).trim();

    await db.update(users).set(updateData).where(eq(users.id, Number(userId))).run();
    return c.json({ success: true, message: 'Profil berhasil diperbarui' });
  } catch (e: any) {
    return c.json({ error: 'Gagal memperbarui profil: ' + e.message }, 500);
  }
});

// 3. CHANGE PASSWORD
usersRouter.put('/me/password', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json().catch(() => null);
    if (!body || !body.old_password || !body.new_password) {
      return c.json({ error: 'Password lama dan baru wajib diisi' }, 400);
    }

    const db = getDb(c.env.DB);
    const user = await db.select().from(users).where(eq(users.id, Number(userId))).get();
    if (!user) return c.json({ error: 'Pengguna tidak ditemukan' }, 404);

    const hashedOld = await sha256(String(body.old_password));
    const isOldMatch = user.password === body.old_password || user.password === hashedOld;

    if (!isOldMatch) {
      return c.json({ error: 'Password lama tidak sesuai' }, 400);
    }

    const hashedNew = await sha256(String(body.new_password));
    await db.update(users).set({ password: hashedNew }).where(eq(users.id, Number(userId))).run();

    return c.json({ success: true, message: 'Password berhasil diubah' });
  } catch (e: any) {
    return c.json({ error: 'Gagal mengubah password: ' + e.message }, 500);
  }
});

// 4. LIST ALL USERS (Protected: Admin Only)
usersRouter.get('/', requireAuth, requireRole(['admin']), async (c) => {
  try {
    const db = getDb(c.env.DB);
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
      avatar: users.avatar,
      createdAt: users.createdAt
    }).from(users).orderBy(desc(users.id));

    return c.json(allUsers || []);
  } catch (e: any) {
    return c.json({ error: 'Gagal memuat daftar pengguna: ' + e.message }, 500);
  }
});

// 5. CREATE NEW USER (Protected: Admin Only)
usersRouter.post('/', requireAuth, requireRole(['admin']), async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body || !body.username || !body.password) {
      return c.json({ error: 'Username dan password wajib diisi' }, 400);
    }

    const db = getDb(c.env.DB);
    const hashedPassword = await sha256(String(body.password));
    const now = String(Date.now());

    const newUser = await db.insert(users).values({
      username: String(body.username).trim().toLowerCase(),
      password: hashedPassword,
      name: body.name || body.username,
      email: body.email || null,
      role: body.role || 'author',
      avatar: body.avatar || '',
      createdAt: now
    }).returning().get();

    return c.json({ success: true, message: 'Pengguna berhasil dibuat', user: { id: newUser.id, username: newUser.username } }, 201);
  } catch (e: any) {
    return c.json({ error: 'Gagal membuat pengguna: ' + e.message }, 500);
  }
});

// 6. DELETE USER (Protected: Admin Only)
usersRouter.delete('/:id', requireAuth, requireRole(['admin']), async (c) => {
  try {
    const id = parseInt(c.req.param('id') || '', 10);
    if (isNaN(id)) return c.json({ error: 'ID tidak valid' }, 400);

    const currentUserId = Number(c.get('userId'));
    if (id === currentUserId) {
      return c.json({ error: 'Tidak dapat menghapus akun Anda sendiri' }, 400);
    }

    const db = getDb(c.env.DB);
    await db.delete(users).where(eq(users.id, id)).run();
    return c.json({ success: true, message: 'Pengguna berhasil dihapus' });
  } catch (e: any) {
    return c.json({ error: 'Gagal menghapus pengguna: ' + e.message }, 500);
  }
});

export default usersRouter;
