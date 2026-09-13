# ROADMAP PENGEMBANGAN: MUHAMMADIYAH NEWSROOM & AGGREGATOR
**Arsitektur Serverless Edge-Native di Atas Cloudflare Ecosystem**
*Dokumen Perencanaan Strategis & Roadmap Eksekusi (10 Halaman Lengkap)*

---

![Roadmap Visual Banner](/Users/cakiphin/projects/newsroom/docs/assets/newsroom_roadmap_banner_1789137363583.jpg)

**Identitas Dokumen:**
* **Produk:** Muhammadiyah Newsroom & Media Aggregator
* **Disiapkan Untuk:** Cak Ipin & Tim LabMu (Product & Engineering)
* **Status:** Rencana Strategis & Roadmap Eksekusi Resmi (v1.0)
* **Basis Infrastruktur:** Cloudflare Serverless Native (Pages/Workers, D1, R2, Queues, KV, Cron)
* **Tanggal:** September 2026

---

## DAFTAR ISI

1. **BAB 1: Ringkasan Eksekutif & Keunggulan Serverless Edge**
2. **BAB 2: Arsitektur Sistem & Topologi Cloudflare Native**
3. **BAB 3: Proses Bisnis (Probis) & Tata Kelola Redaksi Jaringan**
4. **BAB 4: Alur Kerja (Workflow) Editorial & Siklus Hidup Berita**
5. **BAB 5: Engine Agregator Berita Bersih & Asset Sideloading Pipeline**
6. **BAB 6: Standar Desain Antarmuka (UI/UX) Meja Redaksi & Portal Publik**
7. **BAB 7: Peta Jalan Pelaksanaan (Roadmap 4 Fase / 8 Minggu)**
8. **BAB 8: Matriks Tanggung Jawab Tim (RACI) & Manajemen Risiko**
9. **BAB 9: Metrik Keberhasilan (KPI, SLO) & Efisiensi Biaya Operasional**
10. **BAB 10: Rencana Peluncuran (Go-Live) & Lembar Pengesahan**

---

<!-- PAGE BREAK: HALAMAN 2 -->

## BAB 1: Ringkasan Eksekutif & Keunggulan Serverless Edge

### 1.1 Visi Platform
Muhammadiyah Newsroom & Media Aggregator adalah platform pusat jurnalisme persyarikatan yang dirancang untuk menyatukan produksi berita internal sekaligus mengagregasi ratusan kanal berita resmi Muhammadiyah (PWM, PDM, Ortom, dan AUM) ke dalam satu ekosistem informasi yang terkurasi, berwibawa, berkecepatan tinggi, dan beretika.

### 1.2 Mengapa Arsitektur Serverless Edge?
Alih-alih menggunakan arsitektur server konvensional (VPS/Container/VM) yang menuntut pemeliharaan sistem operasi, lisensi server, dan konfigurasi jaringan yang rumit, platform ini dibangun 100% di atas fondasi **Serverless Edge-Native Cloudflare**:

* **Performa Ultra Cepat Global & Domestik (Sub-30ms):** Aplikasi dijalankan langsung di ratusan titik kehadiran (*Edge Points of Presence*) Cloudflare di seluruh Indonesia (Jakarta, Surabaya, Medan, Makassar, dll.). Halaman berita disajikan dari lokasi terdekat dengan pembaca.
* **Skalabilitas Otomatis Tanpa Batas (Zero Cold Start):** Saat terjadi peristiwa besar (*breaking news*) atau muktamar dengan lonjakan jutaan pembaca serentak, infrastruktur edge melakukan auto-scaling seketika tanpa risiko server kehabisan memori atau mengalami crash.
* **Efisiensi Anggaran Maksimal ($0 Idle Cost):** Tidak ada biaya sewa server bulanan yang menganggur saat traffic rendah. Beban komputasi hanya dihitung per eksekusi request nyata.
* **Nol Beban Pemeliharaan Server (Zero DevOps):** Tim pengembang LabMu dapat fokus 100% pada nilai bisnis, kualitas konten, dan fitur editorial tanpa perlu memusingkan patching kernel Linux, pembaruan web server, atau konfigurasi firewall manual.

