export const authLogic = `
    // --- STATE AUTH ---
    token: localStorage.getItem('labmu_token') || '',
    userRole: 'editor',
    userName: '',
    userAvatar: '',
    userEmail: '',
    loginForm: { username: '', password: '' },
    isLoggingIn: false,

    // --- SYSTEM INIT ---
    init() { 
        if(this.token) { 
            this.decodeRole(); 
            this.loadAllData(); 
        } 
    },
    
    decodeRole() { 
        try { 
            if (!this.token) return; 
            if (this.token.startsWith('labmu_v1.')) { 
                const base64 = this.token.split('.')[1]; 
                const json = JSON.parse(window.atob(base64)); 
                this.userRole = json.r || 'editor'; 
            } else { 
                // Fallback untuk token JWT standar kalau nanti pakai
                try { 
                    let base64 = this.token;
                    if (this.token.includes('.')) {
                        base64 = this.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'); 
                    }
                    const payload = JSON.parse(window.atob(base64));
                    this.userRole = payload.role || 'editor'; 
                    this.userName = payload.n || '';
                    this.userAvatar = payload.a || '';
                    this.userEmail = payload.email || '';
                } catch(e) { this.userRole = 'editor'; } 
            } 
        } catch (e) { this.userRole = 'editor'; } 
    },

    // --- ACTIONS ---
    async doLogin() { 
        if(!this.loginForm.username || !this.loginForm.password) {
            if (window.showToast) window.showToast('Harap isi username dan password!', 'warning');
            return;
        }
        this.isLoggingIn = true; 
        try { 
            let res = await fetch('/api/users/login', { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify(this.loginForm) 
            }); 
            let json = await res.json(); 
            if(res.ok && json.token) { 
                this.token = json.token; 
                localStorage.setItem('labmu_token', this.token); 
                this.decodeRole(); 
                this.init(); 
                window.location.reload(); 
            } else { 
                if (window.showToast) window.showToast('Gagal: ' + (json.error || 'Login gagal'), 'error'); 
            } 
        } catch(e) { if (window.showToast) window.showToast('Error Network', 'error'); } finally { this.isLoggingIn = false; } 
    },
    
    logout(){ 
        localStorage.removeItem('labmu_token'); 
        window.location.reload(); 
    }
`;
