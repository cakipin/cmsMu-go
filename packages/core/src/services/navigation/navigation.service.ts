import { asc } from 'drizzle-orm';
import { menus as menusTable, posts as postsTable, getDb } from '@cmsmu/db';

export interface MenuItem {
  id?: string;
  label: string;
  url: string;
  order_num?: number;
  parent_id?: string | null;
}

export async function resolveDynamicMenus(d1: any): Promise<MenuItem[]> {
  const db = getDb(d1);
  
  // 1. Coba ambil dari tabel menus terkelola (Real Database)
  try {
    const menuRows = await db.select().from(menusTable).orderBy(asc(menusTable.orderNum));
    if (menuRows && menuRows.length > 0) {
      return menuRows.map((m: any) => ({
        id: m.id,
        label: m.label || '',
        url: m.url || '/',
        order_num: m.orderNum ?? m.order_num ?? 0,
        parent_id: m.parentId ?? m.parent_id ?? null
      }));
    }
  } catch (err) {
    console.error('Error fetching menus from DB:', err);
  }

  // 2. Aturan Fallback Dinamis (Zero Hardcode SOP): Ambil DISTINCT kategori dari postingan riil
  try {
    const catRows: any = await d1.prepare(
      "SELECT DISTINCT category FROM posts WHERE status = 'publish' AND category IS NOT NULL AND trim(category) != '' AND category != 'Uncategorized' ORDER BY category ASC LIMIT 7"
    ).all();

    if (catRows?.results && catRows.results.length > 0) {
      return [
        { label: 'Beranda', url: '/', order_num: 0 },
        ...catRows.results.map((r: any, idx: number) => {
          const catName = r.category.trim();
          const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return {
            label: catName,
            url: `/${slug}`,
            order_num: idx + 1
          };
        })
      ];
    }
  } catch (catErr) {
    console.error('Error fallback distinct categories:', catErr);
  }

  return [{ label: 'Beranda', url: '/', order_num: 0 }];
}
