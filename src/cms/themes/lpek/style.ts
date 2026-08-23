export const css = `
  /* === GOOGLE FONTS === */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@700;800&display=swap');

  /* =====================================================================
     LPEK THEME — CSS DESIGN SYSTEM
     Institutional · Professional · Modern
  ===================================================================== */

  :root {
    /* Brand Colors */
    --lpek-navy:       #0f2d5c;
    --lpek-navy-mid:   #1a3f7a;
    --lpek-blue:       #1e56b0;
    --lpek-blue-light: #2d6fd4;
    --lpek-gold:       #e5a623;
    --lpek-gold-light: #fbbf24;
    --lpek-gold-pale:  #fef9ec;

    /* CMS Override Bridge */
    --primary:         var(--cms-primary, var(--lpek-blue));
    --primary-dark:    var(--cms-primary-dark, var(--lpek-navy));
    --bg:              var(--cms-bg, #ffffff);
    --text:            var(--cms-text, #111827);

    /* Neutrals */
    --text-muted:    #6b7280;
    --text-light:    #9ca3af;
    --border:        #e5e7eb;
    --border-soft:   #f0f0f0;
    --surface:       #f8fafd;
    --surface-2:     #f0f4fa;
    --surface-hover: #e8eef8;
    --white:         #ffffff;

    /* Semantic */
    --accent:     #eef4ff;
    --success:    #10b981;
    --warning:    #f59e0b;
    --danger:     #ef4444;

    /* UI Tokens */
    --radius:     12px;
    --radius-sm:  8px;
    --radius-lg:  20px;
    --radius-xl:  28px;

    --shadow-xs:  0 1px 3px rgba(15,45,92,0.06);
    --shadow-sm:  0 2px 8px rgba(15,45,92,0.08);
    --shadow-md:  0 4px 16px rgba(15,45,92,0.10);
    --shadow-lg:  0 8px 32px rgba(15,45,92,0.14);
    --shadow-xl:  0 20px 60px rgba(15,45,92,0.18);

    --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    --font-body:  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-head:  'Plus Jakarta Sans', 'Inter', sans-serif;
  }

  /* =====================================================================
     RESET & BASE
  ===================================================================== */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; font-size: 16px; }
  body {
    font-family: var(--font-body);
    line-height: 1.7;
    color: var(--text);
    background: var(--surface);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  img { max-width: 100%; height: auto; display: block; }
  a { color: inherit; text-decoration: none; }
  button { cursor: pointer; border: none; font-family: inherit; }

  /* =====================================================================
     LAYOUT
  ===================================================================== */
  .lpek-wrapper { min-height: 100vh; display: flex; flex-direction: column; }
  .container    { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .container-sm { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  main { flex: 1; }

  /* =====================================================================
     TOP BAR
  ===================================================================== */
  .lpek-topbar {
    background: var(--lpek-navy);
    color: rgba(255,255,255,0.75);
    font-size: 0.78rem;
    padding: 7px 0;
    border-bottom: 2px solid var(--lpek-gold);
  }
  .lpek-topbar .container {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .topbar-left  { display: flex; align-items: center; gap: 20px; }
  .topbar-right { display: flex; align-items: center; gap: 16px; }
  .topbar-item  { display: flex; align-items: center; gap: 6px; }
  .topbar-item svg { opacity: 0.7; flex-shrink: 0; }

  /* =====================================================================
     HEADER
  ===================================================================== */
  .lpek-header {
    background: var(--white);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 200;
    box-shadow: 0 2px 20px rgba(15,45,92,0.08);
  }
  .header-inner {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 0; gap: 24px;
  }

  /* Logo */
  .lpek-brand {
    display: flex; align-items: center; gap: 14px;
    text-decoration: none; flex-shrink: 0;
  }
  .brand-icon {
    width: 50px; height: 50px;
    background: linear-gradient(135deg, var(--lpek-navy) 0%, var(--lpek-blue) 100%);
    border-radius: 14px; display: flex; align-items: center; justify-content: center;
    color: white; font-size: 1.5rem; font-weight: 900;
    box-shadow: 0 4px 12px rgba(30,86,176,0.35);
    flex-shrink: 0; overflow: hidden; position: relative;
  }
  .brand-icon::after {
    content: '';
    position: absolute; top: -50%; right: -50%;
    width: 100%; height: 100%;
    background: rgba(255,255,255,0.12);
    border-radius: 50%;
  }
  .brand-icon img { width: 100%; height: 100%; object-fit: cover; }
  .brand-text-wrap {}
  .brand-name {
    font-family: var(--font-head);
    font-size: 1.35rem; font-weight: 900;
    color: var(--lpek-navy); letter-spacing: -0.5px;
    line-height: 1.1;
  }
  .brand-tagline { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }

  /* Nav */
  .lpek-nav { display: flex; align-items: center; }
  .nav-list  { list-style: none; display: flex; gap: 2px; align-items: center; }
  .nav-item > a {
    display: block; padding: 9px 16px;
    font-size: 0.875rem; font-weight: 600;
    color: var(--text-muted); border-radius: var(--radius-sm);
    transition: all var(--transition); position: relative;
  }
  .nav-item > a:hover,
  .nav-item > a.active {
    color: var(--lpek-blue); background: var(--accent);
  }
  .nav-item > a.active::after {
    content: '';
    position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
    width: 20px; height: 2px; background: var(--lpek-gold);
    border-radius: 2px;
  }

  /* Mobile Nav Toggle */
  .nav-toggle {
    display: none; padding: 8px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-sm); color: var(--text);
    transition: all var(--transition);
  }
  .nav-toggle:hover { background: var(--accent); color: var(--lpek-blue); }

  /* =====================================================================
     HERO SECTION
  ===================================================================== */
  .lpek-hero {
    background: linear-gradient(135deg, var(--lpek-navy) 0%, #163e82 50%, var(--lpek-blue) 100%);
    color: white;
    padding: 90px 0 80px;
    position: relative;
    overflow: hidden;
  }
  .lpek-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .lpek-hero::after {
    content: '';
    position: absolute; bottom: -1px; left: 0; right: 0;
    height: 60px;
    background: linear-gradient(to top, var(--surface), transparent);
  }
  .hero-content { position: relative; z-index: 1; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(229,166,35,0.2); border: 1px solid rgba(229,166,35,0.4);
    color: var(--lpek-gold-light); font-size: 0.78rem; font-weight: 600;
    padding: 6px 14px; border-radius: 30px; margin-bottom: 20px;
    letter-spacing: 0.3px;
  }
  .hero-title {
    font-family: var(--font-head);
    font-size: clamp(2rem, 5vw, 3.4rem); font-weight: 900;
    line-height: 1.15; letter-spacing: -1px;
    margin-bottom: 20px;
  }
  .hero-title .highlight {
    color: var(--lpek-gold-light);
    background: linear-gradient(90deg, var(--lpek-gold), #f59e0b);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-desc {
    font-size: 1.1rem; line-height: 1.75;
    opacity: 0.85; max-width: 580px; margin-bottom: 36px;
  }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
  .hero-stats {
    display: flex; gap: 40px; margin-top: 56px; padding-top: 36px;
    border-top: 1px solid rgba(255,255,255,0.15);
  }
  .hero-stat-num {
    font-family: var(--font-head);
    font-size: 2rem; font-weight: 900; color: var(--lpek-gold-light);
    line-height: 1;
  }
  .hero-stat-label { font-size: 0.8rem; opacity: 0.7; margin-top: 4px; }

  /* =====================================================================
     BUTTONS
  ===================================================================== */
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 24px; border-radius: var(--radius-sm);
    font-size: 0.9rem; font-weight: 700; transition: all var(--transition);
    letter-spacing: 0.1px; cursor: pointer;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--lpek-gold) 0%, #d97706 100%);
    color: white;
    box-shadow: 0 4px 14px rgba(229,166,35,0.4);
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(229,166,35,0.5);
  }
  .btn-outline {
    background: rgba(255,255,255,0.1);
    border: 2px solid rgba(255,255,255,0.4);
    color: white;
    backdrop-filter: blur(8px);
  }
  .btn-outline:hover {
    background: rgba(255,255,255,0.2);
    border-color: rgba(255,255,255,0.7);
  }
  .btn-blue {
    background: linear-gradient(135deg, var(--lpek-blue) 0%, var(--lpek-navy) 100%);
    color: white; box-shadow: 0 4px 14px rgba(30,86,176,0.3);
  }
  .btn-blue:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(30,86,176,0.4); }
  .btn-ghost {
    color: var(--lpek-blue); background: var(--accent);
  }
  .btn-ghost:hover { background: var(--lpek-blue); color: white; }
  .btn-sm { padding: 8px 16px; font-size: 0.82rem; }

  /* =====================================================================
     SECTION UTILITIES
  ===================================================================== */
  .section { padding: 72px 0; }
  .section-alt { background: var(--white); }
  .section-header { text-align: center; margin-bottom: 52px; }
  .section-label {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; color: var(--lpek-blue);
    background: var(--accent); padding: 5px 14px;
    border-radius: 30px; margin-bottom: 14px;
  }
  .section-label::before {
    content: '';
    display: block; width: 6px; height: 6px;
    background: var(--lpek-gold); border-radius: 50%;
  }
  .section-title {
    font-family: var(--font-head);
    font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 900;
    letter-spacing: -0.5px; color: var(--lpek-navy);
    line-height: 1.2; margin-bottom: 12px;
  }
  .section-subtitle {
    font-size: 1rem; color: var(--text-muted);
    max-width: 520px; margin: 0 auto; line-height: 1.7;
  }
  .section-footer { text-align: center; margin-top: 44px; }

  /* Gold Divider */
  .gold-divider {
    width: 48px; height: 4px;
    background: linear-gradient(90deg, var(--lpek-gold), var(--lpek-gold-light));
    border-radius: 2px; margin: 14px auto 0;
  }

  /* =====================================================================
     PROGRAM CARDS
  ===================================================================== */
  .program-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }
  .program-card {
    background: var(--white);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: transform var(--transition), box-shadow var(--transition);
    display: flex; flex-direction: column;
    position: relative;
  }
  .program-card:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-lg);
    border-color: rgba(30,86,176,0.2);
  }
  .program-card-img-wrap { position: relative; overflow: hidden; height: 200px; }
  .program-card-img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.4s ease;
  }
  .program-card:hover .program-card-img { transform: scale(1.05); }
  .program-card-placeholder {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, var(--lpek-navy) 0%, var(--lpek-blue-light) 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 3rem;
  }
  .program-card-badge {
    position: absolute; top: 14px; left: 14px;
    background: var(--lpek-gold); color: white;
    font-size: 0.7rem; font-weight: 700; letter-spacing: 0.3px;
    padding: 4px 10px; border-radius: 20px; text-transform: uppercase;
  }
  .program-card-body { padding: 22px; flex: 1; display: flex; flex-direction: column; }
  .program-card-title {
    font-family: var(--font-head);
    font-size: 1.05rem; font-weight: 800;
    color: var(--lpek-navy); margin-bottom: 10px; line-height: 1.35;
  }
  .program-card-title a { text-decoration: none; color: inherit; transition: color var(--transition); }
  .program-card-title a:hover { color: var(--lpek-blue); }
  .program-card-excerpt {
    font-size: 0.875rem; color: var(--text-muted);
    line-height: 1.65; flex: 1; margin-bottom: 18px;
  }
  .program-card-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 14px; border-top: 1px solid var(--border-soft);
  }
  .program-card-meta { font-size: 0.78rem; color: var(--text-light); }
  .program-card-link {
    font-size: 0.82rem; font-weight: 700; color: var(--lpek-blue);
    display: flex; align-items: center; gap: 4px; transition: gap var(--transition);
  }
  .program-card-link:hover { gap: 8px; }

  /* =====================================================================
     NEWS / POST CARDS
  ===================================================================== */
  .news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 22px;
  }
  .news-card {
    background: var(--white); border-radius: var(--radius);
    border: 1px solid var(--border); box-shadow: var(--shadow-xs);
    overflow: hidden; display: flex; flex-direction: column;
    transition: transform var(--transition), box-shadow var(--transition);
  }
  .news-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
  .news-card-img-wrap { height: 180px; overflow: hidden; }
  .news-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
  .news-card:hover .news-card-img { transform: scale(1.05); }
  .news-card-placeholder {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, var(--accent), var(--surface-2));
    display: flex; align-items: center; justify-content: center;
    font-size: 2.5rem; color: var(--lpek-blue); opacity: 0.5;
  }
  .news-card-body { padding: 18px; flex: 1; display: flex; flex-direction: column; }
  .news-card-cat {
    display: inline-block;
    font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; color: var(--lpek-blue);
    background: var(--accent); padding: 3px 9px;
    border-radius: 20px; margin-bottom: 10px;
  }
  .news-card-title {
    font-size: 0.975rem; font-weight: 700; line-height: 1.45;
    color: var(--text); margin-bottom: 8px;
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .news-card-title a { text-decoration: none; color: inherit; transition: color var(--transition); }
  .news-card-title a:hover { color: var(--lpek-blue); }
  .news-card-excerpt {
    font-size: 0.82rem; color: var(--text-muted); line-height: 1.6;
    flex: 1; margin-bottom: 14px;
    display: -webkit-box; -webkit-line-clamp: 3;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .news-card-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 12px; border-top: 1px solid var(--border-soft);
    font-size: 0.75rem; color: var(--text-light); margin-top: auto;
  }
  .news-card-date { display: flex; align-items: center; gap: 4px; }
  .news-card-read {
    font-weight: 700; color: var(--lpek-blue);
    display: flex; align-items: center; gap: 3px;
    transition: gap var(--transition);
  }
  .news-card-read:hover { gap: 6px; }

  /* =====================================================================
     HOME — FEATURED / HERO POST
  ===================================================================== */
  .news-featured {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 0; background: var(--white);
    border-radius: var(--radius); overflow: hidden;
    border: 1px solid var(--border); box-shadow: var(--shadow-md);
    margin-bottom: 24px;
  }
  .news-featured-img-wrap { overflow: hidden; }
  .news-featured-img { width: 100%; height: 100%; min-height: 280px; object-fit: cover; transition: transform 0.5s; }
  .news-featured:hover .news-featured-img { transform: scale(1.03); }
  .news-featured-placeholder {
    width: 100%; min-height: 280px;
    background: linear-gradient(135deg, var(--lpek-navy), var(--lpek-blue));
    display: flex; align-items: center; justify-content: center;
    font-size: 4rem; color: white; opacity: 0.7;
  }
  .news-featured-body {
    padding: 36px; display: flex; flex-direction: column; justify-content: center;
  }
  .news-featured-cat {
    display: inline-block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; color: var(--lpek-gold);
    background: var(--lpek-gold-pale); padding: 4px 12px;
    border-radius: 20px; margin-bottom: 14px;
  }
  .news-featured-title {
    font-family: var(--font-head);
    font-size: 1.5rem; font-weight: 900; line-height: 1.3;
    color: var(--lpek-navy); margin-bottom: 12px;
  }
  .news-featured-title a { color: inherit; transition: color var(--transition); }
  .news-featured-title a:hover { color: var(--lpek-blue); }
  .news-featured-excerpt {
    font-size: 0.9rem; color: var(--text-muted); line-height: 1.7; margin-bottom: 20px;
  }

  /* =====================================================================
     ABOUT / INFO SECTION (Homepage)
  ===================================================================== */
  .about-section {
    background: linear-gradient(135deg, var(--lpek-navy) 0%, #1a3f7a 100%);
    color: white; padding: 80px 0;
  }
  .about-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 60px; align-items: center;
  }
  .about-label {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; color: var(--lpek-gold-light);
    margin-bottom: 16px;
  }
  .about-title {
    font-family: var(--font-head);
    font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 900;
    line-height: 1.2; margin-bottom: 16px;
  }
  .about-desc { opacity: 0.8; line-height: 1.8; margin-bottom: 28px; }
  .about-features { display: flex; flex-direction: column; gap: 16px; }
  .about-feat-item { display: flex; align-items: flex-start; gap: 14px; }
  .about-feat-icon {
    width: 40px; height: 40px; flex-shrink: 0;
    background: rgba(229,166,35,0.2); border: 1px solid rgba(229,166,35,0.3);
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; color: var(--lpek-gold-light);
  }
  .about-feat-title { font-size: 0.9rem; font-weight: 700; margin-bottom: 3px; }
  .about-feat-desc  { font-size: 0.82rem; opacity: 0.7; }

  /* Stat boxes */
  .about-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .about-stat-card {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: var(--radius); padding: 24px;
    backdrop-filter: blur(8px);
    transition: background var(--transition);
  }
  .about-stat-card:hover { background: rgba(255,255,255,0.14); }
  .about-stat-num {
    font-family: var(--font-head);
    font-size: 2.2rem; font-weight: 900; color: var(--lpek-gold-light);
    line-height: 1;
  }
  .about-stat-label { font-size: 0.82rem; opacity: 0.7; margin-top: 6px; }

  /* =====================================================================
     SINGLE POST
  ===================================================================== */
  .single-page { padding: 48px 0 72px; }
  .single-header-section {
    background: linear-gradient(135deg, var(--lpek-navy) 0%, #1a4080 100%);
    color: white; padding: 52px 0 40px;
    margin-bottom: 0;
  }
  .single-breadcrumb {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.8rem; opacity: 0.7; margin-bottom: 16px; flex-wrap: wrap;
  }
  .single-breadcrumb a { color: var(--lpek-gold-light); transition: opacity var(--transition); }
  .single-breadcrumb a:hover { opacity: 0.9; }
  .single-breadcrumb-sep { opacity: 0.4; }
  .single-cat-badge {
    display: inline-block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; color: var(--lpek-navy);
    background: var(--lpek-gold); padding: 4px 12px;
    border-radius: 20px; margin-bottom: 14px;
  }
  .single-title {
    font-family: var(--font-head);
    font-size: clamp(1.6rem, 4vw, 2.5rem); font-weight: 900;
    line-height: 1.2; letter-spacing: -0.5px; margin-bottom: 18px;
  }
  .single-meta-bar {
    display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
    font-size: 0.82rem; opacity: 0.75;
  }
  .single-meta-item { display: flex; align-items: center; gap: 6px; }

  .single-body-section { padding: 48px 0 64px; }
  .single-featured-img {
    width: 100%; max-height: 480px; object-fit: cover;
    border-radius: var(--radius); margin-bottom: 40px;
    box-shadow: var(--shadow-lg);
  }
  .entry-content { font-size: 1.05rem; line-height: 1.85; color: #374151; }
  .entry-content h2 { font-family: var(--font-head); font-size: 1.7rem; font-weight: 800; margin: 2.2em 0 0.7em; color: var(--lpek-navy); letter-spacing: -0.4px; }
  .entry-content h3 { font-family: var(--font-head); font-size: 1.35rem; font-weight: 700; margin: 1.8em 0 0.5em; color: var(--lpek-navy); }
  .entry-content h4 { font-size: 1.1rem; font-weight: 700; margin: 1.5em 0 0.4em; color: var(--text); }
  .entry-content p  { margin-bottom: 1.3em; }
  .entry-content a  { color: var(--lpek-blue); text-decoration: underline; text-underline-offset: 3px; }
  .entry-content a:hover { color: var(--lpek-navy); }
  .entry-content img { max-width: 100%; border-radius: var(--radius); margin: 1.5em 0; box-shadow: var(--shadow-sm); }
  .entry-content ul, .entry-content ol { padding-left: 1.6em; margin-bottom: 1.3em; }
  .entry-content li { margin-bottom: 0.5em; }
  .entry-content blockquote {
    border-left: 4px solid var(--lpek-gold); padding: 16px 24px;
    background: var(--lpek-gold-pale); border-radius: 0 var(--radius) var(--radius) 0;
    margin: 1.8em 0; font-style: italic; color: #555;
  }
  .entry-content code { background: var(--surface-2); border: 1px solid var(--border); padding: 2px 7px; border-radius: 4px; font-size: 0.88em; }
  .entry-content pre { background: #1e293b; color: #e2e8f0; padding: 24px; border-radius: var(--radius); overflow-x: auto; margin: 1.8em 0; }
  .entry-content table { width: 100%; border-collapse: collapse; margin: 1.5em 0; }
  .entry-content th, .entry-content td { border: 1px solid var(--border); padding: 10px 14px; text-align: left; }
  .entry-content th { background: var(--surface-2); font-weight: 700; color: var(--lpek-navy); }

  .post-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 36px; padding-top: 28px; border-top: 1px solid var(--border); }
  .post-tag {
    font-size: 0.8rem; padding: 5px 13px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; color: var(--text-muted);
    text-decoration: none; transition: all var(--transition);
  }
  .post-tag:hover { background: var(--accent); color: var(--lpek-blue); border-color: var(--lpek-blue); }

  /* Share */
  .share-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 32px; padding: 20px; background: var(--surface-2); border-radius: var(--radius); }
  .share-label { font-size: 0.85rem; font-weight: 700; color: var(--text); }
  .share-links { display: flex; gap: 8px; }
  .share-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: var(--radius-sm);
    font-size: 0.78rem; font-weight: 600;
    transition: all var(--transition); border: 1px solid var(--border);
    color: var(--text-muted); background: var(--white);
  }
  .share-btn:hover { transform: translateY(-1px); box-shadow: var(--shadow-sm); }
  .share-btn.wa  { border-color: #25D366; }
  .share-btn.wa:hover  { background: #25D366; color: white; }
  .share-btn.fb  { border-color: #1877F2; }
  .share-btn.fb:hover  { background: #1877F2; color: white; }
  .share-btn.tg  { border-color: #0088cc; }
  .share-btn.tg:hover  { background: #0088cc; color: white; }

  /* =====================================================================
     CATEGORY / ARCHIVE PAGE
  ===================================================================== */
  .archive-header {
    background: linear-gradient(135deg, var(--lpek-navy), var(--lpek-blue));
    color: white; padding: 52px 0 40px; margin-bottom: 0;
  }
  .archive-title {
    font-family: var(--font-head);
    font-size: 2rem; font-weight: 900; margin-bottom: 6px;
  }
  .archive-count { font-size: 0.9rem; opacity: 0.7; }
  .archive-body { padding: 48px 0 72px; }

  /* Pagination */
  .pagination {
    display: flex; align-items: center; justify-content: center;
    gap: 6px; margin-top: 48px; flex-wrap: wrap;
  }
  .page-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 40px; height: 40px; border-radius: var(--radius-sm);
    font-size: 0.875rem; font-weight: 600;
    border: 1px solid var(--border); background: var(--white);
    color: var(--text-muted); transition: all var(--transition); text-decoration: none;
  }
  .page-btn:hover    { background: var(--accent); color: var(--lpek-blue); border-color: var(--lpek-blue); }
  .page-btn.active   { background: var(--lpek-blue); color: white; border-color: var(--lpek-blue); }
  .page-btn.disabled { opacity: 0.4; pointer-events: none; }
  .page-btn-wide { width: auto; padding: 0 16px; }

  /* =====================================================================
     STATIC PAGE (Tentang, Kontak, etc.)
  ===================================================================== */
  .page-header {
    background: linear-gradient(135deg, var(--lpek-navy), var(--lpek-blue));
    color: white; padding: 60px 0 48px;
  }
  .page-header-title {
    font-family: var(--font-head);
    font-size: 2.4rem; font-weight: 900; margin-bottom: 8px;
  }
  .page-header-desc { font-size: 1rem; opacity: 0.8; }
  .page-body { padding: 56px 0 80px; }

  /* =====================================================================
     CONTACT PAGE
  ===================================================================== */
  .contact-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 48px; align-items: start; }
  .contact-info-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 32px; box-shadow: var(--shadow-sm);
  }
  .contact-info-title {
    font-family: var(--font-head);
    font-size: 1.2rem; font-weight: 800; color: var(--lpek-navy);
    margin-bottom: 22px; padding-bottom: 16px; border-bottom: 2px solid var(--lpek-gold);
  }
  .contact-info-item { display: flex; gap: 14px; margin-bottom: 20px; align-items: flex-start; }
  .contact-info-icon {
    width: 40px; height: 40px; flex-shrink: 0;
    background: var(--accent); border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; color: var(--lpek-blue);
  }
  .contact-info-label { font-size: 0.75rem; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .contact-info-value { font-size: 0.9rem; font-weight: 600; color: var(--text); }
  .contact-form-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 36px; box-shadow: var(--shadow-sm);
  }
  .form-title {
    font-family: var(--font-head);
    font-size: 1.2rem; font-weight: 800; color: var(--lpek-navy);
    margin-bottom: 24px;
  }
  .form-group { margin-bottom: 18px; }
  .form-label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--text); margin-bottom: 6px; }
  .form-input, .form-textarea {
    width: 100%; padding: 12px 16px;
    border: 1.5px solid var(--border); border-radius: var(--radius-sm);
    font-family: var(--font-body); font-size: 0.9rem; color: var(--text);
    background: var(--surface); transition: all var(--transition);
    outline: none;
  }
  .form-input:focus, .form-textarea:focus {
    border-color: var(--lpek-blue); background: var(--white);
    box-shadow: 0 0 0 3px rgba(30,86,176,0.1);
  }
  .form-textarea { min-height: 130px; resize: vertical; }

  /* =====================================================================
     SEARCH
  ===================================================================== */
  .search-bar-section { padding: 36px 0; background: var(--white); border-bottom: 1px solid var(--border); }
  .search-form { display: flex; gap: 12px; max-width: 640px; margin: 0 auto; }
  .search-input {
    flex: 1; padding: 13px 20px;
    border: 2px solid var(--border); border-radius: var(--radius-sm);
    font-size: 0.95rem; font-family: var(--font-body); outline: none;
    transition: all var(--transition); background: var(--surface);
  }
  .search-input:focus { border-color: var(--lpek-blue); background: white; box-shadow: 0 0 0 3px rgba(30,86,176,0.1); }

  /* =====================================================================
     FOOTER
  ===================================================================== */
  .lpek-footer {
    background: var(--lpek-navy);
    color: rgba(255,255,255,0.8);
    padding: 64px 0 0;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 1.6fr 1fr 1fr 1fr;
    gap: 40px; margin-bottom: 48px;
  }
  .footer-brand-col {}
  .footer-brand-name {
    font-family: var(--font-head);
    font-size: 1.4rem; font-weight: 900; color: white;
    margin-bottom: 10px;
  }
  .footer-brand-desc { font-size: 0.85rem; opacity: 0.65; line-height: 1.7; margin-bottom: 20px; }
  .footer-socials { display: flex; gap: 10px; }
  .footer-social-btn {
    width: 38px; height: 38px;
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.7); font-size: 1rem; transition: all var(--transition);
    text-decoration: none;
  }
  .footer-social-btn:hover { background: var(--lpek-gold); border-color: var(--lpek-gold); color: white; }

  .footer-col-title {
    font-size: 0.82rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.8px; color: rgba(255,255,255,0.5);
    margin-bottom: 16px; padding-bottom: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .footer-links { list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .footer-links li a {
    font-size: 0.875rem; color: rgba(255,255,255,0.65);
    transition: color var(--transition);
  }
  .footer-links li a:hover { color: var(--lpek-gold-light); }

  .footer-contact-item { display: flex; gap: 10px; margin-bottom: 12px; align-items: flex-start; }
  .footer-contact-icon { flex-shrink: 0; opacity: 0.5; margin-top: 2px; }
  .footer-contact-text { font-size: 0.85rem; opacity: 0.65; line-height: 1.5; }

  .footer-bottom {
    border-top: 1px solid rgba(255,255,255,0.08);
    padding: 20px 0;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 10px;
    font-size: 0.8rem; opacity: 0.5;
  }
  .footer-bottom a { color: var(--lpek-gold-light); }
  .footer-gold-bar {
    height: 4px;
    background: linear-gradient(90deg, var(--lpek-gold) 0%, var(--lpek-blue-light) 100%);
  }

  /* =====================================================================
     EMPTY STATE / 404
  ===================================================================== */
  .empty-state {
    text-align: center; padding: 80px 24px;
    color: var(--text-muted);
  }
  .empty-state-icon { font-size: 4rem; margin-bottom: 16px; opacity: 0.5; }
  .empty-state h3 { font-size: 1.25rem; color: var(--text); margin-bottom: 8px; }
  .empty-state p  { font-size: 0.9rem; }

  .error-page { text-align: center; padding: 100px 24px; }
  .error-code {
    font-family: var(--font-head);
    font-size: 8rem; font-weight: 900;
    color: var(--lpek-navy); opacity: 0.08; line-height: 1;
    margin-bottom: -40px;
  }
  .error-title { font-size: 1.8rem; font-weight: 700; color: var(--lpek-navy); margin-bottom: 10px; }
  .error-desc  { color: var(--text-muted); margin-bottom: 28px; }

  /* =====================================================================
     UTILITIES
  ===================================================================== */
  .back-link {
    display: inline-flex; align-items: center; gap: 6px;
    color: rgba(255,255,255,0.85); font-size: 0.85rem; font-weight: 600;
    margin-bottom: 20px; transition: opacity var(--transition);
  }
  .back-link:hover { opacity: 1; }
  .back-link-dark {
    color: var(--lpek-blue); background: var(--accent);
    padding: 7px 14px; border-radius: var(--radius-sm);
  }
  .back-link-dark:hover { background: var(--lpek-blue); color: white; }

  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 0.7rem; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase;
    padding: 3px 10px; border-radius: 20px;
  }
  .badge-blue  { background: var(--accent); color: var(--lpek-blue); }
  .badge-gold  { background: var(--lpek-gold-pale); color: #92400e; }
  .badge-navy  { background: rgba(15,45,92,0.1); color: var(--lpek-navy); }

  /* =====================================================================
     ANIMATIONS
  ===================================================================== */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .anim-fade-up   { animation: fadeInUp 0.5s ease both; }
  .anim-delay-1   { animation-delay: 0.1s; }
  .anim-delay-2   { animation-delay: 0.2s; }
  .anim-delay-3   { animation-delay: 0.3s; }

  /* =====================================================================
     RESPONSIVE
  ===================================================================== */
  @media (max-width: 1024px) {
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .about-grid  { grid-template-columns: 1fr; gap: 36px; }
    .news-featured { grid-template-columns: 1fr; }
    .news-featured-img-wrap { height: 240px; }
  }

  @media (max-width: 768px) {
    .section { padding: 52px 0; }
    .lpek-topbar { display: none; }
    .header-inner { padding: 14px 0; }
    .lpek-nav { display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border-top: 1px solid var(--border); box-shadow: var(--shadow-md); padding: 12px; }
    .lpek-nav.open { display: block; }
    .nav-list { flex-direction: column; gap: 2px; }
    .nav-item > a { display: block; }
    .nav-toggle { display: flex; align-items: center; justify-content: center; }
    .contact-grid { grid-template-columns: 1fr; }
    .footer-grid { grid-template-columns: 1fr; gap: 28px; }
    .footer-bottom { text-align: center; flex-direction: column; }
    .program-grid { grid-template-columns: 1fr; }
    .news-grid { grid-template-columns: 1fr; }
    .about-stats { grid-template-columns: 1fr 1fr; }
    .hero-stats { gap: 24px; flex-wrap: wrap; }
    .hero-actions { flex-direction: column; }
  }

  @media (max-width: 480px) {
    .container { padding: 0 16px; }
    .about-stats { grid-template-columns: 1fr; }
    .search-form { flex-direction: column; }
  }
`;
