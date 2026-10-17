import type { Hono } from "hono";
import type { Bindings } from "../types";
import registerStarterPlugin from "./starter";

/**
 * 🔌 CMSMu Developer Plugin Registry
 *
 * Tempat bagi pengembang aplikasi untuk mendaftarkan plugin kustom mereka.
 * DILARANG MENGUBAH CORE CMSMU. Seluruh penambahan fitur, endpoint API baru,
 * dan tampilan admin baru WAJIB didaftarkan melalui folder `apps/cms-api/src/plugins/`.
 */
export default function registerCustomPlugins(app: Hono<{ Bindings: Bindings }>) {
  // 1. Starter Plugin (Contoh pondasi boilerplate)
  registerStarterPlugin(app);

  // 2. Daftarkan plugin kustom Anda di bawah ini:
  // Contoh:
  // import registerMyFeature from "./my-feature";
  // registerMyFeature(app);
}
