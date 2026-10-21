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
      headerTextColor: "",
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
      headerTextColor: { name: "headerTextColor", label: "Warna Teks Menu Header (Otomatis jika kosong)", type: "color", defaultValue: "" },
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

/**
 * 🗄️ Kontrak Data Halaman Canvas Visual Builder
 */
export interface CanvasPageData {
  content: Array<{
    type: string;
    props: Record<string, any>;
  }>;
  root?: Record<string, any>;
  zones?: Record<string, Array<{ type: string; props: Record<string, any> }>>;
}

/**
 * 🛡️ Validator Format JSON Canvas Page
 * Memeriksa validitas sintaks dan kesesuaian tipe blok dengan BLOCK_CATALOG.
 */
export function validateCanvasPageData(input: any): {
  valid: boolean;
  error?: string;
  cleanData?: CanvasPageData;
} {
  if (!input) {
    return { valid: false, error: "Data JSON kosong." };
  }

  let normalized: any = input;
  // Jika input berupa array langsung, bungkus ke dalam properti content
  if (Array.isArray(input)) {
    normalized = { content: input, root: { props: { title: "Halaman Canvas" } }, zones: {} };
  } else if (typeof input === "object") {
    if (!Array.isArray(input.content)) {
      return { valid: false, error: "Format JSON tidak valid: Properti 'content' berupa array blok wajib ada." };
    }
  } else {
    return { valid: false, error: "Format JSON tidak valid: Harus berupa objek atau array." };
  }

  const validContent: Array<{ type: string; props: Record<string, any> }> = [];
  for (let i = 0; i < normalized.content.length; i++) {
    const item = normalized.content[i];
    if (!item || typeof item !== "object") {
      return { valid: false, error: `Blok baris #${i + 1} tidak valid (bukan objek).` };
    }
    if (!item.type || typeof item.type !== "string") {
      return { valid: false, error: `Blok #${i + 1} tidak memiliki tipe blok ('type').` };
    }
    const cleanType = item.type.trim();
    if (!BLOCK_CATALOG[cleanType]) {
      return {
        valid: false,
        error: `Tipe blok '${cleanType}' pada baris #${i + 1} tidak terdaftar di katalog resmi cmsMu.`
      };
    }

    const props = item.props && typeof item.props === "object" ? { ...item.props } : {};
    if (!props.id) {
      props.id = `${cleanType}-${Date.now()}-${i}`;
    }

    validContent.push({
      type: cleanType,
      props
    });
  }

  return {
    valid: true,
    cleanData: {
      content: validContent,
      root: normalized.root || { props: { title: "Halaman Canvas" } },
      zones: normalized.zones || {}
    }
  };
}

export interface CanvasPresetItem {
  id: string;
  name: string;
  badge: string;
  category: "newsroom" | "institution" | "magazine";
  description: string;
  data: CanvasPageData;
}

/**
 * 🏛️ Pustaka Template Resmi cmsMu (Standar Konten Bernas & Bebas AI Dummy)
 */
