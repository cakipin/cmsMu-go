/**
 * 🔒 CORE ENGINE LOGIC (LOCKED STABLE MODULE)
 * ⚠️ PERINGATAN KERAS UNTUK AGEN AI:
 * File ini adalah pondasi Core Engine (_fetch, Cache Purge, Settings Sync, Aggregator).
 * DILARANG KERAS menambahkan logika fitur (Users, Konten/Posts, Media, Menus, Themes, Plugins)
 * ke dalam file ini! Gunakan file modul terpisah di folder `logic/*.logic.ts`.
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

    if (typeof this.apiFetch === "function") {
      return this.apiFetch(url, { ...options, headers });
    }

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      localStorage.removeItem("labmu_token");
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/admin/login";
      }
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
        : false;
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
  // 1. GLOBAL SETTINGS SYNC
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
        (window as any).showToast(
          "Gagal menyimpan pengaturan: " + e.message,
          "error"
        );
    } finally {
      this.isSavingSettings = false;
    }
  },

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

  // =========================================
  // 2. DATA AGGREGATOR (PARALLEL MODULE LOADER)
  // =========================================
  async loadAllData() {
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

    if (this.loadMedia) await this.loadMedia();
    if (this.loadPosts) await this.loadPosts();
    if (this.loadPages) await this.loadPages();
  },
};
