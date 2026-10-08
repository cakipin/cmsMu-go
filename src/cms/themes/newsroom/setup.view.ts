/**
 * 🎨 Newsroom Theme Setup View
 * Antarmuka administrasi khusus untuk tema Newsroom Editorial.
 * Menu ini melekat pada tema Newsroom (hanya aktif dan terlihat saat tema Newsroom aktif).
 */

export const newsroomThemeSetupView = `
<div x-show="view === 'theme-setup'" class="exclusive-wrapper animate-fade" style="padding-bottom: 60px;"
     x-data="{
        isLoading: false,
        isSaving: false,
        toastMessage: '',
        toastType: 'success',
        activeTab: 'api-masa',
        codeTab: 'flutter',
        apiBaseUrl: '',

        form: {
            masa_mobile_redirect_enabled: 'false',
            masa_mobile_mode: 'smart_banner',
            masa_deeplink_scheme: 'masa://news/{slug}',
            masa_playstore_url: 'https://play.google.com/store/apps/details?id=id.muhammadiyah.masa',
            masa_appstore_url: 'https://apps.apple.com/id/app/masa-muhammadiyah/id1234567890',
            masa_prompt_title: 'Baca Lebih Nyaman di Aplikasi MASA',
            sidebar_popular_limit: '5'
        },

        apiTester: {
            region: 'all',
            city: '',
            limit: '3',
            days: '5',
            isLoading: false,
            responseJson: '',
            responseTime: null,
            statusCode: null,
            totalItems: 0,

            async runTest() {
                this.isLoading = true;
                this.responseJson = '';
                this.statusCode = null;
                this.responseTime = null;
                const start = performance.now();
                try {
                    let url = '/api/masa/posts?region=' + encodeURIComponent(this.region) + '&limit=' + encodeURIComponent(this.limit) + '&days=' + encodeURIComponent(this.days);
                    if (this.city) url += '&city=' + encodeURIComponent(this.city);
                    const res = await fetch(url);
                    this.statusCode = res.status;
                    const data = await res.json();
                    this.responseJson = JSON.stringify(data, null, 2);
                    this.totalItems = data?.pagination?.total_items || (data?.data?.length || 0);
                    this.responseTime = Math.round(performance.now() - start);
                } catch (e) {
                    this.statusCode = 500;
                    this.responseJson = JSON.stringify({ status: 'error', error: e.message }, null, 2);
                } finally {
                    this.isLoading = false;
                }
            }
        },

        async init() {
            this.apiBaseUrl = window.location.origin + '/api/masa';
            await this.loadSettings();
            // Jalankan preview test pertama otomatis
            this.apiTester.runTest();
        },

        showToast(msg, type = 'success') {
            this.toastMessage = msg;
            this.toastType = type;
            if (typeof window.showToast === 'function') {
                window.showToast(msg, type);
            }
            setTimeout(() => {
                if (this.toastMessage === msg) this.toastMessage = '';
            }, 4000);
        },

        copyText(text, label = 'Teks') {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    this.showToast(label + ' berhasil disalin ke clipboard!', 'success');
                }).catch(() => {
                    this.fallbackCopy(text, label);
                });
            } else {
                this.fallbackCopy(text, label);
            }
        },

        fallbackCopy(text, label) {
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            this.showToast(label + ' berhasil disalin ke clipboard!', 'success');
        },

        toggleMasaRedirect() {
            this.form.masa_mobile_redirect_enabled = (this.form.masa_mobile_redirect_enabled === 'true') ? 'false' : 'true';
        },

        async loadSettings(manual = false) {
            this.isLoading = true;
            try {
                const token = window.getCmsToken ? window.getCmsToken() : (localStorage.getItem('labmu_token') || '');
                const res = await fetch('/api/settings/admin', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (res.ok) {
                    const json = await res.json();
                    const d = json.data || {};
                    if (d.masa_mobile_redirect_enabled !== undefined) this.form.masa_mobile_redirect_enabled = String(d.masa_mobile_redirect_enabled);
                    if (d.masa_mobile_mode) this.form.masa_mobile_mode = d.masa_mobile_mode;
                    if (d.masa_deeplink_scheme) this.form.masa_deeplink_scheme = d.masa_deeplink_scheme;
                    if (d.masa_playstore_url) this.form.masa_playstore_url = d.masa_playstore_url;
                    if (d.masa_appstore_url) this.form.masa_appstore_url = d.masa_appstore_url;
                    if (d.masa_prompt_title) this.form.masa_prompt_title = d.masa_prompt_title;
                    if (d.sidebar_popular_limit) this.form.sidebar_popular_limit = String(d.sidebar_popular_limit);

                    if (manual) {
                        this.showToast('Pengaturan tema berhasil dimuat ulang!', 'success');
                    }
                }
            } catch(e) {
                console.error('Failed loading theme settings:', e);
                if (manual) this.showToast('Gagal memuat pengaturan: ' + e.message, 'error');
            } finally {
                this.isLoading = false;
            }
        },

        async saveSettings() {
            this.isSaving = true;
            try {
                const token = window.getCmsToken ? window.getCmsToken() : (localStorage.getItem('labmu_token') || '');
                const res = await fetch('/api/settings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(this.form)
                });

                if (res.ok) {
                    this.showToast('Pengaturan tema Newsroom & integrasi MASA berhasil disimpan!', 'success');
                } else {
                    const err = await res.json().catch(() => ({}));
                    this.showToast(err.error || 'Gagal menyimpan pengaturan tema', 'error');
                }
            } catch(e) {
                this.showToast('Error: ' + e.message, 'error');
            } finally {
                this.isSaving = false;
            }
        }
     }">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
            <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-lg shadow-xs">
                    <i class="fas fa-sliders-h"></i>
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <h2 class="text-xl font-bold text-slate-800 m-0">Setup Tema: Newsroom Editorial</h2>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 uppercase">v1.0.0</span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Tema Aktif</span>
                    </div>
                    <p class="text-xs text-slate-500 m-0 mt-0.5">Konfigurasi tema Newsroom, API Feed Realtime Aplikasi MASA, dan deep-link mobile.</p>
                </div>
            </div>
        </div>
        <div class="flex items-center gap-2.5">
            <button type="button" @click="loadSettings(true)" :disabled="isLoading" 
                    class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-xs">
                <i class="fas" :class="isLoading ? 'fa-spinner fa-spin text-teal-600' : 'fa-sync-alt'"></i>
                <span>Muat Ulang</span>
            </button>
            <button type="button" @click="saveSettings()" :disabled="isSaving"
                    class="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer border-0">
                <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                <span x-text="isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'">Simpan Pengaturan</span>
            </button>
        </div>
    </div>

    <!-- Alert / Toast In-System (SOP 16) -->
    <template x-if="toastMessage">
        <div class="mb-6 p-4 rounded-xl border flex items-center justify-between transition-all"
             :class="toastType === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'">
            <div class="flex items-center gap-2 text-xs font-semibold">
                <i class="fas" :class="toastType === 'success' ? 'fa-check-circle text-emerald-600 text-sm' : 'fa-exclamation-circle text-rose-600 text-sm'"></i>
                <span x-text="toastMessage"></span>
            </div>
            <button type="button" @click="toastMessage = ''" class="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-xs">
                <i class="fas fa-times"></i>
            </button>
        </div>
    </template>

    <!-- TAB NAVIGATION BAR -->
    <div class="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
        <button type="button" @click="activeTab = 'api-masa'"
                class="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-0"
                :class="activeTab === 'api-masa' ? 'bg-teal-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100'">
            <i class="fas fa-bolt text-amber-300"></i>
            <span>Setup API Feed MASA</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                  :class="activeTab === 'api-masa' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'">Realtime</span>
        </button>

        <button type="button" @click="activeTab = 'general'"
                class="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-0"
                :class="activeTab === 'general' ? 'bg-teal-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100'">
            <i class="fas fa-mobile-alt"></i>
            <span>Mobile Redirect & Tampilan Beranda</span>
        </button>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 1: SETUP API FEED MASA (REALTIME REST API)                           -->
    <!-- ========================================================================= -->
    <div x-show="activeTab === 'api-masa'" class="space-y-6">
        
        <!-- KARTU UTAMA: STATUS ENDPOINT REST API -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-6 bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span class="text-xs font-bold text-emerald-300 tracking-wide uppercase">REST API Publik Aktif</span>
                    </div>
                    <h3 class="text-lg font-bold text-white m-0">Newsroom Public API untuk Aplikasi Mobile MASA</h3>
                    <p class="text-xs text-slate-300 max-w-2xl m-0 leading-relaxed">
                        Endpoint publik untuk aplikasi MASA mengambil data warta persyarikatan secara realtime, otomatis terfilter berdasarkan taging wilayah, kota, kategori, dan bebas dari sampah HTML.
                    </p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <button type="button" @click="copyText(apiBaseUrl + '/posts', 'URL Endpoint Feed MASA')"
                            class="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-900 transition-all flex items-center gap-1.5 cursor-pointer border-0 shadow-sm">
                        <i class="fas fa-copy"></i>
                        <span>Salin Base URL</span>
                    </button>
                </div>
            </div>

            <!-- DAFTAR ENDPOINT UTAMA -->
            <div class="p-6 border-b border-slate-100 space-y-4">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 m-0">Daftar Endpoint Siap Pakai</h4>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <!-- Endpoint 1: Posts Feed -->
                    <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-300 transition-all space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">GET</span>
                            <button type="button" @click="copyText(apiBaseUrl + '/posts', 'URL /posts')" class="text-slate-400 hover:text-teal-600 bg-transparent border-0 cursor-pointer text-xs">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                        <div class="font-mono text-xs font-bold text-slate-800 break-all">/api/masa/posts</div>
                        <p class="text-[11px] text-slate-500 m-0">Feed berita realtime dengan filter wilayah, kota, kategori &amp; pagination.</p>
                    </div>

                    <!-- Endpoint 2: Detail Article -->
                    <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-300 transition-all space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">GET</span>
                            <button type="button" @click="copyText(apiBaseUrl + '/posts/{slug}', 'URL /posts/{slug}')" class="text-slate-400 hover:text-teal-600 bg-transparent border-0 cursor-pointer text-xs">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                        <div class="font-mono text-xs font-bold text-slate-800 break-all">/api/masa/posts/:slug</div>
                        <p class="text-[11px] text-slate-500 m-0">Detail lengkap naskah bersih (*clean HTML*), taging lokasi, dan berita terkait.</p>
                    </div>

                    <!-- Endpoint 3: Meta Discovery -->
                    <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-300 transition-all space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">GET</span>
                            <button type="button" @click="copyText(apiBaseUrl + '/meta', 'URL /meta')" class="text-slate-400 hover:text-teal-600 bg-transparent border-0 cursor-pointer text-xs">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                        <div class="font-mono text-xs font-bold text-slate-800 break-all">/api/masa/meta</div>
                        <p class="text-[11px] text-slate-500 m-0">Daftar opsi wilayah persyarikatan, kategori aktif &amp; publisher media.</p>
                    </div>
                </div>
            </div>

            <!-- LIVE INTERACTIVE TESTER (PENGUJI API DI ADMIN) -->
            <div class="p-6 space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800 m-0 flex items-center gap-2">
                            <i class="fas fa-flask text-teal-600"></i>
                            Live Interactive API Tester
                        </h4>
                        <p class="text-[11px] text-slate-500 m-0 mt-0.5">Uji coba pemanggilan API langsung dari browser admin untuk memeriksa hasil realtime.</p>
                    </div>
                    <button type="button" @click="apiTester.runTest()" :disabled="apiTester.isLoading"
                            class="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer border-0 shrink-0">
                        <i class="fas" :class="apiTester.isLoading ? 'fa-spinner fa-spin' : 'fa-play'"></i>
                        <span x-text="apiTester.isLoading ? 'Memanggil...' : 'Uji Panggilan API'">Uji Panggilan API</span>
                    </button>
                </div>

                <!-- TESTER CONTROLS -->
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                        <label class="block text-[11px] font-bold text-slate-700 mb-1">Filter Gugus Wilayah (region)</label>
                        <select x-model="apiTester.region" class="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-teal-500">
                            <option value="all">Semua Wilayah (all)</option>
                            <option value="jateng_diy">Jawa Tengah &amp; DIY (jateng_diy)</option>
                            <option value="jatim">Jawa Timur (jatim)</option>
                            <option value="jabar_dki">Jawa Barat &amp; DKI (jabar_dki)</option>
                            <option value="luar_jawa">Luar Pulau Jawa (luar_jawa)</option>
                            <option value="nasional">Warta Nasional (nasional)</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-[11px] font-bold text-slate-700 mb-1">Spesifik Kota (city)</label>
                        <input type="text" x-model="apiTester.city" placeholder="Misal: Jepara, Semarang"
                               class="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-teal-500">
                    </div>

                    <div>
                        <label class="block text-[11px] font-bold text-slate-700 mb-1">Jumlah Data (limit)</label>
                        <select x-model="apiTester.limit" class="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-teal-500">
                            <option value="3">3 Artikel</option>
                            <option value="5">5 Artikel</option>
                            <option value="10">10 Artikel</option>
                            <option value="15">15 Artikel</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-[11px] font-bold text-slate-700 mb-1">Jendela Hari (days)</label>
                        <select x-model="apiTester.days" class="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-teal-500">
                            <option value="5">5 Hari Terakhir (Default)</option>
                            <option value="7">7 Hari Terakhir</option>
                            <option value="30">30 Hari Terakhir</option>
                            <option value="all">Semua Waktu (all)</option>
                        </select>
                    </div>
                </div>

                <!-- URL OUTPUT PREVIEW -->
                <div class="flex items-center gap-2 text-xs font-mono bg-slate-900 text-teal-300 p-2.5 rounded-xl border border-slate-800 overflow-x-auto">
                    <span class="text-slate-400 select-none">GET</span>
                    <span x-text="apiBaseUrl + '/posts?region=' + apiTester.region + (apiTester.city ? '&city=' + encodeURIComponent(apiTester.city) : '') + '&limit=' + apiTester.limit + '&days=' + apiTester.days" class="text-white"></span>
                </div>

                <!-- RESPONSE CONSOLE -->
                <div class="rounded-xl border border-slate-800 bg-[#0f172a] text-slate-100 overflow-hidden">
                    <div class="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                        <div class="flex items-center gap-3">
                            <span class="flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full" :class="apiTester.statusCode === 200 ? 'bg-emerald-400' : 'bg-amber-400'"></span>
                                <span x-text="apiTester.statusCode ? 'HTTP ' + apiTester.statusCode : 'Menunggu Eksekusi...'"></span>
                            </span>
                            <template x-if="apiTester.responseTime !== null">
                                <span class="text-slate-400" x-text="'⚡ ' + apiTester.responseTime + ' ms'"></span>
                            </template>
                            <template x-if="apiTester.totalItems > 0">
                                <span class="text-teal-400" x-text="'📦 ' + apiTester.totalItems + ' Liputan Ditemukan'"></span>
                            </template>
                        </div>
                        <button type="button" @click="copyText(apiTester.responseJson, 'JSON Response')" :disabled="!apiTester.responseJson"
                                class="text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer text-xs flex items-center gap-1">
                            <i class="fas fa-copy"></i>
                            <span>Salin JSON</span>
                        </button>
                    </div>
                    <div class="p-4 max-h-96 overflow-y-auto font-mono text-[11px] leading-relaxed">
                        <template x-if="apiTester.isLoading">
                            <div class="flex items-center justify-center py-12 text-slate-400 gap-2">
                                <i class="fas fa-spinner fa-spin text-teal-400 text-lg"></i>
                                <span>Mengambil data warta dari server...</span>
                            </div>
                        </template>
                        <template x-if="!apiTester.isLoading && apiTester.responseJson">
                            <pre class="m-0 text-teal-200" x-text="apiTester.responseJson"></pre>
                        </template>
                        <template x-if="!apiTester.isLoading && !apiTester.responseJson">
                            <div class="py-8 text-center text-slate-500">
                                Klik tombol &quot;Uji Panggilan API&quot; di atas untuk melihat payload JSON secara langsung.
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <!-- KARTU 2: TABEL DOKUMENTASI PARAMETER QUERY -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800 m-0 flex items-center gap-2">
                <i class="fas fa-book-open text-teal-600"></i>
                Dokumentasi Query Parameters: GET /api/masa/posts
            </h4>
            <div class="overflow-x-auto">
                <table class="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr class="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                            <th class="py-2.5 px-3">Parameter</th>
                            <th class="py-2.5 px-3">Tipe</th>
                            <th class="py-2.5 px-3">Default</th>
                            <th class="py-2.5 px-3">Deskripsi &amp; Opsi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-600">
                        <tr>
                            <td class="py-2.5 px-3 font-mono font-bold text-teal-700">region</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">string</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">&quot;all&quot;</td>
                            <td class="py-2.5 px-3">Filter gugus wilayah: <code class="bg-slate-100 px-1 py-0.5 rounded">all</code>, <code class="bg-slate-100 px-1 py-0.5 rounded">jateng_diy</code>, <code class="bg-slate-100 px-1 py-0.5 rounded">jatim</code>, <code class="bg-slate-100 px-1 py-0.5 rounded">jabar_dki</code>, <code class="bg-slate-100 px-1 py-0.5 rounded">luar_jawa</code>, <code class="bg-slate-100 px-1 py-0.5 rounded">nasional</code>.</td>
                        </tr>
                        <tr>
                            <td class="py-2.5 px-3 font-mono font-bold text-teal-700">city</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">string</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">null</td>
                            <td class="py-2.5 px-3">Filter nama kota spesifik berdasarkan taging naskah/dateline, contoh: <code class="bg-slate-100 px-1 py-0.5 rounded">Jepara</code>, <code class="bg-slate-100 px-1 py-0.5 rounded">Semarang</code>, <code class="bg-slate-100 px-1 py-0.5 rounded">Surabaya</code>.</td>
                        </tr>
                        <tr>
                            <td class="py-2.5 px-3 font-mono font-bold text-teal-700">province</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">string</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">null</td>
                            <td class="py-2.5 px-3">Filter nama provinsi, contoh: <code class="bg-slate-100 px-1 py-0.5 rounded">Jawa Tengah</code>, <code class="bg-slate-100 px-1 py-0.5 rounded">Jawa Timur</code>.</td>
                        </tr>
                        <tr>
                            <td class="py-2.5 px-3 font-mono font-bold text-teal-700">category</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">string</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">null</td>
                            <td class="py-2.5 px-3">Filter berdasarkan nama kategori liputan (misal: <code class="bg-slate-100 px-1 py-0.5 rounded">Pendidikan</code>, <code class="bg-slate-100 px-1 py-0.5 rounded">Kesehatan</code>).</td>
                        </tr>
                        <tr>
                            <td class="py-2.5 px-3 font-mono font-bold text-teal-700">source</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">string</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">null</td>
                            <td class="py-2.5 px-3">Filter slug media penerbit (misal: <code class="bg-slate-100 px-1 py-0.5 rounded">suara-muhammadiyah</code>, <code class="bg-slate-100 px-1 py-0.5 rounded">ums</code>, <code class="bg-slate-100 px-1 py-0.5 rounded">unimus</code>).</td>
                        </tr>
                        <tr>
                            <td class="py-2.5 px-3 font-mono font-bold text-teal-700">q</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">string</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">null</td>
                            <td class="py-2.5 px-3">Kata kunci pencarian judul atau ringkasan artikel.</td>
                        </tr>
                        <tr>
                            <td class="py-2.5 px-3 font-mono font-bold text-teal-700">days</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">number / string</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">5</td>
                            <td class="py-2.5 px-3">Jendela rentang hari liputan (default: 5 hari terakhir). Gunakan <code class="bg-slate-100 px-1 py-0.5 rounded">all</code> untuk seluruh arsip.</td>
                        </tr>
                        <tr>
                            <td class="py-2.5 px-3 font-mono font-bold text-teal-700">limit</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">number</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">15</td>
                            <td class="py-2.5 px-3">Jumlah item per halaman (min: 1, max: 50).</td>
                        </tr>
                        <tr>
                            <td class="py-2.5 px-3 font-mono font-bold text-teal-700">page</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">number</td>
                            <td class="py-2.5 px-3 font-mono text-[11px]">1</td>
                            <td class="py-2.5 px-3">Nomor halaman untuk pagination.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- KARTU 3: CONTOH INTEGRASI MOBILE FLUTTER & CURL -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800 m-0 flex items-center gap-2">
                    <i class="fas fa-code text-teal-600"></i>
                    Snippet Integrasi untuk Developer Aplikasi MASA
                </h4>
                <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button type="button" @click="codeTab = 'flutter'"
                            class="px-2.5 py-1 rounded text-[11px] font-bold transition-all border-0 cursor-pointer"
                            :class="codeTab === 'flutter' ? 'bg-white text-slate-800 shadow-2xs' : 'bg-transparent text-slate-500'">
                        Dart / Flutter
                    </button>
                    <button type="button" @click="codeTab = 'curl'"
                            class="px-2.5 py-1 rounded text-[11px] font-bold transition-all border-0 cursor-pointer"
                            :class="codeTab === 'curl' ? 'bg-white text-slate-800 shadow-2xs' : 'bg-transparent text-slate-500'">
                        cURL
                    </button>
                </div>
            </div>

            <!-- TAB FLUTTER -->
            <div x-show="codeTab === 'flutter'" class="space-y-2">
                <div class="bg-slate-900 text-teal-300 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto relative">
                    <button type="button" @click="copyText(flutterCodeSnippet, 'Snippet Dart/Flutter')"
                            class="absolute top-3 right-3 px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px] border border-slate-700 cursor-pointer flex items-center gap-1">
                        <i class="fas fa-copy"></i>
                        <span>Salin Kode</span>
                    </button>
                    <pre class="m-0 text-slate-300" x-init="flutterCodeSnippet = \`// Service Flutter untuk Aplikasi MASA
import 'dart:convert';
import 'package:http/http.dart' as http;

class MasaNewsService {
  static const String baseUrl = '\` + apiBaseUrl + \`';

  /// Ambil feed berita terbaru realtime sesuai wilayah
  static Future<Map<String, dynamic>> fetchPosts({
    String region = 'jateng_diy',
    String? city,
    int limit = 15,
    int page = 1,
  }) async {
    final queryParams = {
      'region': region,
      'limit': limit.toString(),
      'page': page.toString(),
      if (city != null && city.isNotEmpty) 'city': city,
    };

    final uri = Uri.parse('\$baseUrl/posts').replace(queryParameters: queryParams);
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Gagal memuat berita MASA: \${response.statusCode}');
    }
  }

  /// Ambil detail artikel lengkap dengan naskah bersih
  static Future<Map<String, dynamic>> fetchPostDetail(String slug) async {
    final uri = Uri.parse('\$baseUrl/posts/\$slug');
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['data'];
    } else {
      throw Exception('Artikel tidak ditemukan');
    }
  }
}\`;" x-text="flutterCodeSnippet"></pre>
                </div>
            </div>

            <!-- TAB CURL -->
            <div x-show="codeTab === 'curl'" class="space-y-2">
                <div class="bg-slate-900 text-amber-300 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto relative">
                    <button type="button" @click="copyText('curl -X GET &quot;' + apiBaseUrl + '/posts?region=jateng_diy&limit=5&quot; -H &quot;Accept: application/json&quot;', 'Command cURL')"
                            class="absolute top-3 right-3 px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px] border border-slate-700 cursor-pointer flex items-center gap-1">
                        <i class="fas fa-copy"></i>
                        <span>Salin cURL</span>
                    </button>
                    <pre class="m-0 text-slate-200" x-text="'# 1. Mengambil feed berita Jateng &amp; DIY (limit 5)\ncurl -X GET &quot;' + apiBaseUrl + '/posts?region=jateng_diy&limit=5&quot; -H &quot;Accept: application/json&quot;\n\n# 2. Mengambil berita khusus kota Jepara\ncurl -X GET &quot;' + apiBaseUrl + '/posts?city=Jepara&limit=5&quot; -H &quot;Accept: application/json&quot;\n\n# 3. Mengambil metadata opsi wilayah &amp; publisher\ncurl -X GET &quot;' + apiBaseUrl + '/meta&quot;'"></pre>
                </div>
            </div>
        </div>

    </div>

    <!-- ========================================================================= -->
    <!-- TAB 2: MOBILE REDIRECT & TAMPILAN BERANDA                                -->
    <!-- ========================================================================= -->
    <div x-show="activeTab === 'general'" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Kolom Kiri: Formulir Utama (8 Col) -->
        <div class="lg:col-span-8 space-y-6">
            
            <!-- KARTU 1: INTEGRASI MOBILE MASA -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-sm shadow-2xs">
                            M
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-slate-800 m-0">Integrasi Aplikasi Mobile MASA</h3>
                            <p class="text-[11px] text-slate-500 m-0">Muhammadiyah All-in-One Super App (Redirect &amp; Smart Banner)</p>
                        </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold"
                          :class="form.masa_mobile_redirect_enabled === 'true' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'"
                          x-text="form.masa_mobile_redirect_enabled === 'true' ? 'Aktif' : 'Nonaktif'">
                    </span>
                </div>

                <div class="p-6 space-y-6">
                    <!-- TOGGLE ON/OFF SWITCH -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div class="space-y-0.5">
                            <label class="text-xs font-bold text-slate-800 block">Status Redirect Mobile MASA</label>
                            <p class="text-[11px] text-slate-500 max-w-md m-0">
                                Saat aktif, pengunjung yang membuka portal dari browser smartphone (Android &amp; iOS) akan dialihkan atau diberi prompt untuk membuka berita di aplikasi MASA.
                            </p>
                        </div>
                        <div class="flex items-center gap-3 shrink-0">
                            <span class="text-xs font-semibold" :class="form.masa_mobile_redirect_enabled === 'true' ? 'text-teal-600' : 'text-slate-400'"
                                  x-text="form.masa_mobile_redirect_enabled === 'true' ? 'ON (Aktif)' : 'OFF (Mati)'"></span>
                            <button type="button" @click="toggleMasaRedirect()"
                                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                    :class="form.masa_mobile_redirect_enabled === 'true' ? 'bg-teal-600' : 'bg-slate-300'">
                                <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                                      :class="form.masa_mobile_redirect_enabled === 'true' ? 'translate-x-5' : 'translate-x-0'"></span>
                            </button>
                        </div>
                    </div>

                    <!-- PENGATURAN DETAIL (Tampil saat ON) -->
                    <div x-show="form.masa_mobile_redirect_enabled === 'true'" x-transition.opacity.duration.200ms class="space-y-5 pt-2">
                        <!-- MODE REDIRECT -->
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Mode Pengalihan Mobile
                            </label>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <!-- Opsi 1: Smart Banner -->
                                <label class="relative flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all"
                                       :class="form.masa_mobile_mode === 'smart_banner' ? 'border-teal-500 bg-teal-50/30 ring-1 ring-teal-500' : 'border-slate-200 hover:border-slate-300 bg-white'">
                                    <div class="flex items-center justify-between mb-1.5">
                                        <div class="flex items-center gap-2">
                                            <input type="radio" name="masa_mobile_mode" value="smart_banner" x-model="form.masa_mobile_mode" class="text-teal-600 focus:ring-teal-500">
                                            <span class="text-xs font-bold text-slate-800">Smart App Banner</span>
                                        </div>
                                        <span class="px-1.5 py-0.5 rounded text-[9px] font-black bg-teal-100 text-teal-800 uppercase">Rekomendasi</span>
                                    </div>
                                    <p class="text-[11px] text-slate-500 m-0 leading-relaxed">
                                        Menampilkan banner elegan di bagian bawah layar ponsel. Pengguna bebas memilih membuka aplikasi MASA atau tetap membaca di web.
                                    </p>
                                </label>

                                <!-- Opsi 2: Auto Redirect -->
                                <label class="relative flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all"
                                       :class="form.masa_mobile_mode === 'auto_redirect' ? 'border-teal-500 bg-teal-50/30 ring-1 ring-teal-500' : 'border-slate-200 hover:border-slate-300 bg-white'">
                                    <div class="flex items-center justify-between mb-1.5">
                                        <div class="flex items-center gap-2">
                                            <input type="radio" name="masa_mobile_mode" value="auto_redirect" x-model="form.masa_mobile_mode" class="text-teal-600 focus:ring-teal-500">
                                            <span class="text-xs font-bold text-slate-800">Auto Redirect</span>
                                        </div>
                                        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase">Otomatis</span>
                                    </div>
                                    <p class="text-[11px] text-slate-500 m-0 leading-relaxed">
                                        Langsung meluncurkan deep link aplikasi MASA begitu halaman web dibuka di mobile browser. Jika aplikasi belum terinstal, dialihkan ke App Store.
                                    </p>
                                </label>
                            </div>
                        </div>

                        <!-- DEEP LINK SCHEME -->
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">
                                Skema Deep Link Aplikasi
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <i class="fas fa-link text-xs"></i>
                                </div>
                                <input type="text" x-model="form.masa_deeplink_scheme" placeholder="masa://news/{slug}"
                                       class="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                            </div>
                            <p class="text-[10px] text-slate-400 mt-1 m-0">
                                Gunakan token <code class="px-1 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">{slug}</code> agar aplikasi membuka artikel spesifik yang sedang dibaca.
                            </p>
                        </div>

                        <!-- JUDUL PROMPT BANNER -->
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">
                                Judul Ajakan Banner (Smart Banner Title)
                            </label>
                            <input type="text" x-model="form.masa_prompt_title" placeholder="Baca Lebih Nyaman di Aplikasi MASA"
                                   class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                        </div>

                        <!-- STORE URLS -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                                    <i class="fab fa-google-play text-emerald-600"></i> Google Play Store URL
                                </label>
                                <input type="url" x-model="form.masa_playstore_url" placeholder="https://play.google.com/store/apps/details?id=..."
                                       class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                                    <i class="fab fa-apple text-slate-800"></i> Apple App Store URL
                                </label>
                                <input type="url" x-model="form.masa_appstore_url" placeholder="https://apps.apple.com/id/app/..."
                                       class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- KARTU 2: PREFERENSI TAMPILAN BERANDA NEWSROOM -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div class="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-sm">
                        <i class="fas fa-layer-group"></i>
                    </div>
                    <div>
                        <h3 class="text-sm font-bold text-slate-800 m-0">Tampilan Widget Beranda</h3>
                        <p class="text-[11px] text-slate-500 m-0">Pengaturan kapasitas artikel pada kolom samping (sidebar popular).</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">
                            Jumlah Artikel Populer di Kanan Hero
                        </label>
                        <select x-model="form.sidebar_popular_limit" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                            <option value="3">3 Artikel Populer</option>
                            <option value="5">5 Artikel Populer (Standar Sejajar Slider)</option>
                            <option value="7">7 Artikel Populer</option>
                            <option value="10">10 Artikel Populer</option>
                        </select>
                        <p class="text-[10px] text-slate-400 mt-1 m-0">Rekomendasi: 5 artikel agar tinggi kolom kanan pas lurus dengan slider kiri.</p>
                    </div>
                </div>
            </div>

        </div>

        <!-- Kolom Kanan: Live Interactive Mobile Preview (4 Col) -->
        <div class="lg:col-span-4 space-y-6">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sticky top-20">
                <div class="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                    <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <i class="fas fa-mobile-alt text-teal-600"></i>
                        Simulasi Layar Mobile
                    </span>
                    <span class="text-[10px] text-slate-400 font-mono">375 &times; 667 px</span>
                </div>

                <p class="text-[11px] text-slate-500 mb-4 leading-relaxed">
                    Berikut adalah pratinjau tampilan banner mengambang saat pengunjung membuka portal dari browser smartphone:
                </p>

                <!-- Phone Mockup Frame -->
                <div class="mx-auto rounded-3xl border-4 border-slate-800 bg-slate-100 overflow-hidden shadow-xl max-w-[280px] flex flex-col" style="height: 480px;">
                    <!-- Phone Notch & Bar -->
                    <div class="bg-slate-800 text-white text-[9px] px-4 py-1.5 flex justify-between items-center select-none">
                        <span>09:41</span>
                        <div class="w-12 h-3 bg-slate-900 rounded-full mx-auto"></div>
                        <div class="flex items-center gap-1">
                            <i class="fas fa-wifi text-[8px]"></i>
                            <i class="fas fa-battery-full text-[8px]"></i>
                        </div>
                    </div>

                    <!-- Mini Web Content Mockup -->
                    <div class="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
                        <span class="text-[11px] font-black tracking-tight text-slate-800">NEWSROOM</span>
                        <div class="flex gap-1 text-slate-400 text-xs">
                            <i class="fas fa-search"></i>
                            <i class="fas fa-bars ml-1"></i>
                        </div>
                    </div>

                    <div class="p-3 flex-1 overflow-hidden space-y-2 bg-slate-50">
                        <div class="h-28 bg-slate-200 rounded-xl animate-pulse"></div>
                        <div class="h-3 w-3/4 bg-slate-300 rounded"></div>
                        <div class="h-2.5 w-full bg-slate-200 rounded"></div>
                        <div class="h-2.5 w-5/6 bg-slate-200 rounded"></div>
                    </div>

                    <!-- PREVIEW SMART APP BANNER (Bawah Mockup) -->
                    <template x-if="form.masa_mobile_redirect_enabled === 'true' && form.masa_mobile_mode === 'smart_banner'">
                        <div class="bg-[#0f172a] text-white p-3 border-t border-slate-700 flex items-center justify-between gap-2 shadow-lg">
                            <div class="flex items-center gap-2 min-w-0">
                                <div class="w-8 h-8 rounded-lg bg-[#0d9488] text-white flex items-center justify-center text-sm font-bold shrink-0">
                                    M
                                </div>
                                <div class="min-w-0">
                                    <div class="text-[11px] font-bold text-slate-100 truncate" x-text="form.masa_prompt_title || 'Baca Lebih Nyaman di Aplikasi MASA'"></div>
                                    <div class="text-[9px] text-slate-400 truncate">Berita resmi Muhammadiyah</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-1.5 shrink-0">
                                <span class="px-2 py-1 rounded bg-[#0d9488] text-white text-[9px] font-bold shadow-2xs">Buka</span>
                                <span class="text-slate-400 text-[10px] px-1">&times;</span>
                            </div>
                        </div>
                    </template>

                    <!-- PREVIEW AUTO REDIRECT -->
                    <template x-if="form.masa_mobile_redirect_enabled === 'true' && form.masa_mobile_mode === 'auto_redirect'">
                        <div class="bg-amber-500 text-white p-2.5 text-center text-[10px] font-bold">
                            <i class="fas fa-external-link-alt mr-1"></i> Mengalihkan otomatis ke MASA...
                        </div>
                    </template>

                    <!-- PREVIEW NONAKTIF -->
                    <template x-if="form.masa_mobile_redirect_enabled !== 'true'">
                        <div class="bg-slate-200 text-slate-500 p-2.5 text-center text-[10px] font-semibold">
                            Integrasi MASA Nonaktif
                        </div>
                    </template>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 text-center">
                    <button type="button" @click="saveSettings()" :disabled="isSaving"
                            class="w-full py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-0">
                        <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                        <span x-text="isSaving ? 'Menyimpan...' : 'Simpan Perubahan'">Simpan Perubahan</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
`;
