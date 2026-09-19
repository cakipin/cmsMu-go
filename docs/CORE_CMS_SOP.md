# SOP STANDAR PENGEMBANGAN & KLONING CORE CMSMU

Dokumen ini merupakan Standar Operasional Prosedur (SOP) resmi untuk pemeliharaan, pengembangan modular, serta protokol pembuatan project baru berbasis kloning Core CMSMu.

---

## 1. STANDAR MODULARITAS KODE (< 1000 BARIS PER BERKAS)
* **Batas Maksimum Baris**: Setiap berkas kode (`.ts`, `.tsx`, `.js`, `.astro`, `.css`) **DILARANG MELEBIHI 1000 BARIS KODE**.
* **Pemisahan Logika & Tampilan**:
  - Routing API dipisahkan per modul di `src/cms/modules/<nama_modul>/<nama_modul>.router.ts`.
  - Service & Adapter logika bisnis dipisahkan ke folder `services/`.
  - Komponen UI dipartisi menjadi sub-blocks di `ui/blocks/`.
  - Styling tema dipisah menjadi token modular di `styles/` (`base.css.ts`, `components.css.ts`, `single.css.ts`).

---

## 2. STANDAR UI & POP-UP (SOP 16 - ZERO BROWSER DIALOG)
* **Larangan Dialog Browser**:
  - Dilarang keras menggunakan dialog browser bawaan `window.alert()`, `window.confirm()`, dan `window.prompt()`.
* **In-System Floating Toast**:
  - Gunakan `window.showToast(message, 'success' | 'error' | 'warning' | 'info')` untuk feedback notifikasi.
* **In-System Confirmation Modal**:
  - Gunakan `window.showConfirmDialog({ title, message, type: 'danger' | 'info', confirmText })` yang me-return `Promise<boolean>` untuk aksi destruktif atau persetujuan penting.
* **Global Safety Net**:
  - Sistem secara global me-redirect pemanggilan `alert()` menuju toast in-system.

---

## 3. PROTOKOL KLONING PROYEK BARU DARI CORE CMSMU (CLEAN SETUP PROTOCOL)

Saat membuat atau mengkloning proyek baru dari Core CMSMu, ikuti 7 langkah wajib berikut untuk mencegah kebocoran kredensial dan tabrakan database:

### Langkah 1: Reset File Konfigurasi Lingkungan (`.env`)
- Gandakan `.env.example` menjadi `.env`.
- Hapus seluruh kredensial lama, API keys, dan token pihak ketiga dari proyek sebelumnya.

### Langkah 2: Regenerasi JWT Secret Baru
- Buat string acak 64-karakter untuk `JWT_SECRET` baru menggunakan terminal:
  ```bash
  openssl rand -hex 32
  ```
- Pasang nilai tersebut pada `.env` dan Cloudflare Secret `wrangler secret put JWT_SECRET`.

### Langkah 3: Isolasi Database Cloudflare D1
- Buat database Cloudflare D1 baru untuk proyek target:
  ```bash
  npx wrangler d1 create <nama-project-baru>-db
  ```
- Perbarui `database_name` dan `database_id` di `wrangler.jsonc` dengan UUID database baru tersebut.
- Eksekusi migrasi skema awal ke D1 baru:
  ```bash
  npx wrangler d1 execute <nama-project-baru>-db --file=./schema.sql
  ```

### Langkah 4: Isolasi Cloudflare R2 Storage
- Buat bucket R2 khusus untuk proyek baru:
  ```bash
  npx wrangler r2 bucket create <nama-project-baru>-media
  ```
- Perbarui binding `bucket_name` di `wrangler.jsonc`.

### Langkah 5: Bersihkan Cache State Miniflare Lokal
- Hapus direktori `.wrangler/state/` pada proyek baru agar Miniflare memulai database SQLite lokal yang bersih tanpa residu data dari repo sebelumnya:
  ```bash
  rm -rf .wrangler/state/
  ```

### Langkah 6: Pembuatan Kredensial Superadmin Baru
- Inisialisasi akun Superadmin perdana khusus proyek baru melalui command line atau seed query:
  ```sql
  INSERT INTO users (id, username, email, password_hash, role, is_active)
  VALUES ('usr-admin', 'superadmin', 'admin@domain-baru.org', '<hash_baru>', 'superadmin', 1);
  ```

### Langkah 7: Verifikasi Build & Staging Pipeline
- Jalankan kompilasi lokal:
  ```bash
  ASTRO_TELEMETRY_DISABLED=1 npm run build
  ```
- Lakukan deploy perdana ke staging:
  ```bash
  npm run deploy
  ```
- Lakukan pengujian QA di Staging sebelum rilis production.
