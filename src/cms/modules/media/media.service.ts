import type { D1Database, R2Bucket } from "@cloudflare/workers-types";
import { getDb } from "../../db";
import { mediaMeta } from "../../db/schema";
import { eq, sql } from "drizzle-orm";

export class MediaService {
  private orm;

  constructor(
    private bucket: R2Bucket,
    private db: D1Database
  ) {
    this.orm = getDb(db);
  }

  async upload(key: string, file: File | Blob) {
    await this.bucket.put(key, file, {
      httpMetadata: { contentType: file.type },
    });
    return { key };
  }

  async list() {
    const list = await this.bucket.list({ limit: 500 });
    const results = await this.orm.select().from(mediaMeta);

    return list.objects.map(obj => {
      const meta: any = results.find((m: any) => m.key === obj.key) || {};
      return {
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded,
        alt: meta.alt || "",
        title: meta.title || "",
        description: meta.description || "",
        caption: meta.caption || "",
      };
    });
  }

  async get(key: string) {
    return await this.bucket.get(key);
  }

  async delete(key: string) {
    await this.bucket.delete(key);
    await this.orm.delete(mediaMeta).where(eq(mediaMeta.key, key)).run();
  }

  async saveMeta(
    key: string,
    data: {
      alt?: string;
      description?: string;
      title?: string;
      caption?: string;
    }
  ) {
    return await this.orm
      .insert(mediaMeta)
      .values({
        key,
        url: key, // fallback url
        alt: data.alt || "",
        description: data.description || "",
        title: data.title || "",
        caption: data.caption || "",
      })
      .onConflictDoUpdate({
        target: mediaMeta.key,
        set: {
          alt: sql`excluded.alt`,
          description: sql`excluded.description`,
          title: sql`excluded.title`,
          caption: sql`excluded.caption`,
        },
      })
      .run();
  }

  async rename(oldKey: string, newName: string) {
    const oldObject = await this.bucket.get(oldKey);
    if (!oldObject) throw new Error("File lama tidak ditemukan");

    const parts = oldKey.split("/");
    const cleanNewName = newName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const newKey =
      parts.length > 1
        ? `${parts.slice(0, -1).join("/")}/${cleanNewName}`
        : cleanNewName;

    await this.bucket.put(newKey, oldObject.body, {
      httpMetadata: oldObject.httpMetadata,
      customMetadata: oldObject.customMetadata,
    });
    await this.bucket.delete(oldKey);
    await this.orm
      .update(mediaMeta)
      .set({ key: newKey })
      .where(eq(mediaMeta.key, oldKey))
      .run();

    return { oldKey, newKey };
  }
}
