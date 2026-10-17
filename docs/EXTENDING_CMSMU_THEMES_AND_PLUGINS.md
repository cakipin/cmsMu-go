# 🏛️ Panduan Resmi Ekstensi CMSMu: Arsitektur Tema & Plugin

Panduan ini mengatur batas wilayah kerja pengembang (*scope boundaries*) dan tata cara pembuatan aplikasi baru di atas framework **`cmsMu-go`**.

---

## 1. Aturan Batas Wilayah Kerja Pengembang (Strict Core Immutability)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CORE CMSMU (READ-ONLY ENGINE)                │
│  - packages/core/              - apps/cms-api/src/modules/      │
│  - packages/db/                - apps/cms-api/src/middleware/   │
│  - packages/ui/                - OTA Update & Sync Engine       │
│  ⚠️ DILARANG MENGUBAH / MEMODIFIKASI BERKAS CORE SECARA LANGSUNG │
└───────────────────────────────┬─────────────────────────────────┘
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│     THEMES (TAMPILAN UI)      │   │    PLUGINS (LOGIKA BISNIS)    │
│  Lokasi:                      │   │  Lokasi:                      │
│  apps/cms-api/src/themes/     │   │  apps/cms-api/src/plugins/    │
│                               │   │                               │
│  - Desain & tata letak publik │   │  - Endpoint API baru (Hono)   │
│  - Tipografi & warna          │   │  - Menu & View Dashboard SPA  │
│  - Komponen halaman           │   │  - Logika transaksi khusus    │
└───────────────────────────────┘   └───────────────────────────────┘
```

### Mengapa Core Bersifat Read-Only?
CMSMu-Go dilengkapi dengan **Over-The-Air (OTA) Engine** dan mekanisme sinkronisasi repositori berkala (`git pull upstream`). Jika pengembang mengubah baris kode di dalam direktori Core, pembaruan keamanan dan fitur masa depan dari pusat akan mengalami konflik atau gagal diterapkan.

---

## 2. Cara Mengembangkan Tema Baru (Theme Development)

Seluruh tema baru ditempatkan di dalam folder `apps/cms-api/src/themes/<nama-tema>/`.

### Struktur Tema Standar:
```text
apps/cms-api/src/themes/my-theme/
├── theme.json         # Manifest identitas tema (id, name, version, author)
├── utils.ts           # Helper fungsi sanitasi & formatting
├── layout.ts          # Kerangka HTML5, header, footer, & CSS Tokens
├── home.ts            # Tampilan beranda portal
├── single.ts          # Tampilan pembaca naskah artikel
├── category.ts        # Tampilan arsip kategori, tag, dan pencarian
└── index.ts           # Entrypoint tema (mengimplementasikan ThemeStructure)
```

### Langkah Cepat Membuat Tema Baru:
1. Salin folder template starter yang telah disediakan:
   ```bash
   cp -r apps/cms-api/src/themes/starter apps/cms-api/src/themes/my-theme
   ```
2. Sesuaikan berkas tampilan sesuai kebutuhan desain Anda.
3. Daftarkan tema Anda di `apps/cms-api/src/themes/registry.ts`:
   ```typescript
   import MyTheme from "./my-theme";

   export const availableThemes = [
     // ...,
     {
       id: "my-theme",
       name: "My Custom Portal",
       version: "1.0.0",
       author: "Developer Name",
       description: "Deskripsi tema kustom Anda"
     }
   ];

   export const getActiveTheme = (id?: string) => {
     const themes: Record<string, any> = {
       default: DefaultTheme,
       "my-theme": MyTheme,
     };
     return id && themes[id] ? themes[id] : DefaultTheme;
   };
   ```

---

## 3. Cara Mengembangkan Plugin Baru (Plugin Development)

Seluruh fitur bisnis baru, integrasi API pihak ketiga, atau modul administrasi kustom ditempatkan di dalam folder `apps/cms-api/src/plugins/<nama-plugin>/`.

### Struktur Plugin Standar:
```text
apps/cms-api/src/plugins/my-feature/
├── plugin.json        # Metadata manifest plugin
├── router.ts          # Sub-router Hono untuk endpoint API (/api/plugins/my-feature/*)
├── view.ts            # Tampilan SPA Admin berbasis Alpine.js & Tailwind
└── index.ts           # Inisialisasi: mount route, menu admin, dan view
```

### Langkah Cepat Membuat Plugin Baru:
1. Salin folder starter plugin yang telah disediakan:
   ```bash
   cp -r apps/cms-api/src/plugins/starter apps/cms-api/src/plugins/my-feature
   ```
2. Definisikan endpoint API Anda pada `router.ts`.
3. Rancang antarmuka dashboard admin pada `view.ts`.
4. Daftarkan plugin Anda di `apps/cms-api/src/plugins/index.ts`:
   ```typescript
   import type { Hono } from "hono";
   import type { Bindings } from "../types";
   import registerStarterPlugin from "./starter";
   import registerMyFeature from "./my-feature";

   export default function registerCustomPlugins(app: Hono<{ Bindings: Bindings }>) {
     registerStarterPlugin(app);
     registerMyFeature(app); // <- Daftarkan plugin Anda di sini
   }
   ```

### Hook & Registry Admin yang Tersedia:
- **`registerPluginMenu(item)`**: Menambahkan menu baru di sidebar admin panel secara dinamis.
- **`registerPluginView(viewName, htmlOrFn)`**: Mendaftarkan tampilan DOM template admin SPA.
- **`registerPluginScript(script)`**: Menyuntikkan skrip JavaScript client-side ke dalam dashboard.

---

## 4. Standar Kualitas & Larangan Keras (Guardrails)

1. **Anti-Hardcode (Zero Hardcode Policy):**
   Dilarang keras menanamkan data statis seperti URL, kategori, nama media, atau kredensial langsung di dalam kode. Seluruh data dinamis wajib bersumber dari real database (`c.env.DB`) atau variabel lingkungan Cloudflare.
2. **In-System Dialog Only:**
   Dilarang menggunakan popup native browser (`window.alert()`, `window.confirm()`). Gunakan komponen In-System Toast atau Modal dialog kustom yang terintegrasi di dalam DOM.
3. **Validasi Kompilasi & Tipe:**
   Pastikan seluruh kode tema dan plugin lolos audit statis tanpa error:
   ```bash
   pnpm run build
   ```
