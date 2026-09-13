import { getPlansConfig } from '../emagazine/emagazine.service';

export function parsePlanDetails(plan: string) {
  switch (plan) {
    case '1_tahun':
    case '12_bulan':
    case 'tahunan':
      return { months: 12, amount: 480000, label: '1 Tahun' };
    case '6_bulan':
    case 'semester':
      return { months: 6, amount: 255000, label: '6 Bulan' };
    case '3_bulan':
    case 'triwulan':
      return { months: 3, amount: 135000, label: '3 Bulan' };
    case '1_bulan':
    case 'bulanan':
    case 'premium':
    default:
      return { months: 1, amount: 50000, label: '1 Bulan' };
  }
}

export async function getDynamicPlanDetails(db: any, plan: string) {
  try {
    const config = await getPlansConfig(db);
    if (config && config.plans && Array.isArray(config.plans)) {
      const found = config.plans.find((p: any) => p.id === plan);
      if (found) {
        return { months: found.months || 1, amount: found.price || 50000, label: found.name || 'Paket' };
      }
    }
  } catch (e) {}
  return parsePlanDetails(plan);
}

export function generateQrisString(amount: number, invoiceNumber: string): string {
  const pad = (num: number, size = 2) => String(num).padStart(size, '0');
  const amountStr = String(amount);
  const tag54 = `54${pad(amountStr.length)}${amountStr}`;
  const tag62Sub01 = `01${pad(invoiceNumber.length)}${invoiceNumber}`;
  const tag62 = `62${pad(tag62Sub01.length)}${tag62Sub01}`;
  return `00020101021226580016ID.CO.SUARA.AISYIYAH0118936009143000000000020300051040000520458125303360${tag54}5802ID5914SUARA AISYIYAH6008JAKARTA610510110${tag62}6304`;
}

export function generateVaNumber(method: string, seedId: number): string {
  const seed = String(seedId).padStart(4, '0') + Math.floor(1000 + Math.random() * 9000);
  switch (method) {
    case 'va_bsi': return `98877${seed}`;
    case 'va_bca': return `82770${seed}`;
    case 'va_mandiri': return `88708${seed}`;
    case 'va_bni': return `98814${seed}`;
    default: return `98877${seed}`;
  }
}
