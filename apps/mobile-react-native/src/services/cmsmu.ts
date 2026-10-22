import { createCmsMuClient } from "@cmsmu/sdk";

// Endpoint default mengarah ke Cloudflare Staging cmsMu
const CMSMU_API_URL = "https://cms.labmu.dev";

export const cmsMuClient = createCmsMuClient({
  baseUrl: CMSMU_API_URL,
  defaultLocale: "id",
});

export const SUPPORTED_LOCALES = [
  { code: "id", label: "Bahasa Indonesia", flag: "ID", direction: "ltr" as const },
  { code: "en", label: "English", flag: "EN", direction: "ltr" as const },
  { code: "ar", label: "العربية", flag: "AR", direction: "rtl" as const },
];
