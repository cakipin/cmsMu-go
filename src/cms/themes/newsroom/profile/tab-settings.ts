import { escapeHtml } from "../utils";

export function renderTabSettings(
  user: any,
  displayName: string,
  avatarUrl: string,
  initial: string
): string {
  return `
    <div id="tab-settings" class="nr-profile-tab-content" style="display:none;">
      <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:12px; padding:2rem; max-width:680px; margin:0 auto;">
        <h3 style="font-size:1.125rem; font-weight:800; color:var(--text-primary); margin:0 0 0.5rem 0;">Perbarui Informasi Akun</h3>
        <p style="font-size:0.875rem; color:var(--text-secondary); margin:0 0 1.5rem 0;">Kelola nama profil, username, email, foto avatar (maksimal 1MB), dan kata sandi akun Anda.</p>

        <div id="profile-alert" style="display:none; padding:0.75rem 1rem; border-radius:8px; margin-bottom:1.25rem; font-size:0.875rem; font-weight:600;"></div>

        <form id="public-profile-form" onsubmit="handleUpdateProfile(event)" style="display:flex; flex-direction:column; gap:1.25rem;">
          <!-- Foto Avatar Upload (Maksimal 1MB) -->
          <div>
            <label style="display:block; font-size:0.8125rem; font-weight:700; color:var(--text-primary); margin-bottom:0.5rem;">Foto Profil (Avatar)</label>
            <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
              <div id="avatar-preview-box" style="width:72px; height:72px; border-radius:50%; overflow:hidden; border:2px solid var(--accent-primary); background:var(--bg-canvas); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <img id="avatar-preview-img" src="${avatarUrl || ""}" alt="Avatar" style="width:100%; height:100%; object-fit:cover; ${!avatarUrl ? "display:none;" : ""}" onerror="this.style.display='none'; document.getElementById('avatar-preview-fallback').style.display='block';">
                <span id="avatar-preview-fallback" style="font-size:1.6rem; font-weight:800; color:var(--accent-primary); ${avatarUrl ? "display:none;" : ""}">${initial}</span>
              </div>
              <div style="flex:1; min-width:220px;">
                <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                  <label for="prof-avatar-file" style="display:inline-flex; align-items:center; gap:0.4rem; background:var(--bg-canvas); border:1px solid var(--border-strong); padding:0.5rem 0.9rem; border-radius:8px; font-size:0.8125rem; font-weight:600; color:var(--text-primary); cursor:pointer;">
                    <i class="far fa-folder-open"></i> Pilih Berkas Foto
                  </label>
                  <input type="file" id="prof-avatar-file" accept="image/jpeg,image/png,image/webp" style="display:none;" onchange="handleAvatarFileSelect(this)">
                  <span id="avatar-upload-status" style="font-size:0.75rem; color:var(--text-muted);">Maksimal 1 MB (JPG, PNG, WebP)</span>
                </div>
                <input type="hidden" id="prof-avatar" value="${avatarUrl}">
              </div>
            </div>
          </div>

          <!-- Username -->
          <div>
            <label style="display:block; font-size:0.8125rem; font-weight:700; color:var(--text-primary); margin-bottom:0.4rem;">Username Akun (@username)</label>
            <div style="display:flex; align-items:center; border:1px solid var(--border-strong); border-radius:8px; overflow:hidden; background:var(--bg-canvas);">
              <span style="padding:0.6rem 0.9rem; background:var(--bg-surface); border-right:1px solid var(--border-strong); color:var(--accent-primary); font-weight:800; font-size:0.875rem;">@</span>
              <input type="text" id="prof-username" value="${escapeHtml(user.username || "")}" required style="width:100%; padding:0.6rem 0.9rem; border:none; font-size:0.875rem; background:transparent; color:var(--text-primary); outline:none;" placeholder="contoh: cakipin atau zainal.arifin">
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">Gunakan huruf kecil, angka, titik, atau garis bawah tanpa spasi. Link profil: <strong id="preview-profile-url">/@${escapeHtml(user.username || "")}</strong></div>
          </div>

          <!-- Nama Lengkap -->
          <div>
            <label style="display:block; font-size:0.8125rem; font-weight:700; color:var(--text-primary); margin-bottom:0.4rem;">Nama Lengkap</label>
            <input type="text" id="prof-name" value="${displayName}" required style="width:100%; padding:0.6rem 0.9rem; border:1px solid var(--border-strong); border-radius:8px; font-size:0.875rem; background:var(--bg-canvas); color:var(--text-primary); box-sizing:border-box;">
          </div>

          <!-- Email -->
          <div>
            <label style="display:block; font-size:0.8125rem; font-weight:700; color:var(--text-primary); margin-bottom:0.4rem;">Alamat Email</label>
            <input type="email" id="prof-email" value="${escapeHtml(user.email || "")}" style="width:100%; padding:0.6rem 0.9rem; border:1px solid var(--border-strong); border-radius:8px; font-size:0.875rem; background:var(--bg-canvas); color:var(--text-primary); box-sizing:border-box;">
          </div>

          <button type="submit" id="btn-save-profile" style="background:var(--accent-primary); color:#ffffff; padding:0.7rem 1.5rem; border:none; border-radius:8px; font-size:0.875rem; font-weight:700; cursor:pointer; align-self:flex-start;">
            Simpan Perubahan
          </button>
        </form>

        <hr style="border:none; border-top:1px solid var(--border-subtle); margin:2rem 0;">

        <h4 style="font-size:1rem; font-weight:800; color:var(--text-primary); margin:0 0 0.4rem 0;">Perbarui Kata Sandi</h4>
        <p style="font-size:0.8125rem; color:var(--text-secondary); margin:0 0 1rem 0;">Masukkan password baru jika Anda ingin memperbarui keamanan akun Anda.</p>

        <form id="public-password-form" onsubmit="handleChangePassword(event)" style="display:flex; flex-direction:column; gap:1rem;">
          <div>
            <label style="display:block; font-size:0.8125rem; font-weight:700; color:var(--text-primary); margin-bottom:0.4rem;">Password Saat Ini</label>
            <input type="password" id="prof-old-pass" required placeholder="Masukkan password saat ini" style="width:100%; padding:0.6rem 0.9rem; border:1px solid var(--border-strong); border-radius:8px; font-size:0.875rem; background:var(--bg-canvas); color:var(--text-primary); box-sizing:border-box;">
          </div>
          <div>
            <label style="display:block; font-size:0.8125rem; font-weight:700; color:var(--text-primary); margin-bottom:0.4rem;">Password Baru</label>
            <input type="password" id="prof-new-pass" required placeholder="Minimal 6 karakter" minlength="6" style="width:100%; padding:0.6rem 0.9rem; border:1px solid var(--border-strong); border-radius:8px; font-size:0.875rem; background:var(--bg-canvas); color:var(--text-primary); box-sizing:border-box;">
          </div>
          <button type="submit" id="btn-save-pass" style="background:var(--bg-canvas); color:var(--text-primary); border:1px solid var(--border-strong); padding:0.65rem 1.25rem; border-radius:8px; font-size:0.875rem; font-weight:700; cursor:pointer; align-self:flex-start;">
            Perbarui Password
          </button>
        </form>
      </div>
    </div>
  `;
}
