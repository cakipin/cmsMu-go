export const postsPage = `
<div x-show="view==='posts'" class="animate-fade"
     x-data="{
        /* 1. STATE LOKAL */
        posts: [],
        uniqueCategories: [],
        selectedIds: [],
        filterCategory: '',
        bulkAction: '',
        selectAll: false,
        isLoading: false,
        searchQuery: '',

        /* STATE PAGINATION */
        currentPage: 1,
        itemsPerPage: 50,

        /* 2. GETTER: Filter Kategori & Search */
        get filteredPosts() {
            let result = this.posts || [];
            if (this.filterCategory) {
                result = result.filter(p => p.category === this.filterCategory);
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
                const token = '';
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
                    status: (p.status && p.status.toLowerCase().includes('pub')) ? 'publish' : 'draft',
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
                const token = '';
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
                    const token = '';
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
            /* Jika Editor sudah siap, langsung buka tanpa babibu */
            if (typeof window.openModernEditor === 'function') {
                window.openModernEditor(p);
                return;
            }

            /* Pencarian Target Klik Secara Brutal & Akurat */
            let targetMenu = null;
            const allElements = document.querySelectorAll('*');

            for (let el of allElements) {
                /* Cari elemen yang mengandung teks persis 'Tulis (Modern)' */
                if (el.textContent && el.textContent.trim() === 'Tulis (Modern)') {
                    /* Ambil tag Link <a> atau List <li> pembungkusnya agar kliknya valid */
                    targetMenu = el.closest('a') || el.closest('li') || el.closest('button') || el;
                    break;
                }
            }

            if (targetMenu) {
                /* Munculkan loading spinner di tabel agar user tahu sistem sedang bekerja */
                this.isLoading = true;

                /* Simulasi klik seakan-akan diklik oleh mouse manusia */
                const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
                targetMenu.dispatchEvent(clickEvent);

                /* Polling: Pantau terus sampai script editor ter-load (Maks 6 detik) */
                let attempts = 0;
                const timer = setInterval(() => {
                    attempts++;
                    if (typeof window.openModernEditor === 'function') {
                        clearInterval(timer);
                        this.isLoading = false;
                        window.openModernEditor(p);
                    } else if (attempts >= 30) {
                        clearInterval(timer);
                        this.isLoading = false;
                        alert('Koneksi internet lambat. Modern Editor gagal dipancing, dialihkan ke editor standar...');
                        this.fallbackToOldEditor(p);
                    }
                }, 200);

            } else {
                /* Jika menunya benar-benar tidak ditemukan sama sekali di sidebar */
                this.fallbackToOldEditor(p);
            }
        },

        /* Fungsi bantuan untuk fallback ke Editor Lama jika terjadi kegagalan */
        fallbackToOldEditor(p) {
            if (!p) {
                this.view = 'add';
                this.editingId = null;
                this.form = {title:'', slug:'', body:'', status:'draft', category:'', tags:'', featured_image:''};
                setTimeout(()=> { if(window.initCmsEditor) window.initCmsEditor('editor', ''); }, 100);
            } else {
                this.form = { ...p, body: p.body || '', featured_image_caption: p.featured_image_caption || '' };
                this.editingId = p.id;
                if (this.form.created_at) {
                    const d = new Date(this.form.created_at);
                    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                    this.form.date = d.toISOString().slice(0, 16);
                }
                this.view = 'add';
                setTimeout(() => {
                    if (typeof window.initCmsEditor === 'function') window.initCmsEditor('editor', this.form.body, (c) => this.form.body = c);
                    else if (window.cmsEditor) window.cmsEditor.setContents(this.form.body);
                }, 100);
            }
        }
     }"
     x-init="loadData(); $watch('currentPage', () => selectAll = false)">

  <div style="display:flex; justify-content:space-between; margin-bottom:15px; align-items:center;">
    <h2 style="margin:0;">All Posts</h2>
    <div style="display:flex; gap:10px;">
        <button @click="loadData()" class="btn" style="background:#f1f5f9; color:#475569;" title="Refresh Data">
            <i class="fas fa-sync" :class="isLoading ? 'fa-spin' : ''"></i>
        </button>
        <button @click="openEditorCerdas(null)" class="btn" style="background:#2271b1; color:#fff;">
            <i class="fas fa-plus"></i> Add New
        </button>
    </div>
  </div>

  <div style="margin-bottom:10px; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
      <select x-model="bulkAction" class="input" style="width:auto; margin:0; padding:4px 8px; font-size:13px;">
          <option value="">Bulk Actions</option>
          <option value="delete">Hapus</option>
      </select>
      <button @click="applyBulkAction()" class="btn" style="padding:4px 12px; font-size:13px;">Apply</button>

      <select class="input" style="width:auto; margin:0; padding:4px 8px; font-size:13px; margin-left:10px;"
              x-model="filterCategory" @change="currentPage = 1">
          <option value="">Semua Kategori</option>
          <template x-for="cat in uniqueCategories">
              <option :value="cat" x-text="cat"></option>
          </template>
      </select>

      <input type="text" x-model="searchQuery" @input="currentPage = 1" placeholder="Cari judul, kategori, atau tag..."
             class="input" style="width: 250px; margin: 0 0 0 auto; padding: 5px 12px; font-size: 13px; border-radius: 6px; border: 1px solid #ccc; outline: none;">
  </div>

  <div class="card" style="padding:0; overflow:hidden; border: 1px solid #ccc; background:#fff;">
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
              <b x-text="p.title" @click="openEditorCerdas(p)" style="color:#2271b1; font-size:14px; display:block; margin-bottom:4px; cursor:pointer;"></b>
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

    <div x-show="isLoading" style="text-align:center; padding:20px; color:#666;">
        <i class="fas fa-spinner fa-spin"></i> Memuat Editor Modern...
    </div>

    <div x-show="!isLoading && filteredPosts.length === 0" style="text-align:center; padding:40px; color:#999;">
        Belum ada atau tidak ditemukan postingan.
    </div>

    <div x-show="filteredPosts.length > 0" style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:#f8f9fa; border-top:1px solid #eee;">
        <div style="font-size: 13px; color: #666;">
            Menampilkan <b x-text="filteredPosts.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1"></b> -
            <b x-text="Math.min(currentPage * itemsPerPage, filteredPosts.length)"></b>
            dari <b x-text="filteredPosts.length"></b> artikel
        </div>

        <div style="display:flex; gap: 5px; align-items:center;">
            <button @click="if(currentPage > 1) currentPage--" :disabled="currentPage === 1"
                    class="btn" style="padding: 4px 12px; font-size: 13px; background: #fff; border: 1px solid #ccc; cursor: pointer; border-radius: 4px;"
                    :style="currentPage === 1 ? 'opacity:0.5; cursor:not-allowed;' : ''">
                <i class="fas fa-chevron-left"></i> Prev
            </button>

            <span style="padding: 0 10px; font-size: 13px; font-weight: bold; color:#444;" x-text="'Halaman ' + currentPage + ' dari ' + totalPages"></span>

            <button @click="if(currentPage < totalPages) currentPage++" :disabled="currentPage === totalPages"
                    class="btn" style="padding: 4px 12px; font-size: 13px; background: #fff; border: 1px solid #ccc; cursor: pointer; border-radius: 4px;"
                    :style="currentPage === totalPages ? 'opacity:0.5; cursor:not-allowed;' : ''">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    </div>

  </div>
</div>
`;