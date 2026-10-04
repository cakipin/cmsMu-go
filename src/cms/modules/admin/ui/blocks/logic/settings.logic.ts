/**
 * ⚙️ Settings Controller Logic
 * Menangani formulir pengaturan umum dan pemilih media untuk Core CMSMu.
 */
export const settingsLogic = `
if (typeof window !== 'undefined') {
    window.settingsPageData = function() {
        return {
            isLoading: false,
            isSaving: false,
            settings: { 
                site_title: '', 
                site_desc: '',
                site_meta_desc: '',
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
            mediaModalOpen: false,
            mediaTab: 'library',
            mediaList: [],
            pagesList: [],
            uploadFile: null,
            uploadPreview: null,
            selectedMedia: null,
            mediaSearchQuery: '',
            mediaTarget: '', 
            isLoadingMedia: false,
            isUploading: false,
            mediaDisplayLimit: 12,
            mediaPageSize: 12,
            _mediaObserver: null,

            setupMediaObserver() {
                setTimeout(() => {
                    if (this._mediaObserver) {
                        this._mediaObserver.disconnect();
                        this._mediaObserver = null;
                    }
                    var sentinel = document.getElementById('media-sentinel');
                    var container = document.getElementById('media-scroll-container');
                    if (sentinel && container && window.IntersectionObserver) {
                        this._mediaObserver = new IntersectionObserver((entries) => {
                            if (entries[0] && entries[0].isIntersecting && this.hasMoreMedia) {
                                this.loadMoreMedia();
                            }
                        }, { root: container, rootMargin: '120px', threshold: 0.01 });
                        this._mediaObserver.observe(sentinel);
                    }
                }, 100);
            },

            async init() {
                await this.loadSettings();
            },

            async loadSettings() {
                this.isLoading = true;
                const token = (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof localStorage !== 'undefined' ? (localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '') : '');
                try {
                    const res = await fetch('/api/settings', { 
                        headers: { 'Authorization': 'Bearer ' + token } 
                    });
                    if(res.ok) {
                        const json = await res.json();
                        const data = json.data || json;
                        this.settings = { ...this.settings, ...data };
                        if (this.settings.site_favicon && window.updateFavicon) {
                            window.updateFavicon(this.settings.site_favicon);
                        }
                    }
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
                const token = (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof localStorage !== 'undefined' ? (localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '') : '');
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
                            alert('Pengaturan Berhasil Disimpan!');
                        }
                        if(this.settings.site_title) document.title = this.settings.site_title + ' - Admin';
                        if (this.settings.site_favicon && window.updateFavicon) {
                            window.updateFavicon(this.settings.site_favicon);
                        }
                        window.dispatchEvent(new CustomEvent('settings-updated', { detail: { ...this.settings } }));
                    } else {
                        if (window.showToast) {
                            window.showToast('Gagal menyimpan pengaturan', 'error');
                        } else {
                            alert('Gagal menyimpan.');
                        }
                    }
                } catch(e) { 
                    if (window.showToast) {
                        window.showToast('Error: ' + e.message, 'error');
                    } else {
                        alert('Error: ' + e.message); 
                    }
                }
                finally { this.isSaving = false; }
            },

            async openMediaSelector(target) {
                this.mediaTarget = target; 
                this.mediaModalOpen = true;
                this.mediaTab = 'library';
                this.selectedMedia = null;
                this.mediaSearchQuery = '';
                this.mediaDisplayLimit = this.mediaPageSize;
                await this.loadMediaLibrary();
                this.setupMediaObserver();
            },

            async loadMediaLibrary() {
                this.mediaList = [];
                this.isLoadingMedia = true;
                this.mediaDisplayLimit = this.mediaPageSize;
                try {
                    const token = (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof localStorage !== 'undefined' ? (localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '') : '');
                    const res = await fetch('/api/media?t=' + Date.now(), { 
                        headers: { 'Authorization': 'Bearer ' + token } 
                    });
                    if(res.ok) {
                        const json = await res.json();
                        const raw = Array.isArray(json) ? json : (json.data || json.results || []);
                        const seen = new Set();
                        const list = [];
                        for (let i = 0; i < raw.length; i++) {
                            const m = raw[i];
                            const rawUrl = m.url || (m.key ? (m.key.startsWith('uploads/') ? '/' + m.key : (m.key.startsWith('wp-content/uploads/') ? '/uploads/' + m.key.replace('wp-content/uploads/', '') : '/uploads/' + m.key)) : (m.file_url || ''));
                            if (!rawUrl || rawUrl.endsWith('/') || seen.has(rawUrl)) continue;
                            seen.add(rawUrl);
                            list.push({
                                id: m.id || ('media_' + (i + 1)),
                                url: rawUrl,
                                title: m.title || (m.key ? m.key.split('/').pop() : ('Gambar ' + (i + 1))),
                                key: m.key || ''
                            });
                        }
                        this.mediaList = list;
                        this.setupMediaObserver();
                    }
                } catch(e) { console.error('Gagal load media:', e); }
                finally { this.isLoadingMedia = false; }
            },

            get filteredMediaList() {
                const q = (this.mediaSearchQuery || '').toLowerCase();
                return this.mediaList.filter(function(m) { return (m.title || '').toLowerCase().indexOf(q) !== -1; });
            },

            get displayedMediaList() {
                return this.filteredMediaList.slice(0, this.mediaDisplayLimit);
            },

            get hasMoreMedia() {
                return this.mediaDisplayLimit < this.filteredMediaList.length;
            },

            loadMoreMedia() {
                if (this.hasMoreMedia) {
                    this.mediaDisplayLimit += this.mediaPageSize;
                    this.setupMediaObserver();
                }
            },

            handleMediaScroll(e) {
                var el = e.target;
                if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
                    this.loadMoreMedia();
                }
            },

            selectMediaItem(img) {
                this.selectedMedia = img; 
            },

            confirmMediaSelection() {
                if (!this.selectedMedia || !this.selectedMedia.url) {
                    if (window.showToast) window.showToast('Pilih salah satu gambar terlebih dahulu!', 'warning');
                    else alert('Pilih gambar dulu!');
                    return;
                }
                if (this.mediaTarget === 'logo') {
                    this.settings.site_logo = this.selectedMedia.url;
                } else if (this.mediaTarget === 'favicon') {
                    this.settings.site_favicon = this.selectedMedia.url;
                    if (window.updateFavicon) window.updateFavicon(this.selectedMedia.url);
                }
                this.mediaModalOpen = false;
                if (window.showToast) window.showToast('Gambar berhasil dipilih!', 'success');
            },

            onFileSelect(e) {
                var file = e.target.files[0];
                if (!file) return;
                this.uploadFile = file;
                this.uploadPreview = URL.createObjectURL(file);
            },

            async uploadMediaAction() {
                if (!this.uploadFile) {
                    if (window.showToast) window.showToast('Pilih file dari komputer terlebih dahulu!', 'warning');
                    else alert('Pilih file dulu');
                    return;
                }
                this.isUploading = true;
                const fd = new FormData();
                fd.append('file', this.uploadFile);
                
                try {
                    const token = (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof localStorage !== 'undefined' ? (localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '') : '');
                    const res = await fetch('/api/media', { 
                        method: 'POST', 
                        headers: { 'Authorization': 'Bearer ' + token }, 
                        body: fd 
                    });
                    
                    if (res.ok) {
                        const result = await res.json();
                        const newUrl = result.url || result.file_url;
                        
                        if (this.mediaTarget === 'logo') {
                            this.settings.site_logo = newUrl;
                        } else if (this.mediaTarget === 'favicon') {
                            this.settings.site_favicon = newUrl;
                            if (window.updateFavicon) window.updateFavicon(newUrl);
                        }
                        
                        this.uploadFile = null; 
                        this.uploadPreview = null;
                        this.mediaModalOpen = false;
                        if (window.showToast) window.showToast('Gambar berhasil diunggah & diterapkan!', 'success');
                        await this.loadMediaLibrary();
                    } else { 
                        const err = await res.json().catch(function() { return {}; });
                        if (window.showToast) window.showToast(err.error || 'Gagal mengunggah media.', 'error');
                        else alert('Gagal upload: ' + (err.error || ''));
                    }
                } catch(e) { 
                    if (window.showToast) window.showToast('Error upload: ' + e.message, 'error');
                    else alert('Error upload: ' + e.message); 
                }
                finally { this.isUploading = false; }
            }
        };
    };
}
`;
