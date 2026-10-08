export const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(
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
export const fallback = (seed: number) =>
  `https://images.unsplash.com/photo-${["1504711434969-e33886168f5c", "1495020689067-958852a7765e", "1529107386315-e1a2ed48a620", "1481627834876-b7833e8f5570"][seed % 4]}?auto=format&fit=crop&w=1000&q=80`;
export const date = (value: any) =>
  new Date(value || Date.now()).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
export const category = (p: any) =>
  escapeHtml(p?.category || p?.categories?.[0]?.name || "Berita");
export const getYoutubeThumbnail = (url?: string): string => {
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
};

export const image = (p: any, i = 0) => {
  const custom = p?.featured_image || p?.featuredImage || p?.image;
  if (custom && String(custom).trim() !== "") return escapeHtml(custom);
  const yt = getYoutubeThumbnail(p?.video_url || p?.videoUrl || p?.video);
  if (yt) return escapeHtml(yt);
  return escapeHtml(fallback(i));
};

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

  // Bersihkan sisa tag caption yatim piatu jika ada
  str = str.replace(/\[\/?caption[^\]]*\]/gi, "");

  // Ekstraksi caption jika ada di div wp-caption pertama di awal artikel sebelum dibersihkan
  const firstDivMatch = str.match(
    /^\s*<div[^>]*class="[^"]*wp-caption[^"]*"[^>]*>([\s\S]*?)<\/div>/i
  );
  if (firstDivMatch && !extractedCaption) {
    const capMatch = firstDivMatch[1].match(
      /<p[^>]*class="[^"]*wp-caption-text[^"]*"[^>]*>(.*?)<\/p>/i
    );
    if (capMatch) {
      extractedCaption = capMatch[1].replace(/<[^>]+>/g, "").trim();
    }
  }

  // Ekstraksi caption dari p wp-caption-text pertama jika berdiri sendiri
  const firstPMatch = str.match(
    /^\s*<p[^>]*class="[^"]*wp-caption-text[^"]*"[^>]*>([\s\S]*?)<\/p>/i
  );
  if (firstPMatch && !extractedCaption) {
    extractedCaption = firstPMatch[1].replace(/<[^>]+>/g, "").trim();
  }

  // 2. Bersihkan gambar sebelum artikel postingan (gambar/caption pertama di awal body artikel)
  str = str.replace(
    /^\s*<div[^>]*class="[^"]*wp-caption[^"]*"[^>]*>[\s\S]*?<\/div>\s*/i,
    ""
  );
  str = str.replace(/^\s*<figure[^>]*>[\s\S]*?<\/figure>\s*/i, "");
  str = str.replace(
    /^\s*<p[^>]*>\s*(?:<strong>|<b>)?\s*<img[^>]*>(?:\s*<br\s*\/?>)?\s*(?:<\/strong>|<\/b>)?\s*<\/p>\s*/i,
    ""
  );
  str = str.replace(
    /^\s*<p[^>]*class="[^"]*wp-caption-text[^"]*"[^>]*>[\s\S]*?<\/p>\s*/i,
    ""
  );

  // 2.5. Hapus paragraf "Baca Juga:" dan tautan bawaan WordPress yang tertanam di body
  str = str.replace(
    /<p[^>]*>\s*(?:<strong>|<b>)?\s*Baca\s+Juga\s*:[\s\S]*?<\/p>/gi,
    ""
  );
  str = str.replace(
    /(?:<strong>|<b>)?\s*Baca\s+Juga\s*:\s*<a[^>]*href=["'][^"']*["'][^>]*>[\s\S]*?<\/a>(?:\s*<\/strong>|\s*<\/b>)?/gi,
    ""
  );
  str = str.replace(
    /<p[^>]*>\s*(?:<strong>|<b>)?\s*Baca\s+Juga\s*:[\s\S]*?(?:<\/p>|$)/gi,
    ""
  );

  // 3. Sanitasi & Responsivitas Tabel (Hapus width statis & bungkus wrapper responsif)
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

  // 3.5. Sanitasi tag br mandiri di antara elemen blok, tag p kosong, dan tag penutup tanpa pasangan
  str = str.replace(
    /(<\/(?:p|h[1-6]|div|blockquote|figure|ul|ol|table|section|article)>)\s*(?:<br\s*\/?>\s*)+(<(?:p|h[1-6]|div|blockquote|figure|ul|ol|table|section|article)[^>]*>)/gi,
    "$1\n$2"
  );
  str = str.replace(
    /(<\/(?:p|h[1-6]|div|blockquote|figure|ul|ol|table|section|article)>)\s*(?:<br\s*\/?>\s*)+/gi,
    "$1\n"
  );
  str = str.replace(
    /(?:<br\s*\/?>\s*)+(<(?:p|h[1-6]|div|blockquote|figure|ul|ol|table|section|article)[^>]*>)/gi,
    "\n$1"
  );
  str = str.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi, "");
  str = str.replace(
    /^\s*(?:<\/div>|<\/p>|<p[^>]*>\s*<\/div>|<p[^>]*>\s*<\/p>|<br\s*\/?>)+/gi,
    ""
  );

  // 4. Smart Autop Paragraph Formatter
  str = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = str.split(/\n\s*\n+/);

  const formattedBlocks = blocks
    .map(block => {
      const trimmed = block.trim();
      if (!trimmed) return "";

      // Jika blok diawali tag elemen blok HTML, jangan dibungkus <p> lagi
      const isBlockTag =
        /^<(div|blockquote|figure|figcaption|table|ul|ol|h[1-6]|iframe|section|article|p|hr)/i.test(
          trimmed
        );
      if (isBlockTag) {
        return trimmed;
      }

      // Jika blok berupa tag penutup saja, jangan dibungkus <p>
      if (
        /^<\/(div|p|span|figure|figcaption|table|ul|ol|h[1-6]|section|article)>/i.test(
          trimmed
        )
      ) {
        return "";
      }

      // Ubah newline tunggal di dalam paragraf menjadi <br />
      const withBr = trimmed.replace(/\n/g, "<br />");
      return `<p>${withBr}</p>`;
    })
    .filter(Boolean);

  let finalBody = formattedBlocks.join("\n\n");
  finalBody = finalBody.replace(
    /(<\/(?:p|h[1-6]|div|blockquote|figure|ul|ol|table|section|article)>)\s*(?:<br\s*\/?>\s*)+(<(?:p|h[1-6]|div|blockquote|figure|ul|ol|table|section|article)[^>]*>)/gi,
    "$1\n$2"
  );
  finalBody = finalBody.replace(
    /(<\/(?:p|h[1-6]|div|blockquote|figure|ul|ol|table|section|article)>)\s*(?:<br\s*\/?>\s*)+/gi,
    "$1\n"
  );
  finalBody = finalBody.replace(
    /(?:<br\s*\/?>\s*)+(<(?:p|h[1-6]|div|blockquote|figure|ul|ol|table|section|article)[^>]*>)/gi,
    "\n$1"
  );
  finalBody = finalBody.replace(
    /<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi,
    ""
  );
  finalBody = finalBody.replace(
    /^\s*(?:<\/div>|<\/p>|<p[^>]*>\s*<\/div>|<p[^>]*>\s*<\/p>|<br\s*\/?>)+/gi,
    ""
  );

  return {
    body: finalBody,
    captionText: extractedCaption,
  };
}

