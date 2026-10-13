export const pluginsPage = `
<div x-show="view === 'plugins'" class="space-y-6">
  <!-- Header Page Responsif -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
    <div>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg shrink-0">
          <i class="fas fa-puzzle-piece"></i>
        </div>
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-slate-800 tracking-tight m-0">Kelola Plugin & Ekstensi</h2>
          <p class="text-xs text-slate-500 mt-0.5">Aktifkan, nonaktifkan, atau kelola plugin sistem Core CMSMu.</p>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
      <button @click="loadPlugins()" class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors active:scale-95">
        <i class="fas fa-sync-alt"></i> Segarkan
      </button>
      <button @click="showAddPluginModal = true" class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-colors active:scale-95">
        <i class="fas fa-plus"></i> Tambah Plugin
      </button>
    </div>
  </div>

  <!-- Plugins Grid / List -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <template x-for="p in availablePlugins" :key="p.id">
      <div class="bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
           :class="p.active ? 'border-teal-200 ring-1 ring-teal-500/10' : 'border-slate-200 opacity-80'">
        
        <!-- Card Header & Info -->
        <div>
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold"
                   :class="p.active ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'">
                <i class="fas" :class="p.id === 'ota' ? 'fa-cloud-upload-alt' : 'fa-plug'"></i>
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-800 tracking-tight" x-text="p.name"></h3>
                <div class="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span>v<span x-text="p.version || '1.0.0'"></span></span>
                  <span>&bull;</span>
                  <span>Oleh <span class="font-medium text-slate-600" x-text="p.author || 'CMSMu'"></span></span>
                </div>
              </div>
            </div>

            <!-- Status Badge -->
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 shadow-sm"
                  :class="p.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'">
              <span class="w-1.5 h-1.5 rounded-full" :class="p.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
              <span x-text="p.active ? 'Aktif' : 'Nonaktif'"></span>
            </span>
          </div>

          <!-- Description -->
          <p class="text-xs text-slate-600 leading-relaxed mb-4" x-text="p.description || 'Tidak ada deskripsi.'"></p>
        </div>

        <!-- Action Buttons -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div class="text-[11px] font-mono text-slate-400">
            ID: <span class="text-slate-600 font-semibold" x-text="p.id"></span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Toggle Button -->
            <button x-show="!p.active" @click="togglePlugin(p.id, true)"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex items-center gap-1.5">
              <i class="fas fa-toggle-on text-teal-600"></i> Aktifkan
            </button>
            <button x-show="p.active" @click="togglePlugin(p.id, false)"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1.5">
              <i class="fas fa-toggle-off text-amber-600"></i> Nonaktifkan
            </button>

            <!-- Delete Button (OTA is Protected Core Addon) -->
            <template x-if="p.id === 'ota'">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200" title="Plugin sistem inti tidak dapat dihapus">
                <i class="fas fa-lock text-[9px] text-slate-400"></i> Terproteksi
              </span>
            </template>
            <template x-if="p.id !== 'ota'">
              <button @click="deletePlugin(p.id, p.name)"
                      class="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Plugin">
                <i class="fas fa-trash-alt text-xs"></i>
              </button>
            </template>
          </div>
        </div>

      </div>
    </template>
  </div>

  <!-- Empty State -->
  <template x-if="availablePlugins.length === 0">
    <div class="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div class="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3 text-xl">
        <i class="fas fa-box-open"></i>
      </div>
      <h4 class="text-sm font-bold text-slate-700">Belum Ada Plugin Terpasang</h4>
      <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Klik tombol "Tambah Plugin" di atas untuk mendaftarkan plugin atau ekstensi baru ke CMSMu.</p>
    </div>
  </template>

  <!-- Modal Tambah Plugin -->
  <div x-show="showAddPluginModal" x-transition.opacity.duration.200ms
       class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" style="display: none;">
    <div @click.outside="showAddPluginModal = false" class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 transform transition-all">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <i class="fas fa-plus-circle"></i>
          </div>
          <h3 class="text-base font-bold text-slate-800">Daftarkan Plugin Baru</h3>
        </div>
        <button @click="showAddPluginModal = false" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="saveNewPlugin()" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">ID Plugin (Slug Unik)</label>
          <input type="text" x-model="newPluginForm.id" placeholder="contoh: newsletter-pro" required
                 class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono">
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">Nama Plugin</label>
          <input type="text" x-model="newPluginForm.name" placeholder="contoh: Newsletter & Email Broadcast" required
                 class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">Deskripsi Singkat</label>
          <textarea x-model="newPluginForm.description" rows="3" placeholder="Jelaskan fungsi plugin..."
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Author / Pengembang</label>
            <input type="text" x-model="newPluginForm.author" placeholder="Nama Pembuat"
                   class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Versi</label>
            <input type="text" x-model="newPluginForm.version" placeholder="1.0.0"
                   class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button type="button" @click="showAddPluginModal = false"
                  class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Batal</button>
          <button type="submit"
                  class="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-colors">Simpan Plugin</button>
        </div>
      </form>
    </div>
  </div>
</div>
`;
