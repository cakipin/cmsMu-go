# 📋 RENCANA CAKUPAN & INSTRUKSI KERJA TEKNIS (SCOPE PLAN & WBS)
## Penugasan: Expert Developer (cmsMu Core Engine & Admin UI)
**Fokus**: Perapian UI Users (Desktop Sejajar), Pembersihan Teks Sidebar "PLUGINS", dan Perbaikan Bug Modul Users.

---

## 1. Ringkasan & Tujuan Utama
Dokumen ini disusun sebagai panduan kerja deterministik bagi **Expert Developer** agar dapat mengeksekusi perbaikan tanpa ada deviasi, tanpa refactoring liar (*zero unsolicited refactor*), dan tanpa merusak tampilan mobile yang sudah stabil.

### Target Pekerjaan:
1. **Perapian UI Toolbar Users**: Menyejajarkan kolom input Pencarian (*Search*) dan dropdown *Role* di layar Desktop (`md:`), dengan **ketentuan mutlak tidak mengubah layout tampilan mobile** (*Zero Touch to Mobile*).
2. **Pembersihan Sidebar**: Menghilangkan teks header kelompok `"PLUGINS"` yang menggantung di sidebar admin, serta memperbaiki typo variabel template Alpine.js.
3. **Perbaikan Bug & Keamanan Modul Users**:
   - Membuka blokir pendaftaran akun publik pada `POST /api/users/register` di middleware whitelist.
   - Mengimplementasikan endpoint `PUT /api/users/profile-password` yang sebelumnya missing (mengakibatkan error 404 saat ganti password profil).
   - Memperbaiki penanganan *partial update* pada `PUT /api/users/:id` agar tidak merusak data kolom yang tidak dikirim.
   - Menambahkan proteksi *anti self-deletion lockout* pada `DELETE /api/users/:id`.

---

## 2. Batasan Cakupan File (Scope Boundaries)

### ✅ File In-Scope (Hanya 6 file ini yang boleh disentuh):
1. `apps/cms-api/src/modules/admin/ui/blocks/users.page.ts` (Hanya blok Toolbar baris 19–46)
2. `apps/cms-api/src/modules/admin/ui/blocks/sidebar.ts` (Hanya loop `groupName` baris 62 & fix baris 71)
3. `apps/cms-api/src/plugins/starter/index.ts` (Penyesuaian nama grup ke `"System"`)
4. `apps/cms-api/src/modules/admin/init.ts` (Pembersihan dummy menu "Plugins")
5. `apps/cms-api/src/index.ts` (Whitelist rute register pada middleware auth)
6. `apps/cms-api/src/modules/users/users.router.ts` (Implementasi endpoint profile-password, sanitasi update, & guard delete)

### ⛔ File Out-of-Scope (DILARANG KERAS DISENTUH):
* Seluruh skema database di `packages/db/` (Tabel `users`, `posts`, dsb sudah stabil).
* Modul-modul inti lain: `posts.router.ts`, `media.router.ts`, `ota.router.ts`, `pages.router.ts`.
* Tampilan mobile pada tabel users (`users.page.ts` blok card mobile baris 117–170).

---

## 3. Work Breakdown Structure (WBS) & Instruksi Detail

### 🔹 TASK 1: Merapikan Toolbar Users Desktop (Sejajar)
* **File**: `apps/cms-api/src/modules/admin/ui/blocks/users.page.ts`
* **Area**: Baris 19–46 (Toolbar Pencarian & Role)
* **Kebutuhan**:
  - Pada layar Mobile (`< 768px`): Elemen tetap tersusun vertikal bertumpuk (`flex flex-col gap-2.5`).
  - Pada layar Desktop (`>= 768px` / `md:`): Elemen input pencarian, label+dropdown role, dan tombol reset berada dalam **1 baris horizontal sejajar** (`md:flex-row md:items-center md:gap-3`).
  - Input pencarian mengisi sisa ruang (`flex-1`).
  - Ketinggian input (`py-2`) dan select dibuat seragam dan simetris.

```html
<!-- KODE SPESIFIKASI TASK 1 -->
  <!-- TOOLBAR: FILTER ROLE & PENCARIAN RESPONSIF -->
  <div class="bg-white p-3 rounded-lg border border-slate-200 mb-4 shadow-sm flex flex-col md:flex-row md:items-center gap-2.5 md:gap-3">
    <!-- Input Pencarian (Fleksibel) -->
    <div class="relative flex-1">
      <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
      <input type="text" x-model="searchUser" @input="userPage = 1" placeholder="Cari nama, username, email..." 
             class="input w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-md border border-slate-300 focus:border-blue-500 outline-none">
    </div>

    <!-- Filter Role & Tombol Reset (Sejajar di Desktop) -->
    <div class="flex items-center justify-between md:justify-end gap-2 shrink-0">
      <div class="flex items-center gap-2">
        <label class="text-xs font-semibold text-slate-600 shrink-0">Role:</label>
        <select x-model="filterUserRole" @change="userPage = 1" 
                class="input py-2 px-2.5 text-xs sm:text-sm rounded-md border border-slate-300 bg-white min-w-[150px] md:min-w-[180px] focus:border-blue-500 outline-none">
            <option value="all">Semua Role</option>
            <option value="superadmin">Superadmin</option>
            <option value="admin">Administrator</option>
            <option value="editor">Editor</option>
            <option value="penulis">Penulis</option>
            <option value="subscriber">Subscriber (Biasa)</option>
            <option value="subscriber_pro">⭐ Subscriber Pro</option>
        </select>
      </div>
      <button x-show="searchUser || filterUserRole !== 'all'" @click="searchUser=''; filterUserRole='all'; userPage=1" 
              class="btn py-2 px-3 text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md font-medium active:scale-95 transition-all shrink-0">
          Reset
      </button>
    </div>
  </div>
```

