/**
 * 📦 OTA Manager Addon View
 * Antarmuka panel admin untuk mengelola distribusi Over-The-Air Update CMSMu (Dual-Role: Hub & Client).
 * Dipisahkan sesuai SOP Rule 20 (Clean Architecture & Batas < 1000 Baris)
 */

import { otaManagerScript } from "./view.client";
import { otaReportModal } from "./report.modal";

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
        <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <i class="fas fa-check"></i>
                </div>
                <div>
                    <h4 class="text-xs font-bold text-emerald-950 m-0">Sistem CMSMu Anda Sudah Dalam Versi Terkini</h4>
                    <p class="text-[11px] text-emerald-700 m-0 mt-0.5">Versi terpasang: <strong x-text="'v' + (statusData.currentCoreVersion || '0.1.3')">v0.1.3</strong> • Terhubung ke server rilis resmi <span class="font-mono">cms.labmu.dev</span></p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button type="button" @click="openReportModal()" class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 shadow-xs flex items-center gap-1.5 cursor-pointer">
                    <i class="fas fa-clipboard-list text-emerald-600"></i>
                    <span>Lihat Laporan Pembaruan</span>
                </button>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Tersinkron</span>
            </div>
        </div>
    </template>

    <!-- Status Metric Cards (3 Kolom Simetris) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Versi Core Framework</span>
            <div class="flex items-baseline gap-2 mt-1.5">
                <span class="text-2xl font-black text-slate-800" x-text="'v' + (statusData.currentCoreVersion || '0.1.2')">v0.1.2</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Aktif</span>
            </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block" x-text="isHub ? 'Versi Manifest Publik' : 'Versi Server Pusat'">Versi Manifest Publik</span>
            <div class="flex items-baseline gap-2 mt-1.5">
                <span class="text-2xl font-black text-teal-600" x-text="'v' + (isHub ? statusData.activeManifestVersion : (updateInfo?.latestVersion || statusData.currentCoreVersion || '0.1.2'))">v0.1.2</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" :class="isHub ? 'bg-teal-50 text-teal-700' : (hasUpdate ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700')" x-text="isHub ? 'Online' : (hasUpdate ? 'Pembaruan Siap' : 'Mutakhir')">Online</span>
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

    <!-- Hub Mode Sections -->
    <template x-if="isHub">
        <div class="space-y-6">
            <!-- Navigation Tabs Bar -->
            <div class="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button type="button" @click="activeHubTab = 'releases'"
                        :class="activeHubTab === 'releases' ? 'bg-teal-50 text-teal-700 border-teal-300 font-bold shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
                        class="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer">
                    <i class="fas fa-history" :class="activeHubTab === 'releases' ? 'text-teal-600' : 'text-slate-400'"></i>
                    <span>Riwayat Rilis OTA Pusat</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-mono" :class="activeHubTab === 'releases' ? 'bg-teal-100 text-teal-800 font-bold' : 'bg-slate-100 text-slate-600'" x-text="releases.length"></span>
                </button>
                <button type="button" @click="activeHubTab = 'clients'"
                        :class="activeHubTab === 'clients' ? 'bg-teal-50 text-teal-700 border-teal-300 font-bold shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
                        class="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer">
                    <i class="fas fa-network-wired" :class="activeHubTab === 'clients' ? 'text-teal-600' : 'text-slate-400'"></i>
                    <span>Distribusi Pengguna (Client Rollout)</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-mono" :class="activeHubTab === 'clients' ? 'bg-teal-100 text-teal-800 font-bold' : 'bg-slate-100 text-slate-600'" x-text="clients.length + ' Instansi'"></span>
                </button>
                <button type="button" @click="activeHubTab = 'git'"
                        :class="activeHubTab === 'git' ? 'bg-teal-50 text-teal-700 border-teal-300 font-bold shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
                        class="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer">
                    <i class="fab fa-github" :class="activeHubTab === 'git' ? 'text-teal-600' : 'text-slate-400'"></i>
                    <span>Git Upstream (cmsMu-go)</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                          :class="gitStatus?.isSynced ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                          x-text="gitStatus?.isSynced ? 'Tersinkron' : 'Perlu Push'"></span>
                </button>
            </div>

            <!-- TAB 1: RIWAYAT RILIS OTA PUSAT -->
            <div x-show="activeHubTab === 'releases'" class="space-y-4">
                <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div class="p-4 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 class="text-sm font-bold text-slate-800 m-0">Riwayat Rilis OTA Pusat</h3>
                            <p class="text-xs text-slate-500 m-0 mt-0.5">Daftar pembaruan yang telah disiarkan ke seluruh instance CMSMu</p>
                        </div>
                        <div class="flex flex-wrap items-center gap-2">
                            <!-- Search Changelog / Version -->
                            <div class="relative">
                                <input type="text" x-model="releaseSearch" @input="releasePage = 1" placeholder="Cari rilis atau changelog..."
                                       class="pl-8 pr-7 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-teal-500 w-44 sm:w-52 bg-slate-50/50">
                                <i class="fas fa-search absolute left-2.5 top-2.5 text-slate-400 text-[11px]"></i>
                                <button type="button" x-show="releaseSearch" @click="releaseSearch = ''; releasePage = 1" class="absolute right-2 top-2 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer text-[10px]">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <button type="button" @click="openClearReleasesModal()" class="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs" title="Bersihkan riwayat rilis arsip lama">
                                <i class="fas fa-trash-alt"></i>
                                <span>Clear Log Rilis</span>
                            </button>
                            <span class="text-xs font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100" x-text="releases.length + ' rilis tercatat'"></span>
                        </div>
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
                        <template x-if="!isLoading && filteredReleases().length === 0">
                            <tr>
                                <td colspan="5" class="py-8 text-center text-slate-400">
                                    <i class="fas fa-inbox text-2xl text-slate-300 mb-2"></i>
                                    <p class="m-0 text-xs font-medium text-slate-500">Tidak ada riwayat rilis yang cocok</p>
                                    <p class="m-0 text-[11px] text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
                                </td>
                            </tr>
                        </template>
                        <template x-for="rel in paginatedReleases()" :key="rel.id || rel.version + (rel.created_at || '')">
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="py-3.5 px-4 sm:px-6 font-bold text-slate-800 whitespace-nowrap">
                                    <div class="flex items-center gap-1.5">
                                        <span class="px-2 py-1 rounded-md bg-slate-100 text-slate-800 font-mono text-xs font-bold" x-text="'v' + rel.version"></span>
                                        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold border" :class="getReleaseTypeBadge(rel.version)" x-text="getReleaseType(rel.version)"></span>
                                    </div>
                                </td>
                                <td class="py-3.5 px-4 whitespace-nowrap">
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                          :class="rel.channel === 'stable' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                                          x-text="rel.channel"></span>
                                </td>
                                <td class="py-3.5 px-4 max-w-md text-slate-600" x-text="rel.changelog || '-'"></td>
                                <td class="py-3.5 px-4 text-slate-500 whitespace-nowrap" x-text="rel.build_date || rel.created_at?.split(' ')[0]"></td>
                                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                          :class="rel.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                                          x-text="rel.is_active ? 'Aktif' : 'Arsip'"></span>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>

            <!-- Pagination Navigation Bar -->
            <template x-if="releases.length > 0">
                <div class="p-3.5 sm:px-6 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div class="flex items-center gap-2 text-slate-500">
                        <span class="text-xs">Baris:</span>
                        <select x-model.number="releasePerPage" @change="releasePage = 1" class="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-teal-500 cursor-pointer shadow-2xs">
                            <option :value="5">5 per hal</option>
                            <option :value="10">10 per hal</option>
                            <option :value="25">25 per hal</option>
                            <option :value="50">50 per hal</option>
                        </select>
                        <span class="hidden sm:inline text-slate-300">|</span>
                        <span>
                            Hal <b class="text-slate-800" x-text="releasePage"></b> dari <b class="text-slate-800" x-text="totalReleasePages"></b> (<span x-text="filteredReleases().length"></span> rilis)
                        </span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button type="button" @click="releasePage > 1 && releasePage--" :disabled="releasePage === 1"
                                class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-semibold shadow-xs flex items-center gap-1 transition-all">
                            <i class="fas fa-chevron-left text-[10px]"></i>
                            <span>Sebelumnya</span>
                        </button>
                        <span class="px-2.5 py-1 font-mono text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-md" x-text="releasePage + ' / ' + totalReleasePages"></span>
                        <button type="button" @click="releasePage < totalReleasePages && releasePage++" :disabled="releasePage >= totalReleasePages"
                                class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-semibold shadow-xs flex items-center gap-1 transition-all">
                            <span>Selanjutnya</span>
                            <i class="fas fa-chevron-right text-[10px]"></i>
                        </button>
                    </div>
                </div>
            </template>
        </div>
    </div> <!-- Close Tab 1 -->

    <!-- TAB 2: PEMANTAUAN DISTRIBUSI PENGGUNA (CLIENT ROLLOUT STATUS) -->
    <div x-show="activeHubTab === 'clients'" class="space-y-6">
        <!-- CLIENT ROLLOUT MONITOR (Hub Mode) -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-4 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <div class="flex items-center gap-2">
                        <h3 class="text-sm font-bold text-slate-800 m-0">Pemantauan Distribusi Pembaruan Pengguna (Client Rollout Status)</h3>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200" x-text="clients.length + ' Instansi'"></span>
                    </div>
                    <p class="text-xs text-slate-500 m-0 mt-0.5">Pantau status penerimaan sinyal, keberhasilan update, atau kendala galat pada instansi pengguna CMSMu</p>
                </div>
                <div class="flex items-center gap-2">
                    <!-- Status Filter Tabs -->
                    <div class="flex p-0.5 bg-slate-100 rounded-lg text-[11px] font-medium text-slate-600">
                        <button type="button" @click="clientFilter = 'all'" :class="clientFilter === 'all' ? 'bg-white shadow-xs font-bold text-slate-800' : 'text-slate-500 hover:text-slate-800'" class="px-2.5 py-1 rounded-md border-0 cursor-pointer transition-all">Semua</button>
                        <button type="button" @click="clientFilter = 'updated'" :class="clientFilter === 'updated' ? 'bg-white shadow-xs font-bold text-emerald-700' : 'text-slate-500 hover:text-slate-800'" class="px-2.5 py-1 rounded-md border-0 cursor-pointer transition-all">Sudah Update</button>
                        <button type="button" @click="clientFilter = 'received'" :class="clientFilter === 'received' ? 'bg-white shadow-xs font-bold text-amber-700' : 'text-slate-500 hover:text-slate-800'" class="px-2.5 py-1 rounded-md border-0 cursor-pointer transition-all">Menunggu</button>
                        <button type="button" @click="clientFilter = 'failed'" :class="clientFilter === 'failed' ? 'bg-white shadow-xs font-bold text-rose-700' : 'text-slate-500 hover:text-slate-800'" class="px-2.5 py-1 rounded-md border-0 cursor-pointer transition-all">Gagal</button>
                    </div>
                    <button type="button" @click="openClearClientsModal()" class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs" title="Kosongkan data instansi klien">
                        <i class="fas fa-eraser"></i>
                        <span>Reset Klien</span>
                    </button>
                    <button type="button" @click="loadClients(true)" :disabled="isLoadingClients" class="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer shadow-xs" title="Segarkan Data Klien">
                        <i class="fas" :class="isLoadingClients ? 'fa-spinner fa-spin text-teal-600' : 'fa-sync-alt'"></i>
                    </button>
                </div>
            </div>

            <!-- Metric Summary Mini Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:px-6 bg-slate-50/50 border-b border-slate-100">
                <div class="p-3 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                        <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Terdaftar</span>
                        <span class="text-lg font-bold text-slate-800" x-text="clientSummary.total || clients.length">0</span>
                    </div>
                    <i class="fas fa-network-wired text-slate-300 text-lg"></i>
                </div>
                <div class="p-3 bg-white rounded-lg border border-emerald-200/80 shadow-xs flex items-center justify-between">
                    <div>
                        <span class="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block">Sudah Update</span>
                        <span class="text-lg font-bold text-emerald-700" x-text="clientSummary.updated || 0">0</span>
                    </div>
                    <i class="fas fa-check-circle text-emerald-400 text-lg"></i>
                </div>
                <div class="p-3 bg-white rounded-lg border border-amber-200/80 shadow-xs flex items-center justify-between">
                    <div>
                        <span class="text-[10px] font-semibold text-amber-600 uppercase tracking-wider block">Menunggu Update</span>
                        <span class="text-lg font-bold text-amber-700" x-text="clientSummary.received || 0">0</span>
                    </div>
                    <i class="fas fa-clock text-amber-400 text-lg"></i>
                </div>
                <div class="p-3 bg-white rounded-lg border border-rose-200/80 shadow-xs flex items-center justify-between">
                    <div>
                        <span class="text-[10px] font-semibold text-rose-600 uppercase tracking-wider block">Gagal Update</span>
                        <span class="text-lg font-bold text-rose-700" x-text="clientSummary.failed || 0">0</span>
                    </div>
                    <i class="fas fa-exclamation-triangle text-rose-400 text-lg"></i>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr class="bg-slate-50 text-slate-600 border-b border-slate-100">
                            <th class="py-3 px-4 sm:px-6 font-semibold">Nama / Domain Instansi Pengguna</th>
                            <th class="py-3 px-4 font-semibold text-center">Versi Terpasang</th>
                            <th class="py-3 px-4 font-semibold text-center">Target Versi</th>
                            <th class="py-3 px-4 font-semibold text-center">Status Pembaruan</th>
                            <th class="py-3 px-4 font-semibold">Keterangan / Kendala Galat</th>
                            <th class="py-3 px-4 font-semibold text-right sm:pr-6">Terakhir Dilaporkan</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <template x-if="isLoadingClients">
                            <tr>
                                <td colspan="6" class="py-8 text-center text-slate-400">
                                    <i class="fas fa-spinner fa-spin text-teal-600 text-lg mb-2"></i>
                                    <p class="m-0 text-xs">Memuat data pemantauan pengguna...</p>
                                </td>
                            </tr>
                        </template>
                        <template x-if="!isLoadingClients && filteredClients().length === 0">
                            <tr>
                                <td colspan="6" class="py-8 text-center text-slate-400">
                                    <i class="fas fa-users-slash text-2xl text-slate-300 mb-2"></i>
                                    <p class="m-0 text-xs font-medium text-slate-500">Tidak ada data pengguna dalam filter ini</p>
                                    <p class="m-0 text-[11px] text-slate-400 mt-1">Belum ada klien yang melapor status pembaruan ke Hub.</p>
                                </td>
                            </tr>
                        </template>
                        <template x-for="c in filteredClients()" :key="c.id || c.client_url">
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="py-3 px-4 sm:px-6">
                                    <div class="font-bold text-slate-800" x-text="c.site_name || c.client_url"></div>
                                    <div class="text-[11px] font-mono text-slate-400 truncate max-w-xs" x-text="c.client_url"></div>
                                </td>
                                <td class="py-3 px-4 text-center">
                                    <span class="px-2 py-0.5 rounded-md font-mono text-xs font-bold"
                                          :class="c.installed_version === (statusData.activeManifestVersion || '0.1.2') ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'"
                                          x-text="'v' + (c.installed_version || '0.1.1')">v0.1.1</span>
                                </td>
                                <td class="py-3 px-4 text-center">
                                    <span class="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 font-mono text-xs font-bold"
                                          x-text="'v' + (c.target_version || statusData.activeManifestVersion || '0.1.2')">v0.1.2</span>
                                </td>
                                <td class="py-3 px-4 text-center">
                                    <template x-if="c.rollout_status === 'updated'">
                                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            <i class="fas fa-check-circle"></i>
                                            <span>Sudah Update (Sukses)</span>
                                        </span>
                                    </template>
                                    <template x-if="c.rollout_status === 'received'">
                                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                            <i class="fas fa-clock"></i>
                                            <span>Sudah Menerima (Menunggu)</span>
                                        </span>
                                    </template>
                                    <template x-if="c.rollout_status === 'failed'">
                                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                            <i class="fas fa-times-circle"></i>
                                            <span>Gagal Update</span>
                                        </span>
                                    </template>
                                    <template x-if="!c.rollout_status || c.rollout_status === 'pending'">
                                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                            <i class="fas fa-hourglass-start"></i>
                                            <span>Terdaftar</span>
                                        </span>
                                    </template>
                                </td>
                                <td class="py-3 px-4 max-w-sm">
                                    <template x-if="c.rollout_status === 'failed' && c.error_reason">
                                        <div class="p-2 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-700 text-[11px] leading-relaxed">
                                            <span class="font-bold flex items-center gap-1 mb-0.5"><i class="fas fa-exclamation-circle text-rose-500"></i> Galat:</span>
                                            <span x-text="c.error_reason"></span>
                                        </div>
                                    </template>
                                    <template x-if="c.rollout_status === 'updated'">
                                        <span class="text-emerald-700 text-[11px] flex items-center gap-1">
                                            <i class="fas fa-check-double text-emerald-500"></i> Berhasil diperbarui ke versi target
                                        </span>
                                    </template>
                                    <template x-if="c.rollout_status === 'received'">
                                        <span class="text-amber-700 text-[11px] flex items-center gap-1">
                                            <i class="fas fa-bell text-amber-500"></i> Notifikasi diterima oleh klien, menunggu aksi update
                                        </span>
                                    </template>
                                    <template x-if="!c.rollout_status || c.rollout_status === 'pending'">
                                        <span class="text-slate-400 text-[11px]">-</span>
                                    </template>
                                </td>
                                <td class="py-3 px-4 text-right sm:pr-6 text-slate-500 text-[11px] font-mono" x-text="c.last_reported_at || c.last_synced_at || c.created_at || '-'"></td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>
    </div> <!-- Close Tab 2: activeHubTab === 'clients' -->

    <!-- TAB 3: GIT UPSTREAM SYNC (CMSMU-GO) -->
    <div x-show="activeHubTab === 'git'" class="space-y-4">
            <!-- Status & Action Card -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm text-xl">
                            <i class="fab fa-github"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2.5">
                                <h3 class="text-base font-bold text-slate-900 m-0">Repositori Git Upstream (cmsMu-go)</h3>
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                                      :class="gitStatus?.isSynced ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
                                      x-text="gitStatus?.isSynced ? 'Tersinkronkan' : 'Perlu Push Rilis'"></span>
                            </div>
                            <p class="text-xs text-slate-500 m-0 mt-1">
                                Pusat rilis source code publik untuk seluruh downstream CMSMu yang menggunakan integrasi Git atau GitHub Actions.
                            </p>
                            <div class="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600">
                                <span class="flex items-center gap-1.5"><i class="fas fa-link text-slate-400"></i> <a href="https://github.com/cakipin/cmsMu-go" target="_blank" class="text-teal-600 hover:underline font-mono text-[11px]">cakipin/cmsMu-go</a></span>
                                <span class="text-slate-300">•</span>
                                <span class="flex items-center gap-1.5"><i class="fas fa-code-branch text-slate-400"></i> Remote: <code class="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-[11px]">public-release (main)</code></span>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex flex-wrap items-center gap-2.5 shrink-0">
                        <button type="button" @click="loadGitStatus(true)" :disabled="isLoadingGit"
                                class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 shadow-2xs">
                            <i class="fas fa-sync-alt text-slate-400" :class="{'fa-spin': isLoadingGit}"></i>
                            <span>Cek Git</span>
                        </button>
                        <button type="button" @click="openGitPushModal()"
                                class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs active:scale-95">
                            <i class="fab fa-github"></i>
                            <span>Push ke cmsMu-go</span>
                        </button>
                    </div>
                </div>

                <!-- Comparison Banner -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">
                    <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Versi Rilis Hub Terkini</span>
                        <div class="flex items-baseline gap-2 mt-1">
                            <span class="text-xl font-black text-slate-800" x-text="'v' + (gitStatus?.hubVersion || statusData.activeManifestVersion || '0.1.3')"></span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-700">Hub Aktif</span>
                        </div>
                    </div>
                    <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Versi Tag Git Terakhir</span>
                        <div class="flex items-baseline gap-2 mt-1">
                            <span class="text-xl font-black text-slate-800" x-text="gitStatus?.latestGitTag?.startsWith('v') ? gitStatus?.latestGitTag : 'v' + (gitStatus?.latestGitTag || '0.1.2')"></span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                  :class="gitStatus?.isSynced ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'"
                                  x-text="gitStatus?.isSynced ? 'Up to date' : 'Tertinggal'"></span>
                        </div>
                    </div>
                    <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Perintah Cepat CLI</span>
                        <div class="flex items-center justify-between gap-2 mt-1">
                            <code class="text-xs font-mono text-slate-800 truncate" x-text="gitStatus?.quickCommand || 'npm run release:git'">npm run release:git</code>
                            <button type="button" @click="copyGitCliCommand()" class="text-teal-600 hover:text-teal-700 text-xs font-bold cursor-pointer border-0 bg-transparent flex items-center gap-1 shrink-0">
                                <i class="fas fa-copy"></i>
                                <span x-text="isGitCopied ? 'Tersalin!' : 'Salin'">Salin</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Git Update Log Table -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div class="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 class="text-sm font-bold text-slate-800 m-0">Log Riwayat Pembaruan & Tag Git Upstream</h3>
                        <p class="text-xs text-slate-500 m-0 mt-0.5">Daftar rilis dan catatan commit yang disinkronkan ke repositori publik cakipin/cmsMu-go</p>
                    </div>
                    <span class="px-2.5 py-1 text-xs font-mono text-slate-600 bg-slate-100 rounded-lg" x-text="(gitStatus?.logs?.length || 0) + ' Log Rilis'"></span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs text-slate-600">
                        <thead class="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th class="py-3 px-4 sm:px-6">Tag / Versi</th>
                                <th class="py-3 px-4">Catatan Perubahan (Changelog)</th>
                                <th class="py-3 px-4">Tanggal Rilis</th>
                                <th class="py-3 px-4 text-center">Status Git</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <template x-if="!gitStatus?.logs || gitStatus.logs.length === 0">
                                <tr>
                                    <td colspan="4" class="py-8 text-center text-slate-400">
                                        <i class="fab fa-github text-3xl mb-2 text-slate-300 block"></i>
                                        <p class="m-0 text-xs font-medium text-slate-500">Belum ada riwayat rilis git tercatat</p>
                                    </td>
                                </tr>
                            </template>
                            <template x-for="(log, idx) in (gitStatus?.logs || [])" :key="(log.id || log.version) + '-' + (log.date || '') + '-' + idx">
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="py-3.5 px-4 sm:px-6 font-bold text-slate-800 whitespace-nowrap">
                                        <div class="flex items-center gap-1.5">
                                            <span class="px-2 py-1 rounded-md bg-slate-900 text-white font-mono text-xs font-bold" x-text="log.tag"></span>
                                            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold border" :class="getReleaseTypeBadge(log.version)" x-text="getReleaseType(log.version)"></span>
                                        </div>
                                    </td>
                                    <td class="py-3.5 px-4 max-w-md text-slate-600" x-text="log.changelog || '-'"></td>
                                    <td class="py-3.5 px-4 text-slate-500 whitespace-nowrap" x-text="log.date || '-'"></td>
                                    <td class="py-3.5 px-4 text-center whitespace-nowrap">
                                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center justify-center gap-1 w-fit mx-auto"
                                              :class="log.status === 'pushed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                                            <i :class="log.status === 'pushed' ? 'fas fa-check-circle' : 'fas fa-clock'"></i>
                                            <span x-text="log.status === 'pushed' ? 'Tersinkron' : 'Pending Push'"></span>
                                        </span>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
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
                    <div class="flex items-center justify-between mb-1.5">
                        <label class="font-semibold text-slate-700">Nomor Versi Rilis</label>
                        <span class="text-[11px] text-slate-400">Versi Terkini: <strong class="text-teal-600 font-mono font-bold" x-text="'v' + activeVersion"></strong></span>
                    </div>
                    <!-- SemVer Helper Shortcuts -->
                    <div class="flex flex-wrap items-center gap-1.5 mb-2">
                        <span class="text-[10px] text-slate-400 font-medium">Bantu SemVer:</span>
                        <button type="button" @click="suggestVersion('patch')" class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer transition-all">
                            + Patch (Bugfix)
                        </button>
                        <button type="button" @click="suggestVersion('minor')" class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 cursor-pointer transition-all">
                            + Minor (Fitur)
                        </button>
                        <button type="button" @click="suggestVersion('major')" class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-all">
                            + Major (Break)
                        </button>
                    </div>
                    <input type="text" x-model="pushForm.version" placeholder="contoh: 0.1.3"
                           class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-teal-500 bg-slate-50/30 font-mono">
                    
                    <!-- Version Conflict Warning -->
                    <template x-if="isVersionConflict()">
                        <div class="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-amber-800 text-[11px] leading-relaxed">
                            <i class="fas fa-exclamation-triangle mt-0.5 text-amber-500 shrink-0"></i>
                            <div>
                                <strong class="font-bold">Perhatian:</strong> Versi <span class="font-mono font-bold" x-text="pushForm.version"></span> sama atau lebih rendah dari versi aktif (<span class="font-mono font-bold" x-text="activeVersion"></span>). Instansi pengguna (downstream) <strong>tidak akan mendeteksi notifikasi pembaruan</strong> kecuali nomor patch dinaikkan (klik tombol <em>+ Patch</em> di atas).
                            </div>
                        </div>
                    </template>
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

    <!-- MODAL CLEAR RELEASES (In-System Confirmation) -->
    <div x-show="showClearReleasesModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" x-cloak>
        <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            <div class="p-6 border-b border-slate-100">
                <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                    <i class="fas fa-trash-alt text-xl"></i>
                </div>
                <h3 class="text-base font-bold text-slate-800 m-0">Bersihkan Log Riwayat Rilis?</h3>
                <p class="text-xs text-slate-500 m-0 mt-1.5 leading-relaxed">
                    Tindakan ini akan menghapus log riwayat rilis arsip lama dari database Cloudflare D1. Rilis aktif terkini tetap dipertahankan.
                </p>
            </div>
            <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                <button type="button" @click="showClearReleasesModal = false" class="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer">
                    Batal
                </button>
                <button type="button" @click="executeClearReleases()" :disabled="isClearingReleases"
                        class="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center gap-2 cursor-pointer border-0">
                    <i class="fas" :class="isClearingReleases ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                    <span x-text="isClearingReleases ? 'Membersihkan...' : 'Ya, Bersihkan Log'">Ya, Bersihkan Log</span>
                </button>
            </div>
        </div>
    </div>

    <!-- MODAL CLEAR CLIENTS (In-System Confirmation) -->
    <div x-show="showClearClientsModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" x-cloak>
        <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            <div class="p-6 border-b border-slate-100">
                <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                    <i class="fas fa-eraser text-xl"></i>
                </div>
                <h3 class="text-base font-bold text-slate-800 m-0">Kosongkan Data Pemantauan Klien?</h3>
                <p class="text-xs text-slate-500 m-0 mt-1.5 leading-relaxed">
                    Apakah Anda yakin ingin mengosongkan seluruh data instansi klien di Hub? Tabel akan kembali menjadi 0 Instansi dan hanya akan terisi secara dinamis saat klien downstream menghubungi Hub.
                </p>
            </div>
            <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                <button type="button" @click="showClearClientsModal = false" class="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer">
                    Batal
                </button>
                <button type="button" @click="executeClearClients()" :disabled="isClearingClients"
                        class="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center gap-2 cursor-pointer border-0">
                    <i class="fas" :class="isClearingClients ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                    <span x-text="isClearingClients ? 'Mengosongkan...' : 'Ya, Kosongkan Data'">Ya, Kosongkan Data</span>
                </button>
            </div>
        </div>
    </div>

    <!-- MODAL GIT PUSH SYNC (In-System Modal) -->
    <div x-show="showGitPushModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" x-cloak>
        <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            <div class="p-6 border-b border-slate-100">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                        <i class="fab fa-github text-lg"></i>
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-slate-900 m-0">Sinkronisasi Rilis ke Git Upstream</h3>
                        <p class="text-xs text-slate-500 m-0">Push update source code dan git tag ke cakipin/cmsMu-go</p>
                    </div>
                </div>

                <div class="space-y-3 mt-4 text-xs text-slate-600">
                    <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-slate-500">Versi Target:</span>
                            <span class="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200" x-text="'v' + activeVersion"></span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-slate-500">Remote Upstream:</span>
                            <span class="font-mono text-slate-700 font-semibold">public-release (main)</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-slate-500">Repository GitHub:</span>
                            <span class="font-mono text-teal-600 font-semibold">cakipin/cmsMu-go</span>
                        </div>
                    </div>

                    <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                        <p class="m-0 font-bold flex items-center gap-1.5"><i class="fas fa-info-circle"></i> Otomatisasi Git Push:</p>
                        <p class="m-0 mt-1">Anda dapat menjalankan perintah otomatis di terminal CLI atau menandai rilis ini sebagai sudah disinkronkan.</p>
                        <div class="mt-2.5 p-2 bg-slate-900 rounded-lg flex items-center justify-between gap-2 text-white font-mono text-[11px]">
                            <code class="text-emerald-400 truncate">npm run release:git</code>
                            <button type="button" @click="copyGitCliCommand()" class="text-xs text-slate-300 hover:text-white font-sans font-bold cursor-pointer border-0 bg-transparent flex items-center gap-1 shrink-0">
                                <i class="fas fa-copy"></i>
                                <span x-text="isGitCopied ? 'Tersalin!' : 'Salin'">Salin</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                <button type="button" @click="showGitPushModal = false" class="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer">
                    Tutup
                </button>
                <button type="button" @click="executeConfirmGitPush()" :disabled="isPushingGit"
                        class="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs flex items-center gap-2 cursor-pointer border-0">
                    <i class="fas" :class="isPushingGit ? 'fa-spinner fa-spin' : 'fa-check-double'"></i>
                    <span x-text="isPushingGit ? 'Menyinkronkan...' : 'Konfirmasi Tersinkronkan'">Konfirmasi Tersinkronkan</span>
                </button>
            </div>
        </div>
    </div>

    <!-- MODAL LAPORAN PEMBARUAN SISTEM (AUDIT REPORT) -->
    ${otaReportModal}
</div>
`;
