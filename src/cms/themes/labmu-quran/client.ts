// FILE: src/themes/labmu-quran/client.ts

const t1 = '<' + 'script' + '>';
const t2 = '<' + '/' + 'script' + '>';

const js = `
  // --- SYSTEM LOGGER ---
  // Ini akan menangkap semua error merah di Console Browser
  window.onerror = function(msg, url, line) {
      const errTxt = "JS Error: " + msg + "\\nLine: " + line;
      console.error(errTxt);
      // Munculkan toast merah biar Om tau ada error
      if(window.showToast) window.showToast("⚠️ ERROR: " + msg);
      return false;
  };

  const BASE_URL = 'https://mirrors.quranicaudio.com/everyayah';
  // ... (SISA CONFIG SEPERTI SEBELUMNYA) ...

  // Mapping Folder Sama seperti sebelumnya
  const AUDIO_DATA = {
      '01': { name: 'Abdullah Al-Juhany', folder: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps' },
      '02': { name: 'Abdul Muhsin Al-Qasim', folder: 'Abdul_Muhsin_Al_Qasim_192kbps' },
      '03': { name: 'Abdurrahman As-Sudais', folder: 'Abdurrahmaan_As-Sudais_192kbps' },
      '04': { name: 'Ibrahim Al-Akhdar', folder: 'Ibrahim_Akhdar_32kbps' },
      '05': { name: 'Misyari Rasyid (Default)', folder: 'Alafasy_128kbps' }
  };

  window.state = {
      dark: null === 'true',
      latin: null !== 'false',
      id: null !== 'false',
      en: null === 'true',
      tajwid: null === 'true',
      qari: null || '05',
      activeSurah: 0, activeAyat: 0, autoNext: false
  };

  function pad3(n) { return String(n).padStart(3, '0'); }

  window.playAyat = function(surah, ayat, isAuto = false) {
      window.state.activeSurah = parseInt(surah);
      window.state.activeAyat = parseInt(ayat);
      window.state.autoNext = isAuto;

      const qData = AUDIO_DATA[window.state.qari] || AUDIO_DATA['05'];
      const url = BASE_URL + '/' + qData.folder + '/' + pad3(surah) + pad3(ayat) + '.mp3';

      console.log('[AUDIO] Trying to play:', url); // <--- LOG AUDIO

      const player = document.getElementById('main-player');
      const container = document.getElementById('player-container');
      const title = document.getElementById('player-title');

      if(container) container.style.display = 'flex';
      if(title) title.innerText = 'QS. ' + surah + ':' + ayat + ' (' + qData.name + ')';

      if(player) {
          player.pause();
          player.removeAttribute('crossorigin');
          player.src = url;
          player.load();

          const p = player.play();
          if (p !== undefined) {
              p.catch(e => {
                  console.error('[AUDIO FAIL]', e); // <--- LOG ERROR AUDIO
                  window.showToast('Gagal Putar: ' + e.message);
              });
          }

          player.onended = function() {
              if(window.state.autoNext) {
                  var nxt = window.state.activeAyat + 1;
                  var el = document.getElementById('ayat-' + nxt);
                  if(el) {
                      el.scrollIntoView({behavior: "smooth", block: "center"});
                      window.playAyat(window.state.activeSurah, nxt, true);
                  } else {
                      window.state.autoNext = false;
                  }
              }
          };
      }
  };

  // ... (SISA KODE LAIN SAMA PERSIS DENGAN YANG FIXED) ...

  window.playFull = function(s) { window.playAyat(s, 1, true); };
  window.closePlayer = function() { var p=document.getElementById('main-player'); if(p) p.pause(); document.getElementById('player-container').style.display='none'; window.state.autoNext=false; };
  window.selectQari = function(id) { (void 0); var menu = document.getElementById('qari-list'); if(menu) menu.style.display = 'none'; location.reload(); };
  window.selectQariMobile = function(val) { window.selectQari(val); };
  window.toggleQariMenu = function() { var el = document.getElementById('qari-list'); if(el) el.style.display = (el.style.display === 'block') ? 'none' : 'block'; };
  window.handleSearch = function(e) { var v = document.getElementById('searchBox').value.trim(); if(e && e.key === "Enter") { if(v.length < 3) return window.showToast('Min 3 huruf'); window.location.href = '/api/quran/tematik?q=' + encodeURIComponent(v); return; } var cards = document.querySelectorAll('.surat-card'); if(cards.length) cards.forEach(el => { var n = el.getAttribute('data-name') || ''; el.style.display = (v === '' || n.includes(v.toLowerCase())) ? 'flex' : 'none'; }); };
  window.updateUI = function() { document.body.className = window.state.dark ? 'dark' : ''; ['latin', 'id', 'en', 'tajwid'].forEach(k => { document.body.classList.toggle('show-' + k, window.state[k]); var btn = document.getElementById('btn-' + k); if(btn) btn.classList.toggle('active', window.state[k]); }); var qN = (AUDIO_DATA[window.state.qari] || AUDIO_DATA['05']).name; var lbl = document.getElementById('qari-label-desktop'); if(lbl) lbl.innerText = qN.split(' ')[0]; var sel = document.getElementById('qari-select-mobile'); if(sel) sel.value = window.state.qari; var hB = document.getElementById('hijri-badge-desktop'); if(hB && typeof getHijriString === 'function') { var masehi = new Date().toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'}); hB.innerHTML = '<div class="calendar-khgt">' + getHijriString() + '</div><div class="calendar-masehi">' + masehi + '</div>'; } };
  window.toggleMode = function(k) { if(k === 'theme') { window.state.dark = !window.state.dark; (void 0); } else { window.state[k] = !window.state[k]; (void 0); } window.updateUI(); };
  window.toggleSidebar = function() { var sb = document.getElementById('mobile-sidebar'); var ov = document.getElementById('sidebar-overlay'); if(sb) sb.classList.toggle('open'); if(ov) ov.classList.toggle('show'); };
  window.shareAyat = function(t,n,a,ar,id) { var txt = "QS. "+n+":"+a+"\\n\\n"+ar+"\\n\\n"+id+"\\n\\nLink: "+window.location.href.split('#')[0]+'#ayat-'+a; if(t==='wa') window.open('https://api.whatsapp.com/send?text='+encodeURIComponent(txt), '_blank'); else { navigator.clipboard.writeText(txt); window.showToast('Disalin!'); } document.querySelectorAll('.share-popover').forEach(p => p.style.display='none'); };
  window.toggleShare = function(id) { var el = document.getElementById('share-pop-' + id); document.querySelectorAll('.share-popover').forEach(p => { if(p!==el) p.style.display='none'; }); if(el) el.style.display = (el.style.display==='block')?'none':'block'; };
  window.showToast = function(msg) { var x = document.getElementById("toast"); if(x) { x.innerText = msg; x.style.visibility = "visible"; x.style.opacity = "1"; setTimeout(() => { x.style.visibility = "hidden"; x.style.opacity = "0"; }, 2000); } };
  function getHijriString() { try { var today = new Date(); var d=today.getDate(), m=today.getMonth()+1, y=today.getFullYear(); if(m<3) { y-=1; m+=12; } var jd = Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+(2-Math.floor(y/100)+Math.floor(Math.floor(y/100)/4))-1524; var z=jd-1948084, cyc=Math.floor(z/10631), j=Math.floor((z-cyc*10631-0.1335)/354.366); var iy=30*cyc+j, im=Math.floor((z-cyc*10631-Math.floor(j*354.366+0.1335)+28.5001)/29.5); if(im==13) im=12; var id=z-cyc*10631-Math.floor(j*354.366+0.1335)-Math.floor(29.5001*im-29); var months = ["Muharram","Safar","Rabi'ul Awal","Rabi'ul Akhir","Jumadil Awal","Jumadil Akhir","Rajab","Sya'ban","Ramadhan","Syawal","Dzulkaidah","Dzulhijjah"]; return id + " " + months[im-1] + " " + iy + " H"; } catch(e) { return ""; } }
  document.addEventListener('DOMContentLoaded', window.updateUI);
`;

export const clientScript = t1 + js + t2;