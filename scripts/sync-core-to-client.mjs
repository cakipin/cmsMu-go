#!/usr/bin/env node
/**
 * 🔄 Sync Core CMSMu to Downstream Client Repository
 * SOP 19 & SOP 20 Compliant: Zero-Touch Core Engine & Zero-Touch Client Themes
 * 
 * Penggunaan:
 *   node scripts/sync-core-to-client.mjs <target-client-dir> [--dry-run]
 * Contoh:
 *   node scripts/sync-core-to-client.mjs /Users/cakiphin/projects/newsroom --dry-run
 *   node scripts/sync-core-to-client.mjs /Users/cakiphin/projects/newsroom
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CORE_DIR = path.resolve(__dirname, '..');

// 1. ARGUMENT PARSING & FLAGS
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || args.includes('-d');
const isVerbose = args.includes('--verbose') || args.includes('-v');
const targetArg = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-'));

if (!targetArg) {
  console.log('====================================================');
  console.log('📘 PANDUAN PENGGUNAAN ORKESTRATOR SINKRONISASI CORE');
  console.log('====================================================');
  console.log('Perintah: node scripts/sync-core-to-client.mjs <target-client-dir> [--dry-run]\n');
  console.log('Opsi:');
  console.log('  --dry-run, -d  Simulasi sinkronisasi tanpa mengubah berkas fisik di disk');
  console.log('  --verbose, -v  Menampilkan detail setiap berkas yang diperiksa\n');
  console.log('Contoh:');
  console.log('  node scripts/sync-core-to-client.mjs /Users/cakiphin/projects/newsroom --dry-run');
  console.log('  node scripts/sync-core-to-client.mjs /Users/cakiphin/projects/newsroom');
  process.exit(1);
}

const TARGET_DIR = path.resolve(process.cwd(), targetArg);

// 2. PRE-FLIGHT SAFETY CHECKS
if (!fs.existsSync(TARGET_DIR)) {
  console.error(`❌ Direktori target tidak ditemukan: ${TARGET_DIR}`);
  process.exit(1);
}

if (TARGET_DIR === CORE_DIR) {
  console.error('❌ Error: Target klien tidak boleh sama dengan direktori Core CMSMu!');
  process.exit(1);
}

const targetPackageJson = path.join(TARGET_DIR, 'package.json');
if (!fs.existsSync(targetPackageJson)) {
  console.warn('⚠️  Peringatan: Direktori target tidak memiliki package.json. Pastikan path benar.');
}

const startTime = Date.now();
let copiedCount = 0;
let skippedCount = 0;

console.log('====================================================');
console.log(`🚀 MEMULAI AUTO PUSH / SYNC CORE CMSMU KE KLIEN ${isDryRun ? '🔍 [DRY-RUN]' : ''}`);
console.log(`📦 Sumber Core:   ${CORE_DIR}`);
console.log(`🎯 Target Klien:  ${TARGET_DIR}`);
if (isDryRun) {
  console.log('ℹ️  MODE SIMULASI: Tidak ada berkas fisik yang akan dimodifikasi di disk.');
}
console.log('====================================================\n');

// 3. DAFTAR DIREKTORI CORE YANG WAJIB DISINKRONKAN (KATEGORI A)
const CORE_DIRS = [
  'src/cms/modules',
  'src/cms/db',
  'src/cms/registry',
  'src/cms/addons/ota',
  'src/cms/storage'
];

// 4. DAFTAR FILE CORE SPESIFIK
const CORE_FILES = [
  'src/cms/types.ts',
  'src/cms/index.ts',
  'src/components/ThemeEditorApp.tsx',
  'src/pages/theme-editor.astro'
];

// 5. DAFTAR WILAYAH TERPROTEKSI MUTLAK (SOP 19 & SOP 20 ZERO-TOUCH CLIENT)
const PROTECTED_PREFIXES = [
  'src/cms/themes',
  'src/cms/addons/newsroom',
  'src/cms/addons/aggregator',
  'wrangler.jsonc',
  'wrangler.toml',
  '.env',
  '.wrangler',
  'public'
];

function isProtected(relPath) {
  const norm = relPath.replace(/\\/g, '/');
  return PROTECTED_PREFIXES.some(p => norm === p || norm.startsWith(p + '/'));
}

function copyDirRecursive(srcDir, destDir, relBase = '') {
  if (!fs.existsSync(srcDir)) return;
  if (!isDryRun) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    const itemRel = path.join(relBase, entry.name).replace(/\\/g, '/');

    if (entry.name === '.DS_Store' || isProtected(itemRel)) {
      if (entry.name !== '.DS_Store') {
        skippedCount++;
        if (isVerbose || isProtected(itemRel)) {
          console.log(`  🛡️  MELEWATI (TERPROTEKSI SOP 19/20): ${itemRel}`);
        }
      }
      continue;
    }

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath, itemRel);
    } else {
      copiedCount++;
      if (!isDryRun) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✓ Sync: ${itemRel}`);
      } else {
        console.log(`  [DRY-RUN] Will sync: ${itemRel}`);
      }
    }
  }
}

// 6. EKSEKUSI SINKRONISASI DIREKTORI KATEGORI A
for (const relDir of CORE_DIRS) {
  const srcFull = path.join(CORE_DIR, relDir);
  const destFull = path.join(TARGET_DIR, relDir);
  console.log(`\n📂 Menyinkronkan direktori: ${relDir}`);
  copyDirRecursive(srcFull, destFull, relDir);
}

// 7. SINKRONISASI MONOREPO PACKAGES (JIKA TARGET MENGADOPSI PACKAGES)
const targetPackagesDir = path.join(TARGET_DIR, 'packages');
if (fs.existsSync(targetPackagesDir)) {
  const MONOREPO_PACKAGES = ['packages/db', 'packages/core', 'packages/ui'];
  console.log('\n📦 Terdeteksi arsitektur monorepo pada target, menyinkronkan packages:');
  for (const pkg of MONOREPO_PACKAGES) {
    const srcPkg = path.join(CORE_DIR, pkg);
    const destPkg = path.join(TARGET_DIR, pkg);
    if (fs.existsSync(srcPkg)) {
      console.log(`  📂 Package: ${pkg}`);
      copyDirRecursive(srcPkg, destPkg, pkg);
    }
  }
}

// 8. EKSEKUSI SINKRONISASI BERKAS SPESIFIK KATEGORI A
console.log('\n📄 Menyinkronkan berkas core:');
for (const relFile of CORE_FILES) {
  const srcFull = path.join(CORE_DIR, relFile);
  const destFull = path.join(TARGET_DIR, relFile);
  if (fs.existsSync(srcFull) && !isProtected(relFile)) {
    copiedCount++;
    if (!isDryRun) {
      fs.mkdirSync(path.dirname(destFull), { recursive: true });
      fs.copyFileSync(srcFull, destFull);
      console.log(`  ✓ Sync berkas: ${relFile}`);
    } else {
      console.log(`  [DRY-RUN] Will sync berkas: ${relFile}`);
    }
  }
}

// 9. STANDARISASI REGISTRY ADDONS (src/cms/addons/index.ts)
const targetAddonsIndex = path.join(TARGET_DIR, 'src/cms/addons/index.ts');
console.log('\n🔌 Menstandarkan registri addons (src/cms/addons/index.ts)...');

const standardizedAddonsIndex = `import { Hono } from 'hono';
import type { Bindings } from '../types';
import { registerPluginMenu } from '../registry/admin-menu';
import { aggregatorRouter } from './aggregator/router';
import { newsroomRouter } from './newsroom/router';
import { otaRouter } from './ota/router';

export default function registerAddons(app: Hono<{ Bindings: Bindings }>) {
  // 1. Mount API Routes
  app.route('/api/addons/aggregator', aggregatorRouter);
  app.route('/api/addons/newsroom', newsroomRouter);
  app.route('/api/addons/ota', otaRouter);

  // 2. Register Admin Menus (Standar Grup: 'Plugins' dengan pluginId eksplisit)
  registerPluginMenu({
    group: 'Plugins',
    title: 'OTA Manager',
    view: 'ota',
    icon: 'fas fa-cloud-upload-alt',
    role: ['admin'],
    pluginId: 'ota'
  });

  registerPluginMenu({
    group: 'Plugins',
    title: 'Meja Kurasi',
    view: 'newsroom',
    icon: 'fas fa-newspaper',
    role: ['admin', 'editor'],
    pluginId: 'newsroom'
  });

  registerPluginMenu({
    group: 'Plugins',
    title: 'Sumber Agregator',
    view: 'aggregator',
    icon: 'fas fa-satellite-dish',
    role: ['admin'],
    pluginId: 'aggregator'
  });

  console.log('🔌 Addons (OTA, Agregator, Newsroom) registered successfully');
}
`;

if (!isDryRun) {
  if (fs.existsSync(path.dirname(targetAddonsIndex))) {
    fs.writeFileSync(targetAddonsIndex, standardizedAddonsIndex, 'utf8');
    console.log('  ✓ Sukses menstandarkan src/cms/addons/index.ts dengan group: Plugins dan pluginId valid.');
  }
} else {
  console.log('  [DRY-RUN] Will standardize src/cms/addons/index.ts with valid group and pluginId.');
}

const duration = Date.now() - startTime;

console.log('\n====================================================');
console.log(`✅ ${isDryRun ? 'SIMULASI [DRY-RUN]' : 'SINKRONISASI'} SELESAI DENGAN SUKSES!`);
console.log(`📊 Statistik:`);
console.log(`   - Berkas ${isDryRun ? 'disimulasikan' : 'disinkronkan'} : ${copiedCount} berkas`);
console.log(`   - Berkas terproteksi dilewati: ${skippedCount} entitas`);
console.log(`   - Waktu eksekusi            : ${duration} ms`);
console.log('====================================================\n');
