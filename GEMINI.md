---
trigger: always_on
description: Standar kerja global untuk agen AI (berlaku untuk semua project)
---

# SOP Aturan Kerja AI (AI Working Rules)

Berikut adalah Standar Operasional Prosedur (SOP) Aturan Kerja AI yang wajib ditaati oleh agen AI setiap kali berinteraksi atau melakukan tugas, baik untuk perbaikan *bug* maupun pembuatan proyek baru. Aturan ini dirancang untuk memastikan kualitas, akurasi, dan efisiensi pekerjaan.

---

# 5 ATURAN DISIPLIN KETAT (GUARDRAILS) - TINGKAT PRIORITAS TERTINGGI

## Guardrail 1: Aturan "Hard Stop" di Staging (Anti-Bypass Production)
- Agen **DILARANG KERAS** menjalankan deploy ke Production (`deploy:prod`, promosi track `stable`, Play Store) dalam langkah/turn yang sama dengan Staging.
- Setelah lolos smoke test dan di-deploy ke Staging, agen **WAJIB BERHENTI (HARD STOP)** dan menyerahkan URL Staging kepada User untuk diuji coba (QA).
- Promosi atau deploy ke Production **HANYA BOLEH DILAKUKAN JIKA USER SECARA EKSPLISIT MEMBERIKAN PERSETUJUAN/PERINTAH TERTULIS** setelah tahap QA Staging dinyatakan selesai dan disetujui.

## Guardrail 2: Aturan Action Plan Sebelum Sentuh Kode (SOP Poin 1)
- Sebelum menulis, mengubah baris kode, atau menginstal dependensi apa pun, agen **WAJIB** menyajikan analisis mendalam dan Rencana Tindakan (*Action Plan*) tertulis kepada User.
- **DILARANG KERAS** mengeksekusi perubahan file sebelum menerima persetujuan (*approval*) eksplisit dari User.

## Guardrail 3: Verifikasi End-to-End & Skenario Nyata (Bukan Sekadar Mock Build)
- Agen **DILARANG** menyimpulkan bahwa perbaikan telah selesai hanya karena lolos kompilasi (*build*) atau mock test.
- Agen **WAJIB** memvalidasi alur end-to-end (status HTTP, otentikasi token/sesi riil, integritas database, dan interaksi form) untuk memastikan sistem berjalan tanpa crash atau error di runtime.

## Guardrail 4: Fokus Ketat Pada Scope (No Unsolicited Changes & No Structural Refactor)
- Jika diminta memperbaiki bug, agen **HANYA** memperbaiki baris kode yang menjadi akar masalah (*root cause*).
- **DILARANG KERAS** melakukan refactoring, merapikan format, mengubah struktur arsitektur modular, atau menambah fitur di luar cakupan tugas tanpa permintaan eksplisit. *"If it ain't broke, don't fix it."*

## Guardrail 5: Transparansi Mutlak, Anti-Klaim Prematur & Log Kejujuran
- Agen **DILARANG** melaporkan status "selesai/berhasil" secara sepihak sebelum dilakukan pembuktian nyata.
- Jika terjadi galat (seperti HTTP 401, token expired, query error), agen **WAJIB** melaporkan data teknis apa adanya secara transparan dan menyajikan Action Plan perbaikannya, bukan menutupinya dengan klaim berhasil.

---

## 1. Analisis & Persetujuan Pra-Eksekusi (Tugas & Bug Fix)
* Sebelum menulis atau mengubah kode apa pun, agen **wajib** melakukan analisis mendalam dari *source code* dan memberikan rencana perbaikan (*Action Plan*) kepada *user*.
* **DILARANG KERAS** mengeksekusi perubahan (menulis ulang *file*) sebelum ada persetujuan (*approval*) eksplisit dari *user*.
* Jika terdapat log *error*, baca dan evaluasi log tersebut secara menyeluruh dari ujung ke ujung sebelum menyimpulkan tindakan.

## 2. Inisiasi Proyek Baru (WAJIB BLUEPRINT SEBELUM EKSEKUSI)
Saat diminta membuat proyek dari nol, agen **WAJIB** membuat dan mempresentasikan rancangan sistem (*blueprint*) terlebih dahulu. Rancangan ini harus mencakup:
* **Struktur Folder:** Arsitektur direktori yang modular (pemisahan *routes*, *controllers*, *services*, *models*, komponen UI, dll).
* **Proses Bisnis (Probis):** Deskripsi jelas tentang bagaimana aplikasi akan menyelesaikan masalah atau memproses transaksi.
* **Flow Sistem:** Alur navigasi pengguna dan pergerakan data dari *Client/Frontend* hingga ke *Database*.
* **Desain Database & ORM (Drizzle):** Pastikan skema relasi *database* sudah dirancang secara matang dan dipastikan benar-benar sesuai dengan kebutuhan bisnis serta alur proyek. Proyek **WAJIB menggunakan Drizzle ORM** untuk definisi skema (*schema definition*), migrasi, dan seluruh interaksi *query* ke *database*.
* **Kontrak API:** Daftar *endpoint* API utama beserta format *request/response payload*.
* **Strict Approval:** Agen **DILARANG** men-generate kode, membuat *file*, atau melakukan inisiasi *framework* (seperti `npm init`, *scaffolding*, dll) sebelum *user* memberikan persetujuan penuh terhadap *blueprint* di atas.

