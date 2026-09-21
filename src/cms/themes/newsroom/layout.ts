import type { ThemeContext } from '../types';
import { newsroomCss } from './style';
import { escapeHtml, formatDateIndo } from './utils';

export function _layout(this: any, content: string, title: string, ctx: ThemeContext, pageType: string = '') {
  const siteTitle = escapeHtml(ctx.site?.site_title || ctx.site?.title || "CMSMu");
  const siteSlogan = escapeHtml(ctx.site?.site_desc || ctx.site?.site_tagline || "");
  const siteDesc = escapeHtml(ctx.site?.site_meta_desc || ctx.site?.site_desc || ctx.site?.site_tagline || ctx.site?.description || "CMSMu 1 Platform Untuk Keberkahan Bersama");
  const isHomePage = pageType === 'home' || !title || title === 'Beranda';
  const pageTitle = isHomePage
    ? (siteSlogan ? `${siteTitle} | ${siteSlogan}` : siteTitle)
    : `${escapeHtml(title)} — ${siteTitle}`;
  const todayIndo = formatDateIndo(new Date());

  // Menu dinamis (Zero Hardcode Policy: dari tabel menus atau digenerate otomatis dari distinct categories real DB)
  let menuItems: { label: string; url: string }[] = [];
  if (Array.isArray(ctx.menus) && ctx.menus.length > 0) {
    menuItems = ctx.menus;
  } else if (Array.isArray(ctx.categories) && ctx.categories.length > 0) {
    menuItems = [
      { label: 'Beranda', url: '/' },
      ...ctx.categories.slice(0, 7).map((catName: string) => ({
        label: catName,
        url: `/${catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
      }))
    ];
  } else {
    menuItems = [{ label: 'Beranda', url: '/' }];
  }

  // Topik/Tag sorotan dinamis dari real DB
  const topicItems: { name: string; slug: string }[] = Array.isArray(ctx.topics) && ctx.topics.length > 0
    ? ctx.topics
    : (Array.isArray(ctx.categories) ? ctx.categories.slice(0, 5).map((c: string) => ({
        name: c,
        slug: c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      })) : []);

  // Kanal Berita Footer dinamis dari categories real DB
  const footerCategories: { label: string; url: string }[] = Array.isArray(ctx.categories) && ctx.categories.length > 0
    ? ctx.categories.slice(0, 6).map((c: string) => ({
        label: c,
        url: `/${c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
      }))
    : menuItems.filter(m => m.url !== '/');

  const faviconUrl = escapeHtml(ctx.site?.site_favicon || ctx.site?.favicon || "/favicon.svg");

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${siteDesc}">
  <link rel="icon" href="${faviconUrl}">
  <link rel="canonical" href="${ctx.canonical || '/'}">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${siteDesc}">
  <meta property="og:url" content="${ctx.canonical || '/'}">
  <meta property="og:site_name" content="${siteTitle}">
  <meta property="og:type" content="${pageType === 'post' || pageType === 'single' ? 'article' : 'website'}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${siteDesc}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>${newsroomCss}</style>
</head>
<body>
  <!-- Topbar: Live Date & Breaking News Ticker -->
  <aside class="nr-topbar">
    <div class="nr-container nr-topbar-inner">
      <div class="nr-ticker-wrap">
        <span class="nr-badge-live">Live</span>
        <span class="nr-ticker-text">Menyajikan liputan terpercaya jejaring dakwah & informasi persyarikatan.</span>
      </div>
      <div class="nr-topbar-meta">
        <span id="khgt-date" class="nr-khgt-container"><i class="far fa-calendar-alt"></i> ${todayIndo}</span>
        <button id="nrThemeToggle" class="cursor-pointer" style="background:none;border:none;color:inherit;cursor:pointer;" title="Mode Siang / Malam">
          <i class="fas fa-moon"></i>
        </button>
      </div>
    </div>
  </aside>

  <!-- Masthead -->
  <header class="nr-masthead">
    <div class="nr-container nr-masthead-inner">
      <div class="nr-brand">
        <a href="/" class="nr-logo-text">
          <span style="color:var(--accent-primary);">✦</span> ${siteTitle}
        </a>
        <div class="nr-logo-tagline">${siteDesc}</div>
      </div>

      <div class="nr-masthead-actions">
        <form action="/search" method="GET" class="nr-search-form">
          <i class="fas fa-search nr-search-icon"></i>
          <input type="text" name="q" placeholder="Cari liputan & isu..." class="nr-search-input" required>
        </form>

        <!-- Auth Section: Login Button or User Avatar Dropdown (Identik dengan Suara Aisyiyah) -->
        <div id="header-auth-box" class="header-auth-box">
          <!-- Tombol Login (Tamu) -->
          <a href="/admin/login" id="header-login-btn" class="header-login-btn" title="Masuk">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            <span>Masuk</span>
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
                <span id="dropdown-dash-text">Dasbor Redaksi</span>
              </a>
              <div class="user-dropdown-divider"></div>
              <button type="button" class="user-dropdown-item logout-item" onclick="headerUserLogout()">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Navigation Bar (Clean URLs tanpa /kategori/) -->
  <nav class="nr-navbar">
    <div class="nr-container nr-navbar-inner">
      <ul class="nr-nav-links">
        ${menuItems.map((m: any) => `
          <li class="nr-nav-item">
            <a href="${escapeHtml(m.url)}">${escapeHtml(m.label)}</a>
          </li>
        `).join('')}
      </ul>
    </div>
  </nav>

  <!-- Trending Topics Quick Rail (Editorial Topic Chips dari Real DB) -->
  <div class="nr-topics-bar">
    <div class="nr-container nr-topics-inner">
      <span class="nr-topics-label"><i class="fas fa-bolt"></i> Sorotan:</span>
      <div class="nr-topics-list">
        ${topicItems.map((t: any) => `
          <a href="/tag/${escapeHtml(t.slug)}" class="nr-topic-pill">#${escapeHtml(t.name.replace(/\s+/g, ''))}</a>
        `).join('')}
        <a href="/sumber" class="nr-topic-pill"><i class="fas fa-network-wired" style="margin-right:4px;"></i> Media Jejaring</a>
      </div>
    </div>
  </div>

  <!-- Content Body -->
  ${content}

  <!-- Footer (Clean URLs tanpa /kategori/) -->
  <footer class="nr-footer">
    <div class="nr-container">
      <div class="nr-footer-inner">
        <div>
          <h3 style="font-size:1.25rem; font-weight:800; color:#fff; margin-bottom:0.75rem;">${siteTitle}</h3>
          <p style="line-height:1.6; max-width:380px;">
            Platform jurnalisme dan agregasi berita resmi yang menghimpun karya informasi dari jejaring media persyarikatan di seluruh Indonesia.
          </p>
        </div>
        <div>
          <h4 style="font-weight:700; color:#fff; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.1em; margin-bottom:1rem;">Kanal Berita</h4>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem;">
            ${footerCategories.map((c: any) => `
              <li><a href="${escapeHtml(c.url)}">${escapeHtml(c.label)}</a></li>
            `).join('')}
          </ul>
        </div>
        <div>
          <h4 style="font-weight:700; color:#fff; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.1em; margin-bottom:1rem;">Redaksi & Jejaring</h4>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem;">
            <li><a href="/sumber">Jejaring Sumber Media</a></li>
            <li><a href="/pedoman-media-siber">Pedoman Media Siber</a></li>
            <li><a href="/tentang-kami">Tentang Kami</a></li>
            <li><a href="/kontak">Kontak Redaksi</a></li>
            <li><a href="/admin">Meja Redaksi (CMS)</a></li>
          </ul>
        </div>
      </div>
      <div class="nr-footer-bottom">
        &copy; ${new Date().getFullYear()} ${siteTitle}. Seluruh hak cipta dilindungi undang-undang.
      </div>
    </div>
  </footer>

  <!-- PWA MOBILE BOTTOM NAV BAR (FITUR SUARA AISYIYAH) -->
  <nav class="mobile-bottom-nav" id="mobile-bottom-nav" aria-label="Navigasi Bawah">
    <!-- Beranda -->
    <a href="/" class="mbn-item" id="mbn-home">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
      <span class="mbn-label">Beranda</span>
    </a>
    <!-- Kanal Berita -->
    <a href="/berita-daerah" class="mbn-item" id="mbn-berita">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
        <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
      </svg>
      <span class="mbn-label">Berita</span>
    </a>
    <!-- Cari -->
    <a href="/search?q=" class="mbn-item" id="mbn-cari" onclick="event.preventDefault(); var inp = document.querySelector('.nr-search-input'); if(inp){ inp.focus(); window.scrollTo({top:0,behavior:'smooth'}); }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <span class="mbn-label">Cari</span>
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

  <!-- Core Scripts (Auth Sync & Token Interceptor Identik Suara Aisyiyah) -->
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

    document.addEventListener('click', function(e) {
      var dd = document.getElementById('header-user-dropdown');
      var wrap = document.getElementById('header-user-wrapper');
      if (dd && wrap && !wrap.contains(e.target)) {
        dd.style.display = 'none';
      }
    });

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
        var isSuperAdminOrAdmin = (roleLower === 'superadmin' || roleLower === 'admin');
        var isCurator = (roleLower === 'curator' || roleLower === 'kurator' || roleLower === 'editor');
        var isAuthor = (roleLower === 'author' || roleLower === 'contributor' || roleLower === 'penulis');
        var profLink = document.getElementById('dropdown-profile-link');
        var profText = document.getElementById('dropdown-profile-text');
        var dashLink = document.getElementById('dropdown-dash-link');
        var dashText = document.getElementById('dropdown-dash-text');

        if (isSuperAdminOrAdmin) {
          if (profLink) profLink.href = '/admin/profile';
          if (profText) profText.textContent = 'Profil Admin';
          if (dashLink) {
            dashLink.style.display = 'flex';
            dashLink.href = '/admin';
          }
          if (dashText) dashText.textContent = 'Dasbor Redaksi';
        } else {
          if (profLink) profLink.href = '/@' + u;
          if (profText) profText.textContent = 'Profil Saya';
          if (dashLink) {
            dashLink.style.display = 'flex';
            dashLink.href = '/@' + u;
            if (dashText) {
              if (isCurator) dashText.textContent = 'Antrean Kurasi';
              else if (isAuthor) dashText.textContent = 'Meja Tulis & Naskah';
              else dashText.textContent = 'Bacaan Tersimpan';
            }
          }
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

        // Sinkronisasi Mobile Bottom Nav Akun
        var mbnAkun = document.getElementById('mbn-akun');
        var mbnLabel = document.getElementById('mbn-akun-label');
        var mbnWrap = document.getElementById('mbn-avatar-wrap');
        if (mbnAkun) mbnAkun.href = isSuperAdminOrAdmin ? '/admin' : ('/@' + u);
        if (mbnLabel) mbnLabel.textContent = displayName.split(' ')[0] || 'Akun';
        if (mbnWrap) {
          var mbnInitial = (displayName.trim().charAt(0) || 'U').toUpperCase();
          if (avatarUrl && avatarUrl.trim()) {
            var mbnImg = document.createElement('img');
            mbnImg.src = avatarUrl;
            mbnImg.alt = '';
            mbnImg.onerror = function() { if (this.parentNode) this.parentNode.innerHTML = mbnInitial; };
            mbnWrap.innerHTML = '';
            mbnWrap.appendChild(mbnImg);
          } else {
            mbnWrap.innerHTML = mbnInitial;
          }
        }
      } catch (e) {
        console.debug('Header auth init:', e);
      }
    }

    // Theme toggle light / dark mode
    var themeBtn = document.getElementById('nrThemeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function() {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('nr_theme', 'light');
          themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('nr_theme', 'dark');
          themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
      });
      if (localStorage.getItem('nr_theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
      }
    }

    // Active state Mobile Bottom Nav
    (function() {
      var path = window.location.pathname;
      var homeEl = document.getElementById('mbn-home');
      var beritaEl = document.getElementById('mbn-berita');
      var akunEl = document.getElementById('mbn-akun');
      if (homeEl && (path === '/' || path === '')) homeEl.classList.add('active');
      if (beritaEl && (path.startsWith('/berita') || path.startsWith('/warta') || path.startsWith('/opini') || path.startsWith('/pendidikan') || path.startsWith('/ekonomi'))) beritaEl.classList.add('active');
      if (akunEl && (path.startsWith('/admin') || path.startsWith('/@'))) akunEl.classList.add('active');
    })();

    // Kalender Hijriah KHGT (Fitur Suara Aisyiyah)
    async function initKhgtCalendar() {
      var el = document.getElementById('khgt-date');
      if (!el) return;
      try {
        var today = new Date();
        var masehi = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        var year = today.getFullYear();
        var month = today.getMonth(); // 0-based
        var day = today.getDate();
        var cacheKey = 'khgt_' + year;
        var calData = null;
        try { calData = JSON.parse(sessionStorage.getItem(cacheKey) || 'null'); } catch(e){}
        if (!calData) {
          var res = await fetch('/api/public/khgt');
          if (res.ok) {
            var json = await res.json();
            calData = json.data;
            try { sessionStorage.setItem(cacheKey, JSON.stringify(calData)); } catch(e){}
          }
        }
        var hijriStr = '';
        if (Array.isArray(calData)) {
          for (var i = 0; i < calData.length; i++) {
            var hMonth = calData[i];
            var days = (hMonth.days || []).filter(function(d) { return d !== null && d !== undefined; });
            var found = days.find(function(d) { return d.gregorian_date === day && d.gregorian_month === month && d.gregorian_year === year; });
            if (found) {
              hijriStr = found.hijri_date + ' ' + hMonth.hijri_month_name + ' ' + hMonth.hijri_year + ' H';
              break;
            }
          }
        }
        if (hijriStr) {
          el.innerHTML = '<i class="far fa-calendar-alt"></i> ' + masehi + ' <span class="nr-khgt-sep">/</span> <span class="nr-khgt-text">' + hijriStr + '</span> <a href="https://khgt.muhammadiyah.or.id" target="_blank" rel="noopener" class="nr-khgt-badge" title="Kalender Hijriah Global Tunggal Muhammadiyah">(KHGT)</a>';
        } else {
          el.innerHTML = '<i class="far fa-calendar-alt"></i> ' + masehi;
        }
      } catch(e) {
        console.debug('KHGT init:', e);
      }
    }

    document.addEventListener('DOMContentLoaded', function() {
      initHeaderAuth();
      initKhgtCalendar();
    });
  </script>
</body>
</html>`;
}
