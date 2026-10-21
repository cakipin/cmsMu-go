/**
 * 🚀 OTA (Over-The-Air) Service Addon
 * Mengelola distribusi manifest versi, rilis baru, dan semver checking untuk Core CMSMu.
 */

export const CORE_VERSION = "0.1.8";
export const CORE_BUILD_DATE = "2026-10-21";
export const MIN_COMPATIBLE_SCHEMA_VERSION = "0.1.0";

export interface OtaUpdatedComponent {
  name: string;
  path: string;
  type: "core" | "editor" | "addon" | "theme" | "db";
  description: string;
  status?: "synced" | "pending" | "success";
}

export const DEFAULT_UPDATED_COMPONENTS: OtaUpdatedComponent[] = [
  {
    name: "Standardisasi Rute Upload Media (/uploads/)",
    path: "src/cms/modules/media/media.router.ts",
    type: "core",
    description:
      "Standardisasi folder simpan R2 mutlak ke uploads/YYYY/MM/, URL publik langsung /uploads/..., dan pembersihan rute usang /api/media/file/.",
  },
  {
    name: "Perbaikan Editor & Media Selector Modal",
    path: "src/cms/modules/admin/ui/blocks/editor/",
    type: "editor",
    description:
      "Modal Media Manager terpusat di tengah layar (x-teleport body, z-index 999999), integrasi selector gambar artikel, dan toolbar WP Classic.",
  },
  {
    name: "Komponen Custom Editor WYSIWYG",
    path: "src/cms/modules/admin/ui/blocks/custom-editor.ts",
    type: "editor",
    description:
      "Dukungan dual-mode Visual & Text/HTML, auto-format heading/quote, dan tombol Add Media responsif.",
  },
  {
    name: "Formulir Penulisan & Metadata SEO",
    path: "src/cms/modules/admin/ui/blocks/editor/editor-form.ts",
    type: "editor",
    description:
      "Auto-generate excerpt dan meta description dari isi tulisan, serta pemilih Featured Image interaktif.",
  },
  {
    name: "Router Halaman Redaksi Unified",
    path: "src/cms/modules/admin/ui/blocks/editor.page.ts",
    type: "core",
    description:
      "Pengalihan aman rute /admin/add dan /admin/edit ke komponen modular terisolasi.",
  },
  {
    name: "Engine Distribusi OTA & Audit Laporan",
    path: "src/cms/addons/ota/",
    type: "addon",
    description:
      "Laporan pembaruan transparan dengan daftar path file yang diperbarui dan status migrasi database.",
  },
];

export interface OtaManifest {
  name: string;
  version: string;
  buildDate: string;
  changelog?: string;
  minCompatibleSchema: string;
  channel: "stable" | "beta";
  capabilities: string[];
  bundledPlugins: string[];
  updateUrl: string;
  bundleUrl: string;
  repository?: string;
  downloadUrl?: string;
  updatedComponents?: OtaUpdatedComponent[];
}

export const DEFAULT_UPSTREAM_URL = "https://cms.labmu.dev";
export const DEFAULT_GITHUB_MANIFEST_URL =
  "https://raw.githubusercontent.com/cakipin/cmsMu-go/main/ota-manifest.json";
export const DEFAULT_GITHUB_REPO_URL = "https://github.com/cakipin/cmsMu-go";

export function isHubMode(host: string = ""): boolean {
  const cleanHost = host.toLowerCase();
  // Default: jika domain mengandung cms.labmu.dev maka bertindak sebagai Upstream Hub
  return cleanHost.includes("cms.labmu.dev");
}

