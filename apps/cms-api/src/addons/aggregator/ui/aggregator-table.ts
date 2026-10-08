export const aggregatorTable = `
    <!-- Sources Table Card -->
    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div x-show="isLoading" class="flex items-center justify-center py-12 text-slate-400">
            <i class="fas fa-spinner fa-spin text-2xl mr-3"></i> Memuat daftar sumber media...
        </div>

        <div x-show="!isLoading && sources.length === 0" class="flex flex-col items-center justify-center py-12 text-slate-400">
            <i class="fas fa-rss text-4xl mb-3 opacity-40"></i>
            <p class="text-sm font-medium">Belum ada sumber media yang terdaftar.</p>
        </div>

        <div x-show="!isLoading && sources.length > 0 && filteredSources.length === 0" class="flex flex-col items-center justify-center py-12 text-slate-400">
            <i class="fas fa-search text-3xl mb-3 opacity-40"></i>
            <p class="text-sm font-medium">Tidak ada sumber media yang cocok dengan filter pencarian.</p>
            <button @click="resetFilter()" class="mt-3 text-xs font-bold text-primary hover:underline cursor-pointer">
                Reset Filter Pencarian
            </button>
        </div>

        <div x-show="!isLoading && sources.length > 0">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse table-auto">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <th class="px-4 py-3 min-w-[200px]">Nama Media</th>
                            <th class="px-3 py-3 w-20">Tipe</th>
                            <th class="px-3 py-3 w-28">Wilayah</th>
                            <th class="px-3 py-3 min-w-[150px]">Kategori Default</th>
                            <th class="px-2 py-3 text-center w-24">Auto Sync</th>
                            <th class="px-2 py-3 text-center w-28">Bypass Kurasi</th>
                            <th class="px-2 py-3 text-center w-16">Skor</th>
                            <th class="px-3 py-3 w-32">Terakhir Ditarik</th>
                            <th class="px-3 py-3 text-center w-24">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
                        <template x-for="src in paginatedSources" :key="src.id">
                            <tr class="hover:bg-slate-50/80 transition-colors">
                                <!-- Favicon + Nama Media & Base URL -->
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-2.5">
                                        <div class="w-7 h-7 rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                                            <img :src="'https://www.google.com/s2/favicons?domain=' + (src.base_url ? src.base_url.replace(/^https?:\\/\\//, '').split('/')[0] : '') + '&sz=32'" 
                                                 :alt="src.name"
                                                 class="w-4 h-4 object-contain"
                                                 loading="lazy"
                                                 onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'%230d9488\\'><path d=\\'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm-2-2H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V7h8v2z\\'/></svg>';">
                                        </div>
                                        <div class="min-w-0">
                                            <div class="font-bold text-slate-900 leading-tight text-xs truncate max-w-[180px]" :title="src.name" x-text="src.name"></div>
                                            <a :href="src.base_url" target="_blank" class="text-[11px] text-primary hover:underline flex items-center gap-1 mt-0.5 truncate max-w-[180px]" :title="src.base_url">
                                                <span class="truncate" x-text="src.base_url.replace(/^https?:\\/\\//, '')"></span>
                                                <i class="fas fa-external-link-alt text-[8px] shrink-0"></i>
                                            </a>
                                        </div>
                                    </div>
                                </td>

                                <!-- Tipe Pengambilan -->
                                <td class="px-3 py-3 whitespace-nowrap">
                                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold"
                                          :class="(src.feed_type === 'wp_api' || (src.feed_url && src.feed_url.includes('wp-json'))) ? 'bg-sky-100 text-sky-800' : ((src.feed_type === 'html_scraper' || (src.feed_url && src.feed_url.includes('/news'))) ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800')">
                                        <i class="fas" :class="(src.feed_type === 'wp_api' || (src.feed_url && src.feed_url.includes('wp-json'))) ? 'fa-globe text-sky-600' : ((src.feed_type === 'html_scraper' || (src.feed_url && src.feed_url.includes('/news'))) ? 'fa-spider text-purple-600' : 'fa-rss text-amber-600')"></i>
                                        <span x-text="(src.feed_type === 'wp_api' || (src.feed_url && src.feed_url.includes('wp-json'))) ? 'WP API' : ((src.feed_type === 'html_scraper' || (src.feed_url && src.feed_url.includes('/news'))) ? 'Scraper' : 'RSS')"></span>
                                    </span>
                                </td>

                                <!-- Wilayah / Afiliasi -->
                                <td class="px-3 py-3 whitespace-nowrap">
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200" x-text="src.region_code || 'Umum'"></span>
                                </td>

                                <!-- Kategori Default -->
                                <td class="px-3 py-3 whitespace-nowrap">
                                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold"
                                          :class="{
                                              'bg-rose-50 text-rose-700 border border-rose-200': (src.default_category || '').includes('Kesehatan'),
                                              'bg-blue-50 text-blue-700 border border-blue-200': src.default_category === 'PTMA',
                                              'bg-amber-50 text-amber-700 border border-amber-200': (src.default_category || '').includes('Pendidikan'),
                                              'bg-indigo-50 text-indigo-700 border border-indigo-200': src.default_category === 'Warta Persyarikatan',
                                              'bg-teal-50 text-teal-700 border border-teal-200': src.default_category === 'Berita Daerah',
                                              'bg-purple-50 text-purple-700 border border-purple-200': src.default_category === 'Opini & Berita'
                                          }"
                                          x-text="src.default_category || 'Berita Daerah'">
                                    </span>
                                </td>

                                <!-- Auto Sync On/Off & Durasi -->
                                <td class="px-2 py-3 text-center whitespace-nowrap">
                                    <button @click="toggleAutoSync(src)" 
                                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                                            :class="src.auto_sync ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'"
                                            :title="'Klik untuk ' + (src.auto_sync ? 'menonaktifkan' : 'mengaktifkan') + ' Auto Sync'">
                                        <span class="w-1.5 h-1.5 rounded-full" :class="src.auto_sync ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
                                        <span x-text="src.auto_sync ? ((src.sync_interval || 15) + 'm') : 'Off'"></span>
                                    </button>
                                </td>

                                <!-- Direct Auto-Publish (Bypass Kurasi) On/Off -->
                                <td class="px-2 py-3 text-center whitespace-nowrap">
                                    <button @click="toggleAutoPublish(src)" 
                                            class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                                            :class="src.auto_publish ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'"
                                            :title="'Klik untuk ' + (src.auto_publish ? 'menonaktifkan' : 'mengaktifkan') + ' Direct Publish'">
                                        <i class="fas" :class="src.auto_publish ? 'fa-bolt text-indigo-500' : 'fa-filter text-slate-400'"></i>
                                        <span x-text="src.auto_publish ? 'Langsung' : 'Kurasi'"></span>
                                    </button>
                                </td>

                                <!-- Skor Kepercayaan -->
                                <td class="px-2 py-3 text-center whitespace-nowrap">
                                    <span class="font-bold text-xs text-slate-800" x-text="src.trust_score + '%'"></span>
                                </td>

                                <!-- Terakhir Ditarik -->
                                <td class="px-3 py-3 text-[11px] text-slate-500 whitespace-nowrap" x-text="src.last_fetched_at ? new Date(src.last_fetched_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit', day:'numeric', month:'short'}) : 'Belum'"></td>

                                <!-- Aksi (Manual Sync, Edit, Delete) -->
                                <td class="px-3 py-3 text-center whitespace-nowrap">
                                    <div class="inline-flex items-center gap-1 justify-center">
                                        <!-- Manual Sync Single Source -->
                                        <button @click="syncSingleSource(src)" :disabled="src._isSyncing" class="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" :title="'Tarik Berita dari ' + src.name">
                                            <i class="fas" :class="src._isSyncing ? 'fa-spinner fa-spin text-emerald-600' : 'fa-cloud-download-alt text-xs'"></i>
                                        </button>

                                        <!-- Edit Icon -->
                                        <button @click="openEditModal(src)" class="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer" title="Edit Sumber Media">
                                            <i class="fas fa-edit text-xs"></i>
                                        </button>

                                        <!-- Delete Icon -->
                                        <button @click="deleteSource(src.id, src.name)" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Hapus Sumber">
                                            <i class="far fa-trash-alt text-xs"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>

            <!-- Pagination Bar -->
            <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="text-xs text-slate-500 font-medium">
                    Menampilkan <span class="font-bold text-slate-800" x-text="filteredSources.length === 0 ? 0 : (currentPage - 1) * perPage + 1"></span> - <span class="font-bold text-slate-800" x-text="Math.min(currentPage * perPage, filteredSources.length)"></span> dari <span class="font-bold text-slate-800" x-text="filteredSources.length"></span> sumber media
                </div>
                
                <div class="flex items-center gap-1">
                    <button @click="prevPage()" :disabled="currentPage === 1" class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm cursor-pointer">
                        <i class="fas fa-chevron-left mr-1"></i> Prev
                    </button>
                    
                    <template x-for="p in totalPages" :key="p">
                        <button @click="goToPage(p)" 
                                :class="currentPage === p ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
                                class="w-8 h-8 rounded-lg border text-xs font-bold transition-all cursor-pointer" 
                                x-text="p">
                        </button>
                    </template>
                    
                    <button @click="nextPage()" :disabled="currentPage === totalPages" class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm cursor-pointer">
                        Next <i class="fas fa-chevron-right ml-1"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
`;
