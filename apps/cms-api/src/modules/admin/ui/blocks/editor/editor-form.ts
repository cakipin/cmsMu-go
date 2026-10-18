import { customEditorTemplate } from "../custom-editor";

export const editorForm = `
    <!-- Header Post Editor Responsif -->
    <div class="flex items-center justify-between gap-2.5 mb-4 sticky top-0 z-20 bg-slate-100/95 backdrop-blur py-2 px-1 rounded-md sm:static sm:bg-transparent sm:py-0 sm:px-0">
        <div class="flex items-center gap-2 min-w-0">
            <button type="button" @click="view = 'posts'" class="btn min-h-[40px] px-3 py-2 bg-white text-slate-700 border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-xs sm:text-sm flex items-center gap-1.5 flex-shrink-0">
                <i class="fas fa-arrow-left"></i> <span class="hidden sm:inline">Kembali</span>
            </button>
            <h2 class="text-sm sm:text-xl font-bold text-slate-800 m-0 truncate" x-text="editingId ? 'Edit Post' : 'Tambah Post Baru'"></h2>
        </div>

        <!-- Tombol Aksi Cepat Header (Sangat Ergonomis di Layar Mobile) -->
        <div class="flex items-center gap-2 flex-shrink-0">
            <a x-show="form.slug" :href="'/' + form.slug" target="_blank" 
               class="btn min-h-[40px] px-3 py-2 bg-white text-slate-600 border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 flex items-center justify-center text-xs active:scale-95 transition-all" 
               title="Preview Artikel">
                <i class="fas fa-external-link-alt"></i>
            </a>
            <button type="button" @click="save()" class="btn min-h-[40px] px-3.5 sm:px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold rounded-md shadow-sm flex items-center gap-1.5 text-xs sm:text-sm active:scale-95 transition-all" :disabled="isSaving">
                <i class="fas fa-spinner fa-spin" x-show="isSaving"></i>
                <i class="fas fa-paper-plane" x-show="!isSaving"></i>
                <span x-text="isSaving ? 'Menyimpan...' : (editingId ? 'Perbarui' : 'Terbitkan')"></span>
            </button>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 lg:gap-6 items-start pb-12 md:pb-6">
        <div style="min-width: 0;">
            <input x-model="form.title" class="input" placeholder="Judul Tulisan..." 
                   style="font-size: clamp(18px, 3.5vw, 24px); font-weight: 600; padding: 12px 14px; margin-bottom: 16px; width: 100%; box-sizing: border-box;" 
                   @input="makeSlug()">
            <div style="margin-bottom:20px;">
                ${customEditorTemplate}
            </div>

            <!-- SEO & Metadata Section dengan Skor Indikator & Fitur AI -->
            <div class="card" 
                 :style="'border: 1px solid ' + (getSeo().isPerfect ? '#10b981' : '#e5e7eb') + '; border-radius: 10px; background: white; margin-bottom: 20px; overflow: hidden; box-shadow: ' + (getSeo().isPerfect ? '0 4px 14px rgba(16,185,129,0.15)' : '0 1px 3px rgba(0,0,0,0.05)') + ';'">
                
                <!-- Header Card dengan Tombol Aksi AI (Responsif Mobile) -->
                <div class="p-3.5 sm:px-5 sm:py-4 bg-[#fafafa] border-b border-[#f0f0f1] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div class="flex items-center gap-2.5">
                        <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                            <i class="fas fa-chart-line text-sm"></i>
                        </span>
                        <div>
                            <h3 class="m-0 text-sm sm:text-base font-bold text-slate-800">
                                Analisis SEO & Metadata
                            </h3>
                            <div class="text-[11px] text-slate-500">Standar Google On-Page & Keterbacaan Mobile</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                        <!-- Tombol AI Generate SEO Metadata -->
                        <button type="button" 
                                @click="generateSeoWithAi()" 
                                :disabled="isGeneratingSeo || isOptimizingFull"
                                class="w-full sm:w-auto min-h-[38px] px-3.5 py-2 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 border border-purple-200 cursor-pointer inline-flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 disabled:opacity-50"
                                title="Generate otomatis Meta Title, Meta Description, Excerpt, dan Tag dengan AI">
                            <i class="fas fa-wand-magic-sparkles text-xs" :class="isGeneratingSeo ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'"></i>
                            <span x-text="isGeneratingSeo ? 'Membuat...' : '✨ AI Generate SEO'">✨ AI Generate SEO</span>
                        </button>

                        <!-- Tombol AI Full Optimize (Konten + Metadata) -->
                        <button type="button" 
                                @click="fullAiOptimize()" 
                                :disabled="isGeneratingSeo || isOptimizingFull"
                                class="w-full sm:w-auto min-h-[38px] px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer inline-flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 disabled:opacity-50"
                                title="Optimasi total 100%: Rapikan paragraf, sisipkan H2, dan lengkapi semua metadata SEO!">
                            <i class="fas fa-rocket text-xs" :class="isOptimizingFull ? 'fa-spinner fa-spin' : 'fa-rocket'"></i>
                            <span x-text="isOptimizingFull ? 'Mengoptimasi...' : '🚀 AI Optimasi 100%'">🚀 AI Optimasi 100%</span>
                        </button>
                    </div>
                </div>

                <!-- SEO Score Meter & Indikator Warna Realtime -->
                <div style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9;" :style="'background:' + getSeo().bg">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <!-- Lingkaran Indikator -->
                            <span style="display:inline-block; width:10px; height:10px; border-radius:50%;" :style="'background:' + getSeo().color"></span>
                            <span style="font-weight:700; font-size:13px;" :style="'color:' + getSeo().color" x-text="getSeo().statusText">SEO Kurang Optimal</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span style="font-size:11px; color:#64748b;">Skor SEO:</span>
                            <span style="font-size:16px; font-weight:800; padding: 2px 8px; border-radius: 4px;" 
                                  :style="'color:' + getSeo().color + '; background:' + getSeo().badgeBg" 
                                  x-text="getSeo().score + '%'">0%</span>
                        </div>
                    </div>

                    <!-- Progress Bar Indikator -->
                    <div style="width:100%; height:12px; background:#e2e8f0; border-radius:999px; overflow:hidden; position:relative; box-shadow: inset 0 1px 2px rgba(0,0,0,0.06);">
                        <div style="height:12px; border-radius:999px; transition: width 0.3s ease, background 0.3s ease;"
                             :style="'width: ' + getSeo().score + '%; background: ' + getSeo().color"></div>
                    </div>

                    <!-- Keterangan Legend & Toggle Checklist -->
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:11px; color:#64748b;">
                        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
                            <span style="display:inline-flex; align-items:center; gap:4px;"><span style="width:7px; height:7px; border-radius:50%; background:#ef4444;"></span> &lt;50% Merah</span>
                            <span style="display:inline-flex; align-items:center; gap:4px;"><span style="width:7px; height:7px; border-radius:50%; background:#f59e0b;"></span> 50-79% Orange</span>
                            <span style="display:inline-flex; align-items:center; gap:4px;"><span style="width:7px; height:7px; border-radius:50%; background:#10b981;"></span> 80-99% Hijau</span>
                            <span style="display:inline-flex; align-items:center; gap:4px;"><span style="width:7px; height:7px; border-radius:50%; background:#059669;"></span> 100% Sempurna 🏆</span>
                        </div>
                        <button type="button" @click="showSeoDetails = !showSeoDetails" 
                                style="background:none; border:none; color:#2563eb; cursor:pointer; font-size:11px; font-weight:600; padding:0; display:flex; align-items:center; gap:4px;">
                            <span x-text="showSeoDetails ? 'Sembunyikan Kriteria' : 'Lihat Detail Kriteria (' + getSeo().checks.filter(c => c.pass).length + '/8)'">Lihat Detail Kriteria</span>
                            <i class="fas" :class="showSeoDetails ? 'fa-chevron-up' : 'fa-chevron-down'" style="font-size:9px;"></i>
                        </button>
                    </div>

                    <!-- Checklist Detail Kriteria (Dropdown Accordion) -->
                    <div x-show="showSeoDetails" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(0,0,0,0.1);">
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 8px;">
                            <template x-for="item in getSeo().checks" :key="item.name">
                                <div style="display:flex; align-items:flex-start; gap:8px; background: rgba(255,255,255,0.7); padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.06);">
                                    <i class="fas" :class="item.pass ? 'fa-check-circle' : 'fa-times-circle'" 
                                       :style="'color: ' + (item.pass ? '#10b981' : '#ef4444') + '; margin-top: 2px; font-size: 14px; flex-shrink:0;'"></i>
                                    <div style="flex:1; min-width:0;">
                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                            <span style="font-size:12px; font-weight:600; color:#1e293b;" x-text="item.name"></span>
                                            <span style="font-size:10px; font-weight:600; padding:1px 5px; border-radius:3px;" 
                                                  :style="item.pass ? 'background:#dcfce7; color:#15803d;' : 'background:#fee2e2; color:#b91c1c;'"
                                                  x-text="item.pts + ' Poin'"></span>
                                        </div>
                                        <div style="font-size:11px; color:#64748b; margin-top:2px;" x-text="item.desc"></div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- Field-field SEO Metadata Form -->
                <div style="padding: 20px;">
                    <!-- Meta Title Field -->
                    <div style="margin-bottom: 18px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px; flex-wrap:wrap; gap:6px;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <label style="font-size: 13px; font-weight: 600; color: #374151;">
                                    Meta Title <span style="font-size:11px; color:#6b7280; font-weight:400;">(Judul untuk Tab Browser & Google)</span>
                                </label>
                                <button type="button" 
                                        @click="generateSingleMeta('meta_title')" 
                                        :disabled="isGeneratingMetaTitle || isOptimizingFull"
                                        style="font-size:11px; padding:3px 9px; background:#f5f3ff; color:#7c3aed; border:1px solid #c4b5fd; border-radius:4px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:5px;"
                                        title="Generate Meta Title spesifik (50-60 karakter)">
                                    <i class="fas" :class="isGeneratingMetaTitle ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'" style="font-size:10px;"></i>
                                    <span x-text="isGeneratingMetaTitle ? 'Membuat...' : '✨ AI Generate'">✨ AI Generate</span>
                                </button>
                            </div>
                            <span style="font-size: 11px;" 
                                  :style="(form.meta_title || '').length >= 40 && (form.meta_title || '').length <= 65 ? 'color:#10b981; font-weight:600;' : 'color:#94a3b8;'">
                                <span x-text="(form.meta_title || '').length">0</span>/65 karakter (ideal 40-65)
                            </span>
                        </div>
                        <input x-model="form.meta_title" class="input" style="width: 100%; padding: 10px 12px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 14px;" placeholder="Tuliskan judul spesifik untuk hasil pencarian Google...">
                    </div>

                    <!-- Meta Description Field -->
                    <div style="margin-bottom: 18px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px; flex-wrap:wrap; gap:6px;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <label style="font-size: 13px; font-weight: 600; color: #374151;">
                                    Meta Description <span style="font-size:11px; color:#6b7280; font-weight:400;">(Ringkasan Snippet Google)</span>
                                </label>
                                <button type="button" 
                                        @click="generateSingleMeta('meta_description')" 
                                        :disabled="isGeneratingMetaDesc || isOptimizingFull"
                                        style="font-size:11px; padding:3px 9px; background:#f5f3ff; color:#7c3aed; border:1px solid #c4b5fd; border-radius:4px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:5px;"
                                        title="Generate Meta Description spesifik (125-155 karakter)">
                                    <i class="fas" :class="isGeneratingMetaDesc ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'" style="font-size:10px;"></i>
                                    <span x-text="isGeneratingMetaDesc ? 'Membuat...' : '✨ AI Generate'">✨ AI Generate</span>
                                </button>
                            </div>
                            <span style="font-size: 11px;" 
                                  :style="(form.meta_description || '').length >= 115 && (form.meta_description || '').length <= 160 ? 'color:#10b981; font-weight:600;' : 'color:#94a3b8;'">
                                <span x-text="(form.meta_description || '').length">0</span>/160 karakter (ideal 115-160)
                            </span>
                        </div>
                        <textarea x-model="form.meta_description" class="input" style="width: 100%; height: 75px; padding: 10px 12px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 13px; line-height:1.5;" placeholder="Tuliskan deskripsi ringkas yang menarik pembaca Google..."></textarea>
                    </div>

                    <!-- Excerpt Field -->
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px; flex-wrap:wrap; gap:6px;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <label style="font-size: 13px; font-weight: 600; color: #374151;">
                                    Excerpt / Ringkasan Tulisan <span style="font-size:11px; color:#6b7280; font-weight:400;">(Tampil pada Grid Kartu Berita)</span>
                                </label>
                                <button type="button" 
                                        @click="generateSingleMeta('excerpt')" 
                                        :disabled="isGeneratingExcerpt || isOptimizingFull"
                                        style="font-size:11px; padding:3px 9px; background:#f5f3ff; color:#7c3aed; border:1px solid #c4b5fd; border-radius:4px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:5px;"
                                        title="Generate Excerpt ringkas (1-2 kalimat)">
                                    <i class="fas" :class="isGeneratingExcerpt ? 'fa-spinner fa-spin' : 'fa-magic'" style="font-size:10px;"></i>
                                    <span x-text="isGeneratingExcerpt ? 'Membuat...' : '✨ AI Generate'">✨ AI Generate</span>
                                </button>
                            </div>
                            <span style="font-size: 11px;" 
                                  :style="(form.excerpt || '').length >= 40 && (form.excerpt || '').length <= 220 ? 'color:#10b981; font-weight:600;' : 'color:#94a3b8;'">
                                <span x-text="(form.excerpt || '').length">0</span> karakter
                            </span>
                        </div>
                        <textarea x-model="form.excerpt" class="input" style="width: 100%; height: 75px; padding: 10px 12px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 13px; line-height:1.5;" placeholder="Ringkasan singkat untuk tampilan cuplikan berita..."></textarea>
                    </div>
                </div>
            </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:20px;">
            <!-- FORMAT POSTINGAN (STANDAR / VIDEO) -->
            <div class="card" style="padding:15px; border-top:3px solid #ef4444; border-radius:8px; background:white;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <h3 style="margin:0; font-size:14px; font-weight:700; color:#1f2937; display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-play-circle" style="color:#ef4444;"></i> Format Postingan
                    </h3>
                    <span x-show="form.type === 'video'" style="font-size:10px; font-weight:700; background:#fee2e2; color:#dc2626; padding:2px 8px; border-radius:10px;">VIDEO</span>
                </div>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
                    <button type="button" @click="form.type = 'post'"
                        :style="form.type !== 'video' ? 'background:#2271b1; color:white; font-weight:600; border-color:#2271b1;' : 'background:#f9fafb; color:#4b5563; border-color:#d1d5db;'"
                        class="btn" style="border:1px solid; padding:8px 10px; font-size:12px; border-radius:6px; display:flex; align-items:center; justify-content:center; gap:6px; cursor:pointer; transition:all 0.2s;">
                        <i class="fas fa-file-alt"></i> Standar
                    </button>
                    <button type="button" @click="form.type = 'video'"
                        :style="form.type === 'video' ? 'background:#ef4444; color:white; font-weight:600; border-color:#ef4444;' : 'background:#f9fafb; color:#4b5563; border-color:#d1d5db;'"
                        class="btn" style="border:1px solid; padding:8px 10px; font-size:12px; border-radius:6px; display:flex; align-items:center; justify-content:center; gap:6px; cursor:pointer; transition:all 0.2s;">
                        <i class="fas fa-video"></i> Video
                    </button>
                </div>

                <div x-show="form.type === 'video'" style="margin-top:12px; padding-top:12px; border-top:1px dashed #e5e7eb;">
                    <label style="display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:6px;">
                        URL / Link Video <span style="color:#ef4444;">*</span>
                    </label>
                    <input type="text" x-model="form.video_url" class="input" 
                           @input="if(!form.featured_image) { const th = getYoutubeThumbnail(form.video_url); if(th) form.featured_image = th; }"
                           @change="if(!form.featured_image) { const th = getYoutubeThumbnail(form.video_url); if(th) form.featured_image = th; }"
                           placeholder="https://www.youtube.com/watch?v=... atau short" 
                           style="width:100%; font-size:12px; padding:8px 10px; border-radius:6px; border:1px solid #d1d5db; box-sizing:border-box;">
                    <p style="margin:4px 0 0 0; font-size:11px; color:#6b7280;">Mendukung YouTube (Reguler/Shorts/Live) & Vimeo.</p>
                    
                    <div x-show="form.video_url" style="margin-top:10px; border-radius:6px; overflow:hidden; border:1px solid #e5e7eb; background:#000; aspect-ratio:16/9; position:relative;">
                        <iframe :src="getVideoEmbedUrl(form.video_url)" style="width:100%; height:100%; border:none;" allowfullscreen></iframe>
                    </div>
                </div>
            </div>

            <!-- PUBLISH BOX -->
            <div class="card" style="padding:15px; border-top:3px solid #2271b1; border-radius:8px; background:white;">
                <h3 style="margin:0 0 15px 0; font-size:14px; font-weight:600; color:#374151;">Publikasi</h3>
                
                <div style="margin-bottom:12px;">
                    <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:4px;">Status</label>
                    <select x-model="form.status" class="input" style="width:100%; font-size:13px; padding:6px 10px; border-radius:6px; border:1px solid #d1d5db;">
                        <option value="publish">Diterbitkan (Publish)</option>
                        <option value="draft">Konsep (Draft)</option>
                        <option value="curated">Kurasi (Curated)</option>
                    </select>
                </div>

                <div style="margin-bottom:15px;">
                    <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:4px;">Tanggal Terbit</label>
                    <input type="datetime-local" x-model="form.date" class="input" style="width:100%; font-size:13px; padding:6px 10px; border-radius:6px; border:1px solid #d1d5db; box-sizing:border-box;">
                </div>

                <div style="margin-bottom:15px; padding-top:10px; border-top:1px dashed #e5e7eb; display:flex; justify-content:space-between; align-items:center;">
                    <label style="font-size:12px; font-weight:600; color:#374151; display:flex; align-items:center; gap:6px; cursor:pointer;" @click="form.allow_comments = (form.allow_comments == 1 || form.allow_comments === true || form.allow_comments === '1') ? 0 : 1">
                        <i class="fas fa-comments" style="color:#0d9488;"></i> Izinkan Komentar
                    </label>
                    <button type="button" role="switch"
                            class="comment-toggle-switch"
                            :class="{ 'active': (form.allow_comments == 1 || form.allow_comments === true || form.allow_comments === '1') }"
                            @click="form.allow_comments = (form.allow_comments == 1 || form.allow_comments === true || form.allow_comments === '1') ? 0 : 1"
                            :aria-checked="(form.allow_comments == 1 || form.allow_comments === true || form.allow_comments === '1') ? 'true' : 'false'"
                            title="Aktifkan / Nonaktifkan Komentar">
                        <span class="comment-toggle-thumb"></span>
                    </button>
                </div>

                <div style="display:flex; gap:10px;">
                    <a x-show="form.slug" :href="'/' + form.slug" target="_blank" class="btn" style="background:#f1f5f9; color:#475569; padding:10px; font-size:14px; border-radius:6px; display:flex; justify-content:center; align-items:center; border:1px solid #cbd5e1; text-decoration:none;" title="Preview Artikel">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button @click="save()" class="btn" style="flex:1; background:#2271b1; color:white; padding:10px; font-size:14px; font-weight:600; border-radius:6px; display:flex; justify-content:center; align-items:center; gap:8px;" :disabled="isSaving">
                        <i class="fas fa-spinner fa-spin" x-show="isSaving"></i>
                        <span x-text="isSaving ? 'Menyimpan...' : (editingId ? 'Perbarui Tulisan' : 'Terbitkan Sekarang')"></span>
                    </button>
                </div>
            </div>

            <!-- KATEGORI (Responsif Mobile) -->
            <div class="card" style="padding:15px; border-radius:8px; background:white; border:1px solid #e5e7eb;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h3 style="margin:0; font-size:13px; font-weight:600; color:#374151; text-transform:uppercase; letter-spacing:0.5px;">Kategori</h3>
                    <div style="display:flex; gap:6px;">
                        <button type="button" @click="openNewCategoryModal()" class="text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 min-h-[32px] px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors active:scale-95" title="Tambah Kategori Baru">+ Tambah</button>
                        <button type="button" @click="openManager('category')" class="text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 min-h-[32px] px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors active:scale-95" title="Kelola Kategori">Kelola</button>
                    </div>
                </div>
                
                <div style="margin-bottom:8px;">
                    <select x-model="form.category" class="input" style="width:100%; font-size:13px; padding:9px 10px; border-radius:8px; border:1px solid #d1d5db;">
                        <template x-for="cat in uniqueCategories" :key="cat">
                            <option :value="cat" x-text="cat" :selected="form.category === cat"></option>
                        </template>
                    </select>
                </div>
            </div>

            <!-- TAGS (Responsif Mobile) -->
            <div class="card" style="padding:15px; border-radius:8px; background:white; border:1px solid #e5e7eb;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h3 style="margin:0; font-size:13px; font-weight:600; color:#374151; text-transform:uppercase; letter-spacing:0.5px;">Tags</h3>
                    <button type="button" @click="openManager('tag')" class="text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 min-h-[32px] px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors active:scale-95" title="Kelola Tags">Kelola</button>
                </div>
                
                <input x-model="form.tags" class="input" placeholder="Pisahkan dengan koma (,)" style="width:100%; font-size:13px; padding:9px 10px; border-radius:8px; border:1px solid #d1d5db; margin-bottom:10px; box-sizing:border-box;">
                
                <div style="display:flex; flex-wrap:wrap; gap:6px; max-height:120px; overflow-y:auto;">
                    <template x-for="tag in uniqueTags.slice(0, 15)" :key="tag">
                        <span @click="addTag(tag)" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full cursor-pointer border border-slate-200 transition-colors active:scale-95 select-none" x-text="'+ ' + tag"></span>
                    </template>
                </div>
            </div>

        
            <div class="card" style="padding:0; overflow:hidden; border:1px solid #e5e7eb; border-radius:8px; background:white;">
                            <div style="padding:12px 15px; border-bottom:1px solid #f3f4f6; display:flex; justify-content:space-between; align-items:center;">
                                <h3 style="margin:0; font-size:13px; font-weight:600; color:#374151; text-transform:uppercase; letter-spacing:0.5px;">Featured Image</h3>
                                <i class="fas fa-star" style="color:#fbbf24; font-size:12px;"></i>
                            </div>
            
                            <div x-show="!form.featured_image" 
                                 @click="mediaSelectorTarget = 'featured_image'; openMediaSelector()"
                                 style="padding:40px 20px; text-align:center; cursor:pointer; background:#f9fafb; transition:all 0.2s;"
                                 onmouseover="this.style.background='#f3f4f6'" 
                                 onmouseout="this.style.background='#f9fafb'">
                                
                                <div style="width:60px; height:60px; background:#e5e7eb; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px auto;">
                                    <i class="fas fa-image fa-2x" style="color:#9ca3af;"></i>
                                </div>
                                <div style="font-weight:600; color:#4b5563; font-size:14px;">Tetapkan Gambar Unggulan</div>
                                <div style="color:#9ca3af; font-size:12px; margin-top:5px;">Klik untuk memilih dari library</div>
                            </div>
            
                            <div x-show="form.featured_image" style="position:relative;">
                                <div style="width:100%; aspect-ratio:16/9; background:#eee; position:relative; overflow:hidden;">
                                    <img :src="form.featured_image" 
                                         style="width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.5s;"
                                         onmouseover="this.style.transform='scale(1.05)'"
                                         onmouseout="this.style.transform='scale(1)'">
                                </div>
                                <div style="background:white; padding:10px 15px; border-top:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center;">
                                    <div style="font-size:11px; color:#6b7280; font-weight:500;">
                                        <i class="fas fa-check-circle" style="color:#10b981;"></i> Terpasang
                                    </div>
                                    <div style="display:flex; gap:8px;">
                                        <button type="button" @click="mediaSelectorTarget = 'featured_image'; openMediaSelector()" title="Ganti Gambar"
                                                style="padding:6px 10px; background:#eff6ff; color:#2563eb; border:1px solid #dbeafe; border-radius:4px; font-size:11px; font-weight:600; cursor:pointer;">
                                            <i class="fas fa-exchange-alt"></i> Ganti
                                        </button>
                                        <button type="button" @click="form.featured_image=''" title="Hapus Gambar"
                                                style="padding:6px 10px; background:#fef2f2; color:#dc2626; border:1px solid #fee2e2; border-radius:4px; font-size:11px; font-weight:600; cursor:pointer;">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

        </div>
    </div>
</div>

    <style>
        .comment-toggle-switch {
            position: relative !important;
            display: inline-flex !important;
            align-items: center !important;
            width: 44px !important;
            height: 24px !important;
            min-width: 44px !important;
            max-width: 44px !important;
            border-radius: 9999px !important;
            border: none !important;
            cursor: pointer !important;
            background-color: #cbd5e1 !important;
            transition: background-color 0.2s ease !important;
            padding: 2px !important;
            box-sizing: border-box !important;
            outline: none !important;
            flex-shrink: 0 !important;
        }
        .comment-toggle-switch.active {
            background-color: #10b981 !important;
        }
        .comment-toggle-thumb {
            display: block !important;
            width: 20px !important;
            height: 20px !important;
            background-color: #ffffff !important;
            border-radius: 50% !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.25) !important;
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
            pointer-events: none !important;
            transform: translateX(0px) !important;
        }
        .comment-toggle-switch.active .comment-toggle-thumb {
            transform: translateX(20px) !important;
        }
    </style>
`;
