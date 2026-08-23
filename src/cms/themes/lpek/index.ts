import type { ThemeStructure, ThemeContext } from '../types';
import { css } from './style';

// =====================================================================
// LPEK THEME — Lembaga Pariwisata dan Ekonomi Kreatif Muhammadiyah
// Theme Version: 1.0.0
// =====================================================================

// Navigasi LPEK dengan struktur dropdown lengkap
const NAV_STRUCTURE = [
  { label: 'Beranda', url: '/' },
  {
    label: 'Tentang Kami', url: '/tentang',
    children: [
      { label: 'Profil',                      url: '/profil' },
      { label: 'Visi & Misi',                 url: '/visi-misi' },
      { label: 'Struktur Organisasi',          url: '/struktur-organisasi' },
      { label: 'Amanah PP Muhammadiyah',       url: '/amanah-pp-muhammadiyah' },
    ]
  },
  { label: 'Napak Tilas KH Ahmad Dahlan', url: '/napak-tilas-sejarah-kh-ahmad-dahlan' },
  { label: 'Parekraf Muktamar 49 Medan',  url: '/parekraf-muktamar-49-medan' },
  {
    label: 'Program', url: '/program',
    children: [
      { label: 'Pariwisata Berkemajuan',       url: '/program/pariwisata-berkemajuan' },
      { label: 'Ekonomi Kreatif Berkemajuan',  url: '/program/ekonomi-kreatif-berkemajuan' },
      { label: 'Desa Wisata Berkemajuan',      url: '/program/desa-wisata-berkemajuan' },
      { label: 'UMKM Berkemajuan',             url: '/program/umkm-berkemajuan' },
      { label: 'Wellness Heritage Berkemajuan',url: '/program/wellness-heritage-berkemajuan' },
    ]
  },
  {
    label: 'Direktori', url: '/direktori',
    children: [
      { label: 'Destinasi', url: '/direktori/destinasi' },
      { label: 'UMKM',      url: '/direktori/umkm' },
      { label: 'Restoran',  url: '/direktori/restoran' },
      { label: 'Mitra',     url: '/direktori/mitra' },
    ]
  },
  {
    label: 'Akademi', url: '/akademi',
    children: [
      { label: 'Pelatihan',   url: '/akademi/pelatihan' },
      { label: 'Webinar',     url: '/akademi/webinar' },
      { label: 'Sertifikasi', url: '/akademi/sertifikasi' },
      { label: 'Modul',       url: '/akademi/modul' },
    ]
  },
  { label: 'Kegiatan Terdekat', url: '/kegiatan' },
  { label: 'Berita',            url: '/berita' },
  { label: 'Kolaborasi',        url: '/kolaborasi' },
  { label: 'Kontak',            url: '/kontak' },
];

// Icons SVG
const ICONS: Record<string, string> = {
  email:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>`,
  phone:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`,
  location: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  calendar: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  user:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  arrow:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>`,
  chevron:  `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>`,
  search:   `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  menu:     `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  map:      `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2 1,6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
  book:     `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  award:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  globe:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
  store:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`,
  wa:       `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.548 4.116 1.506 5.851L.057 23.821a.5.5 0 00.621.621l5.97-1.449A11.941 11.941 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 01-5.099-1.4l-.362-.213-3.757.912.927-3.665-.231-.381A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>`,
  fb:       `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  ig:       `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
  yt:       `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>`,
};

// Helper: format tanggal Indonesia
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return ''; }
}

// Helper: strip html & truncate
function excerpt(body: string, len = 130): string {
  if (!body) return 'Klik untuk membaca selengkapnya...';
  const stripped = body.replace(/<[^>]+>/g, '');
  return stripped.length > len ? stripped.substring(0, len) + '…' : stripped;
}

// Helper: render pagination
function renderPagination(p: any, baseUrl: string): string {
  if (!p || p.totalPages <= 1) return '';
  const pages = [];
  const prevHref = p.hasPrev ? `${baseUrl}?page=${p.currentPage - 1}` : '#';
  const nextHref = p.hasNext ? `${baseUrl}?page=${p.currentPage + 1}` : '#';
  pages.push(`<a href="${prevHref}" class="page-btn page-btn-wide ${!p.hasPrev ? 'disabled' : ''}">← Sebelumnya</a>`);
  for (let i = 1; i <= p.totalPages; i++) {
    if (i === 1 || i === p.totalPages || Math.abs(i - p.currentPage) <= 1) {
      pages.push(`<a href="${baseUrl}?page=${i}" class="page-btn ${i === p.currentPage ? 'active' : ''}">${i}</a>`);
    } else if (Math.abs(i - p.currentPage) === 2) {
      pages.push(`<span class="page-btn disabled">…</span>`);
    }
  }
  pages.push(`<a href="${nextHref}" class="page-btn page-btn-wide ${!p.hasNext ? 'disabled' : ''}">Berikutnya →</a>`);
  return `<div class="pagination">${pages.join('')}</div>`;
}

// Program emojis
const PROGRAM_EMOJI: Record<string, string> = {
  'pariwisata-berkemajuan':         '🏝️',
  'ekonomi-kreatif-berkemajuan':    '🎨',
  'desa-wisata-berkemajuan':        '🌾',
  'umkm-berkemajuan':               '🏪',
  'wellness-heritage-berkemajuan':  '🌿',
};

