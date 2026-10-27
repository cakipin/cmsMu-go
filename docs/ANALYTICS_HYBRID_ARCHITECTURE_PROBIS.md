# 📊 Arsitektur Sistem Analitik Hybrid & Proses Bisnis (Probis)
## Dual-Engine Intelligence: Cloudflare Global Edge & Google Analytics 4 (GA4)

**Platform:** CMSMu Core Engine & Tenant Runtime  
**Dokumen:** `docs/ANALYTICS_HYBRID_ARCHITECTURE_PROBIS.md`  
**Penyusun:** Principal Enterprise System Analyst (`@system-analyst`) & Database Architect (`@db-architect`)  
**Versi:** 1.0.0 (Production Blueprint)  
**Status:** Approved & Living Technical Specification  

---

## 1. Ringkasan Eksekutif & Filosofi Desain

### 1.1 Latar Belakang Masalah
Analitik lalu lintas web pada CMS tradisional (seperti WordPress atau CMS berbasis database SQL) menghadapi dua dilema kritis:
1. **Beban Database Masif (Database Overhead & Write Amplification):**  
   Setiap kali pengunjung mengakses halaman artikel, server mengeksekusi operasi `INSERT`/`UPDATE` ke tabel transaksi (misal: `visitors`, `daily_stats`, `post_views`). Pada situs dengan lalu lintas tinggi, hal ini memicu:
   * Lonjakan pemindaian tabel (*full-table scan* seperti `SELECT COUNT(*) FROM visitors`).
   * Pembengkakan kuota read & write D1 database secara sia-sia.
   * Tingginya latensi HTTP response karena thread terblokir oleh penulisan database.
2. **Keterbatasan Pelacakan Sisi Klien (Client-Side Tracking Dilemma):**  
   Jika CMS hanya mengandalkan Google Analytics atau tag JavaScript browser:
   * Sekitar 25% – 40% trafik riil (pengguna dengan AdBlocker, peramban Brave/Safari ITP, pembaca RSS, dan curl/webhooks) tidak terlacak sama sekali.
   * Beban server riil, serangan DDoS mikro, dan status error jaringan (HTTP 4xx/5xx) tidak dapat dipantau oleh GA4.

### 1.2 Solusi: Arsitektur Analitik Hybrid (Dual-Engine)
CMSMu mengadopsi pendekatan **Hybrid Analytics Architecture**:
* **Mesin Jaringan (Network Engine): Cloudflare Edge GraphQL Analytics**  
  Menangkap seluruh lalu lintas HTTP di level edge jaringan global Anycast (Cloudflare CDN). Merekam total permintaan server, status cache, bandwidth, dan pengunjung unik berbasis IP edge secara server-side tanpa celah pemblokiran AdBlocker.
* **Mesin Audiens (Audience Engine): Google Analytics 4 (GA4) Reporting API**  
  Menangkap data interaksi manusia berbasis peramban (JavaScript), durasi membaca artikel (*average engagement time*), *bounce rate*, kategori perangkat (Mobile vs Desktop), dan sumber rujukan audiens (Google Organic Search, Direct, Media Sosial).
* **Dasbor Hybrid Switcher (UI):**  
  Antarmuka dasbor modern berbasis segmented switch yang memungkinkan redaksi dan administrator berpindah antara *Data Jaringan Cloudflare* dan *Data Audiens Google Analytics* secara instan.

### 1.3 Invariant Inti Arsitektur (Zero D1 Load)
> [!IMPORTANT]
> **ATURAN MUTLAK SISTEM:** Seluruh aktivitas pengumpulan analitik (ping/telemetri) dan konsumsi laporan analitik di dasbor **DIJAMIN 100% 0 ROW READ & 0 ROW WRITE** terhadap Cloudflare D1. Seluruh metrik ditampung dan ditarik langsung dari Cloudflare Edge dan Google Cloud Platform dengan sistem caching berjenjang (RAM V8 Isolate `< 0.1ms` dan Cloudflare KV `~15ms`).

