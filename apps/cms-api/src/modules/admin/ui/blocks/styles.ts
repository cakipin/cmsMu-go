export const adminStyles = `
  :root { 
    --wp-dark: #1d2327; 
    --wp-light: #2c3338; 
    --wp-blue: #2271b1; 
    --wp-blue-h: #135e96; 
    --bg: #f0f0f1; 
    --txt: #3c434a; 
    --border: #c3c4c7; 
    --safe-bottom: max(16px, env(safe-area-inset-bottom, 16px));
  }
  
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { margin:0; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:var(--bg); color:var(--txt); font-size:13px; height:100vh; overflow:hidden; }
  
  /* MOBILE SAFE AREA UTILITIES */
  .safe-bottom-padding { padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px) !important; }
  .safe-bottom-margin { margin-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px) !important; }
  
  /* RESPONSIVE TABLE WRAPPER */
  .table-responsive-wrapper {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
  }
  
  /* LAYOUT UTAMA */
  .app-layout { display:grid; height:100vh; transition: grid-template-columns 0.3s ease; }
  .main-content { overflow-y:auto; padding:20px; background: var(--bg); position: relative; }
  
  /* SIDEBAR */
  .sidebar { background:var(--wp-dark); color:#fff; display:flex; flex-direction:column; overflow-x:hidden; transition: width 0.3s; }
  
  /* BRAND (Logo) */
  .brand { 
      height: 55px; /* Sedikit lebih tinggi */
      display:flex; 
      align-items:center; 
      padding-left: 20px; /* Jarak kiri lebih lega */
      font-weight:bold; 
      background:#000; 
      white-space:nowrap; 
      overflow:hidden; 
      font-size: 14px;
  }
  
  /* MENU ITEM */
  .menu-item { 
      height: 45px; /* Tinggi tombol diperbesar biar enak diklik */
      display:flex; 
      align-items:center; 
      padding: 0 20px; /* Jarak Kiri-Kanan lebih lega (sebelumnya 14px) */
      gap: 12px; /* Jarak antara Icon dan Teks */
      color:#f0f0f1; 
      cursor:pointer; 
      border-left:4px solid transparent; 
      white-space:nowrap; 
      overflow:hidden; 
      text-decoration:none;
      transition: all 0.2s;
  }
  .menu-item:hover, .menu-item.active { background:var(--wp-light); color:#72aee6; }
  .menu-item.active { border-left-color:#72aee6; font-weight:600; }
  .menu-item i { width: 20px; text-align: center; font-size: 15px; } /* Lebar icon fix biar lurus */
  
  .group-title { margin:20px 20px 8px; font-size:11px; color:#888; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap; font-weight:600; }

  /* USER INFO SECTION */
  .user-info {
      padding: 20px; 
      font-size: 12px; 
      color: #aaa; 
      border-bottom: 1px solid #333;
      background: rgba(255,255,255,0.03);
  }

  /* COLLAPSED STATE */
  .collapsed .menu-txt, .collapsed .brand span, .collapsed .group-title, .collapsed .user-info { opacity: 0; pointer-events: none; display: none; }
  .collapsed .brand { padding-left: 15px; }
  .collapsed .menu-item { padding: 0 15px; justify-content:center; }
  .collapsed .menu-item i { margin:0; }
  
  /* TOPBAR */
  .topbar { background:#fff; height:50px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; padding:0 20px; }
  
  /* COMPONENTS (Tetap) */
  .card { background:#fff; border:1px solid var(--border); padding:15px; margin-bottom:20px; box-shadow:0 1px 1px rgba(0,0,0,0.04); }
  .btn { padding:6px 12px; border:1px solid var(--wp-blue); background:var(--wp-blue); color:#fff; border-radius:3px; cursor:pointer; display:inline-flex; align-items:center; gap:5px; font-size:13px; text-decoration:none; }
  .btn:hover { background:var(--wp-blue-h); }
  .btn-icon { background:transparent; border:none; color:#555; font-size:16px; cursor:pointer; padding: 5px 10px; }
  .input { width:100%; padding:6px; border:1px solid #8c8f94; border-radius:4px; margin-bottom:10px; font-size:13px; }
  .badge { padding:2px 8px; border-radius:10px; font-size:10px; font-weight:bold; text-transform:uppercase; }
  
  /* === MODAL CENTER === */
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    display: flex; /* <--- INI WAJIB ADA */
    align-items: center;
    justify-content: center;
  }
  .modal-box {
    background: #fff; width: 90%; max-width: 1100px; height: 85%; max-height: 90vh;
    display: flex; flex-direction: column; overflow: hidden;
    border-radius: 8px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .modal-header { display:flex; justify-content:space-between; align-items:center; padding:15px 20px; border-bottom:1px solid #eee; background:#fff; }
  .modal-body { flex:1; display:flex; overflow:hidden; }
  .modal-grid-area { flex:1; overflow-y:auto; padding:20px; background:#f0f0f1; border-right:1px solid #ddd; }
  .modal-sidebar-area { width:320px; background:#fff; display:flex; flex-direction:column; padding:20px; overflow-y:auto; flex-shrink:0; }
  .media-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:12px; }
  .media-item { cursor:pointer; border:4px solid transparent; overflow:hidden; aspect-ratio:1/1; position:relative; background-color:#e5e5e5; background-image: radial-gradient(#ccc 1px, transparent 1px); background-size: 10px 10px; border-radius:4px; transition: all 0.2s; }
  .media-item.active { border-color:var(--wp-blue); box-shadow:0 0 0 2px #fff inset; }
  .media-item:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
  .media-check { position:absolute; top:5px; right:5px; background:var(--wp-blue); color:white; width:24px; height:24px; text-align:center; line-height:24px; border-radius:50%; font-size:12px; box-shadow:0 2px 4px rgba(0,0,0,0.2); }
  
  /* LOGIN PAGE */
  .login-page { display: flex; justify-content: center; align-items: center; height: 100vh; background: #e9ecef; position: fixed; top: 0; left: 0; width: 100%; z-index: 9999; }
  .login-box { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 350px; text-align: center; }

  /* EDITOR TABS, TOOLBAR & COMMENT TOGGLE FIX */
  .editor-top-bar { display: flex !important; justify-content: space-between !important; align-items: flex-end !important; margin-bottom: -1px !important; z-index: 2 !important; width: 100% !important; }
  .editor-tab-btn { display: inline-flex !important; align-items: center !important; gap: 6px !important; border: 1px solid #cbd5e1 !important; border-bottom: 1px solid #cbd5e1 !important; border-radius: 6px 6px 0 0 !important; padding: 6px 14px !important; font-size: 12px !important; font-weight: 500 !important; color: #64748b !important; background: #f1f5f9 !important; cursor: pointer !important; transition: all 0.15s ease !important; outline: none !important; line-height: 1.2 !important; text-decoration: none !important; }
  .editor-tab-btn:hover { background: #e2e8f0 !important; color: #1e293b !important; }
  .editor-tab-btn.active { background: #ffffff !important; border-color: #cbd5e1 !important; border-bottom-color: #ffffff !important; color: #0f172a !important; font-weight: 700 !important; }
  .editor-media-btn { display: inline-flex !important; align-items: center !important; gap: 6px !important; background: #ffffff !important; border: 1px solid #cbd5e1 !important; border-bottom-color: #ffffff !important; border-radius: 6px 6px 0 0 !important; padding: 6px 14px !important; font-size: 13px !important; font-weight: 600 !important; color: #1e293b !important; cursor: pointer !important; box-shadow: 0 -1px 2px rgba(0,0,0,0.02) !important; outline: none !important; }
  .editor-media-btn:hover { background: #f8fafc !important; }

  .editor-toolbar { display: flex !important; flex-direction: row !important; flex-wrap: wrap !important; align-items: center !important; gap: 4px !important; padding: 6px 10px !important; background: #f8fafc !important; border-bottom: 1px solid #e2e8f0 !important; box-sizing: border-box !important; }
  .editor-toolbar select.editor-select { display: inline-block !important; height: 28px !important; padding: 2px 8px !important; border: 1px solid #cbd5e1 !important; border-radius: 4px !important; background: #ffffff !important; font-size: 12px !important; font-weight: 500 !important; color: #334155 !important; cursor: pointer !important; outline: none !important; flex-shrink: 0 !important; }
  .editor-toolbar button.editor-btn { display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 28px !important; height: 28px !important; min-width: 28px !important; max-width: 28px !important; padding: 0 !important; color: #475569 !important; background: transparent !important; border: 1px solid transparent !important; border-radius: 4px !important; cursor: pointer !important; transition: all 0.15s ease !important; font-size: 13px !important; flex-shrink: 0 !important; outline: none !important; }
  .editor-toolbar button.editor-btn:hover { background: #ffffff !important; border-color: #cbd5e1 !important; color: #0f172a !important; box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important; }
  .editor-toolbar button.editor-btn.active { background: #e2e8f0 !important; border-color: #94a3b8 !important; color: #1e40af !important; }
  .editor-toolbar .toolbar-divider { display: inline-block !important; width: 1px !important; height: 18px !important; background: #cbd5e1 !important; margin: 0 3px !important; flex-shrink: 0 !important; }

  .comment-toggle-switch { position: relative !important; display: inline-flex !important; align-items: center !important; width: 44px !important; height: 24px !important; min-width: 44px !important; max-width: 44px !important; border-radius: 9999px !important; border: none !important; cursor: pointer !important; background-color: #cbd5e1 !important; transition: background-color 0.2s ease !important; padding: 2px !important; box-sizing: border-box !important; outline: none !important; flex-shrink: 0 !important; }
  .comment-toggle-switch.active { background-color: #10b981 !important; }
  .comment-toggle-thumb { display: block !important; width: 20px !important; height: 20px !important; background-color: #ffffff !important; border-radius: 50% !important; box-shadow: 0 1px 3px rgba(0,0,0,0.25) !important; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important; pointer-events: none !important; transform: translateX(0px) !important; }
  .comment-toggle-switch.active .comment-toggle-thumb { transform: translateX(20px) !important; }
`;
