/**
 * 📦 GLOBAL MODALS COMPONENT
 * Modal mandiri dengan logika internal (Self-Contained Logic)
 * Menggunakan event window untuk komunikasi dengan komponen lain.
 */
export const globalModals = `
<div x-data="{
    // ============================================
    // STATE INTERNAL MODAL
    // ============================================
    showMediaSelector: false,
    mediaTab: 'library', // 'library' | 'upload'
    mediaList: [],
    activeMediaItem: null,
    isUploading: false,
    isSavingMeta: false,
    
    // Form Metadata Sementara
    mediaForm: { 
        title: '', 
        alt: '', 
        caption: '', 
        description: '' 
    },

    // Callback Callback dari pemanggil
    _callback: null,

    // ============================================
    // INIT & LISTENERS
    // ============================================
    init() {
        // Dengar event global 'open-media-modal'
        window.addEventListener('open-media-modal', (e) => {
            this.showMediaSelector = true;
            this.mediaTab = 'library';
            this._callback = e.detail?.callback; // Simpan callback
            this.activeMediaItem = null;
            this.mediaForm = { title:'', alt:'', caption:'', description:'' };
            this.loadMedia(); // Load data terbaru
        });
    },

    // ============================================
    // LOGIKA LOAD DATA
    // ============================================
    async loadMedia() {
        try {
            const token = localStorage.getItem('labmu_token');
            const res = await fetch('/api/media', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const json = await res.json();
            this.mediaList = Array.isArray(json) ? json : (json.results || []);
        } catch(e) { console.error('Modal Load Error', e); }
    },

    // ============================================
    // LOGIKA PILIH GAMBAR
    // ============================================
    selectItem(item) {
        this.activeMediaItem = item;
        // Isi form dengan data item yang dipilih
        this.mediaForm = {
            title: item.title || (item.key ? item.key.split('/').pop() : ''),
            alt: item.alt || '',
            caption: item.caption || '',
            description: item.description || ''
        };
    },

    // ============================================
    // LOGIKA UPLOAD
    // ============================================
    onFileSelect(e) {
        const file = e.target.files[0];
        if(!file) return;
        
        // Auto-fill title dari nama file
        this.mediaForm.title = file.name.split('.')[0].replace(/-/g, ' ');
        this.uploadFile(file);
    },

    async uploadFile(file) {
        this.isUploading = true;
        const fd = new FormData();
        fd.append('file', file);
        // Kirim metadata awal
        fd.append('title', this.mediaForm.title);
        fd.append('alt', this.mediaForm.alt);
        fd.append('caption', this.mediaForm.caption);
        fd.append('description', this.mediaForm.description);

        try {
            const token = localStorage.getItem('labmu_token');
            const res = await fetch('/api/media', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token },
                body: fd
            });
            
            if(res.ok) {
                const result = await res.json();
                await this.loadMedia(); // Refresh list
                this.mediaTab = 'library';
                
                // Auto-select gambar baru
                const newUrl = result.url || result.file_url;
                const newImg = this.mediaList.find(m => m.url === newUrl);
                if(newImg) this.selectItem(newImg);
            } else {
                alert('Gagal upload.');
            }
        } catch(e) { alert('Error upload.'); }
        finally { this.isUploading = false; }
    },

    // ============================================
    // LOGIKA SIMPAN META & CONFIRM
    // ============================================
    async updateMeta() {
        if(!this.activeMediaItem) return;
        this.isSavingMeta = true;
        
        // Update state lokal (optimistic)
        Object.assign(this.activeMediaItem, this.mediaForm);

        try {
            const token = localStorage.getItem('labmu_token');
            await fetch('/api/media/meta', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token 
                },
                body: JSON.stringify({
                    key: this.activeMediaItem.key,
                    ...this.mediaForm
                })
            });
            alert('Info tersimpan.');
        } catch(e) { console.warn('Meta save error (mungkin backend belum siap)'); }
        finally { this.isSavingMeta = false; }
    },

    confirmSelection() {
        if(this.activeMediaItem && this._callback) {
            // Panggil callback dengan URL dan Meta
            this._callback(this.activeMediaItem.url, this.mediaForm);
        }
        this.showMediaSelector = false;
    }

}" x-init="init()">

    <div class="modal-overlay" 
         x-show="showMediaSelector" 
         x-cloak 
         x-transition.opacity 
         style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 99999; display: flex; justify-content: center; align-items: center;">
       
       <div class="modal-box" @click.away="showMediaSelector=false" 
            style="background: white; width: 95%; max-width: 1100px; height: 90vh; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
          
          <div style="padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #fff;">
             <div style="display: flex; align-items: center; gap: 15px;">
                 <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #333;">Media Library</h3>
                 
                 <div style="display: flex; background: #f1f5f9; padding: 4px; border-radius: 6px;">
                    <button @click="mediaTab='library'" 
                            :style="mediaTab==='library' ? 'background:white; box-shadow:0 1px 2px rgba(0,0,0,0.1); font-weight:600; color:#2271b1;' : 'color:#666;'"
                            style="border:none; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-size: 13px; transition: 0.2s;">
                        Library
                    </button>
                    <button @click="mediaTab='upload'" 
                            :style="mediaTab==='upload' ? 'background:white; box-shadow:0 1px 2px rgba(0,0,0,0.1); font-weight:600; color:#2271b1;' : 'color:#666;'"
                            style="border:none; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-size: 13px; transition: 0.2s;">
                        Upload Baru
                    </button>
                 </div>
             </div>
             <button @click="showMediaSelector=false" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #888; line-height: 1;">&times;</button>
          </div>

          <div style="display: flex; flex: 1; overflow: hidden; background: #f0f0f1;">
              
              <div x-show="mediaTab === 'library'" style="display: flex; width: 100%; height: 100%;">
                  
                  <div style="flex: 1; overflow-y: auto; padding: 20px;">
                     <div x-show="mediaList.length === 0" style="text-align: center; padding: 50px; color: #999;">Belum ada media.</div>
                     
                     <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px;">
                         <template x-for="m in mediaList" :key="m.key">
                            <div @click="selectItem(m)" 
                                 style="cursor: pointer; border: 3px solid transparent; aspect-ratio: 1; background: white; position: relative; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: transform 0.1s;"
                                 :style="activeMediaItem && activeMediaItem.key === m.key ? 'border-color: #2271b1; box-shadow: 0 0 0 1px #2271b1; transform: scale(0.98);' : 'border-color: transparent;'">
                               <img :src="m.url" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
                               <div x-show="activeMediaItem && activeMediaItem.key === m.key" 
                                    style="position: absolute; top: 6px; right: 6px; background: #2271b1; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px;">✓</div>
                            </div>
                         </template>
                     </div>
                  </div>

                  <div style="width: 320px; flex-shrink: 0; background: white; border-left: 1px solid #ddd; display: flex; flex-direction: column; overflow: hidden;">
                      
                      <div x-show="activeMediaItem" style="display: flex; flex-direction: column; height: 100%;">
                          <div style="flex: 1; overflow-y: auto; padding: 20px;">
                              <h4 style="margin: 0 0 15px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Attachment Details</h4>
                              
                              <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; border: 1px solid #eee; text-align: center; margin-bottom: 20px;">
                                  <img :src="activeMediaItem?.url" style="max-width: 100%; max-height: 150px; object-fit: contain;">
                                  <div style="margin-top: 8px; font-size: 11px; color: #666; word-break: break-all;" x-text="activeMediaItem?.key?.split('/').pop()"></div>
                              </div>

                              <div style="display: grid; gap: 15px;">
                                  <div>
                                      <label style="font-size: 11px; font-weight: 600; color: #444; display: block; margin-bottom: 4px;">Title</label>
                                      <input x-model="mediaForm.title" class="input" style="font-size: 13px; padding: 8px;">
                                  </div>
                                  <div>
                                      <label style="font-size: 11px; font-weight: 600; color: #444; display: block; margin-bottom: 4px;">Alt Text</label>
                                      <input x-model="mediaForm.alt" class="input" style="font-size: 13px; padding: 8px;" placeholder="Describe for SEO">
                                  </div>
                                  <div>
                                      <label style="font-size: 11px; font-weight: 600; color: #444; display: block; margin-bottom: 4px;">Caption</label>
                                      <input x-model="mediaForm.caption" class="input" style="font-size: 13px; padding: 8px;">
                                  </div>
                                  <div>
                                      <label style="font-size: 11px; font-weight: 600; color: #444; display: block; margin-bottom: 4px;">Description</label>
                                      <textarea x-model="mediaForm.description" class="input" style="height: 70px; font-size: 13px; padding: 8px;"></textarea>
                                  </div>
                                  <button @click="updateMeta()" class="btn btn-sm" style="width: 100%; justify-content: center; background: #f0f0f1; border: 1px solid #ccc; color: #333;">
                                      <i class="fas" :class="isSavingMeta ? 'fa-spinner fa-spin' : 'fa-save'"></i> Simpan Detail
                                  </button>
                              </div>
                          </div>

                          <div style="padding: 20px; border-top: 1px solid #eee; background: #fff;">
                              <button @click="confirmSelection()" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px; font-weight: 600; font-size: 14px;">
                                  Pilih Gambar Ini
                              </button>
                          </div>
                      </div>

                      <div x-show="!activeMediaItem" style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 30px; color: #999;">
                          <i class="fas fa-mouse-pointer fa-3x" style="opacity: 0.2; margin-bottom: 15px;"></i>
                          <p style="font-size: 14px;">Pilih gambar di sebelah kiri<br>untuk melihat detailnya.</p>
                      </div>
                  </div>
              </div>

              <div x-show="mediaTab === 'upload'" style="display: flex; width: 100%; justify-content: center; align-items: center; padding: 40px; overflow-y: auto;">
                  <div style="background: white; padding: 40px; border-radius: 8px; border: 1px solid #eee; width: 100%; max-width: 500px; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
                      
                      <div style="text-align: center; margin-bottom: 30px;">
                          <h4 style="margin: 0 0 10px 0; font-size: 18px;">Upload Gambar Baru</h4>
                          <p style="margin: 0; font-size: 13px; color: #666;">Pilih file gambar untuk diunggah ke library.</p>
                      </div>

                      <label style="display: block; padding: 40px; border: 2px dashed #ccc; border-radius: 8px; cursor: pointer; text-align: center; transition: 0.2s; background: #f9f9f9; margin-bottom: 20px;"
                             :style="isUploading ? 'opacity: 0.5; pointer-events: none;' : ''">
                          <i class="fas" :class="isUploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'" style="font-size: 40px; color: #ccc; margin-bottom: 15px;"></i>
                          <div style="font-weight: 600; color: #555;" x-text="isUploading ? 'Mengupload...' : 'Klik untuk pilih file'"></div>
                          <div style="font-size: 12px; color: #999; margin-top: 5px;" x-show="!isUploading">Mendukung JPG, PNG, WEBP</div>
                          <input type="file" @change="onFileSelect" style="display: none;" accept="image/*" :disabled="isUploading">
                      </label>

                      <div style="display: grid; gap: 15px; text-align: left;">
                          <div>
                              <label style="font-size: 12px; font-weight: 600;">Judul File</label>
                              <input x-model="mediaForm.title" class="input" placeholder="Otomatis dari nama file">
                          </div>
                          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                              <div><label style="font-size: 12px; font-weight: 600;">Alt Text</label><input x-model="mediaForm.alt" class="input"></div>
                              <div><label style="font-size: 12px; font-weight: 600;">Caption</label><input x-model="mediaForm.caption" class="input"></div>
                          </div>
                          <div>
                              <label style="font-size: 12px; font-weight: 600;">Deskripsi</label>
                              <textarea x-model="mediaForm.description" class="input" style="height: 60px;"></textarea>
                          </div>
                      </div>

                  </div>
              </div>

          </div>
       </div>
    </div>
</div>
`;