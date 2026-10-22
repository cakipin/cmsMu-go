import { drizzle } from "drizzle-orm/d1";
import * as baseSchema from "./schema";
import * as i18nSchema from "./schema-i18n";
import type { D1Database } from "@cloudflare/workers-types";

const combinedSchema = { ...baseSchema, ...i18nSchema };

export function getDb(d1: D1Database) {
  return drizzle(d1, { schema: combinedSchema });
}

export * from "./schema";
export * from "./schema-i18n";
export * from "./migration-runner";
export * from "./init";

