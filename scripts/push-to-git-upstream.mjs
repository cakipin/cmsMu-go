#!/usr/bin/env node

/**
 * 🚀 Push Release to Upstream Git (cmsMu-go)
 * Memastikan branch main dan tag versi ter-push ke https://github.com/cakipin/cmsMu-go.git (remote public-release)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function run(cmd) {
    console.log(`> ${cmd}`);
    return execSync(cmd, { cwd: rootDir, encoding: 'utf-8', stdio: 'inherit' });
}

function runCapture(cmd) {
    return execSync(cmd, { cwd: rootDir, encoding: 'utf-8' }).trim();
}

async function main() {
    console.log('\n📦 Mempersiapkan rilis git upstream ke cmsMu-go...\n');

    // 1. Baca versi dari package.json
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
    const version = pkg.version;
    const tagName = `v${version}`;
    console.log(`📌 Versi Target: ${tagName}`);

    // 2. Verifikasi remote public-release
    const remotes = runCapture('git remote').split('\n').map(s => s.trim());
    if (!remotes.includes('public-release')) {
        console.error('❌ Remote public-release tidak ditemukan! Tambahkan: git remote add public-release https://github.com/cakipin/cmsMu-go.git');
        process.exit(1);
    }

    // 3. Stage file rilis & commit jika ada perubahan
    try {
        run('git add package.json ota-manifest.json src/cms/addons/ota/ src/cms/index.ts scripts/push-to-git-upstream.mjs');
        const status = runCapture('git status --porcelain');
        if (status) {
            console.log('📝 Membuat commit rilis...');
            run(`git commit -m "release(core): ${tagName} - patch OTA engine telemetry, SemVer precision & Tab 3 Git Upstream"`);
        } else {
            console.log('✅ Tidak ada perubahan kode baru untuk di-commit.');
        }
    } catch (e) {
        console.log('ℹ️ Melanjutkan tanpa commit baru.');
    }

    // 4. Tagging
    try {
        const existingTags = runCapture('git tag').split('\n').map(s => s.trim());
        if (!existingTags.includes(tagName)) {
            console.log(`🏷️ Membuat tag ${tagName}...`);
            run(`git tag -a ${tagName} -m "Release ${tagName}: cmsMu Core Framework"`);
        } else {
            console.log(`ℹ️ Tag ${tagName} sudah ada secara lokal.`);
        }
    } catch (e) {
        console.error('Gagal membuat tag:', e.message);
    }

    // 5. Push ke public-release main
    console.log('\n🚀 Mendorong perubahan ke upstream GitHub (public-release/main)...');
    run('git push public-release main');

    // 6. Push tag
    console.log(`\n🏷️ Mendorong tag ${tagName} ke upstream GitHub...`);
    run(`git push public-release ${tagName}`);

    console.log(`\n✨ Sukses! Rilis ${tagName} telah ter-push ke https://github.com/cakipin/cmsMu-go\n`);
}

main().catch(err => {
    console.error('\n❌ Terjadi kesalahan:', err.message);
    process.exit(1);
});
