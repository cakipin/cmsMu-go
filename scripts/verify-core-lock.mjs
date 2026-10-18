#!/usr/bin/env node
/**
 * 🔒 scripts/verify-core-lock.mjs
 * Sistem Pengunci Otomatis Core Engine (Core Lock Integrity Guard)
 *
 * Memastikan tidak ada agen AI atau developer yang secara tidak sengaja
 * mengubah berkas Core Engine yang sudah dikunci stabil saat melakukan
 * perbaikan pada modul fitur (Konten, Users, Media, Menus, Themes, Plugins, Settings).
 *
 * Cara pakai:
 *   - Verifikasi kunci: `node scripts/verify-core-lock.mjs` (atau `pnpm run check:lock`)
 *   - Perbarui kunci (HANYA atas perintah eksplisit User): `node scripts/verify-core-lock.mjs --relock` (`pnpm run core:relock`)
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT_DIR = process.cwd();
const LOCK_FILE = path.join(ROOT_DIR, "core-lock.json");

// Daftar berkas Core Engine & Stable Editor yang dikunci mutlak (Stable Locked Core)
const LOCKED_CORE_FILES = [
  "apps/cms-api/src/index.ts",
  "apps/cms-api/src/core/hooks.ts",
  "apps/cms-api/src/middleware/auth.ts",
  "apps/cms-api/src/modules/ai/ai.router.ts",
  "apps/cms-api/src/modules/webhooks/webhooks.router.ts",
  "apps/cms-api/src/modules/admin/init.ts",
  "apps/cms-api/src/modules/admin/ui/view.ts",
  "apps/cms-api/src/modules/admin/ui/blocks/cms.logic.ts",
  "apps/cms-api/src/modules/admin/ui/blocks/logic/core.logic.ts",
  "apps/cms-api/src/modules/admin/ui/blocks/sidebar.ts",
  "apps/cms-api/src/modules/admin/ui/blocks/topbar.ts",
  "apps/cms-api/src/modules/admin/ui/blocks/custom-editor.ts",
  "apps/cms-api/src/modules/admin/ui/blocks/editor.page.ts",
  "apps/cms-api/src/modules/admin/ui/blocks/editor/editor-form.ts",
  "apps/cms-api/src/modules/admin/ui/blocks/editor/editor-autosave.ts",
  "apps/cms-api/src/modules/admin/ui/blocks/editor/custom-editor/custom-editor.cleaner.ts",
  "apps/cms-api/src/modules/admin/ui/blocks/editor/custom-editor/custom-editor.logic.ts",
  "apps/cms-api/src/modules/admin/ui/blocks/editor/custom-editor/custom-editor.styles.ts",
  "apps/cms-api/src/modules/admin/ui/blocks/editor/custom-editor/custom-editor.template.ts",
  "packages/db/src/schema.ts",
];

function computeSha256(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) return null;
  const content = fs.readFileSync(fullPath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

const isRelock = process.argv.includes("--relock");

if (isRelock) {
  const hashes = {};
  for (const relPath of LOCKED_CORE_FILES) {
    const hash = computeSha256(relPath);
    if (!hash) {
      console.error(`❌ [CORE LOCK] Berkas tidak ditemukan: ${relPath}`);
      process.exit(1);
    }
    hashes[relPath] = hash;
  }

  const payload = {
    description:
      "LOCKED CORE FILES - DILARANG KERAS mengubah berkas di daftar ini saat memperbaiki modul fitur (Konten, Users, Media, Menus, Themes, Plugins, Settings).",
    lockedAt: new Date().toISOString(),
    files: hashes,
  };

  fs.writeFileSync(LOCK_FILE, JSON.stringify(payload, null, 2) + "\n", "utf-8");
  console.log(
    `🔒 [CORE LOCK] Berhasil mengunci ${LOCKED_CORE_FILES.length} berkas Core Engine ke dalam core-lock.json.`
  );
  process.exit(0);
}

// Mode Verifikasi (Default)
if (!fs.existsSync(LOCK_FILE)) {
  console.error(
    "❌ [CORE LOCK] Berkas core-lock.json tidak ditemukan! Jalankan `pnpm run core:relock` untuk menginisialisasi."
  );
  process.exit(1);
}

const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, "utf-8"));
const lockedFiles = lockData.files || {};
const violations = [];

for (const [relPath, expectedHash] of Object.entries(lockedFiles)) {
  const actualHash = computeSha256(relPath);
  if (!actualHash) {
    violations.push({
      path: relPath,
      reason: "Berkas Core yang dikunci telah DIHAPUS!",
    });
  } else if (actualHash !== expectedHash) {
    violations.push({
      path: relPath,
      reason: "Isi berkas Core telah DIMODIFIKASI (SHA-256 mismatch)!",
    });
  }
}

if (violations.length > 0) {
  console.error(
    "\n🚨 ==================================================================="
  );
  console.error(
    "❌ [CORE LOCK VIOLATION] TERDETEKSI PERUBAHAN PADA BERKAS CORE STABIL!"
  );
  console.error(
    "🚨 ==================================================================="
  );
  for (const v of violations) {
    console.error(`   • ${v.path} -> ${v.reason}`);
  }
  console.error("\n🛡️  ATURAN ISOLASI MODUL:");
  console.error(
    "   Saat memperbaiki fitur (Konten, Users, Media, Menus, Themes, Plugins, Settings),"
  );
  console.error(
    "   agen DILARANG KERAS menyentuh berkas Core yang ada di `core-lock.json`!"
  );
  console.error(
    "   👉 Kembalikan berkas Core dengan `git checkout -- <file>`, dan lakukan perbaikan"
  );
  console.error(
    "      hanya di dalam modul fitur terkait (misal: `logic/post.logic.ts`, `logic/users.logic.ts`)."
  );
  console.error(
    "   👉 Jika perubahan Core memang diinstruksikan secara eksplisit oleh User,"
  );
  console.error("      jalankan `pnpm run core:relock`.\n");
  process.exit(1);
}

console.log(
  `✅ [CORE LOCK] Integritas ${Object.keys(lockedFiles).length} berkas Core Engine terverifikasi aman (100% utuh & terkunci).`
);
