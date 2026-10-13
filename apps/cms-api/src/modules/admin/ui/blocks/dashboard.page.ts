export const dashboardPage = `
<div x-show="view==='dash'">
  
  <!-- HEADER WELCOME & TOP ACTIONS -->
  <div class="mb-5 sm:mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm border-l-4 border-l-teal-600 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4">
     <div class="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal-50 blur-3xl pointer-events-none"></div>
     
     <div class="relative z-10">
        <h2 class="text-xl sm:text-2xl font-black text-slate-800 mb-1 tracking-tight">Selamat Datang di Portal Redaksi<span x-text="(settings && settings.site_title) ? ' ' + settings.site_title : ''"></span>, <span x-text="userName || 'Redaksi'"></span>! 👋</h2>
        <p class="text-xs sm:text-sm text-slate-500 font-normal">Sistem berjalan normal. Siap untuk mempublikasikan ide-ide hebat hari ini?</p>
     </div>

     <!-- Top Action Buttons: Full width on mobile, ergonomis 44px+ tap target -->
     <div class="relative z-10 flex items-center gap-2.5 w-full md:w-auto shrink-0">
        <button @click="openEditor()" class="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] px-4 py-2.5 min-h-[44px] text-xs font-bold text-white transition-all shadow-sm">
            <i class="fas fa-plus text-xs"></i>
            <span>Tulis Artikel Baru</span>
        </button>
        <a href="/" target="_blank" class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] px-3.5 py-2.5 min-h-[44px] text-xs font-semibold text-slate-700 transition-all shadow-sm">
            <i class="fas fa-external-link-alt text-xs text-slate-400"></i>
            <span class="hidden sm:inline">Lihat Website</span>
        </a>
     </div>
  </div>

  <!-- ALERT BANNER: PENDING PRO SUBSCRIBERS -->
  <template x-if="pendingSubscribers > 0">
     <div class="mb-5 sm:mb-6 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 sm:p-5 shadow-sm flex items-center justify-between flex-wrap gap-4" x-transition>
        <div class="flex items-center gap-3">
           <div class="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              <i class="fas fa-gem"></i>
           </div>
           <div>
              <h4 class="text-sm font-bold text-amber-900 mb-0.5">Ada <span x-text="pendingSubscribers"></span> Pendaftaran Pelanggan Pro Menunggu Verifikasi</h4>
              <p class="text-xs text-amber-700">Pelanggan baru telah mengirim bukti transfer. Mohon verifikasi pembayaran untuk mengaktifkan akses Pro.</p>
           </div>
        </div>
        <button @click="view='subscribers'; loadSubscribers()" class="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 min-h-[40px] rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
           <span>Periksa Pembayaran</span>
           <i class="fas fa-arrow-right text-[10px]"></i>
        </button>
     </div>
  </template>

  <!-- METRIC CARDS TITLE -->
  <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span class="inline-flex h-2 w-2 rounded-full bg-teal-500"></span>
          <span>Ringkasan Konten & Media</span>
      </div>
  </div>

  <!-- METRIC CARDS -->
  <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      
      <!-- Card Item 1: Articles -->
      <div class="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-xs cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-teal-400 transition-all duration-200 group flex items-center gap-3.5" @click="view='posts'; loadPosts()">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <i class="fas fa-pen-nib text-xs"></i>
        </div>
        <div class="min-w-0 flex-1">
            <h4 class="font-black text-slate-800 text-xl sm:text-2xl leading-none tracking-tight" x-text="dashboardStats?.posts || posts.length">0</h4>
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 block truncate">Artikel Terbit</span>
        </div>
      </div>

      <!-- Card Item 2: Total Views (Real D1 Database SUM) -->
      <div class="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-rose-400 transition-all duration-200 group flex items-center gap-3.5">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <i class="fas fa-eye text-xs"></i>
        </div>
        <div class="min-w-0 flex-1">
            <h4 class="font-black text-slate-800 text-xl sm:text-2xl leading-none tracking-tight" x-text="(Number(dashboardStats?.totalViews) || 0).toLocaleString('id-ID')">0</h4>
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 block truncate">Total Tayangan</span>
        </div>
      </div>
      
      <!-- Card Item 3: Pages -->
      <div class="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-xs cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-400 transition-all duration-200 group flex items-center gap-3.5" @click="view='pages'; loadPages()">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
           <i class="fas fa-file-alt text-xs"></i>
        </div>
        <div class="min-w-0 flex-1">
            <h4 class="font-black text-slate-800 text-xl sm:text-2xl leading-none tracking-tight" x-text="dashboardStats?.pages || (pages ? pages.length : 0)">0</h4>
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 block truncate">Halaman Statis</span>
        </div>
      </div>

      <!-- Card Item 3: Media Gallery -->
      <div class="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-xs cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-400 transition-all duration-200 group flex items-center gap-3.5" @click="view='media'; loadMedia()">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
           <i class="fas fa-images text-xs"></i>
        </div>
        <div class="min-w-0 flex-1">
            <h4 class="font-black text-slate-800 text-xl sm:text-2xl leading-none tracking-tight" x-text="dashboardStats?.media || (typeof mediaList !== 'undefined' ? mediaList.length : 0)">0</h4>
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 block truncate">Galeri Media</span>
        </div>
      </div>

      <!-- Card Item 4: Media Sumber (Menggantikan Theme) -->
      <div class="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-xs cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-sky-400 transition-all duration-200 group flex items-center gap-3.5" @click="view='aggregator'">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
           <i class="fas fa-satellite-dish text-xs"></i>
        </div>
        <div class="min-w-0 flex-1">
            <h4 class="font-black text-slate-800 text-xl sm:text-2xl leading-none tracking-tight" x-text="dashboardStats?.sources || 0">0</h4>
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 block truncate">Media Sumber</span>
        </div>
      </div>
  </div>
  
  <!-- ANALYTICS ROW 1 -->
  <div class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
     
     <!-- Traffic Statistics Chart -->
     <div class="xl:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-7"
          x-effect="
         const _period = chartPeriod;
         const _posts = posts;
         const _pages = pages;
         if (typeof ApexCharts !== 'undefined') {
             const buildAndRender = async () => {
                 
                 if (!$el._visitorDataLoaded) {
                     try {
                         const token = localStorage.getItem('labmu_token') || localStorage.getItem('admin_token');
                         const resHist = await fetch('/api/stats/history', { headers: { 'Authorization': 'Bearer ' + token } });
                         const dataHist = await resHist.json();
                         $el._visitorData = dataHist.visitors || [];
                         $el._dailyStats = dataHist.dailyStats || [];
                         $el._visitorDataLoaded = true;
                         const resAgg = await fetch('/api/stats/dashboard', { headers: { 'Authorization': 'Bearer ' + token } });
                         const statsAgg = await resAgg.json();
                         window.__CMS_DASHBOARD_STATS = statsAgg;
                         document.dispatchEvent(new CustomEvent('stats-updated', { detail: statsAgg }));
                     } catch (e) {}
                 }
                 
                 const visitorData = $el._visitorData || [];
                 const dailyStatsData = $el._dailyStats || [];
                 const labels = [];
                 const userCounts = [];
                 const postCounts = [];
                 const viewCounts = [];
                 
                 if (_period === '7d') {
                     for (let i = 6; i >= 0; i--) {
                         const d = new Date();
                         d.setDate(d.getDate() - i);
                         labels.push(d.toLocaleString('id-ID', { weekday: 'short', day: 'numeric' }));
                         const yyyy_mm_dd = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                         const uCount = visitorData.find(v => v.day === yyyy_mm_dd)?.count || 0;
                         userCounts.push(uCount);
                         const dayPosts = (_posts || []).filter(p => (p.created_at || '').startsWith(yyyy_mm_dd));
                         postCounts.push(dayPosts.length);
                         const dStat = dailyStatsData.find(s => s.day === yyyy_mm_dd);
                         viewCounts.push(dStat ? (Number(dStat.views) || 0) : dayPosts.reduce((sum, p) => sum + (Number(p.views) || 0), 0));
                     }
                 } else if (_period === 'daily') {
                     for (let i = 13; i >= 0; i--) {
                         const d = new Date();
                         d.setDate(d.getDate() - i);
                         labels.push(d.toLocaleString('id-ID', { weekday: 'short', day: 'numeric' }));
                         const yyyy_mm_dd = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                         const uCount = visitorData.find(v => v.day === yyyy_mm_dd)?.count || 0;
                         userCounts.push(uCount);
                         const dayPosts = (_posts || []).filter(p => (p.created_at || '').startsWith(yyyy_mm_dd));
                         postCounts.push(dayPosts.length);
                         const dStat = dailyStatsData.find(s => s.day === yyyy_mm_dd);
                         viewCounts.push(dStat ? (Number(dStat.views) || 0) : dayPosts.reduce((sum, p) => sum + (Number(p.views) || 0), 0));
                     }
                 } else if (_period === 'yearly' || _period === 'all') {
                     for (let i = 4; i >= 0; i--) {
                         const yr = new Date().getFullYear() - i;
                         labels.push(String(yr));
                         userCounts.push(0);
                         const yrPosts = (_posts || []).filter(p => new Date(p.created_at).getFullYear() === yr);
                         postCounts.push(yrPosts.length);
                         viewCounts.push(yrPosts.reduce((sum, p) => sum + (Number(p.views) || 0), 0));
                     }
                 } else { // 'monthly'
                     for (let i = 5; i >= 0; i--) {
                         const d = new Date();
                         d.setMonth(d.getMonth() - i);
                         labels.push(d.toLocaleString('id-ID', { month: 'short' }));
                         const monthNum = d.getMonth();
                         const yearNum = d.getFullYear();
                         const yyyy_mm = yearNum + '-' + String(monthNum + 1).padStart(2, '0');
                         const uCount = visitorData.find(v => v.month === yyyy_mm)?.count || 0;
                         userCounts.push(uCount);
                         const mPosts = (_posts || []).filter(p => { const pd = new Date(p.created_at); return pd.getMonth() === monthNum && pd.getFullYear() === yearNum; });
                         postCounts.push(mPosts.length);
                         const mDStats = dailyStatsData.filter(s => (s.day || '').startsWith(yyyy_mm));
                         const recMViews = mDStats.reduce((sum, s) => sum + (Number(s.views) || 0), 0);
                         viewCounts.push(recMViews > 0 ? recMViews : mPosts.reduce((sum, p) => sum + (Number(p.views) || 0), 0));
                     }
                 }
                 
                 if (window._trafficChart) { window._trafficChart.destroy(); window._trafficChart = null; }
                 const options = {
                     series: [
                         { name: 'Total View', data: viewCounts },
                         { name: 'Real User', data: userCounts },
                         { name: 'Artikel Terbit', data: postCounts }
                     ],
                     chart: { type: 'area', height: 320, toolbar: { show: false }, fontFamily: 'inherit', animations: { enabled: true, speed: 400 } },
                     colors: ['#6366f1', '#0d9488', '#f59e0b'],
                     fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 90, 100] } },
                     dataLabels: { enabled: false },
                     stroke: { curve: 'smooth', width: 2 },
                     xaxis: { categories: labels, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: '11px' } } },
                     yaxis: { 
                         show: true, 
                         min: 0, 
                         forceNiceScale: true,
                         labels: { 
                             formatter: (val) => val >= 1000 ? (val / 1000).toFixed(1) + 'k' : Math.round(val) 
                         } 
                     },
                     grid: { borderColor: '#f8fafc', strokeDashArray: 4, yaxis: { lines: { show: true } } },
                     legend: { position: 'top', horizontalAlign: 'right' },
                     tooltip: { 
                         shared: true, 
                         intersect: false, 
                         y: { 
                             formatter: (val) => (Number(val) || 0).toLocaleString('id-ID') 
                         } 
                     }
                 };
                 const chartEl = $el.querySelector('#trafficChart');
                 if (chartEl) {
                     window._trafficChart = new ApexCharts(chartEl, options);
                     window._trafficChart.render();
                 }
             };
             buildAndRender();
         }
     ">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h4 class="text-lg font-black text-slate-800 flex items-center gap-3">
                <span class="bg-primary-light text-primary p-2 rounded-lg flex items-center justify-center"><i class="fas fa-chart-line"></i></span>
                Statistik Konten & Traffic
            </h4>
            <div class="flex flex-wrap items-center gap-2">
                <select x-model="chartPeriod" class="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
                    <option value="7d">7 Hari Terakhir</option>
                    <option value="daily">Harian (14 Hari)</option>
                    <option value="monthly">Bulanan (6 Bulan)</option>
                    <option value="yearly">Tahunan (5 Tahun)</option>
                    <option value="all">Sepanjang Masa</option>
                </select>
                <button class="bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors" @click="view='seo'">
                    <i class="fas fa-external-link-alt mr-1"></i> Full Stats
                </button>
            </div>
        </div>
        
        <!-- INTEGRATION SETUP BADGES -->
        <div class="flex flex-wrap gap-2 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100 items-center">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2"><i class="fas fa-plug mr-1"></i> Hubungkan SEO & Analytics:</div>
            
            <button @click="view='seo'" class="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 transition-all">
                <i class="fab fa-google text-blue-500"></i>
                Google Analytics
            </button>
            
            <button @click="view='seo'" class="flex items-center gap-2 bg-white border border-slate-200 hover:border-orange-400 hover:shadow-sm px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 transition-all">
                <i class="fas fa-chart-bar text-orange-500"></i>
                Histats
            </button>
            
            <button @click="view='seo'" class="flex items-center gap-2 bg-white border border-slate-200 hover:border-green-500 hover:shadow-sm px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 transition-all">
                <i class="fas fa-search text-green-600"></i>
                Search Console
            </button>

            <button @click="view='seo'" class="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-600 hover:shadow-sm px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 transition-all">
                <i class="fab fa-microsoft text-blue-600"></i>
                Bing Webmaster
            </button>
        </div>
        <div id="trafficChart"></div>
     </div>
     
     <!-- Real User View & System Status -->
     <div class="xl:col-span-1 flex flex-col gap-6">
         <!-- Real User View -->
         <div class="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg p-7 relative overflow-hidden text-white">
             <!-- Pulse effect -->
             <div class="absolute top-6 right-6 flex items-center gap-2">
                 <span class="relative flex h-3 w-3">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                 </span>
                 <span class="text-emerald-400 text-xs font-bold uppercase tracking-wider">Live</span>
             </div>
             
             <h4 class="text-slate-300 font-semibold mb-2">Realtime Users</h4>
             <div class="text-6xl font-black mb-4 flex items-baseline gap-2">
                <span x-data="{ count: 0 }" x-init="
                    const fetchStats = async () => {
                        try {
                            const res = await fetch('/api/stats/realtime', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('labmu_token') || localStorage.getItem('admin_token')) } });
                            const data = await res.json();
                            count = data.count || 0;
                        } catch(e) {}
                    };
                    fetchStats();
                    setInterval(fetchStats, 10000);
                " x-text="count">0</span>
             </div>
             <p class="text-slate-400 text-sm">Pengunjung aktif di situs saat ini.</p>
             
             <!-- mini bar chart dummy -->
             <div class="mt-6 flex items-end gap-1 h-12 opacity-30">
                 <template x-for="i in 24">
                     <div class="w-full bg-slate-300 rounded-t-sm" :style="\`height: \${Math.floor(Math.random() * 80 + 20)}%\`"></div>
                 </template>
             </div>
         </div>

         <!-- Quick Actions & Web Preview -->
         <div class="rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 sm:p-7 flex-grow flex flex-col justify-between">
            <div>
                <h4 class="text-lg font-black text-slate-800 mb-5 flex items-center gap-3">
                    <span class="bg-teal-50 text-teal-600 p-2 rounded-lg flex items-center justify-center"><i class="fas fa-bolt"></i></span>
                    Aksi Cepat & Pratinjau
                </h4>

                <div class="space-y-3.5">
                    <!-- Tombol Add Post -->
                    <button @click="openEditor('post')" 
                            class="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 active:scale-[0.98] text-white p-3.5 rounded-xl font-semibold text-xs shadow-sm transition-all flex items-center justify-between group cursor-pointer border-0">
                        <div class="flex items-center gap-3 text-left">
                            <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                                <i class="fas fa-pen-nib text-xs"></i>
                            </div>
                            <div>
                                <div class="text-[10px] text-teal-100 font-normal">Buat Konten Baru</div>
                                <div class="font-bold text-xs text-white">Tulis Artikel Baru</div>
                            </div>
                        </div>
                        <i class="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform mr-1"></i>
                    </button>

                    <!-- Tombol Preview Web -->
                    <a href="/" target="_blank" 
                       class="w-full bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 p-3.5 rounded-xl text-slate-700 transition-all flex items-center justify-between group no-underline">
                        <div class="flex items-center gap-3 text-left">
                            <div class="w-8 h-8 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
                                <i class="fas fa-globe text-xs"></i>
                            </div>
                            <div>
                                <div class="text-[10px] text-slate-400 font-normal">Portal Publik</div>
                                <div class="font-bold text-slate-800 text-xs">Pratinjau Situs Web</div>
                            </div>
                        </div>
                        <span class="text-[10px] bg-white border border-slate-200 text-slate-600 font-semibold px-2 py-1 rounded-md group-hover:border-teal-400 group-hover:text-teal-600 transition-colors flex items-center gap-1">
                            Buka <i class="fas fa-external-link-alt text-[9px]"></i>
                        </span>
                    </a>
                </div>
            </div>

            <!-- Footer Status Note -->
            <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span class="flex items-center gap-1.5 font-medium">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Sistem Berjalan Normal
                </span>
                <span class="font-semibold text-slate-500" x-text="(settings && settings.site_title) ? settings.site_title : 'Cloud Native'"></span>
            </div>
         </div>
     </div>
  </div>

  <!-- ANALYTICS ROW 2: ARTIKEL TERBARU & POPULER (FULL WIDTH) -->
  <div class="mt-6">
      
      <!-- Top 10 Popular / Latest Posts -->
      <div class="rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 sm:p-7">
         <!-- Header dengan Tab Switcher & Sinkronisasi Filter Periode -->
         <div class="flex items-center justify-between mb-6 flex-wrap gap-4 border-b border-slate-100 pb-4">
             <div class="flex items-center gap-1.5 sm:gap-2 bg-slate-100 p-1 rounded-xl">
                 <!-- Tab 1: Artikel Populer (Default) -->
                 <button 
                     type="button"
                     @click="dashboardTab = 'popular'"
                     :class="dashboardTab === 'popular' 
                         ? 'bg-white text-teal-700 shadow-xs font-bold' 
                         : 'bg-transparent text-slate-500 hover:text-slate-800 font-medium'"
                     class="px-3 py-2 sm:px-3.5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer">
                     <span :class="dashboardTab === 'popular' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'" class="w-5 h-5 rounded-md flex items-center justify-center text-[10px] transition-colors shrink-0">
                         <i class="fas fa-fire"></i>
                     </span>
                     <span class="truncate" x-text="dashboardTab === 'popular' ? ('Populer (' + (chartPeriod === '7d' ? '7H' : (chartPeriod === 'daily' ? '14H' : (chartPeriod === 'monthly' ? '6B' : (chartPeriod === 'yearly' ? '5T' : 'Semua')))) + ')') : 'Populer'">Populer</span>
                 </button>

                 <!-- Tab 2: Artikel Terbaru -->
                 <button 
                     type="button"
                     @click="dashboardTab = 'latest'"
                     :class="dashboardTab === 'latest' 
                         ? 'bg-white text-teal-700 shadow-xs font-bold' 
                         : 'bg-transparent text-slate-500 hover:text-slate-800 font-medium'"
                     class="px-3 py-2 sm:px-3.5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer">
                     <span :class="dashboardTab === 'latest' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'" class="w-5 h-5 rounded-md flex items-center justify-center text-[10px] transition-colors shrink-0">
                         <i class="fas fa-clock"></i>
                     </span>
                     <span class="truncate">Terbaru</span>
                 </button>
             </div>

             <!-- Kontrol Kanan: Sinkronisasi Periode & Lihat Semua -->
             <div class="flex items-center justify-between sm:justify-end gap-2.5 w-full md:w-auto pt-1 sm:pt-0">
                 <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5" x-show="dashboardTab === 'popular'">
                     <span class="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Periode:</span>
                     <select x-model="chartPeriod" class="text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer">
                         <option value="7d">7 Hari Terakhir</option>
                         <option value="daily">Harian (14 Hari)</option>
                         <option value="monthly">Bulanan (6 Bulan)</option>
                         <option value="yearly">Tahunan (5 Tahun)</option>
                         <option value="all">Sepanjang Masa</option>
                     </select>
                 </div>

                 <!-- Link Lihat Semua -->
                 <button type="button" @click="view='posts'; loadPosts()" class="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1.5 cursor-pointer py-1.5 px-2">
                     <span>Semua Artikel</span>
                     <i class="fas fa-arrow-right text-[10px]"></i>
                 </button>
             </div>
         </div>

         <!-- VIEW 1: MOBILE LIST VIEW (Zero Horizontal Scroll, Card Style) -->
         <div class="block md:hidden divide-y divide-slate-100">
             <template x-for="(post, idx) in (dashboardTab === 'popular' ? popularPosts : latestPosts)" :key="'mob-' + post.id">
                 <div class="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
                     <!-- Badge Peringkat / Icon -->
                     <template x-if="dashboardTab === 'popular'">
                         <span :class="idx === 0 ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300 font-black' : (idx === 1 ? 'bg-slate-200 text-slate-800 font-bold' : (idx === 2 ? 'bg-orange-100 text-orange-800 font-bold' : 'bg-slate-100 text-slate-600 font-medium'))" 
                               class="w-6 h-6 rounded-lg text-xs flex items-center justify-center shrink-0 mt-0.5" 
                               x-text="idx + 1">
                         </span>
                     </template>
                     <template x-if="dashboardTab !== 'popular'">
                         <div class="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 text-xs mt-0.5">
                             <i class="fas fa-file-alt text-[10px]"></i>
                         </div>
                     </template>

                     <!-- Detail Konten Artikel -->
                     <div class="min-w-0 flex-1">
                         <a :href="'/' + post.slug" target="_blank" class="font-bold text-slate-800 text-xs hover:text-teal-600 transition-colors line-clamp-2 leading-snug">
                             <span x-text="cleanTitle(post.title)"></span>
                         </a>
                         
                         <!-- Metadata Pill Row -->
                         <div class="flex items-center flex-wrap gap-2 mt-2 text-[11px] text-slate-500">
                             <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium text-[10px]" x-text="post.category || 'Uncategorized'"></span>
                             <span class="font-bold text-teal-700 flex items-center gap-1">
                                 <i class="fas fa-eye text-[9px] text-teal-500"></i>
                                 <span x-text="(Number(post.views) || 0).toLocaleString('id-ID') + ' views'"></span>
                             </span>
                             <span class="text-slate-400 text-[10px]" x-text="formatDate(post.created_at)"></span>
                         </div>
                     </div>
                 </div>
             </template>
             <template x-if="(dashboardTab === 'popular' ? popularPosts : latestPosts).length === 0">
                 <div class="py-8 text-center text-slate-400 text-xs">
                     Belum ada artikel yang terbit pada periode ini
                 </div>
             </template>
         </div>

         <!-- VIEW 2: DESKTOP TABLE VIEW (Full Columns) -->
         <div class="hidden md:block overflow-x-auto no-scrollbar">
             <table class="w-full text-sm text-slate-600 text-left">
                <thead class="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                   <tr>
                      <th class="py-4 px-5 font-bold rounded-tl-xl">Judul Artikel</th>
                      <th class="py-4 px-5 font-bold">Kategori</th>
                      <th class="py-4 px-5 font-bold text-center">Views</th>
                      <th class="py-4 px-5 font-bold">Status</th>
                      <th class="py-4 px-5 font-bold text-right">Tanggal</th>
                   </tr>
                 </thead>
                 <tbody>
                    <template x-for="(post, idx) in (dashboardTab === 'popular' ? popularPosts : latestPosts)" :key="post.id">
                        <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <td class="py-3 px-5 font-semibold text-slate-800">
                                <div class="flex items-center gap-2.5">
                                    <!-- Badge Peringkat untuk Tab Populer -->
                                    <template x-if="dashboardTab === 'popular'">
                                        <span :class="idx === 0 ? 'bg-amber-100 text-amber-700 font-black' : (idx === 1 ? 'bg-slate-200 text-slate-700 font-bold' : (idx === 2 ? 'bg-orange-100 text-orange-700 font-bold' : 'bg-slate-100 text-slate-500 font-medium'))" 
                                              class="w-5 h-5 rounded-md text-[10px] flex items-center justify-center shrink-0" 
                                              x-text="idx + 1">
                                        </span>
                                    </template>
                                    <a :href="'/' + post.slug" target="_blank" class="hover:text-teal-600 transition-colors flex items-center gap-2 group line-clamp-1" title="Lihat Artikel">
                                        <span x-text="cleanTitle(post.title)"></span>
                                        <i class="fas fa-external-link-alt text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                    </a>
                                </div>
                            </td>
                            <td class="py-3 px-5">
                                <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap" x-text="post.category || 'Uncategorized'"></span>
                            </td>
                            <td class="py-3 px-5 text-center">
                                <span :class="dashboardTab === 'popular' ? 'bg-teal-50 text-teal-700 font-bold px-2.5 py-1 rounded-md' : 'text-slate-700 font-semibold'" class="text-xs inline-flex items-center gap-1">
                                    <template x-if="dashboardTab === 'popular'"><i class="fas fa-eye text-[10px] text-teal-600"></i></template>
                                    <span x-text="(Number(post.views) || 0).toLocaleString('id-ID')"></span>
                                </span>
                            </td>
                            <td class="py-3 px-5">
                                <span :class="post.status === 'publish' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'" class="px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider whitespace-nowrap" x-text="post.status"></span>
                            </td>
                            <td class="py-3 px-5 text-right font-medium text-slate-500 text-sm whitespace-nowrap" x-text="formatDate(post.created_at)"></td>
                        </tr>
                    </template>
                    <template x-if="(dashboardTab === 'popular' ? popularPosts : latestPosts).length === 0">
                        <tr>
                            <td colspan="5" class="py-8 text-center text-slate-400 text-xs">Belum ada artikel yang terbit pada periode ini</td>
                        </tr>
                    </template>
                 </tbody>
             </table>
         </div>
      </div>

   </div>
</div>
`;
