import type { D1Database } from "@cloudflare/workers-types";
import { getDb } from "@cmsmu/db";
import { contents } from "@cmsmu/db";
import { eq, desc } from "drizzle-orm";

export class ContentService {
  private orm;

  constructor(private db: D1Database) {
    this.orm = getDb(db);
  }

  private getSafeTime(dateInput: any): string {
    const now = new Date().toISOString();
    if (!dateInput) return now;
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return now;
      return d.toISOString();
    } catch {
      return now;
    }
  }

  private clean(val: any, fallback: any = "") {
    return val === undefined || val === null ? fallback : val;
  }

  async getAll(type?: string) {
    let query = this.orm.select().from(contents);
    if (type) {
      return await query
        .where(eq(contents.type, type))
        .orderBy(desc(contents.createdAt));
    }
    return await query.orderBy(desc(contents.createdAt));
  }

  async getById(id: string) {
    const result: any = await this.orm
      .select()
      .from(contents)
      .where(eq(contents.id, Number(id)))
      .get();
    if (!result) return null;
    if (!result.attributes) result.attributes = "{}";
    return result;
  }

  async create(data: any) {
    const now = new Date().toISOString();
    const createdAt = this.getSafeTime(data.date);
    const safeSlug = this.clean(data.slug, `post-${Date.now()}`);

    const attributes = JSON.stringify({
      featured_image: this.clean(data.featured_image),
      category: this.clean(data.category),
      tags: this.clean(data.tags),
    });

    const inserted = await this.orm
      .insert(contents)
      .values({
        title: this.clean(data.title, "(No Title)"),
        slug: safeSlug,
        body: this.clean(data.body),
        type: this.clean(data.type, "post"),
        status: this.clean(data.status, "draft"),
        category: this.clean(data.category),
        tags: this.clean(data.tags),
        attributes: attributes,
        createdAt: createdAt,
        updatedAt: now,
      })
      .returning({ id: contents.id });

    return inserted[0];
  }

  async update(id: string, data: any) {
    const now = new Date().toISOString();
    const createdAt = data.date ? this.getSafeTime(data.date) : now;

    const attributes = JSON.stringify({
      featured_image: this.clean(data.featured_image),
      category: this.clean(data.category),
      tags: this.clean(data.tags),
    });

    return await this.orm
      .update(contents)
      .set({
        title: this.clean(data.title),
        slug: this.clean(data.slug),
        body: this.clean(data.body),
        type: this.clean(data.type),
        status: this.clean(data.status),
        category: this.clean(data.category),
        tags: this.clean(data.tags),
        attributes: attributes,
        createdAt: createdAt,
        updatedAt: now,
      })
      .where(eq(contents.id, Number(id)))
      .run();
  }

  async delete(id: string) {
    return await this.orm
      .delete(contents)
      .where(eq(contents.id, Number(id)))
      .run();
  }
}
