export const authLogic = `
    // --- STATE AUTH ---
    token: false,
    userRole: 'editor',
    userName: '',
    userAvatar: '',
    userEmail: '',
    loginForm: { username: '', password: '' },
    isLoggingIn: false,

    // --- SYSTEM INIT ---
    async init() {
        const res = await fetch('/api/users/session');
        if (!res.ok) { this.token = false; return; }
        const data = await res.json();
        this.token = true;
        this.userRole = data.user.role;
        this.userName = data.user.name || data.user.username || '';
        this.userAvatar = data.user.avatar || '';
        this.userEmail = data.user.email || '';
        await this.loadAllData();
    },

    decodeRole() {
        try {
            return;
        } catch (e) { this.userRole = 'editor'; }
    },

    // --- ACTIONS ---
    async doLogin() {
        if(!this.loginForm.username || !this.loginForm.password) return alert('Isi data!');
        this.isLoggingIn = true;
        try {
            let res = await fetch('/api/users/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.loginForm)
            });
            let json = await res.json();
            if(res.ok && json.success) {
                window.location.href = '/admin';
            } else {
                alert('Gagal: ' + (json.error));
            }
        } catch(e) { alert('Error Network'); } finally { this.isLoggingIn = false; }
    },

    async logout(){
        await fetch('/api/users/logout', { method: 'POST' });
        window.location.href = '/admin/login';
    }
`;
