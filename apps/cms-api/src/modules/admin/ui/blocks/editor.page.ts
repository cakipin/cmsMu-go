import { editorForm } from "./editor/editor-form";
import { editorMediaModal } from "./editor/editor-media-modal";
import { editorTaxonomyModal } from "./editor/editor-taxonomy-modal";
import { editorAutoSaveScript } from "./editor/editor-autosave";

export const editorPage = `
<div x-show="view === 'add' || view === 'edit'" class="animate-fade"
     @open-editor-media.window="openMediaForEditor($event)"
     @trigger-autosave.window="triggerAutoSave()"
     style="padding-bottom:80px; position:relative;"
     x-data="{
         // ===============================================
         // 1. DATA & STATE
         // ===============================================
         mediaModalOpen: false,
         manageModalOpen: false,
         manageTarget: '',      
         isSaving: false,
         saveSuccess: false,
         saveError: '',      
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
         // State SEO & AI
         isGeneratingSeo: false,
         isOptimizingFull: false,
         isGeneratingMetaTitle: false,
         isGeneratingMetaDesc: false,
         isGeneratingExcerpt: false,
         showSeoDetails: false,

         // State Slug & Permalink
         isEditingSlug: false,
         tempSlug: '',
         isManualSlug: false,
         slugCopied: false,

         // State Auto Save Draft
         autoSaveStatus: 'idle',
         lastSavedTime: '',
         hasLocalDraft: false,
         localDraftTime: '',
         localDraftData: null,
         isAutoSaving: false,

         getToken() {
             return (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '');
         },

         // ===============================================
         // 2. LOAD DATA
        // ===============================================
        // 2. LOAD DATA (Ringan, Cepat, Ter-cache sessionStorage)
        // ===============================================
        async loadGlobalData() {
            // 1. Tampilkan cache lokal seketika (0 ms) jika tersedia
            try {
                const cachedCats = sessionStorage.getItem('cmsmu_cats');
                const cachedTags = sessionStorage.getItem('cmsmu_tags');
                if (cachedCats) this.uniqueCategories = JSON.parse(cachedCats);
                if (cachedTags) this.uniqueTags = JSON.parse(cachedTags);
            } catch (_) {}

            // 2. Muat data ringan dari server secara paralel tanpa membebani browser mobile
            try {
                const token = this.getToken();
                const headers = { 'Authorization': 'Bearer ' + token };

                const [catsRes, postsRes] = await Promise.all([
                    fetch('/api/posts/categories/list').catch(() => null),
                    fetch('/api/posts?limit=30', { headers }).catch(() => null)
                ]);

                // Proses kategori dinamis dari database (Zero Hardcode SOP 13)
                let mergedCats = [];

                if (catsRes && catsRes.ok) {
                    const dbCats = await catsRes.json();
                    if (Array.isArray(dbCats)) {
                        dbCats.forEach(c => {
                            if (c && c !== 'Uncategorized' && !mergedCats.includes(c)) {
                                mergedCats.push(c);
                            }
                        });
                    }
                }

                if (this.form && this.form.category && this.form.category !== 'Uncategorized' && !mergedCats.includes(this.form.category)) {
                    mergedCats.unshift(this.form.category);
                }
                this.uniqueCategories = mergedCats;
                try { sessionStorage.setItem('cmsmu_cats', JSON.stringify(mergedCats)); } catch (_) {}

                // Proses posts & tags dari 30 post terbaru (ringan & cepat)
                if (postsRes && postsRes.ok) {
                    const json = await postsRes.json();
                    const posts = Array.isArray(json) ? json : (json.results || []);
                    this.allPosts = posts;

                    const allTags = posts.flatMap(p => (p.tags || '').split(','));
                    const cleanedTags = allTags.map(t => t.trim()).filter(t => t && t !== '-' && t.length > 2);
                    const tagCounts = {};
                    cleanedTags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1);
                    const sortedTags = Object.keys(tagCounts).sort((a,b) => tagCounts[b] - tagCounts[a]);
                    if (sortedTags.length > 0) {
                        this.uniqueTags = sortedTags;
                        try { sessionStorage.setItem('cmsmu_tags', JSON.stringify(sortedTags)); } catch (_) {}
                    }
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
             if(!this.searchQuery) return this.mediaList.slice(0, 60);
             const q = this.searchQuery.toLowerCase();
             return this.mediaList.filter(m => 
                 (m.title && m.title.toLowerCase().includes(q)) || 
                 (m.alt && m.alt.toLowerCase().includes(q))
             ).slice(0, 60);
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
                 if(window.showToast) window.showToast('Pilih gambar dulu!', 'warning');
                 return;
             }
             
             if (this.mediaSelectorTarget === 'custom-editor') {
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
                 const token = this.getToken();
                 await fetch('/api/media/meta', { 
                     method: 'POST', 
                     headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                     body: JSON.stringify({ key: this.selectedMedia.key, ...this.mediaForm })
                 });
                 if(window.showToast) window.showToast('Info tersimpan!', 'success');
             } catch(e) { console.log('Saved locally'); }
         },

         onFileSelect(e) {
             const file = e.target.files[0];
             if (!file) return;
             this.uploadFile = file;
             this.uploadPreview = URL.createObjectURL(file);
             this.mediaForm.title = file.name.split('.')[0].replace(/-/g, ' '); 
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
                             newName = file.name.replace(/\\.[^/.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 40) || 'image';
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

         async uploadMediaAction() {
             if (!this.uploadFile) { if(window.showToast) window.showToast('Pilih file dulu', 'warning'); return; }
             
             let finalFile = this.uploadFile;
             if (finalFile.type.startsWith('image/')) {
                 try {
                     const seoTitle = this.form.title || this.mediaForm.title || '';
                     finalFile = await this.compressImage(finalFile, 0.7, 1600, seoTitle);
                 } catch (err) {
                     console.warn('Gagal kompres', err);
                 }
             }

             const fd = new FormData();
             fd.append('file', finalFile);
             fd.append('title', this.mediaForm.title || (this.form.title ? this.form.title : ''));
             fd.append('alt', this.mediaForm.alt || (this.form.title ? this.form.title : ''));
             fd.append('caption', this.mediaForm.caption);
             fd.append('description', this.mediaForm.description);

             try {
                 const token = this.getToken();
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
                 } else { if(window.showToast) window.showToast('Gagal upload.', 'error'); }
             } catch(e) { if(window.showToast) window.showToast('Error upload', 'error'); }
         },

          // Modal Tambah Kategori Baru
          showNewCategoryModal: false,
          newCategoryInput: '',

          // Modal Rename Kategori / Tag
          showRenameModal: false,
          renameTargetType: '',
          renameOldValue: '',
          renameNewValue: '',
          isRenamingTaxonomy: false,

          // Modal Konfirmasi Hapus Kategori / Tag
          showDeleteModal: false,
          deleteTargetType: '',
          deleteTargetItem: '',
          isDeletingTaxonomy: false,

          openNewCategoryModal() {
              this.newCategoryInput = '';
              this.showNewCategoryModal = true;
          },

          submitNewCategory() {
              const name = (this.newCategoryInput || '').trim();
              if (!name) {
                  if(window.showToast) window.showToast('Nama kategori tidak boleh kosong!', 'warning');
                  return;
              }
              if (!this.uniqueCategories.includes(name)) {
                  this.uniqueCategories.push(name);
              }
              this.form.category = name;
              this.showNewCategoryModal = false;
              this.newCategoryInput = '';
          },

          openManager(target) {
              this.manageTarget = target;
              this.manageModalOpen = true;
              this.managerItems = (target === 'category') ? this.uniqueCategories.filter(c => c !== 'Uncategorized') : this.uniqueTags;
          },

          openRenameItem(item) {
              this.renameTargetType = this.manageTarget;
              this.renameOldValue = item;
              this.renameNewValue = item;
              this.showRenameModal = true;
          },

          async submitRenameTaxonomy() {
              const oldVal = (this.renameOldValue || '').trim();
              const newVal = (this.renameNewValue || '').trim();

              if (!newVal) {
                  if(window.showToast) window.showToast('Nama baru tidak boleh kosong!', 'warning');
                  return;
              }
              if (oldVal.toLowerCase() === newVal.toLowerCase()) {
                  this.showRenameModal = false;
                  return;
              }

              this.isRenamingTaxonomy = true;
              try {
                  const token = this.getToken();
                  const endpoint = this.renameTargetType === 'category' 
                      ? '/api/posts/taxonomy/rename-category' 
                      : '/api/posts/taxonomy/rename-tag';

                  const res = await fetch(endpoint, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                      body: JSON.stringify({ oldName: oldVal, newName: newVal })
                  });

                  if (res.ok) {
                      if (this.renameTargetType === 'category') {
                          const idx = this.uniqueCategories.indexOf(oldVal);
                          if (idx !== -1) this.uniqueCategories[idx] = newVal;
                          if (this.form.category === oldVal) this.form.category = newVal;
                          this.managerItems = this.uniqueCategories.filter(c => c !== 'Uncategorized');
                      } else {
                          const idx = this.uniqueTags.indexOf(oldVal);
                          if (idx !== -1) this.uniqueTags[idx] = newVal;
                          if (this.form.tags) {
                              const tags = this.form.tags.split(',').map(t => t.trim() === oldVal ? newVal : t.trim());
                              this.form.tags = tags.join(', ');
                          }
                          this.managerItems = this.uniqueTags;
                      }
                      this.showRenameModal = false;
                      if(window.showToast) window.showToast('Berhasil mengubah nama!', 'success');
                  } else {
                      const r = await res.json();
                      if(window.showToast) window.showToast('Gagal: ' + (r.error || 'Terjadi kesalahan sistem'), 'error');
                  }
              } catch(e) {
                  if(window.showToast) window.showToast('Error koneksi saat rename taxonomy.', 'error');
              } finally {
                  this.isRenamingTaxonomy = false;
              }
          },

          openDeleteItem(item) {
              this.deleteTargetType = this.manageTarget;
              this.deleteTargetItem = item;
              this.showDeleteModal = true;
          },

          async submitDeleteTaxonomy() {
              const item = this.deleteTargetItem;
              if (!item) return;

              this.isDeletingTaxonomy = true;
              try {
                  const token = this.getToken();
                  const endpoint = this.deleteTargetType === 'category' 
                      ? '/api/posts/taxonomy/delete-category' 
                      : '/api/posts/taxonomy/delete-tag';

                  const res = await fetch(endpoint, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                      body: JSON.stringify({ name: item })
                  });

                  if (res.ok) {
                      if (this.deleteTargetType === 'category') {
                          this.uniqueCategories = this.uniqueCategories.filter(c => c !== item);
                          if (this.form.category === item) this.form.category = 'Berita';
                          this.managerItems = this.uniqueCategories.filter(c => c !== 'Uncategorized');
                      } else {
                          this.uniqueTags = this.uniqueTags.filter(t => t !== item);
                          if (this.form.tags) {
                              const tags = this.form.tags.split(',').map(t => t.trim()).filter(t => t !== item);
                              this.form.tags = tags.join(', ');
                          }
                          this.managerItems = this.uniqueTags;
                      }
                      this.showDeleteModal = false;
                      if(window.showToast) window.showToast('Berhasil menghapus!', 'success');
                  } else {
                      const r = await res.json();
                      if(window.showToast) window.showToast('Gagal: ' + (r.error || 'Terjadi kesalahan sistem'), 'error');
                  }
              } catch(e) {
                  if(window.showToast) window.showToast('Error koneksi saat menghapus taxonomy.', 'error');
              } finally {
                  this.isDeletingTaxonomy = false;
              }
          },

          openMediaForEditor(e) {
              const v = (typeof this.view !== 'undefined' ? this.view : (typeof view !== 'undefined' ? view : ''));
              if (v !== 'add' && v !== 'edit') return;
              this.mediaSelectorTarget = (e && e.detail && e.detail.target) ? e.detail.target : 'custom-editor';
              this.openMediaSelector();
          },

          initEditor() {
              // Custom editor logic handled by customEditorLogic
              this.isEditingSlug = false;
              this.slugCopied = false;
              this.isManualSlug = Boolean(this.editingId && this.form && this.form.slug);
              this.checkLocalDraft();
          },

          async save(targetStatus) {
              const currentContent = this.form.body || '';
              this.form.slug = this.sanitizeSlug(this.form.slug || this.form.title || ('post-' + Date.now()));
              
              if (targetStatus) {
                  this.form.status = targetStatus;
              } else if (!this.form.status) {
                  this.form.status = 'publish';
              }
              
              const payload = JSON.parse(JSON.stringify({
                  id: this.editingId || undefined,
                  title: this.form.title || '',
                  slug: this.form.slug,
                  body: currentContent,
                  excerpt: this.form.excerpt || '',
                  meta_title: this.form.meta_title || '',
                  meta_description: this.form.meta_description || '',
                  og_image: this.form.og_image || '',
                  status: this.form.status,
                  category: this.form.category || 'Berita',
                  tags: this.form.tags || '',
                  featured_image: this.form.featured_image || '',
                  featured_image_caption: this.form.featured_image_caption || '',
                  featured_image_alt: this.form.featured_image_alt || '',
                  is_premium: this.form.is_premium || false,
                  allow_comments: (this.form.allow_comments === 0 || this.form.allow_comments === false || this.form.allow_comments === '0') ? 0 : 1,
                  type: this.form.type || 'post',
                  video_url: this.form.video_url || ''
              }));
              if(!payload.featured_image && (payload.type === 'video' || payload.video_url)) {
                  const autoThumb = this.getYoutubeThumbnail(payload.video_url);
                  if (autoThumb) payload.featured_image = autoThumb;
              }
              if(this.form.date) payload.created_at = new Date(this.form.date).toISOString();

              try {
                   this.isSaving = true;
                   this.saveError = '';
                   const token = this.getToken();
                   const method = this.editingId ? 'PUT' : 'POST';
                   const url = this.editingId ? ('/api/posts/' + this.editingId) : '/api/posts';
                   const res = await fetch(url, {
                       method: method,
                       headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                       body: JSON.stringify(payload)
                   });
                   this.isSaving = false;
                   if(res.ok) { 
                       const r = await res.json();
                       this.saveSuccess = true; 
                       
                       const newId = r.id || this.editingId;
                       if (newId) {
                           this.editingId = newId;
                           if (typeof window !== 'undefined') {
                               window.editingId = newId;
                               if (window.history && window.history.replaceState) {
                                   window.history.replaceState(null, '', '#edit-' + newId);
                               }
                           }
                       }
                       
                       if (typeof window !== 'undefined' && window.showToast) {
                           const msg = (this.form.status === 'publish') ? 'Artikel berhasil diterbitkan!' : 'Draf artikel berhasil disimpan!';
                           window.showToast(msg, 'success', 4000);
                       }
                       if (typeof window !== 'undefined' && window.__CMS_AUTOSAVE) {
                           window.__CMS_AUTOSAVE.clearLocal(newId || this.editingId);
                       }
                       this.hasLocalDraft = false;
                       this.autoSaveStatus = 'saved';
                   } 
                   else { 
                       const r = await res.json().catch(() => ({})); 
                       this.saveError = r.error || 'Gagal menyimpan.';
                       if (typeof window !== 'undefined' && window.showToast) {
                           window.showToast('Gagal: ' + this.saveError, 'error', 5000);
                       }
                   }
              } catch(err) { 
                   this.isSaving = false;
                   this.saveError = err?.message || 'Error koneksi.';
                   if (typeof window !== 'undefined' && window.showToast) {
                       window.showToast('Error: ' + this.saveError, 'error', 5000);
                   }
              }
          },

           getYoutubeThumbnail(url) {
               if (!url) return '';
               try {
                   const str = url.trim();
                   let id = '';
                   if (str.includes('youtu.be/')) {
                       id = str.split('youtu.be/')[1].split('?')[0].split('/')[0];
                   } else if (str.includes('shorts/')) {
                       id = str.split('shorts/')[1].split('?')[0].split('/')[0];
                   } else if (str.includes('embed/')) {
                       id = str.split('embed/')[1].split('?')[0].split('/')[0];
                   } else if (str.includes('v=')) {
                       const m = str.match(/[?&]v=([a-zA-Z0-9_-]+)/);
                       if (m && m[1]) id = m[1];
                   }
                   if (id) return 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
               } catch(e) {}
               return '';
           },

           getVideoEmbedUrl(url) {
               if (!url) return '';
               try {
                   const str = url.trim();
                   if (str.includes('youtube.com/watch') || str.includes('youtu.be/') || str.includes('youtube.com/embed/') || str.includes('youtube.com/shorts/')) {
                       let id = '';
                       if (str.includes('youtu.be/')) {
                           id = str.split('youtu.be/')[1].split('?')[0].split('/')[0];
                       } else if (str.includes('shorts/')) {
                           id = str.split('shorts/')[1].split('?')[0].split('/')[0];
                       } else if (str.includes('embed/')) {
                           id = str.split('embed/')[1].split('?')[0].split('/')[0];
                       } else {
                           const m = str.match(/[?&]v=([a-zA-Z0-9_-]+)/);
                           if (m && m[1]) id = m[1];
                       }
                       if (id) return 'https://www.youtube.com/embed/' + id;
                   }
                   if (str.includes('vimeo.com/')) {
                       const vId = str.split('vimeo.com/')[1].split('?')[0].split('/')[0];
                       if (vId) return 'https://player.vimeo.com/video/' + vId;
                   }
                   return str;
               } catch(e) {
                   return str;
               }
           },

          sanitizeSlug(str) {
              if (!str) return '';
              return String(str)
                  .toLowerCase()
                  .trim()
                  .replace(/['’‘]/g, '')
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '');
          },

          startEditSlug() {
              this.tempSlug = this.form.slug || this.sanitizeSlug(this.form.title || '');
              this.isEditingSlug = true;
          },

          saveSlug() {
              const cleaned = this.sanitizeSlug(this.tempSlug || this.form.title || '');
              this.form.slug = cleaned;
              this.isManualSlug = true;
              this.isEditingSlug = false;
              if (window.showToast) window.showToast('Slug diperbarui: ' + cleaned, 'success');
          },

          cancelEditSlug() {
              this.isEditingSlug = false;
          },

          resetSlugToTitle() {
              this.form.slug = this.sanitizeSlug(this.form.title || '');
              this.isManualSlug = false;
              this.isEditingSlug = false;
              if (window.showToast) window.showToast('Slug disesuaikan dengan judul', 'info');
          },

          async copyPermalink() {
              if (!this.form.slug) return;
              const base = typeof window !== 'undefined' ? window.location.origin : '';
              const url = base + '/' + this.form.slug;
              try {
                  await navigator.clipboard.writeText(url);
                  this.slugCopied = true;
                  if (window.showToast) window.showToast('Tautan berhasil disalin!', 'success');
                  setTimeout(() => { this.slugCopied = false; }, 2000);
              } catch (_) {
                  if (window.showToast) window.showToast('Permalink: ' + url, 'info');
              }
          },

          triggerAutoSave() { if (typeof window !== 'undefined' && window.__CMS_AUTOSAVE) window.__CMS_AUTOSAVE.trigger(this); },
          checkLocalDraft() { if (typeof window !== 'undefined' && window.__CMS_AUTOSAVE) window.__CMS_AUTOSAVE.checkLocal(this); },
          restoreLocalDraft() { if (typeof window !== 'undefined' && window.__CMS_AUTOSAVE) window.__CMS_AUTOSAVE.restoreLocal(this); },
          discardLocalDraft() { if (typeof window !== 'undefined' && window.__CMS_AUTOSAVE) window.__CMS_AUTOSAVE.discardLocal(this); },
          async saveDraftManual() { if (typeof window !== 'undefined' && window.__CMS_AUTOSAVE) await window.__CMS_AUTOSAVE.saveDraftManual(this); else { this.form.status = 'draft'; await this.save(); } },

          makeSlug() {
              if (!this.editingId && !this.isManualSlug && this.form.title) {
                  this.form.slug = this.sanitizeSlug(this.form.title);
              }
              if (!this.form.meta_title || this.form.meta_title === this._autoMetaTitle) {
                  this.form.meta_title = (this.form.title || '').slice(0, 60);
                  this._autoMetaTitle = this.form.meta_title;
              }
          },
          autoGenerateSeo() {
              if (this.form.title && !this.form.meta_title) {
                  this.form.meta_title = this.form.title.slice(0, 60);
              }
              const temp = document.createElement('div');
              temp.innerHTML = this.form.body || '';
              const plain = (temp.innerText || temp.textContent || '').replace(/\\s+/g, ' ').trim();
              if (plain) {
                  let snippet = plain.slice(0, 157);
                  if (plain.length > 157) {
                      const lastSpace = snippet.lastIndexOf(' ');
                      if (lastSpace > 0) snippet = snippet.slice(0, lastSpace);
                      snippet += '...';
                  }
                  this.form.excerpt = snippet;
                  this.form.meta_description = snippet;
              }
          },

          getSeoAnalysis() {
              var score = 0;
              var checks = [];

              // 1. Judul Utama (15 pt)
              var title = (this.form.title || '').trim();
              var titleLen = title.length;
              var titlePass = titleLen >= 20 && titleLen <= 100;
              if (titlePass) score += 15;
              checks.push({
                  name: 'Judul Utama (Title)',
                  desc: titleLen ? (titleLen + ' karakter (ideal: 20-100)') : 'Belum diisi',
                  pass: titlePass,
                  pts: 15
              });

              // 2. Meta Title Google (15 pt)
              var metaTitle = (this.form.meta_title || '').trim();
              var metaTitleLen = metaTitle.length;
              var metaTitlePass = metaTitleLen >= 30 && metaTitleLen <= 65;
              if (metaTitlePass) score += 15;
              checks.push({
                  name: 'Meta Title Google',
                  desc: metaTitleLen ? (metaTitleLen + ' karakter (ideal: 30-65)') : 'Belum diisi',
                  pass: metaTitlePass,
                  pts: 15
              });

              // 3. Meta Description (15 pt)
              var metaDesc = (this.form.meta_description || '').trim();
              var metaDescLen = metaDesc.length;
              var metaDescPass = metaDescLen >= 80 && metaDescLen <= 160;
              if (metaDescPass) score += 15;
              checks.push({
                  name: 'Meta Description',
                  desc: metaDescLen ? (metaDescLen + ' karakter (ideal: 80-160)') : 'Belum diisi',
                  pass: metaDescPass,
                  pts: 15
              });

              // 4. Excerpt Ringkasan (10 pt)
              var excerpt = (this.form.excerpt || '').trim();
              var excerptLen = excerpt.length;
              var excerptPass = excerptLen >= 30 && excerptLen <= 220;
              if (excerptPass) score += 10;
              checks.push({
                  name: 'Ringkasan (Excerpt)',
                  desc: excerptLen ? (excerptLen + ' karakter (ideal: 30-220)') : 'Belum diisi',
                  pass: excerptPass,
                  pts: 10
              });

              // Konten Body
              var bodyHtml = this.form.body || '';
              var plain = bodyHtml.replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim();
              var words = plain ? plain.split(/\\s+/).filter(Boolean) : [];
              var wordCount = words.length;

              // 5. Panjang Konten (15 pt)
              var contentPass = wordCount >= 150;
              if (contentPass) score += 15;
              checks.push({
                  name: 'Panjang Konten Artikel',
                  desc: wordCount + ' kata (ideal: minimal 150 kata)',
                  pass: contentPass,
                  pts: 15
              });

              // 6. Sub-Heading H2/H3 (10 pt) - untuk artikel pendek < 250 kata tidak diwajibkan sub-heading
              var hasHeading = /<h[23][^>]*>/i.test(bodyHtml);
              var headingPass = wordCount < 250 || hasHeading;
              if (headingPass) score += 10;
              checks.push({
                  name: 'Sub-Heading (H2/H3)',
                  desc: hasHeading ? 'Sub-heading ditemukan' : (wordCount < 250 ? 'Artikel ringkas (<250 kata), sub-heading opsional' : 'Gunakan H2 untuk membagi topik (~1 per 300 kata)'),
                  pass: headingPass,
                  pts: 10
              });

              // 7. Kerapian Paragraf (10 pt)
              var pMatches = bodyHtml.match(/<p[^>]*>[\\s\\S]*?<\\/p>/gi) || [];
              var pCount = pMatches.length;
              var avgWords = pCount > 0 ? (wordCount / pCount) : 0;
              var pPass = pCount >= 1 && (avgWords <= 90 || wordCount < 100);
              if (pPass) score += 10;
              checks.push({
                  name: 'Kerapian Paragraf (Readability)',
                  desc: pCount + ' paragraf (rata-rata ' + Math.round(avgWords) + ' kata/paragraf, max 90)',
                  pass: pPass,
                  pts: 10
              });

              // 8. Featured Image (10 pt)
              var imgPass = !!this.form.featured_image;
              if (imgPass) score += 10;
              checks.push({
                  name: 'Gambar Utama (Featured Image)',
                  desc: imgPass ? 'Gambar utama telah dipilih' : 'Belum memilih gambar utama',
                  pass: imgPass,
                  pts: 10
              });

              score = Math.min(100, Math.max(0, score));

              // Warna & Kategori
              var color = '#ef4444'; // Red < 50
              var bg = '#fef2f2';
              var border = '#fca5a5';
              var statusText = 'SEO Kurang Optimal';
              var badgeBg = '#fee2e2';

              if (score === 100) {
                  color = '#059669'; // Emerald Solid Sempurna
                  bg = '#ecfdf5';
                  border = '#34d399';
                  statusText = 'SEO 100% Sempurna! Siap Terbit 🏆';
                  badgeBg = '#d1fae5';
              } else if (score >= 80) {
                  color = '#10b981'; // Green
                  bg = '#f0fdf4';
                  border = '#86efac';
                  statusText = 'SEO Sangat Baik';
                  badgeBg = '#dcfce7';
              } else if (score >= 50) {
                  color = '#f59e0b'; // Orange
                  bg = '#fffbeb';
                  border = '#fde68a';
                  statusText = 'SEO Cukup (Bisa Ditingkatkan)';
                  badgeBg = '#fef3c7';
              }

              return {
                  score: score,
                  color: color,
                  bg: bg,
                  border: border,
                  statusText: statusText,
                  badgeBg: badgeBg,
                  isPerfect: score === 100,
                  checks: checks
              };
          },

          getSeo() {
              return this.getSeoAnalysis();
          },

          sanitizeTags(tagStr) {
              if (!tagStr) return '';
              var raw = tagStr.split(/[,;\\n]+/).map(function(t) {
                  return t.trim().replace(/^[#\\s*_-]+|[#\\s*_-]+$/g, '');
              }).filter(function(t) { return t && t.length >= 2; });
              var limited = [];
              for (var i = 0; i < raw.length; i++) {
                  var words = raw[i].split(/\\s+/).filter(Boolean);
                  var shortTag = words.slice(0, 3).join(' ');
                  if (shortTag && !limited.includes(shortTag)) {
                      limited.push(shortTag);
                  }
                  if (limited.length >= 3) break;
              }
              return limited.join(', ');
          },

          async generateSingleMeta(field) {
              var title = (this.form.title || '').trim();
              var body = (this.form.body || '').trim();
              if (!title && !body) {
                  if (window.showToast) window.showToast('Isi judul atau naskah artikel terlebih dahulu!', 'warning');
                  
                  return;
              }

              if (field === 'meta_title') this.isGeneratingMetaTitle = true;
              else if (field === 'meta_description') this.isGeneratingMetaDesc = true;
              else if (field === 'excerpt') this.isGeneratingExcerpt = true;

              try {
                  var res = await fetch('/api/ai/meta-field', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ field: field, title: title, content: body })
                  });
                  var json = await res.json();
                  if (!res.ok || json.error) throw new Error(json.error || 'Gagal generate');

                  if (field === 'meta_title' && json.value) {
                      this.form.meta_title = json.value;
                      if (window.showToast) window.showToast('✨ Meta Title berhasil digenerate!', 'success');
                  } else if (field === 'meta_description' && json.value) {
                      this.form.meta_description = json.value;
                      if (window.showToast) window.showToast('✨ Meta Description berhasil digenerate!', 'success');
                  } else if (field === 'excerpt' && json.value) {
                      this.form.excerpt = json.value;
                      if (window.showToast) window.showToast('✨ Excerpt ringkasan berhasil digenerate!', 'success');
                  }
              } catch (err) {
                  console.error('[AI Meta Field Error]', err);
                  if (window.showToast) window.showToast('Gagal generate: ' + (err.message || 'Error'), 'error');
                  
              } finally {
                  if (field === 'meta_title') this.isGeneratingMetaTitle = false;
                  else if (field === 'meta_description') this.isGeneratingMetaDesc = false;
                  else if (field === 'excerpt') this.isGeneratingExcerpt = false;
              }
          },

          async generateSeoWithAi() {
              if (this.isGeneratingSeo) return;
              var title = (this.form.title || '').trim();
              var body = (this.form.body || '').trim();
              if (!title && !body) {
                  if (window.showToast) window.showToast('Tuliskan judul atau isi artikel terlebih dahulu!', 'warning');
                  
                  return;
              }

              this.isGeneratingSeo = true;
              try {
                  var res = await fetch('/api/ai/seo-metadata', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title: title, content: body })
                  });
                  var json = await res.json();
                  if (!res.ok || json.error) throw new Error(json.error || 'Gagal generate SEO');

                  var d = json.data || {};
                  if (d.meta_title) this.form.meta_title = d.meta_title;
                  if (d.meta_description) this.form.meta_description = d.meta_description;
                  if (d.excerpt) this.form.excerpt = d.excerpt;
                  if (d.suggested_tags) {
                      var combined = (this.form.tags ? this.form.tags + ', ' : '') + d.suggested_tags;
                      this.form.tags = this.sanitizeTags(combined);
                  }

                  if (window.showToast) {
                      window.showToast('✨ Metadata SEO berhasil dibuat optimal dengan AI!', 'success');
                  }
              } catch (err) {
                  console.error('[AI SEO Error]', err);
                  if (window.showToast) {
                      window.showToast('Gagal generate SEO: ' + (err.message || 'Error'), 'error');
                  } else {
                      if(window.showToast) window.showToast('Gagal generate SEO: ' + (err.message || 'Error'), 'error');
                  }
              } finally {
                  this.isGeneratingSeo = false;
              }
          },

          async fullAiOptimize() {
              if (this.isOptimizingFull) return;
              var title = (this.form.title || '').trim();
              var body = (this.form.body || '').trim();
              if (!title && !body) {
                  if (window.showToast) window.showToast('Tuliskan judul atau isi artikel terlebih dahulu!', 'warning');
                  
                  return;
              }

              this.isOptimizingFull = true;
              try {
                  var res = await fetch('/api/ai/optimize', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title: title, content: body })
                  });
                  var json = await res.json();
                  if (!res.ok || json.error) throw new Error(json.error || 'Gagal optimasi');

                  var d = json.data || {};
                  if (d.content) {
                      this.form.body = d.content;
                      var editorEl = document.querySelector('[x-ref=\\'editor\\']');
                      if (editorEl) editorEl.innerHTML = d.content;
                      var htmlEl = document.querySelector('[x-ref=\\'htmlSource\\']');
                      if (htmlEl) htmlEl.value = d.content;
                  }
                  if (d.meta_title) this.form.meta_title = d.meta_title;
                  if (d.meta_description) this.form.meta_description = d.meta_description;
                  if (d.excerpt) this.form.excerpt = d.excerpt;
                  if (d.suggested_tags) {
                      var combined = (this.form.tags ? this.form.tags + ', ' : '') + d.suggested_tags;
                      this.form.tags = this.sanitizeTags(combined);
                  }

                  if (window.showToast) {
                      window.showToast('🚀 Optimasi SEO Komplit Selesai! Skor SEO Anda kini maksimal.', 'success');
                  }
              } catch (err) {
                  console.error('[AI Full Optimize Error]', err);
                  if (window.showToast) {
                      window.showToast('Gagal optimasi SEO: ' + (err.message || 'Error'), 'error');
                  } else {
                      if(window.showToast) window.showToast('Gagal optimasi SEO: ' + (err.message || 'Error'), 'error');
                  }
              } finally {
                  this.isOptimizingFull = false;
              }
          },
          addTag(t) {
              let cur = this.form.tags || '';
              const arr = cur.split(',').map(x => x.trim());
              if(!arr.includes(t)) this.form.tags = cur ? (cur + ', ' + t) : t;
          },
          setCategory(c) { this.form.category = c; }
     }"
     x-effect="if(view === 'add' || view === 'edit') { initEditor(); loadGlobalData(); }">

    ${editorForm}
    ${editorMediaModal}
    ${editorTaxonomyModal}
    <script>
        ${editorAutoSaveScript}
    </script>
</div>
`;