## 3. Anti-Halusinasi & Verifikasi Konteks (STRICT CONTEXT)
* **Dilarang berasumsi atau menebak.** Selalu gunakan fitur pencarian bawaan untuk memverifikasi nama variabel, struktur direktori, dan *dependency* sebelum memodifikasi kode.
* Jangan mengarang *library* atau API eksternal. Pastikan integrasi sesuai dengan daftar *dependency* yang ada di *workspace*.
* Pahami secara akurat pergerakan data dari sisi *Frontend* menuju ke *Backend* dan sebaliknya sebelum menyentuh logika *error*.

## 4. Fokus Ketat Pada Scope (NO UNSOLICITED IMPROVEMENTS & NO STRUCTURAL REFACTORING DURING FIXES)
* Jika *user* meminta perbaikan *bug*, perbaiki **HANYA** baris kode yang menjadi akar masalah.
* **TIDAK BOLEH** melakukan *refactoring*, merapikan format, atau menambah fitur di luar *scope* tugas kecuali diminta secara eksplisit. Ingat prinsip: *"If it ain't broke, don't fix it."*
* **DILARANG KERAS melakukan perombakan atau perubahan struktur modular saat melakukan perbaikan (bug fix/repair).**
* **DILARANG** menghapus atau mengubah kode stabil yang sudah berfungsi hanya karena alasan estetika.

## 5. Kepatuhan Pada Arsitektur & Logika Bisnis
* **Hormati Stack Teknologi yang Ada:** Jangan mengubah arsitektur *database*, ORM, metode *deployment*, atau bahasa pemrograman utama yang sudah ditetapkan (selalu patuhi penggunaan Drizzle ORM pada proyek yang menggunakannya).
* **Keamanan Data Transaksional:** Fitur krusial (pembayaran, persetujuan, dll) **TIDAK BOLEH** diandalkan pada *cache* lokal klien. Data wajib disinkronkan secara *real-time* ke *database*.
* Pahami siklus status dari entitas utama dalam proyek sebelum memodifikasi logika perpindahan status data.

## 6. Standar Penulisan Kode (Clean Architecture)
* Pertahankan pemisahan yang jelas antara logika (*business logic/state management*), antarmuka pengguna (UI/HTML/JSX), dan gaya (CSS/Styling).
* Jaga kode agar tetap modular. Jika menambahkan modul/komponen baru, buat agar *reusable*, dan jangan merombak arsitektur lama secara sepihak.

## 7. Prosedur Perbaikan, Staging/Dev & Shorebird OTA Pipeline (STAGING & QA FIRST)
* **Pemisahan Lingkungan Mutlak:** Selalu pisahkan antara lingkungan **Staging / Dev** (pengujian internal) dan **Production / Google Play Store** (publik luas).
* **Alur Perbaikan & Deployment Pipeline:**
  1. **Fix & Smoke Test:** Agen melakukan perbaikan kode di cabang *development/staging*, lalu menjalankan *Smoke Test* (`flutter analyze` & `flutter test`) hingga **0 error**.
  2. **Push ke Shorebird Staging Track:** Setelah lolos smoke test, patch/build di-push terlebih dahulu ke lingkungan pengujian Shorebird (misal: track `staging` / `beta` atau build testing lokal).
  3. **QA & Analisis:** Lakukan tahapan *Quality Assurance* (QA) dan evaluasi performa menyeluruh di perangkat staging untuk memastikan tidak ada *crash*, *memory leak*, atau regresi fitur lain.
  4. **Deploy ke Production / Google Play Store:** **HANYA** setelah tahap QA dan analisis di Staging dinyatakan lulus dan disetujui, pembaruan boleh dipromosikan ke track `stable` Shorebird atau di-deploy sebagai bundle resmi (`.aab`) ke Google Play Store.
* **HARAM** melakukan *hotfix* atau *patching* yang diarahkan langsung ke lingkungan *Production / Play Store* tanpa melalui pengujian dan QA di *Staging*.

