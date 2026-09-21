export const settingsPage = `
<div x-show="view === 'settings'" class="animate-fade" style="padding-bottom:80px; position:relative;"
     x-data="{
        isLoading: false,
        isSaving: false,
        
        // --- STATE SESUAI DATABASE D1 ---
        settings: { 
            site_title: '', 
            site_desc: '',
            admin_email: '', 
            site_logo: '',
            site_favicon: '',
            site_homepage_slug: 'home',
            theme_primary: '#2271b1',
            theme_primary_dark: '#135e96',
            theme_bg: '#ffffff',
            theme_text: '#1a1a2e',
            theme_accent: '#f0f7ff'
        },

        // --- MEDIA STATE ---
        mediaModalOpen: false,
        mediaTab: 'library',
        mediaList: [],
        pagesList: [],
        uploadFile: null,
        uploadPreview: null,
        selectedMedia: null,
        mediaSearchQuery: '',
        mediaTarget: '', 

        // --- INIT ---
        async init() {
            // Panggil saat komponen dimuat
            await this.loadSettings();
        },

        // --- CORE LOGIC (Diadaptasi Lokal) ---
        async loadSettings() {
            this.isLoading = true;
            const token = localStorage.getItem('labmu_token');
            try {
                // Endpoint API settings
                const res = await fetch('/api/settings', { 
                    headers: { 'Authorization': 'Bearer ' + token } 
                });
                if(res.ok) {
                    const json = await res.json();
                    // Handle format { data: {...} } atau langsung {...}
                    const data = json.data || json;
                    this.settings = { ...this.settings, ...data };
                }
                
                // Fetch pages for homepage dropdown
                const pagesRes = await fetch('/api/pages', { 
                    headers: { 'Authorization': 'Bearer ' + token } 
                });
                if (pagesRes.ok) {
                    const pagesJson = await pagesRes.json();
                    this.pagesList = pagesJson.data || pagesJson || [];
                }
            } catch(e) { console.error('Gagal load settings', e); }
            finally { this.isLoading = false; }
        },

        async saveSettings() {
            this.isSaving = true;
            const token = localStorage.getItem('labmu_token');
            try {
                const res = await fetch('/api/settings', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify(this.settings)
                });
                
                if(res.ok) {
                    if (window.showToast) {
                        window.showToast('Pengaturan berhasil disimpan!', 'success');
                    } else {
                        alert('✅ Pengaturan Berhasil Disimpan!');
                    }
                    if(this.settings.site_title) document.title = this.settings.site_title + ' - Admin';
                    // Sinkronisasi real-time ke root store dan sidebar
                    window.dispatchEvent(new CustomEvent('settings-updated', { detail: { ...this.settings } }));
                } else {
                    if (window.showToast) {
                        window.showToast('Gagal menyimpan pengaturan', 'error');
                    } else {
                        alert('❌ Gagal menyimpan.');
                    }
                }
            } catch(e: any) { 
                if (window.showToast) {
                    window.showToast('Error: ' + e.message, 'error');
                } else {
                    alert('Error: ' + e.message); 
                }
            }
            finally { this.isSaving = false; }
        },

        // --- MEDIA ACTIONS ---
        async openMediaSelector(target) {
            this.mediaTarget = target; 
            this.mediaModalOpen = true;
            this.mediaTab = 'library';
            this.selectedMedia = null;
            this.mediaSearchQuery = '';
            await this.loadMediaLibrary();
        },

        async loadMediaLibrary() {
             this.mediaList = [];
             try {
                 const token = localStorage.getItem('labmu_token');
                 // Endpoint media (sesuaikan jika berbeda)
                 const res = await fetch('/api/media', { headers: { 'Authorization': 'Bearer ' + token } });
                 if(res.ok) {
                     const json = await res.json();
                     const raw = Array.isArray(json) ? json : (json.results || []);
                     this.mediaList = raw.map(m => ({
                         url: m.url || m.file_url || '',
                         title: m.title || (m.key ? m.key.split('/').pop() : 'No Title')
                     }));
                 }
             } catch(e) { console.error(e); }
        },

        get filteredMediaList() {
             const q = (this.mediaSearchQuery || '').toLowerCase();
             return this.mediaList.filter(m => (m.title || '').toLowerCase().includes(q));
        },

        selectMediaItem(img) {
             this.selectedMedia = img; 
        },

        confirmMediaSelection() {
             if (!this.selectedMedia || !this.selectedMedia.url) return alert('Pilih gambar dulu!');
             
             if (this.mediaTarget === 'logo') {
                 this.settings.site_logo = this.selectedMedia.url;
             } else if (this.mediaTarget === 'favicon') {
                 this.settings.site_favicon = this.selectedMedia.url;
             }
             this.mediaModalOpen = false;
        },

        onFileSelect(e) {
             const file = e.target.files[0];
             if (!file) return;
             this.uploadFile = file;
             this.uploadPreview = URL.createObjectURL(file);
        },

        async uploadMediaAction() {
             if (!this.uploadFile) return alert('Pilih file dulu');
             const fd = new FormData();
             fd.append('file', this.uploadFile);
             
             try {
                 const token = localStorage.getItem('labmu_token');
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
                     if (newImg) this.selectedMedia = newImg;
                     this.uploadFile = null; 
                     this.uploadPreview = null;
                 } else { 
                    alert('Gagal upload.'); 
                 }
             } catch(e) { alert('Error upload: ' + e.message); }
        }
     }">

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="margin:0; font-size:22px; font-weight:700; color:#1f2937;">Pengaturan Umum</h2>
        <button @click="saveSettings()" :disabled="isSaving" 
                class="bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white px-4 py-2 rounded-lg text-xs font-medium shadow-sm transition-all flex items-center gap-2 cursor-pointer border-0">
            <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
            <span x-text="isSaving ? 'Menyimpan...' : 'Simpan Perubahan'"></span>
        </button>
    </div>

    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:25px;">
        
        <div style="background:white; padding:25px; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
            <h4 style="margin-top:0; margin-bottom:20px; font-size:15px; font-weight:700; color:#1f2937;">Identitas Situs</h4>
            
            <div style="margin-bottom:15px;">
                <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#4b5563;">Judul Situs (Site Title)</label>
                <input type="text" x-model="settings.site_title" class="focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:8px; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:15px;">
                <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#4b5563;">Slogan / Deskripsi (Tagline)</label>
                <input type="text" x-model="settings.site_desc" class="focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:8px; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:15px;">
                <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#4b5563;">Email Administrator</label>
                <input type="email" x-model="settings.admin_email" class="focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:8px; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:15px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
                <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#4b5563;">Halaman Utama (Homepage)</label>
                <p style="font-size:12px; color:#6b7280; margin-bottom:10px;">Pilih halaman yang akan ditampilkan sebagai Beranda situs Anda.</p>
                <select x-model="settings.site_homepage_slug" class="focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:8px; box-sizing:border-box; background:white;">
                    <option value="home">Default (Sistem / home)</option>
                    <template x-for="p in pagesList" :key="p.id">
                        <option :value="p.slug" x-text="p.title + ' (/' + p.slug + ')'"></option>
                    </template>
                </select>
            </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:20px;">
            
            <div style="background:white; padding:20px; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
                <h4 style="margin-top:0; font-size:14px; font-weight:700; color:#1f2937;">Logo Situs</h4>
                <div style="background:#f9fafb; padding:15px; text-align:center; margin:10px 0; border:1px dashed #d1d5db; border-radius:8px; min-height:80px; display:flex; align-items:center; justify-content:center;">
                    <img x-show="settings.site_logo" :src="settings.site_logo" style="max-width:100%; max-height:80px; object-fit:contain;">
                    <span x-show="!settings.site_logo" style="color:#9ca3af; font-size:12px;">Belum Ada Logo</span>
                </div>
                <div style="display:flex; gap:8px;">
                    <button @click="openMediaSelector('logo')" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white border-0 py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5">
                        <i class="fas fa-image text-xs"></i>
                        <span>Pilih Logo</span>
                    </button>
                    <button @click="settings.site_logo = ''" class="bg-red-50 hover:bg-red-100 text-red-600 border-0 py-2 px-3 rounded-lg text-xs cursor-pointer transition-colors" title="Hapus Logo">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <input type="text" x-model="settings.site_logo" placeholder="https://..." style="width:100%; margin-top:10px; padding:6px 10px; font-size:11px; border:1px solid #e2e8f0; border-radius:6px; outline:none; box-sizing:border-box;">
            </div>

            <div style="background:white; padding:20px; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
                <h4 style="margin-top:0; font-size:14px; font-weight:700; color:#1f2937;">Favicon</h4>
                <div style="background:#f9fafb; padding:15px; text-align:center; margin:10px 0; border:1px dashed #d1d5db; border-radius:8px; min-height:60px; display:flex; align-items:center; justify-content:center;">
                    <img x-show="settings.site_favicon" :src="settings.site_favicon" style="width:32px; height:32px; object-fit:contain;">
                    <span x-show="!settings.site_favicon" style="color:#9ca3af; font-size:12px;">Belum Ada Icon</span>
                </div>
                <div style="display:flex; gap:8px;">
                    <button @click="openMediaSelector('favicon')" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white border-0 py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5">
                        <i class="fas fa-icons text-xs"></i>
                        <span>Pilih Favicon</span>
                    </button>
                    <button @click="settings.site_favicon = ''" class="bg-red-50 hover:bg-red-100 text-red-600 border-0 py-2 px-3 rounded-lg text-xs cursor-pointer transition-colors" title="Hapus Favicon">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <input type="text" x-model="settings.site_favicon" placeholder="https://..." style="width:100%; margin-top:10px; padding:6px 10px; font-size:11px; border:1px solid #e2e8f0; border-radius:6px; outline:none; box-sizing:border-box;">
            </div>

        </div>
    </div>

    <!-- POPUP MEDIA MANAGER STANDAR CMSMU -->
    <div x-show="mediaModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex justify-center items-center p-4 sm:p-6" x-cloak>
        <div class="bg-white w-full max-w-4xl h-[82vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-200/80">
            
            <!-- MODAL HEADER -->
            <div class="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                        <i class="fas fa-photo-video text-sm"></i>
                    </div>
                    <div>
                        <h3 class="m-0 text-sm font-bold text-slate-800 leading-tight">Media Manager</h3>
                        <p class="m-0 text-[11px] text-slate-400">Pilih atau unggah media cmsMu</p>
                    </div>
                </div>

                <!-- TABS & SEARCH -->
                <div class="flex items-center gap-3">
                    <!-- Search Bar (Aktif di Library) -->
                    <div x-show="mediaTab === 'library'" class="relative">
                        <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                        <input type="text" x-model="mediaSearchQuery" placeholder="Cari nama media..." 
                               class="pl-7 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-40 sm:w-56 transition-all text-slate-700">
                        <button type="button" x-show="mediaSearchQuery" @click="mediaSearchQuery=''" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs border-0 bg-transparent cursor-pointer">&times;</button>
                    </div>

                    <!-- Segmented Tabs Standar cmsMu -->
                    <div class="flex gap-1 bg-slate-200/70 p-1 rounded-lg">
                        <button @click="mediaTab='library'" 
                                :class="mediaTab==='library' ? 'bg-white text-teal-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900 font-normal'" 
                                class="border-0 py-1 px-3 rounded-md text-xs cursor-pointer transition-all">
                            <i class="fas fa-th-large mr-1 text-[11px]"></i> Galeri
                        </button>
                        <button @click="mediaTab='upload'" 
                                :class="mediaTab==='upload' ? 'bg-white text-teal-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900 font-normal'" 
                                class="border-0 py-1 px-3 rounded-md text-xs cursor-pointer transition-all">
                            <i class="fas fa-cloud-upload-alt mr-1 text-[11px]"></i> Unggah
                        </button>
                    </div>

                    <!-- Close Button -->
                    <button @click="mediaModalOpen=false" class="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center border-0 cursor-pointer transition-colors text-sm" title="Tutup">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- MODAL BODY -->
            <div class="flex-1 overflow-hidden flex">
                
                <!-- AREA GALERI & UPLOAD -->
                <div class="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50/70">
                    
                    <!-- TAB 1: GALERI LIBRARY DENGAN THUMBNAIL KECIL-KECIL -->
                    <div x-show="mediaTab === 'library'">
                        <!-- Grid Thumbnails Kompak ~85px -->
                        <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2.5">
                            <template x-for="img in filteredMediaList" :key="img.url">
                                <div @click="selectMediaItem(img)" 
                                     class="group relative aspect-square bg-white rounded-lg overflow-hidden border cursor-pointer transition-all duration-150 shadow-xs" 
                                     :class="selectedMedia?.url === img.url ? 'border-teal-500 ring-2 ring-teal-500/30 shadow-md' : 'border-slate-200 hover:border-teal-400 hover:shadow-sm hover:scale-[1.02]'"
                                     :title="img.title || 'Gambar Media'">
                                    
                                    <img :src="img.url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 bg-slate-100">
                                    
                                    <!-- Checkmark Badge -->
                                    <div x-show="selectedMedia?.url === img.url" 
                                         class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[9px] shadow-sm ring-1 ring-white">
                                        <i class="fas fa-check"></i>
                                    </div>

                                    <!-- Name overlay on hover -->
                                    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent p-1 text-[9px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity" x-text="img.title"></div>
                                </div>
                            </template>
                        </div>

                        <!-- Empty State -->
                        <div x-show="filteredMediaList.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400">
                            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 text-lg mb-2">
                                <i class="fas fa-images"></i>
                            </div>
                            <p class="text-xs font-medium text-slate-500 m-0">Tidak ada media ditemukan</p>
                            <p class="text-[11px] text-slate-400 m-0 mt-1" x-text="mediaSearchQuery ? 'Coba gunakan kata kunci pencarian lain.' : 'Belum ada gambar yang diunggah.'"></p>
                        </div>
                    </div>

                    <!-- TAB 2: UPLOAD DROPZONE -->
                    <div x-show="mediaTab === 'upload'" class="h-full flex items-center justify-center p-4">
                        <div class="bg-white p-8 rounded-2xl border-2 border-dashed border-teal-200 hover:border-teal-400 transition-colors w-full max-w-md text-center shadow-xs">
                            <div class="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 text-2xl">
                                <i class="fas fa-cloud-upload-alt"></i>
                            </div>
                            <h4 class="text-sm font-bold text-slate-800 mb-1">Unggah Media Baru</h4>
                            <p class="text-[11px] text-slate-400 mb-4">Mendukung file JPG, PNG, WEBP, atau SVG</p>

                            <label class="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors mb-3">
                                <i class="fas fa-folder-open text-xs"></i>
                                <span>Pilih File dari Komputer</span>
                                <input type="file" @change="onFileSelect" class="hidden" accept="image/*">
                            </label>

                            <div x-show="uploadPreview" class="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-100 inline-block">
                                <img :src="uploadPreview" class="max-h-36 rounded-lg object-contain mx-auto">
                            </div>

                            <div class="mt-4">
                                <button @click="uploadMediaAction()" :disabled="!uploadFile" 
                                        class="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium py-2 px-5 rounded-lg shadow-sm transition-all border-0 cursor-pointer">
                                    <i class="fas fa-upload mr-1.5"></i> Unggah & Gunakan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DETAIL SIDEBAR (PANEL KANAN) -->
                <div class="w-64 bg-white border-l border-slate-100 p-4 flex flex-col shrink-0" x-show="mediaTab === 'library' && selectedMedia">
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Informasi Berkas</h4>
                    
                    <div class="w-full aspect-video rounded-lg overflow-hidden bg-slate-50 border border-slate-100 p-2 flex items-center justify-center mb-3">
                        <img :src="selectedMedia?.url" class="max-w-full max-h-full object-contain">
                    </div>

                    <div class="space-y-2.5 text-xs flex-1">
                        <div>
                            <span class="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Nama Berkas</span>
                            <span class="text-slate-700 font-medium text-xs break-all" x-text="selectedMedia?.title || 'Tanpa Judul'"></span>
                        </div>
                        <div>
                            <span class="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Tautan URL</span>
                            <input type="text" readonly :value="selectedMedia?.url" class="w-full p-1.5 text-[11px] rounded bg-slate-50 border border-slate-200 text-slate-600 mt-1 outline-none" @click="$el.select()">
                        </div>
                    </div>

                    <button @click="confirmMediaSelection()" 
                            class="w-full bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white border-0 py-2.5 px-4 rounded-lg text-xs font-medium shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-4">
                        <i class="fas fa-check text-xs"></i>
                        <span>Pilih Gambar Ini</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
`;