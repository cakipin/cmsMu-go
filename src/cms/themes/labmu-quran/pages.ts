import type { ThemeContext } from '../types';

// ==========================================
// 1. HELPER FUNCTIONS
// ==========================================

const slugify = (text: string) => {
  return (text || '').toString().toLowerCase()
    .replace(/\s+/g, '-')           
    .replace(/[^\w\-]+/g, '')       
    .replace(/\-\-+/g, '-')         
    .replace(/^-+/, '')             
    .replace(/-+$/, '');            
};

// [LOGIC TAJWID: Support Bracket & Regex]
const applyTajwid = (text: string) => {
    if (!text) return '';
    
    // 1. Format Bracket D1 [h:1[..]]
    if (text.includes('[') && text.includes(']')) {
        return text.replace(/\[([a-z]+)(?::\d+)?\[([^\]]+)\]/g, (match, code, content) => {
            let color = '';
            switch(code) {
                case 'n': color = '#2ecc71'; break; // Hijau (Ghunnah)
                case 'q': color = '#e74c3c'; break; // Merah (Qalqalah)
                case 'm': 
                case 'p': color = '#9b59b6'; break; // Ungu (Mad)
                case 'l': 
                case 'h': color = '#f1c40f'; break; // Emas (Allah)
                default: color = '#3498db'; // Biru (Default)
            }
            return `<span style="color:${color}; font-weight:bold;">${content}</span>`;
        });
    }

    // 2. Fallback Regex (Mata Elang)
    let res = text;
    res = res.replace(/([\u0646\u0645]\u0651)/g, '<span style="color:#2ecc71; font-weight:bold;">$1</span>');
    res = res.replace(/([\u0628\u062C\u062F\u0637\u0642]\u0652)/g, '<span style="color:#e74c3c; font-weight:bold;">$1</span>');
    res = res.replace(/(اللّٰه|الله|لِلّٰهِ)/g, '<span style="color:#f1c40f; font-weight:bold;">$1</span>');
    return res;
};

