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
     <div class="xl:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-7" x-init="
         setTimeout(() => {
             if(typeof ApexCharts !== 'undefined') {
                 const options = {
                     series: [{ name: 'Kunjungan', data: [120, 150, 130, 210, 180, 290, 310] },
                              { name: 'Pengunjung Unik', data: [80, 95, 85, 140, 120, 190, 210] }],
                     chart: { type: 'area', height: 350, toolbar: { show: false }, fontFamily: 'inherit' },
                     colors: ['#0d9488', '#6366f1'],
                     fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
                     dataLabels: { enabled: false },
                     stroke: { curve: 'smooth', width: 2 },
                     xaxis: { categories: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'], axisBorder: { show: false }, axisTicks: { show: false } },
                     yaxis: { show: true },
                     grid: { borderColor: '#f8fafc', strokeDashArray: 4, yaxis: { lines: { show: true } } },
                     legend: { position: 'top', horizontalAlign: 'right' }
                 };
                 const chart = new ApexCharts($el.querySelector('#trafficChart'), options);
                 chart.render();
             }
         }, 500);
     ">
        <div class="flex justify-between items-center mb-6">
            <h4 class="text-lg font-black text-slate-800 flex items-center gap-3">
                <span class="bg-primary-light text-primary p-2 rounded-lg flex items-center justify-center"><i class="fas fa-chart-line"></i></span>
                Statistik Trafik (7 Hari Terakhir)
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
                <span x-data="{ count: 124 }" x-init="setInterval(() => { count = count + Math.floor(Math.random() * 5) - 2; if(count < 10) count = 10; }, 3000)" x-text="count">124</span>
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
                      <td class="py-3 px-4 font-semibold">Storage</td>
                      <td class="py-3 px-4 text-right"><span class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[11px] font-bold">Disabled</span></td>
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
            <span class="bg-rose-50 text-rose-500 p-2 rounded-lg flex items-center justify-center"><i class="fas fa-fire"></i></span>
            10 Kunjungan Populer
        </h4>
        <div class="overflow-x-auto no-scrollbar">
            <table class="w-full text-sm text-slate-600 text-left">
               <thead class="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                     <th class="py-4 px-5 font-bold rounded-tl-xl">Judul Artikel</th>
                     <th class="py-4 px-5 font-bold">Kategori</th>
                     <th class="py-4 px-5 font-bold text-right">Views</th>
                     <th class="py-4 px-5 font-bold text-center rounded-tr-xl">Trend</th>
                  </tr>
               </thead>
               <tbody>
                  <template x-data="{ 
                      topPosts: [
                          { title: 'Cara Mengelola CMSMu dengan Baik', cat: 'Tutorial', views: '12,450', up: true },
                          { title: 'Pembaruan Fitur Terbaru V1.0.0', cat: 'News', views: '9,230', up: true },
                          { title: 'Tips Menulis Artikel SEO Friendly', cat: 'Tips', views: '8,110', up: false },
                          { title: 'Integrasi SSO Muhammadiyah', cat: 'Tech', views: '6,905', up: true },
                          { title: 'Panduan Mengganti Tema', cat: 'Tutorial', views: '5,420', up: true },
                          { title: 'Keunggulan Hono.js di Backend', cat: 'Tech', views: '4,100', up: false },
                          { title: 'Mengenal Alpine.js lebih dalam', cat: 'Tech', views: '3,890', up: true },
                          { title: 'Cara Mengatur Menu Navigasi', cat: 'Tutorial', views: '2,450', up: true },
                          { title: 'Mengamankan Database D1', cat: 'Security', views: '1,900', up: false },
                          { title: 'Galeri Kegiatan Bulan Ini', cat: 'Event', views: '1,200', up: true }
                      ]
                  }" x-for="(post, index) in topPosts" :key="index">
                      <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                          <td class="py-3 px-5 font-semibold text-slate-800" x-text="post.title"></td>
                          <td class="py-3 px-5">
                              <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap" x-text="post.cat"></span>
                          </td>
                          <td class="py-3 px-5 text-right font-bold text-slate-800" x-text="post.views"></td>
                          <td class="py-3 px-5 text-center">
                              <span :class="post.up ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'" class="inline-flex items-center justify-center p-1.5 rounded-lg">
                                  <i :class="post.up ? 'fas fa-arrow-trend-up' : 'fas fa-arrow-trend-down'"></i>
                              </span>
                          </td>
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