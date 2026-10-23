import { Hono } from "hono";
import { getDb, userProjects, instanceActivityLogs, users } from "@cmsmu/db";
import { desc, eq } from "drizzle-orm";
import type { Bindings } from "../../types";
import { CloudflareProvisioner } from "./cloudflare-provisioner";
import { generateInitialSchemaSql, hashSha256 } from "./initial-schema.sql";
import { verifyUserToken, getJwtSecret } from "../../modules/users/auth.helper";

export const deployerRouter = new Hono<{ Bindings: Bindings }>();

/**
 * 🔒 Helper untuk mengekstrak identitas pengguna dari Bearer Authorization atau Cookie labmu_token
 */
async function getAuthUser(c: any): Promise<{ id: number; username: string; role: string } | null> {
  let token = "";
  const authHeader = c.req.header("Authorization");
  if (authHeader) {
    token = authHeader.replace(/^Bearer\s+/i, "").trim();
  }
  if (!token) {
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
  if (!token) return null;

  try {
    const secret = getJwtSecret(c.env);
    const payload = await verifyUserToken(token, secret);
    if (!payload || !payload.id) return null;
    return {
      id: Number(payload.id),
      username: String(payload.username || ""),
      role: String(payload.role || "subscriber").toLowerCase(),
    };
  } catch (err) {
    return null;
  }
}

/**
 * 🔑 Verifikasi Cloudflare API Token & Account ID Pengguna
 * POST /api/deployer/verify-cf-token
 */
deployerRouter.post("/verify-cf-token", async (c) => {
  try {
    const body = (await c.req.json().catch(() => ({}))) as any;
    const { accountId, apiToken } = body;

    if (!accountId || !apiToken) {
      return c.json({ error: "accountId dan apiToken wajib diisi" }, 400);
    }

    // 1. Verifikasi validity token via Cloudflare v4 REST API
    const verifyRes = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: "application/json",
      },
    });

    const verifyData = (await verifyRes.json()) as any;
    if (!verifyRes.ok || !verifyData.success) {
      return c.json(
        {
          success: false,
          error: "Cloudflare API Token tidak valid atau telah kedaluwarsa",
          details: verifyData.errors || [],
        },
        400
      );
    }

    // 2. Verifikasi akses ke Account ID pengguna
    const accountRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          Accept: "application/json",
        },
      }
    );

    const accountData = (await accountRes.json()) as any;
    if (!accountRes.ok || !accountData.success) {
      return c.json(
        {
          success: false,
          error: "Account ID tidak ditemukan atau API Token tidak memiliki izin membaca akun tersebut",
          details: accountData.errors || [],
        },
        400
      );
    }

    const accountName = accountData.result?.name || "Cloudflare Account";

    return c.json({
      success: true,
      valid: true,
      accountName,
      status: verifyData.result?.status || "active",
      message: `Berhasil terhubung ke akun Cloudflare: ${accountName}`,
    });
  } catch (err: any) {
    console.error("[Verify CF Token Error]:", err);
    return c.json({ error: err.message || "Internal server error" }, 500);
  }
});

/**
 * 💾 Ambil Kredensial Cloudflare (Account ID & Token) Terakhir yang Tersimpan di Database
 * GET /api/deployer/saved-credentials
 */
deployerRouter.get("/saved-credentials", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ success: true, data: null });
    }

    const db = getDb(c.env.DB);
    const isSuperAdmin = authUser.role === "superadmin";
    const isAdmin = authUser.role === "admin" || isSuperAdmin;

    const lastProject = isAdmin
      ? await db
          .select({
            cfAccountId: userProjects.cfAccountId,
            cfApiToken: userProjects.cfApiToken,
          })
          .from(userProjects)
          .orderBy(desc(userProjects.id))
          .limit(1)
          .get()
      : await db
          .select({
            cfAccountId: userProjects.cfAccountId,
            cfApiToken: userProjects.cfApiToken,
          })
          .from(userProjects)
          .where(eq(userProjects.userId, authUser.id))
          .orderBy(desc(userProjects.id))
          .limit(1)
          .get();

    if (lastProject && lastProject.cfAccountId) {
      return c.json({
        success: true,
        data: {
          accountId: lastProject.cfAccountId,
          apiToken: lastProject.cfApiToken || "",
        },
      });
    }

    return c.json({ success: true, data: null });
  } catch (err: any) {
    console.error("[Get Saved Credentials Error]:", err);
    return c.json({ success: false, data: null });
  }
});

