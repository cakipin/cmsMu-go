import { Hono } from "hono";
import type { Bindings } from "../types";
import {
  registerPluginMenu,
  registerPluginView,
  registerPluginScript,
} from "../registry/admin-menu";
import { otaRouter } from "./ota/router";
import { otaView } from "./ota/view";
import { otaManagerScript } from "./ota/view.client";

export default function registerAddons(app: Hono<{ Bindings: Bindings }>) {
  // 1. Mount API Routes
  app.route("/api/addons/ota", otaRouter);

  // 2. Register Admin Menus & Views
  registerPluginMenu({
    group: "Plugins",
    title: "OTA Manager",
    view: "ota",
    icon: "fas fa-cloud-upload-alt",
    role: ["superadmin", "admin"],
    pluginId: "ota",
  });
  registerPluginView("ota", otaView);
  registerPluginScript(otaManagerScript);

  console.log("🔌 Addons (OTA Manager) registered successfully");
}

