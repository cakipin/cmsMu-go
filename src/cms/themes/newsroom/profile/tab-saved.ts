import { escapeHtml, getPostImage, getPostCategory } from '../utils';

export function renderTabSaved(savedPosts: any[], defaultTab: string): string {
  return `
    <div id="tab-saved-posts" class="nr-profile-tab-content" style="display:${defaultTab === 'saved-posts' ? 'block' : 'none'};">
      <div style="margin-bottom:1.5rem;">
        <h3 style="font-size:1.125rem; font-weight:800; color:var(--text-primary); margin:0;">Rekomendasi Liputan Pilihan</h3>
        <p style="font-size:0.875rem; color:var(--text-secondary); margin:0.25rem 0 0 0;">Kumpulan berita utama terpopuler dari seluruh Indonesia yang disaring untuk Anda.</p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:1.5rem;">
        ${savedPosts.map((p: any) => `
          <article style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:12px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
            <div style="aspect-ratio:16/9; width:100%; background:var(--bg-canvas); overflow:hidden; position:relative;">
              <img src="${getPostImage(p)}" alt="${escapeHtml(p.title)}" style="width:100%; height:100%; object-fit:cover;" loading="lazy">
              <span style="position:absolute; top:0.75rem; left:0.75rem; background:var(--accent-primary); color:#fff; font-size:0.6875rem; font-weight:800; padding:0.2rem 0.6rem; border-radius:4px; text-transform:uppercase;">
                ${escapeHtml(getPostCategory(p))}
              </span>
            </div>
            <div style="padding:1.25rem; display:flex; flex-direction:column; flex:1;">
              <h4 style="font-size:1rem; font-weight:800; color:var(--text-primary); margin:0 0 0.5rem 0; line-height:1.4;">
                <a href="/${escapeHtml(p.slug)}" style="color:inherit; text-decoration:none;">
                  ${escapeHtml(p.title)}
                </a>
              </h4>
              <div style="margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:space-between; font-size:0.75rem; color:var(--text-muted);">
                <span><i class="far fa-eye"></i> ${p.views || 0} pembaca</span>
                <a href="/${escapeHtml(p.slug)}" style="color:var(--accent-primary); font-weight:700; text-decoration:none;">
                  Selengkapnya &rarr;
                </a>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}
