# 🚀 ROADMAP STRATEGIS: TRANSFORMASI CORE CMSMU
## Dari CMS Portal Berita Menjadi Modern Serverless Edge Application Framework
**Arsitektur Monorepo Multi-App Berbasis Cloudflare Ecosystem & TypeScript**

---

## 📌 Identitas Dokumen
* **Produk**: Core CMSMu (Application Framework & Headless Engine)
* **Penyusun**: Engineering & Product Lead (Cak Ipin & Tim LabMu)
* **Status**: Dokumen Rencana Strategis & Roadmap Arsitektur Resmi (v2.0)
* **Target Stack**: Cloudflare Workers & Pages, Hono, Drizzle ORM, D1 SQLite, R2 Storage, Turborepo
* **Tanggal**: September 2026

---

## 1. Ringkasan Eksekutif & Visi Transformasi

### 1.1 Visi Besar: "PocketBase / Laravel" Versi Serverless Edge
CMSMu berawal sebagai engine portal berita (*Newsroom & Suara 'Aisyiyah*). Namun secara fundamental, fondasi teknologinya telah mengadopsi stack paling efisien dan modern saat ini:
* **Komputasi Global Edge**: Hono Web Framework berjalan di ratusan data center Cloudflare dengan latensi sub-30ms dan *zero cold-start*.
* **Database Relasional Ringan**: Drizzle ORM di atas Cloudflare D1 SQLite terdistribusi.
* **Penyimpanan Objek Bebas Biaya Egress**: Cloudflare R2 dengan S3 API kompatibel.
* **Struktur Monorepo Bersih**: Terbagi menjadi `@cmsmu/db`, `@cmsmu/core`, `@cmsmu/ui`, `apps/cms-api`, dan `apps/web`.

**Tujuan Transformasi**:
Mengembangkan Core CMSMu dari sekadar "alat pembuat website berita" menjadi **Kerangka Kerja Aplikasi Serbaguna (*Application Framework*)** yang dapat digunakan untuk membangun berbagai sistem informasi, aplikasi mobile, dan layanan digital di lingkungan Amal Usaha Muhammadiyah (AUM) dan publik secara cepat, aman, dan berbiaya infrastruktur mendekati $0.

---

## 2. Arsitektur Mu-Framework Engine

```
                        ┌─────────────────────────────────────────────────────────┐
                        │                APLIKASI KONSUMEN KLIEN                  │
                        ├──────────────────────────┬──────────────────────────────┤
                        │  Portal Berita Digital   │   Sistem Donasi & Zakat      │
                        │  SIM Sekolah / Pesantren │   Mobile Apps Flutter        │
                        │  Perpustakaan & E-Book   │   Marketplace / E-Commerce   │
                        └────────────┬─────────────┴──────────────┬───────────────┘
                                     │                            │
                 ┌───────────────────┴──────────┐   ┌─────────────┴─────────────────┐
                 │    apps/web (Astro SSR)      │   │ apps/cms-api (Worker REST API)│
                 │  • Universal Admin Panel     │   │ • OpenAPI / Swagger Spec      │
                 │  • Public Presenter & Theme  │   │ • Flutter Mobile Endpoints    │
                 └──────────────┬───────────────┘   └─────────────┬─────────────────┘
                                │                                 │
      ┌─────────────────────────┴─────────────────────────────────┴────────────────────────┐
      │                        CORE ENGINE MONOREPO PACKAGES                               │
      ├──────────────────────────────┬─────────────────────────────┬───────────────────────┤
      │   packages/core              │   packages/db               │   packages/ui         │
      │   • Auth, JWT, & SSO Client  │   • Drizzle ORM Schema      │   • Semantic Design Tokens│
      │   • Storage R2 Adapters      │   • D1 Migration Runner     │   • Reusable Components   │
      │   • Event Hooks & Lifecycle  │   • Query Helpers & Seeders │   • Puck Block Builder    │
      │   • Background Worker Queue  │   • Dynamic Entity Engine   │   • Icon-Only Rail Sidebar│
      └──────────────────────────────┴──────────────┬──────────────┴───────────────────────┘
                                                    │
                        ┌───────────────────────────┴─────────────────────────────┐
                        │             INFRASTRUKTUR CLOUDFLARE EDGE               │
                        │  Cloudflare D1 (Database) • Cloudflare R2 (Media/Asset) │
                        │  Cloudflare KV (Sessions) • Cloudflare Queues (Jobs)    │
                        └─────────────────────────────────────────────────────────┘
```

---

## 3. Ragam Sistem & Aplikasi yang Dapat Dibangun

| Jenis Sistem | Modul Utama yang Digunakan | Skenario Implementasi |
| :--- | :--- | :--- |
| **1. Mobile Apps Backend (Flutter)** | `apps/cms-api`, `@cmsmu/core` (Auth), `@cmsmu/db` | Backend terpadu untuk aplikasi mobile komunitas/warga: kartu anggota digital, bacaan artikel, push notifikasi, dan forum interaktif tanpa menyentuh Astro. |
| **2. Sistem Donasi & Zakat (LazisMu)** | `@cmsmu/db` (Custom entity: `campaigns`, `donations`), `@cmsmu/core` (Webhook) | Pencatatan donasi real-time, integrasi Payment Gateway QRIS/Midtrans, auto-generate kwitansi PDF ke Cloudflare R2, dan laporan audit transparan. |
| **3. SIM Sekolah / Pesantren** | `@cmsmu/core` (RBAC), `apps/web` (Universal Admin) | Manajemen biodata siswa/santri, pembayaran SPP, presensi, rapor digital, dan portal pengumuman wali murid. |
| **4. E-Learning & Pustaka Digital** | `@cmsmu/core` (`emagazine`, `videoUrl`, paywall), `@cmsmu/ui` | Platform kursus online, flipbook majalah/buku digital, repositori dokumen fatwa/tarjih, dan akses materi premium berbasis langganan. |
| **5. E-Commerce & Lisensi Buku** | `@cmsmu/db` (Entities: `products`, `orders`, `licenses`) | Penjualan seragam/merchandise AUM, distribusi lisensi buku digital antar-sekolah, dan pengelolaan royalti penulis. |

---

## 4. Lima Pilar Teknis Transformasi (Dari CMS Menuju Framework)

### 🔹 Pilar 1: Schema-Driven Dynamic Data Model
* Tidak lagi terbatas pada tabel kaku `posts` dan `pages`.
* Pengembang dapat mendefinisikan *Custom Collections* baru secara terisolasi via Drizzle ORM (misal: `tabel donations`, `students`, `courses`) dan otomatis mendapatkan endpoint CRUD, validasi Zod, serta form admin.

### 🔹 Pilar 2: Granular Role-Based Access Control (RBAC)
* Mengevolusikan role dasar (`admin`, `editor`, `author`, `subscriber`) menjadi **Capability Matrix**:
  - `can_verify_donation`, `can_publish_magazine`, `can_export_report`, `can_manage_students`.
* Setiap modul dapat mendaftarkan permission khusus secara dinamis.

### 🔹 Pilar 3: Event Lifecycle Hooks & Background Jobs
* Menyediakan arsitektur hook terstandarisasi:
  - `beforeCreate(entity, data)`
  - `afterCreate(entity, record)` ➔ Memicu pengiriman pesan WhatsApp, notifikasi email, atau pembuatan invoice.
* Integrasi Cloudflare Queues untuk pemrosesan asinkron berat (kompresi gambar masal, indexing pencarian, sinkronisasi feed).

### 🔹 Pilar 4: Type-Safe RPC & Auto-Generated OpenAPI (Swagger)
* Mengadopsi Hono RPC (`hc`) dan zValidator.
* Menghasilkan kontrak API otomatis (*OpenAPI Specification*) sehingga pengembang frontend (Astro, React, Next.js) dan pengembang mobile (Flutter Dart) mendapatkan kode client bertipe data presisi (*end-to-end type safety*).

### 🔹 Pilar 5: Hot-Pluggable Plugin Registry (Zero-Touch Core)
* Seluruh fitur spesifik (contoh: plugin agregator, plugin pembayaran, plugin akademik) dibuat sebagai addon terisolasi di `src/cms/addons/<plugin-name>/`.
* Core engine tetap **Zero-Touch**: mengaktifkan atau mematikan modul tidak akan merusak kestabilan sistem inti.

---

## 5. Peta Jalan Pelaksanaan (Roadmap 5 Fase)

```
[2026 Q4] ─── Fase 1: Pematangan Monorepo Core Packages (@cmsmu/db, core, ui)
     │
[2027 Q1] ─── Fase 2: Dedicated API Gateway & Flutter Mobile Starter Kit
     │
[2027 Q2] ─── Fase 3: Schema-Driven Custom Collections & Auto-CRUD Generator
     │
[2027 Q3] ─── Fase 4: Event Lifecycle Hooks, Webhooks, & Cloudflare Queues
     │
[2027 Q4] ─── Fase 5: Multi-Tenant Architecture & Enterprise Extension Store
```

### 📍 Fase 1: Pematangan Monorepo Core Packages (Q4 2026 - AKTIF)
* **Status**: Sedang Berjalan (Fase 1 Selesai: 0 Error).
* **Target**:
  - Pematangan `@cmsmu/db` (Drizzle schema 100% parity, migration runner).
  - Pematangan `@cmsmu/core` (services auth, navigation, storage R2).
  - Pematangan `@cmsmu/ui` (tokens Semantic CSS, Puck blocks, icon-only rail).
  - Penegakan SOP Batas Panjang Berkas (< 1000 baris/file).

### 📍 Fase 2: Dedicated API Gateway & Mobile Support (Q1 2027)
* **Target**:
  - Mengaktifkan router mandiri di `apps/cms-api` di atas Cloudflare Worker.
  - Implementasi OpenAPI / Swagger documentation (`/api/docs`).
  - Merilis **Flutter Starter Kit Muhammadiyah**: template mobile siap pakai yang terhubung ke `apps/cms-api` (autentikasi login, profil pengguna, pembaca konten).

### 📍 Fase 3: Schema-Driven Custom Collections & Auto-CRUD (Q2 2027)
* **Target**:
  - Engine pembaca skema Drizzle dinamis untuk menghasilkan form input otomatis di Universal Admin UI.
  - Dukungan relasi Many-to-Many dan One-to-Many tanpa kustomisasi manual di template HTML.
  - Export data otomatis ke format CSV/Excel dan laporan berkala.

### 📍 Fase 4: Event Hooks, Webhooks, & Queues (Q3 2027)
* **Target**:
  - Implementasi EventEmitter berbasis Cloudflare Worker Environment.
  - Webhook dispatcher untuk integrasi layanan pihak ketiga (Midtrans, Xendit, WhatsApp Gateway, Telegram Bot).
  - Cloudflare Queues integration untuk pemrosesan batch pekerjaan berat di background.

### 📍 Fase 5: Multi-Tenant & Plugin Distribution (Q4 2027)
* **Target**:
  - Multi-tenant database routing (satu instance engine melayani banyak cabang/institusi dengan isolasi data D1).
  - Plugin Marketplace: repositori addon resmi di mana unit usaha dapat mengunduh ekstensi fungsional secara instan via OTA.

---

## 6. Standar Kualitas & Aturan Kerja (SOP & Guardrails)

Seluruh pengembangan fitur baru dalam kerangka kerja ini wajib mematuhi standar yang telah dituangkan dalam [**`docs/CORE_CMS_SOP.md`**](file:///Users/cakiphin/projects/cmsMu/docs/CORE_CMS_SOP.md):
1. **Zero-Touch Core Engine**: Fitur aplikasi klien dibangun di atas layer theme dan plugin, dilarang merusak router dasar core.
2. **Zero Hardcode Policy**: Seluruh data, menu, tarif, dan label bersumber dinamis dari real database D1.
3. **Clean Architecture 5 Layer**: Pemisahan tegas Database, Controller, UI Presenter, State Logic, dan Styling Tokens.
4. **Hard Limit < 1000 Baris Per File**: Menjamin keterbacaan kode dan mencegah timbulnya *God File*.
5. **Pop-up Modal & Toast System**: Dilarang keras dialog native browser (`alert/confirm/prompt`).

---

## 7. Penutup & Lembar Pengesahan

Dengan arsitektur yang dirancang secara matang, Core CMSMu memiliki kapasitas penuh untuk berevolusi menjadi tulang punggung digital (*digital backbone*) bagi seluruh ekosistem layanan teknologi informasi di persyarikatan dan amal usaha.

*Dokumen ini menjadi acuan strategis resmi dalam setiap iterasi pengembangan Core CMSMu ke depan.*
