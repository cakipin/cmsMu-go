export const ssoPage = `
<div x-show="view === 'sso-setup'" class="animate-fade" style="padding-bottom:80px;"
     x-data="{
        isLoading: false,
        isSaving: false,
        callbackUri: window.location.origin + '/admin/sso/callback',
        copied: false,
        copyCallback() {
            navigator.clipboard.writeText(this.callbackUri);
            this.copied = true;
            setTimeout(() => { this.copied = false; }, 2000);
        },
        settings: { 
            sso_enabled: 'false', 
            sso_client_id: '',
            sso_client_secret: ''
        },

        get detectedProvider() {
            const id = (this.settings.sso_client_id || '').trim();
            if (!id) return null;
            if (id.startsWith('client_') || id.toLowerCase().includes('dias')) {
                return {
                    name: 'DiasMu (dias.muhammadiyah.or.id)',
                    type: 'diasmu',
                    badgeBg: '#ecfdf5',
                    badgeBorder: '#a7f3d0',
                    badgeText: '#065f46',
                    icon: 'fa-shield-halved',
                    desc: 'Aplikasi terdaftar pada portal developer DiasMu'
                };
            }
            return {
                name: 'Muhammadiyah ID Pusat (sso.muhammadiyah.id)',
                type: 'sso_pusat',
                badgeBg: '#eff6ff',
                badgeBorder: '#bfdbfe',
                badgeText: '#1e40af',
                icon: 'fa-id-card',
                desc: 'Aplikasi terdaftar pada server SSO Muhammadiyah ID Pusat'
            };
        },

        getToken() {
            return (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || 
                   (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '') ||
                   (localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '');
        },

        async init() {
            this.isLoading = true;
            const token = this.getToken();
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
            const token = this.getToken();
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
                style="background:#0d9488; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px;" class="shadow-sm hover:opacity-90 transition-all">
            <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
            <span x-text="isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'"></span>
        </button>
    </div>

    <div style="background:white; padding:25px; border:1px solid #e2e8f0; border-radius:12px; max-width:640px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
        <p style="color:#64748b; font-size:14px; margin-top:0; margin-bottom:20px; line-height:1.5;">
            Atur integrasi login menggunakan akun Muhammadiyah ID. Sistem mendukung <strong>dua SSO sekaligus</strong> (DiasMu & SSO Muhammadiyah Pusat) dengan fitur <strong>Auto-Switch deteksi otomatis</strong> dari format Client ID & Secret tanpa perlu memilih dropdown.
        </p>

        <!-- INFO CALLBACK URI DUA SSO -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin-bottom:24px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <i class="fas fa-link" style="color:#0d9488; font-size:15px;"></i>
                <span style="font-weight:700; font-size:14px; color:#0f172a;">Redirect / Callback URI Universal</span>
            </div>
            <p style="font-size:12px; color:#64748b; margin:0 0 10px 0; line-height:1.5;">
                Daftarkan URL Callback ini pada aplikasi OAuth di portal <a href="https://dias.muhammadiyah.or.id" target="_blank" style="color:#0d9488; text-decoration:underline; font-weight:600;">dias.muhammadiyah.or.id</a> maupun <a href="https://sso.muhammadiyah.id" target="_blank" style="color:#2563eb; text-decoration:underline; font-weight:600;">sso.muhammadiyah.id</a>:
            </p>
            <div style="display:flex; gap:8px; align-items:center;">
                <input type="text" readonly :value="callbackUri" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:6px; font-family:monospace; font-size:13px; background:#ffffff; color:#0f172a;" onclick="this.select()">
                <button type="button" @click="copyCallback()" style="background:#0d9488; color:#fff; border:none; padding:9px 16px; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:6px; white-space:nowrap;">
                    <i class="fas" :class="copied ? 'fa-check' : 'fa-copy'"></i>
                    <span x-text="copied ? 'Tersalin!' : 'Salin'"></span>
                </button>
            </div>
        </div>

        <div style="margin-bottom:20px;">
            <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#334155;">Aktifkan SSO?</label>
            <select x-model="settings.sso_enabled" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; box-sizing:border-box; background:white; font-size:14px;">
                <option value="false">Tidak Aktif</option>
                <option value="true">Aktif</option>
            </select>
        </div>

        <div style="margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <label style="font-size:13px; font-weight:600; color:#334155;">Client ID / App Key</label>
                <!-- Badge Auto Deteksi -->
                <template x-if="detectedProvider">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
                          :style="'background:' + detectedProvider.badgeBg + '; border:1px solid ' + detectedProvider.badgeBorder + '; color:' + detectedProvider.badgeText">
                        <i class="fas" :class="detectedProvider.icon"></i>
                        <span x-text="'Auto-Detect: ' + detectedProvider.name"></span>
                    </span>
                </template>
            </div>
            <input type="text" x-model="settings.sso_client_id" placeholder="Misal: client_svRBFbrf9AK7GMPAAOMZrXRa atau ID aplikasi SSO Pusat" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; box-sizing:border-box; font-size:14px;">
            <template x-if="detectedProvider">
                <p style="font-size:12px; margin:5px 0 0 0;" :style="'color:' + detectedProvider.badgeText" x-text="'✓ ' + detectedProvider.desc"></p>
            </template>
            <template x-if="!detectedProvider">
                <p style="font-size:12px; color:#94a3b8; margin:5px 0 0 0;">Mendukung format ID DiasMu (prefix client_...) atau SSO Pusat (ID numerik/Passport string).</p>
            </template>
        </div>

        <div style="margin-bottom:20px;">
            <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#334155;">Client Secret (Opsional jika diset via Env Vars)</label>
            <input type="password" x-model="settings.sso_client_secret" placeholder="••••••••••••••••" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; box-sizing:border-box; font-size:14px;">
            <p style="font-size:12px; color:#64748b; margin-top:5px;">Biarkan kosong jika sudah diatur melalui Cloudflare Environment Variables (SSO_CLIENT_SECRET).</p>
        </div>
        
    </div>
</div>
`;
