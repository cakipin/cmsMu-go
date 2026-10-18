/**
 * 🧭 MENUS MODULE LOGIC (ISOLATED FEATURE MODULE)
 * Seluruh state dan aksi CRUD navigasi menu berada di file ini.
 */

export const menusLogic: Record<string, any> & ThisType<any> = {
  menuList: [],
  isSavingMenu: false,
  menuForm: {
    id: null,
    label: "",
    url: "",
    order_num: 0,
    parent_id: null,
  },

  async loadMenus() {
    try {
      const res = await this._fetch("/api/menus");
      const json: any = await res.json();
      const rawList: any[] = json.data || json || [];

      const organized: any[] = [];
      const roots = rawList
        .filter((m: any) => !m.parent_id)
        .sort((a: any, b: any) => (a.order_num || 0) - (b.order_num || 0));
      roots.forEach((r: any) => {
        organized.push(r);
        const children = rawList
          .filter((m: any) => m.parent_id === r.id)
          .sort((a: any, b: any) => (a.order_num || 0) - (b.order_num || 0));
        organized.push(...children);
      });
      this.menuList = organized;
    } catch (e) {
      this.menuList = [];
    }
  },

  loadMenu() {
    return this.loadMenus();
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
};
