import { escapeHtml } from '../utils';

export function renderProfileHeader(
  user: any,
  displayName: string,
  username: string,
  role: string,
  avatarUrl: string,
  initial: string,
  isAuthor: boolean,
  isCurator: boolean
): string {
  return `
    <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:16px; padding:2rem; box-shadow:0 4px 20px rgba(0,0,0,0.04); margin-bottom:2rem;">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1.5rem;">
        <div style="display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap;">
          <!-- Avatar Circle -->
          <div style="width:76px; height:76px; border-radius:50%; overflow:hidden; border:3px solid var(--accent-primary); flex-shrink:0; background:var(--accent-primary); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(2,132,199,0.25);">
            ${avatarUrl ? `
              <img src="${avatarUrl}" alt="${displayName}" style="width:100%; height:100%; object-fit:cover;" onerror="this.outerHTML='<span style=\\'color:#fff; font-size:30px; font-weight:800;\\'>${initial}</span>'">
            ` : `
              <span style="color:#ffffff; font-size:30px; font-weight:800;">${initial}</span>
            `}
          </div>

          <!-- User Details -->
          <div>
            <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
              <h1 style="font-size:1.5rem; font-weight:800; color:var(--text-primary); margin:0; line-height:1.2;">
                ${displayName}
              </h1>
              <span style="background:var(--accent-badge); color:var(--accent-primary); font-size:0.6875rem; font-weight:800; padding:0.25rem 0.625rem; border-radius:9999px; text-transform:uppercase; letter-spacing:0.05em; border:1px solid var(--border-subtle);">
                ${role.toUpperCase()}
              </span>
            </div>
            <div style="font-size:0.875rem; color:var(--text-muted); margin-top:0.35rem;">
              @${username} ${user.email ? `&bull; ${escapeHtml(user.email)}` : ''}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          ${(role === 'admin' || role === 'superadmin') ? `
            <a href="/admin/newsroom" class="nr-action-btn" style="background:var(--accent-primary); color:#ffffff; border-color:var(--accent-primary); padding:0.55rem 1rem; font-size:0.875rem; font-weight:700; border-radius:8px; text-decoration:none; display:inline-flex; align-items:center; gap:0.5rem;">
              <i class="fas fa-layer-group"></i> Meja Redaksi
            </a>
          ` : ''}
          ${isAuthor ? `
            <button type="button" onclick="openAuthorEditor()" class="nr-action-btn" style="background:var(--bg-canvas); color:var(--text-primary); border:1px solid var(--border-strong); padding:0.55rem 1rem; font-size:0.875rem; font-weight:700; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; gap:0.5rem;">
              <i class="fas fa-feather-alt"></i> Tulis Berita
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}
