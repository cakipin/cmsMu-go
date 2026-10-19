import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Render } from "@puckeditor/core";
import { puckConfig } from "./config";
import type { PostItem } from "./types";
import { renderBlockToHtml } from "./engine/renderer";
import { BLOCK_CATALOG } from "./engine/schema";

export function escapeHtml(str: any): string {
  if (str === null || str === undefined) return "";
  return String(str).replace(
    /&(?!#?\w+;)|[<>"']/g,
    c =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[c] || c
  );
}

export interface PuckRenderOptions {
  site: any;
  menus?: any[];
  page: {
    id?: number | string;
    title?: string;
    slug?: string;
    body: string;
  };
  canonical?: string;
  latestPosts?: PostItem[] | any[];
}

export function isPuckJson(contentStr: string | null | undefined): boolean {
  if (!contentStr || typeof contentStr !== "string") return false;
  const trimmed = contentStr.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return false;
  try {
    const parsed = JSON.parse(trimmed);
    return (
      parsed &&
      (Array.isArray(parsed.content) || typeof parsed.root === "object")
    );
  } catch {
    return false;
  }
}

export function renderPuckHtml(options: PuckRenderOptions): string {
  const { site, page, canonical, latestPosts, menus } = options;
  const siteTitle = escapeHtml(
    site?.site_title || site?.title || "cmsMu"
  );
  const siteTagline = escapeHtml(site?.site_desc || site?.site_tagline || "");
  const pageTitle = page?.title
    ? `${escapeHtml(page.title)} — ${siteTitle}`
    : siteTagline
      ? `${siteTitle} | ${siteTagline}`
      : siteTitle;
  const metaDesc = escapeHtml(site?.site_meta_desc || siteTagline);
  const faviconUrl = escapeHtml(
    site?.site_favicon || site?.favicon || "/favicon.svg"
  );
  const canonicalUrl = canonical || "/";

  let puckData: any = { content: [], root: {}, zones: {} };
  try {
    puckData = JSON.parse(page.body);
  } catch (e) {
    console.error("Error parsing Puck JSON:", e);
  }

  // Normalisasi puckData dengan menggabungkan defaultProps dari BLOCK_CATALOG
  const normalizeBlock = (item: any) => {
    if (!item || !item.type) return item;
    const catalogEntry = BLOCK_CATALOG[item.type];
    const compConfig = (puckConfig.components as any)?.[item.type];
    const defaults = catalogEntry?.defaultProps || compConfig?.defaultProps || {};
    const mergedProps = {
      ...defaults,
      ...(item.props || {}),
    };

    // 1. Auto-Inherit & Sinkronisasi Logo & Judul untuk SiteHeader
    if (item.type === "SiteHeader") {
      const siteLogo = site?.site_logo || site?.logo;
      if (
        siteLogo &&
        (!mergedProps.logoImage || mergedProps.logoImage === "/logo-cmsmu.webp")
      ) {
        mergedProps.logoImage = siteLogo;
      }
      if (site?.site_title) {
        if (
          !mergedProps.siteTitle ||
          mergedProps.siteTitle === "CMS" ||
          mergedProps.siteTitle === "CMSMu"
        ) {
          mergedProps.siteTitle = site.site_title;
        }
      }
      // Bersihkan hardcode 'Mu' warisan data lama di database
      if (mergedProps.siteTitleHighlight === "Mu") {
        mergedProps.siteTitleHighlight = "";
      }
      if (
        (!Array.isArray(mergedProps.menuItems) || mergedProps.menuItems.length === 0) &&
        Array.isArray(menus) &&
        menus.length > 0
      ) {
        mergedProps.menuItems = menus.map((m: any) => ({
          label: m.label || m.title || m.name || "Menu",
          url: m.url || "/",
        }));
      }
    }

    // 2. Auto-Inherit & Sinkronisasi Logo untuk SiteFooter
    if (item.type === "SiteFooter") {
      const siteLogo = site?.site_logo || site?.logo;
      if (siteLogo && !mergedProps.logoImage) {
        mergedProps.logoImage = siteLogo;
      }
      if (site?.site_title && mergedProps.siteName === "CMSMu") {
        mergedProps.siteName = site.site_title;
      }
    }

    // 3. Hidrasi Data Artikel Riil ke RecentPosts dari Database
    if (item.type === "RecentPosts") {
      if (typeof mergedProps.viewAllLink === "string") {
        mergedProps.viewAllLink = mergedProps.viewAllLink
          .replace(/^\/kategori\//, "/")
          .replace(/^\/category\//, "/");
      }
      if (latestPosts && Array.isArray(latestPosts) && latestPosts.length > 0) {
        const count = parseInt(mergedProps.postsCount || "3", 10) || 3;
        mergedProps.posts = latestPosts
          .filter((p: any) => Boolean(p && typeof p === "object"))
          .slice(0, count)
          .map((p: any) => {
            const rawCategory =
              p.category_name ||
              (typeof p.category === "object" ? p.category?.name : p.category) ||
              p.categories?.[0]?.name ||
              "";
            const rawExcerpt =
              p.excerpt ||
              (p.description ? String(p.description).slice(0, 140) : "") ||
              (p.body || p.content
                ? String(p.body || p.content)
                    .replace(/<[^>]*>?/gm, "")
                    .slice(0, 140)
                : "") ||
              "";
            return {
              id: p.id ?? Math.random(),
              title:
                (typeof p.title === "string" && p.title.trim()) ||
                "Artikel Tanpa Judul",
              slug: (typeof p.slug === "string" ? p.slug : "") || "",
              featured_image:
                p.featured_image || p.image || p.cover_image || "",
              excerpt:
                typeof rawExcerpt === "string" ? rawExcerpt.trim() : "",
              created_at: p.created_at || p.published_at || "",
              category:
                typeof rawCategory === "string" ? rawCategory.trim() : "",
            };
          });
      }
    }

    return {
      ...item,
      props: mergedProps,
    };
  };

  const homeSlug = site?.site_homepage_slug || "home";
  const isHomePage = page?.slug === homeSlug || !page?.slug;

  if (puckData && Array.isArray(puckData.content)) {
    // 1. Evaluasi blok SiteHeader yang ada di halaman ini
    puckData.content = puckData.content.filter((c: any) => {
      if (c.type !== "SiteHeader") return true;
      const scope = c.props?.headerScope || "all";
      if (scope === "home_only" && !isHomePage) return false;
      if (scope === "pages_posts" && isHomePage) return false;
      return true;
    });

    // 2. Jika halaman tidak memiliki SiteHeader, cek apakah perlu injeksi global header
    const hasHeader = puckData.content.some((c: any) => c.type === "SiteHeader");
    if (!hasHeader && (site?.global_header_enabled === "true" || site?.global_header_props)) {
      let rawHeaderProps: any = {};
      if (site.global_header_props) {
        try {
          rawHeaderProps =
            typeof site.global_header_props === "string"
              ? JSON.parse(site.global_header_props)
              : site.global_header_props;
        } catch (e) {}
      }
      const globalScope = rawHeaderProps.headerScope || "all";
      const shouldInject =
        globalScope === "all" ||
        (globalScope === "home_only" && isHomePage) ||
        (globalScope === "pages_posts" && !isHomePage);

      if (shouldInject && Object.keys(rawHeaderProps).length > 0) {
        puckData.content.unshift({
          type: "SiteHeader",
          props: {
            id: "global-header-auto",
            ...rawHeaderProps,
          },
        });
      }
    }
    puckData.content = puckData.content.map(normalizeBlock);
  }
  if (puckData && puckData.zones && typeof puckData.zones === "object") {
    for (const zoneKey of Object.keys(puckData.zones)) {
      if (Array.isArray(puckData.zones[zoneKey])) {
        puckData.zones[zoneKey] = puckData.zones[zoneKey].map(normalizeBlock);
      }
    }
  }

  // Render Puck/Canvas blocks to static HTML via pure HTML engine (100% parity with canvas builder)
  let bodyMarkup = "";
  try {
    const blocks = Array.isArray(puckData?.content) ? puckData.content : [];
    bodyMarkup = blocks
      .map((block: any) => renderBlockToHtml(block, { latestPosts, site }))
      .join("\n");
  } catch (err: any) {
    console.error("Error in pure HTML renderBlockToHtml:", err);
    bodyMarkup = `<div class="p-8 text-center text-red-500">Gagal merender halaman visual: ${escapeHtml(err?.message || "")}</div>`;
  }

  return `<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${metaDesc}">
  <link rel="icon" href="${faviconUrl}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="${siteTitle}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${metaDesc}">
  
  <!-- Anti-FOUC Theme Initializer -->
  <script>
    (function() {
      try {
        var t = localStorage.getItem('cmsmu_theme') || 'light';
        document.documentElement.setAttribute('data-theme', t);
        if (t === 'dark') document.documentElement.classList.add('dark');
      } catch(e) {}
    })();
  </script>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Outfit:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
  
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: ['selector', '[data-theme="dark"]'],
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
          }
        }
      }
    }
  </script>

  <style>
    :root {
      --bg-canvas: #ffffff;
      --bg-surface: #f8fafc;
      --bg-card: #ffffff;
      --border-subtle: #e2e8f0;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
    }
    [data-theme="dark"] {
      --bg-canvas: #090d16;
      --bg-surface: #0f172a;
      --bg-card: #111827;
      --border-subtle: #1e293b;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg-canvas);
      color: var(--text-primary);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      margin: 0;
      padding: 0;
      transition: background-color 0.25s ease, color 0.25s ease;
    }
    [data-theme="dark"] body {
      background-color: #090d16 !important;
      color: #f8fafc !important;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col">
  <div id="puck-root" class="flex-1 w-full">
    ${bodyMarkup}
  </div>
</body>
</html>`;
}

export interface GlobalHeaderResult {
  html: string;
  isFixed: boolean;
  headerPadding?: string;
}

export function renderGlobalHeaderHtml(
  site: any,
  menus: any[] = []
): GlobalHeaderResult | null {
  if (!site || (site.global_header_enabled !== "true" && !site.global_header_props)) {
    return null;
  }

  let rawProps: any = {};
  if (site.global_header_props) {
    try {
      rawProps =
        typeof site.global_header_props === "string"
          ? JSON.parse(site.global_header_props)
          : site.global_header_props;
    } catch (e) {
      console.error("Error parsing global_header_props:", e);
    }
  }

  const defaultProps = BLOCK_CATALOG.SiteHeader?.defaultProps || {};

  const mergedProps: any = {
    ...defaultProps,
    ...rawProps,
  };

  // 1. Auto-inherit & sinkronisasi logo & judul
  const siteLogo = site?.site_logo || site?.logo;
  if (
    siteLogo &&
    (!mergedProps.logoImage || mergedProps.logoImage === "/logo-cmsmu.webp")
  ) {
    mergedProps.logoImage = siteLogo;
  }
  if (site?.site_title) {
    if (
      !mergedProps.siteTitle ||
      mergedProps.siteTitle === "CMS" ||
      mergedProps.siteTitle === "CMSMu"
    ) {
      mergedProps.siteTitle = site.site_title;
    }
  }
  if (mergedProps.siteTitleHighlight === "Mu") {
    mergedProps.siteTitleHighlight = "";
  }

  // 2. Hidrasi menu dinamis dari database jika menuItems kosong
  if (
    (!mergedProps.menuItems ||
      !Array.isArray(mergedProps.menuItems) ||
      mergedProps.menuItems.length === 0) &&
    Array.isArray(menus) &&
    menus.length > 0
  ) {
    mergedProps.menuItems = menus.map((m: any) => ({
      label: m.label || m.title || m.name || "",
      url: m.url || "/",
    }));
  }

  try {
    const html = renderBlockToHtml(
      { type: "SiteHeader", props: mergedProps },
      { site }
    );
    const isFixed = mergedProps.headerPosition === "fixed";
    return {
      html,
      isFixed,
      headerPadding: mergedProps.headerSize === "compact" ? "h-14" : mergedProps.headerSize === "large" ? "h-22" : "h-18",
    };
  } catch (err) {
    console.error("Error rendering Global Header:", err);
    return null;
  }
}
