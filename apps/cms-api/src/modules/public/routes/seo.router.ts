import { Hono } from "hono";
import type { Bindings } from "../../../types";
import { getDb } from "@cmsmu/db";
import { posts as postsTable, pages as pagesTable } from "@cmsmu/db";
import { eq, desc } from "drizzle-orm";
import { getCachedPublishedPostCount } from "../helpers";

const seoRouter = new Hono<{ Bindings: Bindings }>();
const POSTS_PER_SITEMAP = 1000;
const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
};

const getBase = (req: any) => {
  const host = req.header("host") || "";
  const scheme = req.url.startsWith("https") ? "https" : "http";
  return `${scheme}://${host}`;
};

const fmt = (d: any) =>
  d
    ? new Date(d).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

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
  const base = getBase(c.req);

  const txt = !isStaging
    ? `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /theme-editor\n\nSitemap: ${base}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n\n# Staging/Dev site — not for indexing\n`;
  return c.text(txt, 200, { "Content-Type": "text/plain; charset=utf-8" });
});

// ============================================================
// SEO: sitemap index (Tiered sitemap dengan cached post count)
// ============================================================
const sitemapIndexHandler = async (c: any) => {
  const base = getBase(c.req);
  try {
    const total = await getCachedPublishedPostCount(c.env);
    const pageCount = Math.max(1, Math.ceil(total / POSTS_PER_SITEMAP));
    const now = new Date().toISOString();

    let entries = `  <sitemap>\n    <loc>${base}/sitemap-main.xml</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`;
    for (let i = 1; i <= pageCount; i++) {
      entries += `\n  <sitemap>\n    <loc>${base}/sitemap-posts-${i}.xml</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`;
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>`;
    return c.body(xml, 200, XML_HEADERS);
  } catch (e: any) {
    return c.text("Sitemap error: " + e.message, 500);
  }
};

seoRouter.get("/sitemap_index.xml", sitemapIndexHandler);
seoRouter.get("/sitemap.xml", sitemapIndexHandler);

// ============================================================
// SEO: sitemap-main.xml (Pages & Root)
// ============================================================
seoRouter.get("/sitemap-main.xml", async c => {
  const base = getBase(c.req);
  try {
    const dbDrizzle = getDb(c.env.DB);
    const pages = await dbDrizzle
      .select({
        slug: pagesTable.slug,
        updated_at: pagesTable.updatedAt,
        created_at: pagesTable.createdAt,
      })
      .from(pagesTable)
      .where(eq(pagesTable.status, "publish"));

    const pageUrls = (pages || [])
      .map(
        (p: any) =>
          `  <url>\n    <loc>${base}/${p.slug}</loc>\n    <lastmod>${fmt(p.updated_at || p.created_at)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${base}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n${pageUrls}\n</urlset>`;
    return c.body(xml, 200, XML_HEADERS);
  } catch (e: any) {
    return c.text("Sitemap error: " + e.message, 500);
  }
});

// ============================================================
// SEO: sitemap-posts-:page.xml (Paginated Posts)
// ============================================================
seoRouter.get("/sitemap-posts-:page{.+\\.xml$}", async c => {
  const base = getBase(c.req);
  const param = c.req.param("page") || "";
  const pageNum = parseInt(param.replace(".xml", ""), 10) || 1;
  const offset = (pageNum - 1) * POSTS_PER_SITEMAP;

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
      .limit(POSTS_PER_SITEMAP)
      .offset(offset);

    const postUrls = (posts || [])
      .map(
        (p: any) =>
          `  <url>\n    <loc>${base}/${p.slug}</loc>\n    <lastmod>${fmt(p.updated_at || p.created_at)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${postUrls}\n</urlset>`;
    return c.body(xml, 200, XML_HEADERS);
  } catch (e: any) {
    return c.text("Sitemap error: " + e.message, 500);
  }
});

export default seoRouter;
