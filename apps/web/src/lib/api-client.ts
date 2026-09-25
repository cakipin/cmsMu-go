import { hc } from 'hono/client';
import type { AppType } from '@cmsmu/cms-api';

/**
 * 🚀 Type-Safe Hono RPC Client untuk Headless Frontend CMSMu
 * Menghubungkan frontend apps/web ke apps/cms-api secara presisi end-to-end tanpa drift skema.
 */
export function createApiClient(baseUrl: string = 'http://localhost:8787') {
  return hc<AppType>(baseUrl);
}

export type CmsApiClient = ReturnType<typeof createApiClient>;
