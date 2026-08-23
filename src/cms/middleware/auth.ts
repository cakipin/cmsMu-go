import type { Context, Next } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';

export type CmsRole = 'administrator' | 'editor' | 'author' | 'subscriber';
export type SessionUser = { id: number; username: string; email?: string; role: CmsRole; name?: string; avatar?: string };

const COOKIE = '__Host-cmsmu_session';
const MAX_AGE = 60 * 60 * 8;

function secret(c: Context): string {
  const value = c.env?.SESSION_SECRET || c.env?.JWT_SECRET;
  if (!value || value.length < 32) throw new Error('SESSION_SECRET belum dikonfigurasi dengan aman');
  return value;
}

export async function createSession(c: Context, user: SessionUser) {
  const now = Math.floor(Date.now() / 1000);
  const token = await sign({ ...user, iat: now, exp: now + MAX_AGE, iss: 'cmsmu', aud: 'cmsmu-admin' }, secret(c), 'HS256');
  setCookie(c, COOKIE, token, { httpOnly: true, secure: true, sameSite: 'Strict', path: '/', maxAge: MAX_AGE });
}

export function clearSession(c: Context) {
  deleteCookie(c, COOKIE, { secure: true, path: '/' });
}

export function normalizeRole(role: unknown): CmsRole {
  const value = String(role || '').toLowerCase();
  if (value === 'admin' || value === 'administrator') return 'administrator';
  if (value === 'editor') return 'editor';
  if (value === 'author') return 'author';
  return 'subscriber';
}

export async function readSession(c: Context): Promise<SessionUser | null> {
  const token = getCookie(c, COOKIE);
  if (!token) return null;
  try {
    const payload: any = await verify(token, secret(c), 'HS256');
    if (payload.iss !== 'cmsmu' || payload.aud !== 'cmsmu-admin' || !payload.id || !payload.role) return null;
    const user: any = await c.env.DB.prepare('SELECT id, username, email, role, name, avatar FROM users WHERE id = ?').bind(payload.id).first();
    if (!user) return null;
    return { id: user.id, username: user.username, email: user.email, role: normalizeRole(user.role), name: user.name, avatar: user.avatar };
  } catch {
    return null;
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  const user = await readSession(c);
  if (!user) return c.json({ error: 'Sesi tidak valid atau telah berakhir' }, 401);
  c.set('user', user);
  await next();
};

export const requireRole = (...roles: CmsRole[]) => async (c: Context, next: Next) => {
  const user = (c.get('user') || await readSession(c)) as SessionUser | null;
  if (!user) return c.json({ error: 'Sesi tidak valid atau telah berakhir' }, 401);
  if (!roles.includes(user.role)) return c.json({ error: 'Akses ditolak' }, 403);
  c.set('user', user);
  await next();
};

export const requireAdmin = requireRole('administrator');
export const requireEditor = requireRole('administrator', 'editor');