/**
 * 🚀 1-Click Provisioning & Deploy Proyek Baru ke Akun Cloudflare Pengguna
 * POST /api/deployer/provision
 */
deployerRouter.post("/provision", async (c) => {
  let currentStepIndex = 0;
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Autentikasi diperlukan. Silakan login terlebih dahulu." }, 401);
    }

    const body = (await c.req.json().catch(() => ({}))) as any;
    const rawSlug = body.slug || body.projectSlug || "";
    const slug = typeof rawSlug === "string" ? rawSlug.trim() : "";
    const {
      projectName,
      accountId,
      apiToken,
      adminEmail,
      adminPassword,
      customDomain,
    } = body;

    // 1. Validasi Input
    if (!projectName || !slug || !accountId || !apiToken || !adminEmail || !adminPassword) {
      return c.json(
        {
          error: "Semua data wajib diisi (projectName, slug, accountId, apiToken, adminEmail, adminPassword)",
        },
        400
      );
    }

    if (adminPassword.length < 6) {
      return c.json({ error: "Password admin minimal 6 karakter" }, 400);
    }

    const cleanSlug = String(slug).toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
    if (!cleanSlug || cleanSlug.length < 3) {
      return c.json({ error: "Slug proyek minimal 3 karakter (hanya huruf, angka, strip)" }, 400);
    }

    const db = getDb(c.env.DB);

    // 1b. Cek Identitas & Kuota Paket Pengguna (Free/Demo Maksimal 1 Proyek)
    const userRecord = await db
      .select({
        id: users.id,
        role: users.role,
        subscriptionPlan: users.subscriptionPlan,
      })
      .from(users)
      .where(eq(users.id, authUser.id))
      .get();

    const currentRole = String(userRecord?.role || authUser.role || "subscriber").toLowerCase();
    const userPlan = String(userRecord?.subscriptionPlan || "free").toLowerCase().trim();
    const isSuperAdmin = currentRole === "superadmin";
    const isFreeOrDemo = !isSuperAdmin && (!userPlan || userPlan === "free" || userPlan === "demo" || userPlan === "null" || userPlan === "undefined");

    if (isFreeOrDemo) {
      const existingUserProjects = await db
        .select({ id: userProjects.id, status: userProjects.status })
        .from(userProjects)
        .where(eq(userProjects.userId, authUser.id))
        .all();

      const activeUserProjectsCount = existingUserProjects.length;
      if (activeUserProjectsCount >= 1) {
        return c.json(
          {
            success: false,
            quotaExceeded: true,
            error: "Batas kuota tercapai: Akun paket Free/Demo dibatasi maksimal 1 website Cloudflare BYOC. Hapus proyek yang ada atau hubungi admin untuk upgrade akun.",
            currentUsage: activeUserProjectsCount,
            maxLimit: 1,
          },
          403
        );
      }
    }

    // 2. Cek apakah slug sudah terdaftar di Control Plane
    const existing = await db
      .select({ id: userProjects.id })
      .from(userProjects)
      .where(eq(userProjects.slug, cleanSlug))
      .get();

    if (existing) {
      return c.json({ error: `Slug proyek '${cleanSlug}' sudah digunakan. Silakan pilih slug lain.` }, 400);
    }

    // 3. Persiapkan Naming Convention Standar (R2 WAJIB HYPHEN, TIDAK BOLEH UNDERSCORE!)
    const d1Name = `${cleanSlug}_db`;
    const r2Name = `${cleanSlug}-media`;
    const kvCacheName = `${cleanSlug}_cache`;
    const kvSessionName = `${cleanSlug}_session`;
    const pagesProjectName = cleanSlug;
    const telemetryApiKey = crypto.randomUUID();
    const now = new Date().toISOString();

    console.log(`[Provisioning Started] Project: ${projectName} (${cleanSlug})`);

    // 4. Buat Database D1 (${cleanSlug}_db)
    currentStepIndex = 0;
    console.log(`[1/5] Creating D1: ${d1Name}...`);
    const d1Result = await CloudflareProvisioner.createD1Database(accountId, apiToken, d1Name);

    // 5. Buat Storage Bucket R2 (${cleanSlug}-media)
    currentStepIndex = 1;
    console.log(`[2/5] Creating R2: ${r2Name}...`);
    const r2Result = await CloudflareProvisioner.createR2Bucket(accountId, apiToken, r2Name);

    // 6. Buat KV Cache & Session (${cleanSlug}_cache & ${cleanSlug}_session)
    currentStepIndex = 2;
    console.log(`[3/5] Creating KV Cache & Session...`);
    const kvCache = await CloudflareProvisioner.createKvNamespace(accountId, apiToken, kvCacheName);
    const kvSession = await CloudflareProvisioner.createKvNamespace(accountId, apiToken, kvSessionName);

    // 7. Eksekusi Skema Migrasi SQL & Seed Admin ke D1 Pengguna
    currentStepIndex = 3;
    console.log(`[4/5] Executing SQL Migration to D1 (${d1Result.id})...`);
    const adminPasswordHash = await hashSha256(adminPassword);
    const initialSqls = generateInitialSchemaSql({
      adminEmail,
      adminPasswordHash,
      projectName,
      siteSlug: cleanSlug,
    });
    await CloudflareProvisioner.executeD1Sql(accountId, apiToken, d1Result.id, initialSqls);

    // 8. Buat / Update Project Cloudflare Pages dengan Bindings Terpasang
    currentStepIndex = 4;
    console.log(`[5/5] Creating Cloudflare Pages Project & Bindings...`);
    const controlPlaneUrl = new URL(c.req.url).origin;
    const telemetryEndpoint = `${controlPlaneUrl}/api/telemetry`;

    const pagesResult = await CloudflareProvisioner.createOrUpdatePagesProject(
      accountId,
      apiToken,
      {
        projectName: pagesProjectName,
        slug: cleanSlug,
        d1DatabaseId: d1Result.id,
        r2BucketName: r2Result.name,
        kvCacheId: kvCache.id,
        kvSessionId: kvSession.id,
        telemetryEndpoint,
        telemetryApiKey,
      }
    );

    // 8b. Memicu Build & Deployment Awal dari cakipin/cmsMu-go
    try {
      console.log(`[5b/5] Triggering Initial Build from cakipin/cmsMu-go...`);
      await CloudflareProvisioner.triggerPagesDeployment(accountId, apiToken, pagesProjectName);
    } catch (deployErr: any) {
      console.warn(`[Trigger Initial Deployment Warning]:`, deployErr.message);
    }

    // 9. Simpan Record ke Database Control Plane cms.labmu.dev
    currentStepIndex = 5;
    const insertResult = await db
      .insert(userProjects)
      .values({
        userId: authUser.id,
        name: projectName,
        slug: cleanSlug,
        cfAccountId: accountId,
        cfApiToken: apiToken,
        cfProjectName: pagesProjectName,
        d1DatabaseId: d1Result.id,
        r2BucketName: r2Result.name,
        kvCacheId: kvCache.id,
        kvSessionId: kvSession.id,
        productionUrl: pagesResult.productionUrl,
        customDomain: customDomain || null,
        telemetryApiKey,
        status: "active",
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: userProjects.id });

    const newProjectId = insertResult[0]?.id || 0;

    // 10. Catat Log Aktivitas Awal (Audit Trail)
    await db.insert(instanceActivityLogs).values({
      projectId: newProjectId,
      eventCategory: "SYSTEM",
      action: "PROVISION_SUCCESS",
      severity: "INFO",
      actorEmail: adminEmail || authUser.username,
      ipAddress: c.req.header("CF-Connecting-IP") || "127.0.0.1",
      description: `Proyek '${projectName}' (${cleanSlug}) berhasil dideploy ke Cloudflare Pages dengan D1 (${d1Name}), R2 (${r2Name}), dan KV Cache (${kvCacheName}) oleh pengguna #${authUser.id}.`,
      createdAt: now,
    });

    console.log(`[Provisioning Finished] Project ID: ${newProjectId} at ${pagesResult.productionUrl}`);

    return c.json({
      success: true,
      message: `Proyek '${projectName}' berhasil dideploy ke akun Cloudflare Anda!`,
      data: {
        projectId: newProjectId,
        name: projectName,
        slug: cleanSlug,
        productionUrl: pagesResult.productionUrl,
        adminLoginUrl: `${pagesResult.productionUrl}/admin`,
        adminEmail,
        resources: {
          d1DatabaseName: d1Name,
          d1DatabaseId: d1Result.id,
          r2BucketName: r2Name,
          kvCacheName: kvCacheName,
          kvCacheId: kvCache.id,
          kvSessionName: kvSessionName,
          kvSessionId: kvSession.id,
        },
        telemetryApiKey,
      },
    });
  } catch (err: any) {
    console.error("[Provision Project Error]:", err);
    return c.json({
      error: err.message || "Gagal melakukan provisioning ke Cloudflare",
      failedStepIndex: currentStepIndex,
    }, 500);
  }
});

