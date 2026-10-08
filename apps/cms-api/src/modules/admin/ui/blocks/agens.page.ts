export const agensPage = `
<div x-show="view==='agens'">
  <div style="display:flex; justify-content:space-between; margin-bottom:20px; align-items:center;">
    <div>
        <h2 style="margin:0;">Agen & Perwakilan</h2>
        <p style="margin:5px 0 0 0; color:#666; font-size:13px;">Kelola daftar agen resmi Suara 'Aisyiyah.</p>
    </div>
    <div style="display:flex; gap:10px;">
        <input type="text" x-model="searchAgen" @input="agenPage = 1" placeholder="Cari agen..." class="input" style="width: 250px; margin-bottom:0;">
        <button @click="openAddAgen()" class="btn btn-primary"><i class="fas fa-plus"></i> Tambah Agen</button>
    </div>
  </div>

  <div class="card" style="padding:0; overflow:hidden;">
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

  <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:#fff; border-top:1px solid #ddd; border-bottom-left-radius:8px; border-bottom-right-radius:8px;">
    <div style="font-size:13px; color:#666;">
      Menampilkan <span x-text="pagedAgens().length"></span> dari <span x-text="filteredAgens().length"></span> agen
    </div>
    <div style="display:flex; gap:5px;">
        <button class="btn" style="padding:5px 10px;" @click="prevAgenPage()" :disabled="agenPage <= 1">&laquo;</button>
        <div style="padding:5px 10px; background:#f8f9fa; border:1px solid #ddd; border-radius:4px; font-size:13px;">
            Halaman <span x-text="agenPage"></span> / <span x-text="totalAgenPages()"></span>
        </div>
        <button class="btn" style="padding:5px 10px;" @click="nextAgenPage()" :disabled="agenPage >= totalAgenPages()">&raquo;</button>
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

  <!-- Modal Form Agen -->
  <div class="modal-overlay" x-show="showAgenModal" x-transition.opacity style="display:none;">
    <div class="modal-box" style="max-width:500px; height:auto; overflow:visible;" @click.away="showAgenModal=false">
        <div class="modal-header">
            <h3 style="margin:0; font-size:18px;" x-text="editingAgenId ? 'Edit Agen' : 'Tambah Agen Baru'"></h3>
            <button @click="showAgenModal = false" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
        </div>
        <div style="padding:25px;">
            <div style="margin-bottom:15px;">
                <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">Nama Agen *</label>
                <input type="text" x-model="agenForm.name" class="input" placeholder="Masukkan nama agen...">
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                <div>
                    <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">Wilayah / Kota</label>
                    <input type="text" x-model="agenForm.area" class="input" placeholder="Contoh: Yogyakarta">
                </div>
                <div>
                    <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">No. Telepon</label>
                    <textarea x-model="agenForm.phone" class="input" style="height:38px; resize:vertical; padding-top:8px;" placeholder="(0274) ..."></textarea>
                </div>
            </div>
            
            <div style="margin-bottom:15px;">
                <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">No. WhatsApp</label>
                <textarea x-model="agenForm.whatsapp" class="input" style="height:38px; resize:vertical; padding-top:8px;" placeholder="0812..., 0813..."></textarea>
                <small style="color:#888; font-size:10px; display:block; margin-top:4px;">Pisahkan dengan koma jika ada lebih dari 1 nomor WA.</small>
            
            </div>

            <div style="margin-bottom:15px;">
                <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">Alamat Lengkap</label>
                <textarea x-model="agenForm.address" class="input" style="height: 80px; resize:vertical;" placeholder="Alamat lengkap agen..."></textarea>
            </div>
            
            <div style="margin-bottom:15px;">
                <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">Link Google Maps (Opsional)</label>
                <input type="text" x-model="agenForm.map_link" class="input" placeholder="https://maps.google.com/...">
            </div>
            
            <div style="margin-top:25px; display:flex; justify-content:flex-end; gap:10px;">
                <button @click="showAgenModal = false" class="btn" style="background:#fff; color:#333; border-color:#ccc;">Batal</button>
                <button @click="saveAgen()" class="btn btn-primary">Simpan Agen</button>
            </div>
        </div>
    </div>
  </div>
</div>
`;
