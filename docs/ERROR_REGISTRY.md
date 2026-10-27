# 🛑 ERROR REGISTRY & PELAJARAN SISTEMIK (SHARED MEMORY)
## Daftar Kesalahan Fatal & Pantangan Mutlak Software Engineering CMSMu

Dokumen ini adalah **Shared Memory Permanen** yang mencatat kesalahan fatal di masa lalu agar tidak pernah diulangi oleh agen atau pengembang mana pun di masa depan.
Setiap agen **WAJIB MEMATUHI** seluruh pantangan di bawah ini sebagai **Hard Constraint** mutlak.

---

## 🚨 KESALAHAN FATAL #1: KEBOCORAN KUOTA DATABASE SERVERLESS (PELAJARAN SUARA 'AISYIYAH)

### Kronologi Masalah:
* Pada proyek Suara 'Aisyiyah, tagihan database serverless membengkak drastis akibat pembakaran **42 Miliar baris data dibaca** dan **86 Juta milidetik CPU Workers**.
* **Akar Masalah:** Developer membawa kebiasaan koding VPS tradisional ke lingkungan serverless:
  1. Menulis kueri wildcard `LIKE '%...%'` pada 14.259 artikel (memaksa SQLite melakukan *Full Table Scan* pada setiap perayapan Googlebot).
  2. Menghitung `COUNT(*)` dan `SUM(views)` secara live di setiap halaman dibuka.
  3. Memasang driver TCP MySQL di Cloudflare Workers yang memicu handshake TLS/SSL berulang-ulang di V8 Isolate.

### 🛡️ PANTANGAN KERAMAT ARSITEKTUR ZERO-OVERQUOTA (WAJIB DIPATUHI):
1. **HARAM MUTLAK `LIKE '%...%'` PADA TABEL KONTEN:**
   * Dilarang mencari tag/artikel dengan wildcard linear. Gunakan Lookahead atau Exact Composite Index.
2. **HARAM MUTLAK LIVE `COUNT(*)` & `SUM(views)` DI ROUTE PUBLIK:**
   * Dilarang menghitung total halaman untuk bot. Paginasi wajib menggunakan **Lookahead Pagination (`LIMIT N+1`)**.
3. **HARAM MUTLAK AKSES D1 PUBLIK TANPA PELINDUNG CLOUDFLARE KV:**
   * Seluruh rute publik (Home, Detail Post, Kategori, Tag, Search) wajib dilindungi L1 RAM Cache (<0.1ms) dan L2 Cloudflare KV (~15ms). D1 hanya boleh disentuh saat Cache Miss (<1%).
4. **HARAM MUTLAK MEMBUKA DRIVER TCP DATABASE DI SERVERLESS WORKERS:**
   * Seluruh interaksi database wajib menggunakan native Cloudflare D1 HTTP Binding (`env.DB`).
5. **DOKUMEN RUJUKAN RESMI:**
   * Wajib membaca dan menerapkan panduan di [`docs/ZERO_OVERQUOTA_ROADMAP_AND_DB_ARCHITECTURE.md`](file:///Users/cakiphin/projects/cmsMu/core%20cmsMu/docs/ZERO_OVERQUOTA_ROADMAP_AND_DB_ARCHITECTURE.md).

---

## 🚨 KESALAHAN FATAL #2: KEBOCORAN KODE CONTROL PLANE KE REPOSITORI PUBLIK (CMSMU-GO)

### Kronologi Masalah:
* Modul Control Plane (BYOC Deployer, skema deployment, kuota, monitoring) sempat bocor ke repositori publik `cmsMu-go`.
* **Akar Masalah:** Kurangnya pemeriksaan batas wilayah sebelum melakukan commit dan push.

### 🛡️ PANTANGAN KERAMAT:
1. Repositori publik `cmsMu-go` **HARAM MEMUAT** modul BYOC Deployer, deployer schema, dan endpoint deployer.
2. Sebelum commit ke `cmsMu-go`, wajib menjalankan `node scripts/verify-cmsmu-scope-boundaries.mjs`.
3. Rujukan resmi: [`docs/CMSMU_GO_COMMIT_SCOPE_AND_BOUNDARY_POLICY.md`](file:///Users/cakiphin/projects/cmsMu/core%20cmsMu/docs/CMSMU_GO_COMMIT_SCOPE_AND_BOUNDARY_POLICY.md).

---

## 🚨 KESALAHAN FATAL #3: BYPASS LINGKUNGAN STAGING KE PRODUCTION

### Kronologi Masalah:
* Agen tergoda mempromosikan perubahan langsung ke Production tanpa pembuktian di Staging.

### 🛡️ PANTANGAN KERAMAT (GUARDRAIL 1):
1. Dilarang keras deploy ke Production dalam turn/langkah yang sama dengan Staging.
2. Wajib **HARD STOP** di Staging dan menunggu persetujuan tertulis eksplisit dari User.

---

## 🚨 KESALAHAN FATAL #4: NEGOSIASI KRIPTO TLS BERULANG PADA CLOUDFLARE HYPERDRIVE (ERR-011)

### Kronologi Masalah:
* Driver MySQL (`mysql2`) diinisialisasi tanpa opsi `ssl: false`. Di runtime Workers V8 Isolate, client melakukan negosiasi TLS (RSA/ECDHE asymmetric crypto handshake) pada setiap request baru, membakar **86,2 Juta ms CPU Workers**.
* **Akar Masalah:** Tidak memahami bahwa Cloudflare Hyperdrive sudah mengelola enkripsi TLS persisten ke database origin di layer jaringannya.

### 🛡️ PANTANGAN KERAMAT:
1. Seluruh inisialisasi koneksi MySQL ke Cloudflare Hyperdrive **WAJIB MENYERTAKAN `ssl: false`**.
2. Gunakan selalu factory resmi: `createHyperdriveConfig(c.env.HYPERDRIVE)` dari `@cmsmu/db`.
3. Verifikasi kepatuhan via: `pnpm run check:dual-db`.

---

## 🚨 KESALAHAN FATAL #5: KEBOCORAN DUAL-WRITE MUTASI TELEMETRI KE CLOUDFLARE D1 (ERR-012)

### Kronologi Masalah:
* Mutasi penambahan counter view artikel (`SET views = views + 1`), rekap `daily_stats`, atau log `visitors` secara keliru di-dual-write ke Cloudflare D1.
* Pada trafik tinggi (ratusan ribu pengunjung), hal ini seketika menghabiskan batas kuota tulis harian D1 (100.000 writes/hari) dan memicu kegagalan sistemik *table lock contention* (`SQLITE_BUSY`).

### 🛡️ PANTANGAN KERAMAT:
1. Cloudflare D1 **DIHARAMKAN SECARA MUTLAK** menerima mutasi penulisan telemetri (`views + 1`, `daily_stats`, `visitors`).
2. Mutasi telemetri hanya boleh ditulis ke MySQL eksternal atau ditampung di RAM/KV. Jika MySQL down, mutasi telemetri wajib di-drop secara aman (`rows_written: 0`) tanpa pernah menyentuh D1!
3. Gunakan filter pelindung bawaan: `isTelemetryMutation(sqlQuery)` dari `@cmsmu/db`.

