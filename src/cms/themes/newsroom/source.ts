import type { ThemeContext } from '../types';
import { escapeHtml, getPostImage, getPostCategory, formatTimeAgo } from './utils';

/**
 * Render Halaman Katalog / Direktori Sumber Berita (/sumber)
 * Menampilkan seluruh jejaring media persyarikatan yang terdaftar beserta deskripsi singkat dan total liputan.
 */
export function renderSourceList(this: any, ctx: ThemeContext) {
  const sources = Array.isArray(ctx.data) ? ctx.data : [];

  const content = `
  <main class="nr-container nr-section">
    <!-- Header Halaman Sumber -->
    <div style="margin-bottom: 2.5rem; text-align: center; max-width: 760px; margin-left: auto; margin-right: auto;">
      <div style="display:inline-flex; align-items:center; gap:0.5rem; background:rgba(5,150,105,0.1); color:var(--accent-primary); padding:0.35rem 0.85rem; border-radius:9999px; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:1rem;">
        <i class="fas fa-network-wired"></i> Jejaring Sindikasi Media
      </div>
      <h1 style="font-size: 2.25rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.025em; margin-bottom: 0.75rem; line-height: 1.2;">
        Sumber Berita Persyarikatan
      </h1>
      <p style="font-size: 1rem; color: var(--text-secondary); line-height: 1.6;">
        Kompilasi dan kurasi karya jurnalistik dari portal berita resmi Muhammadiyah, 'Aisyiyah, dan ortom di berbagai daerah untuk kepentingan syiar dakwah persyarikatan.
      </p>
    </div>

    <!-- Grid Kartu Sumber Berita -->
    ${sources.length === 0 ? `
      <div style="text-align:center; padding: 4rem 1rem; color:var(--text-secondary); background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:12px;">
        <p>Belum ada sumber media yang terdaftar.</p>
      </div>
    ` : `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        ${sources.map((src: any) => {
          const domain = (src.base_url || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '');
          const favicon = domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64` : '/favicon.svg';
          const postCount = src.post_count || src.postCount || 0;
          const detailUrl = `/sumber/${escapeHtml(src.slug)}`;

          return `
          <div style="display: flex; flex-direction: column; justify-content: space-between; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.5rem; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div>
              <!-- Header Kartu: Favicon & Nama Media -->
              <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1rem;">
                <div style="width: 44px; height: 44px; border-radius: 10px; background: var(--bg-canvas); display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-subtle); flex-shrink: 0; overflow: hidden;">
                  <img src="${favicon}" alt="${escapeHtml(src.name)}" style="width: 24px; height: 24px; object-fit: contain;" onerror="this.src='/favicon.svg'">
                </div>
                <div style="min-width: 0;">
                  <h2 style="font-size: 1.125rem; font-weight: 700; color: var(--text-primary); margin: 0; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    <a href="${detailUrl}" style="color: inherit; text-decoration: none;">${escapeHtml(src.name)}</a>
                  </h2>
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
                    ${src.region_code ? `
                      <span style="display: inline-block; font-size: 0.65rem; font-weight: 600; text-transform: uppercase; background: var(--bg-canvas); color: var(--text-muted); padding: 0.15rem 0.45rem; border-radius: 4px; border: 1px solid var(--border-subtle);">
                        ${escapeHtml(src.region_code)}
                      </span>
                    ` : ''}
                    <span style="font-size: 0.75rem; color: var(--text-muted);">
                      ${domain}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Deskripsi Singkat Media Sumber -->
              <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.55; margin-bottom: 1.25rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                ${escapeHtml(src.description || 'Media informasi dan publikasi jejaring persyarikatan.')}
              </p>
            </div>

            <!-- Footer Kartu: Jumlah Berita & Tombol Akses -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 1rem; margin-top: auto;">
              <span style="font-size: 0.8125rem; font-weight: 600; color: var(--text-muted);">
                <i class="far fa-newspaper" style="margin-right: 0.35rem;"></i>${postCount} liputan
              </span>
              <a href="${detailUrl}" style="display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.8125rem; font-weight: 700; color: var(--accent-primary); text-decoration: none; padding: 0.4rem 0.85rem; border-radius: 6px; background: rgba(5,150,105,0.08); transition: background 0.15s;">
                Lihat Berita <i class="fas fa-arrow-right" style="font-size: 0.75rem;"></i>
              </a>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    `}
  </main>
  `;

  return this._layout(content, 'Jejaring Sumber Berita', ctx, 'sources');
}

/**
 * Render Halaman Detail & Arsip Berita per Sumber (/sumber/:slug)
 * Menampilkan profil header sumber berita (nama, favicon, deskripsi, link situs resmi)
 * diikuti dengan daftar berita yang disadur dari sumber ini.
 */
export function renderSourceDetail(this: any, ctx: ThemeContext) {
  const source = ctx.pageData?.source || {};
  const posts = Array.isArray(ctx.data) ? ctx.data : [];
  const domain = (source.base_url || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '');
  const favicon = domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64` : '/favicon.svg';

  const content = `
  <main class="nr-container nr-section">
    <!-- Breadcrumb Navigasi -->
    <nav style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1.5rem;">
      <a href="/" style="color: var(--text-secondary); text-decoration: none;">Beranda</a>
      <span>/</span>
      <a href="/sumber" style="color: var(--text-secondary); text-decoration: none;">Sumber Berita</a>
      <span>/</span>
      <span style="color: var(--text-primary); font-weight: 600;">${escapeHtml(source.name || 'Detail Sumber')}</span>
    </nav>

    <!-- Banner Profil Sumber Berita -->
    <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 2rem; margin-bottom: 2.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="display: flex; flex-direction: column; md:flex-row; align-items: flex-start; gap: 1.5rem;">
        <div style="display: flex; gap: 1.25rem; align-items: center; flex: 1;">
          <div style="width: 64px; height: 64px; border-radius: 12px; background: var(--bg-canvas); display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-strong); flex-shrink: 0; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.06);">
            <img src="${favicon}" alt="${escapeHtml(source.name)}" style="width: 36px; height: 36px; object-fit: contain;" onerror="this.src='/favicon.svg'">
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.35rem;">
              <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin: 0; line-height: 1.2;">
                ${escapeHtml(source.name || 'Sumber Media')}
              </h1>
              ${source.region_code ? `
                <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; background: rgba(5,150,105,0.1); color: var(--accent-primary); padding: 0.2rem 0.55rem; border-radius: 6px;">
                  ${escapeHtml(source.region_code)}
                </span>
              ` : ''}
            </div>
            <p style="font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.5; margin: 0 0 0.5rem 0; max-width: 680px;">
              ${escapeHtml(source.description || 'Karya jurnalistik dan informasi yang disadur dari sumber resmi persyarikatan.')}
            </p>
            <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; font-size: 0.8125rem;">
              ${source.base_url ? `
                <a href="${escapeHtml(source.base_url)}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-primary); text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 0.35rem;">
                  <i class="fas fa-external-link-alt" style="font-size: 0.75rem;"></i> Kunjungi Situs Resmi (${domain})
                </a>
              ` : ''}
              <span style="color: var(--text-muted);">&bull;</span>
              <span style="color: var(--text-muted); font-weight: 600;">
                <i class="far fa-newspaper" style="margin-right: 0.25rem;"></i> ${posts.length} Berita Dihimpun
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Title -->
    <div class="nr-section-header" style="margin-bottom: 1.5rem;">
      <h2 class="nr-section-title" style="font-size: 1.25rem;">Arsip Berita dari ${escapeHtml(source.name)}</h2>
      <span style="font-size: 0.875rem; color: var(--text-muted);">${posts.length} artikel</span>
    </div>

    <!-- Grid Berita dari Sumber Ini -->
    ${posts.length === 0 ? `
      <div style="text-align:center; padding: 4rem 1rem; color:var(--text-secondary); background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:12px;">
        <p>Belum ada naskah berita yang dihimpun dari sumber ini.</p>
        <a href="/sumber" style="display:inline-block; margin-top:1rem; color:var(--accent-primary); font-weight:600; text-decoration:underline;">
          &larr; Lihat Semua Sumber Berita
        </a>
      </div>
    ` : `
      <div class="nr-grid-cards">
        ${posts.map((p: any, idx: number) => `
          <article class="nr-card-standard">
            <a href="/${escapeHtml(p.slug)}" class="nr-card-thumb">
              <img src="${getPostImage(p, idx)}" alt="${escapeHtml(p.title)}" loading="lazy">
            </a>
            <div class="nr-card-body">
              <span class="nr-category-badge">${escapeHtml(getPostCategory(p))}</span>
              <h3 class="nr-card-title">
                <a href="/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a>
              </h3>
              <div class="nr-meta">
                <span>${escapeHtml(p.author || source.name || 'Redaksi')}</span>
                <span>&bull;</span>
                <span>${formatTimeAgo(p.created_at)}</span>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    `}
  </main>
  `;

  return this._layout(content, `Berita dari ${source.name || 'Sumber'}`, ctx, 'source-detail');
}
