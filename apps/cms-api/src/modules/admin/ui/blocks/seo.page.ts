export const seoPage = `
<div class="animate-fade" style="padding-bottom:80px;"
     x-data="{
        activeTab: 'analytics',
        isLoading: false,
        isSaving: false,
        hasLoaded: false,
        saveMsg: '',
        saveMsgType: '',
        pingMsg: '',
        form: {
            seo_google_analytics: '',
            seo_histats_code: '',
            seo_histats: '',
            seo_google_console: '',
            seo_bing_console: '',
            seo_robots_txt: '',
            custom_head: '',
            custom_body_end: ''
        },
        getToken() {
            return (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || 
                   (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '') ||
                   (localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '');
        },
        async loadSeoSettings() {
            this.isLoading = true;
            try {
                const token = this.getToken();
                const res = await fetch('/api/settings/admin', { headers: { 'Authorization': 'Bearer ' + token } });
                const data = await res.json();
                if (data.success && data.data) {
                    const d = data.data;
                    this.form.seo_google_analytics = d.seo_google_analytics || '';
                    this.form.seo_histats_code = d.seo_histats_code || d.seo_histats || '';
                    this.form.seo_histats = this.form.seo_histats_code;
                    this.form.seo_google_console = d.seo_google_console || '';
                    this.form.seo_robots_txt = d.seo_robots_txt || atob('VXNlci1hZ2VudDogKgpBbGxvdzogLwpEaXNhbGxvdzogL2FkbWluLwpEaXNhbGxvdzogL2FwaS8K');
                    this.form.custom_body_end = d.custom_body_end || '';
                    this.hasLoaded = true;
                }
            } catch (e) { 
                console.error('Load SEO settings error', e); 
            }
            this.isLoading = false;
        },
        async saveSeoSettings() {
            if (!this.hasLoaded) {
                this.saveMsg = 'Gagal menyimpan: Data pengaturan belum selesai dimuat dari server. Muat ulang halaman.';
                this.saveMsgType = 'error';
                return;
            }
            this.isSaving = true;
            this.saveMsg = '';
            try {
                const token = this.getToken();
                // Sinkronisasi histats_code & histats
                this.form.seo_histats = this.form.seo_histats_code;

                const res = await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify(this.form)
                });
                const data = await res.json();
                if (data.success) {
                    this.saveMsg = 'Pengaturan SEO, Analytics & Robots.txt berhasil disimpan!';
                    this.saveMsgType = 'success';
                } else {
                    this.saveMsg = 'Gagal menyimpan: ' + (data.error || 'Terjadi kesalahan sistem');
                    this.saveMsgType = 'error';
                }
            } catch (e) {
                this.saveMsg = 'Error: ' + e.message;
                this.saveMsgType = 'error';
            }
            this.isSaving = false;
            setTimeout(() => { this.saveMsg = ''; }, 4500);
        },
        applyHistatsDefault() {
            this.form.seo_histats_code = atob('PCEtLSBIaXN0YXRzLmNvbSAgU1RBUlQgIChheW5jKS0tPgo8c2NyaXB0IHR5cGU9InRleHQvamF2YXNjcmlwdCI+dmFyIF9IYXN5bmM9IF9IYXN5bmN8fCBbXTsKX0hhc3luYy5wdXNoKFsnSGlzdGF0cy5zdGFydCcsICcxLDUwNTY1NjMsNCwwLDAsMCwwMDAxMDAwMCddKTsKX0hhc3luYy5wdXNoKFsnSGlzdGF0cy5mYXNpJywgJzEnXSk7Cl9IYXN5bmMucHVzaChbJ0hpc3RhdHMudHJhY2tfaGl0cycsICcnXSk7CihmdW5jdGlvbigpIHsKdmFyIGhzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7IGhzLnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JzsgaHMuYXN5bmMgPSB0cnVlOwpocy5zcmMgPSAoJy8vczEwLmhpc3RhdHMuY29tL2pzMTVfYXMuanMnKTsKKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0gfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXSkuYXBwZW5kQ2hpbGQoaHMpOwp9KSgpOzwvc2NyaXB0Pgo8bm9zY3JpcHQ+PGEgaHJlZj0iLyIgdGFyZ2V0PSJfYmxhbmsiPjxpbWcgc3JjPSIvL3NzdGF0aWMxLmhpc3RhdHMuY29tLzAuZ2lmPzUwNTY1NjMmMTAxIiBhbHQ9IiIgYm9yZGVyPSIwIj48L2E+PC9ub3NjcmlwdD4KPCEtLSBIaXN0YXRzLmNvbSAgRU5EICAtLT4=');
            this.form.seo_histats = this.form.seo_histats_code;
        },
        applyRobotsDefault() {
            this.form.seo_robots_txt = atob('VXNlci1hZ2VudDogKgpBbGxvdzogLwpEaXNhbGxvdzogL2FkbWluLwpEaXNhbGxvdzogL2FwaS8K');
        },
        applyRobotsDisallow() {
            this.form.seo_robots_txt = atob('VXNlci1hZ2VudDogKgpEaXNhbGxvdzogLwoKIyBNb2RlIFBlbWVsaWhhcmFhbjogQmxva2lyIHBlbmdpbmRla3NhbiBzZW1lbnRhcmEK');
        },
        copySitemapUrl() {
            const url = window.location.origin + '/sitemap.xml';
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(() => {
                    this.pingMsg = 'URL Sitemap berhasil disalin ke clipboard: ' + url;
                    setTimeout(() => { this.pingMsg = ''; }, 4500);
                });
            } else {
                const ta = document.createElement('textarea');
                ta.value = url;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                this.pingMsg = 'URL Sitemap berhasil disalin ke clipboard: ' + url;
                setTimeout(() => { this.pingMsg = ''; }, 4500);
            }
        },
        openWebmaster(platform) {
            let targetUrl = '';
            if (platform === 'google') {
                targetUrl = 'https://search.google.com/search-console/sitemaps';
            } else if (platform === 'bing') {
                targetUrl = 'https://www.bing.com/webmasters/sitemaps';
            }
            if (targetUrl) {
                window.open(targetUrl, '_blank');
            }
        }
     }"
     x-init="loadSeoSettings()">

  <!-- Page Header Responsif -->
  <div class="mb-5">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2 sm:gap-3">
          <span class="bg-primary-light text-primary p-2 rounded-xl"><i class="fas fa-chart-pie text-base sm:text-lg"></i></span>
          SEO, Analytics & Mesin Pencari
        </h2>
        <p class="text-slate-500 text-xs sm:text-sm mt-1">Konfigurasi pelacak trafik, webmaster verification, berkas robots.txt dinamis, dan sitemap XML.</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="saveSeoSettings()"
                :disabled="isSaving || !hasLoaded"
                class="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 min-h-[42px] rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed text-xs sm:text-sm active:scale-95">
          <i class="fas" :class="isSaving ? 'fa-circle-notch fa-spin' : 'fa-save'"></i>
          <span x-text="isSaving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'"></span>
        </button>
      </div>
    </div>
  </div>

  <!-- Loading Indicator -->
  <div x-show="isLoading" class="flex justify-center py-20">
    <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>

  <div x-show="!isLoading">
    <!-- Save Message Alert -->
    <div x-show="saveMsg"
         :class="saveMsgType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'"
         class="mb-6 px-4 py-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm">
      <i :class="saveMsgType === 'success' ? 'fas fa-check-circle text-emerald-500' : 'fas fa-exclamation-circle text-red-500'"></i>
      <span x-text="saveMsg"></span>
    </div>

    <!-- Ping Alert -->
    <div x-show="pingMsg" class="mb-6 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm">
      <i class="fas fa-satellite-dish text-blue-500"></i>
      <span x-text="pingMsg"></span>
    </div>

    <!-- TAB NAVIGATION BAR (Scrollable Horisontal di Mobile) -->
    <div class="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2 overflow-x-auto scrollbar-none">
      <button type="button"
              @click="activeTab = 'analytics'"
              :class="activeTab === 'analytics' ? 'bg-primary text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-100 font-semibold'"
              class="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap min-h-[40px]">
        <i class="fas fa-chart-line"></i>
        <span>Tab 1: Analytics & Webmaster</span>
      </button>

      <button type="button"
              @click="activeTab = 'robots'"
              :class="activeTab === 'robots' ? 'bg-primary text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-100 font-semibold'"
              class="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap min-h-[40px]">
        <i class="fas fa-robot"></i>
        <span>Tab 2: Robots.txt & Sitemap XML</span>
      </button>
    </div>

    <!-- ======================================================== -->
    <!-- TAB 1: ANALYTICS & WEBMASTER                             -->
    <!-- ======================================================== -->
    <div x-show="activeTab === 'analytics'" class="space-y-6">
      
      <!-- SECTION 1: Analytics & Tracking -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
        <h3 class="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
          <i class="fas fa-chart-line text-primary"></i> Analytics & Trafik Publik
        </h3>
        <p class="text-xs text-slate-400 mb-6">Lacak pengunjung situs publik. Script analitik akan otomatis diinjeksi ke setiap halaman publik.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Google Analytics 4 -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">
              <i class="fab fa-google text-blue-500 mr-1"></i> Google Analytics 4 (GA4)
            </label>
            <input type="text" x-model="form.seo_google_analytics"
                   placeholder="G-XXXXXXXXXX"
                   class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
            <p class="text-[11px] text-slate-400 mt-1.5">Masukkan Measurement ID GA4, contoh: <code class="bg-slate-100 px-1 rounded">G-ABCD123456</code></p>
            <a href="https://analytics.google.com" target="_blank" class="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium hover:underline mt-2">
              <i class="fas fa-external-link-alt text-[10px]"></i> Buka Google Analytics &rarr;
            </a>
          </div>

          <!-- Histats Embed Code -->
          <div>
            <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
              <label class="text-xs font-bold text-slate-700">
                <i class="fas fa-chart-bar text-orange-500 mr-1"></i> Histats (Kode Embed)
              </label>
              <a href="https://www.histats.com" target="_blank" class="text-[11px] font-bold text-orange-600 hover:underline flex items-center gap-1">
                <span>Daftar / Kelola Histats &rarr;</span>
              </a>
            </div>
            <textarea x-model="form.seo_histats_code"
                      placeholder="Tempel kode script asinkron Histats di sini..."
                      rows="6"
                      class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"></textarea>
            
            <div class="flex items-center justify-between mt-2 flex-wrap gap-2">
              <p class="text-[11px] text-slate-400">Kode pelacak trafik real-time Histats</p>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 2: Webmaster Verification -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
        <h3 class="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
          <i class="fas fa-search text-green-600"></i> Verifikasi Mesin Pencari (Webmaster Tag)
        </h3>
        <p class="text-xs text-slate-400 mb-6">Verifikasi kepemilikan domain di mesin pencari. Sistem akan menyisipkan tag verifikasi ke dalam bagian &lt;head&gt;.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">
              <i class="fab fa-google text-green-600 mr-1"></i> Google Search Console
            </label>
            <input type="text" x-model="form.seo_google_console"
                   placeholder='<meta name="google-site-verification" content="..." />'
                   class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
            <p class="text-[11px] text-slate-400 mt-1.5">Paste meta tag verifikasi atau kode hash token dari Google.</p>
            <a href="https://search.google.com/search-console" target="_blank" class="inline-flex items-center gap-1 text-[11px] text-green-700 font-medium hover:underline mt-2">
              <i class="fas fa-external-link-alt text-[10px]"></i> Buka Search Console &rarr;
            </a>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">
              <i class="fab fa-microsoft text-blue-600 mr-1"></i> Bing Webmaster Tools
            </label>
            <input type="text" x-model="form.seo_bing_console"
                   placeholder='<meta name="msvalidate.01" content="..." />'
                   class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
            <p class="text-[11px] text-slate-400 mt-1.5">Paste tag verifikasi msvalidate.01 dari Bing.</p>
            <a href="https://www.bing.com/webmasters" target="_blank" class="inline-flex items-center gap-1 text-[11px] text-blue-700 font-medium hover:underline mt-2">
              <i class="fas fa-external-link-alt text-[10px]"></i> Buka Bing Webmaster &rarr;
            </a>
          </div>
        </div>
      </div>

      <!-- SECTION 3: Custom Head & Body Scripts -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
        <h3 class="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
          <i class="fas fa-code text-indigo-500"></i> Script & Tag Kustom
        </h3>
        <p class="text-xs text-slate-400 mb-6">Tambahkan script atau tag kustom tambahan (Microsoft Clarity, Hotjar, Facebook Pixel, Google Tag Manager, dsb).</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">Kode di dalam &lt;head&gt;</label>
            <textarea x-model="form.custom_head"
                      placeholder="<!-- Meta tag, font preload, custom CSS, GTM head -->"
                      rows="6"
                      class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">Kode sebelum &lt;/body&gt;</label>
            <textarea x-model="form.custom_body_end"
                      placeholder="<!-- Widget live chat, tracking pixel, GTM noscript -->"
                      rows="6"
                      class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- TAB 2: ROBOTS.TXT & SITEMAP XML                          -->
    <!-- ======================================================== -->
    <div x-show="activeTab === 'robots'" class="space-y-6">

      <!-- SECTION 1: Editor Robots.txt Dinamis -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
        <div class="flex items-center justify-between flex-wrap gap-3 mb-2">
          <div>
            <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
              <i class="fas fa-robot text-emerald-600"></i> Editor Berkas Robots.txt Dinamis
            </h3>
            <p class="text-xs text-slate-400 mt-1">Atur hak akses spider/crawler mesin pencari untuk merayapi konten situs Anda.</p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <button type="button" @click="applyRobotsDefault()" class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all shadow-2xs">
              ⚡ Template Ramah SEO
            </button>
            <button type="button" @click="applyRobotsDisallow()" class="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-all shadow-2xs">
              ⚠️ Mode Pemeliharaan
            </button>
            <a href="/robots.txt" target="_blank" class="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-2xs">
              <i class="fas fa-external-link-alt text-[10px]"></i> Buka /robots.txt
            </a>
          </div>
        </div>

        <!-- Warning info staging -->
        <div class="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 mb-4 text-xs text-amber-800 flex items-start gap-2.5">
          <i class="fas fa-shield-alt text-amber-600 text-sm mt-0.5"></i>
          <div>
            <strong>Proteksi Otomatis Lingkungan Staging & Preview:</strong>
            <div class="mt-0.5 text-amber-700 leading-relaxed">
              Jika diakses dari domain staging (seperti <code>pages.dev</code> atau <code>localhost</code>), server akan secara otomatis merespons dengan <code>User-agent: * Disallow: /</code> demi mencegah penalti konten duplikat di Google. Konfigurasi di bawah ini aktif berlaku penuh di domain produksi utama.
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2">Isi Berkas robots.txt</label>
          <textarea x-model="form.seo_robots_txt"
                    rows="8"
                    placeholder="User-agent: *\\nAllow: /\\nDisallow: /admin/\\nDisallow: /api/\\n"
                    class="w-full border border-slate-200 px-4 py-3 rounded-xl text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all leading-relaxed"></textarea>
          <p class="text-[11px] text-slate-400 mt-1.5">
            Baris <code>Sitemap: https://domain-anda.com/sitemap.xml</code> akan otomatis ditambahkan oleh server di akhir berkas jika belum tertulis.
          </p>
        </div>
      </div>

      <!-- SECTION 2: Sitemap XML & Mesin Pencari -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
        <h3 class="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
          <i class="fas fa-sitemap text-blue-600"></i> Sitemap XML Real-Time & Notifikasi Mesin Pencari
        </h3>
        <p class="text-xs text-slate-400 mb-6">Peta situs diperbarui secara langsung oleh server dari database artikel dan laman.</p>

        <!-- Status Kartu URL Sitemap -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">URL Sitemap Utama</div>
              <div class="text-sm font-extrabold text-slate-800 mt-1">/sitemap.xml</div>
              <div class="text-[11px] text-emerald-600 font-semibold mt-0.5">Sitemap Index Bertingkat: 100% dari 14.136+ artikel & majalah</div>
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" @click="copySitemapUrl()" title="Salin URL Sitemap" class="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs flex items-center gap-1">
                <i class="fas fa-copy text-[10px]"></i> Salin
              </button>
              <a href="/sitemap.xml" target="_blank" class="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs flex items-center gap-1">
                <i class="fas fa-external-link-alt text-[10px]"></i> Buka
              </a>
            </div>
          </div>

          <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Index Sitemap Alternatif</div>
              <div class="text-sm font-extrabold text-slate-800 mt-1">/sitemap_index.xml</div>
              <div class="text-[11px] text-slate-400 mt-0.5">Kompatibel penuh untuk Google Search Console & Yoast crawler</div>
            </div>
            <a href="/sitemap_index.xml" target="_blank" class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs flex items-center gap-1.5">
              <i class="fas fa-external-link-alt text-[10px]"></i> Buka
            </a>
          </div>
        </div>

        <!-- Feedback Alert Salin URL -->
        <div x-show="pingMsg" x-cloak class="mb-5 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-2 shadow-2xs">
          <i class="fas fa-check-circle text-emerald-600"></i>
          <span x-text="pingMsg"></span>
        </div>

        <!-- Panel Webmaster Search Engines (Pengganti Ping yang sudah Deprecated oleh Google & Bing) -->
        <div class="bg-gradient-to-r from-emerald-50/60 to-blue-50/60 border border-emerald-200/70 rounded-xl p-5 mb-6">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div class="max-w-xl">
              <h4 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <i class="fas fa-cloud-upload-alt text-emerald-600"></i> Daftarkan Sitemap ke Mesin Pencari
              </h4>
              <p class="text-xs text-slate-600 mt-1">
                Endpoint Ping URL lama telah <strong>ditutup resmi</strong> oleh Google (Des 2023) & Bing (HTTP 410). Daftarkan URL sitemap sekali ke Search Console di bawah. Setelah terdaftar, bot Google & Bing akan merayapi otomatis setiap artikel baru terbit via tag <code>&lt;lastmod&gt;</code> real-time.
              </p>
            </div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <button type="button" @click="openWebmaster('google')" class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs flex items-center gap-2" title="Buka Google Search Console Sitemap Submission">
                <i class="fab fa-google text-red-500"></i>
                <span>Google Search Console</span>
                <i class="fas fa-external-link-alt text-[9px] text-slate-400"></i>
              </button>
              <button type="button" @click="openWebmaster('bing')" class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs flex items-center gap-2" title="Buka Bing Webmaster Tools Sitemaps">
                <i class="fab fa-microsoft text-blue-600"></i>
                <span>Bing Webmaster</span>
                <i class="fas fa-external-link-alt text-[9px] text-slate-400"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Fitur Otomatisasi -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="p-3.5 bg-slate-50/60 rounded-xl border border-slate-100">
            <div class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <i class="fas fa-newspaper text-emerald-600 text-xs"></i> Artikel & Berita
            </div>
            <div class="text-[11px] text-slate-500 mt-1">Otomatis menyertakan artikel publish dengan prioritas 0.8 & frekuensi mingguan.</div>
          </div>
          <div class="p-3.5 bg-slate-50/60 rounded-xl border border-slate-100">
            <div class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <i class="fas fa-file-alt text-blue-600 text-xs"></i> Halaman Statis
            </div>
            <div class="text-[11px] text-slate-500 mt-1">Menyertakan profil, tentang kami, struktur redaksi, dan info berlangganan.</div>
          </div>
          <div class="p-3.5 bg-slate-50/60 rounded-xl border border-slate-100">
            <div class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <i class="fas fa-tags text-purple-600 text-xs"></i> Kategori & Topik
            </div>
            <div class="text-[11px] text-slate-500 mt-1">Menyertakan arsip kategori publikasi dan taksonomi konten.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Save Action Bar -->
    <div class="flex items-center justify-between pt-6 border-t border-slate-200 mt-6">
      <div class="text-xs text-slate-500">
        <i class="fas fa-shield-alt text-emerald-600"></i> Proteksi Anti-Overwrite aktif. Pengaturan tersimpan langsung ke Cloudflare D1.
      </div>
      <button @click="saveSeoSettings()"
              :disabled="isSaving || !hasLoaded"
              class="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed text-sm">
        <i class="fas" :class="isSaving ? 'fa-circle-notch fa-spin' : 'fa-save'"></i>
        <span x-text="isSaving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'"></span>
      </button>
    </div>
  </div>
</div>
`;

