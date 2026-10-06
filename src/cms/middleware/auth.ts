import type { Context, Next } from "hono";

// HAPUS import { verify } ... -> Gak butuh lagi!

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  let token = authHeader ? authHeader.replace("Bearer ", "").trim() : "";

  if (!token) {
    // Fallback: baca dari Cookie header
    const cookieHeader = c.req.header("Cookie") || "";
    const parts = cookieHeader.split(";");
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i].trim();
      if (p.indexOf("labmu_token=") === 0) {
        token = decodeURIComponent(p.substring(12));
        break;
      }
    }
  }

  if (!token) {
    return c.json({ error: "Butuh Login (Header & Cookie Kosong)" }, 401);
  }

  try {
    // 1. Decode Base64 (Mendukung Base64 JSON mentah dan format JWT modern)
    let base64 = token;
    if (token.includes(".")) {
      base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4 !== 0) {
        base64 += "=";
      }
    }
    const decodedString = atob(base64);

    // 2. Parse JSON
    const userData = JSON.parse(decodedString);

    // 3. Validasi minimal: pastikan object tidak kosong
    if (!userData || typeof userData !== "object") {
      throw new Error("Invalid Payload");
    }

    // Set context user agar bisa dipakai di router lain
    c.set("user", userData);

    await next();
  } catch (e) {
    // Jika token bukan Base64 atau bukan JSON valid
    console.error("Auth Error:", e);
    return c.json({ error: "Token Tidak Valid / Kadaluwarsa" }, 401);
  }
};
