# Proses Bisnis, Workflow & Arsitektur Sistem (Cloudflare Native)
## Platform Newsroom & Media Aggregator Muhammadiyah

Dokumen ini mendefinisikan proses bisnis (*business process*), aktor, siklus hidup data, alur kerja (*workflow*), dan pemetaan arsitektur berbasis infrastruktur **Cloudflare Native** (Pages/Workers, D1, R2, Queues, KV, dan Cron Triggers).

---

## 1. Pemetaan Infrastruktur Cloudflare (Edge Native Architecture)

Sistem ini didesain 100% *serverless* di jaringan edge global Cloudflare untuk performa tinggi, biaya operasional ultra-rendah, dan tanpa beban pemeliharaan server fisik (*zero DevOps overhead*):

```
                               ┌────────────────────────────────────────┐
                               │           CLOUDFLARE EDGE CDN          │
                               │  - WAF / Anti-DDoS / SSL TLS 1.3       │
                               │  - Edge Cache (HTML & Static Assets)   │
                               └──────────────────┬─────────────────────┘
                                                  │
                                                  ▼
                        ┌─────────────────────────────────────────────────────┐
                        │        CLOUDFLARE PAGES / WORKERS (Next.js/Hono)    │
                        │  - Public Portal Reader (SSR / ISR)                 │
                        │  - Newsroom CMS Admin (Auth SSO Muhammadiyah ID)    │
                        │  - REST API Routes                                  │
                        └──┬─────────────────┬───────────────────┬────────────┘
                           │                 │                   │
           ┌───────────────▼────────┐ ┌──────▼────────────┐ ┌────▼──────────────┐
           │     CLOUDFLARE D1      │ │   CLOUDFLARE R2   │ │   CLOUDFLARE KV   │
           │   (Edge SQL Database)  │ │ (Object Storage)  │ │ (Fast Key-Value)  │
           │  - Drizzle ORM         │ │ - Clean Images    │ │ - Session Auth    │
           │  - Articles, Users,    │ │ - WebP Variants   │ │ - Feed ETags      │
           │    Taxonomies, Sources │ │ - Zero Egress Fee │ │ - Cache Ticker    │
           └────────────────────────┘ └───────────────────┘ └───────────────────┘
                           ▲                                      ▲
                           │               CLOUDFLARE QUEUES      │
                           │       ┌──────────────────────────────┴───────────────┐
                           └───────┤  Worker: Content Cleaner & Asset Sideloading │
                                   └──────────────────────────────▲───────────────┘
                                                                  │ Enqueue Tasks
                                   ┌──────────────────────────────┴───────────────┐
                                   │           CLOUDFLARE CRON TRIGGERS           │
                                   │  - RSS & Web Scraper Ingestion (Tiap 15 Menit)│
                                   └──────────────────────────────────────────────┘
```

### Komponen Infrastruktur Cloudflare:
1. **Compute (Aplikasi & API):** **Cloudflare Pages / Workers** menjalankan aplikasi full-stack (Next.js atau Hono + React) dengan latensi sub-50ms di seluruh Indonesia.
2. **Database:** **Cloudflare D1** (Serverless SQLite at the edge) dikelola menggunakan **Drizzle ORM** (`drizzle-orm/d1`).
3. **Penyimpanan Media (Gambar Hasil Sideload):** **Cloudflare R2** untuk menyimpan seluruh foto dan gambar hasil unduhan/kompresi WebP. Memiliki keunggulan **$0 egress fee** (tidak ada biaya bandwidth keluar).
4. **Pemrosesan Asinkron (Async Pipeline):** **Cloudflare Queues** menerima antrean artikel mentah hasil scraping untuk diproses (dibersihkan dan diunduh gambarnya) di latar belakang tanpa memblokir sistem utama.
5. **Penjadwalan Otomatis:** **Cloudflare Cron Triggers** mengeksekusi worker penarik berita (*ingestion worker*) secara berkala setiap 15 menit.
6. **Penyimpanan Nilai Kunci (Cache):** **Cloudflare KV** untuk caching ETag feed RSS, token sesi, dan breaking news ticker.