export function cleanExcerpt(raw: string, maxLength = 160): string {
  if (!raw) return "";
  const clean = String(raw)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&[a-zA-Z0-9#]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (maxLength && clean.length > maxLength) {
    return clean.slice(0, maxLength) + "...";
  }
  return clean;
}

export function renderNumberedPagination(pagination: any): string {
  if (!pagination || !pagination.totalPages || pagination.totalPages <= 1)
    return "";

  const current = Math.max(1, parseInt(pagination.currentPage) || 1);
  const total = Math.max(1, parseInt(pagination.totalPages) || 1);
  const baseUrl = pagination.baseUrl || "";
  const hasQuery = baseUrl.includes("?");
  const makeUrl = (p: number) => `${baseUrl}${hasQuery ? "&" : "?"}page=${p}`;

  const hasPrev =
    pagination.hasPrev !== undefined ? pagination.hasPrev : current > 1;
  const hasNext =
    pagination.hasNext !== undefined ? pagination.hasNext : current < total;

  // Generate page numbers with smart ellipsis window
  const pages: (number | string)[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    if (current < total - 2) pages.push("...");
    if (!pages.includes(total)) pages.push(total);
  }

  return `
    <nav class="numbered-pagination" aria-label="Navigasi Halaman" style="display: flex; justify-content: center; align-items: center; gap: 6px; margin: 40px 0 20px 0; flex-wrap: wrap;">
      ${
        hasPrev
          ? `
        <a href="${makeUrl(current - 1)}" class="pagination-btn pagination-prev" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #334155; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s;" onmouseover="this.style.borderColor='#047857'; this.style.color='#047857';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.color='#334155';">
          &laquo; Sebelumnya
        </a>
      `
          : `
        <span class="pagination-btn pagination-disabled" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; color: #94a3b8; font-size: 13px; font-weight: 600; cursor: not-allowed;">
          &laquo; Sebelumnya
        </span>
      `
      }

      <div class="pagination-numbers" style="display: flex; gap: 4px; align-items: center;">
        ${pages
          .map(p => {
            if (p === "...") {
              return `<span style="padding: 0 4px; color: #94a3b8; font-size: 14px; font-weight: 700;">&hellip;</span>`;
            }
            const isCurrent = p === current;
            return `
            <a href="${makeUrl(p as number)}" style="display: inline-flex; align-items: center; justify-content: center; min-width: 36px; height: 36px; padding: 0 8px; border-radius: 8px; font-size: 13px; font-weight: 700; text-decoration: none; transition: all 0.2s; ${isCurrent ? "background: #047857; color: #ffffff; border: 1px solid #047857; box-shadow: 0 2px 6px rgba(4,120,87,0.3);" : "background: #ffffff; color: #475569; border: 1px solid #cbd5e1;"}" ${isCurrent ? 'aria-current="page"' : `onmouseover="this.style.borderColor='#047857'; this.style.color='#047857';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.color='#475569';"`}>
              ${p}
            </a>
          `;
          })
          .join("")}
      </div>

      ${
        hasNext
          ? `
        <a href="${makeUrl(current + 1)}" class="pagination-btn pagination-next" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #334155; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s;" onmouseover="this.style.borderColor='#047857'; this.style.color='#047857';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.color='#334155';">
          Selanjutnya &raquo;
        </a>
      `
          : `
        <span class="pagination-btn pagination-disabled" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; color: #94a3b8; font-size: 13px; font-weight: 600; cursor: not-allowed;">
          Selanjutnya &raquo;
        </span>
      `
      }
    </nav>
  `;
}
