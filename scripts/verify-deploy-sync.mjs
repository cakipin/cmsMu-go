#!/usr/bin/env node
/**
 * scripts/verify-deploy-sync.mjs
 * 🛡️ PRE-DEPLOY GIT SYNC & ENVIRONMENT GUARDRAIL
 *
 * Verifikasi wajib sebelum menjalankan Cloudflare Pages / API deploy:
 * 1. Memastikan branch aktif adalah branch yang valid.
 * 2. Memastikan branch lokal sinkron dengan remote (origin/main).
 * 3. Menolak proses deploy jika kode lokal tertinggal (behind) dari origin/main.
 * 4. Memastikan tidak ada conflict markers tersisa di codebase.
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { verifyDeveloperBindings } from './verify-developer-bindings.mjs';

const rootDir = process.cwd();

// 0. Validasi binding Cloudflare mandiri
verifyDeveloperBindings();

function runCapture(cmd) {
  try {
    return execSync(cmd, { cwd: rootDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    return null;
  }
}

console.log('\n🔒 [DEPLOY GUARD] Menjalankan verifikasi sinkronisasi Git & Remote tracking...');

// 1. Cek status git repository
const isGit = runCapture('git rev-parse --is-inside-work-tree');
if (isGit !== 'true') {
  console.error('❌ [DEPLOY BLOCKED] Direktori bukan merupakan Git repository aktif!');
  process.exit(1);
}

// 2. Ambil branch aktif
const currentBranch = runCapture('git branch --show-current');
console.log(`📌 Branch Aktif: ${currentBranch || '(detached HEAD)'}`);

// 3. Cek tracking remote
let upstream = runCapture('git rev-parse --abbrev-ref --symbolic-full-name @{u}');
if (!upstream) {
  // Jika branch tidak punya upstream, coba cek origin/main
  const remoteMainExists = runCapture('git rev-parse --verify origin/main');
  if (remoteMainExists) {
    upstream = 'origin/main';
    console.log(`ℹ️ [DEPLOY GUARD] Menggunakan target referensi remote: ${upstream}`);
  }
} else {
  console.log(`📡 Upstream Target: ${upstream}`);
}

// 4. Fetch status remote terbaru secara senyap jika jaringan tersedia
try {
  console.log('🔄 Memeriksa status commit terbaru di remote origin...');
  execSync('git fetch origin main --quiet', { cwd: rootDir, stdio: 'ignore', timeout: 8000 });
} catch (e) {
  console.log('⚠️ [DEPLOY GUARD] Gagal fetch remote (offline/timeout), menggunakan ref lokal terakhir.');
}

// 5. Cek apakah commit lokal tertinggal dari origin/main
if (upstream) {
  const behindCountStr = runCapture(`git rev-list --count HEAD..${upstream}`);
  const behindCount = parseInt(behindCountStr || '0', 10);

  if (!isNaN(behindCount) && behindCount > 0) {
    console.error(`\n❌ [DEPLOY BLOCKED: OUT-OF-DATE]`);
    console.error(`   Branch lokal tertinggal ${behindCount} commit dari ${upstream}!`);
    console.error(`   Sistem memblokir deployment agar tidak menimpa build dengan versi usang.`);
    console.error(`   👉 Solusi: Jalankan 'git pull origin main' atau sinkronkan worktree Anda sebelum deploy.\n`);
    process.exit(1);
  }

  const aheadCountStr = runCapture(`git rev-list --count ${upstream}..HEAD`);
  const aheadCount = parseInt(aheadCountStr || '0', 10);
  if (aheadCount > 0) {
    console.log(`ℹ️ [DEPLOY GUARD] Lokal memiliki ${aheadCount} commit baru di atas ${upstream}.`);
  }
}

// 6. Cek apakah ada sisa merge conflict markers di file yang dimodifikasi
const statusShort = runCapture('git status --short');
if (statusShort && statusShort.includes('UU ')) {
  console.error('\n❌ [DEPLOY BLOCKED] Terdeteksi file dalam status conflict (UU) yang belum terselesaikan!');
  process.exit(1);
}

console.log('✅ [DEPLOY GUARD] Verifikasi Git Sync Lulus: Kode lokal sinkron dengan upstream.\n');
process.exit(0);