---

## 2. Aktor Sistem & Matriks Peran (Roles)

```mermaid
classDiagram
    class PengunjungPublik {
        +Kirim HTTP GET Halaman Web
        +Memicu Background Ping (/api/stats/ping)
        +Eksekusi gtag.js (jika tanpa AdBlocker)
    }
    class RedaksiAdmin {
        +Membuka Dasbor Analitik (/admin/stats)
        +Mengoperasikan Hybrid Switcher (CF vs GA4)
        +Menganalisis Performa Artikel & Audiens
    }
    class CloudflareEdge {
        +Anycast DNS & CDN Proxy
        +Otomatis Mencatat HTTP Requests & Bandwidth
        +Menyediakan GraphQL Analytics API
        +Menyimpan Cache RAM & KV Namespace
    }
    class GoogleCloudPlatform {
        +Menerima Event dari gtag.js
        +Memproses Data Audiens & Engagement
        +Menyediakan GA4 Data API v1beta
        +Autentikasi Service Account (OAuth2)
    }

    PengunjungPublik --> CloudflareEdge : Request & Ping (Zero D1)
    PengunjungPublik --> GoogleCloudPlatform : Client Event (gtag.js)
    RedaksiAdmin --> CloudflareEdge : Konsumsi Dasbor & Switcher
    CloudflareEdge --> GoogleCloudPlatform : Fetch Report (Server-to-Server M2M)
```

| Aktor | Peran & Tanggung Jawab dalam Probis Analitik |
| :--- | :--- |
| **Pengunjung Publik** | Membaca artikel/halaman. Membawa metadata HTTP (IP, User-Agent, Referer). Memicu telemetri tanpa login. |
| **Redaksi & Admin** | Pengguna terautentikasi CMSMu. Membaca wawasan performa konten, mengevaluasi sumber pembaca, dan menentukan strategi redaksi. |
| **Cloudflare Edge (Worker)** | Lapisan komputasi serverless yang mengeksekusi Hono API, melayani cache bertingkat, dan melakukan autentikasi M2M ke Google. |
| **Google Analytics 4** | Platform pemrosesan data audiens yang menyajikan metrik keterlibatan pembaca dan retensi pengguna. |

---

## 3. Proses Bisnis (Probis) & Alur Pengguna (User Journey)

### Probis 1: Pelacakan Kunjungan Publik Asinkron (Zero D1 Tracking)
1. Pengunjung meminta URL artikel publik (misal: `/baca/inovasi-pendidikan`).
2. Cloudflare Pages melayani halaman HTML dalam $\le 100\text{ms}$. Jaringan Cloudflare Edge secara otomatis mencatat 1 hit permintaan HTTP, negara asal, dan status cache tanpa kode tambahan.
3. Di latar belakang (*background*), browser memicu `POST /api/stats/ping` atau `POST /api/stats/view/:id`:
   * Endpoint `/api/stats/ping` **langsung merespons** HTTP 200 `{ "success": true, "tracking": "cloudflare_edge" }` tanpa kueri SQL.
   * Endpoint `/api/stats/view/:id` memperbarui nilai `posts.views = views + 1` secara asinkron via `c.executionCtx.waitUntil()`. Penulisan ke `daily_stats` atau `visitors` **ditiadakan total**.

### Probis 2: Pemantauan Trafik Server & Jaringan (Cloudflare Edge View)
1. Administrator membuka halaman Analitik di Admin Dashboard (`/admin/stats`).
2. Sistem memeriksa memori lokal (*RAM Isolate*). Jika cache masih valid ($< 5\text{ menit}$), data grafik langsung disajikan dalam $< 0.1\text{ms}$.
3. Jika cache kedaluwarsa, Worker mengecek Cloudflare KV (`cmsmu:stats:cloudflare`).
4. Jika KV kosong, Worker melakukan satu kali kueri GraphQL ke Cloudflare Analytics API (`httpRequests1dGroups` dan `httpRequestsAdaptiveGroups`), menyimpannya ke KV dan RAM, lalu menampilkan metrik:
   * Total HTTP Requests 24 Jam
   * Total PageViews Jaringan
   * Pengunjung Unik Jaringan (Uniques Edge IP)
   * Grafik Tren 30 Hari & Distribusi Negara Teratas (*Top Countries*)

