export const emagazinePage = `
<div x-init="loadMagazines(); loadPlansConfig();">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; flex-wrap:wrap; gap:10px;">
        <div>
            <h2 style="margin:0; color:#1e293b; font-size:24px; font-weight:700;">E-Majalah (PDF Interaktif)</h2>
            <p style="margin:4px 0 0 0; color:#64748b; font-size:14px;">Kelola majalah Suara 'Aisyiyah edisi cetak dalam format digital interaktif dan atur paket kuota langganan.</p>
        </div>
        <div style="display:flex; gap:10px;">
            <button x-show="magTab === 'editions'" @click="openMagModal()" class="btn" style="background:#059669; color:#fff; border:none; padding:10px 18px; border-radius:8px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px;">
                <i class="fas fa-plus"></i> Tambah Edisi Majalah
            </button>
            <button x-show="magTab === 'pricing'" @click="savePlansConfig()" :disabled="plansSaving" class="btn" style="background:#059669; color:#fff; border:none; padding:10px 18px; border-radius:8px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px;">
                <i class="fas fa-save"></i> <span x-text="plansSaving ? 'Menyimpan...' : 'Simpan Pengaturan Paket'"></span>
            </button>
            <button @click="magTab === 'editions' ? loadMagazines() : loadPlansConfig()" class="btn" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:10px 15px; border-radius:8px; cursor:pointer;">
                <i class="fas fa-sync" :class="{'fa-spin': magLoading || plansLoading}"></i>
            </button>
        </div>
    </div>

    <!-- Filter Tabs & Pencarian -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div class="flex gap-2 bg-white border border-slate-200 rounded-xl p-1.5 w-fit shadow-sm">
            <button type="button" @click="magTab = 'editions'" 
                :class="magTab === 'editions' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-700'" 
                class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer">
                Daftar Edisi (<span x-text="magazinesList.length"></span>)
            </button>
            <button type="button" @click="magTab = 'pricing'; loadPlansConfig();" 
                :class="magTab === 'pricing' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-700'" 
                class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer">
                Setup Paket &amp; Harga Langganan
            </button>
        </div>

        <!-- Search Bar (Tab Editions) -->
        <div x-show="magTab === 'editions'" class="flex items-center gap-2">
            <div class="relative">
                <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input type="text" x-model="magSearch" @input="magCurrentPage = 1" 
                    placeholder="Cari judul, edisi, tahun..." 
                    class="pl-9 pr-7 py-2 text-xs border border-slate-200 bg-white rounded-xl shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-all">
                <button type="button" x-show="magSearch" @click="magSearch = ''; magCurrentPage = 1" 
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm border-0 bg-transparent cursor-pointer p-0 leading-none">&times;</button>
            </div>
        </div>
    </div>

    <!-- TAB 1: TABEL EMAGAZINES -->
    <div x-show="magTab === 'editions'">
        <div class="card" style="padding:0; overflow-x:auto; background:#fff; border-radius:12px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
            <table class="table" style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0; text-align:left;">
                        <th style="padding:14px 16px; font-weight:600; color:#475569; font-size:13px;">Sampul</th>
                        <th style="padding:14px 16px; font-weight:600; color:#475569; font-size:13px;">Judul & Edisi</th>
                        <th style="padding:14px 16px; font-weight:600; color:#475569; font-size:13px;">Bulan/Tahun</th>
                        <th style="padding:14px 16px; font-weight:600; color:#475569; font-size:13px;">Akses</th>
                        <th style="padding:14px 16px; font-weight:600; color:#475569; font-size:13px;">Preview Bebas</th>
                        <th style="padding:14px 16px; font-weight:600; color:#475569; font-size:13px;">Status</th>
                        <th style="padding:14px 16px; font-weight:600; color:#475569; font-size:13px; text-align:right;">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <template x-if="getFilteredMagazines().length === 0">
                        <tr>
                            <td colspan="7" style="text-align:center; padding:40px; color:#94a3b8;">
                                <i :class="magSearch ? 'fas fa-search' : 'fas fa-book-open'" style="font-size:32px; margin-bottom:12px; display:block; opacity:0.4;"></i>
                                <span x-text="magSearch ? ('Tidak ada edisi majalah yang cocok dengan pencarian \\'' + magSearch + '\\'.') : 'Belum ada edisi majalah. Klik tombol \\'Tambah Edisi Majalah\\' untuk mengunggah berkas PDF edisi baru.'"></span>
                            </td>
                        </tr>
                    </template>
                    <template x-for="mag in getPaginatedMagazines()" :key="mag.id">
                        <tr style="border-bottom:1px solid #e2e8f0; transition:background 0.2s;" class="hover:bg-gray-50">
                            <td style="padding:12px 16px; width:80px;">
                                <img :src="mag.coverImage || '/api/media/file/images/default-cover.jpg'" style="width:54px; height:72px; object-fit:cover; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,0.1); display:block;" onerror="this.src='https://placehold.co/100x140?text=Cover'">
                            </td>
                            <td style="padding:12px 16px;">
                                <div style="font-weight:700; color:#0f172a; font-size:14px;" x-text="mag.title"></div>
                                <div style="font-size:12px; color:#64748b; margin-top:2px;" x-text="mag.editionNumber || '- -'"></div>
                                <div style="font-size:11px; color:#94a3b8; margin-top:2px;"><code x-text="'/majalah/' + mag.slug"></code></div>
                            </td>
                            <td style="padding:12px 16px; color:#334155; font-size:13px; font-weight:500;" x-text="mag.publicationDate || '- -'"></td>
                            <td style="padding:12px 16px;">
                                <span style="font-size:11px; font-weight:700; padding:4px 8px; border-radius:4px; display:inline-flex; align-items:center; gap:4px;"
                                    :style="mag.isFree === 1 ? 'background:#e0f2fe; color:#0369a1;' : 'background:#fef3c7; color:#92400e;'">
                                    <i :class="mag.isFree === 1 ? 'fas fa-lock-open' : 'fas fa-lock'"></i>
                                    <span x-text="mag.isFree === 1 ? 'Bebas Akses' : 'Pelanggan Pro'"></span>
                                </span>
                            </td>
                            <td style="padding:12px 16px; color:#64748b; font-size:13px;">
                                <span x-text="mag.previewPages || 5"></span> Halaman Pertama
                            </td>
                            <td style="padding:12px 16px;">
                                <span style="font-size:11px; font-weight:700; padding:4px 8px; border-radius:4px;"
                                    :style="mag.status === 'published' ? 'background:#dcfce7; color:#166534;' : 'background:#f1f5f9; color:#64748b;'"
                                    x-text="(mag.status || 'draft').toUpperCase()"></span>
                            </td>
                            <td style="padding:12px 16px; text-align:right;">
                                <div style="display:inline-flex; gap:6px;">
                                    <a :href="'/majalah/' + mag.slug" target="_blank" title="Buka Reader Publik" style="background:#3b82f6; color:#fff; width:32px; height:32px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; text-decoration:none; font-size:12px;">
                                        <i class="fas fa-external-link-alt"></i>
                                    </a>
                                    <button @click="openMagModal(mag)" title="Edit Metadata" style="background:#f8fafc; color:#334155; border:1px solid #cbd5e1; width:32px; height:32px; border-radius:6px; cursor:pointer; font-size:12px;">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button @click="deleteMagazine(mag.id)" title="Hapus Edisi" style="background:#fee2e2; color:#b91c1c; border:none; width:32px; height:32px; border-radius:6px; cursor:pointer; font-size:12px;">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>

            <!-- PAGINATION FOOTER -->
            <div x-show="getFilteredMagazines().length > 0" class="flex flex-wrap justify-between items-center px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 rounded-b-xl">
                <div>
                    Menampilkan <b x-text="((magCurrentPage - 1) * magItemsPerPage) + 1"></b> - 
                    <b x-text="Math.min(magCurrentPage * magItemsPerPage, getFilteredMagazines().length)"></b> 
                    dari <b x-text="getFilteredMagazines().length"></b> edisi
                    <template x-if="magSearch">
                        <span>(difilter dari <span x-text="magazinesList.length"></span> total)</span>
                    </template>
                </div>
                
                <div class="flex items-center gap-2">
                    <button type="button" @click="if(magCurrentPage > 1) magCurrentPage--" :disabled="magCurrentPage === 1" 
                        class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold transition-colors flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50">
                        <i class="fas fa-chevron-left text-[10px]"></i> Prev
                    </button>
                    
                    <span class="px-2 font-bold text-slate-700" x-text="'Hal ' + magCurrentPage + ' / ' + getMagTotalPages()"></span>
                    
                    <button type="button" @click="if(magCurrentPage < getMagTotalPages()) magCurrentPage++" :disabled="magCurrentPage === getMagTotalPages()" 
                        class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold transition-colors flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50">
                        Next <i class="fas fa-chevron-right text-[10px]"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- TAB 2: SETUP PAKET & HARGA LANGGANAN -->
    <div x-show="magTab === 'pricing'" style="display:none;" x-cloak>
        <!-- Alert Notification -->
        <template x-if="plansAlert.show">
            <div :style="plansAlert.type === 'success' ? 'background:#dcfce7; color:#166534; border:1px solid #86efac;' : 'background:#fee2e2; color:#991b1b; border:1px solid #fca5a5;'"
                style="padding:14px 18px; border-radius:10px; margin-bottom:20px; font-size:14px; font-weight:600; display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i :class="plansAlert.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
                    <span x-text="plansAlert.message"></span>
                </div>
                <button type="button" @click="plansAlert.show = false" style="background:none; border:none; color:inherit; cursor:pointer; font-size:16px;">&times;</button>
            </div>
        </template>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
            <div>
                <h3 style="margin:0; font-size:18px; font-weight:700; color:#0f172a;">Pengaturan Paket & Harga Kuota Berlangganan</h3>
                <p style="margin:4px 0 0 0; font-size:13px; color:#64748b;">Pengaturan ini disinkronkan langsung ke halaman pendaftaran publik (<a href="/berlangganan" target="_blank" style="color:#059669; font-weight:600;">/berlangganan</a>) dan sistem checkout.</p>
            </div>
            <button type="button" @click="savePlansConfig()" :disabled="plansSaving" class="btn" style="background:#059669; color:#fff; border:none; padding:10px 22px; border-radius:8px; font-weight:700; font-size:14px; cursor:pointer; display:flex; align-items:center; gap:8px; box-shadow:0 4px 6px -1px rgba(5,150,105,0.3);">
                <i class="fas fa-spinner fa-spin" x-show="plansSaving"></i>
                <i class="fas fa-save" x-show="!plansSaving"></i>
                <span x-text="plansSaving ? 'Menyimpan...' : 'Simpan Perubahan'"></span>
            </button>
        </div>

        <!-- 1. KARTU PAKET HARGA (4 PAKET) -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px; margin-bottom:24px;">
            <template x-for="(plan, idx) in plansConfig.plans" :key="plan.id">
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.05); display:flex; flex-direction:column; gap:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:10px;">
                        <span style="font-weight:800; font-size:15px; color:#0f172a;" x-text="'Paket ' + plan.months + ' Bulan'"></span>
                        <label style="display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:600; cursor:pointer;" :style="plan.active ? 'color:#059669;' : 'color:#94a3b8;'">
                            <input type="checkbox" x-model="plan.active" style="width:16px; height:16px; accent-color:#059669;">
                            <span x-text="plan.active ? 'Aktif' : 'Nonaktif'"></span>
                        </label>
                    </div>

                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Nama Label Paket</label>
                        <input type="text" x-model="plan.name" placeholder="Contoh: 1 Bulan" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; box-sizing:border-box;">
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div>
                            <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Durasi (Bulan)</label>
                            <input type="number" min="1" x-model.number="plan.months" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; box-sizing:border-box;">
                        </div>
                        <div>
                            <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Harga (Rp)</label>
                            <input type="number" min="0" step="1000" x-model.number="plan.price" placeholder="50000" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; font-weight:700; color:#059669; box-sizing:border-box;">
                        </div>
                    </div>

                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Badge / Label Promo (Opsional)</label>
                        <input type="text" x-model="plan.badge" placeholder="Contoh: HEMAT 10% atau ⭐ PALING HEMAT" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; box-sizing:border-box;">
                    </div>

                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Keterangan Singkat</label>
                        <input type="text" x-model="plan.desc" placeholder="Contoh: Akses Penuh 30 Hari atau Rp 45.000 / bln" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; box-sizing:border-box;">
                    </div>
                </div>
            </template>
        </div>

        <!-- 2. PENGATURAN REKENING BANK & KONTAK -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:16px; margin-bottom:24px;">
            <!-- Rekening Utama (Bank 1) -->
            <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="font-weight:700; font-size:15px; color:#0f172a; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-university" style="color:#059669;"></i> Rekening Transfer Utama
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Nama Bank</label>
                        <input type="text" x-model="plansConfig.bank1.name" placeholder="Bank Syariah Indonesia (BSI)" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; box-sizing:border-box;">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Nomor Rekening</label>
                        <input type="text" x-model="plansConfig.bank1.account" placeholder="8877665544" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; font-weight:700; box-sizing:border-box;">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Atas Nama Rekening</label>
                        <input type="text" x-model="plansConfig.bank1.holder" placeholder="Suara 'Aisyiyah" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; box-sizing:border-box;">
                    </div>
                </div>
            </div>

            <!-- Rekening Cadangan / Alternatif (Bank 2) -->
            <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="font-weight:700; font-size:15px; color:#0f172a; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-money-check-alt" style="color:#0284c7;"></i> Rekening Cadangan (Opsional)
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Nama Bank Alternatif</label>
                        <input type="text" x-model="plansConfig.bank2.name" placeholder="BCA / Mandiri / BNI" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; box-sizing:border-box;">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Nomor Rekening</label>
                        <input type="text" x-model="plansConfig.bank2.account" placeholder="Kosongkan jika tidak digunakan" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; font-weight:700; box-sizing:border-box;">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Atas Nama Rekening</label>
                        <input type="text" x-model="plansConfig.bank2.holder" placeholder="Suara 'Aisyiyah" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; box-sizing:border-box;">
                    </div>
                </div>
            </div>

            <!-- Kontak & Cuplikan Gratis -->
            <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="font-weight:700; font-size:15px; color:#0f172a; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
                    <i class="fab fa-whatsapp" style="color:#16a34a;"></i> Kontak & Konfigurasi E-Majalah
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Nomor WhatsApp Bantuan/Konfirmasi</label>
                        <input type="text" x-model="plansConfig.whatsapp" placeholder="081234567890" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; box-sizing:border-box;">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Default Preview Bebas E-Majalah (Halaman)</label>
                        <input type="number" min="1" max="50" x-model.number="plansConfig.defaultPreviewPages" placeholder="5" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; box-sizing:border-box;">
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px;">Petunjuk Pembayaran Ringkas</label>
                        <textarea x-model="plansConfig.instructions" rows="2" style="width:100%; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; box-sizing:border-box; resize:vertical;"></textarea>
                    </div>
                </div>
            </div>
        </div>

        <div style="text-align:right;">
            <button type="button" @click="savePlansConfig()" :disabled="plansSaving" class="btn" style="background:#059669; color:#fff; border:none; padding:12px 28px; border-radius:8px; font-weight:700; font-size:15px; cursor:pointer; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 6px -1px rgba(5,150,105,0.3);">
                <i class="fas fa-spinner fa-spin" x-show="plansSaving"></i>
                <i class="fas fa-save" x-show="!plansSaving"></i>
                <span x-text="plansSaving ? 'Menyimpan...' : 'Simpan Seluruh Pengaturan'"></span>
            </button>
        </div>
    </div>

    <!-- MODAL FORM UNGGAH / EDIT MAJALAH -->
    <div x-show="showMagModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" style="display:none;" x-cloak>
        <div class="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6" @click.outside="showMagModal = false">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:14px; margin-bottom:20px;">
                <h3 style="margin:0; font-size:18px; font-weight:700; color:#0f172a;" x-text="magForm.id ? 'Edit Edisi Majalah' : 'Unggah Edisi Majalah Baru'"></h3>
                <button @click="showMagModal = false" style="background:none; border:none; font-size:18px; color:#94a3b8; cursor:pointer;">&times;</button>
            </div>

            <form @submit.prevent="saveMagazine()" style="display:flex; flex-direction:column; gap:14px;">
                <div>
                    <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:4px;">Judul Edisi <span style="color:#ef4444;">*</span></label>
                    <input type="text" x-model="magForm.title" required placeholder="Contoh: Majalah Suara Aisyiyah Edisi September 2026" style="width:100%; padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; box-sizing:border-box;">
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:4px;">Nomor Edisi</label>
                        <input type="text" x-model="magForm.edition_number" placeholder="Contoh: No. 09 / 1448 H" style="width:100%; padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; box-sizing:border-box;">
                    </div>
                    <div>
                        <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:4px;">Bulan / Periode Terbit</label>
                        <input type="text" x-model="magForm.publication_date" placeholder="Contoh: September 2026" style="width:100%; padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; box-sizing:border-box;">
                    </div>
                </div>

                <div>
                    <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:4px;">Berkas PDF Majalah Cetak <span style="color:#ef4444;" x-show="!magForm.id">*</span></label>
                    <input type="file" id="magPdfFile" accept=".pdf" @change="handlePdfFileChange($event)" style="width:100%; padding:8px; border:1px dashed #94a3b8; border-radius:8px; font-size:13px; box-sizing:border-box; background:#f8fafc;">
                    <div x-show="pdfConverting" style="margin-top:6px; font-size:12px; color:#0284c7; display:flex; align-items:center; gap:6px;">
                        <i class="fas fa-spinner fa-spin"></i> Memproses berkas PDF: mendeteksi jumlah halaman &amp; mengonversi halaman 1 menjadi sampul...
                    </div>
                    <div x-show="pdfConvertSuccess && !pdfConverting" style="margin-top:6px; font-size:12px; color:#166534; display:flex; align-items:center; gap:6px;">
                        <i class="fas fa-check-circle"></i> <span x-text="pdfConvertMsg"></span>
                    </div>
                    <div x-show="pdfConvertError && !pdfConverting" style="margin-top:6px; font-size:12px; color:#b91c1c; display:flex; align-items:center; gap:6px;">
                        <i class="fas fa-exclamation-triangle"></i> <span x-text="pdfConvertMsg"></span>
                    </div>
                    <p style="margin:4px 0 0 0; font-size:11px; color:#64748b;" x-show="magForm.id">Kosongkan jika tidak ingin mengganti berkas PDF yang sudah tersimpan.</p>
                </div>

                <div>
                    <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:6px;">
                        Gambar Sampul Majalah (Cover Image) <span style="color:#ef4444;" x-show="!magForm.id && !magForm.cover_image && !convertedCoverBlob">*</span>
                    </label>
                    <div style="display:flex; gap:14px; align-items:flex-start; background:#f8fafc; padding:12px; border:1px solid #e2e8f0; border-radius:10px;">
                        <!-- Thumbnail Preview -->
                        <div style="width:70px; height:95px; border-radius:6px; background:#e2e8f0; overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center; border:1px solid #cbd5e1; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                            <img :src="coverPreviewUrl || magForm.cover_image || 'https://placehold.co/100x140?text=Cover'" 
                                 alt="Preview Sampul" 
                                 style="width:100%; height:100%; object-fit:cover; display:block;"
                                 onerror="this.src='https://placehold.co/100x140?text=Cover'">
                        </div>
                        
                        <!-- File Upload & URL -->
                        <div style="flex:1; display:flex; flex-direction:column; gap:8px;">
                            <div>
                                <label style="font-size:12px; font-weight:600; color:#475569; display:block; margin-bottom:3px;">
                                    <i class="fas fa-upload" style="color:#059669;"></i> Pilih Berkas Sampul (JPG, PNG, WebP):
                                </label>
                                <input type="file" id="magCoverFile" accept="image/*" @change="handleCoverFileChange($event)" style="width:100%; padding:6px 8px; border:1px dashed #94a3b8; border-radius:6px; font-size:12px; background:#fff; box-sizing:border-box;">
                            </div>
                            <div>
                                <label style="font-size:11px; color:#64748b; display:block; margin-bottom:2px;">Atau gunakan URL Gambar langsung:</label>
                                <input type="text" x-model="magForm.cover_image" placeholder="https://... atau /api/media/file/..." style="width:100%; padding:7px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px; box-sizing:border-box;">
                            </div>
                        </div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:4px;">Halaman Gratis (Preview)</label>
                        <input type="number" min="1" max="50" x-model.number="magForm.preview_pages" style="width:100%; padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; box-sizing:border-box;">
                        <p style="margin:3px 0 0 0; font-size:11px; color:#64748b;">Halaman setelahnya akan terkunci paywall.</p>
                    </div>
                    <div>
                        <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:4px;">Tipe Akses</label>
                        <select x-model.number="magForm.is_free" style="width:100%; padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; box-sizing:border-box;">
                            <option :value="0">🔒 Berbayar (Khusus Pelanggan Pro)</option>
                            <option :value="1">🔓 Bebas Baca (Gratis 100%)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:4px;">Status Publikasi</label>
                    <select x-model="magForm.status" style="width:100%; padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; box-sizing:border-box;">
                        <option value="published">Published (Tampil di Katalog /majalah)</option>
                        <option value="draft">Draft (Disembunyikan)</option>
                    </select>
                </div>

                <div>
                    <label style="display:block; font-size:13px; font-weight:600; color:#334155; margin-bottom:4px;">Deskripsi / Catatan Redaksi</label>
                    <textarea x-model="magForm.description" rows="3" placeholder="Uraian singkat topik edisi ini..." style="width:100%; padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; box-sizing:border-box;"></textarea>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:10px; border-top:1px solid #e2e8f0; padding-top:16px;">
                    <button type="button" @click="showMagModal = false" style="background:#f1f5f9; color:#475569; border:none; padding:10px 20px; border-radius:8px; font-weight:600; cursor:pointer;">Batal</button>
                    <button type="submit" :disabled="magLoading" style="background:#059669; color:#fff; border:none; padding:10px 24px; border-radius:8px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px;">
                        <span x-show="magLoading"><i class="fas fa-spinner fa-spin"></i></span>
                        <span x-text="magLoading ? 'Menyimpan...' : 'Simpan Edisi'"></span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
`;
