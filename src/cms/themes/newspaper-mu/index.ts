import type { ThemeStructure, ThemeContext } from '../types';
import { css } from './style';
import { renderHeader, renderFooter, renderSidebar, renderHero, renderBreadcrumbs, renderShareButtons } from './components';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Render as PuckRender } from '@puckeditor/core';
import { puckConfig } from './puck/config';

const LabMuPro: ThemeStructure = {
  name: 'Newspaper Mu Framework',
  version: '3.0.0', // Major update to boilerplate framework
  author: 'LabMu Team',

  // 1. LAYOUT MASTER
  _layout(content: string, title: string, ctx: ThemeContext, layoutType: string = 'layout-right-sidebar') {

    // LOGIC PINTAR MEMILIH DATA SIDEBAR
    let sidebarData: any[] = [];
    if (ctx.sidebarPosts && Array.isArray(ctx.sidebarPosts)) {
        sidebarData = ctx.sidebarPosts;
    } else if (Array.isArray(ctx.data)) {
        sidebarData = ctx.data;
    }

    const isLandingPage = layoutType === 'landing-page';

    // Vanilla JS for Interactive Components
    const modularJs = `
      <script>
        // DOM Ready
        document.addEventListener('DOMContentLoaded', () => {

          // 1. Theme Toggle (Dark/Light Mode)
          const theme = null || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
          document.documentElement.setAttribute('data-theme', theme);

          const toggles = document.querySelectorAll('.theme-toggle');
          toggles.forEach(btn => {
            btn.addEventListener('click', () => {
              const currentTheme = document.documentElement.getAttribute('data-theme');
              const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
              document.documentElement.setAttribute('data-theme', newTheme);
              (void 0);
            });
          });

          // 2. Burger Menu (Mobile)
          const burgerBtn = document.getElementById('burgerBtn');
          const mobileMenu = document.getElementById('mobileMenu');
          if(burgerBtn && mobileMenu) {
            burgerBtn.addEventListener('click', () => {
              mobileMenu.classList.toggle('active');
            });
          }

          // 3. Accordion
          const accordions = document.querySelectorAll('.accordion-header');
          accordions.forEach(acc => {
            acc.addEventListener('click', function() {
              this.classList.toggle('active');
              const panel = this.nextElementSibling;
              if (panel.classList.contains('active')) {
                panel.classList.remove('active');
              } else {
                panel.classList.add('active');
              }
            });
          });

          // 4. Tabs
          const tabBtns = document.querySelectorAll('.tab-btn');
          tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
              const target = this.getAttribute('data-target');
              const tabGroup = this.closest('.tabs').parentElement;

              tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
              this.classList.add('active');

              tabGroup.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
              tabGroup.querySelector(target).classList.add('active');
            });
          });

        });
      </script>
    `;

    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - ${ctx.site?.site_title || 'CMSMu'}</title>
        <meta name="description" content="${ctx.data?.excerpt || ctx.site?.site_desc || ''}">

        <!-- Favicon -->
        <link rel="icon" type="image/x-icon" href="${ctx.site?.site_favicon || '/favicon.svg'}">

        <!-- Open Graph / Social Media Meta Tags -->
        <meta property="og:title" content="${title} - ${ctx.site?.site_title || 'CMSMu'}">
        <meta property="og:description" content="${ctx.data?.excerpt || ctx.site?.site_desc || ''}">
        <meta property="og:image" content="${ctx.data?.featured_image || ctx.site?.header_logo_url || ctx.site?.site_logo || ''}">
        <meta property="og:type" content="${ctx.data?.type === 'post' ? 'article' : 'website'}">

        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title} - ${ctx.site?.site_title || 'CMSMu'}">
        <meta name="twitter:description" content="${ctx.data?.excerpt || ctx.site?.site_desc || ''}">
        <meta name="twitter:image" content="${ctx.data?.featured_image || ctx.site?.header_logo_url || ctx.site?.site_logo || ''}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,900|Open+Sans:300,400,600,700" rel="stylesheet">

        <!-- Icons -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">

        <!-- Tailwind CSS (CDN for dynamic themes) -->
        <script src="https://cdn.tailwindcss.com"></script>

        <style>
          :root {
            --primary: ${ctx.site?.theme_primary || '#2563eb'};
            --bg-body: ${ctx.site?.theme_bg || '#f8fafc'};
            --bg-card: ${ctx.site?.theme_bg || '#ffffff'};
            --text-main: ${ctx.site?.theme_text || '#334155'};
            --accent: ${ctx.site?.theme_accent || '#f59e0b'};
            --header-text: ${ctx.site?.header_text_color || '#334155'};
          }
          ${css}
        </style>
      </head>
      <body>
        <!-- Hook: before_header -->
        ${!isLandingPage ? renderHeader(ctx) : ''}

        <!-- Hook: before_main_content -->
        ${layoutType === 'home' ? renderHero(ctx) : ''}

        ${isLandingPage ? `
          <main id="main-content" role="main" class="w-full">
            ${content}
          </main>
        ` : `
        <div class="max-w-7xl mx-auto px-4 py-8">
          <div class="flex flex-col lg:flex-row gap-10">
            ${layoutType === 'layout-left-sidebar' ? `<div class="w-full lg:w-1/3 flex-shrink-0">${renderSidebar(sidebarData, parseInt(ctx.site?.sidebar_popular_limit as any) || 5)}</div>` : ''}

            <main id="main-content" role="main" class="${layoutType === 'layout-fullwidth' || layoutType === 'layout-landing' ? 'w-full' : 'w-full lg:w-2/3'}">
              ${content}
            </main>

            ${layoutType === 'layout-right-sidebar' ? `<div class="w-full lg:w-1/3 flex-shrink-0">${renderSidebar(sidebarData, parseInt(ctx.site?.sidebar_popular_limit as any) || 5)}</div>` : ''}
          </div>
        </div>
        `}

        <!-- Hook: after_main_content -->
        ${!isLandingPage ? renderFooter(ctx) : ''}

        ${modularJs}
        <!-- Hook: wp_footer equivalent -->
      </body>
      </html>
    `;
  },

  // 2. TAMPILAN HOME (Landing Page EkrafMu / Visual Builder Pages)
  renderHome(ctx: ThemeContext) {
    let puckData: any = { content: [] };
    if (ctx.pageData && ctx.pageData.body) {
      try {
        puckData = JSON.parse(ctx.pageData.body);

        // Ensure defaultProps are merged into the payload to prevent SSR crashes
        // if the database has incomplete JSON (e.g. from manual insertions)
        if (puckData.content && Array.isArray(puckData.content)) {
          puckData.content = puckData.content.map((item: any) => {
             const componentConfig = (puckConfig.components as any)[item.type];
             if (componentConfig && componentConfig.defaultProps) {
                item.props = { ...componentConfig.defaultProps, ...(item.props || {}) };
             }
             return item;
          });
        }
      } catch (e) {
        // Fallback
        puckData = { content: [], root: {}, zones: {} };
      }
    }

    // Fallback if puckData is empty OR contains incompatible blocks from other themes
    const hasNewspaperBlocks = puckData.content && puckData.content.some((item: any) => item.type && item.type.startsWith('Newspaper'));
    if (!hasNewspaperBlocks) {
      puckData = {
        content: [
          { type: "NewspaperHeader", props: { logoUrl: "/theme-assets/newspaper-mu/images/logo.png", menuItems: [{ label: "Home", url: "/" }, { label: "News", url: "/category/news" }] } },
          { type: "NewspaperPostGrid", props: { title: "Latest Articles" } },
          { type: "NewspaperFooter", props: { copyright: "© 2026 cmsMu. All rights reserved." } }
        ],
        root: {},
        zones: {}
      };
    }

    // Generate inner content via PuckRender
    let renderedContent = '';
    try {
      renderedContent = ReactDOMServer.renderToString(
        React.createElement(PuckRender, {
          config: puckConfig as any,
          data: puckData
        })
      );
    } catch (err) {
      console.error("Error rendering Puck:", err);
      renderedContent = '<p class="text-red-500 text-center p-8">Gagal merender halaman visual.</p>';
    }

    // 1. Dynamic Header
    if (renderedContent.includes('NP_HEADER_START')) {
      renderedContent = renderedContent.replace(/<!-- NP_HEADER_START -->/g, renderHeader(ctx));
    }

    // 2. Dynamic Footer
    if (renderedContent.includes('NP_FOOTER_START')) {
      renderedContent = renderedContent.replace(/<!-- NP_FOOTER_START -->/g, renderFooter(ctx));
    }

    const posts = ctx.data || [];

    // 3. Dynamic Big Grid 1
    renderedContent = renderedContent.replace(/<!-- NP_BIG_GRID_1_START:(.*?) -->[\s\S]*?<!-- NP_BIG_GRID_1_END -->/g, (match, slug) => {
        slug = slug.trim();
        const filteredPosts = slug ? posts.filter((p: any) => p.category && p.category.toLowerCase().replace(/\s+/g, '-') === slug) : posts;
        const recentPosts = filteredPosts.slice(0, 3);

        if (recentPosts.length === 0) return '<div class="w-full p-12 text-center bg-slate-50 border border-slate-200 text-slate-500 font-semibold rounded-lg">No articles found.</div>';

        const primaryPost = recentPosts[0];
        const secondaryPosts = recentPosts.slice(1, 3);

        let html = '<div class="grid grid-cols-1 md:grid-cols-3 gap-1 h-[450px]">';
        if (primaryPost) {
            html += `
                <a href="/${primaryPost.slug}" class="md:col-span-2 relative group overflow-hidden bg-slate-900 cursor-pointer block">
                    <img src="${primaryPost.featured_image || 'https://via.placeholder.com/800x600'}" class="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" alt="${primaryPost.title}" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>
                    <div class="absolute bottom-0 left-0 w-full p-6">
                        ${primaryPost.category ? `<span class="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 mb-3 inline-block">${primaryPost.category}</span>` : ''}
                        <h3 class="text-3xl font-bold text-white group-hover:text-blue-300 transition-colors leading-tight mb-2">${primaryPost.title}</h3>
                        <div class="text-slate-300 text-xs font-semibold uppercase tracking-wider flex items-center space-x-3">
                            <span><i class="fas fa-user-circle mr-1"></i> Admin</span>
                            <span>${new Date(primaryPost.created_at).toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'})}</span>
                        </div>
                    </div>
                </a>
            `;
        }
        if (secondaryPosts.length > 0) {
            html += '<div class="flex flex-col gap-1">';
            html += secondaryPosts.map((p: any) => `
                <a href="/${p.slug}" class="h-[223px] relative group overflow-hidden bg-slate-900 cursor-pointer block">
                   <img src="${p.featured_image || 'https://via.placeholder.com/400x300'}" class="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" alt="${p.title}" />
                   <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>
                   <div class="absolute bottom-0 left-0 w-full p-5">
                       ${p.category ? `<span class="bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 mb-2 inline-block">${p.category}</span>` : ''}
                       <h3 class="text-[17px] font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">${p.title}</h3>
                       <div class="text-slate-400 text-[9px] font-semibold uppercase tracking-wider mt-1 flex items-center space-x-2">
                           <span><i class="fas fa-calendar-alt mr-1"></i> ${new Date(p.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}</span>
                       </div>
                   </div>
                </a>
            `).join('');
            html += '</div>';
        }
        html += '</div>';
        return html;
    });

    // 4. Dynamic Flex Block
    renderedContent = renderedContent.replace(/<!-- NP_FLEX_BLOCK_START:(.*?):(\d+) -->[\s\S]*?<!-- NP_FLEX_BLOCK_END -->/g, (match, slug, limitStr) => {
        slug = slug.trim();
        const limit = parseInt(limitStr) || 4;
        const filteredPosts = slug ? posts.filter((p: any) => p.category && p.category.toLowerCase().replace(/\s+/g, '-') === slug) : posts;
        const flexPosts = filteredPosts.slice(0, limit);

        if (flexPosts.length === 0) return '<div class="text-slate-500 text-sm">No articles.</div>';

        let html = '<div class="flex flex-col gap-4">';
        html += flexPosts.map((p: any) => `
            <a href="/${p.slug}" class="flex gap-4 group bg-white border border-slate-100 p-2 hover:shadow-md transition-shadow">
                <div class="w-[140px] h-[100px] md:w-[180px] md:h-[120px] bg-slate-200 flex-shrink-0 overflow-hidden relative">
                    <img src="${p.featured_image || 'https://via.placeholder.com/180x120'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${p.title}" />
                    ${p.category ? `<span class="absolute bottom-0 left-0 bg-black/80 text-white text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5">${p.category}</span>` : ''}
                </div>
                <div class="flex-1 py-1 pr-2 flex flex-col justify-center">
                    <h3 class="font-bold text-slate-900 md:text-lg leading-snug group-hover:text-blue-600 transition-colors mb-2">${p.title}</h3>
                    <div class="flex items-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider space-x-3">
                        <span><i class="fas fa-user-circle mr-1"></i> Admin</span>
                        <span><i class="fas fa-clock mr-1"></i> ${new Date(p.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>
                    </div>
                </div>
            </a>
        `).join('');
        html += '</div>';
        return html;
    });

    // Determine if it's a standard page or landing page based on database layout
    const layout = ctx.pageData?.layout || 'standard';
    const isLandingPage = layout === 'landing';
    const layoutType = isLandingPage ? 'landing-page' : 'layout-fullwidth';

    const title = ctx.pageData?.title || ctx.site?.site_title || 'Halaman';

    // Pass everything to the master layout wrapper
    return this._layout(renderedContent, title, ctx, layoutType);
  },

  // 4. TAMPILAN KATEGORI & PENCARIAN
  renderCategory(ctx: ThemeContext) {
    const posts = ctx.data || [];
    const title = ctx.categoryName || 'Kategori';

    let html = '';

    if (posts.length === 0) {
      html = `<div class="p-12 text-center bg-slate-50 border border-slate-200 rounded-lg">
        <h2 class="text-xl font-bold text-slate-500">No articles found.</h2>
      </div>`;
    } else {
      html = `
      <div class="mb-8 border-b-2 border-slate-900 flex items-center">
        <h2 class="bg-slate-900 text-white font-bold uppercase tracking-wider px-4 py-2 text-sm m-0 inline-block">${title}</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        ${posts.map((p: any) => `
          <article class="flex flex-col group">
            <a href="/${p.slug}" class="block h-[240px] w-full overflow-hidden relative mb-4">
              <img src="${p.featured_image || 'https://placehold.co/600x400/eee/ccc?text=No+Image'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="${p.title}" loading="lazy">
              ${p.category ? `<span class="absolute bottom-4 left-4 bg-blue-600 text-white text-[10px] font-bold uppercase px-2 py-1">${p.category}</span>` : ''}
            </a>
            <div class="flex flex-col flex-grow">
              <h3 class="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors"><a href="/${p.slug}">${p.title}</a></h3>
              <div class="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                <span class="mr-4"><i class="fas fa-user-circle mr-1"></i> Admin</span>
                <span><i class="far fa-clock mr-1"></i> ${new Date(p.created_at).toLocaleDateString('en-US', {day:'numeric', month:'short', year:'numeric'})}</span>
              </div>
              <p class="text-slate-600 text-sm leading-relaxed">${(p.body || '').replace(/<[^>]*>?/gm, '').substring(0, 150)}...</p>
            </div>
          </article>
        `).join('')}
      </div>`;

      // Tambahkan Pagination Jika Ada
      if (ctx.pagination && ctx.pagination.totalPages > 1) {
          const p = ctx.pagination;
          const baseUrl = p.baseUrl || `/search?q=${ctx.query || ''}`;

          html += `<div style="margin-top: 40px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">`;

          if (p.hasPrev) {
              html += `<a href="${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${p.currentPage - 1}" style="padding: 8px 16px; border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-main); font-weight: 500; text-decoration: none; transition: all 0.2s;" onmouseover="this.style.background='var(--primary)'; this.style.color='white'; this.style.borderColor='var(--primary)';" onmouseout="this.style.background='transparent'; this.style.color='var(--text-main)'; this.style.borderColor='var(--border-color)';">&laquo; Sebelumnya</a>`;
          }

          for (let i = 1; i <= p.totalPages; i++) {
              if (i === p.currentPage) {
                  html += `<span style="padding: 8px 16px; background: var(--primary); color: white; border-radius: 8px; font-weight: bold;">${i}</span>`;
              } else {
                  html += `<a href="${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${i}" style="padding: 8px 16px; border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-main); font-weight: 500; text-decoration: none; transition: all 0.2s;" onmouseover="this.style.background='var(--primary)'; this.style.color='white'; this.style.borderColor='var(--primary)';" onmouseout="this.style.background='transparent'; this.style.color='var(--text-main)'; this.style.borderColor='var(--border-color)';">${i}</a>`;
              }
          }

          if (p.hasNext) {
              html += `<a href="${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${p.currentPage + 1}" style="padding: 8px 16px; border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-main); font-weight: 500; text-decoration: none; transition: all 0.2s;" onmouseover="this.style.background='var(--primary)'; this.style.color='white'; this.style.borderColor='var(--primary)';" onmouseout="this.style.background='transparent'; this.style.color='var(--text-main)'; this.style.borderColor='var(--border-color)';">Selanjutnya &raquo;</a>`;
          }

          html += `</div>`;
      }
    }

    return this._layout(html, title, ctx, 'layout-right-sidebar');
  },

  renderSearch(ctx: ThemeContext) {
      if (ctx.query === '_') {
          ctx.categoryName = 'Semua Artikel';
      } else {
          ctx.categoryName = `Hasil Pencarian: "${ctx.query}"`;
      }
      return this.renderCategory(ctx);
  },

  // 3. TAMPILAN SINGLE POST
  renderSingle(ctx: ThemeContext) {
    const post = ctx.data;
    if (!post) return this.render404(ctx);

    // Breadcrumbs
    const breadcrumbs = renderBreadcrumbs([
      { label: post.category || 'Blog', url: post.category ? '/' + post.category.toLowerCase().replace(/\s+/g, '-') : '/blog' },
      { label: post.title }
    ]);

    // Social Share
    const baseUrl = ctx.site?.url || 'https://cmsmu.pages.dev';
    const fullUrl = `${baseUrl}/${post.slug}`;
    const shareButtons = renderShareButtons(fullUrl, post.title);

    // Render list tags HTML
    const tagsHtml = post.tags
      ? post.tags.split(',').map((t: string) => `<a href="/search?q=${encodeURIComponent(t.trim())}" class="badge" style="margin-right:5px; text-decoration:none;">#${t.trim()}</a>`).join('')
      : '';

    // Structured Data (Schema.org)
    const schemaOrg = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "image": post.featured_image ? [post.featured_image] : [],
      "datePublished": new Date(post.created_at).toISOString(),
      "author": [{
          "@type": "Person",
          "name": "Admin",
          "url": baseUrl
        }]
    };

    const template = ctx.site?.np_single_template || '1';
    const showAuthor = ctx.site?.np_show_author_box !== 'false';
    const showRelated = ctx.site?.np_show_related_posts !== 'false';

    let headerHtml = '';
    if (template === '1') {
       // Template 1: Full width overlay
       headerHtml = `
          <div class="relative w-full h-[400px] md:h-[550px] mb-8 bg-slate-900 group">
             ${post.featured_image ? `<img src="${post.featured_image}" class="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" alt="${post.title}" loading="lazy">` : ''}
             <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
             <div class="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
                <div class="max-w-[800px] mx-auto text-center">
                    ${post.category ? `<a href="/category/${post.category.toLowerCase()}" class="bg-blue-600 text-white text-xs font-bold uppercase px-3 py-1 mb-4 inline-block hover:bg-blue-700 transition-colors">${post.category}</a>` : ''}
                    <h1 class="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4 shadow-sm">${post.title}</h1>
                    <div class="flex items-center justify-center text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-wider space-x-6">
                        <span class="flex items-center"><i class="fas fa-user-circle mr-2 text-lg"></i> Admin</span>
                        <span class="flex items-center"><i class="far fa-clock mr-2 text-lg"></i> ${new Date(post.created_at).toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'})}</span>
                    </div>
                </div>
             </div>
          </div>
       `;
    } else {
       // Template 2: Classic Boxed
       headerHtml = `
          <div class="mb-8 border-b border-slate-100 pb-8 text-center pt-8">
             ${post.category ? `<a href="/category/${post.category.toLowerCase()}" class="bg-blue-600 text-white text-xs font-bold uppercase px-2 py-1 mb-4 inline-block hover:bg-blue-700 transition-colors">${post.category}</a>` : ''}
             <h1 class="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-6">${post.title}</h1>
             <div class="flex items-center justify-center text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider space-x-6">
                <span class="flex items-center"><i class="fas fa-user-circle mr-2 text-lg text-slate-400"></i> Admin</span>
                <span class="flex items-center"><i class="far fa-clock mr-2 text-lg text-slate-400"></i> ${new Date(post.created_at).toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'})}</span>
             </div>
          </div>
          ${post.featured_image ? `<img src="${post.featured_image}" class="w-full h-[300px] md:h-[450px] object-cover mb-8 shadow-sm" alt="${post.title}" loading="lazy">` : ''}
       `;
    }

    const authorHtml = showAuthor ? `
        <div class="mt-12 bg-slate-50 p-6 flex gap-6 items-center border border-slate-200">
            <img src="https://ui-avatars.com/api/?name=Admin+LabMu&background=random" class="w-20 h-20 rounded-full shadow-sm" alt="Author">
            <div>
                <h4 class="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">Admin LabMu</h4>
                <p class="text-sm text-slate-600 leading-relaxed">Editor and Content Creator for NewspaperMu.</p>
            </div>
        </div>
    ` : '';

    const relatedHtml = showRelated ? `
        <div class="mt-12">
            <h4 class="text-black font-bold uppercase tracking-wider border-b-2 border-black pb-2 mb-6">Related Articles</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
               <!-- Placeholder for related posts. In a real scenario, fetch based on tags/category -->
               <div class="flex gap-4">
                  <div class="w-24 h-24 bg-slate-200 flex-shrink-0"></div>
                  <div class="flex-1 flex flex-col justify-center">
                     <span class="text-[10px] uppercase font-bold text-blue-600 mb-1">News</span>
                     <h5 class="font-bold text-slate-900 text-sm leading-snug">Sample related post title that looks interesting</h5>
                  </div>
               </div>
               <div class="flex gap-4">
                  <div class="w-24 h-24 bg-slate-200 flex-shrink-0"></div>
                  <div class="flex-1 flex flex-col justify-center">
                     <span class="text-[10px] uppercase font-bold text-blue-600 mb-1">Tech</span>
                     <h5 class="font-bold text-slate-900 text-sm leading-snug">Another great article for you to read today</h5>
                  </div>
               </div>
            </div>
        </div>
    ` : '';

    const html = `
      <article class="bg-white shadow-sm border border-slate-200 overflow-hidden font-sans mb-10">
        ${template === '1' ? headerHtml : ''}

        <div class="p-6 md:p-12 pt-6">
            <div class="mb-6">${breadcrumbs}</div>

            ${template === '2' ? headerHtml : ''}

            <div class="prose prose-lg prose-slate max-w-none prose-headings:font-black prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-img:rounded-xl">
              <!-- Hook: before_content -->
              ${post.body || '<p>Isi konten belum ditulis...</p>'}
              <!-- Hook: after_content -->
            </div>

            ${tagsHtml ? `
              <div class="mt-12 pt-6 border-t border-slate-200 flex items-center gap-3">
                 <strong class="text-slate-900 uppercase font-bold tracking-wider text-sm">Tags:</strong>
                 <div class="flex flex-wrap gap-2">${tagsHtml}</div>
              </div>
            ` : ''}

            <div class="mt-8">
                ${shareButtons}
            </div>

            ${authorHtml}
            ${relatedHtml}
        </div>

        <!-- Schema Markup -->
        <script type="application/ld+json">
          ${JSON.stringify(schemaOrg)}
        </script>
      </article>
    `;
    return this._layout(html, post.title, ctx, 'layout-right-sidebar');
  },

  // 4. PAGE & 404
  renderPage(ctx: ThemeContext) {
    const post = ctx.data;
    if (!post) return this.render404(ctx);

    const breadcrumbs = renderBreadcrumbs([
      { label: 'Halaman', url: '#' },
      { label: post.title }
    ]);

    let contentHtml = post.body || '<p>Isi konten belum ditulis...</p>';
    let isPuck = false;

    // Deteksi apakah body adalah JSON Puck
    if (contentHtml.trim().startsWith('{') && contentHtml.trim().endsWith('}')) {
      try {
        const puckData = JSON.parse(contentHtml);
        if (puckData.content) {
          isPuck = true;
          // Render SSR dengan React
          contentHtml = ReactDOMServer.renderToString(
            React.createElement(PuckRender, {
              config: puckConfig as any,
              data: puckData
            })
          );

          // Phase 3: Dynamic Data Integration (D1)
          if (contentHtml.includes('id="newspaper-post-grid-placeholder"')) {
             const posts = ctx.data || [];
             const recentPosts = posts.slice(0, 3);
             let dynamicHtml = '';

             if (recentPosts.length > 0) {
               dynamicHtml = recentPosts.map((p: any) => `
                 <div class="td-big-grid-wrapper" style="margin-bottom:20px;">
                    <div class="td_module_mx5 td-animation-stack td-big-grid-post-0 td-big-grid-post">
                        <div class="td-module-image">
                           <div class="td-module-thumb"><a href="/${p.slug}"><img src="${p.featured_image || 'https://via.placeholder.com/600x400'}" /></a></div>
                           <div class="td-post-category">${p.category || 'News'}</div>
                        </div>
                        <div class="td-meta-info-container">
                           <div class="td-meta-align">
                              <h3 class="entry-title"><a href="/${p.slug}">${p.title}</a></h3>
                           </div>
                        </div>
                    </div>
                 </div>
               `).join('');
             } else {
               dynamicHtml = '<p style="padding: 20px;">Belum ada artikel.</p>';
             }

             // Ganti placeholder dengan dynamic html
             contentHtml = contentHtml.replace(/<!-- NEWSPAPER_POST_GRID_START -->[\s\S]*<!-- NEWSPAPER_POST_GRID_END -->/, dynamicHtml);
          }
        }
      } catch (e) {
        console.error("Gagal parse Puck JSON di renderPage:", e);
      }
    }

    // Halaman biasanya menggunakan layout full width (tanpa sidebar)
    let html = '';
    let layoutType = 'layout-full-width';

    if (isPuck) {
      // Jika Puck, jadikan sebagai landing page agar mendapatkan Tailwind CSS dan bebas header default
      html = contentHtml;
      layoutType = 'layout-landing';
    } else {
      html = `
        <article>
          ${breadcrumbs}
          <div class="entry-header">
             <h1 class="entry-title">${post.title}</h1>
          </div>
          ${post.featured_image ? `<img src="${post.featured_image}" class="entry-image" alt="${post.title}" loading="lazy">` : ''}
          <div class="entry-content">
            ${contentHtml}
          </div>
        </article>
      `;
    }

    return this._layout(html, post.title, ctx, layoutType);
  },

  render404(ctx: ThemeContext) {
    const html = `
      <div style="text-align:center; padding: 100px 0; max-width:600px; margin:0 auto;">
        <h1 style="font-size:6rem; color:var(--primary); margin-bottom:0;">404</h1>
        <h2 style="font-size:2rem; margin-bottom:1rem;">Halaman Tidak Ditemukan</h2>
        <p style="color:var(--text-muted); margin-bottom:2rem;">Maaf, halaman yang Anda cari mungkin telah dihapus, dipindahkan, atau tidak pernah ada.</p>
        <a href="/" class="btn btn-primary"><i class="fas fa-home"></i> Kembali ke Beranda</a>
      </div>
    `;
    return this._layout(html, 'Not Found', ctx, 'layout-full');
  }
};

export default LabMuPro;