import { Hono } from "hono";
import { getDb } from "../../db";
import { users, subscriptions, notifications } from "../../db/schema";
import { sql, eq, or, like, desc, and } from "drizzle-orm";
import { getPlansConfig } from "../emagazine/emagazine.router";

export const subscribersRouter = new Hono<{ Bindings: any }>();
export const publicSubscribersRouter = new Hono<{ Bindings: any }>();

// Helper untuk kalkulasi paket langganan (fallback statis)
export function parsePlanDetails(plan: string) {
  switch (plan) {
    case "1_tahun":
    case "12_bulan":
    case "tahunan":
      return { months: 12, amount: 480000, label: "1 Tahun" };
    case "6_bulan":
    case "semester":
      return { months: 6, amount: 255000, label: "6 Bulan" };
    case "3_bulan":
    case "triwulan":
      return { months: 3, amount: 135000, label: "3 Bulan" };
    case "1_bulan":
    case "bulanan":
    case "premium":
    default:
      return { months: 1, amount: 50000, label: "1 Bulan" };
  }
}

// Helper untuk mengambil detail paket dinamis dari database settings
export async function getDynamicPlanDetails(db: any, plan: string) {
  try {
    const config = await getPlansConfig(db);
    if (config && config.plans && Array.isArray(config.plans)) {
      const found = config.plans.find((p: any) => p.id === plan);
      if (found) {
        return {
          months: found.months || 1,
          amount: found.price || 50000,
          label: found.name || "Paket",
        };
      }
    }
  } catch (e) {}
  return parsePlanDetails(plan);
}

// Helper QRIS String Generator Berstandar Nasional (ASPI / BI)
export function generateQrisString(
  amount: number,
  invoiceNumber: string
): string {
  const pad = (num: number, size = 2) => String(num).padStart(size, "0");
  const amountStr = String(amount);
  const tag54 = `54${pad(amountStr.length)}${amountStr}`;
  const tag62Sub01 = `01${pad(invoiceNumber.length)}${invoiceNumber}`;
  const tag62 = `62${pad(tag62Sub01.length)}${tag62Sub01}`;
  return `00020101021226580016ID.CO.SUARA.AISYIYAH0118936009143000000000020300051040000520458125303360${tag54}5802ID5914SUARA AISYIYAH6008JAKARTA610510110${tag62}6304`;
}

// Helper Nomor Virtual Account Bank
export function generateVaNumber(method: string, seedId: number): string {
  const seed =
    String(seedId).padStart(4, "0") + Math.floor(1000 + Math.random() * 9000);
  switch (method) {
    case "va_bsi":
      return `98877${seed}`;
    case "va_bca":
      return `82770${seed}`;
    case "va_mandiri":
      return `88708${seed}`;
    case "va_bni":
      return `98814${seed}`;
    default:
      return `98877${seed}`;
  }
}

