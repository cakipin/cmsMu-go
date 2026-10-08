import { Hono } from "hono";
import type { Bindings } from "../../../types";
import { getDb } from "@cmsmu/db";
import { magazines as magazinesTable } from "@cmsmu/db";
import { eq, desc, and } from "drizzle-orm";
import { getStorageBucket } from "../../../storage/r2-adapter";
import { getPlansConfig } from "../../emagazine/emagazine.router";
import { getGlobalData, getRenderer } from "../helpers";

const emagazinePublicRouter = new Hono<{ Bindings: Bindings }>();

// ============================================================
// AGENT / KEAGENAN ROUTE
// ============================================================
emagazinePublicRouter.get("/agen", async c => {
  try {
    const db = c.env.DB;
    const page = parseInt(c.req.query("page") || "1");
    const search = c.req.query("q") || "";
    const limit = 15;
    const offset = (page - 1) * limit;

    const { settings, menus } = await getGlobalData(db);
    const { Renderer } = await getRenderer(db);

    let agens = [];
    let totalItems = 0;

    try {
      if (search) {
        const words = search.split(/\s+/).filter(w => w.trim().length > 0);
        let whereClause = "1=1";
        const bindParams = [];

        words.forEach(word => {
          whereClause += " AND (name LIKE ? OR area LIKE ? OR address LIKE ?)";
          const pattern = "%" + word + "%";
          bindParams.push(pattern, pattern, pattern);
        });

        const countSql =
          "SELECT count(*) as total FROM agens WHERE " + whereClause;
        const totalRow = await db
          .prepare(countSql)
          .bind(...bindParams)
          .first();
        totalItems = totalRow?.total || 0;

        const sql =
          "SELECT * FROM agens WHERE " +
          whereClause +
          " ORDER BY area ASC, name ASC LIMIT ? OFFSET ?";
        const result = await db
          .prepare(sql)
          .bind(...bindParams)
          .all();
        agens = result.results || [];
      } else {
        const totalRow: any = await db
          .prepare("SELECT count(*) as total FROM agens")
          .first();
        totalItems = totalRow?.total || 0;

        const result = await db
          .prepare(
            "SELECT * FROM agens ORDER BY area ASC, name ASC LIMIT ? OFFSET ?"
          )
          .bind(limit, offset)
          .all();
        agens = result.results || [];
      }
    } catch (e) {
      console.error("Agens table missing or error", e);
    }

    const totalPages = Math.ceil(totalItems / limit);
    let baseUrl = "/agen";
    if (search) baseUrl += "?q=" + encodeURIComponent(search);

    const pagination = {
      currentPage: page,
      totalPages,
      totalItems,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      baseUrl,
    };

    const context: any = {
      site: settings,
      menus,
      data: agens,
      pagination,
      search,
    };

    if (Renderer?.renderAgen) return c.html(Renderer.renderAgen(context));
    return c.html(Renderer.renderHome(context));
  } catch (e: any) {
    return c.text("Agen Error: " + e.message, 500);
  }
});

// ============================================================
// BERLANGGANAN ROUTE
// ============================================================
emagazinePublicRouter.get("/berlangganan", async c => {
  try {
    const db = c.env.DB;
    const { settings, menus } = await getGlobalData(db);
    const { Renderer } = await getRenderer(db);
    const plansConfig = await getPlansConfig(db);

    const context: any = {
      site: settings,
      menus,
      data: { title: "Daftar Pelanggan Pro", plansConfig },
    };

    if (Renderer?.renderBerlangganan) {
      return c.html(Renderer.renderBerlangganan(context));
    }

    return c.html(
      Renderer.renderPage
        ? Renderer.renderPage(context)
        : "Halaman berlangganan belum tersedia di tema ini."
    );
  } catch (e: any) {
    return c.text("Error: " + e.message, 500);
  }
});

