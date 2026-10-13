export const subscribersPage = `
<div x-init="loadSubscribers()">
    <!-- HEADER PAGE & ACTIONS -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <div class="flex items-center gap-2">
                <h2 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Pelanggan Pro</h2>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    E-Majalah & Kuota
                </span>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 font-normal mt-1">
                Kelola pendaftar Subscriber Pro, verifikasi bukti transfer manual, dan pantau rekapitulasi omset penjualan paket.
            </p>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
            <!-- Search & Actions di Tab 1 -->
            <template x-if="subActiveTab === 'list'">
                <div class="flex items-center gap-2">
                    <div class="relative">
                        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input x-model="searchSubscriber" @keyup.debounce.500ms="subPage = 1; loadSubscribers()" 
                               type="text" placeholder="Cari nama, email, username..." 
                               class="pl-9 pr-3 py-2 text-xs border border-slate-200 bg-white rounded-xl shadow-xs outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-56 sm:w-64 transition-all">
                    </div>
                    <button @click="subPage = 1; loadSubscribers()" 
                            class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-all shadow-xs active:scale-95">
                        <i class="fas fa-sync text-[11px] text-slate-400"></i>
                        <span>Refresh</span>
                    </button>
                </div>
            </template>

            <!-- Actions di Tab 2 -->
            <template x-if="subActiveTab === 'recap'">
                <div class="flex items-center gap-2">
                    <button @click="loadSubRecap()" 
                            class="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white transition-all shadow-xs active:scale-95">
                        <i class="fas fa-sync text-[11px]" :class="recapLoading ? 'fa-spin' : ''"></i>
                        <span>Muat Ulang Rekap</span>
                    </button>
                </div>
            </template>
        </div>
    </div>

    <!-- TAB NAVIGASI MODERN PILL (SEPERTI E-MAJALAH) -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div class="flex gap-1.5 bg-slate-100/80 p-1 rounded-xl w-fit border border-slate-200/80 shadow-xs">
            <button type="button" @click="setSubTab('list')" 
                    :class="subActiveTab === 'list' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'" 
                    class="px-4 py-2 text-xs rounded-lg transition-all border-0 cursor-pointer flex items-center gap-2">
                <i class="fas fa-users" :class="subActiveTab === 'list' ? 'text-teal-600' : 'text-slate-400'"></i>
                <span>Daftar Pelanggan Pro</span>
                <template x-if="pendingSubscribers > 0">
                    <span class="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300" x-text="pendingSubscribers + ' pending'"></span>
                </template>
            </button>

            <button type="button" @click="setSubTab('recap')" 
                    :class="subActiveTab === 'recap' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'" 
                    class="px-4 py-2 text-xs rounded-lg transition-all border-0 cursor-pointer flex items-center gap-2">
                <i class="fas fa-chart-pie" :class="subActiveTab === 'recap' ? 'text-teal-600' : 'text-slate-400'"></i>
                <span>Rekap Penjualan &amp; Pendapatan</span>
            </button>
        </div>
    </div>

    <!-- TAB 1: DAFTAR PELANGGAN PRO -->
    <div x-show="subActiveTab === 'list'">

    <!-- TABEL & MOBILE CARDS SUBSCRIBERS -->
    <div class="card p-0 overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm">
        <!-- Desktop Table View (Hidden di Mobile) -->
        <div class="hidden md:block overflow-x-auto">
            <table class="table" style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0; text-align:left;">
                        <th style="padding:15px; font-weight:600; color:#475569;">User</th>
                        <th style="padding:15px; font-weight:600; color:#475569;">Role</th>
                        <th style="padding:15px; font-weight:600; color:#475569;">Paket Kuota</th>
                        <th style="padding:15px; font-weight:600; color:#475569;">Masa Aktif</th>
                        <th style="padding:15px; font-weight:600; color:#475569;">Bukti Transfer</th>
                        <th style="padding:15px; font-weight:600; color:#475569; text-align:center;">Status</th>
                        <th style="padding:15px; font-weight:600; color:#475569; text-align:right;">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <template x-for="sub in pagedSubscribers()" :key="(sub.sub_id || 'usr') + '_' + sub.user_id">
                        <tr style="border-bottom:1px solid #e2e8f0; transition:background 0.2s;" class="hover:bg-gray-50">
                            <td style="padding:15px;">
                                <div style="font-weight:600; color:#1e293b;" x-text="sub.name || sub.username"></div>
                                <div style="font-size:12px; color:#64748b;" x-text="sub.email"></div>
                            </td>
                            <td style="padding:15px;">
                                <span style="font-size:11px; font-weight:700; padding:4px 8px; border-radius:4px; text-transform:uppercase;" 
                                    :style="['subscriber_pro', 'pro', 'premium'].includes(sub.role) ? 'background:#fef3c7; color:#92400e; border:1px solid #f59e0b;' : 'background:#f1f5f9; color:#475569;'"
                                    x-text="['subscriber_pro', 'pro'].includes(sub.role) ? '⭐ SUBSCRIBER PRO' : (sub.role || 'SUBSCRIBER').toUpperCase()"></span>
                            </td>
                            <td style="padding:15px;">
                                <div style="font-weight:700; color:#0f172a;" x-text="sub.plan === '1_tahun' ? '1 Tahun' : (sub.plan === '6_bulan' ? '6 Bulan' : (sub.plan === '3_bulan' ? '3 Bulan' : '1 Bulan'))"></div>
                                <template x-if="sub.sub_id">
                                    <div style="font-size:11px; font-weight:700; color:#059669; font-family:monospace;" x-text="'#INV-SA-' + sub.sub_id"></div>
                                </template>
                                <div style="font-size:11px; color:#64748b;" x-text="sub.amount ? ('Rp ' + Number(sub.amount).toLocaleString('id-ID')) : ''"></div>
                            </td>
                            <td style="padding:15px; font-size:13px;">
                                <template x-if="sub.expires_at || sub.user_expires_at">
                                    <div>
                                        <div style="font-weight:700;" 
                                             :style="new Date(sub.expires_at || sub.user_expires_at) < new Date() ? 'color:#dc2626;' : 'color:#059669;'"
                                             x-text="new Date(sub.expires_at || sub.user_expires_at) < new Date() ? 'Kedaluwarsa' : ('s.d. ' + new Date(sub.expires_at || sub.user_expires_at).toLocaleDateString('id-ID'))"></div>
                                        <div style="font-size:11px; margin-top:2px;"
                                             :style="new Date(sub.expires_at || sub.user_expires_at) < new Date() ? 'color:#ef4444;' : 'color:#047857;'"
                                             x-text="(() => {
                                                 const diff = Math.ceil((new Date(sub.expires_at || sub.user_expires_at) - new Date()) / (1000 * 60 * 60 * 24));
                                                 if (diff < 0) return 'Habis ' + Math.abs(diff) + ' hari lalu';
                                                 if (diff === 0) return 'Berakhir hari ini';
                                                 return 'Sisa ' + diff + ' hari';
                                             })()"></div>
                                    </div>
                                </template>
                                <template x-if="!sub.expires_at && !sub.user_expires_at">
                                    <span style="display:inline-block; font-size:12px; color:#d97706; background:#fef3c7; padding:2px 8px; border-radius:4px; font-weight:600;">
                                        <span x-text="'⏳ ' + (sub.plan === '1_tahun' ? '1 Tahun' : (sub.plan === '6_bulan' ? '6 Bulan' : (sub.plan === '3_bulan' ? '3 Bulan' : '30 Hari'))) + ' (Menunggu Verifikasi)'"></span>
                                    </span>
                                </template>
                            </td>
                            <td style="padding:15px;">
                                <template x-if="sub.payment_proof && sub.payment_proof.startsWith('{')">
                                    <span style="display:inline-flex; align-items:center; gap:5px; background:#dcfce7; color:#166534; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700;">
                                        <i class="fas fa-bolt"></i> Otomatis
                                    </span>
                                </template>
                                <template x-if="sub.payment_proof && !sub.payment_proof.startsWith('{')">
                                    <button type="button" @click="openViewSub(sub)" style="display:inline-flex; align-items:center; gap:5px; background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; padding:5px 9px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">
                                        <i class="fas fa-file-invoice-dollar"></i> Cek Bukti
                                    </button>
                                </template>
                                <template x-if="!sub.payment_proof">
                                    <span style="font-size:12px; color:#94a3b8;">Tidak ada</span>
                                </template>
                            </td>
                            <td style="padding:15px; text-align:center;">
                                <div class="relative group inline-flex items-center justify-center cursor-pointer"
                                     :title="(sub.status === 'approved' || sub.status === 'active') ? 'Approved (Disetujui)' : (sub.status === 'rejected' ? 'Rejected (Ditolak)' : 'Pending (Menunggu Persetujuan)')">
                                    <template x-if="sub.status === 'approved' || sub.status === 'active'">
                                        <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-300 shadow-xs hover:bg-emerald-100 transition-all">
                                            <i class="fas fa-check text-xs"></i>
                                        </span>
                                    </template>
                                    <template x-if="sub.status === 'rejected'">
                                        <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-50 text-rose-600 border border-rose-300 shadow-xs hover:bg-rose-100 transition-all">
                                            <i class="fas fa-times text-xs"></i>
                                        </span>
                                    </template>
                                    <template x-if="sub.status !== 'approved' && sub.status !== 'active' && sub.status !== 'rejected'">
                                        <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-600 border border-amber-300 shadow-xs hover:bg-amber-100 transition-all">
                                            <i class="fas fa-clock text-xs"></i>
                                        </span>
                                    </template>
                                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none whitespace-nowrap z-30">
                                        <span x-text="(sub.status === 'approved' || sub.status === 'active') ? 'Approved (Disetujui)' : (sub.status === 'rejected' ? 'Rejected (Ditolak)' : 'Pending (Menunggu)')"></span>
                                        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                    </div>
                                </div>
                            </td>
                            <td style="padding:15px; text-align:right;">
                                <div style="display:inline-flex; gap:5px; align-items:center;">
                                    <button @click="openViewSub(sub)" title="Lihat Detail Pendaftaran & Bukti" style="background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; border-radius:6px; width:32px; height:32px; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button @click="openEditSub(sub)" title="Edit Paket / Masa Aktif / Status" style="background:#f8fafc; color:#2563eb; border:1px solid #93c5fd; border-radius:6px; width:32px; height:32px; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                                        <i class="fas fa-pen"></i>
                                    </button>
                                    <template x-if="sub.sub_id">
                                        <button @click="openInvoiceModal(sub)" title="Cetak Slip Invoice Resmi Suara 'Aisyiyah" style="background:#f0fdf4; color:#059669; border:1px solid #a7f3d0; border-radius:6px; width:32px; height:32px; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                                            <i class="fas fa-file-invoice"></i>
                                        </button>
                                    </template>
                                    <template x-if="sub.status === 'pending' && sub.sub_id">
                                        <button @click="approveSub(sub.sub_id)" title="Setujui Sebagai Subscriber Pro" style="background:#10b981; color:#fff; border:none; border-radius:6px; width:32px; height:32px; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                                            <i class="fas fa-check"></i>
                                        </button>
                                    </template>
                                    <template x-if="sub.status === 'pending' && sub.sub_id">
                                        <button @click="rejectSub(sub.sub_id)" title="Tolak Pendaftaran" style="background:#ef4444; color:#fff; border:none; border-radius:6px; width:32px; height:32px; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </template>
                                    <template x-if="sub.sub_id">
                                        <button @click="deleteSub(sub.sub_id)" title="Hapus Riwayat" style="background:#fff; color:#ef4444; border:1px solid #fecaca; border-radius:6px; width:32px; height:32px; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </template>
                                </div>
                            </td>
                        </tr>
                    </template>
                    <tr x-show="subscribersList.length === 0">
                        <td colspan="7" style="padding:30px; text-align:center; color:#64748b;">Belum ada data pendaftar langganan.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Mobile Vertical Card List View (Block di Mobile) -->
        <div class="block md:hidden divide-y divide-slate-100">
            <template x-for="sub in pagedSubscribers()" :key="'mob_sub_' + (sub.sub_id || 'usr') + '_' + sub.user_id">
                <div class="p-3.5 bg-white space-y-2.5">
                    <!-- Row 1: Nama, Role & Status -->
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <h4 class="text-sm font-bold text-slate-800 m-0" x-text="sub.name || sub.username"></h4>
                            <div class="text-xs text-slate-500" x-text="sub.email"></div>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded"
                                  :class="['subscriber_pro', 'pro', 'premium'].includes(sub.role) ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'"
                                  x-text="['subscriber_pro', 'pro'].includes(sub.role) ? '⭐ PRO' : (sub.role || 'SUB').toUpperCase()"></span>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded"
                                  :class="(sub.status === 'approved' || sub.status === 'active') ? 'bg-emerald-100 text-emerald-800' : (sub.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800')"
                                  x-text="(sub.status || 'pending').toUpperCase()"></span>
                        </div>
                    </div>

                    <!-- Row 2: Paket Kuota, Invoice & Masa Aktif -->
                    <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                        <div class="flex justify-between items-center">
                            <span class="text-slate-500">Paket:</span>
                            <span class="font-bold text-slate-800" x-text="sub.plan === '1_tahun' ? '1 Tahun' : (sub.plan === '6_bulan' ? '6 Bulan' : (sub.plan === '3_bulan' ? '3 Bulan' : '1 Bulan'))"></span>
                        </div>
                        <div class="flex justify-between items-center" x-show="sub.sub_id">
                            <span class="text-slate-500">Invoice:</span>
                            <span class="font-mono font-semibold text-emerald-700" x-text="'#INV-SA-' + sub.sub_id"></span>
                        </div>
                        <div class="flex justify-between items-center" x-show="sub.expires_at || sub.user_expires_at">
                            <span class="text-slate-500">Masa Aktif:</span>
                            <span class="font-bold" :class="new Date(sub.expires_at || sub.user_expires_at) < new Date() ? 'text-red-600' : 'text-emerald-700'"
                                  x-text="new Date(sub.expires_at || sub.user_expires_at) < new Date() ? 'Kedaluwarsa' : ('s.d. ' + new Date(sub.expires_at || sub.user_expires_at).toLocaleDateString('id-ID'))"></span>
                        </div>
                    </div>

                    <!-- Row 3: Action Buttons Mobile (Tap target min 40px) -->
                    <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-50">
                        <button type="button" @click="openViewSub(sub)" 
                                class="min-h-[40px] px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center justify-center gap-1.5 flex-1 active:scale-95 transition-all">
                            <i class="fas fa-eye text-xs"></i> <span>Detail/Bukti</span>
                        </button>
                        <button type="button" @click="openEditSub(sub)" 
                                class="min-h-[40px] px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center gap-1.5 flex-1 active:scale-95 transition-all">
                            <i class="fas fa-pen text-xs"></i> <span>Edit</span>
                        </button>
                        <template x-if="sub.sub_id">
                            <button type="button" @click="openInvoiceModal(sub)" 
                                    class="min-h-[40px] px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all" title="Invoice">
                                <i class="fas fa-file-invoice"></i>
                            </button>
                        </template>
                        <template x-if="sub.status === 'pending' && sub.sub_id">
                            <button type="button" @click="approveSub(sub.sub_id)" 
                                    class="min-h-[40px] px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all">
                                <i class="fas fa-check"></i> <span>Setujui</span>
                            </button>
                        </template>
                        <template x-if="sub.status === 'pending' && sub.sub_id">
                            <button type="button" @click="rejectSub(sub.sub_id)" 
                                    class="min-h-[40px] px-2.5 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all" title="Tolak">
                                <i class="fas fa-times"></i>
                            </button>
                        </template>
                    </div>
                </div>
            </template>
            <div x-show="subscribersList.length === 0" class="p-8 text-center text-slate-400 text-xs">
                Belum ada data pendaftar langganan.
            </div>
        </div>

        <!-- FOOTER PAGINATION SUBSCRIBERS -->
        <div x-show="subscribersList.length > 0" style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f8fafc; border-top:1px solid #e2e8f0; flex-wrap:wrap; gap:10px;">
            <div style="font-size:13px; color:#64748b;">
                Menampilkan <b x-text="((subPage - 1) * subLimit) + 1"></b> - 
                <b x-text="Math.min(subPage * subLimit, subscribersList.length)"></b> 
                dari <b x-text="subscribersList.length"></b> pelanggan
                <template x-if="searchSubscriber">
                    <span style="font-size:12px; color:#94a3b8;" x-text="'(hasil pencarian: &quot;' + searchSubscriber + '&quot;)'"></span>
                </template>
            </div>
            
            <div style="display:flex; gap:6px; align-items:center;">
                <button @click="prevSubPage()" :disabled="subPage === 1" 
                        class="btn" style="padding:4px 12px; font-size:13px; background:#fff; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer;" 
                        :style="subPage === 1 ? 'opacity:0.5; cursor:not-allowed;' : ''">
                    <i class="fas fa-chevron-left"></i> Prev
                </button>
                
                <span style="padding:0 8px; font-size:13px; font-weight:600; color:#334155;" x-text="'Halaman ' + subPage + ' / ' + totalSubPages()"></span>
                
                <button @click="nextSubPage()" :disabled="subPage === totalSubPages()" 
                        class="btn" style="padding:4px 12px; font-size:13px; background:#fff; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer;" 
                        :style="subPage === totalSubPages() ? 'opacity:0.5; cursor:not-allowed;' : ''">
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    </div>
    </div> <!-- END TAB 1 -->

    <!-- TAB 2: REKAP PENJUALAN & PENDAPATAN -->
    <div x-show="subActiveTab === 'recap'" style="display:none;">
        
        <!-- SECTION TITLE -->
        <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span class="inline-flex h-2 w-2 rounded-full bg-teal-500"></span>
                <span>Ringkasan Finansial &amp; Mutasi Langganan</span>
            </div>
        </div>

        <!-- 4 KARTU METRIK RINGKASAN EKSEKUTIF (Harmonis dengan Dashboard) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            <!-- Card 1: Hari Ini -->
            <div class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-teal-400 transition-all duration-200 group flex items-center gap-3.5">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <i class="fas fa-calendar-day text-base"></i>
                </div>
                <div class="min-w-0 flex-1">
                    <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-tight">Hari Ini</div>
                    <h4 class="font-black text-slate-800 text-lg sm:text-xl leading-tight tracking-tight mt-0.5" x-text="formatRupiah(recapData.summary.today.amount)">Rp 0</h4>
                    <span class="text-[11px] text-teal-600 font-medium flex items-center gap-1 mt-0.5">
                        <i class="fas fa-check-circle text-[10px]"></i>
                        <span x-text="recapData.summary.today.count + ' Transaksi Disetujui'"></span>
                    </span>
                </div>
            </div>

            <!-- Card 2: 7 Hari Terakhir -->
            <div class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-sky-400 transition-all duration-200 group flex items-center gap-3.5">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <i class="fas fa-calendar-week text-base"></i>
                </div>
                <div class="min-w-0 flex-1">
                    <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-tight">7 Hari Terakhir</div>
                    <h4 class="font-black text-slate-800 text-lg sm:text-xl leading-tight tracking-tight mt-0.5" x-text="formatRupiah(recapData.summary.week.amount)">Rp 0</h4>
                    <span class="text-[11px] text-sky-600 font-medium flex items-center gap-1 mt-0.5">
                        <i class="fas fa-check-circle text-[10px]"></i>
                        <span x-text="recapData.summary.week.count + ' Transaksi Disetujui'"></span>
                    </span>
                </div>
            </div>

            <!-- Card 3: Bulan Ini -->
            <div class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-400 transition-all duration-200 group flex items-center gap-3.5">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <i class="fas fa-calendar-alt text-base"></i>
                </div>
                <div class="min-w-0 flex-1">
                    <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-tight">Bulan Ini</div>
                    <h4 class="font-black text-slate-800 text-lg sm:text-xl leading-tight tracking-tight mt-0.5" x-text="formatRupiah(recapData.summary.month.amount)">Rp 0</h4>
                    <span class="text-[11px] text-indigo-600 font-medium flex items-center gap-1 mt-0.5">
                        <i class="fas fa-check-circle text-[10px]"></i>
                        <span x-text="recapData.summary.month.count + ' Transaksi Disetujui'"></span>
                    </span>
                </div>
            </div>

            <!-- Card 4: Total Omset Masuk -->
            <div class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-amber-400 transition-all duration-200 group flex items-center gap-3.5">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <i class="fas fa-wallet text-base"></i>
                </div>
                <div class="min-w-0 flex-1">
                    <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-tight">Total Omset Masuk</div>
                    <h4 class="font-black text-slate-800 text-lg sm:text-xl leading-tight tracking-tight mt-0.5" x-text="formatRupiah(recapData.summary.total.amount)">Rp 0</h4>
                    <span class="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
                        <i class="fas fa-users text-[10px]"></i>
                        <span x-text="recapData.summary.total.count + ' Total Pelanggan Aktif'"></span>
                    </span>
                </div>
            </div>
        </div>

        <!-- RINCIAN DISTRIBUSI PAKET TERJUAL -->
        <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs mb-6">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                    <div class="h-8 w-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                        <i class="fas fa-box-open text-xs"></i>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-slate-800">Distribusi Penjualan per Paket</h4>
                        <p class="text-[11px] text-slate-400">Total volume dan nominal pendapatan per tier kuota (Status Approved)</p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <template x-for="p in (recapData.plans || [])" :key="p.plan">
                    <div class="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 hover:bg-white hover:border-slate-200 transition-all">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-slate-700" x-text="p.label"></span>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100/80 text-teal-800" x-text="p.count + ' Transaksi'"></span>
                        </div>
                        <div class="text-lg font-black text-teal-700 mt-2" x-text="formatRupiah(p.amount)"></div>
                    </div>
                </template>
                <div x-show="!recapData.plans || recapData.plans.length === 0" class="col-span-full py-6 text-center text-slate-400 text-xs">
                    Belum ada data paket terjual.
                </div>
            </div>
        </div>

        <!-- TABEL RINCIAN TRANSAKSI DALAM PERIODE -->
        <div class="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            
            <!-- Toolbar Filter Periode, Pencarian & Status -->
            <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/50">
                <div>
                    <h3 class="text-sm sm:text-base font-bold text-slate-800">Riwayat Mutasi Transaksi</h3>
                    <p class="text-xs text-slate-400 mt-0.5">Daftar rincian transaksi pendaftaran langganan berdasarkan filter waktu dan pencarian.</p>
                </div>

                <div class="flex flex-wrap items-center gap-2.5">
                    <!-- Search Input Riwayat Transaksi -->
                    <div class="relative">
                        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input x-model="recapSearch" @input.debounce.400ms="recapPage = 1; loadSubRecap()" 
                               type="text" placeholder="Cari nama, email, #ID, bank..." 
                               class="pl-8 pr-3 py-1.5 text-xs border border-slate-200 bg-white rounded-xl shadow-xs outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-48 sm:w-56 transition-all">
                        <button type="button" x-show="recapSearch" @click="recapSearch = ''; recapPage = 1; loadSubRecap()" 
                                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs border-0 bg-transparent cursor-pointer p-0 leading-none">&times;</button>
                    </div>

                    <!-- Filter Status Dropdown -->
                    <div class="relative">
                        <select x-model="recapStatus" @change="recapPage = 1; loadSubRecap()" 
                                class="text-xs font-medium border border-slate-200 bg-white rounded-xl px-3 py-1.5 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-xs cursor-pointer text-slate-700">
                            <option value="approved">Status: Approved (Disetujui)</option>
                            <option value="pending">Status: Pending (Menunggu)</option>
                            <option value="">Status: Semua Status</option>
                        </select>
                    </div>

                    <!-- Period Selector Pill Buttons (Harmonis dengan E-Majalah Tab) -->
                    <div class="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
                        <button type="button" @click="setRecapPeriod('today')" 
                                :class="recapPeriod === 'today' ? 'bg-teal-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'"
                                class="px-2.5 py-1 text-xs rounded-lg transition-all border-0 cursor-pointer">
                            Hari Ini
                        </button>
                        <button type="button" @click="setRecapPeriod('week')" 
                                :class="recapPeriod === 'week' ? 'bg-teal-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'"
                                class="px-2.5 py-1 text-xs rounded-lg transition-all border-0 cursor-pointer">
                            7 Hari
                        </button>
                        <button type="button" @click="setRecapPeriod('month')" 
                                :class="recapPeriod === 'month' ? 'bg-teal-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'"
                                class="px-2.5 py-1 text-xs rounded-lg transition-all border-0 cursor-pointer">
                            Bulan Ini
                        </button>
                        <button type="button" @click="setRecapPeriod('all')" 
                                :class="recapPeriod === 'all' ? 'bg-teal-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'"
                                class="px-2.5 py-1 text-xs rounded-lg transition-all border-0 cursor-pointer">
                            Semua
                        </button>
                    </div>

                    <!-- Tombol Cetak -->
                    <button type="button" onclick="window.print()" 
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs active:scale-95 transition-all">
                        <i class="fas fa-print text-[11px] text-slate-400"></i>
                        <span>Cetak</span>
                    </button>
                </div>
            </div>

            <!-- Tabel Transaksi -->
            <div class="overflow-x-auto">
            <table class="w-full border-collapse text-left">
                <thead>
                    <tr class="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <th class="p-4">No &amp; Tanggal</th>
                        <th class="p-4">Pelanggan</th>
                        <th class="p-4">Paket &amp; Durasi</th>
                        <th class="p-4">Keterangan / Bank</th>
                        <th class="p-4 text-right">Nominal (Rp)</th>
                        <th class="p-4 text-center">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                    <template x-for="(tx, idx) in pagedRecapTransactions()" :key="tx.id">
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <td class="p-4">
                                <div class="flex items-center gap-1.5">
                                    <span class="font-bold text-slate-800 font-mono" x-text="'#INV-SA-' + tx.id"></span>
                                    <button type="button" @click="openInvoiceModal(tx)" title="Lihat & Cetak Slip Invoice Resmi" class="p-1 rounded text-teal-600 hover:text-teal-800 hover:bg-teal-50 border-0 bg-transparent cursor-pointer transition-all">
                                        <i class="fas fa-file-invoice text-xs"></i>
                                    </button>
                                </div>
                                <div class="text-[11px] text-slate-400" x-text="formatDateId(tx.created_at)"></div>
                            </td>
                            <td class="p-4">
                                <div class="font-bold text-slate-900" x-text="tx.name || tx.username"></div>
                                <div class="text-[11px] text-slate-500 font-mono" x-text="tx.email"></div>
                            </td>
                            <td class="p-4">
                                <span class="font-bold text-slate-800" x-text="tx.plan === '1_tahun' ? '1 Tahun' : (tx.plan === '6_bulan' ? '6 Bulan' : (tx.plan === '3_bulan' ? '3 Bulan' : '1 Bulan'))"></span>
                                <span class="text-[11px] text-slate-400 ml-1" x-text="'(' + (tx.duration_months || 1) + ' bln)'"></span>
                            </td>
                            <td class="p-4 text-slate-600">
                                <span x-text="tx.notes || '-'"></span>
                            </td>
                            <td class="p-4 text-right font-black text-teal-700 text-sm">
                                <span x-text="formatRupiah(tx.amount)"></span>
                            </td>
                            <td class="p-4 text-center">
                                <div class="relative group inline-flex items-center justify-center cursor-pointer"
                                     :title="(tx.status === 'approved' || tx.status === 'active') ? 'Approved (Disetujui)' : (tx.status === 'rejected' ? 'Rejected (Ditolak)' : 'Pending (Menunggu)')">
                                    <!-- Status Approved / Active: Icon Centang Hijau -->
                                    <template x-if="tx.status === 'approved' || tx.status === 'active'">
                                        <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-300 shadow-xs hover:bg-emerald-100 transition-all">
                                            <i class="fas fa-check text-xs"></i>
                                        </span>
                                    </template>

                                    <!-- Status Rejected: Icon Silang Merah -->
                                    <template x-if="tx.status === 'rejected'">
                                        <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-50 text-rose-600 border border-rose-300 shadow-xs hover:bg-rose-100 transition-all">
                                            <i class="fas fa-times text-xs"></i>
                                        </span>
                                    </template>

                                    <!-- Status Pending: Icon Jam Kuning/Amber -->
                                    <template x-if="tx.status !== 'approved' && tx.status !== 'active' && tx.status !== 'rejected'">
                                        <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-600 border border-amber-300 shadow-xs hover:bg-amber-100 transition-all">
                                            <i class="fas fa-clock text-xs"></i>
                                        </span>
                                    </template>

                                    <!-- Tooltip Floating saat Mouse Menyentuh Icon -->
                                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none whitespace-nowrap z-30">
                                        <span x-text="(tx.status === 'approved' || tx.status === 'active') ? 'Approved (Disetujui)' : (tx.status === 'rejected' ? 'Rejected (Ditolak)' : 'Pending (Menunggu)')"></span>
                                        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </template>
                    <tr x-show="filteredRecapTransactions().length === 0">
                        <td colspan="6" class="p-10 text-center text-slate-400">
                            <i class="fas fa-receipt text-3xl mb-2 opacity-40 block"></i>
                            Tidak ada data transaksi penjualan pada periode dan status yang dipilih.
                        </td>
                    </tr>
                </tbody>
            </table>
            </div>

            <!-- FOOTER PAGINATION TRANSAKSI REKAP -->
            <div x-show="filteredRecapTransactions().length > 0" class="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50/80 border-t border-slate-200 text-xs">
                <div class="text-slate-500">
                    Menampilkan <b class="text-slate-800" x-text="((recapPage - 1) * recapLimit) + 1"></b> - 
                    <b class="text-slate-800" x-text="Math.min(recapPage * recapLimit, filteredRecapTransactions().length)"></b> 
                    dari <b class="text-slate-800" x-text="filteredRecapTransactions().length"></b> transaksi
                    <template x-if="recapSearch">
                        <span class="text-slate-400 ml-1" x-text="'(hasil pencarian: &quot;' + recapSearch + '&quot;)'"></span>
                    </template>
                </div>
                
                <div class="flex items-center gap-1.5">
                    <button @click="prevRecapPage()" :disabled="recapPage === 1" 
                            class="px-3 py-1.5 font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs text-slate-700">
                        <i class="fas fa-chevron-left text-[10px] mr-1"></i> Prev
                    </button>
                    
                    <span class="px-3 py-1.5 font-bold text-slate-700" x-text="'Halaman ' + recapPage + ' / ' + totalRecapPages()"></span>
                    
                    <button @click="nextRecapPage()" :disabled="recapPage === totalRecapPages()" 
                            class="px-3 py-1.5 font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs text-slate-700">
                        Next <i class="fas fa-chevron-right text-[10px] ml-1"></i>
                    </button>
                </div>
            </div>
        </div>

    </div> <!-- END TAB 2 -->

    <!-- 1. MODAL VIEW DETAIL BUKTI TRANSFER & PELANGGAN -->
    <div x-show="subViewModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" style="display:none;" x-cloak>
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" @click.outside="closeViewSub()">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:14px; margin-bottom:16px;">
                <h3 style="margin:0; font-size:18px; font-weight:700; color:#0f172a; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-id-card" style="color:#059669;"></i> Detail Pendaftar Pelanggan Pro
                </h3>
                <button type="button" @click="closeViewSub()" style="background:transparent; border:none; color:#64748b; font-size:20px; cursor:pointer; line-height:1;">
                    &times;
                </button>
            </div>

            <template x-if="viewingSub">
                <div>
                    <!-- Data Ringkas User -->
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px; margin-bottom:16px; display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:13px;">
                        <div>
                            <div style="color:#64748b; font-size:11px; text-transform:uppercase; font-weight:700;">Nama Lengkap</div>
                            <div style="font-weight:700; color:#1e293b;" x-text="viewingSub.name || viewingSub.username"></div>
                        </div>
                        <div>
                            <div style="color:#64748b; font-size:11px; text-transform:uppercase; font-weight:700;">Email & Username</div>
                            <div style="font-weight:600; color:#1e293b;" x-text="viewingSub.email + ' (' + viewingSub.username + ')'"></div>
                        </div>
                        <div>
                            <div style="color:#64748b; font-size:11px; text-transform:uppercase; font-weight:700;">Paket Dipilih</div>
                            <div style="font-weight:700; color:#047857;" x-text="viewingSub.plan === '1_tahun' ? '1 Tahun' : (viewingSub.plan === '6_bulan' ? '6 Bulan' : (viewingSub.plan === '3_bulan' ? '3 Bulan' : '1 Bulan'))"></div>
                        </div>
                        <div>
                            <div style="color:#64748b; font-size:11px; text-transform:uppercase; font-weight:700;">Nominal Transfer</div>
                            <div style="font-weight:700; color:#0f172a;" x-text="viewingSub.amount ? ('Rp ' + Number(viewingSub.amount).toLocaleString('id-ID')) : '-'"></div>
                        </div>
                        <div>
                            <div style="color:#64748b; font-size:11px; text-transform:uppercase; font-weight:700;">Status Saat Ini</div>
                            <div style="font-weight:700;" :style="viewingSub.status === 'approved' ? 'color:#059669;' : (viewingSub.status === 'rejected' ? 'color:#dc2626;' : 'color:#d97706;')" x-text="viewingSub.status.toUpperCase()"></div>
                        </div>
                        <div>
                            <div style="color:#64748b; font-size:11px; text-transform:uppercase; font-weight:700;">Catatan Pendaftaran</div>
                            <div style="color:#334155;" x-text="viewingSub.notes || '-'"></div>
                        </div>
                    </div>

                    <!-- Bukti Transfer Image Container -->
                    <div style="margin-bottom:20px;">
                        <div style="font-weight:700; font-size:14px; color:#1e293b; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                            <span>Foto Bukti Transfer Bank</span>
                            <template x-if="viewingSub.payment_proof && !viewingSub.payment_proof.startsWith('{')">
                                <a :href="viewingSub.payment_proof" target="_blank" style="font-size:12px; color:#2563eb; text-decoration:none; font-weight:600;">
                                    <i class="fas fa-external-link-alt"></i> Buka Gambar Asli
                                </a>
                            </template>
                        </div>

                        <template x-if="viewingSub.payment_proof && !viewingSub.payment_proof.startsWith('{')">
                            <div style="text-align:center; background:#0f172a; border-radius:8px; padding:12px; border:1px solid #cbd5e1; max-height:420px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                                <img :src="viewingSub.payment_proof" alt="Bukti Transfer" style="max-width:100%; max-height:390px; object-fit:contain; border-radius:4px; box-shadow:0 4px 6px rgba(0,0,0,0.3);">
                            </div>
                        </template>
                        <template x-if="!viewingSub.payment_proof">
                            <div style="padding:30px; text-align:center; background:#f8fafc; border:2px dashed #cbd5e1; border-radius:8px; color:#64748b;">
                                <i class="fas fa-receipt" style="font-size:32px; margin-bottom:8px; color:#94a3b8;"></i>
                                <div>Tidak ada berkas bukti transfer yang dilampirkan.</div>
                            </div>
                        </template>
                    </div>

                    <!-- Action Bar di Modal -->
                    <div style="display:flex; justify-content:flex-end; gap:10px; border-top:1px solid #e2e8f0; padding-top:16px;">
                        <button type="button" @click="closeViewSub()" class="btn" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;">Tutup</button>
                        
                        <template x-if="viewingSub.sub_id">
                            <button type="button" @click="openInvoiceModal(viewingSub)" class="btn" style="background:#f0fdf4; color:#059669; border-color:#86efac;">
                                <i class="fas fa-file-invoice"></i> Cetak Slip Invoice
                            </button>
                        </template>
                        
                        <template x-if="viewingSub.status === 'pending' && viewingSub.sub_id">
                            <button type="button" @click="rejectSub(viewingSub.sub_id)" class="btn" style="background:#ef4444; color:#fff; border-color:#dc2626;">
                                <i class="fas fa-times"></i> Tolak
                            </button>
                        </template>

                        <template x-if="viewingSub.status === 'pending' && viewingSub.sub_id">
                            <button type="button" @click="approveSub(viewingSub.sub_id)" class="btn" style="background:#10b981; color:#fff; border-color:#059669;">
                                <i class="fas fa-check"></i> Setujui & Aktifkan Pro
                            </button>
                        </template>
                    </div>
                </div>
            </template>
        </div>
    </div>

    <!-- 2. MODAL EDIT KUOTA & MASA AKTIF SUBSCRIBER -->
    <div x-show="subEditModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" style="display:none;" x-cloak>
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" @click.outside="closeEditSub()">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:14px; margin-bottom:16px;">
                <h3 style="margin:0; font-size:18px; font-weight:700; color:#0f172a; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-user-edit" style="color:#2563eb;"></i> Edit Paket & Masa Aktif
                </h3>
                <button type="button" @click="closeEditSub()" style="background:transparent; border:none; color:#64748b; font-size:20px; cursor:pointer; line-height:1;">
                    &times;
                </button>
            </div>

            <form @submit.prevent="saveEditSub()">
                <div style="display:flex; flex-direction:column; gap:14px;">
                    <!-- User Info Static -->
                    <div style="background:#f8fafc; padding:10px 14px; border-radius:6px; font-size:13px; border:1px solid #e2e8f0;">
                        <span style="font-weight:700; color:#1e293b;" x-text="editingSub.name"></span>
                        <span style="color:#64748b;" x-text="' (' + editingSub.email + ')'"></span>
                    </div>

                    <!-- Status Selection -->
                    <div>
                        <label style="display:block; font-size:12px; font-weight:700; color:#475569; margin-bottom:4px; text-transform:uppercase;">Status Langganan</label>
                        <select x-model="editingSub.status" class="input" style="width:100%;">
                            <option value="pending">PENDING (Menunggu Verifikasi)</option>
                            <option value="approved">APPROVED (Aktif Sebagai Pro)</option>
                            <option value="rejected">REJECTED (Ditolak)</option>
                        </select>
                    </div>

                    <!-- Paket Kuota Selection -->
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div>
                            <label style="display:block; font-size:12px; font-weight:700; color:#475569; margin-bottom:4px; text-transform:uppercase;">Paket Langganan</label>
                            <select x-model="editingSub.plan" class="input" style="width:100%;">
                                <option value="1_bulan">1 Bulan</option>
                                <option value="3_bulan">3 Bulan</option>
                                <option value="6_bulan">6 Bulan</option>
                                <option value="1_tahun">1 Tahun</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-size:12px; font-weight:700; color:#475569; margin-bottom:4px; text-transform:uppercase;">Nominal Pembayaran (Rp)</label>
                            <input type="number" x-model="editingSub.amount" class="input" style="width:100%;">
                        </div>
                    </div>

                    <!-- Kustom Masa Aktif (Expires At) -->
                    <div>
                        <label style="display:block; font-size:12px; font-weight:700; color:#475569; margin-bottom:4px; text-transform:uppercase;">
                            Batas Akhir Masa Aktif (Kedaluwarsa)
                        </label>
                        <input type="date" x-model="editingSub.expires_at_date" class="input" style="width:100%;">
                        <div style="font-size:11px; color:#64748b; margin-top:3px;">
                            Pilih tanggal kedaluwarsa kuota. Biarkan kosong jika status pending/belum aktif.
                        </div>
                    </div>

                    <!-- Catatan Tambahan -->
                    <div>
                        <label style="display:block; font-size:12px; font-weight:700; color:#475569; margin-bottom:4px; text-transform:uppercase;">Catatan / Keterangan</label>
                        <input type="text" x-model="editingSub.notes" class="input" placeholder="Misal: Perpanjangan manual dari admin" style="width:100%;">
                    </div>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:10px; border-top:1px solid #e2e8f0; padding-top:16px; margin-top:18px;">
                    <button type="button" @click="closeEditSub()" class="btn" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;">Batal</button>
                    <button type="submit" class="btn" :disabled="isSavingEdit" style="background:#2563eb; color:#fff; border-color:#1d4ed8;">
                        <span x-show="!isSavingEdit"><i class="fas fa-save"></i> Simpan Perubahan</span>
                        <span x-show="isSavingEdit"><i class="fas fa-spinner fa-spin"></i> Menyimpan...</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- 3. MODAL SLIP INVOICE RESMI SUARA 'AISYIYAH (PRINT-READY) -->
    <div x-show="subInvoiceModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto" style="display:none;" x-cloak>
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200" @click.outside="closeInvoiceModal()">
            
            <!-- TOOLBAR MODAL (HIDDEN ON PRINT) -->
            <div class="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-200 print:hidden">
                <div class="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <i class="fas fa-file-invoice text-teal-600"></i>
                    <span>Slip Invoice Resmi Suara 'Aisyiyah</span>
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" @click="printInvoice()" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-xs transition-all border-0 cursor-pointer">
                        <i class="fas fa-print"></i> Cetak / Simpan PDF
                    </button>
                    <button type="button" @click="closeInvoiceModal()" class="text-slate-400 hover:text-slate-600 border-0 bg-transparent text-xl cursor-pointer leading-none p-1">
                        &times;
                    </button>
                </div>
            </div>

            <!-- AREA DOKUMEN CETAK INVOICE RESMI -->
            <template x-if="invoiceData">
                <div id="invoice-official-print" class="p-8 sm:p-10 bg-white text-slate-800 text-xs font-sans">
                    
                    <!-- KOP SURAT RESMI -->
                    <div class="border-b-4 border-double border-teal-700 pb-5 mb-6 flex items-start justify-between gap-4">
                        <div class="flex items-center gap-3.5">
                            <img :src="settings.site_logo || '/uploads/2026/10/1791138715756-logo-suaraaisyiyah.png'" alt="Suara 'Aisyiyah" class="h-12 max-w-[150px] object-contain" @error="$el.outerHTML='<div class=\\'w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-black text-xl shadow-xs\\'>SA</div>'">
                            <div>
                                <h1 class="text-lg sm:text-xl font-black text-teal-900 tracking-tight leading-tight m-0">SUARA 'AISYIYAH</h1>
                                <p class="text-[11px] font-semibold text-teal-700 m-0">Media Resmi Majalah Bulanan Berkemajuan &bull; Terbit Sejak 1926</p>
                                <p class="text-[10px] text-slate-500 m-0 mt-0.5 leading-normal">
                                    Gedung PP 'Aisyiyah, Jl. KH. Ahmad Dahlan No. 32, Yogyakarta 55122<br>
                                    Email: redaksi@suaraaisyiyah.id | Website: suaraaisyiyah.id
                                </p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="inline-block px-2.5 py-1 rounded font-black text-[11px] tracking-wider uppercase mb-1"
                                 :class="invoiceData.status === 'approved' || invoiceData.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : (invoiceData.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-amber-100 text-amber-800 border border-amber-300')">
                                <span x-text="invoiceData.status === 'approved' || invoiceData.status === 'active' ? 'LUNAS / AKTIF' : (invoiceData.status === 'rejected' ? 'DITOLAK' : 'MENUNGGU VERIFIKASI')"></span>
                            </div>
                            <div class="text-[10px] text-slate-400">Bukti Transaksi Resmi</div>
                        </div>
                    </div>

                    <!-- METADATA & DATA PELANGGAN -->
                    <div class="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-100">
                        <div>
                            <div class="text-[10px] font-bold uppercase text-slate-400 mb-1">DITAGIHKAN KEPADA:</div>
                            <div class="text-sm font-black text-slate-900" x-text="invoiceData.name"></div>
                            <div class="text-slate-600 font-mono text-[11px]" x-text="invoiceData.email"></div>
                            <div class="text-slate-500 text-[11px]" x-text="'Username: @' + invoiceData.username"></div>
                        </div>
                        <div class="text-right">
                            <div class="text-[10px] font-bold uppercase text-slate-400 mb-1">INFORMASI INVOICE:</div>
                            <div class="text-sm font-black text-teal-800 font-mono" x-text="'#INV-SA-' + invoiceData.id"></div>
                            <div class="text-slate-600 text-[11px]">
                                Tanggal: <span class="font-medium" x-text="formatDateId(invoiceData.created_at)"></span>
                            </div>
                            <div class="text-slate-600 text-[11px]">
                                Berlaku s.d.: <span class="font-medium text-emerald-700" x-text="invoiceData.expires_at ? formatDateId(invoiceData.expires_at) : 'Sesuai Masa Aktif Paket'"></span>
                            </div>
                        </div>
                    </div>

                    <!-- TABEL RINCIAN ITEM PEMBAYARAN -->
                    <div class="mb-6">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 border-y border-slate-200 text-slate-600 text-[11px] font-bold">
                                    <th class="py-2.5 px-3">No</th>
                                    <th class="py-2.5 px-3">Deskripsi Layanan</th>
                                    <th class="py-2.5 px-3 text-center">Durasi</th>
                                    <th class="py-2.5 px-3 text-right">Nominal</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr>
                                    <td class="py-3.5 px-3 font-bold text-slate-400">1</td>
                                    <td class="py-3.5 px-3">
                                        <div class="font-black text-slate-800 text-[12px]" x-text="'Langganan Subscriber Pro - ' + invoiceData.plan_label"></div>
                                        <div class="text-slate-500 text-[11px] mt-0.5">
                                            Akses eksklusif Majalah Digital Flipbook Suara 'Aisyiyah & seluruh arsip artikel khusus Pro.
                                        </div>
                                        <div class="text-[10px] text-slate-400 font-mono mt-0.5" x-text="invoiceData.notes ? ('Ref: ' + invoiceData.notes) : ''"></div>
                                    </td>
                                    <td class="py-3.5 px-3 text-center font-bold text-slate-700" x-text="(invoiceData.duration_months || 1) + ' Bulan'"></td>
                                    <td class="py-3.5 px-3 text-right font-black text-slate-900" x-text="formatRupiah(invoiceData.amount)"></td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr class="border-t-2 border-slate-200">
                                    <td colspan="3" class="py-3 px-3 text-right font-black text-slate-700 uppercase tracking-wider text-[11px]">Total Tagihan</td>
                                    <td class="py-3 px-3 text-right font-black text-teal-800 text-base" x-text="formatRupiah(invoiceData.amount)"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <!-- FOOTER & VALIDASI RESMI -->
                    <div class="border-t border-slate-100 pt-5 flex items-center justify-between text-[10px] text-slate-400">
                        <div>
                            <p class="m-0 font-medium text-slate-500">Catatan & Validasi:</p>
                            <p class="m-0 mt-0.5">Dokumen ini adalah bukti transaksi sah yang diterbitkan secara elektronik oleh CMSMu Suara 'Aisyiyah.</p>
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-teal-800">Tata Usaha & Keuangan</div>
                            <div class="text-slate-500">Suara 'Aisyiyah Digital</div>
                        </div>
                    </div>

                </div>
            </template>

            <!-- FOOTER MODAL (HIDDEN ON PRINT) -->
            <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 print:hidden">
                <button type="button" @click="closeInvoiceModal()" class="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer transition-all">
                    Tutup
                </button>
                <button type="button" @click="printInvoice()" class="px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-xs cursor-pointer transition-all inline-flex items-center gap-1.5 border-0">
                    <i class="fas fa-print"></i> Cetak / Simpan PDF
                </button>
            </div>

        </div>
    </div>

    <!-- PRINT STYLESHEET UNTUK INVOICE RESMI -->
    <style>
    @media print {
        body * {
            visibility: hidden !important;
        }
        #invoice-official-print, #invoice-official-print * {
            visibility: visible !important;
        }
        #invoice-official-print {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: #ffffff !important;
            z-index: 999999 !important;
        }
    }
    </style>

</div>
`;
