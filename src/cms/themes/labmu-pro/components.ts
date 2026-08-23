import type { ThemeContext } from '../../themes/types';

export const renderHeader = (ctx: ThemeContext) => {
  const headerStyle = ctx.site?.labmu_header_style || 'classic';

  if (headerStyle === '1' || headerStyle === '2') {
    // --- MAGAZINE STYLE HEADER ---
    const siteTitle = ctx.site?.site_title || ctx.site?.title || 'LabMu Pro';
    const logoUrl = ctx.site?.header_logo_url || ctx.site?.site_logo;
    const menus = ctx.menus || [];

    const showTopbar = ctx.site?.labmu_show_topbar !== 'false';
    const showAd = ctx.site?.labmu_show_ad_header !== 'false';

    const topBarHtml = showTopbar ? `
        <!-- Top Bar -->
        <div class="bg-[#222] text-slate-300 text-[11px] py-1 hidden md:block">
          <div class="max-w-[1140px] mx-auto px-4 flex justify-between items-center">
              <div class="flex space-x-5 uppercase tracking-widest font-semibold">
                <span>${new Date().toLocaleDateString('id-ID', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <div class="flex space-x-4 border-l border-slate-600 pl-4">
                    <a href="/about" class="hover:text-white transition-colors">Tentang Kami</a>
                    <a href="/contact" class="hover:text-white transition-colors">Kontak</a>
                </div>
              </div>
              <div class="flex space-x-5 items-center">
                <a href="#" class="hover:text-white"><i class="fab fa-facebook-f"></i></a>
                <a href="#" class="hover:text-white"><i class="fab fa-twitter"></i></a>
                <a href="#" class="hover:text-white"><i class="fab fa-youtube"></i></a>
                <a href="/sys/login" class="hover:text-white uppercase font-bold text-white border-l border-slate-600 pl-4"><i class="fas fa-user-circle mr-1"></i> Sign In</a>
              </div>
          </div>
        </div>
    ` : '';

    const adHtml = showAd ? `
          <div class="hidden md:flex w-[728px] h-[90px] bg-slate-50 border border-slate-200 items-center justify-center text-slate-300 text-xs font-semibold uppercase tracking-widest shadow-inner relative">
              <span class="absolute top-1 left-2 text-[9px] text-slate-300">- Advertisement -</span>
          </div>
    ` : '';

    const logoHtml = `
            <a href="/" class="inline-block">
              ${logoUrl ? `<img src="${logoUrl}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" alt="Logo" class="h-16 object-contain" /><h1 style="display:none;" class="text-[2.75rem] font-black tracking-tighter text-slate-900 leading-none">${siteTitle.split(' ')[0] || siteTitle}<span class="text-green-600">${siteTitle.split(' ')[1] || ''}</span></h1>` : `<h1 class="text-[2.75rem] font-black tracking-tighter text-slate-900 leading-none">${siteTitle.split(' ')[0] || siteTitle}<span class="text-green-600">${siteTitle.split(' ')[1] || ''}</span></h1>`}
            </a>
    `;

    const bannerRowHtml = headerStyle === '2' ? `
        <!-- Style 2: Logo Center -->
        <div class="max-w-[1140px] mx-auto px-4 py-8 flex flex-col items-center justify-center gap-6 text-center">
          ${logoHtml}
          ${adHtml}
        </div>
    ` : `
        <!-- Style 1: Logo Left, Ad Right -->
        <div class="max-w-[1140px] mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex-shrink-0">${logoHtml}</div>
          ${adHtml}
        </div>
    `;

    return `
      <header class="w-full font-sans shadow-sm bg-white border-b-2 border-black">
        ${topBarHtml}
        ${bannerRowHtml}

        <!-- Main Navigation Menu -->
        <div class="bg-black w-full relative z-50">
          <div class="max-w-[1140px] mx-auto px-4">
            <nav class="flex items-center justify-between">
                <ul class="flex flex-col md:flex-row m-0 p-0 list-none font-bold uppercase text-[13px] tracking-wider">
                    <li class="hidden md:block">
                        <a href="/" class="px-4 py-4 block text-white hover:text-green-400 transition-colors border-b-2 border-transparent hover:border-green-500"><i class="fas fa-home"></i></a>
                    </li>
                    ${menus.map((m: any) => `
                      <li>
                        <a href="${m.url}" class="px-4 py-4 block text-white hover:text-green-400 transition-colors border-b-2 border-transparent hover:border-green-500">
                          ${m.label || m.title}
                        </a>
                      </li>
                    `).join('')}
                </ul>
                <div class="flex items-center px-4 py-4 text-white hover:text-green-400 cursor-pointer transition-colors">
                  <i class="fas fa-search"></i>
                </div>
            </nav>
          </div>
        </div>
      </header>
    `;
  }

  // --- CLASSIC STYLE HEADER ---
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
    ? menus.map((m: any) => `<a href="${m.url}" class="nav-link" style="${textStyle}">${m.label || m.title}</a>`).join('\\n        ')
    : `<a href="/" class="nav-link" style="${textStyle}">Home</a>`;

  const mobileMenuHtml = menus.length > 0
    ? menus.map((m: any) => `<a href="${m.url}" class="nav-link">${m.label || m.title}</a>`).join('\\n    ')
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

export const renderFooter = (ctx: ThemeContext) => {
  const footerStyle = ctx.site?.labmu_footer_style || 'classic';

  if (footerStyle === 'light' || footerStyle === 'dark') {
    // --- MAGAZINE STYLE FOOTER ---
    const isLight = footerStyle === 'light';
    const bgClass = isLight ? 'bg-white text-slate-800' : 'bg-[#111111] text-slate-400';
    const titleClass = isLight ? 'text-slate-900' : 'text-white';
    const borderClass = isLight ? 'border-[#eee]' : 'border-[#333]';
    const boxBg = isLight ? 'bg-slate-100' : 'bg-[#222]';

    return `
    <footer class="w-full ${bgClass} font-sans border-t-[3px] border-green-600 mt-20">
      <div class="max-w-[1140px] mx-auto px-4 py-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div class="flex flex-col gap-6">
              <h2 class="text-3xl font-black tracking-tighter ${titleClass} uppercase">LabMu<span class="text-green-600">Pro</span></h2>
              <p class="text-sm leading-relaxed">${ctx.site?.site_desc || 'LabMu Pro Theme Edition.'}</p>
              <div class="flex space-x-4">
                  <a href="#" class="w-10 h-10 ${boxBg} ${isLight?'text-slate-800':'text-white'} flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors"><i class="fab fa-facebook-f"></i></a>
                  <a href="#" class="w-10 h-10 ${boxBg} ${isLight?'text-slate-800':'text-white'} flex items-center justify-center hover:bg-green-400 hover:text-white transition-colors"><i class="fab fa-twitter"></i></a>
                  <a href="#" class="w-10 h-10 ${boxBg} ${isLight?'text-slate-800':'text-white'} flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors"><i class="fab fa-youtube"></i></a>
              </div>
            </div>

            <div>
              <h4 class="${titleClass} font-bold uppercase tracking-wider mb-6 pb-2 border-b ${borderClass} inline-block">Kategori Populer</h4>
              <ul class="space-y-3 text-sm">
                  <li><a href="#" class="hover:text-green-500 flex justify-between"><span>Teknologi</span> <span class="${boxBg} px-2 rounded-full text-xs">14</span></a></li>
                  <li><a href="#" class="hover:text-green-500 flex justify-between"><span>Bisnis</span> <span class="${boxBg} px-2 rounded-full text-xs">9</span></a></li>
                  <li><a href="#" class="hover:text-green-500 flex justify-between"><span>Gaya Hidup</span> <span class="${boxBg} px-2 rounded-full text-xs">25</span></a></li>
              </ul>
            </div>

            <div>
              <h4 class="${titleClass} font-bold uppercase tracking-wider mb-6 pb-2 border-b ${borderClass} inline-block">Artikel Terbaru</h4>
              <ul class="space-y-4 text-sm" id="footer-recent-posts">
                  <li class="flex gap-4 group">
                      <div class="flex flex-col justify-center">
                        <span class="text-xs text-slate-500">Memuat artikel...</span>
                      </div>
                  </li>
              </ul>
            </div>
        </div>
      </div>

      <div class="${isLight ? 'bg-slate-100 border-[#eee]' : 'bg-black border-[#222]'} py-6 text-xs text-center border-t">
        <div class="max-w-[1140px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; ${new Date().getFullYear()} ${ctx.site?.site_title || 'CMSMu'}. All rights reserved.</p>
            <ul class="flex space-x-6 uppercase font-semibold">
              <li><a href="#" class="hover:text-green-500">Disclaimer</a></li>
              <li><a href="#" class="hover:text-green-500">Privacy</a></li>
              <li><a href="#" class="hover:text-green-500">Terms</a></li>
            </ul>
        </div>
      </div>
      <script>
        document.addEventListener("DOMContentLoaded", function() {
          fetch('/api/posts?limit=3')
            .then(res => res.json())
            .then(data => {
              if(!Array.isArray(data)) return;
              let published = data.filter(p => p.status === 'publish').slice(0, 3);
              const container = document.getElementById('footer-recent-posts');
              if(container && published.length > 0) {
                container.innerHTML = published.map(p => \`
                  <li class="flex gap-4 group">
                      <div class="w-16 h-16 ${boxBg} flex-shrink-0 relative overflow-hidden">
                        <img src="\${p.featured_image || 'https://placehold.co/150'}" class="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div class="flex flex-col justify-center">
                        <a href="/\${p.slug}" class="font-bold ${titleClass} hover:text-green-500 leading-snug">\${p.title}</a>
                        <span class="text-xs mt-1">\${new Date(p.created_at).toLocaleDateString()}</span>
                      </div>
                  </li>
                \`).join('');
              }
            });
        });
      </script>
    </footer>
    `;
  }

  // --- CLASSIC STYLE FOOTER ---
  return `
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
};

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