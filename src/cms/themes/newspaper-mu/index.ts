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
          const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
          document.documentElement.setAttribute('data-theme', theme);
          
          const toggles = document.querySelectorAll('.theme-toggle');
          toggles.forEach(btn => {
            btn.addEventListener('click', () => {
              const currentTheme = document.documentElement.getAttribute('data-theme');
              const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
              document.documentElement.setAttribute('data-theme', newTheme);
              localStorage.setItem('theme', newTheme);
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
          <main id="main-content" role="main">
            ${content}
          </main>
        ` : `
        <div class="container main-wrapper ${layoutType}">
          ${layoutType === 'layout-left-sidebar' ? renderSidebar(sidebarData, parseInt(ctx.site?.sidebar_popular_limit as any) || 5) : ''}

          <main id="main-content" role="main">
            ${content}
          </main>

          ${layoutType === 'layout-right-sidebar' ? renderSidebar(sidebarData, parseInt(ctx.site?.sidebar_popular_limit as any) || 5) : ''}
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
        puckData = {
          content: [
            { type: "CustomHTML", props: { id: "RawHTML", html: ctx.pageData.body } }
          ],
          root: {},
          zones: {}
        };
      }
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

    // Dynamic posts replacement for RecentPosts block
    if (renderedContent.includes('recent-posts-placeholder')) {
      const posts = ctx.data || [];
      const recentPosts = posts.slice(0, 3);
      let dynamicPostsHtml = '';
      
      if (recentPosts.length > 0) {
        dynamicPostsHtml = recentPosts.map((p: any) => `
          <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:border-green-100 transition-all duration-300 flex flex-col group cursor-pointer" onclick="window.location.href='/${p.slug}'">
              <div class="h-48 w-full bg-slate-200 relative overflow-hidden">
                  <img src="${p.featured_image || 'https://placehold.co/800x400/eee/ccc?text=No+Image'}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                  <div class="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-green-700 shadow-sm">${p.category || 'Berita'}</div>
              </div>
              <div class="p-6 flex flex-col flex-grow">
                  <span class="text-sm text-slate-500 mb-2">${new Date(p.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</span>
                  <h3 class="text-xl font-bold text-slate-900 mb-3 group-hover:text-green-600 transition duration-300">${p.title}</h3>
                  <p class="text-slate-600 text-sm mb-6 flex-grow leading-relaxed">${(p.body || '').replace(/<[^>]*>?/gm, '').substring(0, 100)}...</p>
                  <a href="/${p.slug}" class="text-green-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                      Baca Selengkapnya <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                  </a>
              </div>
          </div>
        `).join('');
      } else {
        dynamicPostsHtml = '<p class="text-slate-500 col-span-3 text-center">Belum ada artikel yang diterbitkan.</p>';
      }

      // Exact string replacement to avoid HTML corruption from regex
      const placeholderHtml = '<div class="recent-posts-placeholder"><div class="grid md:grid-cols-3 gap-8"><div class="bg-slate-100 animate-pulse h-80 rounded-2xl"></div><div class="bg-slate-100 animate-pulse h-80 rounded-2xl hidden md:block"></div><div class="bg-slate-100 animate-pulse h-80 rounded-2xl hidden md:block"></div></div></div>';
      renderedContent = renderedContent.replace(
        placeholderHtml,
        `<div class="grid md:grid-cols-3 gap-8">${dynamicPostsHtml}</div>`
      );
    }

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
      html = `<div style="text-align: center; padding: 50px 20px;">
        <h2 style="font-size: var(--text-xl); color: var(--text-main);">Belum ada artikel ditemukan.</h2>
      </div>`;
    } else {
      html = `
      <div style="margin-bottom: 20px;">
        <h2 style="font-size:var(--text-2xl); border-bottom: 2px solid var(--primary); padding-bottom:10px; display:inline-block;">${title}</h2>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-2">
        ${posts.map((p: any) => `
          <article class="card post-card">
            <a href="/${p.slug}">
              <img src="${p.featured_image || 'https://placehold.co/600x400/eee/ccc?text=No+Image'}" class="post-thumb" alt="${p.title}" loading="lazy">
            </a>
            <div class="post-content">
              <span class="badge badge-primary" style="align-self: flex-start; margin-bottom: 10px;">${p.category || p.type}</span>
              <h3 class="post-title"><a href="/${p.slug}">${p.title}</a></h3>
              <p class="post-excerpt">${(p.body || '').replace(/<[^>]*>?/gm, '').substring(0, 120)}...</p>
              
              <div class="post-meta">
                <span><i class="far fa-calendar"></i> ${new Date(p.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}</span>
              </div>
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

    const html = `
      <article>
        ${breadcrumbs}
        
        <div class="entry-header">
           <h1 class="entry-title">${post.title}</h1>
           <div class="entry-meta">
              <span><i class="far fa-calendar"></i> ${new Date(post.created_at).toLocaleDateString('id-ID', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}</span>
              <span><i class="far fa-folder"></i> ${post.category || post.type}</span>
              <span><i class="far fa-user"></i> Admin</span>
           </div>
        </div>

        ${post.featured_image ? `<img src="${post.featured_image}" class="entry-image" alt="${post.title}" loading="lazy">` : ''}

        <div class="entry-content">
          <!-- Hook: before_content -->
          ${post.body || '<p>Isi konten belum ditulis...</p>'}
          <!-- Hook: after_content -->
        </div>

        ${tagsHtml ? `
          <div style="margin-top:2rem; padding-top:1.5rem; border-top:1px solid var(--border-color);">
             <strong style="margin-right:10px; color:var(--text-main);">Tags:</strong> ${tagsHtml}
          </div>
        ` : ''}

        ${shareButtons}
        
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
              config: puckConfig,
              data: puckData
            })
          );
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