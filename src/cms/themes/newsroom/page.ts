import type { ThemeContext } from "../types";
import { escapeHtml } from "./utils";

export function renderPage(this: any, ctx: ThemeContext) {
  const page = ctx.data;
  if (!page) return this.render404(ctx);

  const content = `
  <main class="nr-container nr-section" style="max-width: 820px; padding-top: 3rem;">
    <h1 style="font-family: var(--editorial-serif); font-size: 2.25rem; font-weight: 800; margin-bottom: 1.5rem;">
      ${escapeHtml(page.title)}
    </h1>
    <div class="nr-article-content" style="max-width: 100%;">
      ${page.body || ""}
    </div>
  </main>
  `;

  return this._layout(content, page.title, ctx, "page");
}
