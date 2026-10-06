export const componentsCss = `
/* News Grid Layouts */
.nr-section {
  padding: 2rem 0 3.5rem 0;
}

.nr-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--text-primary);
  padding-bottom: 0.5rem;
}

.nr-section-title {
  font-size: 1.1875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nr-section-title::before {
  content: "";
  width: 4px;
  height: 1.2rem;
  background-color: var(--accent-primary);
  display: inline-block;
  border-radius: 2px;
}

/* -------------------------------------------------------------
   Trending Topics Quick Rail
   ------------------------------------------------------------- */
.nr-topics-bar {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  padding: 0.5rem 0;
}

.nr-topics-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.nr-topics-inner::-webkit-scrollbar {
  display: none;
}

.nr-topics-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.6875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-primary);
  white-space: nowrap;
}

.nr-topics-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.nr-topic-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  background: var(--bg-canvas);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.15s ease;
}

.nr-topic-pill:hover {
  background: var(--accent-badge);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
}

/* -------------------------------------------------------------
   International 3-Column Editorial Grid (BBC / Reuters Style)
   ------------------------------------------------------------- */
.nr-editorial-hero {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 1.75rem;
  align-items: stretch;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 2.5rem;
}

@media (max-width: 1100px) {
  .nr-editorial-hero {
    grid-template-columns: 1fr 320px;
  }
  .nr-hero-column-opinion {
    display: none;
  }
}

@media (max-width: 820px) {
  .nr-editorial-hero {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

/* Kolom Kiri: Analisis & Wawasan Redaksi */
.nr-hero-column-opinion {
  border-right: 1px solid var(--border-subtle);
  padding-right: 1.5rem;
  display: flex;
  flex-direction: column;
}

.nr-column-header {
  font-size: 0.8125rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  border-bottom: 1.5px solid var(--border-strong);
  padding-bottom: 0.35rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nr-opinion-item {
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-subtle);
}

.nr-opinion-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.nr-opinion-title {
  font-family: var(--editorial-serif);
  font-size: 0.9375rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
}

.nr-opinion-title a:hover {
  color: var(--accent-primary);
}

.nr-opinion-meta {
  font-size: 0.6875rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Kolom Tengah: Lead Story (Main Focus) */
.nr-hero-column-lead {
  display: flex;
  flex-direction: column;
}

.nr-card-lead-pro {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.nr-card-lead-pro:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -6px rgba(0,0,0,0.08);
}

.nr-lead-img-wrap {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: #0f172a;
}

.nr-lead-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.nr-card-lead-pro:hover .nr-lead-img-wrap img {
  transform: scale(1.03);
}

.nr-lead-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.nr-category-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.nr-category-badge {
  background-color: var(--accent-badge);
  color: var(--accent-primary);
  font-size: 0.6875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
}

.nr-source-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--text-secondary);
  background: var(--bg-canvas);
  border: 1px solid var(--border-subtle);
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  text-decoration: none;
}

.nr-source-chip img {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  object-fit: cover;
}

.nr-lead-title {
  font-family: var(--editorial-serif);
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.nr-lead-title a:hover {
  color: var(--accent-primary);
}

.nr-lead-excerpt {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  line-height: 1.6;
  margin-bottom: 1.25rem;
}

.nr-meta {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

/* Kolom Kanan: Trending Network & Numbered Rank */
.nr-hero-column-trending {
  border-left: 1px solid var(--border-subtle);
  padding-left: 1.5rem;
  display: flex;
  flex-direction: column;
}

@media (max-width: 820px) {
  .nr-hero-column-trending {
    border-left: none;
    padding-left: 0;
    border-top: 1px solid var(--border-subtle);
    padding-top: 1.5rem;
  }
}

.nr-trending-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.nr-card-trending {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--border-subtle);
}

.nr-card-trending:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.nr-rank-number {
  font-family: var(--editorial-serif);
  font-size: 1.75rem;
  font-weight: 900;
  line-height: 1;
  color: var(--border-strong);
  width: 24px;
  flex-shrink: 0;
  text-align: center;
}

.nr-trending-thumb {
  width: 72px;
  height: 56px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--border-subtle);
}

.nr-trending-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nr-trending-content {
  flex: 1;
  min-width: 0;
}

.nr-trending-title {
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.35;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.nr-trending-title a:hover {
  color: var(--accent-primary);
}

/* -------------------------------------------------------------
   Standard Grid Section (Warta Daerah & Jejaring)
   ------------------------------------------------------------- */
.nr-grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 1.5rem;
}

.nr-card-standard {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.nr-card-standard:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -4px rgba(0,0,0,0.05);
}

.nr-card-thumb {
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #1e293b;
  position: relative;
}

.nr-card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.nr-card-standard:hover .nr-card-thumb img {
  transform: scale(1.04);
}

.nr-card-body {
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.nr-card-title {
  font-family: var(--editorial-serif);
  font-size: 1.0625rem;
  font-weight: 700;
  line-height: 1.38;
  margin-bottom: 0.65rem;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.nr-card-title a:hover {
  color: var(--accent-primary);
}

.nr-card-footer {
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.6875rem;
  color: var(--text-muted);
}

/* -------------------------------------------------------------
   Pagination Controller (Standar Media Profesional)
   ------------------------------------------------------------- */
.nr-pagination-wrapper {
  margin-top: 3.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.nr-pagination-info {
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-weight: 600;
  text-align: center;
}

.nr-pagination {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  padding: 0.35rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  flex-wrap: wrap;
  justify-content: center;
}

.nr-page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 38px;
  padding: 0 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-decoration: none;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  user-select: none;
}

.nr-page-btn:hover:not(.disabled):not(.active) {
  background: var(--bg-canvas);
  color: var(--accent-primary);
  border-color: var(--border-subtle);
  transform: translateY(-1px);
}

.nr-page-btn.active {
  background: var(--accent-primary);
  color: #ffffff !important;
  border-color: var(--accent-primary);
  box-shadow: 0 4px 10px rgba(2, 132, 199, 0.3);
}

.nr-page-btn.disabled {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}

.nr-page-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 38px;
  color: var(--text-muted);
  font-weight: 700;
}

@media (max-width: 640px) {
  .nr-pagination-wrapper {
    margin-top: 2.5rem;
    padding-top: 1.5rem;
  }
  .nr-page-btn {
    min-width: 34px;
    height: 34px;
    padding: 0 0.5rem;
    font-size: 0.8125rem;
  }
}

`;
