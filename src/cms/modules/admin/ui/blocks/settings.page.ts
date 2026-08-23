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
            const token = '';
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
            const token = '';
            try {
                const res = await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify(this.settings)
                });

                if(res.ok) {
                    alert('✅ Pengaturan Berhasil Disimpan!');
                    if(this.settings.site_title) document.title = this.settings.site_title + ' - Admin';
                } else {
                    alert('❌ Gagal menyimpan.');
                }
            } catch(e) { alert('Error: ' + e.message); }
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
                 const token = '';
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
        <h2 style="margin:0; font-size:24px; color:#1f2937;">General Settings</h2>
        <button @click="saveSettings()" :disabled="isSaving"
                style="background:#2563eb; color:white; border:none; padding:10px 20px; border-radius:6px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px;">
            <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
            <span x-text="isSaving ? 'Saving...' : 'Save Changes'"></span>
        </button>
    </div>

    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:25px;">

        <div style="background:white; padding:25px; border:1px solid #e5e7eb; border-radius:8px;">
            <h4 style="margin-top:0; margin-bottom:20px; font-size:16px; color:#374151;">Site Identity</h4>

            <div style="margin-bottom:15px;">
                <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#4b5563;">Site Title</label>
                <input type="text" x-model="settings.site_title" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:15px;">
                <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#4b5563;">Tagline / Description</label>
                <input type="text" x-model="settings.site_desc" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:15px;">
                <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#4b5563;">Admin Email</label>
                <input type="email" x-model="settings.admin_email" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:15px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
                <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#4b5563;">Halaman Utama (Homepage)</label>
                <p style="font-size:12px; color:#6b7280; margin-bottom:10px;">Pilih halaman yang akan ditampilkan sebagai Beranda situs Anda.</p>
                <select x-model="settings.site_homepage_slug" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box; background:white;">
                    <option value="home">Default (Sistem / home)</option>
                    <template x-for="p in pagesList" :key="p.id">
                        <option :value="p.slug" x-text="p.title + ' (/' + p.slug + ')'"></option>
                    </template>
                </select>
            </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:20px;">

            <div style="background:white; padding:20px; border:1px solid #e5e7eb; border-radius:8px;">
                <h4 style="margin-top:0; font-size:14px; color:#374151;">Site Logo</h4>
                <div style="background:#f9fafb; padding:15px; text-align:center; margin:10px 0; border:1px dashed #d1d5db; border-radius:6px; min-height:80px; display:flex; align-items:center; justify-content:center;">
                    <img x-show="settings.site_logo" :src="settings.site_logo" style="max-width:100%; max-height:80px; object-fit:contain;">
                    <span x-show="!settings.site_logo" style="color:#9ca3af; font-size:12px;">No Logo</span>
                </div>
                <div style="display:flex; gap:5px;">
                    <button @click="openMediaSelector('logo')" style="flex:1; background:#2563eb; color:white; border:none; padding:8px; border-radius:4px; font-size:12px; cursor:pointer;">Select Logo</button>
                    <button @click="settings.site_logo = ''" style="background:#fee2e2; color:#dc2626; border:none; padding:8px 12px; border-radius:4px; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </div>
                <input type="text" x-model="settings.site_logo" placeholder="https://..." style="width:100%; margin-top:10px; padding:5px; font-size:11px; border:1px solid #eee; border-radius:4px;">
            </div>

            <div style="background:white; padding:20px; border:1px solid #e5e7eb; border-radius:8px;">
                <h4 style="margin-top:0; font-size:14px; color:#374151;">Favicon</h4>
                <div style="background:#f9fafb; padding:15px; text-align:center; margin:10px 0; border:1px dashed #d1d5db; border-radius:6px; min-height:60px; display:flex; align-items:center; justify-content:center;">
                    <img x-show="settings.site_favicon" :src="settings.site_favicon" style="width:32px; height:32px; object-fit:contain;">
                    <span x-show="!settings.site_favicon" style="color:#9ca3af; font-size:12px;">No Icon</span>
                </div>
                <div style="display:flex; gap:5px;">
                    <button @click="openMediaSelector('favicon')" style="flex:1; background:#2563eb; color:white; border:none; padding:8px; border-radius:4px; font-size:12px; cursor:pointer;">Select Icon</button>
                    <button @click="settings.site_favicon = ''" style="background:#fee2e2; color:#dc2626; border:none; padding:8px 12px; border-radius:4px; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </div>
                 <input type="text" x-model="settings.site_favicon" placeholder="https://..." style="width:100%; margin-top:10px; padding:5px; font-size:11px; border:1px solid #eee; border-radius:4px;">
            </div>

        </div>
    </div>


    <div x-show="mediaModalOpen" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6); z-index:99999; display:flex; justify-content:center; align-items:center; padding:20px;" x-cloak>
        <div style="background:white; width:100%; max-width:900px; height:80vh; border-radius:12px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">

            <div style="padding:15px 20px; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin:0; font-size:16px;">Media Manager</h3>
                <div style="display:flex; gap: 5px; background: #f3f4f6; padding: 3px; border-radius: 6px;">
                    <button @click="mediaTab='library'" :style="mediaTab==='library' ? 'background:white; color:#2563eb; box-shadow:0 1px 2px rgba(0,0,0,0.1);' : 'color:#6b7280;'" style="border:none; padding:5px 12px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:600;">Library</button>
                    <button @click="mediaTab='upload'" :style="mediaTab==='upload' ? 'background:white; color:#2563eb; box-shadow:0 1px 2px rgba(0,0,0,0.1);' : 'color:#6b7280;'" style="border:none; padding:5px 12px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:600;">Upload</button>
                </div>
                <button @click="mediaModalOpen=false" style="border:none; background:none; font-size:24px; cursor:pointer; color:#9ca3af;">&times;</button>
            </div>

            <div style="flex:1; overflow:hidden; display:flex;">
                <div style="flex:1; overflow-y:auto; padding:20px; background:#f9fafb;">
                    <div x-show="mediaTab === 'library'" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:10px;">
                        <template x-for="img in filteredMediaList" :key="img.url">
                            <div @click="selectMediaItem(img)"
                                 style="cursor:pointer; aspect-ratio:1; background:white; border-radius:6px; overflow:hidden; border:2px solid transparent; position:relative;"
                                 :style="selectedMedia?.url === img.url ? 'border-color:#2563eb; ring:2px;' : 'border-color:#e5e7eb'">
                                <img :src="img.url" style="width:100%; height:100%; object-fit:cover;">
                                <div x-show="selectedMedia?.url === img.url" style="position:absolute; top:5px; right:5px; background:#2563eb; color:white; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:10px;"><i class="fas fa-check"></i></div>
                            </div>
                        </template>
                        <div x-show="filteredMediaList.length === 0" style="grid-column: 1/-1; text-align:center; padding:40px; color:#9ca3af;">Tidak ada gambar.</div>
                    </div>

                    <div x-show="mediaTab === 'upload'" style="height:100%; display:flex; justify-content:center; align-items:center;">
                        <div style="text-align:center;">
                            <input type="file" @change="onFileSelect" style="display:block; margin:0 auto 20px;">
                            <div x-show="uploadPreview" style="margin-bottom:20px;"><img :src="uploadPreview" style="max-height:150px; border-radius:8px;"></div>
                            <button @click="uploadMediaAction()" :disabled="!uploadFile" style="background:#2563eb; color:white; border:none; padding:10px 20px; border-radius:6px; cursor:pointer;">Upload & Gunakan</button>
                        </div>
                    </div>
                </div>

                <div style="width:280px; background:white; border-left:1px solid #e5e7eb; padding:20px; display:flex; flex-direction:column;" x-show="mediaTab === 'library' && selectedMedia">
                    <h4 style="margin-top:0; font-size:14px; color:#374151;">Detail</h4>
                    <img :src="selectedMedia?.url" style="max-width:100%; max-height:150px; object-fit:contain; background:#f9fafb; margin-bottom:15px; border:1px solid #eee;">
                    <button @click="confirmMediaSelection()" style="width:100%; background:#2563eb; color:white; border:none; padding:10px; border-radius:6px; cursor:pointer; margin-top:auto;">Pilih Gambar Ini</button>
                </div>
            </div>
        </div>
    </div>
</div>
`;