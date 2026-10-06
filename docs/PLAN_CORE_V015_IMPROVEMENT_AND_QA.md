# 📑 SPESIFIKASI ANALISIS SISTEM & RENCANA QA: PEMBARUAN CORE CMSMU v0.1.5
**Dokumen Referensi Resmi Rekayasa Perangkat Lunak & Jaminan Kualitas (QA)**
*Disusun oleh: Lead System Analyst & QA Engineering Expert*
*Target Repositori: `/Users/cakiphin/projects/cmsMu/core cmsMu`*
*Status Repositori Client: `suaraaisyiyah.id` (STRICT ZERO-TOUCH / READ-ONLY BENCHMARK)*

---

## 1. 📌 EXECUTIVE SUMMARY & PROBLEM STATEMENT

### 1.1. Latar Belakang
Core cmsMu saat ini berada pada versi `v0.1.4`. Meskipun modul OTA sudah mendukung inspeksi manifest, pengujian beban riil pada instansi produksi Suara 'Aisyiyah (13.766 artikel, 54MB basis data) mengungkap beberapa kerentanan arsitektural kritis pada Core Engine saat ini:
1. **Memory Exhaustion / Browser Freeze:** Query `GET /api/posts` me-load kolom teks `body` secara utuh untuk seluruh baris, mengakibatkan transfer payload JSON puluhan MB yang membekukan (*crash*) memori browser admin.
2. **Fragile Storage Adapter:** Core hanya mendukung *native binding* Cloudflare Workers (`env.MEDIA_BUCKET`). Jika binding tidak tersedia di environment tertentu atau menggunakan kredensial S3 REST, modul media crash seketika.
3. **Broken Legacy Media Links (HTTP 404):** Tautan media lama hasil impor WordPress (`/uploads/*` dan `/wp-content/uploads/*`) belum ditangani oleh core router.
4. **Monolithic Public Routing:** Berkas `public.router.ts` merupakan monolit raksasa yang menggabungkan seluruh logika homepage, arsip, profil penulis, sitemap, dan RSS.
5. **Technical Debt (Dead Files):** Terdapat 94 berkas duplikat (`*_copy.ts`, `.old`, `-stable`) dan tema-tema lama tidak terawat yang mengotori direktori `src/cms/`.

### 1.2. Tujuan Rekayasa (Engineering Goal)
Mempromosikan generic core engine unggul dari Suara 'Aisyiyah ke dalam **Core cmsMu v0.1.5** secara mandiri tanpa menyentuh satu pun berkas di `suaraaisyiyah.id`. Core cmsMu v0.1.5 akan berstatus *agnostik, modular, berkinerja tinggi, dan production-ready*.

---

## 2. 🛡️ ATURAN DISIPLIN KERJA & BATASAN WILAYAH (STRICT BOUNDARY)

| Entitas | Perlakuan & Aturan |
|---|---|
| **`suaraaisyiyah.id`** | **STRICT ZERO-TOUCH (READ-ONLY REFERENCE).** Dilarang keras memodifikasi, membuat, menghapus, atau mengeksekusi git commit/push pada repositori ini. |
| **`core cmsMu`** | **TARGET IMPLEMENTASI TUNGGAL.** Seluruh perubahan kode, refactoring, dan pengujian dilakukan 100% di dalam direktori ini. |
| **Logika Bisnis Khusus SA** | **DILARANG MASUK KE CORE.** Rute `/agen`, `/konsultasi`, `/majalah`, dan tema visual SA tetap berada di package eksternal/plugin dinamis. |

---

## 3. 🏗️ RANCANGAN ARSITEKTUR & PERUBAHAN SISTEM (SYSTEM ANALYST PERSPECTIVE)

### 3.1. Arsitektur Post Engine: On-Demand Fetching
```
[Client / Admin SPA]
       │
       ├─── 1. Buka Menu Artikel ───> GET /api/posts (Lightweight Query)
       │                              - Hanya ambil: id, title, slug, category, status, createdAt
       │                              - OMIT: posts.body (Ukuran respon turun dari 54MB ke ~50KB)
       │
       └─── 2. Klik Tombol Edit ────> GET /api/posts/:id (On-Demand Fetching)
                                      - Ambil 1 artikel lengkap beserta posts.body
                                      - Editor terbuka instan tanpa memory leak
```

