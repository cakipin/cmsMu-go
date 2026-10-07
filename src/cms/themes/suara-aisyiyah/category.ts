import type { ThemeContext } from "../types";
import {
  escapeHtml,
  date,
  category as getCategory,
  image,
  renderNumberedPagination,
} from "./utils";

export function renderCategory(this: any, ctx: ThemeContext) {
  const posts = Array.isArray(ctx.data) ? ctx.data : [];
  const catName = escapeHtml(ctx.categoryName || "Kategori");
  const pagination = (ctx as any).pagination;
  const currentLang = (ctx as any).lang || "id";
  const langPrefix =
    currentLang && currentLang !== "id" ? `/${currentLang}` : "";

  let content = `
      <main class="container" role="main">
        <div class="section-block" style="margin-top: 24px; margin-bottom: 40px;">
          <div class="section-header">
            <h3>${catName}</h3>
          </div>
          ${
            !posts.length
              ? `<div class="empty"><p>${currentLang === "en" ? "No articles in this category yet." : currentLang === "ar" ? "لا توجد مقالات في هذه الفئة بعد." : "Belum ada artikel di kategori ini."}</p></div>`
              : `
            <div class="card-grid">
              ${posts
                .map((p: any, i: number) => {
                  const isVideo =
                    p.type === "video" ||
                    (p.video_url && String(p.video_url).trim() !== "");
                  return `
                <div class="grid-post">
                  <a href="${langPrefix}/${escapeHtml(p.slug)}" class="post-img-wrap" style="position: relative;">
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
                    <h4><a href="${langPrefix}/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a></h4>
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
          ${renderNumberedPagination(pagination)}
        </div>
      </main>
    `;
  return this._layout(content, catName, ctx);
}
