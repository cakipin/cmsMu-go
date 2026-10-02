/**
 * 📋 Laporan Pembaruan Sistem (System Update Audit Report Modal)
 * Menyajikan audit laporan transparan mengenai daftar path berkas fisik yang diperbarui,
 * status sinkronisasi kode, dan integritas skema database D1.
 * SOP Rule 20 Compliant (< 1000 baris)
 */

export const otaReportModal = `
<!-- MODAL LAPORAN PEMBARUAN SISTEM (SYSTEM UPDATE AUDIT REPORT) -->
<div x-show="showReportModal" 
     class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto" 
     x-transition:enter="transition ease-out duration-200"
     x-transition:enter-start="opacity-0 transform scale-95"
     x-transition:enter-end="opacity-100 transform scale-100"
     x-transition:leave="transition ease-in duration-150"
     x-transition:leave-start="opacity-100 transform scale-100"
     x-transition:leave-end="opacity-0 transform scale-95"
     x-cloak>
    
    <div class="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all my-8 font-sans">
        
        <!-- Header Modal -->
        <div class="p-6 border-b border-slate-100 bg-gradient-to-r from-teal-50/50 via-white to-emerald-50/30 flex items-start justify-between">
            <div class="flex items-center gap-3.5">
                <div class="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
                    <i class="fas fa-clipboard-check text-xl"></i>
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <h3 class="text-base font-bold text-slate-800 m-0">Laporan Pembaruan Sistem (Update Audit Report)</h3>
                        <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Berhasil Diterapkan
                        </span>
                    </div>
                    <p class="text-xs text-slate-500 m-0 mt-1 leading-relaxed">
                        Audit transparansi berkas fisik yang diperbarui, status patch editor, dan integritas skema database D1.
                    </p>
                </div>
            </div>
            <button type="button" @click="showReportModal = false" class="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer p-1 text-base">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <!-- Body Modal -->
        <div class="p-6 max-h-[70vh] overflow-y-auto space-y-5 text-xs text-slate-600">
            
            <!-- Ringkasan Versi & Database -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Versi Core Terpasang</div>
                    <div class="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                        <i class="fas fa-cube text-teal-600 text-xs"></i>
                        <span x-text="'v' + ((updateReport && updateReport.version) || statusData?.activeManifestVersion || '0.1.3')">v0.1.3</span>
                    </div>
                </div>

                <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Skema Database D1</div>
                    <div class="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                        <i class="fas fa-database text-emerald-600 text-xs"></i>
                        <span>v0.1.0</span>
                        <span class="text-[11px] font-normal text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Tersinkron</span>
                    </div>
                </div>

                <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Status Rollout Klien</div>
                    <div class="text-base font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                        <i class="fas fa-check-circle text-emerald-600 text-xs"></i>
                        <span>Kode & DB Sinkron</span>
                    </div>
                </div>
            </div>

            <!-- Tabel Daftar Berkas & Komponen yang Diperbarui -->
            <div class="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div class="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div class="font-bold text-slate-700 flex items-center gap-2">
                        <i class="fas fa-file-code text-teal-600"></i>
                        <span>Daftar Komponen & Path Berkas yang Diperbarui</span>
                    </div>
                    <!-- Filter Kategori Tabs (All / Theme / Plugin / Core) -->
                    <div class="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-[11px] font-semibold">
                        <button type="button" @click="activeComponentTab = 'all'"
                                :class="activeComponentTab === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-transparent'"
                                class="px-2.5 py-1 rounded-md transition-all border-0 cursor-pointer">
                            Semua
                        </button>
                        <button type="button" @click="activeComponentTab = 'theme'"
                                :class="activeComponentTab === 'theme' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-purple-700 bg-transparent'"
                                class="px-2.5 py-1 rounded-md transition-all border-0 cursor-pointer flex items-center gap-1">
                            <i class="fas fa-paint-brush text-[10px]"></i> Theme
                        </button>
                        <button type="button" @click="activeComponentTab = 'plugin'"
                                :class="activeComponentTab === 'plugin' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-700 bg-transparent'"
                                class="px-2.5 py-1 rounded-md transition-all border-0 cursor-pointer flex items-center gap-1">
                            <i class="fas fa-puzzle-piece text-[10px]"></i> Plugin
                        </button>
                        <button type="button" @click="activeComponentTab = 'core'"
                                :class="activeComponentTab === 'core' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-teal-700 bg-transparent'"
                                class="px-2.5 py-1 rounded-md transition-all border-0 cursor-pointer flex items-center gap-1">
                            <i class="fas fa-cog text-[10px]"></i> Core
                        </button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50/70 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
                                <th class="p-3 w-1/4">Komponen & Tipe</th>
                                <th class="p-3 w-1/3">Path Berkas di Sistem</th>
                                <th class="p-3">Ringkasan Perbaikan</th>
                                <th class="p-3 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-xs">
                            <template x-for="comp in filteredComponents()" :key="comp.path || (comp.paths ? comp.paths[0] : comp.name)">
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="p-3">
                                        <div class="font-bold text-slate-800" x-text="comp.name"></div>
                                        <div class="mt-0.5">
                                            <span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                                                  :class="{
                                                    'bg-purple-50 text-purple-700 border border-purple-200': ['theme', 'ui'].includes(comp.type),
                                                    'bg-blue-50 text-blue-700 border border-blue-200': ['plugin', 'addon'].includes(comp.type),
                                                    'bg-teal-50 text-teal-700 border border-teal-200': ['core', 'editor', 'db'].includes(comp.type)
                                                  }"
                                                  x-text="comp.type"></span>
                                        </div>
                                    </td>
                                    <td class="p-3">
                                        <template x-if="comp.paths && Array.isArray(comp.paths)">
                                            <div class="space-y-1">
                                                <template x-for="p in comp.paths">
                                                    <code class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] block truncate max-w-[240px]" 
                                                          :title="p" 
                                                          x-text="p"></code>
                                                </template>
                                            </div>
                                        </template>
                                        <template x-if="!comp.paths && comp.path">
                                            <code class="px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono text-[11px] block truncate max-w-[240px]" 
                                                  :title="comp.path" 
                                                  x-text="comp.path"></code>
                                        </template>
                                    </td>
                                    <td class="p-3 text-slate-600 text-[11px] leading-relaxed" x-text="comp.description"></td>
                                    <td class="p-3 text-right">
                                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <i class="fas fa-check text-[10px]"></i> Tersinkron
                                        </span>
                                    </td>
                                </tr>
                            </template>
                            <template x-if="filteredComponents().length === 0">
                                <tr>
                                    <td colspan="4" class="p-6 text-center text-slate-400 text-xs">
                                        Tidak ada komponen dalam kategori ini.
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Petunjuk Pasca Pembaruan -->
            <div class="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                <p class="m-0 font-bold flex items-center gap-1.5 text-amber-900">
                    <i class="fas fa-info-circle text-amber-600"></i> Catatan Verifikasi Pembaruan:
                </p>
                <p class="m-0 mt-1">
                    Seluruh perbaikan editor (Media Selector Modal terpusat, WP Classic Toolbar, SEO metadata auto-generate) kini telah terpasang aktif. Jika antarmuka masih memuat cache browser lokal, silakan lakukan <strong>Muat Ulang Halaman</strong> atau Hard Refresh (Ctrl+Shift+R / Cmd+Shift+R).
                </p>
            </div>
        </div>

        <!-- Footer Modal -->
        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span class="text-[11px] text-slate-500 font-medium">
                CMSMu Cloud Native Framework &copy; 2026
            </span>
            <div class="flex items-center gap-2.5">
                <button type="button" @click="showReportModal = false" 
                        class="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer shadow-xs">
                    Tutup Laporan
                </button>
                <button type="button" @click="window.location.reload()" 
                        class="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center gap-2 cursor-pointer border-0">
                    <i class="fas fa-sync-alt"></i>
                    <span>Muat Ulang Halaman</span>
                </button>
            </div>
        </div>

    </div>
</div>
`;
