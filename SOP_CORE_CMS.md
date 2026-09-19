# STANDAR OPERASIONAL PROSEDUR (SOP) CORE CMSMU

## 📌 Ringkasan Prinsip Utama
1. **Modular Code (< 1000 baris/file)**: Seluruh file di `src/` harus di bawah 1000 baris, memisahkan routes, services, UI components, dan stylesheets.
2. **In-System Dialogs (SOP 16)**: Zero native `alert/confirm/prompt`. Gunakan `window.showToast()` dan `window.showConfirmDialog()`.
3. **Clean Clone Protocol**: 7 langkah isolasi kredensial, regenerasi JWT, pemisahan D1/R2, dan pembersihan `.wrangler/state/` saat kloning proyek baru.
4. **Deploy Staging First (Guardrail 1)**: Wajib Hard Stop di staging untuk verifikasi QA sebelum promosi ke production.

Lihat panduan lengkap di [docs/CORE_CMS_SOP.md](docs/CORE_CMS_SOP.md).
