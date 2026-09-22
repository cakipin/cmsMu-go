import type { ThemeContext } from '../types';
import { escapeHtml, date, category as getCategory, image, cleanExcerpt, renderNumberedPagination } from './utils';

export function renderTag(this: any, ctx: ThemeContext) {
    const cx = ctx as any;
    const posts = Array.isArray(cx.data) ? cx.data : [];
    const tagName = (cx.tag || cx.categoryName || 'Tagar').replace(/^#/, '').trim();
    const tagSlug = (cx.slug || tagName).toLowerCase().replace(/\s+/g, '-');
    const pagination = cx.pagination || {};
    const totalItems = pagination.totalItems ?? posts.length;
    const pageTitle = `Tagar #${tagName}`;

    let content = `
      <main class="container" role="main">
        <div class="section-block" style="margin-top: 24px; margin-bottom: 40px;">
          <!-- Tag Header Box -->
          <div class="tag-header-box">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: #047857; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 800; box-shadow: 0 4px 10px rgba(4,120,87,0.2);">
                #
              </div>
              <div>
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #059669; letter-spacing: 0.5px;">
                  Topik / Tagar
                </div>
                <h1 class="tag-title">
                  #${escapeHtml(tagName)}
                </h1>
              </div>
            </div>
            <div class="tag-count-badge">
              ${totalItems} Artikel Ditemukan
            </div>
          </div>

          <!-- Tag Posts List -->
          ${!posts.length ? `
            <div class="empty search-empty-box">
              <div style="font-size: 40px; color: #94a3b8; margin-bottom: 12px;">#</div>
              <h3 style="font-size: 18px; margin-bottom: 8px;">
                Belum ada artikel dengan tagar #${escapeHtml(tagName)}
              </h3>
              <p style="font-size: 14px; max-width: 480px; margin: 0 auto; opacity: 0.85;">
                Artikel dengan tagar ini belum tersedia atau telah dipindahkan.
              </p>
            </div>
          ` : `
            <div class="card-grid">
              ${posts.map((p: any, i: number) => {
                const isVideo = p.type === 'video' || (p.video_url && String(p.video_url).trim() !== '');
                const catName = getCategory(p);
                const catSlug = catName.toLowerCase().replace(/\s+/g, '-');
                return `
                <div class="grid-post">
                  <a href="/${escapeHtml(p.slug)}" class="post-img-wrap" style="position: relative;">
                    <img src="${image(p, i)}" alt="${escapeHtml(p.title)}" loading="lazy">
                    ${isVideo ? `
                      <span style="position: absolute; bottom: 8px; right: 8px; background: #dc2626; color: #ffffff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> VIDEO
                      </span>
                    ` : ''}
                  </a>
                  <div class="grid-post-content">
                    <div style="margin-bottom: 6px;">
                      <a href="/${catSlug}" class="cat-tag" style="font-size: 11px; padding: 2px 8px; text-decoration: none;">${catName}</a>
                    </div>
                    <h4><a href="/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a></h4>
                    ${(() => {
                      const snippet = cleanExcerpt(p.excerpt || p.body, 140);
                      return snippet ? `
                        <p style="font-size: 13px; margin: 6px 0 10px 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; opacity: 0.85;">
                          ${escapeHtml(snippet)}
                        </p>
                      ` : '';
                    })()}
                    <div class="post-meta"><span>${date(p.created_at)}</span></div>
                  </div>
                </div>
                `;
              }).join('')}
            </div>
          `}

          <!-- Numbered Pagination -->
          ${renderNumberedPagination({ ...pagination, baseUrl: pagination.baseUrl || '/tag/' + encodeURIComponent(tagSlug) })}
        </div>
      </main>
    `;

    return this._layout(content, pageTitle, ctx);
}
