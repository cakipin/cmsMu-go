/**
 * ⚙️ CORE LOGIC (Settings, Users, Themes, Menus)
 * Didesain agar independen dari konteks `this` yang ketat.
 */

export const coreLogic: Record<string, any> & ThisType<any> = {
  // Helper Internal: Wrapper Fetch yang Aman
  async _fetch(url: string, options: any = {}) {
    const token =
      typeof window !== "undefined" && (window as any).getCmsToken
        ? (window as any).getCmsToken()
        : "";
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;
    const headers: any = {
      Authorization: "Bearer " + token,
      ...(options.headers || {}),
    };
    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    // Cek jika ada fungsi apiFetch global dari CMS wrapper
    if (typeof this.apiFetch === "function") {
      return this.apiFetch(url, { ...options, headers });
    }

    // Fallback fetch manual
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      localStorage.removeItem("labmu_token");
      window.location.href = "/admin/login";
      throw new Error("Unauthorized");
    }
    return res;
  },

  isPurgingCache: false,
  async purgeCacheGlobal() {
    const confirmed =
      typeof window !== "undefined" && (window as any).showConfirmDialog
        ? await (window as any).showConfirmDialog({
            title: "Bersihkan Seluruh Cache",
            message:
              "Apakah Anda yakin ingin membersihkan seluruh cache sistem (KV & Cloudflare)?",
            type: "warning",
            confirmText: "Ya, Bersihkan",
          })
        : confirm(
            "Apakah Anda yakin ingin membersihkan seluruh cache sistem (KV & Cloudflare)?"
          );
    if (!confirmed) return;
    this.isPurgingCache = true;
    try {
      const res = await this._fetch("/api/settings/purge-cache", {
        method: "POST",
      });
      const json: any = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        if ((window as any).showToast)
          (window as any).showToast(
            json.message || "Cache berhasil dibersihkan!",
            "success"
          );
      } else {
        const errMsg = json.error || "Gagal membersihkan cache.";
        if ((window as any).showToast)
          (window as any).showToast(errMsg, "error");
      }
    } catch (e: any) {
      if ((window as any).showToast)
        (window as any).showToast("Gagal: " + e.message, "error");
    } finally {
      this.isPurgingCache = false;
    }
  },

  // =========================================
  // 1. SETTINGS & THEMES
  // =========================================

  initSettingsListener() {
    if (
      typeof window !== "undefined" &&
      !(window as any).__SETTINGS_LISTENER_BOUND
    ) {
      (window as any).__SETTINGS_LISTENER_BOUND = true;
      window.addEventListener("settings-updated", (e: any) => {
        if (e.detail) {
          this.settings = { ...(this.settings || {}), ...e.detail };
        }
      });
    }
  },

  async loadSettings() {
    this.initSettingsListener();
    try {
      const res = await this._fetch("/api/settings");
      const json: any = await res.json();
      // Merge agar tidak menimpa state lokal jika API partial
      this.settings = { ...this.settings, ...(json.data || json || {}) };
    } catch (e) {
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
      if (res.ok && (window as any).showToast)
        (window as any).showToast("Pengaturan berhasil disimpan!", "success");
    } catch (e: any) {
      if ((window as any).showToast)
        (window as any).showToast("Gagal menyimpan pengaturan: " + e.message, "error");
    } finally {
      this.isSavingSettings = false;
    }
  },

  // --- Media Selector Logic (Tetap Stable) ---
  openLogoSelector(targetField: any) {
    this.mediaSelectorTarget = targetField;
    this.view = "media";
  },

  selectSettingImage(url: string) {
    if (this.mediaSelectorTarget) {
      this.settings[this.mediaSelectorTarget] = url;
      this.mediaSelectorTarget = null;
      this.view = "settings";
    }
  },

  // --- Themes ---
  availableThemes: [],
  async loadThemes() {
    try {
      const res = await this._fetch("/api/theme");
      const json: any = await res.json();
      this.availableThemes = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : [];
    } catch (e) {
      this.availableThemes = [];
    }
  },

  async activateTheme(id: string) {
    if (!confirm("Aktifkan tema?")) return;
    try {
      const res = await this._fetch("/api/theme/activate", {
        method: "POST",
        body: JSON.stringify({ themeId: id }),
      });
      if (res.ok) location.reload();
    } catch (e) {
      if ((window as any).showToast) (window as any).showToast("Gagal ganti tema", "error");
    }
  },

  async deleteTheme(id: string) {
    if (!confirm("Are you sure you want to delete this theme?")) return;
    try {
      await this._fetch(`/api/theme/${id}`, { method: "DELETE" });
      this.loadThemes();
    } catch (e) {
      if ((window as any).showToast) (window as any).showToast("Failed to delete theme", "error");
    }
  },

  // =========================================
  // 2. PAGES MANAGEMENT (For Dashboard Stats)
  // =========================================
  async loadPages() {
    try {
      const res = await this._fetch("/api/pages");
      const json: any = await res.json();
      this.pages = Array.isArray(json) ? json : json.results || [];
    } catch (e) {
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
      const json: any = await res.json();
      this.usersList = json.data || json || [];
    } catch (e) {
      this.usersList = [];
    } finally {
      this.isLoadingUsers = false;
    }
  },

  openAddUser() {
    this.editingUserId = null;
    this.userForm = {
      username: "",
      email: "",
      role: "editor",
      password: "",
      name: "",
    };
    this.showUserModal = true;
  },

  editUser(user: any) {
    this.editingUserId = user.id;
    // Kosongkan password saat edit agar tidak menimpa hash lama jika tidak diisi
    this.userForm = { ...user, password: "" };
    this.showUserModal = true;
  },

  async saveUser() {
    const endpoint = this.editingUserId
      ? "/api/users/" + this.editingUserId
      : "/api/users";
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
        const err: any = await res.json();
        if ((window as any).showToast)
          (window as any).showToast("Gagal simpan user: " + (err.error || "Unknown Error"), "error");
      }
    } catch (e) {
      console.error(e);
    }
  },

  async deleteUser(id: string) {
    if (!confirm("Hapus user?")) return;
    try {
      const res = await this._fetch("/api/users/" + id, { method: "DELETE" });
      if (res.ok) this.loadUsers();
    } catch (e) {
      if ((window as any).showToast) (window as any).showToast("Gagal hapus user", "error");
    }
  },

  // =========================================
  // 3. MENU MANAGEMENT & PLUGINS
  // =========================================

  // --- Plugins ---
  availablePlugins: [],
  showAddPluginModal: false,
  newPluginForm: {
    id: "",
    name: "",
    description: "",
    author: "",
    version: "1.0.0",
  },

  // Upload & Import Plugin State (SOP 16)
  showUploadPluginModal: false,
  uploadPluginTab: "file",
  selectedPluginFile: null,
  pluginImportUrl: "",
  isUploadingPlugin: false,

  handlePluginFileSelect(e: any) {
    if (e && e.target && e.target.files && e.target.files[0]) {
      this.selectedPluginFile = e.target.files[0];
    }
  },

  async submitPluginUpload() {
    const win = window as any;
    if (!this.selectedPluginFile) {
      if (win.showToast)
        win.showToast(
          "Silakan pilih berkas plugin (.zip / .json) terlebih dahulu",
          "warning"
        );
      return;
    }

    this.isUploadingPlugin = true;
    try {
      const formData = new FormData();
      formData.append("file", this.selectedPluginFile);

      const res = await this._fetch("/api/plugins/upload", {
        method: "POST",
        body: formData,
      });
      const json: any = await res.json();
      if (json.success) {
        if (win.showToast)
          win.showToast(
            json.message || "Plugin berhasil dipasang!",
            "success"
          );
        this.showUploadPluginModal = false;
        this.selectedPluginFile = null;
        const fileInput = document.getElementById(
          "pluginFileInput"
        ) as HTMLInputElement | null;
        if (fileInput) fileInput.value = "";
        await this.loadPlugins();
      } else {
        if (win.showToast)
          win.showToast(json.error || "Gagal memasang plugin", "error");
      }
    } catch (err: any) {
      if (win.showToast)
        win.showToast("Gagal mengunggah plugin: " + err.message, "error");
    } finally {
      this.isUploadingPlugin = false;
    }
  },

  async submitPluginImportUrl() {
    const win = window as any;
    if (!this.pluginImportUrl || !this.pluginImportUrl.trim()) {
      if (win.showToast)
        win.showToast(
          "Masukkan URL manifest plugin terlebih dahulu",
          "warning"
        );
      return;
    }

    this.isUploadingPlugin = true;
    try {
      const res = await this._fetch("/api/plugins/upload", {
        method: "POST",
        body: JSON.stringify({ url_source: this.pluginImportUrl.trim() }),
      });
      const json: any = await res.json();
      if (json.success) {
        if (win.showToast)
          win.showToast(
            json.message || "Plugin berhasil diimpor & dipasang!",
            "success"
          );
        this.showUploadPluginModal = false;
        this.pluginImportUrl = "";
        await this.loadPlugins();
      } else {
        if (win.showToast)
          win.showToast(
            json.error || "Gagal mengimpor plugin dari URL",
            "error"
          );
      }
    } catch (err: any) {
      if (win.showToast)
        win.showToast("Gagal mengimpor plugin: " + err.message, "error");
    } finally {
      this.isUploadingPlugin = false;
    }
  },

  isPluginActive(id: string) {
    if (!id) return true;
    if (
      !this.availablePlugins ||
      !Array.isArray(this.availablePlugins) ||
      this.availablePlugins.length === 0
    )
      return true;
    const p = this.availablePlugins.find((x: any) => x.id === id);
    if (!p) return true;
    return Number(p.active) === 1;
  },

  async loadPlugins() {
    try {
      const res = await this._fetch("/api/plugins");
      const json: any = await res.json();
      this.availablePlugins = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : [];
    } catch (e) {
      this.availablePlugins = [];
    }
  },

  async togglePlugin(id: string, activate: boolean) {
    const win = window as any;
    try {
      const res = await this._fetch(`/api/plugins/toggle`, {
        method: "POST",
        body: JSON.stringify({ plugin_id: id, active: activate }),
      });
      const json: any = await res.json();
      if (json.success) {
        if (win.showToast)
          win.showToast(
            json.message ||
              `Plugin ${activate ? "diaktifkan" : "dinonaktifkan"}!`,
            "success"
          );
      } else {
        if (win.showToast)
          win.showToast(
            json.message || "Gagal mengubah status plugin",
            "error"
          );
      }
      await this.loadPlugins();
    } catch (e: any) {
      if (win.showToast)
        win.showToast("Gagal mengubah status plugin: " + e.message, "error");
    }
  },

  async deletePlugin(id: string, name?: string) {
    const win = window as any;
    const confirmed = win.showConfirmDialog
      ? await win.showConfirmDialog({
          title: "Hapus Plugin",
          message: `Apakah Anda yakin ingin menghapus plugin "${name || id}" dari sistem?`,
          type: "danger",
          confirmText: "Ya, Hapus Plugin",
        })
      : confirm(`Hapus plugin ${name || id}?`);
    if (!confirmed) return;

    try {
      const res = await this._fetch(`/api/plugins/${id}`, { method: "DELETE" });
      const json: any = await res.json();
      if (json.success) {
        if (win.showToast)
          win.showToast(
            json.message || "Plugin berhasil dihapus!",
            "success"
          );
      } else {
        if (win.showToast)
          win.showToast(json.error || "Gagal menghapus plugin", "error");
      }
      await this.loadPlugins();
    } catch (e: any) {
      if (win.showToast)
        win.showToast("Gagal menghapus plugin: " + e.message, "error");
    }
  },

  async saveNewPlugin() {
    const win = window as any;
    if (!this.newPluginForm.id || !this.newPluginForm.name) {
      if (win.showToast)
        win.showToast("ID dan Nama Plugin wajib diisi!", "warning");
      return;
    }
    try {
      const res = await this._fetch("/api/plugins", {
        method: "POST",
        body: JSON.stringify(this.newPluginForm),
      });
      const json: any = await res.json();
      if (json.success) {
        if (win.showToast)
          win.showToast("Plugin berhasil didaftarkan!", "success");
        this.showAddPluginModal = false;
        this.newPluginForm = {
          id: "",
          name: "",
          description: "",
          author: "",
          version: "1.0.0",
        };
        await this.loadPlugins();
      } else {
        if (win.showToast)
          win.showToast(json.error || "Gagal menambahkan plugin", "error");
      }
    } catch (e: any) {
      if (win.showToast) win.showToast("Error: " + e.message, "error");
    }
  },

  // --- Menus ---
  async loadMenus() {
    try {
      const res = await this._fetch("/api/menus");
      const json: any = await res.json();
      let rawList: any[] = json.data || json || [];

      let organized: any[] = [];
      let roots = rawList
        .filter((m: any) => !m.parent_id)
        .sort((a: any, b: any) => (a.order_num || 0) - (b.order_num || 0));
      roots.forEach((r: any) => {
        organized.push(r);
        let children = rawList
          .filter((m: any) => m.parent_id === r.id)
          .sort((a: any, b: any) => (a.order_num || 0) - (b.order_num || 0));
        organized.push(...children);
      });
      this.menuList = organized;
    } catch (e) {
      this.menuList = [];
    }
  },

  async saveMenu() {
    this.isSavingMenu = true;
    const endpoint = this.menuForm.id
      ? "/api/menus/" + this.menuForm.id
      : "/api/menus";
    const method = this.menuForm.id ? "PUT" : "POST";

    try {
      const res = await this._fetch(endpoint, {
        method,
        body: JSON.stringify(this.menuForm),
      });
      if (res.ok) {
        this.menuForm = {
          id: null,
          label: "",
          url: "",
          order_num: 0,
          parent_id: null,
        };
        this.loadMenus();
      }
    } catch (e) {
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
    } catch (e) {
      console.error(e);
    }
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
      this.loadPlugins ? this.loadPlugins() : Promise.resolve(),
      (async () => {
        try {
          const token =
            localStorage.getItem("labmu_token") ||
            localStorage.getItem("admin_token");
          if (token) {
            const res = await fetch("/api/stats/dashboard", {
              headers: { Authorization: "Bearer " + token },
            });
            if (res.ok) {
              const statsAgg = await res.json();
              this.dashboardStats = statsAgg;
              (window as any).__CMS_DASHBOARD_STATS = statsAgg;
              document.dispatchEvent(
                new CustomEvent("stats-updated", { detail: statsAgg })
              );
            }
          }
        } catch (e) {}
      })(),
    ]);

    // Load Media, Posts & Pages jika modulnya tersedia (Safe check dari modul lain)
    if (this.loadMedia) await this.loadMedia();
    if (this.loadPosts) await this.loadPosts();
    if (this.loadPages) await this.loadPages();
  },
};