## 8. Kewajiban Pengujian (Smoke Test & Build Validation)
* Agen **WAJIB** menjalankan perintah *build* atau *compile* setelah setiap perubahan kode untuk memastikan tidak ada *syntax error* atau *type error*.
* Lakukan *Smoke Test* mandiri untuk memastikan tidak ada sistem lain yang rusak (*regression*) akibat perubahan.
* Jangan laporkan tugas "selesai" sebelum aplikasi dipastikan bisa berjalan tanpa *crash* dan operasi *database* via Drizzle ORM tereksekusi dengan sempurna.

## 9. Standar UI Mobile: SafeArea Tombol Bawah & Pull-to-Refresh
* **Wajib SafeArea Tombol Bawah (Android System Insets):** Setiap penambahan tombol aksi, tombol submit, formulir, atau navigasi di bagian bawah layar **WAJIB** memperhitungkan tombol bawaan sistem Android (3-button navigation / gesture bar).
  - Gunakan `SafeArea(top: false, bottom: true)` atau berikan safe bottom padding (`MediaQuery.paddingOf(context).bottom + 24` atau minimum 32px pada akhir scrollable).
  - Tombol aksi utama **DILARANG KERAS** tertutup, terpotong, atau bertumpuk dengan navigasi sistem Android.
* **Wajib Pull-to-Refresh di Seluruh Halaman:** Setiap halaman/modul yang menampilkan data dinamis, daftar konten, kartu anggota, profil, histori, detail berita/video, atau formulir **WAJIB** membungkus area scroll dengan `RefreshIndicator` (`color: Color(0xFF177D99)` / primary theme) dan menyertakan `physics: const AlwaysScrollableScrollPhysics()` agar pengguna dapat menarik layar ke bawah (*pull/swipe-to-refresh*) untuk memperbarui data kapan saja.

## 10. Pondasi Pembuatan Sistem Baru (Probis First & Drizzle Scaffolding)
* **Urutan Eksekusi Pembuatan Sistem Baru:**
  1. **Proses Bisnis (Probis):** Tentukan aktor (roles), problem statement, use-cases, dan batasan aturan bisnis (*invariants*).
  2. **State Machine & Lifecycle:** Petakan siklus perpindahan status seluruh entitas utama (contoh: draft ➔ pending ➔ active ➔ suspended / deleted).
  3. **Desain Database & Integritas Relasi (Drizzle ORM):** Rancang tabel, relasi, foreign keys, default values, dan indexing. Seluruh interaksi database **WAJIB menggunakan Drizzle ORM**.
  4. **Kontrak API (API Contract):** Definisikan endpoint, validasi Zod schema, payload request/response, dan HTTP status code sebelum implementasi controller.
  5. **Clean Architecture Implementation:** Pisahkan modularitas antara routing, middleware, controllers/services, model ORM, dan UI presenter.
* **Blueprint Approval:** Blueprint komprehensif wajib dipresentasikan dan disetujui User sebelum file proyek pertama digenerate.

## 11. Standar UI/UX Ciri Khas User & Pondasi Tasteskill (Anti-Slop UI & Token Architecture)
* **Collapsible Sidebar (Dual-State Rail):**
  - Sidebar aplikasi desktop/web **WAJIB** memiliki fitur Show/Hide (Toggle).
  - **Saat Terbuka (Expanded, ~240-260px):** Menampilkan Brand Logo, label teks navigasi lengkap, badge/counter, dan user profile strip di bagian bawah.
  - **Saat Tertutup (Collapsed / Hide, ~64-72px):** Sidebar **TIDAK MENGHILANG TOTAL**, melainkan berubah menjadi **Icon-Only Rail** yang rapi, simetris, berpusat (*center aligned*), dan dilengkapi dengan *floating tooltip* saat icon di-hover.
  - Transisi perubahan ukuran wajib halus menggunakan animasi CSS: `transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1)`.
* **Pondasi Desain Tasteskill (Anti-Slop Design):**
  - **Kontras Teks & Keterbacaan Mutlak (WCAG AA):** Dilarang keras menghasilkan teks yang pudar, abu-abu di atas putih, atau teks gelap di atas latar gelap. Rasio kontras wajib minimal 4.5:1 untuk body text dan 3:1 untuk header.
  - **Arsitektur Token Mode Siang & Malam (Flawless Dark/Light Mode):**
    - **DILARANG KERAS** menggunakan hardcoded hex colors (seperti `#ffffff`, `#000000`, `#1f2937`) di dalam file komponen UI.
    - Seluruh komponen UI **WAJIB** merujuk pada Semantic CSS Variables / Design Tokens, minimal:
      - `--bg-canvas`: Latar belakang halaman (Light: `#f8fafc`, Dark: `#090d16`)
      - `--bg-surface`: Latar belakang card/panel/sidebar (Light: `#ffffff`, Dark: `#111827`)
      - `--bg-surface-elevated`: Latar belakang modal/dropdown/popover (Light: `#ffffff`, Dark: `#1f2937`)
      - `--border-subtle`: Garis pemisah halus (Light: `#e2e8f0`, Dark: `#1e293b`)
      - `--border-strong`: Garis pemisah tegas/fokus (Light: `#cbd5e1`, Dark: `#334155`)
      - `--text-primary`: Teks judul & label utama (Light: `#0f172a`, Dark: `#f8fafc`)
      - `--text-secondary`: Teks deskripsi/bantuan (Light: `#475569`, Dark: `#94a3b8`)
      - `--text-muted`: Teks placeholder/timestamp (Light: `#64748b`, Dark: `#64748b`)
      - `--accent-primary`: Warna aksen utama (Primary Brand)
      - `--accent-hover`: Warna aksen saat hover/active
    - Pergantian mode siang dan malam harus mulus, konsisten, dan tidak merusak hierarki visual.
  - **Mikro-Interaksi & Visual Polish:**
    - Tombol memiliki efek transisi halus, state `active:scale-[0.98]`, dan `focus-visible:ring-2`.
    - Hindari ornamen murahan ("AI slop") seperti gradient ungu acak, dark mesh berlebihan, atau kartu tanpa border pemisah.

