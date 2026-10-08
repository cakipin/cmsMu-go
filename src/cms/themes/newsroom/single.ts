import type { ThemeContext } from '../types';
import { escapeHtml, getPostImage, getPostCategory, formatDateIndo, cleanAndFormatArticleContent, extractSourceInfo } from './utils';

export function renderSingle(this: any, ctx: ThemeContext) {
  const p = ctx.data;
  if (!p) return this.render404(ctx);

  const cx = ctx as any;
  const siteUrl = ctx.site?.url || 'http://localhost:4321';
  const canonical = cx.canonical || `${siteUrl}/${p.slug}`;
  const pubDate = p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString();
  const modDate = p.updated_at ? new Date(p.updated_at).toISOString() : pubDate;
  const pubDateShort = pubDate.split('T')[0];
  const catName = getPostCategory(p);
  const catSlug = catName.toLowerCase().replace(/\s+/g, '-');
  const heroImage = getPostImage(p);
  const formattedDate = formatDateIndo(p.created_at);
  const siteTitle = escapeHtml(ctx.site?.site_title || ctx.site?.title || "Newsroom");

  // Ekstraksi Informasi Sumber Berita Asli (Media Asli & Favicon Asli dari Real DB)
  const sourceInfo = extractSourceInfo(p, siteTitle, ctx.sources || []);

  // 1. JSON-LD Article Schema
  const jsonLdArticle = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": p.title,
    "description": cx.metaDesc || '',
    "image": heroImage,
    "datePublished": pubDate,
    "dateModified": modDate,
    "url": canonical,
    "author": { 
      "@type": "Person", 
      "name": p.author || "Redaksi Newsroom" 
    },
    "publisher": {
      "@type": "Organization",
      "name": siteTitle,
      "logo": { 
        "@type": "ImageObject", 
        "url": `${siteUrl}/favicon.svg` 
      }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonical }
  });

  // 2. JSON-LD Breadcrumb Schema (Kategori Bersih tanpa /kategori/)
  const jsonLdBreadcrumb = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Beranda", "item": `${siteUrl}/` },
      { "@type": "ListItem", "position": 2, "name": catName, "item": `${siteUrl}/${catSlug}` },
      { "@type": "ListItem", "position": 3, "name": p.title }
    ]
  });

  // 3. Format & Bersihkan Konten Artikel
  const formatted = cleanAndFormatArticleContent(p.body || p.content || '', !!p.featured_image);
  let bodyHtml = formatted.body;
  let captionText = formatted.captionText || p.caption || '';

  // 4. Auto-Link Kategori di dalam Teks (Kategori Bersih tanpa /kategori/)
  const categoriesToLink = [
    { regex: / (Berita Daerah) /gi, url: '/berita-daerah' },
    { regex: / (Warta Persyarikatan) /gi, url: '/warta-persyarikatan' },
    { regex: / (Opini) /gi, url: '/opini' },
    { regex: / (Pendidikan) /gi, url: '/pendidikan' },
    { regex: / (Ekonomi) /gi, url: '/ekonomi' },
    { regex: / (Kajian) /gi, url: '/kajian' }
  ];

  let totalAutoLinks = 0;
  let autoLinkParagraphs = bodyHtml.split('</p>');
  for (let i = 0; i < autoLinkParagraphs.length; i++) {
    if (totalAutoLinks >= 5) break;
    let pText = autoLinkParagraphs[i];
    if (pText.includes('<a ') || pText.includes('<img')) continue;

    for (let cat of categoriesToLink) {
      if (cat.regex.test(pText)) {
        autoLinkParagraphs[i] = pText.replace(cat.regex, function(match) {
          return `<a href="${cat.url}" style="color:var(--accent-primary);font-weight:600;text-decoration:underline;">${match}</a>`;
        });
        totalAutoLinks++;
        break;
      }
    }
  }
  bodyHtml = autoLinkParagraphs.join('</p>');

  // 5. Baca Juga (Related Posts di Tengah Artikel)
  if (cx.relatedPosts && cx.relatedPosts.length > 0) {
    const pList = bodyHtml.split('</p>');
    if (pList.length > 3) {
      const middle = Math.floor(pList.length / 2);
      let bacaJugaHtml = `
      <div class="nr-baca-juga">
        <h4><i class="fas fa-bookmark"></i> BACA JUGA</h4>
        <ul>
          ${cx.relatedPosts.slice(0, 3).map((rp: any) => `
            <li>
              <a href="/${escapeHtml(rp.slug)}">
                <span style="color:var(--accent-primary);">&bull;</span>
                <span>${escapeHtml(rp.title)}</span>
              </a>
            </li>
          `).join('')}
        </ul>
      </div>`;
      pList.splice(middle, 0, bacaJugaHtml);
      bodyHtml = pList.join('</p>');
    }
  }

  // 6. Journalistic Toolbar: Favicon Sumber Berita Asli + Nama Media di kiri, Icon-only copy di kanan
  const toolbarHtml = `
  <div class="nr-toolbar">
    <!-- Sisi Kiri: Favicon Sumber Berita Asli & Nama Media Asli (Mengarahkan ke Halaman Arsip Sumber) -->
    <div class="nr-toolbar-brand">
      <a href="${escapeHtml(sourceInfo.internalUrl || sourceInfo.url)}" class="nr-source-link" title="Lihat seluruh liputan dari: ${escapeHtml(sourceInfo.name)}">
        <img src="${escapeHtml(sourceInfo.favicon)}" alt="${escapeHtml(sourceInfo.name)}" class="nr-toolbar-favicon" onerror="this.src='/favicon.svg'">
        <span class="nr-toolbar-sitename">${escapeHtml(sourceInfo.name)}</span>
      </a>
    </div>

    <!-- Sisi Kanan: Action Buttons (Icon-Only Copy, TTS, Zoom A+/A-) -->
    <div class="nr-toolbar-actions">
      <button type="button" onclick="copyFullArticle()" class="nr-action-btn nr-action-icon-only" title="Salin Seluruh Artikel" aria-label="Salin Artikel">
        <i class="far fa-copy"></i>
      </button>
      <button type="button" id="tts-btn" onclick="toggleAudio()" class="nr-action-btn nr-action-tts" title="Dengarkan Artikel" aria-label="Dengarkan Artikel">
        <i class="fas fa-volume-up"></i> <span>Dengarkan</span>
      </button>
      <button type="button" onclick="zoomText(1)" class="nr-action-btn" title="Perbesar Ukuran Teks" aria-label="Perbesar Teks">
        <span>A<sup>+</sup></span>
      </button>
      <button type="button" onclick="zoomText(-1)" class="nr-action-btn" title="Perkecil Ukuran Teks" aria-label="Perkecil Teks">
        <span>A<sup>-</sup></span>
      </button>
    </div>
  </div>
  <script>
    let currentZoom = 0;
    let synth = window.speechSynthesis;
    let isPlaying = false;
    let utterance = null;

    function toggleAudio() {
      const btn = document.getElementById('tts-btn');
      if (!synth) {
        alert("Browser Anda tidak mendukung fitur pemutar suara.");
        return;
      }
      if (isPlaying) {
        synth.cancel();
        isPlaying = false;
        btn.innerHTML = '<i class="fas fa-volume-up"></i> <span>Dengarkan</span>';
        btn.style.background = '#059669';
      } else {
        const contentDiv = document.getElementById('nr-article-body-content');
        if (!contentDiv) return;
        let textToRead = contentDiv.innerText || contentDiv.textContent;
        utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'id-ID';
        utterance.rate = 0.95;

        utterance.onend = function() {
          isPlaying = false;
          btn.innerHTML = '<i class="fas fa-volume-up"></i> <span>Dengarkan</span>';
          btn.style.background = '#059669';
        };
        utterance.onerror = function() {
          isPlaying = false;
          btn.innerHTML = '<i class="fas fa-volume-up"></i> <span>Dengarkan</span>';
          btn.style.background = '#059669';
        };

        synth.speak(utterance);
        isPlaying = true;
        btn.innerHTML = '<i class="fas fa-pause"></i> <span>Hentikan</span>';
        btn.style.background = '#dc2626';
      }
    }

    function copyFullArticle() {
      const content = document.getElementById('nr-article-body-content');
      if (!content) return;
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(content);
      selection.removeAllRanges();
      selection.addRange(range);
      try {
        document.execCommand('copy');
        alert('Artikel berhasil disalin ke clipboard!');
      } catch (err) {
        console.error('Gagal menyalin', err);
      }
      selection.removeAllRanges();
    }

    function zoomText(direction) {
      const content = document.getElementById('nr-article-body-content');
      if (!content) return;
      currentZoom += direction;
      if (currentZoom > 3) currentZoom = 3;
      if (currentZoom < -1) currentZoom = -1;
      const baseSize = 18;
      const newSize = baseSize + (currentZoom * 2.5);
      content.style.fontSize = newSize + 'px';
      content.style.lineHeight = (1.9 + (currentZoom * 0.15)) + '';
    }

    // Atribusi Hak Cipta saat seleksi teks disalin
    document.addEventListener('copy', function(event) {
      var selection = window.getSelection();
      if (!selection || !selection.toString().length) return;
      var url = window.location.href;
      var sourceText = '\\n\\nSumber Berita: ' + document.title + ' (' + url + ')';
      var plainText = selection.toString() + sourceText;
      if (event.clipboardData) {
        event.preventDefault();
        event.clipboardData.setData('text/plain', plainText);
      }
    });
  </script>
  `;

  // Attribution Box jika disadur dari sumber lain / agregator
  const isAggregated = sourceInfo.name !== siteTitle;
  const attributionHtml = isAggregated ? `
  <div class="nr-attribution-box">
    <p><strong>Pemberitahuan Redaksi:</strong> Artikel ini dihimpun melalui jejaring informasi sindikasi media.</p>
    <p style="margin-top:0.35rem; color:var(--text-secondary);">
      Sumber asli: <strong>${escapeHtml(sourceInfo.name)}</strong> 
      ${sourceInfo.url && sourceInfo.url !== '/' && sourceInfo.url !== '#' ? `&bull; <a href="${escapeHtml(sourceInfo.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-primary); text-decoration:underline;">Kunjungi Tautan Asli &rarr;</a>` : ''}
    </p>
  </div>
  ` : '';

  const content = `
  <script type="application/ld+json">${jsonLdArticle}</script>
  <script type="application/ld+json">${jsonLdBreadcrumb}</script>

  <!-- 1. Hestia Pro Full-Width Hero Header (Link Kategori Bersih) -->
  <header class="nr-hero-header" style="background-image: url('${heroImage}');">
    <div class="nr-hero-inner">
      <a href="/${catSlug}" class="nr-hero-category">
        ${escapeHtml(catName)}
      </a>
      <h1 class="nr-hero-title">${escapeHtml(p.title)}</h1>
      <div class="nr-hero-byline">
        <span>Published by <strong>${escapeHtml(p.author || 'Redaksi Newsroom')}</strong></span>
        <span>on</span>
        <time datetime="${pubDateShort}">${formattedDate}</time>
      </div>
    </div>
  </header>

  <!-- 2. Hestia Pro Main Raised Container (Overlapping Hero) -->
  <main class="nr-main-raised" role="main">
    <!-- Breadcrumb (Link Kategori Bersih tanpa /kategori/) -->
    <nav class="nr-breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><a href="/"><i class="fas fa-home"></i> Beranda</a></li>
        <li><a href="/${catSlug}">${escapeHtml(catName)}</a></li>
        <li aria-current="page">${escapeHtml(p.title)}</li>
      </ol>
    </nav>

    <!-- Journalistic Toolbar (Brand Favicon Sumber Asli di kiri, Icon-only copy di kanan) -->
    ${toolbarHtml}

    <!-- Article Content -->
    <article class="nr-article-body" id="nr-article-body-content">
      ${captionText ? `
        <div style="font-size:0.875rem; color:var(--text-muted); font-style:italic; margin-bottom:1.5rem; padding-bottom:0.75rem; border-bottom:1px solid var(--border-subtle);">
          <i class="fas fa-camera"></i> Keterangan Foto: ${escapeHtml(captionText)}
        </div>
      ` : ''}

      ${bodyHtml}

      ${attributionHtml}
    </article>

    <!-- Share Block -->
    <div class="nr-share-block">
      <div class="nr-share-title">Bagikan Berita Ini:</div>
      <div class="nr-share-buttons">
        <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(p.title + ' ' + canonical)}" target="_blank" rel="noopener" class="nr-share-btn nr-share-wa">
          <i class="fab fa-whatsapp"></i> WhatsApp
        </a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}" target="_blank" rel="noopener" class="nr-share-btn nr-share-fb">
          <i class="fab fa-facebook-f"></i> Facebook
        </a>
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(p.title)}&url=${encodeURIComponent(canonical)}" target="_blank" rel="noopener" class="nr-share-btn nr-share-tw">
          <i class="fab fa-x-twitter"></i> Twitter / X
        </a>
        <a href="https://news.google.com/search?q=${encodeURIComponent(p.title)}" target="_blank" rel="noopener" class="nr-share-btn nr-share-gnews">
          <i class="fab fa-google" style="color:#ea4335;"></i> Google News
        </a>
      </div>
    </div>

    <!-- Tags Footer -->
    ${p.tags ? `
    <div class="nr-article-tags">
      <span class="nr-tag-label"><i class="fas fa-tags"></i> Topik Terkait:</span>
      ${p.tags.split(',').map((t: string) => {
        const cleanT = t.trim().replace(/^#/, '');
        const tagSlug = cleanT.toLowerCase().replace(/\s+/g, '-');
        return `<a href="/tag/${encodeURIComponent(tagSlug)}" class="nr-tag-item">#${escapeHtml(cleanT)}</a>`;
      }).join('')}
    </div>
    ` : ''}

    <!-- Comments Section -->
    ${p.allow_comments !== 0 ? `
    <section class="nr-comments-section">
      <h3 class="nr-comments-title"><i class="far fa-comments"></i> Komentar & Diskusi Pembaca</h3>

      <div class="nr-comment-form">
        <form id="comment-form">
          <input type="hidden" id="comment-post-id" value="${p.id}">
          <div style="margin-bottom:0.75rem;">
            <label style="display:block; font-size:0.875rem; font-weight:700; margin-bottom:0.35rem;">Tulis Komentar Anda:</label>
            <textarea id="comment-content" required rows="4" placeholder="Sampaikan tanggapan Anda dengan santun dan beretika..."></textarea>
          </div>
          <button type="submit" id="comment-submit-btn" class="nr-comment-submit-btn">Kirim Tanggapan</button>
          <div id="comment-status" style="margin-top:0.5rem; font-size:0.875rem;"></div>
        </form>
      </div>

      <div id="comments-display-list">
        <div style="color:var(--text-muted); font-size:0.875rem;"><i class="fas fa-spinner fa-spin"></i> Memuat tanggapan pembaca...</div>
      </div>

      <script>
      document.addEventListener('DOMContentLoaded', () => {
        const postId = document.getElementById('comment-post-id')?.value;
        if (!postId) return;

        // Fetch comments list
        fetch('/api/comments/' + postId)
          .then(res => res.json())
          .then(data => {
            const listEl = document.getElementById('comments-display-list');
            if (!data || data.error || !Array.isArray(data) || data.length === 0) {
              listEl.innerHTML = '<p style="color:var(--text-muted); font-size:0.875rem; font-style:italic;">Belum ada komentar pembaca pada artikel ini. Jadilah yang pertama berdiskusi!</p>';
              return;
            }
            let html = '';
            data.forEach(c => {
              const d = new Date(c.created_at).toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });
              const avatar = c.user_avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(c.user_name || 'Pembaca') + '&background=0284c7&color=fff';
              html += \`
                <div class="nr-comment-item">
                  <img src="\${avatar}" alt="\${c.user_name}" class="nr-comment-avatar">
                  <div>
                    <div class="nr-comment-meta">
                      <span class="nr-comment-author">\${c.user_name || 'Pembaca'}</span>
                      <span class="nr-comment-date">&bull; \${d}</span>
                    </div>
                    <p class="nr-comment-text">\${c.content}</p>
                  </div>
                </div>
              \`;
            });
            listEl.innerHTML = html;
          })
          .catch(() => {
            document.getElementById('comments-display-list').innerHTML = '<p style="color:var(--text-muted); font-size:0.875rem;">Gagal memuat komentar.</p>';
          });

        // Submit comment
        document.getElementById('comment-form')?.addEventListener('submit', async (e) => {
          e.preventDefault();
          const btn = document.getElementById('comment-submit-btn');
          const status = document.getElementById('comment-status');
          const content = document.getElementById('comment-content').value;

          btn.disabled = true;
          btn.innerText = 'Mengirim...';
          status.innerText = '';

          try {
            const res = await fetch('/api/comments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                post_id: parseInt(postId),
                content: content
              })
            });
            const data = await res.json();
            if (res.ok) {
              status.style.color = '#059669';
              status.innerText = 'Komentar Anda berhasil dikirim dan menunggu moderasi redaksi.';
              document.getElementById('comment-content').value = '';
            } else {
              status.style.color = '#dc2626';
              status.innerText = data.error || 'Silakan masuk / login untuk mengirim komentar.';
            }
          } catch(err) {
            status.style.color = '#dc2626';
            status.innerText = 'Terjadi kendala saat mengirim komentar.';
          } finally {
            btn.disabled = false;
            btn.innerText = 'Kirim Tanggapan';
          }
        });
      });
      </script>
    </section>
    ` : ''}

    <!-- Related Posts -->
    ${cx.relatedPosts && cx.relatedPosts.length ? `
    <section class="nr-related-section">
      <h3 style="font-size:1.35rem; font-weight:800; color:var(--text-primary);">
        <i class="fas fa-newspaper"></i> Liputan Terkait Lainnya
      </h3>
      <div class="nr-related-grid">
        ${cx.relatedPosts.map((rp: any) => `
          <div class="nr-card-standard">
            <a href="/${escapeHtml(rp.slug)}" class="nr-card-thumb">
              <img src="${getPostImage(rp)}" alt="${escapeHtml(rp.title)}" loading="lazy">
            </a>
            <div class="nr-card-body">
              <span class="nr-category-badge" style="align-self:flex-start;">${escapeHtml(getPostCategory(rp))}</span>
              <h4 class="nr-card-title">
                <a href="/${escapeHtml(rp.slug)}">${escapeHtml(rp.title)}</a>
              </h4>
              <div class="nr-meta">
                <span>${formatDateIndo(rp.created_at)}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}
  </main>
  `;

  return this._layout(content, p.title, ctx, 'post');
}
