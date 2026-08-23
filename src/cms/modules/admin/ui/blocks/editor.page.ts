import { customEditorTemplate } from './custom-editor.ts';

export const editorPage = `
<div x-show="view === 'add' || view === 'edit'" class="animate-fade"
     @open-editor-media.window="openMediaForEditor()"
     style="padding-bottom:80px; position:relative;"
     x-data="{
         // ===============================================
         // 1. DATA & STATE (LOGIC TETAP/STABLE)
         // ===============================================
         mediaModalOpen: false,
         manageModalOpen: false,
         manageTarget: '',

         mediaList: [],
         uniqueCategories: [],
         uniqueTags: [],
         managerItems: [],
         allPosts: [],

         // STATE MEDIA
         mediaTab: 'library',
         uploadFile: null,
         uploadPreview: null,
         selectedMedia: null,
         searchQuery: '',

         // Form Metadata
         mediaForm: { title: '', alt: '', caption: '', description: '' },

         // ===============================================
         // 2. LOAD DATA
         // ===============================================
         async loadGlobalData() {
             try {
                 const token = '';
                 const res = await fetch('/api/posts?t=' + Date.now(), {
                     headers: { 'Authorization': 'Bearer ' + token }
                 });
                 if (res.ok) {
                     const json = await res.json();
                     const posts = Array.isArray(json) ? json : (json.results || []);
                     this.allPosts = posts;

                     const cats = posts.map(p => p.category).filter(c => c && c !== 'Uncategorized');
                     const catCounts = {};
                     cats.forEach(c => catCounts[c] = (catCounts[c] || 0) + 1);
                     this.uniqueCategories = Object.keys(catCounts).sort((a,b) => catCounts[b] - catCounts[a]);

                     const allTags = posts.flatMap(p => (p.tags || '').split(','));
                     const cleanedTags = allTags.map(t => t.trim()).filter(t => t && t !== '-' && t.length > 2);
                     const tagCounts = {};
                     cleanedTags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1);
                     this.uniqueTags = Object.keys(tagCounts).sort((a,b) => tagCounts[b] - tagCounts[a]);
                 }
             } catch(e) { console.error('Load Error', e); }
         },

         // ===============================================
         // 3. MEDIA LOGIC
         // ===============================================
         async openMediaSelector() {
             this.mediaModalOpen = true;
             this.mediaTab = 'library';
             this.selectedMedia = null;
             this.searchQuery = '';
             this.mediaForm = { title:'', alt:'', caption:'', description:'' };
             await this.loadMediaLibrary();
         },

         async loadMediaLibrary() {
             this.mediaList = [];
             try {
                 const token = '';
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
             if(!this.searchQuery) return this.mediaList;
             const q = this.searchQuery.toLowerCase();
             return this.mediaList.filter(m =>
                 (m.title && m.title.toLowerCase().includes(q)) ||
                 (m.alt && m.alt.toLowerCase().includes(q))
             );
         },

         selectMediaItem(img) {
             this.selectedMedia = { ...img };
             this.mediaForm = {
                 title: img.title || '',
                 alt: img.alt || '',
                 caption: img.caption || '',
                 description: img.description || ''
             };
         },

         confirmMediaSelection() {
             if (!this.selectedMedia || !this.selectedMedia.url) {
                 alert('Pilih gambar dulu!');
                 return;
             }

             if (this.mediaSelectorTarget === 'custom-editor') {
                 // Trigger event untuk insert media ke dalam editor
                 window.dispatchEvent(new CustomEvent('insert-media', { detail: { url: this.selectedMedia.url } }));
                 this.mediaSelectorTarget = null;
             } else {
                 this.form.featured_image = this.selectedMedia.url;
                 this.form.featured_image_alt = this.mediaForm.alt;
                 this.form.featured_image_caption = this.mediaForm.caption;
             }

             this.mediaModalOpen = false;
         },

         async updateMediaDetails() {
             if(!this.selectedMedia) return;
             this.selectedMedia.title = this.mediaForm.title;
             this.selectedMedia.alt = this.mediaForm.alt;
             this.selectedMedia.caption = this.mediaForm.caption;
             this.selectedMedia.description = this.mediaForm.description;

             try {
                 const token = '';
                 await fetch('/api/media/meta', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                     body: JSON.stringify({ key: this.selectedMedia.key, ...this.mediaForm })
                 });
                 alert('Info tersimpan!');
             } catch(e) { console.log('Saved locally'); }
         },

         onFileSelect(e) {
             const file = e.target.files[0];
             if (!file) return;
             this.uploadFile = file;
             this.uploadPreview = URL.createObjectURL(file);
             this.mediaForm.title = file.name.split('.')[0].replace(/-/g, ' ');
         },

         async uploadMediaAction() {
             if (!this.uploadFile) return alert('Pilih file dulu');

             const fd = new FormData();
             fd.append('file', this.uploadFile);
             fd.append('title', this.mediaForm.title);
             fd.append('alt', this.mediaForm.alt);
             fd.append('caption', this.mediaForm.caption);
             fd.append('description', this.mediaForm.description);

             try {
                 const token = '';
                 const res = await fetch('/api/media', {
                     method: 'POST',
                     headers: { 'Authorization': 'Bearer ' + token },
                     body: fd
                 });
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

         openManager(target) {
             this.manageTarget = target;
             this.manageModalOpen = true;
             this.managerItems = (target === 'category') ? this.uniqueCategories.filter(c => c !== 'Uncategorized') : this.uniqueTags;
         },
         async renameItemGlobal(old) { alert('Rename logic placeholder'); },
         async deleteItemGlobal(item) { alert('Delete logic placeholder'); },

         // --- MEDIA LOGIC UNTUK CUSTOM EDITOR ---
         openMediaForEditor() {
             // Menyimpan selection sebelum buka modal
             this.$dispatch('save-editor-selection');
             this.openMediaSelector();
             this.mediaSelectorTarget = 'custom-editor'; // Flag khusus jika butuh membedakan
         },

         initEditor() {
             // Logic custom editor di-handle oleh x-data customEditorLogic
         },

         async save() {
             const currentContent = this.form.body || '';
             const payload = JSON.parse(JSON.stringify({
                 id: this.editingId || undefined,
                 title: this.form.title || '',
                 slug: this.form.slug || this.form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
                 body: currentContent,
                 excerpt: this.form.excerpt || '',
                 meta_title: this.form.meta_title || '',
                 meta_description: this.form.meta_description || '',
                 og_image: this.form.og_image || '',
                 status: this.form.status || 'publish',
                 category: this.form.category || 'Uncategorized',
                 tags: this.form.tags || '',
                 featured_image: this.form.featured_image || '',
                 featured_image_caption: this.form.featured_image_caption || '',
                 featured_image_alt: this.form.featured_image_alt || '',
                 allow_comments: Number(this.form.allow_comments) === 1 ? 1 : 0,
                 type: 'post'
             }));
             if(this.form.date) payload.created_at = new Date(this.form.date).toISOString();

             try {
                 const token = '';
                 const method = this.editingId ? 'PUT' : 'POST';
                 const url = this.editingId ? ('/api/posts/' + this.editingId) : '/api/posts';
                 const res = await fetch(url, {
                     method: method,
                     headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                     body: JSON.stringify(payload)
                 });
                 if(res.ok) { alert('Tersimpan!'); window.location.reload(); }
                 else { const r = await res.json(); alert('Gagal: ' + r.error); }
             } catch(err) { alert('Error koneksi.'); }
         },

         makeSlug() { if(!this.editingId) this.form.slug = this.form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'); },
         addTag(t) {
             let cur = this.form.tags || '';
             const arr = cur.split(',').map(x => x.trim());
             if(!arr.includes(t)) this.form.tags = cur ? (cur + ', ' + t) : t;
         },
         setCategory(c) { this.form.category = c; }
     }"
     x-effect="if(view === 'add' || view === 'edit') { initEditor(); loadGlobalData(); }">

    <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
        <button @click="view = 'posts'" class="btn" style="background:transparent; color:#555; border:1px solid #ccc;">
            <i class="fas fa-arrow-left"></i> Kembali
        </button>
        <h2 style="margin:0;" x-text="editingId ? 'Edit Post' : 'Tambah Post Baru'"></h2>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 320px; gap:25px;">
        <div style="min-width: 0;">
            <input x-model="form.title" class="input" placeholder="Judul Tulisan..."
                   style="font-size: 24px; font-weight: 600; padding: 15px; margin-bottom: 20px;"
                   @input="makeSlug()">
            <div style="margin-bottom:20px;">
                ${customEditorTemplate}
            </div>

            <!-- SEO & Metadata Section -->
            <div class="card" style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #1f2937; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px;">
                    <i class="fas fa-search" style="color: #6b7280; margin-right: 8px;"></i> SEO & Metadata
                </h3>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #4b5563; margin-bottom: 6px;">Excerpt (Ringkasan)</label>
                    <textarea x-model="form.excerpt" class="input" style="width: 100%; height: 80px; padding: 10px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 14px;" placeholder="Tulis ringkasan singkat artikel..."></textarea>
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #4b5563; margin-bottom: 6px;">Meta Title</label>
                    <input x-model="form.meta_title" class="input" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 14px;" placeholder="Maksimal 60 karakter">
                    <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Kosongkan jika ingin menggunakan Judul Tulisan.</div>
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #4b5563; margin-bottom: 6px;">Meta Description</label>
                    <textarea x-model="form.meta_description" class="input" style="width: 100%; height: 80px; padding: 10px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 14px;" placeholder="Maksimal 160 karakter"></textarea>
                    <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Kosongkan jika ingin menggunakan Excerpt.</div>
                </div>
            </div>

            <div class="card" style="padding:0; overflow:hidden; border:1px solid #e5e7eb; border-radius:8px; background:white;">
                <div style="padding:12px 15px; border-bottom:1px solid #f3f4f6; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; font-size:13px; font-weight:600; color:#374151; text-transform:uppercase; letter-spacing:0.5px;">Featured Image</h3>
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

        <div style="display:flex; flex-direction:column; gap:20px;">
            <div class="card" style="padding:15px; border-top:3px solid #2271b1;">
                <h3 style="margin:0 0 15px 0; font-size:14px;">Publish</h3>
                <div style="margin-bottom:10px;">
                    <label style="font-size:12px;">Status</label>
                    <select x-model="form.status" class="input" style="width:100%;"><option value="publish">Published</option><option value="draft">Draft</option></select>
                </div>
                <div style="margin-bottom:15px;">
                    <label style="font-size:12px;">Tanggal</label>
                    <input type="datetime-local" x-model="form.date" class="input">
                </div>
                <button @click="save()" class="btn btn-primary" style="width:100%;">Simpan</button>
            </div>

            <div class="card" style="padding:15px;">
                <h3 style="margin:0 0 10px 0; font-size:14px;">Kategori <button @click="openManager('category')" style="float:right; border:none; color:blue; cursor:pointer;">⚙️</button></h3>
                <input x-model="form.category" class="input" placeholder="Pilih/Ketik...">
                <div style="display:flex; flex-wrap:wrap; gap:5px; margin-top:10px;">
                    <template x-for="c in uniqueCategories.slice(0, 5)">
                        <span @click="setCategory(c)" style="cursor:pointer; padding:3px 8px; border:1px solid #ddd; border-radius:12px; font-size:11px; background:#f9f9f9; color:#333;">+ <span x-text="c"></span></span>
                    </template>
                </div>
            </div>

            <div class="card" style="padding:15px;">
                <h3 style="margin:0 0 10px 0; font-size:14px;">Tags <button @click="openManager('tag')" style="float:right; border:none; color:blue; cursor:pointer;">⚙️</button></h3>
                <textarea x-model="form.tags" class="input" style="height:60px;"></textarea>
                <div style="display:flex; flex-wrap:wrap; gap:5px; margin-top:10px;">
                    <template x-for="t in uniqueTags.slice(0, 5)">
                        <span @click="addTag(t)" style="cursor:pointer; padding:3px 8px; border:1px solid #ddd; border-radius:12px; font-size:11px; background:#f9f9f9; color:#333;">+ <span x-text="t"></span></span>
                    </template>
                </div>
            </div>

            <!-- COMMENTS TOGGLE -->
            <div class="card" style="padding:15px;" x-show="form.type === 'post'">
                <h3 style="margin:0 0 10px 0; font-size:14px;">Komentar</h3>
                <div style="display:flex; align-items:center; justify-content:space-between; padding:10px; border:1px solid #e5e7eb; border-radius:6px; background:#f9fafb;">
                    <span style="font-size:13px; color:#374151; font-weight:500;">Aktifkan Komentar</span>
                    <button type="button" role="switch"
                            :aria-checked="form.allow_comments == 1 ? 'true' : 'false'"
                            :aria-label="form.allow_comments == 1 ? 'Nonaktifkan komentar' : 'Aktifkan komentar'"
                            @click="form.allow_comments = form.allow_comments == 1 ? 0 : 1"
                            style="position:relative; flex:0 0 52px; width:52px; height:28px; padding:0; border:0; border-radius:999px; background:#cbd5e1; cursor:pointer; transition:background .2s; box-shadow:inset 0 0 0 1px rgba(15,23,42,.08);"
                            :style="form.allow_comments == 1 ? 'background:#10b981;' : 'background:#cbd5e1;'">
                        <span style="position:absolute; top:4px; left:4px; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.25); transition:transform .2s;"
                              :style="form.allow_comments == 1 ? 'transform:translateX(24px);' : 'transform:translateX(0);'"></span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div x-show="mediaModalOpen"
         style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(5px); z-index:999999; display:flex; justify-content:center; align-items:center; padding:20px;"
         x-transition.opacity
         x-cloak>

        <div style="background:white; width:100%; max-width:1100px; height:85vh; border-radius:16px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

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
                        <input x-model="searchQuery" placeholder="Cari media..."
                               style="padding:8px 12px 8px 36px; border-radius:8px; border:1px solid #e5e7eb; font-size:13px; width:240px; outline:none; transition:border 0.2s;"
                               onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#e5e7eb'">
                        <i class="fas fa-search" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#9ca3af; font-size:12px;"></i>
                        <button type="button" x-show="searchQuery" @click="searchQuery=''" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); border:none; background:none; color:#9ca3af; cursor:pointer;">&times;</button>
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

    <div x-show="manageModalOpen" @click.self="manageModalOpen=false" style="position:fixed; inset:0; padding:20px; background:rgba(0,0,0,0.5); z-index:99999; display:flex !important; justify-content:center; align-items:center;" x-cloak>
        <div role="dialog" aria-modal="true" aria-labelledby="manage-dialog-title" style="box-sizing:border-box; background:white; width:calc(100% - 32px); max-width:520px; max-height:calc(100dvh - 40px); border-radius:12px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.25);">
            <div style="padding:15px 20px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; background:#f9fafb;">
                <h3 id="manage-dialog-title" style="margin:0; font-size:16px; font-weight:600;">Kelola <span x-text="manageTarget === 'category' ? 'kategori' : 'tag'"></span></h3>
                <button type="button" @click="manageModalOpen=false" style="border:none; background:none; font-size:20px; cursor:pointer;">&times;</button>
            </div>
            <div style="flex:1; overflow-y:auto; padding:0;">
                <template x-for="item in managerItems">
                    <div style="padding:12px 20px; border-bottom:1px solid #f3f4f6; display:flex; justify-content:space-between; align-items:center;">
                        <span x-text="item" style="font-weight:500; color:#374151;"></span>
                        <div style="display:flex; gap:10px;">
                            <button type="button" @click="renameItemGlobal(item)" style="color:#d97706; border:none; background:none; cursor:pointer;"><i class="fas fa-pencil-alt"></i></button>
                            <button type="button" @click="deleteItemGlobal(item)" style="color:#dc2626; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</div>
`;
