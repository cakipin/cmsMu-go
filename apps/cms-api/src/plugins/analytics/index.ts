import type { Hono } from "hono";
import type { Bindings } from "../../types";
import {
  registerPluginMenu,
  registerPluginView,
} from "../../registry/admin-menu";
import { isPluginActive } from "../index";
import statsRouter from "../../modules/stats/stats.router";
import { analyticsDashboardView } from "./view";

/**
 * 📊 Analytics & Traffic Intelligence Plugin
 * 
 * Mengelola metrik pengunjung, Cloudflare GraphQL analytics, dan agregasi histori statistik harian.
 * Dapat diaktifkan / dinonaktifkan secara dinamis tanpa restart worker.
 */
export default function registerAnalyticsPlugin(app: Hono<{ Bindings: Bindings }>) {
  // 1. Gatekeeper Middleware untuk seluruh route /api/stats/*
  app.use("/api/stats/*", async (c, next) => {
    const active = await isPluginActive(c.env.DB, "analytics-plugin");
    if (!active) {
      return c.json(
        {
          success: false,
          error: "Plugin 'analytics-plugin' is currently disabled in CMSMu settings.",
        },
        403
      );
    }
    return await next();
  });

  // 2. Mount API Router ke /api/stats
  app.route("/api/stats", statsRouter);

  // 3. Register Admin Menu (Muncul di Sidebar Dashboard jika plugin aktif)
  registerPluginMenu({
    group: "System",
    title: "Analytics",
    view: "analytics-dash",
    icon: "fas fa-chart-line",
    role: ["admin", "superadmin"],
    pluginId: "analytics-plugin",
  });

  // 4. Register Admin View (Tampilan SPA Alpine.js)
  registerPluginView("analytics-dash", analyticsDashboardView);

  console.log("🔌 [Plugins] Analytics Plugin registered successfully");
}
