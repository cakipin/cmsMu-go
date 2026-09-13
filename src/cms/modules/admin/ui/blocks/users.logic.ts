export const usersLogic = `
    isLoadingUsers: false,
    showUserModal: false,
    editingUserId: null, 
    // TAMBAHKAN EMAIL DI SINI
    userForm: { username:'', password:'', name:'', email:'', role:'editor' },
    usersList: [],

    async loadUsers() {
        this.isLoadingUsers = true;
        try {
            let res = await fetch('/api/users', { 
                headers: { 'Authorization': this.token } 
            });

            // 1. Cek Login Kadaluwarsa
            if(res.status === 401) return this.logout();

            // 2. Cek kalau server lagi Error 500
            if(!res.ok) {
                const errorText = await res.text(); // Ambil teks "Internal Server Error"
                console.error("D1 Ngamuk:", errorText);
                return; // Berhenti di sini, jangan lanjut ke res.json()
            }

            // 3. Kalau OK, baru proses JSON
            let json = await res.json();
            if(json.success) {
                this.usersList = json.data || [];
            }
        } catch(e) { 
            console.error("Gagal koneksi ke API Users:", e); 
        } finally { 
            this.isLoadingUsers = false; 
        }
    },

    openAddUser() {
        this.editingUserId = null;
        // Reset form termasuk email dan kuota
        this.userForm = { 
            username: '', 
            password: '', 
            name: '', 
            email: '', 
            role: 'subscriber', 
            subscription_plan: '1_bulan', 
            subscription_expires_date: '' 
        };
        this.applyPlanDuration();
        this.showUserModal = true;
    },

    applyPlanDuration() {
        const plan = this.userForm.subscription_plan;
        if (plan === 'custom') return;
        const now = new Date();
        let months = 1;
        if (plan === '3_bulan') months = 3;
        else if (plan === '6_bulan') months = 6;
        else if (plan === '1_tahun') months = 12;
        now.setMonth(now.getMonth() + months);
        this.userForm.subscription_expires_date = now.toISOString().split('T')[0];
    },

    editUser(u) {
        this.editingUserId = u.id;
        const expDate = u.subscription_expires_at ? u.subscription_expires_at.split('T')[0] : '';
        this.userForm = { 
            username: u.username, 
            name: u.name, 
            email: u.email || '', 
            role: u.role, 
            password: '',
            subscription_plan: u.subscription_plan || '1_bulan',
            subscription_expires_date: expDate
        };
        if (u.role === 'subscriber_pro' && !expDate) {
            this.applyPlanDuration();
        }
        this.showUserModal = true;
    },

    async saveUser() {
       if(!this.userForm.username) return alert('Username wajib diisi');
       if(!this.editingUserId && !this.userForm.password) return alert('Password wajib untuk user baru');
       
       try {
          const url = this.editingUserId ? ('/api/users/' + this.editingUserId) : '/api/users';
          const method = this.editingUserId ? 'PUT' : 'POST';

          const payload = { ...this.userForm };
          if (payload.role === 'subscriber_pro') {
              if (payload.subscription_expires_date) {
                  payload.subscription_expires_at = new Date(payload.subscription_expires_date + 'T23:59:59.000Z').toISOString();
              }
          } else {
              payload.subscription_plan = null;
              payload.subscription_expires_at = null;
          }

          let res = await fetch(url, {
             method: method,
             headers: { 'Content-Type':'application/json', 'Authorization': this.token },
             body: JSON.stringify(payload)
          });

          let json = await res.json();
          if(json.success) {
             this.showUserModal = false;
             this.loadUsers(); 
             alert('Data User Tersimpan!');
          } else {
             alert('Gagal: ' + json.error);
          }
       } catch(e) { alert('Error network: ' + e.message); }
    },

    async deleteUser(id) {
       if(!confirm('Hapus user ini?')) return;
       try {
          await fetch('/api/users/' + id, { method: 'DELETE', headers: { 'Authorization': this.token } });
          this.loadUsers();
       } catch(e) { alert('Gagal hapus'); }
    },
`;