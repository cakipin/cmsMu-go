# Kontrak API (API Contracts)
## Platform Newsroom & Media Aggregator Muhammadiyah

Dokumen ini mendefinisikan kontrak endpoint API, format payload request/response JSON, dan status kode HTTP untuk portal publik, newsroom editorial, dan worker agregasi pada platform Cloudflare Workers/Pages.

---

## 1. Standar Format Response JSON

Semua endpoint mengembalikan struktur standar seragam:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Deskripsi status operasi",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 15,
    "total": 150
  }
}
```

Format Error Response:
```json
{
  "success": false,
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Validasi input gagal",
  "details": [
    {
      "field": "title",
      "message": "Judul artikel wajib diisi"
    }
  ]
}
```

---

## 2. Endpoint Portal Publik

### 2.1 `GET /api/v1/news`
Mengambil daftar berita terpublikasi dengan filter dinamis dan paginasi.

* **Query Parameters:**
  * `page` (default: 1)
  * `limit` (default: 12)
  * `category` (slug kategori, misal: `pendidikan`)
  * `ortom` (slug ortom, misal: `aisyiyah`, `ipm`)
  * `region` (kode wilayah, misal: `PWM-JATIM`)
  * `type` (`all`, `original`, `aggregated`)
  * `search` (keyword pencarian judul)

* **Response 200 (OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "art_9a8b7c6d",
      "title": "Lazismu Salurkan Bantuan Kemanusiaan untuk Korban Bencana",
      "slug": "lazismu-salurkan-bantuan-kemanusiaan-korban-bencana",
      "excerpt": "Aksi tanggap darurat Lazismu bergerak cepat di titik terdampak...",
      "coverImageUrl": "https://cdn.muhammadiyah.id/media/2026/09/cover.webp",
      "sourceType": "aggregated",
      "source": {
        "name": "PWMU.CO",
        "slug": "pwmu-co"
      },
      "readingTimeMinutes": 3,
      "publishedAt": "2026-09-11T09:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 240
  }
}
```

---

### 2.2 `GET /api/v1/news/:slug`
Mengambil artikel lengkap yang sudah bersih dari iklan beserta galeri foto mandiri di Cloudflare R2.

* **Response 200 (OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "art_9a8b7c6d",
    "title": "Lazismu Salurkan Bantuan Kemanusiaan untuk Korban Bencana",
    "slug": "lazismu-salurkan-bantuan-kemanusiaan-korban-bencana",
    "excerpt": "Aksi tanggap darurat Lazismu bergerak cepat...",
    "cleanContent": "<p>Isi berita bersih tanpa skrip dan iklan...</p><figure><img src=\"https://cdn.muhammadiyah.id/media/2026/09/foto-1.webp\" /><figcaption>Relawan MDMC dan Lazismu</figcaption></figure>",
    "coverImageUrl": "https://cdn.muhammadiyah.id/media/2026/09/cover.webp",
    "coverImageCaption": "Pelepasan bantuan kemanusiaan",
    "sourceType": "aggregated",
    "originalUrl": "https://pwmu.co/bencana-lazismu-123/",
    "originalAuthorName": "Ahmad Fauzi",
    "source": {
      "name": "PWMU.CO",
      "siteUrl": "https://pwmu.co"
    },
    "taxonomies": [
      { "name": "Kemanusiaan", "type": "category" },
      { "name": "Lazismu", "type": "majelis_lembaga" },
      { "name": "MDMC", "type": "majelis_lembaga" }
    ],
    "readingTimeMinutes": 3,
    "publishedAt": "2026-09-11T09:00:00Z"
  }
}
```

---

### 2.3 `POST /api/v1/news/:slug/comments`
Mengirimkan komentar baru pada artikel (Wajib Header Token SSO Muhammadiyah ID).

* **Headers:** `Authorization: Bearer <JWT_SSO_M_ID>`
* **Request Body:**
```json
{
  "content": "Alhamdulillah, semoga bantuan Lazismu bermanfaat bagi para korban."
}
```
* **Response 201 (Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Komentar berhasil dikirim",
  "data": {
    "id": "comm_334455",
    "userName": "Hafidz Nugroho",
    "userAvatar": "https://sso.muhammadiyah.id/avatars/user.jpg",
    "content": "Alhamdulillah, semoga bantuan Lazismu bermanfaat bagi para korban.",
    "createdAt": "2026-09-11T10:15:00Z"
  }
}
```

