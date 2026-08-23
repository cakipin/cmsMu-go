export const mediaLogic = {
    mediaList: [],
    selectedItems: [], // Array untuk menampung ID item yang dicentang
    activeMediaItem: null, // Untuk menampilkan detail di sidebar (hanya jika 1 dipilih)
    activeMediaMeta: { alt: '', title: '', description: '', filename: '' },
    isUploading: false,
    isSavingMeta: false,
    isDeleting: false, // Loading state untuk hapus massal
    mediaSearchQuery: '',

    async loadMedia() {
        try {
            const token = '';
            if (!token) return;
            let res = await fetch('/api/media?t=' + Date.now(), {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            let json = await res.json();
            let rawData = Array.isArray(json) ? json : (json.data || json.results || []);
            this.mediaList = rawData.filter(m => !m.key.endsWith('/'));
            this.selectedItems = []; // Reset selection saat load
            this.activeMediaItem = null;
        } catch (e) {
            console.error("Gagal load media:", e);
            this.mediaList = [];
        }
    },

    // Toggle pilihan (Centang/Uncentang)
    toggleSelection(item) {
        const index = this.selectedItems.findIndex(i => i.id === item.id);
        if (index > -1) {
            this.selectedItems.splice(index, 1); // Hapus jika sudah ada
        } else {
            this.selectedItems.push(item); // Tambah jika belum ada
        }

        // Update Sidebar Logic:
        // Jika cuma 1 yg dipilih, tampilkan detailnya. Jika 0 atau >1, sembunyikan detail.
        if (this.selectedItems.length === 1) {
            this.setActiveItem(this.selectedItems[0]);
        } else {
            this.activeMediaItem = null;
        }
    },

    // Pilih Semua / Batal Pilih Semua
    toggleSelectAll() {
        if (this.selectedItems.length === this.filteredMedia.length) {
            this.selectedItems = []; // Unselect All
            this.activeMediaItem = null;
        } else {
            this.selectedItems = [...this.filteredMedia]; // Select All
            this.activeMediaItem = null;
        }
    },

    setActiveItem(m) {
        this.activeMediaItem = m;
        const currentFilename = m.key ? m.key.split('/').pop() : '';
        this.activeMediaMeta = {
            alt: m.alt || '',
            title: m.title || '',
            description: m.description || '',
            filename: currentFilename
        };
    },

    // Hapus Massal
    async deleteSelected() {
        if (this.selectedItems.length === 0) return;
        if (!confirm(`Yakin ingin menghapus ${this.selectedItems.length} file terpilih?`)) return;

        this.isDeleting = true;
        const token = '';

        // Loop hapus satu per satu (karena biasanya API delete per ID)
        // Bisa dioptimalkan jika API support bulk delete
        for (let item of this.selectedItems) {
            try {
                await fetch('/api/media/' + item.id, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + token }
                });
            } catch (e) { console.error('Gagal hapus', item.id); }
        }

        this.isDeleting = false;
        await this.loadMedia(); // Refresh list
    },

    // ... (Simpan Meta dan Upload tetap sama seperti sebelumnya) ...
    async saveMediaMeta() { /* Kode sama seperti sebelumnya */ },
    async uploadMedia(e) { /* Kode sama seperti sebelumnya */ },

    get filteredMedia() {
        return (this.mediaList||[]).filter(m =>
            (m.key||'').toLowerCase().includes((this.mediaSearchQuery||'').toLowerCase())
        );
    },

    // Helper untuk cek apakah item terpilih
    isSelected(item) {
        return this.selectedItems.some(i => i.id === item.id);
    }
};