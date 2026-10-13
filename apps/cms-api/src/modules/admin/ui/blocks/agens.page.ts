export const agensPage = `
<div x-show="view==='agens'">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
    <div>
        <h2 class="text-xl font-bold text-slate-800 m-0">Agen & Perwakilan</h2>
        <p class="text-xs text-slate-500 m-0 mt-0.5">Kelola daftar agen resmi Suara 'Aisyiyah.</p>
    </div>
    <div class="flex items-center gap-2 w-full sm:w-auto">
        <div class="relative flex-1 sm:w-64">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input type="text" x-model="searchAgen" @input="agenPage = 1" placeholder="Cari agen / wilayah..." 
                 class="input w-full pl-8 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-md outline-none">
        </div>
        <button @click="openAddAgen()" class="btn min-h-[38px] px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm text-xs sm:text-sm flex items-center gap-1.5 flex-shrink-0 active:scale-95 transition-all">
          <i class="fas fa-plus"></i> <span>Tambah</span>
        </button>
    </div>
  </div>

  <div class="card p-0 overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm mb-6">
    <!-- Desktop Table View (Hidden di Mobile) -->
    <div class="hidden md:block overflow-x-auto">
      <table class="wp-table" style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:#f8f9fa; border-bottom:2px solid #ddd;">
            <th style="text-align:left; padding:12px;">Nama Agen</th>
            <th style="text-align:left;">Wilayah</th>
            <th style="text-align:left;">No. Telp</th>
            <th style="text-align:left;">WhatsApp</th>
            <th style="text-align:left;">Alamat</th>
            <th width="120" style="text-align:center;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <template x-for="a in pagedAgens()" :key="a.id">
            <tr style="border-bottom:1px solid #eee;">
              <td style="padding:12px; font-weight: 600;" x-text="a.name"></td>
              <td x-text="a.area"></td>
              <td x-text="a.phone"></td>
              <td x-text="a.whatsapp"></td>
              <td x-text="a.address" style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
              <td style="text-align:center; padding:12px;">
                <div style="display:flex; justify-content:center; gap:5px;">
                  <button @click="viewAgen(a)" class="btn-icon" style="color:#17a2b8;" title="Lihat"><i class="fas fa-eye"></i></button>
                  <button @click="editAgen(a)" class="btn-icon" style="color:#f39c12;" title="Edit"><i class="fas fa-pencil-alt"></i></button>
                  <button @click="deleteAgen(a.id)" class="btn-icon" style="color:#e74c3c;" title="Hapus"><i class="fas fa-trash-alt"></i></button>
                </div>
              </td>
            </tr>
          </template>
          <tr x-show="filteredAgens().length === 0 && !isLoadingAgens">
            <td colspan="6" style="padding:30px; text-align:center; color:#999;">Belum ada data agen.</td>
          </tr>
          <tr x-show="isLoadingAgens">
            <td colspan="6" style="padding:30px; text-align:center; color:#999;"><i class="fas fa-spinner fa-spin"></i> Memuat...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Vertical Card List View (Block di Mobile) -->
    <div class="block md:hidden divide-y divide-slate-100">
      <template x-for="a in pagedAgens()" :key="'mob_agen_' + a.id">
        <div class="p-3.5 bg-white space-y-2.5">
          <!-- Nama & Wilayah -->
          <div class="flex items-start justify-between gap-2">
            <div>
              <h4 class="text-sm font-bold text-slate-800 m-0" x-text="a.name"></h4>
              <div class="text-xs text-slate-500 mt-1 flex items-center gap-1.5" x-show="a.address">
                <i class="fas fa-map-marker-alt text-slate-400 text-[10px] shrink-0"></i>
                <span class="line-clamp-2" x-text="a.address"></span>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0" x-text="a.area || 'Nasional'"></span>
          </div>

          <!-- Quick Contact Bar (Telp & WA) -->
          <div class="flex items-center gap-2 pt-1 text-xs">
            <template x-if="a.whatsapp">
              <a :href="'https://wa.me/' + (a.whatsapp || '').replace(/[^0-9]/g, '')" target="_blank" rel="noopener" 
                 class="min-h-[36px] px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1.5 active:scale-95 transition-all">
                <i class="fab fa-whatsapp text-emerald-600"></i>
                <span x-text="a.whatsapp"></span>
              </a>
            </template>
            <template x-if="a.phone">
              <a :href="'tel:' + a.phone" 
                 class="min-h-[36px] px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 border border-slate-200 font-medium flex items-center gap-1.5 active:scale-95 transition-all">
                <i class="fas fa-phone-alt text-slate-500 text-[10px]"></i>
                <span x-text="a.phone"></span>
              </a>
            </template>
          </div>

          <!-- Action Bar Mobile (min 40px) -->
          <div class="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100">
            <button type="button" @click="viewAgen(a)" 
                    class="min-h-[40px] px-2 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 font-semibold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all">
              <i class="fas fa-eye text-cyan-600"></i>
              <span>Detail</span>
            </button>
            <button type="button" @click="editAgen(a)" 
                    class="min-h-[40px] px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all">
              <i class="fas fa-pencil-alt text-amber-600"></i>
              <span>Edit</span>
            </button>
            <button type="button" @click="deleteAgen(a.id)" 
                    class="min-h-[40px] px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-medium text-xs flex items-center justify-center gap-1 active:scale-95 transition-all">
              <i class="fas fa-trash-alt text-xs"></i>
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </template>

      <!-- Empty & Loading Mobile -->
      <div x-show="filteredAgens().length === 0 && !isLoadingAgens" class="p-8 text-center text-slate-400 text-sm">
        Belum ada data agen.
      </div>
      <div x-show="isLoadingAgens" class="p-8 text-center text-slate-400 text-sm">
        <i class="fas fa-spinner fa-spin mr-1"></i> Memuat data agen...
      </div>
    </div>

    <!-- Pagination Footer Responsif -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-3 p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
      <div>
        Menampilkan <span class="font-bold text-slate-800" x-text="pagedAgens().length"></span> dari <span class="font-bold text-slate-800" x-text="filteredAgens().length"></span> agen
      </div>
      <div class="flex items-center gap-2">
          <button class="min-h-[38px] px-3 py-1.5 bg-white border border-slate-300 rounded-md shadow-sm active:scale-95" @click="prevAgenPage()" :disabled="agenPage <= 1">&laquo; Prev</button>
          <span class="px-2 font-bold text-slate-700" x-text="'Hal ' + agenPage + ' / ' + totalAgenPages()"></span>
          <button class="min-h-[38px] px-3 py-1.5 bg-white border border-slate-300 rounded-md shadow-sm active:scale-95" @click="nextAgenPage()" :disabled="agenPage >= totalAgenPages()">Next &raquo;</button>
      </div>
    </div>
  </div>

  <!-- Modal View Agen -->
  <div class="modal-overlay" x-show="showViewModal" x-transition.opacity style="display:none;">
    <div class="modal-box" style="max-width:450px; height:auto; overflow:visible;" @click.away="showViewModal=false">
        <div class="modal-header">
            <h3 style="margin:0; font-size:18px;">Detail Agen</h3>
            <button @click="showViewModal = false" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
        </div>
        <div style="padding:25px; line-height: 1.6;">
            <p style="margin:0 0 10px 0;"><strong>Nama:</strong> <span x-text="viewingAgen.name"></span></p>
            <p style="margin:0 0 10px 0;"><strong>Wilayah:</strong> <span x-text="viewingAgen.area"></span></p>
            <p style="margin:0 0 10px 0;"><strong>No. Telp:</strong> <span x-text="viewingAgen.phone"></span></p>
            <p style="margin:0 0 10px 0;"><strong>WhatsApp:</strong> <span x-text="viewingAgen.whatsapp"></span></p>
            <p style="margin:0 0 10px 0;"><strong>Alamat:</strong> <span x-text="viewingAgen.address"></span></p>
        </div>
        <div style="padding:15px 25px; border-top:1px solid #eee; text-align:right; background:#fcfcfc; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
            <button @click="showViewModal = false" class="btn" style="background:#fff; color:#333; border-color:#ccc;">Tutup</button>
        </div>
    </div>
  </div>

  <!-- Modal Form Agen Responsif -->
  <div class="modal-overlay" x-show="showAgenModal" x-transition.opacity style="display:none;">
    <div class="modal-box" style="max-width:500px; height:auto; overflow:visible;" @click.away="showAgenModal=false">
        <div class="modal-header">
            <h3 style="margin:0; font-size:18px;" x-text="editingAgenId ? 'Edit Agen' : 'Tambah Agen Baru'"></h3>
            <button @click="showAgenModal = false" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
        </div>
        <div style="padding:20px;">
            <div style="margin-bottom:15px;">
                <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">Nama Agen *</label>
                <input type="text" x-model="agenForm.name" class="input" placeholder="Masukkan nama agen..." style="width:100%; box-sizing:border-box;">
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                    <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">Wilayah / Kota</label>
                    <input type="text" x-model="agenForm.area" class="input" placeholder="Contoh: Yogyakarta" style="width:100%; box-sizing:border-box;">
                </div>
                <div>
                    <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">No. Telepon</label>
                    <input type="text" x-model="agenForm.phone" class="input" placeholder="(0274) ..." style="width:100%; box-sizing:border-box;">
                </div>
            </div>
            
            <div style="margin-bottom:15px;">
                <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">No. WhatsApp</label>
                <input type="text" x-model="agenForm.whatsapp" class="input" placeholder="0812..., 0813..." style="width:100%; box-sizing:border-box;">
                <small style="color:#888; font-size:10px; display:block; margin-top:4px;">Pisahkan dengan koma jika ada lebih dari 1 nomor WA.</small>
            </div>

            <div style="margin-bottom:15px;">
                <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">Alamat Lengkap</label>
                <textarea x-model="agenForm.address" class="input" style="height: 80px; resize:vertical; width:100%; box-sizing:border-box;" placeholder="Alamat lengkap agen..."></textarea>
            </div>
            
            <div style="margin-bottom:15px;">
                <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">Link Google Maps (Opsional)</label>
                <input type="text" x-model="agenForm.map_link" class="input" placeholder="https://maps.google.com/..." style="width:100%; box-sizing:border-box;">
            </div>
            
            <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:10px;">
                <button @click="showAgenModal = false" class="btn" style="background:#fff; color:#333; border-color:#ccc; padding:8px 16px;">Batal</button>
                <button @click="saveAgen()" class="btn btn-primary" style="padding:8px 16px;">Simpan Agen</button>
            </div>
        </div>
    </div>
  </div>
</div>
`;
