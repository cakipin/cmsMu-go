import { customEditorTemplate } from "./custom-editor.ts";

export const staticPage = `
<div x-show="view === 'pages' || view === 'add-page'" class="animate-fade" 
     @open-editor-media.window="openMediaForEditor()"
     style="height: calc(100vh - 100px); background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; display: flex; flex-direction:column;"
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

         getToken() {
             return (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '');
         },

         // ============================================================
         // 1. PAGE LIST LOGIC
         // ============================================================
         async loadPages() {
             this.isLoading = true;
             const token = this.getToken();
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
             if(!slug) return alert('Halaman belum memiliki link.');
             window.open('/' + slug, '_blank');
         },

         async deletePages() {
             if (this.selectedItems.length === 0) return;
             if (!confirm('Hapus ' + this.selectedItems.length + ' item terpilih?')) return;
             const token = this.getToken();
             for (const id of this.selectedItems) {
                 await fetch('/api/pages', { 
                     method: 'DELETE', 
                     headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                     body: JSON.stringify({ id: id })
                 });
             }
             this.selectedItems = [];
             await this.loadPages();
         },

         async deleteSinglePage(p) {
             if (!confirm('Hapus halaman ' + p.title + '?')) return;
             const token = this.getToken();
             try {
                 const res = await fetch('/api/pages', { 
                     method: 'DELETE', 
                     headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                     body: JSON.stringify({ id: p.id })
                 });
                 if (res.ok) {
                     await this.loadPages();
                 } else {
                     alert('Gagal menghapus halaman.');
                 }
             } catch(e) { console.error(e); }
         },


         // ============================================================
         // 2. EDITOR LOGIC
         // ============================================================
         // --- MEDIA LOGIC UNTUK CUSTOM EDITOR ---
         openMediaForEditor() {
             const v = (typeof this.view !== 'undefined' ? this.view : (typeof view !== 'undefined' ? view : ''));
             if (v !== 'add-page' && v !== 'pages') return;
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
                 const token = this.getToken();
                 const res = await fetch('/api/pages/' + id, { headers: { 'Authorization': 'Bearer ' + token } });
                 if(res.ok) this.form = await res.json();
             } catch(e) { alert('Gagal load data'); }
         },

         async savePage() {
             this.isSaving = true;
             // form.body is automatically updated by the custom editor
             if(!this.form.slug) this.form.slug = this.form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

             const token = this.getToken();
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
                     alert('Halaman berhasil disimpan!');
                     this.view = 'pages'; 
                 } else {
                     alert('Gagal simpan.');
                 }
             } catch(e) { alert('Error: ' + e.message); }
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

         uploadFile: null,
         uploadPreview: null,
         cropperInstance: null,
         cropRatio: 16/9,

         initCropper(imageElement, ratio = 16/9) {
             if (this.cropperInstance) this.cropperInstance.destroy();
             if (window.Cropper) {
                 this.cropperInstance = new Cropper(imageElement, {
                     aspectRatio: ratio,
                     viewMode: 1,
                     autoCropArea: 0.9,
                     responsive: true
                 });
             }
         },

         setCropRatio(ratio) {
             this.cropRatio = ratio;
             if (this.cropperInstance) {
                 this.cropperInstance.setAspectRatio(ratio);
             }
         },

         rotateCropper(degree) {
             if (this.cropperInstance) this.cropperInstance.rotate(degree);
         },

         flipCropper() {
             if (this.cropperInstance) {
                 const scaleX = this.cropperInstance.getData().scaleX || 1;
                 this.cropperInstance.scaleX(-scaleX);
             }
         },

         resetCropper() {
             if (this.cropperInstance) this.cropperInstance.reset();
         },

         async getCroppedBlob(maxWidth = 1600, quality = 0.8) {
             if (!this.cropperInstance) return null;
             const canvas = this.cropperInstance.getCroppedCanvas({
                 maxWidth: maxWidth,
                 imageSmoothingEnabled: true,
                 imageSmoothingQuality: 'high'
             });
             return new Promise(resolve => {
                 canvas.toBlob(blob => resolve(blob), 'image/webp', quality);
             });
         },

         async loadMediaLibrary() {
             this.mediaList = [];
             try {
                 const token = this.getToken();
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
             if(!this.mediaSearchQuery) return this.mediaList.slice(0, 60);
             const q = this.mediaSearchQuery.toLowerCase();
             return this.mediaList.filter(m => (m.title||'').toLowerCase().includes(q)).slice(0, 60);
         },

         selectMediaItem(img) {
             this.selectedMedia = { ...img }; 
             this.mediaForm = { title: img.title||'', alt: img.alt||'', caption: img.caption||'', description: img.description||'' };
         },

         confirmMediaSelection() {
             if (!this.selectedMedia || !this.selectedMedia.url) return alert('Pilih gambar dulu!');
             
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
             
             this.$nextTick(() => {
                 if (this.$refs.cropperImage) {
                     this.initCropper(this.$refs.cropperImage, this.cropRatio);
                 }
             });
         },
         
         compressImage(file, quality = 0.7, maxWidth = 1600, seoTitle = '') {
             return new Promise((resolve, reject) => {
                 const reader = new FileReader();
                 reader.readAsDataURL(file);
                 reader.onload = (event) => {
                     const img = new Image();
                     img.src = event.target.result;
                     img.onload = () => {
                         const canvas = document.createElement('canvas');
                         let width = img.width;
                         let height = img.height;
                         if (width > maxWidth) {
                             height = Math.round((height * maxWidth) / width);
                             width = maxWidth;
                         }
                         canvas.width = width;
                         canvas.height = height;
                         const ctx = canvas.getContext('2d');
                         ctx.drawImage(img, 0, 0, width, height);
                         
                         let newName = 'image';
                         if (seoTitle) {
                             newName = seoTitle.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);
                         } else {
                             newName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 40) || 'image';
                         }
                         
                         canvas.toBlob((blob) => {
                             if (!blob) return reject(new Error('Kompresi gagal'));
                             const newFile = new File([blob], newName + '.webp', {
                                 type: 'image/webp',
                                 lastModified: Date.now()
                             });
                             resolve(newFile);
                         }, 'image/webp', quality);
                     };
                     img.onerror = (e) => reject(e);
                 };
                 reader.onerror = (e) => reject(e);
             });
         },

         async uploadMediaAction(useCrop = true) {
             if (!this.uploadFile) return alert('Pilih file dulu');
             
             let finalFile = this.uploadFile;
             const seoTitle = this.form.title || this.mediaForm.title || '';
             let newName = 'image';
             if (seoTitle) {
                 newName = seoTitle.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);
             } else {
                 newName = finalFile.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 40) || 'image';
             }

             if (useCrop && this.cropperInstance) {
                 try {
                     const blob = await this.getCroppedBlob(1600, 0.8);
                     if (blob) {
                         finalFile = new File([blob], newName + '.webp', { type: 'image/webp', lastModified: Date.now() });
                     }
                 } catch (err) {
                     console.warn('Gagal crop, upload file asli', err);
                 }
             } else if (finalFile.type.startsWith('image/')) {
                 try {
                     finalFile = await this.compressImage(finalFile, 0.7, 1600, seoTitle);
                 } catch (err) {
                     console.warn('Gagal kompres', err);
                 }
             }

             const fd = new FormData();
             fd.append('file', finalFile);
             fd.append('title', this.mediaForm.title);
             fd.append('alt', this.mediaForm.alt);
             fd.append('caption', this.mediaForm.caption);
             fd.append('description', this.mediaForm.description);
             
             try {
                 const token = this.getToken();
                 const res = await fetch('/api/media', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token }, body: fd });
                 if (res.ok) {
                     const result = await res.json();
                     await this.loadMediaLibrary();
                     this.mediaTab = 'library';
                     const newUrl = result.url || result.file_url;
                     const newImg = this.mediaList.find(m => m.url === newUrl);
                     if (newImg) this.selectMediaItem(newImg);
                     this.uploadFile = null; this.uploadPreview = null;
                 } else { alert('Gagal upload.'); }
             } catch(e) { alert('Error upload'); }
         },

         async updateMediaDetails() {
             if(!this.selectedMedia) return;
             try {
                 const token = this.getToken();
                 await fetch('/api/media/meta', { 
                     method: 'POST', 
                     headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                     body: JSON.stringify({ key: this.selectedMedia.key, ...this.mediaForm })
                 });
                 alert('Info media tersimpan!');
             } catch(e) { console.log('Saved locally'); }
         },
     }"
     x-effect="if(view === 'pages') loadPages(); if(view === 'add-page') initPageEditor();">

    <div x-show="view === 'pages'" style="display:flex; flex-direction:column; height:100%;">
        <div style="border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; padding:0 30px; height:70px; flex-shrink:0;">
            <div style="display:flex; align-items:center; gap:15px;">
                <h2 style="margin:0; font-size:18px; font-weight:700; color:#1f2937;">Halaman Statis</h2>
                <button x-show="selectedItems.length > 0" @click="deletePages()" style="background:#fee2e2; color:#dc2626; border:1px solid #fecaca; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">
                    <i class="fas fa-trash"></i> Hapus (<span x-text="selectedItems.length"></span>)
                </button>
            </div>
            <div style="display:flex; gap:15px; align-items:center;">
                <input type="text" x-model="searchQuery" placeholder="Cari halaman..." style="padding:8px 12px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; width:220px;">
                <button @click="window.editingPageId=null; view='add-page'" style="padding:8px 20px; font-size:13px; background:#2563eb; color:white; border:none; border-radius:6px; font-weight:600; cursor:pointer;">
                    <i class="fas fa-plus"></i> Tambah Baru
                </button>
            </div>
        </div>

        <div style="overflow-y:auto; flex:1;">
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
    </div>

    <div x-show="view === 'add-page'" style="overflow-y:auto; padding:30px; height:100%; box-sizing:border-box;">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
            <button @click="view = 'pages'" style="background:transparent; color:#555; border:1px solid #ccc; padding:6px 12px; border-radius:6px; cursor:pointer;">
                <i class="fas fa-arrow-left"></i> Kembali
            </button>
            <h2 style="margin:0;" x-text="window.editingPageId ? 'Edit Halaman' : 'Tambah Halaman Baru'"></h2>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 300px; gap:25px;">
            <div style="min-width:0;">
                <input x-model="form.title" placeholder="Judul Halaman..." 
                       style="width:100%; font-size: 24px; font-weight: 600; padding: 15px; margin-bottom: 20px; border:1px solid #ddd; border-radius:4px; box-sizing:border-box;" 
                       @input="if(!window.editingPageId) form.slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');">
                
                <div style="margin-bottom:20px;">
                    ${customEditorTemplate}
                </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:20px;">
                <div class="card" style="padding:15px; background:white; border:1px solid #e5e7eb; border-radius:8px; border-top:3px solid #2271b1;">
                    <h3 style="margin:0 0 15px 0; font-size:14px;">Publish</h3>
                    <div style="margin-bottom:15px;">
                        <label style="font-size:12px; display:block; margin-bottom:5px;">Slug / URL</label>
                        <input x-model="form.slug" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px; font-size:13px; box-sizing:border-box; background:#f9fafb;">
                    </div>
                    <div style="margin-bottom:20px;">
                        <label style="font-size:12px; display:block; margin-bottom:5px;">Status</label>
                        <select x-model="form.status" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                            <option value="publish">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                    <div style="margin-bottom:20px;">
                        <label style="font-size:12px; display:block; margin-bottom:5px;">Layout Halaman</label>
                        <select x-model="form.layout" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                            <option value="standard">Standard Page (Dengan Sidebar & Menu)</option>
                            <option value="landing">Landing Page (Penuh / Builder Custom)</option>
                        </select>
                    </div>
                    <button @click="savePage()" :disabled="isSaving" 
                            style="width:100%; padding:10px; background:#2563eb; color:white; border:none; border-radius:6px; font-weight:600; cursor:pointer;"
                            x-text="isSaving ? 'Menyimpan...' : 'Simpan Halaman'">
                    </button>
                    <button @click="window.location.href = '/theme-editor?slug=' + form.slug" 
                            style="width:100%; margin-top:10px; padding:10px; background:#10b981; color:white; border:none; border-radius:6px; font-weight:600; cursor:pointer; display:flex; justify-content:center; align-items:center; gap:8px;">
                        <i class="fas fa-magic"></i> Visual Editor Halaman
                    </button>
                </div>

                <div class="card" style="padding:0; overflow:hidden; border:1px solid #e5e7eb; border-radius:8px; background:white;">
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

    <template x-teleport="body">
    <div x-show="mediaModalOpen" 
         style="position:fixed; inset:0; top:0; left:0; right:0; bottom:0; width:100vw; height:100vh; background:rgba(0,0,0,0.6); backdrop-filter:blur(5px); z-index:999999; display:flex; justify-content:center; align-items:center; padding:20px; box-sizing:border-box;" 
         x-transition.opacity
         x-cloak>
        
        <div style="background:white; width:100%; max-width:1100px; height:85vh; border-radius:16px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin:auto;">
            
            <div style="padding:16px 24px; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; background:#fff;">
                <div style="display:flex; align-items:center; gap:24px;">
                    <h3 style="margin:0; font-size:18px; font-weight:700; color:#1f2937;">Media Manager</h3>
                    
                    <div style="display:flex; gap: 8px; background:#f3f4f6; padding:6px; border-radius:12px; width: fit-content;">
                        <button type="button" @click="mediaTab='library'" 
                                :style="mediaTab==='library' ? 'background:white; color:#2563eb; box-shadow:0 1px 2px rgba(0,0,0,0.1);' : 'color:#6b7280; background:transparent;'"
                                style="border:none; outline:none; padding:8px 20px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:600; transition:all 0.2s;">
                            Library
                        </button>
                        <button type="button" @click="mediaTab='upload'" 
                                :style="mediaTab==='upload' ? 'background:white; color:#2563eb; box-shadow:0 1px 2px rgba(0,0,0,0.1);' : 'color:#6b7280; background:transparent;'"
                                style="border:none; outline:none; padding:8px 20px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:600; transition:all 0.2s;">
                            Upload Baru
                        </button>
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap:16px;">
                    <div x-show="mediaTab === 'library'" style="position:relative;">
                        <input x-model="mediaSearchQuery" placeholder="Cari media..." 
                               style="padding:8px 12px 8px 36px; border-radius:8px; border:1px solid #e5e7eb; font-size:13px; width:240px; outline:none; transition:border 0.2s;"
                               onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#e5e7eb'">
                        <i class="fas fa-search" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#9ca3af; font-size:12px;"></i>
                        <button type="button" x-show="mediaSearchQuery" @click="mediaSearchQuery=''" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); border:none; background:none; color:#9ca3af; cursor:pointer;">&times;</button>
                    </div>

                    <button type="button" @click="mediaModalOpen=false" style="background:#f3f4f6; border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#4b5563; transition:background 0.2s;" onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <div style="flex:1; display:flex; overflow:hidden;">
                
                <div style="flex:1; background:#f9fafb; overflow-y:auto; padding:24px; position:relative;">
                    
                    <div x-show="mediaTab === 'library'">
                        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap:16px;">
                            <template x-for="img in filteredMediaList" :key="img.key">
                                <div @click="selectMediaItem(img)" 
                                     style="cursor:pointer; position:relative; aspect-ratio:1; background:white; border-radius:8px; overflow:hidden; transition:all 0.2s;"
                                     :style="selectedMedia && selectedMedia.url === img.url ? 'box-shadow: 0 0 0 4px rgba(37,99,235,0.3); border:2px solid #2563eb;' : 'border:1px solid #e5e7eb; box-shadow:0 1px 2px rgba(0,0,0,0.05);'"
                                     onmouseover="this.style.transform='translateY(-2px)'" 
                                     onmouseout="this.style.transform='translateY(0)'">
                                    
                                    <img :src="img.url" loading="lazy" style="width:100%; height:100%; object-fit:cover; display:block; background:#f3f4f6;">
                                    
                                    <div x-show="selectedMedia && selectedMedia.url === img.url" 
                                         x-transition.scale
                                         style="position:absolute; top:8px; right:8px; background:#2563eb; color:white; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.2);">
                                        <i class="fas fa-check"></i>
                                    </div>
                                </div>
                            </template>
                        </div>

                        <div x-show="filteredMediaList.length===0" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#9ca3af; padding:40px;">
                            <div style="width:80px; height:80px; background:#e5e7eb; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
                                <i class="fas fa-search fa-2x" style="color:#9ca3af;"></i>
                            </div>
                            <p style="font-weight:600; margin-bottom:5px; color:#4b5563;">Tidak ada media ditemukan</p>
                            <p style="font-size:13px;">Coba kata kunci lain atau upload gambar baru.</p>
                        </div>
                    </div>

                    <div x-show="mediaTab === 'upload'" style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                        <div style="background:white; padding:40px; border-radius:16px; border:1px solid #e5e7eb; width:100%; max-width:400px; text-align:center; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05);">
                             <div x-show="!uploadPreview">
                                <label style="display:block; padding:40px 20px; border:2px dashed #d1d5db; border-radius:12px; cursor:pointer; transition:all 0.2s; background:#f9fafb;"
                                       onmouseover="this.style.borderColor='#2563eb'; this.style.background='#eff6ff'" 
                                       onmouseout="this.style.borderColor='#d1d5db'; this.style.background='#f9fafb'">
                                    <div style="width:60px; height:60px; background:white; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-bottom:15px; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                                        <i class="fas fa-cloud-upload-alt fa-2x" style="color:#2563eb;"></i>
                                    </div>
                                    <div style="font-weight:600; color:#374151; font-size:15px; margin-bottom:5px;">Klik untuk pilih file</div>
                                    <div style="color:#9ca3af; font-size:12px;">JPG, PNG, WEBP (Max 5MB)</div>
                                    <input type="file" @change="onFileSelect" style="display:none;" accept="image/*">
                                </label>
                            </div>
                            <div x-show="uploadPreview">
                                <img :src="uploadPreview" style="max-height:200px; width:auto; margin-bottom:20px; border-radius:8px; border:1px solid #e5e7eb; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                                <br>
                                <button type="button" @click="uploadFile=null;uploadPreview=null" style="background:white; border:1px solid #e5e7eb; padding:8px 16px; border-radius:6px; color:#ef4444; font-weight:600; cursor:pointer; font-size:13px;">Ganti File</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="width:340px; background:white; border-left:1px solid #e5e7eb; display:flex; flex-direction:column; z-index:10;">
                    
                    <div x-show="mediaTab === 'library' && !selectedMedia" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:40px; color:#9ca3af;">
                        <div style="width:100px; height:100px; background:#f3f4f6; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:24px;">
                            <i class="fas fa-photo-video fa-3x" style="color:#d1d5db;"></i>
                        </div>
                        <h4 style="margin:0 0 8px 0; color:#374151; font-size:16px; font-weight:600;">Belum ada yang dipilih</h4>
                        <p style="font-size:13px; line-height:1.5; color:#6b7280;">Klik salah satu gambar di sebelah kiri<br>untuk melihat detailnya.</p>
                    </div>

                    <template x-if="selectedMedia && mediaTab === 'library'">
                        <div style="display:flex; flex-direction:column; height:100%;">
                            <div style="padding:16px 20px; border-bottom:1px solid #f3f4f6; background:white;">
                                <h4 style="margin:0; font-size:14px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px;">Detail File</h4>
                            </div>
                            <div style="flex:1; overflow-y:auto; padding:20px;">
                                <div style="background:#f9fafb; border-radius:8px; border:1px solid #e5e7eb; padding:10px; display:flex; align-items:center; justify-content:center; margin-bottom:20px; aspect-ratio:16/9; overflow:hidden;">
                                    <img :src="selectedMedia.url" style="max-width:100%; max-height:100%; object-fit:contain;">
                                </div>
                                <div style="display:grid; gap:16px;">
                                    <div>
                                        <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">Judul</label>
                                        <input x-model="mediaForm.title" class="input" style="width:100%; padding:8px 12px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; box-sizing:border-box;">
                                    </div>
                                    <div>
                                        <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">Alt Text (SEO)</label>
                                        <input x-model="mediaForm.alt" class="input" style="width:100%; padding:8px 12px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; box-sizing:border-box;">
                                    </div>
                                    <div>
                                        <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">Caption</label>
                                        <input x-model="mediaForm.caption" class="input" style="width:100%; padding:8px 12px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; box-sizing:border-box;">
                                    </div>
                                    <div>
                                        <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">Deskripsi</label>
                                        <textarea x-model="mediaForm.description" class="input" style="width:100%; padding:8px 12px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; min-height:80px; box-sizing:border-box; font-family:inherit;"></textarea>
                                    </div>
                                    <button type="button" @click="updateMediaDetails()" style="width:100%; background:white; border:1px solid #d1d5db; color:#4b5563; padding:8px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='white'">
                                        <i class="fas fa-save"></i> Simpan Info Meta
                                    </button>
                                </div>
                            </div>
                            <div style="padding:16px 20px; border-top:1px solid #e5e7eb; background:white;">
                                <button type="button" @click="confirmMediaSelection()" 
                                        style="width:100%; background:#2563eb; color:white; border:none; padding:12px; border-radius:8px; font-weight:600; font-size:14px; cursor:pointer; box-shadow:0 4px 6px -1px rgba(37,99,235,0.3); display:flex; justify-content:center; align-items:center; gap:8px; transition:all 0.2s;"
                                        onmouseover="this.style.backgroundColor='#1d4ed8'" 
                                        onmouseout="this.style.backgroundColor='#2563eb'">
                                    <span>Sisipkan Gambar</span>
                                    <i class="fas fa-arrow-right" style="font-size:12px;"></i>
                                </button>
                            </div>
                        </div>
                    </template>

                    <div x-show="mediaTab === 'upload'" style="flex:1; display:flex; flex-direction:column; padding:20px;">
                         <h4 style="margin:0 0 20px 0; font-size:14px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px;">Metadata Upload</h4>
                         <div style="flex:1; overflow-y:auto; display:grid; gap:16px; align-content:start;">
                            <div><label style="font-size:12px; font-weight:600; color:#4b5563; margin-bottom:4px; display:block;">Judul</label><input x-model="mediaForm.title" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; box-sizing:border-box;"></div>
                            <div><label style="font-size:12px; font-weight:600; color:#4b5563; margin-bottom:4px; display:block;">Alt Text</label><input x-model="mediaForm.alt" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; box-sizing:border-box;"></div>
                            <div><label style="font-size:12px; font-weight:600; color:#4b5563; margin-bottom:4px; display:block;">Caption</label><input x-model="mediaForm.caption" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; box-sizing:border-box;"></div>
                            <div><label style="font-size:12px; font-weight:600; color:#4b5563; margin-bottom:4px; display:block;">Deskripsi</label><textarea x-model="mediaForm.description" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; height:80px; box-sizing:border-box;"></textarea></div>
                         </div>
                         <div style="padding-top:20px; border-top:1px solid #e5e7eb;">
                            <button type="button" @click="uploadMediaAction()" :disabled="!uploadFile"
                                    style="width:100%; background:#2563eb; color:white; border:none; padding:12px; border-radius:8px; font-weight:600; cursor:pointer; transition:all 0.2s;"
                                    :style="!uploadFile ? 'opacity:0.5; cursor:not-allowed;' : ''">
                                <i class="fas fa-cloud-upload-alt"></i> Upload & Gunakan
                            </button>
                         </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
    </template>
</div>
`;
