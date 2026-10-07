import type { D1Database } from "@cloudflare/workers-types";
import { getDb } from "../../db";
import { options } from "../../db/schema";
import { sql } from "drizzle-orm";

export class SettingsService {
  constructor(private db: D1Database) {}

  // Ambil semua settingan
  async getAll() {
    try {
      const dbInstance = getDb(this.db);
      const result = await dbInstance.select().from(options);
      const settings: any = {};

      // Ubah dari array baris DB jadi object { key: value }
      if (result) {
        result.forEach((row: any) => {
          settings[row.key] = row.value;
        });
      }

      return {
        site_title: "LabMu CMS",
        site_desc: "Just another LabMu site",
        ...settings, // Gabungkan default dengan data DB
      };
    } catch (e) {
      console.error(e);
      return {}; // Return kosong kalau tabel belum ada
    }
  }

  // Simpan settingan (Upsert: Update kalau ada, Insert kalau belum)
  async updateMany(data: Record<string, string>) {
    const dbInstance = getDb(this.db);
    const batchData = Object.entries(data).map(([key, value]) => ({
      key,
      value: String(value),
    }));

    if (batchData.length > 0) {
      return await dbInstance
        .insert(options)
        .values(batchData)
        .onConflictDoUpdate({
          target: options.key,
          set: { value: sql`excluded.value` },
        })
        .run();
    }
    return { success: true };
  }
}
