/**
 * Logika Proses Bisnis (Probis) Agregator & Sindikasi Berita
 * Menangani pembersihan teks HTML (Zero-Ad, Readability), sanitasi markup, dan normalisasi feed.
 */

export function sanitizeArticleContent(rawHtml: string): string {
  if (!rawHtml) return '';
  let clean = rawHtml;

  // 1. Hapus script, style, iframe, ins (adsense), noscript, form, button
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  clean = clean.replace(/<ins\b[^<]*(?:(?!<\/ins>)<[^<]*)*<\/ins>/gi, '');
  clean = clean.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');

  // 2. Hapus blok iklan umum / elemen sponsor / widget
  clean = clean.replace(/<div[^>]*class=["'][^"']*(?:ads|ad-banner|advertisement|wp-block-embed|sharedaddy|jp-relatedposts)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');

  // 3. Bersihkan seluruh link tautan: ubah <a ...>teks</a> menjadi teks biasa (hilangkan hyperlink)
  clean = clean.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1');

  // 4. Bersihkan komentar HTML
  clean = clean.replace(/<!--[\s\S]*?-->/g, '');

  // 5. Bersihkan footer promosi WordPress feed RSS
  clean = clean.replace(/<p[^>]*>\s*The post\s+[\s\S]*?\s+appeared first on\s+[\s\S]*?<\/p>/gi, '');
  clean = clean.replace(/The post\s+[\s\S]*?\s+appeared first on\s+[^\n.<]+/gi, '');

  // 6. Hapus kontainer caption/div kosong yang sering terbawa dari WordPress
  clean = clean.replace(/<div[^>]*class=["'][^"']*wp-caption[^"']*["'][^>]*>\s*<\/div>/gi, '');
  clean = clean.replace(/<div[^>]*>\s*<\/div>/gi, '');

  // 7. Bersihkan tag <br> yang berdiri sendiri di antara tag </p> dan <p>
  clean = clean.replace(/<\/p>\s*(?:<br\s*\/?>\s*)+<p[^>]*>/gi, '</p><p>');

  // 8. Bersihkan atribut inline seperti dir="ltr"
  clean = clean.replace(/<p\s+dir=["'][a-z]+["']>/gi, '<p>');

  // 9. Bersihkan tag <p> kosong atau hanya berisi spasi / &nbsp; / <br>
  clean = clean.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi, '');

  // 10. Normalisasi spasi antar paragraf
  clean = clean.replace(/(?:<br\s*\/?>\s*){2,}/gi, '<br>');

  return clean.trim();
}

export function generateSeoTags(title: string): string {
  const stopwords = new Set([
    'dan', 'di', 'ke', 'dari', 'yang', 'untuk', 'dengan', 'pada', 'adalah', 'ini', 'itu', 
    'atau', 'dalam', 'akan', 'sebagai', 'tidak', 'juga', 'oleh', 'karena', 'saat', 'sudah', 
    'telah', 'bisa', 'menjadi', 'lagi', 'serta', 'bagi', 'tentang', 'atas', 'bahwa', 'bila',
    'jika', 'maka', 'namun', 'tetapi', 'saja', 'ada', 'hingga', 'kepada', 'kami', 'kita',
    'lebih', 'paling', 'baru', 'hari', 'tahun', 'banyak', 'beberapa', 'suatu', 'sebuah'
  ]);
  const cleanTitle = (title || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const words = cleanTitle.split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));
  return [...new Set(words)].slice(0, 6).join(', ');
}

export function getYoutubeThumbnail(url?: string): string {
  if (!url) return '';
  const str = url.trim();
  let videoId = '';
  if (str.includes('youtu.be/')) {
    videoId = str.split('youtu.be/')[1]?.split('?')[0]?.split('/')[0] || '';
  } else if (str.includes('shorts/')) {
    videoId = str.split('shorts/')[1]?.split('?')[0]?.split('/')[0] || '';
  } else if (str.includes('embed/')) {
    videoId = str.split('embed/')[1]?.split('?')[0]?.split('/')[0] || '';
  } else if (str.includes('v=')) {
    const match = str.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) videoId = match[1];
  }
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return '';
}
