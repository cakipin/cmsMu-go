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
