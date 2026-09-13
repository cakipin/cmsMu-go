/**
 * 🚀 POST LOGIC (Fixed: List Actions & Editor Sync)
 * Menangani Hapus, View, dan Edit agar konten muncul.
 */

export const postLogic = {
    posts: [], 
    isLoading: false,

    // =========================================
    // 1. DATA PREPARATION (Payload Builder)
    // =========================================
    preparePayload(rawForm: any) {
        const form = JSON.parse(JSON.stringify(rawForm));

        // Ambil konten dari SunEditor jika tersedia
        let currentContent = '';
        if (typeof window !== 'undefined' && (window as any).cmsEditor) {
            currentContent = (window as any).cmsEditor.getContents();
        } else {
            currentContent = form.body || '';
        }

        // Normalisasi Status
        let statusInput = (form.status || 'draft').toString().toLowerCase();
        let finalStatus = (statusInput.includes('pub') || statusInput.includes('terbit')) ? 'publish' : 'draft';

        return {
            id: (form.id && form.id !== 'null') ? form.id : undefined,
            title: form.title || 'Untitled',
            slug: form.slug 
                ? form.slug.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
                : (form.title ? form.title.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '') : ''),
            
            body: currentContent, 
            status: finalStatus,
            category: (form.category && form.category !== 'null') ? form.category : 'Uncategorized',
            tags: (form.tags && form.tags !== 'null') ? form.tags : '',
            featured_image: form.featured_image || '',
            featured_image_caption: form.featured_image_caption || '',
            created_at: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
            author: form.author || 'Admin'
        };
    },

    // =========================================
    // 2. API ACTIONS (CRUD)
    // =========================================
    async loadPosts() {
        this.isLoading = true;
        try {
            const token = localStorage.getItem('labmu_token');
            const res = await fetch('/api/posts?t=' + Date.now(), {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!res.ok) throw new Error('Failed');
            
            const json = await res.json();
            const rawData = Array.isArray(json) ? json : (json.results || []);

            this.posts = rawData.map((p: any) => ({
                ...p,
                category: (p.category && p.category !== 'null') ? p.category : 'Uncategorized',
                tags: (p.tags && p.tags !== 'null') ? p.tags : '-',
                status: p.status || 'draft',
                body: p.body || '' // Pastikan body terbawa untuk keperluan Edit
            }));
        } catch (e) {
            this.posts = [];
        } finally {
            this.isLoading = false;
        }
    },

    async savePost(formInput: any) {
        const formToProcess = formInput || this.form;
        this.isLoading = true;
        try {
            const token = localStorage.getItem('labmu_token');
            const payload = this.preparePayload(formToProcess);
            const isEdit = payload.id !== undefined;
            const url = isEdit ? `/api/posts/${payload.id}` : '/api/posts';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (res.ok) {
                alert('Berhasil disimpan!');
                if (!isEdit) {
                   this.view = 'posts';
                }
                await this.loadPosts();
                return true;
            } else {
                alert('Gagal: ' + (result.error || 'Database Error'));
                return false;
            }
        } catch (e) {
            alert('Kesalahan koneksi.');
            return false;
        } finally {
            this.isLoading = false;
        }
    },

    // --- FIX FITUR HAPUS ---
    async deletePost(id: string) {
        if (!id) return;
        if (!confirm('Hapus post ini permanen?')) return;
        
        try {
            const token = localStorage.getItem('labmu_token');
            const res = await fetch(`/api/posts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (res.ok) {
                // Hapus dari tampilan segera (Optimistic Update)
                this.posts = this.posts.filter((p: any) => p.id !== id);
                // Sinkronisasi ulang
                await this.loadPosts();
            } else {
                alert('Gagal menghapus.');
            }
        } catch (e) { alert('Gagal koneksi.'); }
    },

    // =========================================
    // 3. UI HELPERS (Edit, View, Image)
    // =========================================
    
    // --- FITUR BARU: GETTERS UNTUK DROPDOWN & TAGS ---
    get uniqueCategories() {
        if (!this.posts || this.posts.length === 0) return ['Uncategorized'];
        const cats = this.posts
            .map((p: any) => p.category)
            .filter((c: any) => c && c !== '-' && c !== 'Uncategorized');
        return ['Uncategorized', ...new Set(cats)].sort();
    },

    get uniqueTags() {
        if (!this.posts || this.posts.length === 0) return [];
        const allTags = this.posts.flatMap((p: any) => (p.tags || '').split(','));
        const cleaned = allTags
            .map((t: string) => t.trim())
            .filter((t: string) => t && t !== '-' && t.length > 2); 
        return [...new Set(cleaned)].sort();
    },
    
    // --- UPDATE: Saat buka editor, load data dulu biar dropdown muncul ---
    openEditor(type: string) {
        this.view = 'add';
        this.editingId = null;
        // Reset Form
        this.form = { title:'', slug:'', body:'', status:'draft', category:'', tags:'', featured_image:'' };
        
        // Load data posts di background agar dropdown terisi
        if (this.posts.length === 0) this.loadPosts();

        // Init Editor
        setTimeout(() => {
            if(window.initCmsEditor) window.initCmsEditor('editor_id', '', (c:any) => this.form.body = c);
        }, 100);
    },

    // --- FIX EDIT POST (Kalender & Editor) ---
    editPost(item: any) {
        this.view = 'add';
        this.editingId = item.id;
        
        // Deep clone data item ke form global
        this.form = JSON.parse(JSON.stringify(item));
        
        // Load posts jika kosong agar dropdown categories muncul saat edit
        if (this.posts.length === 0) this.loadPosts();

        // FIX KALENDER: Konversi ISO (UTC) ke Local Time untuk input datetime-local
        if(this.form.created_at) {
            const date = new Date(this.form.created_at);
            // Menggeser waktu sesuai zona waktu lokal user (WIB/dll)
            const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
            // Ambil 16 karakter pertama: "YYYY-MM-DDTHH:mm"
            this.form.date = localDate.toISOString().slice(0,16);
        } else {
             // Jika kosong, pakai waktu sekarang
             const now = new Date();
             const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
             this.form.date = localNow.toISOString().slice(0,16);
        }

        // Init Editor dengan Content
        // Kita beri delay sedikit agar View 'add' selesai render dulu
        setTimeout(() => {
            if(window.initCmsEditor) {
                // Panggil init editor dan masukkan form.body
                window.initCmsEditor('editor_id', item.body || '', (c: string) => {
                    this.form.body = c;
                });
            }
        }, 100);
    },

    // --- BARU: FITUR VIEW POST ---
    viewPost(slug: string) {
        if (!slug) {
            alert('Slug belum ada.');
            return;
        }
        // Buka tab baru ke URL post (Sesuaikan domain jika perlu)
        window.open('/' + slug, '_blank');
    },

    // --- Image & Tags ---
    openFeaturedImageSelector() {
        this.mediaSelectorTarget = 'featured_image'; 
        this.view = 'media';
        if (this.loadMedia) this.loadMedia();
    },

    setFeaturedImage(url: string) {
        this.form.featured_image = url;
        this.mediaSelectorTarget = null;
        this.view = 'add';
    },
    
    removeFeaturedImage() {
        this.form.featured_image = '';
    },

    addTag(tagName: string) {
        if (!tagName) return;
        const raw = this.form.tags || '';
        const currentTags = raw.split(',').map((t: string) => t.trim()).filter(Boolean);
        if (!currentTags.includes(tagName)) {
            currentTags.push(tagName);
            this.form.tags = currentTags.join(', ');
        }
    },

    get availableCategories() {
        if (!this.posts || !Array.isArray(this.posts)) return ['Uncategorized'];
        const cats = this.posts.map((p: any) => p.category).filter((c: any) => c && c !== '-' && c !== 'null');
        return ['Uncategorized', ...new Set(cats)];
    }
};

// =========================================
// 4. CLIENT-SIDE EDITOR INIT
// =========================================
if (typeof window !== 'undefined') {
    (window as any).initCmsEditor = function(elementId: string, content: string, callback: any) {
        if ((window as any).cmsEditor) {
            try { (window as any).cmsEditor.destroy(); } catch (e) {}
        }
        
        setTimeout(() => {
            try {
                if ((window as any).SUNEDITOR) {
                    const editor = (window as any).SUNEDITOR.create(elementId, {
                        display: 'block', width: '100%', height: '500px',
                        buttonList: [
                            ['undo', 'redo'], ['font', 'fontSize', 'formatBlock'],
                            ['bold', 'underline', 'italic', 'strike'],
                            ['fontColor', 'hiliteColor'], ['align', 'list'], 
                            ['table', 'link', 'image', 'video', 'codeView']
                        ]
                    });
                    
                    // Set konten awal (SANGAT PENTING UTK EDIT)
                    editor.setContents(content || '');
                    
                    // Event Listener untuk update form saat ketik
                    editor.onChange = (c: string) => {
                        if(callback) callback(c);
                    };

                    (window as any).cmsEditor = editor;
                }
            } catch (e) { console.error('Editor Init Error:', e); }
        }, 150);
    };
}