### Probis 3: Analisis Perilaku & Interaksi Pembaca (Google Analytics View)
1. Administrator mengklik switch **"Google Analytics (GA4)"**.
2. Worker mengecek cache RAM dan KV (`cmsmu:stats:ga4`).
3. Jika belum tersedia di cache, Worker mengeksekusi autentikasi mesin-ke-mesin (M2M) dengan Google:
   * Men-generate JWT Assertion bertanda tangan RSA-SHA256 menggunakan **Web Crypto API native (`crypto.subtle`)**.
   * Menukar JWT ke Google OAuth2 Server (`oauth2.googleapis.com`) untuk mendapatkan Access Token berumur 1 jam.
   * Menembak Google Analytics Data API v1beta (`runReport` & `runRealtimeReport`).
4. Data di-cache di KV selama 15 menit dan RAM selama 5 menit.
5. Dasbor menyajikan metrik keterlibatan pembaca:
   * Pengguna Aktif Realtime (30 Menit Terakhir)
   * Rata-rata Durasi Membaca Artikel (*Average Engagement Time*)
   * Total Sesi & Rasio Pengunjung Baru vs Pengunjung Setia (*New vs Returning*)
   * Sumber Rujukan Terbanyak (Google Search, WhatsApp, Instagram, Direct)
   * Komposisi Perangkat (Mobile Smartphone vs Desktop PC)

### Probis 4: Transisi Mode Hybrid Switcher & Preservasi State
1. UI Dasbor memanfaatkan state reaktif (Alpine.js).
2. Saat tombol switch ditekan, UI menyimpan pilihan ke `localStorage.getItem('cmsmu_analytics_engine')`.
3. Pemuatan data bersifat **Lazy Fetching**: API GA4 tidak akan pernah dipanggil jika admin hanya melihat mode Cloudflare. Kuota Google API tetap hemat dan efisien.
4. Saat admin kembali ke dasbor di kemudian hari, sistem otomatis membuka mode terakhir yang dipilih.

### Probis 5: Manajemen Kredensial, Fail-Safe & Smart Degradation
1. Jika kredensial Cloudflare belum terpasang, sistem menyajikan kartu panduan konfigurasi yang elegan tanpa melempar exception 500.
2. Jika kredensial Google Analytics belum terpasang, switch GA4 tetap dapat diakses tetapi menampilkan panduan integrasi Service Account.
3. Seluruh sistem tetap berjalan normal (*graceful degradation*), dan operasional CMS (posting artikel, kelola media, admin settings) tidak terganggu sama sekali.

---

## 4. State Machine & Lifecycle Matrix

### 4.1 State Machine Mesin Analitik Hybrid

```mermaid
stateDiagram-v2
    [*] --> UNCONFIGURED : Inisialisasi Sistem
    
    UNCONFIGURED --> CREDENTIALS_FOUND : Kredensial Diisi (Env/Secret/Options)
    
    state CREDENTIALS_FOUND {
        [*] --> CACHE_LOOKUP
        CACHE_LOOKUP --> HIT_RAM : Valid di RAM Isolate (< 0.1ms)
        CACHE_LOOKUP --> HIT_KV : Valid di Cloudflare KV (~15ms)
        CACHE_LOOKUP --> EXPIRED_OR_EMPTY : Cache Miss
        
        state EXPIRED_OR_EMPTY {
            [*] --> FETCH_UPSTREAM
            FETCH_UPSTREAM --> PARSE_DATA : HTTP 200 OK
            FETCH_UPSTREAM --> RETRY_FALLBACK : HTTP 401 / 429 / 5xx
            RETRY_FALLBACK --> STALE_SERVE : Ada Cache Usang (SWR)
            RETRY_FALLBACK --> ERROR_DEGRADED : Gagal Total
        }
        
        PARSE_DATA --> RECACHE : Simpan ke RAM & KV
        RECACHE --> SERVE_JSON
        HIT_RAM --> SERVE_JSON
        HIT_KV --> SERVE_JSON
        STALE_SERVE --> SERVE_JSON
    }

    SERVE_JSON --> [*]
    ERROR_DEGRADED --> [*]
```

