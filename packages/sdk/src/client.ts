import type { SDUIPage, LocaleItem } from "@cmsmu/schema-sdui";
import type {
  CmsMuClientConfig,
  GetPageOptions,
  GetPostsOptions,
  PostItem,
  PostsResponse,
} from "./types";

export class CmsMuClient {
  private baseUrl: string;
  private token?: string;
  private fetchFn: typeof fetch;
  private defaultLocale: string;

  constructor(config: CmsMuClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.token = config.token;
    this.fetchFn = config.fetch || (globalThis.fetch ? globalThis.fetch.bind(globalThis) : fetch);
    this.defaultLocale = config.defaultLocale || "id";
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const headers = new Headers(options.headers || {});

    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    if (this.token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    const response = await this.fetchFn(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorJson = (await response.json()) as any;
        if (errorJson && (errorJson.message || errorJson.error)) {
          errorMessage = errorJson.message || errorJson.error;
        }
      } catch {}
      throw new Error(`[cmsMu SDK] Request gagal: ${errorMessage}`);
    }

    return (await response.json()) as T;
  }

  /**
   * 🎨 Server-Driven UI (SDUI) Service
   * Mengambil struktur blok kanvas siap render untuk Next.js atau React Native.
   */
  readonly sdui = {
    getPage: async (slug: string, options: GetPageOptions = {}): Promise<SDUIPage> => {
      const params = new URLSearchParams();
      params.set("locale", options.locale || this.defaultLocale);
      if (options.platform) {
        params.set("platform", options.platform);
      }

      return this.request<SDUIPage>(
        `/api/theme-editor/sdui/${encodeURIComponent(slug)}?${params.toString()}`
      );
    },
  };

  /**
   * 📰 Posts & Warta Service
   */
  readonly posts = {
    list: async (options: GetPostsOptions = {}): Promise<PostsResponse> => {
      const params = new URLSearchParams();
      if (options.limit) params.set("limit", String(options.limit));
      if (options.page) params.set("page", String(options.page));
      if (options.category) params.set("category", options.category);
      if (options.locale) params.set("locale", options.locale);

      const query = params.toString();
      return this.request<PostsResponse>(`/api/posts${query ? `?${query}` : ""}`);
    },

    get: async (
      slug: string,
      options: { locale?: string } = {}
    ): Promise<{ success: boolean; data: PostItem }> => {
      const params = new URLSearchParams();
      if (options.locale) params.set("locale", options.locale);
      const query = params.toString();

      return this.request<{ success: boolean; data: PostItem }>(
        `/api/posts/${encodeURIComponent(slug)}${query ? `?${query}` : ""}`
      );
    },
  };

  /**
   * 🌐 Multi-Language (i18n) Locales Service
   */
  readonly locales = {
    list: async (): Promise<{ success: boolean; data: LocaleItem[] }> => {
      return this.request<{ success: boolean; data: LocaleItem[] }>("/api/theme-editor/locales");
    },
  };
}

/**
 * Factory function untuk inisialisasi CmsMuClient
 */
export function createCmsMuClient(config: CmsMuClientConfig): CmsMuClient {
  return new CmsMuClient(config);
}