### 3.2. Arsitektur Storage: Multi-Adapter & Legacy Proxy
```
[Request Upload / Akses Media]
              │
              ▼
    [src/cms/storage/r2-adapter.ts]
              │
    ┌─────────┴─────────┐
    ▼                   ▼
(Worker Native)   (S3 REST API Fallback)
c.env.MEDIA_BUCKET  aws4fetch + R2_ACCOUNT_ID + Secret Keys
              │
              ▼
[src/cms/modules/public/uploads.router.ts]
- Proxy rute /uploads/* dan /wp-content/uploads/*
- Streaming byte-range & Content-Type detection
```

### 3.3. Arsitektur Public Routing: Decoupled Sub-Routers
```
               [publicRouter.get('/*')]
                          │
     ┌─────────────┬──────┴──────┬─────────────┐
     ▼             ▼             ▼             ▼
[seo.router] [profile.router] [helpers.ts] [public.logic]
sitemap.xml   /author/:user   getGlobalData  Category &
robots.txt                    Format post    Single post
feed.xml
```

---

## 4. 📑 DAFTAR MATRIKS BERKAS SCOPE (FILE SCOPE DECLARATION)

Semua path relatif terhadap `/Users/cakiphin/projects/cmsMu/core cmsMu`:

| No | File Path | Aksi | Deskripsi Perubahan |
|---|---|---|---|
| 1 | `src/cms/modules/posts/posts.router.ts` | **Modify** | Exclude `body` pada list query; tambah endpoint `/taxonomy/*` |
| 2 | `src/cms/modules/posts/posts.service.ts` | **Modify** | Helper YouTube thumbnail & auto-tags |
| 3 | `src/cms/storage/r2-adapter.ts` | **Create** | Multi-adapter R2 (Native binding + S3 REST fallback) |
| 4 | `src/cms/modules/public/uploads.router.ts` | **Create** | Proxy streaming `/uploads/*` & `/wp-content/uploads/*` |
| 5 | `src/cms/modules/media/media.router.ts` | **Modify** | Streaming endpoint `/file/*` dengan range header |
| 6 | `src/cms/modules/media/media.service.ts` | **Modify** | Sinkronisasi logika adapter media |
| 7 | `src/cms/modules/public/helpers.ts` | **Create** | Helper `getGlobalData` & formatter post |
| 8 | `src/cms/modules/public/public.logic.ts` | **Create** | Logika rendering kategori & single post |
| 9 | `src/cms/modules/public/routes/seo.router.ts` | **Create** | Handler sitemap.xml, robots.txt, feed.xml |
| 10 | `src/cms/modules/public/routes/profile.router.ts` | **Create** | Handler arsip tulisan per penulis |
| 11 | `src/cms/modules/public/public.router.ts` | **Modify** | Mount sub-router modular publik |
| 12 | `src/cms/modules/admin/ui/blocks/topbar.ts` | **Modify** | Pasang tombol Purge Edge Cache |
| 13 | `src/cms/modules/settings/settings.router.ts` | **Modify** | Endpoint API `POST /api/settings/purge-cache` |
| 14 | `src/cms/modules/users/sso.service.ts` | **Create** | OAuth2 Muhammadiyah ID SSO Service |
| 15 | `src/cms/modules/users/auth.helper.ts` | **Create** | SHA-256 password hashing & token stateless |
| 16 | `src/cms/modules/users/users.router.ts` | **Modify** | Registrasi & SSO handler |
| 17 | `src/cms/index.ts` | **Modify** | Pastikan routing murni generik + mount uploads proxy |
| 18 | `src/cms/**/_copy.ts` & `*.ts-stable` | **Delete** | Pembersihan file duplikat sampah peninggalan masa lalu |
| 19 | `src/cms/themes/{hestia,wikimu,labmu-*}` | **Delete** | Pembersihan folder tema usang |
| 20 | `package.json` | **Modify** | Bump version ke `"version": "0.1.5"` |
| 21 | `ota-manifest.json` | **Modify** | Bump version ke `"version": "0.1.5"` |
| 22 | `src/cms/addons/ota/services/ota.service.ts` | **Modify** | Update `CORE_VERSION = '0.1.5'` |

---

## 5. 🧪 QUALITY ASSURANCE (QA) TEST PLAN & ACCEPTANCE CRITERIA

### 5.1. Skenario Pengujian Fungsional (Functional Test Cases)

