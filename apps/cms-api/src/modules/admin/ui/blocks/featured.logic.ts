export const featuredImageLogic = `
    // STATE MODAL
    showMediaSelector: false,
    isUploadingFeatured: false,
    
    // STATE ITEM AKTIF
    activeMediaItem: null, 
    activeMediaMeta: { alt:'', title:'', description:'' }, 
    isSavingMeta: false,

    // BUKA MODAL
    openMediaSelector() {
       this.showMediaSelector = true;
       this.activeMediaItem = null;
       if(typeof this.loadMedia === 'function') {
           this.loadMedia(); 
       }
    },

    // SAAT KLIK GAMBAR
    setActiveItem(media) {
       this.activeMediaItem = media;
       this.activeMediaMeta = {
           alt: media.alt || '',
           title: media.title || '',
           description: media.description || '' 
       };
    },

    // SIMPAN META
    async saveActiveMeta() {
        if(!this.activeMediaItem) return;
        this.isSavingMeta = true;
        try { 
            let res = await fetch('/api/media/meta/' + this.activeMediaItem.key, { 
                method: 'PUT', 
                headers: {'Content-Type':'application/json', 'Authorization': this.token}, 
                body: JSON.stringify(this.activeMediaMeta) 
            }); 
            if(res.status === 401) return this.logout();
            
            // Update data di list lokal agar real-time
            this.activeMediaItem.alt = this.activeMediaMeta.alt;
            this.activeMediaItem.title = this.activeMediaMeta.title;
            this.activeMediaItem.description = this.activeMediaMeta.description; 
            
            alert('✅ Info gambar tersimpan!'); 
        } catch(e) { 
            alert('Error saving meta'); 
        } finally {
            this.isSavingMeta = false;
        }
    },

    // KONFIRMASI PILIHAN
    confirmFeaturedImage() {
       if(!this.activeMediaItem) return;
       this.form.featured_image = this.activeMediaItem.url;
       this.showMediaSelector = false;
    },

    // UPLOAD BARU
    async uploadFeaturedImage(e) {
        const file = e.target.files[0];
        if(!file) return;
        
        this.isUploadingFeatured = true;
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await fetch('/api/media', {
                method: 'POST',
                headers: { 'Authorization': this.token },
                body: formData
            });
            
            if(res.status === 401) return this.logout();
            const json = await res.json();

            if(json.success) {
                if(typeof this.loadMedia === 'function') await this.loadMedia(); 
                
                const newItem = this.mediaList.find(m => m.key === json.key);
                if(newItem) {
                    this.setActiveItem(newItem);
                }
                
                e.target.value = ''; 
            } else {
                alert('Upload Gagal: ' + json.error);
            }
        } catch(err) {
            alert('Error saat upload gambar');
        } finally {
            this.isUploadingFeatured = false;
        }
    }
`; // <--- INI WAJIB PAKAI BACKTICK (`), BUKAN PETIK SATU (')
