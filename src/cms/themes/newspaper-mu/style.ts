export const css = `
/* ==========================================================================
   1. CSS VARIABLES & THEME TOKENS
   ========================================================================== */
:root {
  /* Colors */
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --secondary: #1e293b;
  --accent: #f59e0b;
  
  /* Light Mode (Default) */
  --bg-body: #f8fafc;
  --bg-card: #ffffff;
  --bg-muted: #f1f5f9;
  --text-main: #334155;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  
  /* Typography */
  --font-main: 'Inter', system-ui, sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;

  /* Layout */
  --container-width: 1200px;
  --header-height: 70px;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
}

/* Dark Mode Support */
[data-theme="dark"] {
  --bg-body: #0f172a;
  --bg-card: #1e293b;
  --bg-muted: #334155;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #334155;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.5);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.5);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg-body: #0f172a;
    --bg-card: #1e293b;
    --bg-muted: #334155;
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    --border-color: #334155;
  }
}

/* ==========================================================================
   2. RESET & BASE
   ========================================================================== */
* { box-sizing: border-box; margin: 0; padding: 0; }
body { 
  font-family: var(--font-main); 
  background: var(--bg-body); 
  color: var(--text-main); 
  line-height: 1.6; 
  transition: background-color 0.3s, color 0.3s;
}
a { text-decoration: none; color: var(--primary); transition: 0.2s; }
a:hover { color: var(--primary-hover); }
img, video, iframe { max-width: 100%; height: auto; display: block; border-radius: var(--radius-md); }
h1, h2, h3, h4, h5, h6 { color: var(--text-main); font-weight: 700; line-height: 1.2; margin-bottom: 1rem; }

/* ==========================================================================
   3. LAYOUT & GRID UTILITIES
   ========================================================================== */
.container { width: 100%; max-width: var(--container-width); margin: 0 auto; padding: 0 20px; }

/* Responsive Grid */
.grid { display: grid; gap: 30px; }
.grid-cols-1 { grid-template-columns: 1fr; }
@media (min-width: 640px) { .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 768px) { .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

/* Page Templates */
.main-wrapper { padding: 40px 0; display: grid; gap: 40px; }
.layout-right-sidebar { grid-template-columns: 1fr; }
.layout-left-sidebar { grid-template-columns: 1fr; }
.layout-full { grid-template-columns: 1fr; }
@media (min-width: 992px) {
  .layout-right-sidebar { grid-template-columns: 1fr 320px; }
  .layout-left-sidebar { grid-template-columns: 320px 1fr; }
}

/* ==========================================================================
   4. NAVIGATION (HEADER)
   ========================================================================== */
.pro-header { 
  background: var(--bg-card); 
  height: var(--header-height); 
  display: flex; 
  align-items: center; 
  border-bottom: 1px solid var(--border-color); 
  position: sticky; 
  top: 0; 
  z-index: 1000; 
  box-shadow: var(--shadow-sm); 
  transition: background-color 0.3s, border-color 0.3s;
}
.header-inner { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.logo { font-size: var(--text-2xl); font-weight: 800; color: var(--primary); letter-spacing: -0.5px; display: flex; align-items: center; gap: 10px; }

/* Desktop Menu */
.nav-menu { display: none; gap: 25px; font-weight: 500; align-items: center; }
@media (min-width: 768px) { .nav-menu { display: flex; } }
.nav-link { color: var(--text-main); font-size: var(--text-sm); }
.nav-link:hover { color: var(--primary); }

/* Dropdown */
.dropdown { position: relative; display: inline-block; }
.dropdown-content {
  display: none; position: absolute; top: 100%; left: 0; background-color: var(--bg-card);
  min-width: 200px; box-shadow: var(--shadow-md); z-index: 1; border-radius: var(--radius-md);
  border: 1px solid var(--border-color); padding: 0.5rem 0;
}
.dropdown:hover .dropdown-content { display: block; }
.dropdown-content a { color: var(--text-main); padding: 12px 16px; display: block; font-size: var(--text-sm); }
.dropdown-content a:hover { background-color: var(--bg-muted); }

/* Mobile Burger Menu */
.burger-btn { display: block; background: none; border: none; font-size: 1.5rem; color: var(--text-main); cursor: pointer; }
@media (min-width: 768px) { .burger-btn { display: none; } }
.mobile-menu {
  display: none; position: fixed; top: var(--header-height); left: 0; width: 100%;
  background: var(--bg-card); border-bottom: 1px solid var(--border-color); z-index: 999;
  padding: 1rem; flex-direction: column; gap: 1rem; box-shadow: var(--shadow-md);
}
.mobile-menu.active { display: flex; }

/* Dark Mode Toggle */
.theme-toggle { background: none; border: none; color: var(--text-main); cursor: pointer; font-size: 1.25rem; display: flex; align-items: center; padding: 0.5rem; border-radius: var(--radius-md); }
.theme-toggle:hover { background: var(--bg-muted); }
.theme-toggle .icon-moon { display: block; }
.theme-toggle .icon-sun { display: none; }
[data-theme="dark"] .theme-toggle .icon-moon { display: none; }
[data-theme="dark"] .theme-toggle .icon-sun { display: block; }

/* ==========================================================================
   5. UI COMPONENTS
   ========================================================================== */
/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.75rem 1.5rem; border-radius: var(--radius-lg); font-weight: 600;
  font-size: var(--text-sm); cursor: pointer; transition: all 0.2s; border: none;
}
.btn-primary { background: var(--primary); color: #ffffff !important; }
.btn-primary:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: var(--shadow-md); }
.btn-outline { background: transparent; border: 2px solid var(--primary); color: var(--primary); }
.btn-outline:hover { background: var(--primary); color: #ffffff; }

/* Cards */
.card {
  background: var(--bg-card); border-radius: var(--radius-lg); overflow: hidden;
  box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); transition: all 0.3s;
}
.card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }

/* Forms */
.form-group { margin-bottom: 1rem; }
.form-label { display: block; font-weight: 600; margin-bottom: 0.5rem; font-size: var(--text-sm); }
.form-control {
  width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-md);
  border: 1px solid var(--border-color); background: var(--bg-body);
  color: var(--text-main); font-family: var(--font-main); transition: border-color 0.2s;
}
.form-control:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.2); }

/* Alerts */
.alert { padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; font-weight: 500; }
.alert-info { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
.alert-success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
[data-theme="dark"] .alert-info { background: rgba(30, 64, 175, 0.2); color: #bfdbfe; border-color: rgba(30, 64, 175, 0.5); }
[data-theme="dark"] .alert-success { background: rgba(22, 101, 52, 0.2); color: #bbf7d0; border-color: rgba(22, 101, 52, 0.5); }

/* Breadcrumbs */
.breadcrumb { display: flex; gap: 0.5rem; align-items: center; font-size: var(--text-sm); color: var(--text-muted); margin-bottom: 1.5rem; flex-wrap: wrap; }
.breadcrumb a { color: var(--text-main); font-weight: 500; }
.breadcrumb a:hover { color: var(--primary); }
.breadcrumb-separator { color: var(--border-color); }

/* Tags & Badges */
.badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; background: var(--bg-muted); color: var(--text-main); }
.badge-primary { background: var(--primary); color: #ffffff; }

/* Accordion */
.accordion { border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; }
.accordion-item { border-bottom: 1px solid var(--border-color); }
.accordion-item:last-child { border-bottom: none; }
.accordion-header { width: 100%; padding: 1rem 1.5rem; text-align: left; background: var(--bg-card); border: none; font-weight: 600; color: var(--text-main); cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: var(--text-base); }
.accordion-header:hover { background: var(--bg-muted); }
.accordion-content { padding: 0 1.5rem; max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; background: var(--bg-card); }
.accordion-content.active { padding: 1rem 1.5rem; max-height: 500px; }

/* Tabs */
.tabs { display: flex; gap: 1rem; border-bottom: 2px solid var(--border-color); margin-bottom: 1rem; overflow-x: auto; scrollbar-width: none; }
.tab-btn { background: none; border: none; padding: 0.75rem 1rem; font-weight: 600; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; white-space: nowrap; }
.tab-btn:hover { color: var(--text-main); }
.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }
.tab-panel { display: none; }
.tab-panel.active { display: block; animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Social Share */
.social-share { display: flex; gap: 0.5rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); align-items: center; }
.share-btn { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; transition: transform 0.2s; }
.share-btn:hover { transform: translateY(-2px); }
.share-fb { background: #1877f2; }
.share-tw { background: #1da1f2; }
.share-wa { background: #25d366; }

/* ==========================================================================
   6. SPECIFIC SECTIONS
   ========================================================================== */
/* Hero Section */
.hero-section { background: var(--secondary); color: white; padding: 80px 0; text-align: center; margin-bottom: 40px; position: relative; overflow: hidden; }
.hero-title { font-size: var(--text-4xl); font-weight: 800; margin-bottom: 15px; letter-spacing: -1px; color: white; }
.hero-subtitle { font-size: var(--text-lg); opacity: 0.9; max-width: 600px; margin: 0 auto 30px auto; color: #cbd5e1; }

/* Blog Cards */
.post-thumb { height: 220px; object-fit: cover; width: 100%; background: var(--bg-muted); }
.post-content { padding: 24px; flex: 1; display: flex; flex-direction: column; }
.post-title { font-size: var(--text-xl); margin-bottom: 10px; }
.post-excerpt { color: var(--text-muted); font-size: var(--text-sm); margin-bottom: 20px; flex: 1; }
.post-meta { font-size: var(--text-xs); color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 15px; display: flex; justify-content: space-between; align-items: center; }

/* Single Post */
.entry-header { margin-bottom: 2rem; }
.entry-title { font-size: var(--text-3xl); font-weight: 800; color: var(--text-main); margin-bottom: 1rem; }
.entry-meta { display: flex; gap: 1rem; color: var(--text-muted); font-size: var(--text-sm); margin-bottom: 1.5rem; align-items: center; }
.entry-image { width: 100%; height: auto; max-height: 500px; object-fit: cover; border-radius: var(--radius-lg); margin-bottom: 2rem; box-shadow: var(--shadow-md); }
.entry-content { font-size: 1.125rem; line-height: 1.8; color: var(--text-main); }
.entry-content h2, .entry-content h3 { margin-top: 2.5rem; margin-bottom: 1rem; color: var(--text-main); }
.entry-content p { margin-bottom: 1.25rem; }
.entry-content ul, .entry-content ol { margin-bottom: 1.25rem; padding-left: 1.5rem; }
.entry-content blockquote { border-left: 4px solid var(--primary); padding-left: 1rem; font-style: italic; color: var(--text-muted); margin-bottom: 1.25rem; }

/* Sidebar Widgets */
.widget { background: var(--bg-card); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); margin-bottom: 1.5rem; box-shadow: var(--shadow-sm); }
.widget-title { font-size: var(--text-lg); font-weight: 700; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 2px solid var(--primary); display: inline-block; }
.widget-list { list-style: none; }
.widget-list li { padding: 0.75rem 0; border-bottom: 1px dashed var(--border-color); display: flex; align-items: center; gap: 0.75rem; }
.widget-list li:last-child { border-bottom: none; padding-bottom: 0; }
.mini-thumb { width: 60px; height: 60px; border-radius: var(--radius-md); object-fit: cover; }

/* Footer */
.pro-footer { background: var(--secondary); color: #cbd5e1; padding: 4rem 0 1.5rem; margin-top: 4rem; }
.footer-grid { margin-bottom: 3rem; }
.footer-col h4 { color: white; margin-bottom: 1.25rem; font-size: var(--text-lg); }
.footer-links { list-style: none; }
.footer-links li { margin-bottom: 0.75rem; }
.footer-links a { color: #cbd5e1; transition: color 0.2s; }
.footer-links a:hover { color: white; padding-left: 4px; }
.footer-bottom { border-top: 1px solid #334155; padding-top: 1.5rem; text-align: center; font-size: var(--text-sm); }

/* ==========================================================================
   7. LANDING PAGE & CUSTOM MODULES
   ========================================================================== */
.landing-hero {
  background: var(--bg-body);
  color: var(--text-main);
  padding: 60px 0 40px;
  text-align: center;
}
.landing-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  color: var(--primary);
  line-height: 1.1;
  margin-bottom: 15px;
  text-transform: uppercase;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}
.landing-subtitle {
  font-size: var(--text-lg);
  color: var(--text-muted);
  max-width: 700px;
  margin: 0 auto 30px auto;
}

/* Curved Grid Showcase */
.curved-showcase {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 40px;
  perspective: 1000px;
  padding: 0 10px;
}
.curved-showcase-item {
  position: relative;
  height: 350px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  transition: transform 0.5s ease;
}
/* Side images slightly tilted back/smaller */
.curved-showcase-item:nth-child(1) {
  transform: rotateY(15deg) scale(0.9) translateZ(-50px);
  transform-origin: right center;
  border-radius: 20px 5px 5px 20px;
}
.curved-showcase-item:nth-child(2) {
  transform: scale(1.05) translateZ(20px);
  z-index: 2;
  border-radius: 10px;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
.curved-showcase-item:nth-child(3) {
  transform: rotateY(-15deg) scale(0.9) translateZ(-50px);
  transform-origin: left center;
  border-radius: 5px 20px 20px 5px;
}
.curved-showcase-item:hover {
  transform: scale(1.08) translateZ(30px);
  z-index: 10;
}
.curved-showcase-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .curved-showcase {
    grid-template-columns: 1fr;
    gap: 20px;
    perspective: none;
  }
  .curved-showcase-item,
  .curved-showcase-item:nth-child(1),
  .curved-showcase-item:nth-child(2),
  .curved-showcase-item:nth-child(3) {
    transform: none !important;
    height: 250px;
    border-radius: var(--radius-lg);
  }
}
`;