### 1.3 Matriks Komparasi: Server Konvensional vs Cloudflare Serverless Edge

| Parameter | Arsitektur Server Konvensional (VPS/VM) | Cloudflare Serverless Edge Native (Pilihan Kita) |
| :--- | :--- | :--- |
| **Penyebaran Server** | Terpusat di 1 data center (misal Jakarta) | **Terdistribusi di 300+ kota di seluruh dunia** |
| **Waktu Muat Halaman** | 800ms – 2500ms (bergantung jarak & beban) | **< 30ms langsung dari Edge Cache terdekat** |
| **Ketahanan Lonjakan Trafik** | Rentan down saat viral jika CPU/RAM habis | **Auto-scale instan menyerap puluhan ribu req/detik** |
| **Biaya Bandwidth Gambar** | Membayar kuota egress bandwidth GB bulanan | **$0 Egress Fee** melalui Cloudflare R2 Storage |
| **Basis Data** | Rawan bottleneck koneksi pool di jam sibuk | **Cloudflare D1 (SQLite Edge) berlatensi ultra-rendah** |
| **Beban Pemeliharaan** | Rutin patch OS, backup manual, setting Nginx | **Nol pemeliharaan infrastruktur fisik (Fully Managed)** |

---

<!-- PAGE BREAK: HALAMAN 3 -->

## BAB 2: Arsitektur Sistem & Topologi Cloudflare Native

![Diagram Arsitektur Cloudflare](/Users/cakiphin/projects/newsroom/docs/assets/newsroom_architecture_diagram_1789137264882.jpg)

### 2.1 Peran Komponen Ekosistem Cloudflare

Sistem mengadopsi pola **Edge-Native Modular Monolith** di mana antarmuka pengguna, manajemen data, dan antrean kerja terhubung secara harmonis:

1. **Cloudflare Pages / Workers (Compute Runtime):**
   * Menjalankan Portal Publik Pembaca dan CMS Meja Redaksi berbasis Next.js/Hono + TypeScript.
   * Memberikan rendering instan (*Edge Server-Side Rendering & Incremental Static Regeneration*).
2. **Cloudflare D1 (Database Relasional Edge):**
   * Menggunakan engine SQLite terdistribusi berkecepatan tinggi yang dikelola menggunakan **Drizzle ORM**.
   * Menjamin integritas data relasional antara Berita, Penulis, Kategori, Log Audit, dan Hak Aset Media.
3. **Cloudflare R2 (Penyimpanan Media & Asset Sideloading):**
   * Menyimpan seluruh foto liputan dan gambar hasil agregasi yang telah dioptimasi ke format WebP.
   * Fitur bebas biaya egress ($0 Egress) memastikan pembacaan jutaan gambar berita tidak membebani anggaran operasional.
4. **Cloudflare Queues (Antrean Pemrosesan Asinkron):**
   * Menangani tugas-tugas berat di latar belakang: ekstraksi teks bersih (*readability*), sanitasi HTML, unduh gambar eksternal, dan kompresi tanpa memblokir thread interaksi pengguna.
5. **Cloudflare Cron Triggers (Penjadwal Otomatis):**
   * Memicu worker penarik berita (*ingestion worker*) secara berkala setiap 15 menit ke puluhan sumber media PWM/PDM/AUM.
6. **Cloudflare KV (Penyimpanan Kunci-Nilai Berkecepatan Tinggi):**
   * Menyimpan token sesi autentikasi, status rate limiting, dan cache metadata ETag feed RSS.

---

<!-- PAGE BREAK: HALAMAN 4 -->

## BAB 3: Proses Bisnis (Probis) & Tata Kelola Redaksi Jaringan

