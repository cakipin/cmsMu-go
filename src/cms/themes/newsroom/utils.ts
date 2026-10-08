export function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&(?!#?\w+;)|[<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c] || c));
}

export function formatDateIndo(dateInput: any): string {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return String(dateInput);
  }
}

export function formatTimeAgo(dateInput: any): string {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return 'Baru saja';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} hari lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return '';
  }
}

export function getYoutubeThumbnail(url?: string): string {
  if (!url) return '';
  const str = String(url).trim();
  if (str.includes('youtube.com') || str.includes('youtu.be')) {
    let videoId = '';
    if (str.includes('youtu.be/')) {
      videoId = str.split('youtu.be/')[1].split('?')[0].split('/')[0];
    } else if (str.includes('shorts/')) {
      videoId = str.split('shorts/')[1].split('?')[0].split('/')[0];
    } else if (str.includes('embed/')) {
      videoId = str.split('embed/')[1].split('?')[0].split('/')[0];
    } else {
      const m = str.match(/[?&]v=([a-zA-Z0-9_-]+)/);
      if (m && m[1]) videoId = m[1];
    }
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return '';
}

export function getPostImage(post: any, fallbackIndex = 0): string {
  if (!post) return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';
  const custom = post?.featured_image || post?.featuredImage || post?.image;
  if (custom && typeof custom === 'string' && custom.trim() !== '') return custom;
  
  const yt = getYoutubeThumbnail(post?.video_url || post?.videoUrl || post?.video);
  if (yt) return yt;

  if (post.body && typeof post.body === 'string') {
    const match = post.body.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) return match[1];
  }

  const fallbacks = [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80'
  ];
  return fallbacks[fallbackIndex % fallbacks.length];
}

export function getPostCategory(post: any): string {
  if (!post) return 'Berita';
  return post?.category || post?.category_name || post?.categories?.[0]?.name || 'Berita Terkini';
}

