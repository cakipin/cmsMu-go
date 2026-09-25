/**
 * 🚀 OTA (Over-The-Air) Service Addon
 * Mengelola distribusi manifest versi, rilis baru, dan semver checking untuk Core CMSMu.
 */

export const CORE_VERSION = '0.1.2';
export const CORE_BUILD_DATE = '2026-09-25';
export const MIN_COMPATIBLE_SCHEMA_VERSION = '0.1.0';

export interface OtaManifest {
    name: string;
    version: string;
    buildDate: string;
    changelog?: string;
    minCompatibleSchema: string;
    channel: 'stable' | 'beta';
    capabilities: string[];
    bundledPlugins: string[];
    updateUrl: string;
    bundleUrl: string;
    repository?: string;
    downloadUrl?: string;
}

export const DEFAULT_UPSTREAM_URL = 'https://cms.labmu.dev';
export const DEFAULT_GITHUB_MANIFEST_URL = 'https://raw.githubusercontent.com/cakipin/cmsMu-go/main/ota-manifest.json';
export const DEFAULT_GITHUB_REPO_URL = 'https://github.com/cakipin/cmsMu-go';

export function isHubMode(host: string = ''): boolean {
    const cleanHost = host.toLowerCase();
    // Default: jika domain mengandung cms.labmu.dev maka bertindak sebagai Upstream Hub
    return cleanHost.includes('cms.labmu.dev');
}

