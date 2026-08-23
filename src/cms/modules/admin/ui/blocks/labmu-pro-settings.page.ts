export const labmuProSettingsPage = `
<div x-show="view==='labmu-pro-settings'"
     x-data="{
        isSaving: false,
        proConfig: {
            header_style: '1',
            show_topbar: true,
            show_ad_header: true,
            footer_style: 'dark',
            single_template: '1',
            show_author_box: true,
            show_related_posts: true
        },

        async initLabmuProSettings() {
            try {
                const token = '';
                const res = await fetch('/api/settings', { headers: { 'Authorization': 'Bearer ' + token } });
                if (res.ok) {
                    const json = await res.json();
                    const d = json.data || json;
                    if (d.labmu_header_style) this.proConfig.header_style = d.labmu_header_style;
                    if (d.labmu_show_topbar !== undefined) this.proConfig.show_topbar = d.labmu_show_topbar === 'true' || d.labmu_show_topbar === true;
                    if (d.labmu_show_ad_header !== undefined) this.proConfig.show_ad_header = d.labmu_show_ad_header === 'true' || d.labmu_show_ad_header === true;
                    if (d.labmu_footer_style) this.proConfig.footer_style = d.labmu_footer_style;
                    if (d.labmu_single_template) this.proConfig.single_template = d.labmu_single_template;
                    if (d.labmu_show_author_box !== undefined) this.proConfig.show_author_box = d.labmu_show_author_box === 'true' || d.labmu_show_author_box === true;
                    if (d.labmu_show_related_posts !== undefined) this.proConfig.show_related_posts = d.labmu_show_related_posts === 'true' || d.labmu_show_related_posts === true;
                }
            } catch(e) { console.error('Error loading LabMu Pro settings:', e); }
        },

        async saveLabmuProSettings() {
            this.isSaving = true;
            try {
                const payload = {
                    labmu_header_style: this.proConfig.header_style,
                    labmu_show_topbar: this.proConfig.show_topbar.toString(),
                    labmu_show_ad_header: this.proConfig.show_ad_header.toString(),
                    labmu_footer_style: this.proConfig.footer_style,
                    labmu_single_template: this.proConfig.single_template,
                    labmu_show_author_box: this.proConfig.show_author_box.toString(),
                    labmu_show_related_posts: this.proConfig.show_related_posts.toString()
                };
                const token = '';
                const res = await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    alert('✅ Pengaturan Tema LabMu Pro berhasil disimpan!');
                } else {
                    alert('❌ Gagal menyimpan.');
                }
            } catch(e) { alert('Error: ' + e.message); }
            finally { this.isSaving = false; }
        }
     }"
     x-init="initLabmuProSettings()">

  <!-- Header -->
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
    <div>
        <h2 class="text-2xl font-bold text-slate-800">LabMu Pro Theme Settings</h2>
        <p class="text-sm text-slate-500">Sesuaikan tampilan tema eksklusif LabMu Pro</p>
    </div>
    <button @click="saveLabmuProSettings()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors flex items-center gap-2">
        <i class="fas fa-save" x-show="!isSaving"></i>
        <i class="fas fa-spinner fa-spin" x-show="isSaving"></i>
        Simpan Pengaturan
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- HEADER SETTINGS -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-lg font-bold text-slate-800 border-b pb-3 mb-4"><i class="fas fa-heading mr-2"></i> Header Settings</h3>

          <div class="mb-4">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Header Style</label>
              <select x-model="proConfig.header_style" class="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border">
                  <option value="1">Style 1 (Magazine - Logo Kiri, Iklan Kanan)</option>
                  <option value="2">Style 2 (Magazine - Logo Tengah Besar)</option>
                  <option value="classic">Classic (Standard LabMu Pro Header)</option>
              </select>
          </div>

          <div class="mb-4">
              <label class="flex items-center cursor-pointer">
                  <input type="checkbox" x-model="proConfig.show_topbar" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                  <span class="ml-2 text-sm font-medium text-slate-700">Tampilkan Top Bar (Tanggal & Social) - Berlaku untuk Style 1 & 2</span>
              </label>
          </div>

          <div class="mb-4">
              <label class="flex items-center cursor-pointer">
                  <input type="checkbox" x-model="proConfig.show_ad_header" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                  <span class="ml-2 text-sm font-medium text-slate-700">Tampilkan Slot Iklan Header 728x90 - Berlaku untuk Style 1 & 2</span>
              </label>
          </div>
      </div>

      <!-- FOOTER SETTINGS -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-lg font-bold text-slate-800 border-b pb-3 mb-4"><i class="fas fa-shoe-prints mr-2"></i> Footer Settings</h3>

          <div class="mb-4">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Footer Style</label>
              <select x-model="proConfig.footer_style" class="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border">
                  <option value="classic">Classic (Standard LabMu Pro Footer)</option>
                  <option value="dark">Magazine Dark Mode (Hitam Elegan)</option>
                  <option value="light">Magazine Light Mode (Putih Minimalis)</option>
              </select>
          </div>
      </div>

      <!-- SINGLE POST SETTINGS -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-lg font-bold text-slate-800 border-b pb-3 mb-4"><i class="fas fa-file-alt mr-2"></i> Single Post Settings</h3>

          <div class="mb-4">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Post Template</label>
              <select x-model="proConfig.single_template" class="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border">
                  <option value="classic">Classic (Standard LabMu Pro Post)</option>
                  <option value="1">Magazine Template 1 (Featured Image Full Width dengan Judul Besar)</option>
                  <option value="2">Magazine Template 2 (Featured Image Boxed Klasik)</option>
              </select>
          </div>

          <div class="mb-4">
              <label class="flex items-center cursor-pointer">
                  <input type="checkbox" x-model="proConfig.show_author_box" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                  <span class="ml-2 text-sm font-medium text-slate-700">Tampilkan Author Box di Bawah Artikel (Magazine)</span>
              </label>
          </div>

          <div class="mb-4">
              <label class="flex items-center cursor-pointer">
                  <input type="checkbox" x-model="proConfig.show_related_posts" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                  <span class="ml-2 text-sm font-medium text-slate-700">Tampilkan Related Posts (Artikel Terkait) (Magazine)</span>
              </label>
          </div>
      </div>

  </div>

</div>
`;