export const otaAddonService = {
  getManifest(baseUrl: string = ""): OtaManifest {
    const cleanBase = baseUrl.replace(/\/+$/, "");
    return {
      name: "CMSMu Core Framework",
      version: CORE_VERSION,
      buildDate: CORE_BUILD_DATE,
      changelog: `Rilis stabil CMSMu Core Framework v${CORE_VERSION} (OTA Engine Addon).`,
      minCompatibleSchema: MIN_COMPATIBLE_SCHEMA_VERSION,
      channel: "stable",
      capabilities: [
        "headless-api",
        "puck-visual-editor",
        "auto-db-migration",
        "sso-muhammadiyah-auth",
        "ota-client-runtime",
      ],
      bundledPlugins: ["sso-muhammadiyah", "ota"],
      updateUrl: `${cleanBase}/api/addons/ota/manifest`,
      bundleUrl: `${cleanBase}/api/addons/ota/bundle/admin.js`,
      updatedComponents: DEFAULT_UPDATED_COMPONENTS,
    };
  },

  async getDynamicManifest(
    db: any,
    baseUrl: string = ""
  ): Promise<OtaManifest> {
    const cleanBase = baseUrl.replace(/\/+$/, "");
    let version = CORE_VERSION;
    let buildDate = CORE_BUILD_DATE;
    let changelog = `Rilis stabil CMSMu Core Framework v${CORE_VERSION} (100% Core System Clean, In-System Modal/Toast SOP 16, Modernisasi UI Themes, & Zero 404 Permalink).`;
    let channel: "stable" | "beta" = "stable";

    if (db) {
      try {
        await db
          .prepare(
            `
            CREATE TABLE IF NOT EXISTS ota_releases (
                id TEXT PRIMARY KEY,
                version TEXT NOT NULL,
                build_date TEXT NOT NULL,
                changelog TEXT,
                channel TEXT DEFAULT 'stable',
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            `
          )
          .run()
          .catch(() => {});

        const latestRelease: any = await db
          .prepare(
            "SELECT version, build_date, changelog, channel FROM ota_releases WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1"
          )
          .first();

        if (latestRelease && latestRelease.version) {
          if (this.compareVersions(latestRelease.version, CORE_VERSION) >= 0) {
            version = latestRelease.version;
            buildDate = latestRelease.build_date || CORE_BUILD_DATE;
            changelog = latestRelease.changelog || changelog;
            channel = latestRelease.channel || channel;
          } else {
            // CORE_VERSION di kode lebih baru daripada record di D1: sinkronkan otomatis ke ota_releases
            await db
              .prepare("UPDATE ota_releases SET is_active = 0 WHERE channel = 'stable'")
              .run()
              .catch(() => {});
            await db
              .prepare(
                `INSERT OR REPLACE INTO ota_releases (id, version, build_date, changelog, channel, is_active) VALUES (?, ?, ?, ?, 'stable', 1)`
              )
              .bind(`rel-core-${CORE_VERSION}`, CORE_VERSION, CORE_BUILD_DATE, changelog)
              .run()
              .catch(() => {});
          }
        } else {
          await db
            .prepare(
              `INSERT OR REPLACE INTO ota_releases (id, version, build_date, changelog, channel, is_active) VALUES (?, ?, ?, ?, 'stable', 1)`
            )
            .bind(`rel-core-${CORE_VERSION}`, CORE_VERSION, CORE_BUILD_DATE, changelog)
            .run()
            .catch(() => {});
        }
      } catch (e) {}
    }

    return {
      name: "CMSMu Core Framework",
      version,
      buildDate,
      changelog,
      minCompatibleSchema: MIN_COMPATIBLE_SCHEMA_VERSION,
      channel,
      capabilities: [
        "headless-api",
        "puck-visual-editor",
        "auto-db-migration",
        "sso-muhammadiyah-auth",
        "ota-client-runtime",
      ],
      bundledPlugins: ["sso-muhammadiyah", "ota"],
      updateUrl: `${cleanBase}/api/addons/ota/manifest`,
      bundleUrl: `${cleanBase}/api/addons/ota/bundle/admin.js`,
      updatedComponents: DEFAULT_UPDATED_COMPONENTS,
    };
  },

  compareVersions(v1: string, v2: string): number {
    const clean = (v: string) => (v || "").trim().replace(/^v/, "");
    const [core1, pre1] = clean(v1).split("-", 2);
    const [core2, pre2] = clean(v2).split("-", 2);

    const p1 = core1.split(".").map(n => parseInt(n, 10) || 0);
    const p2 = core2.split(".").map(n => parseInt(n, 10) || 0);
    const maxLen = Math.max(p1.length, p2.length, 3);
    for (let i = 0; i < maxLen; i++) {
      const num1 = p1[i] || 0;
      const num2 = p2[i] || 0;
      if (num1 !== num2) return num1 - num2;
    }

    // Jika core sama (misal 0.1.3 vs 0.1.3-beta.1), versi tanpa pre-release lebih tinggi
    if (!pre1 && pre2) return 1;
    if (pre1 && !pre2) return -1;
    if (pre1 && pre2) return pre1.localeCompare(pre2);

    return 0;
  },

  async checkUpstreamUpdate(
    clientVersion: string,
    upstreamUrl: string = DEFAULT_UPSTREAM_URL
  ): Promise<{
    hasUpdate: boolean;
    upstreamVersion: string;
    changelog: string;
    channel: "stable" | "beta";
    manifest?: OtaManifest;
    source?: "github" | "hub";
    error?: string;
  }> {
    // 1. Coba ambil rilis dari GitHub cmsMu-go terlebih dahulu (Single Source of Truth Rilis)
    try {
      const ghRes = await fetch(
        `${DEFAULT_GITHUB_MANIFEST_URL}?t=${Date.now()}`,
        {
          headers: { Accept: "application/json" },
        }
      );
      if (ghRes.ok) {
        const ghManifest: any = await ghRes.json();
        if (ghManifest && ghManifest.version) {
          const upstreamVersion = ghManifest.version;
          const changelog = ghManifest.changelog || "Pembaruan sistem CMSMu.";
          const channel = ghManifest.channel || "stable";
          const hasUpdate =
            this.compareVersions(upstreamVersion, clientVersion) > 0;
          return {
            hasUpdate,
            upstreamVersion,
            changelog,
            channel,
            source: "github",
            manifest: {
              name: ghManifest.name || "CMSMu Core Framework",
              version: upstreamVersion,
              buildDate: ghManifest.buildDate || "",
              changelog,
              minCompatibleSchema:
                ghManifest.minCompatibleSchema || MIN_COMPATIBLE_SCHEMA_VERSION,
              channel,
              capabilities: ghManifest.capabilities || [],
              bundledPlugins: ghManifest.bundledPlugins || [],
              updateUrl: DEFAULT_GITHUB_MANIFEST_URL,
              bundleUrl:
                ghManifest.downloadUrl ||
                `${DEFAULT_GITHUB_REPO_URL}/archive/refs/tags/v${upstreamVersion}.zip`,
              repository: DEFAULT_GITHUB_REPO_URL,
              downloadUrl:
                ghManifest.downloadUrl ||
                `${DEFAULT_GITHUB_REPO_URL}/archive/refs/tags/v${upstreamVersion}.zip`,
            },
          };
        }
      }
    } catch (_) {}

    // 2. Fallback: Ambil dari Upstream Hub (cms.labmu.dev)
    try {
      const cleanUpstream = upstreamUrl.replace(/\/+$/, "");
      const targetUrl = `${cleanUpstream}/api/addons/ota/manifest?client_version=${encodeURIComponent(clientVersion)}&t=${Date.now()}`;
      const res = await fetch(targetUrl, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        return {
          hasUpdate: false,
          upstreamVersion: clientVersion,
          changelog: "",
          channel: "stable",
          source: "hub",
          error: `Gagal mengambil manifest dari upstream (${res.status})`,
        };
      }

      const json: any = await res.json();
      const manifest: OtaManifest = json.data;
      const upstreamVersion = manifest?.version || clientVersion;
      const changelog = manifest?.changelog || "Pembaruan sistem CMSMu.";
      const channel = manifest?.channel || "stable";
      const hasUpdate =
        this.compareVersions(upstreamVersion, clientVersion) > 0;

      return {
        hasUpdate,
        upstreamVersion,
        changelog,
        channel,
        source: "hub",
        manifest: {
          ...manifest,
          repository: manifest?.repository || DEFAULT_GITHUB_REPO_URL,
          downloadUrl:
            manifest?.downloadUrl ||
            `${DEFAULT_GITHUB_REPO_URL}/archive/refs/tags/v${upstreamVersion}.zip`,
        },
      };
    } catch (err: any) {
      return {
        hasUpdate: false,
        upstreamVersion: clientVersion,
        changelog: "",
        channel: "stable",
        source: "hub",
        error: err.message || "Koneksi ke upstream OTA gagal",
      };
    }
  },

  async injectLocalNotification(
    db: any,
    version: string,
    changelog: string
  ): Promise<boolean> {
    if (!db) return false;
    try {
      await db
        .prepare(
          `
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
            `
        )
        .run();

      // Cek apakah notifikasi untuk versi ini sudah pernah dimasukkan (mencegah spam/duplikasi)
      const notifTitle = `Pembaruan CMSMu v${version} Tersedia! 🚀`;
      const existing = await db
        .prepare(
          "SELECT id FROM notifications WHERE title = ? AND (read = 0 OR is_read = 0) LIMIT 1"
        )
        .bind(notifTitle)
        .first();

      if (existing) {
        return false; // Sudah ada notifikasi aktif
      }

      const notifMsg = `Versi baru v${version} telah dirilis: ${changelog || "Peningkatan stabilitas dan fitur baru CMSMu."}`;
      await db
        .prepare(
          `
                INSERT INTO notifications (title, message, type, link, read, is_read)
                VALUES (?, ?, 'warning', '/admin/settings', 0, 0)
            `
        )
        .bind(notifTitle, notifMsg)
        .run();

      return true;
    } catch (err) {
      console.error("[OTA] Gagal menyuntikkan notifikasi lokal:", err);
      return false;
    }
  },

  async getAllReleases(db: any): Promise<any[]> {
    if (!db) return [];
    try {
      await db
        .prepare(
          `
                CREATE TABLE IF NOT EXISTS ota_releases (
                    id TEXT PRIMARY KEY,
                    version TEXT NOT NULL,
                    build_date TEXT NOT NULL,
                    changelog TEXT,
                    channel TEXT DEFAULT 'stable',
                    is_active INTEGER DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `
        )
        .run();

      const res = await db
        .prepare("SELECT * FROM ota_releases ORDER BY created_at DESC LIMIT 20")
        .all();
      return res.results || [];
    } catch (e) {
      return [];
    }
  },

  async getActiveBundle(db: any): Promise<string | null> {
    if (!db) return null;
    try {
      await db
        .prepare(
          `
                CREATE TABLE IF NOT EXISTS ota_bundles (
                    version TEXT PRIMARY KEY,
                    script TEXT NOT NULL,
                    is_active INTEGER DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `
        )
        .run();

      const row: any = await db
        .prepare(
          "SELECT script FROM ota_bundles WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1"
        )
        .first();
      return row ? row.script : null;
    } catch (_) {
      return null;
    }
  },

  async saveBundleToD1(
    db: any,
    version: string,
    script: string
  ): Promise<boolean> {
    if (!db || !script) return false;
    try {
      await db
        .prepare(
          `
                CREATE TABLE IF NOT EXISTS ota_bundles (
                    version TEXT PRIMARY KEY,
                    script TEXT NOT NULL,
                    is_active INTEGER DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `
        )
        .run();

      await db
        .prepare("UPDATE ota_bundles SET is_active = 0")
        .run()
        .catch(() => {});
      await db
        .prepare(
          `
                INSERT INTO ota_bundles (version, script, is_active, created_at)
                VALUES (?, ?, 1, CURRENT_TIMESTAMP)
                ON CONFLICT(version) DO UPDATE SET script = excluded.script, is_active = 1, created_at = CURRENT_TIMESTAMP
            `
        )
        .bind(version, script)
        .run();

      return true;
    } catch (e) {
      console.error("[OTA] Gagal menyimpan bundle ke D1:", e);
      return false;
    }
  },

  async fetchMasterBundle(upstreamUrl?: string): Promise<{
    success: boolean;
    version?: string;
    script?: string;
    error?: string;
  }> {
    const hubUrl = upstreamUrl || DEFAULT_UPSTREAM_URL;
    try {
      const res = await fetch(`${hubUrl}/api/addons/ota/bundle/admin.js`, {
        headers: { Accept: "application/javascript, text/javascript" },
      });
      if (!res.ok) {
        return {
          success: false,
          error: `Hub bundle returned HTTP ${res.status}`,
        };
      }
      const script = await res.text();
      const verHeader = res.headers.get("X-CMS-Version") || CORE_VERSION;
      return { success: true, version: verHeader, script };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getDeployHook(db: any): Promise<{
    configured: boolean;
    hookUrl: string;
    masked: string;
  }> {
    if (!db) return { configured: false, hookUrl: "", masked: "" };
    try {
      const row: any = await db
        .prepare(
          "SELECT value FROM settings WHERE key = 'ota_deploy_hook_url' LIMIT 1"
        )
        .first();
      const hookUrl = row?.value ? row.value.trim() : "";
      const configured = isValidDeployHookUrl(hookUrl);
      const masked = configured
        ? hookUrl.substring(0, 20) +
          "..." +
          hookUrl.substring(hookUrl.length - 8)
        : "";
      return { configured, hookUrl, masked };
    } catch (_) {
      return { configured: false, hookUrl: "", masked: "" };
    }
  },

  async triggerDeployHook(
    hookUrl: string,
    executionCtx?: any
  ): Promise<{ success: boolean; status?: number; error?: string }> {
    if (!isValidDeployHookUrl(hookUrl)) {
      return {
        success: false,
        error: "URL Cloudflare Deploy Hook tidak valid atau belum diatur.",
      };
    }

    const triggerPromise = fetch(hookUrl.trim(), { method: "POST" })
      .then(async res => {
        if (!res.ok) {
          console.warn(`[OTA] Deploy Hook returned HTTP ${res.status}`);
          return {
            success: false,
            status: res.status,
            error: `Deploy Hook gagal merespons (HTTP ${res.status})`,
          };
        }
        return { success: true, status: res.status };
      })
      .catch((err: any) => {
        console.error("[OTA] Deploy Hook fetch error:", err);
        return {
          success: false,
          error: err.message || "Gagal menghubungi Deploy Hook Cloudflare",
        };
      });

    if (executionCtx && typeof executionCtx.waitUntil === "function") {
      executionCtx.waitUntil(triggerPromise);
      return { success: true };
    } else {
      return await triggerPromise;
    }
  },

  createRolloutPayload(
    clientUrl: string,
    siteName: string,
    installedVersion: string,
    targetVersion: string,
    status: "updated" | "received" | "failed" | "pending",
    errorReason: string | null = null
  ) {
    return {
      client_url: clientUrl,
      site_name: siteName,
      installed_version: installedVersion,
      target_version: targetVersion,
      rollout_status: status,
      error_reason: errorReason,
    };
  },
};

export function isValidDeployHookUrl(url?: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch (_) {
    return false;
  }
}
