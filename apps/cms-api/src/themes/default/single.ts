import type { ThemeContext } from "../types";
import { _layout } from "./layout";
import {
  escapeHtml,
  formatDate,
  getImage,
  getCategory,
  cleanArticleContent,
  estimateReadingTime,
} from "./utils";

export function renderSingle(ctx: ThemeContext): string {
  const post = ctx?.data || {};
  const title = escapeHtml(post.title || "Artikel");
  const authorName = escapeHtml(post.author || "Redaksi");
  const categoryName = getCategory(post);
  const categorySlug = escapeHtml(
    (post.categorySlug || post.category || "berita")
      .toLowerCase()
      .replace(/\s+/g, "-")
  );
  const publishedDate = formatDate(post.createdAt || post.created_at);
  const rawBody = post.body || post.content || "";
  const readingTime = estimateReadingTime(rawBody);
  const featuredImg = getImage(post, 0);
  const bodyContent = cleanArticleContent(rawBody);
  const tagsList = Array.isArray(post.tags)
    ? post.tags
    : typeof post.tags === "string" && post.tags.trim() !== ""
    ? post.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    : [];
  const relatedPosts = Array.isArray(ctx?.sidebarPosts)
    ? ctx.sidebarPosts
    : Array.isArray((ctx as any)?.relatedPosts)
    ? (ctx as any).relatedPosts
    : [];

  const postUrl = typeof window !== "undefined" ? window.location.href : `/${escapeHtml(post.slug)}`;

  const contentHtml = `
  <div class="container" style="max-width: 900px;">
    
    <!-- BREADCRUMBS -->
    <nav style="display:flex; align-items:center; gap:0.5rem; font-size:0.8125rem; color:var(--text-muted); margin-bottom:1.5rem; flex-wrap:wrap;">
      <a href="/" style="color:var(--text-secondary);"><i class="fas fa-home"></i> Beranda</a>
      <span>/</span>
      <a href="/${categorySlug}" style="color:var(--accent-primary); font-weight:600;">${categoryName}</a>
      <span>/</span>
      <span style="color:var(--text-muted); max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${title}</span>
    </nav>

    <!-- ARTICLE HEADER -->
    <header style="margin-bottom: 2rem;">
      <a href="/${categorySlug}" class="badge" style="margin-bottom: 1rem;">
        ${categoryName}
      </a>
      <h1 style="font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 900; line-height: 1.25; color: var(--text-primary); margin-bottom: 1.25rem;">
        ${title}
      </h1>

      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); padding: 0.85rem 0; font-size: 0.8125rem; color: var(--text-secondary);">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--accent-subtle); color: var(--accent-primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.95rem;">
            ${authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="font-weight: 700; color: var(--text-primary);">${authorName}</div>
            <div style="color: var(--text-muted); font-size: 0.75rem;">Penulis & Kontributor</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem; color: var(--text-muted);">
          <span><i class="far fa-calendar-alt"></i> ${publishedDate}</span>
          <span>&bull;</span>
          <span><i class="far fa-clock"></i> ${readingTime}</span>
          ${post.views ? `<span>&bull;</span><span><i class="far fa-eye"></i> ${post.views} views</span>` : ""}
        </div>
      </div>
    </header>

    <!-- FEATURED IMAGE -->
    ${
      featuredImg
        ? `
    <figure style="margin-bottom: 2.5rem; border-radius: var(--radius-lg); overflow: hidden; background: var(--border-subtle);">
      <img src="${featuredImg}" alt="${title}" style="width: 100%; max-height: 520px; object-fit: cover;">
      ${
        post.caption
          ? `<figcaption style="padding: 0.75rem 1rem; font-size: 0.8125rem; color: var(--text-muted); font-style: italic; background: var(--bg-surface); text-align: center; border-bottom: 1px solid var(--border-subtle);">${escapeHtml(post.caption)}</figcaption>`
          : ""
      }
    </figure>
    `
        : ""
    }

    <!-- ARTICLE BODY -->
    <article class="article-body" style="font-size: 1.1rem; line-height: 1.8; color: var(--text-primary); margin-bottom: 3rem;">
      ${bodyContent}
    </article>

    <!-- TAGS -->
    ${
      tagsList.length > 0
        ? `
    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-subtle);">
      <span style="font-size: 0.875rem; font-weight: 700; color: var(--text-secondary);"><i class="fas fa-tags"></i> Topik:</span>
      ${tagsList
        .map((t: any) => {
          const name = typeof t === "string" ? t : t.name || "";
          const slug =
            typeof t === "object" && t.slug
              ? t.slug
              : String(name)
                  .toLowerCase()
                  .trim()
                  .replace(/[^a-z0-9\s-]/g, "")
                  .replace(/\s+/g, "-");
          return `
        <a href="/tag/${escapeHtml(slug)}" class="badge" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-secondary); text-transform: none;">
          #${escapeHtml(name)}
        </a>
      `;
        })
        .join("")}
    </div>
    `
        : ""
    }

    <!-- SHARE BAR -->
    <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 3rem;">
      <span style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">
        <i class="fas fa-share-alt" style="color: var(--accent-primary);"></i> Bagikan Tulisan Ini:
      </span>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + " " + postUrl)}" target="_blank" rel="noopener" style="background: #25d366; color: #fff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem;" title="Bagikan ke WhatsApp">
          <i class="fab fa-whatsapp"></i>
        </a>
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}" target="_blank" rel="noopener" style="background: #0f1419; color: #fff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem;" title="Bagikan ke X">
          <i class="fab fa-x-twitter"></i>
        </a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}" target="_blank" rel="noopener" style="background: #1877f2; color: #fff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem;" title="Bagikan ke Facebook">
          <i class="fab fa-facebook-f"></i>
        </a>
        <button type="button" onclick="var b=this; navigator.clipboard.writeText(window.location.href).then(function(){ b.innerHTML='<i class=\'fas fa-check\'></i>'; b.style.background='#0d9488'; b.style.color='#fff'; setTimeout(function(){ b.innerHTML='<i class=\'fas fa-link\'></i>'; b.style.background='var(--border-subtle)'; b.style.color='var(--text-primary)'; }, 2000); });" style="background: var(--border-subtle); color: var(--text-primary); border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" title="Salin Tautan">
          <i class="fas fa-link"></i>
        </button>
      </div>
    </div>

    <!-- RELATED POSTS (IF ANY) -->
    ${
      relatedPosts.length > 0
        ? `
    <section style="margin-top: 3.5rem; border-top: 2px solid var(--border-subtle); padding-top: 2rem;">
      <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 1.5rem; border-left: 4px solid var(--accent-primary); padding-left: 0.75rem;">
        Tulisan Terkait
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem;">
        ${relatedPosts
          .slice(0, 3)
          .map(
            (r: any, idx: number) => `
          <article class="post-card">
            <a href="/${escapeHtml(r.slug)}" style="overflow:hidden;">
              <img src="${getImage(r, idx + 5)}" alt="${escapeHtml(r.title)}" class="post-card-thumb" loading="lazy">
            </a>
            <div class="post-card-body">
              <span class="badge">${getCategory(r)}</span>
              <a href="/${escapeHtml(r.slug)}">
                <h4 class="post-card-title" style="font-size: 1rem;">${escapeHtml(r.title)}</h4>
              </a>
              <div class="post-card-meta">
                <span>${formatDate(r.createdAt || r.created_at)}</span>
              </div>
            </div>
          </article>
        `
          )
          .join("")}
      </div>
    </section>
    `
        : ""
    }

  </div>

  <style>
    .article-body p {
      margin-bottom: 1.5rem;
    }
    .article-body h2 {
      font-size: 1.6rem;
      font-weight: 800;
      margin: 2.25rem 0 1rem;
      color: var(--text-primary);
    }
    .article-body h3 {
      font-size: 1.35rem;
      font-weight: 700;
      margin: 1.75rem 0 0.75rem;
      color: var(--text-primary);
    }
    .article-body blockquote {
      border-left: 4px solid var(--accent-primary);
      padding: 1rem 1.5rem;
      background: var(--bg-surface);
      border-radius: var(--radius-sm);
      font-style: italic;
      color: var(--text-secondary);
      margin: 2rem 0;
    }
    .article-body ul, .article-body ol {
      margin: 1.5rem 0 1.5rem 1.5rem;
    }
    .article-body li {
      margin-bottom: 0.5rem;
    }
    .article-body img {
      border-radius: var(--radius-md);
      margin: 1.5rem auto;
      max-width: 100%;
    }
    .table-responsive {
      width: 100%;
      overflow-x: auto;
      margin: 1.5rem 0;
    }
    .table-responsive table {
      width: 100%;
      border-collapse: collapse;
    }
    .table-responsive th, .table-responsive td {
      border: 1px solid var(--border-subtle);
      padding: 0.75rem;
      font-size: 0.9rem;
    }
  </style>
  `;

  return _layout(contentHtml, post.title || "Artikel", ctx, "single");
}
