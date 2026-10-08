export const baseCss = `
/* ==========================================================================
   THEME NEWSROOM - EDITORIAL DESIGN TOKENS & ANTI-SLOP SYSTEM
   ========================================================================== */

:root {
  --bg-canvas: #f8fafc;
  --bg-surface: #ffffff;
  --bg-surface-elevated: #ffffff;
  --border-subtle: #e2e8f0;
  --border-strong: #cbd5e1;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --accent-primary: #0284c7;
  --accent-hover: #0369a1;
  --accent-badge: #e0f2fe;
  --editorial-serif: "Merriweather", Georgia, "Times New Roman", serif;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --container-max: 1200px;
}

[data-theme="dark"] {
  --bg-canvas: #090d16;
  --bg-surface: #111827;
  --bg-surface-elevated: #1f2937;
  --border-subtle: #1e293b;
  --border-strong: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --accent-primary: #38bdf8;
  --accent-hover: #7dd3fc;
  --accent-badge: #0c4a6e;
}

/* Reset & Base */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-canvas);
  color: var(--text-primary);
  font-family: var(--font-sans);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

a {
  color: inherit;
  text-decoration: none;
  transition: color 0.15s ease;
}

a:hover {
  color: var(--accent-primary);
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

.nr-container {
  width: 100%;
  max-width: var(--container-max);
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}

/* Topbar: Breaking News Ticker & Live Date */
.nr-topbar {
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.8125rem;
  padding: 0.5rem 0;
}

.nr-topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.nr-ticker-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow: hidden;
  white-space: nowrap;
}

.nr-badge-live {
  background-color: #ef4444;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.6875rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.nr-badge-live::before {
  content: "";
  width: 6px;
  height: 6px;
  background: #ffffff;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}

.nr-ticker-text {
  color: var(--text-secondary);
  font-weight: 500;
}

.nr-topbar-meta {
  color: var(--text-muted);
  font-size: 0.75rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nr-khgt-container {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 500;
}

.nr-khgt-sep {
  opacity: 0.4;
  margin: 0 0.15rem;
}

.nr-khgt-text {
  font-weight: 600;
  color: var(--text-secondary);
}

.nr-khgt-badge {
  color: var(--accent-primary);
  font-weight: 700;
  text-decoration: none;
  background-color: var(--bg-canvas);
  border: 1px solid var(--border-subtle);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.6875rem;
  transition: all 0.15s ease;
  margin-left: 0.2rem;
}

.nr-khgt-badge:hover {
  background-color: var(--accent-primary);
  color: #ffffff;
  border-color: var(--accent-primary);
}

@media (max-width: 768px) {
  .nr-topbar-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }
  .nr-ticker-wrap {
    width: 100%;
  }
  .nr-topbar-meta {
    width: 100%;
    justify-content: space-between;
    font-size: 0.7rem;
    gap: 0.5rem;
  }
  .nr-khgt-container {
    flex-wrap: wrap;
  }
}

/* Header Masthead */
.nr-masthead {
  background-color: var(--bg-surface);
  border-bottom: 2px solid var(--text-primary);
  padding: 1.5rem 0;
}

.nr-masthead-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.nr-brand {
  display: flex;
  flex-direction: column;
}

.nr-logo-text {
  font-size: 2.25rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.1;
  text-transform: uppercase;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nr-logo-tagline {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
  margin-top: 0.25rem;
}

.nr-masthead-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nr-search-form {
  position: relative;
  display: flex;
  align-items: center;
}

.nr-search-input {
  background-color: var(--bg-canvas);
  border: 1px solid var(--border-subtle);
  border-radius: 9999px;
  padding: 0.5rem 1rem 0.5rem 2.25rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  width: 200px;
  transition: width 0.2s ease, border-color 0.2s ease;
}

.nr-search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  width: 260px;
}

.nr-search-icon {
  position: absolute;
  left: 0.875rem;
  color: var(--text-muted);
  pointer-events: none;
  font-size: 0.8125rem;
}

/* Header Auth Section */
.nr-auth-box {
  display: inline-flex;
  align-items: center;
  position: relative;
}

.nr-login-btn,
.header-login-btn {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-primary);
  background: transparent;
  border: 1.5px solid var(--accent-primary);
  padding: 6px 16px;
  border-radius: 20px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  cursor: pointer;
}

.nr-login-btn:hover,
.header-login-btn:hover {
  background-color: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #ffffff;
}

.nr-user-wrapper,
.header-user-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.header-user-avatar-btn {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  outline: none;
  transition: transform 0.15s, box-shadow 0.15s;
}

.header-user-avatar-btn:hover {
  transform: scale(1.05);
}

.header-user-avatar-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid var(--border-subtle);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  background: var(--accent-primary);
}

.header-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.header-avatar-initial {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-hover) 100%);
  color: #ffffff;
  font-weight: 800;
  font-size: 14px;
  text-transform: uppercase;
  user-select: none;
}

.header-user-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  min-width: 210px;
  background: var(--bg-surface-elevated);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  border: 1px solid var(--border-subtle);
  z-index: 1000;
  padding: 6px 0;
  animation: nrFadeInDropdown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes nrFadeInDropdown {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-dropdown-header {
  padding: 10px 16px 8px;
}

.dropdown-user-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.dropdown-user-role {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.user-dropdown-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 4px 0;
}

.user-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  box-sizing: border-box;
}

.user-dropdown-item:hover {
  background: var(--bg-canvas);
  color: var(--accent-primary);
}

.user-dropdown-item svg {
  flex-shrink: 0;
}

.user-dropdown-item.logout-item {
  color: #dc2626;
}

.user-dropdown-item.logout-item:hover {
  background: #fef2f2;
  color: #b91c1c;
}

.nr-avatar-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  outline: none;
  transition: transform 0.15s ease;
}

.nr-avatar-btn:hover {
  transform: scale(1.05);
}

.nr-avatar-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--border-subtle);
  overflow: hidden;
  background: var(--accent-primary);
}

.nr-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.nr-avatar-initial {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #ffffff;
  font-weight: 800;
  font-size: 0.9375rem;
  text-transform: uppercase;
}

.nr-user-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  min-width: 200px;
  background-color: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.12);
  z-index: 100;
  padding: 0.5rem 0;
}

.nr-dropdown-header {
  padding: 0.5rem 1rem;
}

.nr-dropdown-name {
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nr-dropdown-role {
  font-size: 0.6875rem;
  font-weight: 800;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.15rem;
}

.nr-dropdown-divider {
  height: 1px;
  background-color: var(--border-subtle);
  margin: 0.35rem 0;
}

.nr-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.nr-dropdown-item:hover {
  background-color: var(--bg-canvas);
  color: var(--accent-primary);
}

.nr-logout-item {
  color: #ef4444 !important;
}

.nr-logout-item:hover {
  background-color: #fef2f2 !important;
}

/* Main Navigation Navbar */
.nr-navbar {
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.nr-navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nr-nav-links {
  display: flex;
  list-style: none;
  gap: 0.25rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.nr-nav-links::-webkit-scrollbar {
  display: none;
}

.nr-nav-item a {
  display: block;
  padding: 0.875rem 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nr-nav-item a:hover,
.nr-nav-item.active a {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
}

`;
