export function renderAuthorEditorModal(): string {
  return `
    <!-- MODAL EDITOR PENULISAN BERITA -->
    <div id="author-editor-modal" style="display:none; position:fixed; inset:0; z-index:99999; background:rgba(0,0,0,0.65); backdrop-filter:blur(4px); overflow-y:auto; padding:1.5rem 1rem;">
      <div style="max-width:860px; margin:2rem auto; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:16px; box-shadow:0 20px 40px rgba(0,0,0,0.2); overflow:hidden; display:flex; flex-direction:column;">
        
        <!-- Header Modal -->
        <div style="padding:1.25rem 1.75rem; border-bottom:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:space-between; background:var(--bg-surface-elevated);">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="width:36px; height:36px; border-radius:10px; background:var(--accent-badge); color:var(--accent-primary); display:flex; align-items:center; justify-content:center; font-size:1rem;">
              <i class="fas fa-feather-alt"></i>
            </div>
            <div>
              <h3 id="author-editor-title" style="margin:0; font-size:1.125rem; font-weight:800; color:var(--text-primary); line-height:1.2;">
                Tulis Naskah Berita Baru
              </h3>
              <p style="margin:0.2rem 0 0 0; font-size:0.75rem; color:var(--text-muted);">
                Karya berita dan liputan untuk jaringan portal NewsRoom
              </p>
            </div>
          </div>
          <button type="button" onclick="closeAuthorEditor()" style="background:none; border:none; color:var(--text-muted); cursor:pointer; padding:0.5rem; font-size:1.25rem; border-radius:8px; display:flex; align-items:center; justify-content:center; transition:color 0.2s;" onmouseover="this.style.color='var(--text-primary)'" onmouseout="this.style.color='var(--text-muted)'">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Body Form -->
        <form id="author-editor-form" onsubmit="event.preventDefault();" style="padding:1.75rem; display:flex; flex-direction:column; gap:1.25rem;">
          <input type="hidden" id="author-post-id" value="">

          <!-- Judul Berita -->
          <div>
            <label style="display:block; font-size:0.8125rem; font-weight:700; color:var(--text-primary); margin-bottom:0.4rem;">
              Judul Berita / Liputan <span style="color:#ef4444;">*</span>
            </label>
            <input type="text" id="author-post-title" required placeholder="Tulis judul berita yang menarik dan informatif..." 
                   style="width:100%; font-size:1.125rem; font-weight:700; padding:0.75rem 1rem; border-radius:8px; border:1px solid var(--border-strong); background:var(--bg-canvas); color:var(--text-primary); box-sizing:border-box; outline:none;" 
                   onfocus="this.style.borderColor='var(--accent-primary)'" onblur="this.style.borderColor='var(--border-strong)'">
          </div>

          <!-- Kategori & Format Grid -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem;">
            <!-- Dropdown Kategori -->
            <div>
              <label style="display:block; font-size:0.8125rem; font-weight:700; color:var(--text-primary); margin-bottom:0.4rem;">
                Kategori Berita <span style="color:#ef4444;">*</span>
              </label>
              <select id="author-post-category" required style="width:100%; padding:0.65rem 0.85rem; border-radius:8px; border:1px solid var(--border-strong); background:var(--bg-canvas); color:var(--text-primary); font-size:0.875rem; box-sizing:border-box; outline:none;">
                <option value="Berita Daerah">Berita Daerah (PWM / PDM)</option>
                <option value="PTMA">PTMA (Perguruan Tinggi Muhammadiyah & Aisyiyah)</option>
                <option value="Warta Persyarikatan">Warta Persyarikatan (Majelis & Ortom)</option>
                <option value="Kesehatan">Kesehatan (MPKU & RS PKU)</option>
                <option value="Pendidikan Dasar">Pendidikan Dasar & Menengah (Dikdasmen)</option>
                <option value="Opini & Berita">Opini & Berita (Media Kader)</option>
              </select>
            </div>

            <!-- Tags -->
            <div>
              <label style="display:block; font-size:0.8125rem; font-weight:700; color:var(--text-primary); margin-bottom:0.4rem;">
                Kata Kunci / Tag <span style="font-size:0.75rem; color:var(--text-muted); font-weight:400;">(Pisahkan dengan koma)</span>
              </label>
              <input type="text" id="author-post-tags" placeholder="contoh: muhammadiyah, kader, dakwah" 
                     style="width:100%; padding:0.65rem 0.85rem; border-radius:8px; border:1px solid var(--border-strong); background:var(--bg-canvas); color:var(--text-primary); font-size:0.875rem; box-sizing:border-box; outline:none;">
            </div>
          </div>

          <!-- Featured Image (Sampul Berita) -->
          <div>
            <label style="display:block; font-size:0.8125rem; font-weight:700; color:var(--text-primary); margin-bottom:0.4rem;">
              Gambar Sampul Berita (Featured Image)
            </label>
            <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
              <input type="text" id="author-post-image" placeholder="URL gambar atau unggah berkas sampul..." 
                     style="flex:1; min-width:240px; padding:0.65rem 0.85rem; border-radius:8px; border:1px solid var(--border-strong); background:var(--bg-canvas); color:var(--text-primary); font-size:0.875rem; box-sizing:border-box; outline:none;" oninput="updateAuthorImagePreview(this.value)">
              <label style="background:var(--bg-canvas); color:var(--text-primary); border:1px solid var(--border-strong); padding:0.65rem 1rem; border-radius:8px; font-size:0.8125rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:0.4rem;">
                <i class="fas fa-upload"></i> Unggah Gambar
                <input type="file" id="author-post-image-file" accept="image/*" style="display:none;" onchange="handleAuthorImageUpload(this)">
              </label>
            </div>
            <!-- Pratinjau Gambar -->
            <div id="author-image-preview-wrap" style="display:none; margin-top:0.75rem; position:relative; width:100%; max-width:320px; aspect-ratio:16/9; border-radius:8px; overflow:hidden; border:1px solid var(--border-subtle);">
              <img id="author-image-preview" src="" alt="Pratinjau Sampul" style="width:100%; height:100%; object-fit:cover;">
              <button type="button" onclick="clearAuthorImage()" style="position:absolute; top:0.5rem; right:0.5rem; background:rgba(0,0,0,0.7); color:#fff; border:none; border-radius:50%; width:28px; height:28px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:0.75rem;">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- Ringkasan / Excerpt -->
          <div>
            <label style="display:block; font-size:0.8125rem; font-weight:700; color:var(--text-primary); margin-bottom:0.4rem;">
              Ringkasan Berita (Excerpt) <span style="font-size:0.75rem; color:var(--text-muted); font-weight:400;">(1-2 kalimat pengantar)</span>
            </label>
            <textarea id="author-post-excerpt" rows="2" placeholder="Tulis ringkasan singkat artikel untuk pengantar pembaca..." 
                      style="width:100%; padding:0.65rem 0.85rem; border-radius:8px; border:1px solid var(--border-strong); background:var(--bg-canvas); color:var(--text-primary); font-size:0.875rem; box-sizing:border-box; outline:none; font-family:inherit; resize:vertical;"></textarea>
          </div>

          <!-- Konten Berita dengan Toolbar -->
          <div>
            <label style="display:block; font-size:0.8125rem; font-weight:700; color:var(--text-primary); margin-bottom:0.4rem;">
              Isi Berita / Naskah Lengkap <span style="color:#ef4444;">*</span>
            </label>
            
            <!-- Toolbar Format Naskah -->
            <div style="display:flex; flex-wrap:wrap; gap:0.25rem; padding:0.4rem; background:var(--bg-surface-elevated); border:1px solid var(--border-strong); border-bottom:none; border-radius:8px 8px 0 0;">
              <button type="button" onclick="insertFormatting('h2')" title="Sub-Judul (H2)" style="background:var(--bg-surface); border:1px solid var(--border-subtle); color:var(--text-primary); padding:0.35rem 0.6rem; border-radius:4px; font-size:0.75rem; font-weight:800; cursor:pointer;">H2</button>
              <button type="button" onclick="insertFormatting('h3')" title="Bagian (H3)" style="background:var(--bg-surface); border:1px solid var(--border-subtle); color:var(--text-primary); padding:0.35rem 0.6rem; border-radius:4px; font-size:0.75rem; font-weight:800; cursor:pointer;">H3</button>
              <button type="button" onclick="insertFormatting('b')" title="Tebal (Bold)" style="background:var(--bg-surface); border:1px solid var(--border-subtle); color:var(--text-primary); padding:0.35rem 0.6rem; border-radius:4px; font-size:0.75rem; font-weight:800; cursor:pointer;"><i class="fas fa-bold"></i></button>
              <button type="button" onclick="insertFormatting('i')" title="Miring (Italic)" style="background:var(--bg-surface); border:1px solid var(--border-subtle); color:var(--text-primary); padding:0.35rem 0.6rem; border-radius:4px; font-size:0.75rem; cursor:pointer;"><i class="fas fa-italic"></i></button>
              <button type="button" onclick="insertFormatting('quote')" title="Kutipan (Blockquote)" style="background:var(--bg-surface); border:1px solid var(--border-subtle); color:var(--text-primary); padding:0.35rem 0.6rem; border-radius:4px; font-size:0.75rem; cursor:pointer;"><i class="fas fa-quote-left"></i></button>
              <button type="button" onclick="insertFormatting('ul')" title="Daftar (List)" style="background:var(--bg-surface); border:1px solid var(--border-subtle); color:var(--text-primary); padding:0.35rem 0.6rem; border-radius:4px; font-size:0.75rem; cursor:pointer;"><i class="fas fa-list-ul"></i></button>
              <button type="button" onclick="insertFormatting('link')" title="Tautan Link" style="background:var(--bg-surface); border:1px solid var(--border-subtle); color:var(--text-primary); padding:0.35rem 0.6rem; border-radius:4px; font-size:0.75rem; cursor:pointer;"><i class="fas fa-link"></i></button>
              <button type="button" onclick="insertFormatting('p')" title="Paragraf Baru" style="background:var(--bg-surface); border:1px solid var(--border-subtle); color:var(--text-primary); padding:0.35rem 0.6rem; border-radius:4px; font-size:0.75rem; cursor:pointer;"><i class="fas fa-paragraph"></i></button>
              <button type="button" onclick="document.getElementById('author-inline-image-file').click()" title="Sisipkan Foto ke Dalam Naskah" style="background:var(--accent-primary, #059669); border:1px solid var(--accent-primary, #059669); color:#fff; padding:0.35rem 0.65rem; border-radius:4px; font-size:0.75rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:0.35rem;">
                <i class="fas fa-image"></i> Sisipkan Foto
              </button>
              <input type="file" id="author-inline-image-file" accept="image/*" style="display:none;" onchange="handleInlineImageUpload(this)">
            </div>

            <!-- Area Teks Konten -->
            <textarea id="author-post-body" rows="12" required placeholder="Tuliskan naskah berita lengkap di sini..." 
                      style="width:100%; padding:0.85rem; border-radius:0 0 8px 8px; border:1px solid var(--border-strong); background:var(--bg-canvas); color:var(--text-primary); font-size:0.9375rem; box-sizing:border-box; outline:none; font-family:inherit; line-height:1.6; resize:vertical;"></textarea>
          </div>

          <!-- Alert Pesan Status -->
          <div id="author-editor-alert" style="display:none; padding:0.75rem 1rem; border-radius:8px; font-size:0.875rem; font-weight:600;"></div>

          <!-- Footer Tombol Aksi -->
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; padding-top:1rem; border-top:1px solid var(--border-subtle);">
            <button type="button" onclick="closeAuthorEditor()" style="background:var(--bg-canvas); color:var(--text-secondary); border:1px solid var(--border-strong); padding:0.65rem 1.25rem; border-radius:8px; font-size:0.875rem; font-weight:700; cursor:pointer;">
              Batal
            </button>
            <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
              <button type="button" id="btn-save-draft" onclick="submitAuthorArticle('draft')" style="background:var(--bg-surface-elevated); color:var(--text-primary); border:1px solid var(--border-strong); padding:0.65rem 1.25rem; border-radius:8px; font-size:0.875rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:0.5rem;">
                <i class="far fa-save"></i> Simpan Draf
              </button>
              <button type="button" id="btn-submit-curation" onclick="submitAuthorArticle('curated')" style="background:var(--accent-primary); color:#ffffff; border:none; padding:0.65rem 1.5rem; border-radius:8px; font-size:0.875rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:0.5rem; box-shadow:0 2px 8px rgba(2,132,199,0.3);">
                <i class="fas fa-paper-plane"></i> Kirim ke Redaksi
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  `;
}
