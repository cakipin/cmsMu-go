import type { ThemeContext } from '../types';
import { escapeHtml, getPostImage, getPostCategory, formatTimeAgo, extractSourceInfo, estimateReadTime, renderPaginationBar } from './utils';

export function renderCategory(this: any, ctx: ThemeContext) {
  const posts = Array.isArray(ctx.data) ? ctx.data : [];
  const catName = ctx.categoryName || 'Berita';
  const pagination = ctx.pagination || null;
  const totalCount = pagination?.totalItems || posts.length;

  const content = `
  <main class="nr-container nr-section">
    <div class="nr-section-header">
      <div>
        <h1 class="nr-section-title">Kanal: ${escapeHtml(catName)}</h1>
        <p style="font-size:0.8125rem; color:var(--text-secondary); margin-top:0.25rem;">
          Arsip liputan dan kabar terverifikasi jejaring persyarikatan
        </p>
      </div>
      <span style="font-size:0.875rem; color:var(--text-muted); font-weight:600;">${totalCount} artikel</span>
    </div>

    ${posts.length === 0 ? `
      <div style="text-align:center; padding: 4rem 1rem; color:var(--text-secondary); background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:12px;">
        <p>Belum ada liputan di kanal ini.</p>
        <a href="/" style="display:inline-block; margin-top:1rem; color:var(--accent-primary); font-weight:600;">&larr; Kembali ke Beranda</a>
      </div>
    ` : `
      <div class="nr-grid-cards">
        ${posts.map((p: any, idx: number) => {
          const src = extractSourceInfo(p, ctx.site?.title || 'Redaksi', ctx.sources || []);
          const readMin = estimateReadTime(p.body || p.excerpt || '');
          return `
          <article class="nr-card-standard">
            <a href="/${escapeHtml(p.slug)}" class="nr-card-thumb">
              <img src="${getPostImage(p, idx)}" alt="${escapeHtml(p.title)}" loading="lazy">
            </a>
            <div class="nr-card-body">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem;">
                <span class="nr-category-badge">${escapeHtml(getPostCategory(p))}</span>
                <span style="font-size:0.625rem; color:var(--text-muted); font-weight:600;">${readMin} mnt baca</span>
              </div>
              <h2 class="nr-card-title">
                <a href="/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a>
              </h2>
              <div class="nr-card-footer">
                ${src.slug ? `
                  <a href="${src.internalUrl}" class="nr-source-chip" style="padding:1px 6px; font-size:0.625rem;" title="${escapeHtml(src.name)}">
                    <img src="${src.favicon}" width="12" height="12" alt="${escapeHtml(src.name)}" onerror="this.style.display='none'">
                    <span>${escapeHtml(src.name)}</span>
                  </a>
                ` : `<span><i class="far fa-user"></i> ${escapeHtml(p.author || 'Redaksi')}</span>`}
                <span><i class="far fa-clock"></i> ${formatTimeAgo(p.created_at)}</span>
              </div>
            </div>
          </article>
          `;
        }).join('')}
      </div>
      <!-- Pagination Navigasi Halaman -->
      ${renderPaginationBar(pagination)}
    `}
  </main>
  `;

  return this._layout(content, `Kanal ${catName}`, ctx, 'category');
}

