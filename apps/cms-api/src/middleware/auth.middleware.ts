import type { Context, Next } from 'hono';
import { verifyUserToken } from '@cmsmu/core';

export interface AuthUser {
  id: number | string;
  username: string;
  name?: string;
  n?: string;
  role: string;
  avatar?: string;
}

export type ApiVariables = {
  user: AuthUser;
  userId: number | string;
};

export type ApiEnv = {
  Bindings: any;
  Variables: ApiVariables;
};

/**
 * 🔒 Middleware Otentikasi JWT / Bearer Token
 * Memastikan request memiliki token valid di header Authorization atau Cookie.
 */
export async function requireAuth(c: Context<ApiEnv>, next: Next) {
  let token = '';

  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // Fallback: check cookie if header not provided
  if (!token) {
    const cookieHeader = c.req.header('Cookie') || '';
    const match = cookieHeader.match(/labmu_token=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token) {
    return c.json({ error: 'Unauthorized: Sesi tidak ditemukan atau token tidak disediakan' }, 401);
  }

  const user = verifyUserToken(token);
  if (!user) {
    return c.json({ error: 'Unauthorized: Token tidak valid atau sesi telah berakhir' }, 401);
  }

  c.set('user', user);
  c.set('userId', user.id);

  await next();
}

/**
 * 🛡️ Middleware Pemeriksaan Hak Akses (Role-Based Access Control)
 */
export function requireRole(allowedRoles: string[]) {
  return async (c: Context<ApiEnv>, next: Next) => {
    const user = c.get('user') as AuthUser | undefined;
    if (!user) {
      return c.json({ error: 'Unauthorized: Autentikasi diperlukan' }, 401);
    }

    const userRole = (user.role || 'subscriber').toLowerCase();
    const hasRole = allowedRoles.some(r => r.toLowerCase() === userRole);

    if (!hasRole) {
      return c.json({ error: 'Forbidden: Anda tidak memiliki akses untuk tindakan ini' }, 403);
    }

    await next();
  };
}

/**
 * 🔓 Middleware Otentikasi Opsional
 * Mengambil data user jika token ada, namun tetap meloloskan request jika tamu/guest.
 */
export async function optionalAuth(c: Context<ApiEnv>, next: Next) {
  let token = '';
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    const cookieHeader = c.req.header('Cookie') || '';
    const match = cookieHeader.match(/labmu_token=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }

  if (token) {
    const user = verifyUserToken(token);
    if (user) {
      c.set('user', user);
      c.set('userId', user.id);
    }
  }

  await next();
}
