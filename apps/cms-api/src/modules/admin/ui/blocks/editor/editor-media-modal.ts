export const editorMediaModal = `
    <!-- MODAL SELECTOR MEDIA / GAMBAR -->
    <template x-teleport="body">
    <div x-show="mediaModalOpen" 
         style="position:fixed; inset:0; top:0; left:0; right:0; bottom:0; width:100vw; height:100vh; background:rgba(0,0,0,0.6); backdrop-filter:blur(5px); z-index:999999; display:flex; justify-content:center; align-items:center; padding:20px; box-sizing:border-box;" 
         x-transition.opacity
         x-cloak>
        
        <div style="background:white; width:100%; max-width:1100px; height:85vh; border-radius:16px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin:auto;">
            
            <div style="padding:16px 24px; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; background:#fff;">
                <div style="display:flex; align-items:center; gap:24px;">
                    <h3 style="margin:0; font-size:18px; font-weight:700; color:#1f2937;">Media Manager</h3>
                    
                    <div style="display:flex; gap: 8px; background:#f3f4f6; padding:6px; border-radius:12px; width: fit-content;">
                        <button type="button" @click="mediaTab='library'" 
                                :style="mediaTab==='library' ? 'background:white; color:#2563eb; box-shadow:0 1px 2px rgba(0,0,0,0.1);' : 'color:#6b7280; background:transparent;'"
                                style="border:none; outline:none; padding:8px 20px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:600; transition:all 0.2s;">
                            Library
                        </button>
                        <button type="button" @click="mediaTab='upload'" 
                                :style="mediaTab==='upload' ? 'background:white; color:#2563eb; box-shadow:0 1px 2px rgba(0,0,0,0.1);' : 'color:#6b7280; background:transparent;'"
                                style="border:none; outline:none; padding:8px 20px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:600; transition:all 0.2s;">
                            Upload Baru
                        </button>
                    </div>
                </div>

                <button type="button" @click="mediaModalOpen=false" style="border:none; background:#f3f4f6; width:36px; height:36px; border-radius:50%; font-size:18px; cursor:pointer; color:#6b7280; display:flex; align-items:center; justify-content:center; transition:background 0.2s;" onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">&times;</button>
            </div>

            <div class="flex flex-col md:flex-row flex-1 overflow-hidden relative">
                
                <div class="flex-1 flex flex-col p-3 md:p-5 overflow-hidden bg-slate-50">
                    
                    <div x-show="mediaTab === 'library'" style="margin-bottom:15px; display:flex; gap:10px;">
                        <div style="position:relative; flex:1;">
                            <i class="fas fa-search" style="position:absolute; left:12px; top:12px; color:#9ca3af;"></i>
                            <input type="text" x-model="searchQuery" placeholder="Cari file berdasarkan nama / alt text..." class="input" style="width:100%; padding-left:36px; border-radius:8px; border:1px solid #d1d5db; box-sizing:border-box;">
                        </div>
                        <button type="button" @click="loadMediaLibrary()" style="padding:0 15px; background:white; border:1px solid #d1d5db; border-radius:8px; cursor:pointer; color:#4b5563;" title="Refresh Library">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>

                    <div x-show="mediaTab === 'library'" style="flex:1; overflow-y:auto; padding-right:5px;">
                        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:15px;">
                            <template x-for="img in filteredMediaList" :key="img.key || img.url || Math.random()">
                                <div @click="selectMediaItem(img)" 
                                     style="aspect-ratio:1; border-radius:10px; overflow:hidden; cursor:pointer; position:relative; background:#e5e7eb; border:3px solid transparent; transition:all 0.15s ease-in-out;"
                                     :style="selectedMedia && selectedMedia.url === img.url ? 'border-color:#2563eb; transform:scale(0.96); box-shadow:0 0 0 2px #93c5fd;' : ''"
                                     onmouseover="if(!this.style.borderColor.includes('rgb(37, 99, 235)')) this.style.borderColor='#cbd5e1'" 
                                     onmouseout="if(!this.style.borderColor.includes('rgb(37, 99, 235)')) this.style.borderColor='transparent'">
                                    
                                    <img :src="img.url" style="width:100%; height:100%; object-fit:cover; display:block;" loading="lazy">
                                    
                                    <div x-show="selectedMedia && selectedMedia.url === img.url" 
                                         style="position:absolute; top:6px; right:6px; background:#2563eb; color:white; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-size:11px; box-shadow:0 2px 4px rgba(0,0,0,0.2);">
                                        <i class="fas fa-check"></i>
                                    </div>

                                    <div style="position:absolute; bottom:0; left:0; right:0; background:linear-gradient(to top, rgba(0,0,0,0.7), transparent); padding:20px 8px 6px 8px;">
                                        <div x-text="img.title" style="color:white; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-shadow:0 1px 2px rgba(0,0,0,0.5);"></div>
                                    </div>
                                </div>
                            </template>
                        </div>

                        <div x-show="filteredMediaList.length===0" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#9ca3af; padding:40px;">
                            <div style="width:80px; height:80px; background:#e5e7eb; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
                                <i class="fas fa-search fa-2x" style="color:#9ca3af;"></i>
                            </div>
                            <p style="font-weight:600; margin-bottom:5px; color:#4b5563;">Tidak ada media ditemukan</p>
                            <p style="font-size:13px;">Coba kata kunci lain atau upload gambar baru.</p>
                        </div>
                    </div>

                    <div x-show="mediaTab === 'upload'" style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                        <div style="background:white; padding:40px; border-radius:16px; border:1px solid #e5e7eb; width:100%; max-width:400px; text-align:center; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05);">
                             <div x-show="!uploadPreview">
                                <label style="display:block; padding:40px 20px; border:2px dashed #d1d5db; border-radius:12px; cursor:pointer; transition:all 0.2s; background:#f9fafb;"
                                       onmouseover="this.style.borderColor='#2563eb'; this.style.background='#eff6ff'" 
                                       onmouseout="this.style.borderColor='#d1d5db'; this.style.background='#f9fafb'">
                                    <div style="width:60px; height:60px; background:white; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-bottom:15px; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                                        <i class="fas fa-cloud-upload-alt fa-2x" style="color:#2563eb;"></i>
                                    </div>
                                    <div style="font-weight:600; color:#374151; font-size:15px; margin-bottom:5px;">Klik untuk pilih file</div>
                                    <div style="color:#9ca3af; font-size:12px;">JPG, PNG, WEBP (Max 5MB)</div>
                                    <input type="file" @change="onFileSelect" style="display:none;" accept="image/*">
                                </label>
                            </div>
                            <div x-show="uploadPreview" class="w-full">
                                <div style="max-height: 350px; overflow: hidden; background: #f3f4f6; border-radius: 8px; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center;">
                                    <img x-ref="cropperImage" :src="uploadPreview" style="max-height:350px; max-width:100%; display:block;">
                                </div>
                                
                                <div class="mt-4 bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
                                    <div class="text-xs font-semibold text-slate-500 mb-2">Aspek Rasio</div>
                                    <div class="flex flex-wrap gap-2 mb-3">
                                        <button type="button" @click="setCropRatio(16/9)" :class="cropRatio === 16/9 ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'" class="px-3 py-1.5 rounded text-xs font-medium border transition-colors">16:9 (Cover)</button>
                                        <button type="button" @click="setCropRatio(4/3)" :class="cropRatio === 4/3 ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'" class="px-3 py-1.5 rounded text-xs font-medium border transition-colors">4:3</button>
                                        <button type="button" @click="setCropRatio(1)" :class="cropRatio === 1 ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'" class="px-3 py-1.5 rounded text-xs font-medium border transition-colors">1:1 (Square)</button>
                                        <button type="button" @click="setCropRatio(NaN)" :class="isNaN(cropRatio) ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'" class="px-3 py-1.5 rounded text-xs font-medium border transition-colors">Bebas</button>
                                    </div>
                                    <div class="text-xs font-semibold text-slate-500 mb-2">Rotasi & Reset</div>
                                    <div class="flex flex-wrap gap-2">
                                        <button type="button" @click="rotateCropper(-90)" class="px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium hover:bg-slate-100 transition-colors"><i class="fas fa-undo"></i> Putar Kiri</button>
                                        <button type="button" @click="rotateCropper(90)" class="px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium hover:bg-slate-100 transition-colors"><i class="fas fa-redo"></i> Putar Kanan</button>
                                        <button type="button" @click="flipCropper()" class="px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium hover:bg-slate-100 transition-colors"><i class="fas fa-arrows-alt-h"></i> Flip X</button>
                                        <button type="button" @click="resetCropper()" class="px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium hover:bg-slate-100 transition-colors ml-auto"><i class="fas fa-sync-alt"></i> Reset</button>
                                    </div>
                                </div>
                                <div class="mt-4 flex justify-center">
                                    <button type="button" @click="uploadFile=null;uploadPreview=null;if(cropperInstance)cropperInstance.destroy();cropperInstance=null;" style="background:white; border:1px solid #e5e7eb; padding:8px 16px; border-radius:6px; color:#ef4444; font-weight:600; cursor:pointer; font-size:13px;">Ganti File</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="w-full md:w-[320px] bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col shrink-0 max-h-[40vh] md:max-h-none overflow-y-auto z-10">
                    
                    <div x-show="mediaTab === 'library' && !selectedMedia" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:40px; color:#9ca3af;">
                        <div style="width:100px; height:100px; background:#f3f4f6; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:24px;">
                            <i class="fas fa-photo-video fa-3x" style="color:#d1d5db;"></i>
                        </div>
                        <h4 style="margin:0 0 8px 0; color:#374151; font-size:16px; font-weight:600;">Belum ada yang dipilih</h4>
                        <p style="font-size:13px; line-height:1.5; color:#6b7280;">Klik salah satu gambar di sebelah kiri<br>untuk melihat detailnya.</p>
                    </div>

                    <template x-if="selectedMedia && mediaTab === 'library'">
                        <div style="display:flex; flex-direction:column; height:100%;">
                            <div style="padding:16px 20px; border-bottom:1px solid #f3f4f6; background:white;">
                                <h4 style="margin:0; font-size:14px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px;">Detail File</h4>
                            </div>
                            <div style="flex:1; overflow-y:auto; padding:20px;">
                                <div style="background:#f9fafb; border-radius:8px; border:1px solid #e5e7eb; padding:10px; display:flex; align-items:center; justify-content:center; margin-bottom:20px; aspect-ratio:16/9; overflow:hidden;">
                                    <img :src="selectedMedia.url" style="max-width:100%; max-height:100%; object-fit:contain;">
                                </div>
                                <div style="display:grid; gap:16px;">
                                    <div>
                                        <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">Judul</label>
                                        <input x-model="mediaForm.title" class="input" style="width:100%; padding:8px 12px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; box-sizing:border-box;">
                                    </div>
                                    <div>
                                        <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">Alt Text (SEO)</label>
                                        <input x-model="mediaForm.alt" class="input" style="width:100%; padding:8px 12px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; box-sizing:border-box;">
                                    </div>
                                    <div>
                                        <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">Caption</label>
                                        <input x-model="mediaForm.caption" class="input" style="width:100%; padding:8px 12px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; box-sizing:border-box;">
                                    </div>
                                    <div>
                                        <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">Deskripsi</label>
                                        <textarea x-model="mediaForm.description" class="input" style="width:100%; padding:8px 12px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; min-height:80px; box-sizing:border-box; font-family:inherit;"></textarea>
                                    </div>
                                    <button type="button" @click="updateMediaDetails()" style="width:100%; background:white; border:1px solid #d1d5db; color:#4b5563; padding:8px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='white'">
                                        <i class="fas fa-save"></i> Simpan Info Meta
                                    </button>
                                </div>
                            </div>
                            <div style="padding:16px 20px; border-top:1px solid #e5e7eb; background:white;">
                                <button type="button" @click="confirmMediaSelection()" 
                                        style="width:100%; background:#2563eb; color:white; border:none; padding:12px; border-radius:8px; font-weight:600; font-size:14px; cursor:pointer; box-shadow:0 4px 6px -1px rgba(37,99,235,0.3); display:flex; justify-content:center; align-items:center; gap:8px; transition:all 0.2s;"
                                        onmouseover="this.style.backgroundColor='#1d4ed8'" 
                                        onmouseout="this.style.backgroundColor='#2563eb'">
                                    <span>Sisipkan Gambar</span>
                                    <i class="fas fa-arrow-right" style="font-size:12px;"></i>
                                </button>
                            </div>
                        </div>
                    </template>

                    <div x-show="mediaTab === 'upload'" style="flex:1; display:flex; flex-direction:column; padding:20px;">
                         <h4 style="margin:0 0 20px 0; font-size:14px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px;">Metadata Upload</h4>
                         <div style="flex:1; overflow-y:auto; display:grid; gap:16px; align-content:start;">
                            <div><label style="font-size:12px; font-weight:600; color:#4b5563; margin-bottom:4px; display:block;">Judul</label><input x-model="mediaForm.title" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; box-sizing:border-box;"></div>
                            <div><label style="font-size:12px; font-weight:600; color:#4b5563; margin-bottom:4px; display:block;">Alt Text</label><input x-model="mediaForm.alt" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; box-sizing:border-box;"></div>
                            <div><label style="font-size:12px; font-weight:600; color:#4b5563; margin-bottom:4px; display:block;">Caption</label><input x-model="mediaForm.caption" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; box-sizing:border-box;"></div>
                            <div><label style="font-size:12px; font-weight:600; color:#4b5563; margin-bottom:4px; display:block;">Deskripsi</label><textarea x-model="mediaForm.description" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:6px; font-size:13px; height:80px; box-sizing:border-box;"></textarea></div>
                         </div>
                         <div style="padding-top:20px; border-top:1px solid #e5e7eb;">
                            <button type="button" @click="uploadMediaAction(true)" :disabled="!uploadFile"
                                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                    :class="!uploadFile ? 'opacity-50 cursor-not-allowed' : ''">
                                <i class="fas fa-crop-alt"></i> Terapkan Potongan & Upload
                            </button>
                            <button type="button" @click="uploadMediaAction(false)" :disabled="!uploadFile"
                                    class="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mt-3"
                                    :class="!uploadFile ? 'opacity-50 cursor-not-allowed' : ''">
                                <i class="fas fa-cloud-upload-alt"></i> Upload Gambar Asli
                            </button>
                         </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
    </template>
`;