/**
 * 📋 Daftar Proyek Terdaftar & Status Kuota Pengguna
 * GET /api/deployer/projects
 */
deployerRouter.get("/projects", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Autentikasi diperlukan. Silakan login terlebih dahulu." }, 401);
    }

    const db = getDb(c.env.DB);

    const userRecord = await db
      .select({
        id: users.id,
        role: users.role,
        subscriptionPlan: users.subscriptionPlan,
      })
      .from(users)
      .where(eq(users.id, authUser.id))
      .get();

    const currentRole = String(userRecord?.role || authUser.role || "subscriber").toLowerCase();
    const userPlan = String(userRecord?.subscriptionPlan || "free").toLowerCase().trim();
    const isSuperAdmin = currentRole === "superadmin";
    const isAdmin = currentRole === "admin" || isSuperAdmin;
    const isFreeOrDemo = !isSuperAdmin && (!userPlan || userPlan === "free" || userPlan === "demo" || userPlan === "null" || userPlan === "undefined");

    const query = db
      .select({
        id: userProjects.id,
        userId: userProjects.userId,
        name: userProjects.name,
        slug: userProjects.slug,
        cfAccountId: userProjects.cfAccountId,
        cfProjectName: userProjects.cfProjectName,
        d1DatabaseId: userProjects.d1DatabaseId,
        r2BucketName: userProjects.r2BucketName,
        kvCacheId: userProjects.kvCacheId,
        kvSessionId: userProjects.kvSessionId,
        productionUrl: userProjects.productionUrl,
        customDomain: userProjects.customDomain,
        status: userProjects.status,
        lastHeartbeatAt: userProjects.lastHeartbeatAt,
        createdAt: userProjects.createdAt,
        updatedAt: userProjects.updatedAt,
      })
      .from(userProjects);

    const list = isAdmin
      ? await query.orderBy(desc(userProjects.id)).limit(100).all()
      : await query.where(eq(userProjects.userId, authUser.id)).orderBy(desc(userProjects.id)).limit(100).all();

    const userProjectsCount = isAdmin
      ? list.filter((p: any) => p.userId === authUser.id).length
      : list.length;

    return c.json({
      success: true,
      data: list,
      quota: {
        role: currentRole,
        plan: isFreeOrDemo ? "free" : (userPlan || "pro"),
        planLabel: isFreeOrDemo ? "Free / Demo" : (userPlan.toUpperCase() || "PRO"),
        used: userProjectsCount,
        limit: isFreeOrDemo ? 1 : null,
        isLimitReached: isFreeOrDemo && userProjectsCount >= 1,
      },
    });
  } catch (err: any) {
    console.error("[Get Deployer Projects Error]:", err);
    return c.json({ error: err.message || "Internal server error" }, 500);
  }
});

