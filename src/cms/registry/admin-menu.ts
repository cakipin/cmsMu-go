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

// Registry penampung tampilan HTML view tambahan dari plugin
export const pluginViews: Record<string, string> = {};

// Fungsi untuk plugin mendaftarkan menu dirinya
export function registerPluginMenu(item: AdminMenuItem) {
  pluginMenus.push(item);
}

// Fungsi untuk plugin mendaftarkan tampilan HTML view dirinya
export function registerPluginView(viewName: string, html: string) {
  pluginViews[viewName] = html;
}

// Render seluruh view yang didaftarkan oleh plugin
export function renderPluginViews(): string {
  return Object.entries(pluginViews)
    .map(([view, html]) => `<template x-if="view === '${view}'"><div class="exclusive-wrapper">${html}</div></template>`)
    .join('\n');
}