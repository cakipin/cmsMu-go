import { escapeHtml, formatDateIndo } from '../utils';

export function renderTabCuration(curationItems: any[], isCurator: boolean, defaultTab: string): string {
  if (!isCurator) return '';

  return `
    <div id="tab-curation-queue" class="nr-profile-tab-content" style="display:${defaultTab === 'curation-queue' ? 'block' : 'none'};">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
        <div>
          <h3 style="font-size:1.125rem; font-weight:800; color:var(--text-primary); margin:0;">Meja Kurasi Berita Jejaring</h3>
          <p style="font-size:0.875rem; color:var(--text-secondary); margin:0.25rem 0 0 0;">Feed berita terbaru dari media anggota yang siap diverifikasi dan diterbitkan.</p>
        </div>
        <a href="/admin/newsroom" style="background:var(--accent-primary); color:#ffffff; font-size:0.8125rem; font-weight:700; padding:0.5rem 1rem; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem;">
          <i class="fas fa-external-link-alt"></i> Buka Meja Redaksi Penuh
        </a>
      </div>

      ${!curationItems.length ? `
        <div style="text-align:center; padding:3.5rem 1rem; background:var(--bg-surface); border:1px dashed var(--border-strong); border-radius:12px;">
          <i class="fas fa-check-circle" style="font-size:2.5rem; color:var(--accent-primary); margin-bottom:0.75rem; display:block;"></i>
          <h4 style="font-size:1rem; font-weight:700; color:var(--text-primary); margin:0 0 0.25rem 0;">Antrean Kurasi Bersih</h4>
          <p style="font-size:0.875rem; color:var(--text-muted); margin:0;">Seluruh berita sindikasi telah diproses oleh redaksi.</p>
        </div>
      ` : `
        <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:12px; overflow:hidden;">
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:0.875rem; text-align:left;">
              <thead>
                <tr style="background:var(--bg-canvas); border-bottom:2px solid var(--border-subtle); color:var(--text-secondary);">
                  <th style="padding:0.75rem 1rem;">Sumber Media</th>
                  <th style="padding:0.75rem 1rem;">Judul Berita</th>
                  <th style="padding:0.75rem 1rem;">Kategori Default</th>
                  <th style="padding:0.75rem 1rem;">Status</th>
                  <th style="padding:0.75rem 1rem; text-align:right;">Aksi Kurasi</th>
                </tr>
              </thead>
              <tbody>
                ${curationItems.map((q: any) => `
                  <tr style="border-bottom:1px solid var(--border-subtle);">
                    <td style="padding:0.75rem 1rem; font-weight:700; color:var(--text-primary); white-space:nowrap;">
                      <span style="background:var(--bg-canvas); border:1px solid var(--border-subtle); padding:0.2rem 0.5rem; border-radius:4px; font-size:0.75rem;">
                        ${escapeHtml(q.source_name || 'Portal Media')}
                      </span>
                    </td>
                    <td style="padding:0.75rem 1rem; color:var(--text-primary); font-weight:600;">
                      <div style="max-width:400px; line-height:1.4;">
                        ${escapeHtml(q.raw_title || '')}
                      </div>
                      <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">
                        ${formatDateIndo(q.created_at)}
                      </div>
                    </td>
                    <td style="padding:0.75rem 1rem; color:var(--text-secondary); font-size:0.8125rem;">
                      ${escapeHtml(q.default_category || 'Berita Daerah')}
                    </td>
                    <td style="padding:0.75rem 1rem;">
                      <span style="background:${q.status === 'published' ? '#d1fae5' : '#fef3c7'}; color:${q.status === 'published' ? '#065f46' : '#92400e'}; font-size:0.6875rem; font-weight:800; padding:0.2rem 0.5rem; border-radius:9999px; text-transform:uppercase;">
                        ${escapeHtml(q.status || 'pending')}
                      </span>
                    </td>
                    <td style="padding:0.75rem 1rem; text-align:right; white-space:nowrap;">
                      <a href="/admin/newsroom" style="background:var(--accent-primary); color:#ffffff; font-size:0.75rem; font-weight:700; padding:0.35rem 0.75rem; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:0.3rem;">
                        <i class="fas fa-edit"></i> Review & Terbitkan
                      </a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `}
    </div>
  `;
}
