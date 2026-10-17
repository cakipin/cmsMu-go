import type { ThemeContext } from "../types";
import { _layout } from "./layout";
import { escapeHtml, formatDate, getImage, getCategory } from "./utils";

export function renderSingle(ctx: ThemeContext): string {
  const post = ctx?.data || {};
  const title = escapeHtml(post.title || "Artikel");
  const author = escapeHtml(post.author || "Redaksi");
  const date = formatDate(post.createdAt);
  const image = getImage(post);

  const content = `
  <div class="container" style="max-width: 800px;">
    <div style="margin-bottom: 1.5rem;">
      <a href="/" style="text-decoration:none; color:var(--primary); font-size:0.875rem;">&larr; Kembali ke Beranda</a>
    </div>

    <span style="font-size: 0.8125rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">${getCategory(post)}</span>
    <h1 style="font-size: 2.25rem; font-weight: 800; line-height: 1.25; margin: 0.5rem 0 1rem;">${title}</h1>
    
    <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 2rem;">
      Ditulis oleh <strong>${author}</strong> pada ${date}
    </div>

    ${
      image
        ? `<img src="${image}" alt="${title}" style="width: 100%; border-radius: 8px; margin-bottom: 2rem; max-height: 480px; object-fit: cover;">`
        : ""
    }

    <div style="font-size: 1.1rem; line-height: 1.8; color: var(--text);">
      ${post.content || ""}
    </div>
  </div>
  `;

  return _layout(content, post.title || "Artikel", ctx, "single");
}