### 4.2 Matriks Transisi & Penanganan Galat (Error Handling Matrix)

| Kejadian / Event | Kondisi | Aksi Sistem | Output HTTP | State Akhir |
| :--- | :--- | :--- | :---: | :--- |
| **Kredensial Belum Terpasang** | Token / Zone / Private Key kosong | Tidak menembak API eksternal. Hindari error 500. | `200 OK` `{ configured: false }` | `UNCONFIGURED` |
| **Permintaan Berulang (< 5m)** | Memori RAM Isolate valid | Mengembalikan data dari RAM Isolate tanpa I/O. | `200 OK` `{ source: "ram", cached: true }` | `HIT_RAM` |
| **Permintaan Antar-Isolate (< 1j)** | RAM kosong, Cloudflare KV valid | Mengambil string JSON dari KV, sinkronkan ke RAM. | `200 OK` `{ source: "kv", cached: true }` | `HIT_KV` |
| **Token OAuth2 Google Expired** | Access token berusia > 3600 detik | Sign JWT baru via `crypto.subtle`, fetch token baru. | `200 OK` `{ source: "ga4_api" }` | `RECACHE` |
| **Google API Limit (Quota Exceeded)** | HTTP 429 dari Google | Sajikan data KV terakhir dengan header *Stale-While-Revalidate*. | `200 OK` `{ source: "kv_stale" }` | `STALE_SERVE` |
| **Gangguan Jaringan Upstream** | Fetch timeout / Network drop | Gunakan cache lokal usang, catat log peringatan. | `200 OK` `{ source: "cached_fallback" }` | `STALE_SERVE` |

---

## 5. Diagram Arsitektur Sistem (Mermaid Diagrams)

### 5.1 Arsitektur Tingkat Tinggi (High-Level Architecture)

```mermaid
flowchart TD
    subgraph Klien_Publik["Pengunjung Publik & Browser"]
        U1["Pembaca Artikel"]
        U2["Bot / RSS Feed / Non-JS"]
    end

    subgraph Cloudflare_Edge["Cloudflare Global Network (Edge Runtime)"]
        CF_PROXY["Cloudflare Anycast Proxy / CDN"]
        PAGES["Cloudflare Pages SSR (Astro)"]
        HONO["CMSMu Core Engine (Hono API)"]
        
        subgraph Caching_Tiers["Multi-Tier Caching (Zero D1)"]
            RAM["Tier 1: V8 Isolate RAM (< 0.1ms)"]
            KV["Tier 2: Cloudflare KV Namespace (~15ms)"]
        end
        
        subgraph Modul_Stats["Modul Analitik Terisolasi"]
            PING_HANDLER["Ping Handler (0 D1 Write)"]
            CF_ROUTER["Cloudflare GraphQL Client"]
            GA4_ROUTER["GA4 WebCrypto OAuth2 Client"]
        end
    end

    subgraph Penyedia_Eksternal["Penyedia Data Analitik"]
        CF_GRAPHQL["Cloudflare GraphQL Analytics API<br/>(httpRequests1dGroups)"]
        GOOGLE_API["Google Analytics Data API v1beta<br/>(runReport & runRealtimeReport)"]
    end

    subgraph Antarmuka_Admin["Dasbor Redaksi CMSMu"]
        DASH["UI Dasbor Analitik (/admin/stats)"]
        SWITCH["Hybrid Segmented Switcher<br/>[Cloudflare Edge] | [Google Analytics]"]
    end

    U1 -->|Kunjungan Web| CF_PROXY
    U2 -->|HTTP Requests| CF_PROXY
    CF_PROXY --> PAGES
    PAGES --> HONO

    U1 -.->|Async Telemetri| PING_HANDLER
    PING_HANDLER -->|Respons Instan 200| U1

    DASH --> SWITCH
    SWITCH -->|Mode CF| CF_ROUTER
    SWITCH -->|Mode GA4| GA4_ROUTER

    CF_ROUTER <--> RAM
    CF_ROUTER <--> KV
    CF_ROUTER -->|Query Edge Metrics| CF_GRAPHQL

    GA4_ROUTER <--> RAM
    GA4_ROUTER <--> KV
    GA4_ROUTER -->|Server-to-Server API| GOOGLE_API
```

