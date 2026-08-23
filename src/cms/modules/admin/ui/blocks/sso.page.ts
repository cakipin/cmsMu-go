export const ssoPage = `
<div x-show="view === 'sso-setup'" class="animate-fade" style="padding-bottom:80px;"
     x-data="{
        isLoading: false,
        isSaving: false,
        settings: {
            sso_enabled: 'false',
            sso_client_id: '',
            sso_client_secret: ''
        },

        async init() {
            this.isLoading = true;
            const token = '';
            try {
                const res = await fetch('/api/settings/admin', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if(res.ok) {
                    const json = await res.json();
                    const data = json.data || json;
                    // Hanya override key yang relevan
                    if(data.sso_enabled !== undefined) this.settings.sso_enabled = data.sso_enabled;
                    if(data.sso_client_id !== undefined) this.settings.sso_client_id = data.sso_client_id;
                    if(data.sso_client_secret !== undefined) this.settings.sso_client_secret = data.sso_client_secret;
                }
            } catch(e) { console.error('Gagal load SSO settings', e); }
            finally { this.isLoading = false; }
        },

        async saveSettings() {
            this.isSaving = true;
            const token = '';
            try {
                const res = await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify(this.settings)
                });

                if(res.ok) {
                    alert('✅ Konfigurasi SSO Berhasil Disimpan!');
                } else {
                    alert('❌ Gagal menyimpan.');
                }
            } catch(e) { alert('Error: ' + e.message); }
            finally { this.isSaving = false; }
        }
     }">

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="margin:0; font-size:24px; color:#1f2937;">Setup SSO Muhammadiyah ID</h2>
        <button @click="saveSettings()" :disabled="isSaving"
                style="background:#2563eb; color:white; border:none; padding:10px 20px; border-radius:6px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px;">
            <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
            <span x-text="isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'"></span>
        </button>
    </div>

    <div style="background:white; padding:25px; border:1px solid #e5e7eb; border-radius:8px; max-width:600px;">
        <p style="color:#4b5563; font-size:14px; margin-top:0; margin-bottom:20px;">
            Atur integrasi login menggunakan akun Muhammadiyah ID via OAuth2.
        </p>

        <div style="margin-bottom:20px;">
            <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#4b5563;">Aktifkan SSO?</label>
            <select x-model="settings.sso_enabled" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box; background:white;">
                <option value="false">Tidak Aktif</option>
                <option value="true">Aktif</option>
            </select>
        </div>

        <div style="margin-bottom:20px;">
            <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#4b5563;">Client ID</label>
            <input type="text" x-model="settings.sso_client_id" placeholder="Misal: client_svRBFbrf9AK7GMPAAOMZrXRa" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box;">
        </div>

        <div style="margin-bottom:20px;">
            <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#4b5563;">Client Secret (Opsional jika diset via Env Vars)</label>
            <input type="password" x-model="settings.sso_client_secret" placeholder="********" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box;">
            <p style="font-size:12px; color:#6b7280; margin-top:5px;">Biarkan kosong jika sudah diatur melalui Cloudflare Environment Variables (SSO_CLIENT_SECRET).</p>
        </div>

    </div>
</div>
`;
