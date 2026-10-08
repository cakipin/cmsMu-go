export const mediaPage = `
<div x-show="view === 'media'" class="animate-fade" 
     style="height: calc(100vh - 80px); display: flex; flex-direction: column; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);"
     x-init="loadMedia()">
    
    <!-- TOP TOOLBAR -->
    <div class="px-5 py-3.5 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
        <div class="flex items-center gap-4">
            <h2 class="text-sm font-bold text-slate-800 m-0 flex items-center gap-2">
                Media Library <span x-show="mediaList.length" x-text="'(' + mediaList.length + ')'" class="text-xs font-normal text-slate-400"></span>
            </h2>
            
            <div x-show="selectedItems.length > 0" class="flex items-center gap-2 animate-fade">
                <button @click="deleteSelected()" :disabled="isDeleting" class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5">
                    <i class="fas fa-trash text-xs"></i> Hapus (<span x-text="selectedItems.length"></span>)
                </button>
                <button @click="selectedItems = []; activeMediaItem = null;" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors border-0">
                    Batal
                </button>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <button @click="toggleSelectAll()" class="text-xs text-teal-600 hover:text-teal-700 font-medium hover:underline cursor-pointer bg-transparent border-0">
                <span x-text="selectedItems.length === filteredMedia.length && filteredMedia.length > 0 ? 'Batal Pilih Semua' : 'Pilih Semua'"></span>
            </button>

            <!-- Search Input -->
            <div class="relative">
                <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                <input type="text" x-model="mediaSearchQuery" placeholder="Cari berkas..." 
                       class="pl-7 pr-6 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-44 sm:w-52 transition-all text-slate-700">
                <button type="button" x-show="mediaSearchQuery" @click="mediaSearchQuery=''" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs border-0 bg-transparent cursor-pointer">&times;</button>
            </div>
            
            <!-- Upload Button Standar cmsMu -->
            <label class="bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer shadow-xs transition-all flex items-center gap-1.5">
                <input type="file" multiple @change="uploadMedia($event)" class="hidden">
                <i class="fas" :class="isUploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
                <span x-text="isUploading ? 'Mengunggah...' : 'Upload'"></span>
            </label>
        </div>
    </div>

    <!-- MAIN BODY -->
    <div class="flex flex-1 overflow-hidden h-full">
        
        <!-- GALLERY GRID -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50/70 relative">
            
            <!-- Grid Thumbnails Bebas Bug :style -->
            <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2.5 pb-12">
                <template x-for="m in filteredMedia" :key="m.id || m.key">
                    <div @click="toggleSelection(m)" 
                         class="group relative aspect-square bg-white rounded-lg overflow-hidden border cursor-pointer transition-all duration-150 shadow-xs"
                         :class="isSelected(m) ? 'border-teal-500 ring-2 ring-teal-500/30 shadow-md scale-95' : 'border-slate-200 hover:border-teal-400 hover:shadow-xs'">
                        
                        <div class="w-full h-full flex items-center justify-center bg-slate-100">
                            <img :src="m.url" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                 onerror="this.src='https://placehold.co/100?text=Error'">
                        </div>

                        <!-- Checkmark Indicator -->
                        <div x-show="isSelected(m)" 
                             class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[9px] shadow-sm ring-1 ring-white">
                            <i class="fas fa-check"></i>
                        </div>
                        
                        <!-- Safe Filename Overlay (No Screen Overflow) -->
                        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent text-white text-[9px] px-1.5 py-1 truncate pointer-events-none" 
                             x-text="m.key ? m.key.split('/').pop() : (m.title || '')"></div>
                    </div>
                </template>
            </div>

            <!-- Empty State -->
            <div x-show="filteredMedia.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-400">
                <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 text-lg mb-2">
                    <i class="fas fa-images"></i>
                </div>
                <p class="text-xs font-medium text-slate-500 m-0">Tidak ada media ditemukan</p>
            </div>
        </div>

        <!-- DETAIL PANEL (SIDEBAR KANAN) -->
        <div x-show="activeMediaItem" 
             class="w-72 bg-white border-l border-slate-100 flex flex-col shrink-0 h-full shadow-xs"
             x-transition:enter="animate-fade">
            
            <div class="px-4 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Detail Media</span>
                <button @click="activeMediaItem=null; selectedItems=[]" class="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center border-0 cursor-pointer transition-colors text-xs">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-4">
                <template x-if="activeMediaItem">
                    <div class="flex flex-col gap-3">
                        <div class="w-full aspect-video rounded-lg overflow-hidden bg-slate-50 border border-slate-100 p-2 flex items-center justify-center">
                            <img :src="activeMediaItem.url" class="max-w-full max-h-full object-contain">
                        </div>
                        
                        <div class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <div class="font-bold text-slate-800 break-all mb-1 text-[11px]" x-text="activeMediaItem.key.split('/').pop()"></div>
                            <div class="text-[10px] text-slate-400" x-text="Math.round(activeMediaItem.size/1024) + ' KB'"></div>
                        </div>

                        <div class="space-y-2.5 mt-1">
                            <div>
                                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Nama File</label>
                                <input type="text" x-model="activeMediaMeta.filename" class="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-700">
                            </div>

                            <div>
                                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Alt Text</label>
                                <input type="text" x-model="activeMediaMeta.alt" class="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-700">
                            </div>
                            
                            <div>
                                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Judul</label>
                                <input type="text" x-model="activeMediaMeta.title" class="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-700">
                            </div>

                            <div>
                                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Deskripsi</label>
                                <textarea x-model="activeMediaMeta.description" rows="2" class="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-700 resize-none"></textarea>
                            </div>
                        </div>

                        <button @click="saveMediaMeta()" class="bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white w-full py-2 px-4 rounded-lg text-xs font-medium shadow-sm transition-all flex items-center justify-center gap-1.5 border-0 cursor-pointer mt-2" :disabled="isSavingMeta">
                            <i class="fas" :class="isSavingMeta ? 'fa-spinner fa-spin' : 'fa-save'"></i> 
                            <span x-text="isSavingMeta ? 'Menyimpan...' : 'Simpan Perubahan'"></span>
                        </button>
                    </div>
                </template>
            </div>
        </div>

    </div>

    <!-- CROP MODAL -->
    <div x-show="isCropModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity">
        <div @click.away="isCropModalOpen=false; destroyCropper(); uploadFile=null; uploadPreview=null;" class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row transform transition-all">
            <!-- Left Side: Image Canvas -->
            <div class="flex-1 bg-slate-100 relative min-h-[300px] flex items-center justify-center p-4">
                <img x-ref="libraryCropperImage" :src="uploadPreview" class="max-w-full max-h-full block">
                <button @click="isCropModalOpen=false; destroyCropper(); uploadFile=null; uploadPreview=null;" class="absolute top-4 left-4 bg-white/80 hover:bg-white text-slate-700 w-8 h-8 rounded-full flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors border-0 cursor-pointer md:hidden">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <!-- Right Side: Controls -->
            <div class="w-full md:w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
                <div class="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 class="text-sm font-bold text-slate-800 m-0">Edit Gambar</h3>
                    <button @click="isCropModalOpen=false; destroyCropper(); uploadFile=null; uploadPreview=null;" class="text-slate-400 hover:text-slate-600 transition-colors hidden md:block">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </div>
                
                <div class="p-4 flex-1 overflow-y-auto">
                    <div class="text-xs font-semibold text-slate-500 mb-2">Aspek Rasio</div>
                    <div class="flex flex-wrap gap-2 mb-4">
                        <button type="button" @click="setCropRatio(16/9)" :class="cropRatio === 16/9 ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'" class="px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer">16:9 (Cover)</button>
                        <button type="button" @click="setCropRatio(4/3)" :class="cropRatio === 4/3 ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'" class="px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer">4:3</button>
                        <button type="button" @click="setCropRatio(1)" :class="cropRatio === 1 ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'" class="px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer">1:1 (Square)</button>
                        <button type="button" @click="setCropRatio(NaN)" :class="isNaN(cropRatio) ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'" class="px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer">Bebas</button>
                    </div>
                    
                    <div class="text-xs font-semibold text-slate-500 mb-2">Rotasi & Balik</div>
                    <div class="flex flex-wrap gap-2 mb-4">
                        <button type="button" @click="rotateCropper(-90)" class="px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium hover:bg-slate-100 transition-colors cursor-pointer"><i class="fas fa-undo"></i> -90°</button>
                        <button type="button" @click="rotateCropper(90)" class="px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium hover:bg-slate-100 transition-colors cursor-pointer"><i class="fas fa-redo"></i> +90°</button>
                        <button type="button" @click="flipCropper()" class="px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium hover:bg-slate-100 transition-colors cursor-pointer"><i class="fas fa-arrows-alt-h"></i> Flip X</button>
                        <button type="button" @click="resetCropper()" class="px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium hover:bg-slate-100 transition-colors cursor-pointer ml-auto"><i class="fas fa-sync-alt"></i> Reset</button>
                    </div>
                </div>
                
                <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                    <button type="button" @click="processSingleUpload(true)" class="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border-0">
                        <i class="fas fa-crop-alt"></i> Potong & Upload
                    </button>
                    <button type="button" @click="processSingleUpload(false)" class="w-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fas fa-cloud-upload-alt"></i> Upload Asli Saja
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
`;
