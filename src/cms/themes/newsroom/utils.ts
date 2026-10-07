export function escapeHtml(str: any): string {
  if (str === null || str === undefined) return "";
  return String(str).replace(
    /&(?!#?\w+;)|[<>"']/g,
    c =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[c] || c
  );
}

export function formatDateIndo(dateInput: any): string {
  if (!dateInput) return "";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (e) {
    return String(dateInput);
  }
}

export function formatTimeAgo(dateInput: any): string {
  if (!dateInput) return "";
  try {
    const d = new Date(dateInput);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return "Baru saja";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} hari lalu`;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return "";
  }
}

export function getYoutubeThumbnail(url?: string): string {
  if (!url) return "";
  const str = String(url).trim();
  if (str.includes("youtube.com") || str.includes("youtu.be")) {
    let videoId = "";
    if (str.includes("youtu.be/")) {
      videoId = str.split("youtu.be/")[1].split("?")[0].split("/")[0];
    } else if (str.includes("shorts/")) {
      videoId = str.split("shorts/")[1].split("?")[0].split("/")[0];
    } else if (str.includes("embed/")) {
      videoId = str.split("embed/")[1].split("?")[0].split("/")[0];
    } else {
      const m = str.match(/[?&]v=([a-zA-Z0-9_-]+)/);
      if (m && m[1]) videoId = m[1];
    }
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return "";
}

export function getPostImage(post: any, fallbackIndex = 0): string {
  if (!post)
    return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
  const custom = post?.featured_image || post?.featuredImage || post?.image;
  if (custom && typeof custom === "string" && custom.trim() !== "")
    return custom;

  const yt = getYoutubeThumbnail(
    post?.video_url || post?.videoUrl || post?.video
  );
  if (yt) return yt;

  if (post.body && typeof post.body === "string") {
    const match = post.body.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) return match[1];
  }

  const fallbacks = [
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80",
  ];
  return fallbacks[fallbackIndex % fallbacks.length];
}

export function getPostCategory(post: any): string {
  if (!post) return "Berita";
  return (
    post?.category ||
    post?.category_name ||
    post?.categories?.[0]?.name ||
    "Berita Terkini"
  );
}

export function estimateReadTime(text: string): number {
  if (!text) return 2;
  const words = text
    .replace(/<[^>]+>/g, "")
    .trim()
    .split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function cleanAndFormatArticleContent(
  rawHtml: string,
  hasFeaturedImage = false
): { body: string; captionText: string } {
  if (!rawHtml) return { body: "", captionText: "" };

  let str = String(rawHtml).trim();
  let extractedCaption = "";

  // 1. Ekstraksi dan pembersihan shortcode [caption]...[/caption]
  const captionRegex = /\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/gi;
  let isFirstCaption = true;

  str = str.replace(captionRegex, (match, inner) => {
    const imgMatch = inner.match(/<img[^>]*>/i);
    const captionText = inner.replace(/<[^>]+>/g, "").trim();

    if (isFirstCaption) {
      isFirstCaption = false;
      if (captionText && !extractedCaption) {
        extractedCaption = captionText;
      }
      // Jika post memiliki featured image, buang caption/gambar pertama di awal artikel
      if (hasFeaturedImage) {
        return "";
      }
    }

    if (imgMatch) {
      return `<figure class="wp-caption my-6 text-center">${imgMatch[0]}${captionText ? `<figcaption class="wp-caption-text text-sm text-slate-500 italic mt-2">${captionText}</figcaption>` : ""}</figure>`;
    }
    return captionText
      ? `<p class="wp-caption-text italic text-slate-500">${captionText}</p>`
      : "";
  });

  // Bersihkan sisa tag caption jika ada
  str = str.replace(/\[\/?caption[^\]]*\]/gi, "");

  // 2. Bersihkan kontainer caption kosong / sisa wp-caption kosong
  str = str.replace(
    /<div[^>]*class="[^"]*wp-caption[^"]*"[^>]*>\s*<\/div>/gi,
    ""
  );

  // 2b. Bersihkan wrapper kontainer layout eksternal (seperti UMPAR / portal lain)
  str = str.replace(
    /<div[^>]*class=["'][^"']*(?:container mx-auto|max-w-4xl|article-content-card|article-body|prose-modern)[^"']*["'][^>]*>/gi,
    ""
  );

  // 2c. Bersihkan wrapper featured-image dari body naskah
  str = str.replace(
    /<div[^>]*class=["'][^"']*(?:featured-image-wrapper|featured-image|featured_image|post-thumbnail|entry-thumbnail)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
    ""
  );

  // 2d. Bersihkan foto/gambar/figure di bagian paling atas naskah (sebelum teks narasi berita) pada SEMUA sumber
  let topCleaned = false;
  while (!topCleaned) {
    const before = str;
    str = str.replace(
      /^\s*(?:<div[^>]*>\s*)*<figure[^>]*>[\s\S]*?<\/figure>(?:\s*<\/div>)*/i,
      ""
    );
    str = str.replace(
      /^\s*(?:<div[^>]*>\s*)*<p[^>]*>\s*<figure[^>]*>[\s\S]*?<\/figure>\s*<\/p>(?:\s*<\/div>)*/i,
      ""
    );
    str = str.replace(
      /^\s*(?:<div[^>]*>\s*)*<p[^>]*>\s*(?:<a[^>]*>\s*)?<img[^>]*>(?:\s*<\/a>)?\s*<\/p>(?:\s*<\/div>)*/i,
      ""
    );
    str = str.replace(
      /^\s*(?:<div[^>]*>\s*)*<p[^>]*>\s*<figure[^>]*>[\s\S]*?<\/figure>/i,
      "<p>"
    );
    str = str.replace(
      /^\s*(?:<div[^>]*>\s*)*<p[^>]*>\s*(?:<a[^>]*>\s*)?<img[^>]*>(?:\s*<\/a>)?/i,
      "<p>"
    );
    str = str.replace(/^\s*(?:<div[^>]*>\s*)*<img[^>]*>(?:\s*<\/div>)*/i, "");
    str = str.replace(
      /^\s*<div[^>]*class=["'][^"']*(?:wp-caption|featured)[^"']*["'][^>]*>[\s\S]*?<\/div>/i,
      ""
    );
    if (str === before) {
      topCleaned = true;
    }
  }

  // 2e. Bersihkan blok attribution-box bawaan artikel agar tidak dobel dengan attribution-box tema
  str = str.replace(
    /<blockquote[^>]*class="[^"]*attribution-box[^"]*"[^>]*>[\s\S]*?<\/blockquote>/gi,
    ""
  );

  // 2f. Bersihkan widget sosial share eksternal, floating bar, dan sampah HTML plugin (termasuk Bagikan Artikel Ini, FB, Twitter, WA, IG, TikTok)
  str = str.replace(
    /<div[^>]*class=["'][^"']*(?:share-section|share-title|share-btn|bagikan|xs_social_share_widget|xs_share_url|wslu-style|wslu-share-box|sharedaddy|jp-relatedposts|social-share|share-box|share-buttons|social-buttons|addtoany|heateor_sss_sharing_container|yarpp-related)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
    ""
  );
  str = str.replace(
    /<div[^>]*class=["'][^"']*share-section[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
    ""
  );
  str = str.replace(
    /<h[1-6][^>]*>\s*(?:<[^>]+>\s*)*(?:Bagikan Artikel|Bagikan Berita|Share this)[\s\S]*?<\/div>\s*<\/div>/gi,
    ""
  );
  str = str.replace(
    /<ul[^>]*class=["'][^"']*(?:share|social|wslu)[^"']*["'][^>]*>[\s\S]*?<\/ul>/gi,
    ""
  );

  // 2g. Bersihkan sisa wrapper paragraf dobel / nested p bawaan WordPress
  str = str.replace(/<p[^>]*>\s*<p[^>]*>/gi, "<p>");
  str = str.replace(/<\/p>\s*<\/p>/gi, "</p>");

  // 2f. Bersihkan inline style width/height atau atribut width pada figure dan img agar tidak overflow
  str = str.replace(/<figure([^>]*)>/gi, (_match, attrs) => {
    let cleanAttrs = attrs
      .replace(/style="([^"]*)"/gi, (_m: string, s: string) => {
        const filtered = s.replace(/(?:max-)?width\s*:\s*[^;]+;?/gi, "").trim();
        return filtered ? `style="${filtered}"` : "";
      })
      .replace(/\s*width="[^"]*"/gi, "");
    return `<figure${cleanAttrs}>`;
  });

  // 3. Sanitasi & Responsivitas Tabel
  str = str.replace(
    /(?:<div[^>]*class="[^"]*table-responsive-wrapper[^"]*"[^>]*>\s*)?(<table[\s\S]*?<\/table>)(?:\s*<\/div>)?/gi,
    (_match, tableHtml) => {
      let cleanedTable = tableHtml
        .replace(/\s*(width|height)="[^"]*"/gi, "")
        .replace(/style="([^"]*)"/gi, (_m: string, s: string) => {
          const filtered = s.replace(/width\s*:\s*[^;]+;?/gi, "").trim();
          return filtered ? `style="${filtered}"` : "";
        })
        .replace(/<\/strong><\/p>\s*<p>(&nbsp;|\s*)<\/td>/gi, "</strong></td>")
        .replace(/<p>(&nbsp;|\s*)<\/td>/gi, "</td>");
      return `<div class="table-responsive-wrapper">${cleanedTable}</div>`;
    }
  );

  // 3b. Bersihkan tag <br> yang berdiri sendiri di antara tag </p> dan <p>
  str = str.replace(/<\/p>\s*(?:<br\s*\/?>\s*)+<p[^>]*>/gi, "</p><p>");

  // 3c. Bersihkan tag <p> kosong atau hanya berisi spasi / &nbsp; / <br>
  str = str.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi, "");

  // 4. Smart Autop Paragraph Formatter
  str = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = str.split(/\n\s*\n+/);

  const formattedBlocks = blocks
    .map(block => {
      const trimmed = block.trim();
      if (!trimmed) return "";

      const isBlockTag =
        /^<(div|blockquote|figure|figcaption|table|ul|ol|h[1-6]|iframe|section|article|p|hr)/i.test(
          trimmed
        );
      if (isBlockTag) {
        return trimmed;
      }

      const withBr = trimmed.replace(/\n/g, "<br />");
      return `<p>${withBr}</p>`;
    })
    .filter(Boolean);

  let finalBody = formattedBlocks.join("\n\n");

  // Bersihkan kembali sisa <p></p> kosong atau <p><br></p> yang mungkin tersisa
  finalBody = finalBody.replace(
    /<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi,
    ""
  );
  finalBody = finalBody.replace(
    /<\/p>\s*(?:<br\s*\/?>\s*)+<p[^>]*>/gi,
    "</p><p>"
  );

  return {
    body: finalBody.trim(),
    captionText: extractedCaption,
  };
}

export function extractSourceInfo(
  post: any,
  siteTitle: string = "Newsroom",
  sourcesList: any[] = []
): {
  name: string;
  url: string;
  favicon: string;
  slug: string;
  internalUrl: string;
} {
  if (!post) {
    return {
      name: siteTitle,
      url: "/",
      favicon: "/favicon.svg",
      slug: "",
      internalUrl: "/",
    };
  }

  const rawBody = String(post.body || post.content || "");
  let sourceUrl = post.source_url || post.original_url || "";
  let sourceName = post.source_name || "";

  // 1. Deteksi dari attribution box: <blockquote class="attribution-box">...<a href="URL">NAME</a>...</blockquote>
  if (!sourceUrl || !sourceName) {
    const attrMatch = rawBody.match(
      /<blockquote[^>]*class="[^"]*attribution-box[^"]*"[^>]*>[\s\S]*?<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i
    );
    if (attrMatch) {
      if (!sourceUrl) sourceUrl = attrMatch[1].trim();
      if (!sourceName) sourceName = attrMatch[2].replace(/<[^>]+>/g, "").trim();
    }
  }

  // 2. Deteksi dari lead text: <strong>KOTA, MEDIA.COM</strong>
  if (!sourceName) {
    const leadMatch = rawBody.match(
      /<strong[^>]*>([A-Z\s]+),\s*([A-Z0-9.-]+\.[A-Z]{2,})<\/strong>/i
    );
    if (leadMatch) {
      sourceName = leadMatch[2].trim();
      if (!sourceUrl) sourceUrl = "https://" + sourceName.toLowerCase();
    }
  }

  // 3. Fallback jika ada URL tapi belum ada nama
  if (sourceUrl && !sourceName) {
    try {
      const parsed = new URL(sourceUrl);
      sourceName = parsed.hostname.replace(/^www\./i, "");
    } catch (e) {
      sourceName = sourceUrl;
    }
  }

  // 4. Jika terdeteksi sebagai artikel sindikasi media
  if (sourceUrl || sourceName) {
    let domain = "";
    try {
      if (sourceUrl) {
        domain = new URL(
          sourceUrl.startsWith("http") ? sourceUrl : "https://" + sourceUrl
        ).hostname.replace(/^www\./i, "");
      } else {
        domain = sourceName.toLowerCase().replace(/^www\./i, "");
      }
    } catch (e) {
      domain = sourceName.toLowerCase();
    }

    let slug = "";
    const normName = (sourceName || "").toLowerCase().trim();
    const normDomain = domain.toLowerCase().trim();

    // DYNAMIC MATCHING ke daftar media_sources dari Real Database (Zero Hardcode Policy)
    if (Array.isArray(sourcesList) && sourcesList.length > 0) {
      // 1. Cocokkan Domain URL (Paling Akurat)
      const matchedByDomain = sourcesList.find((s: any) => {
        if (!s.base_url) return false;
        try {
          const sDom = new URL(
            s.base_url.startsWith("http") ? s.base_url : "https://" + s.base_url
          ).hostname
            .replace(/^www\./i, "")
            .toLowerCase();
          return (
            normDomain === sDom ||
            normDomain.endsWith("." + sDom) ||
            sDom.endsWith("." + normDomain)
          );
        } catch (e) {
          return false;
        }
      });

      if (matchedByDomain) {
        sourceName = matchedByDomain.name || sourceName;
        slug = matchedByDomain.slug;
      } else {
        // 2. Cocokkan Nama Media Persis atau Slug Persis
        const cleanName = normName.replace(/[^a-z0-9]/g, "");
        const matchedByName = sourcesList.find((s: any) => {
          const sNameClean = (s.name || "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
          const sSlugClean = (s.slug || "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
          return (
            (cleanName && cleanName === sNameClean) ||
            (cleanName && cleanName === sSlugClean) ||
            (s.name && normName === s.name.toLowerCase())
          );
        });

        if (matchedByName) {
          sourceName = matchedByName.name || sourceName;
          slug = matchedByName.slug;
        } else {
          // 3. Cocokkan Nama Media Substring kata kunci signifikan (misal: "Suara Guru" vs "Suara Guru Muhammadiyah")
          const matchedBySub = sourcesList.find((s: any) => {
            const sNameNorm = (s.name || "").toLowerCase();
            return (
              (sNameNorm.length >= 6 && normName.includes(sNameNorm)) ||
              (normName.length >= 6 && sNameNorm.includes(normName))
            );
          });

          if (matchedBySub) {
            sourceName = matchedBySub.name || sourceName;
            slug = matchedBySub.slug;
          }
        }
      }
    }

    // Fallback Slug Dinamis jika tidak ada dalam database (Slugify Dinamis, BUKAN diarahkan ke pwm-diy)
    if (!slug) {
      slug = (sourceName || domain)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const favicon = domain
      ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`
      : "/favicon.svg";
    return {
      name: sourceName || domain,
      url: sourceUrl || (domain ? "https://" + domain : "#"),
      favicon,
      slug,
      internalUrl: slug ? `/sumber/${slug}` : "/sumber",
    };
  }

  // 5. Default artikel internal
  return {
    name: siteTitle,
    url: "/",
    favicon: "/favicon.svg",
    slug: "",
    internalUrl: "/",
  };
}

