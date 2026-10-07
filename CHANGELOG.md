# Changelog - CMSMu Core Framework

Dokumentasi riwayat pembaruan dan rilis resmi **Core CMSMu**.

## [v0.1.5] - 2026-10-06
### ✨ Fitur Baru & Optimasi
- **Analytics Dashboard**: Dashboard visual analitik performa dengan agregasi `daily_stats`.
- **R2 Multi-Adapter Storage**: Dukungan dual storage adapter (`c.env.MEDIA_BUCKET` worker native dan S3 REST API fallback via `aws4fetch`).
- **Purge Cache Engine**: Mekanisme pembersihan cache edge Cloudflare otomatis saat publikasi konten.
- **Decoupled Client Routes**: Pemisahan rute publik klien dari core engine untuk modularitas tinggi.
- **On-Demand Post Fetching**: Query artikel ringan tanpa memuat kolom `body` sekaligus untuk mencegah browser memory leak.

## [v0.1.4] - 2026-10-02
### ✨ Fitur Baru & Perbaikan
- **OTA Self-Updating Engine**: Mesin pembaruan mandiri dengan audit perbandingan manifest.
- **Plugin Management**: Modul manajemen instalasi dan aktivasi addon/plugin CMSMu.
- **Standardisasi Media Routes**: Standardisasi jalur upload media `/uploads/` dan pembersihan rute usang.
- **Dynamic Footer & Versioning**: Sinkronisasi dinamis versi database dengan versi runtime framework.

## [v0.1.3] - 2026-09-28
### ✨ Rilis Awal Framework
- **Modular Monorepo Architecture**: Transformasi menjadi arsitektur multi-package (`@cmsmu/core`, `@cmsmu/db`, `@cmsmu/ui`, `apps/cms-api`, `apps/web`).
- **Drizzle ORM & Cloudflare D1**: Fondasi database relasional SQLite terdistribusi di edge.
- **Puck Visual Editor**: Integrasi editor blok visual untuk antarmuka publik dan tema.
