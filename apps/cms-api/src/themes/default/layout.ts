import type { ThemeContext } from "../types";
import { escapeHtml } from "./utils";
import { renderBlockToHtml } from "../../modules/theme-builder/engine/renderer";
import { BLOCK_CATALOG } from "../../modules/theme-builder/engine/schema";

export function _layout(
  content: string,
  pageTitle: string,
  ctx: ThemeContext,
  _subType?: string
): string {
  const site = ctx?.site || {};
  const siteTitle = escapeHtml(site.site_title || site.title || "CMSMu");
  const siteDesc = escapeHtml(
    site.site_description || site.description || "Portal Berita & Publikasi CMSMu"
  );
  const siteLogo = site.site_logo || site.logo || "";
  const fullTitle = pageTitle ? `${escapeHtml(pageTitle)} - ${siteTitle}` : siteTitle;
  const canonical = ctx?.currentSlug ? `/${ctx.currentSlug}` : "/";

  // Dynamic Categories & Menus (Support string[] or object[] from Core getGlobalData)
  const categoriesList = Array.isArray(ctx?.categories) ? ctx.categories : [];
  const rawMenus = Array.isArray(ctx?.menus)
    ? ctx.menus
    : Array.isArray((ctx?.menus as any)?.header)
      ? (ctx?.menus as any).header
      : [];

  const toCategoryItem = (c: any) => {
    const rawName = typeof c === "string" ? c : c?.name || c?.title || "";
    const rawSlug =
      typeof c === "object" && c?.slug
        ? String(c.slug)
        : String(rawName)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    return {
      title: rawName || "Kategori",
      url: rawSlug ? `/${rawSlug}` : "/berita",
    };
  };

  const normalizeMenuUrl = (url?: string) => {
    const u = String(url || "").trim();
    if (!u || u === "/category/undefined" || u === "/kategori/berita") return "/berita";
    if (u.startsWith("/category/")) return "/" + u.slice("/category/".length);
    if (u.startsWith("/kategori/")) return "/" + u.slice("/kategori/".length);
    return u;
  };

  const headerMenus =
    rawMenus.length > 0
      ? rawMenus.map((m: any) => ({
          title: m.label || m.title || m.name || "Menu",
          url: normalizeMenuUrl(m.url),
        }))
      : categoriesList.length > 0
        ? [
            { title: "Beranda", url: "/" },
            ...categoriesList.slice(0, 6).map(toCategoryItem),
          ]
        : [
            { title: "Beranda", url: "/" },
            { title: "Berita & Artikel", url: "/berita" },
          ];

  let customHeaderHtml = "";
  if (site.global_header_props) {
    try {
      const rawGProps =
        typeof site.global_header_props === "string"
          ? JSON.parse(site.global_header_props)
          : site.global_header_props;
      const gProps: Record<string, any> = {
        ...(BLOCK_CATALOG.SiteHeader?.defaultProps || {}),
        ...(rawGProps || {}),
      };
      if (siteLogo && (!gProps.logoImage || gProps.logoImage === "/logo-cmsmu.webp")) {
        gProps.logoImage = siteLogo;
      }
      if (site.site_title && (!gProps.siteTitle || gProps.siteTitle === "CMS" || gProps.siteTitle === "CMSMu")) {
        gProps.siteTitle = site.site_title;
      }
      if (gProps.siteTitleHighlight === "Mu") {
        gProps.siteTitleHighlight = "";
      }
      if ((!Array.isArray(gProps.menuItems) || gProps.menuItems.length === 0) && headerMenus.length > 0) {
        gProps.menuItems = headerMenus.map((m: any) => ({
          label: m.title || m.label || "Menu",
          url: m.url || "/",
        }));
      }
      const gScope = gProps.headerScope || "all";
      if (gScope === "all" || gScope === "pages_posts") {
        customHeaderHtml = renderBlockToHtml(
          { type: "SiteHeader", props: gProps },
          { site }
        );
      }
    } catch (e) {}
  }

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${fullTitle}</title>
  <meta name="description" content="${siteDesc}">
  <link rel="canonical" href="${canonical}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${fullTitle}">
  <meta property="og:description" content="${siteDesc}">
  <meta property="og:site_name" content="${siteTitle}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${fullTitle}">
  <meta name="twitter:description" content="${siteDesc}">

  <!-- Favicon & Feed -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Outfit:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">

  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />

  <style>
    :root {
      --bg-canvas: #f8fafc;
      --bg-surface: #ffffff;
      --bg-surface-elevated: #ffffff;
      --border-subtle: #e2e8f0;
      --border-strong: #cbd5e1;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
      --accent-primary: #0d9488;
      --accent-hover: #0f766e;
      --accent-subtle: #f0fdfa;
      --accent-contrast: #ffffff;
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 16px;
      --container-max: 1200px;
    }

    [data-theme="dark"] {
      --bg-canvas: #090d16;
      --bg-surface: #111827;
      --bg-surface-elevated: #1f2937;
      --border-subtle: #1e293b;
      --border-strong: #334155;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --accent-primary: #14b8a6;
      --accent-hover: #2dd4bf;
      --accent-subtle: #132e2f;
      --accent-contrast: #0f172a;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg-canvas);
      color: var(--text-primary);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
    }

    .container {
      width: 100%;
      max-width: var(--container-max);
      margin: 0 auto;
      padding: 0 1.25rem;
    }

    /* TOP BAR / BRAND & SEARCH */
    .site-header {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
      gap: 1.5rem;
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-logo {
      height: 42px;
      width: auto;
      object-fit: contain;
    }

    .brand-title {
      font-size: 1.5rem;
      font-weight: 900;
      letter-spacing: -0.03em;
      color: var(--accent-primary);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .brand-desc {
      font-size: 0.75rem;
      color: var(--text-muted);
      display: none;
    }

    @media (min-width: 768px) {
      .brand-desc { display: block; }
    }

    /* NAV LINKS */
    .nav-desktop {
      display: none;
      align-items: center;
      gap: 0.25rem;
    }

    @media (min-width: 992px) {
      .nav-desktop { display: flex; }
    }

    .nav-link {
      padding: 0.5rem 0.85rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      border-radius: var(--radius-sm);
      transition: all 0.2s;
    }

    .nav-link:hover {
      color: var(--accent-primary);
      background: var(--accent-subtle);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .search-form {
      position: relative;
      display: none;
    }

    @media (min-width: 640px) {
      .search-form { display: block; }
    }

    .search-input {
      background: var(--bg-canvas);
      border: 1px solid var(--border-subtle);
      border-radius: 9999px;
      padding: 0.45rem 1rem 0.45rem 2.25rem;
      font-size: 0.8125rem;
      color: var(--text-primary);
      outline: none;
      width: 180px;
      transition: width 0.25s, border-color 0.2s;
    }

    .search-input:focus {
      width: 240px;
      border-color: var(--accent-primary);
    }

    .search-icon {
      position: absolute;
      left: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 0.8125rem;
      pointer-events: none;
    }

    .theme-toggle-btn,
    .mobile-menu-btn {
      background: var(--bg-canvas);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      width: 38px;
      height: 38px;
      border-radius: var(--radius-sm);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.95rem;
      transition: all 0.2s;
    }

    .theme-toggle-btn:hover,
    .mobile-menu-btn:hover {
      color: var(--accent-primary);
      border-color: var(--accent-primary);
    }

    @media (min-width: 992px) {
      .mobile-menu-btn { display: none; }
    }

    /* MOBILE DRAWER */
    .mobile-drawer {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 100;
      display: none;
      backdrop-filter: blur(2px);
    }

    .mobile-drawer.open {
      display: block;
    }

    .mobile-drawer-content {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 280px;
      background: var(--bg-surface);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
      overflow-y: auto;
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 1rem;
    }

    .mobile-nav-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-primary);
      transition: background 0.2s;
    }

    .mobile-nav-link:hover {
      background: var(--accent-subtle);
      color: var(--accent-primary);
    }

    /* MAIN CONTENT */
    .site-main {
      flex: 1;
      padding: 2rem 0 3.5rem;
    }

    /* FOOTER */
    .site-footer {
      background: var(--bg-surface);
      border-top: 1px solid var(--border-subtle);
      padding: 3rem 0 2rem;
      margin-top: auto;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2.5rem;
      margin-bottom: 2.5rem;
    }

    @media (min-width: 768px) {
      .footer-grid {
        grid-template-columns: 2fr 1fr 1fr;
      }
    }

    .footer-brand h4 {
      font-size: 1.25rem;
      font-weight: 900;
      color: var(--accent-primary);
      margin-bottom: 0.75rem;
    }

    .footer-brand p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.6;
      max-width: 380px;
    }

    .footer-col h5 {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1rem;
      border-left: 3px solid var(--accent-primary);
      padding-left: 0.5rem;
    }

    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .footer-links a {
      font-size: 0.875rem;
      color: var(--text-secondary);
      transition: color 0.2s;
    }

    .footer-links a:hover {
      color: var(--accent-primary);
    }

    .footer-bottom {
      border-top: 1px solid var(--border-subtle);
      padding-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    @media (min-width: 640px) {
      .footer-bottom { flex-direction: row; }
    }

    .footer-bottom a {
      color: var(--accent-primary);
      font-weight: 600;
    }

    /* COMMON COMPONENTS */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.65rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-radius: var(--radius-sm);
      background: var(--accent-subtle);
      color: var(--accent-primary);
    }

    .post-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }

    .post-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
      border-color: var(--border-strong);
    }

    .post-card-thumb {
      aspect-ratio: 16 / 9;
      width: 100%;
      object-fit: cover;
      background: var(--border-subtle);
    }

    .post-card-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .post-card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0.6rem 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .post-card-title:hover {
      color: var(--accent-primary);
    }

    .post-card-excerpt {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .post-card-meta {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border-subtle);
      padding-top: 0.75rem;
    }

    .meta-author-date {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* SAFE AREA FOR ANDROID NAVIGATION */
    .safe-area-bottom {
      padding-bottom: env(safe-area-inset-bottom, 24px);
    }
  </style>
</head>
<body class="safe-area-bottom">

  <!-- HEADER -->
  ${
    customHeaderHtml ||
    `
  <header class="site-header">
    <div class="container header-inner">
      <div class="brand-wrap">
        <a href="/" class="brand-title">
          ${
            siteLogo
              ? `<img src="${escapeHtml(siteLogo)}" alt="${siteTitle}" class="brand-logo" onerror="this.outerHTML='<span>${siteTitle}</span>'">`
              : `<span>${siteTitle}</span>`
          }
        </a>
        <span class="brand-desc">${siteDesc}</span>
      </div>

      <!-- DESKTOP NAV -->
      <nav class="nav-desktop">
        ${headerMenus
          .map(
            (m: any) =>
              `<a href="${escapeHtml(m.url || "#")}" class="nav-link">${escapeHtml(m.title || m.name || "")}</a>`
          )
          .join("")}
      </nav>

      <!-- HEADER ACTIONS -->
      <div class="header-actions">
        <form action="/search" method="GET" class="search-form">
          <i class="fas fa-search search-icon"></i>
          <input type="text" name="q" placeholder="Cari artikel..." class="search-input" value="${escapeHtml(ctx?.query || "")}">
        </form>

        <button type="button" class="theme-toggle-btn" id="themeToggleBtn" aria-label="Ganti Mode">
          <i class="fas fa-moon" id="themeIcon"></i>
        </button>

        <button type="button" class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Buka Menu">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>
  </header>
  `
  }

  <!-- MOBILE MENU DRAWER -->
  <div class="mobile-drawer" id="mobileDrawer">
    <div class="mobile-drawer-content">
      <div class="drawer-header">
        <span class="brand-title" style="font-size:1.25rem;">${siteTitle}</span>
        <button type="button" class="theme-toggle-btn" id="closeDrawerBtn" aria-label="Tutup Menu">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form action="/search" method="GET">
        <div style="position:relative;">
          <i class="fas fa-search search-icon"></i>
          <input type="text" name="q" placeholder="Cari artikel..." class="search-input" style="width:100%; display:block;" value="${escapeHtml(ctx?.query || "")}">
        </div>
      </form>

      <ul class="mobile-nav-list">
        ${headerMenus
          .map(
            (m: any) =>
              `<li><a href="${escapeHtml(m.url || "#")}" class="mobile-nav-link"><i class="fas fa-angle-right" style="color:var(--text-muted);font-size:0.8rem;"></i> ${escapeHtml(m.title || m.name || "")}</a></li>`
          )
          .join("")}
      </ul>
    </div>
  </div>

  <!-- MAIN -->
  <main class="site-main">
    ${content}
  </main>

  <!-- FOOTER -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <h4>${siteTitle}</h4>
          <p>${siteDesc}</p>
        </div>
        <div class="footer-col">
          <h5>Kanal Utama</h5>
          <ul class="footer-links">
            ${headerMenus
              .slice(0, 5)
              .map(
                (m: any) =>
                  `<li><a href="${escapeHtml(m.url || "#")}">${escapeHtml(m.title || m.name || "")}</a></li>`
              )
              .join("")}
          </ul>
        </div>
        <div class="footer-col">
          <h5>Navigasi</h5>
          <ul class="footer-links">
            <li><a href="/">Beranda</a></li>
            <li><a href="/sitemap.xml">Peta Situs</a></li>
            <li><a href="/admin">Dashboard Pengelola</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <span>&copy; ${new Date().getFullYear()} ${siteTitle}. Hak cipta dilindungi undang-undang.</span>
        <span>Didukung oleh <a href="https://github.com/cakipin/cmsMu-go" target="_blank" rel="noopener">CMSMu Open Source</a></span>
      </div>
    </div>
  </footer>

  <script>
    (function() {
      // Theme Toggle Logic
      var themeToggleBtn = document.getElementById('themeToggleBtn');
      var themeIcon = document.getElementById('themeIcon');
      var currentTheme = localStorage.getItem('cmsmu_theme') || 'light';
      
      function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeIcon) {
          themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        var cmsmuIcons = document.querySelectorAll('.cmsmu-theme-icon');
        for (var i = 0; i < cmsmuIcons.length; i++) {
          cmsmuIcons[i].className = theme === 'dark' ? 'fas fa-sun cmsmu-theme-icon' : 'fas fa-moon cmsmu-theme-icon';
        }
        localStorage.setItem('cmsmu_theme', theme);
      }
      
      applyTheme(currentTheme);

      if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
          var active = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
          applyTheme(active);
        });
      }

      // Mobile Drawer Toggle
      var mobileMenuBtn = document.getElementById('mobileMenuBtn');
      var closeDrawerBtn = document.getElementById('closeDrawerBtn');
      var mobileDrawer = document.getElementById('mobileDrawer');

      if (mobileMenuBtn && mobileDrawer) {
        mobileMenuBtn.addEventListener('click', function() {
          mobileDrawer.classList.add('open');
        });
      }

      if (closeDrawerBtn && mobileDrawer) {
        closeDrawerBtn.addEventListener('click', function() {
          mobileDrawer.classList.remove('open');
        });
      }

      if (mobileDrawer) {
        mobileDrawer.addEventListener('click', function(e) {
          if (e.target === mobileDrawer) {
            mobileDrawer.classList.remove('open');
          }
        });
      }
    })();
  </script>
</body>
</html>`;
}
