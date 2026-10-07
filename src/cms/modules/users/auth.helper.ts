import { sign, verify } from "hono/jwt";

export const DEFAULT_JWT_SECRET =
  "cmsmu-core-secret-key-2026-auth-jwt-token-engine";

export function getJwtSecret(env?: any): string {
  return env?.JWT_SECRET || DEFAULT_JWT_SECRET;
}

export async function sha256(
  message: string,
  salt: string = ""
): Promise<string> {
  const salted = salt ? `${message}:${salt}` : message;
  const msgBuffer = new TextEncoder().encode(salted);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function generateUserToken(
  user: {
    id: number | string;
    username: string;
    name?: string | null;
    role?: string | null;
    avatar?: string | null;
  },
  secret: string = DEFAULT_JWT_SECRET
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    id: user.id,
    username: user.username,
    name: user.name || user.username,
    n: user.name || user.username,
    role: user.role || "subscriber",
    avatar: user.avatar || "",
    iat: now,
    exp: now + 60 * 60 * 24 * 30, // 30 hari
  };
  return await sign(payload, secret, "HS256");
}

export async function verifyUserToken(
  token: string,
  secret: string = DEFAULT_JWT_SECRET
): Promise<any> {
  return await verify(token, secret, "HS256");
}
