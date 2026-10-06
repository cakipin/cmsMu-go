import { customEditorTemplate } from "../custom-editor.ts";

export const editorForm = `
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
        <button @click="view = 'posts'" class="btn" style="background:transparent; color:#555; border:1px solid #ccc;">
            <i class="fas fa-arrow-left"></i> Kembali
        </button>
        <h2 style="margin:0;" x-text="editingId ? 'Edit Post' : 'Tambah Post Baru'"></h2>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 320px; gap:25px;">
        <div style="min-width: 0;">
            <input x-model="form.title" class="input" placeholder="Judul Tulisan..." 
                   style="font-size: 24px; font-weight: 600; padding: 15px; margin-bottom: 20px;" 
                   @input="makeSlug()">
            <div style="margin-bottom:20px;">
                ${customEditorTemplate}
            </div>

            <!-- SEO & Metadata Section -->
            <div class="card" style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; margin-bottom: 20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px;">
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                        <i class="fas fa-search" style="color: #6b7280; margin-right: 8px;"></i> SEO & Metadata
                    </h3>
                    <button type="button" @click="autoGenerateSeo()" style="font-size:11px; padding:4px 10px; background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; border-radius:5px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:5px;" title="Isi otomatis Excerpt dan Meta Description dari isi tulisan">
                        <i class="fas fa-magic"></i> Auto-Generate dari Konten
                    </button>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #4b5563; margin-bottom: 6px;">Excerpt (Ringkasan)</label>
                    <textarea x-model="form.excerpt" class="input" style="width: 100%; height: 80px; padding: 10px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 14px;" placeholder="Tulis ringkasan singkat artikel..."></textarea>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #4b5563; margin-bottom: 6px;">Meta Title</label>
                    <input x-model="form.meta_title" class="input" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 14px;" placeholder="Maksimal 60 karakter">
                    <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Kosongkan jika ingin menggunakan Judul Tulisan.</div>
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; color: #4b5563; margin-bottom: 6px;">Meta Description</label>
                    <textarea x-model="form.meta_description" class="input" style="width: 100%; height: 80px; padding: 10px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 14px;" placeholder="Maksimal 160 karakter"></textarea>
                    <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Kosongkan jika ingin menggunakan Excerpt.</div>
                </div>
            </div>
            
            <div class="card" style="padding:0; overflow:hidden; border:1px solid #e5e7eb; border-radius:8px; background:white;">
                <div style="padding:12px 15px; border-bottom:1px solid #f3f4f6; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; font-size:13px; font-weight:600; color:#374151; text-transform:uppercase; letter-spacing:0.5px;">Featured Image</h3>
                    <i class="fas fa-star" style="color:#fbbf24; font-size:12px;"></i>
                </div>

                <div x-show="!form.featured_image" 
                     @click="openMediaSelector()"
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
                            <button type="button" @click="openMediaSelector()" title="Ganti Gambar"
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

                <button @click="save()" class="btn" style="width:100%; background:#2271b1; color:white; padding:10px; font-size:14px; font-weight:600; border-radius:6px; display:flex; justify-content:center; align-items:center; gap:8px;" :disabled="isSaving">
                    <i class="fas fa-spinner fa-spin" x-show="isSaving"></i>
                    <span x-text="isSaving ? 'Menyimpan...' : (editingId ? 'Perbarui Tulisan' : 'Terbitkan Sekarang')"></span>
                </button>
            </div>

            <!-- KATEGORI -->
            <div class="card" style="padding:15px; border-radius:8px; background:white; border:1px solid #e5e7eb;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h3 style="margin:0; font-size:13px; font-weight:600; color:#374151; text-transform:uppercase; letter-spacing:0.5px;">Kategori</h3>
                    <div style="display:flex; gap:6px;">
                        <button type="button" @click="openNewCategoryModal()" style="font-size:11px; background:#eff6ff; color:#2563eb; border:1px solid #dbeafe; padding:2px 8px; border-radius:4px; font-weight:600; cursor:pointer;" title="Tambah Kategori Baru">+ Tambah</button>
                        <button type="button" @click="openManager('category')" style="font-size:11px; background:#f8fafc; color:#475569; border:1px solid #e2e8f0; padding:2px 8px; border-radius:4px; font-weight:600; cursor:pointer;" title="Kelola Kategori">Kelola</button>
                    </div>
                </div>
                
                <div style="margin-bottom:8px;">
                    <select x-model="form.category" class="input" style="width:100%; font-size:13px; padding:8px 10px; border-radius:6px; border:1px solid #d1d5db;">
                        <template x-for="cat in uniqueCategories" :key="cat">
                            <option :value="cat" x-text="cat" :selected="form.category === cat"></option>
                        </template>
                    </select>
                </div>
            </div>

            <!-- TAGS -->
            <div class="card" style="padding:15px; border-radius:8px; background:white; border:1px solid #e5e7eb;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h3 style="margin:0; font-size:13px; font-weight:600; color:#374151; text-transform:uppercase; letter-spacing:0.5px;">Tags</h3>
                    <button type="button" @click="openManager('tag')" style="font-size:11px; background:#f8fafc; color:#475569; border:1px solid #e2e8f0; padding:2px 8px; border-radius:4px; font-weight:600; cursor:pointer;" title="Kelola Tags">Kelola</button>
                </div>
                
                <input x-model="form.tags" class="input" placeholder="Pisahkan dengan koma (,)" style="width:100%; font-size:13px; padding:8px 10px; border-radius:6px; border:1px solid #d1d5db; margin-bottom:8px; box-sizing:border-box;">
                
                <div style="display:flex; flex-wrap:wrap; gap:4px; max-height:100px; overflow-y:auto;">
                    <template x-for="tag in uniqueTags.slice(0, 15)" :key="tag">
                        <span @click="addTag(tag)" style="font-size:11px; background:#f3f4f6; color:#4b5563; padding:2px 8px; border-radius:12px; cursor:pointer; border:1px solid #e5e7eb;" onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'" x-text="'+ ' + tag"></span>
                    </template>
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
