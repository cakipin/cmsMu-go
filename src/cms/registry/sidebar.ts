// src/registry/sidebar.ts

export interface SidebarItem {
  label: string;
  url: string;
  icon: string;
  category: "Navigasi" | "Kajian" | "Majelis" | "Admin";
}

// Array pusat untuk menyimpan menu
export const sidebarRegistry: SidebarItem[] = [];

// Fungsi untuk mendaftarkan menu baru
export const registerSidebarItem = (item: SidebarItem) => {
  // Cek agar tidak ada duplikat URL
  const exists = sidebarRegistry.find(i => i.url === item.url);
  if (!exists) {
    sidebarRegistry.push(item);
  }
};
