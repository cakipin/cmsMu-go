import type { ThemeContext } from '../../themes/types';

// --- 1. HEADER (DENGAN BURGER MENU & DROPDOWN) ---
export const renderHeader = (ctx: ThemeContext) => {
  const siteTitle = ctx.site?.site_title || ctx.site?.title || 'CMSMu';
  const logoUrl = ctx.site?.header_logo_url || ctx.site?.site_logo;
  const logoContent = logoUrl 
    ? `<img src="${logoUrl}" alt="${siteTitle} Logo" style="max-height: 40px;">` 
    : `<i class="fas fa-layer-group"></i> <span>${siteTitle}</span>`;
  
  const textStyle = `color: ${ctx.site?.header_text_color || 'var(--header-text)'} !important;`;
  
  let menuWrapperStyle = '';
  if (ctx.site?.header_menu_position === 'center') {
    menuWrapperStyle = 'margin: 0 auto;';
  } else if (ctx.site?.header_menu_position === 'left') {
    menuWrapperStyle = 'margin-right: auto; margin-left: 2rem;';
  }

  const menus = ctx.menus || [];
  const desktopMenuHtml = menus.length > 0 
    ? menus.map((m: any) => `<a href="${m.url}" class="nav-link" style="${textStyle}">${m.label || m.title}</a>`).join('\n        ')
    : `<a href="/" class="nav-link" style="${textStyle}">Home</a>`;

  const mobileMenuHtml = menus.length > 0
    ? menus.map((m: any) => `<a href="${m.url}" class="nav-link">${m.label || m.title}</a>`).join('\n    ')
    : `<a href="/" class="nav-link">Home</a>`;

  return `
  <header class="pro-header">
    <div class="container header-inner">
      <a href="/" class="logo" style="${textStyle}">
        ${logoContent}
      </a>
      
      <!-- Desktop Menu -->
      <nav class="nav-menu" style="${menuWrapperStyle}">
        ${desktopMenuHtml}
        <button class="theme-toggle" id="themeToggleBtn" aria-label="Toggle Dark Mode" style="${textStyle}; background:none; border:none; font-size:1.2rem; cursor:pointer; margin-left:1rem;">
           <i class="fas fa-moon icon-moon"></i>
           <i class="fas fa-sun icon-sun" style="display:none;"></i>
        </button>
      </nav>

      <!-- Mobile Burger Button -->
      <button class="burger-btn" id="burgerBtn" aria-label="Toggle Menu" style="${textStyle}">
        <i class="fas fa-bars"></i>
      </button>
    </div>
  </header>

  <!-- Mobile Off-Canvas Menu -->
  <div class="mobile-menu" id="mobileMenu">
    ${mobileMenuHtml}
    <button class="btn btn-outline theme-toggle" id="mobileThemeToggleBtn" style="justify-content:center; margin-top:1rem;">
       <i class="fas fa-moon icon-moon"></i>
       <i class="fas fa-sun icon-sun" style="display:none;"></i> 
       <span style="margin-left:8px;">Toggle Theme</span>
    </button>
  </div>
`;
};

// --- 2. HERO SECTION ---
export const renderHero = (ctx: ThemeContext) => {
  const title = ctx.site?.landing_title || 'Starter Framework LabMu Pro';
  const subtitle = ctx.site?.landing_subtitle || 'Tema boilerplate modern dengan Grid, Dark Mode, Komponen UI interaktif, dan optimasi performa tinggi untuk membangun web yang cepat.';
  const ctaText = ctx.site?.landing_cta_text || 'Mulai Sekarang';
  const ctaLink = ctx.site?.landing_cta_link || '/admin';
  const img1 = ctx.site?.landing_image_1 || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800';
  const img2 = ctx.site?.landing_image_2 || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800';
  const img3 = ctx.site?.landing_image_3 || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800';

  return `
  <section class="landing-hero">
    <div class="container">
      <h1 class="landing-title">${title}</h1>
      <p class="landing-subtitle">${subtitle}</p>
      
      <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; margin-bottom: 2rem;">
         <a href="${ctaLink}" class="btn btn-primary" style="padding: 1rem 2rem; font-size: 1.1rem; border-radius: 50px;">${ctaText}</a>
      </div>

      <!-- Curved Showcase Grid -->
      <div class="curved-showcase">
        <div class="curved-showcase-item">
          <img src="${img1}" loading="lazy" alt="Showcase 1">
        </div>
        <div class="curved-showcase-item">
          <img src="${img2}" loading="lazy" alt="Showcase 2">
        </div>
        <div class="curved-showcase-item">
          <img src="${img3}" loading="lazy" alt="Showcase 3">
        </div>
      </div>
    </div>
  </section>
  `;
};