export const BUILTIN_CANVAS_PRESETS: CanvasPresetItem[] = [
  {
    id: "portal-berita-berkemajuan",
    name: "Portal Berita & Wawasan Berkemajuan",
    badge: "Newsroom Resmi",
    category: "newsroom",
    description: "Tata letak portal publikasi berita, analisis wacana, tajuk tarjih, dan agenda persyarikatan.",
    data: {
      content: [
        {
          type: "SiteHeader",
          props: {
            id: "SiteHeader-portal-1",
            siteTitle: "cmsMu",
            siteTitleHighlight: "Media",
            logoImage: "/logo-cmsmu.webp",
            headerScope: "all",
            headerPosition: "static",
            headerBgColor: "#ffffff",
            headerTextColor: "",
            headerBorderColor: "#e2e8f0",
            headerBorderWidth: "1px",
            headerRadius: "none",
            headerSize: "normal",
            headerWidth: "full",
            headerFontFamily: "Plus Jakarta Sans",
            showThemeToggle: "yes",
            showCta: "yes",
            ctaText: "Kirim Tulisan",
            ctaUrl: "/admin/add",
            menuItems: [
              { label: "Beranda", url: "/" },
              { label: "Warta Persyarikatan", url: "/category/berita" },
              { label: "Kajian Tarjih", url: "/category/kajian" },
              { label: "Kolom Opini", url: "/category/opini" },
              { label: "Suara 'Aisyiyah", url: "https://suaraaisyiyah.id" }
            ]
          }
        },
        {
          type: "HeroSlider",
          props: {
            id: "HeroSlider-portal-1",
            sliderHeight: "440px",
            overlayOpacity: 0.65,
            slides: [
              {
                title: "Meneguhkan Gerakan Dakwah Pencerahan di Era Informasi Digital",
                subtitle: "Wacana strategis persyarikatan dalam merespons dinamika kebangsaan dan kemanusiaan universal.",
                buttonText: "Baca Tajuk Lengkap",
                buttonLink: "/category/opini",
                image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1600&auto=format&fit=crop&q=80"
              },
              {
                title: "Digitalisasi Majelis Tarjih: Risalah Fikih Kontemporer Mudah Diakses Umat",
                subtitle: "Putusan dan fatwa keagamaan resmi kini hadir terintegrasi dalam platform multi-layanan.",
                buttonText: "Telusuri Kajian",
                buttonLink: "/category/kajian",
                image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=1600&auto=format&fit=crop&q=80"
              }
            ]
          }
        },
        {
          type: "RecentPosts",
          props: {
            id: "RecentPosts-portal-1",
            title: "Warta Terkini & Analisis Redaksi",
            description: "Informasi aktual, kebijakan lembaga, dan khazanah pemikiran Islam berkemajuan terverifikasi.",
            viewAllText: "Seluruh Indeks Berita",
            viewAllLink: "/berita",
            postsCount: "6"
          }
        },
        {
          type: "Partners",
          props: {
            id: "Partners-portal-1",
            title: "Jaringan Publikasi & Sinergi Amal Usaha",
            partners: [
              { name: "Suara 'Aisyiyah", logoUrl: "/logo-cmsmu.webp", url: "https://suaraaisyiyah.id" },
              { name: "Lembaga Pengembangan Karakter", logoUrl: "/logo-cmsmu.webp", url: "#" },
              { name: "LazisMu Pusat", logoUrl: "/logo-cmsmu.webp", url: "https://lazismu.org" },
              { name: "Majelis Pustaka & Informasi", logoUrl: "/logo-cmsmu.webp", url: "#" }
            ]
          }
        },
        {
          type: "CallToAction",
          props: {
            id: "CallToAction-portal-1",
            title: "Punya Gagasan Menarik untuk Didiskusikan?",
            description: "Redaksi cmsMu membuka ruang bagi akademisi, ulama tarjih, kader persyarikatan, dan khalayak luas untuk mempublikasikan naskah opini.",
            buttonText: "Kirim Naskah Tulisan",
            buttonLink: "/admin/add",
            footerText: "Naskah yang masuk akan ditelaah oleh dewan redaksi sebelum dipublikasikan."
          }
        },
        {
          type: "SiteFooter",
          props: {
            id: "SiteFooter-portal-1",
            siteName: "cmsMu Portal Media",
            copyrightText: "Hak Cipta © 2026 Lembaga Publikasi & Media Digital Muhammadiyah. Hak cipta dilindungi undang-undang.",
            logoImage: "/logo-cmsmu.webp"
          }
        }
      ],
      root: { props: { title: "Portal Berita & Wawasan Berkemajuan" } }
    }
  },
  {
    id: "lembaga-pendidikan-aum",
    name: "Lembaga Pendidikan & Amal Usaha Unggul",
    badge: "Sekolah / Pesantren / AUM",
    category: "institution",
    description: "Tata letak institusi pendidikan, pondok pesantren modern, dan profil amal usaha terpadu.",
    data: {
      content: [
        {
          type: "SiteHeader",
          props: {
            id: "SiteHeader-aum-1",
            siteTitle: "Perguruan",
            siteTitleHighlight: "Muhammadiyah",
            logoImage: "/logo-cmsmu.webp",
            headerScope: "all",
            headerPosition: "static",
            headerBgColor: "#ffffff",
            headerTextColor: "",
            headerBorderColor: "#e2e8f0",
            headerBorderWidth: "1px",
            headerRadius: "none",
            headerSize: "normal",
            headerWidth: "full",
            headerFontFamily: "Plus Jakarta Sans",
            showThemeToggle: "yes",
            showCta: "yes",
            ctaText: "Info PPDB Online",
            ctaUrl: "/ppdb",
            menuItems: [
              { label: "Beranda", url: "/" },
              { label: "Profil Lembaga", url: "/profil" },
              { label: "Kurikulum & Tahfiz", url: "/kurikulum" },
              { label: "Prestasi Santri", url: "/prestasi" },
              { label: "Warta Kampus", url: "/berita" }
            ]
          }
        },
        {
          type: "Hero",
          props: {
            id: "Hero-aum-1",
            badgeText: "Pendidikan Berkarakter & Berkemajuan",
            title: "Membina Generasi Unggul Berakhlak Qur'ani dan Berwawasan Global",
            titleHighlight: "Berakhlak Qur'ani",
            description: "Mengharmonisasikan kurikulum sains modern, penguatan tahfiz Al-Qur'an, wawasan teknologi, dan kepanduan Hizbul Wathan untuk menyongsong masa depan.",
            primaryButtonText: "Pendaftaran Santri Baru",
            primaryButtonLink: "/ppdb",
            backgroundImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80"
          }
        },
        {
          type: "FeatureGrid",
          props: {
            id: "FeatureGrid-aum-1",
            title: "Pilar Keunggulan Pendidikan",
            description: "Ekosistem pembelajaran holistik yang menyeimbangkan kecerdasan intelektual, spiritual, dan emosional.",
            features: [
              {
                title: "Tahfiz & Manhaj Ibadah Tarjih",
                description: "Program hafalan terstruktur, bimbingan tartil tajwid, serta pembiasaan sholat berjamaah dan adab harian santri.",
                svgIcon: "check-circle"
              },
              {
                title: "Laboratorium Sains & Robotika",
                description: "Fasilitas riset modern, praktikum komputer, dan pembinaan olimpiade sains untuk mengasah nalar analitis.",
                svgIcon: "bolt"
              },
              {
                title: "Bilingual & Kepemimpinan Kader",
                description: "Interaksi bahasa Arab dan Inggris aktif, kepanduan Hizbul Wathan, serta kepemimpinan Ikatan Pelajar Muhammadiyah.",
                svgIcon: "shield-alt"
              }
            ]
          }
        },
        {
          type: "Testimonial",
          props: {
            id: "Testimonial-aum-1",
            title: "Ulasan Orang Tua & Tokoh Pendidikan",
            subtitle: "Dukungan dan apresiasi terhadap proses pembinaan santri dan siswa.",
            testimonials: [
              {
                quote: "Perkembangan adab, kemandirian sholat, dan capaian akademik anak kami berkembang pesat selama belajar di sini.",
                author: "H. Zulkifli Rahman, M.T.",
                role: "Wali Murid Angkatan 2024",
                initials: "ZR",
                bgColor: "#0E647D"
              },
              {
                quote: "Kurikulum yang menyeimbangkan antara pemahaman agama mendalam dan sains modern adalah modal utama masa depan anak.",
                author: "dr. Nurul Hidayati",
                role: "Alumni & Dokter Praktisi",
                initials: "NH",
                bgColor: "#10B981"
              }
            ]
          }
        },
        {
          type: "RecentPosts",
          props: {
            id: "RecentPosts-aum-1",
            title: "Warta Kampus & Informasi Akademik",
            description: "Catatan prestasi siswa, agenda pembinaan wali murid, dan publikasi kegiatan belajar mengajar.",
            viewAllText: "Arsip Warta Lengkap",
            viewAllLink: "/berita",
            postsCount: "3"
          }
        },
        {
          type: "SiteFooter",
          props: {
            id: "SiteFooter-aum-1",
            siteName: "Perguruan Muhammadiyah Terpadu",
            copyrightText: "Hak Cipta © 2026 Majelis Pendidikan Dasar Menengah dan Pendidikan Nonformal. Hak cipta dilindungi undang-undang.",
            logoImage: "/logo-cmsmu.webp"
          }
        }
      ],
      root: { props: { title: "Lembaga Pendidikan & Amal Usaha Unggul" } }
    }
  },
  {
    id: "majalah-suara-digital",
    name: "Majalah Digital & Opini Longform",
    badge: "Jurnal & Majalah",
    category: "magazine",
    description: "Tata letak publikasi majalah bulanan, edisi cetak PDF, tajuk rencana, dan rubrik keluarga sakinah.",
    data: {
      content: [
        {
          type: "SiteHeader",
          props: {
            id: "SiteHeader-mag-1",
            siteTitle: "Suara",
            siteTitleHighlight: "'Aisyiyah",
            logoImage: "/logo-cmsmu.webp",
            headerScope: "all",
            headerPosition: "static",
            headerBgColor: "#ffffff",
            headerTextColor: "",
            headerBorderColor: "#e2e8f0",
            headerBorderWidth: "1px",
            headerRadius: "none",
            headerSize: "normal",
            headerWidth: "full",
            headerFontFamily: "Plus Jakarta Sans",
            showThemeToggle: "yes",
            showCta: "yes",
            ctaText: "Langganan Majalah",
            ctaUrl: "/langganan",
            menuItems: [
              { label: "Beranda", url: "/" },
              { label: "Tajuk Rencana", url: "/category/tajuk" },
              { label: "Keluarga Sakinah", url: "/category/keluarga" },
              { label: "Khazanah Pemikiran", url: "/category/khazanah" },
              { label: "Edisi Cetak & Flipbook", url: "/edisi-cetak" }
            ]
          }
        },
        {
          type: "Hero",
          props: {
            id: "Hero-mag-1",
            badgeText: "Edisi Sorotan Bulan Ini",
            title: "Mengokohkan Ketahanan Keluarga di Tengah Gelombang Disrupsi Digital",
            titleHighlight: "Ketahanan Keluarga",
            description: "Analisis tajam dewan pakar, teladan pendidik keluarga sakinah, dan panduan membentengi generasi muda dari pengaruh negatif media digital.",
            primaryButtonText: "Baca Tajuk Utama Edisi Ini",
            primaryButtonLink: "/category/tajuk",
            backgroundImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&auto=format&fit=crop&q=80"
          }
        },
        {
          type: "RecentPosts",
          props: {
            id: "RecentPosts-mag-1",
            title: "Rubrik Pilihan Redaksi",
            description: "Wacana perempuan berkemajuan, kesehatan keluarga, fiqih wanita, dan catatan inspiratif.",
            viewAllText: "Lihat Seluruh Rubrik",
            viewAllLink: "/berita",
            postsCount: "6"
          }
        },
        {
          type: "CallToAction",
          props: {
            id: "CallToAction-mag-1",
            title: "Dukung Gerakan Literasi Perempuan Berkemajuan",
            description: "Dapatkan majalah edisi cetak berkala dikirim ke alamat Anda, atau baca versi flipbook digital interaktif melalui paket langganan tahunan.",
            buttonText: "Aktivasi Langganan Digital",
            buttonLink: "/langganan",
            footerText: "Tersedia diskon khusus untuk Ranting, Cabang, dan Perpustakaan AUM."
          }
        },
        {
          type: "SiteFooter",
          props: {
            id: "SiteFooter-mag-1",
            siteName: "Majalah Suara 'Aisyiyah Digital",
            copyrightText: "Hak Cipta © 2026 Pimpinan Pusat 'Aisyiyah. Media Perempuan Berkemajuan Sejak 1926.",
            logoImage: "/logo-cmsmu.webp"
          }
        }
      ],
      root: { props: { title: "Majalah Digital & Opini Longform" } }
    }
  }
];
