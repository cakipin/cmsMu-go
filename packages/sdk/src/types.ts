import type { SDUIPage, LocaleItem } from "@cmsmu/schema-sdui";

export interface CmsMuClientConfig {
  /** URL dasar instalasi cmsMu (contoh: https://cms.labmu.dev) */
  baseUrl: string;
  /** Token otentikasi Bearer (opsional jika mengakses data publik) */
  token?: string;
  /** Kustom fetch implementation (untuk Next.js revalidation cache atau React Native) */
  fetch?: typeof fetch;
  /** Bahasa bawaan klien (default: 'id') */
  defaultLocale?: string;
}

export interface GetPageOptions {
  /** Kode bahasa target (contoh: 'id', 'en', 'ar') */
  locale?: string;
  /** Platform target klien ('web' | 'mobile') */
  platform?: "web" | "mobile";
}

export interface GetPostsOptions {
  /** Jumlah postingan per halaman (default: 10) */
  limit?: number;
  /** Nomor halaman paginasi (1-indexed) */
  page?: number;
  /** Filter berdasarkan slug kategori */
  category?: string;
  /** Filter berdasarkan bahasa */
  locale?: string;
}

export interface PostItem {
  id: number;
  title: string;
  slug: string;
  body?: string;
  excerpt?: string;
  category?: string;
  tags?: string;
  featuredImage?: string;
  author?: string;
  views?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PostsResponse {
  success: boolean;
  data: PostItem[];
  total?: number;
  page?: number;
  limit?: number;
}
