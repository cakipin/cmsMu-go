import type { ThemeContext } from "../types";
import { _layout } from "./layout";
import { escapeHtml, formatDate, getImage, getCategory, getExcerpt } from "./utils";

export function renderUserProfile(ctx: ThemeContext): string {
  const profileUser = (ctx as any)?.profileUser || {};
  const name = escapeHtml(profileUser.name || profileUser.username || "Pengguna");
  const username = escapeHtml(profileUser.username || "");
  const role = escapeHtml(profileUser.role || "Kontributor");
  const avatar = profileUser.avatar ? escapeHtml(profileUser.avatar) : "";
  const joinedDate = formatDate(profileUser.createdAt);

  const posts = Array.isArray((ctx as any)?.authorPosts)
    ? (ctx as any).authorPosts
    : Array.isArray(ctx?.data)
    ? ctx.data
    : [];

  const contentHtml = `
  <div class="container" style="max-width: 960px;">
    
    <!-- AUTHOR PROFILE HEADER CARD -->
    <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 2rem; margin-bottom: 2.5rem; display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
      <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--accent-subtle); color: var(--accent-primary); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; border: 2px solid var(--accent-primary); overflow: hidden; flex-shrink: 0;">
        ${
          avatar
            ? `<img src="${avatar}" alt="${name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.outerHTML='<span>${name.charAt(0).toUpperCase()}</span>'">`
            : `<span>${name.charAt(0).toUpperCase()}</span>`
        }
      </div>

      <div style="flex: 1; min-width: 240px;">
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.25rem;">
          <h1 style="font-size: 1.5rem; font-weight: 900; color: var(--text-primary); margin: 0;">${name}</h1>
          <span class="badge">${role}</span>
        </div>
        <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">@${username}</p>
        <div style="font-size: 0.8125rem; color: var(--text-secondary); display: flex; gap: 1rem; align-items: center;">
          <span><i class="far fa-calendar-alt"></i> Bergabung: ${joinedDate || "Aktif"}</span>
          <span><i class="fas fa-file-alt"></i> ${posts.length} Tulisan</span>
        </div>
      </div>
    </div>

    <!-- POSTS BY AUTHOR -->
    <section>
      <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 1.5rem; border-left: 4px solid var(--accent-primary); padding-left: 0.75rem;">
        Tulisan oleh ${name}
      </h2>

      ${
        posts.length === 0
          ? `
        <div style="padding: 3rem; text-align: center; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md);">
          <p style="color: var(--text-muted); font-size: 0.95rem;">Penulis ini belum memiliki tulisan yang diterbitkan.</p>
        </div>
        `
          : `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
          ${posts
            .map(
              (p: any, idx: number) => `
            <article class="post-card">
              <a href="/${escapeHtml(p.slug)}" style="overflow:hidden;">
                <img src="${getImage(p, idx)}" alt="${escapeHtml(p.title)}" class="post-card-thumb" loading="lazy">
              </a>
              <div class="post-card-body">
                <span class="badge">${getCategory(p)}</span>
                <a href="/${escapeHtml(p.slug)}">
                  <h3 class="post-card-title">${escapeHtml(p.title)}</h3>
                </a>
                <p class="post-card-excerpt">${getExcerpt(p.excerpt || p.content, 110)}</p>
                <div class="post-card-meta">
                  <span class="meta-author-date">
                    <i class="far fa-calendar-alt"></i> ${formatDate(p.createdAt || p.created_at)}
                  </span>
                  ${p.views ? `<span><i class="far fa-eye"></i> ${p.views}</span>` : ""}
                </div>
              </div>
            </article>
          `
            )
            .join("")}
        </div>
        `
      }
    </section>

  </div>
  `;

  return _layout(contentHtml, `Profil ${name}`, ctx, "profile");
}
