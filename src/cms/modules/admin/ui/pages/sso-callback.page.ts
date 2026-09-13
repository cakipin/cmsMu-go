export const ssoCallbackPage = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Memverifikasi Otorisasi SSO...</title>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body style="margin: 0; padding: 0;">
<div style="position: fixed; inset: 0; background: #f8fafc; z-index: 99999; display: grid !important; place-items: center;"
     x-data="{
        statusMsg: 'Memverifikasi akun Anda...',
        errorMsg: '',
        
        async init() {
            try {
                // Ambil kode otorisasi dari URL
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                
                if (!code) {
                    throw new Error('Kode otorisasi tidak ditemukan di URL.');
                }

                // Kirim kode ke backend untuk ditukar dengan token
                const redirectUri = \`\${window.location.origin}/admin/sso/callback\`;
                
                const res = await fetch('/api/users/sso', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, redirectUri }) 
                });

                const text = await res.text();
                let data;
                
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    throw new Error('Respon server bukan JSON valid: ' + text.substring(0, 30));
                }

                if (!res.ok) {
                    throw new Error(data.error || data.message || 'Gagal masuk (Status ' + res.status + ')');
                }
                
                if (data.token) {
                    // Simpan token ke cookie dan bersihkan localStorage
                    document.cookie = 'labmu_token=' + encodeURIComponent(data.token) + '; Path=/; Max-Age=2592000; SameSite=Lax';
                    try { localStorage.removeItem('labmu_token'); localStorage.removeItem('admin_token'); } catch(e){}
                    
                    this.statusMsg = 'Berhasil masuk! Mengalihkan...';
                    
                    setTimeout(() => {
                        const returnUrl = sessionStorage.getItem('sso_return_url');
                        if (returnUrl) {
                            sessionStorage.removeItem('sso_return_url');
                            window.location.href = returnUrl;
                            return;
                        }
                        const role = (data.user?.role || 'subscriber').toLowerCase();
                        if (role === 'superadmin' || role === 'admin') {
                            window.location.href = '/admin'; // Dashboard khusus superadmin & admin
                        } else {
                            window.location.href = '/@' + encodeURIComponent(data.user?.username || 'me'); // Profil & Meja Kerja theme untuk peran lainnya
                        }
                    }, 1000);
                } else {
                    throw new Error('Token tidak ditemukan dalam respon server');
                }

            } catch (e) {
                console.error('[SSO Error]:', e);
                this.errorMsg = e.message; 
                this.statusMsg = '';
            }
        }
     }">

    <div style="width: 100%; max-width: 400px; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; text-align: center;">
        
        <div x-show="statusMsg" style="margin-bottom: 20px;">
            <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #0f172a; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="color: #64748b; margin-top: 20px; font-weight: 600;" x-text="statusMsg"></p>
        </div>

        <div x-show="errorMsg" style="display: none;">
            <div style="color: #ef4444; font-size: 40px; margin-bottom: 15px;">⚠️</div>
            <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 20px;">Gagal Masuk</h3>
            <div style="background:#fee2e2; color:#991b1b; padding:12px; margin-bottom:20px; border-radius:6px; font-size:13px; border:1px solid #fca5a5; word-break: break-word;" 
                 x-text="errorMsg"></div>
            
            <a href="/admin" style="display: inline-block; padding: 10px 20px; background: #0f172a; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Kembali ke Halaman Login</a>
        </div>

        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    </div>
</div>
</body>
</html>
`;
