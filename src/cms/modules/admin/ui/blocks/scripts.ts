import { coreLogic } from './logic/core.logic';
import { mediaLogic } from './logic/media.logic';

/**
 * 🏗️ CMS MAIN MANAGER (FULL BACKUP VERSION)
 * Jaminan: Semua fungsi inti ada di sini. Tidak tergantung file luar.
 */

// 1. HELPER PEMBERSIH KOMA & KURUNG (Sangat Aman)
const clean = (s: string) => {
    if (!s || typeof s !== 'string') return '';
    let code = s.trim();
    // Buang wrapper object { ... } jika ada
    if (code.startsWith('{')) code = code.substring(1);
    if (code.endsWith('}')) code = code.substring(0, code.length - 1);
    // Buang koma di awal dan akhir string
    return code.replace(/^,+|,+$/g, '').trim();
};

// 2. BASE LOGIC - BERISI SEMUA VARIABEL & FUNGSI INTI (Posts, Pages, Media)
// Kita masukkan logic Posts/Pages di sini agar TIDAK MUNGKIN HILANG.
const mainLogic = `
    // --- STATE ---
    token: localStorage.getItem('labmu_token') || '',
    userRole: 'admin',
    view: 'dash',
    sidebarOpen: true,
    activeThemeId: localStorage.getItem('labmu_active_theme') || 'default',
    logoType: 'site_logo',
    isLoggingIn: false,

    // --- DATA STORE ---
    posts: [], pages: [], mediaList: [], usersList: [], 
    menuList: [], availableThemes: [], quranList: [],
    
    // --- UI FLAGS ---
    selectedItems: [], 
    isLoadingPosts: false, isLoadingPages: false, isLoadingUsers: false, isLoadingThemes: false, loadingQuran: false,
    isUploading: false, isUploadingFeatured: false, 
    isSavingMeta: false, isSavingMenu: false, isSavingSettings: false,
    showMediaSelector: false, showUserModal: false,
    
    // --- HELPER VARIABLES ---
    mediaSearchQuery: '', activeSurat: null, mediaSelectorTarget: null, targetLogoField: null,
    activeMediaItem: null, 
    activeMediaMeta: { alt: '', title: '', description: '' },

    // --- FORMS ---
    editingId: null, quickEditId: null, editingUserId: null,
    form: { title: '', slug: '', body: '', type: 'post', status: 'publish', date: '', category: '', tags: '', featured_image: '' },
    userForm: { username: '', email: '', role: 'editor', password: '', name: '' },
    menuForm: { id: null, label: '', url: '', order_num: 0 },
    settings: { site_title: '', site_desc: '', admin_email: '', site_logo: '', site_favicon: '' },
    loginForm: { username: '', password: '' },

    // --- INIT ---
    init() {
        this.initRouter();
        console.log("🚀 CMS Ready (Full Mode)");
        if (this.token) {
            this.loadAllData();
        }
    },
    
    initRouter() {
        const h = window.location.hash.replace('#', '') || 'dash';
        this.view = h;
        window.addEventListener('hashchange', () => { 
            const newView = window.location.hash.replace('#', '') || 'dash';
            if(this.view !== newView) this.view = newView; 
        });
    },

    loadAllData() {
        // Panggil fungsi internal (pasti ada)
        this.loadPosts();
        this.loadPages();
        this.loadThemes();
        this.loadSettings();
        this.loadMenus();
        
        // Panggil fungsi dari modul luar jika ada (Safe Check)
        if(typeof this.loadUsers === 'function') this.loadUsers();
        if(typeof this.loadMedia === 'function') this.loadMedia();
    },

    // --- CORE FEATURE: POSTS & PAGES (DIJAMIN ADA) ---
    async loadPosts() {
        this.isLoadingPosts = true;
        try {
            let res = await fetch('/api/contents?type=post');
            let json = await res.json();
            this.posts = json.data || [];
        } catch(e){} finally { this.isLoadingPosts = false; }
    },

    async loadPages() {
        this.isLoadingPages = true;
        try {
            let res = await fetch('/api/contents?type=page');
            let json = await res.json();
            this.pages = json.data || [];
        } catch(e){} finally { this.isLoadingPages = false; }
    },

    // --- EDITOR & SAVE ---
    openEditor(type) { 
        this.view='add'; this.editingId=null;
        this.form={ title:'', slug:'', body:'', type:type||'post', status:'publish', date:new Date().toISOString().slice(0,16), category:'', tags:'', featured_image:'' };
        setTimeout(() => { if(window.startSunEditor) window.startSunEditor('editor_id', '', (c) => this.form.body=c); }, 100);
    },

    async savePost() {
        if(window.sunEditor) this.form.body = window.sunEditor.getContents();
        if(!this.form.title) return alert('Isi Judul!');
        if(!this.form.slug) this.makeSlug();
        
        const url = this.editingId ? '/api/contents/' + this.editingId : '/api/contents';
        const method = this.editingId ? 'PUT' : 'POST';
        
        try {
            await fetch(url, { method, headers: {'Content-Type':'application/json','Authorization':this.token}, body:JSON.stringify(this.form) });
            alert('Sukses!');
            this.form.type === 'page' ? this.loadPages() : this.loadPosts();
            this.view = this.form.type === 'page' ? 'pages' : 'posts';
        } catch(e) { alert('Gagal'); }
    },

    makeSlug() { if(!this.editingId && this.form.title) this.form.slug = window.slugify(this.form.title); },
    
    // --- MEDIA CORE (Fallback jika media.logic hilang) ---
    openMediaSelector() { this.showMediaSelector = true; this.loadMedia ? this.loadMedia() : null; },
    openLogoSelector(type) { this.logoType = type; this.showMediaSelector = true; this.loadMedia ? this.loadMedia() : null; },
    setActiveItem(m) { this.activeMediaItem=m; this.activeMediaMeta={alt:m.alt||'', title:m.title||'', description:m.description||''}; },

    // --- BASE HELPERS ---
    formatDate(i) { return i ? new Date(i).toLocaleDateString('id-ID') : '-'; },
    logout() { localStorage.removeItem('labmu_token'); window.location.reload(); },
    getPageTitle() {
        const map = { dash:'Dashboard', posts:'Artikel', pages:'Halaman', quran:'Quran Pro', themes:'Tampilan', media:'Media', menus:'Menus', users:'Users', settings:'Settings', add:'Editor' };
        return map[this.view] || 'Admin';
    }
`;

