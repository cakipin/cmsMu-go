import type { ThemeContext, ThemeStructure } from "../types";
import { _layout } from "./layout";
import { renderHome } from "./home";
import { renderSingle } from "./single";
import { renderSingleVideo } from "./single-video";
import { renderCategory } from "./category";
import { renderSearch } from "./search";
import { renderTag } from "./tag";
import { renderPage } from "./page";
import { renderAgen, renderBerlangganan, renderKonsultasi } from "./components";
import { renderMajalahList, renderMajalahReader } from "./emagazine";
import { renderUserProfile } from "./user-profile";

const SuaraAisyiyah: ThemeStructure = {
  name: "Suara 'Aisyiyah",
  version: "1.0.0",
  author: "CmsMu",
  _brand(ctx?: any) {
    const logoSrc = ctx && ctx.site_logo ? ctx.site_logo : "/logo-cmsmu.webp";
    const siteTitle = ctx && ctx.site_title ? ctx.site_title : "CMSMu Portal";
    return `<a href="/" class="header-brand-link" style="display:inline-flex;align-items:center;text-decoration:none;"><img src="${logoSrc}" alt="${siteTitle}" class="logo-img" style="height:44px;width:auto;object-fit:contain;" onerror="this.outerHTML='<h1 style=\\'font-weight:900;color:#0d9488;font-size:24px;margin:0;\\'>CMSMu</h1>'" /></a>`;
  },

  /**
   * loadHomeData — Data hook untuk homepage Suara Aisyiyah.
   *
   * Nama kategori rubrik sepenuhnya dinamis dari tabel settings:
   *   sa_rubrik_hikmah, sa_rubrik_keluarga_sakinah, sa_rubrik_kalam,
   *   sa_rubrik_wawasan, sa_rubrik_gaya_hidup, sa_rubrik_perempuan,
   *   sa_rubrik_inspirasi, sa_rubrik_muda, sa_rubrik_sains_tekno
   *
   * Admin dapat mengubah nama kategori rubrik kapan saja dari panel admin
   * tanpa menyentuh kode. Fallback ke nama default Indonesia hanya jika
   * settings key belum dikonfigurasi.
   *
   * Kontrak dengan Core: terima (db, settings, generic), kembalikan
   * plain object yang akan di-merge ke structuredData.
   */
  async loadHomeData(
    db: any,
    settings: Record<string, any>,
    _generic: Record<string, any>
  ): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    // ─── Peta Rubrik (Zero Hardcode) ────────────────────────────────────
    // Nama kategori tiap rubrik dibaca dari settings. Admin bisa mengubah
    // pemetaan ini dari panel admin tanpa deploy ulang.
    // Format settings key: sa_rubrik_<slug>
    // ─────────────────────────────────────────────────────────────────────
    const rubrikMap = [
      {
        key: "hikmah",
        settingsKey: "sa_rubrik_hikmah",
        fallback: "Hikmah",
        limit: 4,
      },
      {
        key: "keluargaSakinah",
        settingsKey: "sa_rubrik_keluarga_sakinah",
        fallback: "Keluarga Sakinah",
        limit: 3,
      },
      {
        key: "kalam",
        settingsKey: "sa_rubrik_kalam",
        fallback: "Kalam",
        limit: 3,
      },
      {
        key: "wawasan",
        settingsKey: "sa_rubrik_wawasan",
        fallback: "Wawasan",
        limit: 4,
      },
      {
        key: "gayaHidup",
        settingsKey: "sa_rubrik_gaya_hidup",
        fallback: "Gaya Hidup",
        limit: 3,
      },
      {
        key: "perempuan",
        settingsKey: "sa_rubrik_perempuan",
        fallback: "Perempuan",
        limit: 3,
      },
      {
        key: "inspirasi",
        settingsKey: "sa_rubrik_inspirasi",
        fallback: "Inspirasi",
        limit: 3,
      },
      {
        key: "muda",
        settingsKey: "sa_rubrik_muda",
        fallback: "Muda",
        limit: 3,
      },
      {
        key: "sosioTekno",
        settingsKey: "sa_rubrik_sains_tekno",
        fallback: "Sains dan Tekno",
        limit: 3,
      },
    ];

    // Query tiap rubrik secara independen — satu rubrik kosong tidak crash homepage
    for (const rubrik of rubrikMap) {
      const catName =
        (settings[rubrik.settingsKey] || "").trim() || rubrik.fallback;
      try {
        const rows: any = await db
          .prepare(
            "SELECT id, title, slug, category, featured_image, created_at, excerpt, type, video_url, views FROM posts WHERE status='publish' AND lower(category) = lower(?) ORDER BY created_at DESC LIMIT ?"
          )
          .bind(catName, rubrik.limit)
          .all();
        result[rubrik.key] = rows?.results || [];
      } catch (_) {
        result[rubrik.key] = [];
      }
    }

    // ─── Liputan Haji (dikontrol via sa_haji_category di admin) ─────────
    const hajiCat = (settings["sa_haji_category"] || "").trim() || "Haji";
    try {
      const hajiRows: any = await db
        .prepare(
          "SELECT id, title, slug, category, featured_image, created_at, excerpt, type, video_url, views FROM posts WHERE status='publish' AND lower(category) = lower(?) ORDER BY created_at DESC LIMIT 4"
        )
        .bind(hajiCat)
        .all();
      result.liputanHaji = hajiRows?.results || [];
    } catch (_) {
      result.liputanHaji = [];
    }

    // ─── Tulisan Populer (by views — murni dinamis, tanpa filter kategori) ─
    try {
      const popRows: any = await db
        .prepare(
          "SELECT id, title, slug, category, featured_image, created_at, excerpt, type, video_url, views FROM posts WHERE status='publish' ORDER BY views DESC, created_at DESC LIMIT 6"
        )
        .all();
      result.popular = popRows?.results || [];
    } catch (_) {
      result.popular = [];
    }

    // ─── Video (by type='video' atau video_url terisi) ───────────────────
    try {
      const vidRows: any = await db
        .prepare(
          "SELECT id, title, slug, category, featured_image, created_at, excerpt, type, video_url, views FROM posts WHERE status='publish' AND (type='video' OR (video_url IS NOT NULL AND trim(video_url) != '')) ORDER BY created_at DESC LIMIT 6"
        )
        .all();
      result.videos = vidRows?.results || [];
    } catch (_) {
      result.videos = [];
    }

    return result;
  },

  _layout,
  renderHome,
  renderSingle,
  renderSingleVideo,
  renderAgen,
  renderKonsultasi,
  renderCategory,
  renderSearch,
  renderTag,
  renderBerlangganan,
  renderMajalahList,
  renderMajalahReader,
  renderUserProfile,
  renderPage,
  render404(ctx: ThemeContext) {
    return this._layout(
      '<div class="container empty"><h1>404</h1><p>Halaman yang Anda cari tidak ditemukan.</p><br><a href="/" class="sa-back-link">&larr; Kembali ke Beranda</a></div>',
      "Tidak ditemukan",
      ctx
    );
  },
};

export default SuaraAisyiyah;
