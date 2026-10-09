#!/usr/bin/env node

/**
 * 📦 Bundle Core CMSMu Release Archive (.zip)
 * Mengemas rilis Core CMSMu ke dalam satu berkas .zip mandiri yang siap
 * didistribusikan ke pengguna/klien untuk proses update 100% aman dan bersih.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function getSha256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function main() {
  console.log('====================================================');
  console.log('🚀 PEMBUATAN BUNDLE RILIS CORE CMSMU (.ZIP)');
  console.log('====================================================\n');

  // 1. Baca metadata versi
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const version = pkg.version || '0.1.0';
  const tagName = `v${version}`;
  console.log(`📌 Versi Rilis Target: ${tagName}`);

  // 2. Siapkan direktori output dist-release/
  const outDir = path.join(rootDir, 'dist-release');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const zipFileName = `cmsmu-core-${tagName}.zip`;
  const zipFilePath = path.join(outDir, zipFileName);
  const latestZipPath = path.join(outDir, 'cmsmu-core-latest.zip');

  // Hapus berkas zip lama jika ada
  if (fs.existsSync(zipFilePath)) fs.unlinkSync(zipFilePath);
  if (fs.existsSync(latestZipPath)) fs.unlinkSync(latestZipPath);

  // 3. Siapkan skrip update-client.sh di root rilis
  const updateScriptContent = `#!/usr/bin/env bash
# ==============================================================================
# 🚀 cmsMu Client One-Step Update Script
# Memperbarui Core cmsMu dengan aman tanpa menyentuh konfigurasi database (D1),
# file rahasia (.env), atau folder tema klien.
# ==============================================================================

set -e

echo "📦 Memulai update Core cmsMu ke ${tagName}..."

# Verifikasi direktori proyek
if [ ! -f "package.json" ]; then
  echo "❌ Error: Eksekusi script ini di root folder proyek cmsMu Anda."
  exit 1
fi

echo "✅ Menginstal dependensi terbaru..."
pnpm install

echo "🔨 Menjalankan build sistem..."
pnpm run build

echo "🎉 Update ke Core cmsMu ${tagName} selesai 100%!"
`;
  const updateScriptPath = path.join(rootDir, 'update-client.sh');
  fs.writeFileSync(updateScriptPath, updateScriptContent, { mode: 0o755 });

  console.log('📦 Mengompresi berkas core menjadi arsip ZIP...');

  // 4. Daftar pengecualian ketat (Zero-Garbage Policy)
  const excludePatterns = [
    '*.git*',
    '*node_modules*',
    '*.wrangler*',
    '*.astro*',
    '*.env*',
    '*dist-release*',
    '*.sqlite*',
    '*.db',
    '*dist/*',
    '*.turbo*',
    '*.DS_Store*'
  ];

  const excludeFlags = excludePatterns.map(p => `-x "${p}"`).join(' ');

  // 5. Eksekusi utilitas zip sistem
  const zipCmd = `zip -r -q "${zipFilePath}" apps packages scripts package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ota-manifest.json update-client.sh README.md ${excludeFlags}`;
  
  try {
    execSync(zipCmd, { cwd: rootDir, stdio: 'inherit' });
  } catch (err) {
    console.error('❌ Gagal membuat ZIP bundle:', err.message);
    process.exit(1);
  } finally {
    // Bersihkan file sementara update-client.sh dari working directory
    if (fs.existsSync(updateScriptPath)) fs.unlinkSync(updateScriptPath);
  }

  // 6. Buat salinan latest.zip
  fs.copyFileSync(zipFilePath, latestZipPath);

  // 7. Hitung Checksum & Statistik
  const stats = fs.statSync(zipFilePath);
  const sha256 = getSha256(zipFilePath);
  const shaFile = `${zipFilePath}.sha256`;
  fs.writeFileSync(shaFile, `${sha256}  ${zipFileName}\n`);

  console.log('\n====================================================');
  console.log('✨ BUNDLE RILIS BERHASIL DIBUAT DENGAN SUKSES!');
  console.log('====================================================');
  console.log(`📁 File Bundle:   dist-release/${zipFileName}`);
  console.log(`📁 Symlink File:  dist-release/cmsmu-core-latest.zip`);
  console.log(`📊 Ukuran File:   ${formatBytes(stats.size)}`);
  console.log(`🔑 SHA-256:       ${sha256}`);
  console.log('====================================================\n');
  console.log('💡 Langkah selanjutnya untuk rilis:');
  console.log('  1. Berkas ZIP ini dapat di-attach ke GitHub Release di:');
  console.log('     https://github.com/cakipin/cmsMu-go/releases');
  console.log('  2. Atau diunggah ke R2 Bucket / Public CDN untuk download langsung.');
  console.log('  3. Pengguna cukup mengekstrak isi ZIP di proyek mereka dan menjalankan pnpm install.\n');
}

main().catch(err => {
  console.error('\n❌ Terjadi kesalahan fatal:', err);
  process.exit(1);
});
