# Action Plan: Refactor Core Plugin System (WordPress-Style)

## Scope
Pekerjaan dilakukan **hanya** pada direktori `/Users/cakiphin/projects/cmsMu/core cmsMu`. Folder client (`suaraaisyiyah.id`, dsb) **HARAM** disentuh selama proses ini.

## Root Cause
Saat ini pendaftaran addons/plugin (`ota`, `aggregator`, `newsroom`) masih bersifat *hardcoded* di `src/cms/addons/index.ts` dan info plugin di-hardcode di `src/cms/modules/plugins/plugins.router.ts`. Hal ini memaksa *client* harus memodifikasi kode core jika ingin mendaftarkan plugin/tema khusus, yang kemudian hancur tertimpa saat *core sync/update*.

## Solusi & Arsitektur Baru
Mengadopsi pola WordPress (Discovery + Hooks):
1. **Client-Owned Plugins Directory**: Mendaftarkan _glob pattern_ yang otomatis memuat plugin dari `src/plugins/*` (bebas sync/client-owned) dan `src/cms/addons/*` (core).
2. **Auto-Discovery**: Menggunakan `import.meta.glob` via Vite untuk *lazy* / *eager load* plugin.
3. **Hooks API**: Membuat sistem *Action & Filter* (`addAction`, `applyFilters`) agar plugin bisa menyisipkan *behavior* tanpa mengedit file core (contoh: *routing*, modifikasi respons).
4. **Plugin Contract (`definePlugin`)**: Menyediakan standar kontrak terpusat agar plugin bisa mendaftarkan identitas, *router*, *admin menu*, dan *view* dalam satu lifecycle (`init`).
5. **State Activation**: Routing dan view akan memeriksa state plugin dari *database* (Tabel `plugins`) untuk menentukan apakah *route* dan menu diaktifkan atau di-_block_ jika plugin tidak aktif.

## Daftar File yang Akan Disentuh
1. **(Buat)** `src/cms/plugin-api/types.ts`: Definisi `definePlugin` dan type Hooks.
2. **(Buat)** `src/cms/plugin-api/hooks.ts`: Implementasi `addAction`, `doAction`, `addFilter`, `applyFilters`.
3. **(Buat)** `src/cms/plugin-api/loader.ts`: Glob loader `import.meta.glob('../../addons/*/index.ts')` dan `import.meta.glob('../../../plugins/*/index.ts')`.
4. **(Modifikasi)** `src/cms/addons/index.ts`: Mengganti import hardcoded dengan memanggil loader dan me-mount router dinamis (tetap kompatibel dengan Hono).
5. **(Modifikasi)** `src/cms/modules/plugins/plugins.router.ts`: Menghapus array `defaultPlugins` yang hardcoded, membaca state list plugin langsung dari *Loader* untuk di-sync dengan D1 Database.
6. **(Modifikasi)** `src/cms/registry/admin-menu.ts`: Tetap dipertahankan untuk backward compatibility (menjaga `registerPluginMenu`, dsb).
7. **(Refactor Addon)** `src/cms/addons/ota/index.ts`, `aggregator/index.ts`, `newsroom/index.ts`: Membuat file index standar plugin menggunakan kontrak `definePlugin`.

## Langkah Eksekusi (Setelah Approval)
1. Buat Hooks API dan Plugin Contract & Loader.
2. Refactor Addons existing (OTA, Aggregator, Newsroom) ke standar `definePlugin`.
3. Pasang Loader ke dalam `src/cms/addons/index.ts` agar Hono me-mount *routes* sesuai lifecycle aktif.
4. Update router *plugins dashboard* untuk mendeteksi *plugins* yang berhasil di-load via Vite.
5. Verifikasi *Smoke Test* (`npm run build`).

Mohon approvalnya untuk mengeksekusi Action Plan ini.