---

## 2. Proses Bisnis (Probis)

### 2.1 Aktor & Hak Akses (Role-Based Access Control)
1. **Super Admin:** Mengatur sumber feed media agregasi (PWM/PDM/AUM), master data majelis/ortom, dan izin pengguna.
2. **Pemimpin Redaksi (Editor in Chief):** Menentukan headline nasional, kurasi tingkat akhir, serta kebijakan sindikasi konten.
3. **Redaktur (Editor):** Memeriksa antrean artikel masuk, menyunting isi teks, mengoreksi SEO, dan menyetujui artikel orisinal maupun agregasi.
4. **Reporter / Jurnalis:** Menulis berita liputan mandiri, mengunggah foto, dan mengajukan artikel ke redaktur.
5. **Kontributor PWM/PDM/AUM:** Mengirim siaran pers atau rilis berita kegiatan daerah (wajib kurasi redaktur sebelum tayang).
6. **Pembaca Publik:** Mengakses portal berita, membaca artikel bersih, dan berkomentar (wajib login SSO Muhammadiyah ID).

### 2.2 Aturan Bisnis Utama (Invariants & Business Rules)
* **Aturan Etika Sindikasi Berita:** Berita hasil agregasi **wajib** mencantumkan media sumber asli, nama penulis asli, dan tautan *canonical URL* menuju artikel aslinya.
* **Aturan Kemandirian Media (Asset Isolation):** Seluruh gambar dari berita agregasi **dilarang keras** menggunakan tautan langsung (*hotlink*) ke server pihak ketiga. Seluruh gambar wajib diunduh, dioptimasi ke WebP, dan disajikan dari storage R2 sistem.
* **Aturan Kebersihan Konten (Zero-Ad Policy):** Seluruh skrip eksternal, iklan, widget pelacak, dan markup inline style dari media asal wajib dimusnahkan oleh *Cleaning Engine*.
* **Keamanan Komentar:** Hanya pengguna yang terverifikasi melalui SSO Muhammadiyah ID yang diizinkan mengirimkan komentar pada artikel.

---

## 3. Alur Kerja Sistem (Workflow)

### 3.1 Workflow Agregasi Berita & Asset Sideloading (Otomatis)

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Cloudflare Cron (15m)
    participant Ingester as Ingestion Worker
    participant Feed as Media Sumber (PWM/AUM RSS)
    participant Queue as Cloudflare Queue
    participant Cleaner as Cleaner Worker
    participant R2 as Cloudflare R2
    participant D1 as Cloudflare D1 (Drizzle)
    participant Desk as Meja Redaktur

    Cron->>Ingester: Trigger ingest schedule
    Ingester->>Feed: Fetch RSS / Scrape Feed URL
    Feed-->>Ingester: Return Raw XML / HTML
    Ingester->>Ingester: Cek duplikasi via Hash / GUID
    Ingester->>Queue: Kirim payload artikel mentah (Batch)
    Queue->>Cleaner: Consume message artikel
    Note over Cleaner: Ekstraksi Teks Bersih (Readability)<br/>Hapus Iklan & Script Pelacak
    Cleaner->>Feed: Download gambar asli (Cover & Inline)
    Cleaner->>Cleaner: Resize & Convert WebP (sharp/wasm)
    Cleaner->>R2: Upload gambar WebP ke R2 bucket
    R2-->>Cleaner: Kembalikan R2 Public/Custom URL
    Cleaner->>Cleaner: Rewrite <img src> di artikel ke R2 URL
    Cleaner->>D1: Insert artikel status 'pending_curation' via Drizzle
    Cleaner->>Desk: Notifikasi artikel agregasi siap dikurasi
