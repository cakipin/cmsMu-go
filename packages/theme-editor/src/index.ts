/**
 * 🎨 @cmsmu/theme-editor
 * Paket mandiri CMSMu Canvas Visual Builder & Theme Studio.
 */

export * from "./types.js";

export const THEME_EDITOR_ROLES = ["superadmin", "admin", "editor"] as const;

export function isThemeEditorRole(role?: string | null): boolean {
  if (!role) return false;
  return (THEME_EDITOR_ROLES as readonly string[]).includes(role.toLowerCase());
}
