# 🚀 CMSMu-Go: Cloud Native Serverless Content Management System

<p align="center">
  <img src="public/logo.svg" alt="CMSMu Logo" width="300">
</p>

<p align="center">
  <strong>CMS Serverless Generasi Baru untuk Komunitas, Media, dan Institusi</strong><br>
  Ditenagai oleh <em>Astro + Hono + Cloudflare Pages + D1 SQLite + KV + R2 Storage</em>.<br>
  <em>Zero server cost, zero maintenance, lightning-fast edge performance.</em>
</p>

---

## ✨ Fitur Unggulan CMSMu

- ⚡ **100% Cloudflare Serverless**: Tidak membutuhkan VPS. Berjalan di atas jaringan Edge global Cloudflare gratis.
- 🗄️ **Database Terdistribusi (Cloudflare D1)**: SQLite relasional terkelola dengan query super cepat via Drizzle ORM.
- 🔐 **Sesi & Cache Terdesentralisasi (Cloudflare KV)**: Sesi admin dan cache rute cepat dengan latensi milidetik.
- 📁 **Penyimpanan Media Skala Besar (Cloudflare R2)**: Kompatibel dengan S3 API, tanpa biaya keluar (_zero egress fees_).
- 🎨 **Tema Bawaan Modern**: Mengadopsi tata letak portal majalah/berita elegan dengan identitas resmi CMSMu.
- 📦 **Ekosistem Plugin Fleksibel**:
  - 🔄 **OTA Update Engine**: Pembaruan sistem dan migrasi otomatis over-the-air (terproteksi dari penghapusan tidak sengaja).
  - 🔑 **Single Sign-On (SSO)**: Siap pakai untuk autentikasi terpadu (dapat diaktifkan/dinonaktifkan via Plugin Manager).
  - 📰 **Sindikasi Berita & Meja Kurasi**: Agregator feed RSS dan peninjauan redaksi.
- 🛡️ **Zero Hardcode & Bersih Kredensial**: Tidak ada rahasia pribadi pengembang yang tertanam; siap pakai untuk akun Cloudflare Anda sendiri.

---

## ⚡ Instalasi Cepat (1-Click CLI Setup Wizard)

Pastikan Anda telah memasang **Node.js (>= 22)** dan akun [Cloudflare](https://dash.cloudflare.com) (gratis).

### 1. Clone Repositori

```bash
git clone https://github.com/cakipin/cmsMu-go.git
cd cmsMu-go
```

### 2. Pasang Dependensi

```bash
npm install
```

### 3. Jalankan Setup Wizard Otomatis

```bash
npm run setup
```

Wizard interaktif ini akan memandu Anda:

1. Memeriksa login Cloudflare via `npx wrangler login`.
2. Otomatis membuat database Cloudflare D1 (`cmsmu-db`).
3. Otomatis membuat KV Namespace untuk Session dan Cache.
4. Otomatis membuat bucket Cloudflare R2 untuk media uploads (`cmsmu-media`).
5. Memperbarui `wrangler.jsonc` dengan ID sumber daya akun Cloudflare Anda.
6. Menginisialisasi skema tabel database D1 secara instan.

### 4. Uji Coba Lokal

```bash
npm run dev
```

Buka browser di `http://localhost:4321`. Panel admin dapat diakses di `http://localhost:4321/admin`.

### 5. Deploy ke Akun Cloudflare Anda

```bash
npm run deploy
```

Situs Anda akan langsung terbit di domain `*.pages.dev` Cloudflare gratis dengan sertifikat SSL otomatis!

---

## 📖 Dokumentasi Lengkap

Panduan konfigurasi manual dan instalasi tingkat lanjut dapat dilihat di:
👉 **[Panduan Instalasi Lengkap (docs/INSTALLATION.md)](docs/INSTALLATION.md)**

---

## 🛠️ Perintah Utama (Scripts)

| Perintah         | Deskripsi                                                        |
| ---------------- | ---------------------------------------------------------------- |
| `npm run setup`  | Menjalankan Wizard Otomatis Cloudflare (D1, KV, R2, Schema)      |
| `npm run dev`    | Menjalankan server pengembangan lokal di `http://localhost:4321` |
| `npm run build`  | Mengompilasi aplikasi serverless untuk deployment                |
| `npm run deploy` | Mengompilasi dan mendeploy langsung ke Cloudflare Pages          |

---

## 📜 Lisensi & Kontribusi

CMSMu dirilis di bawah lisensi terbuka untuk memajukan ekosistem media digital komunitas dan persyarikatan.
Dikembangkan dengan ❤️ oleh **CMSMu Core Team**.