const escJs = (str: string) => (str || '').replace(/'/g, "\\'"); 
const safeAttr = (str: string) => (str || '').replace(/"/g, '&quot;');
const pad3 = (num: any) => String(num).padStart(3, '0');

// DATA QARI (ID harus String '01', '02' dst)
const QARI_MAP: Record<string, string> = {
    '01': 'Abdullah-Al-Juhany', 
    '02': 'Abdul-Muhsin-Al-Qasim', 
    '03': 'Abdurrahman-as-Sudais',
    '04': 'Ibrahim-Al-Dossari', 
    '05': 'Misyari-Rasyid-Al-Afasi'
};

// ==========================================
// 2. RENDERER HALAMAN
// ==========================================

export const renderHome = (ctx: ThemeContext, _layout: any) => {
    const list = Array.isArray(ctx.data) ? ctx.data : [];
    return _layout(`
      <div style="text-align:center; padding:30px 0;">
        <h1 style="font-family:'Amiri', serif; font-size:2.8rem; color:var(--primary); margin:0;">Al-Quran Digital</h1>
      </div>
      <div style="position:relative; margin-bottom:30px; z-index:10;">
        <input type="text" id="searchBox" placeholder="Cari surat..." class="search-box" onkeyup="window.handleSearch(event)" autocomplete="off">
        <i class="fas fa-search" style="position:absolute; right:15px; top:18px; color:#ccc;"></i>
      </div>
      <div class="surat-grid">
        ${list.map((s: any) => `
              <a href="/${slugify(s.namaLatin)}" class="surat-card" data-name="${(s.namaLatin || '').toLowerCase()}">
                <div class="nomor-surat">${s.nomor}</div>
                <div style="flex:1;">
                  <div style="font-weight:bold;">${s.namaLatin}</div>
                  <div style="font-size:0.85rem; color:var(--text-muted);">${s.arti || ''}</div>
                </div>
                <div style="font-family:'Amiri', serif; font-size:1.4rem; color:var(--primary);">${s.nama || s.nama_arab}</div>
              </a>`).join('')}
      </div>`, 'Beranda', ctx);
};

export const renderSearch = (results: any[], keyword: string, ctx: ThemeContext, _layout: any) => {
    const html = `
      <div style="padding: 10px 0;">
        <div style="background:var(--bg-card); padding:20px; border-radius:15px; margin-bottom:30px; border-left:5px solid var(--primary);">
            <h2 style="margin:0;">Hasil Pencarian</h2><p>Kata kunci: <b>"${keyword}"</b> (${results.length} hasil)</p>
        </div>
        <div class="search-results-list">
          ${results.map((a: any) => `
            <div class="search-item" style="background:var(--bg-card); padding:25px; border-radius:15px; margin-bottom:20px; border:1px solid var(--border);">
              <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                  <b>QS. ${a.surah_id}:${a.nomor_ayat}</b>
                  <a href="/${slugify(a.nama_latin)}#ayat-${a.nomor_ayat}" style="color:#fff; background:var(--primary); padding:6px 15px; border-radius:20px; text-decoration:none; font-size:0.8rem;">Buka &rarr;</a>
              </div>
              <div class="ayat-arab" dir="rtl" style="text-align:right;">${applyTajwid(a.teks_arab)}</div>
              <div style="margin-top:15px;">"${a.teks_indonesia}"</div>
            </div>`).join('')}
        </div>
      </div>`;
    return _layout(html, `Cari: ${keyword}`, ctx);
};

export const renderSingle = (ctx: ThemeContext, _layout: any) => {
    const s = ctx.data; 
    if (!s || !s.ayat) return _layout('Not Found', 'Error', ctx);
    
    const namaLatin = s.namaLatin || s.nama_latin || 'Surat';
    const safeNama = safeAttr(namaLatin);
    const nomorSurat = parseInt(s.nomor || '1'); 

    // --- GENERATE AUDIO FULL (FIX SINKRONISASI) ---
    let fullAudioAttrs = ''; 
    let fullDefaultUrl = '';
    
    for (const [code, qariName] of Object.entries(QARI_MAP)) {
        const url = `https://cdn.equran.id/audio-full/${qariName}/${pad3(nomorSurat)}.mp3`;
        // 1. Pasang ID Standar (01, 02)
        fullAudioAttrs += ` data-url-${code}="${url}"`;
        // 2. Pasang ID Cadangan Tanpa Nol (1, 2) -> ANTISIPASI JIKA BROWSER SIMPAN ID ANGKA
        if (code.startsWith('0')) {
            fullAudioAttrs += ` data-url-${code.substring(1)}="${url}"`;
        }
        if (code === '05') fullDefaultUrl = url;
    }
    const playAllBtn = `<button onclick="window.playAyat(this)" ${fullAudioAttrs} data-audio-default="${fullDefaultUrl}" data-title="Full Surat ${safeNama}" style="margin-top:15px; padding:10px 20px; border:1px solid var(--primary); background:var(--bg-card); color:var(--primary); border-radius:30px; cursor:pointer; font-weight:bold;"><i class="fas fa-play"></i> Putar Full Surat</button>`;

    // --- LOOP AYAT ---
    const ayatListHtml = s.ayat.map((a: any) => {
        const nomer = parseInt(a.nomorAyat || a.nomor_ayat || '0');
        const fileID = `${pad3(nomorSurat)}${pad3(nomer)}.mp3`;
        
        const arabPolos = a.teksArab || a.teks_arab;
        let arabTajwid = a.teksTajwid || a.teks_tajwid;
        if (arabTajwid) {
            arabTajwid = applyTajwid(arabTajwid);
        } else {
            arabTajwid = applyTajwid(arabPolos);
        }

        // --- GENERATE AUDIO AYAT (FIX SINKRONISASI) ---
        let ayatAttrs = ''; 
        let ayatDefaultUrl = '';
        
        for (const [code, qariName] of Object.entries(QARI_MAP)) {
            const url = `https://cdn.equran.id/audio-partial/${qariName}/${fileID}`;
            // 1. Pasang ID Standar (01, 02)
            ayatAttrs += ` data-url-${code}="${url}"`;
            // 2. Pasang ID Cadangan Tanpa Nol (1, 2)
            if (code.startsWith('0')) {
                ayatAttrs += ` data-url-${code.substring(1)}="${url}"`;
            }
            if (code === '05') ayatDefaultUrl = url;
        }

        return `
        <div class="ayat-item" id="ayat-${nomer}">
          <div class="ayat-meta-top">
              <span class="ayat-badge">${nomer}</span>
              <div class="ayat-actions">
                  <div class="share-wrapper" style="position:relative; display:inline-block;">
                      <button class="btn-action" onclick="window.labmu_toggleShare('${nomer}')" title="Bagikan"><i class="fas fa-share-alt"></i></button>
                      <div class="share-popover" id="share-pop-${nomer}">
                          <div onclick="window.labmu_doShare(this)" data-type="wa" data-id="${nomer}" class="share-link"><i class="fab fa-whatsapp" style="color:#25D366; width:25px;"></i> WhatsApp</div>
                          <div onclick="window.labmu_doShare(this)" data-type="fb" data-id="${nomer}" class="share-link"><i class="fab fa-facebook" style="color:#1877F2; width:25px;"></i> Facebook</div>
                          <div onclick="window.labmu_doShare(this)" data-type="x" data-id="${nomer}" class="share-link"><i class="fab fa-twitter" style="color:#000; width:25px;"></i> X / Twitter</div>
                          <div onclick="window.labmu_doShare(this)" data-type="tele" data-id="${nomer}" class="share-link"><i class="fab fa-telegram" style="color:#0088cc; width:25px;"></i> Telegram</div>
                          <div onclick="window.labmu_doShare(this)" data-type="copy" data-id="${nomer}" class="share-link"><i class="fas fa-copy" style="color:#555; width:25px;"></i> Salin Link</div>
                      </div>
                  </div>
                  <button class="btn-action" onclick="window.labmu_openTafsir('${nomer}', '${nomorSurat}')" title="Baca Tafsir"><i class="fas fa-book-open"></i></button>
                  <button class="btn-action" onclick="window.playAyat(this)" ${ayatAttrs} data-audio-default="${ayatDefaultUrl}" data-title="${safeNama}:${nomer}"><i class="fas fa-play"></i></button>
              </div>
          </div>
          
          <div class="ayat-arab-container" dir="rtl" style="text-align:right; font-family:'Amiri', serif; font-size:2.2rem; line-height:2.5; margin: 15px 0 25px 0;">
              <span class="arab-plain">${arabPolos}</span>
              <span class="arab-colored" style="display:none;">${arabTajwid}</span>
          </div>

          <div class="trans-block trans-latin">${a.teksLatin || a.teks_latin || ''}</div>
          <div class="trans-block trans-id" id="terjemahan-${nomer}">${a.teksIndonesia || a.teks_indonesia}</div>
          <div class="trans-block trans-en">${a.teksInggris || a.teks_inggris || ''}</div>
          
          <input type="hidden" id="meta-surat-${nomer}" value="${safeNama}">
          <input type="hidden" id="text-ayat-${nomer}" value="${safeAttr(arabPolos)}">
          <input type="hidden" id="text-indo-${nomer}" value="${safeAttr(a.teksIndonesia || a.teks_indonesia)}">
        </div>`;
    }).join('');

    // --- HTML MODAL & SCRIPT ---
    const modalHtml = `
    <div id="tafsir-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(5px); z-index:9999; align-items:center; justify-content:center;">
        <div style="background:var(--bg-card); width:90%; max-width:600px; max-height:80vh; border-radius:15px; display:flex; flex-direction:column; box-shadow:0 10px 30px rgba(0,0,0,0.3);">
            <div style="padding:15px 20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                <div><h3 style="margin:0; font-size:1.2rem; color:var(--primary);">Tafsir QS. ${safeNama}</h3><span id="tafsir-ayat-badge" style="font-size:0.85rem; opacity:0.7;">Ayat ...</span></div>
                <button onclick="window.labmu_closeTafsir()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--text-main);">&times;</button>
            </div>
            <div style="padding:10px 20px; background:var(--bg-main);">
                <select id="select-tafsir-source" onchange="window.labmu_fetchTafsirData()" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg-card); color:var(--text-main); font-size:1rem;">
                    <option value="ibnukatsir" selected>Tafsir Ibnu Katsir (Default)</option>
                    <option value="attanwir">Tafsir At-Tanwir</option>
                    <option value="kemenag">Kemenag (Tahlili/Lengkap)</option>
                </select>
            </div>
            <div id="tafsir-content-area" style="padding:20px; overflow-y:auto; line-height:1.8; font-size:1rem; color:var(--text-main);">
                <div id="tafsir-loading" style="display:none; text-align:center; padding:20px;">
                    <i class="fas fa-spinner fa-spin" style="font-size:2rem; color:var(--primary);"></i><p>Memuat Tafsir...</p>
                </div>
                <div id="tafsir-text"></div>
            </div>
            <div style="padding:15px 20px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:10px;">
                <button onclick="window.labmu_copyTafsir()" style="padding:8px 20px; background:var(--bg-main); color:var(--text-main); border:1px solid var(--border); border-radius:20px; cursor:pointer;"><i class="fas fa-copy"></i> Salin Tafsir</button>
                <button onclick="window.labmu_closeTafsir()" style="padding:8px 20px; background:var(--primary); color:#fff; border:none; border-radius:20px; cursor:pointer;">Tutup</button>
            </div>
        </div>
    </div>
    
    <style>
        .show-tajwid .ayat-arab { color: #555; }
        .show-tajwid .ayat-arab span { font-weight:bold; }
        .share-wrapper { position: relative; display: inline-block; }
        .share-popover {
            display: none;
            position: absolute;
            right: 0;
            top: 100%;
            background: var(--bg-card, #fff);
            border: 1px solid var(--border, #ddd);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            padding: 5px 0;
            z-index: 99999;
            min-width: 180px;
            text-align: left;
        }
        .share-link {
            padding: 12px 15px;
            cursor: pointer;
            display: flex;
            align-items: center;
            font-size: 0.95rem;
            color: var(--text-main, #333);
            border-bottom: 1px solid rgba(0,0,0,0.05);
            transition: background 0.2s;
        }
        .share-link:hover { background: var(--bg-main, #f5f5f5); }
    </style>

    <script>
    // DEFINE STATE
    window.currentTafsirState = { surah: 0, ayat: 0 };

    // --- 1. TAFSIR (Unique Name) ---
    window.labmu_openTafsir = function(ayatNum, surahNum) {
        var modal = document.getElementById('tafsir-modal');
        if(modal) {
            modal.style.display = 'flex';
            document.getElementById('tafsir-ayat-badge').innerText = 'Ayat ' + ayatNum;
            document.body.style.overflow = 'hidden';
            window.currentTafsirState = { surah: surahNum, ayat: ayatNum };
            var sel = document.getElementById('select-tafsir-source'); if(sel) sel.value = 'ibnukatsir';
            window.labmu_fetchTafsirData();
        }
    };

    window.labmu_fetchTafsirData = function() {
        var source = document.getElementById('select-tafsir-source').value;
        var state = window.currentTafsirState;
        document.getElementById('tafsir-text').style.display = 'none';
        document.getElementById('tafsir-loading').style.display = 'block';

        fetch('/api/quran/data-tafsir/' + state.surah + '?source=' + source)
            .then(r => r.json())
            .then(data => {
                window.labmu_renderTafsir(data);
            })
            .catch(err => {
                document.getElementById('tafsir-loading').style.display = 'none';
                document.getElementById('tafsir-text').style.display = 'block';
                document.getElementById('tafsir-text').innerHTML = '<span style="color:red;">Gagal memuat tafsir.</span>';
            });
    };

    window.labmu_renderTafsir = function(data) {
        var state = window.currentTafsirState;
        document.getElementById('tafsir-loading').style.display = 'none';
        document.getElementById('tafsir-text').style.display = 'block';
        if (!data || !data.data || data.data.length === 0) {
            var msg = '<i>Data untuk <b>' + (data.sumber || 'tafsir ini') + '</b> belum tersedia.</i>';
            if (data.sumber && (data.sumber.includes('Ibnu Katsir') || data.sumber.includes('At-Tanwir'))) { msg += '<br><br><small style="opacity:0.7">*Silakan pilih "Kemenag (Tahlili)" untuk data lengkap.</small>'; }
            document.getElementById('tafsir-text').innerHTML = msg;
            return;
        }
        var ayatData = data.data.find(d => d.ayat == state.ayat);
        if (ayatData) { document.getElementById('tafsir-text').innerHTML = '<b>' + (data.sumber || 'Tafsir') + ':</b><br><br>' + ayatData.teks; } 
        else { document.getElementById('tafsir-text').innerHTML = '<i>Tafsir untuk ayat ini tidak ditemukan.</i>'; }
    };

    window.labmu_copyTafsir = function() {
        var text = document.getElementById('tafsir-text').innerText;
        window.labmu_forceCopy(text);
    };

    window.labmu_closeTafsir = function() {
        document.getElementById('tafsir-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    // --- 2. SHARE (Unique Name & Logic) ---
    window.labmu_toggleShare = function(id) {
        var el = document.getElementById('share-pop-' + id);
        document.querySelectorAll('.share-popover').forEach(p => { 
            if(p.id !== 'share-pop-' + id) p.style.display = 'none'; 
        });
        if(el) el.style.display = (el.style.display === 'block') ? 'none' : 'block';
    };

    window.addEventListener('click', function(e) {
        if (!e.target.closest('.btn-action') && !e.target.closest('.share-popover')) {
            document.querySelectorAll('.share-popover').forEach(p => p.style.display = 'none');
        }
    });

    window.labmu_forceCopy = function(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => alert('Berhasil disalin!'))
            .catch(() => alert('Gagal copy otomatis.'));
        } else {
            var textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try { document.execCommand('copy'); alert('Berhasil disalin (manual)!'); } 
            catch (err) { alert('Gagal menyalin.'); }
            document.body.removeChild(textArea);
        }
    };

    window.labmu_doShare = function(el) {
        try {
            var type = el.getAttribute('data-type');
            var id = el.getAttribute('data-id');
            var elSurat = document.getElementById('meta-surat-' + id);
            var elArab = document.getElementById('text-ayat-' + id);
            var elIndo = document.getElementById('text-indo-' + id);

            if (!elSurat) { alert('Error: Data surat tidak terbaca.'); return; }

            var surat = elSurat.value;
            var arab = elArab ? elArab.value : '';
            var indo = elIndo ? elIndo.value : '';
            var url = window.location.href.split('#')[0] + '#ayat-' + id;
            var textRaw = 'QS. ' + surat + ':' + id + '\\n' + arab + '\\n' + indo + '\\n\\nLink: ' + url;
            var encodedText = encodeURIComponent(textRaw);
            var encodedUrl = encodeURIComponent(url);

            if (type === 'wa') window.open('https://wa.me/?text=' + encodedText, '_blank');
            else if (type === 'fb') window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl, '_blank');
            else if (type === 'x') window.open('https://twitter.com/intent/tweet?text=' + encodedText, '_blank');
            else if (type === 'tele') window.open('https://t.me/share/url?url=' + encodedUrl + '&text=' + encodedText, '_blank');
            else if (type === 'copy') window.labmu_forceCopy('QS. ' + surat + ':' + id + '\\n' + arab + '\\n' + indo + '\\nLink: ' + url);
            
            document.getElementById('share-pop-' + id).style.display = 'none';
        } catch(e) { alert('Error System: ' + e.message); }
    };
    </script>
    `;

    const html = `
      <div style="text-align:center; padding:10px 0 25px; border-bottom: 1px solid var(--border); margin-bottom: 30px;">
          <h1 style="font-size:2.5rem; color:var(--primary); margin:0; font-family: 'Amiri', serif;">${namaLatin}</h1>
          <p style="color:var(--text-muted); font-size: 1.1rem;">${s.arti || ''} • ${s.jumlahAyat || s.jumlah_ayat} Ayat • ${s.tempatTurun || s.tempat_turun}</p>
          ${playAllBtn}
      </div>
      <div class="ayat-container">${ayatListHtml}</div>
      <div style="display:flex; justify-content:space-between; padding:40px 0; border-top: 1px solid var(--border); margin-top: 50px;">
          ${s.suratSebelumnya ? `<a href="/${slugify(s.suratSebelumnya.namaLatin || s.suratSebelumnya.nama_latin)}" class="surat-card" style="padding:12px 25px; text-decoration:none; background:var(--bg-card); border-radius:10px; border:1px solid var(--border); color:var(--text-main);">&larr; ${s.suratSebelumnya.namaLatin || s.suratSebelumnya.nama_latin}</a>` : '<div></div>'}
          ${s.suratSelanjutnya ? `<a href="/${slugify(s.suratSelanjutnya.namaLatin || s.suratSelanjutnya.nama_latin)}" class="surat-card" style="padding:12px 25px; text-decoration:none; background:var(--bg-card); border-radius:10px; border:1px solid var(--border); color:var(--text-main);">${s.suratSelanjutnya.namaLatin || s.suratSelanjutnya.nama_latin} &rarr;</a>` : '<div></div>'}
      </div>
      ${modalHtml}
    `;
    return _layout(html, namaLatin, ctx);
};