// ============================================================
// E-MAGAZINE: /majalah & /majalah/:slug
// ============================================================
emagazinePublicRouter.get("/majalah", async c => {
  try {
    const page = Math.max(1, parseInt(c.req.query("page") || "1"));
    const q = (c.req.query("q") || "").trim();
    const year = (c.req.query("year") || "").trim();
    const limit = 12;

    const db = c.env.DB;
    const { settings, menus } = await getGlobalData(db);
    const { Renderer } = await getRenderer(db);

    let allList: any[] = [];
    try {
      allList = await getDb(db)
        .select({
          id: magazinesTable.id,
          title: magazinesTable.title,
          slug: magazinesTable.slug,
          description: magazinesTable.description,
          editionNumber: magazinesTable.editionNumber,
          publicationDate: magazinesTable.publicationDate,
          coverImage: magazinesTable.coverImage,
          isFree: magazinesTable.isFree,
          previewPages: magazinesTable.previewPages,
          createdAt: magazinesTable.createdAt,
        })
        .from(magazinesTable)
        .where(eq(magazinesTable.status, "published"))
        .orderBy(desc(magazinesTable.id));
    } catch (dbErr) {
      console.error("Magazines table missing or error:", dbErr);
    }

    let filtered = allList || [];
    if (q) {
      const lowerQ = q.toLowerCase();
      filtered = filtered.filter(
        item =>
          (item.title && item.title.toLowerCase().includes(lowerQ)) ||
          (item.editionNumber &&
            item.editionNumber.toLowerCase().includes(lowerQ)) ||
          (item.description &&
            item.description.toLowerCase().includes(lowerQ)) ||
          (item.publicationDate &&
            item.publicationDate.toLowerCase().includes(lowerQ))
      );
    }
    if (year) {
      if (year === "free") {
        filtered = filtered.filter(item => item.isFree === 1);
      } else {
        filtered = filtered.filter(item => {
          const pub = item.publicationDate || "";
          const title = item.title || "";
          const ed = item.editionNumber || "";
          return (
            pub.includes(year) || title.includes(year) || ed.includes(year)
          );
        });
      }
    }

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const offset = (safePage - 1) * limit;
    const paginatedData = filtered.slice(offset, offset + limit);

    const context: any = {
      site: settings,
      menus,
      data: paginatedData,
      pagination: {
        currentPage: safePage,
        totalPages,
        totalItems,
        limit,
        q,
        year,
      },
    };
    if (Renderer?.renderMajalahList) {
      return c.html(Renderer.renderMajalahList(context));
    }
    return c.text("Katalog majalah belum tersedia.", 404);
  } catch (e: any) {
    return c.text("Majalah Error: " + e.message, 500);
  }
});

emagazinePublicRouter.get("/majalah/:slug", async c => {
  try {
    const slug = c.req.param("slug");
    const db = c.env.DB;
    const { settings, menus } = await getGlobalData(db);
    const { Renderer } = await getRenderer(db);

    let mag: any = null;
    try {
      mag = await getDb(db)
        .select()
        .from(magazinesTable)
        .where(
          and(
            eq(magazinesTable.slug, slug),
            eq(magazinesTable.status, "published")
          )
        )
        .get();
    } catch (dbErr) {
      console.error("Magazines table missing or error:", dbErr);
    }

    if (!mag)
      return c.html(
        Renderer?.render404
          ? Renderer.render404({ site: settings, menus })
          : "Majalah tidak ditemukan",
        404
      );

    let hasPdf = false;
    const r2 = getStorageBucket(c);
    if (r2 && mag.pdfR2Key) {
      try {
        const head = await r2.head(mag.pdfR2Key);
        if (head) hasPdf = true;
      } catch {
        hasPdf = false;
      }
    }

    const context: any = { site: settings, menus, data: { ...mag, hasPdf } };
    if (Renderer?.renderMajalahReader) {
      return c.html(Renderer.renderMajalahReader(context));
    }
    return c.text("Penampil majalah belum tersedia.", 404);
  } catch (e: any) {
    return c.text("Majalah Reader Error: " + e.message, 500);
  }
});

export default emagazinePublicRouter;
