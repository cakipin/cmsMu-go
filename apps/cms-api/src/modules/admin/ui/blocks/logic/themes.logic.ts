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

  async activateTheme(id: string) {
    if (!confirm("Aktifkan tema?")) return;
    try {
      const res = await this._fetch("/api/theme/activate", {
        method: "POST",
        body: JSON.stringify({ themeId: id }),
      });
      if (res.ok) location.reload();
    } catch (e) {
      if ((window as any).showToast)
        (window as any).showToast("Gagal ganti tema", "error");
    }
  },

  async deleteTheme(id: string) {
    if (!confirm("Are you sure you want to delete this theme?")) return;
    try {
      await this._fetch(`/api/theme/${id}`, { method: "DELETE" });
      this.loadThemes();
    } catch (e) {
      if ((window as any).showToast)
        (window as any).showToast("Failed to delete theme", "error");
    }
  },
};
