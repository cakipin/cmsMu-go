/**
 * 🔌 PLUGINS MODULE LOGIC (ISOLATED FEATURE MODULE)
 * Seluruh state dan aksi manajemen plugin/addon berada di file ini.
 */

export const pluginsLogic: Record<string, any> & ThisType<any> = {
  availablePlugins: [],
  showAddPluginModal: false,
  newPluginForm: {
    id: "",
    name: "",
    description: "",
    author: "",
    version: "1.0.0",
  },
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
};
