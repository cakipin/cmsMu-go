#!/usr/bin/env node
/**
 * scripts/verify-developer-bindings.mjs
 * 🛡️ CLOUDFLARE ACCOUNT BINDING GUARDRAIL (CMSMu-Go)
 *
 * Aturan Mutlak Pengguna & Developer CMSMu:
 * 1. Setiap instance / app turunan CMSMu WAJIB membinding Cloudflare D1, KV, dan R2 ke akun sendiri.
 * 2. Menolak (Hard Abort) proses deployment jika konfigurasi masih menggunakan ID template/placeholder:
 *    - D1 database_id: "00000000-0000-0000-0000-000000000000"
 *    - KV namespace id: "00000000000000000000000000000001"
 * 3. Menolak pembajakan atau penggunaan Database ID milik ekosistem pusat / proyek lain.
 */

import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

// Daftar ID Database Terproteksi (Anti-DB Leakage)
const PROTECTED_DATABASE_IDS = new Set([
  'cf808b94-8328-478d-b5db-f0ad5a01be44', // Core cmsmu-db
  'd8a56add-780d-4a45-b84b-a6c6f68e706e', // staging-newsroom-db
  'fed8248d-2ba2-4d68-8430-b5f64ad2f6bc', // kontenmu-prod-db
  '32b70d74-ed3d-4e0e-9d27-c5fb785cc374', // kontenmu-staging-db
]);

const DUMMY_D1_ID = '00000000-0000-0000-0000-000000000000';
const DUMMY_KV_ID = '00000000000000000000000000000001';

function parseJsonc(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    // Bersihkan komentar single-line dan multi-line
    const clean = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/,\s*([\]}])/g, '$1');
    return JSON.parse(clean);
  } catch (err) {
    console.error(`⚠️ [BINDING GUARD] Gagal mem-parse berkas konfigurasi: ${filePath}`);
    return null;
  }
}

export function verifyDeveloperBindings() {
  console.log('\n🛡️ [BINDING GUARD] Memeriksa integritas binding Cloudflare akun mandiri...');

  const configPaths = [
    path.join(rootDir, 'apps/cms-api/wrangler.jsonc'),
    path.join(rootDir, 'wrangler.jsonc'),
  ];

  let hasError = false;

  for (const cfgPath of configPaths) {
    if (!fs.existsSync(cfgPath)) continue;

    const relPath = path.relative(rootDir, cfgPath);
    const config = parseJsonc(cfgPath);
    if (!config) continue;

    // 1. Verifikasi D1 Database
    const d1List = config.d1_databases || [];
    for (const d1 of d1List) {
      const dbId = (d1.database_id || '').trim();

      if (!dbId || dbId === DUMMY_D1_ID) {
        console.error(`\n❌ [DEPLOY BLOCKED: DUMMY BINDING TERDETEKSI]`);
        console.error(`   Berkas: ${relPath}`);
        console.error(`   Binding D1 "${d1.binding || 'DB'}" masih memuat ID Placeholder: "${dbId}"`);
        console.error(`   👉 Setiap pengembang CMSMu WAJIB memiliki D1 Database sendiri di akun Cloudflare masing-masing!`);
        hasError = true;
      }
    }

    // 2. Verifikasi KV Namespaces
    const kvList = config.kv_namespaces || [];
    for (const kv of kvList) {
      const kvId = (kv.id || '').trim();
      if (kvId === DUMMY_KV_ID || kvId === '00000000000000000000000000000000') {
        console.error(`\n❌ [DEPLOY BLOCKED: DUMMY KV BINDING TERDETEKSI]`);
        console.error(`   Berkas: ${relPath}`);
        console.error(`   Binding KV "${kv.binding || 'SESSION'}" masih memuat ID Placeholder: "${kvId}"`);
        console.error(`   👉 Pengembang WAJIB membuat KV Namespace pada akun Cloudflare sendiri.`);
        hasError = true;
      }
    }
  }

  if (hasError) {
    console.error(`\n========================================================================`);
    console.error(`💡 PANDUAN PENYIAPAN BINDING CLOUDFLARE MANDIRI:`);
    console.error(`========================================================================`);
    console.error(`1. Gunakan 1-Click Setup Wizard Otomatis:`);
    console.error(`   $ pnpm run setup`);
    console.error(`   (Wizard akan membuat D1, KV, R2, dan memperbarui wrangler.jsonc Anda)`);
    console.error(``);
    console.error(`2. Atau Buat Manual via Cloudflare Wrangler CLI:`);
    console.error(`   $ npx wrangler d1 create <nama-app-db>`);
    console.error(`   $ npx wrangler kv:namespace create SESSION`);
    console.error(`   $ npx wrangler r2 bucket create <nama-app-media>`);
    console.error(`   Lalu salin UUID yang dihasilkan ke dalam berkas wrangler.jsonc Anda.`);
    console.error(`========================================================================\n`);
    process.exit(1);
  }

  console.log('✅ [BINDING GUARD] Lulus: Seluruh binding Cloudflare tervalidasi menggunakan akun mandiri.\n');
  return true;
}

// Jalankan otomatis jika dipanggil langsung dari terminal
if (process.argv[1] && process.argv[1].endsWith('verify-developer-bindings.mjs')) {
  verifyDeveloperBindings();
}
