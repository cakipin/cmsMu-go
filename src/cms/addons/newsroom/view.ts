export const newsroomView = `
<div x-show="view === 'newsroom'" class="exclusive-wrapper" x-init="loadQueue()" @reload-newsroom.window="loadQueue()" x-data="{
    queue: [],
    sourcesList: [],
    isLoading: false,
    selectedItem: null,
    actionAlert: null,

    // Filter State
    searchQuery: '',
    filterSource: '',
    startDate: '',
    endDate: '',

    // Pagination State
    currentPage: 1,
    perPage: 10,

    async init() {
        await this.loadQueue();
    },

    async loadQueue() {
        this.isLoading = true;
        try {
            const token = window.getCmsToken ? window.getCmsToken() : (localStorage.getItem('labmu_token') || '');
            const params = new URLSearchParams();
            if (this.searchQuery.trim()) params.append('search', this.searchQuery.trim());
            if (this.filterSource) params.append('source_id', this.filterSource);
            if (this.startDate) params.append('start_date', this.startDate);
            if (this.endDate) params.append('end_date', this.endDate);

            const url = '/api/addons/newsroom/queue' + (params.toString() ? '?' + params.toString() : '');
            const res = await fetch(url, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data.success) {
                this.queue = data.data;
                if (data.sources && Array.isArray(data.sources)) {
                    this.sourcesList = data.sources;
                }
                this.currentPage = 1;
            }
        } catch(e) {
            console.error('Failed loading newsroom queue:', e);
        } finally {
            this.isLoading = false;
        }
    },

    resetFilters() {
        this.searchQuery = '';
        this.filterSource = '';
        this.startDate = '';
        this.endDate = '';
        this.loadQueue();
    },

    get totalPages() {
        return Math.ceil(this.queue.length / this.perPage) || 1;
    },

    get paginatedQueue() {
        const start = (this.currentPage - 1) * this.perPage;
        return this.queue.slice(start, start + this.perPage);
    },

    prevPage() {
        if (this.currentPage > 1) this.currentPage--;
    },

    nextPage() {
        if (this.currentPage < this.totalPages) this.currentPage++;
    },

    goToPage(p) {
        if (p >= 1 && p <= this.totalPages) this.currentPage = p;
    },

    openCurateModal(item) {
        this.selectedItem = item;

        // Ambil isi artikel atau deskripsi, lalu bersihkan via helper eksternal
        // (fungsi window.cleanNewsroomContent didefinisikan di script tag terpisah agar
        //  karakter < di dalam regex tidak merusak HTML attribute x-data parser)
        let bodyContent = item.raw_content_html || item.raw_description || '';
        if (typeof window.cleanNewsroomContent === 'function') {
            bodyContent = window.cleanNewsroomContent(bodyContent);
        }

        // Format paragraf jika belum terformat
        if (bodyContent && !bodyContent.includes('<p>')) {
            bodyContent = '<p>' + bodyContent.replace(/\\n/g, '<br>') + '</p>';
        }

        // Sematkan banner atribusi rujukan sumber asli secara otomatis dan elegan
        if (item.raw_url) {
            const srcName = item.source_name || 'Media Afiliasi';
            bodyContent += '<p><br></p>' +
                '<blockquote class=&quot;attribution-box&quot; style=&quot;border-left: 4px solid #10b981; padding: 12px 16px; margin: 20px 0; background: #ecfdf5; color: #065f46; font-size: 14px; border-radius: 0 8px 8px 0;&quot;>' +
                '<strong>Sumber Berita:</strong> Disadur dari <a href=&quot;' + item.raw_url + '&quot; target=&quot;_blank&quot; rel=&quot;noopener canonical&quot; style=&quot;color: #059669; text-decoration: underline; font-weight: 600;&quot;>' + srcName + '</a> untuk kepentingan syiar dakwah persyarikatan.' +
                '</blockquote>';
        }

        // Simpan penanda antrean yang sedang dikurasi ke sessionStorage
        try {
            sessionStorage.setItem('curating_newsroom_queue_id', String(item.id));
        } catch(e) {}

        // Buat tanggal rilis yang valid untuk input datetime-local (Gunakan WAKTU RILIS ASLI)
        let dateStr = '';
        if (item.raw_published_at) {
            try {
                const pubDate = new Date(item.raw_published_at);
                if (!isNaN(pubDate.getTime())) {
                    pubDate.setMinutes(pubDate.getMinutes() - pubDate.getTimezoneOffset());
                    dateStr = pubDate.toISOString().slice(0, 16);
                }
            } catch(e) {}
        }
        if (!dateStr) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            dateStr = now.toISOString().slice(0, 16);
        }

        const targetCategory = item.default_category || 'Berita Daerah';

        // Pre-fill form editor post bawaan CMSMu (langsung ke root component Alpine)
        const curatingFormData = {
            title: item.raw_title || '',
            slug: (item.raw_title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
            body: bodyContent,
            excerpt: (item.raw_description || '').slice(0, 200),
            meta_title: item.raw_title || '',
            meta_description: (item.raw_description || '').slice(0, 160),
            og_image: item.raw_image || '',
            category: targetCategory,
            tags: 'Muhammadiyah, ' + targetCategory,
            featured_image: item.raw_image || '',
            featured_image_caption: item.source_name ? ('Foto: Dok. ' + item.source_name) : '',
            type: 'post',
            status: 'curated',
            date: dateStr,
            is_premium: false,
            allow_comments: true,
            video_url: ''
        };

        // Ambil instance root Alpine (cms())
        const rootEl = document.querySelector('body[x-data]');
        const rootComponent = rootEl && rootEl._x_dataStack ? rootEl._x_dataStack[0] : null;

        if (rootComponent) {
            rootComponent.editingId = null;
            rootComponent.form = { ...curatingFormData };
            if (Array.isArray(rootComponent.uniqueCategories) && !rootComponent.uniqueCategories.includes(targetCategory)) {
                rootComponent.uniqueCategories.unshift(targetCategory);
            }
            rootComponent.view = 'add';
        } else {
            this.form = { ...curatingFormData };
            this.editingId = null;
            this.view = 'add';
        }

        // Trigger inisialisasi konten ke editor WYSIWYG resmi / custom editor
        setTimeout(() => {
            const editorEl = document.querySelector('.modern-editor-content');
            if (editorEl) {
                editorEl.innerHTML = bodyContent;
            }
            if (typeof window.initCmsEditor === 'function') {
                window.initCmsEditor('editor', bodyContent, (c) => {
                    if (rootComponent) rootComponent.form.body = c;
                    this.form.body = c;
                });
            } else if (window.cmsEditor && typeof window.cmsEditor.setContents === 'function') {
                window.cmsEditor.setContents(bodyContent);
            }
        }, 120);
    },

    async quickApprove(item) {
        if (!confirm('Terbitkan langsung berita ini ke portal utama tanpa melalui editor?\\n\\nJudul: ' + (item.raw_title || ''))) return;
        try {
            const token = window.getCmsToken ? window.getCmsToken() : (localStorage.getItem('labmu_token') || '');
            
            // Bersihkan isi berita via helper DOM
            let bodyContent = item.raw_content_html || item.raw_description || '';
            if (typeof window.cleanNewsroomContent === 'function') {
                bodyContent = window.cleanNewsroomContent(bodyContent);
            }
            if (bodyContent && !bodyContent.includes('<p>')) {
                bodyContent = '<p>' + bodyContent.replace(/\\n/g, '<br>') + '</p>';
            }

            const targetCategory = item.default_category || 'Berita Daerah';

            const payload = {
                title: item.raw_title || 'Tanpa Judul',
                contentHtml: bodyContent,
                category: targetCategory,
                featured_image: item.raw_image || '',
                excerpt: (item.raw_description || '').slice(0, 200),
                author: item.source_name ? ('Dok. ' + item.source_name) : 'Redaksi Newsroom',
                tags: 'Muhammadiyah, ' + targetCategory,
                published_at: item.raw_published_at || ''
            };

            const res = await fetch('/api/addons/newsroom/queue/' + item.id + '/publish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                await this.loadQueue();
                if (typeof window.showToast === 'function') {
                    window.showToast('Berita berhasil disetujui & langsung diterbitkan!', 'success');
                } else {
                    alert('Berhasil: ' + (data.message || 'Berita berhasil diterbitkan!'));
                }
            } else {
                alert('Gagal menerbitkan: ' + (data.error || 'Terjadi kesalahan'));
            }
        } catch(e) {
            alert('Error: ' + e.message);
        }
    },

    async rejectItem(id, title) {
        if (!confirm('Abaikan berita ini dari antrean kurasi: ' + title + '?')) return;
        try {
            const token = window.getCmsToken ? window.getCmsToken() : (localStorage.getItem('labmu_token') || '');
            const res = await fetch('/api/addons/newsroom/queue/' + id + '/reject', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data.success) {
                await this.loadQueue();
            } else {
                alert('Gagal: ' + (data.error || 'Error'));
            }
        } catch(e) {
            alert('Error: ' + e.message);
        }
    }
}">

    <!-- Page Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h2 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <i class="fas fa-newspaper text-primary"></i>
                Meja Kurasi Redaksi (Newsroom)
            </h2>
            <p class="text-slate-500 text-sm mt-1">Tinjau, cari, dan kurasi berita masuk dari media jejaring persyarikatan sebelum dipublikasikan ke portal utama</p>
        </div>
        <div class="flex items-center gap-3">
            <button @click="loadQueue()" class="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
                <i class="fas fa-sync-alt" :class="isLoading ? 'fa-spin text-primary' : ''"></i>
                Segarkan Antrean
            </button>
            <button @click="view = 'aggregator'" class="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-900 shadow-sm transition-all">
                <i class="fas fa-satellite-dish"></i>
                Kelola Sumber
            </button>
        </div>
    </div>

    <!-- Smart Filter & Search Bar Card -->
    <div class="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
            <!-- Pencarian Cerdas -->
            <div class="md:col-span-4">
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5 flex items-center gap-1.5">
                    <i class="fas fa-search text-primary"></i>
                    Pencarian Cerdas
                </label>
                <div class="relative">
                    <input type="text" x-model="searchQuery" @keyup.enter="loadQueue()" placeholder="Cari judul, topik, kata kunci..." class="w-full rounded-xl border border-slate-200 pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <i class="fas fa-search absolute left-3 top-3.5 text-xs text-slate-400"></i>
                    <button x-show="searchQuery" @click="searchQuery = ''; loadQueue();" class="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                        <i class="fas fa-times-circle text-sm"></i>
                    </button>
                </div>
            </div>

            <!-- Dropdown Media Sumber -->
            <div class="md:col-span-3">
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5 flex items-center gap-1.5">
                    <i class="fas fa-globe text-primary"></i>
                    Sumber Media
                </label>
                <select x-model="filterSource" @change="loadQueue()" class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Semua Sumber Media</option>
                    <template x-for="src in sourcesList" :key="src.id">
                        <option :value="src.id" x-text="src.name"></option>
                    </template>
                </select>
            </div>

            <!-- Rentang Tanggal: Dari Tanggal -->
            <div class="md:col-span-2">
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5 flex items-center gap-1.5">
                    <i class="far fa-calendar-alt text-primary"></i>
                    Dari Tanggal
                </label>
                <input type="date" x-model="startDate" @change="loadQueue()" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            </div>

            <!-- Rentang Tanggal: Sampai Tanggal -->
            <div class="md:col-span-2">
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5 flex items-center gap-1.5">
                    <i class="far fa-calendar-check text-primary"></i>
                    Sampai Tanggal
                </label>
                <input type="date" x-model="endDate" @change="loadQueue()" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            </div>

            <!-- Tombol Aksi Filter -->
            <div class="md:col-span-1 flex gap-2">
                <button @click="loadQueue()" class="w-full h-10 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-hover shadow-sm transition-all" title="Cari Berita">
                    <i class="fas fa-search"></i>
                </button>
                <button x-show="searchQuery || filterSource || startDate || endDate" @click="resetFilters()" class="w-full h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all" title="Reset Semua Filter">
                    <i class="fas fa-redo-alt text-xs"></i>
                </button>
            </div>
        </div>

        <!-- Filter Active Badges -->
        <div x-show="searchQuery || filterSource || startDate || endDate" class="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span class="text-slate-400 font-semibold">Filter Aktif:</span>
            <template x-if="searchQuery">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-light text-primary font-bold">
                    Kata Kunci: <span x-text="searchQuery"></span>
                    <i class="fas fa-times cursor-pointer ml-1" @click="searchQuery = ''; loadQueue();"></i>
                </span>
            </template>
            <template x-if="filterSource">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                    Media: <span x-text="sourcesList.find(s => s.id === filterSource)?.name || filterSource"></span>
                    <i class="fas fa-times cursor-pointer ml-1" @click="filterSource = ''; loadQueue();"></i>
                </span>
            </template>
            <template x-if="startDate || endDate">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold">
                    Rentang: <span x-text="(startDate || 'Awal') + ' s/d ' + (endDate || 'Sekarang')"></span>
                    <i class="fas fa-times cursor-pointer ml-1" @click="startDate = ''; endDate = ''; loadQueue();"></i>
                </span>
            </template>
            <button @click="resetFilters()" class="text-primary hover:underline font-bold text-xs ml-auto">
                Hapus Semua Filter
            </button>
        </div>
    </div>

    <!-- Action Notification -->
    <template x-if="actionAlert">
        <div class="mb-6 rounded-xl p-4 flex items-center justify-between" :class="actionAlert.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'">
            <div class="flex items-center gap-2 text-sm font-medium">
                <i class="fas" :class="actionAlert.type === 'success' ? 'fa-check-circle text-emerald-600' : 'fa-exclamation-triangle text-rose-600'"></i>
                <span x-text="actionAlert.text"></span>
            </div>
            <button @click="actionAlert = null" class="text-xs font-bold opacity-60 hover:opacity-100">
                <i class="fas fa-times"></i>
            </button>
        </div>
    </template>

    <!-- Queue List Table Card -->
    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div x-show="isLoading" class="flex items-center justify-center py-16 text-slate-400">
            <i class="fas fa-spinner fa-spin text-2xl mr-3"></i> Memuat antrean berita kurasi...
        </div>

        <div x-show="!isLoading && queue.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400">
            <i class="far fa-newspaper text-4xl mb-4 opacity-30"></i>
            <p class="text-sm font-medium">Tidak ada berita yang sesuai dengan filter pencarian.</p>
            <template x-if="searchQuery || filterSource || startDate || endDate">
                <button @click="resetFilters()" class="mt-3 text-xs font-bold text-primary hover:underline">
                    Reset Filter Pencarian
                </button>
            </template>
            <template x-if="!searchQuery && !filterSource && !startDate && !endDate">
                <button @click="view = 'aggregator'" class="mt-4 text-xs font-bold text-primary hover:underline">
                    Buka Pengaturan Agregator untuk Tarik Feed &rarr;
                </button>
            </template>
        </div>

        <div x-show="!isLoading && queue.length > 0">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <th class="px-6 py-3.5">Judul Berita</th>
                            <th class="px-6 py-3.5">Sumber & Wilayah</th>
                            <th class="px-6 py-3.5">Waktu Rilis Asli</th>
                            <th class="px-6 py-3.5 text-center">Aksi Kurasi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
                        <template x-for="item in paginatedQueue" :key="item.id">
                            <tr class="hover:bg-slate-50/80 transition-colors">
                                <td class="px-6 py-4 max-w-md">
                                    <div class="flex items-start gap-3">
                                        <!-- Thumbnail Foto Berita jika ada -->
                                        <template x-if="item.raw_image">
                                            <div class="w-12 h-12 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shrink-0 shadow-2xs">
                                                <img :src="item.raw_image" :alt="item.raw_title" class="w-full h-full object-cover" loading="lazy">
                                            </div>
                                        </template>
                                        <template x-if="!item.raw_image">
                                            <div class="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 text-slate-300">
                                                <i class="far fa-newspaper text-base"></i>
                                            </div>
                                        </template>
                                        <div class="min-w-0 flex-1">
                                            <div class="font-bold text-slate-900 leading-snug" x-text="item.raw_title"></div>
                                            <a :href="item.raw_url" target="_blank" class="text-xs text-slate-400 hover:text-primary mt-1 inline-block truncate max-w-xs" x-text="item.raw_url"></a>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                        <i class="fas fa-rss text-amber-500"></i>
                                        <span x-text="item.source_name || 'Media Afiliasi'"></span>
                                    </span>
                                    <div class="flex items-center gap-1 mt-1">
                                        <span class="text-[11px] text-slate-400" x-text="item.region_code || ''"></span>
                                        <template x-if="item.default_category">
                                            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold"
                                                  :class="{
                                                      'bg-rose-50 text-rose-700 border border-rose-200': item.default_category === 'Kesehatan',
                                                      'bg-blue-50 text-blue-700 border border-blue-200': item.default_category === 'PTMA',
                                                      'bg-amber-50 text-amber-700 border border-amber-200': item.default_category === 'Pendidikan Dasar',
                                                      'bg-indigo-50 text-indigo-700 border border-indigo-200': item.default_category === 'Warta Persyarikatan',
                                                      'bg-teal-50 text-teal-700 border border-teal-200': item.default_category === 'Berita Daerah',
                                                      'bg-purple-50 text-purple-700 border border-purple-200': item.default_category === 'Opini & Berita'
                                                  }"
                                                  x-text="item.default_category">
                                            </span>
                                        </template>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-xs text-slate-500" x-text="item.raw_published_at ? new Date(item.raw_published_at).toLocaleString('id-ID') : '-'"></td>
                                 <td class="px-6 py-4 whitespace-nowrap text-center">
                                    <div class="inline-flex items-center gap-1.5">
                                        <!-- Tombol Approve Instan (Tanpa Melalui Editor) -->
                                        <button @click="quickApprove(item)" class="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm" title="Setujui & Terbitkan Langsung (Tanpa Editor)">
                                            <i class="fas fa-check"></i>
                                        </button>

                                        <!-- Tombol Tinjau (Buka Editor) -->
                                        <button @click="openCurateModal(item)" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all border border-slate-200 shadow-sm" title="Tinjau & Edit di Editor">
                                            <i class="fas fa-edit text-slate-500"></i> Tinjau
                                        </button>

                                        <!-- Tombol Abaikan / Hapus -->
                                        <button @click="rejectItem(item.id, item.raw_title)" class="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors" title="Abaikan Berita">
                                            <i class="far fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>

            <!-- Newsroom Pagination Bar -->
            <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="text-xs text-slate-500 font-medium">
                    Menampilkan <span class="font-bold text-slate-800" x-text="(currentPage - 1) * perPage + 1"></span> - <span class="font-bold text-slate-800" x-text="Math.min(currentPage * perPage, queue.length)"></span> dari <span class="font-bold text-slate-800" x-text="queue.length"></span> berita antrean
                </div>
                
                <div class="flex items-center gap-1">
                    <button @click="prevPage()" :disabled="currentPage === 1" class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm">
                        <i class="fas fa-chevron-left mr-1"></i> Prev
                    </button>
                    
                    <template x-for="p in totalPages" :key="p">
                        <button @click="goToPage(p)" 
                                :class="currentPage === p ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
                                class="w-8 h-8 rounded-lg border text-xs font-bold transition-all" 
                                x-text="p">
                        </button>
                    </template>
                    
                    <button @click="nextPage()" :disabled="currentPage === totalPages" class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm">
                        Next <i class="fas fa-chevron-right ml-1"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

</div>
`;

