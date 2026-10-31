import type { Hono } from "hono";
import type { Bindings } from "../../types";
import themeEditorRouter from "./router";
import { registerPluginMenu } from "../../registry/admin-menu";
import { isPluginActive } from "../index";

/**
 * 🔌 CMSMu Theme Editor & Canvas Visual Builder Plugin
 *
 * Mengelola Studio Visual Builder, SDUI serialization, dan manajemen tata letak tema.
 */
export default function registerThemeEditorPlugin(app: Hono<{ Bindings: Bindings }>) {
  // 1. Dynamic Gatekeeper: Periksa apakah plugin aktif sebelum memproses rute editor internal
  app.use("/api/theme-editor/*", async (c, next) => {
    const path = c.req.path;
    // SDUI publik dan locales tetap diizinkan agar mobile client & public reader tidak rusak
    if (path.startsWith("/api/theme-editor/sdui") || path === "/api/theme-editor/locales") {
      return await next();
    }

    const active = await isPluginActive(c.env.DB, "theme-editor-plugin");
    if (!active) {
      return c.json(
        {
          success: false,
          error: "Plugin 'theme-editor-plugin' is currently disabled in CMSMu settings.",
        },
        403
      );
    }
    return await next();
  });

  // 2. Mount API Routes
  app.route("/api/theme-editor", themeEditorRouter);

  // 3. Registrasi Menu Sidebar Appearance -> Theme Editor
  registerPluginMenu({
    group: "Appearance",
    title: "Theme Editor",
    view: "theme-editor",
    icon: "fas fa-laptop-code",
    role: ["admin", "superadmin"],
    pluginId: "theme-editor-plugin",
    actionCode: "window.location.href = '/theme-editor?slug=home';",
  });
}
