import type { ThemeContext } from "../types";
import { escapeHtml } from "./utils";

export function _layout(
  content: string,
  pageTitle: string,
  ctx: ThemeContext,
  _subType?: string
): string {
  const site = ctx?.site || {};
  const siteTitle = escapeHtml(site.site_title || site.title || "Aplikasi CMSMu");
  const siteDesc = escapeHtml(site.site_description || site.description || "Portal Publikasi");
  const fullTitle = pageTitle ? `${escapeHtml(pageTitle)} - ${siteTitle}` : siteTitle;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullTitle}</title>
  <meta name="description" content="${siteDesc}">
  <style>
    :root {
      --bg: #f8fafc;
      --surface: #ffffff;
      --text: #0f172a;
      --text-muted: #64748b;
      --primary: #2563eb;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
    .container { width: 100%; max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
    header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 1rem 0; }
    .header-inner { display: flex; align-items: center; justify-content: space-between; }
    .brand { font-size: 1.35rem; font-weight: 800; color: var(--primary); text-decoration: none; }
    main { padding: 2.5rem 0 4rem; min-height: 70vh; }
    footer { background: var(--surface); border-top: 1px solid var(--border); padding: 2rem 0; text-align: center; font-size: 0.875rem; color: var(--text-muted); }
  </style>
</head>
<body>
  <header>
    <div class="container header-inner">
      <a href="/" class="brand">${siteTitle}</a>
      <nav>
        <a href="/" style="text-decoration:none; color:var(--text); font-weight:600; margin-right:1rem;">Beranda</a>
        <a href="/admin" style="text-decoration:none; color:var(--primary); font-weight:600;">Admin</a>
      </nav>
    </div>
  </header>

  <main>
    ${content}
  </main>

  <footer>
    <div class="container">
      &copy; ${new Date().getFullYear()} ${siteTitle}. Didukung oleh CMSMu-Go Starter Theme.
    </div>
  </footer>
</body>
</html>`;
}
