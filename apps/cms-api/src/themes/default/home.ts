import type { ThemeContext } from "../types";
import { _layout } from "./layout";
import { escapeHtml, formatDate, getImage, getCategory, getExcerpt } from "./utils";

export function renderHome(ctx: ThemeContext): string {
  const structured = ctx?.data || {};
  const heroPosts = Array.isArray(structured.heroPosts) ? structured.heroPosts : [];
  const regularPosts = Array.isArray(structured.regularPosts) ? structured.regularPosts : [];
  const popularPosts = Array.isArray(structured.popularPosts) ? structured.popularPosts : [];
  const latestPosts = Array.isArray(structured.latest) ? structured.latest : [...heroPosts, ...regularPosts];

  const mainHero = heroPosts[0] || latestPosts[0] || null;
  const subHeroes = heroPosts.slice(1, 5);
  const feedPosts = regularPosts.length > 0 ? regularPosts : latestPosts.slice(5);

  const categories = Array.isArray(ctx?.categories) ? ctx.categories : [];
  const topics = Array.isArray(ctx?.topics) ? ctx.topics : [];

  const pagination = ctx?.pagination || { page: 1, totalPages: 1 };

  const contentHtml = `
  <div class="container">
    
    <!-- HERO SECTION -->
    ${
      mainHero
        ? `
    <section style="margin-bottom: 2.5rem;">
      <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;" class="hero-grid">
          
          <!-- MAIN FEATURED POST -->
          <article class="post-card" style="position: relative; border-radius: var(--radius-lg); overflow: hidden;">
            <a href="/${escapeHtml(mainHero.slug)}" style="display:block; position:relative; overflow:hidden; aspect-ratio:16/9;">
              <img src="${getImage(mainHero, 0)}" alt="${escapeHtml(mainHero.title)}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
              <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);"></div>
              <div style="position:absolute; bottom:0; left:0; right:0; padding:1.5rem; color:#ffffff;">
                <span class="badge" style="background:var(--accent-primary); color:#ffffff; margin-bottom:0.75rem;">
                  ${getCategory(mainHero)}
                </span>
                <h2 style="font-size: clamp(1.25rem, 2.5vw, 1.85rem); font-weight:800; line-height:1.3; margin-bottom:0.75rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                  ${escapeHtml(mainHero.title)}
                </h2>
                <p style="font-size:0.875rem; opacity:0.9; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-bottom:0.75rem;">
                  ${getExcerpt(mainHero.excerpt || mainHero.content, 140)}
                </p>
                <div style="display:flex; align-items:center; gap:0.75rem; font-size:0.75rem; opacity:0.8;">
                  <span><i class="far fa-user"></i> ${escapeHtml(mainHero.author || "Redaksi")}</span>
                  <span>&bull;</span>
                  <span><i class="far fa-calendar-alt"></i> ${formatDate(mainHero.createdAt)}</span>
                </div>
              </div>
            </a>
          </article>

          <!-- SUB HEROES GRID (IF ANY) -->
          ${
            subHeroes.length > 0
              ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem;">
            ${subHeroes
              .map(
                (post: any, idx: number) => `
              <article class="post-card">
                <a href="/${escapeHtml(post.slug)}" style="overflow:hidden;">
                  <img src="${getImage(post, idx + 1)}" alt="${escapeHtml(post.title)}" class="post-card-thumb" style="transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                </a>
                <div class="post-card-body">
                  <span class="badge">${getCategory(post)}</span>
                  <a href="/${escapeHtml(post.slug)}">
                    <h3 class="post-card-title">${escapeHtml(post.title)}</h3>
                  </a>
                  <p class="post-card-excerpt">${getExcerpt(post.excerpt || post.content, 90)}</p>
                  <div class="post-card-meta">
                    <span class="meta-author-date"><i class="far fa-calendar-alt"></i> ${formatDate(post.createdAt)}</span>
                    ${post.views ? `<span><i class="far fa-eye"></i> ${post.views}</span>` : ""}
                  </div>
                </div>
              </article>
            `
              )
              .join("")}
          </div>
          `
              : ""
          }

        </div>
      </div>
    </section>
    `
        : ""
    }

    <!-- 2 COLUMNS: FEED & SIDEBAR -->
    <div style="display: grid; grid-template-columns: 1fr; gap: 2.5rem;" class="main-layout-grid">
      
      <!-- LEFT: FEED -->
      <section>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; border-bottom:2px solid var(--border-subtle); padding-bottom:0.75rem;">
          <h2 style="font-size:1.25rem; font-weight:800; color:var(--text-primary); border-left:4px solid var(--accent-primary); padding-left:0.75rem;">
            Artikel Terkini
          </h2>
          <span style="font-size:0.8125rem; color:var(--text-muted);">Halaman ${pagination.page} dari ${pagination.totalPages}</span>
        </div>

        ${
          feedPosts.length === 0
            ? `<div style="padding:3rem; text-align:center; background:var(--bg-surface); border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
                <i class="fas fa-newspaper" style="font-size:2.5rem; color:var(--text-muted); margin-bottom:1rem;"></i>
                <h3 style="font-size:1.1rem; color:var(--text-primary); margin-bottom:0.5rem;">Belum Ada Artikel</h3>
                <p style="font-size:0.875rem; color:var(--text-secondary);">Artikel terbaru yang diterbitkan akan muncul secara otomatis di sini.</p>
              </div>`
            : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
            ${feedPosts
              .map(
                (post: any, idx: number) => `
              <article class="post-card">
                <a href="/${escapeHtml(post.slug)}" style="overflow:hidden;">
                  <img src="${getImage(post, idx + 10)}" alt="${escapeHtml(post.title)}" class="post-card-thumb" loading="lazy">
                </a>
                <div class="post-card-body">
                  <span class="badge">${getCategory(post)}</span>
                  <a href="/${escapeHtml(post.slug)}">
                    <h3 class="post-card-title">${escapeHtml(post.title)}</h3>
                  </a>
                  <p class="post-card-excerpt">${getExcerpt(post.excerpt || post.content, 110)}</p>
                  <div class="post-card-meta">
                    <span class="meta-author-date">
                      <i class="far fa-user"></i> ${escapeHtml(post.author || "Redaksi")}
                    </span>
                    <span class="meta-author-date">
                      <i class="far fa-calendar-alt"></i> ${formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>
              </article>
            `
              )
              .join("")}
          </div>

          <!-- PAGINATION -->
          ${
            pagination.totalPages > 1
              ? `
          <div style="display:flex; justify-content:center; align-items:center; gap:0.5rem; margin-top:2.5rem;">
            ${
              pagination.page > 1
                ? `<a href="/?page=${pagination.page - 1}" style="padding:0.5rem 1rem; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); font-size:0.875rem; font-weight:600;"><i class="fas fa-chevron-left"></i> Sebelumnya</a>`
                : ""
            }
            <span style="padding:0.5rem 1rem; background:var(--accent-subtle); color:var(--accent-primary); border-radius:var(--radius-sm); font-size:0.875rem; font-weight:700;">
              ${pagination.page} / ${pagination.totalPages}
            </span>
            ${
              pagination.page < pagination.totalPages
                ? `<a href="/?page=${pagination.page + 1}" style="padding:0.5rem 1rem; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); font-size:0.875rem; font-weight:600;">Selanjutnya <i class="fas fa-chevron-right"></i></a>`
                : ""
            }
          </div>
          `
              : ""
          }
        `
        }
      </section>

      <!-- RIGHT: SIDEBAR -->
      <aside style="display: flex; flex-direction: column; gap: 2rem;">
        
        <!-- POPULAR POSTS WIDGET -->
        ${
          popularPosts.length > 0
            ? `
        <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:1.5rem;">
          <h3 style="font-size:1.05rem; font-weight:800; color:var(--text-primary); margin-bottom:1.25rem; border-left:3px solid var(--accent-primary); padding-left:0.5rem;">
            🔥 Terpopuler
          </h3>
          <div style="display:flex; flex-direction:column; gap:1rem;">
            ${popularPosts
              .map(
                (p: any, idx: number) => `
              <div style="display:flex; gap:0.75rem; align-items:flex-start;">
                <span style="font-size:1.25rem; font-weight:900; color:var(--accent-primary); line-height:1; min-width:24px;">0${idx + 1}</span>
                <div style="flex:1;">
                  <a href="/${escapeHtml(p.slug)}" style="font-size:0.875rem; font-weight:700; color:var(--text-primary); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                    ${escapeHtml(p.title)}
                  </a>
                  <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.75rem; color:var(--text-muted); margin-top:0.35rem;">
                    <span>${formatDate(p.createdAt)}</span>
                    ${p.views ? `<span>&bull; ${p.views} views</span>` : ""}
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        `
            : ""
        }

        <!-- CATEGORIES WIDGET -->
        ${
          categories.length > 0
            ? `
        <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:1.5rem;">
          <h3 style="font-size:1.05rem; font-weight:800; color:var(--text-primary); margin-bottom:1rem; border-left:3px solid var(--accent-primary); padding-left:0.5rem;">
            Kategori
          </h3>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem;">
            ${categories
              .map(
                (c: any) => `
              <li>
                <a href="/category/${escapeHtml(c.slug)}" style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0.65rem; border-radius:var(--radius-sm); font-size:0.875rem; font-weight:600; color:var(--text-secondary); transition:all 0.2s;" onmouseover="this.style.background='var(--accent-subtle)'; this.style.color='var(--accent-primary)'" onmouseout="this.style.background='none'; this.style.color='var(--text-secondary)'">
                  <span>${escapeHtml(c.name || c.title)}</span>
                  <i class="fas fa-chevron-right" style="font-size:0.75rem; color:var(--text-muted);"></i>
                </a>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
        `
            : ""
        }

        <!-- TOPICS TAGS WIDGET -->
        ${
          topics.length > 0
            ? `
        <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:1.5rem;">
          <h3 style="font-size:1.05rem; font-weight:800; color:var(--text-primary); margin-bottom:1rem; border-left:3px solid var(--accent-primary); padding-left:0.5rem;">
            Topik Pilihan
          </h3>
          <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
            ${topics
              .map(
                (t: any) => `
              <a href="/tag/${escapeHtml(t.slug || t.name)}" style="display:inline-block; padding:0.35rem 0.75rem; border:1px solid var(--border-subtle); border-radius:9999px; font-size:0.75rem; font-weight:600; color:var(--text-secondary); transition:all 0.2s;" onmouseover="this.style.borderColor='var(--accent-primary)'; this.style.color='var(--accent-primary)'" onmouseout="this.style.borderColor='var(--border-subtle)'; this.style.color='var(--text-secondary)'">
                #${escapeHtml(t.name || t.title)}
              </a>
            `
              )
              .join("")}
          </div>
        </div>
        `
            : ""
        }

      </aside>

    </div>

  </div>

  <style>
    @media (min-width: 992px) {
      .main-layout-grid {
        grid-template-columns: 2.3fr 1fr !important;
      }
    }
  </style>
  `;

  return _layout(contentHtml, "", ctx, "home");
}