### 3.1 Model Jaringan Terpadu Muhammadiyah
Sistem dirancang untuk melayani hierarki organisasi persyarikatan secara fleksibel:
* **Tingkat Pusat:** Majelis, Lembaga, dan Biro Pimpinan Pusat Muhammadiyah.
* **Tingkat Wilayah & Daerah:** Pimpinan Wilayah Muhammadiyah (PWM) dan Pimpinan Daerah Muhammadiyah (PDM).
* **Organisasi Otonom (Ortom):** Aisyiyah, Pemuda Muhammadiyah, Nasyiatul Aisyiyah, IPM, IMM, Hizbul Wathan, Tapak Suci.
* **Amal Usaha Muhammadiyah (AUM):** Perguruan Tinggi (PTMA), Rumah Sakit (PKU), Sekolah, Lazismu, dan MDMC.

### 3.2 Struktur 4 Role Redaksi Pragmatis

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ 1. KONTRIBUTOR  │       │   2. REDAKTUR   │       │ 3. ADMIN SISTEM │
│   / WARTAWAN    │       │     / PEMRED    │       │   / JARINGAN    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ • Tulis liputan │       │ • Review draft  │       │ • Kelola user   │
│ • Upload media  │ ────► │ • Koreksi naskah│ ◄───► │ • Setup portal  │
│ • Ajukan review │       │ • Kurasi RSS    │       │ • Konfigurasi   │
│ • Edit revisi   │       │ • Terbitkan     │       │   sumber feed   │
└─────────────────┘       └────────┬────────┘       └─────────────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │ 4. PEMBACA PUBLIK   │
                        │ (SSO M-ID Comment)  │
                        └─────────────────────┘
```

1. **Wartawan / Kontributor Lapangan:** Membuat naskah liputan, mengunggah foto, melengkapi takarir (*caption*), dan mengajukan draf ke antrean review redaksi.
2. **Redaktur / Pemimpin Redaksi:** Memeriksa kelengkapan fakta, menyunting gaya bahasa, mengoreksi SEO, mengurasi berita hasil agregasi, dan menetapkan status tayang (*publish*).
3. **Admin Jaringan (Platform/Tenant Admin):** Mengelola konfigurasi portal, menambahkan sumber feed RSS baru, serta mengatur hak akses anggota redaksi.
4. **Pembaca Terverifikasi:** Masyarakat luas yang membaca berita dan dapat berpartisipasi dalam ruang komentar dengan autentikasi SSO Muhammadiyah ID.

### 3.3 Penegakan Integritas Redaksi (Separation of Duties)
* **Aturan Anti-Self-Approval:** Penulis berita **dilarang keras menyetujui atau menerbitkan naskahnya sendiri**, meskipun ia memiliki peran ganda sebagai redaktur (`author_id != approver_id`). Naskah wajib diverifikasi oleh editor independen.
* **Aturan Berita Sensitif (High-Risk):** Naskah berkategori risiko tinggi (hukum, bantahan resmi persyarikatan, isu keselamatan) memerlukan persetujuan berjenjang dari Redaktur dan Pemimpin Redaksi.

---

<!-- PAGE BREAK: HALAMAN 5 -->

## BAB 4: Alur Kerja (Workflow) Editorial & Siklus Hidup Berita

### 4.1 Siklus Status Berita Orisinal
```
[DRAFT] ──(Submit Review)──► [IN_REVIEW] ──(Approve)──► [PUBLISHED]
   ▲                             │                         │
   │                             ▼                         ▼
   └──(Minta Perbaikan)── [CHANGES_REQUESTED]        [ARCHIVED / WITHDRAWN]
