export const subscribersLogic = `
    searchSubscriber: '',
    subscribersList: [],
    pendingSubscribers: 0,

    async loadSubscribers() {
        try {
            let url = '/api/subscribers?page=1';
            if (this.searchSubscriber) {
                url += '&search=' + encodeURIComponent(this.searchSubscriber);
            }
            let res = await fetch(url, { headers: { 'Authorization': this.token } });
            if (!res.ok) return;
            let json = await res.json();
            if (json.success) {
                this.subscribersList = json.data;
                this.pendingSubscribers = json.pending || 0;
            }
        } catch(e) {
            // endpoint not available in core CMS
        }
    },

    async approveSub(id) {
        if(!confirm('Setujui pembayaran pelanggan ini dan aktifkan akses Subscriber Pro?')) return;
        try {
            let res = await fetch('/api/subscribers/' + id + '/approve', { 
                method: 'PUT', 
                headers: { 'Authorization': this.token } 
            });
            let json = await res.json();
            if (json.success) {
                alert('Pelanggan disetujui!');
                this.loadSubscribers();
            } else {
                alert('Gagal: ' + json.error);
            }
        } catch(e) { alert('Error network'); }
    },

    async rejectSub(id) {
        if(!confirm('Tolak langganan ini?')) return;
        try {
            let res = await fetch('/api/subscribers/' + id + '/reject', { 
                method: 'PUT', 
                headers: { 'Authorization': this.token } 
            });
            let json = await res.json();
            if (json.success) {
                this.loadSubscribers();
            } else {
                alert('Gagal: ' + json.error);
            }
        } catch(e) { alert('Error network'); }
    },

    async deleteSub(id) {
        if(!confirm('Hapus riwayat langganan ini permanen?')) return;
        try {
            await fetch('/api/subscribers/' + id, { method: 'DELETE', headers: { 'Authorization': this.token } });
            this.loadSubscribers();
        } catch(e) { alert('Gagal hapus'); }
    }
`;
