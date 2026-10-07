import type { CollectionEntry } from "astro:content";
import config from "@/config";
import { env } from "cloudflare:workers";
import { getDb } from "@/cms/db";
import { posts } from "@/cms/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getD1Posts(
  Astro: any
): Promise<CollectionEntry<"posts">[]> {
  const d1 = env?.DB;
  if (!d1) {
    console.warn("D1 Database not found in env.DB");
    return [];
  }

  try {
    const db = getDb(d1);
    const results = await db
      .select()
      .from(posts)
      .where(eq(posts.status, "publish"))
      .orderBy(desc(posts.createdAt));
    if (!results) return [];

    return results.map((row: any) => {
      return {
        id: row.slug,
        slug: row.slug,
        body: row.body || "",
        collection: "posts",
        filePath: undefined,
        data: {
          title: row.title || "Untitled",
          description:
            (row.body || "").replace(/<[^>]*>?/gm, "").substring(0, 150) +
            "...",
          pubDatetime: new Date(row.createdAt || row.created_at),
          modDatetime: null,
          tags: row.tags
            ? row.tags.split(",").map((t: string) => t.trim())
            : ["others"],
          ogImage: row.featuredImage || row.featured_image || undefined,
          canonicalURL: undefined,
          hideEditPost: true,
          author: row.author || config.site.author,
          featured: false,
          draft: false,
          timezone: undefined,
        },
      };
    }) as CollectionEntry<"posts">[];
  } catch (error) {
    console.error("Error fetching posts from D1:", error);
    return [];
  }
}
