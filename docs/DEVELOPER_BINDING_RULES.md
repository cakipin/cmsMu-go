# 🛡️ Panduan & Aturan Wajib Binding Akun Cloudflare Pengembang CMSMu-Go

Dokumen ini memuat Standar Operasional Prosedur (SOP) dan aturan mutlak bagi seluruh pengembang (*developers*) dan pengguna yang membangun aplikasi menggunakan framework inti **`cmsMu-go`**.

---

## 1. Aturan Mutlak Isolasi Akun & Data (Anti-DB & R2 Leakage)

1. **Wajib Binding ke Akun Cloudflare Masing-Masing:**
   - Setiap pengguna atau developer yang men-setup CMSMu **WAJIB** membuat sumber daya Cloudflare (D1 Database, Workers KV, dan R2 Storage) pada akun Cloudflare miliknya sendiri.
   - **DILARANG KERAS** menggunakan UUID placeholder/template (`00000000-0000-0000-0000-000000000000`).
   - **DILARANG KERAS** mencuri, menduplikasi, atau menggunakan kredensial/binding milik proyek ekosistem pusat CMSMu atau proyek lain.

2. **Proteksi Hard Abort Pra-Deploy:**
   - Sistem pipeline CI/CD dan perintah deploy (`pnpm run deploy`) dilengkapi skrip proteksi otomatis (`scripts/verify-developer-bindings.mjs`).
   - Jika konfigurasi `wrangler.jsonc` terdeteksi masih menggunakan ID dummy atau ID terproteksi, proses deploy akan **SEKETIKA DIBATALKAN (EXIT 1)**.

---

## 2. Cara Penyiapan Binding Cloudflare Mandiri

### Opsi A: Menggunakan 1-Click Setup Wizard Otomatis (Direkomendasikan)
CMSMu menyediakan wizard otomatis berbasis CLI yang akan membuatkan database D1, KV Namespaces, R2 Bucket, serta menginisialisasi tabel database secara langsung ke akun Cloudflare Anda:

```bash
pnpm run setup
```

Wizard akan:
1. Memverifikasi login Cloudflare via Wrangler CLI (`npx wrangler whoami`).
2. Membuat database D1 (misal: `my-news-db`).
3. Menginisialisasi skema tabel SQLite Drizzle secara otomatis.
4. Membuat KV Namespace untuk sesi dan cache (`SESSION`, `CACHE`).
5. Membuat R2 Storage Bucket untuk media gambar (`my-media-bucket`).
6. Memperbarui berkas konfigurasi `wrangler.jsonc` dan `apps/cms-api/wrangler.jsonc` dengan ID riil akun Anda.

---

### Opsi B: Penyiapan Manual via Wrangler CLI

Jika Anda ingin membuat sumber daya secara manual dari terminal:

#### 1. Buat D1 Database:
```bash
npx wrangler d1 create <nama-database-anda>
```
*Catat `database_id` yang ditampilkan di terminal.*

#### 2. Buat KV Namespace untuk Sesi:
```bash
npx wrangler kv:namespace create SESSION
```
*Catat `id` namespace yang dihasilkan.*

#### 3. Buat R2 Bucket untuk Penyimpanan Media:
```bash
npx wrangler r2 bucket create <nama-bucket-media>
```

#### 4. Daftarkan ke Berkas Konfigurasi:
Buka `wrangler.jsonc` dan `apps/cms-api/wrangler.jsonc`, lalu perbarui nilai binding:
```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "<nama-database-anda>",
      "database_id": "<database-id-dari-langkah-1>"
    }
  ],
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "<nama-bucket-media-dari-langkah-3>"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "SESSION",
      "id": "<kv-id-dari-langkah-2>"
    }
  ]
}
```

#### 5. Jalankan Inisialisasi Database:
```bash
npx wrangler d1 execute <nama-database-anda> --file=packages/db/src/schema.sql --remote
```

---

## 3. Verifikasi Status Binding Mandiri

Untuk memvalidasi apakah binding Anda sudah sah dan bebas dari ID dummy, jalankan perintah:
```bash
pnpm run verify:bindings
```

Jika lolos, Anda siap menjalankan pengembangan lokal (`pnpm run dev`) maupun deployment mandiri ke Cloudflare Pages / Workers.
