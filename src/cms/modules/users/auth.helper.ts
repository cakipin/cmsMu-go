export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export function generateUserToken(user: {
  id: number | string;
  username: string;
  name?: string | null;
  role?: string | null;
  avatar?: string | null;
}): string {
  const payload = {
    id: user.id,
    username: user.username,
    n: user.name || user.username,
    role: user.role || "subscriber",
    avatar: user.avatar || "",
    iat: Date.now(),
  };
  return btoa(JSON.stringify(payload));
}
