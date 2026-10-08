export const layoutStyle = `
/* Utility / Top Bar */
.topbar { background: var(--green-dark); color: #fff; font-size: 12px; font-weight: 600; }
.topbar .container { display: flex; justify-content: space-between; align-items: center; min-height: 32px; }
.topbar-links, .topbar-right { display: flex; gap: 20px; list-style: none; margin: 0; padding: 0; }
.topbar a { color: #e0f2e0; }
.topbar a:hover { color: #fff; }

/* Header */
.header { padding: 20px 0; border-bottom: 1px solid var(--gray-light); }
.header .container { display: flex; justify-content: space-between; align-items: center; }
.header-left, .header-right, .header-search { flex: 1; }
.socials { display: flex; gap: 15px; color: var(--gray-text); }
.socials a { font-family: sans-serif; font-weight: bold; transition: color 0.2s; }
.socials a:hover { color: var(--green); }
.logo-container { flex: 2; text-align: center; }
.logo-img { max-height: 60px; margin: auto; width: auto !important; object-fit: contain; }
.search-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--gray-text); }
.search-btn:hover { color: var(--green); }
.theme-toggle-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--gray-text); padding: 4px 8px; border-radius: 50%; transition: transform 0.2s, color 0.2s; display: inline-flex; align-items: center; justify-content: center; }
.theme-toggle-btn:hover { color: var(--green); transform: scale(1.1); }

/* Header & Nav: Seragam Hijau Tua tanpa Blok Abu-Abu */
html.dark-mode .header-top, 
html.dark-mode .nav-wrap, 
html.dark-mode .sticky-header-wrapper, 
html.dark-mode header:not(.article-header), 
html.dark-mode .nav-wrap nav,
html.dark-mode header:not(.article-header) nav { background-color: #0d5c2c !important; color: #ffffff !important; }

html.dark-mode header:not(.article-header) .container,
html.dark-mode nav.nav .container,
html.dark-mode .header-top .container,
html.dark-mode .nav-wrap .container,
html.dark-mode .header-inner,
html.dark-mode .header-logo-section,
html.dark-mode .header-actions-section { background-color: transparent !important; color: #ffffff !important; }

html.dark-mode .nav a, 
html.dark-mode header:not(.article-header) a, 
html.dark-mode .kirim-text,
html.dark-mode .search-btn,
html.dark-mode .theme-toggle-btn { color: #ffffff !important; }

html.dark-mode .nav-emajalah-btn {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.45) !important;
}
html.dark-mode .nav-emajalah-badge {
  background: #fbbf24 !important;
  color: #78350f !important;
}

/* Footer: Seragam Hitam Pekat tanpa Blok Abu-Abu */
html.dark-mode footer:not(.article-footer) { background-color: #1a1a1a !important; color: #ffffff !important; }
html.dark-mode footer:not(.article-footer) .container,
html.dark-mode footer:not(.article-footer) div,
html.dark-mode footer:not(.article-footer) section { background-color: transparent !important; color: #ffffff !important; }
html.dark-mode footer:not(.article-footer) a { color: #ffffff !important; }
html.dark-mode footer:not(.article-footer) a:hover { color: #38bdf8 !important; }

/* Navigation & Dropdowns */
.dropdown { position: relative; display: inline-block; }
.dropdown-trigger {
  background: none;
  border: none;
  padding: 10px 10px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--dark);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  border-bottom: 3px solid transparent;
  font-family: inherit;
  transition: color 0.2s;
  white-space: nowrap;
}
.dropdown-trigger:hover,
.dropdown.active .dropdown-trigger {
  color: var(--green);
  border-bottom-color: var(--green);
}
.dropdown-chevron {
  display: inline-block;
  font-size: 11px;
  transition: transform 0.2s ease;
}
.dropdown.active .dropdown-chevron {
  transform: rotate(180deg);
}
.dropdown-content {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: var(--paper);
  min-width: 190px;
  max-width: 280px;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0px 10px 25px rgba(0,0,0,0.15);
  z-index: 500;
  border-radius: 8px;
  border: 1px solid var(--gray-light);
  overflow-x: hidden;
}
.dropdown.active .dropdown-content {
  display: block;
}
.dropdown:hover .dropdown-content {
  display: block;
}
.dropdown-content a {
  color: var(--dark);
  padding: 9px 14px;
  text-decoration: none;
  display: block;
  font-size: 13px;
  text-transform: none;
  border-bottom: 1px solid var(--gray-light);
  transition: background 0.15s, color 0.15s;
  white-space: normal;
  line-height: 1.4;
}
.dropdown-content a:hover {
  background-color: var(--gray-light);
  color: var(--green);
}
.dropdown-content .dropdown-parent-link {
  background-color: #f1f5f9;
  color: var(--green) !important;
  font-weight: 700;
  border-bottom: 1px solid #cbd5e1;
}
.dropdown-content .dropdown-parent-link:hover {
  background-color: #e2e8f0;
}

html.dark-mode .dropdown-trigger {
  color: #ffffff !important;
}
html.dark-mode .dropdown-trigger:hover,
html.dark-mode .dropdown.active .dropdown-trigger {
  color: #34d399 !important;
  border-bottom-color: #34d399 !important;
}
html.dark-mode .dropdown-content {
  background-color: #334155 !important;
  border-color: #475569 !important;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4) !important;
}
html.dark-mode .dropdown-content a {
  color: #ffffff !important;
  background-color: #334155 !important;
  border-bottom-color: #475569 !important;
}
html.dark-mode .dropdown-content a:hover {
  background-color: #1e293b !important;
  color: #34d399 !important;
}
html.dark-mode .dropdown-content .dropdown-parent-link {
  background-color: #1e293b !important;
  color: #34d399 !important;
  border-bottom-color: #475569 !important;
}

@media (max-width: 900px) {
  .dropdown-content {
    box-shadow: 0 12px 30px rgba(0,0,0,0.25);
    border-radius: 10px;
  }
}

.nav-wrap { border-bottom: 2px solid var(--green); position: sticky; top: 0; background: var(--paper); z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-radius: 0 0 15px 15px; }
.nav { display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap; }
.nav::-webkit-scrollbar { display: none; }
.nav a { 
  display: block; 
  padding: 10px 10px; 
  font-size: 14px; 
  font-weight: 700; 
  text-transform: uppercase; 
  border-bottom: 3px solid transparent; 
}
.nav a:hover, .nav a.active { color: var(--green); border-bottom-color: var(--green); }

@media (max-width: 900px) {
  .nav { justify-content: flex-start; padding: 0 15px; flex-wrap: nowrap; overflow-x: auto; white-space: nowrap; scrollbar-width: none; }
  .nav::after { content: ''; padding-right: 15px; }
}

.nav sup { background: var(--darker); color: white; padding: 2px 5px; border-radius: 3px; font-size: 9px; margin-left: 5px; }

/* Standout E-Majalah Nav Button */
.nav-emajalah-btn {
  display: inline-flex !important;
  align-items: center !important;
  align-self: center !important;
  gap: 5px !important;
  height: 25px !important;
  padding: 0 10px !important;
  margin: 0 4px !important;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
  color: #ffffff !important;
  border-radius: 13px !important;
  border-bottom: none !important;
  box-shadow: 0 2px 5px rgba(5, 150, 105, 0.25) !important;
  transition: all 0.25s ease !important;
  font-weight: 700 !important;
  font-size: 11.5px !important;
  letter-spacing: 0.3px !important;
  text-decoration: none !important;
  line-height: 1 !important;
  flex-shrink: 0 !important;
}
.nav-emajalah-btn:hover {
  transform: translateY(-1px) scale(1.02) !important;
  box-shadow: 0 3px 8px rgba(5, 150, 105, 0.4) !important;
  color: #ffffff !important;
  background: linear-gradient(135deg, #047857 0%, #059669 100%) !important;
  border-bottom: none !important;
}
.nav-emajalah-btn i {
  font-size: 11px !important;
  animation: pulse-book 2s infinite ease-in-out;
}
.nav-emajalah-badge {
  background: #fef08a !important;
  color: #854d0e !important;
  font-size: 9px !important;
  font-weight: 900 !important;
  padding: 2px 6px !important;
  border-radius: 8px !important;
  letter-spacing: 0.5px !important;
  margin-left: 2px !important;
  text-transform: uppercase !important;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
}
@keyframes pulse-book {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.18); }
}

/* Footer */
.footer { background: #18191b; color: #b0b0b0; padding: 70px 0 30px; margin-top: 60px; font-size: 14px; position: relative; }
.footer-grid { display: flex; gap: 40px; margin-bottom: 50px; flex-wrap: wrap; }
.footer-col { flex: 1; min-width: 200px; }
.footer-desc { font-size: 14px; line-height: 1.8; color: #b0b0b0; }
.footer-col h4 { color: #fff; font-size: 16px; font-weight: 600; margin: 0 0 25px; }
.footer-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 15px; }
.footer-col a, .footer-col li { color: #b0b0b0; text-decoration: none; display: flex; align-items: center; gap: 10px; line-height: 1.5; }
.footer-col a:hover { color: #fff; }
.contact-col svg { flex-shrink: 0; }
.copyright { border-top: 1px solid #333; padding-top: 30px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #888; }
.copy-socials { display: flex; gap: 15px; }
.copy-socials a { color: #fff; opacity: 0.7; }
.copy-socials a:hover { opacity: 1; color: var(--green); }
.back-to-top { position: absolute; right: 30px; bottom: 30px; background: #e09f3e; color: #fff; border: none; width: 40px; height: 40px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.back-to-top:hover { background: #d08f2e; }

/* Search Dialog */
#site-search { border: none; padding: 40px; border-radius: 8px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 600px; width: 100%; margin: 100px auto; background: var(--paper); }
#site-search::backdrop { background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); }
.search-form-inner { display: flex; gap: 15px; }
.search-form-inner input { flex: 1; padding: 15px 20px; border: 2px solid var(--gray-light); border-radius: 6px; font-size: 18px; outline: none; }
.search-form-inner input:focus { border-color: var(--green); }
.search-form-inner button { padding: 0 30px; background: var(--green); color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: 700; cursor: pointer; }

/* ============================
   PWA MOBILE BOTTOM NAV BAR
   ============================ */
.mobile-bottom-nav {
  display: none;
}
@media (max-width: 768px) {
  /* Viewport & Container Overflow Protection */
  html, body {
    max-width: 100% !important;
    overflow-x: hidden !important;
  }
  .container {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  body {
    padding-bottom: calc(68px + env(safe-area-inset-bottom, 0px)) !important;
  }

  /* Sembunyikan elemen non-mobile */
  .hide-mobile { display: none !important; }
  .topbar { display: none !important; }
  .search-btn { display: none !important; }
  .header-login-btn { display: none !important; }
  .kirim-text { display: none !important; }

  /* Header Mobile Ramping & Presisi */
  .header {
    padding: 6px 0 !important;
  }
  .header .container,
  .sa-style-13 { 
    display: flex !important;
    flex-wrap: nowrap !important; 
    gap: 6px !important; 
    padding: 0 12px !important; 
    align-items: center !important; 
    justify-content: space-between !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  .header-logo-section,
  .sa-style-14:first-child { 
    display: flex !important;
    align-items: center !important;
    gap: 6px !important; 
    flex-shrink: 0 !important; 
  }
  .logo-img,
  .sa-style-16 { 
    height: 38px !important; 
    max-height: 38px !important; 
    width: auto !important; 
    display: block !important;
  }
  .header-actions-section,
  .sa-style-14:last-child { 
    display: flex !important;
    align-items: center !important;
    gap: 6px !important; 
    margin-left: auto !important; 
    justify-content: flex-end !important; 
    flex-shrink: 0 !important; 
  }
  .kirim-btn,
  .sa-style-20 { 
    display: inline-flex !important; 
    align-items: center !important; 
    justify-content: center !important; 
    font-size: 16px !important; 
    padding: 4px 6px !important; 
    background: transparent !important; 
    border: none !important; 
    box-shadow: none !important; 
    text-decoration: none !important;
    line-height: 1 !important;
  }
  .berlangganan-btn,
  .sa-style-22 { 
    display: inline-flex !important; 
    padding: 5px 12px !important; 
    font-size: 11px !important; 
    font-weight: 700 !important;
    border-radius: 14px !important; 
    white-space: nowrap !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1.2 !important;
  }
  body.is-sub-pro .berlangganan-btn { display: none !important; }
  .theme-toggle-btn { font-size: 16px !important; padding: 4px !important; }

  /* Navigasi Kategori: Swipeable Horizontal Scroll */
  .nav-wrap,
  .sa-style-24 { 
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }
  .nav-wrap::-webkit-scrollbar { display: none !important; }
  .nav {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    white-space: nowrap !important;
    gap: 12px !important;
    padding: 0 12px !important;
    width: max-content !important;
    scrollbar-width: none !important;
  }
  .nav::-webkit-scrollbar { display: none !important; }
  .nav > * { flex-shrink: 0 !important; }

  .mobile-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9990;
    background: var(--bg-surface, #ffffff);
    border-top: 1px solid var(--border-subtle, #e2e8f0);
    padding: 6px 0 calc(6px + env(safe-area-inset-bottom, 0px));
    justify-content: space-around;
    align-items: stretch;
    box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
  }
  .mbn-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 3px;
    padding: 4px 2px;
    text-decoration: none;
    color: var(--text-muted, #64748b);
    font-size: 10px;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
    background: none;
    border: none;
    transition: color 0.18s, transform 0.15s;
    -webkit-tap-highlight-color: transparent;
    border-radius: 10px;
    margin: 0 2px;
  }
  .mbn-item:active { transform: scale(0.92); }
  .mbn-item svg { width: 22px; height: 22px; stroke-width: 1.8; flex-shrink: 0; }
  .mbn-label { font-size: 10px; }
  .mbn-item.active { color: #059669; }
  .mbn-item.active svg { stroke: #059669; }
  /* Akun item — avatar lingkaran kecil */
  .mbn-avatar-wrap {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    overflow: hidden;
    background: #059669;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }
  .mbn-avatar-wrap img { width: 100%; height: 100%; object-fit: cover; }
  /* Dark mode */
  .dark-mode .mobile-bottom-nav,
  html.dark-mode .mobile-bottom-nav {
    background: #1e293b;
    border-top-color: #334155;
    box-shadow: 0 -2px 12px rgba(0,0,0,0.35);
  }
}
`;
