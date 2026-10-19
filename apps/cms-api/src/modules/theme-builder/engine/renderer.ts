/**
 * ⚡ cmsMu Canvas Pure HTML Block Renderer
 * Merender array blok JSON menjadi HTML statis murni secara ultra-cepat tanpa React DOM Server.
 * Dilengkapi hybrid inline-styles + semantic classes agar 100% tahan banting terhadap Tailwind JIT Purge.
 * 100% Zero External NPM Dependency.
 */

import { escapeHtml } from "../render";

function isDarkColor(colorStr: string): boolean {
  if (!colorStr) return false;
  let c = colorStr.trim();
  if (c.startsWith("#")) {
    c = c.substring(1);
    if (c.length === 3) c = c.split("").map(x => x + x).join("");
    if (c.length === 6) {
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      return (r * 299 + g * 587 + b * 114) / 1000 < 140;
    }
  }
  return false;
}

export function renderBlockToHtml(
  block: { type: string; props: Record<string, any> },
  context?: { latestPosts?: any[]; site?: any }
): string {
  if (!block || !block.type) return "";
  const { type, props } = block;
  const p = props || {};

  switch (type) {
    case "SiteHeader": {
      const positionClass = p.headerPosition === "sticky" ? "sticky top-0 z-40" : p.headerPosition === "fixed" ? "fixed top-0 left-0 right-0 z-50" : "relative";
      const bgColor = p.headerBgColor || "#ffffff";
      const isBgDark = isDarkColor(bgColor);
      const defaultTextColor = isBgDark ? "#ffffff" : "#334155";
      const textColor = p.headerTextColor || defaultTextColor;
      const titleColor = p.headerTextColor ? p.headerTextColor : (isBgDark ? "#ffffff" : "#0f172a");
      const iconBg = isBgDark ? "rgba(255,255,255,0.18)" : "#f8fafc";
      const iconBorder = isBgDark ? "rgba(255,255,255,0.28)" : "#cbd5e1";
      const iconColor = isBgDark ? "#ffffff" : "#1e293b";
      const borderColor = p.headerBorderColor || (isBgDark ? "rgba(255,255,255,0.2)" : "#e2e8f0");
      const borderWidth = p.headerBorderWidth || "1px";
      const isContained = p.headerWidth === "contained";
      const fontFamily = p.headerFontFamily && p.headerFontFamily !== "sans-serif" ? `'${escapeHtml(p.headerFontFamily)}', sans-serif` : "inherit";

      // Radius mapping
      let radiusValue = "0px";
      let containerShadow = "none";
      if (p.headerRadius === "sm") radiusValue = "8px";
      else if (p.headerRadius === "md") radiusValue = "16px";
      else if (p.headerRadius === "lg") radiusValue = "24px";
      else if (p.headerRadius === "full") {
        radiusValue = "9999px";
        containerShadow = "0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04)";
      }

      // Height mapping
      let heightPx = "72px";
      if (p.headerSize === "compact") heightPx = "56px";
      else if (p.headerSize === "large") heightPx = "88px";

      const menuHtml = Array.isArray(p.menuItems)
        ? p.menuItems
            .map(
              (m: any) => `
          <a href="${escapeHtml(m.url || "/")}" style="font-size: 0.875rem; font-weight: 600; color: ${textColor}; text-decoration: none; padding: 0.25rem 0.5rem;" class="hover:opacity-80 transition-opacity">
            ${escapeHtml(m.label || "")}
          </a>
        `
            )
            .join("")
        : "";

      const rawCtaHtml =
        p.showCta !== "no" && p.ctaText
          ? `
        <a href="${escapeHtml(p.ctaUrl || "/admin")}" class="cmsmu-guest-cta-btn hover:bg-emerald-700 shadow-sm" style="display: inline-flex; align-items: center; justify-content: center; padding: 0.5rem 1rem; font-size: 0.75rem; font-weight: 700; color: #ffffff; background-color: #059669; border-radius: 0.5rem; text-decoration: none; transition: background 0.2s;">
          ${escapeHtml(p.ctaText)}
        </a>
      `
          : "";

      const showThemeToggle = p.showThemeToggle !== "no";
      const themeToggleHtml = showThemeToggle
        ? `
        <button type="button" class="cmsmu-theme-toggle-btn hover:opacity-85 shadow-sm" onclick="var d=document.documentElement; var next=d.getAttribute('data-theme')==='dark'?'light':'dark'; d.setAttribute('data-theme',next); localStorage.setItem('cmsmu_theme',next); var is=document.querySelectorAll('.cmsmu-theme-icon'); for(var i=0;i<is.length;i++) is[i].className=next==='dark'?'fas fa-sun cmsmu-theme-icon':'fas fa-moon cmsmu-theme-icon';" style="width: 36px; height: 36px; border-radius: 50%; background: ${iconBg}; border: 1px solid ${iconBorder}; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: ${iconColor}; transition: all 0.2s;" title="Ganti Mode Malam/Siang" aria-label="Ganti Mode Malam/Siang">
          <i class="fas fa-moon cmsmu-theme-icon" style="font-size: 14px;"></i>
        </button>
      `
        : "";

      const mobileMenuBtnHtml = `
        <button type="button" class="md:hidden hover:opacity-85 shadow-sm" onclick="var d=document.getElementById('mobileDrawer'); if(d) d.classList.toggle('open');" style="width: 36px; height: 36px; border-radius: 0.5rem; background: ${iconBg}; border: 1px solid ${iconBorder}; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: ${iconColor};" title="Buka Menu" aria-label="Buka Menu Navigasi">
          <i class="fas fa-bars" style="font-size: 14px;"></i>
        </button>
      `;

      const userDropdownHtml = p.enableUserDropdown !== "no" ? `
        <div class="cmsmu-user-nav-dropdown" style="display: none; position: relative;">
          <button type="button" class="cmsmu-user-toggle-btn" onclick="var m=this.nextElementSibling; m.style.display=(m.style.display==='flex'?'none':'flex'); event.stopPropagation();" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.75rem; background: ${iconBg}; border: 1px solid ${iconBorder}; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; color: ${iconColor}; cursor: pointer; transition: all 0.2s;">
            <div style="width: 22px; height: 22px; border-radius: 50%; background: #059669; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 10px;">
              <i class="fas fa-user"></i>
            </div>
            <span class="cmsmu-user-label" style="max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: ${iconColor};">Akun Saya</span>
            <i class="fas fa-chevron-down" style="font-size: 8px; color: ${iconColor}; opacity: 0.8;"></i>
          </button>
          <div class="cmsmu-user-menu" style="display: none; position: absolute; right: 0; top: calc(100% + 8px); width: 190px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); padding: 0.35rem; z-index: 9999; flex-direction: column; gap: 0.15rem; box-sizing: border-box;">
            <a href="/admin#profile" style="display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 600; color: #1e293b; text-decoration: none;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
              <i class="fas fa-user-circle" style="color: #3b82f6; width: 14px;"></i>
              <span>Profil Pengguna</span>
            </a>
            <a href="/admin" style="display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 600; color: #1e293b; text-decoration: none;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
              <i class="fas fa-th-large" style="color: #059669; width: 14px;"></i>
              <span>Dasbor Admin</span>
            </a>
            <a href="/theme-editor?slug=home" style="display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 600; color: #1e293b; text-decoration: none;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
              <i class="fas fa-paint-brush" style="color: #f59e0b; width: 14px;"></i>
              <span>Theme Editor</span>
            </a>
            <div style="height: 1px; background: #f1f5f9; margin: 0.2rem 0;"></div>
            <a href="/login" onclick="event.preventDefault(); document.cookie='labmu_token=; path=/; max-age=0;'; try{localStorage.removeItem('labmu_token'); localStorage.removeItem('admin_token');}catch(e){} window.location.href='/login';" style="display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 600; color: #e11d48; text-decoration: none;" onmouseover="this.style.background='#fff1f2'" onmouseout="this.style.background='transparent'">
              <i class="fas fa-sign-out-alt" style="width: 14px;"></i>
              <span>Keluar (Logout)</span>
            </a>
          </div>
        </div>
      ` : "";

      const headerContainerStyle = isContained
        ? `max-width: 1280px; margin: 0.75rem auto; padding: 0 1rem; box-sizing: border-box;`
        : `width: 100%; box-sizing: border-box;`;

      const isCard = isContained || (p.headerRadius && p.headerRadius !== "none");
      const borderRule = isCard
        ? `border: ${borderWidth} solid ${borderColor};`
        : `border-bottom: ${borderWidth} solid ${borderColor};`;

      const headerBoxStyle = `
        position: relative;
        width: 100%;
        background-color: ${bgColor};
        ${borderRule}
        border-radius: ${radiusValue};
        box-shadow: ${containerShadow};
        font-family: ${fontFamily};
        box-sizing: border-box;
      `;

      return `
      <div class="${positionClass} w-full" style="${headerContainerStyle}">
        <header class="w-full" style="${headerBoxStyle}">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4" style="max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; height: ${heightPx}; display: flex; align-items: center; justify-content: space-between; gap: 1rem; box-sizing: border-box;">
            <div class="flex items-center gap-3" style="display: flex; align-items: center; gap: 0.75rem;">
              ${
                p.logoImage
                  ? `<img src="${escapeHtml(p.logoImage)}" alt="${escapeHtml(p.siteTitle || "Logo")}" class="h-10 w-auto object-contain" style="max-height: 44px; height: 44px; width: auto; object-fit: contain; display: block;">`
                  : `<div class="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-lg" style="width: 40px; height: 40px; border-radius: 12px; background-color: #059669; color: #ffffff; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 1.125rem;">${escapeHtml((p.siteTitle || "C").charAt(0))}</div>`
              }
              <span class="text-xl font-black tracking-tight" style="font-size: 1.25rem; font-weight: 900; color: ${textColor === '#334155' ? '#0f172a' : textColor}; letter-spacing: -0.025em;">
                ${escapeHtml(p.siteTitle || "cmsMu")}${p.siteTitleHighlight ? `<span style="color: #059669; margin-left: 0.25rem;">${escapeHtml(p.siteTitleHighlight)}</span>` : ""}
              </span>
            </div>
            <nav class="hidden md:flex items-center gap-6" style="display: flex; align-items: center; gap: 1.5rem;">
              ${menuHtml || `<span class="text-xs italic" style="font-size: 0.75rem; color: ${textColor}; opacity: 0.6; font-style: italic;">Menu Navigasi</span>`}
            </nav>
            <div class="flex items-center gap-2 sm:gap-3" style="display: flex; align-items: center; gap: 0.75rem;">
              ${themeToggleHtml}
              ${rawCtaHtml}
              ${userDropdownHtml}
              ${mobileMenuBtnHtml}
            </div>
          </div>
        </header>
        <script>
          (function(){
            try {
              // 1. Sinkronisasi Ikon Mode Malam/Siang
              var curTheme = localStorage.getItem('cmsmu_theme') || document.documentElement.getAttribute('data-theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              document.documentElement.setAttribute('data-theme', curTheme);
              var icons = document.querySelectorAll('.cmsmu-theme-icon');
              for (var k = 0; k < icons.length; k++) {
                icons[k].className = curTheme === 'dark' ? 'fas fa-sun cmsmu-theme-icon' : 'fas fa-moon cmsmu-theme-icon';
              }

              // 2. Deteksi Sesi Login Pengguna
              var hasToken = false;
              if (document.cookie.indexOf('labmu_token=') !== -1) hasToken = true;
              else if (typeof localStorage !== 'undefined' && (localStorage.getItem('labmu_token') || localStorage.getItem('admin_token'))) hasToken = true;
              if (hasToken) {
                var ctas = document.querySelectorAll('.cmsmu-guest-cta-btn');
                for (var i = 0; i < ctas.length; i++) ctas[i].style.display = 'none';
                var dds = document.querySelectorAll('.cmsmu-user-nav-dropdown');
                for (var j = 0; j < dds.length; j++) dds[j].style.display = 'inline-block';
              }
              document.addEventListener('click', function(){
                var menus = document.querySelectorAll('.cmsmu-user-menu');
                for (var m = 0; m < menus.length; m++) menus[m].style.display = 'none';
              });
            } catch(e){}
          })();
        </script>
      </div>
      `;
    }

    case "Hero": {
      const bgStyle = p.backgroundImage
        ? `background-image: url('${escapeHtml(p.backgroundImage)}'); background-size: cover; background-position: center;`
        : `background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 20px 20px;`;

      return `
      <section class="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24 bg-slate-50 border-b border-slate-200" style="${bgStyle}; padding: 4.5rem 1.5rem; position: relative; border-bottom: 1px solid #e2e8f0; text-align: center; box-sizing: border-box; background-color: #f8fafc;">
        ${p.backgroundImage ? `<div class="absolute inset-0 z-0 bg-white/80 backdrop-blur-sm" style="position: absolute; inset: 0; background-color: rgba(255,255,255,0.8); backdrop-filter: blur(4px);"></div>` : ""}
        <div class="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8" style="position: relative; z-index: 10; max-width: 1280px; margin: 0 auto; box-sizing: border-box;">
          ${
            p.badgeText
              ? `<div class="mb-4 inline-block rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-700" style="display: inline-block; margin-bottom: 1.25rem; padding: 0.375rem 1rem; border-radius: 9999px; border: 1px solid #a7f3d0; background-color: #d1fae5; font-size: 0.8125rem; font-weight: 600; color: #047857;">${escapeHtml(p.badgeText)}</div>`
              : ""
          }
          <h1 class="mb-6 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight" style="margin-bottom: 1.25rem; font-size: 2.25rem; font-weight: 800; color: #0f172a; line-height: 1.25; letter-spacing: -0.025em;">
            ${escapeHtml(p.title || "Satu Fondasi CMS Terpadu")}
          </h1>
          <p class="mx-auto mt-4 mb-10 max-w-3xl text-base sm:text-xl text-slate-600 leading-relaxed" style="max-width: 48rem; margin: 1rem auto 2.5rem; font-size: 1.125rem; color: #475569; line-height: 1.625;">
            ${escapeHtml(p.description || "Platform Content Management System modern, tangguh, dan fleksibel.")}
          </p>
          <div class="flex flex-col justify-center gap-4 sm:flex-row" style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 1rem;">
            ${
              p.primaryButtonText
                ? `<a href="${escapeHtml(p.primaryButtonLink || "#")}" class="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-lg shadow-emerald-600/30 transition-all" style="display: inline-flex; align-items: center; justify-content: center; padding: 0.875rem 2rem; font-size: 1rem; font-weight: 700; color: #ffffff; background-color: #059669; border-radius: 9999px; text-decoration: none; box-shadow: 0 10px 15px -3px rgba(5,150,105,0.3);">${escapeHtml(p.primaryButtonText)}</a>`
                : ""
            }
            ${
              p.secondaryButtonText
                ? `<a href="${escapeHtml(p.secondaryButtonLink || "#")}" class="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-full transition-all" style="display: inline-flex; align-items: center; justify-content: center; padding: 0.875rem 2rem; font-size: 1rem; font-weight: 700; color: #334155; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 9999px; text-decoration: none;">${escapeHtml(p.secondaryButtonText)}</a>`
                : ""
            }
          </div>
        </div>
      </section>
      `;
    }

    case "Partners": {
      const partnersList = Array.isArray(p.partners) && p.partners.length > 0 ? p.partners : [
        { name: "cmsMu Core", logoUrl: "", url: "" },
        { name: "Cloudflare Edge", logoUrl: "", url: "" },
        { name: "Drizzle ORM", logoUrl: "", url: "" },
        { name: "Astro SSR", logoUrl: "", url: "" }
      ];

      return `
      <section class="bg-white py-12 border-b border-slate-200" style="background-color: #ffffff; padding: 3rem 1.5rem; border-bottom: 1px solid #e2e8f0; text-align: center; box-sizing: border-box;">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style="max-width: 1280px; margin: 0 auto;">
          <p class="text-xs text-slate-400 font-bold mb-8 uppercase tracking-wider" style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; margin-bottom: 2rem; text-transform: uppercase; letter-spacing: 0.05em;">${escapeHtml(p.title || "Dipercaya & Berkolaborasi Dengan")}</p>
          <div class="flex justify-center items-center flex-wrap gap-8 md:gap-16 opacity-60" style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 2rem; opacity: 0.75;">
            ${partnersList.map((pt: any) => {
              const innerHtml = pt.logoUrl ? `
                <img src="${escapeHtml(pt.logoUrl)}" alt="${escapeHtml(pt.name)}" class="h-8 object-contain" style="max-height: 32px; height: 32px; width: auto; object-fit: contain;" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='inline-block';">
                <span class="text-sm font-bold text-slate-700 tracking-tight" style="display: none; padding: 0.25rem 0.75rem; border-radius: 0.375rem; background-color: #f1f5f9; border: 1px solid #e2e8f0;">${escapeHtml(pt.name)}</span>
              ` : `<span class="text-lg font-extrabold text-slate-700 tracking-tight" style="font-size: 1.125rem; font-weight: 800; color: #334155; letter-spacing: -0.02em;">${escapeHtml(pt.name)}</span>`;

              return pt.url ? `
                <a href="${escapeHtml(pt.url)}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center hover:opacity-100 transition-opacity" style="display: flex; align-items: center; justify-content: center; text-decoration: none;" title="Kunjungi ${escapeHtml(pt.name)}">
                  ${innerHtml}
                </a>
              ` : `
                <div class="flex items-center justify-center" style="display: flex; align-items: center; justify-content: center;">
                  ${innerHtml}
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </section>
      `;
    }

    case "FeatureGrid": {
      const features = Array.isArray(p.features) && p.features.length > 0 ? p.features : [
        { title: "Cepat & Serverless", description: "Performa tinggi di edge computing Cloudflare.", svgIcon: "bolt" },
        { title: "Keamanan Tingkat Tinggi", description: "Otorisasi role berbasis token terenkripsi.", svgIcon: "shield-alt" },
        { title: "Desain Responsif", description: "Tampilan optimal di perangkat ponsel, tablet, dan desktop.", svgIcon: "mobile-alt" }
      ];

      const featureItems = features
        .map(
          (f: any) => {
            const iconName = String(f.svgIcon || "star").replace(/^fa-/, "");
            return `
        <div class="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all hover:shadow-xs" style="padding: 2rem; border-radius: 1rem; background-color: #f8fafc; border: 1px solid #e2e8f0; box-sizing: border-box;">
          <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mb-6" style="width: 48px; height: 48px; border-radius: 12px; background-color: #d1fae5; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; margin-bottom: 1.5rem;">
            <i class="fas fa-${escapeHtml(iconName)}"></i>
          </div>
          <h3 class="text-xl font-bold text-slate-900 mb-3" style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 0.75rem;">${escapeHtml(f.title || "")}</h3>
          <p class="text-sm text-slate-600 leading-relaxed" style="font-size: 0.875rem; color: #475569; line-height: 1.625; margin: 0;">${escapeHtml(f.description || "")}</p>
        </div>
      `;
          }
        )
        .join("");

      return `
      <section id="fitur" class="bg-white py-20 border-b border-slate-100" style="background-color: #ffffff; padding: 4.5rem 1.5rem; border-bottom: 1px solid #f1f5f9; box-sizing: border-box;">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style="max-width: 1280px; margin: 0 auto;">
          <div class="text-center max-w-3xl mx-auto mb-16" style="text-align: center; max-width: 48rem; margin: 0 auto 3.5rem;">
            <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style="font-size: 2rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">${escapeHtml(p.title || "Fitur Unggulan")}</h2>
            <p class="text-lg text-slate-600" style="font-size: 1.125rem; color: #475569; margin: 0;">${escapeHtml(p.description || "Solusi lengkap dan terintegrasi untuk publikasi modern.")}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
            ${featureItems}
          </div>
        </div>
      </section>
      `;
    }

    case "Testimonial": {
      const testimonials = Array.isArray(p.testimonials) && p.testimonials.length > 0 ? p.testimonials : [
        {
          quote: "Pengelolaan artikel dan halaman portal kami jadi sangat mudah dan terstruktur.",
          author: "H. Ahmad Fauzi",
          role: "Admin Redaksi",
          initials: "AF",
          bgColor: "#059669"
        },
        {
          quote: "Visual builder mandiri sangat cepat dan tidak membebani browser.",
          author: "Siti Rahmawati",
          role: "Humas & Publikasi",
          initials: "SR",
          bgColor: "#10b981"
        }
      ];

      const cards = testimonials.map((t: any) => {
        const bgHex = t.bgColor && String(t.bgColor).startsWith("#") ? t.bgColor : "#059669";
        return `
        <div class="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between" style="padding: 2rem; border-radius: 1rem; background-color: #ffffff; border: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
          <p class="text-sm text-slate-600 italic mb-6 leading-relaxed" style="font-size: 0.875rem; color: #475569; font-style: italic; margin-bottom: 1.5rem; line-height: 1.625;">"${escapeHtml(t.quote || "")}"</p>
          <div class="flex items-center gap-3" style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center text-sm" style="width: 40px; height: 40px; border-radius: 9999px; background-color: ${escapeHtml(bgHex)}; color: #ffffff; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 0.875rem;">
              ${escapeHtml(t.initials || "U")}
            </div>
            <div>
              <h4 class="text-sm font-bold text-slate-900" style="font-size: 0.875rem; font-weight: 700; color: #0f172a; margin: 0;">${escapeHtml(t.author || "Pengguna")}</h4>
              <p class="text-xs text-slate-500" style="font-size: 0.75rem; color: #64748b; margin: 0;">${escapeHtml(t.role || "Anggota")}</p>
            </div>
          </div>
        </div>
      `;
      }).join("");

      return `
      <section class="bg-slate-50 py-20 border-b border-slate-200" style="background-color: #f8fafc; padding: 4.5rem 1.5rem; border-bottom: 1px solid #e2e8f0; box-sizing: border-box;">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style="max-width: 1280px; margin: 0 auto;">
          <div class="text-center max-w-2xl mx-auto mb-16" style="text-align: center; max-width: 42rem; margin: 0 auto 3.5rem;">
            <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style="font-size: 2rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">${escapeHtml(p.title || "Dipercaya Pengelola Website")}</h2>
            <p class="text-base text-slate-600" style="font-size: 1rem; color: #475569; margin: 0;">${escapeHtml(p.subtitle || "Ulasan dan pengalaman para redaktur.")}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
            ${cards}
          </div>
        </div>
      </section>
      `;
    }

    case "RecentPosts": {
      const postsList = Array.isArray(p.posts) && p.posts.length > 0
        ? p.posts
        : (Array.isArray(context?.latestPosts) && context!.latestPosts.length > 0 ? context!.latestPosts : null);

      const postsLimit = parseInt(p.postsCount, 10) || 3;
      const sampleCards = `
        <article class="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-md" style="border: 1px solid #e2e8f0; border-radius: 1rem; overflow: hidden; background-color: #ffffff; display: flex; flex-direction: column; box-sizing: border-box;">
          <div class="relative aspect-video w-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400" style="position: relative; width: 100%; aspect-ratio: 16/9; background-color: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8;">
            <i class="fas fa-newspaper text-3xl opacity-40" style="font-size: 1.875rem; opacity: 0.4;"></i>
            <span class="absolute top-3 left-3 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800" style="position: absolute; top: 0.75rem; left: 0.75rem; border-radius: 9999px; background-color: #d1fae5; padding: 0.25rem 0.625rem; font-size: 0.75rem; font-weight: 600; color: #065f46;">Panduan</span>
          </div>
          <div class="flex flex-1 flex-col justify-between p-6" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; flex: 1;">
            <div>
              <div class="mb-2 text-xs font-medium text-slate-400" style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.5rem;">19 Okt 2026</div>
              <h3 class="mb-3 text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors" style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin-bottom: 0.75rem; line-height: 1.4;">
                Panduan Standarisasi Pembuatan Theme & Struktur Konten cmsMu
              </h3>
              <p class="mb-4 text-sm text-slate-600 leading-relaxed" style="font-size: 0.875rem; color: #475569; line-height: 1.5; margin-bottom: 1rem;">Arsitektur tema modular, isolasi core engine, dan struktur permalink bersih.</p>
            </div>
            <div class="pt-2" style="padding-top: 0.5rem;">
              <span class="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600" style="font-size: 0.875rem; font-weight: 600; color: #059669;">Baca Selengkapnya &rarr;</span>
            </div>
          </div>
        </article>
      `;

      const cardsHtml = postsList
        ? postsList.slice(0, postsLimit).map((item: any) => {
            const postTitle = escapeHtml(item.title || "Tanpa Judul");
            const postSlug = escapeHtml(item.slug || "#");
            const postExcerpt = escapeHtml(item.excerpt || item.meta_description || "Klik tautan untuk membaca selengkapnya.");
            const postCategory = escapeHtml(item.category || "Berita");
            const postDate = item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Terbaru";
            const postImg = item.featured_image || item.featuredImage || "";
            const postUrl = item.url || `/${postSlug}`;

            return `
              <article class="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-md" style="border: 1px solid #e2e8f0; border-radius: 1rem; overflow: hidden; background-color: #ffffff; display: flex; flex-direction: column; box-sizing: border-box;">
                <div class="relative aspect-video w-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400" style="position: relative; width: 100%; aspect-ratio: 16/9; background-color: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8;">
                  ${postImg ? `<img src="${escapeHtml(postImg)}" alt="${postTitle}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" style="width: 100%; height: 100%; object-fit: cover;">` : `<i class="fas fa-newspaper text-3xl opacity-40" style="font-size: 1.875rem; opacity: 0.4;"></i>`}
                  <span class="absolute top-3 left-3 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800" style="position: absolute; top: 0.75rem; left: 0.75rem; border-radius: 9999px; background-color: #d1fae5; padding: 0.25rem 0.625rem; font-size: 0.75rem; font-weight: 600; color: #065f46;">${postCategory}</span>
                </div>
                <div class="flex flex-1 flex-col justify-between p-6" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; flex: 1;">
                  <div>
                    <div class="mb-2 text-xs font-medium text-slate-400" style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.5rem;">${postDate}</div>
                    <h3 class="mb-3 text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors" style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin-bottom: 0.75rem; line-height: 1.4;">
                      <a href="${postUrl}" style="color: inherit; text-decoration: none;">${postTitle}</a>
                    </h3>
                    <p class="mb-4 text-sm text-slate-600 leading-relaxed line-clamp-2" style="font-size: 0.875rem; color: #475569; line-height: 1.5; margin-bottom: 1rem;">${postExcerpt}</p>
                  </div>
                  <div class="pt-2" style="padding-top: 0.5rem;">
                    <a href="${postUrl}" class="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700" style="font-size: 0.875rem; font-weight: 600; color: #059669; text-decoration: none;">Baca Selengkapnya &rarr;</a>
                  </div>
                </div>
              </article>
            `;
          }).join("")
        : sampleCards;

      return `
      <section id="berita" class="bg-white py-20 border-b border-slate-200" style="background-color: #ffffff; padding: 4.5rem 1.5rem; border-bottom: 1px solid #e2e8f0; box-sizing: border-box;">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style="max-width: 1280px; margin: 0 auto;">
          <div class="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; gap: 1.5rem;">
            <div class="max-w-2xl" style="max-width: 42rem;">
              <h2 class="mb-4 text-3xl md:text-4xl font-bold text-slate-900" style="font-size: 2rem; font-weight: 800; color: #0f172a; margin-bottom: 0.75rem;">${escapeHtml(p.title || "Kabar & Wawasan Terbaru")}</h2>
              <p class="text-lg text-slate-600" style="font-size: 1.125rem; color: #475569; margin: 0;">${escapeHtml(p.description || "Ikuti perkembangan terbaru dan artikel pilihan.")}</p>
            </div>
            <div>
              <a href="${escapeHtml(p.viewAllLink || "/berita")}" class="inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700" style="display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 600; color: #059669; text-decoration: none;">
                ${escapeHtml(p.viewAllText || "Lihat Semua Artikel")} &rarr;
              </a>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
            ${cardsHtml}
          </div>
        </div>
      </section>
      `;
    }

    case "MagazineBigGrid": {
      const postsList = Array.isArray(p.posts) && p.posts.length > 0
        ? p.posts
        : (Array.isArray(context?.latestPosts) && context!.latestPosts.length > 0 ? context!.latestPosts : null);

      const heroPost = postsList && postsList[0] ? postsList[0] : null;
      const sidePosts = postsList && postsList.length > 1 ? postsList.slice(1, 3) : [];

      return `
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-slate-200" style="max-width: 1280px; margin: 0 auto; padding: 4rem 1.5rem; border-bottom: 1px solid #e2e8f0; box-sizing: border-box;">
        <div class="mb-8 border-b-2 border-slate-900 pb-2" style="border-bottom: 2px solid #0f172a; padding-bottom: 0.5rem; margin-bottom: 2rem;">
          <span class="bg-slate-900 text-white font-extrabold uppercase text-xs tracking-wider px-3 py-1.5 rounded" style="background-color: #0f172a; color: #ffffff; font-weight: 800; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; padding: 0.375rem 0.75rem; border-radius: 0.25rem;">
            ${escapeHtml(p.title || "Top Stories")}
          </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; min-height: 380px;">
          <div class="md:col-span-2 bg-slate-900 rounded-2xl overflow-hidden text-white p-8 flex flex-col justify-end relative shadow-sm" style="background-color: #0f172a; border-radius: 1rem; color: #ffffff; padding: 2rem; display: flex; flex-direction: column; justify-content: flex-end; min-height: 320px; box-sizing: border-box; ${heroPost?.featured_image ? `background-image: linear-gradient(to top, rgba(15,23,42,0.95), rgba(15,23,42,0.4)), url('${escapeHtml(heroPost.featured_image)}'); background-size: cover; background-position: center;` : ""}">
            <span class="px-3 py-1 rounded bg-emerald-600 text-white text-xs font-bold w-fit mb-3" style="background-color: #059669; color: #ffffff; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 0.25rem; width: fit-content; margin-bottom: 0.75rem;">${escapeHtml(heroPost?.category || "Sorotan Utama")}</span>
            <h3 class="text-2xl font-black" style="font-size: 1.5rem; font-weight: 900; margin: 0; line-height: 1.3;">
              <a href="${heroPost ? `/${escapeHtml(heroPost.slug)}` : "#"}" style="color: #ffffff; text-decoration: none;">
                ${escapeHtml(heroPost?.title || "Transformasi Digital & Arsitektur Headless Cloud-Native")}
              </a>
            </h3>
          </div>
          <div class="flex flex-col gap-6 h-full" style="display: flex; flex-direction: column; gap: 1.5rem;">
            ${sidePosts.length > 0 ? sidePosts.map((sp: any) => `
              <div class="flex-1 bg-slate-800 rounded-2xl text-white p-6 flex flex-col justify-end" style="background-color: #1e293b; border-radius: 1rem; color: #ffffff; padding: 1.5rem; display: flex; flex-direction: column; justify-content: flex-end; flex: 1; box-sizing: border-box;">
                <span class="text-xs text-slate-400 mb-1" style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.25rem;">${escapeHtml(sp.category || "Berita")}</span>
                <h4 class="font-bold text-base" style="font-size: 1rem; font-weight: 700; margin: 0;">
                  <a href="/${escapeHtml(sp.slug)}" style="color: #ffffff; text-decoration: none;">
                    ${escapeHtml(sp.title || "Artikel Pendamping")}
                  </a>
                </h4>
              </div>
            `).join("") : `
              <div class="flex-1 bg-slate-800 rounded-2xl text-white p-6 flex flex-col justify-end" style="background-color: #1e293b; border-radius: 1rem; color: #ffffff; padding: 1.5rem; display: flex; flex-direction: column; justify-content: flex-end; flex: 1; box-sizing: border-box;">
                <span class="text-xs text-slate-400 mb-1" style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.25rem;">Berita Pendamping</span>
                <h4 class="font-bold text-base" style="font-size: 1rem; font-weight: 700; margin: 0;">Inovasi Layanan Pendidikan & Kesehatan Berkelanjutan</h4>
              </div>
              <div class="flex-1 bg-slate-800 rounded-2xl text-white p-6 flex flex-col justify-end" style="background-color: #1e293b; border-radius: 1rem; color: #ffffff; padding: 1.5rem; display: flex; flex-direction: column; justify-content: flex-end; flex: 1; box-sizing: border-box;">
                <span class="text-xs text-slate-400 mb-1" style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.25rem;">Wawasan Dakwah</span>
                <h4 class="font-bold text-base" style="font-size: 1rem; font-weight: 700; margin: 0;">Pemberdayaan Ekonomi Umat Berbasis Ekosistem Digital</h4>
              </div>
            `}
          </div>
        </div>
      </section>
      `;
    }

    case "CallToAction": {
      return `
      <section class="py-20 bg-emerald-600 text-white text-center" style="padding: 5rem 1.5rem; background-color: #059669; color: #ffffff; text-align: center; box-sizing: border-box;">
        <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8" style="max-width: 1024px; margin: 0 auto;">
          <h2 class="text-3xl md:text-5xl font-extrabold mb-6 leading-tight" style="font-size: 2.25rem; font-weight: 800; margin-bottom: 1.5rem; line-height: 1.25;">${escapeHtml(p.title || "Siap Membangun Website Anda?")}</h2>
          <p class="text-lg md:text-xl text-emerald-100 mb-10 max-w-2xl mx-auto leading-relaxed" style="font-size: 1.125rem; color: #d1fae5; margin: 0 auto 2.5rem; max-width: 42rem; line-height: 1.625;">${escapeHtml(p.description || "Mulai terbitkan artikel dan kelola konten digital Anda sekarang.")}</p>
          ${
            p.buttonText
              ? `<a href="${escapeHtml(p.buttonLink || "/admin")}" class="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-emerald-900 bg-white hover:bg-emerald-50 rounded-full shadow-xl transition-all" style="display: inline-flex; align-items: center; justify-content: center; padding: 1rem 2.25rem; font-size: 1rem; font-weight: 700; color: #064e3b; background-color: #ffffff; border-radius: 9999px; text-decoration: none; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">${escapeHtml(p.buttonText)}</a>`
              : ""
          }
          ${p.footerText ? `<p class="mt-6 text-xs text-emerald-200" style="margin-top: 1.5rem; font-size: 0.75rem; color: #a7f3d0;">${escapeHtml(p.footerText)}</p>` : ""}
        </div>
      </section>
      `;
    }

    case "SiteFooter": {
      return `
      <footer class="bg-slate-900 text-slate-400 py-12" style="background-color: #0f172a; color: #94a3b8; padding: 3rem 1.5rem; box-sizing: border-box;">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6" style="max-width: 1280px; margin: 0 auto; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.5rem;">
          <div class="flex items-center gap-3" style="display: flex; align-items: center; gap: 0.75rem;">
            ${p.logoImage ? `<img src="${escapeHtml(p.logoImage)}" class="h-8 w-auto object-contain" style="max-height: 32px; height: 32px; width: auto; object-fit: contain; display: block;">` : ""}
            <span class="text-lg font-bold text-white" style="font-size: 1.125rem; font-weight: 700; color: #ffffff;">${escapeHtml(p.siteName || "cmsMu")}</span>
          </div>
          <p class="text-xs text-slate-500 m-0" style="font-size: 0.75rem; color: #64748b; margin: 0;">&copy; ${new Date().getFullYear()} ${escapeHtml(p.siteName || "cmsMu")}. ${escapeHtml(p.copyrightText || "Hak Cipta Dilindungi Undang-Undang.")}</p>
        </div>
      </footer>
      `;
    }

    case "CustomHTML": {
      return p.html || "";
    }

    case "Spacer": {
      const h = parseInt(p.height, 10) || 40;
      return `<div style="height: ${h}px;" aria-hidden="true"></div>`;
    }

    default:
      return `<div class="p-6 bg-slate-100 text-slate-500 text-center text-xs" style="padding: 1.5rem; background-color: #f1f5f9; color: #64748b; text-align: center; font-size: 0.75rem;">Blok: ${escapeHtml(type)}</div>`;
  }
}