### 5.2 Sequence Diagram: Alur Pelacakan Publik (Ping & Pageview)

```mermaid
sequenceDiagram
    autonumber
    actor Browser as Browser Pengunjung
    participant Edge as Cloudflare Anycast CDN
    participant Hono as Hono Router (/api/stats/ping)
    participant D1 as Cloudflare D1 Database

    Browser->>Edge: GET /baca/artikel-unggulan
    Edge-->>Browser: 200 OK (HTML Halaman Web)
    Note over Edge: Cloudflare mencatat request, IP, dan bandwidth secara otomatis

    par Asynchronous Ping
        Browser->>Hono: POST /api/stats/ping
        Note over Hono: Memeriksa header cf-connecting-ip
        Note over Hono: TIDAK ADA Kueri ke tabel visitors atau daily_stats
        Hono-->>Browser: 200 OK {"success": true, "tracking": "cloudflare_edge"}
    and Post Counter Update (Jika View Artikel)
        Browser->>Hono: POST /api/stats/view/42
        Note over Hono: Menjadwalkan via c.executionCtx.waitUntil()
        Hono->>D1: UPDATE posts SET views = views + 1 WHERE id = 42
        Note over Hono: TIDAK ADA INSERT ke daily_stats
        Hono-->>Browser: 200 OK {"success": true, "tracking": "post_counter"}
    end
```

### 5.3 Sequence Diagram: Dasbor Hybrid & Token Exchange Google OAuth2

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin CMSMu
    participant UI as Dasbor Analitik (Alpine.js)
    participant API as CMSMu Worker (/api/stats/ga4)
    participant Cache as RAM Isolate & KV
    participant GoogleAuth as Google OAuth2 (oauth2.googleapis.com)
    participant GoogleData as GA4 Data API (analyticsdata.googleapis.com)

    Admin->>UI: Buka Dasbor Analitik
    UI->>UI: Cek LocalStorage ('cmsmu_analytics_engine')
    
    alt Admin Memilih Mode Cloudflare
        UI->>API: GET /api/stats/cloudflare
        API->>Cache: Cek RAM & KV Cache
        Cache-->>API: Cache Hit
        API-->>UI: 200 OK (Data Jaringan Cloudflare)
    else Admin Memilih Mode Google Analytics (GA4)
        UI->>API: GET /api/stats/ga4
        API->>Cache: Cek RAM & KV Cache
        alt Cache Miss
            Note over API: Buat JWT Assertion via Web Crypto API (crypto.subtle)
            API->>GoogleAuth: POST /token (grant_type=jwt-bearer)
            GoogleAuth-->>API: 200 OK (Access Token, TTL 3600s)
            API->>GoogleData: POST /properties/{ID}:runReport
            GoogleData-->>API: 200 OK (Matriks Audiens & Sesi)
            API->>Cache: Simpan ke KV (TTL 15m) & RAM (TTL 5m)
        else Cache Hit
            Cache-->>API: Ambil Data Cache
        end
        API-->>UI: 200 OK (Data Perilaku GA4)
    end
    UI-->>Admin: Render Grafik & Kartu Metrik Sesuai Mode Switcher
