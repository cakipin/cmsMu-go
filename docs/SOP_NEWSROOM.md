# SOP KHUSUS PROYEK: MUHAMMADIYAH NEWSROOM & MEDIA AGGREGATOR
## Standard Operating Procedure, Clean Architecture & Modular Monorepo Guardrails

Dokumen ini adalah **SOP Khusus & Pedoman Mutlak** yang mengikat seluruh agen AI dan pengembang dalam membangun, memperluas, dan memelihara proyek **Muhammadiyah Newsroom & Media Aggregator**. Tujuannya adalah memastikan tidak ada kesalahan teknis, tidak ada deviasi dari cetak biru (*blueprint*), dan implementasi berjalan dengan standar Clean Code tertinggi (*zero technical debt*).

---

## 1. HIERARKI RUJUKAN CETAK BIRU (THE 4 SACRED BLUEPRINTS)

Sebelum menulis atau menyentuh kode satu baris pun, agen **WAJIB** membaca dan merujuk pada 4 dokumen panduan utama di folder `docs/`:

1. **`docs/PROBIS_AND_ARCHITECTURE.md` (Kedaulatan Proses Bisnis & Arsitektur):**
   - **Infrastruktur Wajib:** Cloudflare Native (Pages, Dedicated Worker, D1 SQLite, R2 Storage, Queues, KV, Cron Triggers).
   - **Aktor & RBAC:** Super Admin, Pemred (*Editor-in-Chief*), Editor/Redaktur, Jurnalis, Kontributor Wilayah/Daerah.
   - **State Machine Berita:** `draft` ➔ `curation_queue` ➔ `in_review` ➔ `scheduled` ➔ `published` ➔ `archived` / `rejected`. Dilarang membuat status ad-hoc di luar alur ini.

2. **`docs/DATABASE_SCHEMA.md` (Kedaulatan Basis Data Drizzle ORM):**
   - Seluruh interaksi database **100% WAJIB menggunakan Drizzle ORM** (`drizzle-orm/d1`).
   - Dilarang membuat tabel tanpa definisi relasi, indeks, dan timestamp standar.
   - Entitas utama: `users` (SSO Muhammadiyah ID), `media_sources` (feed RSS PWM/PDM/AUM), `categories`, `articles`, `curation_queue`, dan `media_assets` (Cloudflare R2 metadata).

3. **`docs/API_CONTRACT.md` (Kedaulatan Antarmuka Data/API):**
   - Seluruh endpoint API dibangun di atas **Hono Framework** pada rute `/api/v1/...` di dalam dedicated Cloudflare Worker.
   - Wajib menyertakan validasi payload request (Zod) dan standar respon JSON `{ success: boolean, data?: any, error?: { code, message } }`.

4. **`docs/UI_UX_GUIDELINES.md` (Kedaulatan Tasteskill & Desain Anti-Slop):**
   - Wajib menggunakan **Semantic CSS Design Tokens** (Slate/Emerald palette). Dilarang keras kode hex hardcoded.
   - **Dual-State Sidebar Rail:** Expanded 240–250px ➔ Collapsed 64–68px Icon-Only Rail dengan floating tooltip.
   - **Mobile-First & SafeArea:** Tombol aksi wajib aman dari tombol navigasi/gesture bar Android (`env(safe-area-inset-bottom, 24px)`).
   - **SEO Core Web Vitals:** LCP < 1.2s, CLS = 0 (aspect-ratio boxes), Auto TOC, dan Banner Atribusi Sumber Asli.

---

## 2. ARSITEKTUR MODULAR / MONOREPO CLEAN CODE

Proyek ini dibangun menggunakan struktur **Clean Monorepo Workspace (pnpm)** dengan pemisahan tugas (*Separation of Concerns*) yang tegas:

