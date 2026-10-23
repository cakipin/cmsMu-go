import type { Hono } from "hono";
import type { Bindings } from "../../types";
import { registerPluginMenu, registerPluginView } from "../../registry/admin-menu";
import { telemetryRouter } from "./telemetry.router";
import { monitoringRouter } from "./monitoring.router";
import { deployerRouter } from "./deployer.router";
import { registerInstanceTelemetry } from "./instance-telemetry.middleware";
import { byocDeployerView } from "./view-deployer";
import { byocMonitoringView } from "./view-monitoring";

/**
 * 🚀 CMSMu BYOC Cloudflare Deployer & Monitoring Plugin
 *
 * Mendaftarkan:
 * - /api/telemetry   : Ingestion log aktivitas dan heartbeat dari website pengguna
 * - /api/monitoring  : Query log dan ringkasan overview untuk dasbor cms.labmu.dev
 * - /api/deployer    : Verifikasi Cloudflare token dan listing proyek
 * - Telemetry Middleware: Pengiriman event aktivitas non-blocking dari instance
 * - Admin Menu & UI : Wizard Deployer 4 Langkah & Centralized Activity Log Viewer
 */
export default function registerByocDeployer(app: Hono<{ Bindings: Bindings }>) {
  // 1. Mount API Routers
  app.route("/api/telemetry", telemetryRouter);
  app.route("/api/monitoring", monitoringRouter);
  app.route("/api/deployer", deployerRouter);

  // 2. Pasang Instance Telemetry Middleware (Non-blocking emitter)
  registerInstanceTelemetry(app);

  // 3. Daftarkan Menu Sidebar Admin
  registerPluginMenu({
    group: "Cloudflare BYOC",
    title: "1-Click Deployer",
    view: "byoc-deployer",
    icon: "fas fa-cloud-upload-alt",
    role: ["superadmin", "admin", "editor", "author", "subscriber", "user"],
    pluginId: "byoc-deployer",
  });

  registerPluginMenu({
    group: "Cloudflare BYOC",
    title: "Activity Monitoring",
    view: "byoc-monitoring",
    icon: "fas fa-satellite-dish",
    role: ["superadmin", "admin"],
    pluginId: "byoc-deployer",
  });

  // 4. Daftarkan Tampilan SPA Alpine.js
  registerPluginView("byoc-deployer", byocDeployerView);
  registerPluginView("byoc-monitoring", byocMonitoringView);

  console.log("☁️ [Plugins] BYOC Cloudflare Deployer & Centralized Monitoring registered successfully");
}
