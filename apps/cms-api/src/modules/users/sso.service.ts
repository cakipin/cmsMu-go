import { eq, or, inArray } from "drizzle-orm";
import {
  users as usersTable,
  settings as settingsTable,
} from "@cmsmu/db";
import { generateUserToken, getJwtSecret } from "./auth.helper";

export async function processSsoLogin(
  c: any,
  db: any,
  body: { code: string; redirectUri: string }
): Promise<any> {
  const { code, redirectUri } = body;

  // 1. Ambil konfigurasi dari table settings di DB (opsional)
  let dbSettings: any = {};
  try {
    const results = await db
      .select({ key: settingsTable.key, value: settingsTable.value })
      .from(settingsTable)
      .where(
        inArray(settingsTable.key, [
          "sso_enabled",
          "sso_client_id",
          "sso_client_secret",
        ])
      );
    if (results) {
      results.forEach((row: any) => {
        dbSettings[row.key] = row.value;
      });
    }
  } catch (e) {}

  if (dbSettings.sso_enabled === "false") {
    return {
      error: "SSO sedang dinonaktifkan oleh Administrator.",
      status: 403,
    };
  }

  // Ambil secrets dari env (sebagai fallback utama) atau dari DB
  const CLIENT_ID = (
    dbSettings.sso_client_id ||
    c.env.SSO_CLIENT_ID ||
    (c.env as any).CLIENT_ID ||
    ""
  ).trim();
  const CLIENT_SECRET = (
    dbSettings.sso_client_secret ||
    c.env.SSO_CLIENT_SECRET ||
    (c.env as any).CLIENT_SECRET ||
    ""
  ).trim();

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return {
      error: "Konfigurasi SSO (Client ID/Secret) belum disetel di server.",
      status: 500,
    };
  }

  // Auto-detect provider berdasarkan format Client ID atau hint
  const isDiasMu =
    CLIENT_ID.startsWith("client_") || CLIENT_ID.toLowerCase().includes("dias");

  // Endpoint konfigurasi provider
  const primaryProvider = isDiasMu
    ? {
        name: "DiasMu (dias.muhammadiyah.or.id)",
        tokenUrls: [
          "https://diasmu.labmu.workers.dev/oauth/token",
          "https://dias.muhammadiyah.or.id/oauth/token",
        ],
        userInfoUrls: [
          "https://diasmu.labmu.workers.dev/oauth/userinfo",
          "https://dias.muhammadiyah.or.id/oauth/userinfo",
        ],
      }
    : {
        name: "Muhammadiyah ID Pusat (sso.muhammadiyah.id)",
        tokenUrls: ["https://sso.muhammadiyah.id/oauth/token"],
        userInfoUrls: [
          "https://sso.muhammadiyah.id/api/user",
          "https://sso.muhammadiyah.id/oauth/userinfo",
        ],
      };

  const fallbackProvider = isDiasMu
    ? {
        name: "Muhammadiyah ID Pusat (sso.muhammadiyah.id)",
        tokenUrls: ["https://sso.muhammadiyah.id/oauth/token"],
        userInfoUrls: [
          "https://sso.muhammadiyah.id/api/user",
          "https://sso.muhammadiyah.id/oauth/userinfo",
        ],
      }
    : {
        name: "DiasMu (dias.muhammadiyah.or.id)",
        tokenUrls: [
          "https://diasmu.labmu.workers.dev/oauth/token",
          "https://dias.muhammadiyah.or.id/oauth/token",
        ],
        userInfoUrls: [
          "https://diasmu.labmu.workers.dev/oauth/userinfo",
          "https://dias.muhammadiyah.or.id/oauth/userinfo",
        ],
      };

  // Helper untuk menukar authorization_code ke access_token
  async function exchangeToken(provider: typeof primaryProvider) {
    for (const tokenUrl of provider.tokenUrls) {
      try {
        let resp = await fetch(tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            grant_type: "authorization_code",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: redirectUri,
            code: code,
          }),
        });

        if (!resp.ok && (resp.status === 415 || resp.status === 400)) {
          resp = await fetch(tokenUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET,
              redirect_uri: redirectUri,
              code: code,
            }).toString(),
          });
        }

        if (resp.ok) {
          const data: any = await resp.json();
          if (data && data.access_token) {
            return { success: true, tokenData: data, activeProvider: provider };
          }
        }
      } catch (e) {}
    }
    return { success: false, tokenData: null, activeProvider: provider };
  }

  // Jalankan token exchange dengan auto-switch & fallback
  let tokenResult = await exchangeToken(primaryProvider);
  if (!tokenResult.success) {
    tokenResult = await exchangeToken(fallbackProvider);
  }

  if (!tokenResult.success || !tokenResult.tokenData?.access_token) {
    return {
      error:
        "Gagal mendapatkan token dari sistem SSO Muhammadiyah. Pastikan Client ID dan Secret valid.",
      status: 401,
    };
  }

  const accessToken = tokenResult.tokenData.access_token;
  const activeProvider = tokenResult.activeProvider;

  // 2. Ambil Info Pengguna dari UserInfo endpoint
  let userData: any = null;
  for (const userInfoUrl of activeProvider.userInfoUrls) {
    try {
      const userResp = await fetch(userInfoUrl, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + accessToken,
          Accept: "application/json",
        },
      });
      if (userResp.ok) {
        userData = await userResp.json();
        break;
      }
    } catch (e) {}
  }

  if (!userData) {
    return {
      error: "Gagal mendapatkan profil pengguna dari " + activeProvider.name,
      status: 500,
    };
  }

  // Normalisasi payload pengguna
  const profile = userData.data || userData;
  const email = profile.email || "";
  const name =
    profile.name || profile.nama || profile.username || "Pengguna Muhammadiyah";
  const username = email || name.toLowerCase().replace(/\s+/g, ".");
  const ssoAvatar =
    profile.avatar ||
    profile.picture ||
    profile.photo_url ||
    profile.photo ||
    profile.foto ||
    "";

  let user: any = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      name: usersTable.name,
      role: usersTable.role,
      avatar: usersTable.avatar,
    })
    .from(usersTable)
    .where(or(eq(usersTable.email, email), eq(usersTable.username, username)))
    .get();

  // 3. Auto-Register Jika User Belum Ada
  if (!user) {
    const defaultRole = "subscriber";
    const fullName = name || profile.name || profile.nama || username;
    const randomPassword = "SSO_" + crypto.randomUUID();

    const res = await db
      .insert(usersTable)
      .values({
        username,
        password: randomPassword,
        email,
        role: defaultRole,
        name: fullName,
        avatar: ssoAvatar,
        createdAt: new Date().toISOString(),
      })
      .run();

    if (!res.success) {
      return { error: "Gagal melakukan auto-registrasi SSO", status: 500 };
    }

    user = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        name: usersTable.name,
        role: usersTable.role,
        avatar: usersTable.avatar,
      })
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .get();
  } else if (ssoAvatar && !user.avatar) {
    try {
      await db
        .update(usersTable)
        .set({ avatar: ssoAvatar })
        .where(eq(usersTable.id, user.id))
        .run();
      user.avatar = ssoAvatar;
    } catch (err) {}
  }

  // 4. Generate Token
  const userRole = user.role || "subscriber";
  const finalAvatar = user.avatar || ssoAvatar || "";
  const token = await generateUserToken(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      role: userRole,
      avatar: finalAvatar,
    },
    getJwtSecret(c.env)
  );

  return {
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: userRole,
      avatar: finalAvatar,
    },
  };
}
