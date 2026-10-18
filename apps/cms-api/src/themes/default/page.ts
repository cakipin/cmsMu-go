import type { ThemeContext } from "../types";
import { _layout } from "./layout";
import { escapeHtml, cleanArticleContent, getImage } from "./utils";

export function renderPage(ctx: ThemeContext): string {
  const page = ctx?.data || ctx?.pageData || {};
  const title = escapeHtml(page.title || "Halaman");
  const featuredImg = page.featuredImage || page.featured_image ? getImage(page, 0) : "";
  const bodyContent = cleanArticleContent(page.body || page.content || "");

  const contentHtml = `
  <div class="container" style="max-width: 860px;">
    
    <nav style="display:flex; align-items:center; gap:0.5rem; font-size:0.8125rem; color:var(--text-muted); margin-bottom:1.5rem;">
      <a href="/" style="color:var(--text-secondary);"><i class="fas fa-home"></i> Beranda</a>
      <span>/</span>
      <span style="color:var(--accent-primary); font-weight:600;">${title}</span>
    </nav>

    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 900; line-height: 1.25; color: var(--text-primary); margin-bottom: 1rem;">
        ${title}
      </h1>
      <div style="height: 3px; width: 60px; background: var(--accent-primary); border-radius: 2px;"></div>
    </header>

    ${
      featuredImg
        ? `
    <figure style="margin-bottom: 2.5rem; border-radius: var(--radius-lg); overflow: hidden;">
      <img src="${featuredImg}" alt="${title}" style="width: 100%; max-height: 480px; object-fit: cover;">
    </figure>
    `
        : ""
    }

    <article class="article-body" style="font-size: 1.1rem; line-height: 1.8; color: var(--text-primary); margin-bottom: 3rem;">
      ${bodyContent}
    </article>

  </div>
  `;

  return _layout(contentHtml, page.title || "Halaman", ctx, "page");
}
