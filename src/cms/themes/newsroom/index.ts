import type { ThemeContext, ThemeStructure } from '../types';
import { _layout } from './layout';
import { renderHome } from './home';
import { renderSingle } from './single';
import { renderCategory } from './category';
import { renderPage } from './page';
import { renderUserProfile } from './user-profile';
import { renderSourceList, renderSourceDetail } from './source';

const NewsroomTheme: ThemeStructure = {
  name: "Newsroom Editorial",
  version: '1.0.0',
  author: 'CMSMu & Redaksi Jejaring',
  _brand() {
    return `<span style="font-size:1.5rem;font-weight:900;color:var(--text-primary);letter-spacing:-0.03em;">NEWSROOM</span>`;
  },
  _layout,
  renderHome,
  renderSingle,
  renderCategory,
  renderPage,
  renderUserProfile,
  renderSourceList,
  renderSourceDetail,
  renderSearch(ctx: ThemeContext) {
    return this.renderCategory(ctx);
  },
  renderTag(ctx: ThemeContext) {
    return this.renderCategory(ctx);
  },
  render404(ctx: ThemeContext) {
    return this._layout(`
      <main class="nr-container nr-section" style="text-align:center; padding: 6rem 1rem;">
        <h1 style="font-size: 4rem; font-weight:900; color: var(--accent-primary); line-height: 1;">404</h1>
        <h2 style="font-size: 1.5rem; margin: 1rem 0;">Laporan Tidak Ditemukan</h2>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Halaman atau naskah berita yang Anda tuju telah dipindahkan atau tidak tersedia.</p>
        <a href="/" style="display:inline-block; background:var(--accent-primary); color:#fff; font-weight:700; padding:0.75rem 1.5rem; border-radius:8px;">
          &larr; Kembali ke Beranda
        </a>
      </main>
    `, 'Halaman Tidak Ditemukan', ctx, '404');
  }
};

export default NewsroomTheme;
