import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Render } from '@puckeditor/core';
import { puckConfig } from './config';
import type { PostItem } from './types';

export function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&(?!#?\w+;)|[<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c] || c));
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
  if (!contentStr || typeof contentStr !== 'string') return false;
  const trimmed = contentStr.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return false;
  try {
    const parsed = JSON.parse(trimmed);
    return parsed && (Array.isArray(parsed.content) || typeof parsed.root === 'object');
  } catch {
    return false;
  }
}

export function renderPuckHtml(options: PuckRenderOptions): string {
  const { site, page, canonical, latestPosts, menus } = options;
  const siteTitle = escapeHtml(site?.site_title || site?.title || 'CMSMu');
  const siteTagline = escapeHtml(site?.site_desc || site?.site_tagline || '1 Platform Untuk Sindikasi Media Muhammadiyah');
  const pageTitle = page?.title ? `${escapeHtml(page.title)} — ${siteTitle}` : (siteTagline ? `${siteTitle} | ${siteTagline}` : siteTitle);
  const metaDesc = escapeHtml(site?.site_meta_desc || siteTagline);
  const faviconUrl = escapeHtml(site?.site_favicon || site?.favicon || '/favicon.svg');
  const canonicalUrl = canonical || '/';

  let puckData: any = { content: [], root: {}, zones: {} };
  try {
    puckData = JSON.parse(page.body);
  } catch (e) {
    console.error('Error parsing Puck JSON:', e);
  }

  // Normalisasi puckData dengan menggabungkan defaultProps untuk mencegah TypeError undefined
  const normalizeBlock = (item: any) => {
    if (!item || !item.type) return item;
    const compConfig = (puckConfig.components as any)?.[item.type];
    const defaults = compConfig?.defaultProps || {};
    const mergedProps = {
      ...defaults,
      ...(item.props || {})
    };

    // 1. Auto-Inherit & Sinkronisasi Logo & Judul untuk SiteHeader
    if (item.type === 'SiteHeader') {
      const siteLogo = site?.site_logo || site?.logo;
      if (siteLogo && (!mergedProps.logoImage || mergedProps.logoImage === '/logo-cmsmu.webp')) {
        mergedProps.logoImage = siteLogo;
      }
      if (site?.site_title) {
        if (!mergedProps.siteTitle || mergedProps.siteTitle === 'CMS' || mergedProps.siteTitle === 'CMSMu') {
          mergedProps.siteTitle = site.site_title;
        }
      }
      // Bersihkan hardcode 'Mu' warisan data lama di database
      if (mergedProps.siteTitleHighlight === 'Mu') {
        mergedProps.siteTitleHighlight = '';
      }
    }

    // 2. Auto-Inherit & Sinkronisasi Logo untuk SiteFooter
    if (item.type === 'SiteFooter') {
      const siteLogo = site?.site_logo || site?.logo;
      if (siteLogo && !mergedProps.logoImage) {
        mergedProps.logoImage = siteLogo;
      }
      if (site?.site_title && mergedProps.siteName === 'CMSMu') {
        mergedProps.siteName = site.site_title;
      }
    }

    // 3. Hidrasi Data Artikel Riil ke RecentPosts dari Database
    if (item.type === 'RecentPosts') {
      if (latestPosts && Array.isArray(latestPosts) && latestPosts.length > 0) {
        const count = parseInt(mergedProps.postsCount || '3', 10) || 3;
        mergedProps.posts = latestPosts.slice(0, count).map((p: any) => ({
          id: p.id,
          title: p.title || 'Artikel Tanpa Judul',
          slug: p.slug || '',
          featured_image: p.featured_image || p.image || '',
          excerpt: p.excerpt || (p.description ? p.description.slice(0, 140) : ''),
          created_at: p.created_at || p.published_at || '',
          category: p.category_name || p.category || (p.categories?.[0]?.name) || ''
        }));
      }
    }

    return {
      ...item,
      props: mergedProps
    };
  };

  if (puckData && Array.isArray(puckData.content)) {
    const hasHeader = puckData.content.some((c: any) => c.type === 'SiteHeader');
    if (!hasHeader && site?.global_header_enabled === 'true') {
      let rawHeaderProps: any = {};
      if (site.global_header_props) {
        try {
          rawHeaderProps = typeof site.global_header_props === 'string'
            ? JSON.parse(site.global_header_props)
            : site.global_header_props;
        } catch(e) {}
      }
      puckData.content.unshift({
        type: 'SiteHeader',
        props: {
          id: 'global-header-auto',
          ...rawHeaderProps
        }
      });
    }
    puckData.content = puckData.content.map(normalizeBlock);
  }
  if (puckData && puckData.zones && typeof puckData.zones === 'object') {
    for (const zoneKey of Object.keys(puckData.zones)) {
      if (Array.isArray(puckData.zones[zoneKey])) {
        puckData.zones[zoneKey] = puckData.zones[zoneKey].map(normalizeBlock);
      }
    }
  }

  // Render Puck components to static HTML
  let bodyMarkup = '';
  try {
    bodyMarkup = renderToStaticMarkup(
      React.createElement(Render, {
        config: puckConfig,
        data: puckData
      })
    );
  } catch (err: any) {
    console.error('Error in Puck renderToStaticMarkup:', err);
    bodyMarkup = `<div class="p-8 text-center text-red-500">Gagal merender halaman visual: ${escapeHtml(err?.message || '')}</div>`;
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
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap" rel="stylesheet">
  
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
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
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body class="bg-white text-slate-900 min-h-screen flex flex-col">
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

export function renderGlobalHeaderHtml(site: any, menus: any[] = []): GlobalHeaderResult | null {
  if (!site || site.global_header_enabled !== 'true') {
    return null;
  }

  let rawProps: any = {};
  if (site.global_header_props) {
    try {
      rawProps = typeof site.global_header_props === 'string'
        ? JSON.parse(site.global_header_props)
        : site.global_header_props;
    } catch (e) {
      console.error('Error parsing global_header_props:', e);
    }
  }

  const siteHeaderConfig = (puckConfig.components as any)?.SiteHeader;
  const defaultProps = siteHeaderConfig?.defaultProps || {};

  const mergedProps: any = {
    ...defaultProps,
    ...rawProps
  };

  // 1. Auto-inherit & sinkronisasi logo & judul
  const siteLogo = site?.site_logo || site?.logo;
  if (siteLogo && (!mergedProps.logoImage || mergedProps.logoImage === '/logo-cmsmu.webp')) {
    mergedProps.logoImage = siteLogo;
  }
  if (site?.site_title) {
    if (!mergedProps.siteTitle || mergedProps.siteTitle === 'CMS' || mergedProps.siteTitle === 'CMSMu') {
      mergedProps.siteTitle = site.site_title;
    }
  }
  // Bersihkan hardcode 'Mu' warisan lama (Zero Hardcode Policy)
  if (mergedProps.siteTitleHighlight === 'Mu') {
    mergedProps.siteTitleHighlight = '';
  }

  // 2. Hidrasi menu dinamis dari database jika menuItems kosong atau masih default dummy hash
  const isDefaultDummyMenu = Array.isArray(mergedProps.menuItems) && 
    mergedProps.menuItems.length > 0 &&
    mergedProps.menuItems.every((item: any) => item.url && item.url.startsWith('#'));

  if ((!mergedProps.menuItems || !Array.isArray(mergedProps.menuItems) || mergedProps.menuItems.length === 0 || isDefaultDummyMenu) && Array.isArray(menus) && menus.length > 0) {
    mergedProps.menuItems = menus.map((m: any) => ({
      label: m.label || '',
      url: m.url || '/'
    }));
  } else if (Array.isArray(mergedProps.menuItems)) {
    // Pastikan URL jangkar seperti #fitur diubah menjadi /#fitur agar berfungsi saat diklik dari halaman selain beranda
    mergedProps.menuItems = mergedProps.menuItems.map((item: any) => {
      const url = String(item.url || '').trim();
      if (url.startsWith('#') && url.length > 1) {
        return { ...item, url: '/' + url };
      }
      return item;
    });
  }

  try {
    const headerElement = React.createElement(siteHeaderConfig.render, mergedProps);
    const html = renderToStaticMarkup(headerElement);
    const isFixed = mergedProps.headerPosition !== 'static';
    return {
      html,
      isFixed,
      headerPadding: mergedProps.headerPadding || 'h-20'
    };
  } catch (err) {
    console.error('Error rendering Global Header:', err);
    return null;
  }
}
