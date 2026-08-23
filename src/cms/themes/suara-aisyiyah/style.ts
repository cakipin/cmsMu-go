export const css = `
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Playfair+Display:wght@600;700&display=swap');

:root { --green:#327f2b; --lime:#62c455; --orange:#d86c35; --ink:#121212; --muted:#9b9b9b; --line:#ededed; --paper:#fff; }
* { box-sizing:border-box; }
html { scroll-behavior:smooth; }
body { margin:0; background:var(--paper); color:var(--ink); font-family:'Lato',sans-serif; line-height:1.5; }
a { color:inherit; text-decoration:none; }
img { display:block; max-width:100%; }
.container { width:min(1140px,calc(100% - 40px)); margin:auto; }
.utility { height:45px; background:var(--green); color:white; font-size:13px; }
.utility .container { height:100%; display:flex; align-items:center; justify-content:space-between; }
.utility-links { display:flex; gap:28px; }
.utility a { opacity:.92; }
.utility a:hover { opacity:1; text-decoration:underline; }
.masthead { height:132px; display:grid; grid-template-columns:1fr auto 1fr; align-items:center; border-bottom:1px solid var(--line); }
.socials { display:flex; gap:18px; font-weight:900; }
.socials a { width:25px; height:25px; display:grid; place-items:center; border-radius:50%; }
.brand { display:flex; align-items:center; gap:9px; color:var(--orange); }
.brand-mark { width:42px; height:42px; border:5px dotted var(--orange); border-radius:50%; position:relative; }
.brand-mark:after { content:''; position:absolute; inset:8px; background:var(--orange); border-radius:50%; }
.brand-copy { line-height:.82; text-transform:uppercase; }
.brand-copy small { font-size:15px; letter-spacing:1px; }
.brand-copy strong { display:block; font:700 34px/1 'Playfair Display',serif; letter-spacing:-1px; }
.brand-copy em { display:block; margin-top:7px; color:#333; font-size:5px; font-style:normal; font-weight:900; letter-spacing:1.1px; text-align:center; }
.search { justify-self:end; width:44px; height:44px; border:0; border-radius:4px; background:#f6f6f6; font-size:20px; cursor:pointer; }
.nav-wrap { border-bottom:1px solid var(--line); }
.nav { min-height:67px; display:flex; justify-content:center; align-items:stretch; gap:8px; overflow-x:auto; }
.nav a { flex:0 0 auto; display:flex; align-items:center; padding:0 17px; border-bottom:3px solid transparent; font-size:15px; }
.nav a:first-child,.nav a:hover { color:#63b858; border-color:#63b858; }
.nav sup { margin-left:5px; padding:2px 5px; border-radius:4px; background:#111; color:#fff; font-size:8px; }
main { padding-top:90px; }
.lead-grid { display:grid; grid-template-columns:minmax(0,1.2fr) minmax(350px,.88fr); gap:58px; }
.hero { min-height:460px; position:relative; overflow:hidden; border-radius:5px; background:#222; color:white; }
.hero img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .5s; }
.hero:hover img { transform:scale(1.035); }
.hero:after { content:''; position:absolute; inset:0; background:linear-gradient(0deg,rgba(0,0,0,.86),rgba(0,0,0,.06) 74%); }
.hero-copy { position:absolute; z-index:1; left:50px; right:50px; bottom:40px; }
.tag { display:inline-flex; align-items:center; gap:9px; padding:5px 12px; border:1px solid #dedede; border-radius:14px; background:#fff; color:#242424; font-size:12px; font-weight:700; text-transform:uppercase; }
.tag:before { content:''; width:10px; height:10px; border-radius:3px; background:var(--lime); }
.hero h1 { margin:17px 0 8px; max-width:580px; color:white; font-size:26px; line-height:1.25; }
.date { color:#aaa; font-size:12px; }
.hero .date { color:#eee; }
.excerpt { margin:20px 0 0; max-width:600px; color:#eee; font-size:14px; }
.side-list { display:grid; gap:22px; }
.side-card { display:grid; grid-template-columns:160px 1fr; gap:28px; align-items:start; }
.side-card img { width:160px; height:142px; object-fit:cover; border-radius:5px; }
.side-card h2 { margin:14px 0 8px; font-size:17px; line-height:1.25; }
.side-card:hover h2 { color:var(--green); }
.section { margin-top:72px; padding:60px 0; background:#222; color:white; }
.section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; }
.section h2 { margin:0; font-size:25px; }
.popular { display:grid; grid-template-columns:repeat(3,1fr); gap:28px; }
.popular-card { background:#2d2d2d; border-radius:5px; overflow:hidden; }
.popular-card img { width:100%; height:190px; object-fit:cover; }
.popular-copy { padding:22px; }
.popular-card h3 { margin:14px 0 10px; font-size:18px; line-height:1.35; }
.more { display:inline-block; padding:9px 16px; border:1px solid #555; border-radius:3px; font-size:12px; }
.article { max-width:800px; margin:auto; }
.article-head { text-align:center; }
.article h1 { margin:20px 0 12px; font:700 42px/1.2 'Playfair Display',serif; }
.article-cover { width:100%; max-height:500px; object-fit:cover; border-radius:6px; margin:38px 0; }
.article-body { color:#333; font-family:Georgia,serif; font-size:18px; line-height:1.85; }
.article-body p { margin:0 0 24px; }
.empty { padding:80px 20px; text-align:center; }
footer { margin-top:80px; padding:55px 0 30px; background:#181818; color:#bbb; }
.footer-grid { display:grid; grid-template-columns:1.3fr 1fr; gap:60px; }
.footer-grid .brand { filter:saturate(.85) brightness(1.15); }
.footer-links { display:flex; flex-wrap:wrap; gap:12px 24px; justify-content:flex-end; color:white; }
.copyright { margin-top:40px; padding-top:24px; border-top:1px solid #333; font-size:12px; text-align:center; }
@media(max-width:850px){ .utility{display:none}.masthead{height:105px}.socials{display:none}.brand{grid-column:1/3}.search{grid-column:3}.nav{justify-content:flex-start}.lead-grid{grid-template-columns:1fr;gap:35px}main{padding-top:35px}.popular{grid-template-columns:1fr 1fr}.footer-grid{grid-template-columns:1fr}.footer-links{justify-content:flex-start} }
@media(max-width:560px){ .container{width:min(100% - 28px,1140px)}.brand-copy strong{font-size:27px}.brand-mark{width:34px;height:34px}.hero{min-height:440px}.hero-copy{left:24px;right:24px;bottom:28px}.hero h1{font-size:23px}.excerpt{display:none}.side-card{grid-template-columns:112px 1fr;gap:16px}.side-card img{width:112px;height:112px}.side-card h2{margin:9px 0 6px;font-size:15px}.popular{grid-template-columns:1fr}.article h1{font-size:32px} }
`;
