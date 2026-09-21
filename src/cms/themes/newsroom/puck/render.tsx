import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Render } from '@puckeditor/core';
import { puckConfig } from './config';
import { escapeHtml } from '../utils';

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
  const { site, page, canonical } = options;
  const siteTitle = escapeHtml(site?.site_title || site?.title || 'CMSMu');
  const siteTagline = escapeHtml(site?.site_desc || site?.site_tagline || '1 Platform Untuk Sindikasi Media Muhammadiyah');
  const pageTitle = page?.title ? `${escapeHtml(page.title)} — ${siteTitle}` : (siteTagline ? `${siteTitle} | ${siteTagline}` : siteTitle);
  const metaDesc = escapeHtml(site?.site_meta_desc || siteTagline);
  const faviconUrl = escapeHtml(site?.site_favicon || site?.favicon || '/favicon.svg');
  const canonicalUrl = canonical || '/';

  let puckData = { content: [], root: {}, zones: {} };
  try {
    puckData = JSON.parse(page.body);
  } catch (e) {
    console.error('Error parsing Puck JSON:', e);
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
