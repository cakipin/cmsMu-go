import { Hono } from "hono";
import { getDb, settings as settingsTable, users as usersTable, posts as postsTable } from "@cmsmu/db";
import { eq, or, sql } from "drizzle-orm";
import { adminOnlyMiddleware } from "../../middleware/auth";
import { nusaHooks } from "../../core/hooks";

type Bindings = {
  DB: D1Database;
  WEBHOOK_SECRET?: string;
};

export interface WebhookEndpointConfig {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: string[]; // e.g., ["*"] or ["post.published", "user.registered", "user.role_updated"]
  active: boolean;
  createdAt?: string;
}

export const webhooksRouter = new Hono<{ Bindings: Bindings }>();

/**
 * Compute HMAC-SHA256 hex signature using Web Crypto API (Cloudflare Workers compatible)
 */
export async function computeHmacSha256(
  secret: string,
  payloadString: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret || "cmsmu-default-webhook-secret");
  const msgData = encoder.encode(payloadString);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  return Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Helper: Load registered outgoing webhook endpoints from `settings` (`webhooks_config`)
 */
export async function getWebhooksConfig(db: any): Promise<{
  incomingSecret: string;
  endpoints: WebhookEndpointConfig[];
}> {
  let incomingSecret = "";
  let endpoints: WebhookEndpointConfig[] = [];

  try {
    const rows = await db
      .select()
      .from(settingsTable)
      .where(
        or(
          eq(settingsTable.key, "webhooks_config"),
          eq(settingsTable.key, "webhook_incoming_secret")
        )
      );

    for (const r of rows) {
      if (r.key === "webhook_incoming_secret" && r.value) {
        incomingSecret = String(r.value);
      }
      if (r.key === "webhooks_config" && r.value) {
        const parsed = JSON.parse(String(r.value));
        if (Array.isArray(parsed)) endpoints = parsed;
      }
    }
  } catch (e) {
    console.warn("[Webhooks Config Load Warning]:", e);
  }

  return { incomingSecret, endpoints };
}

/**
 * Outgoing Universal Webhook Dispatcher
 * Dispatches event payload with X-CMSMu-Signature (HMAC-SHA256) to all matching active endpoints.
 */
export async function dispatchOutgoingWebhook(
  env: Bindings,
  event: string,
  data: any
): Promise<{ totalMatched: number; delivered: number; results: any[] }> {
  if (!env?.DB) return { totalMatched: 0, delivered: 0, results: [] };
  const db = getDb(env.DB);
  const { endpoints } = await getWebhooksConfig(db);

  const activeMatching = endpoints.filter(ep => {
    if (!ep || !ep.active || !ep.url) return false;
    const evList = Array.isArray(ep.events) ? ep.events : ["*"];
    return (
      evList.includes("*") ||
      evList.includes(event) ||
      evList.some(
        pattern =>
          pattern.endsWith(".*") &&
          event.startsWith(pattern.slice(0, -1))
      )
    );
  });

  if (activeMatching.length === 0) {
    return { totalMatched: 0, delivered: 0, results: [] };
  }

  const timestamp = new Date().toISOString();
  const bodyPayload = JSON.stringify({
    id: "evt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    event,
    timestamp,
    source: "cmsMu Core Engine",
    data,
  });

  const results: any[] = [];
  let delivered = 0;

  await Promise.all(
    activeMatching.map(async ep => {
      try {
        const secretToUse =
          ep.secret || env.WEBHOOK_SECRET || "cmsmu-webhook-secret";
        const signature = await computeHmacSha256(secretToUse, bodyPayload);

        const res = await fetch(ep.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "cmsMu-Webhook-Dispatcher/1.0",
            "X-CMSMu-Event": event,
            "X-CMSMu-Timestamp": timestamp,
            "X-CMSMu-Signature": `sha256=${signature}`,
          },
          body: bodyPayload,
        });

        if (res.ok) delivered++;
        results.push({
          id: ep.id,
          url: ep.url,
          status: res.status,
          ok: res.ok,
        });
      } catch (err: any) {
        results.push({
          id: ep.id,
          url: ep.url,
          status: 0,
          ok: false,
          error: err?.message || "Network Error",
        });
      }
    })
  );

  return { totalMatched: activeMatching.length, delivered, results };
}