export const otaAddonService = {
    getManifest(baseUrl: string = ''): OtaManifest {
        const cleanBase = baseUrl.replace(/\/+$/, '');
        return {
            name: 'CMSMu Core Framework',
            version: CORE_VERSION,
            buildDate: CORE_BUILD_DATE,
            changelog: 'Rilis stabil CMSMu Core Framework v0.1.1 (OTA Engine Addon).',
            minCompatibleSchema: MIN_COMPATIBLE_SCHEMA_VERSION,
            channel: 'stable',
            capabilities: [
                'headless-api',
                'puck-visual-editor',
                'auto-db-migration',
                'sso-muhammadiyah-auth',
                'ota-client-runtime'
            ],
            bundledPlugins: [
                'sso-muhammadiyah',
                'ota'
            ],
            updateUrl: `${cleanBase}/api/addons/ota/manifest`,
            bundleUrl: `${cleanBase}/api/addons/ota/bundle/admin.js`
        };
    },

    async getDynamicManifest(db: any, baseUrl: string = ''): Promise<OtaManifest> {
        const cleanBase = baseUrl.replace(/\/+$/, '');
        let version = CORE_VERSION;
        let buildDate = CORE_BUILD_DATE;
        let changelog = 'Rilis stabil CMSMu Core Framework v0.1.1 (OTA Engine Addon).';
        let channel: 'stable' | 'beta' = 'stable';

        if (db) {
            try {
                const latestRelease: any = await db.prepare(
                    "SELECT version, build_date, changelog, channel FROM ota_releases WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1"
                ).first();
                if (latestRelease && latestRelease.version) {
                    version = latestRelease.version;
                    buildDate = latestRelease.build_date || CORE_BUILD_DATE;
                    changelog = latestRelease.changelog || changelog;
                    channel = latestRelease.channel || channel;
                }
            } catch(e) {}
        }

        return {
            name: 'CMSMu Core Framework',
            version,
            buildDate,
            changelog,
            minCompatibleSchema: MIN_COMPATIBLE_SCHEMA_VERSION,
            channel,
            capabilities: [
                'headless-api',
                'puck-visual-editor',
                'auto-db-migration',
                'sso-muhammadiyah-auth',
                'ota-client-runtime'
            ],
            bundledPlugins: [
                'sso-muhammadiyah',
                'ota'
            ],
            updateUrl: `${cleanBase}/api/addons/ota/manifest`,
            bundleUrl: `${cleanBase}/api/addons/ota/bundle/admin.js`
        };
    },

    compareVersions(v1: string, v2: string): number {
        const parse = (v: string) => v.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
        const [maj1, min1, pat1] = parse(v1);
        const [maj2, min2, pat2] = parse(v2);

        if (maj1 !== maj2) return maj1 - maj2;
        if (min1 !== min2) return min1 - min2;
        return pat1 - pat2;
    },

    async checkUpstreamUpdate(clientVersion: string, upstreamUrl: string = DEFAULT_UPSTREAM_URL): Promise<{
        hasUpdate: boolean;
        upstreamVersion: string;
        changelog: string;
        channel: 'stable' | 'beta';
        manifest?: OtaManifest;
        source?: 'github' | 'hub';
        error?: string;
    }> {
        // 1. Coba ambil rilis dari GitHub cmsMu-go terlebih dahulu (Single Source of Truth Rilis)
        try {
            const ghRes = await fetch(`${DEFAULT_GITHUB_MANIFEST_URL}?t=${Date.now()}`, {
                headers: { 'Accept': 'application/json' }
            });
            if (ghRes.ok) {
                const ghManifest: any = await ghRes.json();
                if (ghManifest && ghManifest.version) {
                    const upstreamVersion = ghManifest.version;
                    const changelog = ghManifest.changelog || 'Pembaruan sistem CMSMu.';
                    const channel = ghManifest.channel || 'stable';
                    const hasUpdate = this.compareVersions(upstreamVersion, clientVersion) > 0;
                    return {
                        hasUpdate,
                        upstreamVersion,
                        changelog,
                        channel,
                        source: 'github',
                        manifest: {
                            name: ghManifest.name || 'CMSMu Core Framework',
                            version: upstreamVersion,
                            buildDate: ghManifest.buildDate || '',
                            changelog,
                            minCompatibleSchema: ghManifest.minCompatibleSchema || MIN_COMPATIBLE_SCHEMA_VERSION,
                            channel,
                            capabilities: ghManifest.capabilities || [],
                            bundledPlugins: ghManifest.bundledPlugins || [],
                            updateUrl: DEFAULT_GITHUB_MANIFEST_URL,
                            bundleUrl: ghManifest.downloadUrl || `${DEFAULT_GITHUB_REPO_URL}/archive/refs/tags/v${upstreamVersion}.zip`,
                            repository: DEFAULT_GITHUB_REPO_URL,
                            downloadUrl: ghManifest.downloadUrl || `${DEFAULT_GITHUB_REPO_URL}/archive/refs/tags/v${upstreamVersion}.zip`
                        }
                    };
                }
            }
        } catch (_) {}

        // 2. Fallback: Ambil dari Upstream Hub (cms.labmu.dev)
        try {
            const cleanUpstream = upstreamUrl.replace(/\/+$/, '');
            const targetUrl = `${cleanUpstream}/api/addons/ota/manifest?t=${Date.now()}`;
            const res = await fetch(targetUrl, {
                headers: { 'Accept': 'application/json' }
            });

            if (!res.ok) {
                return {
                    hasUpdate: false,
                    upstreamVersion: clientVersion,
                    changelog: '',
                    channel: 'stable',
                    source: 'hub',
                    error: `Gagal mengambil manifest dari upstream (${res.status})`
                };
            }

            const json: any = await res.json();
            const manifest: OtaManifest = json.data;
            const upstreamVersion = manifest?.version || clientVersion;
            const changelog = manifest?.changelog || 'Pembaruan sistem CMSMu.';
            const channel = manifest?.channel || 'stable';
            const hasUpdate = this.compareVersions(upstreamVersion, clientVersion) > 0;

            return {
                hasUpdate,
                upstreamVersion,
                changelog,
                channel,
                source: 'hub',
                manifest: {
                    ...manifest,
                    repository: manifest?.repository || DEFAULT_GITHUB_REPO_URL,
                    downloadUrl: manifest?.downloadUrl || `${DEFAULT_GITHUB_REPO_URL}/archive/refs/tags/v${upstreamVersion}.zip`
                }
            };
        } catch (err: any) {
            return {
                hasUpdate: false,
                upstreamVersion: clientVersion,
                changelog: '',
                channel: 'stable',
                source: 'hub',
                error: err.message || 'Koneksi ke upstream OTA gagal'
            };
        }
    },

    async injectLocalNotification(db: any, version: string, changelog: string): Promise<boolean> {
        if (!db) return false;
        try {
            await db.prepare(`
                CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    type TEXT DEFAULT 'info',
                    link TEXT,
                    read INTEGER DEFAULT 0,
                    is_read INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `).run();

            // Cek apakah notifikasi untuk versi ini sudah pernah dimasukkan (mencegah spam/duplikasi)
            const notifTitle = `Pembaruan CMSMu v${version} Tersedia! 🚀`;
            const existing = await db.prepare(
                "SELECT id FROM notifications WHERE title = ? AND (read = 0 OR is_read = 0) LIMIT 1"
            ).bind(notifTitle).first();

            if (existing) {
                return false; // Sudah ada notifikasi aktif
            }

            const notifMsg = `Versi baru v${version} telah dirilis: ${changelog || 'Peningkatan stabilitas dan fitur baru CMSMu.'}`;
            await db.prepare(`
                INSERT INTO notifications (title, message, type, link, read, is_read)
                VALUES (?, ?, 'warning', '/admin/settings', 0, 0)
            `).bind(notifTitle, notifMsg).run();

            return true;
        } catch (err) {
            console.error('[OTA] Gagal menyuntikkan notifikasi lokal:', err);
            return false;
        }
    },

    async getAllReleases(db: any): Promise<any[]> {
        if (!db) return [];
        try {
            await db.prepare(`
                CREATE TABLE IF NOT EXISTS ota_releases (
                    id TEXT PRIMARY KEY,
                    version TEXT NOT NULL,
                    build_date TEXT NOT NULL,
                    changelog TEXT,
                    channel TEXT DEFAULT 'stable',
                    is_active INTEGER DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `).run();

            const res = await db.prepare(
                "SELECT * FROM ota_releases ORDER BY created_at DESC LIMIT 20"
            ).all();
            return res.results || [];
        } catch(e) {
            return [];
        }
    }
};
