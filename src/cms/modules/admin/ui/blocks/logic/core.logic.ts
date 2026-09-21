/**
 * ⚙️ CORE LOGIC (Settings, Users, Themes, Menus)
 * Didesain agar independen dari konteks `this` yang ketat.
 */

export const coreLogic = {
    // Helper Internal: Wrapper Fetch yang Aman
    async _fetch(url: string, options: any = {}) {
        const token = (typeof window !== 'undefined' && (window as any).getCmsToken ? (window as any).getCmsToken() : '') || (typeof localStorage !== 'undefined' ? localStorage.getItem('labmu_token') : '');
        const headers = {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };
        
        // Cek jika ada fungsi apiFetch global dari CMS wrapper
        // @ts-ignore
        if (typeof this.apiFetch === 'function') {
            // @ts-ignore
            return this.apiFetch(url, options);
        }

        // Fallback fetch manual
        const res = await fetch(url, { ...options, headers });
        if (res.status === 401) {
            localStorage.removeItem('labmu_token');
            window.location.href = '/admin/login';
            throw new Error('Unauthorized');
        }
        return res;
    },

    // =========================================
    // 1. SETTINGS & THEMES
    // =========================================
    
    async loadSettings() {
        try {
            const res = await this._fetch("/api/settings");
            const json = await res.json();
            // Merge agar tidak menimpa state lokal jika API partial
            this.settings = { ...this.settings, ...(json.data || json || {}) };
        } catch(e) { 
            console.error("Gagal load settings", e);
        }
    },

    async saveSettings() {
        this.isSavingSettings = true;
        try {
            const res = await this._fetch("/api/settings", {
                method: "POST",
                body: JSON.stringify(this.settings),
            });
            if (res.ok) alert("Pengaturan berhasil disimpan!");
        } catch(e: any) {
            alert("Gagal menyimpan pengaturan: " + e.message);
        } finally {
            this.isSavingSettings = false;
        }
    },

    // --- Media Selector Logic (Tetap Stable) ---
    openLogoSelector(targetField: any) {
        this.mediaSelectorTarget = targetField; 
        this.view = 'media'; 
    },

    selectSettingImage(url: string) {
        if (this.mediaSelectorTarget) {
            this.settings[this.mediaSelectorTarget] = url;
            this.mediaSelectorTarget = null;
            this.view = 'settings';
        }
    },

    // --- Themes ---
    availableThemes: [],
    async loadThemes() {
        try {
            const res = await this._fetch("/api/theme");
            const json = await res.json();
            this.availableThemes = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
        } catch(e) { this.availableThemes = []; }
    },

    async activateTheme(id: string) {
        if (!confirm("Aktifkan tema?")) return;
        try {
            const res = await this._fetch("/api/theme/activate", {
                method: "POST",
                body: JSON.stringify({ themeId: id }),
            });
            if (res.ok) location.reload();
        } catch(e) {
            alert("Gagal ganti tema");
        }
    },

    async deleteTheme(id: string) {
        if (!confirm("Are you sure you want to delete this theme?")) return;
        try {
            await this._fetch(`/api/theme/${id}`, { method: "DELETE" });
            this.loadThemes();
        } catch(e) { alert("Failed to delete theme"); }
    },

    // =========================================
    // 2. PAGES MANAGEMENT (For Dashboard Stats)
    // =========================================
    async loadPages() {
        try {
            const res = await this._fetch("/api/pages");
            const json = await res.json();
            this.pages = Array.isArray(json) ? json : (json.results || []);
        } catch(e) { 
            this.pages = []; 
        }
    },

    // =========================================
    // 3. USER MANAGEMENT
    // =========================================
    async loadUsers() {
        this.isLoadingUsers = true;
        try {
            const res = await this._fetch("/api/users");
            const json = await res.json();
            this.usersList = json.data || json || [];
        } catch(e) { 
            this.usersList = []; 
        } finally { 
            this.isLoadingUsers = false; 
        }
    },
    
    openAddUser() {
        this.editingUserId = null;
        this.userForm = { username: "", email: "", role: "editor", password: "", name: "" };
        this.showUserModal = true;
    },

    editUser(user: any) {
        this.editingUserId = user.id;
        // Kosongkan password saat edit agar tidak menimpa hash lama jika tidak diisi
        this.userForm = { ...user, password: "" };
        this.showUserModal = true;
    },

    async saveUser() {
        const endpoint = this.editingUserId ? "/api/users/" + this.editingUserId : "/api/users";
        const method = this.editingUserId ? "PUT" : "POST";
        
        try {
            const res = await this._fetch(endpoint, {
                method,
                body: JSON.stringify(this.userForm),
            });
            
            if (res.ok) {
                this.showUserModal = false;
                this.loadUsers();
            } else { 
                const err = await res.json();
                alert("Gagal simpan user: " + (err.error || "Unknown Error")); 
            }
        } catch(e) { console.error(e); }
    },

    async deleteUser(id: string) {
        if (!confirm("Hapus user?")) return;
        try {
            const res = await this._fetch("/api/users/" + id, { method: "DELETE" });
            if (res.ok) this.loadUsers();
        } catch(e) {
            alert("Gagal hapus user");
        }
    },

    // =========================================
    // 3. MENU MANAGEMENT & PLUGINS
    // =========================================
    
    // --- Plugins ---
    availablePlugins: [],
    showAddPluginModal: false,
    newPluginForm: { id: '', name: '', description: '', author: '', version: '1.0.0' },
    
    async loadPlugins() {
        try {
            const res = await this._fetch("/api/plugins");
            const json = await res.json();
            this.availablePlugins = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
        } catch(e) { this.availablePlugins = []; }
    },
    
    async togglePlugin(id: string, activate: boolean) {
        try {
            const res = await this._fetch(`/api/plugins/toggle`, { 
                method: "POST",
                body: JSON.stringify({ plugin_id: id, active: activate })
            });
            const json = await res.json();
            if (json.success) {
                if (window.showToast) window.showToast(json.message || `Plugin ${activate ? 'diaktifkan' : 'dinonaktifkan'}!`, 'success');
            } else {
                if (window.showToast) window.showToast(json.message || 'Gagal mengubah status plugin', 'error');
            }
            await this.loadPlugins();
        } catch(e: any) { 
            if (window.showToast) window.showToast('Gagal mengubah status plugin: ' + e.message, 'error'); 
        }
    },

    async deletePlugin(id: string, name?: string) {
        const confirmed = window.showConfirmDialog 
            ? await window.showConfirmDialog({
                title: 'Hapus Plugin',
                message: `Apakah Anda yakin ingin menghapus plugin "${name || id}" dari sistem?`,
                type: 'danger',
                confirmText: 'Ya, Hapus Plugin'
            })
            : confirm(`Hapus plugin ${name || id}?`);
        if (!confirmed) return;

        try {
            const res = await this._fetch(`/api/plugins/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
                if (window.showToast) window.showToast(json.message || 'Plugin berhasil dihapus!', 'success');
            } else {
                if (window.showToast) window.showToast(json.error || 'Gagal menghapus plugin', 'error');
            }
            await this.loadPlugins();
        } catch(e: any) { 
            if (window.showToast) window.showToast('Gagal menghapus plugin: ' + e.message, 'error'); 
        }
    },

    async saveNewPlugin() {
        if (!this.newPluginForm.id || !this.newPluginForm.name) {
            if (window.showToast) window.showToast('ID dan Nama Plugin wajib diisi!', 'warning');
            return;
        }
        try {
            const res = await this._fetch('/api/plugins', {
                method: 'POST',
                body: JSON.stringify(this.newPluginForm)
            });
            const json = await res.json();
            if (json.success) {
                if (window.showToast) window.showToast('Plugin berhasil didaftarkan!', 'success');
                this.showAddPluginModal = false;
                this.newPluginForm = { id: '', name: '', description: '', author: '', version: '1.0.0' };
                await this.loadPlugins();
            } else {
                if (window.showToast) window.showToast(json.error || 'Gagal menambahkan plugin', 'error');
            }
        } catch(e: any) {
            if (window.showToast) window.showToast('Error: ' + e.message, 'error');
        }
    },

    // --- Menus ---
        async loadMenus() {
        try {
            const res = await this._fetch("/api/menus");
            const json = await res.json();
            let rawList = json.data || json || [];
            
            let organized = [];
            let roots = rawList.filter(m => !m.parent_id).sort((a,b) => (a.order_num||0) - (b.order_num||0));
            roots.forEach(r => {
                organized.push(r);
                let children = rawList.filter(m => m.parent_id === r.id).sort((a,b) => (a.order_num||0) - (b.order_num||0));
                organized.push(...children);
            });
            this.menuList = organized;
        } catch(e) { this.menuList = []; }
    },

    async saveMenu() {
        this.isSavingMenu = true;
        const endpoint = this.menuForm.id ? "/api/menus/" + this.menuForm.id : "/api/menus";
        const method = this.menuForm.id ? "PUT" : "POST";
        
        try {
            const res = await this._fetch(endpoint, {
                method,
                body: JSON.stringify(this.menuForm),
            });
            if (res.ok) {
                this.menuForm = { id: null, label: "", url: "", order_num: 0, parent_id: null };
                this.loadMenus();
            }
        } catch(e) {
            console.error(e);
        } finally { 
            this.isSavingMenu = false; 
        }
    },

    editMenu(m: any) {
        this.menuForm = { ...m };
    },

    async deleteMenu(id: string) {
        if (!confirm("Hapus menu?")) return;
        try {
            const res = await this._fetch("/api/menus/" + id, { method: "DELETE" });
            if (res.ok) this.loadMenus();
        } catch(e) { console.error(e); }
    },

    // =========================================
    // 4. AGGREGATOR
    // =========================================
    async loadAllData() {
        // Promise.all memastikan semua data diload paralel
        await Promise.all([
            this.loadUsers ? this.loadUsers() : Promise.resolve(),
            this.loadMenus ? this.loadMenus() : Promise.resolve(),
            this.loadSettings ? this.loadSettings() : Promise.resolve(),
            this.loadThemes ? this.loadThemes() : Promise.resolve(),
            // @ts-ignore
            this.loadPlugins ? this.loadPlugins() : Promise.resolve(),
            this.loadAgens ? this.loadAgens() : Promise.resolve(),
            this.loadSubscribers ? this.loadSubscribers() : Promise.resolve(),
            (async () => {
                try {
                    const token = localStorage.getItem('labmu_token') || localStorage.getItem('admin_token');
                    if (token) {
                        const res = await fetch('/api/stats/dashboard', { headers: { 'Authorization': 'Bearer ' + token } });
                        if (res.ok) {
                            const statsAgg = await res.json();
                            // @ts-ignore
                            this.dashboardStats = statsAgg;
                            // @ts-ignore
                            window.__CMS_DASHBOARD_STATS = statsAgg;
                            document.dispatchEvent(new CustomEvent('stats-updated', { detail: statsAgg }));
                        }
                    }
                } catch(e) {}
            })()
        ]);
        
        // Load Media, Posts & Pages jika modulnya tersedia (Safe check dari modul lain)
        // @ts-ignore
        if(this.loadMedia) await this.loadMedia();
        // @ts-ignore
        if(this.loadPosts) await this.loadPosts();
        // @ts-ignore
        if(this.loadPages) await this.loadPages();
    }
};