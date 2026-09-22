import type { ThemeContext } from '../types';
import { escapeHtml, date, category, image } from './utils';

export function parseVideoEmbed(url: string) {
    if (!url) return { type: 'none', embedUrl: '', rawUrl: '', videoId: '' };
    const str = url.trim();

    // YouTube (watch, embed, youtu.be, shorts)
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

        if (videoId) {
            return {
                type: 'youtube',
                videoId: videoId,
                embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`,
                rawUrl: str
            };
        }
    }

    // Vimeo
    if (str.includes('vimeo.com/')) {
        const vimeoId = str.split('vimeo.com/')[1].split('?')[0].split('/')[0];
        if (vimeoId) {
            return {
                type: 'vimeo',
                videoId: vimeoId,
                embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
                rawUrl: str
            };
        }
    }

    // Direct MP4 / WebM
    if (/\.(mp4|webm|ogg)($|\?)/i.test(str)) {
        return {
            type: 'html5',
            videoId: '',
            embedUrl: str,
            rawUrl: str
        };
    }

    return {
        type: 'custom',
        videoId: '',
        embedUrl: str,
        rawUrl: str
    };
}

export function renderSingleVideo(this: any, ctx: ThemeContext): string {
    const p = ctx.data;
    if (!p) return this.render404(ctx);
    const cx = ctx as any;
    const canonical = cx.canonical || `https://suaraaisyiyah.id/${p.slug}`;
    const pubDate = p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString();
    const modDate = p.updated_at ? new Date(p.updated_at).toISOString() : pubDate;
    const pubDateShort = pubDate.split('T')[0];
    const catSlug = category(p).toLowerCase().replace(/\s+/g, '-');
    const catName = category(p);
    const ogImg = cx.ogImage || (p.featured_image ? image(p) : 'https://suaraaisyiyah.id/default-og.jpg');

    const videoUrl = p.video_url || p.videoUrl || '';
    const videoInfo = parseVideoEmbed(videoUrl);

    // JSON-LD Article
    const jsonLdArticle = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": p.title,
      "description": cx.metaDesc || '',
      "image": ogImg,
      "datePublished": pubDate,
      "dateModified": modDate,
      "url": canonical,
      "author": { "@type": "Organization", "name": "Suara 'Aisyiyah", "url": "https://suaraaisyiyah.id" },
      "publisher": {
        "@type": "Organization",
        "name": "Suara 'Aisyiyah",
        "logo": { "@type": "ImageObject", "url": "https://suaraaisyiyah.id/api/media/file/images/logo-sa.png" }
      },
      "mainEntityOfPage": { "@type": "WebPage", "@id": canonical }
    });

    // JSON-LD VideoObject for Rich Snippets
    const jsonLdVideo = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": p.title,
      "description": cx.metaDesc || p.excerpt || p.title,
      "thumbnailUrl": [ogImg],
      "uploadDate": pubDate,
      "embedUrl": videoInfo.embedUrl || canonical,
      "contentUrl": videoInfo.rawUrl || canonical,
      "publisher": {
        "@type": "Organization",
        "name": "Suara 'Aisyiyah",
        "logo": { "@type": "ImageObject", "url": "https://suaraaisyiyah.id/api/media/file/images/logo-sa.png" }
      }
    });

    // Breadcrumb JSON-LD
    const jsonLdBreadcrumb = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Beranda", "item": "https://suaraaisyiyah.id/" },
        { "@type": "ListItem", "position": 2, "name": catName, "item": `https://suaraaisyiyah.id/${catSlug}` },
        { "@type": "ListItem", "position": 3, "name": p.title }
      ]
    });

    let bodyHtml = p.body || p.content || '';

    // Tools Jurnalistik & Audio (ICON-ONLY SATU BARIS)
    const toolsJurnalistik = `
    <div class="article-toolbar">
        <button type="button" onclick="copyFullArticle()" class="article-action-btn" title="Salin Narasi" aria-label="Salin Narasi">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        </button>
        <button type="button" id="tts-btn" onclick="toggleAudio()" class="article-action-btn action-tts" title="Dengarkan Narasi" aria-label="Dengarkan Narasi">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H2c-1.105 0-2 .895-2 2v5c0 1.105.895 2 2 2h4.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM17.3 12c0-1.89-1.09-3.53-2.68-4.32v8.64c1.59-.79 2.68-2.43 2.68-4.32zM21 12c0-3.53-2.04-6.58-5-7.9v2.12c1.94 1.11 3.25 3.19 3.25 5.78s-1.31 4.67-3.25 5.78v2.12c2.96-1.32 5-4.37 5-7.9z"/></svg>
        </button>
        <button type="button" onclick="zoomText(1)" class="article-action-btn" title="Perbesar Ukuran Teks" aria-label="Perbesar Teks">
            <span style="font-weight:700; font-size:14px; font-family:sans-serif; line-height:1;">A<sup>+</sup></span>
        </button>
        <button type="button" onclick="zoomText(-1)" class="article-action-btn" title="Perkecil Ukuran Teks" aria-label="Perkecil Teks">
            <span style="font-weight:700; font-size:12px; font-family:sans-serif; line-height:1;">A<sup>-</sup></span>
        </button>
    </div>
    <script>
      let currentZoom = 0;
      let synth = window.speechSynthesis;
      let isPlaying = false;
      let utterance = null;
      const ttsIdleSvg = '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H2c-1.105 0-2 .895-2 2v5c0 1.105.895 2 2 2h4.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM17.3 12c0-1.89-1.09-3.53-2.68-4.32v8.64c1.59-.79 2.68-2.43 2.68-4.32zM21 12c0-3.53-2.04-6.58-5-7.9v2.12c1.94 1.11 3.25 3.19 3.25 5.78s-1.31 4.67-3.25 5.78v2.12c2.96-1.32 5-4.37 5-7.9z"/></svg>';
      const ttsPlayingSvg = '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
      
      function toggleAudio() {
        const btn = document.getElementById('tts-btn');
        if (!synth) {
           alert("Browser Anda tidak mendukung fitur audio.");
           return;
        }

        if (isPlaying) {
            synth.cancel();
            isPlaying = false;
            btn.innerHTML = ttsIdleSvg;
            btn.title = 'Dengarkan Narasi';
            btn.style.background = '#059669';
        } else {
            const contentDiv = document.getElementById('article-body-content');
            if(!contentDiv) return;
            
            let textToRead = contentDiv.innerText || contentDiv.textContent;
            utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.lang = 'id-ID';
            utterance.rate = 0.9;
            
            utterance.onend = function() {
                isPlaying = false;
                btn.innerHTML = ttsIdleSvg;
                btn.title = 'Dengarkan Narasi';
                btn.style.background = '#059669';
            };
            
            utterance.onerror = function() {
                isPlaying = false;
                btn.innerHTML = ttsIdleSvg;
                btn.title = 'Dengarkan Narasi';
                btn.style.background = '#059669';
            };

            synth.speak(utterance);
            isPlaying = true;
            btn.innerHTML = ttsPlayingSvg;
            btn.title = 'Hentikan Audio';
            btn.style.background = '#dc2626';
        }
      }
      
      function copyFullArticle() {
        const content = document.getElementById('article-body-content');
        if (!content) return;
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(content);
        selection.removeAllRanges();
        selection.addRange(range);
        try {
            document.execCommand('copy');
            alert('Teks narasi berhasil disalin ke clipboard!');
        } catch (err) {
            console.error('Gagal menyalin', err);
        }
        selection.removeAllRanges();
      }

      function zoomText(direction) {
        const content = document.getElementById('article-body-content');
        if (!content) return;
        currentZoom += direction;
        if (currentZoom > 3) currentZoom = 3;
        if (currentZoom < -1) currentZoom = -1;
        const baseSize = 17;
        const newSize = baseSize + (currentZoom * 3);
        content.style.fontSize = newSize + 'px';
        content.style.lineHeight = (1.8 + (currentZoom * 0.15)) + '';
      }
    </script>
    `;

    // Render Theater Player Embed
    let playerHtml = '';
    if (videoInfo.type === 'youtube' || videoInfo.type === 'vimeo' || (videoInfo.type === 'custom' && videoInfo.embedUrl.includes('embed'))) {
        playerHtml = `
        <div class="video-player-container" style="position:relative; width:100%; padding-bottom:56.25%; height:0; background:#000; border-radius:12px; overflow:hidden; box-shadow:0 12px 30px rgba(0,0,0,0.25);">
            <iframe src="${videoInfo.embedUrl}" 
                    style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen>
            </iframe>
        </div>
        `;
    } else if (videoInfo.type === 'html5') {
        playerHtml = `
        <div class="video-player-container" style="position:relative; width:100%; border-radius:12px; overflow:hidden; background:#000; box-shadow:0 12px 30px rgba(0,0,0,0.25);">
            <video src="${videoInfo.embedUrl}" controls preload="metadata" poster="${ogImg}" style="width:100%; max-height:650px; display:block;"></video>
        </div>
        `;
    } else if (p.featured_image) {
        playerHtml = `
        <div class="video-player-container" style="position:relative; width:100%; border-radius:12px; overflow:hidden; background:#000; box-shadow:0 12px 30px rgba(0,0,0,0.25);">
            <img src="${image(p)}" alt="${escapeHtml(p.title)}" style="width:100%; height:auto; display:block; opacity:0.85;">
            <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4);">
                <div style="width:70px; height:70px; background:#ef4444; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 20px rgba(239,68,68,0.6); cursor:pointer;" onclick="if('${videoUrl}') window.open('${videoUrl}', '_blank')">
                    <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
            </div>
        </div>
        `;
    }

    return this._layout(`
      <script type="application/ld+json">${jsonLdArticle}</script>
      <script type="application/ld+json">${jsonLdVideo}</script>
      <script type="application/ld+json">${jsonLdBreadcrumb}</script>
      
      <main class="container" role="main" style="max-width:960px; margin:0 auto; padding:20px 15px 60px;">
        <article class="article-page article-video" itemscope itemtype="https://schema.org/Article">
          
          <!-- Breadcrumb -->
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><a href="/"><svg class="sa-style-111" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></a></li>
              <li><a href="/${catSlug}">${catName}</a></li>
              <li aria-current="page">${escapeHtml(p.title)}</li>
            </ol>
          </nav>

          <!-- Header -->
          <header class="article-header" style="margin-bottom:20px;">
            <div class="sa-style-112" style="display:flex; align-items:center; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
              ${catName.toLowerCase() === 'video' ? `
                <a href="/video" class="cat-tag sa-style-113" style="display:inline-flex; align-items:center; gap:6px;">
                  <i class="fas fa-play-circle"></i> VIDEO
                </a>
              ` : `
                <a href="/${catSlug}" class="cat-tag sa-style-113" style="display:inline-flex; align-items:center; gap:6px;">
                  ${catName}
                </a>
                <span class="cat-tag sa-style-113" style="display:inline-flex; align-items:center; gap:6px; background:#065f46;">
                  <i class="fas fa-play-circle"></i> VIDEO
                </span>
              `}
              ${p.is_premium === 1 ? '<span class="premium-badge sa-style-114"><i class="fas fa-crown sa-style-115"></i> Premium</span>' : ''}
            </div>

            <h1 itemprop="headline" style="font-size:28px; line-height:1.3; font-weight:800; color:#0f172a; margin:0 0 15px 0;">
              ${escapeHtml(p.title)}
            </h1>

            <div class="post-meta" style="display:flex; align-items:center; gap:12px; color:#64748b; font-size:13px;">
              <span class="author-meta" itemprop="author" itemscope itemtype="https://schema.org/Person">
                <i class="fas fa-user-circle" style="color:#94a3b8; margin-right:4px;"></i>
                <span itemprop="name" style="font-weight:600; color:#334155;">${escapeHtml(p.author || "Redaksi")}</span>
              </span>
              <span class="meta-sep">&bull;</span>
              <time datetime="${pubDateShort}" itemprop="datePublished">
                <i class="far fa-calendar-alt" style="margin-right:4px;"></i>${date(p.created_at)}
              </time>
              <meta itemprop="dateModified" content="${modDate}">
              ${p.views ? `<span class="meta-sep">&bull;</span><span><i class="far fa-eye" style="margin-right:4px;"></i>${p.views} views</span>` : ''}
            </div>
          </header>

          <!-- 16:9 Video Theater Container -->
          <div style="margin-bottom:30px;">
            ${playerHtml}
          </div>

          <!-- Tools Jurnalistik (Audio & Zoom & WhatsApp) -->
          ${toolsJurnalistik}

          <!-- Narrative / Description Section -->
          <section class="article-body" itemprop="articleBody" id="article-body-container" style="font-size:17px; line-height:1.8; color:#334155; margin-top:20px;">
            <div id="article-body-content">
              ${bodyHtml || `<p style="color:#64748b; font-style:italic;">Tayangan video resmi persembahan Suara 'Aisyiyah. Saksikan selengkapnya pada pemutar di atas.</p>`}
            </div>
          </section>

          <!-- Share Block -->
          <div class="share-block">
            <h4>${cx.lang === 'en' ? 'Share this video:' : (cx.lang === 'ar' ? 'شارك هذا الفيديو:' : 'Bagikan video ini:')}</h4>
            <div class="share-buttons">
              <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(p.title + ' ' + canonical)}" target="_blank" rel="noopener" class="share-btn share-wa" aria-label="Share on WhatsApp">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                <span class="share-label-full">WhatsApp</span><span class="share-label-short">WA</span>
              </a>
              <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}" target="_blank" rel="noopener" class="share-btn share-fb" aria-label="Share on Facebook">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span class="share-label-full">Facebook</span><span class="share-label-short">FB</span>
              </a>
              <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(p.title)}&url=${encodeURIComponent(canonical)}" target="_blank" rel="noopener" class="share-btn share-tw" aria-label="Share on Twitter">
                <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span class="share-label-full">Twitter</span><span class="share-label-short">X</span>
              </a>
              <div class="share-divider"></div>
              <a href="https://news.google.com/search?q=suara%20aisyiyah" target="_blank" rel="noopener" class="share-btn share-gnews" aria-label="Follow on Google News">
                <svg width="15" height="15" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span class="share-label-full">Google News</span><span class="share-label-short">News</span>
              </a>
            </div>
          </div>

          <!-- Tags -->
          ${p.tags ? `
          <footer class="article-footer" style="margin-top:20px;">
            <div class="article-tags" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span class="tag-label" style="font-size:13px; font-weight:600; color:#64748b;">Tagar:</span>
              ${p.tags.split(',').map((t: string) => {
                const cleanT = t.trim().replace(/^#/, '');
                const tagSlug = cleanT.toLowerCase().replace(/\s+/g, '-');
                return `<a href="/tag/${encodeURIComponent(tagSlug)}" class="post-tag" style="background:#f1f5f9; color:#334155; padding:3px 10px; border-radius:15px; font-size:12px; text-decoration:none; border:1px solid #e2e8f0;">#${escapeHtml(cleanT)}</a>`;
              }).join('')}
            </div>
          </footer>` : ''}

          <!-- Comments Section -->
          ${p.allow_comments !== 0 ? `
          <div class="comments-section" style="margin-top:40px; padding-top:25px; border-top:2px solid #f1f5f9;">
            <div id="comments-loading" style="text-align:center; padding:15px; color:#64748b;">Memuat sistem komentar...</div>
            
            <div id="comments-locked-ui" style="display:none; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; padding:20px; text-align:center;">
              <h4 style="margin:0 0 8px 0; color:#1e293b;">Ikut Berdiskusi</h4>
              <p style="color:#64748b; font-size:14px; margin-bottom:12px;">Anda harus memiliki akun dan login terlebih dahulu untuk dapat meninggalkan komentar.</p>
              <a href="/admin/login" style="display:inline-block; background:#0284c7; color:white; padding:8px 18px; border-radius:6px; font-size:13px; font-weight:600; text-decoration:none;">Login Sekarang</a>
            </div>

            <div id="comments-form-ui" style="display:none;">
                <h3 style="font-size:18px; font-weight:700; color:#1e293b; margin-bottom:10px;">Tinggalkan Komentar</h3>
                <div style="font-size:13px; color:#64748b; margin-bottom:15px;">
                   <span>Masuk sebagai <strong id="comment-user-name" style="color:#0f172a;">Pengguna</strong></span>
                </div>
                <form id="comment-form" class="modern-comment-form">
                  <input type="hidden" id="comment-post-id" value="${p.id}">
                  <div style="margin-bottom:12px;">
                    <textarea id="comment-content" required rows="3" placeholder="Tulis tanggapan Anda mengenai video ini..." style="width:100%; padding:12px; border-radius:8px; border:1px solid #cbd5e1; font-size:14px; box-sizing:border-box;"></textarea>
                  </div>
                  <button type="submit" id="comment-submit-btn" style="background:#059669; color:white; border:none; padding:10px 20px; border-radius:6px; font-weight:600; cursor:pointer; font-size:14px;">Kirim Komentar</button>
                  <div id="comment-status" style="margin-top:10px; font-size:13px;"></div>
                </form>
            </div>

            <div style="margin-top:30px;">
                <h4 style="font-size:16px; font-weight:700; color:#1e293b; margin-bottom:15px; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">Komentar Pembaca</h4>
                <div id="comments-display-list">
                    <div style="color:#94a3b8; font-size:13px;">Memuat komentar...</div>
                </div>
            </div>
          </div>

          <script>
          document.addEventListener('DOMContentLoaded', () => {
              const getCookieToken = () => {
                  const match = document.cookie.match(/(?:^|;\s*)labmu_token=([^;]+)/);
                  if (match) return decodeURIComponent(match[1]);
                  try {
                      const local = localStorage.getItem('labmu_token');
                      if (local) {
                          document.cookie = 'labmu_token=' + encodeURIComponent(local) + '; Path=/; Max-Age=2592000; SameSite=Lax';
                          localStorage.removeItem('labmu_token');
                          return local;
                      }
                  } catch(e) {}
                  return '';
              };
              const token = getCookieToken();
              try { localStorage.removeItem('labmu_token'); } catch(e){}
              let user = null;
              if (token) {
                  try {
                      const payload = JSON.parse(atob(token));
                      if (payload && payload.id) user = payload;
                  } catch(e) {}
              }

              document.getElementById('comments-loading').style.display = 'none';

              if (user) {
                  document.getElementById('comments-form-ui').style.display = 'block';
                  document.getElementById('comment-user-name').innerText = user.n || user.username || 'Pengguna';
                  
                  document.getElementById('comment-form').addEventListener('submit', async (e) => {
                      e.preventDefault();
                      const btn = document.getElementById('comment-submit-btn');
                      const status = document.getElementById('comment-status');
                      const postId = document.getElementById('comment-post-id').value;
                      const content = document.getElementById('comment-content').value;
                      
                      btn.disabled = true;
                      btn.innerText = 'Mengirim...';
                      status.innerText = '';
                      
                      try {
                          const res = await fetch('/api/comments', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                              body: JSON.stringify({ post_id: parseInt(postId), user_id: parseInt(user.id), content: content })
                          });
                          const data = await res.json();
                          if (res.ok) {
                              status.style.color = '#059669';
                              status.innerText = 'Komentar berhasil dikirim dan menunggu verifikasi.';
                              document.getElementById('comment-content').value = '';
                          } else {
                              status.style.color = '#dc2626';
                              status.innerText = data.error || 'Gagal mengirim komentar.';
                          }
                      } catch(err) {
                          status.style.color = '#dc2626';
                          status.innerText = 'Terjadi kesalahan koneksi.';
                      } finally {
                          btn.disabled = false;
                          btn.innerText = 'Kirim Komentar';
                      }
                  });
              } else {
                  document.getElementById('comments-locked-ui').style.display = 'block';
              }

              const postId = document.getElementById('comment-post-id') ? document.getElementById('comment-post-id').value : null;
              if (postId) {
                  fetch('/api/comments/' + postId)
                      .then(res => res.json())
                      .then(data => {
                          const listEl = document.getElementById('comments-display-list');
                          if (!data || data.length === 0) {
                              listEl.innerHTML = '<p style="color:#94a3b8; font-size:13px; font-style:italic;">Belum ada komentar. Jadilah yang pertama berdiskusi!</p>';
                              return;
                          }
                          let html = '';
                          data.forEach(c => {
                              const date = new Date(c.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                              const avatar = c.user_avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(c.user_name) + '&background=0f172a&color=fff';
                              html += '<div style="display:flex; gap:12px; margin-bottom:15px; padding-bottom:15px; border-bottom:1px solid #f1f5f9;">' +
                                  '<img src="' + avatar + '" alt="' + c.user_name + '" style="width:36px; height:36px; border-radius:50%; object-fit:cover;">' +
                                  '<div>' +
                                      '<div style="display:flex; align-items:center; gap:8px;">' +
                                          '<h5 style="margin:0; font-size:14px; font-weight:700; color:#1e293b;">' + c.user_name + '</h5>' +
                                          (c.user_role === 'admin' ? '<span style="background:#0284c7; color:white; font-size:10px; padding:1px 6px; border-radius:4px;">Admin</span>' : '') +
                                      '</div>' +
                                      '<div style="font-size:11px; color:#94a3b8; margin-top:2px;">' + date + '</div>' +
                                      '<p style="margin:6px 0 0 0; font-size:13px; color:#334155; line-height:1.5;">' + c.content + '</p>' +
                                  '</div>' +
                              '</div>';
                          });
                          listEl.innerHTML = html;
                      })
                      .catch(() => {
                          document.getElementById('comments-display-list').innerHTML = '<p style="color:#dc2626; font-size:13px;">Gagal memuat komentar.</p>';
                      });
              }
          });
          </script>
          ` : ''}

          <!-- Related Posts -->
          ${cx.relatedPosts && cx.relatedPosts.length ? `
          <div class="related-posts" style="margin-top:40px; padding-top:25px; border-top:1px solid #e2e8f0;">
            <h3 style="font-size:18px; font-weight:700; color:#1e293b; margin-bottom:18px;">Video & Konten Terkait di ${catName}</h3>
            <div class="card-grid related-grid">
              ${cx.relatedPosts.map((rp:any, i:number) => `
                <div class="grid-post">
                  <a href="/${escapeHtml(rp.slug)}" class="post-img-wrap">
                    <img src="${image(rp, i)}" alt="${escapeHtml(rp.title)}" loading="lazy">
                  </a>
                  <div class="grid-post-content">
                    <h4><a href="/${escapeHtml(rp.slug)}">${escapeHtml(rp.title)}</a></h4>
                    <div class="post-meta"><span>${date(rp.created_at)}</span></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

        </article>
      </main>
    `, p.title, ctx, 'post');
}