// --- 3. CUSTOM SIDEBAR ---
export const renderSidebar = (posts: any[], popularLimit: number = 5) => `
  <aside>
    <!-- Hook: before_sidebar -->
    <!-- Profile Widget Removed
    <div class="widget">
      <div style="text-align:center;">
        <img src="https://ui-avatars.com/api/?name=Admin+LabMu&background=random" style="width:80px; height:80px; border-radius:50%; margin:0 auto 15px;" loading="lazy" alt="Admin Profile">
        <h4 style="margin:0;">Admin LabMu</h4>
        <p style="font-size:var(--text-sm); color:var(--text-muted); margin-top:5px;">Web Developer & Content Creator.</p>
      </div>
    </div>
    -->


    <div class="widget">
      <h4 class="widget-title">Terpopuler</h4>
      <ul class="widget-list" id="sidebar-popular-posts">
        ${posts.length > 0 ? posts.slice(0, popularLimit).map(p => `
          <li>
            <img src="${p.featured_image || 'https://placehold.co/150'}" class="mini-thumb" loading="lazy" alt="${p.title}">
            <div>
              <a href="/${p.slug}" style="font-weight:600; line-height:1.2; display:block; font-size:var(--text-sm);">${p.title}</a>
              <small style="color:var(--text-muted);">${new Date(p.created_at).toLocaleDateString()}</small>
            </div>
          </li>
        `).join('') : '<li style="text-align:center; padding:10px; font-size:12px; color:#888;">Memuat data...</li>'}
      </ul>
    </div>

    <div class="widget">
      <h4 class="widget-title">Tags</h4>
      <div style="display:flex; flex-wrap:wrap; gap:5px;" id="sidebar-tags">
        ${posts.length > 0 ? Array.from(new Set(posts.flatMap(p => p.tags ? p.tags.split(',').map((t: string) => t.trim()) : []))).slice(0, 7).map(tag => `
          <a href="/search?q=${encodeURIComponent(String(tag))}" style="background:#f1f5f9; padding:5px 10px; border-radius:4px; font-size:12px;">${tag}</a>
        `).join('') : '<span style="font-size:12px; color:#888;">Memuat data...</span>'}
      </div>
    </div>
    <!-- Hook: after_sidebar -->
    
    ${posts.length === 0 ? `
    <script>
      document.addEventListener("DOMContentLoaded", function() {
        fetch('/api/posts')
          .then(res => res.json())
          .then(data => {
            if(!Array.isArray(data)) return;
            // Filter hanya yg publish
            let published = data.filter(p => p.status === 'publish');
            
            // Render Terpopuler
            const popularContainer = document.getElementById('sidebar-popular-posts');
            if(popularContainer && published.length > 0) {
              popularContainer.innerHTML = published.slice(0, ${popularLimit}).map(p => \`
                <li>
                  <img src="\${p.featured_image || 'https://placehold.co/150'}" class="mini-thumb" loading="lazy" alt="\${p.title}">
                  <div>
                    <a href="/\${p.slug}" style="font-weight:600; line-height:1.2; display:block; font-size:var(--text-sm);">\${p.title}</a>
                    <small style="color:var(--text-muted);">\${new Date(p.created_at).toLocaleDateString()}</small>
                  </div>
                </li>
              \`).join('');
            }

            // Render Tags (7 Terpopuler)
            const tagsContainer = document.getElementById('sidebar-tags');
            if(tagsContainer) {
              let tagCounts = {};
              published.forEach(p => {
                if(p.tags) {
                  p.tags.split(',').forEach(t => {
                    let tag = t.trim();
                    if(tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                  });
                }
              });
              let sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]).slice(0, 7);
              if(sortedTags.length > 0) {
                tagsContainer.innerHTML = sortedTags.map(tag => \`
                  <a href="/search?q=\${encodeURIComponent(tag)}" style="background:#f1f5f9; padding:5px 10px; border-radius:4px; font-size:12px;">\${tag}</a>
                \`).join('');
              } else {
                tagsContainer.innerHTML = '<span style="font-size:12px; color:#888;">Tidak ada tag.</span>';
              }
            }
          })
          .catch(e => console.error('Error fetching sidebar data:', e));
      });
    </script>
    ` : ''}
  </aside>
`;

// --- 4. FOOTER ---
export const renderFooter = (ctx: ThemeContext) => `
  <footer class="pro-footer">
    <!-- Hook: before_footer -->
    <div class="container">
      <div class="grid lg:grid-cols-4 md:grid-cols-2 footer-grid">
        <div class="footer-col" style="grid-column: span 1;">
           <a href="/" class="logo" style="color:white; margin-bottom:1rem; display:inline-flex;">
             <i class="fas fa-layer-group"></i> LabMu Pro
           </a>
           <p style="opacity:0.8; font-size:var(--text-sm); margin-bottom:1rem;">${ctx.site?.site_desc || 'Website modern berbasis Cloudflare.'}</p>
           <div class="social-share" style="border:none; padding:0; margin:0;">
             <a href="#" class="share-btn share-fb" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
             <a href="#" class="share-btn share-tw" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
             <a href="#" class="share-btn share-wa" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
           </div>
        </div>
        
        <div class="footer-col">
           <h4>Perusahaan</h4>
           <ul class="footer-links">
              <li><a href="#">Tentang Kami</a></li>
              <li><a href="#">Karir</a></li>
              <li><a href="#">Hubungi Kami</a></li>
              <li><a href="#">Mitra</a></li>
           </ul>
        </div>

        <div class="footer-col">
           <h4>Bantuan</h4>
           <ul class="widget-list footer-links" style="border:none;">
              <li><a href="/">Home</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/terms-of-service">Terms of Service</a></li>
              <li><a href="#">FAQ</a></li>
           </ul>
        </div>
        
        <div class="footer-col">
           <h4>Newsletter</h4>
           <p style="margin-bottom:15px; font-size:var(--text-sm);">Dapatkan update terbaru seputar pengembangan web.</p>
           <form class="form-group" onsubmit="event.preventDefault(); alert('Ini adalah dummy newsletter form.');">
              <input type="email" class="form-control" placeholder="Email Anda..." style="margin-bottom:10px;" required>
              <button type="submit" class="btn btn-primary" style="width:100%;">Subscribe</button>
           </form>
        </div>
      </div>
      
      <div class="footer-bottom">
         &copy; ${new Date().getFullYear()} ${ctx.site?.site_title || 'CMSMu'}. All rights reserved. Built with LabMu CMS Framework.
      </div>
    </div>
    <!-- Hook: after_footer -->
  </footer>
`;

// --- 5. BREADCRUMBS HELPER ---
export const renderBreadcrumbs = (items: {label: string, url?: string}[]) => `
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="/"><i class="fas fa-home"></i> Home</a>
    ${items.map(item => `
      <span class="breadcrumb-separator"><i class="fas fa-chevron-right" style="font-size:0.7em;"></i></span>
      ${item.url ? `<a href="${item.url}">${item.label}</a>` : `<span style="color:var(--text-main); font-weight:600;" aria-current="page">${item.label}</span>`}
    `).join('')}
  </nav>
`;

// --- 6. SOCIAL SHARE HELPER ---
export const renderShareButtons = (url: string, title: string) => `
  <div class="social-share">
    <span style="font-weight:600; font-size:var(--text-sm); margin-right:10px;">Share:</span>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" class="share-btn share-fb" aria-label="Share on Facebook"><i class="fab fa-facebook-f"></i></a>
    <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}" target="_blank" class="share-btn share-tw" aria-label="Share on Twitter"><i class="fab fa-twitter"></i></a>
    <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}" target="_blank" class="share-btn share-wa" aria-label="Share on WhatsApp"><i class="fab fa-whatsapp"></i></a>
  </div>
`;