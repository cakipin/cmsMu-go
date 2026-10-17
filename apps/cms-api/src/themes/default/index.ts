import type { ThemeContext, ThemeStructure } from "../types";
import { _layout } from "./layout";
import { renderHome } from "./home";
import { renderSingle } from "./single";
import { renderPage } from "./page";
import { renderCategory } from "./category";
import { renderUserProfile } from "./user-profile";
import { escapeHtml } from "./utils";

const DefaultTheme: ThemeStructure = {
  name: "CMSMu Editorial (Default)",
  version: "1.0.0",
  author: "CMSMu Core Team",

  _brand(ctx?: any) {
    const siteTitle = escapeHtml(ctx?.site?.site_title || ctx?.site?.title || "CMSMu");
    const siteLogo = ctx?.site?.site_logo || ctx?.site?.logo;
    if (siteLogo) {
      return `<a href="/" style="display:inline-flex;align-items:center;text-decoration:none;"><img src="${escapeHtml(siteLogo)}" alt="${siteTitle}" style="max-height:44px;width:auto;object-fit:contain;" onerror="this.outerHTML='<span style=\\'font-weight:900;color:var(--accent-primary);font-size:22px;\\'>${siteTitle}</span>'" /></a>`;
    }
    return `<a href="/" style="font-weight:900;color:var(--accent-primary);font-size:22px;text-decoration:none;letter-spacing:-0.03em;">${siteTitle}</a>`;
  },

  _layout,
  renderHome,
  renderSingle,
  renderPage,
  renderCategory,
  renderUserProfile,

  renderSearch(ctx: ThemeContext) {
    return this.renderCategory(ctx);
  },

  renderTag(ctx: ThemeContext) {
    return this.renderCategory(ctx);
  },

  renderSingleVideo(ctx: ThemeContext) {
    return this.renderSingle(ctx);
  },

  render404(ctx: ThemeContext) {
    const content = `
    <div class="container" style="text-align: center; padding: 5rem 1rem;">
      <div style="font-size: 5rem; font-weight: 900; color: var(--accent-primary); line-height: 1; margin-bottom: 1rem;">404</div>
      <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.75rem;">Halaman Tidak Ditemukan</h1>
      <p style="font-size: 0.95rem; color: var(--text-secondary); max-width: 480px; margin: 0 auto 2rem;">
        Halaman atau artikel yang Anda cari tidak tersedia, telah dihapus, atau alamat tautan salah.
      </p>
      <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
        <a href="/" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: var(--accent-primary); color: #ffffff; border-radius: var(--radius-sm); font-weight: 700; font-size: 0.875rem;">
          <i class="fas fa-home"></i> Kembali ke Beranda
        </a>
      </div>
    </div>
    `;
    return this._layout(content, "404 Tidak Ditemukan", ctx, "404");
  },
};

export default DefaultTheme;
