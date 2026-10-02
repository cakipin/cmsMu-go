/**
 * 📦 OTA Manager Client-side Alpine Logic
 * Dipisahkan sesuai SOP Rule 20 (Clean Architecture & Batas < 1000 Baris)
 */

export const otaManagerScript = `
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
            activeHubTab: 'releases',
            releasePage: 1,
            releasePerPage: 10,
            releaseSearch: '',
            showClearReleasesModal: false,
            showClearClientsModal: false,
            showGitPushModal: false,
            showReportModal: false,
            updateReport: null,
            activeComponentTab: 'all',
            defaultUpdatedComponents: [
                {
                    name: 'Perbaikan Editor & Media Selector Modal',
                    path: 'src/cms/modules/admin/ui/blocks/editor/',
                    type: 'core',
                    description: 'Modal Media Manager terpusat di tengah layar (x-teleport body, z-index 999999), integrasi selector gambar artikel, dan toolbar WP Classic.'
                },
                {
                    name: 'Engine Distribusi OTA & Custom Sidebar',
                    path: 'src/cms/addons/ota/',
                    type: 'plugin',
                    description: 'Laporan pembaruan transparan dengan daftar path file yang diperbarui dan status migrasi database.'
                },
                {
                    name: 'Komponen Visual & Theme Builder Puck',
                    path: 'src/cms/modules/theme-builder/',
                    type: 'theme',
                    description: 'Template blok visual responsif, field gambar banner, dan integrasi Puck Editor.'
                },
                {
                    name: 'Router Halaman Redaksi Unified',
                    path: 'src/cms/modules/admin/ui/blocks/editor.page.ts',
                    type: 'core',
                    description: 'Pengalihan aman rute /admin/add dan /admin/edit ke komponen modular terisolasi.'
                },
                {
                    name: 'Helper Atomic Commit & Path Logger',
                    path: 'scripts/commit-modular.mjs',
                    type: 'plugin',
                    description: 'Otomasi pemisahan commit Git per kategori (Theme, Plugin, Core) dan pencatatan audit manifest.'
                }
            ],
            filteredComponents() {
                const list = (this.updateReport && this.updateReport.components) || this.defaultUpdatedComponents || [];
                if (this.activeComponentTab === 'all') return list;
                return list.filter(c => {
                    const t = (c.type || '').toLowerCase();
                    if (this.activeComponentTab === 'theme') return t === 'theme' || t === 'ui';
                    if (this.activeComponentTab === 'plugin') return t === 'plugin' || t === 'addon';
                    if (this.activeComponentTab === 'core') return t === 'core' || t === 'editor' || t === 'db';
                    return true;
                });
            },
            openReportModal() {
                this.showReportModal = true;
            },
            isClearingReleases: false,
            isClearingClients: false,
            isPushingGit: false,
            isLoadingGit: false,
            isGitCopied: false,
            gitStatus: null,
            statusData: {
                currentCoreVersion: '0.1.3',
                activeManifestVersion: '0.1.3',
                databaseIntegrity: { appliedMigrations: 3, totalMigrations: 3, status: 'synced' }
            },
            releases: [],
            clients: [],
            clientSummary: { total: 0, updated: 0, received: 0, failed: 0 },
            clientFilter: 'all',
            isLoadingClients: false,
            pushForm: {
                version: '0.1.3',
                channel: 'stable',
                changelog: 'Rilis pembaruan patch CMSMu v0.1.3'
            },

            get activeVersion() {
                return (this.statusData?.activeManifestVersion || this.statusData?.currentCoreVersion || '0.1.2').replace(/^v/, '');
            },

            suggestVersion(type) {
                const parts = this.activeVersion.split(/[-+.]/).map(n => parseInt(n, 10) || 0);
                while (parts.length < 3) parts.push(0);
                if (type === 'patch') {
                    parts[2] = parts[2] + 1;
                } else if (type === 'minor') {
                    parts[1] = parts[1] + 1;
                    parts[2] = 0;
                } else if (type === 'major') {
                    parts[0] = parts[0] + 1;
                    parts[1] = 0;
                    parts[2] = 0;
                }
                const newVer = parts.slice(0, 3).join('.');
                this.pushForm.version = newVer;
                this.pushForm.changelog = 'Rilis ' + type + ' CMSMu v' + newVer;
            },

            isVersionConflict() {
                if (!this.pushForm.version) return false;
                const vNew = this.pushForm.version.trim().replace(/^v/, '');
                const vCur = this.activeVersion;
                const pNew = vNew.split(/[-+.]/).map(n => parseInt(n, 10) || 0);
                const pCur = vCur.split(/[-+.]/).map(n => parseInt(n, 10) || 0);
                const maxLen = Math.max(pNew.length, pCur.length, 3);
                for (let i = 0; i < maxLen; i++) {
                    const n1 = pNew[i] || 0;
                    const n2 = pCur[i] || 0;
                    if (n1 > n2) return false;
                    if (n1 < n2) return true;
                }
                return true;
            },

            getReleaseType(ver) {
                if (!ver) return 'Patch';
                const clean = ver.replace(/^v/, '');
                const parts = clean.split('.');
                if (parts[1] === '0' && parts[2] === '0' && parts[0] !== '0') return 'Major';
                if (parts[2] === '0') return 'Minor';
                return 'Patch';
            },

            getReleaseTypeBadge(ver) {
                const type = this.getReleaseType(ver);
                if (type === 'Major') return 'bg-amber-50 text-amber-700 border-amber-200';
                if (type === 'Minor') return 'bg-purple-50 text-purple-700 border-purple-200';
                return 'bg-blue-50 text-blue-700 border-blue-200';
            },

            filteredReleases() {
                let list = this.releases;
                if (this.releaseSearch && this.releaseSearch.trim()) {
                    const q = this.releaseSearch.toLowerCase().trim();
                    list = list.filter(function(r) {
                        return (r.version && r.version.toLowerCase().includes(q)) ||
                               (r.changelog && r.changelog.toLowerCase().includes(q)) ||
                               (r.channel && r.channel.toLowerCase().includes(q));
                    });
                }
                return list;
            },

            get totalReleasePages() {
                return Math.max(1, Math.ceil(this.filteredReleases().length / this.releasePerPage));
            },

            paginatedReleases() {
                const list = this.filteredReleases();
                const start = (this.releasePage - 1) * this.releasePerPage;
                return list.slice(start, start + this.releasePerPage);
            },

            openClearReleasesModal() {
                this.showClearReleasesModal = true;
            },

            openClearClientsModal() {
                this.showClearClientsModal = true;
            },

            filteredClients() {
                if (this.clientFilter === 'all') return this.clients;
                if (this.clientFilter === 'updated') return this.clients.filter(function(c) { return c.rollout_status === 'updated'; });
                if (this.clientFilter === 'received') return this.clients.filter(function(c) { return c.rollout_status === 'received'; });
                if (this.clientFilter === 'failed') return this.clients.filter(function(c) { return c.rollout_status === 'failed'; });
                return this.clients;
            },

            async init() {
                await this.detectMode();
                await this.loadConfig();
                await this.loadStatus(false);
                if (this.isHub) {
                    await this.loadReleases();
                    await this.loadClients();
                    await this.loadGitStatus(false);
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
                    const token = (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '');
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
                    const token = (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '');
                    const curVer = this.statusData.currentCoreVersion || '0.1.0';
                    const res = await fetch('/api/addons/ota/check-update?client_version=' + encodeURIComponent(curVer) + '&t=' + Date.now(), {
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    if (res.ok) {
                        const json = await res.json();
                        this.updateInfo = json.data;
                        this.hasUpdate = !!json.data?.hasCoreUpdate;

                        // Kirim heartbeat / pendaftaran klien ke Hub secara non-blocking
                        if (!this.isHub) {
                            fetch('https://cms.labmu.dev/api/addons/ota/clients/heartbeat', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    client_url: window.location.origin,
                                    site_name: document.title ? document.title.split('-')[0].trim() : window.location.hostname,
                                    installed_version: curVer,
                                    target_version: json.data?.latestVersion || curVer,
                                    rollout_status: this.hasUpdate ? 'received' : 'updated',
                                    error_reason: this.hasUpdate ? 'Notifikasi diterima oleh klien, menunggu aksi update' : null
                                })
                            }).catch(function() {});
                        }
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
                    const token = (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '');
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

            async loadClients(showToast = false) {
                this.isLoadingClients = true;
                try {
                    const token = (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '');
                    const res = await fetch('/api/addons/ota/clients', {
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    if (res.ok) {
                        const json = await res.json();
                        this.clients = json.data || [];
                        this.clientSummary = json.summary || {
                            total: this.clients.length,
                            updated: this.clients.filter(function(c) { return c.rollout_status === 'updated'; }).length,
                            received: this.clients.filter(function(c) { return c.rollout_status === 'received'; }).length,
                            failed: this.clients.filter(function(c) { return c.rollout_status === 'failed'; }).length
                        };
                        if (showToast && window.showToast) {
                            window.showToast('Data pemantauan status pengguna berhasil disegarkan!', 'success');
                        }
                    }
                } catch(e) {
                    console.error('Gagal load clients:', e);
                } finally {
                    this.isLoadingClients = false;
                }
            },

            openPushModal() {
                this.suggestVersion('patch');
                this.pushForm.channel = 'stable';
                this.showPushModal = true;
            },

            openApplyModal() {
                this.showApplyModal = true;
            },

            async executeApplyUpdate() {
                this.isApplying = true;
                try {
                    const token = (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '');
                    const res = await fetch('/api/addons/ota/apply-update', {
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    if (res.ok) {
                        const json = await res.json();
                        this.showApplyModal = false;
                        this.hasUpdate = false;
                        this.updateReport = {
                            version: (json.data && json.data.coreVersion) || this.statusData?.activeManifestVersion || '0.1.3',
                            schemaVersion: (json.data && json.data.schemaVersion) || '0.1.0',
                            appliedCount: json.data?.appliedCount ?? 0,
                            history: json.data?.history || [],
                            components: json.data?.updatedComponents || this.defaultUpdatedComponents
                        };
                        this.showReportModal = true;
                        if (window.showToast) {
                            window.showToast(json.message || 'Pembaruan sistem berhasil diterapkan!', 'success');
                        }

                        // Laporkan keberhasilan update ke Hub
                        fetch('https://cms.labmu.dev/api/addons/ota/clients/report-status', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                client_url: window.location.origin,
                                site_name: document.title ? document.title.split('-')[0].trim() : window.location.hostname,
                                installed_version: (json.data && json.data.coreVersion) || this.statusData?.activeManifestVersion || this.statusData?.currentCoreVersion || '0.1.3',
                                target_version: (json.data && json.data.coreVersion) || this.statusData?.activeManifestVersion || this.statusData?.currentCoreVersion || '0.1.3',
                                rollout_status: 'updated',
                                error_reason: null
                            })
                        }).catch(function() {});

                        await this.loadStatus(false);
                        await this.checkUpdates(false);
                    } else {
                        const err = await res.json().catch(function() { return {}; });
                        if (window.showToast) {
                            window.showToast(err.error || 'Gagal menerapkan pembaruan.', 'error');
                        }
                        // Laporkan kegagalan update ke Hub
                        fetch('https://cms.labmu.dev/api/addons/ota/clients/report-status', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                client_url: window.location.origin,
                                site_name: document.title ? document.title.split('-')[0].trim() : window.location.hostname,
                                installed_version: this.statusData.currentCoreVersion || '0.1.1',
                                target_version: this.statusData.activeManifestVersion || '0.1.2',
                                rollout_status: 'failed',
                                error_reason: err.error || 'Gagal menerapkan pembaruan server'
                            })
                        }).catch(function() {});
                    }
                } catch (e) {
                    if (window.showToast) window.showToast('Error: ' + e.message, 'error');
                    fetch('https://cms.labmu.dev/api/addons/ota/clients/report-status', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            client_url: window.location.origin,
                            site_name: document.title ? document.title.split('-')[0].trim() : window.location.hostname,
                            installed_version: this.statusData.currentCoreVersion || '0.1.1',
                            target_version: this.statusData.activeManifestVersion || '0.1.2',
                            rollout_status: 'failed',
                            error_reason: e.message || 'Eksekusi pembaruan klien terputus'
                        })
                    }).catch(function() {});
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
                    const token = (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '');
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
                        await this.loadClients();
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

            async executeClearReleases() {
                this.isClearingReleases = true;
                try {
                    const token = (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '');
                    const res = await fetch('/api/addons/ota/releases/clear', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ all: false })
                    });
                    if (res.ok) {
                        const json = await res.json();
                        this.showClearReleasesModal = false;
                        if (window.showToast) {
                            window.showToast(json.message || 'Log rilis arsip berhasil dibersihkan!', 'success');
                        }
                        this.releasePage = 1;
                        await this.loadReleases();
                    } else {
                        const err = await res.json().catch(function() { return {}; });
                        if (window.showToast) {
                            window.showToast(err.error || 'Gagal membersihkan log rilis.', 'error');
                        }
                    }
                } catch (e) {
                    if (window.showToast) window.showToast('Error: ' + e.message, 'error');
                } finally {
                    this.isClearingReleases = false;
                }
            },

            async executeClearClients() {
                this.isClearingClients = true;
                try {
                    const token = (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '');
                    const res = await fetch('/api/addons/ota/clients/clear', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    });
                    if (res.ok) {
                        const json = await res.json();
                        this.showClearClientsModal = false;
                        if (window.showToast) {
                            window.showToast(json.message || 'Data instansi klien berhasil dikosongkan!', 'success');
                        }
                        await this.loadClients();
                    } else {
                        const err = await res.json().catch(function() { return {}; });
                        if (window.showToast) {
                            window.showToast(err.error || 'Gagal mengosongkan data klien.', 'error');
                        }
                    }
                } catch (e) {
                    if (window.showToast) window.showToast('Error: ' + e.message, 'error');
                } finally {
                    this.isClearingClients = false;
                }
            },

            async loadGitStatus(showToast = false) {
                this.isLoadingGit = true;
                try {
                    const res = await fetch('/api/addons/ota/git-status');
                    if (res.ok) {
                        const json = await res.json();
                        this.gitStatus = json.data;
                        if (showToast && window.showToast) {
                            window.showToast(this.gitStatus?.isSynced ? 'Repositori Git upstream sudah tersinkronkan!' : 'Rilis baru perlu di-push ke git cmsMu-go', this.gitStatus?.isSynced ? 'success' : 'warning');
                        }
                    }
                } catch (e) {
                    console.error('Gagal load git status:', e);
                } finally {
                    this.isLoadingGit = false;
                }
            },

            copyGitCliCommand() {
                const cmd = this.gitStatus?.quickCommand || 'npm run release:git';
                if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(cmd).then(() => {
                        this.isGitCopied = true;
                        if (window.showToast) window.showToast('Perintah git berhasil disalin!', 'success');
                        setTimeout(() => { this.isGitCopied = false; }, 2500);
                    }).catch(() => {
                        if (window.showToast) window.showToast('Perintah: ' + cmd, 'info');
                    });
                } else {
                    if (window.showToast) window.showToast('Perintah: ' + cmd, 'info');
                }
            },

            openGitPushModal() {
                this.showGitPushModal = true;
            },

            async executeConfirmGitPush() {
                this.isPushingGit = true;
                try {
                    const token = (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '');
                    const res = await fetch('/api/addons/ota/git-push', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ version: this.activeVersion })
                    });
                    if (res.ok) {
                        const json = await res.json();
                        this.showGitPushModal = false;
                        if (window.showToast) {
                            window.showToast(json.message || 'Status Git berhasil disinkronkan!', 'success');
                        }
                        await this.loadGitStatus(false);
                    } else {
                        const err = await res.json().catch(function() { return {}; });
                        if (window.showToast) {
                            window.showToast(err.error || 'Gagal menyinkronkan status git.', 'error');
                        }
                    }
                } catch(e) {
                    if (window.showToast) window.showToast('Error: ' + e.message, 'error');
                } finally {
                    this.isPushingGit = false;
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
                    const token = (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '');
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
                    const token = (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '');
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
`;
