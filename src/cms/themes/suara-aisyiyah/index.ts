import type { ThemeContext, ThemeStructure } from '../types';
import { css } from './style';

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c] || c));
const fallback = (seed: number) => `https://images.unsplash.com/photo-${['1504711434969-e33886168f5c','1495020689067-958852a7765e','1529107386315-e1a2ed48a620','1481627834876-b7833e8f5570'][seed % 4]}?auto=format&fit=crop&w=1000&q=80`;
const date = (value: any) => new Date(value || Date.now()).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
const category = (p: any) => escapeHtml(p.category || p.categories?.[0]?.name || 'Berita');
const image = (p: any, i=0) => escapeHtml(p.featured_image || p.image || fallback(i));

const SuaraAisyiyah: ThemeStructure = {
  name: "Suara 'Aisyiyah",
  version: '1.0.0',
  author: 'CmsMu',
  _brand() { return `<span class="brand-mark"></span><span class="brand-copy"><small>Suara</small><strong>'Aisyiyah</strong><em>INSPIRASI PEREMPUAN BERKEMAJUAN</em></span>`; },
  _layout(content: string, title: string, ctx: ThemeContext) {
    const siteTitle = escapeHtml(ctx.site.site_title || ctx.site.title || "Suara 'Aisyiyah");
    const items = (ctx.menus?.length ? ctx.menus : [
      {label:'Home',url:'/'},{label:'Berita',url:'/category/berita'},{label:'Haji',url:'/category/haji',new:true},{label:'Kajian',url:'/category/kajian'},
      {label:'Keluarga Sakinah',url:'/category/keluarga-sakinah'},{label:'Wawasan',url:'/category/wawasan'},{label:'Gaya Hidup',url:'/category/gaya-hidup'},{label:'Inspirasi',url:'/category/inspirasi'},{label:'Muda',url:'/category/muda'}
    ]).map((m:any)=>`<a href="${escapeHtml(m.url)}">${escapeHtml(m.label)}${m.new?'<sup>New</sup>':''}</a>`).join('');
    return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${escapeHtml(ctx.site.description || 'Inspirasi perempuan berkemajuan')}"><title>${escapeHtml(title)} — ${siteTitle}</title><style>${css}</style></head><body>
      <div class="utility"><div class="container"><div class="utility-links"><a href="/tentang">Tentang</a><a href="/redaksi">Redaksi Suara 'Aisyiyah</a><a href="/kontak">Kontak Kami</a></div><a href="/berlangganan">● &nbsp; Berlangganan</a></div></div>
      <header class="container masthead"><div class="socials"><a href="#" aria-label="Facebook">f</a><a href="#" aria-label="X">𝕏</a><a href="#" aria-label="Instagram">◎</a></div><a class="brand" href="/" aria-label="${siteTitle}">${this._brand()}</a><button class="search" aria-label="Cari" onclick="document.getElementById('site-search').showModal()">⌕</button></header>
      <div class="nav-wrap"><nav class="container nav" aria-label="Navigasi utama">${items}</nav></div>
      <dialog id="site-search"><form method="dialog"><input name="q" placeholder="Cari artikel…" autofocus><button>Tutup</button></form></dialog>
      <main>${content}</main>
      <footer><div class="container"><div class="footer-grid"><div><a class="brand" href="/">${this._brand()}</a><p>Media inspirasi, wawasan, dan gerakan perempuan berkemajuan.</p></div><div class="footer-links">${items}</div></div><div class="copyright">© ${new Date().getFullYear()} ${siteTitle}. Ditenagai CmsMu.</div></div></footer>
    </body></html>`;
  },
  renderHome(ctx: ThemeContext) {
    const posts = Array.isArray(ctx.data) ? ctx.data : [];
    if (!posts.length) return this._layout('<div class="empty"><h1>Belum ada artikel</h1><p>Terbitkan artikel pertama untuk mengisi halaman ini.</p></div>', 'Beranda', ctx);
    const [hero,...rest] = posts;
    const side = rest.slice(0,3);
    const popular = rest.slice(3,9).length ? rest.slice(3,9) : rest.slice(0,6);
    const cleanExcerpt = escapeHtml(String(hero.excerpt || hero.body || '').replace(/<[^>]*>/g,'').slice(0,210));
    const lead = `<div class="container lead-grid"><a class="hero" href="/${escapeHtml(hero.slug)}"><img src="${image(hero)}" alt=""><div class="hero-copy"><span class="tag">${category(hero)}</span><h1>${escapeHtml(hero.title)}</h1><div class="date">${date(hero.created_at)}</div>${cleanExcerpt?`<p class="excerpt">${cleanExcerpt}…</p>`:''}</div></a><div class="side-list">${side.map((p:any,i:number)=>`<a class="side-card" href="/${escapeHtml(p.slug)}"><img src="${image(p,i+1)}" alt=""><div><span class="tag">${category(p)}</span><h2>${escapeHtml(p.title)}</h2><div class="date">${date(p.created_at)}</div></div></a>`).join('')}</div></div>`;
    const section = popular.length ? `<section class="section"><div class="container"><div class="section-head"><h2>Tulisan Populer</h2><a class="more" href="/posts">Lihat Semua →</a></div><div class="popular">${popular.map((p:any,i:number)=>`<a class="popular-card" href="/${escapeHtml(p.slug)}"><img src="${image(p,i+4)}" alt=""><div class="popular-copy"><span class="tag">${category(p)}</span><h3>${escapeHtml(p.title)}</h3><div class="date">${date(p.created_at)}</div></div></a>`).join('')}</div></div></section>` : '';
    return this._layout(lead+section, 'Beranda', ctx);
  },
  renderSingle(ctx: ThemeContext) {
    const p = ctx.data;
    if (!p) return this.render404(ctx);
    return this._layout(`<article class="container article"><header class="article-head"><span class="tag">${category(p)}</span><h1>${escapeHtml(p.title)}</h1><div class="date">${date(p.created_at)}</div></header>${p.featured_image?`<img class="article-cover" src="${image(p)}" alt="${escapeHtml(p.title)}">`:''}<div class="article-body">${p.body || p.content || ''}</div></article>`, p.title, ctx);
  },
  renderPage(ctx: ThemeContext) { return this.renderSingle(ctx); },
  render404(ctx: ThemeContext) { return this._layout('<div class="empty"><h1>404</h1><p>Halaman yang Anda cari tidak ditemukan.</p></div>', 'Tidak ditemukan', ctx); }
};

export default SuaraAisyiyah;
