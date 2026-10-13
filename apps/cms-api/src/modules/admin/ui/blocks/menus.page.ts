export const menusPage = `
<div x-show="view === 'menus'" x-init="loadMenus()">
    <!-- Header Menu Manager -->
    <div class="flex items-center justify-between mb-4">
        <div>
            <h2 class="text-xl font-bold text-slate-800 m-0">Menu Manager</h2>
            <p class="text-xs text-slate-500 m-0 mt-0.5">Atur struktur menu navigasi website.</p>
        </div>
        <button @click="loadMenus()" class="btn min-h-[38px] px-3.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm font-semibold text-slate-700 shadow-sm active:scale-95 transition-all">
            <i class="fas fa-sync"></i> <span class="hidden xs:inline">Segarkan</span>
        </button>
    </div>

    <!-- Responsive Layout: 1 Kolom di Mobile, 2 Kolom di Desktop -->
    <div class="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        
        <!-- Form Add / Edit Menu -->
        <div class="card p-4 sm:p-5 bg-white border border-slate-200 rounded-lg shadow-sm">
            <h3 class="text-sm font-bold text-slate-800 m-0 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span x-text="menuForm.id ? 'Edit Item Menu' : 'Tambah Menu Baru'"></span>
                <span x-show="menuForm.id" class="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Mode Edit</span>
            </h3>
            
            <div class="space-y-3.5 mt-3.5">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Label (Nama Menu) *</label>
                    <input type="text" x-model="menuForm.label" class="input w-full p-2.5 text-xs sm:text-sm rounded-md border border-slate-300 outline-none" placeholder="Contoh: Tentang Kami">
                </div>
                
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">URL / Link *</label>
                    <input type="text" x-model="menuForm.url" class="input w-full p-2.5 text-xs sm:text-sm rounded-md border border-slate-300 outline-none" placeholder="Contoh: /tentang-kami">
                    <small class="text-slate-500 text-[11px] block mt-1">Gunakan <b>/slug</b> untuk link internal.</small>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Urutan</label>
                        <input type="number" x-model="menuForm.order_num" class="input w-full p-2.5 text-xs sm:text-sm rounded-md border border-slate-300 outline-none" placeholder="0">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Induk Menu</label>
                        <select x-model="menuForm.parent_id" class="input w-full p-2.5 text-xs sm:text-sm rounded-md border border-slate-300 outline-none bg-white">
                            <option value="">-- Utama --</option>
                            <template x-for="pm in menuList.filter(m => !m.parent_id && m.id !== menuForm.id)" :key="pm.id">
                                <option :value="pm.id" x-text="pm.label"></option>
                            </template>
                        </select>
                    </div>
                </div>

                <div class="flex items-center gap-2 pt-2">
                    <button @click="saveMenu()" class="btn min-h-[40px] px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md flex-1 text-xs sm:text-sm active:scale-95 transition-all shadow-sm">
                        <span x-text="isSavingMenu ? 'Menyimpan...' : (menuForm.id ? 'Perbarui Menu' : 'Simpan Menu')"></span>
                    </button>
                    <button @click="menuForm = {id:null, label:'', url:'', order_num:0, parent_id:null}" class="btn min-h-[40px] px-3 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-700 active:scale-95 transition-all">
                        Reset
                    </button>
                </div>
            </div>
        </div>

        <!-- Daftar Menu (Tabel di Desktop, Kartu di Mobile) -->
        <div class="card p-0 overflow-hidden bg-white border border-slate-200 rounded-lg shadow-sm">
            <!-- Desktop Table View -->
            <div class="hidden md:block overflow-x-auto">
                <table style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="background:#f9fafb; text-align:left; border-bottom:1px solid #e5e7eb;">
                            <th style="padding:12px; width:70px; text-align:center;">Urutan</th>
                            <th style="padding:12px;">Label Menu</th>
                            <th style="padding:12px;">URL / Link</th>
                            <th style="padding:12px; text-align:right; width:120px;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody style="font-size:13px;">
                        <template x-for="m in menuList" :key="m.id">
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:12px; text-align:center; font-weight:600; color:#64748b;" x-text="m.order_num"></td>
                                <td style="padding:12px; font-weight:bold;">
                                    <span x-show="m.parent_id" style="color:#94a3b8; margin-right:6px;">↳</span>
                                    <span x-text="m.label"></span>
                                </td>
                                <td style="padding:12px; color:#2271b1; font-family:monospace;" x-text="m.url"></td>
                                <td style="padding:12px; text-align:right;">
                                    <div style="display: flex; justify-content: flex-end; gap: 8px;">
                                        <a :href="m.url" target="_blank" class="p-1 text-emerald-600 hover:text-emerald-700" title="Preview"><i class="fas fa-external-link-alt"></i></a>
                                        <button @click="editMenu(m)" class="p-1 text-blue-600 hover:text-blue-700" title="Edit"><i class="fas fa-edit"></i></button>
                                        <button @click="deleteMenu(m.id)" class="p-1 text-red-600 hover:text-red-700" title="Delete"><i class="fas fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        </template>
                        <tr x-show="menuList.length === 0">
                            <td colspan="4" style="padding:30px; text-align:center; color:#999;">Belum ada menu. Silakan tambah menu baru di panel kiri.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Mobile Vertical Card List View -->
            <div class="block md:hidden divide-y divide-slate-100">
                <template x-for="m in menuList" :key="'mob_menu_' + m.id">
                    <div class="p-3 bg-white space-y-2">
                        <div class="flex items-center justify-between gap-2">
                            <div class="flex items-center gap-1.5 min-w-0">
                                <span class="text-xs px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-600" x-text="'#' + m.order_num"></span>
                                <span x-show="m.parent_id" class="text-slate-400 font-bold text-xs">↳ Sub:</span>
                                <h4 class="text-sm font-bold text-slate-800 m-0 truncate" x-text="m.label"></h4>
                            </div>
                            <span x-show="!m.parent_id" class="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded shrink-0">Utama</span>
                        </div>
                        <div class="text-xs text-blue-600 font-mono break-all" x-text="m.url"></div>
                        
                        <div class="flex items-center gap-2 pt-1 border-t border-slate-50">
                            <a :href="m.url" target="_blank" 
                               class="min-h-[38px] px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md flex items-center justify-center gap-1 flex-1 active:scale-95 transition-all">
                                <i class="fas fa-external-link-alt text-xs"></i> <span>Buka</span>
                            </a>
                            <button type="button" @click="editMenu(m)" 
                                    class="min-h-[38px] px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center justify-center gap-1 flex-1 active:scale-95 transition-all">
                                <i class="fas fa-pencil-alt text-xs"></i> <span>Edit</span>
                            </button>
                            <button type="button" @click="deleteMenu(m.id)" 
                                    class="min-h-[38px] px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md flex items-center justify-center gap-1 active:scale-95 transition-all">
                                <i class="fas fa-trash-alt text-xs"></i> <span>Hapus</span>
                            </button>
                        </div>
                    </div>
                </template>
                <div x-show="menuList.length === 0" class="p-8 text-center text-slate-400 text-xs">
                    Belum ada menu. Silakan isi form di atas.
                </div>
            </div>
        </div>

    </div>
</div>
`;