// ---------------------------------------------------------------------
// 1. GET /api/webhooks - Ambil daftar konfigurasi Universal Webhook (Admin)
// ---------------------------------------------------------------------
webhooksRouter.get("/", adminOnlyMiddleware, async c => {
  try {
    if (!c.env.DB) return c.json({ error: "Database tidak terhubung" }, 500);
    const db = getDb(c.env.DB);
    const config = await getWebhooksConfig(db);
    return c.json({
      success: true,
      data: {
        incomingEndpoint: "/api/webhooks/incoming/:provider",
        hasIncomingSecret: Boolean(
          config.incomingSecret || c.env.WEBHOOK_SECRET
        ),
        endpoints: config.endpoints,
        supportedEvents: [
          "*",
          "post.created",
          "post.updated",
          "post.deleted",
          "page.created",
          "page.updated",
          "user.registered",
          "user.role_updated",
          "media.uploaded",
          "payment.completed",
        ],
      },
    });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ---------------------------------------------------------------------
// 2. POST /api/webhooks - Simpan / Tambah Endpoint Outgoing Webhook (Admin)
// ---------------------------------------------------------------------
webhooksRouter.post("/", adminOnlyMiddleware, async c => {
  try {
    if (!c.env.DB) return c.json({ error: "Database tidak terhubung" }, 500);
    const db = getDb(c.env.DB);
    const body = await c.req.json();

    const current = await getWebhooksConfig(db);
    let endpoints = current.endpoints;

    // Jika body mengirim array `endpoints` secara langsung, simpan seluruhnya
    if (Array.isArray(body.endpoints)) {
      endpoints = body.endpoints;
    } else if (body.url) {
      const newEp: WebhookEndpointConfig = {
        id: body.id || "wh_" + Date.now(),
        name: String(body.name || "External Webhook").trim(),
        url: String(body.url).trim(),
        secret: String(body.secret || "").trim(),
        events: Array.isArray(body.events)
          ? body.events
          : [String(body.events || "*")],
        active: body.active !== undefined ? Boolean(body.active) : true,
        createdAt: new Date().toISOString(),
      };
      const existingIdx = endpoints.findIndex(x => x.id === newEp.id);
      if (existingIdx >= 0) {
        endpoints[existingIdx] = newEp;
      } else {
        endpoints.push(newEp);
      }
    }

    const serialized = JSON.stringify(endpoints);
    await db
      .insert(settingsTable)
      .values({ key: "webhooks_config", value: serialized })
      .onConflictDoUpdate({
        target: settingsTable.key,
        set: { value: serialized },
      })
      .run();

    if (body.incomingSecret !== undefined) {
      const secVal = String(body.incomingSecret).trim();
      await db
        .insert(settingsTable)
        .values({ key: "webhook_incoming_secret", value: secVal })
        .onConflictDoUpdate({
          target: settingsTable.key,
          set: { value: secVal },
        })
        .run();
    }

    return c.json({
      success: true,
      message: "Konfigurasi Universal Webhook berhasil disimpan",
      data: { endpoints },
    });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ---------------------------------------------------------------------
// 3. DELETE /api/webhooks/:id - Hapus Endpoint Webhook (Admin)
// ---------------------------------------------------------------------
webhooksRouter.delete("/:id", adminOnlyMiddleware, async c => {
  try {
    const id = c.req.param("id");
    const db = getDb(c.env.DB);
    const current = await getWebhooksConfig(db);
    const filtered = current.endpoints.filter(ep => ep.id !== id);

    const serialized = JSON.stringify(filtered);
    await db
      .insert(settingsTable)
      .values({ key: "webhooks_config", value: serialized })
      .onConflictDoUpdate({
        target: settingsTable.key,
        set: { value: serialized },
      })
      .run();

    return c.json({
      success: true,
      message: "Endpoint webhook dihapus",
      data: { endpoints: filtered },
    });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ---------------------------------------------------------------------
// 4. POST /api/webhooks/dispatch - Trigger Outgoing Webhook / Test Ping (Admin)
// ---------------------------------------------------------------------
webhooksRouter.post("/dispatch", adminOnlyMiddleware, async c => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const event = String(body.event || "webhook.test");
    const payload = body.data || {
      message: "Ping test dari Universal Webhook cmsMu Core",
    };

    await nusaHooks.doAction(event, payload);
    const report = await dispatchOutgoingWebhook(c.env, event, payload);

    return c.json({
      success: true,
      event,
      ...report,
    });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ---------------------------------------------------------------------
// 5. POST /api/webhooks/incoming/:provider - Universal Incoming Webhook Receiver
// Mendukung integrasi Payment Gateway (Midtrans/Xendit/Custom), n8n, Zapier, & Automasi Konten
// ---------------------------------------------------------------------
webhooksRouter.post("/incoming/:provider", async c => {
  try {
    const provider = String(c.req.param("provider") || "custom").toLowerCase();
    const rawBody = await c.req.text();
    let payload: any = {};
    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
    } catch (_) {
      return c.json({ success: false, error: "Invalid JSON payload" }, 400);
    }

    if (!c.env.DB) {
      return c.json({ success: false, error: "Database unavailable" }, 500);
    }

    const db = getDb(c.env.DB);
    const { incomingSecret } = await getWebhooksConfig(db);
    const expectedSecret = incomingSecret || c.env.WEBHOOK_SECRET || "";

    // Verifikasi Signature / Secret jika secret telah diatur di database atau environment
    if (expectedSecret) {
      const headerSig = (
        c.req.header("X-CMSMu-Signature") ||
        c.req.header("X-Hub-Signature-256") ||
        c.req.header("X-Webhook-Token") ||
        c.req.header("X-Callback-Token") ||
        ""
      ).replace(/^sha256=/i, "");

      const computedHmac = await computeHmacSha256(expectedSecret, rawBody);
      const isDirectTokenMatch = headerSig === expectedSecret;
      const isHmacMatch = headerSig.toLowerCase() === computedHmac.toLowerCase();

      if (!headerSig || (!isDirectTokenMatch && !isHmacMatch)) {
        return c.json(
          {
            success: false,
            error: "Invalid webhook signature or token",
          },
          401
        );
      }
    }

    const action = String(
      payload.action || payload.event || provider
    ).toLowerCase();

    // A. Built-in Action 1: Auto Upgrade Role / Kuota Berlangganan User (Misal dari Payment Gateway)
    if (
      action === "user.upgrade_role" ||
      action === "subscription.activated" ||
      action === "payment.completed"
    ) {
      const targetEmail = String(
        payload.email || payload.customer_email || payload.data?.email || ""
      )
        .trim()
        .toLowerCase();
      const targetUsername = String(
        payload.username || payload.data?.username || ""
      )
        .trim()
        .toLowerCase();
      const newRole = String(
        payload.role || payload.data?.role || "subscriber_pro"
      );
      const durationDays = Number(
        payload.duration_days || payload.data?.duration_days || 30
      );
      const customPlan = String(
        payload.subscription_plan || payload.data?.subscription_plan || "1_bulan"
      );

      if (targetEmail || targetUsername) {
        const expDate = new Date(
          Date.now() + durationDays * 86400000
        ).toISOString();

        const userRecord = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(
            targetEmail
              ? eq(sql`lower(${usersTable.email})`, targetEmail)
              : eq(sql`lower(${usersTable.username})`, targetUsername)
          )
          .get();

        if (userRecord) {
          await db
            .update(usersTable)
            .set({
              role: newRole,
              subscriptionPlan: customPlan,
              subscriptionExpiresAt: expDate,
            })
            .where(eq(usersTable.id, userRecord.id))
            .run();
        }
      }
    }

    // B. Built-in Action 2: Automasi Ingest Artikel Draft/Publish (n8n / Zapier / External CMS)
    if (action === "post.ingest" || action === "post.create") {
      const postData = payload.data || payload;
      const title = String(postData.title || "").trim();
      if (title) {
        const slug =
          String(postData.slug || "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") ||
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") +
            "-" +
            Date.now().toString(36);

        await db
          .insert(postsTable)
          .values({
            title,
            slug,
            body: String(postData.body || postData.content || "<p></p>"),
            excerpt: String(postData.excerpt || ""),
            category: String(postData.category || "Uncategorized"),
            tags: String(postData.tags || ""),
            status: postData.status === "publish" ? "publish" : "draft",
            featuredImage: String(postData.featured_image || ""),
            author: String(postData.author || provider.toUpperCase()),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .run();
      }
    }

    // Trigger internal hook & forward to any subscribed outgoing webhooks
    await nusaHooks.doAction(`webhook.incoming.${provider}`, payload);

    return c.json({
      success: true,
      provider,
      action,
      receivedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});
