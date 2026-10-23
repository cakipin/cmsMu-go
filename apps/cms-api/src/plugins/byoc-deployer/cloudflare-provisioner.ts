/**
 * ☁️ Cloudflare REST API v4 Client Service
 * Menangani otomatisasi pembuatan sumber daya Cloudflare (D1, R2, KV, Pages, DDL execution)
 * di akun Cloudflare milik pengguna (BYOC Model).
 */

export interface PagesBindingsConfig {
  projectName: string;
  slug: string;
  d1DatabaseId: string;
  r2BucketName: string;
  kvCacheId: string;
  kvSessionId: string;
  telemetryEndpoint: string;
  telemetryApiKey: string;
  gitOwner?: string;
  gitRepo?: string;
  gitBranch?: string;
  gitOwnerId?: string;
  gitRepoId?: string;
}

export class CloudflareProvisioner {
  private static async request<T = any>(
    url: string,
    apiToken: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${apiToken}`);
    headers.set("Accept", "application/json");

    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(url, { ...options, headers });
    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || (data && data.success === false)) {
      const errorMsg =
        data.errors && data.errors.length > 0
          ? data.errors.map((e: any) => e.message).join(", ")
          : `HTTP ${res.status} ${res.statusText}`;
      throw new Error(`[Cloudflare API Error]: ${errorMsg}`);
    }

    return data.result as T;
  }

  /**
   * 1. Buat Database D1 (${slug}_db)
   */
  static async createD1Database(
    accountId: string,
    apiToken: string,
    name: string
  ): Promise<{ id: string; name: string }> {
    try {
      const result = await this.request<{ uuid: string; name: string }>(
        `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/d1/database`,
        apiToken,
        {
          method: "POST",
          body: JSON.stringify({ name }),
        }
      );
      return { id: result.uuid, name: result.name };
    } catch (err: any) {
      // Jika database sudah ada, cari UUID-nya dari daftar D1
      const list = await this.request<any[]>(
        `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/d1/database`,
        apiToken
      );
      const found = list.find((d: any) => d.name === name);
      if (found) {
        return { id: found.uuid, name: found.name };
      }
      throw err;
    }
  }

  /**
   * 2. Buat Bucket R2 (${slug}_media)
   */
  static async createR2Bucket(
    accountId: string,
    apiToken: string,
    name: string
  ): Promise<{ name: string }> {
    try {
      await this.request(
        `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/r2/buckets`,
        apiToken,
        {
          method: "POST",
          body: JSON.stringify({ name }),
        }
      );
      return { name };
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes("already exists")) {
        return { name };
      }
      throw err;
    }
  }

  /**
   * 3. Buat KV Namespace (${slug}_cache / ${slug}_session)
   */
  static async createKvNamespace(
    accountId: string,
    apiToken: string,
    title: string
  ): Promise<{ id: string; title: string }> {
    try {
      const result = await this.request<{ id: string; title: string }>(
        `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/storage/kv/namespaces`,
        apiToken,
        {
          method: "POST",
          body: JSON.stringify({ title }),
        }
      );
      return { id: result.id, title: result.title };
    } catch (err: any) {
      // Jika sudah ada, cari ID dari list KV
      const list = await this.request<any[]>(
        `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/storage/kv/namespaces`,
        apiToken
      );
      const found = list.find((k: any) => k.title === title);
      if (found) {
        return { id: found.id, title: found.title };
      }
      throw err;
    }
  }

  /**
   * 4. Eksekusi Skema DDL SQL ke D1 Pengguna
   */
  static async executeD1Sql(
    accountId: string,
    apiToken: string,
    databaseId: string,
    sqlStatements: string[]
  ): Promise<void> {
    for (const statement of sqlStatements) {
      const trimmed = statement.trim();
      if (!trimmed) continue;

      await this.request(
        `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/d1/database/${encodeURIComponent(databaseId)}/query`,
        apiToken,
        {
          method: "POST",
          body: JSON.stringify({ sql: trimmed }),
        }
      );
    }
  }

  /**
   * 5. Buat / Konfigurasi Project Cloudflare Pages dengan Bindings
   */
  static async createOrUpdatePagesProject(
    accountId: string,
    apiToken: string,
    config: PagesBindingsConfig
  ): Promise<{ projectName: string; productionUrl: string }> {
    const deploymentConfig = {
      env_vars: {
        TELEMETRY_ENDPOINT: { value: config.telemetryEndpoint, type: "plain_text" },
        TELEMETRY_API_KEY: { value: config.telemetryApiKey, type: "secret_text" },
        PROJECT_SLUG: { value: config.slug, type: "plain_text" },
      },
      d1_databases: {
        DB: { id: config.d1DatabaseId },
      },
      r2_buckets: {
        MEDIA_BUCKET: { name: config.r2BucketName },
        BUCKET: { name: config.r2BucketName },
      },
      kv_namespaces: {
        CACHE: { namespace_id: config.kvCacheId },
        SESSION: { namespace_id: config.kvSessionId },
      },
    };

    const gitOwner = config.gitOwner || "cakipin";
    const gitRepo = config.gitRepo || "cmsMu-go";
    const gitBranch = config.gitBranch || "main";
    let ownerId = config.gitOwnerId || (gitOwner === "cakipin" && gitRepo === "cmsMu-go" ? "135562014" : "");
    let repoId = config.gitRepoId || (gitOwner === "cakipin" && gitRepo === "cmsMu-go" ? "1381692254" : "");

    // Jika custom Git repo dan ID belum disediakan, auto-resolve via GitHub REST API
    if ((gitOwner !== "cakipin" || gitRepo !== "cmsMu-go") && (!ownerId || !repoId)) {
      try {
        const ghRes = await fetch(
          `https://api.github.com/repos/${encodeURIComponent(gitOwner)}/${encodeURIComponent(gitRepo)}`,
          {
            headers: {
              "User-Agent": "cmsMu-BYOC-Deployer",
              "Accept": "application/vnd.github.v3+json",
            },
          }
        );
        if (ghRes.ok) {
          const ghData = (await ghRes.json().catch(() => ({}))) as any;
          if (ghData.owner?.id) ownerId = String(ghData.owner.id);
          if (ghData.id) repoId = String(ghData.id);
        }
      } catch (err: any) {
        console.warn("[Auto-resolve GitHub IDs Warning]:", err.message);
      }
    }

    const projectPayload = {
      name: config.projectName,
      subdomain: config.projectName,
      production_branch: gitBranch,
      source: {
        type: "github",
        config: {
          owner: gitOwner,
          owner_id: ownerId || "135562014",
          repo_name: gitRepo,
          repo_id: repoId || "1381692254",
          production_branch: gitBranch,
          pr_comments_enabled: true,
          deployments_enabled: true,
          production_deployments_enabled: true,
          preview_deployment_setting: "all",
          preview_branch_includes: ["*"],
          preview_branch_excludes: [],
          path_includes: ["*"],
          path_excludes: [],
        },
      },
      build_config: {
        build_command: "pnpm --filter=@cmsmu/web run build && cp -r apps/web/dist/client/* apps/web/dist/ && echo \"export { default } from './server/entry.mjs';\" > apps/web/dist/_worker.js && cp -r apps/web/dist ./dist",
        destination_dir: "apps/web/dist",
        root_dir: "",
      },
      deployment_configs: {
        production: deploymentConfig,
        preview: deploymentConfig,
      },
    };

    try {
      // Coba buat project Pages baru terhubung ke upstream cmsMu-go
      await this.request(
        `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/pages/projects`,
        apiToken,
        {
          method: "POST",
          body: JSON.stringify(projectPayload),
        }
      );
    } catch (err: any) {
      // Jika project Pages sudah ada, update konfigurasinya via PATCH
      await this.request(
        `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/pages/projects/${encodeURIComponent(config.projectName)}`,
        apiToken,
        {
          method: "PATCH",
          body: JSON.stringify({
            deployment_configs: projectPayload.deployment_configs,
            build_config: projectPayload.build_config,
          }),
        }
      );
    }

    return {
      projectName: config.projectName,
      productionUrl: `https://${config.projectName}.pages.dev`,
    };
  }

  /**
   * 6. Trigger Build/Deployment Pages dari Git Upstream Branch
   */
  static async triggerPagesDeployment(
    accountId: string,
    apiToken: string,
    projectName: string,
    branch: string = "main"
  ): Promise<{ id: string; url: string }> {
    return await this.request(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/pages/projects/${encodeURIComponent(projectName)}/deployments`,
      apiToken,
      {
        method: "POST",
        body: JSON.stringify({ branch }),
      }
    );
  }

  /**
   * 6. Hapus Sumber Daya Remote di Akun Cloudflare Pengguna (Opsional saat Hapus Proyek)
   */
  static async deleteRemoteResources(
    accountId: string,
    apiToken: string,
    resources: {
      projectName?: string;
      d1DatabaseId?: string;
      r2BucketName?: string;
      kvCacheId?: string;
      kvSessionId?: string;
    }
  ): Promise<void> {
    const acc = encodeURIComponent(accountId);

    // 1. Hapus Cloudflare Pages Project
    if (resources.projectName) {
      await this.request(
        `https://api.cloudflare.com/client/v4/accounts/${acc}/pages/projects/${encodeURIComponent(resources.projectName)}`,
        apiToken,
        { method: "DELETE" }
      ).catch((err) => console.warn("[Delete CF Pages Warning]:", err.message));
    }

    // 2. Hapus D1 Database
    if (resources.d1DatabaseId) {
      await this.request(
        `https://api.cloudflare.com/client/v4/accounts/${acc}/d1/database/${encodeURIComponent(resources.d1DatabaseId)}`,
        apiToken,
        { method: "DELETE" }
      ).catch((err) => console.warn("[Delete CF D1 Warning]:", err.message));
    }

    // 3. Hapus R2 Media Bucket
    if (resources.r2BucketName) {
      await this.request(
        `https://api.cloudflare.com/client/v4/accounts/${acc}/r2/buckets/${encodeURIComponent(resources.r2BucketName)}`,
        apiToken,
        { method: "DELETE" }
      ).catch((err) => console.warn("[Delete CF R2 Warning]:", err.message));
    }

    // 4. Hapus KV Cache & Session Namespaces
    if (resources.kvCacheId) {
      await this.request(
        `https://api.cloudflare.com/client/v4/accounts/${acc}/storage/kv/namespaces/${encodeURIComponent(resources.kvCacheId)}`,
        apiToken,
        { method: "DELETE" }
      ).catch((err) => console.warn("[Delete CF KV Cache Warning]:", err.message));
    }

    if (resources.kvSessionId) {
      await this.request(
        `https://api.cloudflare.com/client/v4/accounts/${acc}/storage/kv/namespaces/${encodeURIComponent(resources.kvSessionId)}`,
        apiToken,
        { method: "DELETE" }
      ).catch((err) => console.warn("[Delete CF KV Session Warning]:", err.message));
    }
  }
}
