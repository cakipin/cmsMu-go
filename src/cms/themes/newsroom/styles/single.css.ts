export const singleCss = `
/* ==========================================================================
   HESTIA PRO STYLE SINGLE POST EXPERIENCE (HERO FULL-WIDTH & RAISED CONTAINER)
   ========================================================================== */

/* Full-width Hero Header with Dark Overlay */
.nr-hero-header {
  position: relative;
  width: 100%;
  min-height: 440px;
  max-height: 520px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1.5rem 8rem 1.5rem;
}

.nr-hero-header::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.65) 0%, rgba(15, 23, 42, 0.8) 100%);
  z-index: 1;
}

.nr-hero-inner {
  position: relative;
  z-index: 2;
  max-width: 860px;
  width: 100%;
  margin: 0 auto;
  color: #ffffff;
}

.nr-hero-category {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #ffffff;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
}

.nr-hero-category:hover {
  background: #ffffff;
  color: var(--accent-primary);
}

.nr-hero-title {
  font-family: var(--font-sans);
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1.2;
  color: #ffffff;
  margin-bottom: 1.25rem;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

@media (max-width: 768px) {
  .nr-hero-header {
    min-height: 360px;
    padding: 3rem 1rem 6rem 1rem;
  }
  .nr-hero-title {
    font-size: 1.75rem;
  }
}

.nr-hero-byline {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.nr-hero-byline strong {
  color: #ffffff;
  font-weight: 600;
}

/* Hestia Pro Main Raised Overlapping Container */
.nr-main-raised {
  position: relative;
  z-index: 3;
  max-width: 980px;
  margin: -100px auto 4rem auto;
  background-color: var(--bg-surface);
  border-radius: 12px;
  box-shadow: 0 16px 38px -12px rgba(0, 0, 0, 0.25), 0 4px 25px 0 rgba(0, 0, 0, 0.12);
  padding: 3.5rem 4rem;
  border: 1px solid var(--border-subtle);
}

@media (max-width: 992px) {
  .nr-main-raised {
    margin: -80px 1.25rem 3rem 1.25rem;
    padding: 2.5rem 2rem;
  }
}

@media (max-width: 640px) {
  .nr-main-raised {
    margin: -60px 0.75rem 2rem 0.75rem;
    padding: 2rem 1.25rem;
    border-radius: 8px;
  }
}

/* Breadcrumb in Raised Container */
.nr-breadcrumb {
  margin-bottom: 1.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.nr-breadcrumb ol {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
}

.nr-breadcrumb li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nr-breadcrumb li:not(:last-child)::after {
  content: "/";
  color: var(--border-strong);
  font-size: 0.75rem;
}

.nr-breadcrumb a {
  color: var(--text-secondary);
}

.nr-breadcrumb a:hover {
  color: var(--accent-primary);
}

.nr-breadcrumb li[aria-current="page"] {
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
}

/* Journalistic Toolbar (Favicon & Media Name di kiri, Action Buttons di kanan) */
.nr-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 0.65rem 1rem;
  background-color: var(--bg-canvas);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  flex-wrap: wrap;
}

.nr-toolbar-brand {
  display: inline-flex;
  align-items: center;
}

.nr-source-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  white-space: nowrap;
  opacity: 0.75;
  transition: opacity 0.2s ease;
}

.nr-source-link:hover {
  opacity: 1;
}

.nr-toolbar-favicon {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  object-fit: contain;
  flex-shrink: 0;
}

.nr-toolbar-sitename {
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: inline-block;
}

.nr-toolbar-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.nr-action-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.nr-action-btn:hover {
  background: var(--accent-primary);
  color: #ffffff;
  border-color: var(--accent-primary);
}

.nr-action-icon-only {
  padding: 0.4rem 0.65rem;
  font-size: 0.9375rem;
}

.nr-action-tts {
  background: #059669;
  color: #ffffff;
  border-color: #059669;
}

.nr-action-tts:hover {
  background: #047857;
  border-color: #047857;
  color: #ffffff;
}

/* Article Content Body */
.nr-article-body {
  font-family: var(--editorial-serif);
  font-size: 1.125rem;
  line-height: 1.85;
  color: var(--text-primary);
  letter-spacing: -0.003em;
}

.nr-article-body p {
  margin-bottom: 1.35rem;
}

.nr-article-body p:empty,
.nr-article-body p:blank {
  display: none !important;
}

.nr-article-body br + br {
  display: none !important;
}

.nr-article-body h2,
.nr-article-body h3 {
  font-family: var(--font-sans);
  font-weight: 800;
  color: var(--text-primary);
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.nr-article-body h2 {
  font-size: 1.65rem;
}

.nr-article-body h3 {
  font-size: 1.35rem;
}

.nr-article-body img {
  border-radius: 8px;
  margin: 1.5rem auto;
  max-width: 100% !important;
  height: auto !important;
  display: block;
}

.nr-article-body figure,
.nr-article-body figure.wp-caption,
.nr-article-body .article-figure {
  max-width: 100% !important;
  width: auto !important;
  margin: 2rem auto;
  text-align: center;
  overflow: hidden;
}

.nr-article-body figcaption {
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 0.5rem;
}

.nr-article-body blockquote {
  font-style: italic;
  border-left: 4px solid var(--accent-primary);
  padding: 1rem 1.5rem;
  margin: 2rem 0;
  background: var(--bg-canvas);
  border-radius: 0 8px 8px 0;
  color: var(--text-secondary);
}

/* Table Responsive Wrapper */
.table-responsive-wrapper {
  overflow-x: auto;
  margin: 2rem 0;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
}

.table-responsive-wrapper table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-sans);
  font-size: 0.875rem;
}

.table-responsive-wrapper th,
.table-responsive-wrapper td {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-subtle);
}

.table-responsive-wrapper th {
  background-color: var(--bg-canvas);
  font-weight: 700;
}

/* Baca Juga in Middle of Article */
.nr-baca-juga {
  margin: 2.25rem 0;
  padding: 1.25rem 1.5rem;
  background-color: var(--bg-canvas);
  border-left: 4px solid var(--accent-primary);
  border-radius: 0 8px 8px 0;
  font-family: var(--font-sans);
}

.nr-baca-juga h4 {
  font-size: 0.8125rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--accent-primary);
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.nr-baca-juga ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nr-baca-juga li a {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.nr-baca-juga li a:hover {
  color: var(--accent-primary);
}

/* Attribution Box */
.nr-attribution-box {
  background-color: var(--bg-canvas);
  border: 1px solid var(--border-subtle);
  border-left: 4px solid var(--accent-primary);
  padding: 1.25rem 1.5rem;
  border-radius: 0 8px 8px 0;
  margin: 2.5rem 0;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.6;
}

.nr-attribution-box strong {
  color: var(--text-primary);
}

/* Share Block */
.nr-share-block {
  margin: 3rem 0 2rem 0;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.nr-share-title {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.nr-share-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nr-share-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff !important;
  transition: opacity 0.2s ease;
}

.nr-share-btn:hover {
  opacity: 0.9;
}

.nr-share-wa { background-color: #25d366; }
.nr-share-fb { background-color: #1877f2; }
.nr-share-tw { background-color: #0f172a; }
.nr-share-gnews { background-color: #ffffff; color: #1e293b !important; border: 1px solid var(--border-subtle); }

/* Article Tags */
.nr-article-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px dashed var(--border-subtle);
  font-size: 0.8125rem;
}

.nr-tag-label {
  font-weight: 700;
  color: var(--text-muted);
}

.nr-tag-item {
  background-color: var(--bg-canvas);
  border: 1px solid var(--border-subtle);
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  color: var(--text-secondary);
  font-weight: 500;
}

.nr-tag-item:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* Comments Section */
.nr-comments-section {
  margin-top: 3.5rem;
  padding-top: 2.5rem;
  border-top: 2px solid var(--border-subtle);
  font-family: var(--font-sans);
}

.nr-comments-title {
  font-size: 1.35rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.nr-comment-form {
  background-color: var(--bg-canvas);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.nr-comment-form textarea {
  width: 100%;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--text-primary);
  background-color: var(--bg-surface);
  resize: vertical;
}

.nr-comment-form textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.nr-comment-submit-btn {
  margin-top: 0.75rem;
  background-color: var(--accent-primary);
  color: #ffffff;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.nr-comment-submit-btn:hover {
  background-color: var(--accent-hover);
}

.nr-comment-item {
  display: flex;
  gap: 1rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--border-subtle);
}

.nr-comment-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.nr-comment-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.nr-comment-author {
  font-weight: 700;
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.nr-comment-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.nr-comment-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Related Posts Inside Single */
.nr-related-section {
  margin-top: 3.5rem;
  padding-top: 2.5rem;
  border-top: 2px solid var(--border-subtle);
}

.nr-related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

/* Footer */
.nr-footer {
  background-color: #0b1120;
  color: #94a3b8;
  padding: 3.5rem 0 2rem 0;
  margin-top: 4rem;
  font-size: 0.875rem;
}

.nr-footer a {
  color: #e2e8f0;
}

.nr-footer a:hover {
  color: var(--accent-primary);
}

.nr-footer-inner {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 2.5rem;
}

@media (max-width: 768px) {
  .nr-footer-inner {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.nr-footer-bottom {
  border-top: 1px solid #1e293b;
  padding-top: 2rem;
  text-align: center;
  font-size: 0.8125rem;
}

/* ============================================================
   PWA MOBILE BOTTOM NAVIGATION BAR (SUARA AISYIYAH FEATURE)
   ============================================================ */
.mobile-bottom-nav {
  display: none;
}

@media (max-width: 768px) {
  .mobile-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9990;
    background: var(--bg-surface);
    border-top: 1px solid var(--border-subtle);
    padding: 6px 0 calc(6px + env(safe-area-inset-bottom, 0px));
    justify-content: space-around;
    align-items: stretch;
    box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
  }

  .mbn-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 3px;
    padding: 4px 2px;
    text-decoration: none;
    color: var(--text-muted);
    font-size: 10px;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
    background: none;
    border: none;
    transition: color 0.18s, transform 0.15s;
    -webkit-tap-highlight-color: transparent;
    border-radius: 10px;
    margin: 0 2px;
  }

  .mbn-item:active {
    transform: scale(0.92);
  }

  .mbn-item svg {
    width: 22px;
    height: 22px;
    stroke-width: 1.8;
    flex-shrink: 0;
  }

  .mbn-label {
    font-size: 10px;
  }

  .mbn-item.active {
    color: var(--accent-primary);
  }

  .mbn-item.active svg {
    stroke: var(--accent-primary);
  }

  .mbn-avatar-wrap {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--accent-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }

  .mbn-avatar-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
`;
