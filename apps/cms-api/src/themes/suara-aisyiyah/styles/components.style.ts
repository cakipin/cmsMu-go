export const componentsStyle = `
/* Main Content Area */
main { padding: 40px 0; background: var(--gray-bg); min-height: 50vh; }

/* Hero Section */
.hero-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; margin-bottom: 40px; }
.post-card { background: var(--paper); border-radius: 6px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04); transition: transform 0.3s, box-shadow 0.3s; display: flex; flex-direction: column; }
.post-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
.post-img-wrap { overflow: hidden; position: relative; }
.post-img-wrap img { width: 100%; object-fit: cover; transition: transform 0.5s; }
.post-card:hover .post-img-wrap img { transform: scale(1.05); }

/* Category Tag */
.cat-tag { 
  display: inline-block; 
  padding: 4px 10px; 
  background: var(--green); 
  color: #fff; 
  font-size: 11px; 
  font-weight: 700; 
  text-transform: uppercase; 
  border-radius: 3px; 
  margin-bottom: 12px;
}
.cat-tag.black { background: var(--darker); }

/* Large Hero Post */
.hero-main .post-img-wrap { height: 420px; }
.hero-main .post-img-wrap img { height: 100%; }
.hero-main-content { padding: 30px; }
.hero-main h2 { margin: 0 0 15px; font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; line-height: 1.3; color: var(--dark); }
.hero-main h2 a:hover { color: var(--green); }
.post-meta { display: flex; gap: 15px; font-size: 13px; color: var(--gray-text); margin-bottom: 15px; font-weight: 600; }
.hero-main p { color: var(--gray-text); font-size: 15px; margin: 0; line-height: 1.6; }

/* Side List Posts */
.hero-side { display: flex; flex-direction: column; gap: 20px; }
.side-post { display: grid; grid-template-columns: 150px 1fr; gap: 20px; background: var(--paper); border-radius: 6px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); padding: 15px; align-items: center; transition: transform 0.2s; }
.side-post:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
.side-post .post-img-wrap { border-radius: 4px; height: 110px; }
.side-post .post-img-wrap img { height: 100%; }
.side-post h3 { margin: 0 0 10px; font-family: 'Playfair Display', serif; font-size: 17px; line-height: 1.4; }
.side-post .cat-tag { margin-bottom: 8px; font-size: 10px; padding: 3px 8px; }
.side-post .post-meta { margin-bottom: 0; font-size: 12px; }

/* Section Block */
.section-block { margin-top: 50px; background: var(--paper); padding: 40px; border-radius: 8px; box-shadow: 0 5px 30px rgba(0,0,0,0.03); }
.section-block.green-bg { background: var(--green); color: white; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid var(--gray-light); padding-bottom: 15px; }
.section-block.green-bg .section-header { border-bottom-color: rgba(255,255,255,0.2); }
.section-header h3 { margin: 0; font-size: 24px; font-weight: 900; position: relative; }
.section-header h3:after { content: ''; position: absolute; left: 0; bottom: -17px; width: 60px; height: 3px; background: var(--green); }
.section-block.green-bg .section-header h3:after { background: white; }

/* Grid / Scrollable Cards */
.card-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 25px; }
.grid-post { display: flex; flex-direction: column; gap: 15px; }
.grid-post .post-img-wrap { border-radius: 6px; height: 190px; }
.grid-post .post-img-wrap img { height: 100%; }
.grid-post h4 { margin: 0 0 8px; font-family: 'Playfair Display', serif; font-size: 18px; line-height: 1.4; }
.section-block.green-bg .grid-post h4 { color: white; }
.section-block.green-bg .grid-post h4 a:hover { color: #f0f0f0; text-decoration: underline; }
.section-block.green-bg .cat-tag { background: var(--darker); color: white; }

/* Dedicated Related Posts Grid (Symmetric, Line-Clamped & Horizontal Bottom Alignment) */
.related-grid { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 18px !important; margin-top: 20px !important; }
.related-grid .grid-post { 
  display: flex !important; 
  flex-direction: column !important; 
  background: #ffffff !important; 
  border: 1px solid #f1f5f9 !important; 
  border-radius: 10px !important; 
  overflow: hidden !important; 
  box-shadow: 0 1px 3px rgba(0,0,0,0.03) !important; 
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
  height: 100% !important;
  gap: 0 !important;
}
.related-grid .grid-post:hover {
  transform: translateY(-3px) !important;
  box-shadow: 0 6px 16px rgba(0,0,0,0.06) !important;
  border-color: #e2e8f0 !important;
}
.related-grid .post-img-wrap { 
  width: 100% !important; 
  aspect-ratio: 16/10 !important; 
  height: auto !important; 
  overflow: hidden !important; 
  display: block !important; 
  background: #f1f5f9 !important; 
  border-radius: 0 !important;
}
.related-grid .post-img-wrap img { 
  width: 100% !important; 
  height: 100% !important; 
  object-fit: cover !important; 
  display: block !important; 
  transition: transform 0.3s ease !important;
}
.related-grid .grid-post:hover .post-img-wrap img {
  transform: scale(1.04) !important;
}
.related-grid .grid-post-content { 
  padding: 12px 14px 14px !important; 
  display: flex !important; 
  flex-direction: column !important; 
  flex: 1 !important; 
}
.related-grid .grid-post h4 { 
  margin: 0 0 10px 0 !important; 
  font-family: 'Playfair Display', serif !important; 
  font-size: 14.5px !important; 
  font-weight: 700 !important;
  line-height: 1.42 !important; 
  display: -webkit-box !important; 
  -webkit-line-clamp: 2 !important; 
  -webkit-box-orient: vertical !important; 
  overflow: hidden !important; 
  min-height: 41px !important;
}
.related-grid .grid-post h4 a { 
  color: #1e293b !important; 
  text-decoration: none !important; 
}
.related-grid .grid-post h4 a:hover { 
  color: #059669 !important; 
}
.related-grid .grid-post .post-meta { 
  margin-top: auto !important; 
  font-size: 12px !important; 
  color: #94a3b8 !important; 
  display: flex !important; 
  align-items: center !important; 
}

/* Breadcrumb Navigation */
.breadcrumb { margin-bottom: 25px; padding: 0; font-size: 13px; color: var(--gray-text); }
.breadcrumb ol { list-style: none; display: flex; flex-wrap: wrap; gap: 0; padding: 0; margin: 0; }
.breadcrumb li { display: flex; align-items: center; }
.breadcrumb li + li::before { content: "›"; margin: 0 8px; color: var(--gray-text); font-weight: bold; }
.breadcrumb a { color: var(--green); text-decoration: none; font-weight: 500; }
.breadcrumb a:hover { text-decoration: underline; }
.breadcrumb li[aria-current="page"] { color: var(--dark); font-weight: 600; max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Single Article */
.article-page { max-width: 860px; margin: 28px auto; background: var(--paper); padding: 36px 40px 52px; border-radius: 14px; border: 1px solid #f1f5f9; box-shadow: 0 4px 24px -2px rgba(0,0,0,0.04); overflow-x: hidden; }
.article-header { text-align: left; margin-bottom: 28px; }
.article-header h1 { font-family: 'Playfair Display', serif; font-size: clamp(24px, 3.2vw, 36px); line-height: 1.32; margin: 14px 0 16px; color: var(--dark); font-weight: 700; letter-spacing: -0.01em; }
.page-title { font-family: 'Playfair Display', serif; font-size: clamp(24px, 3.2vw, 34px); font-weight: 700; color: #1e293b; margin-bottom: 16px; line-height: 1.3; }
.article-header .post-meta { justify-content: flex-start; font-size: 13.5px; gap: 8px; color: var(--gray-text); display: flex; align-items: center; }
.article-cover { width: 100%; max-height: 520px; object-fit: cover; border-radius: 12px; margin-bottom: 32px; box-shadow: 0 6px 20px -4px rgba(0,0,0,0.08); }
.article-body, #article-body-content { font-size: 17.5px; line-height: 1.85; color: #334155; max-width: 100%; overflow-wrap: break-word; word-wrap: break-word; }
.article-body a, #article-body-content a { color: #059669; text-decoration: underline; font-weight: 600; }
.article-body a:hover, #article-body-content a:hover { color: #046c4e; }
.article-body p, #article-body-content p { font-size: 17.5px; line-height: 1.85; margin-bottom: 20px; color: #334155; }
.article-body > br,
.article-body p + br,
.article-body br + p,
.article-body h1 + br,
.article-body h2 + br,
.article-body h3 + br,
#article-body-content > br,
#article-body-content p + br,
#article-body-content br + p,
#article-body-content h1 + br,
#article-body-content h2 + br,
#article-body-content h3 + br { display: none !important; }
.article-body h1, #article-body-content h1 { font-family: 'Playfair Display', serif; font-size: 26px; line-height: 1.35; margin: 36px 0 18px; color: #1e293b; font-weight: 700; }
.article-body h2, .article-body h3, #article-body-content h2, #article-body-content h3 { font-family: 'Playfair Display', serif; margin: 40px 0 20px; color: #1e293b; font-weight: 700; }
.article-body img { border-radius: 6px; margin: 30px 0; max-width: 100%; height: auto; }

/* Responsive Table Wrapper & Styles */
.table-responsive-wrapper {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 28px 0;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.article-body table, #article-body-content table {
  width: 100% !important;
  min-width: 460px;
  border-collapse: collapse;
  margin: 0 !important;
  font-size: 14px;
  line-height: 1.6;
  text-align: left;
}
.article-body th, .article-body td,
#article-body-content th, #article-body-content td {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  vertical-align: top;
  word-break: break-word;
}
.article-body thead, #article-body-content thead {
  background-color: #f8fafc;
  font-weight: 700;
  color: #0f172a;
}
.article-body table tr:nth-child(even) {
  background-color: #f8fafc;
}
.article-body table tr:hover {
  background-color: #f1f5f9;
}
.article-body > .wp-caption:first-child,
.article-body > figure:first-child,
.article-body > p:first-child > img { display: none; }

/* Empty state */
.empty { text-align: center; padding: 100px 20px; background: var(--paper); border-radius: 8px; }
.empty h1 { font-size: 28px; margin-bottom: 10px; }
.empty p { color: var(--gray-text); }

/* Article Images & Figures */
.article-body img, .page-content img {
  width: 100% !important;
  height: auto !important;
  border-radius: 8px;
  margin-top: 20px;
  margin-bottom: 5px;
  display: block;
}
.article-body figcaption, .page-content figcaption,
.article-body .wp-caption-text, .page-content .wp-caption-text,
.article-body .wp-caption, .page-content .wp-caption {
  font-size: 13px !important;
  color: #64748b !important;
  text-align: center !important;
  margin-top: 5px !important;
  margin-bottom: 25px !important;
  font-style: italic;
  line-height: 1.4 !important;
}
.article-body figure, .page-content figure,
.article-body .wp-caption, .page-content .wp-caption {
  margin: 0 0 25px 0 !important;
  width: 100% !important;
  max-width: 100% !important;
}

/* Accessibility Widget */
.a11y-widget { position: fixed !important; bottom: 20px !important; right: 20px !important; z-index: 999999 !important; font-family: sans-serif; }
.a11y-btn { width: 55px; height: 55px; background: #059669; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 26px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 2px solid white; transition: transform 0.2s; }
.a11y-btn:hover { transform: scale(1.05); }
.a11y-panel { position: absolute; bottom: 65px; right: 0; background: white; width: 250px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); overflow: hidden; display: none; border: 1px solid #e5e7eb; }
.a11y-panel.active { display: block; }
.a11y-header { background: #059669; color: white; padding: 12px 15px; font-weight: bold; font-size: 14px; display: flex; justify-content: space-between; align-items: center; }
.a11y-close { cursor: pointer; font-size: 18px; }
.a11y-body { padding: 10px; }
.a11y-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #f3f4f6; cursor: pointer; font-size: 13px; color: #374151; transition: all 0.2s; border-radius: 6px; user-select: none; }
.a11y-item:hover { background: #f9fafb; }
.a11y-item.active { background: #d1fae5 !important; color: #065f46 !important; font-weight: bold; }
.a11y-icon { width: 24px; height: 24px; border-radius: 4px; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 12px; }

@media (max-width: 768px) {
  /* Hero / Lead Section Mobile */
  main { padding: 16px 0 !important; }
  .hero-grid { 
    grid-template-columns: 1fr !important; 
    gap: 18px !important; 
    margin-bottom: 24px !important; 
  }
  .hero-main .post-img-wrap { 
    height: 200px !important; 
    aspect-ratio: 16/9 !important; 
  }
  .hero-main-content { 
    padding: 16px !important; 
  }
  .hero-main h2 { 
    font-size: 20px !important; 
    line-height: 1.35 !important; 
    margin: 0 0 10px !important; 
  }

  /* Side Posts Mobile */
  .hero-side { gap: 12px !important; }
  .side-post { 
    grid-template-columns: 105px 1fr !important; 
    gap: 12px !important; 
    padding: 10px !important; 
    border-radius: 8px !important; 
  }
  .side-post .post-img-wrap { 
    height: 75px !important; 
    border-radius: 6px !important; 
  }
  .side-post h3 { 
    font-size: 13px !important; 
    line-height: 1.35 !important; 
    margin: 0 0 6px !important; 
  }

  /* Tulisan Populer & Kategori Mobile (Clean News Feed Card) */
  .card-grid:not(.related-grid) { 
    grid-template-columns: 1fr !important; 
    gap: 12px !important; 
  }
  .related-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 14px !important;
  }
  @media (max-width: 520px) {
    .related-grid {
      grid-template-columns: 1fr !important;
    }
  }
  .grid-post:not(.related-grid .grid-post) { 
    display: grid !important; 
    grid-template-columns: 105px 1fr !important; 
    gap: 12px !important; 
    align-items: center !important; 
    background: var(--paper); 
    padding: 10px !important; 
    border-radius: 8px !important; 
    box-shadow: 0 2px 6px rgba(0,0,0,0.03) !important; 
  }
  .grid-post .post-img-wrap { 
    height: 75px !important; 
    width: 105px !important; 
    border-radius: 6px !important; 
    flex-shrink: 0 !important; 
  }
  .grid-post h4 { 
    font-size: 13px !important; 
    line-height: 1.35 !important; 
    margin: 0 0 6px !important; 
  }
  .grid-post .cat-tag { 
    margin-bottom: 4px !important; 
    font-size: 9px !important; 
    padding: 2px 6px !important; 
  }
  .grid-post .post-meta { 
    margin-bottom: 0 !important; 
    font-size: 11px !important; 
  }

  /* Section Block Mobile */
  .section-block { 
    padding: 18px 14px !important; 
    margin-top: 24px !important; 
    border-radius: 8px !important; 
  }
  .section-header { 
    margin-bottom: 16px !important; 
    padding-bottom: 10px !important; 
  }
  .section-header h3 { 
    font-size: 18px !important; 
  }

  /* Banner Mobile */
  .sa-style-55 { 
    height: 130px !important; 
    max-height: 140px !important; 
    border-radius: 6px !important; 
  }
  .sa-style-54, .sa-style-53 { 
    margin: 18px auto !important; 
  }

  .a11y-widget {
    bottom: calc(72px + env(safe-area-inset-bottom, 0px)) !important;
    right: 14px !important;
  }
  .a11y-btn {
    width: 44px !important;
    height: 44px !important;
    font-size: 20px !important;
  }
  .a11y-panel {
    bottom: 54px !important;
  }

  /* Mobile Single Article & Page Optimization */
  .article-page {
    padding: 20px 14px 32px !important;
    border-radius: 8px !important;
    margin: 0 auto !important;
    box-shadow: none !important;
  }
  .article-header {
    margin-bottom: 24px !important;
  }
  .article-header h1 {
    font-size: clamp(17px, 4.6vw, 20px) !important;
    line-height: 1.25 !important;
    margin: 10px 0 16px !important;
    letter-spacing: -0.2px !important;
    word-break: break-word;
  }
  .page-title {
    font-size: clamp(17px, 4.6vw, 20px) !important;
    line-height: 1.25 !important;
    margin-bottom: 14px !important;
    letter-spacing: -0.2px !important;
    word-break: break-word;
  }
  .page-content,
  .sa-style-159 {
    background: var(--paper) !important;
    padding: 20px 14px 32px !important;
    border-radius: 8px !important;
    margin: 0 auto !important;
    box-shadow: none !important;
  }
  .sa-style-158 {
    padding-top: 10px !important;
    padding-bottom: 40px !important;
  }
  .article-cover {
    margin-bottom: 24px !important;
    border-radius: 6px !important;
  }
  .article-body, #article-body-content, #page-body-content {
    font-size: 16px !important;
    line-height: 1.75 !important;
  }
  .article-body p, #article-body-content p, #page-body-content p {
    margin-bottom: 18px !important;
  }
}

.sa-style-159,
.page-content {
  background: var(--paper) !important;
  color: var(--dark);
}
html.dark-mode .sa-style-159,
html.dark-mode .page-content {
  background: var(--paper) !important;
  color: #f8fafc !important;
}
html.dark-mode .page-title {
  color: #f8fafc !important;
}

body.a11y-large-text p, body.a11y-large-text span, body.a11y-large-text a, body.a11y-large-text li, body.a11y-large-text div { font-size: 1.18rem !important; line-height: 1.7 !important; }
body.a11y-large-text h1 { font-size: 2.5rem !important; }
body.a11y-large-text h2 { font-size: 2rem !important; }
body.a11y-large-text h3 { font-size: 1.6rem !important; }

body.a11y-readable-font, body.a11y-readable-font * { font-family: 'Arial', 'Helvetica', sans-serif !important; letter-spacing: 0.5px !important; }

body.a11y-high-contrast { background-color: #121212 !important; color: #ffffff !important; }
body.a11y-high-contrast div:not(.a11y-widget):not(.a11y-panel):not(.a11y-body):not(.a11y-header), 
body.a11y-high-contrast section, 
body.a11y-high-contrast article, 
body.a11y-high-contrast main, 
body.a11y-high-contrast header, 
body.a11y-high-contrast footer, 
body.a11y-high-contrast nav { background-color: #121212 !important; color: #ffffff !important; border-color: #333333 !important; }
body.a11y-high-contrast a:not(.a11y-item) { color: #facc15 !important; text-decoration: underline !important; }
body.a11y-highlight-links a:not(.a11y-item) { background-color: #fef08a !important; color: #000000 !important; text-decoration: underline !important; font-weight: bold !important; padding: 1px 3px !important; border-radius: 2px !important; }

/* Related banner slot */
.related-banner-slot { grid-column: span 2; display: flex; align-items: center; justify-content: center; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; min-height: 250px; text-align: center; padding: 30px; transition: all 0.3s ease; }
.related-banner-slot:hover { border-color: #059669; background: #f0fdf4; }
@media (max-width: 900px) { .related-banner-slot { grid-column: span 2; } }
@media (max-width: 768px) { .related-banner-slot { grid-column: span 1; min-height: 150px; } }

/* Numbered Pagination */
.numbered-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    margin: 40px 0 20px 0;
    flex-wrap: wrap;
    font-size: 14px;
}
.numbered-pagination .pagination-btn {
    display: inline-flex;
    align-items: center;
    padding: 8px 14px;
    background: #ffffff;
    color: #334155;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
}
.numbered-pagination .pagination-btn:hover {
    background: #059669;
    color: #ffffff;
    border-color: #059669;
}
.numbered-pagination .pagination-disabled {
    display: inline-flex;
    align-items: center;
    padding: 8px 14px;
    background: #f1f5f9;
    color: #94a3b8;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-weight: 500;
    cursor: not-allowed;
    user-select: none;
}
.numbered-pagination .pagination-numbers {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
.numbered-pagination .pagination-numbers a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 6px;
    background: #ffffff;
    color: #334155;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
}
.numbered-pagination .pagination-numbers a:hover {
    background: #e2e8f0;
    color: #0f172a;
}
.numbered-pagination .pagination-numbers a[aria-current="page"] {
    background: #059669 !important;
    color: #ffffff !important;
    border-color: #059669 !important;
    font-weight: 700;
}
.numbered-pagination .pagination-ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 36px;
    color: #94a3b8;
    font-weight: 600;
}

html.dark-mode .numbered-pagination .pagination-btn,
html.dark-mode .numbered-pagination .pagination-numbers a {
    background: #1e293b !important;
    color: #e2e8f0 !important;
    border-color: #334155 !important;
}
html.dark-mode .numbered-pagination .pagination-numbers a[aria-current="page"] {
    background: #059669 !important;
    color: #ffffff !important;
    border-color: #059669 !important;
}
html.dark-mode .numbered-pagination .pagination-disabled {
    background: #0f172a !important;
    color: #64748b !important;
    border-color: #1e293b !important;
}

/* Inline Baca Juga */
.inline-baca-juga {
    margin: 24px 0 !important;
    padding: 12px 18px !important;
    background: #f8fafc !important;
    border-left: 4px solid #047857 !important;
    border-radius: 4px !important;
    font-size: 15px !important;
    line-height: 1.6 !important;
}
.inline-baca-juga strong {
    color: #047857 !important;
    margin-right: 4px;
}
.inline-baca-juga a {
    color: #1e293b !important;
    font-weight: 600 !important;
    text-decoration: underline !important;
    text-underline-offset: 3px !important;
    transition: color 0.2s ease;
}
.inline-baca-juga a:hover {
    color: #047857 !important;
}

html.dark-mode .inline-baca-juga {
    background: #1e293b !important;
    border-left-color: #059669 !important;
}
html.dark-mode .inline-baca-juga strong {
    color: #34d399 !important;
}
html.dark-mode .inline-baca-juga a {
    color: #f1f5f9 !important;
}
html.dark-mode .inline-baca-juga a:hover {
    color: #34d399 !important;
}

/* Konsultasi Page */
.konsultasi-card {
    transition: all 0.3s ease;
}
.konsultasi-input:focus {
    border-color: #059669 !important;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15) !important;
}
@media (max-width: 640px) {
    .konsultasi-card form > div[style*="grid-template-columns: 1fr 1fr"] {
        grid-template-columns: 1fr !important;
    }
}
html.dark-mode .konsultasi-card {
    background: #1e293b !important;
    border-color: #334155 !important;
}
html.dark-mode .konsultasi-label,
html.dark-mode .konsultasi-cat-title {
    color: #f8fafc !important;
}
html.dark-mode .konsultasi-cat-label {
    background: #0f172a !important;
    border-color: #334155 !important;
}
html.dark-mode .konsultasi-cat-desc,
html.dark-mode .konsultasi-note {
    color: #94a3b8 !important;
}
html.dark-mode .konsultasi-input {
    background: #0f172a !important;
    border-color: #334155 !important;
    color: #f8fafc !important;
}
`;
