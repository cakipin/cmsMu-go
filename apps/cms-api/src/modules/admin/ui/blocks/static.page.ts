import { customEditorTemplate } from "./custom-editor";

export const staticPage = `
<div x-show="view === 'pages' || view === 'add-page'" 
     @open-editor-media.window="openMediaForEditor()"
     class="animate-fade min-h-[calc(100vh-120px)] bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden"
     x-data="{
         // --- CORE STATE ---
         searchQuery: '',
         pagesList: [],
         selectedItems: [],
         isLoading: false,
         
         // --- EDITOR STATE ---
         form: { title: '', slug: '', body: '', status: 'publish', featured_image: '', layout: 'standard' },
         isSaving: false,
         editorInstance: null,

         // --- MEDIA MANAGER STATE ---
         mediaModalOpen: false,
         mediaTab: 'library',
         mediaList: [],
         uploadFile: null,
         uploadPreview: null,
         selectedMedia: null,
         mediaSearchQuery: '',
         mediaForm: { title: '', alt: '', caption: '', description: '' },

         // ============================================================
         // 1. PAGE LIST LOGIC
         // ============================================================
         async loadPages() {
             this.isLoading = true;
             const token = localStorage.getItem('labmu_token');
             try {
                 const res = await fetch('/api/pages', { headers: { 'Authorization': 'Bearer ' + token } });
                 if(res.ok) {
                     const json = await res.json();
                     this.pagesList = Array.isArray(json) ? json : (json.results || []);
                 }
             } catch(e) { console.error(e); }
             finally { this.isLoading = false; }
         },

         formatDate(val) {
            if (!val) return '-';
            if (!isNaN(val) && !isNaN(parseFloat(val))) {
                 const num = Number(val);
                 const dateObj = new Date(num < 10000000000 ? num * 1000 : num); 
                 return dateObj.toLocaleDateString('id-ID');
            }
            return new Date(val).toLocaleDateString('id-ID');
         },

         get filteredPages() {
             const q = this.searchQuery.toLowerCase();
             return (this.pagesList || []).filter(p => (p.title||'').toLowerCase().includes(q));
         },

         editPage(p) {
             window.editingPageId = p.id; 
             this.view = 'add-page';
         },

         previewPage(slug) {
             if(!slug) return window.showToast && window.showToast('Halaman belum memiliki link.', 'warning');
             window.open('/' + slug, '_blank');
         },

         async deletePages() {
             if (this.selectedItems.length === 0) return;
             const confirmed = window.showConfirmDialog
                 ? await window.showConfirmDialog({
                     title: 'Hapus Halaman Terpilih',
                     message: 'Apakah Anda yakin ingin menghapus ' + this.selectedItems.length + ' halaman terpilih?',
                     type: 'danger',
                     confirmText: 'Ya, Hapus'
                 })
                 : false;
             if (!confirmed) return;
             const token = localStorage.getItem('labmu_token');
             for (const id of this.selectedItems) {
                 await fetch('/api/pages', { 
                     method: 'DELETE', 
                     headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                     body: JSON.stringify({ id: id })
                 });
             }
             this.selectedItems = [];
             if (window.showToast) window.showToast('Halaman terpilih berhasil dihapus', 'success');
             await this.loadPages();
         },

         async deleteSinglePage(p) {
             const confirmed = window.showConfirmDialog
                 ? await window.showConfirmDialog({
                     title: 'Hapus Halaman',
                     message: 'Apakah Anda yakin ingin menghapus halaman "' + p.title + '"?',
                     type: 'danger',
                     confirmText: 'Ya, Hapus'
                 })
                 : false;
             if (!confirmed) return;
             const token = localStorage.getItem('labmu_token');
             try {
                 const res = await fetch('/api/pages', { 
                     method: 'DELETE', 
                     headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                     body: JSON.stringify({ id: p.id })
                 });
                 if (res.ok) {
                     if(window.showToast) window.showToast('Halaman berhasil dihapus', 'success');
                     await this.loadPages();
                 } else {
                     if(window.showToast) window.showToast('Gagal menghapus halaman.', 'error');
                 }
             } catch(e) { console.error(e); }
         },


         // ============================================================
         // 2. EDITOR LOGIC
         // ============================================================
         // --- MEDIA LOGIC UNTUK CUSTOM EDITOR ---
         openMediaForEditor() {
             // Trigger buka selector buat editor statis
             window.dispatchEvent(new CustomEvent('save-editor-selection'));
             this.openMediaSelector();
             this.mediaSelectorTarget = 'custom-editor';
         },

         async initPageEditor() {
             this.form = { title: '', slug: '', body: '', status: 'publish', featured_image: '', layout: 'standard' };
             
             if(window.editingPageId) {
                 await this.loadSinglePage(window.editingPageId);
             }
             // Editor internal auto bind by x-init
         },

         async loadSinglePage(id) {
             try {
                 const token = localStorage.getItem('labmu_token');
                 const res = await fetch('/api/pages/' + id, { headers: { 'Authorization': 'Bearer ' + token } });
                 if(res.ok) this.form = await res.json();
             } catch(e) { if(window.showToast) window.showToast('Gagal load data', 'error'); }
         },

         async savePage() {
             this.isSaving = true;
             // form.body is automatically updated by the custom editor
             if(!this.form.slug) this.form.slug = this.form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

             const token = localStorage.getItem('labmu_token');
             const isEdit = !!window.editingPageId;
             const url = isEdit ? '/api/pages/' + window.editingPageId : '/api/pages';
             const method = isEdit ? 'PUT' : 'POST';

             try {
                 const res = await fetch(url, {
                     method: method,
                     headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                     body: JSON.stringify(this.form)
                 });
                 
                 if(res.ok) {
                     const resJson = await res.json().catch(() => ({}));
                     if (resJson && resJson.id) {
                         window.editingPageId = resJson.id;
                     }
                     if (typeof window !== 'undefined' && window.showToast) {
                         window.showToast('Halaman berhasil disimpan!', 'success', 4000);
                     }
                 } else {
                     const resJson = await res.json().catch(() => ({}));
                     const errMsg = (resJson && resJson.error) || 'Gagal simpan.';
                     if (typeof window !== 'undefined' && window.showToast) {
                         window.showToast('Gagal: ' + errMsg, 'error', 5000);
                     }
                 }
             } catch(e) { 
                 if (typeof window !== 'undefined' && window.showToast) {
                     window.showToast('Error: ' + e.message, 'error', 5000);
                 }
             }
             finally { this.isSaving = false; }
         },

         // ============================================================
         // 3. MEDIA MANAGER LOGIC
         // ============================================================
         async openMediaSelector() {
             this.mediaModalOpen = true;
             this.mediaTab = 'library';
             this.selectedMedia = null;
             this.mediaSearchQuery = '';
             this.mediaForm = { title:'', alt:'', caption:'', description:'' }; 
             await this.loadMediaLibrary();
         },

         async loadMediaLibrary() {
             this.mediaList = [];
             try {
                 const token = localStorage.getItem('labmu_token');
                 const res = await fetch('/api/media', { headers: { 'Authorization': 'Bearer ' + token } });
                 const json = await res.json();
                 let raw = Array.isArray(json) ? json : (json.results || []);
                 this.mediaList = raw.map(m => ({
                     ...m,
                     url: m.url || m.file_url || '',
                     title: m.title || (m.key ? m.key.split('/').pop() : 'No Title')
                 }));
             } catch(e) { console.error('Library Error', e); }
         },

         get filteredMediaList() {
             if(!this.mediaSearchQuery) return this.mediaList;
             const q = this.mediaSearchQuery.toLowerCase();
             return this.mediaList.filter(m => (m.title||'').toLowerCase().includes(q));
         },

         selectMediaItem(img) {
             this.selectedMedia = { ...img }; 
             this.mediaForm = { title: img.title||'', alt: img.alt||'', caption: img.caption||'', description: img.description||'' };
         },

         confirmMediaSelection() {
             if (!this.selectedMedia || !this.selectedMedia.url) return window.showToast && window.showToast('Pilih gambar dulu!', 'warning');
             
             if (this.mediaSelectorTarget === 'custom-editor') {
                 // Trigger event untuk insert media ke dalam editor
                 window.dispatchEvent(new CustomEvent('insert-media', { detail: { url: this.selectedMedia.url } }));
                 this.mediaSelectorTarget = null;
             } else {
                 this.form.featured_image = this.selectedMedia.url;
             }
             this.mediaModalOpen = false;
         },

         onFileSelect(e) {
             const file = e.target.files[0];
             if (!file) return;
             this.uploadFile = file;
             this.uploadPreview = URL.createObjectURL(file);
             this.mediaForm.title = file.name.split('.')[0].replace(/-/g, ' '); 
         },

         async uploadMediaAction() {
             if (!this.uploadFile) return window.showToast && window.showToast('Pilih file dulu', 'warning');
             const fd = new FormData();
             fd.append('file', this.uploadFile);
             fd.append('title', this.mediaForm.title);
             fd.append('alt', this.mediaForm.alt);
             fd.append('caption', this.mediaForm.caption);
             fd.append('description', this.mediaForm.description);
             
             try {
                 const token = localStorage.getItem('labmu_token');
                 const res = await fetch('/api/media', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token }, body: fd });
                 if (res.ok) {
                     const result = await res.json();
                     await this.loadMediaLibrary();
                     this.mediaTab = 'library';
                     const newUrl = result.url || result.file_url;
                     const newImg = this.mediaList.find(m => m.url === newUrl);
                     if (newImg) this.selectMediaItem(newImg);
                     this.uploadFile = null; this.uploadPreview = null;
                 } else { if(window.showToast) window.showToast('Gagal upload.', 'error'); }
             } catch(e) { if(window.showToast) window.showToast('Error upload', 'error'); }
         },

         async updateMediaDetails() {
             if(!this.selectedMedia) return;
             try {
                 const token = localStorage.getItem('labmu_token');
                 await fetch('/api/media/meta', { 
                     method: 'POST', 
                     headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                     body: JSON.stringify({ key: this.selectedMedia.key, ...this.mediaForm })
                 });
                 if(window.showToast) window.showToast('Info media tersimpan!', 'success');
             } catch(e) { console.log('Saved locally'); }
         },
     }"
     x-effect="if(view === 'pages') loadPages(); if(view === 'add-page') initPageEditor();">

    <!-- VIEW: DAFTAR HALAMAN STATIS -->
    <div x-show="view === 'pages'" class="flex flex-col flex-1">
        <!-- Header Toolbar Responsif -->
        <div class="border-b border-slate-200 p-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white">
            <div class="flex items-center justify-between sm:justify-start gap-3">
                <div class="flex items-center gap-2">
                    <h2 class="m-0 text-base sm:text-lg font-bold text-slate-800">Halaman Statis</h2>
                    <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium" x-text="filteredPages.length + ' item'"></span>
                </div>
                <button x-show="selectedItems.length > 0" @click="deletePages()" 
                        class="bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-md text-xs font-semibold hover:bg-red-100 active:scale-95 transition-all">
                    <i class="fas fa-trash"></i> Hapus (<span x-text="selectedItems.length"></span>)
                </button>
            </div>
            
            <div class="flex items-center gap-2 w-full sm:w-auto">
                <div class="relative flex-1 sm:w-60">
                    <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input type="text" x-model="searchQuery" placeholder="Cari halaman..." 
                           class="w-full pl-8 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-md focus:border-blue-500 outline-none">
                </div>
                <button @click="window.editingPageId=null; view='add-page'" 
                        class="min-h-[38px] px-3.5 py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white border-none rounded-md font-semibold flex items-center gap-1.5 active:scale-95 transition-all flex-shrink-0 shadow-sm">
                    <i class="fas fa-plus"></i> <span class="hidden xs:inline">Tambah Baru</span>
                </button>
            </div>
        </div>

        <!-- Desktop Table View (Hidden di Mobile) -->
        <div class="hidden md:block overflow-x-auto flex-1">
            <table style="width:100%; border-collapse:collapse;">
                <thead style="background:#f9fafb; position:sticky; top:0; z-index:10;">
                    <tr>
                        <th style="padding:12px 20px; width:40px; text-align:center; border-bottom:1px solid #e5e7eb;">
                            <input type="checkbox" @change="selectedItems = selectedItems.length === filteredPages.length ? [] : filteredPages.map(p=>p.id)">
                        </th>
                        <th style="padding:12px 20px; text-align:left; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; border-bottom:1px solid #e5e7eb;">Judul</th>
                        <th style="padding:12px 20px; text-align:left; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; border-bottom:1px solid #e5e7eb;">Slug</th>
                        <th style="padding:12px 20px; text-align:center; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; border-bottom:1px solid #e5e7eb;">Views</th>
                        <th style="padding:12px 20px; text-align:center; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; border-bottom:1px solid #e5e7eb;">Tanggal</th>
                        <th style="padding:12px 20px; text-align:right; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; border-bottom:1px solid #e5e7eb;">Aksi</th>
                    </tr>
                </thead>
                <tbody style="font-size:13px;">
                    <template x-for="p in filteredPages" :key="p.id">
                        <tr style="border-bottom:1px solid #f3f4f6;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
                            <td style="padding:15px 20px; text-align:center;">
                                <input type="checkbox" :value="p.id" x-model="selectedItems">
                            </td>
                            <td style="padding:15px 20px; font-weight:600;" x-text="p.title"></td>
                            <td style="padding:15px 20px;"><span style="background:#f3f4f6; padding:4px 8px; border-radius:4px; font-family:monospace;" x-text="'/'+p.slug"></span></td>
                            <td style="padding:15px 20px; text-align:center; font-weight:bold; color:#64748b;" x-text="p.views || 0"></td>
                            <td style="padding:15px 20px; text-align:center;" x-text="formatDate(p.created_at)"></td>
                            <td style="padding:15px 20px; text-align:right;">
                                <div style="display:flex; justify-content:flex-end; gap:8px;">
                                    <button @click="previewPage(p.slug)" title="Lihat" style="color:#059669; border:1px solid #d1fae5; background:#ecfdf5; padding:6px 10px; border-radius:4px; cursor:pointer;"><i class="fas fa-eye"></i></button>
                                    <button @click="editPage(p)" title="Edit" style="color:#2563eb; border:1px solid #dbeafe; background:#eff6ff; padding:6px 10px; border-radius:4px; cursor:pointer;"><i class="fas fa-pencil-alt"></i> Edit</button>
                                    <button @click="deleteSinglePage(p)" title="Hapus" style="color:#dc2626; border:1px solid #fee2e2; background:#fef2f2; padding:6px 10px; border-radius:4px; cursor:pointer;"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>

        <!-- Mobile Card List View (Block di Mobile) -->
        <div class="block md:hidden divide-y divide-slate-100 flex-1">
            <!-- Mobile Select All Bar -->
            <div class="p-3 bg-slate-50 flex items-center justify-between text-xs text-slate-600 border-b border-slate-200">
                <label class="flex items-center gap-2 cursor-pointer font-medium">
                    <input type="checkbox" @change="selectedItems = selectedItems.length === filteredPages.length ? [] : filteredPages.map(p=>p.id)" class="rounded text-blue-600">
                    <span>Pilih Semua Halaman</span>
                </label>
                <span x-show="selectedItems.length > 0" class="font-semibold text-blue-600" x-text="selectedItems.length + ' dipilih'"></span>
            </div>

            <!-- Mobile Cards -->
            <template x-for="p in filteredPages" :key="p.id">
                <div class="p-3.5 transition-colors" :class="selectedItems.includes(p.id) ? 'bg-blue-50/60' : 'bg-white'">
                    <div class="flex items-start gap-2.5">
                        <input type="checkbox" :value="p.id" x-model="selectedItems" class="mt-1 rounded text-blue-600 flex-shrink-0">
                        <div class="flex-1 min-w-0">
                            <!-- Judul Halaman -->
                            <h3 class="text-sm font-semibold text-slate-900 leading-snug mb-1 cursor-pointer hover:text-blue-600 break-words" 
                                x-text="p.title" @click="editPage(p)"></h3>
                            
                            <!-- Slug URL -->
                            <div class="text-[11px] text-slate-500 font-mono truncate mb-2" x-text="'/' + p.slug"></div>

                            <!-- Metadata: Views & Tanggal -->
                            <div class="flex items-center gap-4 text-xs text-slate-500 mb-2.5">
                                <span class="inline-flex items-center gap-1 font-semibold text-slate-600">
                                    <i class="fas fa-eye text-[10px] text-slate-400"></i>
                                    <span x-text="p.views || 0"></span> views
                                </span>
                                <span class="inline-flex items-center gap-1">
                                    <i class="far fa-calendar-alt text-[10px] text-slate-400"></i>
                                    <span x-text="formatDate(p.created_at)"></span>
                                </span>
                            </div>

                            <!-- Mobile Action Buttons (Tap target min 40px) -->
                            <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
                                <button type="button" @click="previewPage(p.slug)" title="Lihat Halaman" 
                                        class="min-h-[40px] px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md flex items-center justify-center gap-1.5 flex-1 active:scale-95 transition-all">
                                    <i class="fas fa-eye text-emerald-600"></i> Preview
                                </button>
                                <button type="button" @click="editPage(p)" title="Edit Halaman" 
                                        class="min-h-[40px] px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center justify-center gap-1.5 flex-1 active:scale-95 transition-all">
                                    <i class="fas fa-pencil-alt text-blue-600"></i> Edit
                                </button>
                                <button type="button" @click="deleteSinglePage(p)" title="Hapus Halaman" 
                                        class="min-h-[40px] px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md flex items-center justify-center gap-1.5 active:scale-95 transition-all">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- Empty & Loading State -->
        <div x-show="isLoading" class="text-center py-8 text-slate-500 text-sm">
            <i class="fas fa-spinner fa-spin mr-1"></i> Memuat daftar halaman statis...
        </div>
        <div x-show="!isLoading && filteredPages.length === 0" class="text-center py-10 text-slate-400 text-sm">
            Belum ada atau tidak ditemukan halaman statis.
        </div>
    </div>

    <!-- VIEW: FORM TAMBAH / EDIT HALAMAN STATIS -->
    <div x-show="view === 'add-page'" class="p-3 sm:p-5 md:p-6 flex-1 box-border">
        <!-- Header Add/Edit Page Responsif -->
        <div class="flex items-center justify-between gap-2.5 mb-4 sticky top-0 z-20 bg-white/95 backdrop-blur py-2 px-1 rounded-md sm:static sm:bg-transparent sm:py-0 sm:px-0 border-b sm:border-b-0 border-slate-200">
            <div class="flex items-center gap-2 min-w-0">
                <button type="button" @click="view = 'pages'" 
                        class="btn min-h-[40px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md shadow-sm active:scale-95 transition-all text-xs sm:text-sm flex items-center gap-1.5 flex-shrink-0">
                    <i class="fas fa-arrow-left"></i> <span class="hidden sm:inline">Kembali</span>
                </button>
                <h2 class="text-sm sm:text-xl font-bold text-slate-800 m-0 truncate" x-text="window.editingPageId ? 'Edit Halaman' : 'Tambah Halaman Baru'"></h2>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
                <a x-show="form.slug" :href="'/' + form.slug" target="_blank" 
                   class="btn min-h-[40px] px-3 py-2 bg-slate-100 text-slate-600 border border-slate-300 rounded-md shadow-sm hover:bg-slate-200 flex items-center justify-center text-xs active:scale-95 transition-all" 
                   title="Preview Halaman">
                    <i class="fas fa-external-link-alt"></i>
                </a>
                <button type="button" @click="savePage()" 
                        class="btn min-h-[40px] px-3.5 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm flex items-center gap-1.5 text-xs sm:text-sm active:scale-95 transition-all" :disabled="isSaving">
                    <i class="fas fa-spinner fa-spin" x-show="isSaving"></i>
                    <i class="fas fa-save" x-show="!isSaving"></i>
                    <span x-text="isSaving ? 'Menyimpan...' : 'Simpan'"></span>
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 lg:gap-6 items-start pb-12 md:pb-6">
            <div style="min-width:0;">
                <input x-model="form.title" placeholder="Judul Halaman..." 
                       class="w-full text-lg sm:text-2xl font-bold p-3 sm:p-3.5 mb-4 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800 transition-all box-border"
                       @input="if(!window.editingPageId) form.slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');">
                
                <div style="margin-bottom:20px;">
                    ${customEditorTemplate}
                </div>
            </div>

            <div class="flex flex-col gap-5">
                <div class="card p-4 bg-white border border-slate-200 rounded-xl border-t-4 border-t-blue-600 shadow-xs">
                    <h3 class="m-0 mb-3.5 text-sm font-bold text-slate-800">Publikasi Halaman</h3>
                    <div class="mb-3.5">
                        <label class="text-xs font-semibold text-slate-600 block mb-1">Slug / URL</label>
                        <input x-model="form.slug" class="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono bg-slate-50 text-slate-700 outline-none focus:bg-white focus:border-blue-500 box-border">
                    </div>
                    <div class="mb-3.5">
                        <label class="text-xs font-semibold text-slate-600 block mb-1">Status</label>
                        <select x-model="form.status" class="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 outline-none focus:border-blue-500">
                            <option value="publish">Published (Terbit)</option>
                            <option value="draft">Draft (Konsep)</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="text-xs font-semibold text-slate-600 block mb-1">Layout Halaman</label>
                        <select x-model="form.layout" class="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 outline-none focus:border-blue-500">
                            <option value="standard">Standard Page (Sidebar & Menu)</option>
                            <option value="landing">Landing Page (Penuh / Builder Custom)</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-2">
                        <button @click="savePage()" :disabled="isSaving" 
                                class="w-full min-h-[42px] px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-xl font-bold text-xs cursor-pointer shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                            <span x-text="isSaving ? 'Menyimpan...' : 'Simpan Halaman'"></span>
                        </button>
                        <button @click="window.location.href = '/theme-editor?slug=' + form.slug" 
                                class="w-full min-h-[42px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-xl font-bold text-xs cursor-pointer shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2">
                            <i class="fas fa-magic"></i> Visual Editor Halaman
                        </button>
                    </div>
                </div>

                <div class="card p-0 overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
                    <div style="padding:12px 15px; border-bottom:1px solid #f3f4f6; display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="margin:0; font-size:13px; font-weight:600; color:#374151; text-transform:uppercase;">Featured Image</h3>
                        <i class="fas fa-star" style="color:#fbbf24; font-size:12px;"></i>
                    </div>

                    <div x-show="!form.featured_image" 
                         @click="openMediaSelector()"
                         style="padding:40px 20px; text-align:center; cursor:pointer; background:#f9fafb; transition:all 0.2s;"
                         onmouseover="this.style.background='#f3f4f6'" 
                         onmouseout="this.style.background='#f9fafb'">
                        
                        <div style="width:60px; height:60px; background:#e5e7eb; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px auto;">
                            <i class="fas fa-image fa-2x" style="color:#9ca3af;"></i>
                        </div>
                        <div style="font-weight:600; color:#4b5563; font-size:14px;">Tetapkan Gambar Unggulan</div>
                        <div style="color:#9ca3af; font-size:12px; margin-top:5px;">Klik untuk memilih dari library</div>
                    </div>

                    <div x-show="form.featured_image" style="position:relative;">
                        <div style="width:100%; aspect-ratio:16/9; background:#eee; position:relative; overflow:hidden;">
                            <img :src="form.featured_image" 
                                 style="width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.5s;"
                                 onmouseover="this.style.transform='scale(1.05)'"
                                 onmouseout="this.style.transform='scale(1)'">
                        </div>
                        <div style="background:white; padding:10px 15px; border-top:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center;">
                            <div style="font-size:11px; color:#6b7280; font-weight:500;">
                                <i class="fas fa-check-circle" style="color:#10b981;"></i> Terpasang
                            </div>
                            <div style="display:flex; gap:8px;">
                                <button type="button" @click="openMediaSelector()" title="Ganti Gambar"
                                        style="padding:6px 10px; background:#eff6ff; color:#2563eb; border:1px solid #dbeafe; border-radius:4px; font-size:11px; font-weight:600; cursor:pointer;">
                                    <i class="fas fa-exchange-alt"></i> Ganti
                                </button>
                                <button type="button" @click="form.featured_image=''" title="Hapus Gambar"
                                        style="padding:6px 10px; background:#fef2f2; color:#dc2626; border:1px solid #fee2e2; border-radius:4px; font-size:11px; font-weight:600; cursor:pointer;">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL SELECTOR MEDIA UNTUK HALAMAN STATIS (Responsif Mobile) -->
    <div x-show="mediaModalOpen" 
         class="fixed inset-0 w-screen h-screen bg-black/60 backdrop-blur-xs z-[999999] flex justify-center items-center p-2 sm:p-4 box-border" 
         x-transition.opacity
         x-cloak>
        
        <div class="bg-white w-full max-w-5xl h-[92vh] sm:h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl font-sans m-auto">
            
            <div class="p-3 sm:px-6 sm:py-4 border-b border-slate-200 flex justify-between items-center bg-white gap-2">
                <div class="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                    <h3 class="m-0 text-sm sm:text-lg font-bold text-slate-800 truncate">Media Manager</h3>
                    
                    <div class="flex gap-1 sm:gap-2 bg-slate-100 p-1 sm:p-1.5 rounded-xl shrink-0">
                        <button type="button" @click="mediaTab='library'" 
                                :class="mediaTab==='library' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 bg-transparent hover:text-slate-800'"
                                class="border-0 outline-none px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all">
                            Library
                        </button>
                        <button type="button" @click="mediaTab='upload'" 
                                :class="mediaTab==='upload' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 bg-transparent hover:text-slate-800'"
                                class="border-0 outline-none px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all">
                            Upload Baru
                        </button>
                    </div>
                </div>

                <div class="flex items-center gap-2 sm:gap-3">
                    <div x-show="mediaTab === 'library'" class="relative hidden sm:block">
                        <input x-model="mediaSearchQuery" placeholder="Cari media..." 
                               class="py-1.5 pl-8 pr-6 rounded-lg border border-slate-200 text-xs w-44 outline-none focus:border-blue-500">
                        <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <button type="button" x-show="mediaSearchQuery" @click="mediaSearchQuery=''" class="absolute right-2 top-1/2 -translate-y-1/2 border-0 bg-transparent text-slate-400 cursor-pointer text-xs">&times;</button>
                    </div>

                    <button type="button" @click="mediaModalOpen=false" class="border-0 bg-slate-100 hover:bg-slate-200 w-8 h-8 sm:w-9 sm:h-9 rounded-full text-base sm:text-lg cursor-pointer text-slate-500 flex items-center justify-center transition-colors">&times;</button>
                </div>
            </div>

            <div class="flex flex-col md:flex-row flex-1 overflow-hidden relative">
                
                <div class="flex-1 bg-slate-50 overflow-y-auto p-3 sm:p-5 relative">
                    <!-- Search input mobile -->
                    <div x-show="mediaTab === 'library'" class="relative block sm:hidden mb-3">
                        <input x-model="mediaSearchQuery" placeholder="Cari media..." 
                               class="w-full py-2 pl-8 pr-6 rounded-lg border border-slate-200 text-xs outline-none focus:border-blue-500 bg-white">
                        <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <button type="button" x-show="mediaSearchQuery" @click="mediaSearchQuery=''" class="absolute right-2 top-1/2 -translate-y-1/2 border-0 bg-transparent text-slate-400 cursor-pointer text-xs">&times;</button>
                    </div>

                    <div x-show="mediaTab === 'library'">
                        <div class="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 pb-8">
                            <template x-for="img in filteredMediaList" :key="img.key">
                                <div @click="selectMediaItem(img)" 
                                     class="cursor-pointer relative aspect-square bg-white rounded-lg overflow-hidden border transition-all duration-150"
                                     :class="selectedMedia && selectedMedia.url === img.url ? 'ring-2 ring-blue-500 border-blue-500 shadow-md scale-95' : 'border-slate-200 hover:border-blue-400 hover:shadow-xs'">
                                    
                                    <img :src="img.url" loading="lazy" class="w-full h-full object-cover block bg-slate-100">
                                    
                                    <div x-show="selectedMedia && selectedMedia.url === img.url" 
                                         class="absolute top-1.5 right-1.5 bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] ring-1 ring-white shadow-xs">
                                        <i class="fas fa-check"></i>
                                    </div>
                                </div>
                            </template>
                        </div>

                        <div x-show="filteredMediaList.length===0" class="flex flex-col items-center justify-center py-16 text-slate-400">
                            <div class="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-3">
                                <i class="fas fa-search text-lg"></i>
                            </div>
                            <p class="font-bold text-xs text-slate-600 m-0 mb-1">Tidak ada media ditemukan</p>
                            <p class="text-[11px] text-slate-400 m-0">Coba kata kunci lain atau upload baru.</p>
                        </div>
                    </div>

                    <div x-show="mediaTab === 'upload'" class="h-full flex flex-col items-center justify-center py-6">
                        <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 w-full max-w-sm text-center shadow-xs">
                             <div x-show="!uploadPreview">
                                <label class="block p-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-colors bg-slate-50">
                                    <div class="w-12 h-12 bg-white rounded-full inline-flex items-center justify-center mb-3 shadow-xs text-blue-600">
                                        <i class="fas fa-cloud-upload-alt text-xl"></i>
                                    </div>
                                    <div class="font-bold text-slate-700 text-xs sm:text-sm mb-1">Klik untuk pilih file</div>
                                    <div class="text-slate-400 text-[10px]">JPG, PNG, WEBP (Max 5MB)</div>
                                    <input type="file" @change="onFileSelect" class="hidden" accept="image/*">
                                </label>
                            </div>
                            <div x-show="uploadPreview">
                                <img :src="uploadPreview" class="max-h-48 w-auto mb-4 rounded-lg border border-slate-200 mx-auto">
                                <br>
                                <button type="button" @click="uploadFile=null;uploadPreview=null" class="bg-white border border-slate-200 px-4 py-2 rounded-lg text-rose-600 font-bold cursor-pointer text-xs">Ganti File</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SIDEBAR DETAIL FILE (Responsif Drawer / Bottom Sheet di Mobile) -->
                <div class="w-full md:w-[320px] bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col shrink-0 max-h-[45vh] md:max-h-none overflow-y-auto z-10">
                    
                    <div x-show="mediaTab === 'library' && !selectedMedia" class="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-300">
                            <i class="fas fa-photo-video text-2xl"></i>
                        </div>
                        <h4 class="m-0 mb-1 text-slate-700 text-sm font-bold">Belum ada yang dipilih</h4>
                        <p class="text-xs text-slate-500 m-0">Klik salah satu gambar untuk melihat detail.</p>
                    </div>

                    <template x-if="selectedMedia && mediaTab === 'library'">
                        <div class="flex flex-col h-full">
                            <div class="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                <h4 class="m-0 text-xs font-bold text-slate-700 uppercase tracking-wider">Detail File</h4>
                            </div>
                            <div class="flex-1 overflow-y-auto p-4 space-y-3">
                                <div class="bg-slate-50 rounded-lg border border-slate-100 p-2 flex items-center justify-center aspect-video overflow-hidden">
                                    <img :src="selectedMedia.url" class="max-w-full max-h-full object-contain">
                                </div>
                                <div class="space-y-2.5">
                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-600 mb-1">Judul</label>
                                        <input x-model="mediaForm.title" class="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 text-slate-700">
                                    </div>
                                    <div>
                                        <label class="block text-[11px] font-bold text-slate-600 mb-1">Alt Text (SEO)</label>
                                        <input x-model="mediaForm.alt" class="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 text-slate-700">
                                    </div>
                                    <button type="button" @click="updateMediaDetails()" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border-0 p-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors active:scale-95">
                                        <i class="fas fa-save"></i> Simpan Info Meta
                                    </button>
                                </div>
                            </div>
                            <div class="p-3 sm:p-4 border-t border-slate-200 bg-white">
                                <button type="button" @click="confirmMediaSelection()" 
                                        class="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 min-h-[42px] px-4 rounded-xl font-bold text-xs cursor-pointer shadow-xs flex justify-center items-center gap-2 active:scale-95 transition-all">
                                    <span>Sisipkan Gambar</span>
                                    <i class="fas fa-arrow-right text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </template>

                    <div x-show="mediaTab === 'upload'" class="flex-1 flex flex-col p-4">
                         <h4 class="m-0 mb-3 text-xs font-bold text-slate-700 uppercase tracking-wider">Metadata Upload</h4>
                         <div class="flex-1 overflow-y-auto space-y-2.5">
                            <div><label class="text-[11px] font-bold text-slate-600 mb-1 block">Judul</label><input x-model="mediaForm.title" class="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 text-slate-700"></div>
                            <div><label class="text-[11px] font-bold text-slate-600 mb-1 block">Alt Text</label><input x-model="mediaForm.alt" class="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 text-slate-700"></div>
                         </div>
                         <div class="pt-3 border-t border-slate-200 mt-2">
                            <button type="button" @click="uploadMediaAction()" :disabled="!uploadFile"
                                    class="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 min-h-[42px] px-4 rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-95 disabled:opacity-50">
                                <i class="fas fa-cloud-upload-alt"></i> Upload & Gunakan
                            </button>
                         </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>
`;