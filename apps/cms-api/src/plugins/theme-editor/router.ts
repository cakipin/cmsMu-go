import { Hono } from "hono";
import { getDb } from "@cmsmu/db";
import { pages, settings, locales } from "@cmsmu/db";
import { eq, asc } from "drizzle-orm";
import { clearGlobalDataCache } from "../../modules/public/helpers";
import { verify } from "hono/jwt";
import { getJwtSecret } from "../../modules/users/auth.helper";

type Bindings = {
  DB: D1Database;
  CACHE?: any;
  cmsmu_cache?: any;
  WIKIMU_CACHE?: any;
  JWT_SECRET?: string;
};

const themeEditorRouter = new Hono<{ Bindings: Bindings }>();

const THEME_EDITOR_ROLES = ["superadmin", "admin", "editor"];

/** Ambil role dari JWT (Authorization Bearer / cookie labmu_token). Null jika tidak valid. */
async function getEditorRole(c: any): Promise<string | null> {
  const authHeader = c.req.header("Authorization");
  let token = authHeader ? authHeader.replace(/^Bearer\s+/i, "").trim() : "";
  if (!token) {
    const parts = (c.req.header("Cookie") || "").split(";");
    for (const raw of parts) {
      const p = raw.trim();
      if (p.indexOf("labmu_token=") === 0) {
        token = decodeURIComponent(p.substring(12));
        break;
      }
    }
  }
  if (!token) return null;
  try {
    const payload: any = await verify(token, getJwtSecret(c.env), "HS256");
    if (!payload || !payload.id) return null;
    return String(payload.role || "").toLowerCase();
  } catch {
    return null;
  }
}

async function canEditTheme(c: any): Promise<boolean> {
  const role = await getEditorRole(c);
  return !!role && THEME_EDITOR_ROLES.includes(role);
}

async function upsertSetting(db: any, key: string, value: string) {
  const existing = await db
    .select({ key: settings.key })
    .from(settings)
    .where(eq(settings.key, key))
    .get();
  if (existing) {
    await db
      .update(settings)
      .set({ value })
      .where(eq(settings.key, key))
      .run();
  } else {
    await db
      .insert(settings)
      .values({ key, value })
      .run();
  }
}

