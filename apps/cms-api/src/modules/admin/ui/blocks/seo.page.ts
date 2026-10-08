export const seoPage = `
<div x-show="view === 'seo'" class="animate-fade" style="padding-bottom:80px;"
     x-data="{
        isLoading: false,
        isSaving: false,
        saveMsg: '',
        saveMsgType: '',
        form: {
            seo_google_analytics: '',
            seo_histats_code: '',
            seo_google_console: '',
            seo_bing_console: '',
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
                    this.form.seo_histats_code = d.seo_histats_code || '';
                    this.form.seo_google_console = d.seo_google_console || '';
                    this.form.seo_bing_console = d.seo_bing_console || '';
                    this.form.custom_head = d.custom_head || '';
                    this.form.custom_body_end = d.custom_body_end || '';
                }
            } catch (e) { console.error('Load SEO settings error', e); }
            this.isLoading = false;
        },
        async saveSeoSettings() {
            this.isSaving = true;
            this.saveMsg = '';
            try {
                const token = this.getToken();
                const res = await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify(this.form)
                });
                const data = await res.json();
                if (data.success) {
                    this.saveMsg = 'Pengaturan SEO berhasil disimpan!';
                    this.saveMsgType = 'success';
                } else {
                    this.saveMsg = 'Gagal menyimpan: ' + (data.error || 'Unknown error');
                    this.saveMsgType = 'error';
                }
            } catch (e) {
                this.saveMsg = 'Error: ' + e.message;
                this.saveMsgType = 'error';
            }
            this.isSaving = false;
            setTimeout(() => { this.saveMsg = ''; }, 4000);
        }
     }"
     x-init="loadSeoSettings()">

  <!-- Page Header -->
  <div class="mb-8">
    <h2 class="text-2xl font-black text-slate-800 flex items-center gap-3">
      <span class="bg-primary-light text-primary p-2 rounded-xl"><i class="fas fa-chart-pie text-lg"></i></span>
      SEO & Analytics
    </h2>
    <p class="text-slate-500 text-sm mt-1">Hubungkan situs ke layanan pelacak trafik dan verifikasi kepemilikan di mesin pencari.</p>
  </div>

  <!-- Loading Indicator -->
  <div x-show="isLoading" class="flex justify-center py-20">
    <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>

  <div x-show="!isLoading">
    <!-- Save Message -->
    <div x-show="saveMsg"
         :class="saveMsgType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'"
         class="mb-6 px-4 py-3 rounded-xl border text-sm font-semibold flex items-center gap-2">
      <i :class="saveMsgType === 'success' ? 'fas fa-check-circle text-emerald-500' : 'fas fa-exclamation-circle text-red-500'"></i>
      <span x-text="saveMsg"></span>
    </div>

    <!-- SECTION 1: Analytics -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 mb-6">
      <h3 class="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
        <i class="fas fa-chart-line text-primary"></i> Analytics & Tracking
      </h3>
      <p class="text-xs text-slate-400 mb-6">Lacak pengunjung situs Anda. Kode akan otomatis diinjeksi ke setiap halaman publik.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2">
            <i class="fab fa-google text-blue-500 mr-1"></i> Google Analytics 4 (GA4)
          </label>
          <input type="text" x-model="form.seo_google_analytics"
                 placeholder="G-XXXXXXXXXX"
                 class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
          <p class="text-[11px] text-slate-400 mt-1.5">Contoh: <code class="bg-slate-100 px-1 rounded">G-ABCD123456</code></p>
          <a href="https://analytics.google.com" target="_blank" class="inline-flex items-center gap-1 text-[11px] text-blue-500 hover:underline mt-1">
            <i class="fas fa-external-link-alt text-[10px]"></i> Buka Google Analytics
          </a>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2">
            <i class="fas fa-chart-bar text-orange-500 mr-1"></i> Histats (Embed Code)
          </label>
          <textarea x-model="form.seo_histats_code"
                    placeholder="Tempel kode embed dari Histats di sini..."
                    rows="3"
                    class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"></textarea>
          <a href="https://www.histats.com" target="_blank" class="inline-flex items-center gap-1 text-[11px] text-orange-500 hover:underline mt-1">
            <i class="fas fa-external-link-alt text-[10px]"></i> Buka Histats
          </a>
        </div>
      </div>
    </div>

    <!-- SECTION 2: Webmaster Verification -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 mb-6">
      <h3 class="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
        <i class="fas fa-search text-green-600"></i> Verifikasi Mesin Pencari (Webmaster)
      </h3>
      <p class="text-xs text-slate-400 mb-6">Verifikasi kepemilikan situs ke mesin pencari. Paste meta tag verifikasi yang diberikan.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2">
            <i class="fas fa-search text-green-600 mr-1"></i> Google Search Console
          </label>
          <input type="text" x-model="form.seo_google_console"
                 placeholder='Paste meta tag verifikasi Google di sini'
                 class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
          <p class="text-[11px] text-slate-400 mt-1.5">Tag ini diletakkan di &lt;head&gt; setiap halaman publik.</p>
          <a href="https://search.google.com/search-console" target="_blank" class="inline-flex items-center gap-1 text-[11px] text-green-600 hover:underline mt-1">
            <i class="fas fa-external-link-alt text-[10px]"></i> Buka Search Console
          </a>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2">
            <i class="fab fa-microsoft text-blue-600 mr-1"></i> Bing Webmaster Tools
          </label>
          <input type="text" x-model="form.seo_bing_console"
                 placeholder='Paste meta tag verifikasi Bing di sini'
                 class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
          <p class="text-[11px] text-slate-400 mt-1.5">Contoh: &lt;meta name="msvalidate.01" content="..."&gt;</p>
          <a href="https://www.bing.com/webmasters" target="_blank" class="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-1">
            <i class="fas fa-external-link-alt text-[10px]"></i> Buka Bing Webmaster
          </a>
        </div>
      </div>
    </div>

    <!-- SECTION 3: Custom Code -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 mb-6">
      <h3 class="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
        <i class="fas fa-code text-indigo-500"></i> Kode Kustom
      </h3>
      <p class="text-xs text-slate-400 mb-6">Tambahkan script atau meta tag kustom (Hotjar, Clarity, pixel tracking, dll).</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2">Kode di dalam &lt;head&gt;</label>
          <textarea x-model="form.custom_head"
                    placeholder="&lt;!-- Meta tag, preload, dsb --&gt;"
                    rows="5"
                    class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"></textarea>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-2">Kode sebelum &lt;/body&gt;</label>
          <textarea x-model="form.custom_body_end"
                    placeholder="&lt;!-- Live chat, hotjar, dsb --&gt;"
                    rows="5"
                    class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"></textarea>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex justify-end">
      <button @click="saveSeoSettings()"
              :disabled="isSaving"
              class="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed">
        <i class="fas" :class="isSaving ? 'fa-circle-notch fa-spin' : 'fa-save'"></i>
        <span x-text="isSaving ? 'Menyimpan...' : 'Simpan Pengaturan SEO'"></span>
      </button>
    </div>
  </div>
</div>
`;
