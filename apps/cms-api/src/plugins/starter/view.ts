export const starterPluginView = `
<div x-data="{
  items: [],
  isLoading: false,
  newItemTitle: '',
  toastMsg: '',
  toastType: 'success',

  showToast(msg, type = 'success') {
    this.toastMsg = msg;
    this.toastType = type;
    setTimeout(() => { this.toastMsg = ''; }, 3500);
  },

  async loadItems() {
    this.isLoading = true;
    try {
      const res = await fetch('/api/plugins/starter/items');
      const json = await res.json();
      if (json.success) {
        this.items = json.data || [];
      }
    } catch (e) {
      this.showToast('Gagal memuat data plugin: ' + e.message, 'error');
    } finally {
      this.isLoading = false;
    }
  },

  async addItem() {
    if (!this.newItemTitle.trim()) {
      this.showToast('Judul item wajib diisi', 'error');
      return;
    }
    try {
      const res = await fetch('/api/plugins/starter/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: this.newItemTitle })
      });
      const json = await res.json();
      if (json.success) {
        this.items.push({ id: Date.now(), title: this.newItemTitle, status: 'enabled' });
        this.newItemTitle = '';
        this.showToast('Item berhasil ditambahkan ke plugin!', 'success');
      }
    } catch (e) {
      this.showToast('Gagal menambahkan item: ' + e.message, 'error');
    }
  }
}" x-init="loadItems()" class="space-y-6">

  <!-- IN-SYSTEM FLOATING TOAST -->
  <div x-show="toastMsg" x-cloak
       x-transition:enter="transition ease-out duration-300"
       x-transition:enter-start="opacity-0 transform translate-y-2"
       x-transition:enter-end="opacity-100 transform translate-y-0"
       x-transition:leave="transition ease-in duration-200"
       x-transition:leave-start="opacity-100 transform translate-y-0"
       x-transition:leave-end="opacity-0 transform translate-y-2"
       :class="toastType === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'"
       style="position:fixed; bottom:24px; right:24px; padding:12px 20px; border-radius:12px; font-size:13px; font-weight:700; z-index:99999; box-shadow:0 10px 25px rgba(0,0,0,0.2); display:flex; align-items:center; gap:8px;">
    <i :class="toastType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
    <span x-text="toastMsg"></span>
  </div>

  <!-- HEADER -->
  <div class="flex items-center justify-between pb-4 border-b border-slate-200">
    <div>
      <h2 class="text-xl font-bold text-slate-800 m-0 flex items-center gap-2">
        <i class="fas fa-cube text-primary"></i> Starter Plugin
      </h2>
      <p class="text-xs text-slate-500 m-0 mt-1">
        Template percontohan plugin kustom developer. Anda bebas menambahkan fitur tanpa mengubah Core CMSMu.
      </p>
    </div>
    <div class="flex items-center gap-2">
      <button type="button" @click="loadItems()" class="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-all flex items-center gap-1.5">
        <i class="fas fa-sync-alt" :class="isLoading ? 'fa-spin' : ''"></i> Refresh
      </button>
    </div>
  </div>

  <!-- CONTENT CARD -->
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
    <div class="max-w-md">
      <label class="block text-xs font-bold text-slate-700 mb-2">Tambah Item Contoh</label>
      <div class="flex gap-2">
        <input type="text" x-model="newItemTitle" placeholder="Ketik nama item..." class="flex-1 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
        <button type="button" @click="addItem()" class="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-all">
          Simpan
        </button>
      </div>
    </div>

    <!-- LIST ITEMS -->
    <div>
      <h3 class="text-sm font-bold text-slate-700 mb-3">Daftar Item Starter Plugin</h3>
      <template x-if="items.length === 0">
        <div class="p-8 text-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-xs">
          Belum ada item yang terdaftar. Tambahkan item pertama Anda di atas.
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <template x-for="item in items" :key="item.id">
          <div class="p-4 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between">
            <span class="text-sm font-semibold text-slate-800" x-text="item.title"></span>
            <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800" x-text="item.status"></span>
          </div>
        </template>
      </div>
    </div>
  </div>

</div>
`;
