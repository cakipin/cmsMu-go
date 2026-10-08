import type { ThemeContext } from '../types';
import { 
  escapeHtml, 
  getPostImage, 
  getPostCategory, 
  formatTimeAgo, 
  extractSourceInfo, 
  estimateReadTime, 
  renderPaginationBar,
  detectArticleLocation 
} from './utils';

export function renderHome(this: any, ctx: ThemeContext) {
  const currentRegion = (ctx as any).currentRegion || 'all';
  const isStructured = ctx.data && !Array.isArray(ctx.data) && (ctx.data.heroPosts || ctx.data.latest);
  const heroList = isStructured && ctx.data.heroPosts ? ctx.data.heroPosts : (isStructured ? ctx.data.latest : (Array.isArray(ctx.data) ? ctx.data : []));
  const regularList = isStructured && ctx.data.regularPosts ? ctx.data.regularPosts : (heroList.slice(9));
  const pagination = ctx.pagination || null;
  const isFirstPage = !pagination || Number(pagination.currentPage) <= 1;

  if ((!heroList || heroList.length === 0) && (!regularList || regularList.length === 0)) {
    return this._layout(`
      <main class="nr-container nr-section" style="text-align:center; padding: 5rem 1rem;">
        <h1 style="font-size:2rem; font-weight:800; margin-bottom:1rem;">Belum Ada Liputan Berita</h1>
        <p style="color:var(--text-secondary);">Naskah berita dari meja redaksi atau kurasi agregator akan tampil di sini.</p>
      </main>
    `, 'Beranda', ctx, 'home');
  }

  // 1. Lead Story (Hero Utama)
  const hero = heroList[0] || regularList[0];
  const heroCategory = getPostCategory(hero);
  const heroCategorySlug = heroCategory.toLowerCase().replace(/\s+/g, '-');
  const heroImage = getPostImage(hero);
  const heroTime = formatTimeAgo(hero.created_at);
  const heroExcerpt = hero.excerpt ? hero.excerpt.replace(/<[^>]+>/g, '').slice(0, 180) : '';
  const heroSource = extractSourceInfo(hero, ctx.site?.title || 'Redaksi', ctx.sources || []);
  const heroReadTime = estimateReadTime(hero.body || hero.excerpt || '');

  // 2. Left Column (Analisis & Wawasan / Opinion Picks - 4 artikel)
  const opinionCandidates = heroList.filter((p: any) => {
    const c = (p.category || '').toLowerCase();
    return c.includes('opini') || c.includes('wawasan') || c.includes('khutbah') || c.includes('tarjih') || c.includes('persyarikatan');
  });
  const leftPosts = (opinionCandidates.length >= 3 ? opinionCandidates : heroList.slice(1, 5)).slice(0, 4);

  // 3. Right Column (Trending Network / Populer Berperingkat - 4 artikel berikutnya)
  const leftIds = new Set([hero.id, ...leftPosts.map((p: any) => p.id)]);
  const trendingPosts = heroList.filter((p: any) => !leftIds.has(p.id)).slice(0, 4);

  // 4. Regular Grid (Berita Daerah & Sindikasi Media Terkini dari Seluruh Media - Tanpa Batasan Waktu)
  // Seluruh artikel yang tersedia di muat tanpa membatasi tanggal cutoff
  const regularPosts = regularList.length > 0 ? regularList : heroList.slice(9);

  const paginationHtml = renderPaginationBar(pagination);

  const content = `
  <main class="nr-container nr-section">
    <!-- International 3-Column Editorial Grid (BBC / Reuters Style) -->
    <div class="nr-editorial-hero">
      
      <!-- Kolom 1: Analisis & Wawasan Redaksi -->
      <aside class="nr-hero-column-opinion">
        <div class="nr-column-header">
          <span><i class="far fa-newspaper" style="color:var(--accent-primary); margin-right:4px;"></i> Analisis & Wawasan</span>
          <span style="font-size:0.6875rem; color:var(--text-muted); font-weight:600;">Kurasi</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.25rem;">
          ${leftPosts.map((p: any) => {
            const cat = getPostCategory(p);
            const catSlug = cat.toLowerCase().replace(/\s+/g, '-');
            const src = extractSourceInfo(p, ctx.site?.title || 'Redaksi', ctx.sources || []);
            const readMin = estimateReadTime(p.body || p.excerpt || '');
            return `
            <article class="nr-opinion-item">
              <div style="margin-bottom:0.35rem; display:flex; align-items:center; justify-content:space-between;">
                <a href="/${catSlug}" style="font-size:0.625rem; font-weight:800; color:var(--accent-primary); text-transform:uppercase; letter-spacing:0.04em;">
                  ${escapeHtml(cat)}
                </a>
                <span style="font-size:0.625rem; color:var(--text-muted); font-weight:600;">${readMin} mnt baca</span>
              </div>
              <h3 class="nr-opinion-title">
                <a href="/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a>
              </h3>
              <div class="nr-opinion-meta">
                <span><i class="far fa-user"></i> ${escapeHtml(p.author || src.name)}</span>
                <span>&bull;</span>
                <span>${formatTimeAgo(p.created_at)}</span>
              </div>
            </article>
            `;
          }).join('')}
        </div>
      </aside>

      <!-- Kolom 2: Lead Story (Fokus Berita Utama) -->
      <section class="nr-hero-column-lead">
        <article class="nr-card-lead-pro">
          <a href="/${escapeHtml(hero.slug)}" class="nr-lead-img-wrap">
            <img src="${heroImage}" alt="${escapeHtml(hero.title)}" loading="eager" fetchpriority="high">
          </a>
          <div class="nr-lead-content">
            <div class="nr-category-row">
              <a href="/${heroCategorySlug}" class="nr-category-badge">${escapeHtml(heroCategory)}</a>
              ${heroSource.slug ? `
                <a href="${heroSource.internalUrl}" class="nr-source-chip" title="Media Sindikasi: ${escapeHtml(heroSource.name)}">
                  <img src="${heroSource.favicon}" alt="${escapeHtml(heroSource.name)}" onerror="this.style.display='none'">
                  <span>${escapeHtml(heroSource.name)}</span>
                </a>
              ` : ''}
              <span style="font-size:0.6875rem; color:var(--text-muted); font-weight:600; margin-left:auto;">
                <i class="far fa-clock"></i> ${heroReadTime} menit baca
              </span>
            </div>
            <h1 class="nr-lead-title">
              <a href="/${escapeHtml(hero.slug)}">${escapeHtml(hero.title)}</a>
            </h1>
            ${heroExcerpt ? `<p class="nr-lead-excerpt">${escapeHtml(heroExcerpt)}…</p>` : ''}
            <div class="nr-meta">
              <span><i class="far fa-user"></i> ${escapeHtml(hero.author || 'Redaksi')}</span>
              <span>&bull;</span>
              <span><i class="far fa-calendar-alt"></i> ${heroTime}</span>
              <span style="margin-left:auto;">
                <a href="/${escapeHtml(hero.slug)}" style="color:var(--accent-primary); font-weight:700;">Baca Liputan Lengkap &rarr;</a>
              </span>
            </div>
          </div>
        </article>
      </section>

      <!-- Kolom 3: Trending Network & Berperingkat -->
      <aside class="nr-hero-column-trending">
        <div class="nr-column-header">
          <span><i class="fas fa-chart-line" style="color:var(--accent-primary); margin-right:4px;"></i> Trending Jejaring</span>
          <span style="font-size:0.6875rem; color:var(--text-muted); font-weight:600;">24 Jam</span>
        </div>
        <div class="nr-trending-list">
          ${trendingPosts.map((p: any, idx: number) => {
            const cat = getPostCategory(p);
            const catSlug = cat.toLowerCase().replace(/\s+/g, '-');
            const src = extractSourceInfo(p, ctx.site?.title || 'Redaksi', ctx.sources || []);
            return `
            <article class="nr-card-trending">
              <span class="nr-rank-number">0${idx + 1}</span>
              <div class="nr-trending-thumb">
                <img src="${getPostImage(p, idx)}" alt="${escapeHtml(p.title)}" loading="lazy">
              </div>
              <div class="nr-trending-content">
                <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.2rem;">
                  <a href="/${catSlug}" style="font-size:0.625rem; font-weight:800; color:var(--accent-primary); text-transform:uppercase; letter-spacing:0.04em;">
                    ${escapeHtml(cat)}
                  </a>
                  <span style="font-size:0.625rem; color:var(--text-muted);">&bull;</span>
                  <span style="font-size:0.625rem; color:var(--text-muted);">${formatTimeAgo(p.created_at)}</span>
                </div>
                <h3 class="nr-trending-title">
                  <a href="/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a>
                </h3>
                ${src.slug ? `
                  <a href="${src.internalUrl}" style="font-size:0.625rem; color:var(--text-muted); font-weight:600; display:inline-flex; align-items:center; gap:3px;">
                    <img src="${src.favicon}" width="10" height="10" alt="${escapeHtml(src.name)}" onerror="this.style.display='none'">
                    ${escapeHtml(src.name)}
                  </a>
                ` : ''}
              </div>
            </article>
            `;
          }).join('')}
        </div>
      </aside>

    </div>

    <!-- Regular Grid Section: Sindikasi Media & Warta Daerah dengan Filter Wilayah Terpisah -->
    ${regularPosts.length > 0 ? `
      <section style="margin-top: 3.5rem;">
        <div class="nr-section-header" style="flex-wrap:wrap; gap:0.75rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
              <h2 class="nr-section-title">Sindikasi Media Muhammadiyah</h2>
              <span class="nr-region-chip" title="Liputan seluruh wilayah persyarikatan">
                <i class="fas fa-location-dot"></i> Seluruh Wilayah
              </span>
            </div>
            <p style="font-size:0.8125rem; color:var(--text-secondary); margin-top:0.25rem;">
              Liputan terverifikasi dari jejaring media persyarikatan dan wilayah di seluruh Indonesia tanpa batasan waktu
            </p>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
            <a href="/berita-daerah" style="font-size:0.8125rem; font-weight:700; color:var(--accent-primary); display:inline-flex; align-items:center; gap:4px;">
              Semua Wilayah &rarr;
            </a>
          </div>
        </div>

        <!-- Selector Tab Filter Wilayah Interaktif (Jateng, DIY, Jabar, DKI Terpisah) -->
        <div class="nr-region-tabs" id="region-filter-tabs">
          <a href="/" class="nr-region-tab-btn ${currentRegion === 'all' ? 'active' : ''}">
            <i class="fas fa-globe-asia"></i> Semua Wilayah
          </a>
          <a href="/?region=jateng" class="nr-region-tab-btn ${currentRegion === 'jateng' ? 'active' : ''}">
            <i class="fas fa-location-dot"></i> Jawa Tengah
          </a>
          <a href="/?region=diy" class="nr-region-tab-btn ${currentRegion === 'diy' ? 'active' : ''}">
            <i class="fas fa-location-dot"></i> D.I. Yogyakarta
          </a>
          <a href="/?region=jatim" class="nr-region-tab-btn ${currentRegion === 'jatim' ? 'active' : ''}">
            <i class="fas fa-location-dot"></i> Jawa Timur
          </a>
          <a href="/?region=jabar" class="nr-region-tab-btn ${currentRegion === 'jabar' ? 'active' : ''}">
            <i class="fas fa-location-dot"></i> Jawa Barat
          </a>
          <a href="/?region=dki" class="nr-region-tab-btn ${currentRegion === 'dki' ? 'active' : ''}">
            <i class="fas fa-location-dot"></i> DKI Jakarta
          </a>
          <a href="/?region=luar_jawa" class="nr-region-tab-btn ${currentRegion === 'luar_jawa' ? 'active' : ''}">
            <i class="fas fa-location-dot"></i> Luar Jawa
          </a>
        </div>

        <div class="nr-grid-cards">
          ${regularPosts.map((p: any, idx: number) => {
            const cat = getPostCategory(p);
            const catSlug = cat.toLowerCase().replace(/\s+/g, '-');
            const src = extractSourceInfo(p, ctx.site?.title || 'Redaksi', ctx.sources || []);
            const loc = detectArticleLocation(p, ctx.sources || []);
            const readMin = estimateReadTime(p.body || p.excerpt || '');
            return `
            <article class="nr-card-standard" data-region-group="${loc.regionGroup}">
              <a href="/${escapeHtml(p.slug)}" class="nr-card-thumb">
                <img src="${getPostImage(p, idx)}" alt="${escapeHtml(p.title)}" loading="lazy">
              </a>
              <div class="nr-card-body">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.25rem;">
                  <div style="display:flex; align-items:center; gap:0.35rem; flex-wrap:wrap;">
                    <a href="/${catSlug}" class="nr-category-badge">${escapeHtml(cat)}</a>
                    ${loc.badgeText ? `
                      <span class="nr-location-badge" title="Liputan Daerah: ${escapeHtml(loc.badgeText)}">
                        <i class="fas fa-location-dot"></i> ${escapeHtml(loc.badgeText)}
                      </span>
                    ` : ''}
                  </div>
                  <span style="font-size:0.625rem; color:var(--text-muted); font-weight:600;">${readMin} mnt baca</span>
                </div>
                <h3 class="nr-card-title">
                  <a href="/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a>
                </h3>
                <div class="nr-card-footer">
                  ${src.slug ? `
                    <a href="${src.internalUrl}" class="nr-source-chip" style="padding:1px 6px; font-size:0.625rem;" title="${escapeHtml(src.name)}">
                      <img src="${src.favicon}" width="12" height="12" alt="${escapeHtml(src.name)}" onerror="this.style.display='none'">
                      <span>${escapeHtml(src.name)}</span>
                    </a>
                  ` : `<span><i class="far fa-user"></i> ${escapeHtml(p.author || 'Redaksi')}</span>`}
                  <span><i class="far fa-clock"></i> ${formatTimeAgo(p.created_at)}</span>
                </div>
              </div>
            </article>
            `;
          }).join('')}
        </div>
        <!-- Pagination Navigasi Halaman -->
        ${paginationHtml}
      </section>
    ` : ''}
  </main>

  <script>
    (function() {
      // Fokuskan viewport ke area berita wilayah jika terdapat parameter region atau page > 1
      try {
        var params = new URLSearchParams(window.location.search);
        if (params.has('region') || (params.has('page') && parseInt(params.get('page')) > 1)) {
          var tabs = document.getElementById('region-filter-tabs');
          if (tabs) {
            setTimeout(function() {
              var yOffset = -80;
              var y = tabs.getBoundingClientRect().top + window.pageYOffset + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }, 100);
          }
        }
      } catch (e) {}
    })();
  </script>
  `;

  return this._layout(content, isFirstPage ? 'Beranda' : `Beranda — Halaman ${pagination?.currentPage || 1}`, ctx, 'home');
}