```

---

## 6. Spesifikasi Teknis & Kontrak API (API Contract)

### 6.1 `GET|POST /api/stats/ping`
* **Deskripsi:** Endpoint telemetri publik untuk memvalidasi koneksi klien dengan jaringan Cloudflare Edge.
* **Autentikasi:** Publik (Tanpa Login).
* **Efisiensi Database:** **0 Row Read & 0 Row Write**.
* **Response Payload (JSON):**
  ```json
  {
    "success": true,
    "tracking": "cloudflare_edge",
    "recordedAt": "2026-10-27T02:35:51.863Z"
  }
  ```

---

### 6.2 `GET /api/stats/cloudflare`
* **Deskripsi:** Menarik metrik jaringan agregat 24 jam dan 30 hari dari Cloudflare GraphQL API.
* **Autentikasi:** Admin / Superadmin.
* **Cache Header:** `private, max-age=300, stale-while-revalidate=3600`.
* **Response Payload (JSON):**
  ```json
  {
    "configured": true,
    "source": "cloudflare_edge",
    "data": {
      "totalRequests24h": 10631,
      "totalPageViews24h": 2077,
      "uniqueVisitors24h": 224,
      "history30d": [
        {
          "date": "2026-10-26",
          "requests": 2479,
          "pageViews": 401,
          "uniques": 99
        }
      ],
      "topCountries": [
        { "country": "ID", "requests": 8920 },
        { "country": "US", "requests": 840 },
        { "country": "SG", "requests": 412 }
      ],
      "cachedAt": "2026-10-27T09:48:39.120Z"
    }
  }
  ```

---

### 6.3 `GET /api/stats/ga4`
* **Deskripsi:** Menarik metrik perilaku audiens dari Google Analytics 4 Data API v1beta.
* **Autentikasi:** Admin / Superadmin.
* **Cache Header:** `private, max-age=300, stale-while-revalidate=3600`.
* **Response Payload (JSON):**
  ```json
  {
    "configured": true,
    "source": "google_analytics_4",
    "data": {
      "realtimeActiveUsers": 18,
      "totalSessions30d": 5420,
      "avgEngagementTime": "2m 45s",
      "bounceRate": "34.2%",
      "userTypeRatio": {
        "newUsers": 68.5,
        "returningUsers": 31.5
      },
      "topSources": [
        { "source": "google", "sessions": 2840, "percentage": 52.4 },
        { "source": "direct", "sessions": 1420, "percentage": 26.2 },
        { "source": "whatsapp", "sessions": 650, "percentage": 12.0 },
        { "source": "facebook", "sessions": 510, "percentage": 9.4 }
      ],
      "deviceBreakdown": {
        "mobile": 78.4,
        "desktop": 19.8,
        "tablet": 1.8
      },
      "history30d": [
        {
          "date": "2026-10-26",
          "activeUsers": 195,
          "sessions": 240,
          "screenPageViews": 850
        }
      ],
      "cachedAt": "2026-10-27T09:50:00.000Z"
    }
  }
  ```

---

### 6.4 `GET /api/stats/history?source={cloudflare|ga4}`
* **Deskripsi:** Endpoint terpadu untuk komponen grafik histori 30 hari.
* **Parameter:** `source` (default: `cloudflare`, opsional: `ga4`).
* **Response Payload (JSON):** Mengembalikan array terstandarisasi untuk konsumsi pustaka grafik (seperti Chart.js / Alpine.js SVG Sparklines).

---

## 7. Arsitektur Keamanan & Manajemen Secret

### 7.1 Autentikasi Google M2M Berbasis Native Web Crypto API
Untuk berjalan secara optimal di Cloudflare Workers V8 Isolates tanpa dependensi berat `googleapis` atau modul Node.js `crypto` yang memperbesar ukuran bundle:
1. **Penyimpanan Kredensial:**
   * `GA4_PROPERTY_ID` : ID numerik properti GA4 (disimpan di Secret/Options).
   * `GA_CLIENT_EMAIL` : Alamat email Google Cloud Service Account.
   * `GA_PRIVATE_KEY` : Kunci privat RSA format PEM (`-----BEGIN PRIVATE KEY...`).
2. **Pembuatan JWT Assertion (Edge Native):**
   * Format Token Header: `{"alg":"RS256","typ":"JWT"}`.
   * Format Token Claims:
     ```json
     {
       "iss": "cmsmu-service-account@project.iam.gserviceaccount.com",
       "scope": "https://www.googleapis.com/auth/analytics.readonly",
       "aud": "https://oauth2.googleapis.com/token",
       "exp": 1729003600,
       "iat": 1729000000
     }
     ```
   * Kunci privat diimpor langsung via `crypto.subtle.importKey("pkcs8", ...)` dan ditandatangani dengan algoritma `RSASSA-PKCS1-v1_5` / `SHA-256`.
3. **Penyimpanan Token Akses:**
   * Token akses berumur 3600 detik disimpan di memori RAM Worker Isolate. Token hanya diperbarui jika sisa masa berlakunya $< 5\text{ menit}$.

### 7.2 Isolasi Multi-Tenant & Kepatuhan Batas Repositori
* Pada lingkungan **Control Plane (`core cmsMu`)**, kredensial disimpan pada Cloudflare Pages Encrypted Secrets (`npx wrangler pages secret put ...`).
* Pada lingkungan **Tenant Runtime (`cmsMu-go`)**, kredensial dapat dikonfigurasikan secara mandiri oleh pemilik tenant melalui tabel `options` di database lokal D1 masing-masing instance tanpa ketergantungan silang.

---

## 8. Panduan Desain UI/UX Dasbor Hybrid

### 8.1 Komponen Segmented Control (Dual-Pill Switcher)
Komponen switch diletakkan di sudut kanan atas panel analitik:

```html
<div class="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
  <button 
    @click="setEngine('cloudflare')" 
    :class="activeEngine === 'cloudflare' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
    class="flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-lg transition-all duration-200">
    <i class="fas fa-network-wired text-xs"></i>
    <span>Cloudflare Edge</span>
  </button>
  
  <button 
    @click="setEngine('ga4')" 
    :class="activeEngine === 'ga4' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
    class="flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-lg transition-all duration-200">
    <i class="fab fa-google text-xs"></i>
    <span>Google Analytics</span>
  </button>
