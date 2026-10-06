import type { ThemeContext } from "../types";
import {
  escapeHtml,
  date,
  category as getCategory,
  image,
  cleanExcerpt,
  renderNumberedPagination,
} from "./utils";

export function renderSearch(this: any, ctx: ThemeContext) {
  const cx = ctx as any;
  const posts = Array.isArray(cx.data) ? cx.data : [];
  const query = (cx.query || "").trim();
  const pagination = cx.pagination || {};
  const totalItems = pagination.totalItems ?? posts.length;
  const pageTitle = query ? `Pencarian: "${query}"` : "Pencarian Artikel";

  let content = `
      <main class="container" role="main">
        <div class="section-block" style="margin-top: 24px; margin-bottom: 40px;">
          <!-- Search Header Box -->
          <div class="search-header-box">
            <h2 class="search-title">
              <span style="display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; background:#047857; color:#ffffff; border-radius:8px; font-size:18px;">&#128269;</span>
              Pencarian Artikel & Berita
            </h2>
            <form method="GET" action="/search" style="display: flex; gap: 8px; max-width: 720px; flex-wrap: wrap;">
              <input 
                type="text" 
                name="q" 
                class="search-input"
                value="${escapeHtml(query)}" 
                placeholder="Ketik kata kunci artikel, topik, atau penulis..." 
                autofocus
              >
              <button 
                type="submit" 
                style="background: #047857; color: #ffffff; border: none; padding: 12px 24px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: background 0.2s;"
                onmouseover="this.style.background='#065f46'"
                onmouseout="this.style.background='#047857'"
              >
                <span>Cari</span>
              </button>
            </form>

            ${
              query
                ? `
              <div class="search-meta-info">
                Ditemukan <strong style="color: #047857;">${totalItems}</strong> artikel untuk kata kunci: <span class="search-keyword-badge" style="padding: 2px 8px; border-radius: 4px; font-weight: 600;">"${escapeHtml(query)}"</span>
              </div>
            `
                : `
              <div class="search-meta-info" style="font-size: 13px;">
                Silakan ketik kata kunci pada kotak di atas untuk menemukan berita, opini, kajian, atau video.
              </div>
            `
            }
          </div>

          <!-- Search Results List -->
          ${
            !posts.length
              ? `
            <div class="empty search-empty-box">
              <div style="font-size: 40px; color: #94a3b8; margin-bottom: 12px;">&#128269;</div>
              <h3 style="font-size: 18px; margin-bottom: 8px;">
                ${query ? `Tidak ada artikel yang cocok dengan kata kunci "${escapeHtml(query)}"` : "Belum ada kata kunci pencarian"}
              </h3>
              <p style="font-size: 14px; max-width: 480px; margin: 0 auto; opacity: 0.85;">
                ${
                  query
                    ? "Pastikan semua kata dieja dengan benar, atau coba gunakan kata kunci lain yang lebih umum."
                    : "Gunakan kolom pencarian di atas untuk mulai mencari artikel terkini dari Suara 'Aisyiyah."
                }
              </p>
            </div>
          `
              : `
            <div class="card-grid">
              ${posts
                .map((p: any, i: number) => {
                  const isVideo =
                    p.type === "video" ||
                    (p.video_url && String(p.video_url).trim() !== "");
                  const catName = getCategory(p);
                  const catSlug = catName.toLowerCase().replace(/\s+/g, "-");
                  return `
                <div class="grid-post">
                  <a href="/${escapeHtml(p.slug)}" class="post-img-wrap" style="position: relative;">
                    <img src="${image(p, i)}" alt="${escapeHtml(p.title)}" loading="lazy">
                    ${
                      isVideo
                        ? `
                      <span style="position: absolute; bottom: 8px; right: 8px; background: #dc2626; color: #ffffff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> VIDEO
                      </span>
                    `
                        : ""
                    }
                  </a>
                  <div class="grid-post-content">
                    <div style="margin-bottom: 6px;">
                      <a href="/${catSlug}" class="cat-tag" style="font-size: 11px; padding: 2px 8px; text-decoration: none;">${catName}</a>
                    </div>
                    <h4><a href="/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a></h4>
                    ${(() => {
                      const snippet = cleanExcerpt(p.excerpt || p.body, 140);
                      return snippet
                        ? `
                        <p style="font-size: 13px; margin: 6px 0 10px 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; opacity: 0.85;">
                          ${escapeHtml(snippet)}
                        </p>
                      `
                        : "";
                    })()}
                    <div class="post-meta"><span>${date(p.created_at)}</span></div>
                  </div>
                </div>
                `;
                })
                .join("")}
            </div>
          `
          }

          <!-- Numbered Pagination -->
          ${renderNumberedPagination({ ...pagination, baseUrl: pagination.baseUrl || `/search?q=${encodeURIComponent(query)}` })}
        </div>
      </main>
    `;

  return this._layout(content, pageTitle, ctx);
}
