import { Hono } from "hono";
import type { Bindings } from "../../../types";
import { getDb } from "../../../db";
import { posts as postsTable, pages as pagesTable } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";

const seoRouter = new Hono<{ Bindings: Bindings }>();
const PROD_DOMAIN = "https://suaraaisyiyah.id";

// ============================================================
// SEO: robots.txt — noindex staging, allow production
// ============================================================
seoRouter.get("/robots.txt", async c => {
  const host = c.req.header("host") || "";
  const isLocalOrPreview =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.includes("pages.dev") ||
    host.includes("workers.dev");
  const isStaging = isLocalOrPreview || host.includes("staging");
  const scheme = c.req.url.startsWith("https") ? "https" : "http";
  const siteBase = `${scheme}://${host}`;

  const txt = !isStaging
    ? `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${siteBase}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n\n# Staging/Dev site — not for indexing\n`;
  return c.text(txt, 200, { "Content-Type": "text/plain; charset=utf-8" });
});

// ============================================================
// SEO: sitemap_index.xml
// ============================================================
seoRouter.get("/sitemap_index.xml", async c => {
  const host = c.req.header("host") || "";
  const scheme = c.req.url.startsWith("https") ? "https" : "http";
  const siteBase = `${scheme}://${host}`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteBase}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;
  return c.text(xml, 200, { "Content-Type": "application/xml; charset=utf-8" });
});

// ============================================================
// SEO: sitemap.xml — generate dari D1 posts + pages
// ============================================================
seoRouter.get("/sitemap.xml", async c => {
  const host = c.req.header("host") || "";
  const base =
    host === "suaraaisyiyah.id" || host === "www.suaraaisyiyah.id"
      ? PROD_DOMAIN
      : `https://${host}`;
  try {
    const dbDrizzle = getDb(c.env.DB);
    const posts = await dbDrizzle
      .select({
        slug: postsTable.slug,
        updated_at: postsTable.updatedAt,
        created_at: postsTable.createdAt,
      })
      .from(postsTable)
      .where(eq(postsTable.status, "publish"))
      .orderBy(desc(postsTable.createdAt))
      .limit(1000);
    const pages = await dbDrizzle
      .select({
        slug: pagesTable.slug,
        updated_at: pagesTable.updatedAt,
        created_at: pagesTable.createdAt,
      })
      .from(pagesTable)
      .where(eq(pagesTable.status, "publish"));
    const fmt = (d: any) =>
      d
        ? new Date(d).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
    const postUrls = (posts || [])
      .map(
        (p: any) =>
          `  <url>\n    <loc>${base}/${p.slug}</loc>\n    <lastmod>${fmt(p.updated_at || p.created_at)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
      )
      .join("\n");
    const pageUrls = (pages || [])
      .map(
        (p: any) =>
          `  <url>\n    <loc>${base}/${p.slug}</loc>\n    <lastmod>${fmt(p.updated_at || p.created_at)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>`
      )
      .join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${base}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n${postUrls}\n${pageUrls}\n</urlset>`;
    return c.body(xml, 200, {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    });
  } catch (e: any) {
    return c.text("Sitemap error: " + e.message, 500);
  }
});

export default seoRouter;
