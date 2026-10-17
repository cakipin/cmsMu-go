# 🎨 CMSMu Starter Theme Boilerplate

Direktori ini adalah template pondasi tema resmi CMSMu untuk pengembang yang ingin membuat tema kustom baru tanpa memodifikasi Core CMSMu.

---

## 🚀 Cara Membuat & Menggunakan Tema Baru

1. **Duplikasi Folder Ini:**
   Salin folder `starter` menjadi nama tema Anda, misalnya:
   ```bash
   cp -r apps/cms-api/src/themes/starter apps/cms-api/src/themes/portal-kampus
   ```

2. **Sesuaikan Metadata di `theme.json`:**
   Ubah `id`, `name`, `version`, dan `description` di dalam folder tema baru Anda.

3. **Kustomisasi Layout & Tampilan:**
   - `layout.ts`: Header, navbar, footer, styling CSS, dan struktur HTML dokumen.
   - `home.ts`: Tata letak beranda, hero carousel, rubrik sorotan, dan sidebar.
   - `single.ts`: Tata letak pembaca naskah artikel, penulis, dan tombol interaksi.
   - `category.ts`: Tata letak arsip kategori, tag topik, dan pencarian.

4. **Daftarkan Tema di `apps/cms-api/src/themes/registry.ts`:**
   Buka `apps/cms-api/src/themes/registry.ts` dan tambahkan tema Anda:
   ```typescript
   import PortalKampus from "./portal-kampus";

   export const availableThemes = [
     // ...,
     {
       id: "portal-kampus",
       name: "Portal Kampus Modern",
       version: "1.0.0",
       author: "Tim IT Kampus",
       description: "Tema portal resmi kampus berbasis CMSMu."
     }
   ];

   export const getActiveTheme = (id?: string) => {
     const themes: Record<string, any> = {
       default: DefaultTheme,
       "portal-kampus": PortalKampus,
     };
     return id && themes[id] ? themes[id] : DefaultTheme;
   };
   ```

5. **Aktifkan Tema:**
   Tema dapat diaktifkan melalui panel Admin di menu **Themes / Tampilan** atau melalui pembaruan database tabel `themes`.
