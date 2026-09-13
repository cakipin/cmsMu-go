export const agensLogic = `
    isLoadingAgens: false,
    showAgenModal: false,
    showViewModal: false,
    editingAgenId: null,
    searchAgen: '',
    agenPage: 1,
    agenLimit: 15,
    agensList: [],
    viewingAgen: {},
    agenForm: { name:'', phone:'', whatsapp:'', address:'', area:'', map_link:'' },

    
    pagedAgens() {
        const filtered = this.filteredAgens();
        const start = (this.agenPage - 1) * this.agenLimit;
        return filtered.slice(start, start + this.agenLimit);
    },
    totalAgenPages() {
        return Math.max(1, Math.ceil(this.filteredAgens().length / this.agenLimit));
    },
    nextAgenPage() {
        if (this.agenPage < this.totalAgenPages()) this.agenPage++;
    },
    prevAgenPage() {
        if (this.agenPage > 1) this.agenPage--;
    },

    filteredAgens() {
        if (!this.searchAgen) return this.agensList;
        const q = this.searchAgen.toLowerCase();
        return this.agensList.filter(a => 
            (a.name && a.name.toLowerCase().includes(q)) || 
            (a.area && a.area.toLowerCase().includes(q)) || 
            (a.phone && a.phone.toLowerCase().includes(q))
        );
    },

    async loadAgens() {
        this.isLoadingAgens = true;
        try {
            let res = await fetch('/api/agens', { headers: { 'Authorization': this.token } });
            if(res.status === 401) return this.logout();
            if(!res.ok) return;
            let json = await res.json();
            if(json.success) {
                this.agensList = json.data || [];
            }
        } catch(e) { 
            console.error(e); 
        } finally { 
            this.isLoadingAgens = false; 
        }
    },

    openAddAgen() {
        this.editingAgenId = null;
        this.agenForm = { name:'', phone:'', whatsapp:'', address:'', area:'', map_link:'' };
        this.showAgenModal = true;
    },

    editAgen(a) {
        this.editingAgenId = a.id;
        this.agenForm = { name: a.name, phone: a.phone, whatsapp: a.whatsapp, address: a.address, area: a.area, map_link: a.map_link };
        this.showAgenModal = true;
    },

    viewAgen(a) {
        this.viewingAgen = a;
        this.showViewModal = true;
    },

    async saveAgen() {
       if(!this.agenForm.name) return alert('Nama Agen wajib diisi');
       
       try {
          const url = this.editingAgenId ? ('/api/agens/' + this.editingAgenId) : '/api/agens';
          const method = this.editingAgenId ? 'PUT' : 'POST';

          let res = await fetch(url, {
             method: method,
             headers: { 'Content-Type':'application/json', 'Authorization': this.token },
             body: JSON.stringify(this.agenForm)
          });

          let json = await res.json();
          if(json.success) {
             this.showAgenModal = false;
             this.loadAgens(); 
          } else {
             alert('Gagal: ' + json.error);
          }
       } catch(e) { alert('Error network'); }
    },

    async deleteAgen(id) {
       if(!confirm('Hapus agen ini?')) return;
       try {
          await fetch('/api/agens/' + id, { method: 'DELETE', headers: { 'Authorization': this.token } });
          this.loadAgens();
       } catch(e) { alert('Gagal hapus'); }
    }
`;