---

## 3. Endpoint Meja Redaksi (Newsroom CMS)

### 3.1 `POST /api/v1/newsroom/articles`
Membuat draft artikel baru (Jurnalis/Kontributor).

* **Headers:** `Authorization: Bearer <SESSION_TOKEN>`
* **Request Body:**
```json
{
  "title": "Muktamar Pemuda Muhammadiyah Bahas Transformasi Digital",
  "cleanContent": "<p>Naskah lengkap liputan...</p>",
  "excerpt": "Ringkasan liputan muktamar...",
  "coverImageR2Key": "media/2026/09/muktamar-cover.webp",
  "coverImageUrl": "https://cdn.muhammadiyah.id/media/2026/09/muktamar-cover.webp",
  "taxonomyIds": ["tax_pemuda_muh", "tax_nasional"],
  "submitForReview": true
}
```
* **Response 201 (Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Artikel berhasil disimpan dan diajukan ke meja redaktur",
  "data": {
    "id": "art_778899",
    "status": "in_review"
  }
}
```

---

### 3.2 `PUT /api/v1/newsroom/articles/:id/status`
Redaktur menyetujui, menjadwalkan, atau menolak artikel.

* **Request Body:**
```json
{
  "status": "published", 
  "isHeadline": true,
  "scheduledAt": null,
  "rejectionReason": null
}
```
* **Response 200 (OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Status artikel berhasil diperbarui menjadi published"
}
```

---

## 4. Endpoint Worker Agregasi (Cloudflare Queues / Cron)

### 4.1 `POST /api/v1/aggregator/curate`
Redaktur memvalidasi berita agregasi dari antrean `pending_curation`.

* **Request Body:**
```json
{
  "articleId": "art_9a8b7c6d",
  "action": "approve", // 'approve' | 'drop'
  "editedTitle": "Judul Disempurnakan Redaktur",
  "taxonomyIds": ["tax_lazismu", "tax_jatim"],
  "isHeadline": false
}
```
* **Response 200 (OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Berita sindikasi berhasil disetujui dan tayang di portal"
}
```

---

## 5. Endpoint Multi-Client SDUI & Multi-Language (i18n)

### 5.1 `GET /api/theme-editor/locales`
Mengambil daftar bahasa yang didukung oleh sistem (ID, EN, AR) beserta arah baca (*direction*).

* **Response 200 (OK):**
```json
{
  "success": true,
  "data": [
    { "code": "id", "name": "Bahasa Indonesia", "direction": "ltr", "isDefault": 1 },
    { "code": "en", "name": "English", "direction": "ltr", "isDefault": 0 },
    { "code": "ar", "name": "العربية", "direction": "rtl", "isDefault": 0 }
  ]
}
```

---

### 5.2 `GET /api/theme-editor/sdui/:slug`
Mengambil blueprint tata letak Server-Driven UI (SDUI) untuk halaman kanvas tertentu (`home`, `about`, dll).

* **Query Params:**
  - `locale`: Kode bahasa (opsional, default: `id`)
  - `platform`: `web` | `mobile` (opsional, default: `web`)
* **Response 200 (OK):**
```json
{
  "success": true,
  "slug": "home",
  "locale": "id",
  "direction": "ltr",
  "availableLocales": ["id", "en", "ar"],
  "content": [
    {
      "type": "SiteHeader",
      "props": { "title": "cmsMu Canvas", "headerBgColor": "#0a6134" }
    },
    {
      "type": "Hero",
      "props": { "title": "Membina Generasi", "badgeText": "cmsMu SDUI" }
    }
  ]
}
```

---

## 6. Daftar Client SDK Resmi cmsMu

| Bahasa / Platform | Nama Paket / Lokasi | Fitur Utama |
| :--- | :--- | :--- |
| **TypeScript / JS** | `@cmsmu/sdk` (`packages/sdk`) | Fetch universal, Next.js Server Components, React Native |
| **Flutter / Dart** | `cmsmu_sdk` (`packages/sdk-flutter`) | Sound Null Safety, Flutter Mobile & Web, SDUI models |
| **Android Kotlin** | `dev.labmu.cmsmu.sdk` (`packages/sdk-kotlin`) | Coroutines (`suspend fun`), Jetpack Compose, type-safe POJO |
| **Apple iOS Swift** | `CmsMuSDK` (`packages/sdk-swift`) | Swift Concurrency (`async/await`), SwiftUI, `Codable` |
