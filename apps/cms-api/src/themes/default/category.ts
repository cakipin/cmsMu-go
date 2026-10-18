import type { ThemeContext } from "../types";
import { _layout } from "./layout";
import { escapeHtml, formatDate, getImage, getCategory, getExcerpt } from "./utils";

export function renderCategory(ctx: ThemeContext): string {
  const posts = Array.isArray(ctx?.posts)
    ? ctx.posts
    : Array.isArray(ctx?.data)
    ? ctx.data
    : [];

  const rawPag = (ctx?.pagination || {}) as any;
  const pagination = {
    page: rawPag.currentPage || rawPag.page || 1,
    totalPages: rawPag.totalPages || 1,
    total: rawPag.totalItems ?? rawPag.total ?? posts.length,
  };

  let pageTitle = "Arsip Berita";
  let pageHeading = "Koleksi Berita & Artikel";
  let pageSubtitle = "Daftar tulisan dan publikasi terkini.";

  if (ctx?.query) {
    pageTitle = `Pencarian: ${escapeHtml(ctx.query)}`;
    pageHeading = `Hasil Pencarian: "${escapeHtml(ctx.query)}"`;
    pageSubtitle = `Ditemukan ${pagination.total || posts.length} artikel yang relevan.`;
  } else if ((ctx as any)?.tag) {
    const tagStr = escapeHtml((ctx as any).tag);
    pageTitle = `Topik: #${tagStr}`;
    pageHeading = `Topik: #${tagStr}`;
    pageSubtitle = `Menampilkan seluruh tulisan dengan topik #${tagStr}.`;
  } else if (ctx?.categoryName) {
    pageTitle = `Kategori: ${escapeHtml(ctx.categoryName)}`;
    pageHeading = `Kategori: ${escapeHtml(ctx.categoryName)}`;
    pageSubtitle = `Menampilkan seluruh tulisan dalam rubrik ${escapeHtml(ctx.categoryName)}.`;
  } else if (ctx?.subType === "tag" && ctx?.currentSlug) {
    pageTitle = `Topik: #${escapeHtml(ctx.currentSlug)}`;
    pageHeading = `Topik: #${escapeHtml(ctx.currentSlug)}`;
    pageSubtitle = `Menampilkan seluruh tulisan dengan tag #${escapeHtml(ctx.currentSlug)}.`;
  }

  const contentHtml = `
  <div class="container">
    
    <!-- HEADER ARSIP -->
    <header style="margin-bottom: 2.5rem; border-bottom: 2px solid var(--border-subtle); padding-bottom: 1.5rem;">
      <nav style="display:flex; align-items:center; gap:0.5rem; font-size:0.8125rem; color:var(--text-muted); margin-bottom:0.75rem;">
        <a href="/" style="color:var(--text-secondary);"><i class="fas fa-home"></i> Beranda</a>
        <span>/</span>
        <span style="color:var(--accent-primary); font-weight:600;">${pageTitle}</span>
      </nav>
      <h1 style="font-size: clamp(1.5rem, 3vw, 2.25rem); font-weight: 900; color: var(--text-primary); margin-bottom: 0.5rem;">
        ${pageHeading}
      </h1>
      <p style="font-size: 0.95rem; color: var(--text-secondary);">
        ${pageSubtitle}
      </p>
    </header>

    ${
      posts.length === 0
        ? `
      <div style="padding: 4rem 1.5rem; text-align: center; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); max-width: 600px; margin: 0 auto;">
        <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1.25rem;"></i>
        <h2 style="font-size: 1.25rem; color: var(--text-primary); margin-bottom: 0.5rem;">Tidak Ada Artikel Ditemukan</h2>
        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
          Tidak ada konten yang cocok dengan kriteria pencarian atau kategori ini.
        </p>
        <a href="/" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.25rem; background: var(--accent-primary); color: #ffffff; border-radius: var(--radius-sm); font-weight: 700; font-size: 0.875rem;">
          <i class="fas fa-arrow-left"></i> Kembali ke Beranda
        </a>
      </div>
      `
        : `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
        ${posts
          .map(
            (p: any, idx: number) => `
          <article class="post-card">
            <a href="/${escapeHtml(p.slug)}" style="overflow:hidden;">
              <img src="${getImage(p, idx)}" alt="${escapeHtml(p.title)}" class="post-card-thumb" loading="lazy">
            </a>
            <div class="post-card-body">
              <span class="badge">${getCategory(p)}</span>
              <a href="/${escapeHtml(p.slug)}">
                <h3 class="post-card-title">${escapeHtml(p.title)}</h3>
              </a>
              <p class="post-card-excerpt">${getExcerpt(p.excerpt || p.content, 110)}</p>
              <div class="post-card-meta">
                <span class="meta-author-date">
                  <i class="far fa-user"></i> ${escapeHtml(p.author || "Redaksi")}
                </span>
                <span class="meta-author-date">
                  <i class="far fa-calendar-alt"></i> ${formatDate(p.createdAt || p.created_at)}
                </span>
              </div>
            </div>
          </article>
        `
          )
          .join("")}
      </div>

      <!-- PAGINATION -->
      ${
        pagination.totalPages > 1
          ? `
      <div style="display:flex; justify-content:center; align-items:center; gap:0.5rem; margin-top:3rem;">
        ${
          pagination.page > 1
            ? `<a href="?page=${pagination.page - 1}${ctx?.query ? `&q=${encodeURIComponent(ctx.query)}` : ""}" style="padding:0.5rem 1rem; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); font-size:0.875rem; font-weight:600;"><i class="fas fa-chevron-left"></i> Sebelumnya</a>`
            : ""
        }
        <span style="padding:0.5rem 1rem; background:var(--accent-subtle); color:var(--accent-primary); border-radius:var(--radius-sm); font-size:0.875rem; font-weight:700;">
          ${pagination.page} / ${pagination.totalPages}
        </span>
        ${
          pagination.page < pagination.totalPages
            ? `<a href="?page=${pagination.page + 1}${ctx?.query ? `&q=${encodeURIComponent(ctx.query)}` : ""}" style="padding:0.5rem 1rem; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); font-size:0.875rem; font-weight:600;">Selanjutnya <i class="fas fa-chevron-right"></i></a>`
            : ""
        }
      </div>
      `
          : ""
      }
      `
    }

  </div>
  `;

  return _layout(contentHtml, pageTitle, ctx, "category");
}