## 12. Kewajiban Dokumentasi Proyek di Folder `docs/`
* Setiap pembuatan sistem baru atau fitur platform utama **WAJIB** menyertakan dokumentasi teknis yang terstruktur di dalam folder `docs/` pada direktori root proyek:
  - `docs/PROBIS_AND_ARCHITECTURE.md`: Proses bisnis, use cases, aktor, dan diagram arsitektur.
  - `docs/DATABASE_SCHEMA.md`: Skema tabel, tipe data, relasi foreign key, dan migrasi Drizzle.
  - `docs/API_CONTRACT.md`: Endpoint URL, header, payload request, dan contoh response JSON.
  - `docs/UI_UX_GUIDELINES.md`: Desain token, tema, palet warna, dan aturan sidebar icon-only rail.
  - `docs/SOP_NEWSROOM.md`: SOP khusus dan guardrails teknis proyek Newsroom Muhammadiyah.

## 13. SOP Khusus Muhammadiyah Newsroom & Media Aggregator (Clean Modular Architecture)
* **Kepatuhan Cetak Biru (Blueprint Priority):** Seluruh kode, skema database, dan rute API wajib merujuk secara presisi ke dokumen `docs/PROBIS_AND_ARCHITECTURE.md`, `docs/DATABASE_SCHEMA.md`, `docs/API_CONTRACT.md`, dan `docs/SOP_NEWSROOM.md`.
* **Arsitektur Modular / Monorepo Bersih:**
  - `packages/db`: Drizzle ORM Schema & Migrations untuk Cloudflare D1 (Single Source of Truth, di-share via pnpm workspace).
  - `services/api`: Dedicated Cloudflare Worker (Hono REST API resmi untuk Mobile Apps Flutter & Web, Cron Ingestor RSS 15 Menit, Queues Image Worker).
  - `apps/web`: Cloudflare Pages (Astro 7 SSR/SSG, Newspaper-Mu theme, Zero-JS reader, Meja Redaksi CMS).
* **Pemisahan Logic, UI, CSS, & HTML (Clean Architecture):**
  - **Business Logic / State / Services:** Wajib diisolasi ke dalam service / controller / helper terpisah. DILARANG mencampur query database atau business logic rumit di dalam template UI.
  - **UI Components:** Komponen murni presentational yang menerima props bersih.
  - **HTML Markup:** Semantik HTML5 murni (`<article>`, `<header>`, `<nav>`, `<main>`, `<time>`).
  - **CSS / Styling:** Menggunakan Semantic CSS Design Tokens dan utility classes Tailwind v4. Dilarang inline styling ad-hoc atau hardcoded hex colors.
* **Batas Maksimal Baris Kode (< 1000 Baris Per File - HARD LIMIT):**
  - Setiap file kode (`.ts`, `.tsx`, `.astro`, `.css`, `.sql`) **DILARANG KERAS mencapai >= 1000 baris**.
  - Ukuran ideal: **150 - 400 baris per file**.
  - Jika file mendekati 700 baris, agen **WAJIB** memecahnya menjadi sub-komponen, helper functions, atau modul partisi terpisah. DILARANG membuat file monolitik ("God File").
* **Protokol Anti-Cruft cmsMu:**
  - DILARANG menyalin file eksperimen usang cmsMu (`*.txt`, `*.log`, `debug.html`, `fix-puck.mjs`, `test-*.js`).
  - Halaman pembaca berita publik wajib zero-JS murni, bukan page builder visual berat (Puck).
* **Kepatuhan Mobile & SafeArea:**
  - Wajib memperhitungkan Android system insets (`env(safe-area-inset-bottom, 24px)`) pada seluruh tombol navigasi bawah / floating action bar.



