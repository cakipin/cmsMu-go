import type { ThemeContext } from '../types';
import { css } from './style';
import { escapeHtml } from './utils';
export function _layout(this: any, content: string, title: string, ctx: ThemeContext, pageType: string = '') {
    const siteTitle = escapeHtml(ctx.site.site_title || ctx.site.title || "Suara 'Aisyiyah");
    const c = ctx as any;
    const siteDesc = escapeHtml(ctx.site.description || "Inspirasi perempuan berkemajuan");
    const canonical = c.canonical || 'https://suaraaisyiyah.id/';
    const isHome = title === 'Beranda' || pageType === 'home';
    const pageTitle = isHome ? "Suara 'Aisyiyah | Inspirasi Perempuan Berkemajuan" : `${escapeHtml(title)} — ${siteTitle}`;
    const defaultHomeDesc = "Suara 'Aisyiyah adalah majalah perempuan muslim tertua di Indonesia sejak 1926. Menyajikan inspirasi perempuan berkemajuan, berita, kajian, dan literasi peradaban.";
    const metaDesc = escapeHtml(c.metaDesc || (isHome ? defaultHomeDesc : (ctx.site.description || "Inspirasi perempuan berkemajuan")));
    const ogImg = escapeHtml(c.ogImage || 'https://suaraaisyiyah.id/default-og.jpg');
    
    // Top Banner Logic
    let topBannerHtml = '';
    const showOnHome = ctx.site.sa_top_banner_enable_home === 'true';
    const showOnPost = ctx.site.sa_top_banner_enable_post === 'true';
    const showOnPage = ctx.site.sa_top_banner_enable_page === 'true';

    let showBanner = false;
    if (pageType === 'home' && showOnHome) showBanner = true;
    if (pageType === 'post' && showOnPost) showBanner = true;
    if (pageType === 'page' && showOnPage) showBanner = true;
    if (pageType === '' && isHome && showOnHome) showBanner = true;
    
    if (showBanner && (ctx.site.sa_top_banner_image || ctx.site.sa_top_banner_html)) {
      if (ctx.site.sa_top_banner_html) {
         topBannerHtml = `<div class="top-banner-wrapper container sa-style-1" >${ctx.site.sa_top_banner_html}</div>`;
      } else {
         const linkStr = ctx.site.sa_top_banner_link ? `href="${ctx.site.sa_top_banner_link}" target="_blank"` : '';
         const tagStr = ctx.site.sa_top_banner_link ? 'a' : 'div';
         topBannerHtml = `<div class="top-banner-wrapper container sa-style-2" >
            <${tagStr} ${linkStr} class="sa-block-link">
              <img src="${ctx.site.sa_top_banner_image}" alt="Banner" class="sa-style-3">
            </${tagStr}>
         </div>`;
      }
    }
    
    // JSON-LD WebSite (for all pages)
    const jsonLdWebsite = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Suara 'Aisyiyah",
      "url": "https://suaraaisyiyah.id",
      "description": isHome ? defaultHomeDesc : (ctx.site.description || "Inspirasi perempuan berkemajuan"),
      "potentialAction": { "@type": "SearchAction", "target": "https://suaraaisyiyah.id/search?q={search_term_string}", "query-input": "required name=search_term_string" }
    });

    const currentLang = (ctx as any).lang || 'id';
    const langPrefix = currentLang && currentLang !== 'id' ? `/${currentLang}` : '';

    const translateMenuLabel = (label: string) => {
      if (!label) return '';
      const trimmed = label.trim();
      const lower = trimmed.toLowerCase();

      if (currentLang === 'en') {
        const map: Record<string, string> = {
          'berita': 'News',
          'kajian': 'Studies',
          'keluarga sakinah': 'Sakinah Family',
          'wawasan': 'Insights',
          'gaya hidup': 'Lifestyle',
          'inspirasi': 'Inspiration',
          'muda': 'Youth',
          'e-majalah': 'E-Magazine',
          'home': 'Home',
          'beranda': 'Home',
          'kirim tulisan': 'Submit Article',
          'berlangganan': 'Subscribe',
          'masuk': 'Login',
          'keluar': 'Logout',
          'inspirasi perempuan berkemajuan': 'Inspiration for Progressive Women',
          'tentang': 'About',
          "redaksi suara 'aisyiyah": "Suara 'Aisyiyah Editorial",
          'konsultasi': 'Consultation',
          'sanggahan': 'Disclaimer',
          'kontak kami': 'Contact Us',
          'informasi': 'Information',
          'layanan': 'Services',
          'info berlangganan': 'Subscription Info',
          "suara 'aisyiyah digital": "Suara 'Aisyiyah Digital",
          "suara 'aisyiyah institute": "Suara 'Aisyiyah Institute",
          'pusat data & pustaka sa': 'SA Data & Library Center',
          'info iklan & advertorial': 'Advertising & Advertorial Info',
          'agen': 'Agents',
          'pedoman media siber': 'Cyber Media Guidelines',
          'kebijakan privasi': 'Privacy Policy',
          'syarat & ketentuan': 'Terms of Service',
          // Child Submenus
          'fikih perempuan': "Women's Jurisprudence",
          'konsultasi agama': 'Religious Consultation',
          'kalam': 'Theology & Kalam',
          'kebijakan politik': 'Political Policy',
          'politik dan hukum': 'Politics & Law',
          'pendidikan': 'Education',
          'sains dan tekno': 'Science & Tech',
          'sosial budaya': 'Socio-Cultural',
          'sejarah': 'History',
          'perempuan': 'Women',
          'finansial': 'Financial',
          'kesehatan': 'Health',
          'wirausaha': 'Entrepreneurship',
          'tokoh': 'Figures',
          'liputan': 'Coverage',
          'lensa organisasi': 'Organizational Lens',
          'hikmah': 'Wisdom',
          'qaryah thayyibah': 'Qaryah Thayyibah',
          'anak': 'Children',
          'aksara': 'Literacy',
          'keluarga': 'Family',
          'parenting': 'Parenting',
          'konsultasi keluarga': 'Family Consultation',
        };
        return map[lower] || trimmed;
      }
      if (currentLang === 'ar') {
        const map: Record<string, string> = {
          'berita': 'الأخبار',
          'kajian': 'الدراسات',
          'keluarga sakinah': 'الأسرة السكينة',
          'wawasan': 'رؤى',
          'gaya hidup': 'أسلوب حياة',
          'inspirasi': 'إلهام',
          'muda': 'شباب',
          'e-majalah': 'المجلة الإلكترونية',
          'home': 'الرئيسية',
          'beranda': 'الرئيسية',
          'kirim tulisan': 'أرسل مقالاً',
          'berlangganan': 'اشتراك',
          'masuk': 'تسجيل الدخول',
          'keluar': 'تسجيل الخروج',
          'inspirasi perempuan berkemajuan': 'إلهام المرأة المتقدمة',
          'tentang': 'حول',
          "redaksi suara 'aisyiyah": 'هيئة تحرير صوت عائشية',
          'konsultasi': 'استشارة',
          'sanggahan': 'إخلاء المسؤولية',
          'kontak kami': 'اتصل بنا',
          'informasi': 'معلومات',
          'layanan': 'خدمات',
          'info berlangganan': 'معلومات الاشتراك',
          "suara 'aisyiyah digital": 'صوت عائشية الرقمية',
          "suara 'aisyiyah institute": 'معهد صوت عائشية',
          'pusat data & pustaka sa': 'مركز البيانات والمكتبة',
          'info iklan & advertorial': 'معلومات الإعلان والتحرير',
          'agen': 'الوكلاء',
          'pedoman media siber': 'إرشادات الإعلام الإلكتروني',
          'kebijakan privasi': 'سياسة الخصوصية',
          'syarat & ketentuan': 'شروط الخدمة',
          // Child Submenus
          'fikih perempuan': 'فقه المرأة',
          'konsultasi agama': 'استشارة دينية',
          'kalam': 'علم الكلام',
          'kebijakan politik': 'السياسة والسياسات',
          'politik dan hukum': 'السياسة والقانون',
          'pendidikan': 'التعليم',
          'sains dan tekno': 'العلوم والتكنولوجيا',
          'sosial budaya': 'الاجتماعية والثقافية',
          'sejarah': 'التاريخ',
          'perempuan': 'المرأة',
          'finansial': 'المالية',
          'kesehatan': 'الصحة',
          'wirausaha': 'ريادة الأعمال',
          'tokoh': 'شخصيات',
          'liputan': 'تغطيات',
          'lensa organisasi': 'عدسة المنظمة',
          'hikmah': 'حكمة',
          'qaryah thayyibah': 'قرية طيبة',
          'anak': 'الأطفال',
          'aksara': 'الأدب والمعرفة',
          'keluarga': 'الأسرة',
          'parenting': 'تربية الأطفال',
          'konsultasi keluarga': 'استشارة أسرية',
        };
        return map[lower] || trimmed;
      }
      return trimmed;
    };

    const formatMenuUrl = (url: string) => {
      if (!url) return langPrefix || '/';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      if (!langPrefix) return url;
      const clean = url.startsWith('/') ? url : `/${url}`;
      if (clean === '/') return langPrefix;
      return `${langPrefix}${clean}`;
    };

    // Group menus for footer
    const menuItems = ctx.menus?.length ? ctx.menus : [
      {label:'Home',url:'/'},{label:'Berita',url:'/berita'},{label:'Kajian',url:'/kajian'},
      {label:'Keluarga Sakinah',url:'/keluarga-sakinah'},{label:'Wawasan',url:'/wawasan'},{label:'Gaya Hidup',url:'/gaya-hidup'},{label:'Inspirasi',url:'/inspirasi'},{label:'Muda',url:'/muda'},{label:'E-Majalah',url:'/majalah'}
    ];

    // Build tree
    const rootMenus = menuItems.filter((m:any) => {
      const pid = m.parent_id ?? m.parentId;
      return !pid || pid === 0 || pid === '0' || pid === 'null';
    });
    rootMenus.forEach((r:any) => {
       r.children = menuItems.filter((m:any) => {
         const pid = m.parent_id ?? m.parentId;
         return pid && String(pid) === String(r.id);
       });
    });

    const items = rootMenus.map((m:any) => {
      const mLabel = translateMenuLabel(m.label);
      const mUrl = formatMenuUrl(m.url);
      if (m.children && m.children.length > 0) {
           const allLabel = currentLang === 'en' 
             ? `All ${mLabel} &rarr;` 
             : (currentLang === 'ar' ? `&larr; كل ${mLabel}` : `Semua ${mLabel} &rarr;`);
           return `<div class="dropdown">
              <button type="button" class="dropdown-trigger" onclick="toggleMenuDropdown(event, this)">
                ${escapeHtml(mLabel)} <span class="dropdown-chevron">&#9662;</span>
              </button>
              <div class="dropdown-content">
                  <a href="${escapeHtml(mUrl)}" class="dropdown-parent-link"><strong>${allLabel}</strong></a>
                  ${m.children.map((c:any) => `<a href="${escapeHtml(formatMenuUrl(c.url))}">${escapeHtml(translateMenuLabel(c.label))}</a>`).join('')}
              </div>
           </div>`;
      }
      if (m.label.toLowerCase() === 'home' || m.label.toLowerCase() === 'beranda') {
        return `<a href="${escapeHtml(mUrl)}" aria-label="Home" class="sa-style-4"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></a>`;
      }
      if (m.url === '/majalah' || m.label.toLowerCase().includes('majalah')) {
        return `<a href="${escapeHtml(mUrl)}" class="nav-emajalah-btn" title="E-Majalah Suara 'Aisyiyah"><i class="fas fa-book-open"></i> <span>${escapeHtml(mLabel)}</span></a>`;
      }
      return `<a href="${escapeHtml(mUrl)}">${escapeHtml(mLabel)}${m.new?'<sup>New</sup>':''}</a>`;
    }).join('');


    const popupHtml = ctx.site.sa_popup_enable === 'true' && (ctx.site.sa_popup_html || ctx.site.sa_popup_image) ? `
      <div id="sa-popup-overlay" class="sa-style-5">
        <div class="sa-popup-content sa-style-6" >
          <button id="sa-popup-close" class="sa-style-7">&times;</button>
          ${ctx.site.sa_popup_html ? ctx.site.sa_popup_html : `
            <a href="${ctx.site.sa_popup_link || '#'}" ${ctx.site.sa_popup_link ? 'target="_blank"' : ''} class="sa-style-8">
              <img src="${ctx.site.sa_popup_image}" alt="Popup Banner" class="sa-style-9">
            </a>
          `}
        </div>
      </div>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          if (!sessionStorage.getItem('sa_popup_closed')) {
            setTimeout(function() {
              const overlay = document.getElementById('sa-popup-overlay');
              if (overlay) {
                overlay.style.display = 'flex';
              }
            }, ${parseInt(ctx.site.sa_popup_delay || 3) * 1000});
          }
          
          const closeBtn = document.getElementById('sa-popup-close');
          if (closeBtn) {
            closeBtn.addEventListener('click', function() {
              document.getElementById('sa-popup-overlay').style.display = 'none';
              sessionStorage.setItem('sa_popup_closed', 'true');
            });
          }
          
          const overlay = document.getElementById('sa-popup-overlay');
          if (overlay) {
            overlay.addEventListener('click', function(e) {
              if (e.target === overlay) {
                overlay.style.display = 'none';
                sessionStorage.setItem('sa_popup_closed', 'true');
              }
            });
          }
        });
      </script>
    ` : '';
    
    return `<!doctype html><html lang="${escapeHtml(currentLang)}" ${currentLang === 'ar' ? 'dir="rtl"' : ''}>
    <head>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>${pageTitle}</title>
      <meta name="description" content="${metaDesc}">
      <link rel="icon" href="/favicon.svg" type="image/svg+xml">
      <link rel="alternate icon" href="/favicon.ico">
      <!-- Open Graph -->
      <meta property="og:type" content="${isHome ? 'website' : 'article'}">
      <meta property="og:site_name" content="${escapeHtml(siteTitle || 'CMSMu')}">
      <meta property="og:title" content="${pageTitle}">
      <meta property="og:description" content="${metaDesc}">
      <meta property="og:url" content="${canonical}">
      <meta property="og:image" content="${ogImg}">
      <meta property="og:image:width" content="1200">
      <meta property="og:image:height" content="630">
      <meta property="og:image:alt" content="${escapeHtml(siteTitle)} — ${escapeHtml(siteDesc)}">
      <meta property="og:locale" content="${currentLang === 'en' ? 'en_US' : (currentLang === 'ar' ? 'ar_AR' : 'id_ID')}">
      <!-- Twitter Card -->
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${pageTitle}">
      <meta name="twitter:description" content="${metaDesc}">
      <meta name="twitter:image" content="${ogImg}">
      <meta name="twitter:site" content="@suaraaisyiyah">
      <!-- JSON-LD WebSite -->
      <script type="application/ld+json">${jsonLdWebsite}</script>
      <style>${css}</style>
</head>
<body>
    <div class="site-wrapper">
      <div class="topbar">
        <div class="container">
          <ul class="topbar-links">
            <li id="khgt-date" class="sa-style-10">&#128197;</li>
          </ul>
          <ul class="topbar-right">
            <li>
              <div class="lang-switcher" style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:700;">
                <button type="button" onclick="switchLanguage('id')" id="lang-btn-id" title="Bahasa Indonesia" style="background:${currentLang === 'id' ? 'rgba(255,255,255,0.25)' : 'none'}; border:none; border-radius:4px; color:#ffffff; cursor:pointer; padding:2px 5px; font-size:12px; font-weight:700;">🇮🇩 ID</button>
                <span style="opacity:0.5; color:#ffffff;">|</span>
                <button type="button" onclick="switchLanguage('en')" id="lang-btn-en" title="English" style="background:${currentLang === 'en' ? 'rgba(255,255,255,0.25)' : 'none'}; border:none; border-radius:4px; color:#ffffff; opacity:${currentLang === 'en' ? '1' : '0.85'}; cursor:pointer; padding:2px 5px; font-size:12px; font-weight:700;">🇬🇧 EN</button>
                <span style="opacity:0.5; color:#ffffff;">|</span>
                <button type="button" onclick="switchLanguage('ar')" id="lang-btn-ar" title="العربية" style="background:${currentLang === 'ar' ? 'rgba(255,255,255,0.25)' : 'none'}; border:none; border-radius:4px; color:#ffffff; opacity:${currentLang === 'ar' ? '1' : '0.85'}; cursor:pointer; padding:2px 5px; font-size:12px; font-weight:700;">🇸🇦 AR</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="sticky-header-wrapper sa-style-11" >
      <header class="header sa-style-12" >
        <div class="container sa-style-13" >
          <div class="header-logo-section sa-style-14" >
            <a href="${formatMenuUrl('/')}" aria-label="${escapeHtml(siteTitle || 'CMSMu')}" class="sa-style-15">
              <img src="${(ctx && (ctx.site_logo || ctx.logo)) ? (ctx.site_logo || ctx.logo) : '/logo.svg'}" alt="${escapeHtml(siteTitle || 'CMSMu')}" class="logo-img sa-style-16" style="max-height:46px;width:auto;object-fit:contain;" onerror="this.outerHTML='<h1 style=\\'font-weight:900;color:#0d9488;font-size:24px;margin:0;\\'>CMSMu</h1>'" />
            </a>
            <span class="hide-mobile sa-style-17">${translateMenuLabel(siteDesc || 'Portal Berita & Publikasi Modern')}</span>
          </div>
          <div class="header-actions-section sa-style-14" >
            <div class="header-socials hide-mobile sa-style-18" >
              <a href="https://www.facebook.com/suaraaisyiyah" target="_blank" class="sa-style-19" title="Facebook"><i class="fab fa-facebook"></i></a>
              <a href="https://www.instagram.com/suaraaisyiyah" target="_blank" class="sa-style-19" title="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="https://twitter.com/suaraaisyiyah" target="_blank" class="sa-style-19" title="X"><i class="fab fa-x-twitter"></i></a>
              <a href="https://www.tiktok.com/@suaraaisyiyah" target="_blank" class="sa-style-19" title="TikTok"><i class="fab fa-tiktok"></i></a>
            </div>
            <a href="${formatMenuUrl('/kirim-tulisan')}" class="kirim-btn sa-style-20"  title="${translateMenuLabel('Kirim Tulisan')}"><span class="sa-style-21">✍️</span> <span class="kirim-text">${translateMenuLabel('Kirim Tulisan')}</span></a>
            <a href="${formatMenuUrl('/berlangganan')}" class="berlangganan-btn sa-style-22" >${translateMenuLabel('Berlangganan')}</a>
            <!-- Auth Section: Login Button / Avatar Dropdown -->
            <div id="header-auth-box" class="header-auth-box">
              <!-- Tombol Login (Tamu) -->
              <a href="/admin/login" id="header-login-btn" class="header-login-btn" title="${translateMenuLabel('Masuk')}">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                <span>${translateMenuLabel('Masuk')}</span>
              </a>

              <!-- Avatar Pengguna (Setelah Login, tanpa teks) + Dropdown -->
              <div id="header-user-wrapper" class="header-user-wrapper" style="display:none;">
                <button type="button" id="header-user-avatar-btn" class="header-user-avatar-btn" aria-label="Menu Pengguna" aria-expanded="false" onclick="toggleUserDropdown(event)" title="Akun Pengguna">
                  <span id="header-user-avatar-content" class="header-user-avatar-content"></span>
                </button>
                <div id="header-user-dropdown" class="header-user-dropdown" style="display:none;">
                  <div class="user-dropdown-header">
                    <div id="dropdown-user-name" class="dropdown-user-name">Pengguna</div>
                    <div id="dropdown-user-role" class="dropdown-user-role">Subscriber</div>
                  </div>
                  <div class="user-dropdown-divider"></div>
                  <a href="/admin/profile" id="dropdown-profile-link" class="user-dropdown-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span id="dropdown-profile-text">Profile</span>
                  </a>
                  <a href="/admin" id="dropdown-dash-link" class="user-dropdown-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    <span id="dropdown-dash-text">Dasbor</span>
                  </a>
                  <div class="user-dropdown-divider"></div>
                  <button type="button" class="user-dropdown-item logout-item" onclick="headerUserLogout()">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
            <button class="search-btn sa-style-23" aria-label="Cari" onclick="document.getElementById('site-search').showModal()" >&#128269;</button>
            <button class="theme-toggle-btn sa-style-23" id="themeToggleBtn" aria-label="Mode Siang/Malam" onclick="toggleDarkMode()" title="Mode Siang/Malam">🌙</button>
          </div>
        </div>
      </header>
      <script>
        function toggleUserDropdown(e) {
          if (e) {
            e.stopPropagation();
            e.preventDefault();
          }
          var dd = document.getElementById('header-user-dropdown');
          var btn = document.getElementById('header-user-avatar-btn');
          if (!dd) return;
          var isHidden = dd.style.display === 'none' || !dd.style.display;
          dd.style.display = isHidden ? 'block' : 'none';
          if (btn) btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
        }

        // Anti-LocalStorage Interceptor: Mengalihkan seluruh pembacaan/penulisan token ke Cookie
        (function() {
          try {
            var origGet = Storage.prototype.getItem;
            var origSet = Storage.prototype.setItem;
            var origRemove = Storage.prototype.removeItem;
            window.__origLsRemove = origRemove;

            function getCookieVal(name) {
              var parts = (document.cookie || '').split(';');
              for (var i = 0; i < parts.length; i++) {
                var p = parts[i].trim();
                if (p.indexOf(name + '=') === 0) {
                  return decodeURIComponent(p.substring(name.length + 1));
                }
              }
              return '';
            }

            Storage.prototype.getItem = function(k) {
              if (k === 'labmu_token' || k === 'admin_token') {
                return getCookieVal('labmu_token');
              }
              return origGet.apply(this, arguments);
            };

            Storage.prototype.setItem = function(k, v) {
              if (k === 'labmu_token' || k === 'admin_token') {
                document.cookie = 'labmu_token=' + encodeURIComponent(v) + '; Path=/; Max-Age=2592000; SameSite=Lax';
                origRemove.call(this, 'labmu_token');
                origRemove.call(this, 'admin_token');
                return;
              }
              return origSet.apply(this, arguments);
            };

            Storage.prototype.removeItem = function(k) {
              if (k === 'labmu_token' || k === 'admin_token' || k === 'labmu_user') {
                origRemove.call(this, k);
                return;
              }
              return origRemove.apply(this, arguments);
            };
          } catch(e) {}
        })();

        function getAuthCookieToken() {
          var parts = (document.cookie || '').split(';');
          for (var i = 0; i < parts.length; i++) {
            var p = parts[i].trim();
            if (p.indexOf('labmu_token=') === 0) {
              return decodeURIComponent(p.substring(12));
            }
          }
          return '';
        }

        function clearAuthCookieToken() {
          document.cookie = 'labmu_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
          try {
            if (window.__origLsRemove) {
              window.__origLsRemove.call(window.localStorage, 'labmu_token');
              window.__origLsRemove.call(window.localStorage, 'admin_token');
              window.__origLsRemove.call(window.localStorage, 'labmu_user');
            }
          } catch(e) {}
        }

        function headerUserLogout() {
          clearAuthCookieToken();
          window.location.reload();
        }

        function initHeaderAuth() {
          try {
            var raw = getAuthCookieToken();
            try {
              if (window.__origLsRemove) {
                window.__origLsRemove.call(window.localStorage, 'labmu_token');
                window.__origLsRemove.call(window.localStorage, 'admin_token');
              }
            } catch(e){}
            if (!raw) return;
            var payload = JSON.parse(atob(raw));
            if (!payload || !payload.id) return;

            var loginBtn = document.getElementById('header-login-btn');
            var userWrap = document.getElementById('header-user-wrapper');
            var avatarContent = document.getElementById('header-user-avatar-content');
            var nameEl = document.getElementById('dropdown-user-name');
            var roleEl = document.getElementById('dropdown-user-role');

            if (loginBtn) loginBtn.style.display = 'none';
            if (userWrap) userWrap.style.display = 'inline-flex';

            var displayName = payload.n || payload.name || payload.username || 'Pengguna';
            var role = payload.role || 'Subscriber';
            var avatarUrl = payload.avatar || '';

            if (nameEl) nameEl.textContent = displayName;
            if (roleEl) roleEl.textContent = role.toUpperCase();

            var u = encodeURIComponent(payload.username || 'me');
            var roleLower = String(role).toLowerCase();
            var isSub = (roleLower === 'subscriber' || roleLower === 'subscriber_pro' || roleLower === 'member');
            var profLink = document.getElementById('dropdown-profile-link');
            var dashLink = document.getElementById('dropdown-dash-link');
            var dashText = document.getElementById('dropdown-dash-text');

            if (isSub) {
              if (profLink) profLink.href = '/@' + u;
              if (dashLink) dashLink.href = '/@' + u;
              if (dashText) dashText.textContent = 'Akses Pro & Koleksi';
              document.body.classList.add('is-sub-pro');
              var subBtns = document.querySelectorAll('.berlangganan-btn');
              subBtns.forEach(function(b) { b.style.setProperty('display', 'none', 'important'); });
            } else {
              if (profLink) profLink.href = '/admin/profile';
              if (dashLink) dashLink.href = '/admin';
              if (dashText) dashText.textContent = 'Dasbor Admin';
            }

            if (avatarContent) {
              avatarContent.innerHTML = '';
              var initial = (displayName.trim().charAt(0) || 'U').toUpperCase();
              if (avatarUrl && avatarUrl.trim()) {
                var img = document.createElement('img');
                img.src = avatarUrl;
                img.alt = '';
                img.className = 'header-avatar-img';
                img.onerror = function() {
                  if (this.parentNode) {
                    this.parentNode.innerHTML = '<span class="header-avatar-initial">' + initial + '</span>';
                  }
                };
                avatarContent.appendChild(img);
              } else {
                var span = document.createElement('span');
                span.className = 'header-avatar-initial';
                span.textContent = initial;
                avatarContent.appendChild(span);
              }
            }
          } catch (e) {
            console.debug('Header auth init:', e);
          }
        }
        initHeaderAuth();

        function switchLanguage(lang) {
           var p = window.location.pathname;
           var cleanPath = p;
           if (p.indexOf('/en/') === 0) cleanPath = p.substring(3);
           else if (p === '/en') cleanPath = '/';
           else if (p.indexOf('/ar/') === 0) cleanPath = p.substring(3);
           else if (p === '/ar') cleanPath = '/';
           if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;

           if (lang === 'id') {
             window.location.href = cleanPath + window.location.search;
           } else {
             var targetPath = '/' + lang + (cleanPath === '/' ? '' : cleanPath);
             window.location.href = targetPath + window.location.search;
           }
        }
        function toggleDarkMode() {
          var isDark = document.documentElement.classList.toggle('dark-mode');
          var btn = document.getElementById('themeToggleBtn');
          var floatBtn = document.getElementById('darkModeFloatBtn');
          var icon = isDark ? '☀️' : '🌙';
          if (btn) btn.innerText = icon;
          if (floatBtn) floatBtn.innerText = icon;
          try { localStorage.setItem('sa_theme', isDark ? 'dark' : 'light'); } catch(e){}
        }
        (function() {
          try {
            var saved = localStorage.getItem('sa_theme');
            if (saved === 'dark' || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark-mode');
            }
          } catch(e){}
        })();
        document.addEventListener('DOMContentLoaded', function() {
          initHeaderAuth();
          document.addEventListener('click', function(e) {
            var dd = document.getElementById('header-user-dropdown');
            var wrapper = document.getElementById('header-user-wrapper');
            if (dd && wrapper && !wrapper.contains(e.target)) {
              dd.style.display = 'none';
              var btn = document.getElementById('header-user-avatar-btn');
              if (btn) btn.setAttribute('aria-expanded', 'false');
            }
          });
          var isDark = document.documentElement.classList.contains('dark-mode');
          var btn = document.getElementById('themeToggleBtn');
          var floatBtn = document.getElementById('darkModeFloatBtn');
          var icon = isDark ? '☀️' : '🌙';
          if (btn) btn.innerText = icon;
          if (floatBtn) floatBtn.innerText = icon;
        });

        function closeAllMenuDropdowns() {
          document.querySelectorAll('.dropdown.active').forEach(function(d) {
            d.classList.remove('active');
            var c = d.querySelector('.dropdown-content');
            if (c) {
              c.style.removeProperty('display');
              c.style.removeProperty('position');
              c.style.removeProperty('top');
              c.style.removeProperty('left');
              c.style.removeProperty('z-index');
            }
          });
        }

        window.toggleMenuDropdown = function(e, btn) {
          e.preventDefault();
          e.stopPropagation();
          var dropdown = btn.closest('.dropdown');
          if (!dropdown) return;
          var content = dropdown.querySelector('.dropdown-content');
          var wasActive = dropdown.classList.contains('active');

          closeAllMenuDropdowns();

          if (!wasActive) {
            dropdown.classList.add('active');
            if (content && window.innerWidth <= 900) {
              var rect = btn.getBoundingClientRect();
              content.style.position = 'fixed';
              content.style.top = (rect.bottom + 6) + 'px';
              var maxLeft = window.innerWidth - 240;
              var leftPos = Math.max(10, Math.min(rect.left, maxLeft));
              content.style.left = leftPos + 'px';
              content.style.zIndex = '9999';
              content.style.display = 'block';
            }
          }
        };

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
          if (!e.target.closest('.dropdown')) {
            closeAllMenuDropdowns();
          }
        });

        // Close dropdown on Escape key
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') {
            closeAllMenuDropdowns();
          }
        });

        // Close dropdown on window resize / orientation change
        window.addEventListener('resize', closeAllMenuDropdowns);

        // Close dropdown on page scroll for mobile so fixed popover doesn't detach
        window.addEventListener('scroll', function() {
          if (window.innerWidth <= 900) {
            closeAllMenuDropdowns();
          }
        }, { passive: true });
      </script>
      <div class="nav-wrap sa-style-24" >
        <nav class="container nav" aria-label="Navigasi utama">${items}</nav>
      </div>
    </div>
      
      ${topBannerHtml}

      <dialog id="site-search">
        <form method="GET" action="/search">
          <div class="search-form-inner">
            <input name="q" placeholder="Cari artikel…" autofocus>
            <button type="submit">Cari</button>
          </div>
          <button type="button" class="search-close" onclick="this.closest('dialog').close()">Tutup (Esc)</button>
        </form>
      </dialog>
      
      <main>${content}</main>
      
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-col sa-style-25" >
              <h4>${currentLang === 'en' ? `About ${escapeHtml(siteTitle || 'CMSMu')}` : `Tentang ${escapeHtml(siteTitle || 'CMSMu')}`}</h4>
              <p class="footer-desc">${currentLang === 'en' 
                ? `${escapeHtml(siteDesc || 'CMSMu is a modern, high-performance, cloud-native headless and decoupled CMS built for the serverless era.')} <span style="white-space: nowrap;"><a href="${formatMenuUrl('/tentang')}" style="display: inline !important; text-decoration: underline; color: #38bdf8; font-weight: 500;">Read More &raquo;</a></span>`
                : `${escapeHtml(siteDesc || 'CMSMu adalah platform sistem manajemen konten (CMS) modern, tangguh, dan terdistribusi berbasis serverless Cloudflare.')} <span style="white-space: nowrap;"><a href="${formatMenuUrl('/tentang')}" style="display: inline !important; text-decoration: underline; color: #38bdf8; font-weight: 500;">Selengkapnya &raquo;</a></span>`
              }</p>
              <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px; margin-top: 15px;">
                <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                  <img src="/api/media/file/2026/08/1787910684332-logomuri.webp" alt="Rekor Muri" class="sa-style-27" style="max-height: 45px; width: auto;">
                </div>
                <div style="border-top: 1px solid rgba(255,255,255,0.3); margin: 6px 0 4px 0; width: 100%; max-width: 250px;"></div>
                <div class="footer-social-icons" style="display: flex; gap: 14px; align-items: center; font-size: 18px;">
                  <a href="https://www.facebook.com/suaraaisyiyah" target="_blank" rel="noopener" style="color:#ffffff;" title="Facebook"><i class="fab fa-facebook"></i></a>
                  <a href="https://www.instagram.com/suaraaisyiyah" target="_blank" rel="noopener" style="color:#ffffff;" title="Instagram"><i class="fab fa-instagram"></i></a>
                  <a href="https://twitter.com/suaraaisyiyah" target="_blank" rel="noopener" style="color:#ffffff;" title="X"><i class="fab fa-x-twitter"></i></a>
                  <a href="https://www.tiktok.com/@suaraaisyiyah" target="_blank" rel="noopener" style="color:#ffffff;" title="TikTok"><i class="fab fa-tiktok"></i></a>
                  <a href="https://www.youtube.com/@suaraaisyiyah" target="_blank" rel="noopener" style="color:#ffffff;" title="YouTube"><i class="fab fa-youtube"></i></a>
                </div>
              </div>
            </div>
            
            <div class="footer-col">
              <h4>${translateMenuLabel('Informasi')}</h4>
              <ul>
                <li><a href="${formatMenuUrl('/tentang')}">${translateMenuLabel('Tentang')}</a></li>
                <li><a href="${formatMenuUrl('/redaksi')}">${translateMenuLabel("Redaksi Suara 'Aisyiyah")}</a></li>
                <li><a href="${formatMenuUrl('/kirim-tulisan')}">${translateMenuLabel('Kirim Tulisan')}</a></li>
                <li><a href="${formatMenuUrl('/konsultasi')}">${translateMenuLabel('Konsultasi')}</a></li>
                <li><a href="${formatMenuUrl('/sanggahan')}">${translateMenuLabel('Sanggahan')}</a></li>
                <li><a href="${formatMenuUrl('/kontak')}">${translateMenuLabel('Kontak Kami')}</a></li>
              </ul>
            </div>
            
            <div class="footer-col">
              <h4 class="sa-style-30">${translateMenuLabel('Layanan')}</h4>
              <ul>
                <li><a href="${formatMenuUrl('/berlangganan')}">${translateMenuLabel('Info Berlangganan')}</a></li>
                <li><a href="${formatMenuUrl('/digital')}">${translateMenuLabel("Suara 'Aisyiyah Digital")}</a></li>
                <li><a href="${formatMenuUrl('/institute')}">${translateMenuLabel("Suara 'Aisyiyah Institute")}</a></li>
                <li><a href="${formatMenuUrl('/pusat-data')}">${translateMenuLabel('Pusat Data & Pustaka SA')}</a></li>
                <li><a href="${formatMenuUrl('/info-iklan')}">${translateMenuLabel('Info Iklan & Advertorial')}</a></li>
                <li><a href="${formatMenuUrl('/agen')}">${translateMenuLabel('Agen')}</a></li>
              </ul>
            </div>
            
            <div class="footer-col contact-col sa-style-25" >
              <h4>${translateMenuLabel('Kontak Kami')}</h4>
              <ul>
                <li><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Kauman Gm I/17A Yogyakarta 55122</li>
                <li><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg> <a href="mailto:suaraaisyiyah@aisyiyah.or.id">suaraaisyiyah@aisyiyah.or.id</a></li>
                <li><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> (0274) 373263</li>
                <li><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zm5.32 14.19c-.22.61-1.28 1.15-1.78 1.21-.46.06-1.04.14-3.32-.81-2.73-1.14-4.52-3.95-4.66-4.14-.14-.19-1.11-1.48-1.11-2.82 0-1.34.7-2.02.94-2.29.25-.27.53-.33.71-.33.18 0 .36 0 .52.01.18 0 .41-.07.64.48.24.57.77 1.88.84 2.02.07.14.12.3.02.48-.1.19-.15.31-.29.47-.14.16-.31.35-.43.48-.14.14-.29.29-.12.58.16.29.73 1.21 1.57 1.95 1.08.96 2.01 1.26 2.29 1.4.29.14.45.12.63-.08.18-.21.78-.91 1-1.22.21-.31.43-.26.7-.16.27.1 1.73.81 2.03.96.3.15.5.22.57.34.07.13.07.72-.15 1.33z"/></svg> <a href="https://wa.me/62817270787" target="_blank" rel="noopener">0817 270 787</a></li>
                <li><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg> <a href="https://g.page/suara-aisyiyah?share" target="_blank" rel="noopener">${currentLang === 'en' ? 'Google Maps' : (currentLang === 'ar' ? 'خرائط جوجل' : 'Peta Google')}</a></li>
              </ul>
            </div>
          </div>
          <div class="copyright">
            <div class="copy-text sa-style-31" >
              <span>© ${new Date().getFullYear()} Suara 'Aisyiyah. ${currentLang === 'en' ? 'All rights reserved.' : (currentLang === 'ar' ? 'جميع الحقوق محفوظة.' : 'Hak cipta dilindungi undang-undang.')}</span>
              <span class="sa-style-32">|</span>
              <a href="${formatMenuUrl('/privacy-policy')}" class="sa-style-33">Privacy Policy</a>
              <span class="sa-style-32">|</span>
              <a href="${formatMenuUrl('/terms-of-service')}" class="sa-style-33">Terms of Service</a>
              <span class="sa-style-32">|</span>
              <a href="${formatMenuUrl('/pedoman-media-siber')}" class="sa-style-33">${translateMenuLabel('Pedoman Media Siber')}</a>
            </div>
          </div>
        </div>
      </footer>
      <script>
        (async function() {
          const el = document.getElementById('khgt-date');
          if (!el) return;
          try {
            const today = new Date();
            const masehi = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            const year = today.getFullYear();
            const month = today.getMonth(); // 0-based
            const day = today.getDate();
            const cacheKey = 'khgt_' + year;
            let calData = null;
            try { calData = JSON.parse(sessionStorage.getItem(cacheKey) || 'null'); } catch(e){}
            if (!calData) {
              const res = await fetch('/api/public/khgt');
              if (res.ok) {
                const json = await res.json();
                calData = json.data;
                try { sessionStorage.setItem(cacheKey, JSON.stringify(calData)); } catch(e){}
              }
            }
            let hijriStr = '';
            if (Array.isArray(calData)) {
              for (const hMonth of calData) {
                const days = (hMonth.days || []).filter(d => d !== null && d !== undefined);
                const found = days.find(d => d.gregorian_date === day && d.gregorian_month === month && d.gregorian_year === year);
                if (found) {
                  hijriStr = found.hijri_date + ' ' + hMonth.hijri_month_name + ' ' + hMonth.hijri_year + ' H';
                  break;
                }
              }
            }
            if (hijriStr) {
              el.innerHTML = masehi + ' / ' + hijriStr + ' <a href="https://khgt.muhammadiyah.or.id" target="_blank" rel="noopener" class="sa-style-34">(KHGT)</a>';
            } else {
              el.textContent = masehi;
            }
          } catch(e) {
            el.textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
          }
        })();

        // KHGT Prayer Times Widget
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                const d = new Date();
                const t = d.getTime() - (d.getTimezoneOffset() * 60000);
                const dateStr = new Date(t).toISOString().split('T')[0];
                const res = await fetch('https://api-khgt.muhammadiyah.or.id/api/sholat/schedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lat: '-7.7956', lng: '110.3695', date: dateStr, mode: 'daily' })
                });
                const json = await res.json();
                if (json.success && json.data && json.data.schedules && json.data.schedules.length > 0) {
                    const s = json.data.schedules[0];
                    const container = document.getElementById('prayer-times-container');
                    const times = [
                       { name: 'Imsak', time: s.imsak },
                       { name: 'Subuh', time: s.subuh },
                       { name: 'Syuruq', time: s.terbit },
                       { name: 'Dzuhur', time: s.dzuhur },
                       { name: 'Ashar', time: s.ashar },
                       { name: 'Maghrib', time: s.maghrib },
                       { name: 'Isya', time: s.isya }
                    ];
                    
                    const now = new Date();
                    const currMins = now.getHours() * 60 + now.getMinutes();
                    let nextIndex = -1;
                    for(let i=0; i<times.length; i++) {
                        if(!times[i].time) continue;
                        const p = times[i].time.split(':');
                        const m = parseInt(p[0])*60 + parseInt(p[1]);
                        if (currMins < m) { nextIndex = i; break; }
                    }
                    if (nextIndex === -1) nextIndex = 0;
                    
                    if (container) {
                        container.innerHTML = times.map((t, idx) => {
                            if(!t.time) return '';
                            const isNext = idx === nextIndex;
                            const style = isNext ? 'background:#ffffff; color:#059669; padding:2px 8px; border-radius:12px; display:flex; gap:5px; align-items:center;' : 'display:flex; gap:5px; align-items:center;';
                            const labelStyle = isNext ? 'color:#059669;' : 'color:#d1fae5;';
                            return '<div class="sa-style-35"><span class="sa-style-36">' + t.name + '</span> <span class="sa-style-37">' + t.time + '</span></div>';
                        }).join('');
                    }
                    
                    const hijriEl = document.getElementById('prayer-hijri-date');
                    if (hijriEl) hijriEl.innerText = s.hijri || '';
                    
                    const masehiEl = document.getElementById('prayer-masehi-date');
                    if (masehiEl) masehiEl.innerText = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                }
            } catch(e) {
                console.error('Error fetching prayer times', e);
                const container = document.getElementById('prayer-times-container');
                if (container) container.innerHTML = '';
            }
        });
      </script>
    
    <!-- ACCESSIBILITY WIDGET -->


    <div class="a11y-widget">
      <div class="a11y-panel" id="a11yPanel">
        <div class="a11y-header">
          <span>Aksesibilitas</span>
          <span class="a11y-close" onclick="document.getElementById('a11yPanel').classList.remove('active')">&times;</span>
        </div>
        <div class="a11y-body">
          <div class="a11y-item" onclick="document.body.classList.toggle('a11y-large-text'); this.classList.toggle('active');">
            <span>🔍</span> Perbesar Teks
          </div>
          <div class="a11y-item" onclick="document.body.classList.toggle('a11y-readable-font'); this.classList.toggle('active');">
            <span>𝝋</span> Teks Terbaca
          </div>
          <div class="a11y-item" onclick="document.body.classList.toggle('a11y-high-contrast'); this.classList.toggle('active');">
            <span>🌓</span> Kontras Tinggi
          </div>
          <div class="a11y-item" onclick="document.body.classList.toggle('a11y-highlight-links'); this.classList.toggle('active');">
            <span>🔗</span> Sorot Tautan
          </div>
          <div class="a11y-item sa-style-38" onclick="document.body.classList.remove('a11y-large-text','a11y-readable-font','a11y-high-contrast','a11y-highlight-links'); document.querySelectorAll('.a11y-item').forEach(function(el){el.classList.remove('active');});">
            Reset Semua
          </div>
        </div>
      </div>
      <div class="a11y-btn" onclick="document.getElementById('a11yPanel').classList.toggle('active')" title="Menu Aksesibilitas">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-1 6v5h2V8h-2zm-3 1.5l1.5 1.5L11 9.5V13h2V9.5l1.5 1.5 1.5-1.5L14 7.5h-4L8 9.5zM12 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
      </div>
    </div>

  ${popupHtml}

    ${ctx.site.seo_histats || ''}
    ${ctx.site.custom_body_end || ''}

    <!-- PWA MOBILE BOTTOM NAV BAR -->
    <nav class="mobile-bottom-nav" id="mobile-bottom-nav" aria-label="Navigasi Bawah">
      <!-- Beranda -->
      <a href="${formatMenuUrl('/')}" class="mbn-item" id="mbn-home">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
          <path d="M9 21V12h6v9"/>
        </svg>
        <span class="mbn-label">${translateMenuLabel('Beranda')}</span>
      </a>
      <!-- Berita -->
      <a href="/berita" class="mbn-item" id="mbn-berita">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
          <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
        </svg>
        <span class="mbn-label">Berita</span>
      </a>
      <!-- Cari -->
      <button type="button" class="mbn-item" id="mbn-cari" onclick="document.getElementById('site-search').showModal()">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <span class="mbn-label">Cari</span>
      </button>
      <!-- E-Majalah -->
      <a href="/majalah" class="mbn-item" id="mbn-majalah">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        <span class="mbn-label">E-Majalah</span>
      </a>
      <!-- Akun (dinamis via JS) -->
      <a href="/admin/login" class="mbn-item" id="mbn-akun">
        <span class="mbn-avatar-wrap" id="mbn-avatar-wrap">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </span>
        <span class="mbn-label" id="mbn-akun-label">Masuk</span>
      </a>
    </nav>
    <script>
      (function() {
        // Tandai item aktif berdasarkan URL
        var path = window.location.pathname;
        var homeEl = document.getElementById('mbn-home');
        var beritaEl = document.getElementById('mbn-berita');
        var majalahEl = document.getElementById('mbn-majalah');
        var akunEl = document.getElementById('mbn-akun');
        if (homeEl && (path === '/' || path === '')) homeEl.classList.add('active');
        if (beritaEl && (path === '/berita' || path.startsWith('/berita/') || path.startsWith('/kategori') || path.startsWith('/kajian') || path.startsWith('/wawasan') || path.startsWith('/gaya-hidup') || path.startsWith('/inspirasi') || path.startsWith('/muda'))) beritaEl.classList.add('active');
        if (majalahEl && (path === '/majalah' || path.startsWith('/majalah/'))) majalahEl.classList.add('active');
        if (akunEl && (path.startsWith('/admin') || path.startsWith('/@'))) akunEl.classList.add('active');

        // Update item Akun berdasarkan login state
        try {
          var raw = (typeof getAuthCookieToken === 'function' ? getAuthCookieToken() : '');
          if (raw) {
            var payload = JSON.parse(atob(raw));
            if (payload && payload.id) {
              var roleLower = String(payload.role || '').toLowerCase();
              var isSub = roleLower === 'subscriber' || roleLower === 'subscriber_pro' || roleLower === 'member';
              var u = payload.username || 'me';
              var displayName = payload.n || payload.name || u || 'Saya';
              var avatarUrl = payload.avatar || '';
              var akunLabel = document.getElementById('mbn-akun-label');
              var akunAvatarWrap = document.getElementById('mbn-avatar-wrap');
              if (akunEl) akunEl.href = isSub ? ('/@' + encodeURIComponent(u)) : '/admin';
              if (akunLabel) akunLabel.textContent = displayName.split(' ')[0] || 'Akun';
              if (akunAvatarWrap) {
                var initial = (displayName.trim().charAt(0) || 'U').toUpperCase();
                if (avatarUrl && avatarUrl.trim()) {
                  var img = document.createElement('img');
                  img.src = avatarUrl;
                  img.alt = '';
                  img.onerror = function() { if (this.parentNode) this.parentNode.innerHTML = initial; };
                  akunAvatarWrap.innerHTML = '';
                  akunAvatarWrap.appendChild(img);
                } else {
                  akunAvatarWrap.innerHTML = initial;
                }
              }
            }
          }
        } catch(e) {}
      })();
    </script>
  </body>
</html>`;
}