```

1. **Drafting:** Penulis menyusun naskah pada editor berbasis blok yang aman.
2. **Review & Locking:** Saat diajukan ke meja redaksi, naskah dikunci (*snapshot versioning*) agar tidak terjadi penimpaan data antar editor.
3. **Persetujuan & Publikasi:** Redaktur menyetujui versi yang valid. Konten langsung disinkronkan ke Cloudflare Edge Cache.
4. **Perubahan Naskah Live:** Jika artikel yang sudah tayang disunting ulang, editan tersebut masuk sebagai draf revisi terpisah. Publik tetap membaca versi tayang yang sah sampai revisi baru disetujui.

### 4.2 Tata Kelola Ralat, Koreksi, dan Hak Jawab
Sesuai Pedoman Pemberitaan Media Siber:
* **Pencatatan Ralat:** Setiap perbaikan materiil pada berita yang sudah terbit wajib menyertakan kotak *"Catatan Koreksi/Ralat"* di bagian bawah artikel yang mencantumkan bagian yang diperbaiki, waktu ralat, dan penjelasan redaksi.
* **Preservasi Waktu Rilis:** Tanggal pertama kali tayang (`first_published_at`) tidak boleh dimanipulasi saat artikel mengalami pembaruan redaksional.

---

<!-- PAGE BREAK: HALAMAN 6 -->

## BAB 5: Engine Agregator Berita Bersih & Asset Sideloading Pipeline

Sistem agregasi bekerja secara otomatis untuk menghimpun syiar persyarikatan dari berbagai daerah ke dalam satu portal berita terpadu yang nyaman dibaca.

```
[Sumber Berita PWM/PDM/AUM] (RSS Feed / Web Page)
                │
                ▼
  [1. Ingestion Worker] (Cron Trigger Tiap 15 Menit)
                │
                ▼
  [2. Content Cleaning Engine]
         ├── Ekstraksi Artikel Inti (Readability Algorithm)
         ├── Eliminasi Iklan, Widget, Banner Sponsor, dan Tracker
         └── Standarisasi Tipografi & Elemen Semantik HTML
                │
                ▼
  [3. Asset Sideloading & Optimization Pipeline]
         ├── Unduh Gambar Sampul & Foto Inline
         ├── Kompresi Cerdas & Konversi WebP Responsif
         ├── Simpan ke Cloudflare R2 ($0 Egress Storage)
         └── Rewrite URL Gambar Konten ke Domain Internal
                │
                ▼
  [4. Meja Kurasi Redaktur] ──► Setujui / Sunting / Tolak
                │
                ▼
  [5. Portal Pembaca Modern] (Lengkap dengan Atribusi Sumber Asli)
```

### 5.1 Fitur Unggulan Agregator Bersih
1. **Pembersihan Konten Total (Readability Engine):** Seluruh iklan AdSense, popup, banner sponsor lokal, dan tombol bagi bawaan situs asal dihapus tuntas. Naskah disajikan dalam teks bersih yang berfokus pada konten.
2. **Kemandirian Gambar (Anti Broken Image):** Foto tidak lagi mengandalkan tautan langsung (*hotlinking*) ke web asal yang rentan mati atau diblokir. Foto diunduh mandiri ke Cloudflare R2 dan dikonversi ke WebP.
3. **Etika Jurnalisme & SEO Google:** Setiap artikel sindikasi wajib menyertakan kartu sumber asli:  
   > *"Disadur dari **PWMU.CO (PWM Jawa Timur)** untuk kepentingan syiar persyarikatan. [Lihat Artikel Asli ↗]"*  
   lengkap dengan *Canonical URL* resmi agar reputasi SEO media asal tetap terlindungi.

---

<!-- PAGE BREAK: HALAMAN 7 -->

## BAB 6: Standar Desain Antarmuka (UI/UX) Meja Redaksi & Portal Publik

![Mockup Meja Redaksi](/Users/cakiphin/projects/newsroom/docs/assets/newsroom_dashboard_mockup_1789137317758.jpg)

### 6.1 Antarmuka Meja Redaksi (Dual-State Rail Sidebar)
* **Status Terbuka (Expanded, 250px):** Menampilkan identitas logo Muhammadiyah Newsroom, label navigasi lengkap, indikator angka antrean berita kurasi (`[15]`), dan profil pengguna aktif.
* **Status Tertutup (Collapsed, 68px):** Menyusut halus menjadi **Icon-Only Rail** simetris yang ringkas dengan *floating tooltip* saat ikon disorot, memaksimalkan area kerja penulisan naskah.
* **Animasi Transisi Mulus:** Menggunakan kurva transisi CSS `transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1)`.

### 6.2 Pengalaman Pembaca Publik (Clean Editorial Experience)
* **Tipografi Berkelas:** Menggunakan font *Plus Jakarta Sans* / *Inter* dengan rasio keterbacaan tinggi (`font-size: 18px`, `line-height: 1.8`, lebar kolom fokus artikel `700px`).
* **Fitur Kenyamanan Baca:** Dilengkapi *Reading Progress Bar* di sisi atas layar, label estimasi waktu baca (`⏱ 3 Menit Membaca`), serta tombol pengatur ukuran teks (`A-` dan `A+`).
* **Sistem Token Mode Siang & Malam (Flawless Theme):** Mode siang menggunakan warna putih gading lembut (`--bg-canvas: #f8fafc`), dan mode malam menggunakan nuansa slate gelap (`--bg-canvas: #090d16`) dengan aksen hijau resmi Muhammadiyah (`#005a36`).

