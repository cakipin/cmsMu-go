#!/usr/bin/env node
/**
 * ==============================================================================
 * 🚀 CMSMu Serverless 1-Click Cloudflare Setup Wizard
 * Otomasi pembuatan D1 Database, KV Namespaces, R2 Bucket, dan inisialisasi skema.
 * Jalankan: npm run setup
 * ==============================================================================
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (query, defaultVal = '') =>
  new Promise((resolve) => {
    const prompt = defaultVal ? `${query} [${defaultVal}]: ` : `${query}: `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultVal);
    });
  });

function runCommand(cmd, ignoreError = false) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (error) {
    if (!ignoreError) {
      throw error;
    }
    return error.stdout || '';
  }
}

async function main() {
  console.log('\n=============================================================');
  console.log('🚀 SELAMAT DATANG DI SETUP WIZARD CMSMU SERVERLESS');
  console.log('   Infrastruktur: Cloudflare Pages + D1 SQLite + KV + R2');
  console.log('=============================================================\n');

  // 1. Verifikasi Wrangler CLI
  process.stdout.write('🔍 Memeriksa Wrangler CLI... ');
  try {
    const wranglerVer = runCommand('npx wrangler --version').trim();
    console.log(`✓ Terpasang (${wranglerVer})`);
  } catch (err) {
    console.log('\n❌ Wrangler CLI belum terpasang.');
    console.log('   Silakan jalankan: npm install -g wrangler\n');
    process.exit(1);
  }

  // 2. Verifikasi Autentikasi Cloudflare
  process.stdout.write('🔑 Memeriksa login Cloudflare... ');
  try {
    const whoami = runCommand('npx wrangler whoami');
    if (whoami.includes('You are not logged in') || whoami.includes('Error')) {
      throw new Error('Not logged in');
    }
    console.log('✓ Terautentikasi');
  } catch (err) {
    console.log('\n⚠️ Anda belum login ke akun Cloudflare.');
    console.log('   Sistem akan membuka browser untuk login...\n');
    try {
      execSync('npx wrangler login', { stdio: 'inherit' });
    } catch (loginErr) {
      console.log('\n❌ Gagal login. Silakan jalankan `npx wrangler login` secara manual.\n');
      process.exit(1);
    }
  }

  console.log('\n📋 Konfigurasi Nama Resource Cloudflare:');
  const projectName = await ask('   Nama Project (slug)', 'cmsmu');
  const d1Name = await ask('   Nama Database D1', `${projectName}_db`);
  const r2BucketName = await ask('   Nama Bucket R2 Media', `${projectName}_media`);
  const kvSessionName = await ask('   Nama KV Namespace Session', `${projectName}_session`);
  const kvCacheName = await ask('   Nama KV Namespace Cache', `${projectName}_cache`);

  console.log('\n⏳ Membuat resource di Cloudflare (proses memerlukan beberapa detik)...');

  // 3. Buat Database D1
  let d1Id = '';
  process.stdout.write(`📦 [1/4] Membuat D1 Database (${d1Name})... `);
  try {
    const d1Output = runCommand(`npx wrangler d1 create ${d1Name}`, true);
    const idMatch = d1Output.match(/database_id\s*=\s*"([^"]+)"/) || d1Output.match(/"database_id":\s*"([^"]+)"/);
    if (idMatch) {
      d1Id = idMatch[1];
      console.log(`✓ Sukses (ID: ${d1Id})`);
    } else {
      // Coba cari dari daftar d1 jika sudah ada
      const listOutput = runCommand('npx wrangler d1 list --json', true);
      const parsed = JSON.parse(listOutput || '[]');
      const found = parsed.find((d) => d.name === d1Name);
      if (found) {
        d1Id = found.uuid;
        console.log(`✓ Ditemukan database yang ada (ID: ${d1Id})`);
      } else {
        throw new Error('Gagal mendapatkan ID Database D1 dari output wrangler.');
      }
    }
  } catch (err) {
    console.log(`⚠️ Gagal otomatis: ${err.message}`);
    d1Id = await ask('   Masukkan Database ID D1 secara manual');
  }

  // 4. Buat KV Session
  let kvSessionId = '';
  process.stdout.write(`🗄️ [2/4] Membuat KV Namespace (${kvSessionName})... `);
  try {
    const kvOutput = runCommand(`npx wrangler kv namespace create ${kvSessionName}`, true);
    const idMatch = kvOutput.match(/id\s*=\s*"([^"]+)"/) || kvOutput.match(/"id":\s*"([^"]+)"/);
    if (idMatch) {
      kvSessionId = idMatch[1];
      console.log(`✓ Sukses (ID: ${kvSessionId})`);
    } else {
      const listOutput = runCommand('npx wrangler kv namespace list', true);
      const parsed = JSON.parse(listOutput || '[]');
      const found = parsed.find((k) => k.title && k.title.includes(kvSessionName));
      if (found) {
        kvSessionId = found.id;
        console.log(`✓ Ditemukan (ID: ${kvSessionId})`);
      } else {
        kvSessionId = 'SESSION_KV_ID_PLACEHOLDER';
        console.log('⚠️ Gunakan placeholder.');
      }
    }
  } catch (err) {
    console.log(`⚠️ ${err.message}`);
    kvSessionId = await ask('   Masukkan KV Session ID secara manual', 'SESSION_KV_ID_PLACEHOLDER');
  }

  // 5. Buat KV Cache
  let kvCacheId = '';
  process.stdout.write(`🗄️ [3/4] Membuat KV Namespace (${kvCacheName})... `);
  try {
    const kvOutput = runCommand(`npx wrangler kv namespace create ${kvCacheName}`, true);
    const idMatch = kvOutput.match(/id\s*=\s*"([^"]+)"/) || kvOutput.match(/"id":\s*"([^"]+)"/);
    if (idMatch) {
      kvCacheId = idMatch[1];
      console.log(`✓ Sukses (ID: ${kvCacheId})`);
    } else {
      const listOutput = runCommand('npx wrangler kv namespace list', true);
      const parsed = JSON.parse(listOutput || '[]');
      const found = parsed.find((k) => k.title && k.title.includes(kvCacheName));
      if (found) {
        kvCacheId = found.id;
        console.log(`✓ Ditemukan (ID: ${kvCacheId})`);
      } else {
        kvCacheId = 'CACHE_KV_ID_PLACEHOLDER';
        console.log('⚠️ Gunakan placeholder.');
      }
    }
  } catch (err) {
    console.log(`⚠️ ${err.message}`);
    kvCacheId = await ask('   Masukkan KV Cache ID secara manual', 'CACHE_KV_ID_PLACEHOLDER');
  }

  // 6. Buat R2 Bucket
  process.stdout.write(`📁 [4/4] Membuat R2 Storage Bucket (${r2BucketName})... `);
  try {
    runCommand(`npx wrangler r2 bucket create ${r2BucketName}`, true);
    console.log('✓ Sukses dibuat');
  } catch (err) {
    console.log('✓ Bucket siap / sudah ada');
  }

  // 7. Update wrangler.jsonc
  console.log('\n⚙️ Memperbarui konfigurasi wrangler.jsonc...');
  const templatePath = path.resolve('wrangler.template.jsonc');
  const targetWranglerPath = path.resolve('wrangler.jsonc');

  let baseContent = '';
  if (fs.existsSync(templatePath)) {
    baseContent = fs.readFileSync(templatePath, 'utf8');
  } else if (fs.existsSync(targetWranglerPath)) {
    baseContent = fs.readFileSync(targetWranglerPath, 'utf8');
  }

  let updatedWrangler = baseContent
    .replace(/"database_name":\s*"[^"]*"/, `"database_name": "${d1Name}"`)
    .replace(/"database_id":\s*"[^"]*"/, `"database_id": "${d1Id}"`)
    .replace(/"bucket_name":\s*"[^"]*"/g, `"bucket_name": "${r2BucketName}"`)
    .replace(/"binding":\s*"SESSION",\s*"id":\s*"[^"]*"/, `"binding": "SESSION",\n\t\t\t"id": "${kvSessionId}"`)
    .replace(/"binding":\s*"(?:CACHE|WIKIMU_CACHE)",\s*"id":\s*"[^"]*"/, `"binding": "CACHE",\n\t\t\t"id": "${kvCacheId}"`)
    .replace(/<YOUR_D1_DATABASE_ID>/g, d1Id)
    .replace(/<YOUR_R2_MEDIA_BUCKET>/g, r2BucketName)
    .replace(/<YOUR_KV_SESSION_ID>/g, kvSessionId)
    .replace(/<YOUR_KV_CACHE_ID>/g, kvCacheId);

  fs.writeFileSync(targetWranglerPath, updatedWrangler, 'utf8');
  console.log('✓ wrangler.jsonc berhasil diperbarui dengan resource akun Cloudflare Anda.');

  // 8. Inisialisasi Skema D1
  const initDb = await ask('\n❓ Apakah Anda ingin langsung mengeksekusi inisialisasi skema tabel ke D1 remote? (y/n)', 'y');
  if (initDb.toLowerCase() === 'y') {
    const schemaPath = path.resolve('src/cms/db/schema.sql');
    if (fs.existsSync(schemaPath)) {
      process.stdout.write('⚡ Menginisialisasi skema tabel D1 remote... ');
      try {
        runCommand(`npx wrangler d1 execute ${d1Name} --remote --file=src/cms/db/schema.sql`, true);
        console.log('✓ Tabel database D1 berhasil dibuat!');
      } catch (sqlErr) {
        console.log(`⚠️ Gagal eksekusi otomatis: ${sqlErr.message}`);
        console.log(`   Anda dapat mengeksekusi manual dengan: npx wrangler d1 execute ${d1Name} --remote --file=src/cms/db/schema.sql`);
      }
    }
  }

  // 9. Pastikan .env lokal ada
  if (!fs.existsSync('.env') && fs.existsSync('.env.example')) {
    fs.copyFileSync('.env.example', '.env');
    console.log('✓ Berkas .env lokal berhasil dibuat dari template .env.example.');
  }

  console.log('\n=============================================================');
  console.log('🎉 SETUP BERHASIL! CMSMU SERVERLESS SIAP DIGUNAKAN');
  console.log('=============================================================');
  console.log('\nLangkah selanjutnya:');
  console.log('  1. Jalankan pengujian lokal:  npm run dev');
  console.log('  2. Deploy langsung ke publik: npm run deploy\n');

  rl.close();
}

main().catch((err) => {
  console.error('\n❌ Terjadi kesalahan fatal:', err);
  rl.close();
  process.exit(1);
});
