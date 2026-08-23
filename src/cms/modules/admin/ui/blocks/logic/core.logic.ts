/**
 * ⚙️ CORE LOGIC (Settings, Users, Themes, Menus)
 * Didesain agar independen dari konteks `this` yang ketat.
 */

export const coreLogic = {
    // Helper Internal: Wrapper Fetch yang Aman
    async _fetch(url: string, options: any = {}) {
        const headers = {
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
        const res = await fetch(url, { ...options, headers, credentials: 'same-origin' });
        if (res.status === 401) {
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

    async loadPlugins() {
        try {
            const res = await this._fetch("/api/plugins");
            const json = await res.json();
            this.availablePlugins = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
        } catch(e) { this.availablePlugins = []; }
    },

    async togglePlugin(id: string, activate: boolean) {
        try {
            await this._fetch(`/api/plugins/toggle/${id}`, {
                method: "POST",
                body: JSON.stringify({ active: activate })
            });
            this.loadPlugins();
        } catch(e) { alert("Failed to toggle plugin"); }
    },

    async deletePlugin(id: string) {
        if (!confirm("Are you sure you want to delete this plugin?")) return;
        try {
            await this._fetch(`/api/plugins/${id}`, { method: "DELETE" });
            this.loadPlugins();
        } catch(e) { alert("Failed to delete plugin"); }
    },

    // --- Menus ---
    async loadMenus() {
        try {
            const res = await this._fetch("/api/menus");
            const json = await res.json();
            this.menuList = json.data || json || [];
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
                this.menuForm = { id: null, label: "", url: "", order_num: 0 };
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
            this.loadPlugins ? this.loadPlugins() : Promise.resolve()
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