---

<!-- PAGE BREAK: HALAMAN 8 -->

## BAB 7: Peta Jalan Pelaksanaan (Roadmap 4 Fase / 8 Minggu)

Roadmap pelaksanaan diatur dalam **4 Sprint Terfokus** selama total 8 minggu kalender kerja:

```
FASE 1: Fondasi Edge & SSO        [Minggu 1 - 2]
████████████████
FASE 2: Newsroom CMS & R2 Media                  [Minggu 3 - 4]
                ████████████████
FASE 3: Clean Aggregator Engine                                  [Minggu 5 - 6]
                                ████████████████
FASE 4: Portal Publik & Launch                                                   [Minggu 7 - 8]
                                                ████████████████
```

### Rincian Rencana Kerja per Sprint

| Fase / Sprint | Durasi | Target Capaian (Deliverables) Utama | Kriteria Keberhasilan (Exit Criteria) |
| :--- | :---: | :--- | :--- |
| **Fase 1: Fondasi Edge & Database D1** | Minggu 1–2 | • Setup repository Next.js/Hono di Cloudflare Pages<br>• Migrasi skema Drizzle ORM ke Cloudflare D1<br>• Integrasi login SSO Muhammadiyah ID (OAuth 2.0)<br>• Konfigurasi 4 role RBAC dasar | User berhasil login via SSO M-ID dan terpetakan hak aksesnya ke database D1. |
| **Fase 2: Newsroom CMS & Pustaka R2** | Minggu 3–4 | • UI Meja Redaksi dengan Dual-State Rail Sidebar<br>• Block Editor penulisan berita liputan mandiri<br>• Alur pengajuan draf & approval anti-self-approval<br>• Upload media dan kompresi WebP ke Cloudflare R2 | Naskah berhasil ditulis, dikoreksi, dan disetujui tanpa konflik data. |
| **Fase 3: Clean Aggregator Engine** | Minggu 5–6 | • Cron Trigger penarikan feed RSS tiap 15 menit<br>• Cloudflare Queues pembersih iklan & tracker<br>• Pipeline unduh gambar dan rewrite URL ke R2<br>• Meja kurasi agregasi berita daerah/AUM | Berita luar berhasil ditarik bersih dan siap tayang dalam waktu <60 detik. |
| **Fase 4: Portal Publik & Peluncuran** | Minggu 7–8 | • Antarmuka pembaca artikel responsif & modern<br>• Fitur komentar terproteksi login SSO M-ID<br>• Pengujian Core Web Vitals (LCP < 1.8s)<br>• UAT Redaksi pilot & cutover domain resmi | Sistem lulus uji beban performa dan siap digunakan tim redaksi persyarikatan. |

---

<!-- PAGE BREAK: HALAMAN 9 -->

## BAB 8: Matriks Tanggung Jawab Tim (RACI) & Manajemen Risiko

### 8.1 Matriks RACI

| Aktivitas / Milestone | Product Owner (Cak Ipin) | Tech Lead | Cloudflare / Backend | Frontend / UI Designer | Redaksi Pilot |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Penyelarasan Ruang Lingkup & Kebijakan** | **A / R** | C | C | C | C |
| **Arsitektur Cloudflare D1 & Auth SSO** | I | **A** | **R** | I | I |
| **Pengembangan Meja Redaksi (CMS)** | C | A | R | **R** | C |
| **Engine Agregator & Pipeline R2** | I | A | **R** | C | I |
| **Desain Antarmuka Portal Pembaca** | C | A | I | **R** | C |
| **UAT Redaksi & Kurasi Perdana** | A | C | I | I | **R** |
| **Persetujuan Peluncuran (Go-Live)** | **A** | C | C | C | C |

