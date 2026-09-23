import type { ThemeContext } from '../types';
import { escapeHtml, date, category, image, cleanAndFormatArticleContent } from './utils';
import { renderSingleVideo } from './single-video';

export function renderSingle(this: any, ctx: ThemeContext) {
    const p = ctx.data;
    if (!p) return this.render404(ctx);

    if (p.type === 'video' || (p.video_url && String(p.video_url).trim() !== '')) {
        return renderSingleVideo.call(this, ctx);
    }
    const cx = ctx as any;
    const canonical = cx.canonical || `https://suaraaisyiyah.id/${p.slug}`;
    const pubDate = p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString();
    const modDate = p.updated_at ? new Date(p.updated_at).toISOString() : pubDate;
    const pubDateShort = pubDate.split('T')[0];
    const catSlug = category(p).toLowerCase().replace(/\s+/g, '-');
    const catName = category(p);
    const ogImg = cx.ogImage || (p.featured_image ? image(p) : 'https://suaraaisyiyah.id/default-og.jpg');
    const langPrefix = cx.lang && cx.lang !== 'id' ? `/${cx.lang}` : '';

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



    // User Access Logic
    const user = cx.user;
    const roleLower = user ? (user.role || '').toLowerCase() : '';
    const isInternal = user && (roleLower.includes('admin') || ['editor', 'author', 'penulis'].includes(roleLower));
    const isPaidSubscriber = user && ['premium', 'berbayar', 'member'].includes(roleLower);
    const isFreeSubscriber = user && ['subscriber', 'gratis'].includes(roleLower);
    const hasPremiumAccess = isInternal || isPaidSubscriber;
    const hasBasicAccess = !!user;


    // Paywall Logic

    // Bersihkan shortcode [caption], hapus duplikasi gambar cover, dan format paragraf otomatis (Autop)
    const formatted = cleanAndFormatArticleContent(p.body || p.content || '', !!p.featured_image);
    let bodyHtml = formatted.body;
    let captionText = formatted.captionText;

    // Fallback ekstraksi caption text jika belum didapatkan dari shortcode
    if (!captionText) {
        const captionMatch = bodyHtml.match(/<p[^>]*class="[^"]*wp-caption-text[^"]*"[^>]*>(.*?)<\/p>/i) || bodyHtml.match(/<figcaption[^>]*>(.*?)<\/figcaption>/i);
        if (captionMatch) {
            captionText = captionMatch[1].replace(/<[^>]+>/g, '').trim();
            bodyHtml = bodyHtml.replace(captionMatch[0], '');
        }
    } else {
        bodyHtml = bodyHtml.replace(/^\s*<p[^>]*class="[^"]*wp-caption-text[^"]*"[^>]*>[\s\S]*?<\/p>\s*/i, '');
    }

    // Pembersihan ekstra tag <br> mandiri, tag <p> kosong, dan tag rusak di awal teks
    bodyHtml = bodyHtml.replace(/(<\/(?:p|h[1-6]|div|blockquote|figure|ul|ol|table|section|article)>)\s*(?:<br\s*\/?>\s*)+(<(?:p|h[1-6]|div|blockquote|figure|ul|ol|table|section|article)[^>]*>)/gi, '$1\n$2');
    bodyHtml = bodyHtml.replace(/(<\/(?:p|h[1-6]|div|blockquote|figure|ul|ol|table|section|article)>)\s*(?:<br\s*\/?>\s*)+/gi, '$1\n');
    bodyHtml = bodyHtml.replace(/(?:<br\s*\/?>\s*)+(<(?:p|h[1-6]|div|blockquote|figure|ul|ol|table|section|article)[^>]*>)/gi, '\n$1');
    bodyHtml = bodyHtml.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi, '');
    bodyHtml = bodyHtml.replace(/^\s*(?:<\/div>|<\/p>|<p[^>]*>\s*<\/div>|<p[^>]*>\s*<\/p>|<br\s*\/?>)+/gi, '');
    bodyHtml = bodyHtml.replace(/^\s*(?:<\/div>|<\/p>|<p[^>]*>\s*<\/div>|<p[^>]*>\s*<\/p>|<br\s*\/?>)+/gi, '');
    
    // AUTO-LINK KATEGORI DI DALAM TEKS (max 5, 1 per paragraf)
    const categoriesToLink = [
        { regex: /(Hikmah)/gi, url: '/hikmah' },
        { regex: /(Keluarga Sakinah)/gi, url: '/keluarga-sakinah' },
        { regex: /(Kalam)/gi, url: '/kalam' },
        { regex: /(Wawasan)/gi, url: '/wawasan' },
        { regex: /(Gaya Hidup)/gi, url: '/gaya-hidup' },
        { regex: /(Perempuan)/gi, url: '/perempuan' },
        { regex: /(Inspirasi)/gi, url: '/inspirasi' },
        { regex: /(Muda)/gi, url: '/muda' },
        { regex: /(Sains dan Tekno)/gi, url: '/sains-dan-tekno' },
        { regex: /(Sosio Tekno)/gi, url: '/sains-dan-tekno' }
    ];
    
    let totalAutoLinks = 0;
    let autoLinkParagraphs = bodyHtml.split('</p>');
    
    for (let i = 0; i < autoLinkParagraphs.length; i++) {
        if (totalAutoLinks >= 5) break;
        let pText = autoLinkParagraphs[i];
        
        // Skip paragraphs that contain links or images to avoid replacing inside HTML attributes
        if (pText.includes('<a ') || pText.includes('<img')) continue;

        for (let cat of categoriesToLink) {
            if (cat.regex.test(pText)) {
                // Replace only the first occurrence in this paragraph
                autoLinkParagraphs[i] = pText.replace(cat.regex, function(match) {
                    return `<a href="${cat.url}" class="sa-style-91">${match}</a>`;
                });
                totalAutoLinks++;
                break; // Max 1 link per paragraph
            }
        }
    }
    bodyHtml = autoLinkParagraphs.join('</p>');

    // INLINE "BACA JUGA" SETIAP ~200 KATA DI AKHIR PARAGRAF TERDEKAT
    const relatedList = (ctx.relatedPosts && Array.isArray(ctx.relatedPosts)) ? ctx.relatedPosts : [];
    if (relatedList.length > 0) {
        let wordAccumulator = 0;
        let relatedIndex = 0;
        const maxInline = Math.min(3, relatedList.length);

        // Cari setiap paragraf <p>...</p> dan sisipkan inline callout setelah mencapai >= 200 kata
        bodyHtml = bodyHtml.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (fullMatch, innerText) => {
            if (relatedIndex >= maxInline) return fullMatch;
            if (fullMatch.includes('<iframe') || fullMatch.includes('<figure')) return fullMatch;

            const plain = innerText.replace(/<[^>]+>/g, ' ').trim();
            const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
            wordAccumulator += words;

            if (wordAccumulator >= 200) {
                const rp = relatedList[relatedIndex];
                wordAccumulator = 0;
                relatedIndex++;
                const inlineCallout = `<p class="inline-baca-juga" style="margin: 22px 0; padding: 12px 18px; background: #f8fafc; border-left: 4px solid #047857; border-radius: 4px; font-size: 15px; line-height: 1.6;"><strong style="color: #047857;">Baca Juga: </strong><a href="/${escapeHtml(rp.slug)}" style="color: #1e293b; font-weight: 600; text-decoration: underline; text-underline-offset: 3px;" onmouseover="this.style.color='#047857'" onmouseout="this.style.color='#1e293b'">${escapeHtml(rp.title)}</a></p>`;
                return fullMatch + '\n' + inlineCallout;
            }
            return fullMatch;
        });
    }

    // FITUR COPY PASTE SUMBER
    const copyPasteScript = `
    <script>
    document.addEventListener('copy', function(event) {
        var selection = window.getSelection();
        if (!selection || !selection.toString().length) return;
        
        var url = window.location.href;
        var sourceText = '\\n\\nSumber: Suara Aisyiyah (' + url + ')';
        var sourceHtml = '<br><br>Sumber: <a href="' + url + '">Suara Aisyiyah</a>';
        
        var plainText = selection.toString() + sourceText;
        var htmlText = '';
        
        if (selection.rangeCount > 0) {
            var container = document.createElement('div');
            for (var i = 0, len = selection.rangeCount; i < len; ++i) {
                container.appendChild(selection.getRangeAt(i).cloneContents());
            }
            htmlText = container.innerHTML + sourceHtml;
        } else {
            htmlText = plainText.replace(/\\n/g, '<br>') + sourceHtml;
        }
        
        if (event.clipboardData) {
            event.preventDefault();
            event.clipboardData.setData('text/plain', plainText);
            event.clipboardData.setData('text/html', htmlText);
        }
    });
    </script>
    `;
    
    // TOOLS JURNALISTIK & PERBESARAN TEKS (ICON-ONLY SATU BARIS)
    const toolsJurnalistik = `
    <div class="article-toolbar">
        <button type="button" onclick="copyFullArticle()" class="article-action-btn" title="Salin Artikel" aria-label="Salin Artikel">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        </button>
        <button type="button" id="tts-btn" onclick="toggleAudio()" class="article-action-btn action-tts" title="Dengarkan Artikel" aria-label="Dengarkan Artikel">
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
            btn.title = 'Dengarkan Artikel';
            btn.style.background = '#059669';
        } else {
            const contentDiv = document.getElementById('article-body-content');
            if(!contentDiv) return;
            
            // Extract text without hidden elements or scripts
            let textToRead = contentDiv.innerText || contentDiv.textContent;
            
            utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.lang = 'id-ID';
            utterance.rate = 0.9;
            
            utterance.onend = function() {
                isPlaying = false;
                btn.innerHTML = ttsIdleSvg;
                btn.title = 'Dengarkan Artikel';
                btn.style.background = '#059669';
            };
            
            // handle error
            utterance.onerror = function() {
                isPlaying = false;
                btn.innerHTML = ttsIdleSvg;
                btn.title = 'Dengarkan Artikel';
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
            alert('Artikel berhasil disalin ke clipboard!');
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
    
    // We append the copyPasteScript at the end of bodyHtml, and insert toolsJurnalistik at top
    bodyHtml = toolsJurnalistik + '<div id="article-body-content" class="sa-style-105">' + bodyHtml + '</div>' + copyPasteScript;

    const fullBodyHtml = bodyHtml;
    // Gunakan fungsi btoa dan encodeURIComponent untuk mengamankan data
    let encodedFullBody = '';
    const PAYWALL_ENABLED = false; // Paywall dinonaktifkan sementara sesuai instruksi user
    if (PAYWALL_ENABLED && p.is_premium === 1) {
        try { encodedFullBody = btoa(unescape(encodeURIComponent(fullBodyHtml))); } catch(e) {}
        
        const isSubscriber = hasPremiumAccess;
        if (!isSubscriber) {
            const parts = bodyHtml.split('</p>');
            if (parts.length > 3) {
                bodyHtml = parts.slice(0, 3).join('</p>') + '</p>';
            }
            bodyHtml += `
              <div class="paywall-block sa-style-106" >
                 <div class="sa-style-107">
                   <i class="fas fa-lock"></i>
                 </div>
                 <h4 class="sa-style-108">Artikel Premium</h4>
                 <p class="sa-style-109">Konten ini eksklusif untuk pelanggan berbayar. Silakan berlangganan Premium untuk membaca keseluruhan artikel secara utuh.</p>
                 <a href="/berlangganan" class="subscribe-btn sa-style-110" >Berlangganan Sekarang</a>
              </div>
            `;
        }
    }

    return this._layout(`
      <script type="application/ld+json">${jsonLdArticle}</script>
      <script type="application/ld+json">${jsonLdBreadcrumb}</script>
      <main class="container" role="main" style="padding-top: 24px; padding-bottom: 48px; margin-left: auto; margin-right: auto;">
        <article class="article-page" itemscope itemtype="https://schema.org/Article">
          <nav class="breadcrumb" aria-label="Breadcrumb" style="margin-bottom: 20px;">
            <ol style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 13px; color: var(--gray-text); padding: 0; margin: 0; list-style: none;">
              <li><a href="${langPrefix || '/'}" aria-label="Beranda" style="display: inline-flex; align-items: center; color: var(--green);"><svg class="sa-style-111" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></a></li>
              <li style="color: #cbd5e1;">&rsaquo;</li>
              <li><a href="${langPrefix ? langPrefix + '/' + catSlug : '/' + catSlug}" style="color: var(--green); font-weight: 500;">${catName}</a></li>
              <li style="color: #cbd5e1;">&rsaquo;</li>
              <li aria-current="page" style="color: #64748b; font-weight: 500; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(p.title)}</li>
            </ol>
          </nav>
          <header class="article-header">
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px; justify-content: flex-start;">
              <a href="${langPrefix ? langPrefix + '/' + catSlug : '/' + catSlug}" class="cat-tag" style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${catName}</a>
              ${p.is_premium === 1 ? '<span class="premium-badge sa-style-114" ><i class="fas fa-crown sa-style-115" ></i> Premium</span>' : ''}
            </div>
            <h1 itemprop="headline">${escapeHtml(p.title)}</h1>
            <div class="post-meta">
              <span class="author-meta" itemprop="author" itemscope itemtype="https://schema.org/Person">
                <span itemprop="name" style="font-weight: 600; color: #334155;">${escapeHtml(p.author || "Redaksi")}</span>
              </span>
              <span class="meta-sep" style="color: #94a3b8;">&bull;</span>
              <time datetime="${pubDateShort}" itemprop="datePublished" style="color: #64748b;">${date(p.created_at)}</time>
              <meta itemprop="dateModified" content="${modDate}">
            </div>
          </header>
          ${p.featured_image ? `
          <figure class="article-cover-wrap" itemprop="image" itemscope itemtype="https://schema.org/ImageObject" style="margin: 0 0 32px 0;">
            <img class="article-cover" src="${image(p)}" alt="${escapeHtml(p.title)}" loading="lazy" width="1200" height="630" itemprop="url" style="width: 100%; max-height: 520px; object-fit: cover; border-radius: 12px; display: block;">
            ${captionText ? `
              <figcaption class="sa-style-118" style="font-size: 13px; color: #64748b; font-style: italic; margin-top: 8px; text-align: left; background: transparent; position: static; padding: 4px 0 0 0;">
                ${captionText}
              </figcaption>
            ` : ''}
            <meta itemprop="width" content="1200">
            <meta itemprop="height" content="630">
          </figure>` : ''}
          
          <section class="article-body" itemprop="articleBody" id="article-body-container" data-encoded-body="${encodedFullBody}">
            ${bodyHtml}
          </section>

          <div class="share-block">
            <h4>${cx.lang === 'en' ? 'Share this article:' : (cx.lang === 'ar' ? 'شارك هذا المقال:' : 'Bagikan artikel ini:')}</h4>
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

          ${p.tags ? `
          <footer class="article-footer">
            <div class="article-tags">
              <span class="tag-label">Tagar:</span>
              ${p.tags.split(',').map((t: string) => {
                const cleanT = t.trim().replace(/^#/, '');
                const tagSlug = cleanT.toLowerCase().replace(/\s+/g, '-');
                return `<a href="/tag/${encodeURIComponent(tagSlug)}" class="post-tag" rel="tag">#${escapeHtml(cleanT)}</a>`;
              }).join('')}
            </div>
          </footer>` : ''}

          ${p.allow_comments !== 0 ? `
          <div class="comments-section" style="margin-top: 48px; padding-top: 36px; border-top: 2px solid #f1f5f9; font-family: ui-sans-serif, system-ui, sans-serif;">
            
            <div id="comments-loading" class="sa-style-124">Memuat sistem komentar...</div>
            
            <div id="comments-locked-ui" class="sa-style-125" style="display:none; background:#f8fafc; border:1px solid #e2e8f0; padding:28px 24px; border-radius:12px; text-align:center; margin-bottom: 28px;">
              <h4 class="sa-style-126" style="margin:0 0 8px; font-size:18px; font-weight:700; color:#0f172a;">Ikut Berdiskusi</h4>
              <p class="sa-style-127" style="margin:0 0 16px; font-size:14px; color:#64748b; line-height:1.6;">Anda harus memiliki akun dan login terlebih dahulu untuk dapat meninggalkan komentar.</p>
              <a href="/admin/login" class="sa-style-128" style="display:inline-block; background:#0f172a; color:#fff; padding:10px 20px; border-radius:8px; font-weight:600; font-size:13.5px; text-decoration:none;">Login Sekarang</a>
            </div>

            <div id="comments-form-ui" class="sa-style-129" style="display:none; background:#f8fafc; border:1px solid #e2e8f0; padding:28px 24px; border-radius:12px; margin-bottom: 28px;">
                <h3 class="sa-style-130" style="margin:0 0 12px; font-size:20px; font-weight:800; color:#0f172a;">Tinggalkan Komentar</h3>
                <div class="sa-style-131" style="margin-bottom:18px; font-size:14px; color:#065f46; background:#d1fae5; padding:12px 16px; border-radius:8px; display:flex; align-items:center; gap:8px;">
                   <span>Selamat datang, <strong id="comment-user-name" class="sa-style-132">Pengguna</strong>! Silakan berdiskusi.</span>
                </div>
                <form id="comment-form" class="modern-comment-form">
                  <input type="hidden" id="comment-post-id" value="${p.id}">
                  <div class="sa-style-133" style="margin-bottom:16px;">
                    <label class="sa-style-134" style="display:block; margin-bottom:6px; font-weight:600; font-size:13.5px; color:#334155;">Tulis Komentar</label>
                    <textarea id="comment-content" required rows="4" placeholder="Bagikan pendapat Anda tentang artikel ini..." class="sa-style-135" style="width:100%; box-sizing:border-box; padding:12px 14px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; background:#fff; color:#0f172a; resize:vertical; outline:none;"></textarea>
                  </div>
                  <button type="submit" id="comment-submit-btn" class="sa-style-136" style="background:#059669; color:white; padding:12px 24px; border:none; border-radius:8px; font-weight:700; font-size:14px; cursor:pointer; display:inline-block;">Kirim Komentar</button>
                  <div id="comment-status" class="sa-style-137" style="margin-top:10px; font-size:13.5px; font-weight:600;"></div>
                </form>
            </div>

            <script>
            document.addEventListener('DOMContentLoaded', () => {
                const getCookieToken = () => {
                    const match = document.cookie.match(/(?:^|;\\s*)labmu_token=([^;]+)/);
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
                        if (payload && payload.id) {
                            user = payload;
                        }
                    } catch(e) {}
                }

                document.getElementById('comments-loading').style.display = 'none';

                const isPremiumPost = ${PAYWALL_ENABLED && p.is_premium === 1 ? 'true' : 'false'};
                
                if (user) {
                    const role = (user.role || user.r || 'subscriber').toLowerCase();
                    const isInternal = role.includes('admin') || ['author', 'penulis', 'editor'].includes(role);
                    const isPaidSubscriber = ['premium', 'berbayar', 'member', 'subscriber_pro', 'pro'].includes(role);
                    
                    if (isPremiumPost && !isInternal && !isPaidSubscriber) {
                        const lockedUi = document.getElementById('comments-locked-ui');
                        lockedUi.innerHTML = '<p class="sa-style-138">🔒 Artikel premium ini hanya untuk <strong>Pelanggan Berbayar</strong>. Silakan tingkatkan paket Anda untuk ikut berdiskusi.</p><a href="/berlangganan" class="subscribe-btn sa-style-139" >Tingkatkan Layanan</a>';
                        lockedUi.style.display = 'block';
                    } else {
                        document.getElementById('comments-form-ui').style.display = 'block';
                        document.getElementById('comment-user-name').innerText = user.n || user.username || 'Pengguna';
                        
                        // Unlock Artikel (Hapus Paywall dan kembalikan Full Text)
                        const container = document.getElementById('article-body-container');
                        if (container && container.getAttribute('data-encoded-body')) {
                            try {
                                const b64 = container.getAttribute('data-encoded-body');
                                const decoded = decodeURIComponent(escape(atob(b64)));
                                const paywall = container.querySelector('.paywall-block');
                                if (paywall) paywall.remove();
                                container.innerHTML = decoded;
                            } catch(e) {
                                console.error('Failed to unlock content', e);
                            }
                        }
                        
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
                                    headers: { 
                                        'Content-Type': 'application/json',
                                        'Authorization': 'Bearer ' + token
                                    },
                                    body: JSON.stringify({
                                        post_id: parseInt(postId),
                                        user_id: parseInt(user.id),
                                        content: content
                                    })
                                });
                                
                                const data = await res.json();
                                if(res.ok) {
                                    status.style.color = '#059669';
                                    status.innerText = 'Komentar berhasil dikirim dan menunggu persetujuan admin.';
                                    document.getElementById('comment-content').value = '';
                                } else {
                                    status.style.color = '#dc2626';
                                    status.innerText = data.error || 'Gagal mengirim komentar.';
                                }
                            } catch(err) {
                                status.style.color = '#dc2626';
                                status.innerText = 'Terjadi kesalahan sistem.';
                            } finally {
                                btn.disabled = false;
                                btn.innerText = 'Kirim Komentar';
                            }
                        });
                    }
                } else {
                    document.getElementById('comments-locked-ui').style.display = 'block';
                }

                // FETCH AND DISPLAY COMMENTS
                const postId = document.getElementById('comment-post-id') ? document.getElementById('comment-post-id').value : null;
                if (postId) {
                    fetch('/api/comments/' + postId)
                        .then(res => res.json())
                        .then(data => {
                            const listEl = document.getElementById('comments-display-list');
                            if (!data || data.length === 0) {
                                listEl.innerHTML = '<div class="comments-empty-state" style="text-align: center; padding: 28px 16px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; color: #64748b; font-size: 14px; margin-top: 12px;"><i class="far fa-comments" style="font-size: 24px; color: #94a3b8; display: block; margin-bottom: 8px;"></i>Belum ada komentar. Jadilah yang pertama berdiskusi!</div>';
                                return;
                            }
                            
                            let html = '';
                            data.forEach(c => {
                                const date = new Date(c.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                const avatar = c.user_avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(c.user_name) + '&background=0f172a&color=fff';
                                
                                let badge = '';
                                if (c.user_role === 'admin') badge = '<span class="sa-style-141">Admin</span>';
                                if (c.user_role === 'author') badge = '<span class="sa-style-142">Penulis</span>';

                                html += '<div class="sa-style-143">' +
                                    '<img src="' + avatar + '" alt="' + c.user_name + '" class="sa-style-144">' +
                                    '<div class="sa-style-145">' +
                                        '<div class="sa-style-146">' +
                                            '<h5 class="sa-style-147">' + c.user_name + '</h5>' +
                                            badge +
                                        '</div>' +
                                        '<div class="sa-style-148">' + date + '</div>' +
                                        '<p class="sa-style-149">' + c.content + '</p>' +
                                    '</div>' +
                                '</div>';
                            });
                            listEl.innerHTML = html;
                        })
                        .catch(err => {
                            document.getElementById('comments-display-list').innerHTML = '<div style="color:#ef4444; font-size:14px; padding: 12px 0;">Gagal memuat komentar.</div>';
                        });
                }

            });
            </script>
            
            <div style="margin-top: 24px;">
                <h4 style="font-size:18px; font-weight:800; color:#0f172a; margin-bottom:16px;">Komentar Pembaca</h4>
                <div id="comments-display-list">
                    <div style="color:#64748b; font-size:14px; padding: 12px 0;">Memuat komentar...</div>
                </div>
            </div>
            
          </div>
          ` : ''}

          ${(() => {
            let bannerBox = '';
            if (ctx.site.sa_banner_html) {
              bannerBox = `
                <div class="related-banner-slot sa-style-153">
                  ${ctx.site.sa_banner_html}
                </div>
              `;
            } else if (ctx.site.sa_banner_image) {
              bannerBox = `
                <a href="${ctx.site.sa_banner_link || '#'}" class="related-banner-slot sa-style-154" style="background-image: url('${ctx.site.sa_banner_image}'); background-size: cover; background-position: center; border: none; padding: 0; display: block; min-height: 180px; border-radius: 8px;" target="_blank"></a>
              `;
            }

            if (!cx.relatedPosts || !cx.relatedPosts.length) {
              return bannerBox ? `
                <div class="related-posts" style="margin-top: 36px;">
                  ${bannerBox}
                </div>
              ` : '';
            }

            const relatedTitle = cx.lang === 'en' 
              ? `Related Articles in ${catName}` 
              : (cx.lang === 'ar' ? `مقالات ذات صلة في ${catName}` : `Artikel Terkait di ${catName}`);
            const langPrefix = cx.lang && cx.lang !== 'id' ? `/${cx.lang}` : '';

            return `
              <div class="related-posts" style="margin-top: 48px; padding-top: 36px; border-top: 2px solid #f1f5f9;">
                <h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 20px;">${relatedTitle}</h3>
                <div class="related-grid">
                  ${cx.relatedPosts.slice(0, 4).map((rp:any, i:number) => `
                    <div class="grid-post">
                      <a href="${langPrefix}/${escapeHtml(rp.slug)}" class="post-img-wrap">
                        <img src="${image(rp, i)}" alt="${escapeHtml(rp.title)}" loading="lazy">
                      </a>
                      <div class="grid-post-content">
                        <h4><a href="${langPrefix}/${escapeHtml(rp.slug)}">${escapeHtml(rp.title)}</a></h4>
                        <div class="post-meta"><span>${date(rp.created_at)}</span></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
                ${bannerBox ? `<div class="related-banner-container" style="margin-top: 24px;">${bannerBox}</div>` : ''}
              </div>
            `;
          })()}
        </article>
      </main>
    `, p.title, ctx, 'post');
}
