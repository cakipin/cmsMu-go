export const postsPage = `
<div x-show="view==='posts'" class="animate-fade"
     x-data="{ 
        /* 1. STATE LOKAL */
        posts: [], 
        uniqueCategories: [], 
        selectedIds: [], 
        filterCategory: '', 
        filterStatus: '', 
        bulkAction: '',
        selectAll: false,
        isLoading: false,
        searchQuery: '',
        
        /* STATE PAGINATION */
        currentPage: 1,
        itemsPerPage: 50,

        /* 2. GETTER: Filter Kategori, Status & Search */
        get filteredPosts() {
            let result = this.posts || [];
            if (this.filterCategory) {
                result = result.filter(p => p.category === this.filterCategory);
            }
            if (this.filterStatus) {
                result = result.filter(p => p.status === this.filterStatus);
            }
            if (this.searchQuery && this.searchQuery.trim() !== '') {
                const q = this.searchQuery.toLowerCase();
                result = result.filter(p => 
                    (p.title && p.title.toLowerCase().includes(q)) || 
                    (p.category && p.category.toLowerCase().includes(q)) || 
                    (p.tags && p.tags.toLowerCase().includes(q)) ||
                    (p.slug && p.slug.toLowerCase().includes(q))
                );
            }
            return result;
        },

        get paginatedPosts() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredPosts.slice(start, end);
        },

        get totalPages() {
            return Math.ceil(this.filteredPosts.length / this.itemsPerPage) || 1;
        },

        /* 3. LOAD DATA */
        async loadData() {
            this.isLoading = true;
            try {
                const token = localStorage.getItem('labmu_token');
                const res = await fetch('/api/posts?t=' + Date.now(), {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                
                if (!res.ok) throw new Error('Gagal load data');
                
                const json = await res.json();
                const rawData = Array.isArray(json) ? json : (json.results || []);
                
                this.posts = rawData.map(p => ({
                    ...p,
                    category: (p.category && p.category !== 'null' && p.category !== '') ? p.category : 'Uncategorized',
                    tags: (p.tags && p.tags !== 'null' && p.tags !== '') ? p.tags : '-',
                    status: (p.status && p.status.toLowerCase().includes('pub')) ? 'publish' : ((p.status === 'curated' || p.status === 'kurasi') ? 'curated' : 'draft'),
                    body: p.body || p.content || '' 
                }));
                
                const cats = this.posts.map(p => p.category).filter(c => c && c !== 'Uncategorized');
                this.uniqueCategories = ['Uncategorized', ...new Set(cats)];

            } catch (e) {
                console.error('Error loadData:', e);
                this.posts = [];
            } finally {
                this.isLoading = false;
            }
        },

        /* 4. LOGIKA SELECT ALL */
        toggleAll() {
            this.selectAll = !this.selectAll;
            this.selectedIds = this.selectAll ? this.paginatedPosts.map(p => p.id) : [];
        },

        /* 5. DELETE SINGLE */
        async deletePost(id) {
            if(!confirm('Hapus post ini secara permanen?')) return;
            try {
                const token = localStorage.getItem('labmu_token');
                const res = await fetch('/api/posts/' + id, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if(res.ok) {
                    this.posts = this.posts.filter(p => p.id !== id);
                    this.selectedIds = this.selectedIds.filter(sid => sid !== id);
                    
                    if(this.paginatedPosts.length === 0 && this.currentPage > 1) {
                        this.currentPage--;
                    }
                } else {
                    alert('Gagal menghapus data.');
                }
            } catch(e) { alert('Gagal koneksi hapus'); }
        },

        /* 6. BULK DELETE */
        async applyBulkAction() {
            if (this.bulkAction === 'delete' && this.selectedIds.length > 0) {
                if(confirm('Hapus item terpilih?')) {
                    const token = localStorage.getItem('labmu_token');
                    await fetch('/api/posts/' + this.selectedIds.join(','), { 
                        method: 'DELETE',
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    
                    this.selectedIds = [];
                    this.selectAll = false;
                    await this.loadData();
                }
            }
        },

        viewPost(slug) {
            if(!slug) return alert('Slug tidak valid');
            window.open('/' + slug, '_blank');
        },

        /* ========================================== */
        /* 7. PEMANGGIL MODERN EDITOR SAKTI & AKURAT  */
        /* ========================================== */
        async openEditorCerdas(p) {
            if (!p) {
                this.view = 'add';
                this.editingId = null;
                this.form = {title:'', slug:'', body:'', status:'draft', category:'', tags:'', featured_image:'', type:'post', video_url:'', is_premium: false, allow_comments: true};
                setTimeout(() => { if(window.initCmsEditor) window.initCmsEditor('editor', ''); }, 50);
                return;
            }

            let fullBody = p.body || '';
            if (!fullBody && p.id) {
                try {
                    const token = localStorage.getItem('labmu_token');
                    const res = await fetch('/api/posts/' + p.id, { headers: { 'Authorization': 'Bearer ' + token } });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.body) {
                            fullBody = data.body;
                            p.body = data.body;
                        }
                    }
                } catch(e) { console.error('Error fetching post body', e); }
            }

            this.form = {
                ...p,
                body: fullBody,
                type: p.type || 'post',
                video_url: p.video_url || '',
                featured_image_caption: p.featured_image_caption || '',
                is_premium: p.is_premium === 1,
                allow_comments: p.allow_comments === 1
            };
            this.editingId = p.id;
            if (this.form.created_at) {
                const d = new Date(this.form.created_at);
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                this.form.date = d.toISOString().slice(0, 16);
            }
            this.view = 'add';

            setTimeout(() => {
                if (typeof window.initCmsEditor === 'function') window.initCmsEditor('editor', fullBody, (c) => this.form.body = c);
                else if (window.cmsEditor) window.cmsEditor.setContents(fullBody);
            }, 50);
        },

        fallbackToOldEditor(p) {
            this.openEditorCerdas(p);
        }
     }" 
     x-init="loadData(); $watch('currentPage', () => selectAll = false)">
     
  <!-- Header All Posts -->
  <div class="flex flex-row justify-between items-center mb-4 gap-2">
    <div class="flex items-center gap-2">
      <h2 class="text-xl font-bold text-slate-800 m-0">All Posts</h2>
      <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium" x-text="filteredPosts.length + ' item'"></span>
    </div>
    <div class="flex items-center gap-2">
        <button @click="loadData()" class="btn min-h-[38px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 transition-colors" title="Refresh Data">
            <i class="fas fa-sync" :class="isLoading ? 'fa-spin' : ''"></i>
        </button>
        <button @click="openEditorCerdas(null)" class="btn min-h-[38px] px-3 sm:px-4 bg-[#2271b1] hover:bg-[#135e96] text-white font-medium rounded-md shadow-sm transition-colors flex items-center gap-1.5">
            <i class="fas fa-plus"></i> <span class="hidden xs:inline">Add New</span>
        </button>
    </div>
  </div>

  <!-- Filter Toolbar Responsif Mobile -->
  <div class="bg-white p-3 rounded-lg border border-slate-200 mb-4 space-y-2.5 shadow-sm">
    <!-- Baris 1: Pencarian Full-Width di Mobile -->
    <div class="relative w-full">
      <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
      <input type="text" x-model="searchQuery" @input="currentPage = 1" placeholder="Cari judul, kategori, slug, tag..." 
             class="input w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-md border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
    </div>

    <!-- Baris 2: Filter Grid & Bulk Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <!-- Filter Kategori & Status Grid -->
      <div class="grid grid-cols-2 sm:flex sm:items-center gap-2 flex-1">
        <select class="input w-full sm:w-auto py-1.5 px-2.5 text-xs rounded-md border border-slate-300 bg-white" 
                x-model="filterCategory" @change="currentPage = 1">
            <option value="">Semua Kategori</option>
            <template x-for="cat in uniqueCategories" :key="cat">
                <option :value="cat" x-text="cat"></option>
            </template>
        </select>

        <select class="input w-full sm:w-auto py-1.5 px-2.5 text-xs rounded-md border border-slate-300 bg-white" 
                x-model="filterStatus" @change="currentPage = 1">
            <option value="">Semua Status</option>
            <option value="publish">Published</option>
            <option value="draft">Draft</option>
            <option value="curated">Kurasi</option>
        </select>
      </div>

      <!-- Bulk Actions Bar -->
      <div class="flex items-center gap-1.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <select x-model="bulkAction" class="input flex-1 sm:flex-initial py-1.5 px-2.5 text-xs rounded-md border border-slate-300 bg-white">
            <option value="">Bulk Actions</option>
            <option value="delete">Hapus</option>
        </select>
        <button @click="applyBulkAction()" class="btn py-1.5 px-3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md font-medium active:scale-95 transition-all">
          Terapkan
        </button>
      </div>
    </div>
  </div>

  <div class="card p-0 overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
    <!-- Desktop Table View (Hidden di Mobile) -->
    <div class="hidden md:block overflow-x-auto">
      <table class="wp-table" style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:#f8f9fa; border-bottom:2px solid #ddd;">
            <th width="30" style="text-align:center; padding:12px;">
              <input type="checkbox" @click="toggleAll()" :checked="selectAll">
            </th>
            <th style="text-align:left; padding:12px;">Title</th>
            <th style="text-align:left; width:140px;">Date</th>
            <th style="text-align:left; width:120px;">Category</th>
            <th style="text-align:left; width:100px;">Tags</th>
            <th width="80" style="text-align:center;">Views</th>
            <th width="80" style="text-align:center;">Status</th>
            <th width="140" style="text-align:center; padding:12px;">Action</th>
          </tr>
        </thead>
        <tbody>
          <template x-for="p in paginatedPosts" :key="p.id">
            <tr style="border-bottom:1px solid #eee;" 
                :style="selectedIds.includes(p.id) ? 'background:#f0f7ff' : ''">
              
              <td style="text-align:center; padding:12px;">
                  <input type="checkbox" :value="p.id" x-model="selectedIds">
              </td>
              
              <td style="padding:12px;">
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px; flex-wrap:wrap;">
                  <span x-show="p.type === 'video' || (p.video_url && p.video_url.length > 0)" style="display:inline-flex; align-items:center; gap:3px; font-size:10px; font-weight:700; background:#fee2e2; color:#dc2626; padding:2px 6px; border-radius:4px;">
                    <i class="fas fa-video"></i> VIDEO
                  </span>
                  <b x-text="p.title" @click="openEditorCerdas(p)" style="color:#2271b1; font-size:14px; cursor:pointer;"></b>
                </div>
                <div style="font-size:11px; color:#666; font-family:monospace;" x-text="'/'+p.slug"></div>
              </td>
              
              <td style="font-size:12px;">
                  <template x-if="p.created_at">
                      <div>
                          <span style="font-weight:600; color:#333;">
                              <i class="far fa-calendar-alt" style="margin-right:3px; color:#888;"></i>
                              <span x-text="new Date(p.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})"></span>
                          </span>
                      </div>
                  </template>
              </td>
              
              <td style="font-size:12px; color:#555;" x-text="p.category"></td>
              <td style="font-size:12px; color:#555;" x-text="p.tags"></td>
              
              <td style="text-align:center; font-size:12px; font-weight:bold; color:#64748b;" x-text="p.views || 0"></td>
              
              <td style="text-align:center;">
                <i x-show="p.status=='publish'" class="fas fa-check-circle" style="color:#10b981; font-size:16px;" title="Published"></i>
                <i x-show="p.status=='draft'" class="fas fa-file-alt" style="color:#94a3b8; font-size:16px;" title="Draft"></i>
                <i x-show="p.status=='curated'" class="fas fa-tasks" style="color:#f59e0b; font-size:16px;" title="Dalam Kurasi"></i>
              </td>
              
              <td style="padding:8px; text-align:center;">
                <div style="display:flex; align-items:center; justify-content:center; gap:15px;">
                  <button @click="viewPost(p.slug)" title="Lihat" style="color:#2271b1; background:none; border:none; cursor:pointer;">
                      <i class="fas fa-eye"></i>
                  </button>
                  <button @click="openEditorCerdas(p)" title="Edit" style="color:#f39c12; background:none; border:none; cursor:pointer;">
                      <i class="fas fa-pencil-alt"></i>
                  </button>
                  <button @click="deletePost(p.id)" title="Hapus" style="color:#e74c3c; background:none; border:none; cursor:pointer;">
                      <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card List View (Block di Mobile, Hidden di Desktop) -->
    <div class="block md:hidden divide-y divide-slate-100">
      <!-- Select All Mobile Bar -->
      <div class="p-3 bg-slate-50 flex items-center justify-between text-xs text-slate-600 border-b border-slate-200">
        <label class="flex items-center gap-2 cursor-pointer font-medium">
          <input type="checkbox" @click="toggleAll()" :checked="selectAll" class="rounded text-blue-600">
          <span>Pilih Semua di Halaman Ini</span>
        </label>
        <span x-show="selectedIds.length > 0" class="font-semibold text-blue-600" x-text="selectedIds.length + ' dipilih'"></span>
      </div>

      <!-- Card Items -->
      <template x-for="p in paginatedPosts" :key="p.id">
        <div class="p-3.5 transition-colors" :class="selectedIds.includes(p.id) ? 'bg-blue-50/60' : 'bg-white'">
          <div class="flex items-start gap-2.5">
            <input type="checkbox" :value="p.id" x-model="selectedIds" class="mt-1 rounded text-blue-600 flex-shrink-0">
            <div class="flex-1 min-w-0">
              <!-- Judul & Badge -->
              <div class="flex items-center gap-1.5 flex-wrap mb-1">
                <span x-show="p.type === 'video' || (p.video_url && p.video_url.length > 0)" class="inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                  <i class="fas fa-video"></i> VIDEO
                </span>
                <span x-show="p.status=='publish'" class="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                  <i class="fas fa-check-circle"></i> Publish
                </span>
                <span x-show="p.status=='draft'" class="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  <i class="fas fa-file-alt"></i> Draft
                </span>
                <span x-show="p.status=='curated'" class="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                  <i class="fas fa-tasks"></i> Kurasi
                </span>
              </div>

              <!-- Judul Klik Langsung ke Editor -->
              <h3 class="text-sm font-semibold text-slate-900 leading-snug mb-1 cursor-pointer hover:text-blue-600 active:text-blue-800 break-words" 
                  x-text="p.title" @click="openEditorCerdas(p)"></h3>

              <!-- Slug URL -->
              <div class="text-[11px] text-slate-500 font-mono truncate mb-2" x-text="'/' + p.slug"></div>

              <!-- Metadata Baris: Kategori, Tanggal, Views -->
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-2.5">
                <span class="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                  <i class="fas fa-folder text-[10px] text-slate-400"></i>
                  <span x-text="p.category"></span>
                </span>
                <template x-if="p.created_at">
                  <span class="inline-flex items-center gap-1">
                    <i class="far fa-calendar-alt text-[10px] text-slate-400"></i>
                    <span x-text="new Date(p.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})"></span>
                  </span>
                </template>
                <span class="inline-flex items-center gap-1 font-semibold text-slate-600">
                  <i class="fas fa-eye text-[10px] text-slate-400"></i>
                  <span x-text="p.views || 0"></span>
                </span>
              </div>

              <!-- Action Bar Mobile dengan Tap Target Nyaman (min 40px) -->
              <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button type="button" @click="viewPost(p.slug)" title="Lihat Post" 
                        class="min-h-[40px] px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center justify-center gap-1.5 flex-1 active:scale-95 transition-all">
                  <i class="fas fa-eye text-blue-600"></i> Lihat
                </button>
                <button type="button" @click="openEditorCerdas(p)" title="Edit Post" 
                        class="min-h-[40px] px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md flex items-center justify-center gap-1.5 flex-1 active:scale-95 transition-all">
                  <i class="fas fa-pencil-alt text-amber-600"></i> Edit
                </button>
                <button type="button" @click="deletePost(p.id)" title="Hapus Post" 
                        class="min-h-[40px] px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md flex items-center justify-center gap-1.5 active:scale-95 transition-all">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Loading & Empty States -->
    <div x-show="isLoading" class="text-center py-6 text-slate-500 text-sm">
        <i class="fas fa-spinner fa-spin mr-1"></i> Memuat daftar postingan...
    </div>
    
    <div x-show="!isLoading && filteredPosts.length === 0" class="text-center py-10 text-slate-400 text-sm">
        Belum ada atau tidak ditemukan postingan.
    </div>

    <!-- Pagination Bar Responsif Mobile & Desktop -->
    <div x-show="filteredPosts.length > 0" class="flex flex-col sm:flex-row justify-between items-center gap-3 p-3.5 bg-slate-50 border-t border-slate-200">
        <div class="text-xs text-slate-600 text-center sm:text-left">
            Menampilkan <b x-text="filteredPosts.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1"></b> - 
            <b x-text="Math.min(currentPage * itemsPerPage, filteredPosts.length)"></b> 
            dari <b x-text="filteredPosts.length"></b> artikel
        </div>
        
        <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
            <button @click="if(currentPage > 1) currentPage--" :disabled="currentPage === 1" 
                    class="btn min-h-[40px] px-3.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md flex items-center gap-1 text-slate-700 shadow-sm active:scale-95 transition-all" 
                    :class="currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'">
                <i class="fas fa-chevron-left"></i> Prev
            </button>
            
            <span class="px-2 text-xs font-bold text-slate-700" x-text="'Hal ' + currentPage + ' / ' + totalPages"></span>
            
            <button @click="if(currentPage < totalPages) currentPage++" :disabled="currentPage === totalPages" 
                    class="btn min-h-[40px] px-3.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md flex items-center gap-1 text-slate-700 shadow-sm active:scale-95 transition-all" 
                    :class="currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    </div>
  </div>
</div>
`;