```

### 3.2 Workflow Meja Redaksi (Kurasi & Berita Orisinal)

```mermaid
stateDiagram-v2
    [*] --> Draft: Jurnalis menulis liputan baru
    [*] --> Ingested: Worker menarik berita luar
    
    Ingested --> PendingCuration: Engine membersihkan teks & simpan foto ke R2
    PendingCuration --> Dropped: Redaktur menolak/buang duplikat
    PendingCuration --> Published: Redaktur setujui tayang (Syndicated)
    
    Draft --> InReview: Jurnalis ajukan ke redaksi
    InReview --> Draft: Redaktur minta revisi
    InReview --> Rejected: Redaktur menolak naskah
    InReview --> Scheduled: Disetujui dengan jadwal tayang
    InReview --> Published: Disetujui tayang langsung (Original)
    
    Scheduled --> Published: Waktu rilis tiba
    Published --> Archived: Berita lama diarsipkan
```

### 3.3 Workflow Pembaca & Komentar (Public Portal)

```mermaid
sequenceDiagram
    autonumber
    actor User as Pembaca Publik
    participant Edge as Cloudflare CDN / KV
    participant App as Public Portal (Pages)
    participant D1 as Cloudflare D1
    participant SSO as Muhammadiyah ID SSO

    User->>Edge: Buka halaman artikel /berita/:slug
    alt Halaman ada di Edge Cache
        Edge-->>User: Berikan HTML instan (<30ms)
    else Belum di Cache
        Edge->>App: Render page
        App->>D1: Query cleanContent & mediaAssets via Drizzle
        D1-->>App: Return data artikel
        App-->>Edge: Simpan ke Edge Cache
        Edge-->>User: Tampilkan UI Modern Reader
    end

    opt Mengirim Komentar
        User->>App: Klik 'Kirim Komentar'
        alt Belum Login SSO
            App-->>User: Tampilkan Popup 'Wajib Login Muhammadiyah ID'
            User->>SSO: Login via SSO M-ID
            SSO-->>App: Callback otentikasi valid
        end
        User->>App: Submit isi komentar
        App->>D1: Simpan komentar terverifikasi M-ID
        App-->>User: Tampilkan komentar langsung (Real-time update)
    end
```

---

## 4. Arsitektur Multi-Client, Server-Driven UI (SDUI) & Multi-Language (i18n)

### 4.1 Server-Driven UI (SDUI) Universal Workflow
Core cmsMu mendukung rendering multi-platform (*Astro SSR*, *Next.js App Router*, dan *React Native Mobile*) menggunakan satu sumber kebenaran blueprint JSON kanvas:

```mermaid
flowchart TD
    STUDIO["Canvas Studio (apps/web)<br/>Admin menyusun blok visual"] --> SAVE["Simpan Blueprint JSON<br/>(D1: canvas_pages)"]
    SAVE --> API["apps/cms-api<br/>GET /api/v2/sdui/:slug"]
    
    API --> C_WEB["Klien Next.js / Astro<br/>Render HTML / React Server Components"]
    API --> C_MOB["Klien React Native / Flutter<br/>Render Native Yoga Views (No App Store Re-deploy)"]