```
/Users/cakiphin/projects/newsroom/
├── docs/                        # Blueprint, API Contract, DB Schema & SOP
├── packages/
│   └── db/                      # [MODULE 1: DATA LAYER] - Single Source of Truth
│       ├── schema/              # Drizzle ORM Relational Models (users, articles, etc.)
│       ├── migrations/          # D1 SQL Migrations
│       ├── seeds/               # Initial Seeder (Kategori & Sumber Persyarikatan)
│       └── index.ts             # Export typed db client & models
├── services/
│   └── api/                     # [MODULE 2: BACKEND WORKER] - Dedicated CF Worker
│       ├── src/
│       │   ├── routes/          # Hono Endpoints (v1/articles, v1/auth, v1/curation)
│       │   ├── services/        # Business Logic & Validation (Zod)
│       │   ├── cron/            # Scheduled Ingestor (Tiap 15 Menit)
│       │   └── queues/          # Async Consumer (Image Sideloading ke R2)
│       └── wrangler.jsonc       # Worker Bindings (D1, R2, KV, Cron, Queues)
└── apps/
    └── web/                     # [MODULE 3: FRONTEND PORTAL] - Cloudflare Pages
        ├── src/
        │   ├── components/      # Presentational UI Components
        │   ├── layouts/         # Base Layouts & Reader View
        │   ├── pages/           # Astro SSR/SSG Routes (SEO Optimized)
        │   └── styles/          # Semantic CSS Variables & Tailwind Tokens
        └── astro.config.ts      # Cloudflare Pages Adapter
```

### Keuntungan Arsitektur Ini:
- **Mobile-First API:** Aplikasi mobile Flutter mengonsumsi `services/api` secara langsung dengan response time sub-15ms tanpa terbebani lifecycle web.
- **Zero Blast Radius:** Perubahan antarmuka web di `apps/web` tidak akan pernah mengganggu stabilitas atau membuat crash API mobile.
- **Shared Type-Safety:** `packages/db` menjadi sumber tunggal kebenaran skema TypeScript bagi Worker dan Web.

---

## 3. ATURAN CLEAN CODE: PEMISAHAN LOGIC, UI, CSS, & HTML

Untuk menjamin skalabilitas, kemudahan pengujian (*testability*), dan keterbacaan kode:

1. **Pemisahan Tanggung Jawab (Separation of Concerns):**
   - **Business Logic / State / Services:** DILARANG ditaruh langsung di dalam blok template UI. Wajib diisolasi ke dalam file service (`*.service.ts`), controller/route handler terpisah, atau custom utility functions.
   - **UI Presenter / Component:** Komponen visual (`.astro` atau `.tsx`) HANYA bertugas menerima data terstruktur via props dan merender antarmuka pengguna.
   - **Markup / Semantic HTML:** Wajib menggunakan tag semantik standar HTML5 (`<article>`, `<header>`, `<nav>`, `<main>`, `<time>`, `<aside>`).
   - **CSS / Styling:** Dilarang keras inline styling ad-hoc. Seluruh styling wajib menggunakan utility class Tailwind CSS v4 yang merujuk pada Semantic CSS Variables (`var(--bg-canvas)`, `var(--text-primary)`, `var(--accent-primary)`).

2. **BATASAN PANJANG FILE (< 1000 BARIS - HARD LIMIT):**
   - **Setiap file kode (`.ts`, `.tsx`, `.astro`, `.css`, `.sql`) DILARANG KERAS melebihi 1000 baris kode.**
   - Rekomendasi ukuran ideal adalah **150 - 400 baris per file**.
   - Jika suatu file mulai membengkak melewati **700 baris**, agen **WAJIB** melakukan modularisasi:
     - Memecah komponen besar menjadi sub-komponen partisi (contoh: `ArticleReader.astro` dipecah menjadi `ArticleHeader.astro`, `ArticleBody.astro`, `ArticleTOC.astro`, `ArticleShareBar.astro`).
     - Memecah file skema besar menjadi file-file entitas terpisah di dalam folder `src/db/schema/` (contoh: `users.ts`, `articles.ts`, `categories.ts`, `sources.ts`) dan di-export melalui `index.ts`.
     - Memecah route handler besar menjadi sub-routes modular.
   - **Dilarang membuat "God File" / "God Class"** yang menggabungkan banyak tanggung jawab dalam satu file.

