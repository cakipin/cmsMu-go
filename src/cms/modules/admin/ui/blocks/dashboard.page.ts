export const dashboardPage = `
<div x-show="view==='dash'">

  <div class="mb-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm border-l-4 border-l-primary relative overflow-hidden">
     <div class="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-light/50 blur-3xl"></div>

     <h2 class="text-2xl font-black text-slate-800 mb-2 relative z-10 tracking-tight">Selamat Datang di LabMu, Admin! 👋</h2>
     <p class="text-slate-500 font-medium relative z-10">Sistem berjalan normal. Siap untuk mempublikasikan ide-ide hebat hari ini?</p>
  </div>

  <!-- METRIC CARDS -->
  <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 xl:gap-6">

      <!-- Card Item: Articles -->
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-primary-light transition-all duration-300" @click="view='posts'; loadPosts()">
        <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-light text-primary mb-5">
            <i class="fas fa-pen-nib text-2xl"></i>
        </div>
        <div class="mt-2 flex items-end justify-between">
            <div>
              <h4 class="font-black text-slate-800 text-4xl leading-none tracking-tight" x-text="posts.length">0</h4>
              <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 block">Articles</span>
            </div>
        </div>
      </div>

      <!-- Card Item: Pages -->
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-indigo-100 transition-all duration-300" @click="view='pages'; loadPages()">
        <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 mb-5">
           <i class="fas fa-copy text-2xl"></i>
        </div>
        <div class="mt-2 flex items-end justify-between">
            <div>
              <h4 class="font-black text-slate-800 text-4xl leading-none tracking-tight" x-text="pages ? pages.length : 0">0</h4>
              <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 block">Pages</span>
            </div>
        </div>
      </div>

      <!-- Card Item: Media -->
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-emerald-100 transition-all duration-300" @click="view='media'; loadMedia()">
        <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 mb-5">
           <i class="fas fa-photo-video text-2xl"></i>
        </div>
        <div class="mt-2 flex items-end justify-between">
            <div>
              <h4 class="font-black text-slate-800 text-4xl leading-none tracking-tight">Gallery</h4>
              <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 block">Media Library</span>
            </div>
        </div>
      </div>

      <!-- Card Item: Theme -->
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-amber-100 transition-all duration-300" @click="view='themes'">
        <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-amber-500 mb-5">
           <i class="fas fa-paint-brush text-2xl"></i>
        </div>
        <div class="mt-2 flex items-end justify-between">
            <div>
              <h4 class="font-black text-slate-800 text-3xl leading-none tracking-tight">Theme</h4>
              <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 block">Customize Look</span>
            </div>
        </div>
      </div>
  </div>

  <!-- ANALYTICS ROW 1 -->
  <div class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">

     <!-- Traffic Statistics Chart -->
     <div class="xl:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-7" x-effect="
         if (typeof ApexCharts !== 'undefined' && posts) {
             const initChart = async () => {
                 let visitorData = [];
                 try {
                     const res = await fetch('/api/stats/history');
                     const data = await res.json();
                     visitorData = data.visitors || [];
                 } catch (e) {}

                 // Hitung statistik 6 bulan terakhir
                 const months = [];
                 const postCounts = [];
                 const pageCounts = [];
                 const userCounts = [];

                 for (let i = 5; i >= 0; i--) {
                     const d = new Date();
                     d.setMonth(d.getMonth() - i);
                     const monthStr = d.toLocaleString('id-ID', { month: 'short' });
                     months.push(monthStr);

                     const monthNum = d.getMonth();
                     const yearNum = d.getFullYear();
                     const yyyy_mm = \`\${yearNum}-\${String(monthNum + 1).padStart(2, '0')}\`;

                     const pCount = (posts || []).filter(p => {
                         const pd = new Date(p.created_at);
                         return pd.getMonth() === monthNum && pd.getFullYear() === yearNum;
                     }).length;

                     const pgCount = (pages || []).filter(p => {
                         const pd = new Date(p.created_at);
                         return pd.getMonth() === monthNum && pd.getFullYear() === yearNum;
                     }).length;

                     const uCount = visitorData.find(v => v.month === yyyy_mm)?.count || 0;

                     postCounts.push(pCount);
                     pageCounts.push(pgCount);
                     userCounts.push(uCount);
                 }

                 if (window._trafficChart) window._trafficChart.destroy();
                 const options = {
                     series: [
                         { name: 'Artikel', data: postCounts },
                         { name: 'Halaman', data: pageCounts },
                         { name: 'Real User', data: userCounts }
                     ],
                     chart: { type: 'area', height: 350, toolbar: { show: false }, fontFamily: 'inherit' },
                     colors: ['#0d9488', '#6366f1', '#f59e0b'],
                     fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
                     dataLabels: { enabled: false },
                     stroke: { curve: 'smooth', width: 2 },
                     xaxis: { categories: months, axisBorder: { show: false }, axisTicks: { show: false } },
                     yaxis: { show: true, min: 0, forceNiceScale: true },
                     grid: { borderColor: '#f8fafc', strokeDashArray: 4, yaxis: { lines: { show: true } } },
                     legend: { position: 'top', horizontalAlign: 'right' }
                 };
                 window._trafficChart = new ApexCharts($el.querySelector('#trafficChart'), options);
                 window._trafficChart.render();
             };
             initChart();
         }
     ">
        <div class="flex justify-between items-center mb-6">
            <h4 class="text-lg font-black text-slate-800 flex items-center gap-3">
                <span class="bg-primary-light text-primary p-2 rounded-lg flex items-center justify-center"><i class="fas fa-chart-line"></i></span>
                Statistik Konten (6 Bulan Terakhir)
            </h4>
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
                            const res = await fetch('/api/stats/realtime');
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

         <!-- System Status -->
         <div class="rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-7 flex-grow">
            <h4 class="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                <span class="bg-indigo-50 text-indigo-500 p-2 rounded-lg flex items-center justify-center"><i class="fas fa-server"></i></span>
                System Status
            </h4>
            <div class="overflow-hidden rounded-xl border border-slate-100">
                <table class="w-full text-sm text-slate-600 text-left">
                   <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td class="py-3 px-4 font-semibold">Database</td>
                      <td class="py-3 px-4 text-right"><span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold">Connected (D1)</span></td>
                   </tr>
                   <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td class="py-3 px-4 font-semibold">Storage (R2)</td>
                      <td class="py-3 px-4 text-right"><span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold">Connected</span></td>
                   </tr>
                   <tr class="hover:bg-slate-50 transition-colors">
                      <td class="py-3 px-4 font-semibold">Version</td>
                      <td class="py-3 px-4 text-right font-bold text-slate-800">LabMu v1.0.0</td>
                   </tr>
                </table>
            </div>
         </div>
     </div>
  </div>

  <!-- ANALYTICS ROW 2 -->
  <div class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">

     <!-- Top 10 Popular Posts -->
     <div class="xl:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-7">
        <h4 class="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
            <span class="bg-rose-50 text-rose-500 p-2 rounded-lg flex items-center justify-center"><i class="fas fa-file-alt"></i></span>
            Artikel Terbaru
        </h4>
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

     <!-- Quick Actions -->
     <div class="xl:col-span-1 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-7">
        <h4 class="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
            <span class="bg-amber-50 text-amber-500 p-2 rounded-lg flex items-center justify-center"><i class="fas fa-bolt"></i></span>
            Quick Actions
        </h4>
        <div class="flex flex-col gap-4">
            <button @click="openEditor()" class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary p-4 font-bold text-white hover:bg-primary-hover focus:ring-4 focus:ring-primary-light transition-all shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5">
                <i class="fas fa-plus"></i> Tulis Artikel Baru
            </button>
            <a href="/" target="_blank" class="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 p-4 font-bold text-white hover:bg-slate-900 focus:ring-4 focus:ring-slate-200 transition-all shadow-md shadow-slate-800/20 hover:shadow-lg hover:shadow-slate-800/30 hover:-translate-y-0.5">
                <i class="fas fa-external-link-alt"></i> Lihat Website
            </a>
        </div>
     </div>

  </div>
</div>
`;