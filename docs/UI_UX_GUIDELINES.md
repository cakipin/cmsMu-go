# Panduan UI/UX & Standar Desain (Tasteskill & Design Tokens)
## Platform Newsroom & Media Aggregator Muhammadiyah

Dokumen ini memuat standar desain antarmuka pengguna (UI), arsitektur token CSS, aturan sidebar *Dual-State Icon-Only Rail*, serta pengalaman pembaca (*reader experience*) sesuai prinsip Anti-Slop & Kepatuhan SOP.

---

## 1. Arsitektur Token Desain (Semantic CSS Variables)

Dilarang menggunakan kode warna hardcoded hex di dalam komponen UI. Seluruh komponen wajib mengacu pada Semantic Tokens:

```css
:root {
  /* Mode Siang (Light Theme) */
  --bg-canvas: #f8fafc;           /* Slate 50 - Latar belakang halaman */
  --bg-surface: #ffffff;          /* Putih murni - Card, Panel, Modal */
  --bg-surface-elevated: #ffffff; /* Dropdown, Floating Popover */
  
  --border-subtle: #e2e8f0;       /* Slate 200 - Garis pemisah halus */
  --border-strong: #cbd5e1;       /* Slate 300 - Garis fokus / border input */
  
  --text-primary: #0f172a;        /* Slate 900 - Judul utama & heading (Kontras 15:1) */
  --text-secondary: #475569;      /* Slate 600 - Body text artikel (Kontras 7:1) */
  --text-muted: #64748b;          /* Slate 500 - Timestamp, metadata, footer */
  
  /* Identitas Brand Muhammadiyah */
  --accent-primary: #005a36;      /* Hijau Tua Muhammadiyah */
  --accent-hover: #004529;        /* State hover / aktif */
  --accent-secondary: #177d99;    /* Biru M-ID */
  --accent-surface: #e8f5e9;      /* Background badge / tag aktif */
  
  --danger: #dc2626;
  --warning: #d97706;
  --success: #16a34a;
}

[data-theme='dark'] {
  /* Mode Malam (Dark Theme - Deep Slate, Bukan Hitam Pekat) */
  --bg-canvas: #090d16;           /* Slate 950 pekat elegan */
  --bg-surface: #111827;          /* Gray 900 - Card & Panel */
  --bg-surface-elevated: #1f2937; /* Gray 800 - Popover & Modal */
  
  --border-subtle: #1e293b;       /* Slate 800 */
  --border-strong: #334155;       /* Slate 700 */
  
  --text-primary: #f8fafc;        /* Slate 50 - Judul (Kontras 14:1) */
  --text-secondary: #94a3b8;      /* Slate 400 - Teks artikel (Kontras 6.5:1) */
  --text-muted: #64748b;          /* Slate 500 - Timestamp */
  
  --accent-primary: #10b981;      /* Hijau Emerald terang untuk mode gelap */
  --accent-hover: #34d399;
  --accent-secondary: #38bdf8;    /* Biru cyan untuk dark mode */
  --accent-surface: #064e3b;
}
```

---

## 2. Standar Sidebar Newsroom CMS (Dual-State Rail)

Sidebar meja redaksi dirancang dengan dua status visual tanpa menghilangkan navigasi:

```
Expanded State (~250px)                     Collapsed State (68px Rail)
┌─────────────────────────┐                 ┌──────┐
│ [M] Muhammadiyah News   │                 │ [M]  │
├─────────────────────────┤                 ├──────┤
│ 📰 Berita Masuk    [12] │  ──[Toggle]──►  │ [📰] │ ──► [Tooltip: Berita Masuk (12)]
│ ✍️ Tulis Liputan        │                 │ [✍️] │
│ 🔄 Meja Agregator   [5] │                 │ [🔄] │
│ ⚙️ Pengaturan           │                 │ [⚙️] │
├─────────────────────────┤                 ├──────┤
│ 👤 Ahmad Fauzi (Editor) │                 │ [👤] │
└─────────────────────────┘                 └──────┘
```

### Aturan Spesifikasi:
1. **Status Terbuka (Expanded, 250px):** Menampilkan logo Muhammadiyah ID, label menu lengkap, badge angka antrean kurasi, dan strip profil redaktur di bagian bawah.
2. **Status Tertutup (Collapsed, 68px):** Sidebar **tidak menghilang**, melainkan menyusut menjadi **Icon-Only Rail** simetris berpusat di tengah dengan *floating tooltip* saat ikon di-hover.
3. **Transisi Animasi:** Wajib menggunakan transisi mulus:
   ```css
   transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
   ```

---

## 3. Desain Tampilan Pembaca Artikel (*Clean Editorial Reader*)

### 3.1 Tipografi & Golden Ratio Tata Letak
* **Font Judul:** Sans-serif tegas berwibawa (*Plus Jakarta Sans* / *Inter*), ukuran `32px - 40px`, bobot `700 (Bold)`.
* **Font Body Teks:** Ukuran `18px (1.125rem)`, `line-height: 1.8`, warna `var(--text-secondary)`.
* **Lebar Kolom Fokus:** Dibatasi maksimal `700px` di tengah layar agar mata pembaca tidak lelah melompat dari baris ke baris.

### 3.2 Komponen Modern Pembaca
1. **Reading Progress Indicator:** Bar hijau tipis (`height: 3px`) menempel di paling atas viewport saat layar di-scroll.
2. **Metadata Strip:** Menampilkan tanggal tayang, nama jurnalis/sumber, dan estimasi waktu baca (`⏱ 3 Menit Membaca`).
3. **Kartu Atribusi Sumber Asli (Clean Banner):**
   ```html
   <aside class="syndication-badge">
     <div class="icon">🔗</div>
     <div class="content">
       <span class="label">Sumber Terverifikasi</span>
       <p>Disadur dari <strong>PWMU.CO</strong> untuk kepentingan syiar persyarikatan.</p>
     </div>
     <a href="https://pwmu.co/..." target="_blank" rel="noopener canonical">Buka Artikel Asli ↗</a>
   </aside>
   ```
4. **Gambar Responsif dengan WebP Sideload:**
   * Sudut melengkung halus (`border-radius: 10px`), bayangan lembut, dan takarir foto (*caption*) di bawah gambar dengan teks muted berukuran `14px`.

---

## 4. Standar UI Mobile (Responsif Ponsel)

1. **Android System Insets (SafeArea):**
   * Seluruh tombol melayang (*sticky action bar*, tombol kirim komentar, drawer navigasi) wajib memiliki padding bawah minimal `env(safe-area-inset-bottom, 24px)`.
   * Tombol aksi **dilarang keras** bertumpukan dengan gesture bar atau 3-button navigation Android.
2. **Pull-to-Refresh:**
   * Listing berita dan antrean kurasi redaksi pada perangkat sentuh dilengkapi gestur tarik ke bawah (*pull-to-refresh*) dengan indikator warna primer (`#005A36`).
3. **Mikro-Interaksi Tombol:**
   * Efek sentuh responsif: `active:scale-[0.98]`, transisi tombol `transition: transform 0.15s ease`.
