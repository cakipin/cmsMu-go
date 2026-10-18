# 🔒 ARSITEKTUR ISOLASI MODUL & PENGUNCIAN CORE (`CORE LOCK`)

Dokumen ini adalah **Kontrak Batas Modul Mutlak (Strict Module Boundary)** untuk seluruh agen AI (`@task-planner`, `@expert-developer`, `@ui-ux-engineer`, `@qa-engineer`, `@infra-engineer`) yang bekerja di repositori **Core cmsMu**.

---

## 1. Prinsip Utama: Core Terkunci, Fitur Terisolasi

1. **Core Engine Sudah Stabil & Terkunci (`core-lock.json`):**
   - Seluruh berkas pondasi sistem telah dikunci dengan *cryptographic hash* **SHA-256** di dalam berkas [`core-lock.json`](../core-lock.json) dan diverifikasi otomatis oleh [`scripts/verify-core-lock.mjs`](../scripts/verify-core-lock.mjs).
   - Apabila agen memodifikasi berkas di dalam daftar *Locked Core* saat memperbaiki fitur biasa, perintah `pnpm run check:lock`, `pnpm run ci:check`, dan `pnpm run predeploy` akan **MEMBLOKIR BUILD/DEPLOY (EXIT 1)**.
2. **Auto-Merge Modular (`cms.logic.ts`):**
   - File [`cms.logic.ts`](../apps/cms-api/src/modules/admin/ui/blocks/cms.logic.ts) secara otomatis menggabungkan (`...window.__CMS_<MODULE>`) seluruh state dan fungsi dari tiap modul di folder `logic/`.
   - **DILARANG KERAS** menambahkan *bridge* fungsi manual di `cms.logic.ts` atau menaruh logika fitur di `core.logic.ts`.

---

## 2. Daftar Berkas Core & Editor yang Dikunci Mutlak (`LOCKED CORE FILES` - 17 Berkas)

Agen **HARAM** menyentuh berkas berikut ketika mengerjakan perbaikan fitur/modul:
- `apps/cms-api/src/index.ts` *(Global Router & Auth Whitelist)*
- `apps/cms-api/src/middleware/auth.ts` *(JWT & RBAC Middleware)*
- `apps/cms-api/src/modules/admin/init.ts` *(Core Sidebar Registry)*
- `apps/cms-api/src/modules/admin/ui/view.ts` *(Master Layout Renderer)*
- `apps/cms-api/src/modules/admin/ui/blocks/cms.logic.ts` *(Master Module Assembler)*
- `apps/cms-api/src/modules/admin/ui/blocks/logic/core.logic.ts` *(Core Fetch, Cache Purge, Parallel Loader)*
- `apps/cms-api/src/modules/admin/ui/blocks/sidebar.ts` *(Sidebar Navigation Component)*
- `apps/cms-api/src/modules/admin/ui/blocks/topbar.ts` *(Topbar Header Component)*
- `apps/cms-api/src/modules/admin/ui/blocks/custom-editor.ts` *(Locked Stable Custom Editor Barrel)*
- `apps/cms-api/src/modules/admin/ui/blocks/editor.page.ts` *(Locked Stable Editor Page)*
- `apps/cms-api/src/modules/admin/ui/blocks/editor/editor-form.ts` *(Locked Stable Slug & Editor Form)*
- `apps/cms-api/src/modules/admin/ui/blocks/editor/editor-autosave.ts` *(Locked Stable Dual-Layer Auto-Save Draft)*
- `apps/cms-api/src/modules/admin/ui/blocks/editor/custom-editor/custom-editor.cleaner.ts` *(Locked Stable HTML Cleaner)*
- `apps/cms-api/src/modules/admin/ui/blocks/editor/custom-editor/custom-editor.logic.ts` *(Locked Stable Editor Engine Logic)*
- `apps/cms-api/src/modules/admin/ui/blocks/editor/custom-editor/custom-editor.styles.ts` *(Locked Stable Editor Styles)*
- `apps/cms-api/src/modules/admin/ui/blocks/editor/custom-editor/custom-editor.template.ts` *(Locked Stable Editor Template)*
- `packages/db/src/schema.ts` *(Core Database Schema)*

---

## 3. Matriks Isolasi Modul Fitur (Tempat Kerja Agen per Fitur)

Saat User meminta perbaikan atau pengembangan pada suatu fitur, agen **HANYA BOLEH** memodifikasi berkas di baris modul tersebut:

| Nama Modul / Fitur | File Logic Frontend (Isolated) | File UI Template Admin | File Backend API Router |
| :--- | :--- | :--- | :--- |
| **📝 Modul Konten (Posts, Pages, Editor)** | `apps/cms-api/src/modules/admin/ui/blocks/logic/post.logic.ts`<br>`apps/cms-api/src/modules/admin/ui/blocks/custom-editor.ts` | `posts.page.ts`<br>`static.page.ts`<br>`editor.page.ts`<br>`editor/*` | `apps/cms-api/src/modules/posts/*`<br>`apps/cms-api/src/modules/pages/*`<br>`apps/cms-api/src/modules/contents/*` |
| **👥 Modul Users & Langganan** | `apps/cms-api/src/modules/admin/ui/blocks/logic/users.logic.ts` | `users.page.ts`<br>`profile.page.ts`<br>`sso.page.ts` | `apps/cms-api/src/modules/users/*` |
| **🖼️ Modul Media & Galeri** | `apps/cms-api/src/modules/admin/ui/blocks/logic/media.logic.ts` | `media.page.ts` | `apps/cms-api/src/modules/media/*` |
| **🧭 Modul Navigasi Menu** | `apps/cms-api/src/modules/admin/ui/blocks/logic/menus.logic.ts` | `menus.page.ts` | `apps/cms-api/src/modules/menus/*` |
| **🎨 Modul Tema (Themes)** | `apps/cms-api/src/modules/admin/ui/blocks/logic/themes.logic.ts` | `themes.page.ts` | `apps/cms-api/src/modules/theme/*`<br>`apps/cms-api/src/modules/theme-editor/*` |
| **🔌 Modul Ekstensi & Plugin** | `apps/cms-api/src/modules/admin/ui/blocks/logic/plugins.logic.ts` | `plugins.page.ts` | `apps/cms-api/src/modules/plugins/*` |
| **⚙️ Modul Settings, SEO & OTA** | `apps/cms-api/src/modules/admin/ui/blocks/logic/settings.logic.ts` | `settings.page.ts`<br>`seo.page.ts` | `apps/cms-api/src/modules/settings/*`<br>`apps/cms-api/src/addons/ota/*` |

---

## 4. Perintah Verifikasi

- **Cek Integritas Kunci Core:**
  ```bash
  pnpm run check:lock
  ```
- **Perbarui Kunci Core (HANYA jika User secara eksplisit memerintahkan perubahan Core):**
  ```bash
  pnpm run core:relock
  ```
