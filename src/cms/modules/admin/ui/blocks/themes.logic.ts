export const themesLogic = `
    // LOAD THEMES
    async loadThemes() {
       try {
          // Panggil API
          let res = await fetch('/api/theme', { headers: { 'Authorization': this.token } });
          
          if(res.ok){
              let json = await res.json();
              if (json.success) {
                  this.availableThemes = json.data;
                  // Cari tema yang statusnya active = true
                  const active = this.availableThemes.find(t => t.active);
                  if(active) this.activeThemeId = active.id;
              }
          }
       } catch (e) { console.error('Gagal load themes', e); }
    },

    // ACTIVATE THEME
    async activateTheme(themeId) {
       if(!confirm('Aktifkan tema ini?')) return;
       
       try {
          let res = await fetch('/api/theme/activate', {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': this.token 
              },
              body: JSON.stringify({ themeId })
          });
          
          let json = await res.json();
          if (res.ok) {
              alert('✅ Tema Berhasil Diaktifkan!');
              this.loadThemes(); // Refresh list agar UI berubah
          } else {
              alert('Gagal: ' + (json.error || 'Server Error'));
          }
       } catch(e) { alert('Error Network'); }
    }
`;
// CATATAN PENTING: Jangan ada koma (,) di baris paling akhir ini.
// Karena di scripts.ts sudah ada koma setelah \${themesLogic},
