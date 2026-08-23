export const loginPage = `
<div x-show="!token"
     style="position: fixed; inset: 0; background: #f8fafc; z-index: 99999; display: grid !important; place-items: center;"
     x-data="{
        loginForm: { username: '', password: '' }, // Gunakan nama unik agar tidak bentrok dengan state global
        isLoading: false,
        errorMsg: '',

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
                if (data.success) {
                    // Beri jeda kecil agar user melihat status sukses sebelum reload
                    setTimeout(() => {
                        window.location.href = '/admin'; // Force ke dashboard
                    }, 100);
                } else {
                    throw new Error('Sesi tidak berhasil dibuat');
                }

            } catch (e) {
                console.error('[Login Error]:', e);
                this.errorMsg = e.message;
            } finally {
                this.isLoading = false;
            }
        },
        async loginSso() {
            this.isLoading = true;
            try {
                let clientId = 'client_Vi7MFYiz4A85AjwwyDK81DW8'; // Default fallback lpek
                const res = await fetch('/api/settings?t=' + Date.now());
                if (res.ok) {
                    const json = await res.json();
                    const data = json.data || json;
                    if (data.sso_enabled === 'false') {
                        alert('SSO sedang dinonaktifkan.');
                        this.isLoading = false;
                        return;
                    }
                    if (data.sso_client_id) {
                        clientId = data.sso_client_id;
                    }
                }
                const redirectUri = \`\${window.location.origin}/admin/sso/callback\`;
                const authorizeUrl = \`https://dias.muhammadiyah.or.id/oauth/authorize?client_id=\${clientId}&redirect_uri=\${encodeURIComponent(redirectUri)}&response_type=code\`;
                window.location.href = authorizeUrl;
            } catch(e) {
                alert('Gagal inisialisasi SSO');
                this.isLoading = false;
            }
        }
     }">

    <div data-login-card style="box-sizing:border-box; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:calc(100% - 32px); max-width:400px; max-height:calc(100dvh - 32px); overflow-y:auto; background:white; padding:40px; border-radius:12px; box-shadow:0 10px 25px -5px rgba(0,0,0,0.1); border:1px solid #e2e8f0;">
        <div style="text-align:center; margin-bottom:30px;">
             <h2 style="color: #1e293b; margin: 0; font-size: 24px; font-weight: 800;">LabMu Login</h2>
             <p style="color: #64748b; margin-top: 5px; font-size: 14px;">Masuk ke Dashboard Admin</p>
        </div>

        <div x-show="errorMsg"
             x-transition
             style="background:#fee2e2; color:#991b1b; padding:12px; margin-bottom:20px; border-radius:6px; font-size:13px; border:1px solid #fca5a5; word-break: break-word;"
             x-text="errorMsg"></div>

        <form @submit.prevent="submitLogin">
            <div style="margin-bottom: 20px;">
                <label style="display:block; font-weight:600; margin-bottom:8px; font-size:14px; color:#334155;">Username</label>
                <input type="text"
                       x-model="loginForm.username"
                       style="width:100%; padding:12px; border:1px solid #cbd5e1; border-radius:8px; box-sizing:border-box; font-size:15px;"
                       required
                       placeholder="Masukkan username">
            </div>
            <div style="margin-bottom: 25px;">
                <label style="display:block; font-weight:600; margin-bottom:8px; font-size:14px; color:#334155;">Password</label>
                <input type="password"
                       x-model="loginForm.password"
                       style="width:100%; padding:12px; border:1px solid #cbd5e1; border-radius:8px; box-sizing:border-box; font-size:15px;"
                       required
                       placeholder="••••••••">
            </div>
            <button type="submit"
                    style="width:100%; padding:14px; background:#0f172a; color:white; border:none; border-radius:8px; font-weight:700; cursor:pointer; font-size:15px; transition: all 0.2s;"
                    :style="isLoading ? 'opacity: 0.7; cursor: not-allowed;' : ''"
                    :disabled="isLoading">
                <span x-text="isLoading ? 'Memproses...' : 'Masuk'"></span>
            </button>
        </form>

        <div style="margin: 20px 0; text-align: center; position: relative;">
            <hr style="border: 0; border-top: 1px solid #e2e8f0;">
            <span style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: white; padding: 0 10px; color: #64748b; font-size: 13px;">atau</span>
        </div>

        <button type="button"
                @click="loginSso()"
                style="width:100%; padding:14px; background:#f8fafc; color:#0f172a; border:1px solid #cbd5e1; border-radius:8px; font-weight:600; cursor:pointer; font-size:15px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;">
            <img src="https://dias.muhammadiyah.or.id/logo.png" alt="Muhammadiyah ID" style="height: 20px;" onerror="this.style.display='none'">
            Masuk dengan Muhammadiyah ID
        </button>
    </div>
</div>
`;
