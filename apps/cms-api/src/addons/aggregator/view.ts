import { aggregatorTable } from "./ui/aggregator-table.ts";
import { aggregatorModals } from "./ui/aggregator-modals.ts";

export const aggregatorView = `
<div x-show="view === 'aggregator'" class="exclusive-wrapper" x-data="{
    sources: [],
    isLoading: false,
    isSyncing: false,
    syncResult: null,
    
    // Search & Filter State
    searchQuery: '',
    filterCategory: '',
    
    // Pagination State
    currentPage: 1,
    perPage: 15,

    // Modal State
    showAddModal: false,
    showEditModal: false,
    isTestingFeed: false,
    testFeedResult: null,
    newSource: { name: '', baseUrl: '', feedType: 'wp_api', feedUrl: '', regionCode: '', websiteCategory: 'Berita', trustScore: 90, autoSync: true, syncInterval: 15, defaultCategory: 'Berita Daerah', autoPublish: false },
    editingSource: { id: '', name: '', baseUrl: '', feedType: 'wp_api', feedUrl: '', regionCode: '', websiteCategory: 'Berita', trustScore: 90, isActive: 1, autoSync: true, syncInterval: 15, defaultCategory: 'Berita Daerah', autoPublish: false },

    resetTestFeed() {
        this.isTestingFeed = false;
        this.testFeedResult = null;
    },

    async testFeed(type = 'new') {
        const target = type === 'new' ? this.newSource : this.editingSource;
        if (!target.baseUrl && !target.feedUrl) {
            this.testFeedResult = { type: 'error', text: 'Masukkan Base URL atau Endpoint Feed terlebih dahulu' };
            return;
        }

        this.isTestingFeed = true;
        this.testFeedResult = null;
        try {
            const token = window.getCmsToken ? window.getCmsToken() : (localStorage.getItem('labmu_token') || '');
            const res = await fetch('/api/addons/aggregator/test-feed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    baseUrl: target.baseUrl,
                    feedUrl: target.feedUrl,
                    feedType: target.feedType
                })
            });
            const data = await res.json();
            if (data.success) {
                this.testFeedResult = {
                    type: 'success',
                    text: data.message,
                    count: data.count,
                    sampleTitle: data.sampleTitle,
                    feedType: data.feedType
                };
            } else {
                this.testFeedResult = {
                    type: 'error',
                    text: data.error || 'Gagal tersambung ke endpoint feed tersebut'
                };
            }
        } catch(e) {
            this.testFeedResult = { type: 'error', text: 'Error jaringan: ' + e.message };
        } finally {
            this.isTestingFeed = false;
        }
    },

    async init() {
        await this.loadSources();
        setInterval(() => {
            this.checkAutoSync();
        }, 60000);
    },

    async loadSources() {
        this.isLoading = true;
        try {
            const token = window.getCmsToken ? window.getCmsToken() : (localStorage.getItem('labmu_token') || '');
            const res = await fetch('/api/addons/aggregator/sources', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data.success) {
                this.sources = (data.data || []).map(s => ({ ...s, _isSyncing: false }));
                if (this.currentPage > this.totalPages && this.totalPages > 0) {
                    this.currentPage = this.totalPages;
                }
            }
        } catch(e) {
            console.error('Failed loading aggregator sources:', e);
        } finally {
            this.isLoading = false;
        }
    },

    get filteredSources() {
        return this.sources.filter(s => {
            const q = this.searchQuery ? this.searchQuery.toLowerCase().trim() : '';
            const matchesSearch = !q || 
                (s.name && s.name.toLowerCase().includes(q)) ||
                (s.base_url && s.base_url.toLowerCase().includes(q)) ||
                (s.region_code && s.region_code.toLowerCase().includes(q)) ||
                (s.default_category && s.default_category.toLowerCase().includes(q));

            const matchesCategory = !this.filterCategory || s.default_category === this.filterCategory;
            return matchesSearch && matchesCategory;
        });
    },

    get totalPages() {
        return Math.ceil(this.filteredSources.length / this.perPage) || 1;
    },

    get paginatedSources() {
        const start = (this.currentPage - 1) * this.perPage;
        return this.filteredSources.slice(start, start + this.perPage);
    },

    resetFilter() {
        this.searchQuery = '';
        this.filterCategory = '';
        this.currentPage = 1;
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

    onBaseUrlChange(type = 'new') {
        const target = type === 'new' ? this.newSource : this.editingSource;
        if (!target.baseUrl) return;
        const clean = target.baseUrl.trim().replace(new RegExp('/+$'), '');
        if (target.feedType === 'wp_api') {
            target.feedUrl = clean + '/wp-json/wp/v2/posts?per_page=10&_embed';
        } else if (target.feedType === 'html_scraper') {
            target.feedUrl = clean + '/news';
        } else {
            target.feedUrl = clean + '/feed/';
        }
    },

    async checkAutoSync() {
        const now = Date.now();
        for (const src of this.sources) {
            if (!src.auto_sync || !src.is_active) continue;
            const intervalMs = (src.sync_interval || 15) * 60 * 1000;
            const lastFetched = src.last_fetched_at ? new Date(src.last_fetched_at).getTime() : 0;
            if (now - lastFetched >= intervalMs) {
                this.syncSingleSource(src, true);
            }
        }
    },

    async triggerSync() {
        this.isSyncing = true;
        this.syncResult = null;
        try {
            const token = window.getCmsToken ? window.getCmsToken() : (localStorage.getItem('labmu_token') || '');
            const res = await fetch('/api/addons/aggregator/sync', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data.success) {
                this.syncResult = { type: 'success', text: data.message };
                await this.loadSources();
            } else {
                this.syncResult = { type: 'error', text: data.error || 'Gagal sinkronisasi feed' };
            }
        } catch(e) {
            this.syncResult = { type: 'error', text: 'Error jaringan: ' + e.message };
        } finally {
            this.isSyncing = false;
        }
    },

    async syncSingleSource(src, isBackground = false) {
        src._isSyncing = true;
        try {
            const token = window.getCmsToken ? window.getCmsToken() : (localStorage.getItem('labmu_token') || '');
            const res = await fetch('/api/addons/aggregator/sources/' + src.id + '/sync', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data.success) {
                if (!isBackground) {
                    this.syncResult = { type: 'success', text: data.message };
                }
                src.last_fetched_at = new Date().toISOString();
            } else {
                if (!isBackground) {
                    this.syncResult = { type: 'error', text: data.error || 'Gagal menarik feed dari ' + src.name };
                }
            }
        } catch(e) {
            if (!isBackground) {
                this.syncResult = { type: 'error', text: 'Error: ' + e.message };
            }
        } finally {
            src._isSyncing = false;
        }
    },

    async toggleAutoSync(src) {
        const nextVal = src.auto_sync ? 0 : 1;
        try {
            const token = window.getCmsToken ? window.getCmsToken() : (localStorage.getItem('labmu_token') || '');
            const res = await fetch('/api/addons/aggregator/sources/' + src.id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ auto_sync: nextVal })
            });
            const data = await res.json();
            if (data.success) {
                src.auto_sync = nextVal;
            }
        } catch(e) {
            console.error('Failed toggling auto sync:', e);
        }
    },

    async toggleAutoPublish(src) {
        const nextVal = src.auto_publish ? 0 : 1;
        try {
            const token = window.getCmsToken ? window.getCmsToken() : (localStorage.getItem('labmu_token') || '');
            const res = await fetch('/api/addons/aggregator/sources/' + src.id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ auto_publish: nextVal })
            });
            const data = await res.json();
            if (data.success) {
                src.auto_publish = nextVal;
            }
        } catch(e) {
            console.error('Failed toggling direct publish:', e);
        }
    },

    openAddModal() {
        this.resetTestFeed();
        this.newSource = {
            name: '',
            baseUrl: '',
            feedType: 'wp_api',
            feedUrl: '',
            regionCode: '',
            websiteCategory: 'Berita',
            trustScore: 90,
            autoSync: true,
            syncInterval: 15,
            defaultCategory: 'Berita Daerah',
            autoPublish: false
        };
        this.showAddModal = true;
    },

    async addSource() {
        if (!this.newSource.name || !this.newSource.baseUrl) {
            alert('Nama Media dan Base URL wajib diisi');
            return;
        }
        try {
            const token = window.getCmsToken ? window.getCmsToken() : (localStorage.getItem('labmu_token') || '');
            const res = await fetch('/api/addons/aggregator/sources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(this.newSource)
            });
            const data = await res.json();
            if (data.success) {
                this.showAddModal = false;
                await this.loadSources();
            } else {
                alert('Gagal: ' + (data.error || 'Error'));
            }
        } catch(e) {
            alert('Error: ' + e.message);
        }
    },

    openEditModal(src) {
        this.resetTestFeed();
        this.editingSource = {
            id: src.id,
            name: src.name,
            baseUrl: src.base_url,
            feedType: src.feed_type || 'wp_api',
            feedUrl: src.feed_url || '',
            regionCode: src.region_code || '',
            websiteCategory: src.website_category || 'Berita',
            trustScore: src.trust_score || 90,
            isActive: src.is_active,
            autoSync: Boolean(src.auto_sync),
            syncInterval: src.sync_interval || 15,
            defaultCategory: src.default_category || 'Berita Daerah',
            autoPublish: Boolean(src.auto_publish)
        };
        this.showEditModal = true;
    },

    async updateSource() {
        if (!this.editingSource.name || !this.editingSource.baseUrl) {
            alert('Nama Media dan Base URL wajib diisi');
            return;
        }
        try {
            const token = window.getCmsToken ? window.getCmsToken() : (localStorage.getItem('labmu_token') || '');
            const res = await fetch('/api/addons/aggregator/sources/' + this.editingSource.id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(this.editingSource)
            });
            const data = await res.json();
            if (data.success) {
                this.showEditModal = false;
                await this.loadSources();
            } else {
                alert('Gagal: ' + (data.error || 'Error'));
            }
        } catch(e) {
            alert('Error: ' + e.message);
        }
    },

    async deleteSource(id, name) {
        if (!confirm('Hapus sumber media: ' + name + '?')) return;
        try {
            const token = window.getCmsToken ? window.getCmsToken() : (localStorage.getItem('labmu_token') || '');
            const res = await fetch('/api/addons/aggregator/sources/' + id, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data.success) {
                await this.loadSources();
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
                <i class="fas fa-satellite-dish text-primary"></i>
                Sumber Agregator Berita
            </h2>
            <p class="text-slate-500 text-sm mt-1">Kelola sumber berita WordPress REST API & RSS media resmi Muhammadiyah</p>
        </div>
        <div class="flex items-center gap-3">
            <button @click="triggerSync()" :disabled="isSyncing" class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover shadow-sm transition-all focus:ring-2 focus:ring-primary/20 disabled:opacity-50 cursor-pointer">
                <i class="fas" :class="isSyncing ? 'fa-spinner fa-spin' : 'fa-sync-alt'"></i>
                <span x-text="isSyncing ? 'Menarik Berita...' : 'Tarik Feed Sekarang'"></span>
            </button>
            <button @click="openAddModal()" class="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-900 shadow-sm transition-all cursor-pointer">
                <i class="fas fa-plus"></i>
                Tambah Sumber
            </button>
        </div>
    </div>

    <!-- Sync Alert Notification -->
    <template x-if="syncResult">
        <div class="mb-6 rounded-xl p-4 flex items-center justify-between" :class="syncResult.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'">
            <div class="flex items-center gap-2 text-sm font-medium">
                <i class="fas" :class="syncResult.type === 'success' ? 'fa-check-circle text-emerald-600' : 'fa-exclamation-triangle text-rose-600'"></i>
                <span x-text="syncResult.text"></span>
            </div>
            <button @click="syncResult = null" class="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer">
                <i class="fas fa-times"></i>
            </button>
        </div>
    </template>

    <!-- Filter & Search Bar Card -->
    <div class="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
            <!-- Pencarian Cerdas -->
            <div class="md:col-span-6">
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5 flex items-center gap-1.5">
                    <i class="fas fa-search text-primary"></i>
                    Pencarian Portal Media
                </label>
                <div class="relative">
                    <input type="text" x-model="searchQuery" @input="currentPage = 1" placeholder="Cari nama media, URL, atau wilayah (misal: UAD, PWM, MPKU)..." class="w-full rounded-xl border border-slate-200 pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <i class="fas fa-search absolute left-3 top-3.5 text-xs text-slate-400"></i>
                    <button x-show="searchQuery" @click="searchQuery = ''; currentPage = 1;" class="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                        <i class="fas fa-times-circle text-sm"></i>
                    </button>
                </div>
            </div>

            <!-- Filter Kategori Web / Portal -->
            <div class="md:col-span-4">
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5 flex items-center gap-1.5">
                    <i class="fas fa-layer-group text-primary"></i>
                    Kategori Web / Portal
                </label>
                <select x-model="filterCategory" @change="currentPage = 1" class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Semua Kategori Portal (Semua)</option>
                    <option value="PTMA">PTMA (Perguruan Tinggi Muhammadiyah & Aisyiyah)</option>
                    <option value="Kesehatan (MPKU)">Kesehatan (MPKU & RS PKU)</option>
                    <option value="Pendidikan (Dikdasmen / Sekolah)">Pendidikan (Dikdasmen / Sekolah)</option>
                    <option value="Berita Daerah">Portal Berita Daerah (PWM / PDM)</option>
                    <option value="Warta Persyarikatan">Warta Persyarikatan (Majelis & Ortom)</option>
                    <option value="Opini & Berita">Opini & Berita (Media Kader)</option>
                </select>
            </div>

            <!-- Jumlah Tampilan & Reset -->
            <div class="md:col-span-2 flex items-center gap-2">
                <div class="flex-1">
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5 flex items-center gap-1">
                        <i class="fas fa-list-ol text-primary"></i>
                        Limit
                    </label>
                    <select x-model.number="perPage" @change="currentPage = 1" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary font-bold">
                        <option value="15">15 / hal</option>
                        <option value="25">25 / hal</option>
                        <option value="50">50 / hal</option>
                    </select>
                </div>
                <button x-show="searchQuery || filterCategory" @click="resetFilter()" class="h-10 px-3 mt-auto rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center shrink-0" title="Reset Filter">
                    <i class="fas fa-redo-alt text-xs"></i>
                </button>
            </div>
        </div>

        <!-- Badges Status Filter -->
        <div x-show="searchQuery || filterCategory" class="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span class="text-slate-400 font-semibold">Filter Aktif:</span>
            <template x-if="searchQuery">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-light text-primary font-bold">
                    Pencarian: <span x-text="searchQuery"></span>
                    <i class="fas fa-times cursor-pointer ml-1" @click="searchQuery = ''; currentPage = 1;"></i>
                </span>
            </template>
            <template x-if="filterCategory">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                    Kategori: <span x-text="filterCategory"></span>
                    <i class="fas fa-times cursor-pointer ml-1" @click="filterCategory = ''; currentPage = 1;"></i>
                </span>
            </template>
            <span class="text-slate-500 font-medium ml-auto">
                Ditemukan: <b class="text-slate-800" x-text="filteredSources.length"></b> sumber
            </span>
        </div>
    </div>

    ${aggregatorTable}
    ${aggregatorModals}
</div>
`;
