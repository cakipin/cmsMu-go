import { Hono } from "hono";
import { getDb } from "@cmsmu/db";
import { pages, settings } from "@cmsmu/db";
import { eq, asc } from "drizzle-orm";
import { clearGlobalDataCache } from "../public/helpers";

type Bindings = {
  DB: D1Database;
  WIKIMU_CACHE?: any;
};

const themeEditorRouter = new Hono<{ Bindings: Bindings }>();

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

// GET /api/theme-editor/page?slug=about
themeEditorRouter.get("/page", async c => {
  const slug = c.req.query("slug");
  if (!slug) return c.json({ error: "Slug required" }, 400);

  try {
    const db = getDb(c.env.DB);
    const page = await db
      .select({ body: pages.body })
      .from(pages)
      .where(eq(pages.slug, slug))
      .get();
    if (page) {
      return c.json({ success: true, data: page });
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

// GET /api/theme-editor/pages
themeEditorRouter.get("/pages", async c => {
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

    return c.json({ success: true, data: results || [], homeSlug: homeSlug });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// POST /api/theme-editor/set-homepage
themeEditorRouter.post("/set-homepage", async c => {
  try {
    const { slug } = await c.req.json();
    if (!slug) return c.json({ error: "Slug required" }, 400);

    const db = getDb(c.env.DB);
    await upsertSetting(db, "site_homepage_slug", slug);
    await upsertSetting(db, "global_header_source_slug", slug);
    clearGlobalDataCache(c.env.WIKIMU_CACHE);

    return c.json({ success: true, homeSlug: slug });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// POST /api/theme-editor/page
themeEditorRouter.post("/page", async c => {
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

    // Jika setAsHome diaktifkan atau slug === 'home', sinkronkan sebagai homepage aktif
    if (setAsHome || slug === "home") {
      await upsertSetting(db, "site_homepage_slug", slug);
    }

    // Bersihkan cache Edge & In-Memory agar perubahan langsung tampil di halaman live
    clearGlobalDataCache(c.env.WIKIMU_CACHE);

    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default themeEditorRouter;

