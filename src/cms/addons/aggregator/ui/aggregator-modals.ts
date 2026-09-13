export const aggregatorModals = `
    <!-- Add Source Modal -->
    <div x-show="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto" x-cloak>
        <div class="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 my-8" @click.outside="showAddModal = false">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <i class="fas fa-plus-circle text-primary"></i>
                    Tambah Sumber Media Baru
                </h3>
                <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Nama Media</label>
                    <input type="text" x-model="newSource.name" placeholder="Misal: PWMU.CO" class="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Base URL Portal</label>
                        <input type="text" x-model="newSource.baseUrl" @input="onBaseUrlChange('new')" placeholder="https://pwmu.co" class="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Metode / Tipe</label>
                        <select x-model="newSource.feedType" @change="onBaseUrlChange('new')" class="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="wp_api">WordPress REST API (Rekomendasi)</option>
                            <option value="rss">RSS / XML Feed</option>
                            <option value="html_scraper">Web HTML Scraper (Portal Mandiri/Non-WP)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <div class="flex items-center justify-between mb-1">
                        <label class="block text-xs font-bold text-slate-600 uppercase">Endpoint Feed / API URL</label>
                        <button type="button" @click="testFeed('new')" :disabled="isTestingFeed" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all cursor-pointer disabled:opacity-50">
                            <i class="fas" :class="isTestingFeed ? 'fa-spinner fa-spin' : 'fa-vial'"></i>
                            <span x-text="isTestingFeed ? 'Menguji...' : 'Tes Sync'"></span>
                        </button>
                    </div>
                    <input type="text" x-model="newSource.feedUrl" placeholder="https://pwmu.co/wp-json/wp/v2/posts?per_page=10&_embed" class="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary">
                    <p class="text-[11px] text-slate-400 mt-1">Otomatis diisi berdasarkan Base URL & Tipe, atau tentukan secara kustom.</p>

                    <!-- Feedback Hasil Tes Sync -->
                    <template x-if="testFeedResult">
                        <div class="mt-2.5 p-3 rounded-xl border text-xs leading-relaxed"
                             :class="testFeedResult.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'">
                            <div class="flex items-start gap-2">
                                <i class="fas mt-0.5 shrink-0" :class="testFeedResult.type === 'success' ? 'fa-check-circle text-emerald-600' : 'fa-times-circle text-rose-600'"></i>
                                <div class="flex-1 min-w-0">
                                    <div class="font-bold" x-text="testFeedResult.text"></div>
                                    <template x-if="testFeedResult.sampleTitle">
                                        <div class="mt-1 text-[11px] opacity-90 truncate">
                                            <strong>Sampel Berita:</strong> <span x-text="testFeedResult.sampleTitle"></span>
                                        </div>
                                    </template>
                                </div>
                                <button type="button" @click="testFeedResult = null" class="opacity-60 hover:opacity-100 cursor-pointer">
                                    <i class="fas fa-times text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </template>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Kode Wilayah</label>
                        <input type="text" x-model="newSource.regionCode" placeholder="Misal: PWM-JATIM" class="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Skor Kepercayaan (%)</label>
                        <input type="number" min="1" max="100" x-model="newSource.trustScore" class="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
                            <i class="fas fa-layer-group text-primary"></i>
                            Kategori Website
                        </label>
                        <select x-model="newSource.websiteCategory" class="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="PTMA">PTMA (Perguruan Tinggi)</option>
                            <option value="Dikdasmen">Pendidikan (Dikdasmen / Sekolah)</option>
                            <option value="Kesehatan">Kesehatan (MPKU / RS PKU)</option>
                            <option value="Berita">Portal Berita (PWM / PDM / Persma)</option>
                            <option value="Ortom">Warta Ortom & Lembaga</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
                            <i class="fas fa-folder text-amber-500"></i>
                            Kategori Default Artikel
                        </label>
                        <div class="relative">
                            <input type="text" x-model="newSource.defaultCategory" list="category-suggestions" placeholder="Berita Daerah" class="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                            <datalist id="category-suggestions">
                                <option value="PTMA">
                                <option value="Kesehatan (MPKU)">
                                <option value="Pendidikan (Dikdasmen / Sekolah)">
                                <option value="Berita Daerah">
                                <option value="Warta Persyarikatan">
                                <option value="Opini & Berita">
                            </datalist>
                        </div>
                    </div>
                </div>

                <!-- Auto Sync & Durasi Kustom Settings -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                            <i class="fas fa-magic text-primary"></i>
                            Auto Sync Otomatis
                        </label>
                        <label class="relative inline-flex items-center cursor-pointer mt-1">
                            <input type="checkbox" x-model="newSource.autoSync" class="sr-only peer">
                            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            <span class="ml-2 text-xs font-bold text-slate-700" x-text="newSource.autoSync ? 'Aktif' : 'Nonaktif'"></span>
                        </label>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                            <i class="far fa-clock text-primary"></i>
                            Interval Durasi
                        </label>
                        <div class="relative">
                            <input type="number" min="5" max="1440" x-model.number="newSource.syncInterval" class="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary" placeholder="15">
                            <span class="absolute right-3 top-2 text-xs text-slate-400 font-bold">Menit</span>
                        </div>
                        <span class="text-[10px] text-slate-400 mt-0.5 block">Default: 15 menit</span>
                    </div>
                </div>

                <!-- Bypass Kurasi (Direct Auto-Publish) Switch -->
                <div class="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <label class="block text-xs font-bold text-indigo-950 uppercase mb-1 flex items-center gap-1.5">
                                <i class="fas fa-bolt text-indigo-600"></i>
                                Langsung Terbitkan (Tanpa Ruang Kurasi)
                            </label>
                            <p class="text-[11px] text-indigo-800/80 leading-relaxed">
                                Jika diaktifkan, artikel dari sumber ini akan langsung diterbitkan ke portal berita resmi CMSMu tanpa melalui antrean Meja Kurasi.
                            </p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                            <input type="checkbox" x-model="newSource.autoPublish" class="sr-only peer">
                            <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button @click="showAddModal = false" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Batal</button>
                <button @click="addSource()" class="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm cursor-pointer">Simpan Sumber</button>
            </div>
        </div>
    </div>

    <!-- Edit Source Modal -->
    <div x-show="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto" x-cloak>
        <div class="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 my-8" @click.outside="showEditModal = false">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <i class="fas fa-edit text-amber-500"></i>
                    Edit Sumber Media
                </h3>
                <button @click="showEditModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Nama Media</label>
                    <input type="text" x-model="editingSource.name" class="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Base URL Portal</label>
                        <input type="text" x-model="editingSource.baseUrl" @input="onBaseUrlChange('edit')" class="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Metode / Tipe</label>
                        <select x-model="editingSource.feedType" @change="onBaseUrlChange('edit')" class="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="wp_api">WordPress REST API</option>
                            <option value="rss">RSS / XML Feed</option>
                            <option value="html_scraper">Web HTML Scraper (Portal Mandiri/Non-WP)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <div class="flex items-center justify-between mb-1">
                        <label class="block text-xs font-bold text-slate-600 uppercase">Endpoint Feed / API URL</label>
                        <button type="button" @click="testFeed('edit')" :disabled="isTestingFeed" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 transition-all cursor-pointer disabled:opacity-50">
                            <i class="fas" :class="isTestingFeed ? 'fa-spinner fa-spin' : 'fa-vial'"></i>
                            <span x-text="isTestingFeed ? 'Menguji...' : 'Tes Sync'"></span>
                        </button>
                    </div>
                    <input type="text" x-model="editingSource.feedUrl" class="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary">

                    <!-- Feedback Hasil Tes Sync (Edit) -->
                    <template x-if="testFeedResult">
                        <div class="mt-2.5 p-3 rounded-xl border text-xs leading-relaxed"
                             :class="testFeedResult.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'">
                            <div class="flex items-start gap-2">
                                <i class="fas mt-0.5 shrink-0" :class="testFeedResult.type === 'success' ? 'fa-check-circle text-emerald-600' : 'fa-times-circle text-rose-600'"></i>
                                <div class="flex-1 min-w-0">
                                    <div class="font-bold" x-text="testFeedResult.text"></div>
                                    <template x-if="testFeedResult.sampleTitle">
                                        <div class="mt-1 text-[11px] opacity-90 truncate">
                                            <strong>Sampel Berita:</strong> <span x-text="testFeedResult.sampleTitle"></span>
                                        </div>
                                    </template>
                                </div>
                                <button type="button" @click="testFeedResult = null" class="opacity-60 hover:opacity-100 cursor-pointer">
                                    <i class="fas fa-times text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </template>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Kode Wilayah</label>
                        <input type="text" x-model="editingSource.regionCode" class="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Skor Kepercayaan (%)</label>
                        <input type="number" min="1" max="100" x-model="editingSource.trustScore" class="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
                            <i class="fas fa-layer-group text-amber-500"></i>
                            Kategori Website
                        </label>
                        <select x-model="editingSource.websiteCategory" class="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="PTMA">PTMA (Perguruan Tinggi)</option>
                            <option value="Dikdasmen">Pendidikan (Dikdasmen / Sekolah)</option>
                            <option value="Kesehatan">Kesehatan (MPKU / RS PKU)</option>
                            <option value="Berita">Portal Berita (PWM / PDM / Persma)</option>
                            <option value="Ortom">Warta Ortom & Lembaga</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
                            <i class="fas fa-folder text-amber-500"></i>
                            Kategori Default Artikel
                        </label>
                        <div class="relative">
                            <input type="text" x-model="editingSource.defaultCategory" list="category-suggestions" placeholder="Berita Daerah" class="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                        </div>
                    </div>
                </div>

                <!-- Auto Sync & Durasi Kustom Settings (Edit) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                            <i class="fas fa-magic text-primary"></i>
                            Auto Sync Otomatis
                        </label>
                        <label class="relative inline-flex items-center cursor-pointer mt-1">
                            <input type="checkbox" x-model="editingSource.autoSync" class="sr-only peer">
                            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            <span class="ml-2 text-xs font-bold text-slate-700" x-text="editingSource.autoSync ? 'Aktif' : 'Nonaktif'"></span>
                        </label>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                            <i class="far fa-clock text-primary"></i>
                            Interval Durasi
                        </label>
                        <div class="relative">
                            <input type="number" min="5" max="1440" x-model.number="editingSource.syncInterval" class="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary" placeholder="15">
                            <span class="absolute right-3 top-2 text-xs text-slate-400 font-bold">Menit</span>
                        </div>
                        <span class="text-[10px] text-slate-400 mt-0.5 block">Default: 15 menit</span>
                    </div>
                </div>

                <!-- Bypass Kurasi (Direct Auto-Publish) Switch (Edit) -->
                <div class="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <label class="block text-xs font-bold text-indigo-950 uppercase mb-1 flex items-center gap-1.5">
                                <i class="fas fa-bolt text-indigo-600"></i>
                                Langsung Terbitkan (Tanpa Ruang Kurasi)
                            </label>
                            <p class="text-[11px] text-indigo-800/80 leading-relaxed">
                                Jika diaktifkan, artikel dari sumber ini akan langsung diterbitkan ke portal berita resmi CMSMu tanpa melalui antrean Meja Kurasi.
                            </p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                            <input type="checkbox" x-model="editingSource.autoPublish" class="sr-only peer">
                            <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button @click="showEditModal = false" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Batal</button>
                <button @click="updateSource()" class="px-5 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm cursor-pointer">Perbarui Sumber</button>
            </div>
        </div>
    </div>
`;