// 1. GET /api/theme-editor/locales (Publik untuk Mobile SDK & Web SDUI)
themeEditorRouter.get("/locales", async c => {
  try {
    const db = getDb(c.env.DB);
    let items: any[] = [];
    try {
      items = await db
        .select({
          code: locales.code,
          name: locales.name,
          direction: locales.direction,
          isDefault: locales.isDefault,
          isActive: locales.isActive,
        })
        .from(locales)
        .where(eq(locales.isActive, 1))
        .all();
    } catch {
      items = [];
    }

    if (!items || items.length === 0) {
      items = [
        { code: "id", name: "Bahasa Indonesia", direction: "ltr", isDefault: 1, isActive: 1 },
        { code: "en", name: "English", direction: "ltr", isDefault: 0, isActive: 1 },
        { code: "ar", name: "العربية", direction: "rtl", isDefault: 0, isActive: 1 },
      ];
    }

    return c.json({
      success: true,
      data: items,
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 2. GET /api/theme-editor/sdui/:slug (Publik untuk Mobile SDK & Web SDUI Published Content)
themeEditorRouter.get("/sdui/:slug", async c => {
  const slug = c.req.param("slug");
  const locale = (c.req.query("locale") || "id").toLowerCase();
  const _platform = c.req.query("platform") || "web";

  if (!slug) return c.json({ error: "Slug required" }, 400);

  const direction = locale === "ar" ? "rtl" : "ltr";
  const availableLocales = ["id", "en", "ar"];

  try {
    const db = getDb(c.env.DB);
    const page = await db
      .select({ title: pages.title, body: pages.body, status: pages.status })
      .from(pages)
      .where(eq(pages.slug, slug))
      .get();

    let rawBody = page?.body;

    if (!rawBody && slug === "home") {
      const defaultHomePuck = {
        content: [
          { type: "SiteHeader", props: { id: "SiteHeader-1" } },
          { type: "Hero", props: { id: "Hero-1" } },
          { type: "Partners", props: { id: "Partners-1" } },
          { type: "FeatureGrid", props: { id: "FeatureGrid-1" } },
          { type: "Testimonial", props: { id: "Testimonial-1" } },
          { type: "RecentPosts", props: { id: "RecentPosts-1" } },
          { type: "CallToAction", props: { id: "CallToAction-1" } },
          { type: "SiteFooter", props: { id: "SiteFooter-1" } },
        ],
        root: { props: { title: "Beranda Utama" } },
        zones: {},
      };
      rawBody = JSON.stringify(defaultHomePuck);
    }

    if (!rawBody) {
      return c.json({ success: false, error: "Halaman kanvas tidak ditemukan" }, 404);
    }

    let parsed: any;
    try {
      parsed = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
    } catch {
      parsed = { content: [], root: { props: { title: page?.title || slug } }, zones: {} };
    }

    return c.json({
      success: true,
      slug,
      locale,
      direction,
      availableLocales,
      root: parsed.root || { props: { title: page?.title || slug } },
      content: Array.isArray(parsed.content) ? parsed.content : [],
      zones: parsed.zones || {},
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 3. GET /api/theme-editor/page?slug=about (Internal Canvas Builder - RBAC Protected)
themeEditorRouter.get("/page", async c => {
  if (!(await canEditTheme(c))) {
    return c.json({ error: "Akses Ditolak: Memerlukan role superadmin/admin/editor" }, 403);
  }

  const slug = c.req.query("slug");
  if (!slug) return c.json({ error: "Slug required" }, 400);

  try {
    const db = getDb(c.env.DB);
    const page = await db
      .select({ body: pages.body, status: pages.status })
      .from(pages)
      .where(eq(pages.slug, slug))
      .get();
    if (page) {
      return c.json({ success: true, data: { body: page.body } });
    } else {
      if (slug === "home") {
        const defaultHomePuck = {
          content: [
            { type: "SiteHeader", props: { id: "SiteHeader-1" } },
            { type: "Hero", props: { id: "Hero-1" } },
            { type: "Partners", props: { id: "Partners-1" } },
            { type: "FeatureGrid", props: { id: "FeatureGrid-1" } },
            { type: "Testimonial", props: { id: "Testimonial-1" } },
            { type: "RecentPosts", props: { id: "RecentPosts-1" } },
            { type: "CallToAction", props: { id: "CallToAction-1" } },
            { type: "SiteFooter", props: { id: "SiteFooter-1" } },
          ],
          root: { props: { title: "Beranda Utama" } },
          zones: {},
        };
        return c.json({
          success: true,
          data: { body: JSON.stringify(defaultHomePuck) },
        });
      }
      return c.json({ success: true, data: null });
    }
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 4. GET /api/theme-editor/pages (Internal Page Switcher List - RBAC Protected)
themeEditorRouter.get("/pages", async c => {
  if (!(await canEditTheme(c))) {
    return c.json({ error: "Akses Ditolak: Memerlukan role superadmin/admin/editor" }, 403);
  }

  try {
    const db = getDb(c.env.DB);
    const results = await db
      .select({ id: pages.id, title: pages.title, slug: pages.slug })
      .from(pages)
      .orderBy(asc(pages.title));

    const settingRow = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, "site_homepage_slug"))
      .get();
    const homeSlug = settingRow ? settingRow.value : "home";

    return c.json({
      success: true,
      data: results || [],
      homeSlug: homeSlug,
      activeHomeSlug: homeSlug,
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 5. POST /api/theme-editor/set-homepage (RBAC Protected)
themeEditorRouter.post("/set-homepage", async c => {
  if (!(await canEditTheme(c))) {
    return c.json({ error: "Akses Ditolak: Memerlukan role superadmin/admin/editor" }, 403);
  }
  try {
    const { slug } = await c.req.json();
    if (!slug) return c.json({ error: "Slug required" }, 400);

    const db = getDb(c.env.DB);
    await upsertSetting(db, "site_homepage_slug", slug);
    await upsertSetting(db, "global_header_source_slug", slug);

    // Sinkronkan juga global_header_props dari halaman yang dijadikan Beranda Utama
    try {
      const targetPage = await db
        .select({ body: pages.body })
        .from(pages)
        .where(eq(pages.slug, slug))
        .get();
      if (targetPage && targetPage.body) {
        const parsed = JSON.parse(targetPage.body);
        if (parsed && Array.isArray(parsed.content)) {
          const headerBlock = parsed.content.find((b: any) => b.type === "SiteHeader");
          if (headerBlock && headerBlock.props) {
            await upsertSetting(db, "global_header_props", JSON.stringify(headerBlock.props));
          }
        }
      }
    } catch (e) {}

    clearGlobalDataCache(c.env.CACHE || c.env.cmsmu_cache || c.env.WIKIMU_CACHE);

    return c.json({ success: true, homeSlug: slug, activeHomeSlug: slug });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 6. POST /api/theme-editor/page (RBAC Protected)
themeEditorRouter.post("/page", async c => {
  if (!(await canEditTheme(c))) {
    return c.json({ error: "Akses Ditolak: Memerlukan role superadmin/admin/editor" }, 403);
  }
  try {
    const body = await c.req.json();
    const { slug, body: content, setAsHome } = body;
    if (!slug) return c.json({ error: "Slug required" }, 400);

    const db = getDb(c.env.DB);
    const exists = await db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.slug, slug))
      .get();

    const title = slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
    const now = new Date().toISOString();

    if (exists) {
      await db
        .update(pages)
        .set({
          body: content,
          status: "publish",
          updatedAt: now,
        })
        .where(eq(pages.slug, slug))
        .run();
    } else {
      await db
        .insert(pages)
        .values({
          title,
          slug,
          body: content,
          excerpt: "",
          metaTitle: title,
          metaDescription: "",
          status: "publish",
          layout: "standard",
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }

    // Sinkronisasi global_header_props jika terdapat blok SiteHeader
    try {
      const parsed = typeof content === "string" ? JSON.parse(content) : content;
      if (parsed && Array.isArray(parsed.content)) {
        const headerBlock = parsed.content.find((b: any) => b.type === "SiteHeader");
        if (headerBlock && headerBlock.props) {
          await upsertSetting(db, "global_header_props", JSON.stringify(headerBlock.props));
          await upsertSetting(db, "global_header_source_slug", slug);
        }
      }
    } catch (e) {}

    // Hanya ubah site_homepage_slug jika diminta secara eksplisit (setAsHome) atau belum ada setting sama sekali
    if (setAsHome) {
      await upsertSetting(db, "site_homepage_slug", slug);
    } else {
      const existingHome = await db
        .select({ value: settings.value })
        .from(settings)
        .where(eq(settings.key, "site_homepage_slug"))
        .get();
      if (!existingHome || !existingHome.value) {
        await upsertSetting(db, "site_homepage_slug", slug);
      }
    }

    // Bersihkan cache Edge & In-Memory agar perubahan langsung tampil di halaman live
    clearGlobalDataCache(c.env.CACHE || c.env.cmsmu_cache || c.env.WIKIMU_CACHE);

    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default themeEditorRouter;
