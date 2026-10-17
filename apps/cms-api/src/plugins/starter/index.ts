import type { Hono } from "hono";
import type { Bindings } from "../../types";
import {
  registerPluginMenu,
  registerPluginView,
} from "../../registry/admin-menu";
import { starterPluginRouter } from "./router";
import { starterPluginView } from "./view";

export default function registerStarterPlugin(app: Hono<{ Bindings: Bindings }>) {
  // 1. Mount API Router Plugin
  app.route("/api/plugins/starter", starterPluginRouter);

  // 2. Register Admin Menu (Muncul di Sidebar Dashboard Pengelola)
  registerPluginMenu({
    group: "Plugins",
    title: "Starter Plugin",
    view: "starter-plugin",
    icon: "fas fa-cube",
    role: ["superadmin", "admin"],
    pluginId: "starter-plugin",
  });

  // 3. Register Admin View (Tampilan SPA Alpine.js)
  registerPluginView("starter-plugin", starterPluginView);

  console.log("🔌 [Plugins] Starter Plugin registered successfully");
}
