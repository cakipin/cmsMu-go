/**
 * 📦 OTA Manager Addon View
 * Antarmuka panel admin untuk mengelola distribusi Over-The-Air Update CMSMu (Dual-Role: Hub & Client).
 */

export const otaView = `
<div class="animate-fade" style="padding-bottom:60px;" x-data="otaManagerData()">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
            <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-lg shadow-xs">
                    <i class="fas" :class="isHub ? 'fa-cloud-upload-alt' : 'fa-cloud-download-alt'"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-slate-800 m-0" x-text="isHub ? 'OTA Manager (Pusat Distribusi)' : 'OTA Updater (Pembaruan Sistem)'">OTA Manager</h2>
                    <p class="text-xs text-slate-500 m-0 mt-0.5" x-text="isHub ? 'Pusat Distribusi Pembaruan Over-The-Air & Rilis Core CMSMu' : 'Pusat Pembaruan Otomatis & Sinkronisasi Skema CMSMu dari Server Pusat'">Pusat Distribusi Pembaruan Over-The-Air & Auto-Migration CMSMu</p>
                </div>
            </div>
        </div>
        <div class="flex items-center gap-2.5">
            <button @click="checkUpdates(true)" :disabled="isLoading" 
                    class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-xs">
                <i class="fas" :class="isLoading ? 'fa-spinner fa-spin text-teal-600' : 'fa-sync-alt'"></i>
                <span>Periksa Pembaruan</span>
            </button>
            <template x-if="!isHub">
                <button @click="openManualUpdateModal()" :disabled="isApplying" 
                        class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer border-0">
                    <i class="fas" :class="isApplying ? 'fa-spinner fa-spin' : 'fa-bolt'"></i>
                    <span>Perbarui Manual</span>
                </button>
            </template>
            <template x-if="isHub">
                <button @click="openPushModal()" 
                        class="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer border-0">
                    <i class="fas fa-paper-plane"></i>
                    <span>Push Update ke Pengguna</span>
                </button>
            </template>
        </div>
    </div>

    <!-- CLIENT MODE BANNER: UPDATE AVAILABLE -->
    <!-- CLIENT MODE BANNER: UPDATE AVAILABLE -->
    <template x-if="!isHub && hasUpdate">
        <div class="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs mb-6">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-start gap-3.5">
                    <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <i class="fas fa-rocket text-lg"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h3 class="text-base font-bold text-amber-950 m-0">Pembaruan Core CMSMu Tersedia!</h3>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 uppercase" x-text="'v' + (updateInfo?.latestVersion || '0.1.2')">v0.1.2</span>
                        </div>
                        <p class="text-xs text-amber-800 m-0 mt-1 max-w-xl leading-relaxed" x-text="updateInfo?.changelog || 'Pembaruan core engine dan peningkatan stabilitas CMSMu.'"></p>
                        <p class="text-[11px] text-amber-700/80 m-0 mt-1">
                            Versi terpasang saat ini: <strong x-text="'v' + (statusData.currentCoreVersion || '0.1.1')">v0.1.1</strong> • 
                            Pusat rilis: <span class="font-mono font-semibold" x-text="updateInfo?.source === 'github' ? 'GitHub (cakipin/cmsMu-go)' : 'Hub (cms.labmu.dev)'">GitHub (cakipin/cmsMu-go)</span>
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <button @click="openApplyModal()" :disabled="isApplying"
                            class="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer border-0">
                        <i class="fas" :class="isApplying ? 'fa-spinner fa-spin' : 'fa-bolt'"></i>
                        <span x-text="isApplying ? 'Memproses Pembaruan...' : 'Perbarui Sekarang'">Perbarui Sekarang</span>
                    </button>
                </div>
            </div>
        </div>
    </template>

    <!-- CLIENT MODE BANNER: UP TO DATE -->
    <template x-if="!isHub && !hasUpdate && !isLoading">
        <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 shadow-xs mb-6 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <i class="fas fa-check"></i>
                </div>
                <div>
                    <h4 class="text-xs font-bold text-emerald-950 m-0">Sistem CMSMu Anda Sudah Dalam Versi Terkini</h4>
                    <p class="text-[11px] text-emerald-700 m-0 mt-0.5">Versi terpasang: <strong x-text="'v' + (statusData.currentCoreVersion || '0.1.1')">v0.1.1</strong> • Terhubung ke server rilis resmi <span class="font-mono">cms.labmu.dev</span></p>
                </div>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Tersinkron</span>
        </div>
    </template>

    <!-- Status Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Versi Core Framework</span>
            <div class="flex items-baseline gap-2 mt-1.5">
                <span class="text-2xl font-black text-slate-800" x-text="'v' + (statusData.currentCoreVersion || '0.1.1')">v0.1.1</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Aktif</span>
            </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block" x-text="isHub ? 'Versi Manifest Publik' : 'Versi Server Pusat'">Versi Manifest Publik</span>
            <div class="flex items-baseline gap-2 mt-1.5">
                <span class="text-2xl font-black text-teal-600" x-text="'v' + (isHub ? statusData.activeManifestVersion : (updateInfo?.latestVersion || statusData.currentCoreVersion))">v0.1.1</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" :class="isHub ? 'bg-teal-50 text-teal-700' : (hasUpdate ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700')" x-text="isHub ? 'Online' : (hasUpdate ? 'Pembaruan Siap' : 'Mutakhir')">Online</span>
            </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Peran Operasional</span>
            <div class="flex items-baseline gap-2 mt-1.5">
                <span class="text-2xl font-black text-slate-800" x-text="isHub ? 'Hub Pusat' : 'Klien Pengguna'">Hub Pusat</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700" x-text="isHub ? 'Distributor' : 'Downstream'">Publik</span>
            </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Integritas Database D1</span>
            <div class="flex items-baseline gap-2 mt-1.5">
                <span class="text-lg font-bold text-slate-800" x-text="statusData.databaseIntegrity?.status === 'synced' ? 'Tersinkron' : 'Perlu Migrasi'">Tersinkron</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700" x-text="statusData.databaseIntegrity?.appliedMigrations + '/' + statusData.databaseIntegrity?.totalMigrations">3/3</span>
            </div>
        </div>
    </div>

    <!-- Release History Table (Hub Mode) -->
    <template x-if="isHub">
        <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 class="text-sm font-bold text-slate-800 m-0">Riwayat Rilis OTA Pusat</h3>
                    <p class="text-xs text-slate-500 m-0 mt-0.5">Daftar pembaruan yang telah disiarkan ke seluruh instance CMSMu</p>
                </div>
                <span class="text-xs text-slate-400" x-text="releases.length + ' rilis tercatat'"></span>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr class="bg-slate-50 text-slate-600 border-b border-slate-100">
                            <th class="py-3 px-4 sm:px-6 font-semibold">Versi Rilis</th>
                            <th class="py-3 px-4 font-semibold">Saluran</th>
                            <th class="py-3 px-4 font-semibold">Catatan Rilis (Changelog)</th>
                            <th class="py-3 px-4 font-semibold">Tanggal Rilis</th>
                            <th class="py-3 px-4 font-semibold text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <template x-if="isLoading">
                            <tr>
                                <td colspan="5" class="py-8 text-center text-slate-400">
                                    <i class="fas fa-spinner fa-spin text-teal-600 text-lg mb-2"></i>
                                    <p class="m-0 text-xs">Memuat data rilis...</p>
                                </td>
                            </tr>
                        </template>
                        <template x-if="!isLoading && releases.length === 0">
                            <tr>
                                <td colspan="5" class="py-8 text-center text-slate-400">
                                    <i class="fas fa-inbox text-2xl text-slate-300 mb-2"></i>
                                    <p class="m-0 text-xs font-medium text-slate-500">Belum ada rilis manual yang tersimpan di database</p>
                                    <p class="m-0 text-[11px] text-slate-400 mt-1">Sistem saat ini menggunakan rilis baseline bawaan core (v0.1.1).</p>
                                </td>
                            </tr>
                        </template>
                        <template x-for="rel in releases" :key="rel.id">
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="py-3.5 px-4 sm:px-6 font-bold text-slate-800">
                                    <span class="px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-xs" x-text="'v' + rel.version"></span>
                                </td>
                                <td class="py-3.5 px-4">
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                          :class="rel.channel === 'stable' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                                          x-text="rel.channel"></span>
                                </td>
                                <td class="py-3.5 px-4 max-w-md text-slate-600" x-text="rel.changelog || '-'"></td>
                                <td class="py-3.5 px-4 text-slate-500" x-text="rel.build_date || rel.created_at?.split(' ')[0]"></td>
                                <td class="py-3.5 px-4 text-center">
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                          :class="rel.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                                          x-text="rel.is_active ? 'Aktif' : 'Arsip'"></span>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>
    </template>

    <!-- Client System Status (Client Mode) -->
    <template x-if="!isHub">
        <div class="space-y-6">
            <!-- AUTO-UPDATE TOGGLE & MANUAL ACTION CARD -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-start gap-3.5">
                        <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-xs">
                            <i class="fas fa-magic text-base"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="text-sm font-bold text-slate-800 m-0">Pembaruan Otomatis (Auto-Update)</h3>
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" 
                                      :class="autoUpdateEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'"
                                      x-text="autoUpdateEnabled ? 'Aktif (Otomatis)' : 'Manual (Dinonaktifkan)'">Aktif</span>
                            </div>
                            <p class="text-xs text-slate-500 m-0 mt-1 max-w-xl leading-relaxed">
                                Saat diaktifkan, sistem akan otomatis menerapkan migrasi skema database D1 di latar belakang setiap kali server rilis resmi <span class="font-mono">cms.labmu.dev</span> menyiarkan pembaruan baru.
                            </p>
                        </div>
                    </div>
                    
                    <!-- TOGGLE SWITCH -->
                    <div class="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <span class="text-xs font-medium text-slate-500" x-text="autoUpdateEnabled ? 'Otomatis' : 'Manual'"></span>
                        <button type="button" @click="toggleAutoUpdate()" :disabled="isTogglingAutoUpdate"
                                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                :class="autoUpdateEnabled ? 'bg-teal-600' : 'bg-slate-200'">
                            <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                                  :class="autoUpdateEnabled ? 'translate-x-5' : 'translate-x-0'"></span>
                        </button>
                    </div>
            </div>
        </div>
    </template>

    <!-- IN-SYSTEM MODAL: MANUAL UPDATE CONFIRMATION (SOP 16) -->
    <div x-show="showManualModal" style="display:none;" 
         class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
         @keydown.escape.window="showManualModal = false">
        <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
             @click.outside="showManualModal = false">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-teal-50/50">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-sm">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <h3 class="text-sm font-bold text-slate-800 m-0">Jalankan Pembaruan Manual</h3>
                </div>
                <button @click="showManualModal = false" class="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-6 text-xs text-slate-600 leading-relaxed">
                <p class="m-0 mb-3">Sistem akan menyelaraskan integritas skema database D1 dan memvalidasi status sistem secara langsung dengan Core CMSMu terkini.</p>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3">
                    <span class="font-semibold text-slate-700 block mb-1">Tindakan Sistem:</span>
                    <p class="m-0 text-[11px] text-slate-600">Eksekusi migrasi skema D1 (auto-migration), verifikasi manifest, dan penyegaran cache lokal.</p>
                </div>
                <p class="m-0 text-[11px] text-slate-500">Proses ini aman, tanpa downtime, dan tidak akan merusak data artikel maupun tema kustom Anda.</p>
            </div>
            <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                <button @click="showManualModal = false" class="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer">
                    Batal
                </button>
                <button @click="executeManualUpdate()" :disabled="isApplying"
                        class="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-2 cursor-pointer border-0">
                    <i class="fas" :class="isApplying ? 'fa-spinner fa-spin' : 'fa-bolt'"></i>
                    <span x-text="isApplying ? 'Menerapkan...' : 'Mulai Pembaruan'">Mulai Pembaruan</span>
                </button>
            </div>
        </div>
    </div>

    <!-- IN-SYSTEM MODAL: PUSH UPDATE (SOP 16 - Zero Native Browser Alert) -->
    <div x-show="showPushModal" style="display:none;" 
         class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
         @keydown.escape.window="showPushModal = false">
        <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
             @click.outside="showPushModal = false">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-sm">
                        <i class="fas fa-paper-plane"></i>
                    </div>
                    <h3 class="text-sm font-bold text-slate-800 m-0">Push Pembaruan Baru ke Pengguna</h3>
                </div>
                <button @click="showPushModal = false" class="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-6 space-y-4 text-xs">
                <div>
                    <label class="font-semibold text-slate-700 block mb-1.5">Nomor Versi Rilis</label>
                    <input type="text" x-model="pushForm.version" placeholder="contoh: 0.1.1"
                           class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-teal-500 bg-slate-50/30">
                </div>
                <div>
                    <label class="font-semibold text-slate-700 block mb-1.5">Saluran Distribusi</label>
                    <select x-model="pushForm.channel" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-teal-500 bg-white">
                        <option value="stable">Stable (Publik & Rekomendasi)</option>
                        <option value="beta">Beta (Pengujian Internal)</option>
                    </select>
                </div>
                <div>
                    <label class="font-semibold text-slate-700 block mb-1.5">Catatan Rilis (Changelog)</label>
                    <textarea x-model="pushForm.changelog" rows="3" placeholder="Rangkuman perbaikan atau fitur baru pada rilis ini..."
                              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-teal-500 bg-slate-50/30"></textarea>
                </div>
            </div>
            <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                <button @click="showPushModal = false" class="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer">
                    Batal
                </button>
                <button @click="submitPush()" :disabled="isPushing"
                        class="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-2 cursor-pointer border-0">
                    <i class="fas" :class="isPushing ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                    <span x-text="isPushing ? 'Menyiarkan Rilis...' : 'Publikasikan Sekarang'">Publikasikan Sekarang</span>
                </button>
            </div>
        </div>
    </div>

    <!-- IN-SYSTEM MODAL: APPLY UPDATE CONFIRMATION (SOP 16) -->
    <div x-show="showApplyModal" style="display:none;" 
         class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
         @keydown.escape.window="showApplyModal = false">
        <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
             @click.outside="showApplyModal = false">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-teal-50/50">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-sm">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <div>
                        <h3 class="text-sm font-bold text-slate-800 m-0">Terapkan Pembaruan CMSMu</h3>
                        <span class="text-[11px] text-teal-700" x-text="'Target Versi: v' + (updateInfo?.latestVersion || '0.1.2')"></span>
                    </div>
                </div>
                <button @click="showApplyModal = false" class="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-6 text-xs text-slate-600 leading-relaxed space-y-3">
                <p class="m-0">Anda akan menerapkan pembaruan sistem ke versi <strong class="text-slate-900 font-bold" x-text="'v' + (updateInfo?.latestVersion || '0.1.2')">v0.1.2</strong>.</p>
                <div class="p-3 bg-amber-50/70 rounded-xl border border-amber-200/70 text-amber-900">
                    <span class="font-bold block mb-1">Catatan Pembaruan (Changelog):</span>
                    <p class="m-0 text-[11px] leading-relaxed italic" x-text="updateInfo?.changelog || '-'"></p>
                </div>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span class="font-semibold text-slate-700 block mb-1">Aksi Pembaruan:</span>
                    <ul class="m-0 pl-4 list-disc space-y-1 text-[11px] text-slate-600">
                        <li>Penyelarasan otomatis migrasi skema database Cloudflare D1.</li>
                        <li>Penyegaran status rilis core engine dan sinkronisasi manifest resmi.</li>
                    </ul>
                </div>
                <p class="m-0 text-[11px] text-slate-400">Proses pembaruan skema berjalan aman tanpa downtime.</p>
            </div>
            <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                <button @click="showApplyModal = false" class="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer">
                    Batal
                </button>
                <button @click="executeApplyUpdate()" :disabled="isApplying"
                        class="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center gap-2 cursor-pointer border-0">
                    <i class="fas" :class="isApplying ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                    <span x-text="isApplying ? 'Menerapkan...' : 'Ya, Perbarui Sekarang'">Ya, Perbarui Sekarang</span>
                </button>
            </div>
        </div>
    </div>
</div>

<script>
if (typeof window !== 'undefined') {
    window.otaManagerData = function() {
        return {
            isLoading: false,
            isPushing: false,
            isApplying: false,
            showPushModal: false,
            showApplyModal: false,
            showManualModal: false,
            autoUpdateEnabled: true,
            isTogglingAutoUpdate: false,
            isHub: false,
            hasUpdate: false,
            updateInfo: null,
            statusData: {
                currentCoreVersion: '0.1.2',
                activeManifestVersion: '0.1.2',
                databaseIntegrity: { appliedMigrations: 3, totalMigrations: 3, status: 'synced' }
            },
            releases: [],
            pushForm: {
                version: '0.1.2',
                channel: 'stable',
                changelog: 'Rilis pembaruan OTA Engine Addon CMSMu v0.1.2.'
            },

            async init() {
                await this.detectMode();
                await this.loadConfig();
                await this.loadStatus(false);
                if (this.isHub) {
                    await this.loadReleases();
                } else {
                    await this.checkUpdates(false);
                }
            },

            async detectMode() {
                try {
                    const res = await fetch('/api/addons/ota/mode');
                    if (res.ok) {
                        const json = await res.json();
                        this.isHub = !!json.data?.isHub;
                    }
                } catch(e) {
                    this.isHub = window.location.hostname.includes('cms.labmu.dev');
                }
            },

            async loadStatus(showToast = false) {
                this.isLoading = true;
                try {
                    const token = localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '';
                    const res = await fetch('/api/addons/ota/status', {
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    if (res.ok) {
                        const json = await res.json();
                        this.statusData = json.data || this.statusData;
                        if (json.data?.isHub !== undefined) {
                            this.isHub = json.data.isHub;
                        }
                        if (showToast && window.showToast) {
                            window.showToast('Status OTA berhasil disegarkan!', 'success');
                        }
                    }
                } catch(e) {
                    console.error('Gagal load status OTA:', e);
                } finally {
                    this.isLoading = false;
                }
            },

            async checkUpdates(showToast = false) {
                this.isLoading = true;
                try {
                    const token = localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '';
                    const curVer = this.statusData.currentCoreVersion || '0.1.0';
                    const res = await fetch('/api/addons/ota/check-update?client_version=' + encodeURIComponent(curVer) + '&t=' + Date.now(), {
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    if (res.ok) {
                        const json = await res.json();
                        this.updateInfo = json.data;
                        this.hasUpdate = !!json.data?.hasCoreUpdate;
                        if (showToast && window.showToast) {
                            if (this.hasUpdate) {
                                window.showToast('Pembaruan CMSMu v' + json.data.latestVersion + ' tersedia!', 'warning');
                            } else {
                                window.showToast('CMSMu sudah dalam versi terbaru!', 'success');
                            }
                        }
                    }
                } catch(e) {
                    console.error('Gagal check update:', e);
                } finally {
                    this.isLoading = false;
                }
            },

            async loadReleases() {
                try {
                    const token = localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '';
                    const res = await fetch('/api/addons/ota/releases', {
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    if (res.ok) {
                        const json = await res.json();
                        this.releases = json.data || [];
                    }
                } catch(e) {
                    console.error('Gagal load releases:', e);
                }
            },

            openPushModal() {
                this.pushForm.version = this.statusData.activeManifestVersion || '0.1.1';
                this.pushForm.channel = 'stable';
                this.pushForm.changelog = 'Rilis pembaruan CMSMu v' + this.pushForm.version;
                this.showPushModal = true;
            },

            openApplyModal() {
                this.showApplyModal = true;
            },

            async executeApplyUpdate() {
                this.isApplying = true;
                try {
                    const token = localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '';
                    const res = await fetch('/api/addons/ota/apply-update', {
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    if (res.ok) {
                        const json = await res.json();
                        this.showApplyModal = false;
                        this.hasUpdate = false;
                        if (window.showToast) {
                            window.showToast(json.message || 'Pembaruan sistem berhasil diterapkan!', 'success');
                        }
                        await this.loadStatus(false);
                        await this.checkUpdates(false);
                    } else {
                        const err = await res.json().catch(function() { return {}; });
                        if (window.showToast) {
                            window.showToast(err.error || 'Gagal menerapkan pembaruan.', 'error');
                        }
                    }
                } catch (e) {
                    if (window.showToast) window.showToast('Error: ' + e.message, 'error');
                } finally {
                    this.isApplying = false;
                }
            },

            async submitPush() {
                if (!this.pushForm.version || !this.pushForm.version.trim()) {
                    if (window.showToast) window.showToast('Nomor versi wajib diisi!', 'warning');
                    return;
                }

                this.isPushing = true;
                try {
                    const token = localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '';
                    const res = await fetch('/api/addons/ota/push', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(this.pushForm)
                    });

                    if (res.ok) {
                        const json = await res.json();
                        this.showPushModal = false;
                        if (window.showToast) {
                            window.showToast(json.message || 'Pembaruan berhasil di-push ke seluruh pengguna!', 'success');
                        }
                        await this.loadStatus(false);
                        await this.loadReleases();
                    } else {
                        const err = await res.json().catch(function() { return {}; });
                        if (window.showToast) {
                            window.showToast(err.error || 'Gagal mem-push pembaruan.', 'error');
                        }
                    }
                } catch (e) {
                    if (window.showToast) window.showToast('Error: ' + e.message, 'error');
                } finally {
                    this.isPushing = false;
                }
            },

            async loadConfig() {
                try {
                    const res = await fetch('/api/addons/ota/config');
                    if (res.ok) {
                        const json = await res.json();
                        if (json.data && json.data.auto_update !== undefined) {
                            this.autoUpdateEnabled = !!json.data.auto_update;
                        }
                    }
                } catch(e) {}
            },

            async toggleAutoUpdate() {
                this.isTogglingAutoUpdate = true;
                const nextState = !this.autoUpdateEnabled;
                try {
                    const token = localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '';
                    const res = await fetch('/api/addons/ota/config', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ auto_update: nextState })
                    });
                    if (res.ok) {
                        const json = await res.json();
                        this.autoUpdateEnabled = nextState;
                        if (window.showToast) {
                            window.showToast(json.message || ('Pembaruan otomatis ' + (nextState ? 'diaktifkan' : 'dinonaktifkan') + '!'), 'success');
                        }
                    } else {
                        if (window.showToast) window.showToast('Gagal mengubah status auto-update', 'error');
                    }
                } catch(e) {
                    if (window.showToast) window.showToast('Error: ' + e.message, 'error');
                } finally {
                    this.isTogglingAutoUpdate = false;
                }
            },

            openManualUpdateModal() {
                this.showManualModal = true;
            },

            async executeManualUpdate() {
                this.isApplying = true;
                try {
                    const token = localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '';
                    const res = await fetch('/api/addons/ota/apply-update', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ manual: true, force: true })
                    });
                    if (res.ok) {
                        const json = await res.json();
                        this.showManualModal = false;
                        if (window.showToast) {
                            window.showToast(json.message || 'Pembaruan manual berhasil diterapkan!', 'success');
                        }
                        await this.loadStatus(false);
                        await this.checkUpdates(false);
                    } else {
                        const err = await res.json().catch(function() { return {}; });
                        if (window.showToast) window.showToast(err.error || 'Gagal menjalankan pembaruan manual', 'error');
                    }
                } catch(e) {
                    if (window.showToast) window.showToast('Error: ' + e.message, 'error');
                } finally {
                    this.isApplying = false;
                }
            }
        };
    };

    // Safety net showToast (SOP 16 - Floating Toast In-System)
    if (!window.showToast) {
        window.showToast = function(msg, type) {
            type = type || 'info';
            let container = document.getElementById('cms-toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'cms-toast-container';
                container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none';
                document.body.appendChild(container);
            }
            const toast = document.createElement('div');
            const bgClass = type === 'success' ? 'bg-emerald-600 text-white' : (type === 'error' ? 'bg-rose-600 text-white' : (type === 'warning' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-white'));
            const iconClass = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : (type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'));
            toast.className = 'px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2.5 pointer-events-auto transition-all transform translate-y-2 opacity-0 duration-200 ' + bgClass;
            toast.innerHTML = '<i class="fas ' + iconClass + '"></i><span>' + msg + '</span>';
            container.appendChild(toast);
            requestAnimationFrame(function() {
                toast.classList.remove('translate-y-2', 'opacity-0');
            });
            setTimeout(function() {
                toast.classList.add('opacity-0', 'translate-y-2');
                setTimeout(function() { toast.remove(); }, 300);
            }, 3500);
        };
    }
}
</script>
`;
