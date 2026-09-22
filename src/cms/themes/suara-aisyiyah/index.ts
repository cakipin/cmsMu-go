import type { ThemeContext, ThemeStructure } from '../types';
import { _layout } from './layout';
import { renderHome } from './home';
import { renderSingle } from './single';
import { renderSingleVideo } from './single-video';
import { renderCategory } from './category';
import { renderSearch } from './search';
import { renderTag } from './tag';
import { renderPage } from './page';
import { renderAgen, renderBerlangganan, renderKonsultasi } from './components';
import { renderMajalahList, renderMajalahReader } from './emagazine';
import { renderUserProfile } from './user-profile';

const SuaraAisyiyah: ThemeStructure = {
  name: "Suara 'Aisyiyah",
  version: '1.0.0',
  author: 'CmsMu',
  _brand(ctx?: any) { 
    const logoSrc = (ctx && ctx.site_logo) ? ctx.site_logo : '/logo.svg';
    const siteTitle = (ctx && ctx.site_title) ? ctx.site_title : 'CMSMu Portal';
    return `<a href="/" class="header-brand-link" style="display:inline-flex;align-items:center;text-decoration:none;"><img src="${logoSrc}" alt="${siteTitle}" class="logo-img" style="height:44px;width:auto;object-fit:contain;" onerror="this.outerHTML='<h1 style=\\'font-weight:900;color:#0d9488;font-size:24px;margin:0;\\'>CMSMu</h1>'" /></a>`; 
  },
  _layout,
  renderHome,
  renderSingle,
  renderSingleVideo,
  renderAgen,
  renderKonsultasi,
  renderCategory,
  renderSearch,
  renderTag,
  renderBerlangganan,
  renderMajalahList,
  renderMajalahReader,
  renderUserProfile,
  renderPage,
  render404(ctx: ThemeContext) { return this._layout('<div class="container empty"><h1>404</h1><p>Halaman yang Anda cari tidak ditemukan.</p><br><a href="/" class="sa-back-link">&larr; Kembali ke Beranda</a></div>', 'Tidak ditemukan', ctx); }
};

export default SuaraAisyiyah;
