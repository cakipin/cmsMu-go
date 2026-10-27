/**
 * 🛡️ CMSMU HARDENED HYPERDRIVE CLIENT FACTORY & DUAL-LAYER GUARDRAILS
 * Memastikan koneksi Cloudflare Worker -> Hyperdrive bebas dari komputasi kripto RSA/ECDHE berulang
 * dan mencegah kebocoran mutasi telemetri ke Cloudflare D1.
 * Otoritas: @db-architect & @infra-engineer
 */

export interface HyperdriveBindingLike {
  host?: string;
  port?: number | string;
  user?: string;
  password?: string;
  database?: string;
  connectionString?: string;
}

export interface HardenedMysqlConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  uri?: string;
  disableEval: boolean;
  ssl: false;
  connectTimeout: number;
}

/**
 * 🛡️ INVARIANT 1: Hyperdrive Zero-Crypto Configuration
 * Cloudflare Hyperdrive mengelola koneksi TCP dan TLS persisten ke origin database.
 * Koneksi lokal antara Worker Isolate dan Hyperdrive Proxy WAJIB diatur `ssl: false`.
 * Mengeliminasi pemborosan CPU 10ms - 30ms per request akibat handshake kripto asimetris berulang.
 */
export function createHyperdriveConfig(binding: HyperdriveBindingLike): HardenedMysqlConfig {
  if (!binding) {
    throw new Error("[Hyperdrive Guard] Binding Hyperdrive atau connection string tidak boleh kosong.");
  }

  if (binding.host) {
    return {
      host: binding.host,
      port: Number(binding.port) || 3306,
      user: binding.user,
      password: binding.password,
      database: binding.database || "cmsmu",
      disableEval: true,
      ssl: false, // 🛡️ Zero CPU Crypto Handshake (RSA/ECDHE disabled on worker-to-hyperdrive)
      connectTimeout: 800, // 800ms failover timeout
    };
  }

  const rawUri = binding.connectionString || "";
  if (!rawUri) {
    throw new Error("[Hyperdrive Guard] Hyperdrive host atau connectionString tidak ditemukan.");
  }

  // Bersihkan parameter ssl bawaan jika ada dan paksakan ssl=false
  let sanitizedUri = rawUri;
  if (sanitizedUri.includes("ssl=")) {
    sanitizedUri = sanitizedUri.replace(/([?&])ssl=[^&]*/gi, "$1ssl=false");
  } else {
    sanitizedUri = sanitizedUri.includes("?") ? `${sanitizedUri}&ssl=false` : `${sanitizedUri}?ssl=false`;
  }

  return {
    uri: sanitizedUri,
    disableEval: true,
    ssl: false, // 🛡️ Zero CPU Crypto Handshake
    connectTimeout: 800,
  };
}

/**
 * 🛡️ INVARIANT 2: Telemetry D1 Exemption Filter
 * Mendeteksi apakah kueri SQL merupakan mutasi telemetri frekuensi tinggi:
 * - Counter views artikel: `SET views = views + 1`
 * - Rekapitulasi harian: `daily_stats`
 * - Log pengunjung real-time: `visitors`
 * 
 * Aturan Mutlak: Kueri yang menghasilkan nilai `true` DILARANG KERAS ditulis ke Cloudflare D1!
 */
export function isTelemetryMutation(sqlQuery: string): boolean {
  if (!sqlQuery || typeof sqlQuery !== "string") return false;
  const sql = sqlQuery.toLowerCase();
  
  // 1. Deteksi mutasi view counter
  const isViewCounter = /set\s+[`"]?views[`"]?\s*=\s*(?:[`"]?\w+[`"]?\.|)?[`"]?views[`"]?\s*\+\s*1/i.test(sql);
  
  // 2. Deteksi mutasi tabel statistik / pengunjung
  const isDailyStats = /\bdaily_stats\b/i.test(sql) && (sql.includes("insert") || sql.includes("update") || sql.includes("delete"));
  const isVisitors = /\bvisitors\b/i.test(sql) && (sql.includes("insert") || sql.includes("update") || sql.includes("delete"));

  return isViewCounter || isDailyStats || isVisitors;
}

/**
 * 🛡️ INVARIANT 3: Circuit Breaker State Machine untuk MySQL Failover
 * Jika MySQL Hyperdrive mengalami kegagalan/timeout, Circuit Breaker terbuka
 * dan kueri konten esensial dialihkan secara transparan ke D1 tanpa membebani thread Worker.
 */
export class HyperdriveCircuitBreaker {
  private static failures = 0;
  private static lastFailureTime = 0;
  private static state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private static readonly FAILURE_THRESHOLD = 2;
  private static readonly RESET_TIMEOUT_MS = 30000; // 30 detik cooldown

  public static isOpen(): boolean {
    const now = Date.now();
    if (this.state === "OPEN") {
      if (now - this.lastFailureTime > this.RESET_TIMEOUT_MS) {
        this.state = "HALF_OPEN";
        return false;
      }
      return true;
    }
    return false;
  }

  public static recordSuccess(): void {
    this.failures = 0;
    this.state = "CLOSED";
  }

  public static recordFailure(error?: any): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.FAILURE_THRESHOLD) {
      this.state = "OPEN";
      console.warn(`[HYPERDRIVE CIRCUIT BREAKER] State changed to OPEN. Bypassing MySQL for ${this.RESET_TIMEOUT_MS / 1000}s. Reason:`, error?.message || error);
    }
  }

  public static getState(): "CLOSED" | "OPEN" | "HALF_OPEN" {
    return this.state;
  }
}
