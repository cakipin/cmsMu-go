import type { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { getJwtSecret } from '../modules/users/auth.helper';

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  let token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

  if (!token) {
    // Fallback: baca dari Cookie header
    const cookieHeader = c.req.header('Cookie') || '';
    const parts = cookieHeader.split(';');
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i].trim();
      if (p.indexOf('labmu_token=') === 0) {
        token = decodeURIComponent(p.substring(12));
        break;
      }
    }
  }

  if (!token) {
    return c.json({ error: 'Butuh Login (Header & Cookie Kosong)' }, 401);
  }

  const secret = getJwtSecret(c.env);

  try {
    // Verifikasi Cryptographic Signature HMAC-SHA256 (Anti-Forgery)
    const payload = await verify(token, secret, 'HS256');

    if (!payload || typeof payload !== 'object' || !payload.id) {
      throw new Error('Payload Token Tidak Valid');
    }

    // Set context user agar bisa dipakai di router downstream
    c.set('user', payload);
    await next();

  } catch (e: any) {
    console.error("Auth Token Verification Failed:", e.message);
    return c.json({ error: 'Token Tidak Valid / Telah Kadaluwarsa' }, 401);
  }
};

export const adminOnlyMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  let token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

  if (!token) {
    const cookieHeader = c.req.header('Cookie') || '';
    const parts = cookieHeader.split(';');
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i].trim();
      if (p.indexOf('labmu_token=') === 0) {
        token = decodeURIComponent(p.substring(12));
        break;
      }
    }
  }

  if (!token) {
    return c.json({ error: 'Butuh Login Admin (Header & Cookie Kosong)' }, 401);
  }

  const secret = getJwtSecret(c.env);

  try {
    const payload: any = await verify(token, secret, 'HS256');
    if (!payload || typeof payload !== 'object' || !payload.id) {
      throw new Error('Payload Token Tidak Valid');
    }

    const role = String(payload.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'superadmin') {
      return c.json({ error: 'Akses Ditolak: Memerlukan Hak Akses Administrator' }, 403);
    }

    c.set('user', payload);
    await next();
  } catch (e: any) {
    console.error("Admin Auth Failed:", e.message);
    return c.json({ error: 'Token Tidak Valid / Telah Kadaluwarsa' }, 401);
  }
};