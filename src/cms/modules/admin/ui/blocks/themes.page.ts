export const themesPage = `
<div x-show="view==='themes'"
     x-data="{
        themeEditorOpen: false,
        isSavingTheme: false,
        themeColors: {
            theme_primary: '#2271b1',
            theme_primary_dark: '#135e96',
            theme_bg: '#ffffff',
            theme_text: '#1a1a2e',
            theme_accent: '#f0f7ff',
            header_logo_url: '',
            header_menu_position: 'right',
            header_text_color: '#334155',
            sidebar_popular_limit: 5,
            landing_title: '',
            landing_subtitle: '',
            landing_cta_text: 'Mulai Sekarang',
            landing_cta_link: '/admin',
            landing_image_1: '',
            landing_image_2: '',
            landing_image_3: ''
        },

        async openThemeEditor() {
            // Muat warna tersimpan dari API settings
            try {
                const token = localStorage.getItem('labmu_token');
                const res = await fetch('/api/settings', { headers: { 'Authorization': 'Bearer ' + token } });
                if (res.ok) {
                    const json = await res.json();
                    const d = json.data || json;
                    if (d.theme_primary)      this.themeColors.theme_primary      = d.theme_primary;
                    if (d.theme_primary_dark) this.themeColors.theme_primary_dark = d.theme_primary_dark;
                    if (d.theme_bg)           this.themeColors.theme_bg           = d.theme_bg;
                    if (d.theme_text)         this.themeColors.theme_text         = d.theme_text;
                    if (d.theme_accent)       this.themeColors.theme_accent       = d.theme_accent;
                    if (d.header_logo_url)    this.themeColors.header_logo_url    = d.header_logo_url;
                    if (d.header_menu_position) this.themeColors.header_menu_position = d.header_menu_position;
                    if (d.header_text_color)  this.themeColors.header_text_color  = d.header_text_color;
                    if (d.sidebar_popular_limit) this.themeColors.sidebar_popular_limit = parseInt(d.sidebar_popular_limit) || 5;
                    
                    if (d.landing_title) this.themeColors.landing_title = d.landing_title;
                    if (d.landing_subtitle) this.themeColors.landing_subtitle = d.landing_subtitle;
                    if (d.landing_cta_text) this.themeColors.landing_cta_text = d.landing_cta_text;
                    if (d.landing_cta_link) this.themeColors.landing_cta_link = d.landing_cta_link;
                    if (d.landing_image_1) this.themeColors.landing_image_1 = d.landing_image_1;
                    if (d.landing_image_2) this.themeColors.landing_image_2 = d.landing_image_2;
                    if (d.landing_image_3) this.themeColors.landing_image_3 = d.landing_image_3;
                }
            } catch(e) {}
            this.themeEditorOpen = true;
        },

        async saveThemeColors() {
            this.isSavingTheme = true;
            try {
                const token = localStorage.getItem('labmu_token');
                const res = await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify(this.themeColors)
                });
                if (res.ok) {
                    alert('✅ Pengaturan tema berhasil disimpan!');
                    this.themeEditorOpen = false;
                } else {
                    alert('❌ Gagal menyimpan.');
                }
            } catch(e) { alert('Error: ' + e.message); }
            finally { this.isSavingTheme = false; }
        },

        resetThemeColors() {
            this.themeColors = {
                theme_primary: '#2271b1',
                theme_primary_dark: '#135e96',
                theme_bg: '#ffffff',
                theme_text: '#1a1a2e',
                theme_accent: '#f0f7ff',
                header_logo_url: '',
                header_menu_position: 'right',
                header_text_color: '#334155',
                sidebar_popular_limit: 5,
                landing_title: '',
                landing_subtitle: '',
                landing_cta_text: 'Mulai Sekarang',
                landing_cta_link: '/admin',
                landing_image_1: '',
                landing_image_2: '',
                landing_image_3: ''
            };
        }
     }">

  <!-- Header -->
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
    <h2>Themes</h2>
    <button class="btn" style="background:#f0f0f1; color:#333; border:1px solid #ccc;">Upload Theme (Pro)</button>
  </div>

  <!-- Theme Grid -->
  <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:25px;">
     <template x-for="t in availableThemes">
        <div class="card" style="padding:0; overflow:hidden; border:1px solid #dcdcde; box-shadow:0 1px 2px rgba(0,0,0,0.05); position:relative;">
           
           <div style="aspect-ratio: 4/3; background:#eee; position:relative; border-bottom:1px solid #eee;">
               <img :src="t.thumbnail || 'https://placehold.co/600x400/eee/ccc?text=No+Preview'" style="width:100%; height:100%; object-fit:cover;">
               
               <div x-show="t.active" style="position:absolute; top:10px; right:10px; background:#2271b1; color:#fff; padding:4px 10px; font-size:12px; font-weight:bold; border-radius:3px; box-shadow:0 2px 5px rgba(0,0,0,0.2);">
                  Active
               </div>
           </div>

           <div style="padding:15px;">
               <h3 x-text="t.name" style="margin:0 0 5px 0; font-size:16px;"></h3>
               <div style="font-size:12px; color:#666; margin-bottom:10px;">
                   By <span x-text="t.author"></span> &bull; v<span x-text="t.version"></span>
               </div>
               <p x-text="t.description" style="font-size:13px; color:#555; margin-bottom:15px; line-height:1.4; height:36px; overflow:hidden;"></p>
               
               <div style="display:flex; gap:10px;">
                   <button x-show="!t.active" @click="activateTheme(t.id)" class="btn" style="flex:1;">Activate</button>
                   <button x-show="!t.active" @click="deleteTheme(t.id)" class="btn" style="flex:1; background:#f6f7f7; color:#d63638; border:1px solid #dcdcde;">Delete</button>
                   <button x-show="t.active" @click="openThemeEditor()" class="btn" style="flex:1; background:#2271b1; color:#fff; border:none; cursor:pointer;">
                       🎨 Customize
                   </button>
               </div>
           </div>

        </div>
     </template>
  </div>

  <!-- ===== THEME EDITOR MODAL ===== -->
  <div x-show="themeEditorOpen" x-cloak style="position:fixed; top:0; left:0; right:0; bottom:0; z-index:9999;">
    <div style="width:100%; height:100%; background:rgba(0,0,0,0.5);" @click.self="themeEditorOpen=false">
      <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:#fff; width:90%; max-width:820px; max-height:90vh; border-radius:10px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 20px 50px rgba(0,0,0,0.3);">
        
        <!-- Modal Header -->
        <div style="padding:16px 20px; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; background:#f9fafb;">
            <div>
                <h3 style="margin:0; font-size:17px; color:#1f2937;">🎨 Customize Theme</h3>
                <p style="margin:2px 0 0; font-size:12px; color:#6b7280;">Ubah tampilan tema aktif (Newsroom)</p>
            </div>
            <button @click="themeEditorOpen=false" style="background:none; border:none; font-size:22px; cursor:pointer; color:#9ca3af; line-height:1;">&times;</button>
        </div>
        
        <!-- Modal Body -->
        <div style="flex:1; overflow-y:auto; padding:20px; display:grid; grid-template-columns:1fr 1fr; gap:20px;">
          
          <!-- Left: Config Fields -->
          <div style="display:grid; gap:14px; align-content:start; max-height: 60vh; overflow-y: auto; padding-right: 10px;">
            <h4 style="margin:0 0 4px; font-size:14px; color:#374151; border-bottom:1px solid #e5e7eb; padding-bottom:8px;">Header & Navigasi</h4>
            
            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">URL Logo Header (Opsional)</label>
              <div style="display:flex; gap:8px; align-items:center;">
                <input type="text" x-model="themeColors.header_logo_url" placeholder="https://example.com/logo.png" style="flex:1; padding:7px; border:1px solid #d1d5db; border-radius:5px; font-size:12px; font-family:monospace;">
              </div>
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">Posisi Menu Navigasi</label>
              <div style="display:flex; gap:8px; align-items:center;">
                <select x-model="themeColors.header_menu_position" style="flex:1; padding:7px; border:1px solid #d1d5db; border-radius:5px; font-size:12px;">
                  <option value="right">Kanan (Default)</option>
                  <option value="center">Tengah</option>
                  <option value="left">Kiri</option>
                </select>
              </div>
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">Warna Teks Header</label>
              <div style="display:flex; gap:8px; align-items:center;">
                <input type="color" x-model="themeColors.header_text_color" style="width:40px; height:34px; padding:2px; border:1px solid #d1d5db; border-radius:5px; cursor:pointer; flex-shrink:0;">
                <input type="text" x-model="themeColors.header_text_color" style="flex:1; padding:7px; border:1px solid #d1d5db; border-radius:5px; font-size:12px; font-family:monospace;">
              </div>
            </div>

            <h4 style="margin:10px 0 4px; font-size:14px; color:#374151; border-bottom:1px solid #e5e7eb; padding-bottom:8px;">Widget Sidebar</h4>
            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">Jumlah Artikel Terpopuler</label>
              <div style="display:flex; gap:8px; align-items:center;">
                <input type="number" x-model="themeColors.sidebar_popular_limit" min="1" max="20" style="flex:1; padding:7px; border:1px solid #d1d5db; border-radius:5px; font-size:12px;">
              </div>
            </div>

            <h4 style="margin:10px 0 4px; font-size:14px; color:#374151; border-bottom:1px solid #e5e7eb; padding-bottom:8px;">Warna Tema</h4>

            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">Warna Utama (Primary)</label>
              <div style="display:flex; gap:8px; align-items:center;">
                <input type="color" x-model="themeColors.theme_primary" style="width:40px; height:34px; padding:2px; border:1px solid #d1d5db; border-radius:5px; cursor:pointer; flex-shrink:0;">
                <input type="text" x-model="themeColors.theme_primary" style="flex:1; padding:7px; border:1px solid #d1d5db; border-radius:5px; font-size:12px; font-family:monospace;">
              </div>
              <p style="font-size:11px; color:#9ca3af; margin-top:3px;">Digunakan untuk tombol, link, header, badge.</p>
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">Warna Hover (Primary Dark)</label>
              <div style="display:flex; gap:8px; align-items:center;">
                <input type="color" x-model="themeColors.theme_primary_dark" style="width:40px; height:34px; padding:2px; border:1px solid #d1d5db; border-radius:5px; cursor:pointer; flex-shrink:0;">
                <input type="text" x-model="themeColors.theme_primary_dark" style="flex:1; padding:7px; border:1px solid #d1d5db; border-radius:5px; font-size:12px; font-family:monospace;">
              </div>
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">Warna Background Tema</label>
              <div style="display:flex; gap:8px; align-items:center;">
                <input type="color" x-model="themeColors.theme_bg" style="width:40px; height:34px; padding:2px; border:1px solid #d1d5db; border-radius:5px; cursor:pointer; flex-shrink:0;">
                <input type="text" x-model="themeColors.theme_bg" style="flex:1; padding:7px; border:1px solid #d1d5db; border-radius:5px; font-size:12px; font-family:monospace;">
              </div>
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">Warna Teks Global</label>
              <div style="display:flex; gap:8px; align-items:center;">
                <input type="color" x-model="themeColors.theme_text" style="width:40px; height:34px; padding:2px; border:1px solid #d1d5db; border-radius:5px; cursor:pointer; flex-shrink:0;">
                <input type="text" x-model="themeColors.theme_text" style="flex:1; padding:7px; border:1px solid #d1d5db; border-radius:5px; font-size:12px; font-family:monospace;">
              </div>
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px;">Warna Aksen (Background Ringan)</label>
              <div style="display:flex; gap:8px; align-items:center;">
                <input type="color" x-model="themeColors.theme_accent" style="width:40px; height:34px; padding:2px; border:1px solid #d1d5db; border-radius:5px; cursor:pointer; flex-shrink:0;">
                <input type="text" x-model="themeColors.theme_accent" style="flex:1; padding:7px; border:1px solid #d1d5db; border-radius:5px; font-size:12px; font-family:monospace;">
              </div>
              <p style="font-size:11px; color:#9ca3af; margin-top:3px;">Badge, blockquote, hover menu.</p>
            </div>


            <button @click="resetThemeColors()" style="margin-top:4px; padding:8px; background:#f3f4f6; border:1px solid #d1d5db; border-radius:6px; font-size:12px; cursor:pointer; color:#374151; text-align:center;">
                ↺ Reset ke Setelan Awal
            </button>
          </div>
          
          <!-- Right: Live Preview -->
          <div>
            <h4 style="margin:0 0 10px; font-size:14px; color:#374151; border-bottom:1px solid #e5e7eb; padding-bottom:8px;">Preview Langsung</h4>
            <div :style="'border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06); background:'+themeColors.theme_bg">
              
              <!-- Mini Header -->
              <div :style="'background:'+themeColors.theme_bg+'; border-bottom:1px solid #e5e7eb; padding:10px 14px; display:flex; align-items:center; justify-content:space-between;'">
                <template x-if="themeColors.header_logo_url">
                  <img :src="themeColors.header_logo_url" style="max-height: 20px;" alt="Logo">
                </template>
                <template x-if="!themeColors.header_logo_url">
                  <span :style="'font-weight:800; font-size:14px; color:'+themeColors.theme_primary">Nama Website</span>
                </template>
                <div style="display:flex; gap:6px;">
                  <span :style="'font-size:11px; padding:3px 8px; border-radius:4px; color:'+themeColors.theme_primary+'; background:'+themeColors.theme_accent">Menu 1</span>
                  <span :style="'font-size:11px; padding:3px 8px; border-radius:4px; color:'+themeColors.theme_primary+'; background:'+themeColors.theme_accent">Menu 2</span>
                </div>
              </div>
              
              <!-- Mini Hero -->
              <div :style="'background:linear-gradient(135deg,'+themeColors.theme_primary+','+themeColors.theme_primary_dark+'); padding:16px; color:#fff;'">
                <div style="font-weight:700; font-size:14px; margin-bottom:3px;">Selamat Datang!</div>
                <div style="font-size:12px; opacity:0.85;">Tagline website Anda di sini</div>
              </div>
              
              <!-- Mini Post Cards -->
              <div :style="'padding:14px; display:grid; grid-template-columns:1fr 1fr; gap:10px; background:'+themeColors.theme_bg">
                <div :style="'background:'+themeColors.theme_bg+'; border:1px solid #e5e7eb; border-radius:6px; padding:10px;'">
                  <span :style="'font-size:9px; font-weight:700; text-transform:uppercase; background:'+themeColors.theme_accent+'; color:'+themeColors.theme_primary+'; padding:2px 6px; border-radius:10px;'">Kategori</span>
                  <div :style="'font-weight:700; font-size:11px; margin:5px 0 4px; color:'+themeColors.theme_text">Judul Artikel Satu</div>
                  <div style="font-size:10px; color:#6b7280;">Cuplikan singkat artikel...</div>
                  <div :style="'margin-top:6px; font-size:10px; font-weight:600; color:'+themeColors.theme_primary">Baca →</div>
                </div>
                <div :style="'background:'+themeColors.theme_bg+'; border:1px solid #e5e7eb; border-radius:6px; padding:10px;'">
                  <span :style="'font-size:9px; font-weight:700; text-transform:uppercase; background:'+themeColors.theme_accent+'; color:'+themeColors.theme_primary+'; padding:2px 6px; border-radius:10px;'">Berita</span>
                  <div :style="'font-weight:700; font-size:11px; margin:5px 0 4px; color:'+themeColors.theme_text">Judul Artikel Dua</div>
                  <div style="font-size:10px; color:#6b7280;">Cuplikan singkat artikel...</div>
                  <div :style="'margin-top:6px; font-size:10px; font-weight:600; color:'+themeColors.theme_primary">Baca →</div>
                </div>
              </div>

              <!-- Mini Footer -->
              <div :style="'background:'+themeColors.theme_bg+'; border-top:1px solid #e5e7eb; padding:8px; text-align:center; font-size:10px; color:#9ca3af;'">
                © 2025 Nama Website &bull; Powered by LabMu CMS
              </div>
            </div>
            <p style="font-size:11px; color:#9ca3af; margin-top:8px; text-align:center;">Preview berubah saat warna diubah</p>
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div style="padding:14px 20px; border-top:1px solid #e5e7eb; display:flex; justify-content:flex-end; gap:10px; background:#f9fafb;">
            <button @click="themeEditorOpen=false" style="padding:9px 18px; background:#f3f4f6; border:1px solid #d1d5db; border-radius:6px; cursor:pointer; font-size:14px;">Batal</button>
            <button @click="saveThemeColors()" :disabled="isSavingTheme"
                    style="padding:9px 20px; background:#2271b1; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:14px; font-weight:600; display:flex; align-items:center; gap:6px;">
                <i class="fas" :class="isSavingTheme ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                <span x-text="isSavingTheme ? 'Menyimpan...' : 'Simpan Perubahan'"></span>
            </button>
        </div>
        
      </div>
    </div>
  </div>

</div>
`;