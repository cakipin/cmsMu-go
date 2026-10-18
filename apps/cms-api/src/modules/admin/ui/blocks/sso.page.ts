export const ssoPage = `
<div class="animate-fade" style="padding-bottom:80px;"
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

        getToken() {
            return (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || 
                   (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '') ||
                   (localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '');
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
                    if (window.showToast) window.showToast('Konfigurasi SSO Berhasil Disimpan!', 'success');
                } else {
                    if (window.showToast) window.showToast('Gagal menyimpan konfigurasi SSO.', 'error');
                }
            } catch(e) { if (window.showToast) window.showToast('Error: ' + e.message, 'error'); }
            finally { this.isSaving = false; }
        }
     }">

    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
        <div>
            <h2 class="m-0 text-xl sm:text-2xl font-bold text-slate-800">Setup SSO Muhammadiyah ID</h2>
            <p class="m-0 mt-0.5 text-xs sm:text-sm text-slate-500">Integrasi login satu pintu DiasMu & SSO Pusat.</p>
        </div>
        <button @click="saveSettings()" :disabled="isSaving" 
                class="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white border-0 min-h-[40px] px-5 py-2.5 rounded-xl font-semibold cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 text-xs sm:text-sm">
            <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
            <span x-text="isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'"></span>
        </button>
    </div>

    <div class="bg-white p-4 sm:p-6 border border-slate-200 rounded-2xl max-w-2xl shadow-xs">
        <p class="text-slate-500 text-xs sm:text-sm mt-0 mb-5 leading-relaxed">
            Atur integrasi login menggunakan akun Muhammadiyah ID. Sistem mendukung <strong>dua SSO sekaligus</strong> (DiasMu & SSO Muhammadiyah Pusat) dengan fitur <strong>Auto-Switch deteksi otomatis</strong> dari format Client ID & Secret tanpa perlu memilih dropdown.
        </p>

        <!-- INFO CALLBACK URI DUA SSO -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 mb-5">
            <div class="flex items-center gap-2 mb-1.5">
                <i class="fas fa-link text-teal-600 text-sm"></i>
                <span class="font-bold text-xs sm:text-sm text-slate-900">Redirect / Callback URI Universal</span>
            </div>
            <p class="text-xs text-slate-500 m-0 mb-3 leading-relaxed">
                Daftarkan URL Callback ini pada aplikasi OAuth di portal <a href="https://dias.muhammadiyah.or.id" target="_blank" class="text-teal-600 underline font-semibold">dias.muhammadiyah.or.id</a> maupun <a href="https://sso.muhammadiyah.id" target="_blank" class="text-blue-600 underline font-semibold">sso.muhammadiyah.id</a>:
            </p>
            <div class="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <input type="text" readonly :value="callbackUri" class="w-full py-2 px-3 border border-slate-300 rounded-lg font-mono text-xs bg-white text-slate-900" onclick="this.select()">
                <button type="button" @click="copyCallback()" class="bg-teal-600 hover:bg-teal-700 text-white border-0 min-h-[38px] px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 transition-all shrink-0">
                    <i class="fas" :class="copied ? 'fa-check' : 'fa-copy'"></i>
                    <span x-text="copied ? 'Tersalin!' : 'Salin'"></span>
                </button>
            </div>
        </div>

        <div class="mb-5">
            <label class="block text-xs font-bold mb-1.5 text-slate-700">Aktifkan SSO?</label>
            <select x-model="settings.sso_enabled" class="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
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
