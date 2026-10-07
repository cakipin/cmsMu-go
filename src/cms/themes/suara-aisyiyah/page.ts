import type { ThemeContext } from "../types";
import { escapeHtml, image } from "./utils";

export function renderPage(this: any, ctx: ThemeContext) {
  const p = ctx.data;
  if (!p) return this.render404(ctx);
  const cx = ctx as any;
  const canonical = cx.canonical || `https://suaraaisyiyah.id/${p.slug}`;
  const captionText = escapeHtml(
    p.featured_image_caption || p.meta_caption || ""
  );

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

  // TOOLS JURNALISTIK & PERBESARAN TEKS (DI ATAS KONTEN)
  const toolsJurnalistik = `
    <div class="article-toolbar" style="margin-bottom: 24px;">
        <button type="button" onclick="copyFullPage()" class="article-action-btn" title="Salin Halaman" aria-label="Salin Halaman">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        </button>
        <button type="button" id="tts-btn" onclick="toggleAudio()" class="article-action-btn action-tts" title="Dengarkan Halaman" aria-label="Dengarkan Halaman">
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
      
      function showPageToast(msg) {
        let t = document.getElementById('page-toast');
        if (!t) {
          t = document.createElement('div');
          t.id = 'page-toast';
          t.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:99999; background:#059669; color:#fff; padding:10px 18px; border-radius:8px; font-weight:600; font-size:14px; box-shadow:0 4px 15px rgba(0,0,0,0.2); transition:all 0.3s ease; display:flex; align-items:center; gap:8px;';
          document.body.appendChild(t);
        }
        t.innerHTML = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> ' + msg;
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
        setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; }, 3000);
      }

      function toggleAudio() {
        const btn = document.getElementById('tts-btn');
        if (!synth) { showPageToast('Browser Anda tidak mendukung audio.'); return; }
        if (isPlaying) {
            synth.cancel();
            isPlaying = false;
            btn.innerHTML = ttsIdleSvg;
            btn.title = 'Dengarkan Halaman';
            btn.style.background = '#059669';
        } else {
            const contentDiv = document.getElementById('page-body-content');
            if(!contentDiv) return;
            let textToRead = contentDiv.innerText || contentDiv.textContent;
            utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.lang = 'id-ID';
            utterance.rate = 0.9;
            utterance.onend = function() {
                isPlaying = false;
                btn.innerHTML = ttsIdleSvg;
                btn.title = 'Dengarkan Halaman';
                btn.style.background = '#059669';
            };
            utterance.onerror = function() {
                isPlaying = false;
                btn.innerHTML = ttsIdleSvg;
                btn.title = 'Dengarkan Halaman';
                btn.style.background = '#059669';
            };
            synth.speak(utterance);
            isPlaying = true;
            btn.innerHTML = ttsPlayingSvg;
            btn.title = 'Hentikan Audio';
            btn.style.background = '#dc2626';
        }
      }
      
      function copyFullPage() {
        const content = document.getElementById('page-body-content');
        if (!content) return;
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(content);
        selection.removeAllRanges();
        selection.addRange(range);
        try {
            document.execCommand('copy');
            showPageToast('Halaman berhasil disalin!');
        } catch (err) {
            console.error('Gagal menyalin', err);
        }
        selection.removeAllRanges();
      }

      function zoomText(direction) {
        const content = document.getElementById('page-body-content');
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

  // BLOK SHARE MEDSOS (DI BAWAH KONTEN)
  const shareHeading =
    (ctx as any).lang === "en"
      ? "Share this page:"
      : (ctx as any).lang === "ar"
        ? "شارك هذه الصفحة:"
        : "Bagikan halaman ini:";
  const shareBlock = `
    <div class="share-block" style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
      <h4>${shareHeading}</h4>
      <div class="share-buttons">
        <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(p.title + " " + canonical)}" target="_blank" rel="noopener" class="share-btn share-wa" aria-label="Share on WhatsApp">
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
    `;

  return this._layout(
    `
      <main class="container sa-style-158" role="main" >
        <div class="page-content sa-style-159" >
          <h1 class="page-title">${escapeHtml(p.title)}</h1>
          
          ${toolsJurnalistik}

          ${
            p.featured_image
              ? `
            <div class="sa-style-160">
              <img src="${image(p)}" alt="${escapeHtml(p.title)}" class="sa-style-161">
              ${
                captionText
                  ? `
                <div class="sa-style-162">
                  ${captionText}
                </div>
              `
                  : ""
              }
            </div>
          `
              : ""
          }

          <div id="page-body-content" class="sa-style-105" style="font-size: 17px; line-height: 1.8;">
            ${p.body || p.content || ""}
          </div>

          ${shareBlock}
          ${copyPasteScript}
        </div>
      </main>
    `,
    escapeHtml(p.title),
    ctx,
    "page"
  );
}