---

## 4. ATURAN EKSEKUSI "CLEAN ADOPT cmsMu" (ANTI-CRUFT PROTOCOL)

1. **Yang Boleh Diadopsi:**
   - Konfigurasi inti Astro 7 + `@astrojs/cloudflare` + Tailwind v4 + Lucide React.
   - Sistem SEO (`@astrojs/sitemap`, `@astrojs/rss`, OG generator).
   - Tampilan dasar tema berita `newspaper-mu`.
2. **Yang DILARANG Diadopsi (Anti-Cruft):**
   - DILARANG menyalin file eksperimen usang cmsMu (`*.txt`, `*.log`, `debug.html`, `fix-puck.mjs`, `test-*.js`, `replace.py`).
   - DILARANG membebani pembaca artikel publik dengan visual page-builder (Puck). Halaman pembaca wajib zero-JS murni.
   - DILARANG menggunakan skema database flat lama cmsMu. Wajib menggunakan skema relasional `docs/DATABASE_SCHEMA.md`.

---

## 5. PROTOKOL TAHAPAN PENGERJAAN (5 PHASE ROADMAP)

1. **FASE 1: Restrukturisasi Modular/Monorepo Bersih:**
   - Setup `pnpm-workspace.yaml`.
   - Pisahkan struktur: `packages/db`, `services/api`, dan `apps/web`.
   - Verifikasi build `pnpm build` hingga **0 error**.
2. **FASE 2: Database Engine & Drizzle Migrations (`packages/db`):**
   - Implementasi skema tabel termodularisasi (< 400 baris per file skema) di `packages/db/schema/`.
   - Eksekusi migrasi Drizzle kit untuk D1.
   - Buat seed data kategori & media sumber persyarikatan.
3. **FASE 3: Dedicated API Worker (`services/api`):**
   - Setup Hono Worker dengan rute REST API resmi untuk Mobile Apps (Flutter) & Web.
   - Worker Ingestor RSS (Cron 15 menit) & antrean kurasi.
4. **FASE 4: Portal Pembaca Berita Publik (`apps/web`):**
   - Implementasi tema `newspaper-mu` termodularisasi: Auto TOC, Reading Progress, Canonical Badge, Mobile Bottom Nav & Android SafeArea.
   - Validasi Core Web Vitals & Skor SEO 100.
5. **FASE 5: Meja Redaksi & Curation CMS (`apps/web`):**
   - Dashboard kurasi split-view & Dual-State Rail Sidebar.
   - Live SEO Analyzer dan verifikasi publish/reject.

---

## 6. DAFTAR LARANGAN KERAS (PROHIBITED CODING ACTIONS)

1. **Anti-1000-Lines:** Dilarang menghasilkan atau membiarkan file kode mencapai >= 1000 baris.
2. **Anti-Logic-Leak:** Dilarang menulis business logic rumit / database query langsung di dalam template presentasi UI.
3. **Anti-Hex Hardcoding:** Dilarang menggunakan warna heksadesimal langsung di file UI (wajib Semantic CSS Tokens).
4. **Anti-Layout Shift:** Dilarang menyisipkan gambar tanpa rasio aspek kontainer yang pasti (`aspect-video` atau `aspect-[16/9]`).
5. **Anti-Direct Prod Deploy:** Dilarang men-deploy langsung ke domain production tanpa melalui staging dan persetujuan eksplisit User.
6. **Anti-Premature Claim:** Dilarang menyatakan tugas selesai sebelum pembuktian `build/typecheck` lolos 0 error.

---

*Disahkan sebagai pedoman mutlak arsitektur & clean code proyek Muhammadiyah Newsroom.*
