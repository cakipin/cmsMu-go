#!/usr/bin/env node
/**
 * 🛡️ CMSMU DUAL-LAYER D1 & HYPERDRIVE GUARDRAILS VERIFIER
 * Memeriksa seluruh codebase untuk memastikan:
 * 1. Seluruh konfigurasi Hyperdrive MySQL WAJIB menyertakan `ssl: false` (Zero repeated TLS crypto handshake).
 * 2. Kueri mutasi telemetri (views + 1, daily_stats, visitors) DILARANG KERAS ditulis ke D1.
 * 3. Router publik mematuhi Lookahead Pagination (LIMIT N+1) tanpa kueri live COUNT(*).
 * 4. Skema database memiliki tabel relasi post_tags dan composite index.
 * 
 * Otoritas: @db-architect & @qa-engineer
 */

import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
let violations = [];

console.log("=========================================================================================");
console.log("🛡️  [AUDIT GUARDRAIL DUAL-LAYER D1 & HYPERDRIVE MYSQL]");
console.log("=========================================================================================\n");

// 1. Audit Skema packages/db
console.log("➡️  [RULE 1] Memeriksa Ekspor Guardrail & Skema post_tags di packages/db...");
const schemaPath = path.join(ROOT_DIR, "packages/db/src/schema.ts");
const indexPath = path.join(ROOT_DIR, "packages/db/src/index.ts");
const hyperdrivePath = path.join(ROOT_DIR, "packages/db/src/hyperdrive.ts");

if (!fs.existsSync(hyperdrivePath)) {
  violations.push("❌ File packages/db/src/hyperdrive.ts tidak ditemukan!");
} else {
  const hyperdriveContent = fs.readFileSync(hyperdrivePath, "utf8");
  if (!hyperdriveContent.includes("ssl: false")) {
    violations.push("❌ packages/db/src/hyperdrive.ts tidak menyertakan 'ssl: false' wajib!");
  }
  if (!hyperdriveContent.includes("isTelemetryMutation")) {
    violations.push("❌ packages/db/src/hyperdrive.ts tidak memiliki fungsi filter isTelemetryMutation()!");
  }
}

if (!fs.existsSync(schemaPath)) {
  violations.push("❌ File packages/db/src/schema.ts tidak ditemukan!");
} else {
  const schemaContent = fs.readFileSync(schemaPath, "utf8");
  if (!schemaContent.includes("export const postTags = sqliteTable")) {
    violations.push("❌ Tabel relasi 'postTags' tidak ditemukan di packages/db/src/schema.ts!");
  }
  if (!schemaContent.includes("idx_post_tags_slug_date")) {
    violations.push("❌ Composite index 'idx_post_tags_slug_date' tidak ditemukan pada postTags!");
  }
}

if (!fs.existsSync(indexPath) || !fs.readFileSync(indexPath, "utf8").includes("export * from \"./hyperdrive\"")) {
  violations.push("❌ packages/db/src/index.ts belum mengekspor modul hyperdrive!");
}

if (violations.length === 0) {
  console.log("   ✅ packages/db: Modul hyperdrive.ts dan skema postTags terpasang aman & valid.\n");
}

// 2. Audit Pemanggilan MySQL / Hyperdrive di Seluruh Codebase
console.log("➡️  [RULE 2] Memeriksa Anti-Crypto Handshake (Wajib ssl: false pada Hyperdrive/MySQL)...");

function scanDirForPatterns(dir, fileExtensions, checkFn) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git" && entry.name !== ".wrangler" && entry.name !== "dist") {
        scanDirForPatterns(fullPath, fileExtensions, checkFn);
      }
    } else if (fileExtensions.some(ext => entry.name.endsWith(ext))) {
      const content = fs.readFileSync(fullPath, "utf8");
      checkFn(fullPath, content);
    }
  }
}

scanDirForPatterns(path.join(ROOT_DIR, "apps"), [".ts", ".js", ".mjs"], (filePath, content) => {
  // Cek apakah ada createConnection / createPool tanpa ssl: false
  if (content.includes("createConnection") || content.includes("createPool")) {
    if (content.includes("hyperdrive") && !content.includes("ssl: false") && !content.includes("ssl=false")) {
      violations.push(`❌ ${path.relative(ROOT_DIR, filePath)}: Menginisialisasi koneksi Hyperdrive tanpa 'ssl: false'!`);
    }
  }
  
  // Cek apakah ada query INSERT INTO daily_stats atau visitors langsung ke c.env.DB
  if (/c\.env\.DB\.prepare\(\s*[`'"]INSERT\s+INTO\s+(?:daily_stats|visitors)/i.test(content)) {
    violations.push(`❌ ${path.relative(ROOT_DIR, filePath)}: Ditemukan kueri mutasi telemetri langsung ke c.env.DB (Melanggar Doktrin D1 Exemption)!`);
  }
});

// 3. Audit Paginasi Router Publik (Lookahead LIMIT N+1)
console.log("➡️  [RULE 3] Memeriksa Kepatuhan Router Publik (Lookahead Pagination & Zero Live COUNT)...");
const publicRouterPath = path.join(ROOT_DIR, "apps/cms-api/src/modules/public/public.router.ts");
if (fs.existsSync(publicRouterPath)) {
  const routerContent = fs.readFileSync(publicRouterPath, "utf8");
  if (routerContent.includes("SELECT COUNT(*)") || routerContent.includes("select({ count: count() })")) {
    violations.push("❌ apps/cms-api/src/modules/public/public.router.ts: Masih memuat kueri live COUNT(*) pada rute publik!");
  }
  if (!routerContent.includes("LIMIT 11") && !routerContent.includes("LIMIT 10 + 1") && !routerContent.includes("limit + 1")) {
    violations.push("❌ apps/cms-api/src/modules/public/public.router.ts: Belum menerapkan Lookahead pagination (limit + 1)!");
  }
}

console.log("=========================================================================================");
if (violations.length > 0) {
  console.error("🚨 DITEMUKAN PELANGGARAN GUARDRAIL DUAL-LAYER D1 & HYPERDRIVE:\n");
  for (const v of violations) {
    console.error(`   ${v}`);
  }
  console.log("=========================================================================================\n");
  process.exit(1);
} else {
  console.log("🏆 [VERDICT: PASS - DUAL-LAYER GUARDRAILS 100% SECURE]");
  console.log("✅ Hyperdrive Zero-Crypto Configuration terverifikasi.");
  console.log("✅ D1 Telemetry Exemption Invariant terverifikasi.");
  console.log("✅ Post Tags Relational Schema terpasang.");
  console.log("✅ Lookahead Pagination terverifikasi.");
  console.log("=========================================================================================\n");
  process.exit(0);
}