/**
 * ✏️ Edit / Update Data Proyek
 * PUT /api/deployer/projects/:id
 */
deployerRouter.put("/projects/:id", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Autentikasi diperlukan." }, 401);
    }
    const isSuperAdmin = authUser.role === "superadmin";
    const isAdmin = authUser.role === "admin" || isSuperAdmin;

    const id = parseInt(c.req.param("id"), 10);
    if (isNaN(id)) {
      return c.json({ error: "ID proyek tidak valid" }, 400);
    }

    const body = (await c.req.json().catch(() => ({}))) as any;
    const { name, customDomain, status, cfAccountId, cfApiToken } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return c.json({ error: "Nama proyek wajib diisi" }, 400);
    }

    const db = getDb(c.env.DB);
    const existing = await db
      .select()
      .from(userProjects)
      .where(eq(userProjects.id, id))
      .get();

    if (!existing) {
      return c.json({ error: "Proyek tidak ditemukan" }, 404);
    }

    // Hanya pemilik proyek atau admin yang boleh mengedit
    if (!isAdmin && existing.userId !== authUser.id) {
      return c.json({ error: "Akses ditolak: Anda bukan pemilik proyek ini." }, 403);
    }

    const validStatuses = ["provisioning", "active", "suspended", "error"] as const;
    const safeStatus = validStatuses.includes(status) ? status : existing.status;

    const updatePayload: Record<string, any> = {
      name: name.trim(),
      customDomain: customDomain && typeof customDomain === "string" ? customDomain.trim() || null : null,
      status: safeStatus,
      updatedAt: new Date().toISOString(),
    };

    if (cfAccountId && typeof cfAccountId === "string" && cfAccountId.trim()) {
      updatePayload.cfAccountId = cfAccountId.trim();
    }
    if (cfApiToken && typeof cfApiToken === "string" && cfApiToken.trim()) {
      updatePayload.cfApiToken = cfApiToken.trim();
    }

    await db
      .update(userProjects)
      .set(updatePayload)
      .where(eq(userProjects.id, id));

    return c.json({
      success: true,
      message: `Proyek '${name.trim()}' berhasil diperbarui`,
    });
  } catch (err: any) {
    console.error("[Update Project Error]:", err);
    return c.json({ error: err.message || "Gagal memperbarui proyek" }, 500);
  }
});