---

### 🔹 TASK 2: Pembersihan Teks "PLUGINS" dari Sidebar Admin
* **File Target 1**: `apps/cms-api/src/modules/admin/ui/blocks/sidebar.ts`
  - Baris 62: Ubah array kelompok menu:
    ```html
    <!-- SEBELUM: -->
    <template x-for="groupName in ['Content', 'Appearance', 'System', 'Plugins']">
    <!-- SESUDAH: -->
    <template x-for="groupName in ['Content', 'Appearance', 'System']">
    ```
  - Baris 71: Perbaiki typo variabel `m.pluginId`:
    ```html
    <!-- SEBELUM: -->
    <template x-if="(!menu.role || menu.role.includes(userRole) || userRole === 'superadmin' || (userRole === 'admin' && menu.role.includes('admin'))) && (!menu.pluginId || isPluginActive(m.pluginId))">
    <!-- SESUDAH: -->
    <template x-if="(!menu.role || menu.role.includes(userRole) || userRole === 'superadmin' || (userRole === 'admin' && menu.role.includes('admin'))) && (!menu.pluginId || isPluginActive(menu.pluginId))">
    ```
* **File Target 2**: `apps/cms-api/src/plugins/starter/index.ts`
  - Baris 16: Ubah `group: "Plugins"` menjadi `group: "System"`.
* **File Target 3**: `apps/cms-api/src/modules/admin/init.ts`
  - Baris 28–35: Hapus entri menu ber-group "Plugins".

---

### 🔹 TASK 3: Membuka Whitelist Pendaftaran Publik
* **File**: `apps/cms-api/src/index.ts`
* **Area**: Baris 74–100 (Middleware Auth Global)
* **Kebutuhan**: Tambahkan pemeriksaan `path === "/api/users/register"` ke kondisi `isWhitelisted`:
  ```typescript
  const isWhitelisted =
    path.includes("/login") ||
    path === "/api/users/register" ||
    path.startsWith("/api/public") ||
    path.startsWith("/api/users/sso") ||
    // ... rute lain tetap utuh
  ```

---

### 🔹 TASK 4: Perbaikan & Pengamanan Endpoint `users.router.ts`
* **File**: `apps/cms-api/src/modules/users/users.router.ts`
* **Kebutuhan**:
  1. **Tambahkan Endpoint `PUT /profile-password`**:
     - Membaca token dari header Authorization atau cookie `labmu_token`.
     - Memverifikasi token user dengan `verifyUserToken`.
     - Memvalidasi password saat ini (*current password*) terhadap database via `sha256`.
     - Melakukan hash pada password baru dan menyimpannya ke database.
  2. **Sanitasi Partial Update pada `PUT /:id`**:
     - Jangan menimpa field dengan `undefined`. Bentuk objek `updateData` hanya dari properti yang ada di request body.
  3. **Proteksi Anti Self-Deletion pada `DELETE /:id`**:
     - Ambil user aktif dari context (`c.get("user")`).
     - Jika `currentUser.id === id`, tolak penghapusan dengan pesan error: `"Dilarang menghapus akun Anda sendiri yang sedang aktif login!"`.

---

## 4. Kriteria Keberhasilan & Pengujian (Quality Gates)

| No | Parameter Pengujian | Indikator Keberhasilan |
| :--- | :--- | :--- |
| 1 | **Audit Tipe & Build** | Menjalankan `pnpm run check:packages` ➔ **0 error TypeScript**. |
| 2 | **Sidebar Visual** | Teks `PLUGINS` tidak lagi muncul di sidebar saat expanded maupun collapsed. |
| 3 | **Desktop Toolbar Alignment** | Input pencarian dan dropdown Role sejajar rapi dalam 1 baris di viewport desktop. |
| 4 | **Mobile Toolbar Responsiveness** | Tampilan mobile tetap bertumpuk tanpa ada overflow horizontal. |
| 5 | **Public Registration** | Request `POST /api/users/register` berhasil mengembalikan HTTP 200 (bukan 401). |
| 6 | **Profile Password** | Request `PUT /api/users/profile-password` berhasil mengubah password tanpa error 404. |
| 7 | **Self-Delete Protection** | Mencoba menghapus akun sendiri mengembalikan error status 400. |

---
**Instruksi Eksekusi**: Dokumen ini mengikat secara ketat. Dilarang mengubah file selain 6 file in-scope di atas.
