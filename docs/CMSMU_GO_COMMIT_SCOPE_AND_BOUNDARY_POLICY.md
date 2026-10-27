# 🛡️ KEBIJAKAN BATAS LINGKUP & LARANGAN MUTLAK KOMIT KE cmsMu-go
## Standar Operasional Prosedur (SOP) Wajib Pra-Komit & Rilis Upstream
**Dokumen Referensi Wajib**: `docs/CMSMU_GO_COMMIT_SCOPE_AND_BOUNDARY_POLICY.md`  
**Otoritas**: Principal Software Architect & Scope Enforcer (`@infra-engineer`, `@system-analyst`, `@db-architect`)  
**Status**: **KONTRAK MUTLAK (HARD INVARIANT) — WAJIB DIBACA SEBELUM SETIAP KOMIT KE cmsMu-go**  
**Sasaran Repositori**: `cakipin/cmsMu-go` (`public-release/main`) vs `cakipin/cmsmu` (`origin/main` - Control Plane)

---

## ⚠️ PERINGATAN KERAS & DEKLARASI WAJIB (READ BEFORE COMMIT)

> ### 🚨 PERATURAN MUTLAK NOMOR 1:
> **REPOSITORI `cmsMu-go` ADALAH STANDALONE SERVERLESS CMS RUNTIME UNTUK PUBLIK, KOMUNITAS, DAN AMAL USAHA (AUM).**  
> **DILARANG KERAS (HARAM MUTLAK)** memasukkan, meng-commit, meng-merge, atau men-deploy fitur, file, skema database, endpoint API, atau dokumentasi yang berkaitan dengan **Control Plane Terpusat (`core cmsMu`)** maupun **BYOC (Bring Your Own Cloudflare) Multi-Tenant Deployer Engine** ke dalam repositori `cmsMu-go`!

Setiap pengembang atau agen AI (`@expert-developer`, `@infra-engineer`, `@db-architect`) **WAJIB** membaca dan memverifikasi dokumen ini sebelum menjalankan komit atau mengeksekusi script rilis `pnpm run release:upstream`.

---

## 1. PEMISAHAN PERAN DUA REPOSITORI (SEPARATION OF CONCERNS)