*Keterangan: **A** = Accountable (Pengambil Keputusan Akhir), **R** = Responsible (Pelaksana Utama), **C** = Consulted (Konsultan/Masukan), **I** = Informed (Penerima Laporan).*

### 8.2 Register Risiko Kritis & Mitigasi

| Risiko Potensial | Tingkat | Dampak | Strategi Mitigasi Serverless Cloudflare |
| :--- | :---: | :---: | :--- |
| **Format RSS Sumber Luar Berubah** | Sedang | Feed gagal parse | Sistem menerapkan dual-parser (RSS standar + fallback scraper) dan mengirim notifikasi jika feed gagal dibaca 3 kali. |
| **Lonjakan Trafik Saat Berita Viral** | Rendah | Server lambat | Cloudflare Edge Cache menyajikan halaman secara statis di ratusan data center global tanpa menyentuh D1 database. |
| **Gambar Sumber Luar Dihapus / Broken** | Tinggi | Artikel tanpa foto | Gambar langsung disideload ke Cloudflare R2 saat kurasi awal, sehingga mandiri 100% dari web asal. |
| **Kebocoran Draf yang Sedang Disunting** | Kritis | Naskah rahasia bocor | Draf tersimpan di tabel internal D1 dengan otorisasi ketat dan tidak pernah dimasukkan ke dalam publikasi Edge Cache. |

---

<!-- PAGE BREAK: HALAMAN 10 -->

## BAB 9 & 10: Metrik Keberhasilan (KPI/SLO) & Strategi Peluncuran

### 9.1 Target Service Level Objective (SLO)
* **Ketersediaan Layanan (Uptime):** $99.9\%$ ketersediaan portal publik berkat infrastruktur serverless tanpa risiko kegagalan server fisik.
* **Kecepatan Akses (Core Web Vitals):**
  * *Largest Contentful Paint (LCP):* $\le 1.8\text{ detik}$ pada jaringan seluler 4G.
  * *Cumulative Layout Shift (CLS):* $\le 0.05$ (tata letak stabil tanpa pergeseran iklan).
* **Efisiensi Kuota & Biaya:** Penghematan $100\%$ biaya transfer bandwidth media melalui kebijakan Cloudflare R2 ($0 Egress Fee).

### 10. Rencana Peluncuran & Strategi Perluasan Jaringan

Peluncuran resmi platform **Muhammadiyah Newsroom & Media Aggregator** dilaksanakan melalui tahapan transisi terkontrol:

| Tahap Peluncuran | Fokus Kegiatan & Cakupan Wilayah | Indikator Kesiapan (Gate) |
| :--- | :--- | :--- |
| **1. Internal Sandbox** | Uji coba tertutup tim LabMu dengan data feed sintetis dan simulasi 500 naskah. | Lolos uji isolasi data, sanitasi skrip, dan validasi anti-self-approval. |
| **2. Pilot Redaksi Terbatas** | Pelibatan 2–3 redaksi percontohan (PWM Jatim & PWM Jateng) untuk alur kerja riil. | Seluruh wartawan dan redaktur pilot sukses menempuh alur draft hingga publish. |
| **3. Cutover & Soft Launch** | Penerapan domain resmi, aktivasi Cloudflare Edge Cache, dan integrasi penuh SSO M-ID. | Waktu respon edge < 30ms dan tidak ada kendala autentikasi pengguna. |
| **4. Perluasan Nasional** | Onboarding bertahap seluruh PWM, Ortom, dan AUM se-Indonesia ke dalam jaringan. | Katalog sumber media aktif terverifikasi dan sindikasi berita berjalan otomatis. |

Dengan arsitektur Serverless Edge Cloudflare, sistem siap menyerap pertumbuhan ratusan portal daerah secara instan tanpa perlu merombak ulang infrastruktur.
