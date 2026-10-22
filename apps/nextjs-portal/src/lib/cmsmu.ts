import { createCmsMuClient } from "@cmsmu/sdk";

const API_BASE_URL =
  process.env.CMSMU_API_URL ||
  process.env.NEXT_PUBLIC_CMSMU_API_URL ||
  "https://cms.labmu.dev";

export const cmsMuClient = createCmsMuClient({
  baseUrl: API_BASE_URL,
  defaultLocale: "id",
  fetch: (url, options) => {
    // Next.js App Router ISR caching (revalidate cache setiap 60 detik)
    return fetch(url, {
      ...options,
      next: { revalidate: 60 },
    } as any);
  },
});
