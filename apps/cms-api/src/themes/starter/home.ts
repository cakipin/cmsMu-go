import type { ThemeContext } from "../types";
import { _layout } from "./layout";
import { escapeHtml, formatDate, getImage, getCategory, getExcerpt } from "./utils";

export function renderHome(ctx: ThemeContext): string {
  const structured = ctx?.data || {};
  const posts = Array.isArray(structured.latest)
    ? structured.latest
    : Array.isArray(structured.regularPosts)
    ? structured.regularPosts
    : [];

  const content = `
  <div class="container">
    <div style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem;">Selamat Datang di Portal</h1>
      <p style="color: var(--text-muted);">Publikasi dan artikel terbaru.</p>
    </div>

    ${
      posts.length === 0
        ? `<div style="padding: 3rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; text-align: center; color: var(--text-muted);">Belum ada artikel yang diterbitkan.</div>`
        : `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
        ${posts
          .map(
            (p: any) => `
          <article style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column;">
            <a href="/${escapeHtml(p.slug)}">
              <img src="${getImage(p)}" alt="${escapeHtml(p.title)}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover;">
            </a>
            <div style="padding: 1.25rem; display: flex; flex-direction: column; flex: 1;">
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">${getCategory(p)}</span>
              <a href="/${escapeHtml(p.slug)}" style="text-decoration: none; color: var(--text);">
                <h2 style="font-size: 1.15rem; font-weight: 700; margin: 0.5rem 0;">${escapeHtml(p.title)}</h2>
              </a>
              <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">${getExcerpt(p.excerpt || p.body || p.content)}</p>
              <div style="margin-top: auto; font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 0.75rem;">
                ${formatDate(p.createdAt || p.created_at)}
              </div>
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

  return _layout(content, "", ctx, "home");
}
