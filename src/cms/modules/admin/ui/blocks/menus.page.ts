export const menusPage = `
<div x-show="view === 'menus'" x-init="loadMenus()"> <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="margin:0; font-size:20px;">Menu Manager</h2>
        <button @click="loadMenus()" class="btn" style="background:#fff; border:1px solid #ccc;">
            <i class="fas fa-sync"></i> Refresh List
        </button>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px;">

        <div class="card">
            <h3 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px;">Add / Edit Menu</h3>

            <div style="margin-bottom:10px;">
                <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px;">Label (Nama Menu)</label>
                <input type="text" x-model="menuForm.label" class="input" placeholder="Contoh: Tentang Kami">
            </div>

            <div style="margin-bottom:10px;">
                <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px;">URL / Link</label>
                <input type="text" x-model="menuForm.url" class="input" placeholder="Contoh: /tentang-kami">
                <small style="color:#666; font-size:11px;">Gunakan <b>/slug</b> untuk halaman internal.</small>
            </div>

            <div style="margin-bottom:15px;">
                <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px;">Urutan</label>
                <input type="number" x-model="menuForm.order_num" class="input" placeholder="0">
            </div>

            <div style="display:flex; gap:10px;">
                <button @click="saveMenu()" class="btn btn-primary" style="flex:1;">
                    <span x-text="isSavingMenu ? 'Saving...' : 'Save Menu'"></span>
                </button>
                <button @click="menuForm = {id:null, label:'', url:'', order_num:0}" class="btn" style="border:1px solid #ccc;">
                    Reset
                </button>
            </div>
        </div>

        <div class="card" style="padding:0;">
            <table style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="background:#f9f9f9; text-align:left; border-bottom:1px solid #eee;">
                        <th style="padding:10px;">Urutan</th>
                        <th style="padding:10px;">Label</th>
                        <th style="padding:10px;">URL</th>
                        <th style="padding:10px; text-align:right;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <template x-for="m in menuList" :key="m.id">
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px;" x-text="m.order_num"></td>
                            <td style="padding:10px; font-weight:bold;" x-text="m.label"></td>
                            <td style="padding:10px; color:#2271b1;" x-text="m.url"></td>
                            <td style="padding:10px; text-align:right;">
                                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                                    <a :href="m.url" target="_blank" style="color:#008A20; background:none; border:none; cursor:pointer; text-decoration:none;" title="Preview"><i class="fas fa-external-link-alt"></i></a>
                                    <button @click="editMenu(m)" style="color:#2271b1; background:none; border:none; cursor:pointer;" title="Edit"><i class="fas fa-edit"></i></button>
                                    <button @click="deleteMenu(m.id)" style="color:red; background:none; border:none; cursor:pointer;" title="Delete"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                    </template>
                    <tr x-show="menuList.length === 0">
                        <td colspan="4" style="padding:20px; text-align:center; color:#999;">Belum ada menu. Silakan tambah.</td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
</div>
`;