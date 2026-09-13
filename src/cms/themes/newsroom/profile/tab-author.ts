import { escapeHtml, formatDateIndo, getPostImage, getPostCategory } from '../utils';

export function renderTabAuthor(authorPosts: any[], isAuthor: boolean, defaultTab: string): string {
  return `
    <div id="tab-author-posts" class="nr-profile-tab-content" style="display:${defaultTab === 'author-posts' ? 'block' : 'none'};">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
        <div>
          <h3 style="font-size:1.125rem; font-weight:800; color:var(--text-primary); margin:0;">Karya Berita & Artikel Terpublikasi</h3>
          <p style="font-size:0.875rem; color:var(--text-secondary); margin:0.25rem 0 0 0;">Daftar berita, opini, dan liputan yang Anda tulis untuk jaringan Newsroom.</p>
        </div>
        ${isAuthor ? `
          <button type="button" onclick="openAuthorEditor()" style="background:var(--accent-primary); color:#ffffff; font-size:0.8125rem; font-weight:700; padding:0.5rem 1rem; border-radius:6px; border:none; cursor:pointer; display:inline-flex; align-items:center; gap:0.4rem; box-shadow:0 2px 6px rgba(2,132,199,0.25);">
            <i class="fas fa-plus"></i> Buat Naskah Baru
          </button>
        ` : ''}
      </div>

      ${!authorPosts.length ? `
        <div style="text-align:center; padding:3.5rem 1rem; background:var(--bg-surface); border:1px dashed var(--border-strong); border-radius:12px;">
          <i class="far fa-newspaper" style="font-size:2.5rem; color:var(--text-muted); margin-bottom:0.75rem; display:block;"></i>
          <h4 style="font-size:1rem; font-weight:700; color:var(--text-primary); margin:0 0 0.25rem 0;">Belum Ada Berita yang Diterbitkan</h4>
          <p style="font-size:0.875rem; color:var(--text-muted); margin:0;">Karya tulis dan liputan berita Anda akan tercantum di sini setelah ditinjau redaksi.</p>
        </div>
      ` : `
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:1.5rem;">
          ${authorPosts.map((p: any) => `
            <article style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:12px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 2px 10px rgba(0,0,0,0.02); transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
              <div style="aspect-ratio:16/9; width:100%; background:var(--bg-canvas); overflow:hidden; position:relative;">
                <img src="${getPostImage(p)}" alt="${escapeHtml(p.title)}" style="width:100%; height:100%; object-fit:cover;" loading="lazy">
                <span style="position:absolute; top:0.75rem; left:0.75rem; background:var(--accent-primary); color:#fff; font-size:0.6875rem; font-weight:800; padding:0.2rem 0.6rem; border-radius:4px; text-transform:uppercase;">
                  ${escapeHtml(getPostCategory(p))}
                </span>
                <span style="position:absolute; bottom:0.75rem; right:0.75rem; background:rgba(0,0,0,0.7); color:#fff; font-size:0.6875rem; font-weight:700; padding:0.2rem 0.5rem; border-radius:4px;">
                  <i class="far fa-eye"></i> ${p.views || 0}
                </span>
              </div>
              <div style="padding:1.25rem; display:flex; flex-direction:column; flex:1;">
                <h4 style="font-size:1rem; font-weight:800; color:var(--text-primary); margin:0 0 0.5rem 0; line-height:1.4;">
                  <a href="/${escapeHtml(p.slug)}" style="color:inherit; text-decoration:none;">
                    ${escapeHtml(p.title)}
                  </a>
                </h4>
                ${p.excerpt ? `
                  <p style="font-size:0.8125rem; color:var(--text-secondary); margin:0 0 1rem 0; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                    ${escapeHtml(p.excerpt)}
                  </p>
                ` : ''}
                <div style="margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:space-between; font-size:0.75rem; color:var(--text-muted);">
                  <span><i class="far fa-clock"></i> ${formatDateIndo(p.createdAt || p.created_at)}</span>
                  <a href="/${escapeHtml(p.slug)}" style="color:var(--accent-primary); font-weight:700; text-decoration:none;">
                    Baca Naskah &rarr;
                  </a>
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      `}
    </div>
  `;
}
