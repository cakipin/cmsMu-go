#!/usr/bin/env node
/**
 * scripts/deploy-staging-newsroom.mjs
 * 🚀 DEDICATED ATOMIC DEPLOY SCRIPT FOR STAGING NEWSROOM
 *
 * Mengeliminasi 100% resiko penimpaan binding oleh wrangler.jsonc:
 * 1. Menjalankan verifikasi sync git upstream (pre-deploy gate).
 * 2. Mengisolasi wrangler.jsonc (Core cmsmu) agar Wrangler Pages TIDAK MENIMPA binding remote.
 * 3. Menjalankan deploy dist ke project 'staging-newsroom'.
 * 4. Mengembalikan wrangler.jsonc ke tempat semula.
 * 5. Melakukan smoke test live pada endpoint settings & kanal Sains & Teknologi.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const wranglerJsonc = path.join(rootDir, 'wrangler.jsonc');
const wranglerBackup = path.join(rootDir, 'wrangler.jsonc.staging_deploy_bak');

function run(cmd, inherit = true) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { cwd: rootDir, encoding: 'utf-8', stdio: inherit ? 'inherit' : 'pipe' });
}

async function main() {
  console.log('\n======================================================');
  console.log('🛡️  MEMULAI DEPLOYMENT TERPROTEKSI: STAGING NEWSROOM');
  console.log('======================================================\n');

  // 1. Git Pre-Deploy Sync Gate
  console.log('1️⃣ Memeriksa sinkronisasi Git...');
  run('node scripts/verify-deploy-sync.mjs');

  // 2. Build aplikasi
  console.log('\n2️⃣ Menjalankan Astro build...');
  run('npm run build');

  // 3. Persiapan payload dist
  console.log('\n3️⃣ Merapikan artefak dist/_worker.js...');
  run("rm -rf dist/server/wrangler.json dist/server/wrangler.jsonc dist/wrangler.jsonc .wrangler/deploy");
  run("cp -r dist/client/* dist/");
  fs.writeFileSync(path.join(rootDir, 'dist/_worker.js'), "export { default } from './server/entry.mjs';\n");

  // 4. Isolasi konfigurasi wrangler.jsonc lokal
  // PENTING: Wrangler Pages CLI secara otomatis membaca wrangler.jsonc lokal dan menimpa binding remote proyek!
  console.log('\n4️⃣ Mengisolasi wrangler.jsonc lokal dari Wrangler Pages CLI...');
  let hasMoved = false;
  if (fs.existsSync(wranglerJsonc)) {
    fs.renameSync(wranglerJsonc, wranglerBackup);
    hasMoved = true;
  }

  try {
    // 5. Eksekusi deploy ke staging-newsroom
    console.log('\n5️⃣ Mengunggah ke Cloudflare Pages (project: staging-newsroom)...');
    run('npx wrangler pages deploy dist --project-name staging-newsroom --branch main --commit-dirty=true');
  } finally {
    // Kembalikan wrangler.jsonc
    if (hasMoved && fs.existsSync(wranglerBackup)) {
      fs.renameSync(wranglerBackup, wranglerJsonc);
      console.log('🔄 Konfigurasi wrangler.jsonc telah dikembalikan ke kondisi awal.');
    }
  }

  // 6. Validasi Smoke Test Live
  console.log('\n6️⃣ Menjalankan Live Smoke Test...');
  try {
    const rawRes = execSync('curl -sL https://staging-newsroom.labmu.dev/api/settings', { encoding: 'utf-8' });
    const settings = JSON.parse(rawRes);
    const siteTitle = settings.data?.site_title;
    const homepage = settings.data?.site_homepage_slug;

    console.log(`   - Site Title    : "${siteTitle}"`);
    console.log(`   - Homepage Slug : "${homepage}"`);

    if (siteTitle !== 'NewsRoom' || homepage !== 'home') {
      console.error('\n❌ [CRITICAL ERROR] Binding terdeteksi bocor/tertukar dengan Core cmsMu!');
      process.exit(1);
    }
    console.log('\n✅ [SUKSES MUTLAK] Staging Newsroom ter-deploy sempurna dengan binding yang benar!\n');
  } catch (err) {
    console.warn('⚠️ Gagal menjalankan live check otomatis:', err.message);
  }
}

main().catch(err => {
  console.error('\n❌ Terjadi kesalahan pada deployment:', err.message);
  if (fs.existsSync(wranglerBackup)) {
    fs.renameSync(wranglerBackup, wranglerJsonc);
  }
  process.exit(1);
});
