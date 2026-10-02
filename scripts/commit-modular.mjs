#!/usr/bin/env node
/**
 * 📦 Modular Atomic Commit & Path Audit Trail Helper
 * Memisahkan staging dan commit Git secara atomik per kategori:
 * 1. ⚙️ Core Engine (src/cms/modules/admin, db, registry, dll)
 * 2. 🔌 Plugin / Addons (src/cms/addons, src/cms/modules/plugins, dll)
 * 3. 🎨 Theme (src/cms/themes, src/pages, theme-builder, css, dll)
 * Serta mencatat setiap path berkas ke dalam ota-manifest.json dan docs/CHANGELOG.md.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const MANIFEST_PATH = path.join(ROOT_DIR, 'ota-manifest.json');
const PUBLIC_MANIFEST_PATH = path.join(ROOT_DIR, 'public/ota-manifest.json');
const CHANGELOG_PATH = path.join(ROOT_DIR, 'docs/CHANGELOG.md');

// Parsing argumen CLI
const args = process.argv.slice(2);
let customMessage = '';
let isDryRun = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--message' || args[i] === '-m') {
    customMessage = args[i + 1] || '';
    i++;
  } else if (args[i] === '--dry-run') {
    isDryRun = true;
  }
}

if (!customMessage) {
  customMessage = 'Pembaruan sistem CMSMu modular';
}

console.log('====================================================');
console.log('🚀 CMSMu Modular Commit & Path Audit Trail Helper');
console.log(`📂 Direktori Kerja: ${ROOT_DIR}`);
console.log(`📝 Pesan Dasar    : "${customMessage}"`);
console.log(`🛡️  Mode Dry-Run   : ${isDryRun ? 'AKTIF (Tidak akan mengeksekusi commit)' : 'NON-AKTIF (Eksekusi Nyata)'}`);
console.log('====================================================\n');

// 1. Ambil status git saat ini
let statusOutput = '';
try {
  statusOutput = execSync('git status --porcelain', { cwd: ROOT_DIR, encoding: 'utf-8' }).trim();
} catch (e) {
  console.error('❌ Gagal membaca git status:', e.message);
  process.exit(1);
}

if (!statusOutput) {
  console.log('✨ Tidak ada perubahan berkas di Git workspace saat ini. Semua bersih.');
  process.exit(0);
}

// 2. Parse berkas yang berubah
const lines = statusOutput.split('\n');
const changedFiles = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  // Format porcelain: XY PATH atau XY ORIG -> PATH
  const parts = trimmed.split(/\s+/);
  const status = parts[0];
  let filePath = parts.slice(1).join(' ');
  if (filePath.includes(' -> ')) {
    filePath = filePath.split(' -> ')[1];
  }
  // Bersihkan quotes jika ada
  filePath = filePath.replace(/^"|"$/g, '');
  changedFiles.push({ status, path: filePath });
}

console.log(`🔍 Terdeteksi ${changedFiles.length} berkas yang mengalami perubahan.`);

// 3. Klasifikasi berkas ke dalam 4 bucket
const buckets = {
  core: [],
  plugin: [],
  theme: [],
  meta: []
};

function classifyFile(filePath) {
  const norm = filePath.replace(/\\/g, '/');

  // A. THEME
  if (
    norm.startsWith('src/cms/themes/') ||
    norm.startsWith('src/pages/') ||
    norm.startsWith('src/cms/modules/theme-builder/') ||
    norm.startsWith('src/cms/modules/theme-editor/') ||
    norm.includes('ThemeEditorApp.tsx') ||
    norm.startsWith('public/css/') ||
    norm.startsWith('public/themes/') ||
    norm.includes('tokens.css')
  ) {
    return 'theme';
  }

  // B. PLUGIN / ADDON
  if (
    norm.startsWith('src/cms/addons/') ||
    norm.startsWith('src/cms/modules/plugins/') ||
    norm.includes('plugins.router.ts')
  ) {
    return 'plugin';
  }

  // C. CORE ENGINE
  if (
    norm.startsWith('src/cms/modules/admin/') ||
    norm.startsWith('src/cms/db/') ||
    norm.startsWith('src/cms/registry/') ||
    norm.startsWith('src/cms/storage/') ||
    norm.startsWith('src/cms/modules/posts/') ||
    norm.startsWith('src/cms/modules/pages/') ||
    norm.startsWith('src/cms/modules/contents/') ||
    norm.startsWith('src/cms/modules/settings/') ||
    norm.startsWith('src/cms/modules/users/') ||
    norm.startsWith('src/cms/modules/media/') ||
    norm.startsWith('src/cms/modules/comments/') ||
    norm.startsWith('packages/') ||
    norm === 'src/cms/types.ts' ||
    norm === 'src/cms/index.ts'
  ) {
    return 'core';
  }

  // D. META / SCRIPTS / DOCS / CONFIG
  return 'meta';
}

for (const item of changedFiles) {
  const category = classifyFile(item.path);
  buckets[category].push(item.path);
}

console.log('\n📊 Hasil Klasifikasi Berkas:');
console.log(`   ⚙️  Core Engine : ${buckets.core.length} berkas`);
console.log(`   🔌 Plugin/Addon: ${buckets.plugin.length} berkas`);
console.log(`   🎨 Theme       : ${buckets.theme.length} berkas`);
console.log(`   📄 Meta/Docs   : ${buckets.meta.length} berkas`);

// 4. Update Audit Log Manifest (ota-manifest.json)
const updatedComponentsList = [];

if (buckets.core.length > 0) {
  updatedComponentsList.push({
    name: 'Pembaruan Core Engine & Modular Architecture',
    type: 'core',
    paths: buckets.core,
    description: `${customMessage} (Core Module)`,
    updatedAt: new Date().toISOString()
  });
}

if (buckets.plugin.length > 0) {
  updatedComponentsList.push({
    name: 'Pembaruan Plugin & Addon Ekstensi',
    type: 'plugin',
    paths: buckets.plugin,
    description: `${customMessage} (Plugin/Addon Module)`,
    updatedAt: new Date().toISOString()
  });
}

if (buckets.theme.length > 0) {
  updatedComponentsList.push({
    name: 'Pembaruan Theme, Tampilan & Template Visual',
    type: 'theme',
    paths: buckets.theme,
    description: `${customMessage} (Theme & Public UI)`,
    updatedAt: new Date().toISOString()
  });
}

// Tulis ke ota-manifest.json jika ada komponen yang diperbarui
if (!isDryRun && updatedComponentsList.length > 0 && fs.existsSync(MANIFEST_PATH)) {
  try {
    const rawManifest = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    const manifestJson = JSON.parse(rawManifest);
    manifestJson.updatedComponents = updatedComponentsList;
    manifestJson.buildDate = new Date().toISOString().split('T')[0];
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifestJson, null, 2), 'utf-8');
    console.log('\n📝 Sukses memperbarui ota-manifest.json dengan daftar path berkas audit.');

    if (fs.existsSync(PUBLIC_MANIFEST_PATH)) {
      fs.writeFileSync(PUBLIC_MANIFEST_PATH, JSON.stringify(manifestJson, null, 2), 'utf-8');
      console.log('📝 Sukses memperbarui public/ota-manifest.json.');
    }
    buckets.meta.push('ota-manifest.json');
    if (fs.existsSync(PUBLIC_MANIFEST_PATH)) buckets.meta.push('public/ota-manifest.json');
  } catch (err) {
    console.warn('⚠️ Gagal memperbarui ota-manifest.json:', err.message);
  }
}

// Perbarui docs/CHANGELOG.md jika ada
if (!isDryRun && fs.existsSync(path.dirname(CHANGELOG_PATH))) {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    let logEntry = `\n### [${dateStr}] - ${customMessage}\n`;
    if (buckets.core.length > 0) {
      logEntry += `\n#### ⚙️ Core Engine (${buckets.core.length} berkas)\n` + buckets.core.map(f => `- \`${f}\``).join('\n') + '\n';
    }
    if (buckets.plugin.length > 0) {
      logEntry += `\n#### 🔌 Plugin / Addons (${buckets.plugin.length} berkas)\n` + buckets.plugin.map(f => `- \`${f}\``).join('\n') + '\n';
    }
    if (buckets.theme.length > 0) {
      logEntry += `\n#### 🎨 Theme & UI (${buckets.theme.length} berkas)\n` + buckets.theme.map(f => `- \`${f}\``).join('\n') + '\n';
    }
    fs.appendFileSync(CHANGELOG_PATH, logEntry, 'utf-8');
    console.log('📝 Sukses mencatat riwayat pembaruan ke docs/CHANGELOG.md.');
    buckets.meta.push('docs/CHANGELOG.md');
  } catch (_) {}
}

// 5. Eksekusi Atomic Git Commits
function runCommit(category, files, typePrefix) {
  if (!files || files.length === 0) return;

  const uniqueFiles = Array.from(new Set(files));
  const fileListText = uniqueFiles.map(f => `- ${f}`).join('\n');
  const commitMsg = `${typePrefix}: ${customMessage}\n\nPath berkas yang diperbarui:\n${fileListText}`;

  console.log(`\n----------------------------------------------------`);
  console.log(`🚀 Melakukan Atomic Commit untuk Kategori: [${category.toUpperCase()}]`);
  console.log(`📁 Jumlah Berkas: ${uniqueFiles.length}`);

  if (isDryRun) {
    console.log(`[DRY-RUN] git add ${uniqueFiles.join(' ')}`);
    console.log(`[DRY-RUN] Commit Message:\n${commitMsg}`);
    return;
  }

  try {
    // Stage file-file spesifik kategori
    execSync(`git add ${uniqueFiles.map(f => `"${f}"`).join(' ')}`, { cwd: ROOT_DIR });
    // Buat commit dengan body rincian path
    fs.writeFileSync('/tmp/cmsmu_commit_msg.txt', commitMsg, 'utf-8');
    execSync(`git commit -F /tmp/cmsmu_commit_msg.txt`, { cwd: ROOT_DIR });
    console.log(`✅ Commit sukses untuk kategori [${category.toUpperCase()}]!`);
  } catch (err) {
    console.error(`❌ Gagal commit kategori [${category}]:`, err.message);
  }
}

// Urutan eksekusi: Core -> Plugin -> Theme -> Meta
runCommit('core', buckets.core, 'fix(core)');
runCommit('plugin', buckets.plugin, 'feat(plugin)');
runCommit('theme', buckets.theme, 'feat(theme)');
runCommit('meta', buckets.meta, 'chore(meta)');

console.log('\n====================================================');
console.log('🎉 SELURUH ATOMIC COMMIT & AUDIT MANIFEST SELESAI!');
console.log('====================================================\n');
