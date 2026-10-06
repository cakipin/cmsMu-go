import { nusaHooks } from "../../core/hooks";
import type { D1Database } from "@cloudflare/workers-types";
import { getDb } from "../../db";
import { posts } from "../../db/schema";
import { desc } from "drizzle-orm";

export class PostService {
  private orm;

  constructor(private db: D1Database) {
    this.orm = getDb(db);
  }

  /**
   * Mengambil semua data dari tabel posts untuk ditampilkan di List Post
   */
  async findAll() {
    const results = await this.orm
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        status: posts.status,
        category: posts.category,
        tags: posts.tags,
        created_at: posts.createdAt,
      })
      .from(posts)
      .orderBy(desc(posts.createdAt));

    return results;
  }

  /**
   * Membuat post baru di tabel 'posts'
   */
  async create(data: any) {
    // [HOOK] Sebelum save, data boleh diubah oleh plugin
    const processedData = await nusaHooks.applyFilters(
      "before_post_create",
      data
    );

    const result = await this.orm
      .insert(posts)
      .values({
        title: processedData.title,
        slug: processedData.slug,
        body: processedData.body || "",
        status: processedData.status || "draft",
        author: processedData.author || "Admin",
      })
      .returning({ id: posts.id });

    // [HOOK] Setelah save, lakukan sesuatu (Action)
    await nusaHooks.doAction("after_post_create", {
      id: result[0]?.id,
      ...processedData,
    });

    return result;
  }
}
