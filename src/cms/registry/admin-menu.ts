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
export const pluginViews: Record<string, string | (() => string)> = {};

// Registry penampung script client-side tambahan dari plugin (dieksekusi di <head>)
export const pluginScripts: string[] = [];

// Fungsi untuk plugin mendaftarkan menu dirinya
export function registerPluginMenu(item: AdminMenuItem) {
  pluginMenus.push(item);
}

// Fungsi untuk plugin mendaftarkan skrip client-side dirinya
export function registerPluginScript(script: string) {
  if (script && !pluginScripts.includes(script)) {
    pluginScripts.push(script);
  }
}

// Fungsi untuk plugin mendaftarkan tampilan HTML view dirinya
export function registerPluginView(viewName: string, htmlOrFn: string | (() => string)) {
  if (typeof htmlOrFn === 'function') {
    pluginViews[viewName] = htmlOrFn;
    return;
  }

  // Jika string mengandung tag <script>, ekstrak isinya ke pluginScripts dan bersihkan dari view HTML
  // Ini mencegah bug HTML5 di mana skrip di dalam <template> tidak dieksekusi oleh browser.
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(htmlOrFn)) !== null) {
    const scriptContent = match[1]?.trim();
    if (scriptContent) {
      registerPluginScript(scriptContent);
    }
  }

  const cleanHtml = htmlOrFn.replace(scriptRegex, '');
  pluginViews[viewName] = cleanHtml;
}

// Render seluruh view yang didaftarkan oleh plugin
export function renderPluginViews(): string {
  return Object.entries(pluginViews)
    .map(([view, htmlOrFn]) => {
      const html = typeof htmlOrFn === 'function' ? htmlOrFn() : htmlOrFn;
      const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
      let match;
      while ((match = scriptRegex.exec(html)) !== null) {
        const scriptContent = match[1]?.trim();
        if (scriptContent) {
          registerPluginScript(scriptContent);
        }
      }
      const cleanHtml = html.replace(scriptRegex, '');
      return `<template x-if="view === '${view}'"><div class="exclusive-wrapper">${cleanHtml}</div></template>`;
    })
    .join('\n');
}

// Render seluruh skrip client yang didaftarkan plugin untuk disematkan di <head>
export function renderPluginScripts(): string {
  return pluginScripts
    .map(script => `<script>\n${script}\n</script>`)
    .join('\n');
}