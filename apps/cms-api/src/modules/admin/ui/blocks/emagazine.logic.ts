export const emagazineLogic = `
    magTab: 'editions',
    magazinesList: [],
    magLoading: false,
    magSearch: '',
    magCurrentPage: 1,
    magItemsPerPage: 10,

    getFilteredMagazines() {
        let list = this.magazinesList || [];
        if (this.magSearch && this.magSearch.trim() !== '') {
            const q = this.magSearch.toLowerCase().trim();
            list = list.filter(m => 
                (m.title && m.title.toLowerCase().includes(q)) ||
                (m.edition_number && m.edition_number.toLowerCase().includes(q)) ||
                (m.publication_date && m.publication_date.toLowerCase().includes(q)) ||
                (m.slug && m.slug.toLowerCase().includes(q))
            );
        }
        return list;
    },

    getPaginatedMagazines() {
        const start = (this.magCurrentPage - 1) * this.magItemsPerPage;
        return this.getFilteredMagazines().slice(start, start + this.magItemsPerPage);
    },

    getMagTotalPages() {
        return Math.ceil(this.getFilteredMagazines().length / this.magItemsPerPage) || 1;
    },
    showMagModal: false,
    coverPreviewUrl: '',
    plansLoading: false,
    plansSaving: false,
    plansAlert: { show: false, type: 'success', message: '' },
    plansConfig: {
        plans: [
            { id: '1_bulan', name: '1 Bulan', months: 1, price: 50000, badge: '', desc: 'Akses Penuh 30 Hari', active: true },
            { id: '3_bulan', name: '3 Bulan', months: 3, price: 135000, badge: 'HEMAT 10%', desc: 'Rp 45.000 / bln', active: true },
            { id: '6_bulan', name: '6 Bulan', months: 6, price: 255000, badge: 'HEMAT 15%', desc: 'Rp 42.500 / bln', active: true },
            { id: '1_tahun', name: '1 Tahun', months: 12, price: 480000, badge: '⭐ PALING HEMAT', desc: 'Rp 40.000 / bln (20% Off)', active: true }
        ],
        bank1: { name: 'Bank Syariah Indonesia (BSI)', account: '8877665544', holder: "Suara 'Aisyiyah" },
        bank2: { name: 'Bank Central Asia (BCA)', account: '', holder: "Suara 'Aisyiyah" },
        qrisImage: '',
        whatsapp: '081234567890',
        instructions: 'Transfer sesuai nominal paket ke rekening resmi di atas, kemudian unggah foto bukti transfer pada formulir pembayaran.',
        defaultPreviewPages: 5
    },
    magForm: {
        id: null,
        title: '',
        slug: '',
        edition_number: '',
        publication_date: '',
        cover_image: '',
        preview_pages: 5,
        total_pages: 0,
        is_free: 0,
        status: 'published',
        description: ''
    },
    pdfConverting: false,
    pdfConvertSuccess: false,
    pdfConvertError: false,
    pdfConvertMsg: '',
    convertedCoverBlob: null,

    async ensurePdfJs() {
        if (window.pdfjsLib) return window.pdfjsLib;
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
                if (window.pdfjsLib) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    resolve(window.pdfjsLib);
                } else {
                    reject(new Error('PDF.js gagal diinisialisasi'));
                }
            };
            script.onerror = () => reject(new Error('Gagal mengunduh script PDF.js'));
            document.head.appendChild(script);
        });
    },

    async handlePdfFileChange(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        this.pdfConverting = true;
        this.pdfConvertSuccess = false;
        this.pdfConvertError = false;
        this.pdfConvertMsg = '';
        this.convertedCoverBlob = null;

        try {
            const pdfjs = await this.ensurePdfJs();
            const arrayBuffer = await file.arrayBuffer();
            const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;

            // 1. Otomatis set total halaman
            this.magForm.total_pages = doc.numPages;

            // 2. Render Halaman 1 ke WebP beresolusi tinggi (scale 2.0)
            const page1 = await doc.getPage(1);
            const viewport = page1.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');

            await page1.render({ canvasContext: ctx, viewport: viewport }).promise;

            const blob = await new Promise((resolve) => {
                canvas.toBlob((b) => resolve(b), 'image/webp', 0.92);
            });

            if (blob) {
                this.convertedCoverBlob = blob;
                this.coverPreviewUrl = URL.createObjectURL(blob);
                this.pdfConvertSuccess = true;
                this.pdfConvertMsg = '✓ Berhasil! Terdeteksi ' + doc.numPages + ' halaman. Halaman 1 otomatis dijadikan gambar sampul.';
            } else {
                throw new Error('Gagal menghasilkan berkas gambar dari canvas');
            }
        } catch (err) {
            console.error('Error auto-converting PDF cover:', err);
            this.pdfConvertError = true;
            this.pdfConvertMsg = 'Peringatan: ' + (err.message || 'Gagal membaca PDF') + '. Anda tetap dapat mengunggah sampul manual.';
        } finally {
            this.pdfConverting = false;
        }
    },

    handleCoverFileChange(e) {
        const file = e.target.files && e.target.files[0];
        if (file) {
            this.convertedCoverBlob = null;
            this.coverPreviewUrl = URL.createObjectURL(file);
        } else {
            this.coverPreviewUrl = '';
        }
    },

    async loadMagazines() {
        try {
            const token = (window.getCmsToken ? window.getCmsToken() : '');
            const res = await fetch('/api/emagazine', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (res.ok) {
                this.magazinesList = await res.json();
            }
        } catch (e) {
            console.error('Gagal memuat e-majalah:', e);
        }
    },

    openMagModal(mag = null) {
        this.coverPreviewUrl = '';
        this.pdfConverting = false;
        this.pdfConvertSuccess = false;
        this.pdfConvertError = false;
        this.pdfConvertMsg = '';
        this.convertedCoverBlob = null;
        if (mag) {
            this.magForm = {
                id: mag.id,
                title: mag.title || '',
                slug: mag.slug || '',
                edition_number: mag.editionNumber || mag.edition_number || '',
                publication_date: mag.publicationDate || mag.publication_date || '',
                cover_image: mag.coverImage || mag.cover_image || '',
                preview_pages: mag.previewPages || mag.preview_pages || 5,
                total_pages: mag.totalPages || mag.total_pages || 0,
                is_free: mag.isFree !== undefined ? mag.isFree : 0,
                status: mag.status || 'published',
                description: mag.description || ''
            };
        } else {
            this.magForm = {
                id: null,
                title: '',
                slug: '',
                edition_number: '',
                publication_date: '',
                cover_image: '',
                preview_pages: 5,
                total_pages: 0,
                is_free: 0,
                status: 'published',
                description: ''
            };
        }
        const fileInput = document.getElementById('magPdfFile');
        if (fileInput) fileInput.value = '';
        const coverFileInput = document.getElementById('magCoverFile');
        if (coverFileInput) coverFileInput.value = '';
        this.showMagModal = true;
    },

    async saveMagazine() {
        if (!this.magForm.title) {
            alert('Judul edisi majalah wajib diisi!');
            return;
        }

        const fileInput = document.getElementById('magPdfFile');
        const file = fileInput ? fileInput.files && fileInput.files[0] : null;

        if (!this.magForm.id && !file) {
            alert('Berkas PDF majalah wajib dipilih!');
            return;
        }

        const coverFileInput = document.getElementById('magCoverFile');
        let coverFile = coverFileInput ? coverFileInput.files && coverFileInput.files[0] : null;

        // Gunakan sampul hasil auto-konversi PDF jika admin tidak memilih berkas sampul terpisah
        if (!coverFile && this.convertedCoverBlob) {
            coverFile = new File([this.convertedCoverBlob], (this.magForm.slug || 'sampul') + '-cover.webp', { type: 'image/webp' });
        }

        if (!this.magForm.id && !coverFile && !this.magForm.cover_image) {
            alert('Gambar sampul majalah wajib diunggah atau diisi URL-nya!');
            return;
        }

        this.magLoading = true;
        try {
            const token = (window.getCmsToken ? window.getCmsToken() : '');
            const formData = new FormData();
            formData.append('title', this.magForm.title);
            formData.append('slug', this.magForm.slug || '');
            formData.append('edition_number', this.magForm.edition_number || '');
            formData.append('publication_date', this.magForm.publication_date || '');
            formData.append('cover_image', this.magForm.cover_image || '');
            formData.append('preview_pages', String(this.magForm.preview_pages || 5));
            formData.append('total_pages', String(this.magForm.total_pages || 0));
            formData.append('is_free', String(this.magForm.is_free || 0));
            formData.append('status', this.magForm.status || 'published');
            formData.append('description', this.magForm.description || '');

            if (file) {
                formData.append('pdf_file', file);
            }

            if (coverFile) {
                formData.append('cover_file', coverFile);
            }

            const url = this.magForm.id ? '/api/emagazine/' + this.magForm.id : '/api/emagazine';
            const method = this.magForm.id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Authorization': 'Bearer ' + token },
                body: formData
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert(data.message || 'Edisi majalah berhasil disimpan!');
                this.showMagModal = false;
                await this.loadMagazines();
            } else {
                alert(data.error || 'Gagal menyimpan edisi majalah.');
            }
        } catch (e) {
            alert('Error: ' + e.message);
        } finally {
            this.magLoading = false;
        }
    },

    async deleteMagazine(id) {
        if (!confirm('Apakah Anda yakin ingin menghapus edisi majalah ini beserta berkasnya?')) return;
        try {
            const token = (window.getCmsToken ? window.getCmsToken() : '');
            const res = await fetch('/api/emagazine/' + id, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                await this.loadMagazines();
            } else {
                alert(data.error || 'Gagal menghapus majalah.');
            }
        } catch (e) {
            alert('Error: ' + e.message);
        }
    },

    async loadPlansConfig() {
        this.plansLoading = true;
        try {
            const token = (window.getCmsToken ? window.getCmsToken() : '');
            const res = await fetch('/api/emagazine/plans-config', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.plans) {
                    this.plansConfig = data;
                }
            }
        } catch (e) {
            console.error('Gagal memuat pengaturan paket:', e);
        } finally {
            this.plansLoading = false;
        }
    },

    async savePlansConfig() {
        this.plansSaving = true;
        this.plansAlert = { show: false, type: 'success', message: '' };
        try {
            const token = (window.getCmsToken ? window.getCmsToken() : '');
            const res = await fetch('/api/emagazine/plans-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(this.plansConfig)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                this.plansAlert = { show: true, type: 'success', message: data.message || 'Pengaturan paket & harga berhasil disimpan!' };
            } else {
                this.plansAlert = { show: true, type: 'error', message: data.error || 'Gagal menyimpan pengaturan paket.' };
            }
        } catch (e) {
            this.plansAlert = { show: true, type: 'error', message: 'Error: ' + e.message };
        } finally {
            this.plansSaving = false;
            setTimeout(() => {
                if (this.plansAlert.type === 'success') this.plansAlert.show = false;
            }, 4000);
        }
    },
`;
