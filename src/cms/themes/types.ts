export interface ThemeContext {
  site: {
    title: string;
    description: string;
    url: string;
    [key: string]: any;
  };
  menus?: any;
  categories?: any[];   // Daftar Kategori Dinamis dari Real DB
  topics?: any[];       // Daftar Topik/Tag Sorotan Dinamis dari Real DB
  sources?: any[];      // Daftar Media Sumber Terverifikasi dari Real DB
  themeConfig?: any;    // Konfigurasi custom tema (contoh: header, footer, warna)
  data?: any;           // Data Utama (Bisa Single Post atau List Post)
  sidebarPosts?: any[]; // <--- TAMBAHAN: Data Khusus Sidebar
  pageData?: any;       // Data dari halaman kustom (misalnya halaman 'home')
  query?: string;
  categoryName?: string;
  pagination?: any;
  posts?: any[];
  currentSlug?: string;
  subType?: string;
}

export interface ThemeStructure {
  name: string;
  version: string;
  author: string;

  renderHome(ctx: ThemeContext): string;
  renderSingle(ctx: ThemeContext): string;
  renderPage(ctx: ThemeContext): string;
  render404(ctx: ThemeContext): string;
  [key: string]: any; // Allow custom methods like _layout
}