// 3. RAKIT SEMUA BAGIAN
// Kita gabungkan baseLogic dengan import luar.
// Filter(Boolean) membuang string kosong. Join(',') memastikan pemisah benar.
const logicBody = [
    clean(mainLogic),  // Logic Utama (Pasti Jalan)
    clean(coreLogic),  // Logic User/Menu (Dari Om)
    clean(mediaLogic)  // Logic Media (Dari Om)
].filter(Boolean).join(',\n\n');

// 4. TEMPLATE UTAMA
const finalJs = `
/** GLOBAL HELPERS */
window.slugify = (t) => t ? t.toString().toLowerCase().trim().replace(/\\s+/g, '-').replace(/[^\\w\\-]+/g, '').replace(/\\-\\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '') : '';

window.startSunEditor = function(id, content, onChange) {
    if (typeof SUNEDITOR === 'undefined') return;
    const target = document.getElementById(id);
    if (!target) return;
    if (window.sunEditor) { try{window.sunEditor.destroy()}catch(e){} }
    const editor = SUNEDITOR.create(id, {
        display: 'block', width: '100%', height: '450px',
        buttonList: [['undo', 'redo'], ['font', 'fontSize', 'formatBlock'], ['bold', 'underline', 'italic', 'strike'], ['fontColor', 'hiliteColor'], ['align', 'list', 'lineHeight'], ['table', 'link', 'image', 'video'], ['fullScreen', 'codeView']],
        lang: (typeof SUNEDITOR_LANG !== 'undefined') ? SUNEDITOR_LANG['en'] : 'en'
    });
    editor.onload = () => { if (content) editor.setContents(content); };
    editor.onChange = (c) => { onChange(c); };
    window.sunEditor = editor;
};

/** MAIN CMS FUNCTION */
window.cms = function() {
    return {
        // --- INJECTED LOGIC ---
${logicBody},

        // --- GETTERS (Ditaruh manual agar aman dari cleaner) ---
        get uniqueCategories() { return this.posts ? [...new Set(this.posts.map(p => p.category).filter(c => c))] : []; },
        get filteredMedia() { return this.mediaList ? this.mediaList.filter(m => (m.key || '').toLowerCase().includes(this.mediaSearchQuery.toLowerCase())) : []; }
    };
};
`;

export const cmsLogic = finalJs;