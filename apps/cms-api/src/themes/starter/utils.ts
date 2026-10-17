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

export const getImage = (post: any): string => {
  const custom = post?.featuredImage || post?.featured_image || post?.image;
  if (custom && String(custom).trim() !== "") return escapeHtml(custom);
  return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
};

export const getCategory = (post: any): string => {
  return escapeHtml(
    post?.category ||
      (Array.isArray(post?.categories) && post.categories[0]?.name) ||
      "Umum"
  );
};

export const getExcerpt = (contentOrExcerpt: any, maxLength = 140): string => {
  const raw = String(contentOrExcerpt || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (raw.length <= maxLength) return escapeHtml(raw);
  return escapeHtml(raw.slice(0, maxLength).trim() + "...");
};
