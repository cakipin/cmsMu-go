/**
 * 🎨 cmsMu Canvas Field Schema & Block Catalog
 * Standar definisi field inspektor dan katalog blok visual builder mandiri.
 * 100% Zero External NPM Dependency.
 */

export interface FieldDefinition {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "color" | "image" | "array";
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: any;
  arrayFields?: Record<string, FieldDefinition>;
}

export interface BlockManifest {
  type: string;
  name: string;
  category: "header" | "hero" | "content" | "media" | "layout" | "footer";
  icon: string;
  description: string;
  defaultProps: Record<string, any>;
  fields: Record<string, FieldDefinition>;
}

export const BLOCK_CATALOG: Record<string, BlockManifest> = {
  SiteHeader: {
    type: "SiteHeader",
    name: "Site Header",
    category: "header",
    icon: "fa-heading",
    description: "Header navigasi utama dengan logo, menu dinamis, dan tombol aksi.",
    defaultProps: {
      siteTitle: "cmsMu",
      siteTitleHighlight: "",
      logoImage: "/logo-cmsmu.webp",
      headerScope: "all",
      headerPosition: "static",
      headerBgColor: "#ffffff",
      headerTextColor: "#334155",
      headerBorderColor: "#e2e8f0",
      headerBorderWidth: "1px",
      headerRadius: "none",
      headerSize: "normal",
      headerWidth: "full",
      headerFontFamily: "Plus Jakarta Sans",
      showThemeToggle: "yes",
      showCta: "yes",
      enableUserDropdown: "yes",
      ctaText: "Mulai Sekarang",
      ctaUrl: "/admin",
      menuItems: [
        { label: "Beranda", url: "/" },
        { label: "Berita", url: "/berita" },
        { label: "Panduan", url: "/panduan" }
      ]
    },
    fields: {
      siteTitle: { name: "siteTitle", label: "Judul Situs", type: "text" },
      siteTitleHighlight: { name: "siteTitleHighlight", label: "Teks Sorotan", type: "text" },
      logoImage: { name: "logoImage", label: "URL Logo", type: "image" },
      headerScope: {
        name: "headerScope",
        label: "Cakupan Header Aktif",
        type: "select",
        options: [
          { label: "Semua Halaman & Artikel (Global)", value: "all" },
          { label: "Hanya Halaman Beranda (Home Only)", value: "home_only" },
          { label: "Halaman Statis & Artikel Saja (Post/Page)", value: "pages_posts" }
        ]
      },
      headerPosition: {
        name: "headerPosition",
        label: "Posisi Header di Canvas",
        type: "select",
        options: [
          { label: "Static (Normal - Disarankan di Canvas)", value: "static" },
          { label: "Sticky (Menempel saat Scroll)", value: "sticky" },
          { label: "Fixed (Melayang)", value: "fixed" }
        ]
      },
      headerBgColor: { name: "headerBgColor", label: "Warna Latar Header", type: "color", defaultValue: "#ffffff" },
      headerTextColor: { name: "headerTextColor", label: "Warna Teks Menu Header", type: "color", defaultValue: "#334155" },
      headerBorderColor: { name: "headerBorderColor", label: "Warna Garis (Line) Header", type: "color", defaultValue: "#e2e8f0" },
      headerBorderWidth: {
        name: "headerBorderWidth",
        label: "Ketebalan Garis Header",
        type: "select",
        options: [
          { label: "Tanpa Garis (0px)", value: "0px" },
          { label: "Tipis (1px)", value: "1px" },
          { label: "Sedang (2px)", value: "2px" },
          { label: "Tebal (3px)", value: "3px" },
          { label: "Sangat Tebal (4px)", value: "4px" }
        ]
      },
      headerRadius: {
        name: "headerRadius",
        label: "Kelengkungan (Rounded) Header",
        type: "select",
        options: [
          { label: "Persegi Penuh (0px)", value: "none" },
          { label: "Melengkung Halus (8px)", value: "sm" },
          { label: "Melengkung Sedang (16px)", value: "md" },
          { label: "Melengkung Tegas (24px)", value: "lg" },
          { label: "Kapsul Melayang (Pill Floating)", value: "full" }
        ]
      },
      headerSize: {
        name: "headerSize",
        label: "Ukuran Tinggi Header",
        type: "select",
        options: [
          { label: "Ringkas (56px)", value: "compact" },
          { label: "Standar (72px)", value: "normal" },
          { label: "Tinggi / Lega (88px)", value: "large" }
        ]
      },
      headerWidth: {
        name: "headerWidth",
        label: "Lebar Kontainer Header",
        type: "select",
        options: [
          { label: "Lebar Penuh Layar (Full Width)", value: "full" },
          { label: "Terpusat dalam Kontainer (Contained Card)", value: "contained" }
        ]
      },
      headerFontFamily: {
        name: "headerFontFamily",
        label: "Jenis Font Header",
        type: "select",
        options: [
          { label: "Plus Jakarta Sans (Modern Clean)", value: "Plus Jakarta Sans" },
          { label: "Inter (Neutral Tech)", value: "Inter" },
          { label: "Poppins (Friendly Geometric)", value: "Poppins" },
          { label: "Outfit (Modern Minimalist)", value: "Outfit" },
          { label: "Playfair Display (Serif Elegan)", value: "Playfair Display" },
          { label: "System Default (Bawaan OS)", value: "sans-serif" }
        ]
      },
      showThemeToggle: {
        name: "showThemeToggle",
        label: "Tombol Mode Malam/Siang",
        type: "select",
        options: [
          { label: "Tampilkan (Icon Sun/Moon)", value: "yes" },
          { label: "Sembunyikan", value: "no" }
        ]
      },
      showCta: {
        name: "showCta",
        label: "Tampilkan Tombol Aksi",
        type: "select",
        options: [
          { label: "Ya", value: "yes" },
          { label: "Tidak", value: "no" }
        ]
      },
      enableUserDropdown: {
        name: "enableUserDropdown",
        label: "Dropdown Pengguna Setelah Login",
        type: "select",
        options: [
          { label: "Ya (Dropdown Profil, Dasbor & Logout Otomatis saat Login)", value: "yes" },
          { label: "Tidak (Selalu Tampilkan Tombol Biasa)", value: "no" }
        ]
      },
      ctaText: { name: "ctaText", label: "Teks Tombol Aksi (Tamu / Guest)", type: "text" },
      ctaUrl: { name: "ctaUrl", label: "Link Tombol Aksi (Tamu / Guest)", type: "text" },
      menuItems: {
        name: "menuItems",
        label: "Menu Navigasi",
        type: "array",
        arrayFields: {
          label: { name: "label", label: "Teks Menu", type: "text" },
          url: { name: "url", label: "Tautan URL", type: "text" }
        }
      }
    }
  },

  Hero: {
    type: "Hero",
    name: "Hero Banner",
    category: "hero",
    icon: "fa-star",
    description: "Banner pembuka utama dengan judul besar, deskripsi, dan tombol CTA ganda.",
    defaultProps: {
      badgeText: "🚀 Platform Content Management System Muhammadiyah",
      title: "Satu Fondasi CMS Terpadu untuk Website & Media Muhammadiyah",
      description: "Platform Content Management System modern, tangguh, dan fleksibel untuk membangun website resmi secara mudah dan terstruktur.",
      primaryButtonText: "Jelajahi Fitur",
      primaryButtonLink: "#fitur",
      secondaryButtonText: "Masuk Dashboard",
      secondaryButtonLink: "/admin",
      backgroundImage: "",
      backgroundColor: "bg-slate-50"
    },
    fields: {
      badgeText: { name: "badgeText", label: "Teks Lencana (Badge)", type: "text" },
      title: { name: "title", label: "Judul Utama", type: "text" },
      description: { name: "description", label: "Deskripsi", type: "textarea" },
      primaryButtonText: { name: "primaryButtonText", label: "Teks Tombol Utama", type: "text" },
      primaryButtonLink: { name: "primaryButtonLink", label: "Tautan Tombol Utama", type: "text" },
      secondaryButtonText: { name: "secondaryButtonText", label: "Teks Tombol Kedua", type: "text" },
      secondaryButtonLink: { name: "secondaryButtonLink", label: "Tautan Tombol Kedua", type: "text" },
      backgroundImage: { name: "backgroundImage", label: "Gambar Latar (Opsional)", type: "image" }
    }
  },

  Partners: {
    type: "Partners",
    name: "Logo Mitra (Partners)",
    category: "media",
    icon: "fa-handshake",
    description: "Daftar logo institusi, mitra sinergi, atau jaringan organisasi.",
    defaultProps: {
      title: "Dipercaya & Berkolaborasi Dengan",
      partners: [
        { name: "cmsMu Core", logoUrl: "", url: "" },
        { name: "Cloudflare Edge", logoUrl: "", url: "" },
        { name: "Drizzle ORM", logoUrl: "", url: "" },
        { name: "Astro SSR", logoUrl: "", url: "" }
      ]
    },
    fields: {
      title: { name: "title", label: "Judul Bagian", type: "text" },
      partners: {
        name: "partners",
        label: "Daftar Mitra / Logo",
        type: "array",
        arrayFields: {
          name: { name: "name", label: "Nama Mitra", type: "text" },
          logoUrl: { name: "logoUrl", label: "URL Logo (Opsional)", type: "image" },
          url: { name: "url", label: "Tautan Link Mitra (Opsional)", type: "text", placeholder: "https://..." }
        }
      }
    }
  },

  FeatureGrid: {
    type: "FeatureGrid",
    name: "Feature Grid (Daftar Fitur)",
    category: "content",
    icon: "fa-th-large",
    description: "Grid fitur unggulan dengan ikon, judul, dan penjelasan ringkas.",
    defaultProps: {
      title: "Fitur Unggulan Platform",
      description: "Solusi lengkap dan terintegrasi untuk kebutuhan publikasi modern.",
      features: [
        { title: "Cepat & Serverless", description: "Performa tinggi di edge computing Cloudflare.", svgIcon: "bolt" },
        { title: "Keamanan Tingkat Tinggi", description: "Otorisasi role berbasis token terenkripsi.", svgIcon: "shield-alt" },
        { title: "Desain Responsif", description: "Tampilan optimal di perangkat ponsel, tablet, dan desktop.", svgIcon: "mobile-alt" }
      ]
    },
    fields: {
      title: { name: "title", label: "Judul Bagian", type: "text" },
      description: { name: "description", label: "Deskripsi", type: "textarea" },
      features: {
        name: "features",
        label: "Daftar Kartu Fitur",
        type: "array",
        arrayFields: {
          title: { name: "title", label: "Judul Fitur", type: "text" },
          description: { name: "description", label: "Deskripsi Singkat", type: "textarea" },
          svgIcon: {
            name: "svgIcon",
            label: "Ikon (FontAwesome)",
            type: "select",
            options: [
              { label: "Bolt (Petir)", value: "bolt" },
              { label: "Shield (Keamanan)", value: "shield-alt" },
              { label: "Mobile (Responsif)", value: "mobile-alt" },
              { label: "Star (Bintang)", value: "star" },
              { label: "Check (Centang)", value: "check-circle" },
              { label: "Rocket (Roket)", value: "rocket" },
              { label: "Gem (Permata)", value: "gem" },
              { label: "Heart (Hati)", value: "heart" }
            ]
          }
        }
      }
    }
  },

  Testimonial: {
    type: "Testimonial",
    name: "Testimonial",
    category: "content",
    icon: "fa-comments",
    description: "Ulasan dan testimonial dari pengguna atau pembaca.",
    defaultProps: {
      title: "Dipercaya Pengelola Website & Media",
      subtitle: "Pengalaman para administrator dan redaktur dalam mengelola publikasi.",
      testimonials: [
        {
          quote: "Pengelolaan artikel dan halaman portal kami jadi sangat mudah dan terstruktur.",
          author: "H. Ahmad Fauzi",
          role: "Admin Redaksi",
          initials: "AF",
          bgColor: "#059669"
        },
        {
          quote: "Visual builder mandiri sangat cepat dan tidak membebani browser.",
          author: "Siti Rahmawati",
          role: "Humas & Publikasi",
          initials: "SR",
          bgColor: "#10b981"
        }
      ]
    },
    fields: {
      title: { name: "title", label: "Judul Testimonial", type: "text" },
      subtitle: { name: "subtitle", label: "Subjudul", type: "textarea" },
      testimonials: {
        name: "testimonials",
        label: "Daftar Testimonial",
        type: "array",
        arrayFields: {
          quote: { name: "quote", label: "Kutipan Ulasan", type: "textarea" },
          author: { name: "author", label: "Nama Pengulas", type: "text" },
          role: { name: "role", label: "Jabatan / Organisasi", type: "text" },
          initials: { name: "initials", label: "Inisial Avatar", type: "text" }
        }
      }
    }
  },

  RecentPosts: {
    type: "RecentPosts",
    name: "Recent Posts (Artikel Terbaru)",
    category: "content",
    icon: "fa-newspaper",
    description: "Grid daftar artikel berita dan wawasan terbaru terhubung langsung ke database.",
    defaultProps: {
      title: "Kabar & Wawasan Terbaru",
      description: "Ikuti perkembangan terbaru dan artikel pilihan secara berkala.",
      viewAllText: "Lihat Semua Artikel",
      viewAllLink: "/berita",
      postsCount: "3"
    },
    fields: {
      title: { name: "title", label: "Judul Bagian", type: "text" },
      description: { name: "description", label: "Deskripsi", type: "textarea" },
      viewAllText: { name: "viewAllText", label: "Teks Tautan Semua", type: "text" },
      viewAllLink: { name: "viewAllLink", label: "Tautan Semua Artikel", type: "text" },
      postsCount: {
        name: "postsCount",
        label: "Jumlah Artikel",
        type: "select",
        options: [
          { label: "3 Artikel", value: "3" },
          { label: "6 Artikel", value: "6" },
          { label: "9 Artikel", value: "9" }
        ]
      }
    }
  },

  MagazineBigGrid: {
    type: "MagazineBigGrid",
    name: "Magazine Big Grid",
    category: "content",
    icon: "fa-border-all",
    description: "Layout majalah berita dengan satu berita utama besar dan dua artikel pendamping.",
    defaultProps: {
      title: "Top Stories"
    },
    fields: {
      title: { name: "title", label: "Judul Bagian", type: "text" }
    }
  },

  CallToAction: {
    type: "CallToAction",
    name: "Call To Action (CTA)",
    category: "content",
    icon: "fa-bullhorn",
    description: "Kotak ajakan bertindak mencolok dengan tombol aksi utama.",
    defaultProps: {
      title: "Siap Membangun Website Anda?",
      description: "Mulai terbitkan artikel dan kelola konten digital Anda sekarang juga.",
      buttonText: "Mulai Sekarang",
      buttonLink: "/admin",
      footerText: "Gratis, cepat, dan mudah disesuaikan."
    },
    fields: {
      title: { name: "title", label: "Judul Ajakan", type: "text" },
      description: { name: "description", label: "Deskripsi", type: "textarea" },
      buttonText: { name: "buttonText", label: "Teks Tombol", type: "text" },
      buttonLink: { name: "buttonLink", label: "Tautan Tombol", type: "text" },
      footerText: { name: "footerText", label: "Teks Keterangan Bawah", type: "text" }
    }
  },

  SiteFooter: {
    type: "SiteFooter",
    name: "Site Footer",
    category: "footer",
    icon: "fa-shoe-prints",
    description: "Bagian kaki halaman dengan logo, teks hak cipta, dan informasi kontak.",
    defaultProps: {
      siteName: "cmsMu",
      copyrightText: "Hak Cipta Dilindungi Undang-Undang.",
      logoImage: ""
    },
    fields: {
      siteName: { name: "siteName", label: "Nama Situs", type: "text" },
      copyrightText: { name: "copyrightText", label: "Teks Hak Cipta", type: "text" },
      logoImage: { name: "logoImage", label: "URL Logo", type: "image" }
    }
  },

  CustomHTML: {
    type: "CustomHTML",
    name: "Custom HTML",
    category: "layout",
    icon: "fa-code",
    description: "Sisipkan kode HTML bebas, embed script, atau widget pihak ketiga.",
    defaultProps: {
      html: "<div class='text-center p-8 bg-slate-100 rounded-lg'>Custom HTML Block</div>"
    },
    fields: {
      html: { name: "html", label: "Kode HTML / Embed", type: "textarea" }
    }
  },

  Spacer: {
    type: "Spacer",
    name: "Pemisah Jarak (Spacer)",
    category: "layout",
    icon: "fa-arrows-alt-v",
    description: "Memberikan jarak vertikal fleksibel antar blok konten.",
    defaultProps: {
      height: 40
    },
    fields: {
      height: { name: "height", label: "Tinggi Jarak (px)", type: "number" }
    }
  }
};
