import { getDb } from '@cmsmu/db';
import { magazines, settings } from '@cmsmu/db';
import { eq } from 'drizzle-orm';

export const DEFAULT_PLANS_CONFIG = {
  plans: [
    { id: '1_bulan', name: '1 Bulan', months: 1, price: 50000, badge: '', desc: 'Akses Penuh 30 Hari', active: true },
    { id: '3_bulan', name: '3 Bulan', months: 3, price: 135000, badge: 'HEMAT 10%', desc: 'Rp 45.000 / bln', active: true },
    { id: '6_bulan', name: '6 Bulan', months: 6, price: 255000, badge: 'HEMAT 15%', desc: 'Rp 42.500 / bln', active: true },
    { id: '1_tahun', name: '1 Tahun', months: 12, price: 480000, badge: '⭐ PALING HEMAT', desc: 'Rp 40.000 / bln (20% Off)', active: true }
  ],
  bank1: { name: 'Bank Syariah Indonesia (BSI)', account: '8877665544', holder: "Suara 'Aisyiyah" },
  bank2: { name: 'Bank Central Asia (BCA)', account: '', holder: "Suara 'Aisyiyah" },
  qrisImage: '',
  whatsapp: '081234567890',
  instructions: 'Transfer sesuai nominal paket ke rekening resmi di atas, kemudian unggah foto bukti transfer pada formulir pembayaran.',
  defaultPreviewPages: 5
};

export async function getPlansConfig(dbBinding: any) {
  try {
    const db = getDb(dbBinding);
    const row = await db.select().from(settings).where(eq(settings.key, 'emagazine_plans_config')).get();
    if (row && row.value) {
      const parsed = JSON.parse(row.value);
      return {
        ...DEFAULT_PLANS_CONFIG,
        ...parsed,
        plans: parsed.plans && Array.isArray(parsed.plans) && parsed.plans.length > 0 ? parsed.plans : DEFAULT_PLANS_CONFIG.plans,
        bank1: { ...DEFAULT_PLANS_CONFIG.bank1, ...(parsed.bank1 || {}) },
        bank2: { ...DEFAULT_PLANS_CONFIG.bank2, ...(parsed.bank2 || {}) }
      };
    }
  } catch (e) {
    console.error('Error getPlansConfig in @cmsmu/core:', e);
  }
  return DEFAULT_PLANS_CONFIG;
}

export function parseRangeHeader(rangeHeader?: string): { offset?: number; length?: number; suffix?: number } | undefined {
  if (!rangeHeader) return undefined;
  const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
  if (!match) return undefined;

  const startStr = match[1];
  const endStr = match[2];
  if (startStr && endStr) {
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    return { offset: start, length: end - start + 1 };
  } else if (startStr) {
    return { offset: parseInt(startStr, 10) };
  } else if (endStr) {
    return { suffix: parseInt(endStr, 10) };
  }
  return undefined;
}
