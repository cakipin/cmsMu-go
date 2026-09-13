export function renderProfileTabs(
  defaultTab: string,
  isCurator: boolean,
  authorPostsCount: number,
  curationItemsCount: number,
  savedPostsCount: number
): string {
  return `
    <div style="display:flex; gap:0.5rem; border-bottom:2px solid var(--border-subtle); margin-bottom:2rem; overflow-x:auto; padding-bottom:2px;">
      <!-- Tab 1: Berita Kiriman Penulis -->
      <button type="button" class="nr-profile-tab ${defaultTab === 'author-posts' ? 'active' : ''}" onclick="switchProfileTab('author-posts', this)" style="padding:0.65rem 1.25rem; border:none; background:none; font-size:0.875rem; font-weight:700; cursor:pointer; color:${defaultTab === 'author-posts' ? 'var(--accent-primary)' : 'var(--text-secondary)'}; border-bottom:3px solid ${defaultTab === 'author-posts' ? 'var(--accent-primary)' : 'transparent'}; margin-bottom:-2px; white-space:nowrap; display:inline-flex; align-items:center; gap:0.5rem;">
        <i class="far fa-newspaper"></i> Berita & Tulisan Saya
        <span style="background:var(--bg-canvas); border:1px solid var(--border-subtle); font-size:0.75rem; padding:0.1rem 0.5rem; border-radius:9999px;">${authorPostsCount}</span>
      </button>

      <!-- Tab 2: Meja Kurasi (Jika Kurator / Redaksi / Admin) -->
      ${isCurator ? `
        <button type="button" class="nr-profile-tab ${defaultTab === 'curation-queue' ? 'active' : ''}" onclick="switchProfileTab('curation-queue', this)" style="padding:0.65rem 1.25rem; border:none; background:none; font-size:0.875rem; font-weight:700; cursor:pointer; color:${defaultTab === 'curation-queue' ? 'var(--accent-primary)' : 'var(--text-secondary)'}; border-bottom:3px solid ${defaultTab === 'curation-queue' ? 'var(--accent-primary)' : 'transparent'}; margin-bottom:-2px; white-space:nowrap; display:inline-flex; align-items:center; gap:0.5rem;">
          <i class="fas fa-clipboard-check"></i> Antrean Kurasi Berita
          <span style="background:var(--bg-canvas); border:1px solid var(--border-subtle); font-size:0.75rem; padding:0.1rem 0.5rem; border-radius:9999px;">${curationItemsCount}</span>
        </button>
      ` : ''}

      <!-- Tab 3: Rekomendasi / Tersimpan (Untuk Pembaca / Subscriber) -->
      <button type="button" class="nr-profile-tab ${defaultTab === 'saved-posts' ? 'active' : ''}" onclick="switchProfileTab('saved-posts', this)" style="padding:0.65rem 1.25rem; border:none; background:none; font-size:0.875rem; font-weight:700; cursor:pointer; color:${defaultTab === 'saved-posts' ? 'var(--accent-primary)' : 'var(--text-secondary)'}; border-bottom:3px solid ${defaultTab === 'saved-posts' ? 'var(--accent-primary)' : 'transparent'}; margin-bottom:-2px; white-space:nowrap; display:inline-flex; align-items:center; gap:0.5rem;">
        <i class="far fa-bookmark"></i> Rekomendasi Bacaan
        <span style="background:var(--bg-canvas); border:1px solid var(--border-subtle); font-size:0.75rem; padding:0.1rem 0.5rem; border-radius:9999px;">${savedPostsCount}</span>
      </button>

      <!-- Tab 4: Pengaturan Akun & Profil (Owner Only) -->
      <button type="button" id="tab-btn-settings" class="nr-profile-tab" onclick="switchProfileTab('settings', this)" style="padding:0.65rem 1.25rem; border:none; background:none; font-size:0.875rem; font-weight:700; cursor:pointer; color:var(--text-secondary); border-bottom:3px solid transparent; margin-bottom:-2px; white-space:nowrap; display:inline-flex; align-items:center; gap:0.5rem;">
        <i class="fas fa-cog"></i> Pengaturan Akun
      </button>
    </div>
  `;
}