```

### 4.2 Multi-Language (i18n) & Fallback Cascade Matrix
Setiap entitas konten terikat pada `locales` (`id`, `en`, `ar`) dan dihubungkan oleh `translation_group_id`:
1. **Bahasa Indonesia (`id`, LTR)**: Bahasa dasar (*Canonical default*).
2. **Bahasa Inggris (`en`, LTR)**: Terjemahan internasional.
3. **Bahasa Arab (`ar`, RTL)**: Terjemahan keislaman / PCIM internasional dengan arah baca dwi-arah Kanan-ke-Kiri (*Right-to-Left*) dan font kaligrafi.

**Fallback Strategy**: Jika pengguna meminta `ar` atau `en` namun konten belum diterjemahkan, sistem secara otomatis (*zero crash*) menyajikan versi `id` disertai header informasi `X-CmsMu-Locale-Fallback: true`.

### 4.3 Arsitektur Implementasi Klien Next.js (`apps/nextjs-portal`)
1. **Pola Konsumsi SDK (`@cmsmu/sdk`)**: Next.js App Router menginisialisasi `createCmsMuClient({ baseUrl })` pada lapisan Server Component untuk menjaga performa rendering di sisi server (*React Server Components*).
2. **Dynamic Locale Routing (`/[locale]/...`)**: Parameter locale (`id`, `en`, `ar`) menentukan konfigurasi layout, metadata SEO, serta orientasi arah baca:
   - `id` & `en`: `<html lang="..." dir="ltr">` dengan font `Plus Jakarta Sans`.
   - `ar`: `<html lang="ar" dir="rtl">` dengan font `Amiri` dan alignment teks kanan-ke-kiri.
3. **Pola Render SDUI (`CmsMuBlockRenderer`)**: Menerima payload JSON dari `GET /api/theme-editor/sdui/:slug` dan memetakan array blok ke 8 komponen visual modular:
   - `SiteHeader`: Navigasi responsif, logo, menu dinamis, CTA, dan pemilih bahasa.
   - `Hero`: Header visual utama dengan headline, subheadline, dan tombol aksi.
   - `Partners`: Logo mitra kerja sama persyarikatan.
   - `FeatureGrid`: Grid fitur modular dengan ikon SVG kustom (tanpa emoji bawaan sistem).
   - `Testimonial`: Kartu kutipan ulasan dan profil narasumber.
   - `RecentPosts`: Daftar artikel warta terkini terintegrasi real-time via `client.posts.list()`.
   - `CallToAction`: Banner konversi dan ajakan bergabung.
   - `SiteFooter`: Navigasi kaki, hak cipta, dan jejaring sosial.

### 4.4 Arsitektur Implementasi Klien Mobile React Native (`apps/mobile-react-native`)
1. **Pola Server-Driven UI (Yoga Layout Engine)**:
   - Aplikasi mobile mengonsumsi `cmsMuClient.sdui.getPage('home', { platform: 'mobile', locale })`.
   - Komponen `NativeBlockRenderer` memetakan blok JSON ke komponen React Native: `View`, `Text`, `Image`, `ScrollView`, `TouchableOpacity`.
   - Perubahan tata letak kanvas di Web Studio langsung aktif di aplikasi ponsel tanpa perlu kompilasi ulang APK/AAB ke Google Play Store (*Zero Store Redeployment*).
2. **Kepatuhan Standar UI Mobile (SOP Aturan 9)**:
   - **SafeArea & System Insets**: Menggunakan safe bottom padding ($\ge 32\text{px}$) agar elemen tombol dan konten tidak tertutup oleh navigasi sistem Android (3-button / gesture bar).
   - **Pull-to-Refresh**: Seluruh layar dinamis (`HomeScreen`, `PostsScreen`) dibungkus `RefreshControl` bertema `#0a6134`.
3. **Multi-Language & RTL Mirroring**:
   - Mendukung bahasa Indonesia (`id`), Inggris (`en`), dan Arab (`ar`).

### 4.5 Ekosistem SDK Mobile Native Resmi (Flutter, Android Kotlin, Apple iOS Swift)
Untuk melayani pengembangan aplikasi mobile native lintas platform secara komprehensif, cmsMu menyediakan paket pustaka SDK resmi:
1. **Flutter & Dart SDK (`packages/sdk-flutter` - `cmsmu_sdk`)**:
   - Mendukung Flutter Mobile (Android & iOS) dan Web dengan Sound Null Safety.
   - Menyediakan `CmsMuClient` dengan method `sdui.getPage()`, `posts.list()`, dan `locales.list()`.
2. **Android Kotlin SDK (`packages/sdk-kotlin` - `dev.labmu.cmsmu.sdk`)**:
   - Mendukung Android API 24+ dan Jetpack Compose berbasis Kotlin Coroutines (`suspend fun`).
   - Data model `SDUIPage`, `SDUIBlock`, `PostItem`, dan `LocaleItem` siap konsumsi.
3. **Apple iOS Swift SDK (`packages/sdk-swift` - `CmsMuSDK`)**:
   - Mendukung iOS 15+, macOS 12+, dan SwiftUI dengan Swift Concurrency (`async/await`) berbasis SPM (*Swift Package Manager*).
   - Seluruh model mengadopsi protokol `Codable`, `Sendable`, dan `Identifiable`.

---

## 5. Arsitektur 1-Click Cloudflare BYOC Deployer & Centralized Activity Monitoring