export function renderPaginationBar(pagination: any): string {
  if (!pagination || pagination.totalPages <= 1) return "";

  const current = Number(pagination.currentPage) || 1;
  const total = Number(pagination.totalPages) || 1;
  const totalItems = pagination.totalItems || 0;
  const baseUrl = pagination.baseUrl || "/";

  const buildUrl = (p: number) => {
    const hasQuery = baseUrl.includes("?");
    if (p === 1 && (baseUrl === "/" || baseUrl === "")) return "/";
    if (hasQuery) {
      // Ganti param page jika ada, atau tambahkan
      const u = new URL("http://dummy.local" + baseUrl);
      u.searchParams.set("page", String(p));
      return u.pathname + u.search;
    }
    return `${baseUrl}?page=${p}`;
  };

  // Hitung rentang nomor halaman yang akan ditampilkan (misal: 1, 2, 3 ... 10)
  const pages: (number | string)[] = [];
  const delta = 2; // jumlah nomor di sekitar current page

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const prevBtn =
    current > 1
      ? `<a href="${buildUrl(current - 1)}" class="nr-page-btn" aria-label="Halaman Sebelumnya"><i class="fas fa-chevron-left" style="font-size:0.75rem; margin-right:4px;"></i> Sebelumnya</a>`
      : `<span class="nr-page-btn disabled" aria-disabled="true"><i class="fas fa-chevron-left" style="font-size:0.75rem; margin-right:4px;"></i> Sebelumnya</span>`;

  const nextBtn =
    current < total
      ? `<a href="${buildUrl(current + 1)}" class="nr-page-btn" aria-label="Halaman Selanjutnya">Selanjutnya <i class="fas fa-chevron-right" style="font-size:0.75rem; margin-left:4px;"></i></a>`
      : `<span class="nr-page-btn disabled" aria-disabled="true">Selanjutnya <i class="fas fa-chevron-right" style="font-size:0.75rem; margin-left:4px;"></i></span>`;

  const pageButtons = pages
    .map(p => {
      if (p === "...") {
        return `<span class="nr-page-ellipsis">&hellip;</span>`;
      }
      const pageNum = Number(p);
      const isActive = pageNum === current;
      if (isActive) {
        return `<span class="nr-page-btn active" aria-current="page">${pageNum}</span>`;
      }
      return `<a href="${buildUrl(pageNum)}" class="nr-page-btn">${pageNum}</a>`;
    })
    .join("");

  return `
    <div class="nr-pagination-wrapper">
      <nav class="nr-pagination" aria-label="Navigasi Halaman Berita">
        ${prevBtn}
        ${pageButtons}
        ${nextBtn}
      </nav>
      ${
        totalItems > 0
          ? `
        <div class="nr-pagination-info">
          Menampilkan halaman <strong>${current}</strong> dari <strong>${total}</strong> (Total <strong>${totalItems}</strong> liputan warta)
        </div>
      `
          : ""
      }
    </div>
  `;
}