/**
 * 🗑️ Hapus Proyek & Opsional Pembersihan Resource Cloudflare
 * DELETE /api/deployer/projects/:id
 */
deployerRouter.delete("/projects/:id", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Autentikasi diperlukan." }, 401);
    }
    const isSuperAdmin = authUser.role === "superadmin";
    const isAdmin = authUser.role === "admin" || isSuperAdmin;

    const id = parseInt(c.req.param("id"), 10);
    if (isNaN(id)) {
      return c.json({ error: "ID proyek tidak valid" }, 400);
    }

    const deleteCloudflare = c.req.query("deleteCloudflare") === "true";
    const db = getDb(c.env.DB);

    const existing = await db
      .select()
      .from(userProjects)
      .where(eq(userProjects.id, id))
      .get();

    if (!existing) {
      return c.json({ error: "Proyek tidak ditemukan" }, 404);
    }

    // Hanya pemilik proyek atau admin yang boleh menghapus
    if (!isAdmin && existing.userId !== authUser.id) {
      return c.json({ error: "Akses ditolak: Anda bukan pemilik proyek ini." }, 403);
    }

    // Jika diminta hapus resource remote di Cloudflare pengguna
    if (deleteCloudflare && existing.cfAccountId && existing.cfApiToken) {
      await CloudflareProvisioner.deleteRemoteResources(
        existing.cfAccountId,
        existing.cfApiToken,
        {
          projectName: existing.cfProjectName,
          d1DatabaseId: existing.d1DatabaseId,
          r2BucketName: existing.r2BucketName,
          kvCacheId: existing.kvCacheId,
          kvSessionId: existing.kvSessionId,
        }
      );
    }

    // Hapus log aktivitas dan record proyek dari D1 Control Plane
    await db
      .delete(instanceActivityLogs)
      .where(eq(instanceActivityLogs.projectId, id));

    await db
      .delete(userProjects)
      .where(eq(userProjects.id, id));

    return c.json({
      success: true,
      message: deleteCloudflare
        ? `Proyek '${existing.name}' beserta resource di Cloudflare berhasil dihapus`
        : `Proyek '${existing.name}' berhasil dihapus dari daftar Control Plane`,
    });
  } catch (err: any) {
    console.error("[Delete Project Error]:", err);
    return c.json({ error: err.message || "Gagal menghapus proyek" }, 500);
  }
});
