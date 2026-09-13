export const menusLogic = `
    // STATE VARIABEL
    menuList: [],
    menuForm: { id: null, label: '', url: '', order_num: 0, parent_id: '' },
    isSavingMenu: false,

    // LOAD DATA
    async loadMenus() {
        if(!this.token) return;
        try {
            let res = await fetch('/api/menus', { headers: { 'Authorization': this.token } });
            let json = await res.json();
            this.menuList = json.data || [];
        } catch(e) {
            console.error('Gagal load menu', e);
        }
    },

    // EDIT MENU (Form Fill)
    editMenu(m) {
        this.menuForm = {
            id: m.id,
            label: m.label,
            url: m.url,
            order_num: m.order_num ?? m.orderNum ?? 0,
            parent_id: m.parent_id ?? m.parentId ?? ''
        };
    },

    // SAVE DATA
    async saveMenu() {
        if(!this.menuForm.label || !this.menuForm.url) return alert('Label dan URL wajib diisi!');
        
        this.isSavingMenu = true;
        try {
            const method = this.menuForm.id ? 'PUT' : 'POST';
            const url = this.menuForm.id ? ('/api/menus/' + this.menuForm.id) : '/api/menus';

            let res = await fetch(url, { 
                method: method, 
                headers: { 'Content-Type': 'application/json', 'Authorization': this.token },
                body: JSON.stringify(this.menuForm)
            });
            
            let json = await res.json();
            if(!json.success) throw new Error(json.error || 'Gagal menyimpan menu');

            // Reset Form & Reload
            this.menuForm = { id: null, label: '', url: '', order_num: 0, parent_id: '' };
            this.loadMenus();
            alert('Menu Tersimpan!');
        } catch(e) {
            alert('Gagal menyimpan menu: ' + e.message);
        } finally {
            this.isSavingMenu = false;
        }
    },

    // DELETE DATA
    async deleteMenu(id) {
        if(!confirm('Hapus menu ini?')) return;
        try {
            await fetch('/api/menus/' + id, { 
                method: 'DELETE', 
                headers: { 'Authorization': this.token } 
            });
            this.loadMenus();
        } catch(e) {}
    }
`;
