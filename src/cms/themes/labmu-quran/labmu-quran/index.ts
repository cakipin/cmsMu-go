import type { ThemeStructure, ThemeContext } from '../types';
import { css } from './style';
import { renderHeader, renderFooter } from './components';

const BASE_URL = '/quran';

const LabMuQuran: ThemeStructure = {
  name: 'LabMu Quran (Share Fixed v2)',
  version: '15.0',
  author: 'LabMu',

  _layout(content: string, title: string, ctx: ThemeContext) {
    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>${css}</style>
      </head>
      <body>

        <div class="header-wrapper">
            <div class="header-inner">
                <a href="${BASE_URL}" class="brand-logo"><i class="fas fa-book-open"></i> QuranMu</a>

                <div class="header-right">
                    <div class="custom-dropdown">
                        <div class="dropdown-trigger" onclick="toggleQariMenu()">
                            <span id="qari-label">Misyari Rasyid</span>
                            <i class="fas fa-chevron-down" style="font-size:0.7rem"></i>
                        </div>
                        <div class="dropdown-content" id="qari-list">
                            <div class="dropdown-item" onclick="selectQari('05', 'Misyari Rasyid')">Misyari Rasyid</div>
                            <div class="dropdown-item" onclick="selectQari('01', 'Abdullah Al-Juhany')">Abdullah Al-Juhany</div>
                            <div class="dropdown-item" onclick="selectQari('02', 'Abdul Muhsin')">Abdul Muhsin</div>
                            <div class="dropdown-item" onclick="selectQari('03', 'Abdurrahman Sudais')">Abdurrahman Sudais</div>
                            <div class="dropdown-item" onclick="selectQari('04', 'Ibrahim Al-Dossari')">Ibrahim Al-Dossari</div>
                        </div>
                    </div>

                    <button class="btn-icon-head active" id="btn-latin" onclick="toggleMode('latin')" title="Latin">L</button>
                    <button class="btn-icon-head active" id="btn-id" onclick="toggleMode('id')" title="Indo">ID</button>
                    <button class="btn-icon-head" id="btn-en" onclick="toggleMode('en')" title="English">EN</button>
                    <button class="btn-icon-head" id="btn-theme" onclick="toggleMode('theme')" title="Dark Mode"><i class="fas fa-moon"></i></button>
                </div>
            </div>
        </div>

        <div class="quran-container">
          <div class="content-area">${content}</div>
          ${renderFooter(ctx)}
        </div>

        ${this._scripts()}
      </body>
      </html>
    `;
  },

  _scripts() {
    return `
      <div class="sticky-player" id="player-container" style="display:none;">
          <div style="width:35px; height:35px; background:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff;"><i class="fas fa-play"></i></div>
          <div style="flex:1;">
             <span id="player-title" style="font-size:0.75rem; font-weight:bold; display:block; color:var(--text-main);">Putar Audio</span>
             <audio id="main-player" controls style="height:25px; width:100%;"></audio>
          </div>
          <button onclick="closePlayer()" style="background:none; border:none; color:var(--text-muted); cursor:pointer;"><i class="fas fa-times"></i></button>
      </div>

      <div id="toast" style="visibility:hidden; min-width:200px; background:#333; color:#fff; text-align:center; border-radius:8px; padding:10px; position:fixed; z-index:3500; left:50%; bottom:90px; transform:translateX(-50%); opacity:0; transition:0.3s;">Copied!</div>

      <script>
        // --- UI & STATE ---
        var state = {
            dark: null === 'true',
            latin: null !== 'false',
            id: null !== 'false',
            en: null === 'true',
            qari: null || '05',
            qariName: null || 'Misyari Rasyid'
        };

        function updateUI() {
            document.body.classList.toggle('dark', state.dark);
            if(document.getElementById('btn-theme')) {
                document.getElementById('btn-theme').classList.toggle('active', state.dark);
                document.getElementById('btn-theme').innerHTML = state.dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            }
            ['latin', 'id', 'en'].forEach(k => {
                document.body.classList.toggle('show-' + k, state[k]);
                if(document.getElementById('btn-' + k)) document.getElementById('btn-' + k).classList.toggle('active', state[k]);
            });
            document.getElementById('qari-label').innerText = state.qariName;
        }

        function toggleMode(key) {
            if(key === 'theme') { state.dark = !state.dark; (void 0); }
            else { state[key] = !state[key]; (void 0); }
            updateUI();
        }

        function toggleQariMenu() { document.getElementById('qari-list').classList.toggle('show'); }
        function selectQari(val, name) {
            state.qari = val; state.qariName = name;
            (void 0); (void 0);
            updateUI(); document.getElementById('qari-list').classList.remove('show');
        }

        function toggleShare(id) {
            var el = document.getElementById('share-pop-' + id);
            var all = document.querySelectorAll('.share-popover');
            all.forEach(function(x){ if(x !== el) x.classList.remove('show'); });
            el.classList.toggle('show');
        }

        window.onclick = function(e) {
            if (!e.target.closest('.custom-dropdown') && !e.target.closest('.share-wrapper')) {
                document.querySelectorAll('.dropdown-content, .share-popover').forEach(function(d){ d.classList.remove('show'); });
            }
        }

        // --- ACTIONS (FIXED) ---
        function playAyat(btn, title) {
            var url = btn.getAttribute('data-url-' + state.qari);
            if(!url || url === 'undefined') url = btn.getAttribute('data-url-05');
            if(url) {
                document.getElementById('player-container').style.display = 'flex';
                document.getElementById('player-title').innerText = title;
                var p = document.getElementById('main-player'); p.src = url; p.play();
            } else { showToast('Audio belum tersedia'); }
        }
        function closePlayer() { document.getElementById('main-player').pause(); document.getElementById('player-container').style.display='none'; }

        function copyAyat(text) {
             navigator.clipboard.writeText(text).then(()=>showToast('Ayat & Link disalin!'));
        }

        // FUNGSI SHARE BARU (ANTI DUPLIKAT LINK)
        // Kita construct URL di sini, bukan di HTML
        function shareTo(platform, content, ayatId) {
            var url = window.location.href.split('#')[0] + '#ayat-' + ayatId;
            var finalMsg = content + '\\n\\n' + url;
            var shareUrl = '';

            if(platform === 'wa') {
                shareUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(finalMsg);
            } else if(platform === 'fb') {
                shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '&quote=' + encodeURIComponent(content);
            } else if(platform === 'x') {
                shareUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(finalMsg);
            } else if(platform === 'tele') {
                shareUrl = 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(content);
            }

            if(shareUrl) window.open(shareUrl, '_blank');
        }

        function showToast(msg) { var x=document.getElementById("toast"); x.innerText=msg; x.style.visibility="visible"; x.style.opacity="1"; setTimeout(()=>{x.style.visibility="hidden";x.style.opacity="0";},2000); }

        updateUI();
      </script>
    `;
  },

  renderHome(ctx: ThemeContext) {
    const list = Array.isArray(ctx.data) ? ctx.data : [];
    const topics = [{name:'Doa',icon:'🤲',slug:'doa'}, {name:'Shalat',icon:'🕌',slug:'shalat'}, {name:'Zakat',icon:'💰',slug:'zakat'}, {name:'Puasa',icon:'🌙',slug:'puasa'}];

    const html = `
      <div style="text-align:center; padding:10px 0 20px;"><h1 style="font-family:'Amiri', serif; font-size:2rem; color:var(--primary);">Al-Quran Digital</h1></div>
      <input type="text" placeholder="Cari nama surat..." class="search-box" onkeyup="var v=this.value.toLowerCase(); document.querySelectorAll('.surat-card').forEach(el => el.style.display = el.innerText.toLowerCase().includes(v) ? 'flex' : 'none')">
      <div class="topic-list">
         ${topics.map(t => `<a href="${BASE_URL}/tema/${t.slug}" class="topic-item">${t.icon} ${t.name}</a>`).join('')}
      </div>
      <div class="surat-grid">
        ${list.map((s: any) => `<a href="${BASE_URL}/${s.nomor}" class="surat-card"><div class="nomor-surat">${s.nomor}</div><div style="flex:1;"><div style="font-weight:bold;">${s.namaLatin}</div><div style="font-size:0.85rem; color:var(--text-muted);">${s.arti} • ${s.jumlahAyat} Ayat</div></div><div style="font-family:'Amiri', serif; font-size:1.3rem; color:var(--text-muted);">${s.nama}</div></a>`).join('')}
      </div>
    `;
    return this._layout(html, 'Beranda', ctx);
  },

  renderSingle(ctx: ThemeContext) {
    const s = ctx.data;
    if (!s || !s.ayat) return this._layout('Not Found', 'Error', ctx);

    // Clean strings untuk JS
    const esc = (str: string) => str.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');

    const ayatListHtml = s.ayat.map((a: any) => {
       const label = `${s.namaLatin}:${a.nomorAyat}`;
       let audioAttr = '';
       if(a.audioOptions) {
           for(const [key, url] of Object.entries(a.audioOptions)) { audioAttr += ` data-url-${key}="${url}"`; }
       }

       // Data Teks Bersih
       const shareContent = `${esc(a.teksArab)} \\n\\n${esc(a.teksIndonesia)} \\n\\n(${label})`;

       return `
       <div class="ayat-item" id="ayat-${a.nomorAyat}">
          <div class="ayat-meta-top">
              <span class="ayat-badge">${a.nomorAyat}</span>

              <div class="ayat-actions">

                  <div class="share-wrapper">
                      <button class="btn-action" onclick="toggleShare('${a.nomorAyat}')" title="Bagikan"><i class="fas fa-share-alt"></i></button>

                      <div class="share-popover" id="share-pop-${a.nomorAyat}">
                          <div onclick="shareTo('wa', '${shareContent}', '${a.nomorAyat}')" class="share-link"><i class="fab fa-whatsapp c-wa"></i> WhatsApp</div>
                          <div onclick="shareTo('fb', '${shareContent}', '${a.nomorAyat}')" class="share-link"><i class="fab fa-facebook-f c-fb"></i> Facebook</div>
                          <div onclick="shareTo('x', '${shareContent}', '${a.nomorAyat}')" class="share-link"><i class="fab fa-x-twitter c-tw"></i> X / Twitter</div>
                          <div onclick="shareTo('tele', '${shareContent}', '${a.nomorAyat}')" class="share-link"><i class="fab fa-telegram-plane c-tele"></i> Telegram</div>
                      </div>
                  </div>

                  <button class="btn-action" onclick="copyAyat('${shareContent}' + '\\n\\n' + window.location.href.split('#')[0] + '#ayat-${a.nomorAyat}')" title="Salin"><i class="fas fa-copy"></i></button>

                  <button class="btn-action" onclick="playAyat(this, '${label}')" ${audioAttr} title="Putar"><i class="fas fa-play"></i></button>
              </div>
          </div>

          <div class="ayat-arab" dir="rtl">${a.teksArab}</div>

          <div class="trans-block trans-latin">${a.teksLatin}</div>
          <div class="trans-block trans-id">${a.teksIndonesia}</div>
          <div class="trans-block trans-en">${a.teksInggris || ''}</div>
       </div>`;
    }).join('');

    const html = `
      <div style="text-align:center; padding:10px 0 25px;">
         <h1 style="font-size:2rem; color:var(--primary); margin:0;">${s.namaLatin}</h1>
         <p style="color:var(--text-muted);">${s.arti} • ${s.jumlahAyat} Ayat</p>
         ${s.audioFull ? `<button onclick="playAyat(this, 'Full ${s.namaLatin}')" style="margin-top:15px; padding:8px 16px; border:1px solid var(--primary); border-radius:20px; cursor:pointer; background:var(--bg-card); color:var(--primary);" data-url-05="${s.audioFull['05'] || ''}"><i class="fas fa-play"></i> Full Surat</button>` : ''}
      </div>
      <div>${ayatListHtml}</div>
      <div style="display:flex; justify-content:space-between; padding:30px 0;">
         ${s.suratSebelumnya ? `<a href="${BASE_URL}/${s.suratSebelumnya.nomor}" class="surat-card" style="padding:10px 20px;">&larr; Prev</a>` : '<div></div>'}
         ${s.suratSelanjutnya ? `<a href="${BASE_URL}/${s.suratSelanjutnya.nomor}" class="surat-card" style="padding:10px 20px;">Next &rarr;</a>` : '<div></div>'}
      </div>
    `;
    return this._layout(html, s.namaLatin, ctx);
  },

  render404(ctx: ThemeContext) { return this._layout('Not Found', '404', ctx); }
};

export default LabMuQuran;