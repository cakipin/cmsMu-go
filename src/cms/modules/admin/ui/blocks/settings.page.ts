export const settingsPage = `
<div x-show="view === 'settings'" class="animate-fade" style="padding-bottom:80px; position:relative;" x-data="settingsPageData()">

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="margin:0; font-size:22px; font-weight:700; color:#1f2937;">Pengaturan Umum</h2>
        <button @click="saveSettings()" :disabled="isSaving" 
                class="bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer border-0 shrink-0">
            <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
            <span x-text="isSaving ? 'Menyimpan...' : 'Simpan Perubahan'">Simpan Perubahan</span>
        </button>
    </div>

    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:25px;">
        
        <div style="background:white; padding:25px; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
            <h4 style="margin-top:0; margin-bottom:20px; font-size:15px; font-weight:700; color:#1f2937;">Identitas Situs</h4>
            
            <div style="margin-bottom:15px;">
                <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#4b5563;">Judul Situs (Site Title)</label>
                <input type="text" x-model="settings.site_title" class="focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:8px; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:15px;">
                <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#4b5563;">Slogan / Deskripsi (Tagline)</label>
                <input type="text" x-model="settings.site_desc" class="focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:8px; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:15px;">
                <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#4b5563;">Email Administrator</label>
                <input type="email" x-model="settings.admin_email" class="focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:8px; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:15px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
                <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#4b5563;">Halaman Utama (Homepage)</label>
                <p style="font-size:12px; color:#6b7280; margin-bottom:10px;">Pilih halaman yang akan ditampilkan sebagai Beranda situs Anda.</p>
                <select x-model="settings.site_homepage_slug" class="focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none" style="width:100%; padding:10px; border:1px solid #d1d5db; border-radius:8px; box-sizing:border-box; background:white;">
                    <option value="home">Default (Sistem / home)</option>
                    <template x-for="p in pagesList" :key="p.id">
                        <option :value="p.slug" x-text="p.title + ' (/' + p.slug + ')'"></option>
                    </template>
                </select>
            </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:20px;">
            
            <div style="background:white; padding:20px; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
                <h4 style="margin-top:0; font-size:14px; font-weight:700; color:#1f2937;">Logo Situs</h4>
                <div style="background:#f9fafb; padding:15px; text-align:center; margin:10px 0; border:1px dashed #d1d5db; border-radius:8px; min-height:80px; display:flex; align-items:center; justify-content:center;">
                    <img x-show="settings.site_logo" :src="settings.site_logo" style="max-width:100%; max-height:80px; object-fit:contain;">
                    <span x-show="!settings.site_logo" style="color:#9ca3af; font-size:12px;">Belum Ada Logo</span>
                </div>
                <div style="display:flex; gap:8px;">
                    <button @click="openMediaSelector('logo')" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white border-0 py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5">
                        <i class="fas fa-image text-xs"></i>
                        <span>Pilih Logo</span>
                    </button>
                    <button @click="settings.site_logo = ''" class="bg-red-50 hover:bg-red-100 text-red-600 border-0 py-2 px-3 rounded-lg text-xs cursor-pointer transition-colors" title="Hapus Logo">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <input type="text" x-model="settings.site_logo" placeholder="https://..." style="width:100%; margin-top:10px; padding:6px 10px; font-size:11px; border:1px solid #e2e8f0; border-radius:6px; outline:none; box-sizing:border-box;">
            </div>

            <div style="background:white; padding:20px; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
                <h4 style="margin-top:0; font-size:14px; font-weight:700; color:#1f2937;">Favicon</h4>
                <div style="background:#f9fafb; padding:15px; text-align:center; margin:10px 0; border:1px dashed #d1d5db; border-radius:8px; min-height:60px; display:flex; align-items:center; justify-content:center;">
                    <img x-show="settings.site_favicon" :src="settings.site_favicon" style="width:32px; height:32px; object-fit:contain;">
                    <span x-show="!settings.site_favicon" style="color:#9ca3af; font-size:12px;">Belum Ada Icon</span>
                </div>
                <div style="display:flex; gap:8px;">
                    <button @click="openMediaSelector('favicon')" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white border-0 py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5">
                        <i class="fas fa-icons text-xs"></i>
                        <span>Pilih Favicon</span>
                    </button>
                    <button @click="settings.site_favicon = ''" class="bg-red-50 hover:bg-red-100 text-red-600 border-0 py-2 px-3 rounded-lg text-xs cursor-pointer transition-colors" title="Hapus Favicon">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <input type="text" x-model="settings.site_favicon" placeholder="https://..." style="width:100%; margin-top:10px; padding:6px 10px; font-size:11px; border:1px solid #e2e8f0; border-radius:6px; outline:none; box-sizing:border-box;">
            </div>

        </div>
    </div>

    <!-- POPUP MEDIA MANAGER STANDAR CMSMU -->
    <div x-show="mediaModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex justify-center items-center p-3 sm:p-6" x-cloak>
        <div class="bg-white w-full max-w-4xl h-[85vh] min-h-[480px] rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-200/80">
            
            <!-- MODAL HEADER -->
            <div class="px-4 py-3 border-b border-slate-100 flex flex-wrap sm:flex-nowrap justify-between items-center bg-slate-50/50 gap-2 shrink-0">
                <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold shrink-0">
                        <i class="fas fa-photo-video text-sm"></i>
                    </div>
                    <div class="min-w-0">
                        <h3 class="m-0 text-sm font-bold text-slate-800 leading-tight truncate">Media Manager</h3>
                        <p class="m-0 text-[11px] text-slate-400 truncate" x-text="mediaTarget === 'logo' ? 'Pilih atau unggah Logo Situs' : 'Pilih atau unggah Favicon Situs'"></p>
                    </div>
                </div>

                <!-- TABS & SEARCH & CLOSE -->
                <div class="flex items-center gap-2 ml-auto">
                    <!-- Search Bar (Aktif di Library) -->
                    <div x-show="mediaTab === 'library'" class="relative hidden sm:block">
                        <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                        <input type="text" x-model="mediaSearchQuery" @input="mediaDisplayLimit = mediaPageSize" placeholder="Cari media..." 
                               class="pl-7 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-32 sm:w-44 transition-all text-slate-700">
                        <button type="button" x-show="mediaSearchQuery" @click="mediaSearchQuery=''; mediaDisplayLimit = mediaPageSize;" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs border-0 bg-transparent cursor-pointer">&times;</button>
                    </div>

                    <!-- Segmented Tabs Standar cmsMu -->
                    <div class="flex gap-1 bg-slate-200/70 p-1 rounded-lg">
                        <button @click="mediaTab='library'" 
                                :class="mediaTab==='library' ? 'bg-white text-teal-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900 font-normal'" 
                                class="border-0 py-1 px-2.5 rounded-md text-xs cursor-pointer transition-all flex items-center gap-1">
                            <i class="fas fa-th-large text-[11px]"></i> <span>Galeri</span>
                        </button>
                        <button @click="mediaTab='upload'" 
                                :class="mediaTab==='upload' ? 'bg-white text-teal-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900 font-normal'" 
                                class="border-0 py-1 px-2.5 rounded-md text-xs cursor-pointer transition-all flex items-center gap-1">
                            <i class="fas fa-cloud-upload-alt text-[11px]"></i> <span>Unggah</span>
                        </button>
                    </div>

                    <!-- Close Button -->
                    <button @click="mediaModalOpen=false" class="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center border-0 cursor-pointer transition-colors text-sm shrink-0" title="Tutup">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- MODAL BODY -->
            <div class="flex-1 min-h-0 overflow-hidden flex flex-col md:flex-row">
                
                <!-- AREA GALERI & UPLOAD -->
                <div id="media-scroll-container" class="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 bg-slate-50/70" @scroll.passive="handleMediaScroll($event)">
                    
                    <!-- TAB 1: GALERI LIBRARY -->
                    <div x-show="mediaTab === 'library'">
                        <!-- Mobile Search Bar -->
                        <div class="block sm:hidden mb-3 relative">
                            <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                            <input type="text" x-model="mediaSearchQuery" @input="mediaDisplayLimit = mediaPageSize" placeholder="Cari media..." 
                                   class="w-full pl-7 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-700 box-border">
                        </div>

                        <!-- Loading Spinner -->
                        <div x-show="isLoadingMedia" class="flex flex-col items-center justify-center py-20 text-slate-400">
                            <i class="fas fa-circle-notch fa-spin text-2xl text-teal-600 mb-2"></i>
                            <span class="text-xs font-medium">Memuat pustaka media...</span>
                        </div>

                        <!-- Grid Thumbnails Kompak (12 Berkas per batch + auto-load on scroll) -->
                        <div x-show="!isLoadingMedia && filteredMediaList.length > 0">
                            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                                <template x-for="(img, idx) in displayedMediaList" :key="img.id || (img.url + '_' + idx)">
                                    <div @click="selectMediaItem(img)" 
                                         class="group relative aspect-square bg-white rounded-lg overflow-hidden border cursor-pointer transition-all duration-150 shadow-xs" 
                                         :class="selectedMedia?.url === img.url ? 'border-teal-500 ring-2 ring-teal-500/30 shadow-md' : 'border-slate-200 hover:border-teal-400 hover:shadow-sm hover:scale-[1.02]'"
                                         :title="img.title || 'Gambar Media'">
                                        
                                        <img :src="img.url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 bg-slate-100" loading="lazy">
                                        
                                        <!-- Checkmark Badge -->
                                        <div x-show="selectedMedia?.url === img.url" 
                                             class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[9px] shadow-sm ring-1 ring-white">
                                            <i class="fas fa-check"></i>
                                        </div>

                                        <!-- Name overlay on hover -->
                                        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent p-1 text-[9px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity" x-text="img.title"></div>
                                    </div>
                                </template>
                            </div>

                            <!-- Infinite scroll indicator & Manual fallback -->
                            <div id="media-sentinel" class="py-5 text-center" x-show="hasMoreMedia">
                                <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
                                    <div class="text-xs text-slate-500 flex items-center gap-2">
                                        <i class="fas fa-circle-notch fa-spin text-teal-600 text-sm"></i>
                                        <span class="font-medium">Memuat gambar (<span x-text="displayedMediaList.length"></span> dari <span x-text="filteredMediaList.length"></span>)...</span>
                                    </div>
                                    <button type="button" @click="loadMoreMedia()" class="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded-lg border border-teal-200 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5">
                                        <i class="fas fa-plus text-[10px]"></i>
                                        <span>Muat 12 Gambar Lagi</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div x-show="!isLoadingMedia && filteredMediaList.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400">
                            <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 text-2xl mb-3">
                                <i class="fas fa-images"></i>
                            </div>
                            <p class="text-xs font-semibold text-slate-600 m-0">Belum ada media di pustaka</p>
                            <p class="text-[11px] text-slate-400 m-0 mt-1" x-text="mediaSearchQuery ? 'Tidak ada hasil untuk pencarian tersebut.' : 'Unggah gambar baru untuk logo atau favicon Anda.'"></p>
                            <button x-show="!mediaSearchQuery" @click="mediaTab = 'upload'" class="mt-4 inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium py-1.5 px-3.5 rounded-lg border-0 cursor-pointer shadow-xs transition-colors">
                                <i class="fas fa-cloud-upload-alt text-xs"></i>
                                <span>Unggah Sekarang</span>
                            </button>
                        </div>
                    </div>

                    <!-- TAB 2: UPLOAD DROPZONE -->
                    <div x-show="mediaTab === 'upload'" class="h-full flex items-center justify-center p-4">
                        <div class="bg-white p-6 sm:p-8 rounded-2xl border-2 border-dashed border-teal-200 hover:border-teal-400 transition-colors w-full max-w-md text-center shadow-xs">
                            <div class="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 text-2xl">
                                <i class="fas fa-cloud-upload-alt"></i>
                            </div>
                            <h4 class="text-sm font-bold text-slate-800 mb-1" x-text="mediaTarget === 'logo' ? 'Unggah Logo Baru' : 'Unggah Favicon Baru'">Unggah Media Baru</h4>
                            <p class="text-[11px] text-slate-400 mb-4">Mendukung format PNG, JPG, WEBP, SVG, atau ICO</p>

                            <label class="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors mb-3">
                                <i class="fas fa-folder-open text-xs"></i>
                                <span>Pilih Berkas dari Komputer</span>
                                <input type="file" @change="onFileSelect" class="hidden" accept="image/*,.ico">
                            </label>

                            <div x-show="uploadPreview" class="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-100 inline-block">
                                <img :src="uploadPreview" class="max-h-36 max-w-full rounded-lg object-contain mx-auto">
                                <p class="text-[11px] text-slate-500 mt-1 truncate max-w-[200px]" x-text="uploadFile?.name"></p>
                            </div>

                            <div class="mt-4">
                                <button @click="uploadMediaAction()" :disabled="!uploadFile || isUploading" 
                                        class="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium py-2 px-5 rounded-lg shadow-sm transition-all border-0 cursor-pointer inline-flex items-center gap-1.5">
                                    <i class="fas" :class="isUploading ? 'fa-circle-notch fa-spin' : 'fa-upload'"></i>
                                    <span x-text="isUploading ? 'Mengunggah...' : 'Unggah & Terapkan'"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DETAIL SIDEBAR (PANEL KANAN) -->
                <div class="w-full md:w-64 bg-white border-t md:border-t-0 md:border-l border-slate-100 p-4 flex flex-col shrink-0" x-show="mediaTab === 'library' && selectedMedia">
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Informasi Berkas</h4>
                    
                    <div class="w-full aspect-video rounded-lg overflow-hidden bg-slate-50 border border-slate-100 p-2 flex items-center justify-center mb-3">
                        <img :src="selectedMedia?.url" class="max-w-full max-h-full object-contain">
                    </div>

                    <div class="space-y-2.5 text-xs flex-1">
                        <div>
                            <span class="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Nama Berkas</span>
                            <span class="text-slate-700 font-medium text-xs break-all" x-text="selectedMedia?.title || 'Tanpa Judul'"></span>
                        </div>
                        <div>
                            <span class="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Tautan URL</span>
                            <input type="text" readonly :value="selectedMedia?.url" class="w-full p-1.5 text-[11px] rounded bg-slate-50 border border-slate-200 text-slate-600 mt-1 outline-none" @click="$el.select()">
                        </div>
                    </div>

                    <button @click="confirmMediaSelection()" 
                            class="w-full bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white border-0 py-2.5 px-4 rounded-lg text-xs font-medium shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-4">
                        <i class="fas fa-check text-xs"></i>
                        <span>Pilih & Gunakan</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
`;