#### Skenario QA-01: Verifikasi On-Demand Post Fetching
* **Tujuan:** Memastikan query list artikel ringan dan tidak membocorkan data `body`.
* **Given:** Basis data memuat ribuan artikel berstatus publish/draft.
* **When:** Client mengirimkan permintaan `GET /api/posts?page=1&limit=20`.
* **Then:** 
  1. HTTP Status Response adalah `200 OK`.
  2. Properti `body` **TIDAK ADA** pada array objek data postingan.
  3. Properti `id`, `title`, `slug`, `category`, `status`, dan `createdAt` tersedia lengkap.
  4. Ukuran payload JSON < 30 Kilobyte.
* **When:** Client mengirimkan permintaan `GET /api/posts/:id`.
* **Then:**
  1. HTTP Status Response adalah `200 OK`.
  2. Properti `body` **TERSEDIA LENGKAP** dengan teks artikel utuh.

#### Skenario QA-02: Verifikasi Media Proxy Warisan WordPress
* **Tujuan:** Memastikan link gambar lama `/uploads/*` tidak 404.
* **Given:** Berkas media `test-banner.jpg` tersimpan di bucket R2.
* **When:** Browser mengakses URL `/uploads/test-banner.jpg` dan `/wp-content/uploads/test-banner.jpg`.
* **Then:**
  1. HTTP Status Response adalah `200 OK`.
  2. Header `Content-Type` sesuai (`image/jpeg`).
  3. Gambar ter-render sempurna tanpa redirect loop.

#### Skenario QA-03: Verifikasi Storage Fallback (Multi-Adapter R2)
* **Tujuan:** Memastikan sistem tetap dapat melayani media saat binding native `env.MEDIA_BUCKET` tidak disuntikkan.
* **Given:** Environment hanya menyediakan variabel S3 REST (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`).
* **When:** User mengunggah media via `POST /api/media`.
* **Then:**
  1. `r2-adapter.ts` otomatis beralih ke S3 REST API via `aws4fetch`.
  2. Berkas berhasil terunggah dan data tersimpan di tabel `media_meta`.

#### Skenario QA-04: Verifikasi Purge Edge Cache
* **Tujuan:** Memvalidasi pembersihan cache dari Admin Dashboard.
* **Given:** Admin telah login dan berada di Dashboard SPA.
* **When:** Admin menekan tombol **"Purge Cache"** di Topbar Navbar.
* **Then:**
  1. Muncul indikator pemrosesan (loading state).
  2. API `POST /api/settings/purge-cache` mengembalikan `{ success: true }`.
  3. Muncul notifikasi Toast hijau: *"Edge Cache berhasil dibersihkan!"*.

#### Skenario QA-05: Verifikasi Zero-Touch pada Proyek Client
* **Tujuan:** Memastikan integritas repositori `suaraaisyiyah.id` tidak tercemar.
* **Given:** Seluruh proses implementasi pada `core cmsMu` telah selesai.
* **When:** QA menjalankan perintah `git -C "/Users/cakiphin/projects/cmsMu/suaraaisyiyah.id" status`.
* **Then:**
  1. Status git menyatakan `nothing to commit, working tree clean`.
  2. Commit hash dan riwayat branch di `suaraaisyiyah.id` persis sama seperti sebelum perbaikan.

---

## 6. 🛑 QUALITY GATES & DEFINITION OF DONE (DoD)

Pembaruan Core cmsMu v0.1.5 hanya dinyatakan **SELESAI & LULUS QA** jika memenuhi 5 gerbang kualitas berikut:
- [ ] **Gate 1: Zero Compilation Error:** Perintah `npm run build` di `core cmsMu` menghasilkan status **0 Error, 0 Warning Kritis**.
- [ ] **Gate 2: Zero Touch Integrity:** Folder `suaraaisyiyah.id` terbukti bersih 100% tanpa modifikasi berkas.
- [ ] **Gate 3: Performance Verified:** Waktu respon `GET /api/posts` < 150ms dan payload bebas dari kolom `body`.
- [ ] **Gate 4: Agnostic Core:** Tidak ada rute `/agen`, `/konsultasi`, atau tema khusus SA yang tertinggal di `src/cms/index.ts`.
- [ ] **Gate 5: OTA Manifest Consistency:** Versi `0.1.5` tercatat sinkron di `package.json`, `ota-manifest.json`, dan `ota.service.ts`.

---
*Dokumen ini sah sebagai panduan kerja eksekusi teknis dan lembar validasi QA untuk implementasi Core cmsMu v0.1.5.*