Sistem kontrol terpusat di `cms.labmu.dev` dilengkapi dengan kapabilitas **BYOC (Bring Your Own Cloudflare)**:

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                  CENTRAL CONTROL PLANE (cms.labmu.dev)                │
  │                                                                        │
  │   ┌───────────────────────┐             ┌──────────────────────────┐   │
  │   │  1-Click Deployer UI  │             │ Activity Monitor Viewer  │   │
  │   │  - 4-Step Wizard SPA  │             │ - Stream Logs & Metrics  │   │
  │   │  - Cloudflare v4 REST │             │ - Health Pulse (Uptime)  │   │
  │   └──────────┬────────────┘             └────────────▲─────────────┘   │
  │              │ Orchestrate                           │ Ingest Telemetry │
  └──────────────┼───────────────────────────────────────┼─────────────────┘
                 │ Provision Resources                   │ (Non-blocking)
                 ▼                                       │
  ┌──────────────────────────────────────────────────────┴─────────────────┐
  │             USER'S PERSONAL CLOUDFLARE ACCOUNT (BYOC EDGE)             │
  │                                                                        │
  │   ┌────────────────────────────────────────────────────────────────┐   │
  │   │ Cloudflare Pages: https://${slug}.pages.dev                    │   │
  │   │ - Serverless SSR Runtime (Core cmsMu-go)                       │   │
  │   │ - Telemetry Middleware: Non-blocking c.executionCtx.waitUntil  │   │
  │   └──────────┬──────────────────┬──────────────────┬───────────────┘   │
  │              ▼                  ▼                  ▼                   │
  │     ┌─────────────────┐┌─────────────────┐┌─────────────────┐         │
  │     │   D1 Database   ││ R2 Media Bucket ││   KV Namespace  │         │
  │     │  ${slug}_db     ││ ${slug}_media   ││  ${slug}_cache  │         │
  │     └─────────────────┘└─────────────────┘└─────────────────┘         │
  └────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Alur Orkestrasi Provisioning Cloudflare
1. **Verifikasi Token**: Melakukan uji coba koneksi token Bearer ke `GET /client/v4/user/tokens/verify` dan mengecek Account ID.
2. **Alokasi Resource**: Membuat database D1 `${slug}_db`, bucket R2 `${slug}_media`, serta namespace KV `${slug}_cache` & `${slug}_session`.
3. **Migrasi Skema & Seeding**: Menjalankan skrip DDL SQL lengkap ke D1 remote via Cloudflare REST API dan membuat akun superadmin awal ber-hash SHA-256.
4. **Pendaftaran Pages Project (Git Upstream `cmsMu-go`)**: Mengonfigurasi proyek Cloudflare Pages yang terhubung langsung ke upstream GitHub `cakipin/cmsMu-go` (`branch: main`, `build_command: pnpm --filter=@cmsmu/web run build && ...`), menyematkan isolasi binding D1, R2, KV, serta menyuntikkan token telemetri `TELEMETRY_API_KEY`.
5. **Pemicu Build Awal (Initial Build Trigger)**: Sistem memicu trigger deployment Cloudflare Pages via REST API (`POST /pages/projects/{name}/deployments`) untuk segera membangun dan mengaktifkan bundle serverless `cmsMu-go` secara instan.

### 5.2 Alur Pemantauan Aktivitas (Telemetry Emitter Middleware)
1. **Non-Blocking Telemetry Emitter**: Setiap instance yang dideploy memiliki middleware yang berjalan di background (`c.executionCtx.waitUntil`) untuk mencatat:
   - `AUTH`: Login sukses/gagal pada panel admin.
   - `CONTENT`: Pembuatan, pengeditan, atau penghapusan artikel berita.
   - `THEME`: Perubahan layout canvas SDUI atau tema visual.
   - `SETTINGS`: Pembaruan konfigurasi situs.
   - `SYSTEM`: Peringatan error HTTP 500 atau runtime exceptions.
### 5.3 Aturan Pembatasan Kuota & Isolasi Multi-Tenant BYOC Deployer
1. **Akses Public User**:
   - Menu *1-Click Deployer* dibuka untuk seluruh pengguna terdaftar (`superadmin`, `admin`, `editor`, `author`, `subscriber`, `user`).
