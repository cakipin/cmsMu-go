# 📘 Panduan Instalasi Mandiri: CMSMu Serverless di Cloudflare

Dokumen ini menjelaskan langkah-langkah menyiapkan dan men-deploy CMSMu di akun Cloudflare Serverless Anda sendiri secara gratis dan mandiri.

---

## 📋 Persyaratan Awal (Prerequisites)

1. **Akun Cloudflare**: Daftar gratis di [dash.cloudflare.com](https://dash.cloudflare.com).
2. **Node.js**: Versi `>= 22.12.0` terpasang di komputer Anda.
3. **Wrangler CLI**: Alat baris perintah resmi Cloudflare (otomatis terpasang via dependensi project).

---

## 🚀 Metode 1: Instalasi Otomatis via Setup Wizard (Sangat Direkomendasikan)

CMSMu menyediakan skrip wizard otomatis yang membuat seluruh infrastruktur di akun Cloudflare Anda tanpa perlu membuka dashboard web:

```bash
# 1. Masuk ke direktori project
cd cmsMu-go

# 2. Pasang dependensi
npm install

# 3. Jalankan wizard otomatis
npm run setup
```

### Apa yang dilakukan oleh Setup Wizard?
- Memvalidasi login akun Cloudflare Anda.
- Menjalankan `npx wrangler d1 create cmsmu-db` dan menangkap Database ID.
- Menjalankan `npx wrangler kv namespace create SESSION` untuk sesi admin.
- Menjalankan `npx wrangler kv namespace create WIKIMU_CACHE` untuk cache.
- Menjalankan `npx wrangler r2 bucket create cmsmu-media` untuk upload gambar/file.
- Memperbarui file `wrangler.jsonc` secara otomatis.
- Menjalankan migrasi skema tabel D1 (`src/cms/db/schema.sql`).

Setelah selesai, jalankan:
```bash
npm run deploy
```

---

## 🛠️ Metode 2: Instalasi Manual via Cloudflare Dashboard / CLI

Jika Anda ingin membuat setiap sumber daya secara manual:

### 1. Buat D1 Database
```bash
npx wrangler d1 create cmsmu-db
```
Catat `database_id` yang muncul di layar (contoh: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

### 2. Buat KV Namespaces
```bash
# Untuk Sesi Admin
npx wrangler kv namespace create SESSION
# Untuk Cache
npx wrangler kv namespace create WIKIMU_CACHE
```
Catat ID masing-masing KV.

### 3. Buat R2 Storage Bucket
```bash
npx wrangler r2 bucket create cmsmu-media
```

### 4. Perbarui `wrangler.jsonc`
Buka `wrangler.jsonc` dan masukkan ID yang telah Anda buat:
```jsonc
{
  "name": "cmsmu",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "cmsmu-db",
      "database_id": "MASUKKAN_DATABASE_ID_D1_ANDA"
    }
  ],
  "r2_buckets": [
    {
      "binding": "MEDIA_BUCKET",
      "bucket_name": "cmsmu-media"
    },
    {
      "binding": "BUCKET",
      "bucket_name": "cmsmu-media"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "SESSION",
      "id": "MASUKKAN_KV_SESSION_ID_ANDA"
    },
    {
      "binding": "WIKIMU_CACHE",
      "id": "MASUKKAN_KV_CACHE_ID_ANDA"
    }
  ]
}
```

### 5. Eksekusi Skema Database D1
```bash
npx wrangler d1 execute cmsmu-db --remote --file=src/cms/db/schema.sql
```

### 6. Deploy ke Cloudflare Pages
```bash
npm run deploy
```

---

## 🎨 Mengatur Logo & Favicon Anda
Default instalasi sudah menyertakan logo dan favicon resmi CMSMu di folder `public/`:
- `public/logo.svg` : Logo header utama.
- `public/favicon.svg` & `public/favicon.ico` : Favicon tab browser.

Anda dapat mengganti logo dan judul situs Anda kapan saja melalui panel admin:
👉 Buka `https://<domain-anda>.pages.dev/admin` ➔ Menu **Pengaturan (Settings)** ➔ Unggah Logo dan Favicon kustom Anda.

---

## 📦 Mengelola Plugin (OTA & SSO)
- **Plugin OTA**: Terpasang default dan diproteksi sistem agar instans Anda selalu dapat menerima sinkronisasi pembaruan tanpa risiko terhapus secara tidak sengaja.
- **Plugin SSO**: Dapat dihidupkan (*Aktif*) atau dimatikan (*Nonaktif*) kapan saja melalui menu **Kelola Plugin & Ekstensi** di panel admin sesuai kebutuhan komunitas Anda.
