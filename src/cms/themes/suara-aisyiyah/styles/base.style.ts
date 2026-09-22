export const baseStyle = `
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Playfair+Display:wght@400;600;700;900&display=swap');

:root { 
  --green: #3fb950; 
  --green-dark: #327f2b;
  --dark: #121212;
  --darker: #0a0a0a;
  --gray-bg: #f9f9f9;
  --gray-light: #ededed;
  --gray-text: #666666;
  --paper: #ffffff; 
}
html.dark-mode {
  --paper: #444444 !important;
  --dark: #ffffff !important;
  --gray-bg: #333333 !important;
  --gray-light: #555555 !important;
  --gray-text: #cccccc !important;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { 
  margin: 0; 
  background: var(--paper); 
  color: var(--dark); 
  font-family: 'Lato', sans-serif; 
  line-height: 1.6; 
  font-size: 15px;
}
a { color: inherit; text-decoration: none; transition: color 0.2s; }
a:hover { color: var(--green); }
img { display: block; max-width: 100%; height: auto; }
.container { width: min(1170px, calc(100% - 30px)); margin: auto; }

/* Dark Mode Overrides (Presisi Asli suaraaisyiyah.id) */
html.dark-mode, 
html.dark-mode body,
html.dark-mode main,
html.dark-mode .home-transparent-block,
html.dark-mode main .container,
html.dark-mode .card,
html.dark-mode .section-block,
html.dark-mode article,
html.dark-mode .page-content,
html.dark-mode .sa-style-159,
html.dark-mode .post-card,
html.dark-mode .grid-post,
html.dark-mode .lead-section,
html.dark-mode .hero-grid,
html.dark-mode .hero-grid-side,
html.dark-mode [class*="bg-white"],
html.dark-mode div[style*="background: white"],
html.dark-mode div[style*="background-color: white"],
html.dark-mode div[style*="background:#fff"],
html.dark-mode div[style*="background-color:#fff"],
html.dark-mode .dropdown-content,
html.dark-mode #site-search { background-color: #444444 !important; color: #ffffff !important; border-color: #555555 !important; }

/* Text & Title Visibility Overrides */
html.dark-mode a { color: #ffffff !important; }
html.dark-mode h1, html.dark-mode h2, html.dark-mode h3, html.dark-mode h4, html.dark-mode h5, 
html.dark-mode .post-title, html.dark-mode .section-header h3, 
html.dark-mode .grid-post h4 a, html.dark-mode .hero-grid a,
html.dark-mode .article-title, html.dark-mode .entry-title { color: #ffffff !important; }
html.dark-mode .post-date, html.dark-mode .text-muted, html.dark-mode .sa-style-17, html.dark-mode .meta, html.dark-mode .author-name { color: #cccccc !important; }

/* Breadcrumb Dark Mode */
html.dark-mode .breadcrumb, 
html.dark-mode .breadcrumb * { background-color: transparent !important; color: #cccccc !important; }
html.dark-mode .breadcrumb a { color: #34d399 !important; text-decoration: underline !important; }
html.dark-mode .breadcrumb li[aria-current="page"] { color: #ffffff !important; }

/* Google Translate Cleanups */
.goog-te-banner-frame, .goog-te-balloon-frame, #goog-gt-tt, .goog-te-spinner-pos { display: none !important; }
body { top: 0 !important; position: static !important; }
.goog-text-highlight { background: transparent !important; box-shadow: none !important; }
.goog-te-gadget-simple { background-color: transparent !important; border: none !important; }
`;
