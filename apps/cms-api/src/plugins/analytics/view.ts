export const analyticsDashboardView = `
<div x-data="analyticsHybridApp()" x-init="init()" class="space-y-6">
  <!-- TOP HEADER & CONTROLS -->
  <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 text-xs">
          <i class="fas fa-chart-line"></i>
        </span>
        <h2 class="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Intelligence & Traffic Analytics</h2>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400">Analitik hybrid: Permintaan jaringan Cloudflare Edge & perilaku audiens Google Analytics 4.</p>
    </div>

    <!-- CONTROLS: DUAL-PILL ENGINE SWITCHER & REALTIME BADGE -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Segmented Control Dual-Pill Switcher -->
      <div class="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80">
        <button 
          @click="switchEngine('cloudflare')" 
          :class="activeEngine === 'cloudflare' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'"
          class="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 cursor-pointer">
          <i class="fas fa-network-wired text-xs"></i>
          <span>Cloudflare Edge</span>
        </button>
        
        <button 
          @click="switchEngine('ga4')" 
          :class="activeEngine === 'ga4' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'"
          class="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 cursor-pointer">
          <i class="fab fa-google text-xs"></i>
          <span>Google Analytics</span>
        </button>
      </div>

      <!-- Realtime Users Counter Badge -->
      <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 px-4 py-2 rounded-xl">
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider" x-text="activeEngine === 'ga4' ? 'Aktif (30 Menit)' : 'Pengunjung Aktif'"></div>
          <div class="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">
            <span x-text="getRealtimeCount()">0</span> <span class="text-xs font-medium text-slate-400">online</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- LOADING SKELETON STATE -->
  <template x-if="loading">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      <div class="bg-slate-100 dark:bg-slate-800/60 h-28 rounded-xl border border-slate-200 dark:border-slate-700"></div>
      <div class="bg-slate-100 dark:bg-slate-800/60 h-28 rounded-xl border border-slate-200 dark:border-slate-700"></div>
      <div class="bg-slate-100 dark:bg-slate-800/60 h-28 rounded-xl border border-slate-200 dark:border-slate-700"></div>
      <div class="bg-slate-100 dark:bg-slate-800/60 h-28 rounded-xl border border-slate-200 dark:border-slate-700"></div>
    </div>
  </template>

  <!-- ========================================================================= -->
  <!-- ENGINE A: CLOUDFLARE EDGE ANALYTICS VIEW                                  -->
  <!-- ========================================================================= -->
  <template x-if="!loading && activeEngine === 'cloudflare'">
    <div class="space-y-6">
      <!-- Unconfigured Banner if Token Missing -->
      <template x-if="cfStats.configured === false">
        <div class="p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <i class="fas fa-exclamation-triangle text-lg"></i>
          </div>
          <div>
            <h4 class="text-sm font-bold text-amber-900 dark:text-amber-200">Cloudflare Analytics Belum Dikonfigurasi</h4>
            <p class="text-xs text-amber-700 dark:text-amber-300/80 mt-1">
              Pasang <code class="bg-amber-100 dark:bg-amber-900/80 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-200">CLOUDFLARE_ZONE_ID</code> dan <code class="bg-amber-100 dark:bg-amber-900/80 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-200">CLOUDFLARE_API_TOKEN</code> di Pages Secrets atau tabel options untuk menarik metrik GraphQL jaringan.
            </p>
          </div>
        </div>
      </template>

      <!-- STATS CARDS: CLOUDFLARE -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Kunjungan 24 Jam</div>
          <div class="text-2xl font-black text-slate-800 dark:text-slate-100" x-text="cfStats.data?.totalPageViews24h ? cfStats.data.totalPageViews24h.toLocaleString('id-ID') : '-'">-</div>
          <div class="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1 flex items-center gap-1">
            <i class="fas fa-bolt"></i> Cloudflare Edge PageViews
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pengunjung Unik 24 Jam</div>
          <div class="text-2xl font-black text-slate-800 dark:text-slate-100" x-text="cfStats.data?.uniqueVisitors24h ? cfStats.data.uniqueVisitors24h.toLocaleString('id-ID') : '-'">-</div>
          <div class="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 flex items-center gap-1">
            <i class="fas fa-users"></i> Uniques Edge IP
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Permintaan Jaringan</div>
          <div class="text-2xl font-black text-slate-800 dark:text-slate-100" x-text="cfStats.data?.totalRequests24h ? cfStats.data.totalRequests24h.toLocaleString('id-ID') : '-'">-</div>
          <div class="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1 flex items-center gap-1">
            <i class="fas fa-server"></i> HTTP Requests 24 Jam
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status Caching D1</div>
          <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400">Zero Reads</div>
          <div class="text-[11px] text-slate-400 font-normal mt-1 flex items-center gap-1">
            <i class="fas fa-shield-alt"></i> Protected by L1 RAM & KV
          </div>
        </div>
      </div>

      <!-- TOP COUNTRIES BREAKDOWN (CLOUDFLARE) -->
      <template x-if="cfStats.data?.topCountries && cfStats.data.topCountries.length > 0">
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <i class="fas fa-globe text-teal-600 dark:text-teal-400"></i> Distribusi Trafik Negara Teratas (Top Countries)
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <template x-for="item in cfStats.data.topCountries" :key="item.country">
              <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate" x-text="item.country"></div>
                <div class="text-base font-black text-slate-800 dark:text-slate-100 mt-1" x-text="Number(item.count || 0).toLocaleString('id-ID')"></div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </template>

  <!-- ========================================================================= -->
  <!-- ENGINE B: GOOGLE ANALYTICS 4 (GA4) VIEW                                   -->
  <!-- ========================================================================= -->
  <template x-if="!loading && activeEngine === 'ga4'">
    <div class="space-y-6">
      <!-- Unconfigured Banner if Service Account Missing -->
      <template x-if="ga4Stats.configured === false">
        <div class="p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <i class="fab fa-google text-lg"></i>
          </div>
          <div>
            <h4 class="text-sm font-bold text-amber-900 dark:text-amber-200">Google Analytics 4 Belum Dikonfigurasi</h4>
            <p class="text-xs text-amber-700 dark:text-amber-300/80 mt-1">
              Hubungkan akun GA4 Anda dengan menambahkan <code class="bg-amber-100 dark:bg-amber-900/80 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-200">GA4_PROPERTY_ID</code>, <code class="bg-amber-100 dark:bg-amber-900/80 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-200">GA_CLIENT_EMAIL</code>, dan <code class="bg-amber-100 dark:bg-amber-900/80 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-200">GA_PRIVATE_KEY</code> di Pages Secrets atau tabel options.
            </p>
          </div>
        </div>
      </template>

      <!-- STATS CARDS: GA4 AUDIENCE METRICS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pengguna Realtime (30m)</div>
          <div class="text-2xl font-black text-slate-800 dark:text-slate-100" x-text="ga4Stats.realtimeActiveUsers !== undefined ? ga4Stats.realtimeActiveUsers : '-'">-</div>
          <div class="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
            <i class="fas fa-user-clock"></i> GA4 Active Users
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Sesi Audiens (30 Hari)</div>
          <div class="text-2xl font-black text-slate-800 dark:text-slate-100" x-text="ga4Stats.totalSessions30d ? ga4Stats.totalSessions30d.toLocaleString('id-ID') : '-'">-</div>
          <div class="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1 flex items-center gap-1">
            <i class="fas fa-layer-group"></i> Total Sessions
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Rata-rata Durasi Baca</div>
          <div class="text-2xl font-black text-slate-800 dark:text-slate-100" x-text="ga4Stats.avgEngagementTime || '-'">-</div>
          <div class="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 flex items-center gap-1">
            <i class="fas fa-clock"></i> Avg Engagement Time
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Rasio Pentalan (Bounce Rate)</div>
          <div class="text-2xl font-black text-slate-800 dark:text-slate-100" x-text="ga4Stats.bounceRate || '-'">-</div>
          <div class="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 flex items-center gap-1">
            <i class="fas fa-chart-pie"></i> Engagement Quality
          </div>
        </div>
      </div>

      <!-- AUDIENCE BEHAVIOR BREAKDOWN (GA4 EXCLUSIVE) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- 1. Rasio Pengunjung Baru vs Lama -->
        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">Tipe Pengunjung</h4>
          <div class="space-y-3">
            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span class="text-slate-600 dark:text-slate-400">Pengunjung Baru (New)</span>
                <span class="text-teal-600 dark:text-teal-400" x-text="(ga4Stats.userTypeRatio?.newUsers || 0) + '%'">-</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="bg-teal-500 h-full rounded-full transition-all duration-500" :style="'width: ' + (ga4Stats.userTypeRatio?.newUsers || 0) + '%'"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span class="text-slate-600 dark:text-slate-400">Pengunjung Setia (Returning)</span>
                <span class="text-indigo-600 dark:text-indigo-400" x-text="(ga4Stats.userTypeRatio?.returningUsers || 0) + '%'">-</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="bg-indigo-500 h-full rounded-full transition-all duration-500" :style="'width: ' + (ga4Stats.userTypeRatio?.returningUsers || 0) + '%'"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Sumber Rujukan Trafik (Top Sources) -->
        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">Sumber Rujukan Terbanyak</h4>
          <div class="space-y-2">
            <template x-for="src in ga4Stats.topSources || []" :key="src.source">
              <div class="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/80 last:border-0">
                <span class="font-medium text-slate-700 dark:text-slate-300 truncate" x-text="src.source"></span>
                <span class="font-bold text-amber-600 dark:text-amber-400" x-text="src.sessions.toLocaleString('id-ID') + ' sesi'"></span>
              </div>
            </template>
            <template x-if="!ga4Stats.topSources || ga4Stats.topSources.length === 0">
              <div class="text-xs text-slate-400 py-3 text-center">Belum ada data sumber rujukan.</div>
            </template>
          </div>
        </div>

        <!-- 3. Komposisi Perangkat (Device Breakdown) -->
        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">Perangkat Pengguna</h4>
          <div class="grid grid-cols-3 gap-2 text-center pt-2">
            <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <i class="fas fa-mobile-alt text-teal-600 text-sm mb-1"></i>
              <div class="text-[10px] text-slate-400 uppercase font-bold">Mobile</div>
              <div class="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5" x-text="(ga4Stats.deviceBreakdown?.mobile || 0) + '%'">-</div>
            </div>
            <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <i class="fas fa-desktop text-indigo-600 text-sm mb-1"></i>
              <div class="text-[10px] text-slate-400 uppercase font-bold">Desktop</div>
              <div class="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5" x-text="(ga4Stats.deviceBreakdown?.desktop || 0) + '%'">-</div>
            </div>
            <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <i class="fas fa-tablet-alt text-amber-600 text-sm mb-1"></i>
              <div class="text-[10px] text-slate-400 uppercase font-bold">Tablet</div>
              <div class="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5" x-text="(ga4Stats.deviceBreakdown?.tablet || 0) + '%'">-</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <!-- ========================================================================= -->
  <!-- 30-DAY HISTORY DATA TABLE (ADAPTIVE TO ENGINE)                            -->
  <!-- ========================================================================= -->
  <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 transition-colors">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Histori Kunjungan Harian (30 Hari Terakhir)</h3>
        <p class="text-xs text-slate-400 mt-0.5">
          <span x-text="activeEngine === 'ga4' ? 'Data bersumber dari Google Analytics 4 Reporting API' : 'Data bersumber dari Cloudflare Edge GraphQL'"></span>
        </p>
      </div>
      <button @click="loadData(true)" class="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer">
        <i class="fas fa-sync-alt" :class="loading ? 'fa-spin' : ''"></i> Segarkan Data
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th class="py-3 px-4">Tanggal</th>
            <th class="py-3 px-4" x-text="activeEngine === 'ga4' ? 'Pengguna Aktif (Users)' : 'Pengunjung Unik (Edge IP)'"></th>
            <th class="py-3 px-4" x-text="activeEngine === 'ga4' ? 'Total Sesi (Sessions)' : 'Total Permintaan HTTP'"></th>
            <th class="py-3 px-4 text-right">Tayangan Layar / Halaman (Views)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
          <template x-for="item in dailyStats" :key="item.day || item.date">
            <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
              <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200" x-text="item.day || item.date"></td>
              <td class="py-3 px-4 font-bold text-teal-600 dark:text-teal-400" x-text="Number(item.visitors || item.activeUsers || 0).toLocaleString('id-ID')"></td>
              <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400" x-text="Number(item.sessions || item.requests || item.views || 0).toLocaleString('id-ID')"></td>
              <td class="py-3 px-4 text-right font-medium text-slate-500 dark:text-slate-400" x-text="Number(item.screenPageViews || item.views || 0).toLocaleString('id-ID')"></td>
            </tr>
          </template>
          <template x-if="dailyStats.length === 0">
            <tr>
              <td colspan="4" class="py-8 text-center text-slate-400">Belum ada data riwayat kunjungan tercatat untuk engine ini.</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</div>

<script>
function analyticsHybridApp() {
  return {
    activeEngine: localStorage.getItem('cmsmu_analytics_engine') || 'cloudflare',
    realtimeCount: 0,
    loading: false,
    cfStats: {},
    ga4Stats: {},
    dailyStats: [],
    timer: null,

    async init() {
      await this.loadData();
      this.timer = setInterval(() => this.refreshRealtime(), 15000);
    },

    getRealtimeCount() {
      if (this.activeEngine === 'ga4') {
        return this.ga4Stats.realtimeActiveUsers !== undefined ? this.ga4Stats.realtimeActiveUsers : 0;
      }
      return this.realtimeCount || (this.cfStats.data?.uniqueVisitors24h ? Math.round(this.cfStats.data.uniqueVisitors24h / 12) : 0);
    },

    async switchEngine(engine) {
      if (this.activeEngine === engine) return;
      this.activeEngine = engine;
      localStorage.setItem('cmsmu_analytics_engine', engine);
      await this.loadData();
    },

    async refreshRealtime() {
      try {
        const token = localStorage.getItem('labmu_token') || localStorage.getItem('admin_token');
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        const res = await fetch('/api/stats/realtime', { headers });
        if (res.ok) {
          const data = await res.json();
          this.realtimeCount = data.count || 0;
        }
      } catch (e) {}
    },

    async loadData(force = false) {
      this.loading = true;
      try {
        const token = localStorage.getItem('labmu_token') || localStorage.getItem('admin_token');
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};

        await this.refreshRealtime();

        if (this.activeEngine === 'cloudflare') {
          const [resHist, resCf] = await Promise.all([
            fetch('/api/stats/history?source=cloudflare', { headers }),
            fetch('/api/stats/cloudflare', { headers })
          ]);

          if (resHist.ok) {
            const dHist = await resHist.json();
            this.dailyStats = dHist.dailyStats || [];
          }
          if (resCf.ok) {
            this.cfStats = await resCf.json();
          }
        } else if (this.activeEngine === 'ga4') {
          const [resHist, resGa4] = await Promise.all([
            fetch('/api/stats/history?source=ga4', { headers }),
            fetch('/api/stats/ga4', { headers })
          ]);

          if (resHist.ok) {
            const dHist = await resHist.json();
            this.dailyStats = dHist.dailyStats || [];
          }
          if (resGa4.ok) {
            this.ga4Stats = await resGa4.json();
          }
        }
      } catch (e) {
        console.error('Analytics load error:', e);
      } finally {
        this.loading = false;
      }
    }
  };
}
</script>
`;
export default analyticsDashboardView;
