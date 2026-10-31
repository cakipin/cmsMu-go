import type { Hono } from "hono";
import type { Bindings } from "../types";
import { pluginModules, availablePlugins } from "./registry.generated";
import { getDb, plugins as pluginsTable } from "@cmsmu/db";

export { availablePlugins, pluginModules };

let memoryPluginActiveCache: { map: Record<string, boolean>; expiry: number } | null = null;
const PLUGIN_CACHE_TTL_MS = 60 * 1000;

export function invalidatePluginCache() {
  memoryPluginActiveCache = null;
}

export async function isPluginActive(dbBinding: any, pluginId: string): Promise<boolean> {
  if (!pluginId) return true;
  const now = Date.now();

  if (memoryPluginActiveCache && memoryPluginActiveCache.expiry > now) {
    if (pluginId in memoryPluginActiveCache.map) {
      return memoryPluginActiveCache.map[pluginId];
    }
  }

  try {
    const db = getDb(dbBinding);
    const rows = await db
      .select({ id: pluginsTable.id, active: pluginsTable.active })
      .from(pluginsTable);

    const map: Record<string, boolean> = {};
    for (const r of rows || []) {
      if (r.id) {
        map[r.id] = Number(r.active) === 1;
      }
    }

    memoryPluginActiveCache = { map, expiry: now + PLUGIN_CACHE_TTL_MS };
    return map[pluginId] ?? true;
  } catch (err) {
    return true; // fail-open in case of error to prevent blocking core
  }
}

/**
 * 🔌 CMSMu Dynamic Plugin Engine
 *
 * Seluruh plugin di folder `apps/cms-api/src/plugins/` otomatis terdeteksi saat build/dev
 * via scripts/generate-registries.mjs dan dimuat secara dinamis.
 */
export default function registerCustomPlugins(app: Hono<{ Bindings: Bindings }>) {
  // 1. Dynamic Gatekeeper Middleware untuk route plugin dengan prefix /api/plugins/:pluginId
  app.use("/api/plugins/:pluginId/*", async (c, next) => {
    const rawId = c.req.param("pluginId");
    // Normalize: e.g. "starter" -> match "starter-plugin" or "starter"
    const matchedEntry = pluginModules.find(
      p => p.id === rawId || p.dir === rawId || p.id === `${rawId}-plugin`
    );
    const targetPluginId = matchedEntry ? matchedEntry.id : rawId;

    const active = await isPluginActive(c.env.DB, targetPluginId);
    if (!active) {
      return c.json(
        {
          success: false,
          error: `Plugin '${targetPluginId}' is currently disabled in CMSMu settings.`,
        },
        403
      );
    }

    return await next();
  });

  // 2. Auto-mount all discovered plugin modules (termasuk registerByocDeployer pada Control Plane)
  for (const entry of pluginModules) {
    try {
      entry.register(app);
      console.log(`🔌 [Plugins] Auto-mounted plugin: ${entry.meta.name} (${entry.id})`);
    } catch (err: any) {
      console.error(`❌ [Plugins] Failed to mount plugin "${entry.id}":`, err?.message || err);
    }
  }
}
