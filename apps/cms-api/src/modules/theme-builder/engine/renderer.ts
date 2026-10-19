/**
 * ⚡ cmsMu Canvas Pure HTML Block Renderer
 * Merender array blok JSON menjadi HTML statis murni secara ultra-cepat tanpa React DOM Server.
 * 100% Zero External NPM Dependency.
 */

import { escapeHtml } from "../render";

export function renderBlockToHtml(block: { type: string; props: Record<string, any> }): string {
  if (!block || !block.type) return "";
  const { type, props } = block;
  const p = props || {};

  switch (type) {
    case "SiteHeader": {
      // Di Canvas editor, selalu gunakan relative / normal flow agar tidak menimpa blok di bawahnya
      const positionClass = "relative";

      const menuHtml = Array.isArray(p.menuItems)
        ? p.menuItems
            .map(
              (m: any) => `
          <a href="${escapeHtml(m.url || "/")}" class="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors">
            ${escapeHtml(m.label || "")}
          </a>
        `
            )
            .join("")
        : "";

      const ctaHtml =
        p.showCta !== "no" && p.ctaText
          ? `
        <a href="${escapeHtml(p.ctaUrl || "/admin")}" class="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all">
          ${escapeHtml(p.ctaText)}
        </a>
      `
          : "";

      return `
      <header class="${positionClass} w-full bg-white border-b border-slate-200">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            ${
              p.logoImage
                ? `<img src="${escapeHtml(p.logoImage)}" alt="${escapeHtml(p.siteTitle || "Logo")}" class="h-10 w-auto object-contain">`
                : `<div class="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-lg">${escapeHtml((p.siteTitle || "C").charAt(0))}</div>`
            }
            <span class="text-xl font-black text-slate-900 tracking-tight">${escapeHtml(p.siteTitle || "cmsMu")}</span>
          </div>
          <nav class="hidden md:flex items-center gap-6">
            ${menuHtml || `<span class="text-xs text-slate-400 italic">Menu Navigasi</span>`}
          </nav>
          <div class="flex items-center gap-3">
            ${ctaHtml}
          </div>
        </div>
      </header>
      `;
    }

    case "Hero": {
      const bgStyle = p.backgroundImage
        ? `background-image: url('${escapeHtml(p.backgroundImage)}'); background-size: cover; background-position: center;`
        : `background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 20px 20px;`;

      return `
      <section class="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24 bg-slate-50 border-b border-slate-200" style="${bgStyle}">
        ${p.backgroundImage ? `<div class="absolute inset-0 z-0 bg-white/80 backdrop-blur-sm"></div>` : ""}
        <div class="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          ${
            p.badgeText
              ? `<div class="mb-4 inline-block rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-700">${escapeHtml(p.badgeText)}</div>`
              : ""
          }
          <h1 class="mb-6 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            ${escapeHtml(p.title || "Satu Fondasi CMS Terpadu")}
          </h1>
          <p class="mx-auto mt-4 mb-10 max-w-3xl text-base sm:text-xl text-slate-600 leading-relaxed">
            ${escapeHtml(p.description || "Platform Content Management System modern, tangguh, dan fleksibel.")}
          </p>
          <div class="flex flex-col justify-center gap-4 sm:flex-row">
            ${
              p.primaryButtonText
                ? `<a href="${escapeHtml(p.primaryButtonLink || "#")}" class="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-lg shadow-emerald-600/30 transition-all">${escapeHtml(p.primaryButtonText)}</a>`
                : ""
            }
            ${
              p.secondaryButtonText
                ? `<a href="${escapeHtml(p.secondaryButtonLink || "#")}" class="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-full transition-all">${escapeHtml(p.secondaryButtonText)}</a>`
                : ""
            }
          </div>
        </div>
      </section>
      `;
    }

    case "Partners": {
      const partnersList = Array.isArray(p.partners) ? p.partners : [
        { name: "cmsMu Core" },
        { name: "Cloudflare Edge" },
        { name: "Drizzle ORM" },
        { name: "Astro SSR" }
      ];

      return `
      <section class="bg-white py-12 border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p class="text-xs text-slate-400 font-bold mb-8 uppercase tracking-wider">${escapeHtml(p.title || "Dipercaya & Berkolaborasi Dengan")}</p>
          <div class="flex justify-center items-center flex-wrap gap-8 md:gap-16 opacity-60">
            ${partnersList.map((pt: any) => `
              <div class="flex items-center justify-center">
                ${pt.logoUrl ? `<img src="${escapeHtml(pt.logoUrl)}" alt="${escapeHtml(pt.name)}" class="h-8 object-contain">` : `<span class="text-lg font-extrabold text-slate-700 tracking-tight">${escapeHtml(pt.name)}</span>`}
              </div>
            `).join("")}
          </div>
        </div>
      </section>
      `;
    }

    case "FeatureGrid": {
      const features = Array.isArray(p.features) && p.features.length > 0 ? p.features : [
        { title: "Cepat & Serverless", description: "Performa tinggi di edge computing Cloudflare.", svgIcon: "bolt" },
        { title: "Keamanan Tingkat Tinggi", description: "Otorisasi role berbasis token terenkripsi.", svgIcon: "shield" },
        { title: "Desain Responsif", description: "Tampilan optimal di perangkat ponsel, tablet, dan desktop.", svgIcon: "mobile" }
      ];

      const featureItems = features
        .map(
          (f: any) => `
        <div class="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all hover:shadow-xs">
          <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mb-6">
            <i class="fas fa-${escapeHtml(f.svgIcon || "star")}"></i>
          </div>
          <h3 class="text-xl font-bold text-slate-900 mb-3">${escapeHtml(f.title || "")}</h3>
          <p class="text-sm text-slate-600 leading-relaxed">${escapeHtml(f.description || "")}</p>
        </div>
      `
        )
        .join("");

      return `
      <section id="fitur" class="bg-white py-20 border-b border-slate-100">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">${escapeHtml(p.title || "Fitur Unggulan")}</h2>
            <p class="text-lg text-slate-600">${escapeHtml(p.description || "Solusi lengkap dan terintegrasi untuk publikasi modern.")}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          bgColor: "bg-emerald-600"
        },
        {
          quote: "Visual builder mandiri sangat cepat dan tidak membebani browser.",
          author: "Siti Rahmawati",
          role: "Humas & Publikasi",
          initials: "SR",
          bgColor: "bg-emerald-500"
        }
      ];

      const cards = testimonials.map((t: any) => `
        <div class="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <p class="text-sm text-slate-600 italic mb-6 leading-relaxed">"${escapeHtml(t.quote || "")}"</p>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full ${t.bgColor || "bg-emerald-600"} text-white font-bold flex items-center justify-center text-sm">
              ${escapeHtml(t.initials || "U")}
            </div>
            <div>
              <h4 class="text-sm font-bold text-slate-900">${escapeHtml(t.author || "Pengguna")}</h4>
              <p class="text-xs text-slate-500">${escapeHtml(t.role || "Anggota")}</p>
            </div>
          </div>
        </div>
      `).join("");

      return `
      <section class="bg-slate-50 py-20 border-b border-slate-200">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">${escapeHtml(p.title || "Dipercaya Pengelola Website")}</h2>
            <p class="text-base text-slate-600">${escapeHtml(p.subtitle || "Ulasan dan pengalaman para redaktur.")}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            ${cards}
          </div>
        </div>
      </section>
      `;
    }

    case "RecentPosts": {
      const posts = Array.isArray(p.posts) ? p.posts : [];
      const sampleCards = `
        <article class="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-md">
          <div class="relative aspect-video w-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400">
            <i class="fas fa-newspaper text-3xl opacity-40"></i>
            <span class="absolute top-3 left-3 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Panduan</span>
          </div>
          <div class="flex flex-1 flex-col justify-between p-6">
            <div>
              <div class="mb-2 text-xs font-medium text-slate-400">19 Okt 2026</div>
              <h3 class="mb-3 text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Panduan Standarisasi Pembuatan Theme & Struktur Konten cmsMu
              </h3>
              <p class="mb-4 text-sm text-slate-600 leading-relaxed line-clamp-2">Arsitektur tema modular, isolasi core engine, dan struktur permalink bersih.</p>
            </div>
            <div class="pt-2">
              <span class="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">Baca Selengkapnya &rarr;</span>
            </div>
          </div>
        </article>
      `;

      return `
      <section id="berita" class="bg-white py-20 border-b border-slate-200">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div class="max-w-2xl">
              <h2 class="mb-4 text-3xl md:text-4xl font-bold text-slate-900">${escapeHtml(p.title || "Kabar & Wawasan Terbaru")}</h2>
              <p class="text-lg text-slate-600">${escapeHtml(p.description || "Ikuti perkembangan terbaru dan artikel pilihan.")}</p>
            </div>
            <div>
              <a href="${escapeHtml(p.viewAllLink || "/berita")}" class="inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700">
                ${escapeHtml(p.viewAllText || "Lihat Semua Artikel")} &rarr;
              </a>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${sampleCards}
          </div>
        </div>
      </section>
      `;
    }

    case "MagazineBigGrid": {
      return `
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-slate-200">
        <div class="mb-8 border-b-2 border-slate-900 pb-2">
          <span class="bg-slate-900 text-white font-extrabold uppercase text-xs tracking-wider px-3 py-1.5 rounded">
            ${escapeHtml(p.title || "Top Stories")}
          </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 h-[420px]">
          <div class="md:col-span-2 bg-slate-900 rounded-2xl overflow-hidden text-white p-8 flex flex-col justify-end relative shadow-sm">
            <span class="px-3 py-1 rounded bg-emerald-600 text-white text-xs font-bold w-fit mb-3">Sorotan Utama</span>
            <h3 class="text-2xl font-black">Transformasi Digital & Arsitektur Headless Cloud-Native</h3>
          </div>
          <div class="flex flex-col gap-6 h-full">
            <div class="flex-1 bg-slate-800 rounded-2xl text-white p-6 flex flex-col justify-end">
              <span class="text-xs text-slate-400 mb-1">Berita Pendamping</span>
              <h4 class="font-bold text-base">Inovasi Layanan Pendidikan & Kesehatan Berkelanjutan</h4>
            </div>
            <div class="flex-1 bg-slate-800 rounded-2xl text-white p-6 flex flex-col justify-end">
              <span class="text-xs text-slate-400 mb-1">Wawasan Dakwah</span>
              <h4 class="font-bold text-base">Pemberdayaan Ekonomi Umat Berbasis Ekosistem Digital</h4>
            </div>
          </div>
        </div>
      </section>
      `;
    }

    case "CallToAction": {
      return `
      <section class="py-20 bg-emerald-600 text-white text-center">
        <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">${escapeHtml(p.title || "Siap Membangun Website Anda?")}</h2>
          <p class="text-lg md:text-xl text-emerald-100 mb-10 max-w-2xl mx-auto leading-relaxed">${escapeHtml(p.description || "Mulai terbitkan artikel dan kelola konten digital Anda sekarang.")}</p>
          ${
            p.buttonText
              ? `<a href="${escapeHtml(p.buttonLink || "/admin")}" class="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-emerald-900 bg-white hover:bg-emerald-50 rounded-full shadow-xl transition-all">${escapeHtml(p.buttonText)}</a>`
              : ""
          }
          ${p.footerText ? `<p class="mt-6 text-xs text-emerald-200">${escapeHtml(p.footerText)}</p>` : ""}
        </div>
      </section>
      `;
    }

    case "SiteFooter": {
      return `
      <footer class="bg-slate-900 text-slate-400 py-12">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-3">
            ${p.logoImage ? `<img src="${escapeHtml(p.logoImage)}" class="h-8 w-auto object-contain">` : ""}
            <span class="text-lg font-bold text-white">${escapeHtml(p.siteName || "cmsMu")}</span>
          </div>
          <p class="text-xs text-slate-500 m-0">&copy; ${new Date().getFullYear()} ${escapeHtml(p.siteName || "cmsMu")}. ${escapeHtml(p.copyrightText || "Hak Cipta Dilindungi Undang-Undang.")}</p>
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
      return `<div class="p-6 bg-slate-100 text-slate-500 text-center text-xs">Blok: ${escapeHtml(type)}</div>`;
  }
}