Sistem CMSMu terbagi secara tegas menjadi dua entitas repositori yang memiliki batas wilayah kerja berbeda:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. CONTROL PLANE REPOSITORY: cakipin/cmsmu (origin/main / cms.labmu.dev)               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Peran: Pusat Manajemen & Orkestrator Multi-Tenant (Pusat Kendali).                   │
│ • Fitur Eksklusif:                                                                     │
│   - BYOC Cloudflare Deployer Engine (Provisioning D1, R2, KV, Pages ke akun user)      │
│   - Tabel DB: user_projects, instance_activity_logs, instance_heartbeats               │
│   - Quota Enforcement (1x demo slot limit, token encryption)                          │
│   - Telemetri Pusat: POST /api/telemetry/*, GET /api/monitoring/*                      │
│   - Dashboard Monitoring Seluruh Situs Komunitas                                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                  DILARANG KERAS BOCOR
                                  (STRICT ZERO-LEAKAGE)
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. TENANT RUNTIME REPOSITORY: cakipin/cmsMu-go (public-release/main - Upstream Publik) │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Peran: Standalone Open-Source CMS Serverless yang di-clone dan di-install oleh user. │
│ • Fitur yang Boleh Masuk:                                                              │
│   - Core CMS: Posts, Pages, Media, Menus, Users, Settings, SEO, SSO Client, Themes   │
│   - Odoo-Style Modular Plugins: Analytics, Content, Starter, Theme Studio              │
│   - Zero-D1 Read Caching: Multi-Tier RAM + KV Deduplication + GraphQL Analytics Edge  │
│   - Setup Wizard Otomatis: npm run setup (Provisioning instance lokal milik user)      │
│ • FITUR CONTROL PLANE / BYOC: 100% DIHARAMKAN & DILARANG ADA!                          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DAFTAR LARANGAN MUTLAK KOMIT KE `cmsMu-go` (FORBIDDEN LIST)

Agen AI maupun pengembang **DILARANG KERAS** memasukkan komponen-komponen berikut ke dalam commit atau branch `public-release/main` (`cmsMu-go`):

### ⛔ 1. Berkas & Modul Kode yang Diharamkan:
- `apps/cms-api/src/plugins/byoc-deployer/**` (Seluruh folder BYOC deployer).
- `packages/db/src/schema-deployer.ts` (Definisi skema control plane).
- `migrations/*byoc*.sql` (Skrip migrasi SQL deployer).
- Script atau logic apapun yang mengimpor `schema-deployer` atau `byoc-deployer`.

### ⛔ 2. Tabel & Skema Database yang Diharamkan di `migration-runner.ts`:
Tabel-tabel berikut **TIDAK BOLEH** dibuat atau didefinisikan pada runtime `cmsMu-go`:
- ❌ `user_projects` (Tabel proyek milik user di control plane).
- ❌ `instance_activity_logs` (Tabel log aktivitas multi-tenant terpusat).
- ❌ `instance_heartbeats` (Tabel pemantauan uptime multi-tenant).
- ❌ Migrasi Drizzle: `2026_10_22_006_byoc_deployer_and_monitoring`.

### ⛔ 3. Endpoint API yang Diharamkan di `cmsMu-go`:
- ❌ `POST /api/deployer/verify-cf-token`
- ❌ `POST /api/deployer/provision`
- ❌ `GET /api/deployer/projects`
- ❌ `POST /api/telemetry/events`
- ❌ `POST /api/telemetry/heartbeat`
- ❌ `GET /api/monitoring/*`

### ⛔ 4. Dokumentasi yang Diharamkan di `cmsMu-go`:
- ❌ Dokumentasi endpoint deployer pada `docs/API_CONTRACT.md`.
- ❌ Dokumentasi skema control plane pada `docs/DATABASE_SCHEMA.md`.
- ❌ Rujukan arsitektur control plane internal di `docs/PROBIS_AND_ARCHITECTURE.md`.

### ⛔ 5. Penghapusan File Utama `wrangler.jsonc`:
- ❌ **DILARANG KERAS** menghapus `wrangler.jsonc` dari root repositori `cmsMu-go`.
- `cmsMu-go` **WAJIB** menyertakan file `wrangler.jsonc` bersih dengan binding placeholder standar (`00000000-0000-0000-0000-000000000000`) agar pengguna yang meng-clone repositori dapat langsung menjalankan `npm run setup`.

---

## 3. CHECKLIST VERIFIKASI WAJIB PRA-KOMIT (MANDATORY PRE-COMMIT GATE)

Sebelum menjalankan perintah git commit atau mendorong rilis upstream ke `public-release`:

| Langkah | Pemeriksaan Teknis | Syarat Kelulusan |
| :---: | :--- | :--- |
| **1** | **Scope Guard Check** | Jalankan `node scripts/verify-cmsmu-scope-boundaries.mjs` $\to$ **Wajib 0 Violation**. |
| **2** | **File Tree Check** | Pastikan tidak ada file `byoc-deployer` atau `schema-deployer` pada `git status --porcelain`. |
| **3** | **Migration Runner Check** | Pastikan `packages/db/src/migration-runner.ts` bebas dari tabel `user_projects` & `instance_*`. |
| **4** | **Documentation Audit** | Pastikan `docs/API_CONTRACT.md` dan `docs/DATABASE_SCHEMA.md` tidak memuat bagian deployer. |
| **5** | **Wrangler Config Check** | Pastikan `wrangler.jsonc` di root ada dan memuat konfigurasi D1, KV, dan R2 dengan aman. |
| **6** | **Core Lock Verification** | Jalankan `node scripts/verify-core-lock.mjs` $\to$ **Wajib 20/20 files intact**. |
| **7** | **Typecheck Monorepo** | Jalankan `pnpm run check:packages` $\to$ **Wajib 0 error**. |

---

## 4. PROSEDUR STANDAR RILIS UPSTREAM KE `cmsMu-go`

Untuk mendorong pembaruan fitur (seperti Zero-D1-Read Caching, Theme Editor, atau perbaikan bug) ke repositori publik `cakipin/cmsMu-go`:

```bash
# 1. Jalankan pemeriksaan batas wilayah kerja mutlak:
node scripts/verify-cmsmu-scope-boundaries.mjs

# 2. Periksa status staged files:
git diff --cached --name-only

# 3. Jalankan rilis terisolasi via task runner resmi:
pnpm run release:upstream
```

Jika terdeteksi satu saja berkas atau string Control Plane yang bocor ke staged files, proses rilis **WAJIB DIBATALKAN SEKETIKA (HARD EXIT 1)**.

---

## 5. KONSEKUENSI PELANGGARAN

1. Kebocoran fitur Control Plane ke `cmsMu-go` dapat mengekspos arsitektur internal `cms.labmu.dev` dan mengacaukan database SQLite pengguna publik yang meng-clone CMSMu.
2. Setiap PR atau commit yang melanggar batas lingkup ini akan otomatis ditolak dan di-*revert* seketika.

*Dokumen ini merupakan hukum arsitektur mutlak dan wajib ditaati tanpa pengecualian.*
