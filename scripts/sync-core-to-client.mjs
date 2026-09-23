#!/usr/bin/env node
/**
 * 🔄 Sync Core CMSMu to Downstream Client Repository
 * SOP 19 Compliant: Zero-Touch Client Themes & Custom Scrapers
 * 
 * Penggunaan:
 *   node scripts/sync-core-to-client.mjs <target-client-dir>
 * Contoh:
 *   node scripts/sync-core-to-client.mjs /Users/cakiphin/projects/newsroom
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CORE_DIR = path.resolve(__dirname, '..');

const targetArg = process.argv[2];
if (!targetArg) {
  console.error('❌ Harap tentukan direktori target klien!');
  console.error('Contoh: node scripts/sync-core-to-client.mjs /Users/cakiphin/projects/newsroom');
  process.exit(1);
}

const TARGET_DIR = path.resolve(process.cwd(), targetArg);

if (!fs.existsSync(TARGET_DIR)) {
  console.error(`❌ Direktori target tidak ditemukan: ${TARGET_DIR}`);
  process.exit(1);
}

console.log('====================================================');
console.log('🚀 MEMULAI AUTO PUSH / SYNC CORE CMSMU KE KLIEN');
console.log(`📦 Sumber Core:   ${CORE_DIR}`);
console.log(`🎯 Target Klien:  ${TARGET_DIR}`);
console.log('====================================================\n');

// 1. DAFTAR DIREKTORI CORE YANG WAJIB DISINKRONKAN (KATEGORI A)
const CORE_DIRS = [
  'src/cms/modules',
  'src/cms/db',
  'src/cms/registry',
  'src/cms/addons/ota',
  'src/cms/storage'
];

// 2. DAFTAR FILE CORE SPESIFIK
const CORE_FILES = [
  'src/cms/types.ts',
  'src/cms/index.ts',
  'src/components/ThemeEditorApp.tsx',
  'src/pages/theme-editor.astro'
];

// 3. DAFTAR WILAYAH TERPROTEKSI MUTLAK (KATEGORI B - ZERO-TOUCH)
const PROTECTED_PREFIXES = [
  'src/cms/themes',
  'src/cms/addons/newsroom',
  'src/cms/addons/aggregator',
  'wrangler.jsonc',
  'wrangler.toml',
  '.env',
  '.wrangler'
];

function isProtected(relPath) {
  const norm = relPath.replace(/\\/g, '/');
  return PROTECTED_PREFIXES.some(p => norm === p || norm.startsWith(p + '/'));
}

function copyDirRecursive(srcDir, destDir, relBase = '') {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    const itemRel = path.join(relBase, entry.name).replace(/\\/g, '/');

    if (entry.name === '.DS_Store' || isProtected(itemRel)) {
      if (entry.name !== '.DS_Store') {
        console.log(`🛡️  MELEWATI (TERPROTEKSI): ${itemRel}`);
      }
      continue;
    }

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath, itemRel);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✓ Sync: ${itemRel}`);
    }
  }
}

// EKSEKUSI SINKRONISASI DIREKTORI KATEGORI A
for (const relDir of CORE_DIRS) {
  const srcFull = path.join(CORE_DIR, relDir);
  const destFull = path.join(TARGET_DIR, relDir);
  console.log(`\n📂 Menyinkronkan direktori: ${relDir}`);
  copyDirRecursive(srcFull, destFull, relDir);
}

// EKSEKUSI SINKRONISASI BERKAS SPESIFIK KATEGORI A
console.log('\n📄 Menyinkronkan berkas core:');
for (const relFile of CORE_FILES) {
  const srcFull = path.join(CORE_DIR, relFile);
  const destFull = path.join(TARGET_DIR, relFile);
  if (fs.existsSync(srcFull) && !isProtected(relFile)) {
    fs.mkdirSync(path.dirname(destFull), { recursive: true });
    fs.copyFileSync(srcFull, destFull);
    console.log(`  ✓ Sync berkas: ${relFile}`);
  }
}

// 4. STANDARISASI REGISTRY ADDONS (src/cms/addons/index.ts)
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

fs.writeFileSync(targetAddonsIndex, standardizedAddonsIndex, 'utf8');
console.log('  ✓ Sukses menstandarkan src/cms/addons/index.ts dengan group: Plugins dan pluginId valid.');

console.log('\n====================================================');
console.log('✅ AUTO PUSH / SYNC CORE KE KLIEN SELESAI DENGAN SUKSES!');
console.log('====================================================');