const LpekTheme: ThemeStructure = {
  name: 'LPEK Theme',
  version: '1.0.0',
  author: 'cmsMu Dev',

  // ===================================================================
  // _LAYOUT — HTML Shell dengan Mega Menu + Mobile Nav
  // ===================================================================
  _layout(content: string, title: string, ctx: ThemeContext, opts?: { bodyClass?: string; headerDark?: boolean }): string {
    const site = ctx.site || {};
    const siteTitle = site.site_title || 'LPEK';
    const siteDesc  = site.site_desc  || 'Lembaga Pariwisata dan Ekonomi Kreatif';
    const siteEmail = site.site_email || 'info@lpek.id';
    const sitePhone = site.site_phone || '';
    const favicon   = site.site_favicon || '/favicon.ico';
    const logoUrl   = site.site_logo || site.header_logo_url || '';
    const igUrl     = site.social_ig   || '#';
    const fbUrl     = site.social_fb   || '#';
    const ytUrl     = site.social_yt   || '#';
    const waUrl     = site.social_wa   || '#';

    // Bangun dari DB atau pakai default
    const dbMenus: any[] = ctx.menus || [];
    const navSource = NAV_STRUCTURE;

    // Render nav items (dari struktur hardcoded yang lengkap)
    function renderNavItems(items: typeof NAV_STRUCTURE): string {
      return items.map(item => {
        if (item.children && item.children.length > 0) {
          const dropdownItems = item.children.map(child =>
            `<li><a href="${child.url}" class="dropdown-item">${child.label}</a></li>`
          ).join('');
          return `
            <li class="nav-item has-dropdown">
              <a href="${item.url}" class="nav-link">
                ${item.label}
                <span class="nav-chevron">${ICONS.chevron}</span>
              </a>
              <ul class="dropdown-menu">
                ${dropdownItems}
              </ul>
            </li>`;
        }
        return `<li class="nav-item"><a href="${item.url}" class="nav-link">${item.label}</a></li>`;
      }).join('');
    }

    // Mobile nav
    function renderMobileNav(items: typeof NAV_STRUCTURE): string {
      return items.map(item => {
        if (item.children && item.children.length > 0) {
          const subItems = item.children.map(c =>
            `<a href="${c.url}" class="mobile-sub-link">${c.label}</a>`
          ).join('');
          return `
            <div class="mobile-nav-group">
              <a href="${item.url}" class="mobile-nav-link mobile-has-sub">
                ${item.label} <span class="mobile-chevron">${ICONS.chevron}</span>
              </a>
              <div class="mobile-sub-menu">${subItems}</div>
            </div>`;
        }
        return `<a href="${item.url}" class="mobile-nav-link">${item.label}</a>`;
      }).join('');
    }

    const brandLogoHtml = logoUrl
      ? `<img src="${logoUrl}" alt="${siteTitle}" style="height:44px;width:auto;border-radius:10px;">`
      : `<div class="brand-icon"><span style="font-weight:900;font-size:1.2rem;letter-spacing:-1px;">LP</span><span style="color:#e5a623;font-weight:900;font-size:1.2rem;">EK</span></div>`;

    const pageTitle = title === 'Beranda'
      ? siteTitle
      : `${title} — ${siteTitle}`;

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${siteDesc}">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${siteDesc}">
  <meta property="og:type" content="website">
  <link rel="icon" href="${favicon}">
  <link rel="canonical" href="https://lpek.pages.dev/">
  <style>${css}</style>
  <style>
    /* === NAV DROPDOWN === */
    .lpek-header { position: sticky; top: 0; z-index: 500; }
    .nav-list { list-style: none; display: flex; align-items: center; flex-wrap: wrap; }
    .nav-item { position: relative; }
    .nav-link {
      display: flex; align-items: center; gap: 4px;
      padding: 10px 13px; font-size: 0.82rem; font-weight: 600;
      color: #374151; border-radius: 8px; white-space: nowrap;
      transition: all 0.18s; cursor: pointer;
    }
    .nav-link:hover, .nav-item.active > .nav-link { color: #1e56b0; background: #eef4ff; }
    .nav-chevron { transition: transform 0.2s; display: flex; align-items: center; opacity: 0.6; }
    .nav-item.has-dropdown:hover .nav-chevron { transform: rotate(180deg); }
    .dropdown-menu {
      display: none; position: absolute; top: calc(100% + 4px); left: 0;
      background: white; border: 1px solid #e5e7eb; border-radius: 12px;
      box-shadow: 0 16px 48px rgba(15,45,92,0.15); min-width: 220px;
      padding: 6px; z-index: 600; list-style: none;
    }
    .nav-item.has-dropdown:hover .dropdown-menu { display: block; }
    .dropdown-item {
      display: block; padding: 9px 14px; font-size: 0.85rem; font-weight: 500;
      color: #374151; border-radius: 8px; transition: all 0.15s; white-space: nowrap;
    }
    .dropdown-item:hover { background: #eef4ff; color: #1e56b0; padding-left: 18px; }

    /* === MOBILE NAV === */
    .mobile-menu-overlay {
      display: none; position: fixed; inset: 0; z-index: 800;
      background: rgba(15,45,92,0.6); backdrop-filter: blur(4px);
    }
    .mobile-menu-overlay.open { display: block; }
    .mobile-menu-panel {
      position: fixed; top: 0; right: 0; bottom: 0; width: 300px; max-width: 90vw;
      background: white; z-index: 900; overflow-y: auto;
      box-shadow: -4px 0 40px rgba(0,0,0,0.2);
      transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    .mobile-menu-panel.open { transform: translateX(0); }
    .mobile-menu-header {
      padding: 20px; border-bottom: 1px solid #e5e7eb;
      display: flex; align-items: center; justify-content: space-between;
    }
    .mobile-close-btn {
      padding: 8px; border: 1px solid #e5e7eb; border-radius: 8px;
      background: #f9fafb; cursor: pointer; line-height: 0;
      font-size: 1.2rem; color: #6b7280;
    }
    .mobile-nav-body { padding: 12px; display: flex; flex-direction: column; gap: 2px; }
    .mobile-nav-link {
      display: flex; align-items: center; justify-content: space-between;
      padding: 11px 14px; font-size: 0.9rem; font-weight: 600;
      color: #374151; border-radius: 8px; transition: all 0.15s;
    }
    .mobile-nav-link:hover { background: #eef4ff; color: #1e56b0; }
    .mobile-has-sub .mobile-chevron { transition: transform 0.2s; }
    .mobile-sub-menu {
      display: none; padding: 4px 4px 4px 16px; flex-direction: column; gap: 2px;
    }
    .mobile-sub-menu.open { display: flex; }
    .mobile-sub-link {
      display: block; padding: 8px 14px; font-size: 0.84rem;
      color: #6b7280; border-radius: 6px; transition: all 0.15s;
    }
    .mobile-sub-link:hover { background: #f0f4fa; color: #1e56b0; }

    /* === SEARCH OVERLAY === */
    .search-overlay {
      display: none; position: fixed; inset: 0; z-index: 700;
      background: rgba(15,45,92,0.7); backdrop-filter: blur(8px);
      align-items: flex-start; justify-content: center; padding-top: 80px;
    }
    .search-overlay.open { display: flex; }
    .search-overlay-box {
      background: white; border-radius: 16px; padding: 28px;
      width: 100%; max-width: 580px; margin: 0 16px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.3);
    }
    .search-overlay-title { font-weight: 700; font-size: 1rem; color: #111827; margin-bottom: 14px; }
    .search-overlay-form { display: flex; gap: 10px; }
    .search-overlay-input {
      flex: 1; padding: 13px 18px; border: 2px solid #e5e7eb;
      border-radius: 10px; font-size: 0.95rem; outline: none;
      transition: border-color 0.2s;
    }
    .search-overlay-input:focus { border-color: #1e56b0; }
    .search-overlay-close {
      position: absolute; top: 80px; right: calc(50% - 270px);
      background: white; border: none; border-radius: 50%;
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #6b7280; font-size: 1.1rem;
    }
  </style>
</head>
<body class="${opts?.bodyClass || ''}">
<div class="lpek-wrapper">

  <!-- TOP BAR -->
  <div class="lpek-topbar">
    <div class="container">
      <div class="topbar-left">
        <span class="topbar-item">${ICONS.email} <a href="mailto:${siteEmail}" style="color:inherit;text-decoration:none;">${siteEmail}</a></span>
        ${sitePhone ? `<span class="topbar-item">${ICONS.phone} ${sitePhone}</span>` : ''}
      </div>
      <div class="topbar-right">
        <a href="${waUrl}" class="topbar-item" style="color:inherit;" title="WhatsApp">${ICONS.wa} WA</a>
        <a href="${fbUrl}" class="topbar-item" style="color:inherit;" title="Facebook">${ICONS.fb} FB</a>
        <a href="${igUrl}" class="topbar-item" style="color:inherit;" title="Instagram">${ICONS.ig} IG</a>
        <a href="${ytUrl}" class="topbar-item" style="color:inherit;" title="YouTube">${ICONS.yt} YT</a>
      </div>
    </div>
  </div>

  <!-- HEADER -->
  <header class="lpek-header">
    <div class="container">
      <div class="header-inner">
        <!-- Brand -->
        <a href="/" class="lpek-brand">
          ${brandLogoHtml}
          <div class="brand-text-wrap">
            <div class="brand-name">${siteTitle}</div>
            <div class="brand-tagline">${siteDesc}</div>
          </div>
        </a>

        <!-- Desktop Nav -->
        <nav class="lpek-nav" id="desktopNav">
          <ul class="nav-list">
            ${renderNavItems(navSource)}
          </ul>
        </nav>

        <!-- Actions -->
        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
          <button class="nav-toggle" id="searchBtn" title="Cari" style="padding:9px;">
            ${ICONS.search}
          </button>
          <button class="nav-toggle" id="mobileMenuBtn" title="Menu">
            ${ICONS.menu}
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- MOBILE MENU -->
  <div class="mobile-menu-overlay" id="mobileOverlay"></div>
  <div class="mobile-menu-panel" id="mobilePanel">
    <div class="mobile-menu-header">
      <div class="brand-name" style="font-size:1.1rem;">${siteTitle}</div>
      <button class="mobile-close-btn" id="mobileCloseBtn">✕</button>
    </div>
    <div class="mobile-nav-body">
      ${renderMobileNav(navSource)}
    </div>
  </div>

  <!-- SEARCH OVERLAY -->
  <div class="search-overlay" id="searchOverlay">
    <div class="search-overlay-box">
      <div class="search-overlay-title">${ICONS.search} Cari konten LPEK...</div>
      <form action="/search" method="get" class="search-overlay-form">
        <input type="search" name="q" class="search-overlay-input" placeholder="Ketik kata kunci..." autofocus id="searchInput">
        <button type="submit" class="btn btn-blue btn-sm">Cari</button>
      </form>
    </div>
    <button class="search-overlay-close" id="searchCloseBtn">✕</button>
  </div>

  <!-- MAIN CONTENT -->
  <main id="main-content">
    ${content}
  </main>

  <!-- FOOTER -->
  <footer class="lpek-footer">
    <div class="container">
      <div class="footer-grid">
        <!-- Brand Col -->
        <div class="footer-brand-col">
          <div class="footer-brand-name">${siteTitle}</div>
          <div class="footer-brand-desc">Lembaga Pariwisata dan Ekonomi Kreatif Muhammadiyah. Mendorong kemajuan sektor wisata dan ekonomi kreatif berbasis nilai-nilai Islam berkemajuan.</div>
          <div class="footer-socials">
            <a href="${waUrl}" class="footer-social-btn" title="WhatsApp">${ICONS.wa}</a>
            <a href="${fbUrl}" class="footer-social-btn" title="Facebook">${ICONS.fb}</a>
            <a href="${igUrl}" class="footer-social-btn" title="Instagram">${ICONS.ig}</a>
            <a href="${ytUrl}" class="footer-social-btn" title="YouTube">${ICONS.yt}</a>
          </div>
        </div>

        <!-- Nav Col: Tentang -->
        <div>
          <div class="footer-col-title">Tentang Kami</div>
          <ul class="footer-links">
            <li><a href="/profil">Profil Lembaga</a></li>
            <li><a href="/visi-misi">Visi & Misi</a></li>
            <li><a href="/struktur-organisasi">Struktur Organisasi</a></li>
            <li><a href="/amanah-pp-muhammadiyah">Amanah PP Muhammadiyah</a></li>
            <li><a href="/napak-tilas-sejarah-kh-ahmad-dahlan">Napak Tilas KH Ahmad Dahlan</a></li>
          </ul>
        </div>

        <!-- Nav Col: Program -->
        <div>
          <div class="footer-col-title">Program</div>
          <ul class="footer-links">
            <li><a href="/program/pariwisata-berkemajuan">Pariwisata Berkemajuan</a></li>
            <li><a href="/program/ekonomi-kreatif-berkemajuan">Ekonomi Kreatif</a></li>
            <li><a href="/program/desa-wisata-berkemajuan">Desa Wisata</a></li>
            <li><a href="/program/umkm-berkemajuan">UMKM Berkemajuan</a></li>
            <li><a href="/program/wellness-heritage-berkemajuan">Wellness Heritage</a></li>
          </ul>
        </div>

        <!-- Contact Col -->
        <div>
          <div class="footer-col-title">Kontak</div>
          <div class="footer-contact-item">
            <span class="footer-contact-icon">${ICONS.location}</span>
            <span class="footer-contact-text">${site.site_address || 'Jakarta, Indonesia'}</span>
          </div>
          <div class="footer-contact-item">
            <span class="footer-contact-icon">${ICONS.email}</span>
            <span class="footer-contact-text"><a href="mailto:${siteEmail}" style="color:inherit;">${siteEmail}</a></span>
          </div>
          ${sitePhone ? `<div class="footer-contact-item"><span class="footer-contact-icon">${ICONS.phone}</span><span class="footer-contact-text">${sitePhone}</span></div>` : ''}
          <div style="margin-top:20px;">
            <a href="/akademi" class="btn btn-blue btn-sm" style="gap:6px;">${ICONS.book} Daftar Pelatihan</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Gold bar -->
    <div class="footer-gold-bar"></div>
    <div class="container">
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${siteTitle}. Hak Cipta Dilindungi.</span>
        <span>Bagian dari ekosistem <a href="https://muhammadiyah.or.id">Muhammadiyah</a> · Powered by <strong>cmsMu</strong></span>
      </div>
    </div>
  </footer>
</div>

<!-- JS: Mobile Menu + Search + Dropdown -->
<script>
(function() {
  // Mobile menu
  const btn = document.getElementById('mobileMenuBtn');
  const overlay = document.getElementById('mobileOverlay');
  const panel = document.getElementById('mobilePanel');
  const closeBtn = document.getElementById('mobileCloseBtn');

  function openMenu() { overlay.classList.add('open'); panel.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeMenu() { overlay.classList.remove('open'); panel.classList.remove('open'); document.body.style.overflow = ''; }

  btn?.addEventListener('click', openMenu);
  overlay?.addEventListener('click', closeMenu);
  closeBtn?.addEventListener('click', closeMenu);

  // Mobile sub-menus
  document.querySelectorAll('.mobile-has-sub').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var parent = link.closest('.mobile-nav-group');
      var sub = parent?.querySelector('.mobile-sub-menu');
      var chev = link.querySelector('.mobile-chevron');
      if (sub) {
        sub.classList.toggle('open');
        if (chev) chev.style.transform = sub.classList.contains('open') ? 'rotate(180deg)' : '';
      }
    });
  });

  // Search overlay
  var searchBtn = document.getElementById('searchBtn');
  var searchOverlay = document.getElementById('searchOverlay');
  var searchCloseBtn = document.getElementById('searchCloseBtn');
  var searchInput = document.getElementById('searchInput');

  function openSearch() { searchOverlay.classList.add('open'); setTimeout(function(){ searchInput?.focus(); }, 100); }
  function closeSearch() { searchOverlay.classList.remove('open'); }

  searchBtn?.addEventListener('click', openSearch);
  searchCloseBtn?.addEventListener('click', closeSearch);
  searchOverlay?.addEventListener('click', function(e) { if (e.target === searchOverlay) closeSearch(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeSearch(); });

  // Highlight active nav link
  var path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(function(a) {
    var href = a.getAttribute('href');
    if (href && href !== '/' && path.startsWith(href)) a.classList.add('active');
    else if (href === '/' && path === '/') a.classList.add('active');
  });
})();
</script>
</body>
</html>`;
  },

  // ===================================================================
  // RENDER HOME
  // ===================================================================
  renderHome(ctx: ThemeContext): string {
    const site   = ctx.site || {};
    const posts  = Array.isArray(ctx.data) ? ctx.data : [];
    const pgData = ctx.pageData;

    const heroTitle   = pgData?.meta_title  || site.hero_title  || 'Memajukan Pariwisata & Ekonomi Kreatif Indonesia';
    const heroDesc    = pgData?.meta_desc   || site.hero_desc   || 'LPEK Muhammadiyah hadir sebagai lembaga strategis untuk mendorong kemajuan pariwisata halal, ekonomi kreatif, dan kesejahteraan umat melalui program berkelanjutan berbasis nilai Islam berkemajuan.';

    // Split posts by type
    const newsP    = posts.filter((p: any) => p.category !== 'program' && p.category !== 'kegiatan').slice(0, 4);
    const programs = posts.filter((p: any) => p.category === 'program' || p.type === 'program').slice(0, 6);
    const events   = posts.filter((p: any) => p.category === 'kegiatan' || p.type === 'kegiatan').slice(0, 3);
    const allNews  = posts.filter((p: any) => p.category !== 'program' && p.category !== 'kegiatan');
    const featuredNews = allNews.slice(0, 1)[0];
    const gridNews     = allNews.slice(1, 5);

    // HERO
    const heroSection = `
      <section class="lpek-hero">
        <div class="container">
          <div class="hero-content anim-fade-up">
            <div class="hero-badge">🕌 Muhammadiyah · Pariwisata Berkemajuan</div>
            <h1 class="hero-title">
              ${heroTitle.split(' ').slice(0, 3).join(' ')}<br>
              <span class="highlight">${heroTitle.split(' ').slice(3).join(' ')}</span>
            </h1>
            <p class="hero-desc">${heroDesc}</p>
            <div class="hero-actions">
              <a href="/program" class="btn btn-primary">${ICONS.arrow} Lihat Program</a>
              <a href="/akademi" class="btn btn-outline">${ICONS.book} Daftar Akademi</a>
            </div>
            <div class="hero-stats">
              <div>
                <div class="hero-stat-num">5+</div>
                <div class="hero-stat-label">Program Unggulan</div>
              </div>
              <div>
                <div class="hero-stat-num">49</div>
                <div class="hero-stat-label">Muktamar Medan</div>
              </div>
              <div>
                <div class="hero-stat-num">100+</div>
                <div class="hero-stat-label">Destinasi Mitra</div>
              </div>
              <div>
                <div class="hero-stat-num">1K+</div>
                <div class="hero-stat-label">Pelaku UMKM</div>
              </div>
            </div>
          </div>
        </div>
      </section>`;

    // QUICK NAV TILES
    const quickNav = `
      <section style="padding:32px 0;background:white;border-bottom:1px solid #e5e7eb;">
        <div class="container">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;">
            ${[
              { icon: '🏝️', label: 'Pariwisata',     url: '/program/pariwisata-berkemajuan' },
              { icon: '🎨', label: 'Ekraf',           url: '/program/ekonomi-kreatif-berkemajuan' },
              { icon: '🌾', label: 'Desa Wisata',     url: '/program/desa-wisata-berkemajuan' },
              { icon: '🏪', label: 'UMKM',            url: '/program/umkm-berkemajuan' },
              { icon: '🌿', label: 'Wellness',        url: '/program/wellness-heritage-berkemajuan' },
              { icon: '🗺️', label: 'Direktori',       url: '/direktori' },
              { icon: '🎓', label: 'Akademi',         url: '/akademi' },
              { icon: '📅', label: 'Kegiatan',        url: '/kegiatan' },
            ].map(t => `
              <a href="${t.url}" style="
                display:flex;flex-direction:column;align-items:center;gap:8px;padding:18px 12px;
                background:#f8fafd;border:1px solid #e5e7eb;border-radius:12px;
                font-size:0.82rem;font-weight:700;color:#374151;text-decoration:none;
                transition:all 0.2s;text-align:center;
              " onmouseover="this.style.background='#eef4ff';this.style.color='#1e56b0';this.style.borderColor='#1e56b0';" onmouseout="this.style.background='#f8fafd';this.style.color='#374151';this.style.borderColor='#e5e7eb';">
                <span style="font-size:1.8rem;">${t.icon}</span>
                ${t.label}
              </a>`).join('')}
          </div>
        </div>
      </section>`;

    // SPECIAL BANNER: Napak Tilas + Muktamar
    const bannerSection = `
      <section style="padding:40px 0;background:#f0f4fa;">
        <div class="container">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <a href="/napak-tilas-sejarah-kh-ahmad-dahlan" style="
              display:block;border-radius:16px;overflow:hidden;
              background:linear-gradient(135deg,#0f2d5c,#1a4080);
              padding:32px;color:white;text-decoration:none;
              transition:transform 0.2s,box-shadow 0.2s;position:relative;
            " onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 40px rgba(15,45,92,0.3)';" onmouseout="this.style.transform='';this.style.boxShadow='';">
              <div style="font-size:2.5rem;margin-bottom:12px;">🕌</div>
              <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fbbf24;margin-bottom:8px;">Sejarah &amp; Heritage</div>
              <h3 style="font-size:1.25rem;font-weight:900;line-height:1.3;margin-bottom:8px;font-family:'Plus Jakarta Sans',sans-serif;">Napak Tilas Sejarah KH Ahmad Dahlan</h3>
              <p style="font-size:0.85rem;opacity:0.75;line-height:1.6;">Mengenal jejak perjuangan pendiri Muhammadiyah dalam membangun peradaban Islam berkemajuan.</p>
              <div style="margin-top:16px;font-size:0.82rem;font-weight:700;color:#fbbf24;display:flex;align-items:center;gap:6px;">Selengkapnya ${ICONS.arrow}</div>
            </a>
            <a href="/parekraf-muktamar-49-medan" style="
              display:block;border-radius:16px;overflow:hidden;
              background:linear-gradient(135deg,#7c2d12,#c2410c);
              padding:32px;color:white;text-decoration:none;
              transition:transform 0.2s,box-shadow 0.2s;position:relative;
            " onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 40px rgba(124,45,18,0.3)';" onmouseout="this.style.transform='';this.style.boxShadow='';">
              <div style="font-size:2.5rem;margin-bottom:12px;">🏟️</div>
              <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fbbf24;margin-bottom:8px;">Muktamar ke-49 · Medan</div>
              <h3 style="font-size:1.25rem;font-weight:900;line-height:1.3;margin-bottom:8px;font-family:'Plus Jakarta Sans',sans-serif;">Parekraf untuk Muktamar ke-49 Medan</h3>
              <p style="font-size:0.85rem;opacity:0.75;line-height:1.6;">Kontribusi nyata LPEK dalam memeriahkan Muktamar ke-49 Muhammadiyah di Kota Medan.</p>
              <div style="margin-top:16px;font-size:0.82rem;font-weight:700;color:#fbbf24;display:flex;align-items:center;gap:6px;">Selengkapnya ${ICONS.arrow}</div>
            </a>
          </div>
        </div>
      </section>`;

    // PROGRAMS SECTION
    const programItems = [
      { emoji:'🏝️', title:'Pariwisata Berkemajuan',        url:'/program/pariwisata-berkemajuan',        desc:'Mengembangkan wisata halal dan destinasi unggulan Indonesia berbasis nilai Islam.' },
      { emoji:'🎨', title:'Ekonomi Kreatif Berkemajuan',   url:'/program/ekonomi-kreatif-berkemajuan',   desc:'Mendorong kreativitas dan inovasi ekonomi berbasis budaya lokal yang berkelanjutan.' },
      { emoji:'🌾', title:'Desa Wisata Berkemajuan',       url:'/program/desa-wisata-berkemajuan',       desc:'Memberdayakan desa melalui potensi wisata alam, budaya, dan kuliner autentik.' },
      { emoji:'🏪', title:'UMKM Berkemajuan',              url:'/program/umkm-berkemajuan',              desc:'Penguatan kapasitas UMKM wisata dan kreatif agar berdaya saing global.' },
      { emoji:'🌿', title:'Wellness Heritage Berkemajuan', url:'/program/wellness-heritage-berkemajuan', desc:'Mengintegrasikan kesehatan holistik dengan warisan budaya dan kearifan lokal.' },
    ];

    const programSection = `
      <section class="section">
        <div class="container">
          <div class="section-header">
            <div class="section-label">Program Unggulan</div>
            <h2 class="section-title">5 Pilar Program LPEK</h2>
            <div class="gold-divider"></div>
            <p class="section-subtitle" style="margin-top:14px;">Program strategis untuk mendorong kemajuan pariwisata dan ekonomi kreatif umat</p>
          </div>
          <div class="program-grid">
            ${programItems.map(p => `
              <a href="${p.url}" class="program-card" style="text-decoration:none;">
                <div class="program-card-img-wrap">
                  <div class="program-card-placeholder">${p.emoji}</div>
                </div>
                <div class="program-card-body">
                  <h3 class="program-card-title">${p.title}</h3>
                  <p class="program-card-excerpt">${p.desc}</p>
                  <div class="program-card-footer">
                    <span class="badge badge-navy">Program</span>
                    <span class="program-card-link">Selengkapnya ${ICONS.arrow}</span>
                  </div>
                </div>
              </a>`).join('')}
          </div>
        </div>
      </section>`;

    // ABOUT SECTION
    const aboutSection = `
      <section class="about-section">
        <div class="container">
          <div class="about-grid">
            <div>
              <div class="about-label">🕌 Tentang LPEK</div>
              <h2 class="about-title">Lembaga Pariwisata &amp; Ekonomi Kreatif Muhammadiyah</h2>
              <p class="about-desc">LPEK adalah lembaga resmi Muhammadiyah yang berkomitmen memajukan sektor pariwisata halal dan ekonomi kreatif berbasis nilai-nilai Islam berkemajuan, dengan fokus pada pemberdayaan umat dan kesejahteraan masyarakat.</p>
              <div class="about-features">
                <div class="about-feat-item">
                  <div class="about-feat-icon">🏝️</div>
                  <div>
                    <div class="about-feat-title">Wisata Halal &amp; Berkualitas</div>
                    <div class="about-feat-desc">Mengembangkan destinasi wisata yang ramah, aman, dan sesuai nilai Islam</div>
                  </div>
                </div>
                <div class="about-feat-item">
                  <div class="about-feat-icon">🎓</div>
                  <div>
                    <div class="about-feat-title">Pengembangan SDM</div>
                    <div class="about-feat-desc">Pelatihan dan sertifikasi profesi di bidang pariwisata dan ekonomi kreatif</div>
                  </div>
                </div>
                <div class="about-feat-item">
                  <div class="about-feat-icon">🤝</div>
                  <div>
                    <div class="about-feat-title">Kolaborasi Strategis</div>
                    <div class="about-feat-desc">Membangun jejaring dengan pemangku kepentingan dan mitra internasional</div>
                  </div>
                </div>
              </div>
              <div style="margin-top:28px;">
                <a href="/tentang" class="btn btn-outline">Pelajari Lebih Lanjut ${ICONS.arrow}</a>
              </div>
            </div>
            <div class="about-stats">
              <div class="about-stat-card">
                <div class="about-stat-num">1912</div>
                <div class="about-stat-label">Tahun Berdiri Muhammadiyah</div>
              </div>
              <div class="about-stat-card">
                <div class="about-stat-num">5</div>
                <div class="about-stat-label">Program Pilar Utama</div>
              </div>
              <div class="about-stat-card">
                <div class="about-stat-num">100+</div>
                <div class="about-stat-label">Destinasi Mitra Terdaftar</div>
              </div>
              <div class="about-stat-card">
                <div class="about-stat-num">34</div>
                <div class="about-stat-label">Provinsi Jangkauan</div>
              </div>
            </div>
          </div>
        </div>
      </section>`;

    // NEWS SECTION
    const newsSection = `
      <section class="section section-alt">
        <div class="container">
          <div class="section-header" style="display:flex;align-items:center;justify-content:space-between;text-align:left;margin-bottom:32px;">
            <div>
              <div class="section-label">Berita Terkini</div>
              <h2 class="section-title" style="margin-bottom:0;">Berita &amp; Artikel</h2>
            </div>
            <a href="/berita" class="btn btn-ghost btn-sm">Semua Berita ${ICONS.arrow}</a>
          </div>
          ${featuredNews ? `
          <div class="news-featured" style="margin-bottom:28px;">
            <div class="news-featured-img-wrap">
              ${featuredNews.featured_image
                ? `<img src="${featuredNews.featured_image}" alt="${featuredNews.title}" class="news-featured-img" loading="lazy">`
                : `<div class="news-featured-placeholder">📰</div>`}
            </div>
            <div class="news-featured-body">
              ${featuredNews.category ? `<span class="news-featured-cat">${featuredNews.category}</span>` : ''}
              <h3 class="news-featured-title">
                <a href="/${featuredNews.slug}">${featuredNews.title}</a>
              </h3>
              <p class="news-featured-excerpt">${excerpt(featuredNews.body || featuredNews.excerpt || '', 200)}</p>
              <div style="display:flex;align-items:center;gap:14px;font-size:0.8rem;color:#6b7280;margin-bottom:18px;">
                <span>${ICONS.calendar} ${formatDate(featuredNews.created_at)}</span>
              </div>
              <a href="/${featuredNews.slug}" class="btn btn-blue btn-sm">Baca Selengkapnya ${ICONS.arrow}</a>
            </div>
          </div>` : ''}
          <div class="news-grid">
            ${gridNews.map((p: any) => `
              <article class="news-card">
                <div class="news-card-img-wrap">
                  ${p.featured_image
                    ? `<img src="${p.featured_image}" alt="${p.title}" class="news-card-img" loading="lazy">`
                    : `<div class="news-card-placeholder">📰</div>`}
                </div>
                <div class="news-card-body">
                  ${p.category ? `<span class="news-card-cat">${p.category}</span>` : ''}
                  <h3 class="news-card-title"><a href="/${p.slug}">${p.title}</a></h3>
                  <p class="news-card-excerpt">${excerpt(p.body || p.excerpt || '')}</p>
                  <div class="news-card-footer">
                    <span class="news-card-date">${ICONS.calendar} ${formatDate(p.created_at)}</span>
                    <a href="/${p.slug}" class="news-card-read">Baca ${ICONS.arrow}</a>
                  </div>
                </div>
              </article>`).join('')}
          </div>
          ${allNews.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">📰</div><h3>Belum Ada Berita</h3><p>Berita akan segera ditambahkan. Pantau terus!</p></div>` : ''}
        </div>
      </section>`;

    // KEGIATAN SECTION
    const kegiatanSection = `
      <section class="section">
        <div class="container">
          <div class="section-header" style="display:flex;align-items:center;justify-content:space-between;text-align:left;margin-bottom:32px;">
            <div>
              <div class="section-label">Agenda</div>
              <h2 class="section-title" style="margin-bottom:0;">Kegiatan Terdekat</h2>
            </div>
            <a href="/kegiatan" class="btn btn-ghost btn-sm">Lihat Semua ${ICONS.arrow}</a>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;">
            ${events.length > 0 ? events.map((e: any) => `
              <a href="/${e.slug}" style="display:block;background:white;border:1px solid #e5e7eb;border-radius:12px;padding:24px;text-decoration:none;transition:all 0.2s;" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(15,45,92,0.1)';" onmouseout="this.style.transform='';this.style.boxShadow='';">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
                  <div style="width:48px;height:48px;background:#eef4ff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">📅</div>
                  <div style="font-size:0.75rem;color:#1e56b0;font-weight:700;">${formatDate(e.event_date || e.created_at)}</div>
                </div>
                <h4 style="font-size:0.95rem;font-weight:700;color:#111827;margin-bottom:8px;line-height:1.4;">${e.title}</h4>
                <p style="font-size:0.82rem;color:#6b7280;line-height:1.6;">${excerpt(e.body || e.excerpt || '', 100)}</p>
              </a>`).join('')
            : `<div style="grid-column:1/-1;"><div class="empty-state"><div class="empty-state-icon">📅</div><h3>Belum Ada Kegiatan</h3><p>Kegiatan akan segera diumumkan.</p></div></div>`}
          </div>
        </div>
      </section>`;

    // DIREKTORI SECTION
    const direktoriSection = `
      <section class="section section-alt">
        <div class="container">
          <div class="section-header">
            <div class="section-label">Direktori</div>
            <h2 class="section-title">Temukan Destinasi &amp; Mitra</h2>
            <div class="gold-divider"></div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:8px;">
            ${[
              { icon:'🏝️', label:'Destinasi Wisata', url:'/direktori/destinasi', count:'100+', color:'#1e56b0' },
              { icon:'🏪', label:'UMKM Kreatif',      url:'/direktori/umkm',      count:'500+', color:'#10b981' },
              { icon:'🍽️', label:'Restoran Halal',    url:'/direktori/restoran',  count:'200+', color:'#f59e0b' },
              { icon:'🤝', label:'Mitra Strategis',   url:'/direktori/mitra',     count:'50+',  color:'#8b5cf6' },
            ].map(d => `
              <a href="${d.url}" style="
                display:flex;flex-direction:column;align-items:center;gap:10px;padding:28px 20px;
                background:white;border:1px solid #e5e7eb;border-radius:14px;
                text-decoration:none;transition:all 0.2s;text-align:center;
              " onmouseover="this.style.borderColor='${d.color}';this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)';" onmouseout="this.style.borderColor='#e5e7eb';this.style.transform='';this.style.boxShadow='';">
                <div style="font-size:2.2rem;">${d.icon}</div>
                <div style="font-size:1.5rem;font-weight:900;color:${d.color};font-family:'Plus Jakarta Sans',sans-serif;">${d.count}</div>
                <div style="font-size:0.875rem;font-weight:700;color:#374151;">${d.label}</div>
              </a>`).join('')}
          </div>
          <div class="section-footer">
            <a href="/direktori" class="btn btn-blue">Jelajahi Direktori ${ICONS.arrow}</a>
          </div>
        </div>
      </section>`;

    // AKADEMI CTA
    const akademiSection = `
      <section style="padding:64px 0;background:linear-gradient(135deg,#0f2d5c 0%,#1e56b0 100%);color:white;">
        <div class="container">
          <div style="display:grid;grid-template-columns:1fr auto;gap:32px;align-items:center;">
            <div>
              <div class="about-label" style="color:#fbbf24;margin-bottom:12px;">${ICONS.book} Akademi LPEK</div>
              <h2 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:clamp(1.6rem,3vw,2.2rem);font-weight:900;margin-bottom:12px;line-height:1.2;">Tingkatkan Kapasitas Anda di Sektor Pariwisata &amp; Ekraf</h2>
              <p style="opacity:0.8;line-height:1.7;max-width:520px;">Pelatihan, webinar, modul, dan sertifikasi profesi dari praktisi berpengalaman. Investasi terbaik untuk karir Anda di industri kreatif.</p>
              <div style="display:flex;gap:12px;margin-top:24px;flex-wrap:wrap;">
                <a href="/akademi/pelatihan"   class="btn btn-primary">Pelatihan</a>
                <a href="/akademi/webinar"     class="btn btn-outline btn-sm">Webinar</a>
                <a href="/akademi/sertifikasi" class="btn btn-outline btn-sm">Sertifikasi</a>
                <a href="/akademi/modul"       class="btn btn-outline btn-sm">Modul</a>
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0;">
              <div style="font-size:5rem;opacity:0.15;font-weight:900;font-family:'Plus Jakarta Sans',sans-serif;line-height:1;">AKADEMI</div>
            </div>
          </div>
        </div>
      </section>`;

    // KOLABORASI
    const kolabSection = `
      <section class="section section-alt">
        <div class="container">
          <div class="section-header">
            <div class="section-label">Kolaborasi</div>
            <h2 class="section-title">Bergabung Bersama Kami</h2>
            <div class="gold-divider"></div>
            <p class="section-subtitle" style="margin-top:14px;">LPEK terbuka untuk berkolaborasi dengan berbagai pihak dalam memajukan pariwisata dan ekonomi kreatif Indonesia</p>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
            ${[
              { icon:'🏛️', title:'Pemerintah &amp; Daerah', desc:'Sinergi program pengembangan wisata daerah dan kebijakan ekonomi kreatif.' },
              { icon:'🏢', title:'Dunia Usaha', desc:'Kemitraan bisnis dalam pengelolaan destinasi, produk kreatif, dan UMKM.' },
              { icon:'🎓', title:'Perguruan Tinggi', desc:'Riset, pengembangan kurikulum, dan pendidikan vokasi pariwisata halal.' },
              { icon:'🌍', title:'Organisasi Internasional', desc:'Jaringan global untuk mempromosikan wisata halal Indonesia.' },
            ].map(k => `
              <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:28px;transition:all 0.2s;" onmouseover="this.style.borderColor='#1e56b0';this.style.transform='translateY(-3px)';" onmouseout="this.style.borderColor='#e5e7eb';this.style.transform='';">
                <div style="font-size:2rem;margin-bottom:14px;">${k.icon}</div>
                <h4 style="font-size:1rem;font-weight:800;color:#0f2d5c;margin-bottom:8px;font-family:'Plus Jakarta Sans',sans-serif;">${k.title}</h4>
                <p style="font-size:0.85rem;color:#6b7280;line-height:1.65;">${k.desc}</p>
              </div>`).join('')}
          </div>
          <div class="section-footer">
            <a href="/kolaborasi" class="btn btn-blue">Hubungi Kami ${ICONS.arrow}</a>
          </div>
        </div>
      </section>`;

    const html = heroSection + quickNav + bannerSection + programSection + aboutSection + newsSection + kegiatanSection + direktoriSection + akademiSection + kolabSection;
    return this._layout(html, 'Beranda', ctx);
  },

  // ===================================================================
  // RENDER SINGLE POST
  // ===================================================================
  renderSingle(ctx: ThemeContext): string {
    const post = ctx.data;
    if (!post) return this.render404(ctx);
    const site = ctx.site || {};
    const siteTitle = site.site_title || 'LPEK';

    const catUrl  = post.category ? `/${post.category.toLowerCase().replace(/\s+/g, '-')}` : '/berita';
    const catLabel = post.category || 'Berita';

    const tagsHtml = post.tags
      ? `<div class="post-tags">${post.tags.split(',').map((t: string) => t.trim()).filter(Boolean).map((t: string) =>
          `<a href="/search?q=${encodeURIComponent(t)}" class="post-tag">#${t}</a>`
        ).join('')}</div>`
      : '';

    const shareUrl = `https://lpek.pages.dev/${post.slug}`;
    const shareTitle = encodeURIComponent(post.title);

    const html = `
      <!-- Single Header -->
      <div class="single-header-section">
        <div class="container-sm">
          <div class="single-breadcrumb">
            <a href="/">Beranda</a>
            <span class="single-breadcrumb-sep">›</span>
            <a href="${catUrl}">${catLabel}</a>
            <span class="single-breadcrumb-sep">›</span>
            <span>${post.title.substring(0, 40)}${post.title.length > 40 ? '…' : ''}</span>
          </div>
          <span class="single-cat-badge">${catLabel}</span>
          <h1 class="single-title">${post.title}</h1>
          <div class="single-meta-bar">
            ${post.created_at ? `<span class="single-meta-item">${ICONS.calendar} ${formatDate(post.created_at)}</span>` : ''}
            <span class="single-meta-item">${ICONS.user} Tim LPEK</span>
          </div>
        </div>
      </div>

      <!-- Single Body -->
      <div class="single-body-section">
        <div class="container-sm">
          ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" class="single-featured-img" loading="lazy">` : ''}

          <div class="entry-content">
            ${post.body || '<p>Konten belum tersedia.</p>'}
          </div>

          ${tagsHtml}

          <!-- Share Bar -->
          <div class="share-bar">
            <span class="share-label">Bagikan:</span>
            <div class="share-links">
              <a href="https://wa.me/?text=${shareTitle}%20${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener" class="share-btn wa">${ICONS.wa} WhatsApp</a>
              <a href="https://www.facebook.com/sharer.php?u=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener" class="share-btn fb">${ICONS.fb} Facebook</a>
              <a href="https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}" target="_blank" rel="noopener" class="share-btn tg">✈️ Telegram</a>
            </div>
          </div>

          <!-- Back -->
          <div style="margin-top:32px;">
            <a href="/berita" class="back-link-dark back-link">← Kembali ke Berita</a>
          </div>
        </div>
      </div>`;

    return this._layout(html, post.title, ctx);
  },

  // ===================================================================
  // RENDER PAGE (static: tentang, profil, visi-misi, dst)
  // ===================================================================
  renderPage(ctx: ThemeContext): string {
    const page = ctx.data;
    if (!page) return this.render404(ctx);

    // Kontak page
    if (page.slug === 'kontak') return this.renderKontak(ctx);

    const html = `
      <!-- Page Header -->
      <div class="page-header">
        <div class="container">
          <div style="font-size:0.8rem;opacity:0.6;margin-bottom:10px;display:flex;gap:8px;align-items:center;">
            <a href="/" style="color:#fbbf24;">Beranda</a> › <span>${page.title}</span>
          </div>
          <h1 class="page-header-title">${page.title}</h1>
          ${page.meta_desc ? `<p class="page-header-desc">${page.meta_desc}</p>` : ''}
        </div>
      </div>

      <!-- Page Body -->
      <div class="page-body">
        <div class="container-sm">
          ${page.featured_image ? `<img src="${page.featured_image}" alt="${page.title}" style="width:100%;border-radius:14px;margin-bottom:36px;box-shadow:0 8px 32px rgba(15,45,92,0.12);">` : ''}
          <div class="entry-content">
            ${page.body || '<p>Konten halaman ini belum tersedia. Silakan tambahkan melalui panel admin.</p>'}
          </div>
        </div>
      </div>`;

    return this._layout(html, page.title, ctx);
  },

  // ===================================================================
  // RENDER CATEGORY / LIST
  // ===================================================================
  renderCategory(ctx: ThemeContext): string {
    const posts    = Array.isArray(ctx.data) ? ctx.data : [];
    const catName  = (ctx as any).categoryName || 'Kategori';
    const pagination = (ctx as any).pagination;
    const baseUrl  = pagination?.baseUrl || '/berita';

    const gridHtml = posts.length === 0
      ? `<div class="empty-state"><div class="empty-state-icon">📂</div><h3>Belum Ada Konten</h3><p>Konten akan segera ditambahkan.</p></div>`
      : `<div class="news-grid">
          ${posts.map((p: any) => `
            <article class="news-card">
              <div class="news-card-img-wrap">
                ${p.featured_image
                  ? `<img src="${p.featured_image}" alt="${p.title}" class="news-card-img" loading="lazy">`
                  : `<div class="news-card-placeholder">📄</div>`}
              </div>
              <div class="news-card-body">
                ${p.category ? `<span class="news-card-cat">${p.category}</span>` : ''}
                <h3 class="news-card-title"><a href="/${p.slug}">${p.title}</a></h3>
                <p class="news-card-excerpt">${excerpt(p.body || p.excerpt || '')}</p>
                <div class="news-card-footer">
                  <span class="news-card-date">${ICONS.calendar} ${formatDate(p.created_at)}</span>
                  <a href="/${p.slug}" class="news-card-read">Baca ${ICONS.arrow}</a>
                </div>
              </div>
            </article>`).join('')}
        </div>`;

    const html = `
      <div class="archive-header">
        <div class="container">
          <h1 class="archive-title">📂 ${catName}</h1>
          <p class="archive-count">${posts.length} konten${pagination ? ` dari ${pagination.totalItems} total` : ''}</p>
        </div>
      </div>
      <div class="archive-body">
        <div class="container">
          ${gridHtml}
          ${renderPagination(pagination, baseUrl)}
        </div>
      </div>`;

    return this._layout(html, catName, ctx);
  },

  // ===================================================================
  // RENDER PROGRAM LIST
  // ===================================================================
  renderProgram(ctx: ThemeContext): string {
    const posts = Array.isArray(ctx.data) ? ctx.data : [];
    const currentSlug = (ctx as any).currentSlug || '';

    const programs = [
      { slug:'pariwisata-berkemajuan',         emoji:'🏝️', title:'Pariwisata Berkemajuan',        color:'#0f2d5c' },
      { slug:'ekonomi-kreatif-berkemajuan',    emoji:'🎨', title:'Ekonomi Kreatif Berkemajuan',   color:'#7c3aed' },
      { slug:'desa-wisata-berkemajuan',        emoji:'🌾', title:'Desa Wisata Berkemajuan',       color:'#10b981' },
      { slug:'umkm-berkemajuan',               emoji:'🏪', title:'UMKM Berkemajuan',              color:'#f59e0b' },
      { slug:'wellness-heritage-berkemajuan',  emoji:'🌿', title:'Wellness Heritage Berkemajuan', color:'#ef4444' },
    ];

    const sidebarHtml = `
      <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:20px;sticky;top:100px;">
        <div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;margin-bottom:14px;border-bottom:1px solid #f0f0f0;padding-bottom:10px;">Program LPEK</div>
        ${programs.map(p => `
          <a href="/program/${p.slug}" style="
            display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;
            font-size:0.875rem;font-weight:600;text-decoration:none;margin-bottom:4px;
            transition:all 0.15s;
            ${currentSlug === p.slug ? 'background:#eef4ff;color:#1e56b0;' : 'color:#374151;'}
          " onmouseover="if('${currentSlug}'!=='${p.slug}'){this.style.background='#f8fafd';}" onmouseout="if('${currentSlug}'!=='${p.slug}'){this.style.background='';}">
            <span style="font-size:1.1rem;">${p.emoji}</span> ${p.title}
          </a>`).join('')}
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #f0f0f0;">
          <a href="/program" style="font-size:0.82rem;color:#6b7280;display:flex;align-items:center;gap:4px;">← Semua Program</a>
        </div>
      </div>`;

    const gridHtml = posts.length === 0
      ? `<div class="empty-state"><div class="empty-state-icon">📋</div><h3>Konten Program Belum Tersedia</h3><p>Konten akan segera ditambahkan oleh tim LPEK.</p></div>`
      : `<div class="news-grid">
          ${posts.map((p: any) => `
            <article class="news-card">
              <div class="news-card-img-wrap">
                ${p.featured_image ? `<img src="${p.featured_image}" alt="${p.title}" class="news-card-img" loading="lazy">` : `<div class="news-card-placeholder">${PROGRAM_EMOJI[currentSlug] || '📋'}</div>`}
              </div>
              <div class="news-card-body">
                <h3 class="news-card-title"><a href="/${p.slug}">${p.title}</a></h3>
                <p class="news-card-excerpt">${excerpt(p.body || p.excerpt || '')}</p>
                <div class="news-card-footer">
                  <span class="news-card-date">${ICONS.calendar} ${formatDate(p.created_at)}</span>
                  <a href="/${p.slug}" class="news-card-read">Baca ${ICONS.arrow}</a>
                </div>
              </div>
            </article>`).join('')}
        </div>`;

    const catName = programs.find(p => p.slug === currentSlug)?.title || 'Program';
    const catEmoji = programs.find(p => p.slug === currentSlug)?.emoji || '🏆';

    const html = `
      <div class="archive-header">
        <div class="container">
          <div style="font-size:0.8rem;opacity:0.65;margin-bottom:8px;"><a href="/" style="color:#fbbf24;">Beranda</a> › <a href="/program" style="color:#fbbf24;">Program</a> › <span>${catName}</span></div>
          <h1 class="archive-title">${catEmoji} ${catName}</h1>
        </div>
      </div>
      <div class="archive-body">
        <div class="container">
          <div style="display:grid;grid-template-columns:280px 1fr;gap:32px;align-items:start;">
            <div style="position:sticky;top:100px;">${sidebarHtml}</div>
            <div>${gridHtml}</div>
          </div>
        </div>
      </div>`;

    return this._layout(html, catName, ctx);
  },

  // ===================================================================
  // RENDER DIREKTORI
  // ===================================================================
  renderDirektori(ctx: ThemeContext): string {
    const posts    = Array.isArray(ctx.data) ? ctx.data : [];
    const subType  = (ctx as any).subType || 'destinasi';
    const catName  = (ctx as any).categoryName || 'Direktori';

    const tabs = [
      { key:'destinasi', label:'Destinasi Wisata', icon:'🏝️', url:'/direktori/destinasi' },
      { key:'umkm',      label:'UMKM Kreatif',     icon:'🏪', url:'/direktori/umkm' },
      { key:'restoran',  label:'Restoran Halal',   icon:'🍽️', url:'/direktori/restoran' },
      { key:'mitra',     label:'Mitra',            icon:'🤝', url:'/direktori/mitra' },
    ];

    const tabsHtml = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:32px;">
        ${tabs.map(t => `
          <a href="${t.url}" style="
            display:flex;align-items:center;gap:8px;padding:10px 18px;
            border-radius:10px;font-size:0.875rem;font-weight:700;
            border:2px solid ${t.key === subType ? '#1e56b0' : '#e5e7eb'};
            background:${t.key === subType ? '#eef4ff' : 'white'};
            color:${t.key === subType ? '#1e56b0' : '#6b7280'};
            text-decoration:none;transition:all 0.15s;
          ">${t.icon} ${t.label}</a>`).join('')}
      </div>`;

    const cardHtml = posts.length === 0
      ? `<div class="empty-state"><div class="empty-state-icon">${tabs.find(t => t.key === subType)?.icon || '📂'}</div><h3>Direktori Belum Tersedia</h3><p>Data direktori akan segera ditambahkan.</p></div>`
      : `<div class="program-grid">
          ${posts.map((p: any) => `
            <a href="/${p.slug}" class="program-card" style="text-decoration:none;">
              <div class="program-card-img-wrap">
                ${p.featured_image ? `<img src="${p.featured_image}" alt="${p.title}" class="program-card-img" loading="lazy">` : `<div class="program-card-placeholder">${tabs.find(t=>t.key===subType)?.icon || '📌'}</div>`}
              </div>
              <div class="program-card-body">
                ${p.category ? `<span class="badge badge-blue" style="margin-bottom:8px;">${p.category}</span>` : ''}
                <h3 class="program-card-title">${p.title}</h3>
                <p class="program-card-excerpt">${excerpt(p.body || p.excerpt || '', 100)}</p>
                <div class="program-card-footer">
                  <span style="font-size:0.75rem;color:#6b7280;">${p.location || ''}</span>
                  <span class="program-card-link">Detail ${ICONS.arrow}</span>
                </div>
              </div>
            </a>`).join('')}
        </div>`;

    const html = `
      <div class="archive-header">
        <div class="container">
          <div style="font-size:0.8rem;opacity:0.65;margin-bottom:8px;"><a href="/" style="color:#fbbf24;">Beranda</a> › <a href="/direktori" style="color:#fbbf24;">Direktori</a></div>
          <h1 class="archive-title">🗺️ Direktori LPEK</h1>
        </div>
      </div>
      <div class="archive-body">
        <div class="container">
          ${tabsHtml}
          ${cardHtml}
        </div>
      </div>`;

    return this._layout(html, catName, ctx);
  },

  // ===================================================================
  // RENDER AKADEMI
  // ===================================================================
  renderAkademi(ctx: ThemeContext): string {
    const posts   = Array.isArray(ctx.data) ? ctx.data : [];
    const subType = (ctx as any).subType || 'pelatihan';
    const catName = (ctx as any).categoryName || 'Akademi';

    const tabs = [
      { key:'pelatihan',   label:'Pelatihan',    icon:ICONS.book,  url:'/akademi/pelatihan' },
      { key:'webinar',     label:'Webinar',      icon:'🖥️',        url:'/akademi/webinar' },
      { key:'sertifikasi', label:'Sertifikasi',  icon:ICONS.award, url:'/akademi/sertifikasi' },
      { key:'modul',       label:'Modul',        icon:'📗',        url:'/akademi/modul' },
    ];

    const tabsHtml = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:32px;">
        ${tabs.map(t => `
          <a href="${t.url}" style="
            display:flex;align-items:center;gap:8px;padding:10px 18px;
            border-radius:10px;font-size:0.875rem;font-weight:700;
            border:2px solid ${t.key === subType ? '#1e56b0' : '#e5e7eb'};
            background:${t.key === subType ? '#eef4ff' : 'white'};
            color:${t.key === subType ? '#1e56b0' : '#6b7280'};
            text-decoration:none;transition:all 0.15s;
          ">${t.icon} ${t.label}</a>`).join('')}
      </div>`;

    const cardHtml = posts.length === 0
      ? `<div class="empty-state"><div class="empty-state-icon">🎓</div><h3>Konten ${catName} Belum Tersedia</h3><p>Konten akan segera ditambahkan oleh tim Akademi LPEK.</p></div>`
      : `<div class="news-grid">
          ${posts.map((p: any) => `
            <article class="news-card">
              <div class="news-card-img-wrap">
                ${p.featured_image ? `<img src="${p.featured_image}" alt="${p.title}" class="news-card-img" loading="lazy">` : `<div class="news-card-placeholder" style="font-size:2.5rem;">🎓</div>`}
              </div>
              <div class="news-card-body">
                ${p.category ? `<span class="news-card-cat">${p.category}</span>` : ''}
                <h3 class="news-card-title"><a href="/${p.slug}">${p.title}</a></h3>
                <p class="news-card-excerpt">${excerpt(p.body || p.excerpt || '')}</p>
                <div class="news-card-footer">
                  <span class="news-card-date">${ICONS.calendar} ${formatDate(p.created_at)}</span>
                  <a href="/${p.slug}" class="news-card-read">Lihat ${ICONS.arrow}</a>
                </div>
              </div>
            </article>`).join('')}
        </div>`;

    const html = `
      <div class="archive-header">
        <div class="container">
          <div style="font-size:0.8rem;opacity:0.65;margin-bottom:8px;"><a href="/" style="color:#fbbf24;">Beranda</a> › Akademi</div>
          <h1 class="archive-title">🎓 Akademi LPEK</h1>
        </div>
      </div>
      <div class="archive-body">
        <div class="container">
          ${tabsHtml}
          ${cardHtml}
        </div>
      </div>`;

    return this._layout(html, catName, ctx);
  },

  // ===================================================================
  // RENDER KEGIATAN
  // ===================================================================
  renderKegiatan(ctx: ThemeContext): string {
    const posts      = Array.isArray(ctx.data) ? ctx.data : [];
    const pagination = (ctx as any).pagination;

    const cardHtml = posts.length === 0
      ? `<div class="empty-state"><div class="empty-state-icon">📅</div><h3>Belum Ada Kegiatan</h3><p>Kegiatan akan segera diumumkan. Pantau terus halaman ini.</p></div>`
      : `<div style="display:flex;flex-direction:column;gap:20px;">
          ${posts.map((p: any) => `
            <a href="/${p.slug}" style="
              display:grid;grid-template-columns:90px 1fr;gap:0;
              background:white;border:1px solid #e5e7eb;border-radius:14px;
              overflow:hidden;text-decoration:none;
              transition:all 0.2s;
            " onmouseover="this.style.borderColor='#1e56b0';this.style.boxShadow='0 4px 16px rgba(15,45,92,0.1)';" onmouseout="this.style.borderColor='#e5e7eb';this.style.boxShadow='';">
              <div style="background:linear-gradient(135deg,#0f2d5c,#1e56b0);padding:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:white;">
                <div style="font-size:1.4rem;font-weight:900;line-height:1;">${p.event_date ? new Date(p.event_date).getDate() : new Date(p.created_at).getDate()}</div>
                <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;opacity:0.8;margin-top:3px;">${p.event_date ? new Date(p.event_date).toLocaleDateString('id-ID',{month:'short'}) : new Date(p.created_at).toLocaleDateString('id-ID',{month:'short'})}</div>
              </div>
              <div style="padding:20px 24px;">
                ${p.category ? `<span class="badge badge-blue" style="margin-bottom:8px;">${p.category}</span>` : ''}
                <h4 style="font-size:1rem;font-weight:700;color:#111827;margin-bottom:6px;line-height:1.4;">${p.title}</h4>
                <p style="font-size:0.85rem;color:#6b7280;line-height:1.6;">${excerpt(p.body || p.excerpt || '', 120)}</p>
                ${p.location ? `<div style="margin-top:10px;font-size:0.8rem;color:#1e56b0;font-weight:600;display:flex;align-items:center;gap:5px;">${ICONS.location} ${p.location}</div>` : ''}
              </div>
            </a>`).join('')}
        </div>`;

    const html = `
      <div class="archive-header">
        <div class="container">
          <h1 class="archive-title">📅 Kegiatan Terdekat</h1>
          <p class="archive-count">Agenda kegiatan dan acara LPEK Muhammadiyah</p>
        </div>
      </div>
      <div class="archive-body">
        <div class="container">
          <div style="max-width:800px;margin:0 auto;">
            ${cardHtml}
            ${renderPagination(pagination, '/kegiatan')}
          </div>
        </div>
      </div>`;

    return this._layout(html, 'Kegiatan Terdekat', ctx);
  },

  // ===================================================================
  // RENDER KONTAK
  // ===================================================================
  renderKontak(ctx: ThemeContext): string {
    const site = ctx.site || {};
    const siteTitle   = site.site_title   || 'LPEK';
    const siteEmail   = site.site_email   || 'info@lpek.id';
    const sitePhone   = site.site_phone   || '-';
    const siteAddress = site.site_address || 'Jakarta, Indonesia';
    const siteWa      = site.social_wa    || '';

    const html = `
      <div class="page-header">
        <div class="container">
          <h1 class="page-header-title">📬 Kontak Kami</h1>
          <p class="page-header-desc">Hubungi tim LPEK untuk informasi program, kolaborasi, dan kemitraan</p>
        </div>
      </div>
      <div class="page-body">
        <div class="container">
          <div class="contact-grid">
            <!-- Info -->
            <div>
              <div class="contact-info-card" style="margin-bottom:20px;">
                <div class="contact-info-title">📍 Informasi Kontak</div>
                <div class="contact-info-item">
                  <div class="contact-info-icon">${ICONS.location}</div>
                  <div>
                    <div class="contact-info-label">Alamat</div>
                    <div class="contact-info-value">${siteAddress}</div>
                  </div>
                </div>
                <div class="contact-info-item">
                  <div class="contact-info-icon">${ICONS.email}</div>
                  <div>
                    <div class="contact-info-label">Email</div>
                    <div class="contact-info-value"><a href="mailto:${siteEmail}" style="color:#1e56b0;">${siteEmail}</a></div>
                  </div>
                </div>
                <div class="contact-info-item">
                  <div class="contact-info-icon">${ICONS.phone}</div>
                  <div>
                    <div class="contact-info-label">Telepon</div>
                    <div class="contact-info-value">${sitePhone}</div>
                  </div>
                </div>
              </div>
              ${siteWa ? `
              <a href="https://wa.me/${siteWa.replace(/\D/g,'')}" target="_blank" rel="noopener"
                style="display:flex;align-items:center;gap:14px;padding:20px;background:#25D366;border-radius:14px;text-decoration:none;color:white;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                <span style="font-size:1.8rem;">${ICONS.wa}</span>
                <div>
                  <div style="font-weight:800;font-size:1rem;">Chat via WhatsApp</div>
                  <div style="font-size:0.82rem;opacity:0.85;">Respon cepat pada jam kerja</div>
                </div>
              </a>` : ''}
            </div>

            <!-- Form -->
            <div class="contact-form-card">
              <div class="form-title">✉️ Kirim Pesan</div>
              <form method="POST" action="/api/contact" onsubmit="handleContactForm(event)">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                  <div class="form-group">
                    <label class="form-label" for="contact-name">Nama Lengkap *</label>
                    <input id="contact-name" name="name" type="text" class="form-input" placeholder="Nama Anda" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="contact-email">Email *</label>
                    <input id="contact-email" name="email" type="email" class="form-input" placeholder="email@contoh.com" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label" for="contact-subject">Subjek</label>
                  <input id="contact-subject" name="subject" type="text" class="form-input" placeholder="Perihal pesan">
                </div>
                <div class="form-group">
                  <label class="form-label" for="contact-msg">Pesan *</label>
                  <textarea id="contact-msg" name="message" class="form-textarea" placeholder="Tuliskan pesan Anda..." required></textarea>
                </div>
                <button type="submit" id="contact-submit" class="btn btn-blue" style="width:100%;justify-content:center;">
                  Kirim Pesan ${ICONS.arrow}
                </button>
                <div id="contact-feedback" style="margin-top:14px;font-size:0.88rem;text-align:center;display:none;"></div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <script>
      function handleContactForm(e) {
        e.preventDefault();
        var btn = document.getElementById('contact-submit');
        var fb  = document.getElementById('contact-feedback');
        btn.textContent = 'Mengirim...'; btn.disabled = true;
        setTimeout(function() {
          btn.textContent = '✓ Pesan Terkirim!';
          fb.style.display = 'block';
          fb.style.color = '#10b981';
          fb.textContent = 'Terima kasih! Kami akan menghubungi Anda segera.';
          e.target.reset();
          setTimeout(function(){ btn.textContent = 'Kirim Pesan'; btn.disabled = false; }, 4000);
        }, 1200);
      }
      </script>`;

    return this._layout(html, 'Kontak', ctx);
  },

  // ===================================================================
  // RENDER KOLABORASI
  // ===================================================================
  renderKolaborasi(ctx: ThemeContext): string {
    const page = ctx.data;
    const html = `
      <div class="page-header">
        <div class="container">
          <h1 class="page-header-title">🤝 Kolaborasi</h1>
          <p class="page-header-desc">LPEK terbuka untuk berkolaborasi dengan berbagai pihak dalam memajukan pariwisata dan ekonomi kreatif</p>
        </div>
      </div>
      <div class="page-body">
        <div class="container">
          ${page?.body ? `<div class="container-sm"><div class="entry-content">${page.body}</div></div>` : `
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;margin-bottom:48px;">
            ${[
              { icon:'🏛️', title:'Pemerintah &amp; Daerah', desc:'Sinergi program pengembangan wisata dan kebijakan ekonomi kreatif bersama instansi pemerintah pusat dan daerah.', color:'#1e56b0' },
              { icon:'🏢', title:'Dunia Usaha', desc:'Kemitraan bisnis dalam pengelolaan destinasi wisata, produk kreatif, dan pemberdayaan UMKM.', color:'#10b981' },
              { icon:'🎓', title:'Perguruan Tinggi', desc:'Riset bersama, pengembangan kurikulum pariwisata halal, dan program pendidikan vokasi.', color:'#7c3aed' },
              { icon:'🌍', title:'Lembaga Internasional', desc:'Jaringan global untuk mempromosikan wisata halal Indonesia di pasar dunia.', color:'#f59e0b' },
              { icon:'🕌', title:'Amal Usaha Muhammadiyah', desc:'Sinergi dengan rumah sakit, sekolah, dan kampus Muhammadiyah dalam program wisata edukatif.', color:'#ef4444' },
              { icon:'📺', title:'Media &amp; Komunitas', desc:'Kerjasama publikasi, promosi, dan komunitas untuk memperluas jangkauan program LPEK.', color:'#0891b2' },
            ].map(k => `
              <div style="background:white;border:1px solid #e5e7eb;border-radius:16px;padding:28px;transition:all 0.2s;" onmouseover="this.style.borderColor='${k.color}';this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 28px rgba(0,0,0,0.08)';" onmouseout="this.style.borderColor='#e5e7eb';this.style.transform='';this.style.boxShadow='';">
                <div style="font-size:2.5rem;margin-bottom:16px;">${k.icon}</div>
                <h4 style="font-size:1.05rem;font-weight:800;color:#0f2d5c;margin-bottom:10px;font-family:'Plus Jakarta Sans',sans-serif;">${k.title}</h4>
                <p style="font-size:0.875rem;color:#6b7280;line-height:1.7;">${k.desc}</p>
              </div>`).join('')}
          </div>
          <div style="background:linear-gradient(135deg,#0f2d5c,#1e56b0);border-radius:20px;padding:48px;color:white;text-align:center;">
            <h3 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:1.8rem;font-weight:900;margin-bottom:12px;">Siap Berkolaborasi?</h3>
            <p style="opacity:0.8;margin-bottom:28px;max-width:480px;margin-left:auto;margin-right:auto;line-height:1.7;">Hubungi kami untuk mendiskusikan peluang kolaborasi yang saling menguntungkan dalam memajukan pariwisata dan ekonomi kreatif Indonesia.</p>
            <a href="/kontak" class="btn btn-primary">Hubungi Tim LPEK ${ICONS.arrow}</a>
          </div>`}
        </div>
      </div>`;

    return this._layout(html, 'Kolaborasi', ctx);
  },

  // ===================================================================
  // RENDER SEARCH
  // ===================================================================
  renderSearch(ctx: ThemeContext): string {
    const posts  = Array.isArray(ctx.data) ? ctx.data : [];
    const query  = (ctx as any).query || '';
    const pagination = (ctx as any).pagination;

    const resultsHtml = posts.length === 0
      ? `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>Tidak Ada Hasil untuk "${query}"</h3><p>Coba kata kunci lain atau telusuri program kami.</p><a href="/berita" class="btn btn-blue btn-sm" style="margin-top:16px;">Lihat Semua Berita</a></div>`
      : `<div class="news-grid">
          ${posts.map((p: any) => `
            <article class="news-card">
              <div class="news-card-img-wrap">
                ${p.featured_image ? `<img src="${p.featured_image}" alt="${p.title}" class="news-card-img" loading="lazy">` : `<div class="news-card-placeholder">🔍</div>`}
              </div>
              <div class="news-card-body">
                ${p.category ? `<span class="news-card-cat">${p.category}</span>` : ''}
                <h3 class="news-card-title"><a href="/${p.slug}">${p.title}</a></h3>
                <p class="news-card-excerpt">${excerpt(p.body || p.excerpt || '')}</p>
                <div class="news-card-footer">
                  <span class="news-card-date">${ICONS.calendar} ${formatDate(p.created_at)}</span>
                  <a href="/${p.slug}" class="news-card-read">Baca ${ICONS.arrow}</a>
                </div>
              </div>
            </article>`).join('')}
        </div>`;

    const html = `
      <div class="archive-header">
        <div class="container">
          <h1 class="archive-title">${ICONS.search} Hasil Pencarian</h1>
          <p class="archive-count">${pagination?.totalItems ?? posts.length} hasil untuk "<strong>${query}</strong>"</p>
        </div>
      </div>
      <div class="archive-body">
        <div class="container">
          <div style="background:white;border:1px solid #e5e7eb;border-radius:14px;padding:24px;margin-bottom:32px;">
            <form action="/search" method="get" class="search-form" style="max-width:none;">
              <input type="search" name="q" class="search-input" value="${query}" placeholder="Cari konten LPEK...">
              <button type="submit" class="btn btn-blue">Cari ${ICONS.search}</button>
            </form>
          </div>
          ${resultsHtml}
          ${renderPagination(pagination, `/search?q=${encodeURIComponent(query)}&`)}
        </div>
      </div>`;

    return this._layout(html, `Pencarian: ${query}`, ctx);
  },

  // ===================================================================
  // RENDER 404
  // ===================================================================
  render404(ctx: ThemeContext): string {
    const html = `
      <div style="padding:80px 0;text-align:center;">
        <div class="container-sm">
          <div class="error-code">404</div>
          <h1 class="error-title">Halaman Tidak Ditemukan</h1>
          <p class="error-desc">Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.<br>Mungkin URL-nya salah ketik?</p>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
            <a href="/" class="btn btn-blue">← Kembali ke Beranda</a>
            <a href="/berita" class="btn btn-ghost">Lihat Berita</a>
            <a href="/program" class="btn btn-ghost">Lihat Program</a>
          </div>
        </div>
      </div>`;

    return this._layout(html, '404 — Tidak Ditemukan', ctx);
  },
};

export default LpekTheme;
