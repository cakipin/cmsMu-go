export const escapeHtml = (value: unknown): string =>
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

export const formatDate = (value: any): string => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (_) {
    return String(value);
  }
};

export const fallbackImages = [
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80",
];

export const getImage = (post: any, seed = 0): string => {
  const custom = post?.featuredImage || post?.featured_image || post?.image;
  if (custom && String(custom).trim() !== "") return escapeHtml(custom);

  const videoUrl = String(post?.videoUrl || post?.video_url || "").trim();
  if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
    let videoId = "";
    if (videoUrl.includes("youtu.be/")) {
      videoId = videoUrl.split("youtu.be/")[1].split("?")[0].split("/")[0];
    } else if (videoUrl.includes("shorts/")) {
      videoId = videoUrl.split("shorts/")[1].split("?")[0].split("/")[0];
    } else if (videoUrl.includes("embed/")) {
      videoId = videoUrl.split("embed/")[1].split("?")[0].split("/")[0];
    } else {
      const m = videoUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
      if (m && m[1]) videoId = m[1];
    }
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  return fallbackImages[Math.abs(seed) % fallbackImages.length];
};

export const getCategory = (post: any): string => {
  return escapeHtml(
    post?.category ||
      (Array.isArray(post?.categories) && post.categories[0]?.name) ||
      "Berita"
  );
};

export const getExcerpt = (contentOrExcerpt: any, maxLength = 160): string => {
  const raw = String(contentOrExcerpt || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (raw.length <= maxLength) return escapeHtml(raw);
  return escapeHtml(raw.slice(0, maxLength).trim() + "...");
};

export const estimateReadingTime = (content: string): string => {
  const words = String(content || "")
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} menit baca`;
};

export function cleanArticleContent(rawHtml: string): string {
  if (!rawHtml) return "";

  let str = String(rawHtml).trim();

  // 1. Ekstraksi dan pembersihan caption WordPress [caption]...[/caption]
  const captionRegex = /\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/gi;
  str = str.replace(captionRegex, (_match, inner) => {
    const imgMatch = inner.match(/<img[^>]*>/i);
    const captionText = inner.replace(/<[^>]+>/g, "").trim();
    if (imgMatch) {
      return `<figure class="article-figure">${imgMatch[0]}${
        captionText ? `<figcaption class="article-figcaption">${captionText}</figcaption>` : ""
      }</figure>`;
    }
    return captionText ? `<p class="article-caption-text">${captionText}</p>` : "";
  });
  str = str.replace(/\[\/?caption[^\]]*\]/gi, "");

  // 2. Bersihkan embed berbahaya atau iklan
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  str = str.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // 3. Sanitasi tabel ke dalam wrapper responsif
  str = str.replace(
    /(?:<div[^>]*class="[^"]*table-responsive[^"]*"[^>]*>\s*)?(<table[\s\S]*?<\/table>)(?:\s*<\/div>)?/gi,
    (_match, tableHtml) => {
      const cleaned = tableHtml
        .replace(/\s*(width|height)="[^"]*"/gi, "")
        .replace(/style="([^"]*)"/gi, (_m: string, s: string) => {
          const filtered = s.replace(/width\s*:\s*[^;]+;?/gi, "").trim();
          return filtered ? `style="${filtered}"` : "";
        });
      return `<div class="table-responsive">${cleaned}</div>`;
    }
  );

  return str;
}
