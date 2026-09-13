import { env } from "cloudflare:workers";
import { getDb } from "@/cms/db";
import { pages } from "@/cms/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getD1Pages(Astro: any): Promise<any[]> {
  const d1 = env?.DB;
  if (!d1) {
    return [];
  }

  try {
    const db = getDb(d1);
    const results = await db.select().from(pages).where(eq(pages.status, 'publish')).orderBy(desc(pages.createdAt));
    if (!results) return [];

    return results.map((row: any) => {
      return {
        id: row.slug,
        slug: row.slug,
        body: row.body || "",
        data: {
          title: row.title || "Untitled",
          description: (row.body || "").replace(/<[^>]*>?/gm, '').substring(0, 150) + "...",
          pubDatetime: new Date(row.createdAt || row.created_at),
          modDatetime: null,
          ogImage: row.featuredImage || row.featured_image || undefined,
          author: row.author,
        }
      };
    });
  } catch (error) {
    console.error("Error fetching pages from D1:", error);
    return [];
  }
}
