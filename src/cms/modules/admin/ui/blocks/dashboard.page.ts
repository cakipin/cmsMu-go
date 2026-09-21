export const dashboardPage = `
<div x-show="view==='dash'">
  
  <!-- HEADER WELCOME & TOP ACTIONS -->
  <div class="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm border-l-4 border-l-teal-600 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4">
     <div class="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal-50 blur-3xl pointer-events-none"></div>
     
     <div class="relative z-10">
        <h2 class="text-xl sm:text-2xl font-black text-slate-800 mb-1 tracking-tight">Selamat Datang di Portal Redaksi CMSMu, <span x-text="userName || 'Redaksi'"></span>! 👋</h2>
        <p class="text-xs sm:text-sm text-slate-500 font-normal">Sistem berjalan normal. Siap untuk mempublikasikan ide-ide hebat hari ini?</p>
     </div>

     <!-- Top Action Buttons -->
     <div class="relative z-10 flex items-center gap-2 shrink-0">
        <button @click="openEditor()" class="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 px-3.5 py-2 text-xs font-medium text-white active:scale-95 transition-all shadow-sm">
            <i class="fas fa-plus text-[10px]"></i>
            <span>Tulis Artikel Baru</span>
        </button>
        <a href="/" target="_blank" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 px-3.5 py-2 text-xs font-medium text-slate-700 active:scale-95 transition-all shadow-sm">
            <i class="fas fa-external-link-alt text-[10px] text-slate-400"></i>
            <span>Lihat Website</span>
        </a>
     </div>
  </div>

  <!-- ALERT BANNER: PENDING PRO SUBSCRIBERS -->
  <template x-if="pendingSubscribers > 0">
     <div class="mb-6 rounded-2xl border border-amber-300 bg-amber-50/90 p-5 shadow-sm flex items-center justify-between flex-wrap gap-4" x-transition>
        <div class="flex items-center gap-3">
           <div class="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <i class="fas fa-gem"></i>
           </div>
           <div>
              <h4 class="text-sm font-bold text-amber-900 mb-0.5">Ada <span x-text="pendingSubscribers"></span> Pendaftaran Pelanggan Pro Menunggu Verifikasi</h4>
              <p class="text-xs text-amber-700">Pelanggan baru telah mengirim bukti transfer. Mohon verifikasi pembayaran untuk mengaktifkan akses Pro.</p>
           </div>
        </div>
        <button @click="view='subscribers'; loadSubscribers()" class="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-2">
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
  <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      
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
      
      <!-- Card Item 2: Pages -->
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
          x-data="{ chartPeriod: 'monthly' }"
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
                         $el._visitorDataLoaded = true;
                         const resAgg = await fetch('/api/stats/dashboard', { headers: { 'Authorization': 'Bearer ' + token } });
                         const statsAgg = await resAgg.json();
                         window.__CMS_DASHBOARD_STATS = statsAgg;
                         document.dispatchEvent(new CustomEvent('stats-updated', { detail: statsAgg }));
                     } catch (e) {}
                 }
                 
                 const visitorData = $el._visitorData || [];
                 const labels = [];
                 const postCounts = [];
                 const pageCounts = [];
                 const userCounts = [];
                 
                 if (_period === 'daily') {
                     for (let i = 13; i >= 0; i--) {
                         const d = new Date();
                         d.setDate(d.getDate() - i);
                         labels.push(d.toLocaleString('id-ID', { weekday: 'short', day: 'numeric' }));
                         const yyyy_mm_dd = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
                         postCounts.push((_posts||[]).filter(p => (p.created_at||'').startsWith(yyyy_mm_dd)).length);
                         pageCounts.push((_pages||[]).filter(p => (p.created_at||'').startsWith(yyyy_mm_dd)).length);
                         userCounts.push(visitorData.find(v => v.day === yyyy_mm_dd)?.count || 0);
                     }
                 } else if (_period === 'weekly') {
                     for (let i = 11; i >= 0; i--) {
                         const d = new Date();
                         d.setDate(d.getDate() - (i * 7));
                         const startOfWeek = new Date(d);
                         startOfWeek.setDate(d.getDate() - d.getDay());
                         const endOfWeek = new Date(startOfWeek);
                         endOfWeek.setDate(startOfWeek.getDate() + 6);
                         labels.push(String(startOfWeek.getDate()) + '/' + String(startOfWeek.getMonth()+1));
                         postCounts.push((_posts||[]).filter(p => { const pd = new Date(p.created_at); return pd >= startOfWeek && pd <= endOfWeek; }).length);
                         pageCounts.push((_pages||[]).filter(p => { const pd = new Date(p.created_at); return pd >= startOfWeek && pd <= endOfWeek; }).length);
                         userCounts.push(0);
                     }
                 } else if (_period === 'yearly') {
                     for (let i = 4; i >= 0; i--) {
                         const yr = new Date().getFullYear() - i;
                         labels.push(String(yr));
                         postCounts.push((_posts||[]).filter(p => new Date(p.created_at).getFullYear() === yr).length);
                         pageCounts.push((_pages||[]).filter(p => new Date(p.created_at).getFullYear() === yr).length);
                         userCounts.push(0);
                     }
                 } else {
                     for (let i = 5; i >= 0; i--) {
                         const d = new Date();
                         d.setMonth(d.getMonth() - i);
                         labels.push(d.toLocaleString('id-ID', { month: 'short' }));
                         const monthNum = d.getMonth();
                         const yearNum = d.getFullYear();
                         const yyyy_mm = yearNum + '-' + String(monthNum + 1).padStart(2, '0');
                         postCounts.push((_posts||[]).filter(p => { const pd = new Date(p.created_at); return pd.getMonth() === monthNum && pd.getFullYear() === yearNum; }).length);
                         pageCounts.push((_pages||[]).filter(p => { const pd = new Date(p.created_at); return pd.getMonth() === monthNum && pd.getFullYear() === yearNum; }).length);
                         userCounts.push(visitorData.find(v => v.month === yyyy_mm)?.count || 0);
                     }
                 }
                 
                 if (window._trafficChart) { window._trafficChart.destroy(); window._trafficChart = null; }
                 const options = {
                     series: [
                         { name: 'Artikel', data: postCounts },
                         { name: 'Halaman', data: pageCounts },
                         { name: 'Real User', data: userCounts }
                     ],
                     chart: { type: 'area', height: 320, toolbar: { show: false }, fontFamily: 'inherit', animations: { enabled: true, speed: 400 } },
                     colors: ['#0d9488', '#6366f1', '#f59e0b'],
                     fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
                     dataLabels: { enabled: false },
                     stroke: { curve: 'smooth', width: 2 },
                     xaxis: { categories: labels, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: '11px' } } },
                     yaxis: { show: true, min: 0, forceNiceScale: true },
                     grid: { borderColor: '#f8fafc', strokeDashArray: 4, yaxis: { lines: { show: true } } },
                     legend: { position: 'top', horizontalAlign: 'right' },
                     tooltip: { x: { show: true } }
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
                    <option value="daily">Harian (14 Hari)</option>
                    <option value="weekly">Mingguan (12 Minggu)</option>
                    <option value="monthly">Bulanan (6 Bulan)</option>
                    <option value="yearly">Tahunan (5 Tahun)</option>
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
                <span class="font-semibold text-slate-500">CMSMu Cloud Native</span>
            </div>
         </div>
     </div>
  </div>

  <!-- ANALYTICS ROW 2: ARTIKEL TERBARU (FULL WIDTH) -->
  <div class="mt-6">
      
      <!-- Top 10 Popular Posts -->
      <div class="rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 sm:p-7">
         <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
             <h4 class="text-lg font-black text-slate-800 flex items-center gap-3">
                 <span class="bg-rose-50 text-rose-500 p-2 rounded-lg flex items-center justify-center"><i class="fas fa-file-alt"></i></span>
                 Artikel Terbaru
             </h4>
             <button @click="view='posts'; loadPosts()" class="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1">
                 <span>Lihat Semua Artikel</span>
                 <i class="fas fa-arrow-right text-[10px]"></i>
             </button>
         </div>
         <div class="overflow-x-auto no-scrollbar">
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
                    <template x-for="post in (posts || []).slice(0, 10)" :key="post.id">
                        <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <td class="py-3 px-5 font-semibold text-slate-800">
                                <a :href="'/' + post.slug" target="_blank" class="hover:text-primary transition-colors flex items-center gap-2 group" title="Lihat Artikel">
                                    <span x-text="post.title"></span>
                                    <i class="fas fa-external-link-alt text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                </a>
                            </td>
                            <td class="py-3 px-5">
                                <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap" x-text="post.category || 'Uncategorized'"></span>
                            </td>
                            <td class="py-3 px-5 text-center">
                                <span class="font-bold text-slate-700" x-text="post.views || 0"></span>
                            </td>
                            <td class="py-3 px-5">
                                <span :class="post.status === 'publish' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'" class="px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider whitespace-nowrap" x-text="post.status"></span>
                            </td>
                            <td class="py-3 px-5 text-right font-medium text-slate-500 text-sm" x-text="formatDate(post.created_at)"></td>
                        </tr>
                    </template>
                </tbody>
             </table>
         </div>
      </div>

   </div>
</div>
`;