</div>
```

### 8.2 Matriks 4 Status Tampilan UI (The 4 UI States)
Setiap engine harus mengimplementasikan 4 status tampilan secara sempurna:
1. **Loading State:** Menampilkan Skeleton Shimmer dengan dimensi tinggi dan lebar yang identik dengan kartu metrik aslinya untuk mencegah efek *Layout Shift* (CLS).
2. **Empty / Unconfigured State:** Jika kredensial belum ada, menampilkan banner ramah pengguna (*Empty Card*) dengan tautan langsung ke halaman Settings panduan setup.
3. **Error State:** Menampilkan pesan galat deskriptif dengan tombol *"Coba Lagi"* (*Retry Button*) tanpa merusak navigasi dasbor.
4. **Success State:** Menampilkan ringkasan angka metrik tebal (*Big Stat Number*), indikator tren persentase hijau/merah, serta grafik interaktif.

---

## 9. Kesimpulan & Roadmap Implementasi

Dokumen ini menjadi acuan spesifikasi resmi bagi tim engineering CMSMu. Implementasi teknis selanjutnya dibagi dalam 3 tahap berurutan:
1. **Fase 1 (Backend Service):** Penulisan modul autentikasi Google M2M Web Crypto dan integrasi endpoint `/api/stats/ga4` di `apps/cms-api/src/modules/stats/`.
2. **Fase 2 (Frontend View):** Pembuatan komponen switcher hybrid, widget perilaku audiens GA4, dan penyimpanan state di `apps/cms-api/src/plugins/analytics/view.ts`.
3. **Fase 3 (Pengujian & Rilis):** Uji coba adversarial, verifikasi efisiensi 0 D1 read, sinkronisasi ke repositori publik `cmsMu-go`, dan promosi ke Staging.
