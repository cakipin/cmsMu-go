import type { ThemeContext, ThemeStructure } from "../types";
import { _layout } from "./layout";
import { renderHome } from "./home";
import { renderSingle } from "./single";
import { renderCategory } from "./category";

const StarterTheme: ThemeStructure = {
  name: "Starter Theme Boilerplate",
  version: "1.0.0",
  author: "CMSMu Core Team",

  _brand(ctx?: any) {
    const siteTitle = ctx?.site?.site_title || ctx?.site?.title || "Aplikasi CMSMu";
    return `<a href="/" style="font-weight:800;color:var(--primary);font-size:22px;text-decoration:none;">${siteTitle}</a>`;
  },

  _layout,
  renderHome,
  renderSingle,
  renderCategory,

  renderPage(ctx: ThemeContext) {
    return this.renderSingle(ctx);
  },

  renderSearch(ctx: ThemeContext) {
    return this.renderCategory(ctx);
  },

  renderTag(ctx: ThemeContext) {
    return this.renderCategory(ctx);
  },

  render404(ctx: ThemeContext) {
    return this._layout(
      `<div class="container" style="text-align:center; padding: 4rem 1rem;">
        <h1 style="font-size: 3rem; font-weight:800; margin-bottom: 1rem;">404</h1>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">Halaman tidak ditemukan.</p>
        <a href="/" style="color: var(--primary); text-decoration: none; font-weight: 600;">&larr; Kembali ke Beranda</a>
      </div>`,
      "404 Tidak Ditemukan",
      ctx,
      "404"
    );
  },
};

export default StarterTheme;
