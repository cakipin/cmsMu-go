import type { ThemeContext } from "../types";
import { _layout } from "./layout";
import { escapeHtml, formatDate, getImage, getCategory } from "./utils";

export function renderCategory(ctx: ThemeContext): string {
  const posts = Array.isArray(ctx?.posts)
    ? ctx.posts
    : Array.isArray(ctx?.data)
    ? ctx.data
    : [];

  const heading = ctx?.categoryName
    ? `Kategori: ${escapeHtml(ctx.categoryName)}`
    : ctx?.query
    ? `Hasil Pencarian: "${escapeHtml(ctx.query)}"`
    : "Arsip Tulisan";

  const content = `
  <div class="container">
    <div style="margin-bottom: 2rem;">
      <h1 style="font-size: 1.75rem; font-weight: 800;">${heading}</h1>
      <p style="color: var(--text-muted); font-size: 0.875rem;">Menampilkan ${posts.length} artikel.</p>
    </div>

    ${
      posts.length === 0
        ? `<div style="padding: 3rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; text-align: center; color: var(--text-muted);">Tidak ada artikel yang ditemukan.</div>`
        : `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
        ${posts
          .map(
            (p: any) => `
          <article style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column;">
            <a href="/${escapeHtml(p.slug)}">
              <img src="${getImage(p)}" alt="${escapeHtml(p.title)}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover;">
            </a>
            <div style="padding: 1.25rem;">
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">${getCategory(p)}</span>
              <a href="/${escapeHtml(p.slug)}" style="text-decoration: none; color: var(--text);">
                <h2 style="font-size: 1.15rem; font-weight: 700; margin: 0.5rem 0;">${escapeHtml(p.title)}</h2>
              </a>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${formatDate(p.createdAt)}</div>
            </div>
          </article>
        `
          )
          .join("")}
      </div>
      `
    }
  </div>
  `;

  return _layout(content, heading, ctx, "category");
}