export function estimateReadTime(text: string): number {
  if (!text) return 2;
  const words = text.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function cleanAndFormatArticleContent(rawHtml: string, hasFeaturedImage = false): { body: string; captionText: string } {
  if (!rawHtml) return { body: '', captionText: '' };

  let str = String(rawHtml).trim();
  let extractedCaption = '';

  // 1. Ekstraksi dan pembersihan shortcode [caption]...[/caption]
  const captionRegex = /\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/gi;
  let isFirstCaption = true;

  str = str.replace(captionRegex, (match, inner) => {
    const imgMatch = inner.match(/<img[^>]*>/i);
    const captionText = inner.replace(/<[^>]+>/g, '').trim();

    if (isFirstCaption) {
      isFirstCaption = false;
      if (captionText && !extractedCaption) {
        extractedCaption = captionText;
      }
      // Jika post memiliki featured image, buang caption/gambar pertama di awal artikel
      if (hasFeaturedImage) {
        return '';
      }
    }

    if (imgMatch) {
      return `<figure class="wp-caption my-6 text-center">${imgMatch[0]}${captionText ? `<figcaption class="wp-caption-text text-sm text-slate-500 italic mt-2">${captionText}</figcaption>` : ''}</figure>`;
    }
    return captionText ? `<p class="wp-caption-text italic text-slate-500">${captionText}</p>` : '';
  });

  // Bersihkan sisa tag caption jika ada
  str = str.replace(/\[\/?caption[^\]]*\]/gi, '');

  // 2. Bersihkan kontainer caption kosong / sisa wp-caption kosong
  str = str.replace(/<div[^>]*class="[^"]*wp-caption[^"]*"[^>]*>\s*<\/div>/gi, '');

  // 2b. Bersihkan wrapper kontainer layout eksternal (seperti UMPAR / portal lain)
  str = str.replace(/<div[^>]*class=["'][^"']*(?:container mx-auto|max-w-4xl|article-content-card|article-body|prose-modern)[^"']*["'][^>]*>/gi, '');

  // 2c. Bersihkan wrapper featured-image dari body naskah
  str = str.replace(/<div[^>]*class=["'][^"']*(?:featured-image-wrapper|featured-image|featured_image|post-thumbnail|entry-thumbnail)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');

  // 2d. Bersihkan foto/gambar/figure di bagian paling atas naskah (sebelum teks narasi berita) pada SEMUA sumber
  let topCleaned = false;
  while (!topCleaned) {
    const before = str;
    str = str.replace(/^\s*(?:<div[^>]*>\s*)*<figure[^>]*>[\s\S]*?<\/figure>(?:\s*<\/div>)*/i, '');
    str = str.replace(/^\s*(?:<div[^>]*>\s*)*<p[^>]*>\s*<figure[^>]*>[\s\S]*?<\/figure>\s*<\/p>(?:\s*<\/div>)*/i, '');
    str = str.replace(/^\s*(?:<div[^>]*>\s*)*<p[^>]*>\s*(?:<a[^>]*>\s*)?<img[^>]*>(?:\s*<\/a>)?\s*<\/p>(?:\s*<\/div>)*/i, '');
    str = str.replace(/^\s*(?:<div[^>]*>\s*)*<p[^>]*>\s*<figure[^>]*>[\s\S]*?<\/figure>/i, '<p>');
    str = str.replace(/^\s*(?:<div[^>]*>\s*)*<p[^>]*>\s*(?:<a[^>]*>\s*)?<img[^>]*>(?:\s*<\/a>)?/i, '<p>');
    str = str.replace(/^\s*(?:<div[^>]*>\s*)*<img[^>]*>(?:\s*<\/div>)*/i, '');
    str = str.replace(/^\s*<div[^>]*class=["'][^"']*(?:wp-caption|featured)[^"']*["'][^>]*>[\s\S]*?<\/div>/i, '');
    if (str === before) {
      topCleaned = true;
    }
  }

  // 2e. Bersihkan blok attribution-box bawaan artikel agar tidak dobel dengan attribution-box tema
  str = str.replace(/<blockquote[^>]*class="[^"]*attribution-box[^"]*"[^>]*>[\s\S]*?<\/blockquote>/gi, '');

  // 2f. Bersihkan widget sosial share eksternal, floating bar, dan sampah HTML plugin (termasuk Bagikan Artikel Ini, FB, Twitter, WA, IG, TikTok)
  str = str.replace(/<div[^>]*class=["'][^"']*(?:share-section|share-title|share-btn|bagikan|xs_social_share_widget|xs_share_url|wslu-style|wslu-share-box|sharedaddy|jp-relatedposts|social-share|share-box|share-buttons|social-buttons|addtoany|heateor_sss_sharing_container|yarpp-related)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
  str = str.replace(/<div[^>]*class=["'][^"']*share-section[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
  str = str.replace(/<h[1-6][^>]*>\s*(?:<[^>]+>\s*)*(?:Bagikan Artikel|Bagikan Berita|Share this)[\s\S]*?<\/div>\s*<\/div>/gi, '');
  str = str.replace(/<ul[^>]*class=["'][^"']*(?:share|social|wslu)[^"']*["'][^>]*>[\s\S]*?<\/ul>/gi, '');

  // 2g. Bersihkan sisa wrapper paragraf dobel / nested p bawaan WordPress
  str = str.replace(/<p[^>]*>\s*<p[^>]*>/gi, '<p>');
  str = str.replace(/<\/p>\s*<\/p>/gi, '</p>');

  // 2f. Bersihkan inline style width/height atau atribut width pada figure dan img agar tidak overflow
  str = str.replace(/<figure([^>]*)>/gi, (_match, attrs) => {
    let cleanAttrs = attrs
      .replace(/style="([^"]*)"/gi, (_m: string, s: string) => {
        const filtered = s.replace(/(?:max-)?width\s*:\s*[^;]+;?/gi, '').trim();
        return filtered ? `style="${filtered}"` : '';
      })
      .replace(/\s*width="[^"]*"/gi, '');
    return `<figure${cleanAttrs}>`;
  });

  // 3. Sanitasi & Responsivitas Tabel
  str = str.replace(/(?:<div[^>]*class="[^"]*table-responsive-wrapper[^"]*"[^>]*>\s*)?(<table[\s\S]*?<\/table>)(?:\s*<\/div>)?/gi, (_match, tableHtml) => {
    let cleanedTable = tableHtml
      .replace(/\s*(width|height)="[^"]*"/gi, '')
      .replace(/style="([^"]*)"/gi, (_m: string, s: string) => {
        const filtered = s.replace(/width\s*:\s*[^;]+;?/gi, '').trim();
        return filtered ? `style="${filtered}"` : '';
      })
      .replace(/<\/strong><\/p>\s*<p>(&nbsp;|\s*)<\/td>/gi, '</strong></td>')
      .replace(/<p>(&nbsp;|\s*)<\/td>/gi, '</td>');
    return `<div class="table-responsive-wrapper">${cleanedTable}</div>`;
  });

  // 3b. Bersihkan tag <br> yang berdiri sendiri di antara tag </p> dan <p>
  str = str.replace(/<\/p>\s*(?:<br\s*\/?>\s*)+<p[^>]*>/gi, '</p><p>');

  // 3c. Bersihkan tag <p> kosong atau hanya berisi spasi / &nbsp; / <br>
  str = str.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi, '');

  // 4. Smart Autop Paragraph Formatter
  str = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = str.split(/\n\s*\n+/);

  const formattedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';

    const isBlockTag = /^<(div|blockquote|figure|figcaption|table|ul|ol|h[1-6]|iframe|section|article|p|hr)/i.test(trimmed);
    if (isBlockTag) {
      return trimmed;
    }

    const withBr = trimmed.replace(/\n/g, '<br />');
    return `<p>${withBr}</p>`;
  }).filter(Boolean);

  let finalBody = formattedBlocks.join('\n\n');

  // Bersihkan kembali sisa <p></p> kosong atau <p><br></p> yang mungkin tersisa
  finalBody = finalBody.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi, '');
  finalBody = finalBody.replace(/<\/p>\s*(?:<br\s*\/?>\s*)+<p[^>]*>/gi, '</p><p>');

  return {
    body: finalBody.trim(),
    captionText: extractedCaption
  };
}

export function extractSourceInfo(
  post: any, 
  siteTitle: string = 'Newsroom',
  sourcesList: any[] = []
): { name: string; url: string; favicon: string; slug: string; internalUrl: string } {
  if (!post) {
    return { name: siteTitle, url: '/', favicon: '/favicon.svg', slug: '', internalUrl: '/' };
  }

  const rawBody = String(post.body || post.content || '');
  let sourceUrl = post.source_url || post.original_url || '';
  let sourceName = post.source_name || '';

  // 1. Deteksi dari attribution box: <blockquote class="attribution-box">...<a href="URL">NAME</a>...</blockquote>
  if (!sourceUrl || !sourceName) {
    const attrMatch = rawBody.match(/<blockquote[^>]*class="[^"]*attribution-box[^"]*"[^>]*>[\s\S]*?<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (attrMatch) {
      if (!sourceUrl) sourceUrl = attrMatch[1].trim();
      if (!sourceName) sourceName = attrMatch[2].replace(/<[^>]+>/g, '').trim();
    }
  }

  // 2. Deteksi dari lead text: <strong>KOTA, MEDIA.COM</strong>
  if (!sourceName) {
    const leadMatch = rawBody.match(/<strong[^>]*>([A-Z\s]+),\s*([A-Z0-9.-]+\.[A-Z]{2,})<\/strong>/i);
    if (leadMatch) {
      sourceName = leadMatch[2].trim();
      if (!sourceUrl) sourceUrl = 'https://' + sourceName.toLowerCase();
    }
  }

  // 3. Fallback jika ada URL tapi belum ada nama
  if (sourceUrl && !sourceName) {
    try {
      const parsed = new URL(sourceUrl);
      sourceName = parsed.hostname.replace(/^www\./i, '');
    } catch(e) {
      sourceName = sourceUrl;
    }
  }

  // 4. Jika terdeteksi sebagai artikel sindikasi media
  if (sourceUrl || sourceName) {
    let domain = '';
    try {
      if (sourceUrl) {
        domain = new URL(sourceUrl.startsWith('http') ? sourceUrl : 'https://' + sourceUrl).hostname.replace(/^www\./i, '');
      } else {
        domain = sourceName.toLowerCase().replace(/^www\./i, '');
      }
    } catch(e) {
      domain = sourceName.toLowerCase();
    }

    let slug = '';
    const normName = (sourceName || '').toLowerCase().trim();
    const normDomain = domain.toLowerCase().trim();

    // DYNAMIC MATCHING ke daftar media_sources dari Real Database (Zero Hardcode Policy)
    if (Array.isArray(sourcesList) && sourcesList.length > 0) {
      // 1. Cocokkan Domain URL (Paling Akurat)
      const matchedByDomain = sourcesList.find((s: any) => {
        if (!s.base_url) return false;
        try {
          const sDom = new URL(s.base_url.startsWith('http') ? s.base_url : 'https://' + s.base_url).hostname.replace(/^www\./i, '').toLowerCase();
          return normDomain === sDom || normDomain.endsWith('.' + sDom) || sDom.endsWith('.' + normDomain);
        } catch (e) {
          return false;
        }
      });

      if (matchedByDomain) {
        sourceName = matchedByDomain.name || sourceName;
        slug = matchedByDomain.slug;
      } else {
        // 2. Cocokkan Nama Media Persis atau Slug Persis
        const cleanName = normName.replace(/[^a-z0-9]/g, '');
        const matchedByName = sourcesList.find((s: any) => {
          const sNameClean = (s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const sSlugClean = (s.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return (
            (cleanName && cleanName === sNameClean) ||
            (cleanName && cleanName === sSlugClean) ||
            (s.name && normName === s.name.toLowerCase())
          );
        });

        if (matchedByName) {
          sourceName = matchedByName.name || sourceName;
          slug = matchedByName.slug;
        } else {
          // 3. Cocokkan Nama Media Substring kata kunci signifikan (misal: "Suara Guru" vs "Suara Guru Muhammadiyah")
          const matchedBySub = sourcesList.find((s: any) => {
            const sNameNorm = (s.name || '').toLowerCase();
            return (sNameNorm.length >= 6 && normName.includes(sNameNorm)) || 
                   (normName.length >= 6 && sNameNorm.includes(normName));
          });

          if (matchedBySub) {
            sourceName = matchedBySub.name || sourceName;
            slug = matchedBySub.slug;
          }
        }
      }
    }

    // Fallback Slug Dinamis jika tidak ada dalam database (Slugify Dinamis, BUKAN diarahkan ke pwm-diy)
    if (!slug) {
      slug = (sourceName || domain).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const favicon = domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32` : '/favicon.svg';
    return {
      name: sourceName || domain,
      url: sourceUrl || (domain ? 'https://' + domain : '#'),
      favicon,
      slug,
      internalUrl: slug ? `/sumber/${slug}` : '/sumber'
    };
  }

  // 5. Default artikel internal
  return {
    name: siteTitle,
    url: '/',
    favicon: '/favicon.svg',
    slug: '',
    internalUrl: '/'
  };
}

export function renderPaginationBar(pagination: any): string {
  if (!pagination || pagination.totalPages <= 1) return '';

  const current = Number(pagination.currentPage) || 1;
  const total = Number(pagination.totalPages) || 1;
  const totalItems = pagination.totalItems || 0;
  const baseUrl = pagination.baseUrl || '/';
  
  const buildUrl = (p: number) => {
    const hasQuery = baseUrl.includes('?');
    if (p === 1 && (baseUrl === '/' || baseUrl === '')) return '/';
    if (hasQuery) {
      // Ganti param page jika ada, atau tambahkan
      const u = new URL('http://dummy.local' + baseUrl);
      u.searchParams.set('page', String(p));
      return u.pathname + u.search;
    }
    return `${baseUrl}?page=${p}`;
  };

  // Hitung rentang nomor halaman yang akan ditampilkan (misal: 1, 2, 3 ... 10)
  const pages: (number | string)[] = [];
  const delta = 2; // jumlah nomor di sekitar current page

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  const prevBtn = current > 1
    ? `<a href="${buildUrl(current - 1)}" class="nr-page-btn" aria-label="Halaman Sebelumnya"><i class="fas fa-chevron-left" style="font-size:0.75rem; margin-right:4px;"></i> Sebelumnya</a>`
    : `<span class="nr-page-btn disabled" aria-disabled="true"><i class="fas fa-chevron-left" style="font-size:0.75rem; margin-right:4px;"></i> Sebelumnya</span>`;

  const nextBtn = current < total
    ? `<a href="${buildUrl(current + 1)}" class="nr-page-btn" aria-label="Halaman Selanjutnya">Selanjutnya <i class="fas fa-chevron-right" style="font-size:0.75rem; margin-left:4px;"></i></a>`
    : `<span class="nr-page-btn disabled" aria-disabled="true">Selanjutnya <i class="fas fa-chevron-right" style="font-size:0.75rem; margin-left:4px;"></i></span>`;

  const pageButtons = pages.map(p => {
    if (p === '...') {
      return `<span class="nr-page-ellipsis">&hellip;</span>`;
    }
    const pageNum = Number(p);
    const isActive = pageNum === current;
    if (isActive) {
      return `<span class="nr-page-btn active" aria-current="page">${pageNum}</span>`;
    }
    return `<a href="${buildUrl(pageNum)}" class="nr-page-btn">${pageNum}</a>`;
  }).join('');

  return `
    <div class="nr-pagination-wrapper">
      <nav class="nr-pagination" aria-label="Navigasi Halaman Berita">
        ${prevBtn}
        ${pageButtons}
        ${nextBtn}
      </nav>
      ${totalItems > 0 ? `
        <div class="nr-pagination-info">
          Menampilkan halaman <strong>${current}</strong> dari <strong>${total}</strong> (Total <strong>${totalItems}</strong> liputan warta)
        </div>
      ` : ''}
    </div>
  `;
}

export interface ArticleLocation {
  city: string;
  province: string;
  regionGroup: 'jateng' | 'diy' | 'jabar' | 'dki' | 'jatim' | 'luar_jawa' | 'nasional';
  badgeText: string;
  isNational: boolean;
}

export function detectArticleLocation(post: any, sourcesList: any[] = []): ArticleLocation {
  if (!post) {
    return { city: '', province: 'Nasional', regionGroup: 'nasional', badgeText: '', isNational: true };
  }

  const rawTitle = String(post.title || '');
  const rawBody = String(post.body || post.content || '');
  const rawExcerpt = String(post.excerpt || '');
  const combinedText = `${rawTitle} ${rawExcerpt} ${rawBody.slice(0, 800)}`.toLowerCase();

  // 1. Ekstraksi Lead City dari format standar jurnalistik: "KOTA, Media.com —" atau "KOTA (Media.com) —"
  let detectedCity = '';
  let detectedProvince = '';

  const leadCityMatch = rawBody.match(/<p[^>]*>\s*(?:<strong>)?([A-Z\s]{3,20})(?:<\/strong>)?\s*[,–-]\s*(?:<[^>]+>)?(?:[A-Z0-9.-]+\.[A-Z]{2,}|Suara|Menara|KlikMU|PWMU|PWM|PDM)/i)
    || rawExcerpt.match(/^([A-Z\s]{3,20})\s*[,–-]\s*/i);

  if (leadCityMatch) {
    const rawLeadCity = leadCityMatch[1].trim().toLowerCase();
    // Validasi bukan kata umum
    const nonCityWords = ['jakarta', 'indonesia', 'redaksi', 'berita', 'warta', 'liputan', 'nasional'];
    if (!nonCityWords.includes(rawLeadCity) && rawLeadCity.length >= 3 && rawLeadCity.length <= 25) {
      detectedCity = rawLeadCity.charAt(0).toUpperCase() + rawLeadCity.slice(1);
    }
  }

  // 2. Hubungkan dengan media source profil (jika ada region_code atau nama media)
  const sourceInfo = extractSourceInfo(post, 'Newsroom', sourcesList);
  const matchedSource = sourcesList.find(s => s.slug === sourceInfo.slug || s.name === sourceInfo.name);
  const sourceRegionCode = (matchedSource?.region_code || '').toUpperCase();
  const sourceNameUpper = (matchedSource?.name || sourceInfo.name || '').toUpperCase();

  // 3. Klasifikasi Wilayah secara presisi (DIY, Jateng, Jabar, DKI, Jatim, Luar Jawa)

  // A. D.I. YOGYAKARTA (diy)
  const isDiy = 
    sourceRegionCode.includes('YOGYAKARTA') ||
    sourceRegionCode.includes('DIY') ||
    sourceNameUpper.includes('YOGYAKARTA') ||
    sourceNameUpper.includes('UNISA YOGYA') ||
    sourceNameUpper.includes('UAD') ||
    sourceNameUpper.includes('UMY') ||
    /\b(yogyakarta|jogja|sleman|bantul|kulon progo|gunungkidul|wates|wonosari)\b/i.test(combinedText);

  if (isDiy) {
    let c = detectedCity;
    if (!c) {
      if (/\bsleman\b/i.test(combinedText)) c = 'Sleman';
      else if (/\bbantul\b/i.test(combinedText)) c = 'Bantul';
      else if (/\bkulon progo|wates\b/i.test(combinedText)) c = 'Kulon Progo';
      else if (/\bgunungkidul|wonosari\b/i.test(combinedText)) c = 'Gunungkidul';
      else c = 'Yogyakarta';
    }
    return {
      city: c,
      province: 'D.I. Yogyakarta',
      regionGroup: 'diy',
      badgeText: c ? `${c}, DIY` : 'D.I. Yogyakarta',
      isNational: false
    };
  }

  // B. JAWA TENGAH (jateng)
  const isJateng = 
    sourceRegionCode.includes('JATENG') ||
    sourceRegionCode.includes('JAWA TENGAH') ||
    sourceNameUpper.includes('JATENG') ||
    sourceNameUpper.includes('MENARAMU') ||
    sourceNameUpper.includes('UNIMUS') ||
    sourceNameUpper.includes('UMS') ||
    sourceNameUpper.includes('UNIMMA') ||
    sourceNameUpper.includes('UMKU') ||
    sourceNameUpper.includes('UMP') ||
    /\b(semarang|surakarta|solo|banyumas|purwokerto|jepara|kudus|magelang|pekalongan|cilacap|temanggung|kendal|klaten|boyolali|salatiga|sukoharjo|karanganyar|sragen|wonogiri|purworejo|kebumen|brebes|tegal|pemalang|batang|blora|rembang|pati|demak|grobogan|purbalingga|banjarnegara|wonosobo)\b/i.test(combinedText);

  if (isJateng) {
    let c = detectedCity;
    if (!c) {
      if (/\bsemarang\b/i.test(combinedText)) c = 'Semarang';
      else if (/\bsurakarta|solo\b/i.test(combinedText)) c = 'Surakarta';
      else if (/\bpurwokerto|banyumas\b/i.test(combinedText)) c = 'Purwokerto';
      else if (/\bjepara\b/i.test(combinedText)) c = 'Jepara';
      else if (/\bkudus\b/i.test(combinedText)) c = 'Kudus';
      else if (/\bmagelang\b/i.test(combinedText)) c = 'Magelang';
      else if (/\bpekalongan\b/i.test(combinedText)) c = 'Pekalongan';
      else if (/\bcilacap\b/i.test(combinedText)) c = 'Cilacap';
      else if (/\btemanggung\b/i.test(combinedText)) c = 'Temanggung';
      else if (/\bkendal\b/i.test(combinedText)) c = 'Kendal';
      else if (/\bklaten\b/i.test(combinedText)) c = 'Klaten';
      else if (/\bsukoharjo\b/i.test(combinedText)) c = 'Sukoharjo';
      else if (/\bkaranganyar\b/i.test(combinedText)) c = 'Karanganyar';
      else if (/\bboyolali\b/i.test(combinedText)) c = 'Boyolali';
      else if (/\bsalatiga\b/i.test(combinedText)) c = 'Salatiga';
      else if (/\bpurworejo\b/i.test(combinedText)) c = 'Purworejo';
      else if (/\bkebumen\b/i.test(combinedText)) c = 'Kebumen';
      else if (/\bbrebes\b/i.test(combinedText)) c = 'Brebes';
      else if (/\btegal\b/i.test(combinedText)) c = 'Tegal';
      else if (/\bbatang\b/i.test(combinedText)) c = 'Batang';
      else c = 'Semarang';
    }
    return {
      city: c,
      province: 'Jawa Tengah',
      regionGroup: 'jateng',
      badgeText: c ? `${c}, Jateng` : 'Jawa Tengah',
      isNational: false
    };
  }

  // C. DKI JAKARTA (dki)
  const isDki = 
    sourceRegionCode.includes('DKI') ||
    sourceRegionCode.includes('JAKARTA') ||
    sourceNameUpper.includes('DKI') ||
    sourceNameUpper.includes('UHAMKA') ||
    /\b(jakarta|dki jakarta|jakarta pusat|jakarta selatan|jakarta timur|jakarta barat|jakarta utara|menteng|kebayoran|rawamangun|salemba|matraman)\b/i.test(combinedText);

  if (isDki) {
    let c = detectedCity;
    if (!c || !c.toLowerCase().includes('jakarta')) c = 'Jakarta';
    return {
      city: c,
      province: 'DKI Jakarta',
      regionGroup: 'dki',
      badgeText: 'DKI Jakarta',
      isNational: false
    };
  }

  // D. JAWA BARAT (jabar)
  const isJabar = 
    sourceRegionCode.includes('JABAR') ||
    sourceRegionCode.includes('JAWA BARAT') ||
    sourceNameUpper.includes('JABAR') ||
    sourceNameUpper.includes('UM BANDUNG') ||
    sourceNameUpper.includes('UM CIREBON') ||
    sourceNameUpper.includes('UM SUKABUMI') ||
    /\b(bandung|bogor|bekasi|depok|cirebon|tasikmalaya|sukabumi|garut|karawang|cimahi|purwakarta|subang|majalengka|kuningan|indramayu|cianjur|sumedang|ciamis|banjar|pangandaran)\b/i.test(combinedText);

  if (isJabar) {
    let c = detectedCity;
    if (!c) {
      if (/\bbandung\b/i.test(combinedText)) c = 'Bandung';
      else if (/\bbogor\b/i.test(combinedText)) c = 'Bogor';
      else if (/\bbekasi\b/i.test(combinedText)) c = 'Bekasi';
      else if (/\bdepok\b/i.test(combinedText)) c = 'Depok';
      else if (/\bcirebon\b/i.test(combinedText)) c = 'Cirebon';
      else if (/\btasikmalaya\b/i.test(combinedText)) c = 'Tasikmalaya';
      else if (/\bsukabumi\b/i.test(combinedText)) c = 'Sukabumi';
      else if (/\bgarut\b/i.test(combinedText)) c = 'Garut';
      else if (/\bkarawang\b/i.test(combinedText)) c = 'Karawang';
      else c = 'Jawa Barat';
    }
    return {
      city: c,
      province: 'Jawa Barat',
      regionGroup: 'jabar',
      badgeText: c ? `${c}, Jabar` : 'Jawa Barat',
      isNational: false
    };
  }

  // E. JAWA TIMUR (jatim)
  const isJatim = 
    sourceRegionCode.includes('JATIM') ||
    sourceRegionCode.includes('JAWA TIMUR') ||
    sourceNameUpper.includes('JATIM') ||
    sourceNameUpper.includes('PWMU') ||
    sourceNameUpper.includes('KLIKMU') ||
    sourceNameUpper.includes('UM SURABAYA') ||
    sourceNameUpper.includes('UMM') ||
    sourceNameUpper.includes('UMSIDA') ||
    sourceNameUpper.includes('UMPO') ||
    /\b(surabaya|malang|sidoarjo|gresik|jember|banyuwangi|lamongan|ponorogo|bojonegoro|tuban|kediri|blitar|madiun|mojokerto|pasuruan|probolinggo|lumajang|bondowoso|situbondo|ngawi|magetan|pacitan|trenggalek|tulungagung|nganjuk|jombang|bangkalan|sampang|pamekasan|sumenep)\b/i.test(combinedText);

  if (isJatim) {
    let c = detectedCity;
    if (!c) {
      if (/\bsurabaya\b/i.test(combinedText)) c = 'Surabaya';
      else if (/\bmalang\b/i.test(combinedText)) c = 'Malang';
      else if (/\bsidoarjo\b/i.test(combinedText)) c = 'Sidoarjo';
      else if (/\bgresik\b/i.test(combinedText)) c = 'Gresik';
      else if (/\blamongan\b/i.test(combinedText)) c = 'Lamongan';
      else if (/\bponorogo\b/i.test(combinedText)) c = 'Ponorogo';
      else if (/\bjember\b/i.test(combinedText)) c = 'Jember';
      else if (/\bbanyuwangi\b/i.test(combinedText)) c = 'Banyuwangi';
      else if (/\bbojonegoro\b/i.test(combinedText)) c = 'Bojonegoro';
      else if (/\btuban\b/i.test(combinedText)) c = 'Tuban';
      else c = 'Jawa Timur';
    }
    return {
      city: c,
      province: 'Jawa Timur',
      regionGroup: 'jatim',
      badgeText: c ? `${c}, Jatim` : 'Jawa Timur',
      isNational: false
    };
  }

  // F. LUAR JAWA (luar_jawa)
  const isLuarJawa = 
    sourceRegionCode.includes('SULSEL') ||
    sourceRegionCode.includes('SUMUT') ||
    sourceRegionCode.includes('SUMBAR') ||
    sourceRegionCode.includes('KALTIM') ||
    sourceRegionCode.includes('NTT') ||
    sourceRegionCode.includes('NTB') ||
    sourceNameUpper.includes('UNISMUH') ||
    sourceNameUpper.includes('UMSU') ||
    sourceNameUpper.includes('PALEMBANG') ||
    sourceNameUpper.includes('BENGKULU') ||
    /\b(makassar|sulsel|sulawesi|medan|sumut|padang|sumbar|palembang|sumsel|pekanbaru|riau|lampung|bengkulu|jambi|aceh|pontianak|banjarmasin|samarinda|balikpapan|kaltim|kalbar|kalsel|kalteng|manado|gorontalo|palu|kendari|ambon|maluku|mataram|lombok|ntb|kupang|ntt|jayapura|papua|sorong|bali|denpasar)\b/i.test(combinedText);

  if (isLuarJawa) {
    let c = detectedCity;
    if (!c) {
      if (/\bmakassar|sulsel\b/i.test(combinedText)) c = 'Makassar, Sulsel';
      else if (/\bmedan|sumut\b/i.test(combinedText)) c = 'Medan, Sumut';
      else if (/\bpadang|sumbar\b/i.test(combinedText)) c = 'Padang, Sumbar';
      else if (/\bpalembang\b/i.test(combinedText)) c = 'Palembang';
      else if (/\bsamarinda|kaltim\b/i.test(combinedText)) c = 'Samarinda, Kaltim';
      else if (/\bbanjarmasin|kalsel\b/i.test(combinedText)) c = 'Banjarmasin, Kalsel';
      else if (/\baceh\b/i.test(combinedText)) c = 'Aceh';
      else if (/\blampung\b/i.test(combinedText)) c = 'Lampung';
      else if (/\bntt|manggarai|kupang\b/i.test(combinedText)) c = 'Nusa Tenggara';
      else if (/\bntb|mataram|lombok\b/i.test(combinedText)) c = 'NTB';
      else if (/\bpapua|jayapura\b/i.test(combinedText)) c = 'Papua';
      else c = 'Luar Jawa';
    }
    return {
      city: c,
      province: 'Luar Jawa',
      regionGroup: 'luar_jawa',
      badgeText: c.includes(',') ? c : `Liputan ${c}`,
      isNational: false
    };
  }

  // G. NASIONAL (Default jika tidak spesifik lokal kedaerahan)
  return {
    city: detectedCity,
    province: 'Nasional',
    regionGroup: 'nasional',
    badgeText: detectedCity ? `${detectedCity}` : '',
    isNational: true
  };
}

const newsroomAcronyms = new Set([
  'PWM', 'PDM', 'PCM', 'PRM', 'AUM', 'MDMC', 'LAZISMU', 'UAD', 'UMY', 'UMS', 'UMM', 'UNISA',
  'UHAMKA', 'UNIMMA', 'UMPO', 'UMSU', 'UNISMUH', 'IPM', 'IMM', 'NA', 'TS', 'HW', 'DIKTI',
  'MAJELIS', 'LEMBAGA', 'KBIH', 'RS', 'PKU', 'DPRD', 'DPR', 'RI', 'KPU', 'BAWASLU', 'PBB',
  'MUI', 'NU', 'PBNU', 'PP', 'DIY', 'DKI', 'JATENG', 'JATIM', 'JABAR', 'SULSEL', 'SUMUT',
  'SUMBAR', 'KALTIM', 'NTB', 'NTT', 'BSI', 'OJK', 'APBD', 'APBN', 'KPK', 'POLRI', 'TNI'
]);

const newsroomStopWords = new Set([
  'dan', 'di', 'ke', 'dari', 'pada', 'untuk', 'dengan', 'atau', 'ini', 'itu', 'juga', 'akan',
  'dalam', 'atas', 'demi', 'yang', 'si', 'sang', 'terhadap', 'hingga', 'sampai', 'bagi', 'serta',
  'kepada', 'per', 'antar', 'via', 'yg', 'dgn', 'utk', 'thd', 'dr', 'pd'
]);

export function normalizeArticleTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  let title = String(rawTitle).normalize('NFKD').trim();

  const letters = title.replace(/[^a-zA-Z]/g, '');
  const isAllCaps = letters.length >= 4 && letters === letters.toUpperCase();

  if (!isAllCaps) {
    return title;
  }

  const words = title.toLowerCase().split(/\s+/);
  let isAfterPunctuation = true;

  const formattedWords = words.map((w, index) => {
    const prefixMatch = w.match(/^([^a-zA-Z0-9]*)(.*)$/);
    const prefix = prefixMatch ? prefixMatch[1] : '';
    let cleanWord = prefixMatch ? prefixMatch[2] : w;

    const suffixMatch = cleanWord.match(/^(.*?)([^a-zA-Z0-9]*)$/);
    cleanWord = suffixMatch ? suffixMatch[1] : cleanWord;
    const suffix = suffixMatch ? suffixMatch[2] : '';

    if (!cleanWord) return prefix + suffix;

    const upperClean = cleanWord.toUpperCase();
    let resultWord = '';

    if (newsroomAcronyms.has(upperClean)) {
      resultWord = upperClean;
    } else if (!isAfterPunctuation && index > 0 && newsroomStopWords.has(cleanWord)) {
      resultWord = cleanWord.toLowerCase();
    } else {
      resultWord = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
    }

    isAfterPunctuation = /[:.?!]$/.test(suffix);
    return prefix + resultWord + suffix;
  });

  return formattedWords.join(' ');
}


