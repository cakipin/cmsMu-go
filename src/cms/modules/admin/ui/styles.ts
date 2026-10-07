export const adminStyles = `
  :root { --wp-dark: #1d2327; --wp-light: #2c3338; --wp-blue: #2271b1; --wp-blue-h: #135e96; --bg: #f0f0f1; --txt: #3c434a; --border: #c3c4c7; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:-apple-system, sans-serif; background:var(--bg); color:var(--txt); font-size:13px; height:100vh; overflow:hidden; }
  
  /* LAYOUT */
  .app-layout { display:grid; height:100vh; transition: grid-template-columns 0.3s ease; }
  
  /* SIDEBAR */
  .sidebar { background:var(--wp-dark); color:#fff; display:flex; flex-direction:column; overflow-x:hidden; transition: width 0.3s; }
  .brand { height: 50px; display:flex; align-items:center; padding-left:14px; font-weight:bold; background:#000; white-space:nowrap; overflow:hidden; }
  .menu-item { height: 40px; display:flex; align-items:center; padding:0 14px; color:#f0f0f1; cursor:pointer; border-left:4px solid transparent; white-space:nowrap; overflow:hidden; }
  .menu-item:hover, .menu-item.active { background:var(--wp-light); color:#72aee6; }
  .menu-item.active { border-left-color:#72aee6; font-weight:600; }
  .menu-item i { min-width: 20px; text-align: center; font-size: 14px; }
  .menu-txt { margin-left: 10px; opacity: 1; transition: opacity 0.2s; }
  
  /* COLLAPSED STATE */
  .collapsed .menu-txt, .collapsed .brand span, .collapsed .group-title { opacity: 0; pointer-events: none; display: none; }
  .collapsed .brand { padding-left: 12px; }
  
  /* TOPBAR & CONTENT */
  .topbar { background:#fff; height:50px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; padding:0 15px; }
  .main-content { overflow-y:auto; padding:20px; background: var(--bg); }
  
  /* COMPONENTS */
  .card { background:#fff; border:1px solid var(--border); padding:15px; margin-bottom:20px; box-shadow:0 1px 1px rgba(0,0,0,0.04); }
  .btn { padding:6px 12px; border:1px solid var(--wp-blue); background:var(--wp-blue); color:#fff; border-radius:3px; cursor:pointer; }
  .btn:hover { background:var(--wp-blue-h); }
  .btn-icon { background:transparent; border:none; color:#555; font-size:16px; cursor:pointer; padding: 5px 10px; }
  .input { width:100%; padding:6px; border:1px solid #8c8f94; border-radius:4px; margin-bottom:10px; }
  .wp-table { width:100%; border-collapse:collapse; }
  .wp-table th, .wp-table td { text-align:left; padding:8px 10px; border-bottom:1px solid var(--border); }
  .wp-table tr:nth-child(even) { background:#f9f9f9; }
  .group-title { margin:15px 12px 5px; font-size:10px; color:#888; text-transform:uppercase; letter-spacing:1px; white-space:nowrap; }
  
  /* LOGIN PAGE */
  .login-page { display: flex; justify-content: center; align-items: center; height: 100vh; background: #e9ecef; position: fixed; top: 0; left: 0; width: 100%; z-index: 9999; }
  .login-box { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 350px; text-align: center; }
`;
