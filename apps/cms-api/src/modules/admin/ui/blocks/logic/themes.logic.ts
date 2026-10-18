/**
 * 🎨 THEMES MODULE LOGIC (ISOLATED FEATURE MODULE)
 * Seluruh state dan aksi manajemen tema berada di file ini.
 */

export const themesLogic: Record<string, any> & ThisType<any> = {
  availableThemes: [],
  isLoadingThemes: false,

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

  async activateTheme(id: string, name?: string) {
    const win = window as any;
    const confirmed = win.showConfirmDialog
      ? await win.showConfirmDialog({
          title: "Aktifkan Tema",
          message: `Apakah Anda yakin ingin mengaktifkan tema "${name || id}" sebagai tampilan utama situs?`,
          type: "info",
          confirmText: "Ya, Aktifkan",
        })
      : false;
    if (!confirmed) return;
    try {
      const res = await this._fetch("/api/theme/activate", {
        method: "POST",
        body: JSON.stringify({ themeId: id }),
      });
      if (res.ok) {
        if (win.showToast)
          win.showToast("Tema berhasil diaktifkan!", "success");
        await this.loadThemes();
      } else {
        const err: any = await res.json().catch(() => ({}));
        if (win.showToast)
          win.showToast(err.message || err.error || "Gagal mengaktifkan tema", "error");
      }
    } catch (e) {
      if (win.showToast)
        win.showToast("Gagal mengganti tema", "error");
    }
  },

  async deleteTheme(id: string, name?: string) {
    if (id === "default") {
      if ((window as any).showToast)
        (window as any).showToast("Tema bawaan sistem (default) tidak dapat dihapus.", "warning");
      return;
    }
    const win = window as any;
    const confirmed = win.showConfirmDialog
      ? await win.showConfirmDialog({
          title: "Hapus Tema",
          message: `Apakah Anda yakin ingin menghapus tema "${name || id}" dari daftar tema?`,
          type: "danger",
          confirmText: "Ya, Hapus Tema",
        })
      : false;
    if (!confirmed) return;
    try {
      const res = await this._fetch(`/api/theme/${id}`, { method: "DELETE" });
      const json: any = await res.json().catch(() => ({}));
      if (res.ok && json.success !== false) {
        if (win.showToast)
          win.showToast(json.message || "Tema berhasil dihapus", "success");
        await this.loadThemes();
      } else {
        if (win.showToast)
          win.showToast(json.message || json.error || "Gagal menghapus tema", "error");
      }
    } catch (e) {
      if (win.showToast)
        win.showToast("Gagal menghapus tema", "error");
    }
  },
};