// 0. CHECKOUT OTOMATIS (QRIS & VIRTUAL ACCOUNT BANK)
publicSubscribersRouter.post("/checkout", async c => {
  try {
    const authHeader = c.req.header("Authorization");
    const cookieHeader = c.req.header("Cookie") || "";
    const body = await c.req.json().catch(() => null);
    if (!body) return c.json({ error: "Data pembayaran tidak valid" }, 400);

    const db = getDb(c.env.DB);
    let targetUser: any = null;

    // 1. Deteksi sesi pengguna jika sudah login
    let token = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "").trim();
    } else {
      const match = cookieHeader.match(/(?:^|;\s*)labmu_token=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }

    if (token) {
      try {
        const decoded = JSON.parse(atob(token));
        if (decoded && (decoded.id || decoded.username)) {
          targetUser = await db
            .select({
              id: users.id,
              email: users.email,
              name: users.name,
              role: users.role,
            })
            .from(users)
            .where(
              or(
                decoded.id ? eq(users.id, Number(decoded.id)) : sql`0=1`,
                decoded.username
                  ? eq(users.username, String(decoded.username))
                  : sql`0=1`
              )
            )
            .get();
        }
      } catch (e) {}
    }

    // 2. Jika bukan dari token, cek userId dari body
    if (!targetUser && body.userId) {
      targetUser = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, Number(body.userId)))
        .get();
    }

    // 3. Jika pengguna belum login / tamu mendaftar baru
    if (!targetUser) {
      const { username, email, password, name } = body;
      if (email) {
        // Cek apakah email sudah terdaftar
        const existing = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
          })
          .from(users)
          .where(eq(users.email, email))
          .get();

        if (existing) {
          targetUser = existing;
        } else if (username && password) {
          // Buat akun baru otomatis
          await db
            .insert(users)
            .values({
              username,
              email,
              password,
              name: name || username,
              role: "subscriber",
            })
            .run();

          targetUser = await db
            .select({
              id: users.id,
              email: users.email,
              name: users.name,
              role: users.role,
            })
            .from(users)
            .where(eq(users.email, email))
            .get();
        }
      }
    }

    if (!targetUser) {
      return c.json(
        {
          error:
            "Harap masuk ke akun atau isi data pendaftaran dengan lengkap.",
        },
        401
      );
    }

    const planKey = body.plan || "1_bulan";
    const { months, amount, label } = await getDynamicPlanDetails(
      c.env.DB,
      planKey
    );
    const finalAmount = Number(body.amount || amount);

    const paymentMethod = body.paymentMethod || body.payment_method || "qris";
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-SA-${datePart}-${randCode}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Siapkan info payload pembayaran
    const qrisPayload =
      paymentMethod === "qris"
        ? generateQrisString(finalAmount, invoiceNumber)
        : null;
    const seedNumber = Math.floor(100000 + Math.random() * 900000);
    const vaNumber = paymentMethod.startsWith("va_")
      ? generateVaNumber(paymentMethod, seedNumber)
      : null;

    const paymentMeta = {
      invoiceNumber,
      paymentMethod,
      qrisPayload,
      vaNumber,
      expiresAt,
      label,
      plan: planKey,
    };

    const resSub = await db
      .insert(subscriptions)
      .values({
        userId: targetUser.id,
        email: targetUser.email,
        plan: planKey,
        durationMonths: months,
        amount: finalAmount,
        status: "unpaid",
        paymentProof: JSON.stringify(paymentMeta),
        notes: `Tagihan ${invoiceNumber} (${label}) via ${paymentMethod.toUpperCase()}`,
      })
      .run();

    if (!resSub.success)
      return c.json(
        { error: "Gagal membuat tagihan pembayaran langganan" },
        500
      );

    // Ambil ID subscription yang baru saja terbuat
    const latestSub = await db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, targetUser.id),
          eq(subscriptions.status, "unpaid")
        )
      )
      .orderBy(desc(subscriptions.id))
      .limit(1)
      .get();

    const subscriptionId = latestSub ? latestSub.id : 0;

    return c.json({
      success: true,
      subscriptionId,
      invoiceNumber,
      plan: planKey,
      label,
      amount: finalAmount,
      amountFormatted: "Rp " + Number(finalAmount).toLocaleString("id-ID"),
      paymentMethod,
      qrisPayload,
      vaNumber,
      expiresAt,
      status: "unpaid",
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
      },
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// SIMULASI PELUNASAN INSTAN (AUTO-PAY CALLBACK)
publicSubscribersRouter.post("/simulate-pay", async c => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const subId = Number(body.subscriptionId || body.id);
    if (!subId) {
      return c.json({ error: "subscriptionId wajib diisi" }, 400);
    }

    const db = getDb(c.env.DB);
    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subId))
      .get();
    if (!sub) {
      return c.json({ error: "Data langganan/invoice tidak ditemukan" }, 404);
    }

    const months = Number(sub.durationMonths) || 1;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);
    const expiresAtStr = expiryDate.toISOString();

    // 1. Update status subscription -> active
    await db
      .update(subscriptions)
      .set({
        status: "active",
        expiresAt: expiresAtStr,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(subscriptions.id, subId))
      .run();

    // 2. Upgrade user -> subscriber_pro
    if (sub.userId) {
      await db
        .update(users)
        .set({
          role: "subscriber_pro",
          subscriptionPlan: sub.plan,
          subscriptionExpiresAt: expiresAtStr,
        })
        .where(eq(users.id, sub.userId))
        .run();

      // 3. Kirim notifikasi sukses
      try {
        await db
          .insert(notifications)
          .values({
            userId: sub.userId,
            title: "Pembayaran Berlangganan Berhasil (Otomatis)",
            message: `Pembayaran paket ${sub.plan} (Rp ${Number(sub.amount).toLocaleString("id-ID")}) telah lunas secara otomatis. Akun Anda aktif sebagai Subscriber Pro hingga ${new Date(expiresAtStr).toLocaleDateString("id-ID")}.`,
            type: "success",
            link: "subscribers",
            read: 0,
            createdAt: new Date().toISOString(),
          })
          .run();
      } catch (e) {}
    }

    return c.json({
      success: true,
      message: "Pembayaran berhasil dikonfirmasi lunas secara otomatis!",
      subscriptionId: sub.id,
      status: "active",
      plan: sub.plan,
      expiresAt: expiresAtStr,
      expiresAtFormatted: new Date(expiresAtStr).toLocaleDateString("id-ID"),
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// STATUS CHECK ENDPOINT
publicSubscribersRouter.get("/status/:id", async c => {
  try {
    const subId = Number(c.req.param("id"));
    const db = getDb(c.env.DB);
    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subId))
      .get();
    if (!sub) {
      return c.json({ error: "Data tidak ditemukan" }, 404);
    }
    return c.json({
      success: true,
      status: sub.status,
      expiresAt: sub.expiresAt,
      plan: sub.plan,
      amount: sub.amount,
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 1. PUBLIC REGISTRATION (Untuk Tamu Belum Punya Akun)
publicSubscribersRouter.post("/register", async c => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body) return c.json({ error: "Data pendaftaran tidak valid" }, 400);

    const { username, email, password, name, payment_proof, plan } = body;
    if (!username || !email || !password) {
      return c.json(
        { error: "Username, Email, dan Password wajib diisi" },
        400
      );
    }

    const db = getDb(c.env.DB);

    // Cek apakah user sudah ada
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, email)))
      .get();
    if (existing) {
      return c.json(
        {
          error:
            "Username atau Email sudah terdaftar. Silakan login terlebih dahulu.",
        },
        400
      );
    }

    // 1. Buat User sebagai "subscriber" biasa
    const role = "subscriber";
    const resUser = await db
      .insert(users)
      .values({
        username,
        email,
        password,
        name: name || username,
        role,
      })
      .run();

    if (!resUser.success) return c.json({ error: "Gagal membuat user" }, 500);

    // Ambil ID user yang baru dibuat
    const newUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .get();
    if (!newUser) return c.json({ error: "Error mengambil data user" }, 500);

    // 2. Buat entri di tabel subscriptions
    const planKey = plan || "1_bulan";
    const { months, amount, label } = await getDynamicPlanDetails(
      c.env.DB,
      planKey
    );
    const finalAmount = body.amount || amount;

    const resSub = await db
      .insert(subscriptions)
      .values({
        userId: newUser.id,
        email,
        plan: planKey,
        durationMonths: months,
        amount: finalAmount,
        status: "pending",
        paymentProof: payment_proof || "",
        notes: `Langganan paket ${label}`,
      })
      .run();

    if (!resSub.success)
      return c.json({ error: "Gagal mencatat langganan" }, 500);

    // Kirim Notifikasi ke Admin Dashboard & Topbar Bell Icon
    try {
      await db
        .insert(notifications)
        .values({
          userId: newUser.id,
          title: "Pendaftar Pelanggan Pro Baru",
          message: `${name || username} (${email}) mendaftar paket ${label} (Rp ${Number(finalAmount).toLocaleString("id-ID")}). Mohon cek bukti transfer & verifikasi.`,
          type: "warning",
          link: "subscribers",
          read: 0,
          createdAt: new Date().toISOString(),
        })
        .run();
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr);
    }

    return c.json({
      success: true,
      message:
        "Pendaftaran berhasil. Silakan tunggu persetujuan admin untuk aktivasi Subscriber Pro.",
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 2. ADMIN LIST SUBSCRIBERS
subscribersRouter.get("/", async c => {
  try {
    const db = getDb(c.env.DB);
    const page = parseInt(c.req.query("page") || "1");
    const search = c.req.query("search") || "";
    const limit = 50;
    const offset = (page - 1) * limit;

    let query = db
      .select({
        sub_id: subscriptions.id,
        plan: subscriptions.plan,
        duration_months: subscriptions.durationMonths,
        amount: subscriptions.amount,
        status: subscriptions.status,
        payment_proof: subscriptions.paymentProof,
        expires_at: subscriptions.expiresAt,
        notes: subscriptions.notes,
        created_at: subscriptions.createdAt,
        user_id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        role: users.role,
        user_expires_at: users.subscriptionExpiresAt,
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.userId, users.id))
      .$dynamic();

    if (search) {
      query = query.where(
        or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.name, `%${search}%`)
        )
      );
    }

    const results = await query
      .orderBy(desc(subscriptions.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    // Pastikan seluruh user dengan role subscriber_pro / premium masuk list meski dibuat manual
    const existingUserIds = new Set(results.map(r => r.user_id));
    const proUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        role: users.role,
        subscriptionPlan: users.subscriptionPlan,
        subscriptionExpiresAt: users.subscriptionExpiresAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(
        or(
          eq(users.role, "subscriber_pro"),
          eq(users.role, "pro"),
          eq(users.role, "premium")
        )
      )
      .all();

    for (const pu of proUsers) {
      if (!existingUserIds.has(pu.id)) {
        results.push({
          sub_id: 0,
          plan: pu.subscriptionPlan || "1_tahun",
          duration_months: 12,
          amount: 480000,
          status: "approved",
          payment_proof: "",
          expires_at: pu.subscriptionExpiresAt || "",
          notes: "Ditetapkan dari Manajemen User",
          created_at: pu.createdAt || "",
          user_id: pu.id,
          username: pu.username,
          email: pu.email,
          name: pu.name,
          role: pu.role,
          user_expires_at: pu.subscriptionExpiresAt,
        });
        existingUserIds.add(pu.id);
      }
    }

    // Get counts for dashboard stats
    const pendingCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, "pending"))
      .get();

    return c.json({
      success: true,
      data: results,
      pending: pendingCount?.count || 0,
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 3. ADMIN APPROVE SUBSCRIBER (Set role jadi subscriber_pro & set kuota masa aktif)
subscribersRouter.put("/:id/approve", async c => {
  try {
    const id = parseInt(c.req.param("id"), 10);
    const db = getDb(c.env.DB);

    // Cek langganan
    const sub = await db
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        plan: subscriptions.plan,
        durationMonths: subscriptions.durationMonths,
      })
      .from(subscriptions)
      .where(eq(subscriptions.id, id))
      .get();

    if (!sub || !sub.userId)
      return c.json({ error: "Data langganan tidak ditemukan" }, 404);

    const planKey = sub.plan || "1_bulan";
    const duration = sub.durationMonths || parsePlanDetails(planKey).months;

    // Hitung masa aktif kuota: hari ini + duration bulan
    const now = new Date();
    now.setMonth(now.getMonth() + duration);
    const expiresAt = now.toISOString();

    // Ubah status langganan jadi approved
    await db
      .update(subscriptions)
      .set({
        status: "approved",
        expiresAt,
        durationMonths: duration,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(subscriptions.id, id))
      .run();

    // Ubah role user jadi subscriber_pro dan set masa aktif kuota
    await db
      .update(users)
      .set({
        role: "subscriber_pro",
        subscriptionPlan: planKey,
        subscriptionExpiresAt: expiresAt,
      })
      .where(eq(users.id, sub.userId))
      .run();

    return c.json({
      success: true,
      message: `Pelanggan berhasil disetujui sebagai Subscriber Pro! Masa aktif kuota berlaku s.d. ${now.toLocaleDateString("id-ID")}.`,
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 4. ADMIN REJECT SUBSCRIBER
subscribersRouter.put("/:id/reject", async c => {
  try {
    const id = parseInt(c.req.param("id"), 10);
    const db = getDb(c.env.DB);

    const sub = await db
      .select({ userId: subscriptions.userId })
      .from(subscriptions)
      .where(eq(subscriptions.id, id))
      .get();
    if (!sub || !sub.userId)
      return c.json({ error: "Data langganan tidak ditemukan" }, 404);

    // Ubah status jadi rejected
    await db
      .update(subscriptions)
      .set({ status: "rejected", updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(subscriptions.id, id))
      .run();

    // Kembalikan role user jadi subscriber biasa jika sebelumnya subscriber_pro
    await db
      .update(users)
      .set({
        role: "subscriber",
        subscriptionPlan: null,
        subscriptionExpiresAt: null,
      })
      .where(and(eq(users.id, sub.userId), eq(users.role, "subscriber_pro")))
      .run();

    return c.json({ success: true, message: "Langganan ditolak." });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 5. ADMIN DELETE SUBSCRIBER
subscribersRouter.delete("/:id", async c => {
  try {
    const id = parseInt(c.req.param("id"), 10);
    const db = getDb(c.env.DB);
    await db.delete(subscriptions).where(eq(subscriptions.id, id)).run();
    return c.json({
      success: true,
      message: "Data riwayat langganan dihapus.",
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});