2. **Pembatasan Kuota Free / Demo (Maksimal 1 Website)**:
   - Pengguna dengan paket `free`, `demo`, atau default (tanpa paket Pro/Enterprise berbayar dan bukan `superadmin`) hanya diizinkan memiliki **maksimal 1 proyek/website aktif**.
   - Pada endpoint `POST /api/deployer/provision`, sistem memvalidasi jumlah proyek pengguna. Jika $\ge 1$, request diblokir dengan kode HTTP 403 (`quotaExceeded: true`).
   - Di antarmuka UI, kartu indikator kuota menampilkan status pemakaian (contoh: `1 / 1 Website Digunakan`) dan menonaktifkan tombol deploy baru hingga proyek lama dihapus.
3. **Isolasi Multi-Tenant & Kepemilikan Proyek**:
   - `GET /api/deployer/projects`: Pengguna publik hanya dapat melihat proyek miliknya sendiri (`WHERE user_id = authUser.id`), sementara Superadmin/Admin dapat memantau seluruh proyek global.
   - `GET /api/deployer/saved-credentials`: Pengguna hanya mendapatkan kredensial Cloudflare yang tersimpan pada proyek miliknya sendiri, mencegah kebocoran kredensial antar-pengguna.
   - `PUT` & `DELETE`: Pengguna hanya diizinkan mengedit atau menghapus proyek miliknya sendiri. Setelah proyek dihapus, kuota kembali `0 / 1` sehingga pengguna dapat membuat website baru.

### 5.4 Integrasi Repositori Git Pengguna & Alur Redeploy Mandiri
1. **Dua Mode Sumber Kode (Git Source)**:
   - **Mode Template Resmi (`cakipin/cmsMu-go`)**: Mode instan default 1-klik yang menghubungkan instance Cloudflare Pages langsung ke repositori upstream resmi `cakipin/cmsMu-go` (branch `main`). Pengguna tidak perlu memiliki akun GitHub atau melakukan setup Git secara manual.
   - **Mode Hubungkan Akun / Repositori Git Sendiri**: Pengguna memasukkan username/organisasi GitHub (`gitOwner`), nama repository (`gitRepo`), target branch (`gitBranch`, default: `main`), serta opsi Personal Access Token (PAT) untuk repositori privat.
2. **Endpoint Verifikasi Repositori (`POST /api/deployer/verify-git`)**:
   - Memvalidasi keterjangkauan repositori GitHub melalui GitHub REST API v3.
   - Membaca metadata esensial: `owner_id`, `repo_id`, `default_branch`, visibilitas (publik vs privat), serta memvalidasi keberadaan target branch.
   - Mengembalikan status verifikasi sukses beserta ID repositori yang dibutuhkan oleh Cloudflare Pages API.
3. **Penyematan Binding Git Dinamis ke Cloudflare Pages**:
   - Pada `CloudflareProvisioner.createOrUpdatePagesProject`, payload `source.config` dikonfigurasi secara dinamis menggunakan `owner_id` dan `repo_id` repositori pengguna (dengan fallback auto-resolusi via GitHub API jika ID belum disertakan).
   - Seluruh webhook build commit dan pr-comments Cloudflare Pages otomatis terikat pada repositori pengguna.
4. **Trigger Deployment Ulang Mandiri (`POST /api/deployer/projects/:id/deploy`)**:
   - Pada tabel daftar proyek, pengguna dapat memicu tombol **"Redeploy Git"** kapan saja setelah melakukan commit atau push perubahan kode ke repository GitHub mereka.
   - Control plane memvalidasi hak kepemilikan proyek pengguna, lalu memicu API Cloudflare Pages Deployment (`POST /pages/projects/{name}/deployments`), menarik kode commit terbaru dari branch target, dan membangun bundle serverless terbaru secara otomatis.
   - Riwayat trigger redeploy dicatat secara transparan di tabel `instance_activity_logs` (`action: REDEPLOY_TRIGGERED`).


