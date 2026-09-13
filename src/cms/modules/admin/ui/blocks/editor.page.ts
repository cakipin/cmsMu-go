import { editorForm } from './editor/editor-form.ts';
import { editorMediaModal } from './editor/editor-media-modal.ts';
import { editorTaxonomyModal } from './editor/editor-taxonomy-modal.ts';

export const editorPage = `
<div x-show="view === 'add' || view === 'edit'" class="animate-fade"
     @open-editor-media.window="openMediaForEditor()"
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
         uniqueCategories: ['Berita Daerah', 'Opini & Berita', 'Warta Persyarikatan', 'Kesehatan', 'PTMA', 'Pendidikan Dasar'], 
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
                 const token = localStorage.getItem('labmu_token');
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
                     const dbCategories = Object.keys(catCounts).sort((a,b) => catCounts[b] - catCounts[a]);

                     // Pastikan kategori default selalu tersedia di dropdown
                     const defaultCategories = ['Berita Daerah', 'Opini & Berita', 'Warta Persyarikatan', 'Kesehatan', 'PTMA', 'Pendidikan Dasar'];
                     const merged = [...dbCategories];
                     defaultCategories.forEach(dc => { if (!merged.includes(dc)) merged.push(dc); });

                     // Pastikan form.category yang sudah di-set selalu tersedia
                     if (this.form && this.form.category && this.form.category !== 'Uncategorized' && !merged.includes(this.form.category)) {
                         merged.unshift(this.form.category);
                     }
                     this.uniqueCategories = merged;

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
                 const token = localStorage.getItem('labmu_token');
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
                     if (newImg) this.selectMediaItem(newImg);
                     this.uploadFile = null; this.uploadPreview = null;
                 } else { alert('Gagal upload.'); }
             } catch(e) { alert('Error upload'); }
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
                  alert('Nama kategori tidak boleh kosong!');
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
                  alert('Nama baru tidak boleh kosong!');
                  return;
              }
              if (oldVal.toLowerCase() === newVal.toLowerCase()) {
                  this.showRenameModal = false;
                  return;
              }

              this.isRenamingTaxonomy = true;
              try {
                  const token = localStorage.getItem('labmu_token');
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
                      alert('Berhasil mengubah nama ' + (this.renameTargetType === 'category' ? 'kategori' : 'tag') + '!');
                  } else {
                      const r = await res.json();
                      alert('Gagal: ' + (r.error || 'Terjadi kesalahan sistem'));
                  }
              } catch(e) {
                  alert('Error koneksi saat rename taxonomy.');
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
                  const token = localStorage.getItem('labmu_token');
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
                          if (this.form.category === item) this.form.category = 'Uncategorized';
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
                      alert('Berhasil menghapus ' + (this.deleteTargetType === 'category' ? 'kategori' : 'tag') + '!');
                  } else {
                      const r = await res.json();
                      alert('Gagal: ' + (r.error || 'Terjadi kesalahan sistem'));
                  }
              } catch(e) {
                  alert('Error koneksi saat menghapus taxonomy.');
              } finally {
                  this.isDeletingTaxonomy = false;
              }
          },

          openMediaForEditor() {
              this.openMediaSelector();
              this.mediaSelectorTarget = 'custom-editor';
          },

          initEditor() {
              // Custom editor logic handled by customEditorLogic
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
                  is_premium: this.form.is_premium || false,
                  allow_comments: this.form.allow_comments !== undefined ? this.form.allow_comments : true,
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
                   const token = localStorage.getItem('labmu_token');
                   const method = this.editingId ? 'PUT' : 'POST';
                   const url = this.editingId ? ('/api/posts/' + this.editingId) : '/api/posts';
                   const res = await fetch(url, {
                       method: method,
                       headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                       body: JSON.stringify(payload)
                   });
                   this.isSaving = false;
                   if(res.ok) { 
                       this.saveSuccess = true; 
                       try {
                           const curatingQueueId = sessionStorage.getItem('curating_newsroom_queue_id');
                           if (curatingQueueId) {
                               fetch('/api/addons/newsroom/queue/' + curatingQueueId + '/resolve', {
                                   method: 'POST',
                                   headers: { 'Authorization': 'Bearer ' + token }
                               }).catch(e => console.error('Error resolving curation queue:', e));
                               sessionStorage.removeItem('curating_newsroom_queue_id');
                           }
                       } catch(e) {}
                       
                       setTimeout(() => { 
                           window.location.href = '/admin#posts'; 
                           window.location.reload(); 
                       }, 700); 
                   } 
                   else { 
                       const r = await res.json(); 
                       this.saveError = r.error || 'Gagal menyimpan.';
                       alert('Gagal: ' + this.saveError); 
                   }
              } catch(err) { 
                   this.isSaving = false;
                   this.saveError = 'Error koneksi.';
                   alert('Error koneksi.'); 
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

          makeSlug() { if(!this.editingId) this.form.slug = this.form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'); },
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
</div>
`;
