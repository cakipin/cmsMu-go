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
      const positionClass =
        p.headerPosition === "static"
          ? "relative"
          : p.headerPosition === "sticky"
          ? "sticky top-0 z-50"
          : "fixed top-0 left-0 right-0 z-50";

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
      <header class="${positionClass} w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
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
            ${menuHtml}
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
      <section class="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32 bg-slate-50" style="${bgStyle}">
        ${p.backgroundImage ? `<div class="absolute inset-0 z-0 bg-white/80 backdrop-blur-sm"></div>` : ""}
        <div class="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          ${
            p.badgeText
              ? `<div class="mb-4 inline-block rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-700">${escapeHtml(p.badgeText)}</div>`
              : ""
          }
          <h1 class="mb-6 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            ${escapeHtml(p.title || "")}
          </h1>
          <p class="mx-auto mt-4 mb-10 max-w-3xl text-base sm:text-xl text-slate-600 leading-relaxed">
            ${escapeHtml(p.description || "")}
          </p>
          <div class="flex flex-col justify-center gap-4 sm:flex-row">
            ${
              p.primaryButtonText
                ? `<a href="${escapeHtml(p.primaryButtonLink || "#")}" class="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-lg shadow-emerald-600/30 transition-all">${escapeHtml(p.primaryButtonText)}</a>`
                : ""
            }
            ${
              p.secondaryButtonText
                ? `<a href="${escapeHtml(p.secondaryButtonLink || "#")}" class="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-full transition-all">${escapeHtml(p.secondaryButtonText)}</a>`
                : ""
            }
          </div>
        </div>
      </section>
      `;
    }

    case "RecentPosts": {
      const posts = Array.isArray(p.posts) ? p.posts : [];
      const postCards = posts
        .map(
          (post: any) => `
        <article class="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 transition-all duration-300 hover:shadow-lg">
          <div class="relative aspect-video w-full overflow-hidden bg-slate-200">
            ${
              post.featured_image
                ? `<img src="${escapeHtml(post.featured_image)}" alt="${escapeHtml(post.title)}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy">`
                : `<div class="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-600"><i class="fas fa-newspaper text-3xl opacity-40"></i></div>`
            }
            ${post.category ? `<span class="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-sm">${escapeHtml(post.category)}</span>` : ""}
          </div>
          <div class="flex flex-1 flex-col justify-between p-6">
            <div>
              ${post.created_at ? `<div class="mb-2 text-xs font-medium text-slate-400">${escapeHtml(String(post.created_at).substring(0, 10))}</div>` : ""}
              <h3 class="mb-3 line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                <a href="/${escapeHtml(post.slug)}" class="hover:underline">${escapeHtml(post.title)}</a>
              </h3>
              ${post.excerpt ? `<p class="mb-4 line-clamp-2 text-sm text-slate-600 leading-relaxed">${escapeHtml(post.excerpt)}</p>` : ""}
            </div>
            <div class="pt-2">
              <a href="/${escapeHtml(post.slug)}" class="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                Baca Selengkapnya &rarr;
              </a>
            </div>
          </div>
        </article>
      `
        )
        .join("");

      return `
      <section id="berita" class="bg-white py-20">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div class="max-w-2xl">
              <h2 class="mb-4 text-3xl md:text-4xl font-bold text-slate-900">${escapeHtml(p.title || "")}</h2>
              <p class="text-lg text-slate-600">${escapeHtml(p.description || "")}</p>
            </div>
            ${
              p.viewAllText
                ? `<div><a href="${escapeHtml(p.viewAllLink || "/berita")}" class="inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700">${escapeHtml(p.viewAllText)} &rarr;</a></div>`
                : ""
            }
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${postCards || `<div class="col-span-3 text-center py-12 text-slate-400">Belum ada artikel yang diterbitkan.</div>`}
          </div>
        </div>
      </section>
      `;
    }

    case "FeatureGrid": {
      const features = Array.isArray(p.features) ? p.features : [];
      const featureItems = features
        .map(
          (f: any) => `
        <div class="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all hover:shadow-sm">
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
      <section id="fitur" class="bg-white py-20 border-t border-slate-100">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">${escapeHtml(p.title || "")}</h2>
            <p class="text-lg text-slate-600">${escapeHtml(p.description || "")}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${featureItems}
          </div>
        </div>
      </section>
      `;
    }

    case "CallToAction": {
      return `
      <section class="py-20 bg-emerald-600 text-white text-center">
        <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">${escapeHtml(p.title || "")}</h2>
          <p class="text-lg md:text-xl text-emerald-100 mb-10 max-w-2xl mx-auto leading-relaxed">${escapeHtml(p.description || "")}</p>
          ${
            p.buttonText
              ? `<a href="${escapeHtml(p.buttonLink || "/admin")}" class="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-emerald-900 bg-white hover:bg-emerald-50 rounded-full shadow-xl transition-all">${escapeHtml(p.buttonText)}</a>`
              : ""
          }
          ${p.footerText ? `<p class="mt-6 text-xs text-emerald-200">${escapeHtml(p.footerText)}</p>` : ""}
        </div>
      </section>
      `;
    }

    case "SiteFooter": {
      return `
      <footer class="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-3">
            ${p.logoImage ? `<img src="${escapeHtml(p.logoImage)}" class="h-8 w-auto">` : ""}
            <span class="text-lg font-bold text-white">${escapeHtml(p.siteName || "cmsMu")}</span>
          </div>
          <p class="text-xs text-slate-500 m-0">&copy; ${new Date().getFullYear()} ${escapeHtml(p.siteName || "cmsMu")}. ${escapeHtml(p.copyrightText || "Hak Cipta Dilindungi.")}</p>
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
      return `<!-- Unknown block type: ${escapeHtml(type)} -->`;
  }
}
