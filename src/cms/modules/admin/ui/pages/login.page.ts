export const loginPage = `
<div style="position: fixed; inset: 0; background: linear-gradient(135deg, #327f2b, #d86c35); z-index: 99999; overflow-y: auto; display:flex; align-items:center; justify-content:center;"
     x-data="{
        loginForm: { username: '', password: '' }, // Gunakan nama unik agar tidak bentrok dengan state global
        showPassword: false,
        isLoading: false,
        errorMsg: '',
        hasExistingSession: !!(window.getCmsToken ? window.getCmsToken() : ''),
        ssoPluginActive: true,
        
        async init() {
            try {
                const pRes = await fetch('/api/plugins');
                if (pRes.ok) {
                    const pJson = await pRes.json();
                    const list = pJson.data || pJson || [];
                    const ssoPlugin = list.find((p: any) => p.id === 'sso-muhammadiyah');
                    if (ssoPlugin && Number(ssoPlugin.active) === 0) {
                        this.ssoPluginActive = false;
                    }
                }
            } catch(e) {}
        },
        
        async submitLogin() {
            if (this.isLoading) return;
            this.isLoading = true; 
            this.errorMsg = '';
            
            try {
                // 1. Fetch ke backend (Endpoint pastikan sesuai dengan app.ts)
                const res = await fetch('/api/users/login', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.loginForm) 
                });

                const text = await res.text();
                let data;
                
                // 2. Coba parse JSON
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    throw new Error('Respon server bukan JSON valid: ' + text.substring(0, 30));
                }

                // 3. Cek apakah status OK
                if (!res.ok) {
                    throw new Error(data.error || data.message || 'Gagal masuk (Status ' + res.status + ')');
                }
                
                // 4. Jika Sukses
                if (data.token) {
                    // Simpan token ke Cookie dan bersihkan localStorage
                    if (window.setCmsToken) {
                        window.setCmsToken(data.token);
                    } else {
                        document.cookie = 'labmu_token=' + encodeURIComponent(data.token) + '; Path=/; Max-Age=2592000; SameSite=Lax';
                        try { if (window.__origLsRemove) window.__origLsRemove.call(window.localStorage, 'labmu_token'); } catch(e) {}
                    }
                    this.token = data.token;
                    
                    // Force redirect ke dashboard atau profil publik sesuai role
                    setTimeout(() => {
                        const r = String(data.user?.role || '').toLowerCase();
                        if (r === 'superadmin' || r === 'admin') {
                            window.location.replace('/admin');
                        } else {
                            window.location.replace('/@' + encodeURIComponent(data.user?.username || 'me'));
                        }
                    }, 50);
                } else {
                    throw new Error('Token tidak ditemukan dalam respon server');
                }

            } catch (e) {
                console.error('[Login Error]:', e);
                this.errorMsg = e.message; 
            } finally {
                this.isLoading = false;
            }
        },
        async loginSso() {
            if (this.isLoading) return;
            if (!this.ssoPluginActive) {
                alert('Plugin SSO Muhammadiyah ID sedang dinonaktifkan oleh Administrator.');
                return;
            }
            this.isLoading = true;
            this.errorMsg = '';

            try {
                // Ambil Client ID dari pengaturan sistem
                const res = await fetch('/api/settings?t=' + Date.now());
                if (!res.ok) {
                    throw new Error('Gagal memuat pengaturan SSO (Status ' + res.status + ')');
                }
                const json = await res.json();
                const config = json.data || json;

                if (config.sso_enabled === 'false') {
                    alert('SSO Muhammadiyah ID sedang dinonaktifkan oleh Administrator.');
                    this.isLoading = false;
                    return;
                }

                const clientId = config.sso_client_id ? config.sso_client_id.trim() : '';

                if (!clientId) {
                    alert('SSO Muhammadiyah ID belum dikonfigurasi oleh Admin (Client ID kosong).');
                    this.isLoading = false;
                    return;
                }

                const redirectUri = \`\${window.location.origin}/admin/sso/callback\`;
                
                // Auto-Switch Endpoint Authorize berdasarkan format Client ID
                let authBase = 'https://sso.muhammadiyah.id/oauth/authorize';
                let providerHint = 'sso_pusat';

                if (clientId.startsWith('client_') || clientId.toLowerCase().includes('dias')) {
                    authBase = 'https://dias.muhammadiyah.or.id/oauth/authorize';
                    providerHint = 'diasmu';
                }

                try {
                    sessionStorage.setItem('sso_provider_hint', providerHint);
                } catch(e) {}

                const authorizeUrl = \`\${authBase}?client_id=\${encodeURIComponent(clientId)}&redirect_uri=\${encodeURIComponent(redirectUri)}&response_type=code\`;
                window.location.href = authorizeUrl;
            } catch(e) {
                alert('Gagal inisialisasi SSO: ' + e.message);
                this.isLoading = false;
            }
        }
     }">

    <div style="position: relative; width: 100%; max-width: 420px; background: white; padding: 36px; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); border: none; margin: 20px;">
        <div style="text-align:center; margin-bottom:24px;">
             <a href="/" style="text-decoration:none;">
                 <h2 style="color: #0284c7; margin: 0 0 6px 0; font-size: 28px; font-weight: 900; letter-spacing: -0.03em;">NewsRoom</h2>
             </a>
             <p style="color: #64748b; margin-top: 5px; font-size: 14px; font-weight: 500;">Masuk ke Dashboard Pengelola</p>
        </div>

        <template x-if="hasExistingSession">
            <div style="margin-bottom: 18px; padding: 10px 12px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; font-size: 12px; color: #92400e; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span><i class="fas fa-info-circle"></i> Sesi sebelumnya aktif. Masuk di bawah untuk mengganti akun.</span>
                <button type="button" @click="if (window.setCmsToken) window.setCmsToken(''); else document.cookie = 'labmu_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax'; try { localStorage.removeItem('labmu_token'); localStorage.removeItem('admin_token'); } catch(e){} hasExistingSession = false;" style="background: #b45309; color: #fff; border: none; border-radius: 4px; padding: 3px 8px; font-size: 11px; cursor: pointer; font-weight: 600; white-space: nowrap;">Reset</button>
            </div>
        </template>
        
        <div x-show="errorMsg" 
             x-transition
             style="background:#fee2e2; color:#991b1b; padding:12px; margin-bottom:20px; border-radius:6px; font-size:13px; border:1px solid #fca5a5; word-break: break-word;" 
             x-text="errorMsg"></div>

        <form @submit.prevent="submitLogin">
            <div style="margin-bottom: 18px;">
                <label style="display:block; font-weight:600; margin-bottom:6px; font-size:13px; color:#334155;">Username / Email</label>
                <input type="text" 
                       x-model="loginForm.username" 
                       style="width:100%; padding:11px 14px; border:1px solid #cbd5e1; border-radius:8px; box-sizing:border-box; font-size:14px;" 
                       required 
                       placeholder="Username, email, atau nama...">
            </div>
            <div style="margin-bottom: 25px;">
                <label style="display:block; font-weight:600; margin-bottom:8px; font-size:14px; color:#334155;">Password</label>
                <div style="position: relative;">
                    <input :type="showPassword ? 'text' : 'password'" 
                           x-model="loginForm.password" 
                           style="width:100%; padding:12px 42px 12px 14px; border:1px solid #cbd5e1; border-radius:8px; box-sizing:border-box; font-size:15px;" 
                           required 
                           placeholder="••••••••">
                    <button type="button" 
                            @click="showPassword = !showPassword"
                            style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #64748b; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; font-size: 15px;"
                            :title="showPassword ? 'Sembunyikan password' : 'Lihat password'">
                        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                </div>
            </div>
            <button type="submit" 
                    :disabled="isLoading"
                    class="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-md shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-0 flex items-center justify-center gap-2 text-sm">
                <i x-show="isLoading" class="fas fa-spinner fa-spin"></i>
                <span x-text="isLoading ? 'Memproses...' : 'Masuk'"></span>
            </button>
        </form>

        <template x-if="ssoPluginActive">
            <div>
                <div style="margin: 20px 0; text-align: center; position: relative;">
                    <hr style="border: 0; border-top: 1px solid #e2e8f0;">
                    <span style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: white; padding: 0 10px; color: #64748b; font-size: 13px;">atau</span>
                </div>

                <button type="button"
                        @click="loginSso()"
                        :disabled="isLoading"
                        class="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-2.5 text-sm shadow-sm">
                    <img src="https://dias.muhammadiyah.or.id/logo.png" alt="Muhammadiyah ID" class="h-5 w-auto" onerror="this.style.display='none'">
                    <span>Masuk dengan Muhammadiyah ID</span>
                </button>
            </div>
        </template>
    </div>
</div>
`;