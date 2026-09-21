// src/registry/admin-menu.ts

export interface AdminMenuItem {
  group: string;
  title: string;
  view?: string;       // Untuk menu internal (SPA)
  href?: string;       // Untuk menu eksternal/link
  icon: string;
  role?: string[];
  pluginId?: string;   // ID plugin untuk mengontrol visibilitas dinamis (On/Off)
  actionCode?: string; // String function body untuk dijalankan di client
}

// Array penampung menu tambahan dari plugin
export const pluginMenus: AdminMenuItem[] = [];

// Fungsi untuk plugin mendaftarkan dirinya
export function registerPluginMenu(item: AdminMenuItem) {
  pluginMenus.push(item);
}