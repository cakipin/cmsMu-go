export const settingsLogic = `
    // ===============================================
    // 1. STATE & DATA
    // ===============================================
    settings: { 
        site_title: '', 
        site_tagline: '', 
        admin_email: '',
        site_logo: '',       
        site_favicon: ''    
    },
    isLoading: false,
    isSaving: false,

    // MEDIA STATE
    mediaModalOpen: false,
    mediaTab: 'library',
    mediaList: [],
    uploadFile: null,
    uploadPreview: null,
    selectedMedia: null,
    mediaSearchQuery: '',
    mediaTarget: '', // Menandai apakah sedang ganti 'logo' atau 'favicon'
    mediaForm: { title: '', alt: '', caption: '', description: '' },

    // ===============================================
    // 2. SETTINGS LOGIC
    // ===============================================
    async loadSettings() {
       this.isLoading = true;
       try {
          const token = localStorage.getItem('labmu_token');
          let res = await fetch('/api/settings', {
              headers: { 'Authorization': 'Bearer ' + token }
          });
          
          if(res.ok) {
              let json = await res.json();
              // Merge data agar tidak error jika field null
              this.settings = { ...this.settings, ...json };
              this.updateDom(); // Update tampilan browser
          }
       } catch(e) { console.error(e); }
       finally { this.isLoading = false; }
    },

    async saveSettings() {
       this.isSaving = true;
       try {
          const token = localStorage.getItem('labmu_token');
          let res = await fetch('/api/settings', {
              method: 'POST',
              headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer ' + token },
              body: JSON.stringify(this.settings)
          });
          
          if(res.ok) {
              alert('✅ Pengaturan Tersimpan!');
              this.updateDom();
          } else {
              alert('Gagal simpan');
          }
       } catch(e) { alert('Error network'); }
       finally { this.isSaving = false; }
    },

    updateDom() {
        // Update Title Tab Browser
        if(this.settings.site_title) {
            document.title = this.settings.site_title + ' - Admin';
        }
        // Update Favicon Browser secara real-time
        if(this.settings.site_favicon) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = this.settings.site_favicon;
        }
    },

    // ===============================================
    // 3. MEDIA MANAGER LOGIC (Integrated)
    // ===============================================
    async openMediaSelector(target) {
        this.mediaTarget = target; // 'logo' atau 'favicon'
        this.mediaModalOpen = true;
        this.mediaTab = 'library';
        this.selectedMedia = null;
        this.mediaSearchQuery = '';
        this.uploadFile = null;
        this.uploadPreview = null;
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
         // Optional: Isi form meta jika perlu
         this.mediaForm = { title: img.title||'', alt: img.alt||'', caption: img.caption||'', description: img.description||'' };
    },

    confirmMediaSelection() {
         if (!this.selectedMedia || !this.selectedMedia.url) return alert('Pilih gambar dulu!');
         
         // Masukkan URL ke field yang sesuai target
         if (this.mediaTarget === 'logo') {
             this.settings.site_logo = this.selectedMedia.url;
         } else if (this.mediaTarget === 'favicon') {
             this.settings.site_favicon = this.selectedMedia.url;
         }
         
         this.mediaModalOpen = false;
    },

    // --- UPLOAD LOGIC ---
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
                 
                 // Auto select yang baru diupload
                 const newUrl = result.url || result.file_url;
                 const newImg = this.mediaList.find(m => m.url === newUrl);
                 if (newImg) this.selectMediaItem(newImg);
                 
                 this.uploadFile = null; 
                 this.uploadPreview = null;
             } else { alert('Gagal upload.'); }
         } catch(e) { alert('Error upload'); }
    },
    
    // Update Meta (Opsional, biar sama kayak Pages)
    async updateMediaDetails() {
         if(!this.selectedMedia) return;
         try {
             const token = localStorage.getItem('labmu_token');
             await fetch('/api/media/meta', { 
                 method: 'POST', 
                 headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                 body: JSON.stringify({ key: this.selectedMedia.key, ...this.mediaForm })
             });
             alert('Info media tersimpan!');
         } catch(e) { console.log('Saved locally'); }
    }
`;