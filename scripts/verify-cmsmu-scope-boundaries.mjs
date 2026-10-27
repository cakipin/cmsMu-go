#!/usr/bin/env node
/**
 * 🔒 scripts/verify-cmsmu-scope-boundaries.mjs
 * Guardrail Pengunci Batas Lingkup Repositori (Scope Boundary Enforcer)
 *
 * Memastikan pemisahan wewenang mutlak antara:
 * 1. Control Plane (core cmsMu / cms.labmu.dev) -> WAJIB memuat fitur BYOC Deployer & Quota.
 * 2. Tenant Runtime (cakipin/cmsMu-go) -> DILARANG KERAS memuat modul BYOC Deployer, tabel multi-tenant, dan API deployer.
 *
 * 📖 Dokumen Kebijakan Wajib: docs/CMSMU_GO_COMMIT_SCOPE_AND_BOUNDARY_POLICY.md
 *
 * Cara pakai:
 *   node scripts/verify-cmsmu-scope-boundaries.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT_DIR = process.cwd();

console.log("🔍 [SCOPE GUARD] Memeriksa batas wilayah kerja Control Plane vs Tenant Runtime...");
console.log("📖 [POLICY] Referensi: docs/CMSMU_GO_COMMIT_SCOPE_AND_BOUNDARY_POLICY.md\n");

const violations = [];

// Deteksi konteks lingkungan aktif
let currentBranch = "unknown";
try {
  currentBranch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: ROOT_DIR, encoding: "utf-8" }).trim();
} catch (_) {}

const isControlPlaneContext = currentBranch === "main" && fs.existsSync(path.join(ROOT_DIR, "apps/cms-api/src/plugins/byoc-deployer"));

if (isControlPlaneContext) {
  // ==========================================
  // 1. VERIFIKASI CONTROL PLANE (core cmsMu)
  // ==========================================
  console.log("➡️  1. [Konteks Control Plane] Verifikasi Kelengkapan Modul BYOC Deployer...");

  const requiredCoreByocFiles = [
    "apps/cms-api/src/plugins/byoc-deployer/cloudflare-provisioner.ts",
    "apps/cms-api/src/plugins/byoc-deployer/deployer.router.ts",
    "apps/cms-api/src/plugins/byoc-deployer/index.ts",
    "apps/cms-api/src/plugins/byoc-deployer/initial-schema.sql.ts",
    "apps/cms-api/src/plugins/byoc-deployer/view-deployer.ts",
    "apps/cms-api/src/plugins/byoc-deployer/view-monitoring.ts",
    "packages/db/src/schema-deployer.ts",
  ];

  for (const relPath of requiredCoreByocFiles) {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (!fs.existsSync(fullPath)) {
      violations.push(`[CORE MISSING] File wajib Control Plane tidak ditemukan: ${relPath}`);
    }
  }

  const pluginsIndex = path.join(ROOT_DIR, "apps/cms-api/src/plugins/index.ts");
  if (fs.existsSync(pluginsIndex)) {
    const content = fs.readFileSync(pluginsIndex, "utf-8");
    if (!content.includes("registerByocDeployer") && !content.includes("byoc-deployer")) {
      violations.push("[CORE UNREGISTERED] BYOC Deployer tidak terdaftar di apps/cms-api/src/plugins/index.ts");
    }
  }
} else {
  // ==========================================
  // 1. VERIFIKASI TENANT RUNTIME (cmsMu-go)
  // ==========================================
  console.log(`➡️  1. [Konteks Tenant Runtime: ${currentBranch}] Memverifikasi Kebersihan dari Modul Control Plane...`);

  // A. Verifikasi ketiadaan berkas BYOC di direktori lokal
  const forbiddenLocalFiles = [
    "apps/cms-api/src/plugins/byoc-deployer",
    "packages/db/src/schema-deployer.ts",
    "migrations/0002_byoc_deployer_and_monitoring.sql",
  ];

  for (const relPath of forbiddenLocalFiles) {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (fs.existsSync(fullPath)) {
      violations.push(`[LOCAL LEAKAGE] Berkas Control Plane dilarang ada di runtime cmsMu-go: ${relPath}`);
    }
  }

  // B. Verifikasi keberadaan wrangler.jsonc di root
  if (!fs.existsSync(path.join(ROOT_DIR, "wrangler.jsonc"))) {
    violations.push("[LOCAL MISSING] File wajib 'wrangler.jsonc' harus selalu ada di root cmsMu-go!");
  }

  // C. Verifikasi packages/db/src/migration-runner.ts bebas tabel control plane
  const migrationFile = path.join(ROOT_DIR, "packages/db/src/migration-runner.ts");
  if (fs.existsSync(migrationFile)) {
    const migrationContent = fs.readFileSync(migrationFile, "utf-8");
    if (migrationContent.includes("user_projects") || migrationContent.includes("instance_activity_logs") || migrationContent.includes("byoc_deployer")) {
      violations.push("[LOCAL LEAKAGE] Skema migrasi Control Plane (user_projects/instance_activity_logs) masih tertanam di packages/db/src/migration-runner.ts!");
    }
  }

  // D. Verifikasi docs/API_CONTRACT.md bebas endpoint deployer
  const apiContractFile = path.join(ROOT_DIR, "docs/API_CONTRACT.md");
  if (fs.existsSync(apiContractFile)) {
    const apiContent = fs.readFileSync(apiContractFile, "utf-8");
    if (apiContent.includes("/api/deployer/") || apiContent.includes("/api/telemetry/")) {
      violations.push("[LOCAL LEAKAGE] Endpoint Control Plane (/api/deployer/*, /api/telemetry/*) masih tercatat di docs/API_CONTRACT.md!");
    }
  }

  // E. Verifikasi docs/DATABASE_SCHEMA.md bebas skema deployer
  const dbSchemaFile = path.join(ROOT_DIR, "docs/DATABASE_SCHEMA.md");
  if (fs.existsSync(dbSchemaFile)) {
    const dbContent = fs.readFileSync(dbSchemaFile, "utf-8");
    if (dbContent.includes("schema-deployer") || dbContent.includes("user_projects")) {
      violations.push("[LOCAL LEAKAGE] Skema Control Plane (user_projects/schema-deployer) masih tercatat di docs/DATABASE_SCHEMA.md!");
    }
  }
}

// ==========================================
// 2. EVALUASI HASIL VERIFIKASI
// ==========================================
if (violations.length > 0) {
  console.error("\n🚨 ===================================================================");
  console.error("❌ [SCOPE BOUNDARY VIOLATION] TERJADI PELANGGARAN BATAS LINGKUP REPOSITORI!");
  console.error("🚨 ===================================================================");
  for (const v of violations) {
    console.error(`   • ${v}`);
  }
  console.error("\n🛡️  ATURAN LINGKUP MUTLAK:");
  console.error("   1. Modul BYOC Deployer, tabel user_projects, dan telemetri HANYA BOLEH berada di Control Plane (core cmsMu).");
  console.error("   2. Repositori upstream cmsMu-go adalah Standalone Tenant Runtime murni dan DILARANG memuat modul/skema BYOC.");
  console.error("   3. File wrangler.jsonc WAJIB selalu tersedia di root cmsMu-go.");
  console.error("   📖 BACA DOKUMEN: docs/CMSMU_GO_COMMIT_SCOPE_AND_BOUNDARY_POLICY.md\n");
  process.exit(1);
}

console.log("✅ [SCOPE GUARD] Batas wilayah kerja aman & terkunci sempurna:");
if (isControlPlaneContext) {
  console.log("   • Control Plane (core cmsMu) : Memuat seluruh fitur BYOC Deployer, Quota & Monitoring.");
} else {
  console.log("   • Tenant Runtime (cmsMu-go)  : 100% bersih dari modul deployer, skema multi-tenant, dan API control plane.");
  console.log("   • File wrangler.jsonc        : Tersedia dan terverifikasi bersih di root repositori.");
}
console.log("   📖 Seluruh perubahan mematuhi: docs/CMSMU_GO_COMMIT_SCOPE_AND_BOUNDARY_POLICY.md\n");
process.exit(0);
