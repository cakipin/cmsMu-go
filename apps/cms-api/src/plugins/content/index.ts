import type { Hono } from "hono";
import type { Bindings } from "../../types";
import { registerPluginMenu } from "../../registry/admin-menu";
import { isPluginActive } from "../index";
import {
  postsRouter,
  pagesRouter,
  mediaRouter,
  commentsRouter,
  publicRouter,
} from "./router";

/**
 * 📰 CMS Content & Public Website Engine Plugin
 * 
 * Mengelola penerbitan berita, artikel, halaman statis, galeri media, komentar,
 * serta seluruh rendering website publik dan tema.
 *
 * Dapat diaktifkan / dinonaktifkan secara dinamis. Saat dinonaktifkan, CMSMu
 * bertransformasi menjadi Universal Headless API / ERP Platform murni.
 */
export default function registerContentPlugin(app: Hono<{ Bindings: Bindings }>) {
  // 1. Gatekeeper Middleware untuk seluruh route konten API
  const contentPaths = [
    "/api/posts",
    "/api/pages",
    "/api/media",
    "/api/comments",
  ];

  for (const pathPrefix of contentPaths) {
    app.use(`${pathPrefix}/*`, async (c, next) => {
      const active = await isPluginActive(c.env.DB, "content-plugin");
      if (!active) {
        return c.json(
          {
            success: false,
            error: "Plugin 'content-plugin' is currently disabled in CMSMu settings.",
          },
          403
        );
      }
      return await next();
    });
  }

  // 2. Mount API Routers
  app.route("/api/posts", postsRouter);
  app.route("/api/pages", pagesRouter);
  app.route("/api/media", mediaRouter);
  app.route("/api/comments", commentsRouter);

  // 3. Register Admin Menus (Otomatis tampil/sembunyi berdasarkan status aktif plugin)
  // Grup: Content
  registerPluginMenu({
    group: "Content",
    title: "All Posts",
    view: "posts",
    icon: "fas fa-thumbtack",
    role: ["admin", "editor", "author"],
    pluginId: "content-plugin",
  });
  registerPluginMenu({
    group: "Content",
    title: "Add Post",
    view: "add",
    icon: "fas fa-plus-circle",
    role: ["admin", "editor", "author"],
    pluginId: "content-plugin",
  });
  registerPluginMenu({
    group: "Content",
    title: "Pages",
    view: "pages",
    icon: "fas fa-copy",
    role: ["admin", "editor"],
    pluginId: "content-plugin",
  });
  registerPluginMenu({
    group: "Content",
    title: "Add Page",
    view: "add-page",
    icon: "fas fa-plus-square",
    role: ["admin", "editor"],
    pluginId: "content-plugin",
  });
  registerPluginMenu({
    group: "Content",
    title: "Media",
    view: "media",
    icon: "fas fa-photo-video",
    role: ["admin", "editor", "author"],
    pluginId: "content-plugin",
  });
  registerPluginMenu({
    group: "Content",
    title: "Komentar",
    view: "comments",
    icon: "fas fa-comments",
    role: ["admin", "editor"],
    pluginId: "content-plugin",
  });

  // Grup: Appearance (Terkait Website & Tema)
  registerPluginMenu({
    group: "Appearance",
    title: "Themes",
    view: "themes",
    icon: "fas fa-paint-brush",
    role: ["admin", "editor"],
    pluginId: "content-plugin",
  });
  registerPluginMenu({
    group: "Appearance",
    title: "Menus",
    view: "menus",
    icon: "fas fa-bars",
    role: ["admin", "editor"],
    pluginId: "content-plugin",
  });

  // 4. Mount Public Web Router dengan Gatekeeper Fallback
  app.use("*", async (c, next) => {
    const path = c.req.path;
    // Kecualikan rute internal platform
    if (
      path.startsWith("/api") ||
      path.startsWith("/admin") ||
      path.startsWith("/login") ||
      path.startsWith("/sys") ||
      path.startsWith("/media") ||
      path.startsWith("/uploads") ||
      path === "/health"
    ) {
      return await next();
    }

    const active = await isPluginActive(c.env.DB, "content-plugin");
    if (!active) {
      // Jika content-plugin OFF: alihkan ke portal admin platform
      return c.redirect("/admin");
    }

    return await next();
  });

  app.route("/", publicRouter);

  console.log("🔌 [Plugins] Content & Public Web Plugin registered successfully");
}
