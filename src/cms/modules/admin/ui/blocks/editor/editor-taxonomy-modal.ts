export const editorTaxonomyModal = `
    <!-- MODAL 1: KELOLA TAXONOMY (Kategori / Tag) -->
    <div x-show="manageModalOpen" class="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" style="display: flex !important; justify-content: center !important; align-items: center !important;" x-cloak>
        <div class="relative w-full max-w-md max-h-[85vh] bg-white rounded-2xl flex flex-col overflow-hidden shadow-2xl m-auto" style="margin: auto !important; font-family: inherit;">
            <div style="padding:16px 20px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                <h3 style="margin:0; font-size:15px; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:8px;">
                    <i class="fas" :class="manageTarget === 'category' ? 'fa-folder-open text-teal-600' : 'fa-tags text-teal-600'"></i>
                    Kelola <span x-text="manageTarget === 'category' ? 'Kategori Artikel' : 'Tags Artikel'"></span>
                </h3>
                <button type="button" @click="manageModalOpen=false" style="border:none; background:#e2e8f0; width:28px; height:28px; border-radius:50%; font-size:14px; cursor:pointer; color:#475569; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='#cbd5e1'" onmouseout="this.style.background='#e2e8f0'">&times;</button>
            </div>
            <div style="flex:1; overflow-y:auto; padding:0;">
                <template x-if="managerItems.length === 0">
                    <div style="padding:30px; text-align:center; color:#94a3b8; font-size:13px;">Belum ada data.</div>
                </template>
                <template x-for="item in managerItems" :key="item">
                    <div style="padding:12px 20px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; transition:background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                        <span x-text="item" style="font-weight:600; font-size:13px; color:#334155;"></span>
                        <div style="display:flex; gap:6px;">
                            <button type="button" @click="openRenameItem(item)" style="color:#d97706; background:#fef3c7; border:1px solid #fde68a; width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;" title="Edit / Rename">
                                <i class="fas fa-pencil-alt text-xs"></i>
                            </button>
                            <button type="button" @click="openDeleteItem(item)" style="color:#dc2626; background:#fee2e2; border:1px solid #fecaca; width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;" title="Hapus">
                                <i class="fas fa-trash text-xs"></i>
                            </button>
                        </div>
                    </div>
                </template>
            </div>
            <div style="padding:12px 20px; border-top:1px solid #f1f5f9; background:#f8fafc; display:flex; justify-content:flex-end;">
                <button type="button" @click="manageModalOpen=false" class="btn" style="padding:6px 14px; font-size:12px; background:white; border:1px solid #cbd5e1; border-radius:8px; cursor:pointer; font-weight:600; color:#475569;">Tutup</button>
            </div>
        </div>
    </div>

    <!-- MODAL 2: POPUP SISTEM BUAT KATEGORI BARU -->
    <div x-show="showNewCategoryModal" class="fixed inset-0 z-[100000] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" style="display: flex !important; justify-content: center !important; align-items: center !important;" x-cloak>
        <div class="relative w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl m-auto" style="margin: auto !important; font-family: inherit;">
            <div style="padding:18px 24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                <h3 style="margin:0; font-size:16px; font-weight:700; color:#0f172a; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-folder-plus text-teal-600"></i>
                    Tambah Kategori Baru
                </h3>
                <button type="button" @click="showNewCategoryModal=false" style="border:none; background:#e2e8f0; width:28px; height:28px; border-radius:50%; font-size:14px; cursor:pointer; color:#475569; display:flex; align-items:center; justify-content:center;">&times;</button>
            </div>
            <form @submit.prevent="submitNewCategory()" style="padding:24px;">
                <div style="margin-bottom:18px;">
                    <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:6px;">Nama Kategori</label>
                    <input type="text" x-model="newCategoryInput" placeholder="Misal: Info Kampus, Opini Kader..." class="input" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:14px; outline:none; box-sizing:border-box;" autofocus>
                    <p style="font-size:11px; color:#64748b; margin-top:5px;">Kategori ini akan langsung dipilih dan ditambahkan ke daftar kategori artikel.</p>
                </div>
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button type="button" @click="showNewCategoryModal=false" class="btn" style="padding:9px 16px; font-size:13px; background:white; border:1px solid #cbd5e1; border-radius:8px; cursor:pointer; font-weight:600; color:#475569;">Batal</button>
                    <button type="submit" class="btn" style="padding:9px 18px; font-size:13px; background:#0d9488; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:6px;">
                        <i class="fas fa-check"></i> Simpan Kategori
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL 3: POPUP SISTEM RENAME TAXONOMY (Kategori / Tag) -->
    <div x-show="showRenameModal" class="fixed inset-0 z-[100000] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" style="display: flex !important; justify-content: center !important; align-items: center !important;" x-cloak>
        <div class="relative w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl m-auto" style="margin: auto !important; font-family: inherit;">
            <div style="padding:18px 24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                <h3 style="margin:0; font-size:16px; font-weight:700; color:#0f172a; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-edit text-amber-600"></i>
                    Edit Nama <span x-text="renameTargetType === 'category' ? 'Kategori' : 'Tag'"></span>
                </h3>
                <button type="button" @click="showRenameModal=false" style="border:none; background:#e2e8f0; width:28px; height:28px; border-radius:50%; font-size:14px; cursor:pointer; color:#475569; display:flex; align-items:center; justify-content:center;">&times;</button>
            </div>
            <form @submit.prevent="submitRenameTaxonomy()" style="padding:24px;">
                <div style="margin-bottom:14px;">
                    <label style="display:block; font-size:12px; font-weight:600; color:#64748b; margin-bottom:4px;">Nama Sekarang</label>
                    <div style="padding:8px 12px; background:#f1f5f9; border-radius:8px; font-size:13px; font-weight:600; color:#334155;" x-text="renameOldValue"></div>
                </div>
                <div style="margin-bottom:18px;">
                    <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:6px;">Nama Baru</label>
                    <input type="text" x-model="renameNewValue" class="input" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:14px; outline:none; box-sizing:border-box;" required autofocus>
                    <p style="font-size:11px; color:#64748b; margin-top:5px;">Perubahan ini akan otomatis diperbarui pada seluruh artikel terkait di database.</p>
                </div>
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button type="button" @click="showRenameModal=false" :disabled="isRenamingTaxonomy" class="btn" style="padding:9px 16px; font-size:13px; background:white; border:1px solid #cbd5e1; border-radius:8px; cursor:pointer; font-weight:600; color:#475569;">Batal</button>
                    <button type="submit" :disabled="isRenamingTaxonomy" class="btn" style="padding:9px 18px; font-size:13px; background:#0d9488; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:6px;">
                        <span x-show="!isRenamingTaxonomy"><i class="fas fa-save"></i> Simpan Perubahan</span>
                        <span x-show="isRenamingTaxonomy"><i class="fas fa-spinner fa-spin"></i> Menyimpan...</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL 4: POPUP SISTEM KONFIRMASI HAPUS TAXONOMY -->
    <div x-show="showDeleteModal" class="fixed inset-0 z-[100000] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" style="display: flex !important; justify-content: center !important; align-items: center !important;" x-cloak>
        <div class="relative w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl m-auto" style="margin: auto !important; font-family: inherit;">
            <div style="padding:18px 24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; background:#fef2f2;">
                <h3 style="margin:0; font-size:16px; font-weight:700; color:#991b1b; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-exclamation-triangle text-rose-600"></i>
                    Konfirmasi Hapus <span x-text="deleteTargetType === 'category' ? 'Kategori' : 'Tag'"></span>
                </h3>
                <button type="button" @click="showDeleteModal=false" style="border:none; background:#fee2e2; width:28px; height:28px; border-radius:50%; font-size:14px; cursor:pointer; color:#991b1b; display:flex; align-items:center; justify-content:center;">&times;</button>
            </div>
            <div style="padding:24px;">
                <p style="font-size:14px; color:#334155; margin:0 0 12px 0; line-height:1.5;">
                    Apakah Anda yakin ingin menghapus <span x-text="deleteTargetType === 'category' ? 'kategori' : 'tag'"></span> 
                    &ldquo;<b class="text-slate-900" x-text="deleteTargetItem"></b>&rdquo;?
                </p>
                <div style="padding:10px 14px; background:#fff1f2; border:1px solid #fecdd3; border-radius:8px; font-size:12px; color:#9f1239; margin-bottom:20px;">
                    <span x-show="deleteTargetType === 'category'">Artikel yang menggunakan kategori ini akan dialihkan ke kategori <b>Uncategorized</b>.</span>
                    <span x-show="deleteTargetType !== 'category'">Tag ini akan dihapus dari seluruh artikel yang menggunakannya.</span>
                </div>
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button type="button" @click="showDeleteModal=false" :disabled="isDeletingTaxonomy" class="btn" style="padding:9px 16px; font-size:13px; background:white; border:1px solid #cbd5e1; border-radius:8px; cursor:pointer; font-weight:600; color:#475569;">Batal</button>
                    <button type="button" @click="submitDeleteTaxonomy()" :disabled="isDeletingTaxonomy" class="btn" style="padding:9px 18px; font-size:13px; background:#dc2626; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:6px;">
                        <span x-show="!isDeletingTaxonomy"><i class="fas fa-trash"></i> Ya, Hapus Sekarang</span>
                        <span x-show="isDeletingTaxonomy"><i class="fas fa-spinner fa-spin"></i> Menghapus...</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
`;
