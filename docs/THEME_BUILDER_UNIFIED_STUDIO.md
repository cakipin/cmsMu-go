# 🏛️ PANDUAN cmsMu UNIFIED THEME STUDIO
## Arsitektur Satu Pintu Visual Canvas, Live Code Editor & Portabilitas JSON

---

## 1. 🎯 Latar Belakang & Filosofi "Satu Pintu"

cmsMu Unified Theme Studio menyatukan seluruh alur pembuatan, penyesuaian, dan distribusi tata letak tema ke dalam **Satu Pintu (Single Gateway)** pada Canvas Editor (`/theme-editor`):
1. **User-Friendly WYSIWYG**: Pengguna non-teknis dapat menyusun blok secara visual, mengatur warna, tipografi, dan mengisi konten.
2. **Portabilitas Penuh (Upload / Export JSON)**: Setiap halaman atau tema dapat diekspor menjadi berkas `.json` mandiri dan diimpor kembali ke halaman lain atau website cabang dengan sekali klik.
3. **Dual-Mode Live Studio**: Kemudahan beralih antara mode visual (`Visual Canvas`) dan mode kode (`Code JSON`) secara instan dengan validasi dua arah.
4. **Bebas AI Dummy Text & Keyboard Emoji**:
   - Seluruh template bawaan menggunakan salinan teks resmi berkarakter portal Muhammadiyah, 'Aisyiyah, dan Amal Usaha Muhammadiyah (AUM).
   - Seluruh ikon antarmuka menggunakan vektor SVG presisi dan elegan, tanpa emoji keyboard default.

---

## 2. 🗄️ Kontrak Data JSON Canvas (`CanvasPageData`)

Format penyimpanan di database Cloudflare D1 (`pages.body`) dan berkas ekspor `.json`:

```typescript
export interface CanvasPageData {
  content: Array<{
    type: string;                 // Tipe blok resmi dari BLOCK_CATALOG
    props: {
      id: string;                 // ID unik blok
      [key: string]: any;         // Properti spesifik blok
    };
  }>;
  root?: {
    props?: {
      title?: string;
      [key: string]: any;
    };
  };
  zones?: Record<string, any>;
}
```

---

## 3. 🛡️ Validator Otomatis (`validateCanvasPageData`)

Sebelum data JSON diterapkan ke canvas atau disimpan ke database D1, fungsi `validateCanvasPageData(input)` melakukan verifikasi ketat:
1. **Tipe Input**: Memastikan format adalah objek valid dengan array `content` atau array blok langsung (auto-wrap).
2. **Katalog Blok Resmi**: Memastikan setiap `block.type` terdaftar di `BLOCK_CATALOG` cmsMu (`SiteHeader`, `HeroSlider`, `Hero`, `Partners`, `FeatureGrid`, `Testimonial`, `RecentPosts`, `MagazineBigGrid`, `CallToAction`, `SiteFooter`, `CustomHTML`, `Spacer`). Blok ilegal/tak dikenal akan ditolak.
3. **Integritas Properti**: Memastikan `props.id` unik dan setiap nilai properti aman.

---

## 4. 📚 Pustaka Template Resmi cmsMu (`BUILTIN_CANVAS_PRESETS`)

cmsMu menyertakan 3 template bawaan berkualitas tinggi yang siap dimuat dengan 1 klik:

1. **`portal-berita-berkemajuan` (Portal Berita & Wawasan Berkemajuan)**:
   - Header terintegrasi dengan menu Warta Persyarikatan, Kajian Tarjih, dan Kolom Opini.
   - Hero Slider berita foto headline ganda.
   - Grid berita terkini (Recent Posts).
   - Jaringan media afiliasi (Suara 'Aisyiyah, LPEK, LazisMu, MPI).
   - Call-To-Action pengiriman naskah opini kader.
2. **`lembaga-pendidikan-aum` (Lembaga Pendidikan & Amal Usaha Unggul)**:
   - Header institusi pendidikan / pesantren Mu'allimin.
   - Hero pendaftaran santri baru (PPDB).
   - Grid pilar keunggulan (Tahfiz & Tarjih, Laboratorium Sains, Bilingual & Hizbul Wathan).
   - Testimonial wali murid & alumni berprestasi.
   - Warta kampus & agenda akademik.
3. **`majalah-suara-digital` (Majalah Digital & Opini Longform)**:
   - Header majalah perempuan berkemajuan.
   - Hero sorotan edisi bulanan & ketahanan keluarga sakinah.
   - Rubrik pilihan redaksi tajuk & khazanah.
   - Call-To-Action aktivasi langganan cetak & flipbook digital.

---

## 5. 🚀 Panduan Penggunaan di Canvas Editor

### A. Mengimpor Template JSON
1. Klik tombol **`[Import JSON]`** di toolbar studio atas.
2. Pilih tab **"Unggah Berkas (.json)"** lalu pilih file dari komputer Anda, atau pilih tab **"Tempel Teks JSON"** untuk menempelkan struktur blueprint.
3. Klik **`[Terapkan ke Canvas]`**. Sistem akan memvalidasi struktur dan canvas langsung ter-update seketika.

### B. Mengekspor Template JSON
1. Klik tombol **`[Export JSON]`** di toolbar studio atas.
2. Klik **`[Salin JSON]`** untuk menyalin ke clipboard atau klik **`[Unduh Berkas .json]`** untuk menyimpan berkas `cmsmu-template-[slug]-[tanggal].json`.

### C. Menggunakan Mode Live Code JSON
1. Klik tombol **`[Code JSON]`** di kiri toolbar.
2. Edit kode JSON langsung di editor monospace.
3. Gunakan tombol **`[Format Indent]`** untuk merapikan spasi.
4. Klik pada nama blok di panel kiri **"Kamus Blok cmsMu"** untuk menyisipkan cuplikan blok baru dengan 1 klik.
5. Klik **`[Terapkan ke Visual]`** untuk mengaplikasikan perubahan kembali ke pratinjau canvas.
