import { agensLogic } from './agens.logic';
import { subscribersLogic } from './subscribers.logic';
import { emagazineLogic } from './emagazine.logic';
// FIX: Tambahkan ekstensi .ts pada SEMUA import agar konsisten dan terbaca loader
import { coreLogic } from './logic/core.logic.ts';
import { mediaLogic } from './logic/media.logic.ts';
import { postLogic } from './logic/post.logic.ts';
import { settingsLogic } from './logic/settings.logic.ts';
import { globalModals } from './modals.ts'; 
import { customEditorLogicScript } from './custom-editor.ts';
import { CORE_VERSION } from '../../../../addons/ota/services/ota.service';

/**
 * 🧱 CMS MAIN MANAGER (THE MASTER KEY - LOCKED VERSION)
 * File ini didesain agar TIDAK PERLU DIUBAH LAGI.
 */

// --- 1. ROBUST SERIALIZER ---
const serializeToScript = (obj: any) => {
    let props = [];
    for (let key in obj) {
        let val = obj[key];
        if (typeof val === 'function') {
            let fnStr = val.toString().trim();
            if (fnStr.startsWith('async')) {
                fnStr = fnStr.replace(/^async\s+[a-zA-Z0-9_$]+\s*/, 'async function ');
                if (fnStr.startsWith('async(') || fnStr.startsWith('async (')) {
                     fnStr = fnStr.replace('async', 'async function');
                }
            } 
            else if (!fnStr.startsWith('function') && !fnStr.startsWith('(')) {
                fnStr = fnStr.replace(/^[a-zA-Z0-9_$]+\s*/, 'function ');
            }
            props.push(`${key}: ${fnStr}`);
        } else {
            props.push(`${key}: ${JSON.stringify(val)}`);
        }
    }
    return `{ \n${props.join(',\n')} \n}`;
};

// Proses Inject ke Variabel Global
const coreScript = serializeToScript(coreLogic);
const mediaScript = serializeToScript(mediaLogic);
const postScript = serializeToScript(postLogic); 
const modalsScript = serializeToScript(globalModals); // FIX: Gunakan serializeToScript untuk modals

export const cmsLogic = `
/** A. INJECT MODULES KE WINDOW (CLIENT SIDE ONLY) */
if (typeof window !== 'undefined') {
    try {
        window.__CMS_CORE = ${coreScript};
        window.__CMS_MEDIA = ${mediaScript};
        window.__CMS_POST = ${postScript};
        window.__CMS_MODALS = ${modalsScript};
        window.__CMS_AGENS = { ${agensLogic} };
        window.__CMS_SUB = { ${subscribersLogic} }; // FIX: Inject script hasil serialisasi
        window.__CMS_MAG = { ${emagazineLogic} };
    } catch(e) { 
        console.error('❌ CMS Logic Inject Error:', e);
        window.__CMS_CORE={}; window.__CMS_MEDIA={}; window.__CMS_POST={}; window.__CMS_MODALS={}; window.__CMS_AGENS={}; window.__CMS_SUB={}; window.__CMS_MAG={};
    }
}

// Injeksi logika editor custom
${customEditorLogicScript}

// Injeksi logika pengaturan umum & OTA
${settingsLogic}

/** B. MAIN APP */
if (typeof window !== 'undefined') {
    window.cms = function() {
        return {
            // ============================
            // 1. BASE STATE
            // ============================
            token: (window.getCmsToken ? window.getCmsToken() : ''),
            userRole: 'admin',
            userName: '',
            userAvatar: '',
            userEmail: '',
            view: 'dash',
            sidebarOpen: true,
            activeThemeId: localStorage.getItem('labmu_active_theme') || 'default',
            logoType: 'site_logo',
            isLoggingIn: false,
            systemVersion: 'v' + CORE_VERSION,
            
            // Data Buckets
            posts: [], pages: [], mediaList: [], usersList: [], 
            menuList: [], availableThemes: [], selectedItems: [],
            dashboardStats: { posts: 0, pages: 0, media: 0, users: 0, sources: 0 },
            
            // UI Flags
            isLoadingPosts: false, isLoadingPages: false, isLoadingUsers: false, isLoadingThemes: false,
            isUploading: false, isUploadingFeatured: false, 
            isSavingMeta: false, isSavingMenu: false, isSavingSettings: false,
            showMediaSelector: false, showUserModal: false,
            
            // Helpers
            mediaSearchQuery: '', mediaSelectorTarget: null, targetLogoField: null, activeMediaItem: null,
            activeMediaMeta: { alt: '', title: '', description: '' },
            editingId: null, editingUserId: null,
            
            // Standard Forms
            form: { title: '', slug: '', body: '', excerpt: '', meta_title: '', meta_description: '', og_image: '', type: 'post', status: 'publish', date: '', category: '', tags: '', featured_image: '', allow_comments: 1 },
            userForm: { username: '', email: '', role: 'editor', password: '', name: '' },
            menuForm: { id: null, label: '', url: '', order_num: 0 },
            settings: { site_title: '', site_desc: '', admin_email: '', site_logo: '', site_favicon: '' },
            loginForm: { username: '', password: '' },

            // ============================
            // 2. EXPLICIT BRIDGING (Jaminan Fitur Muncul)
            // ============================
            loadPages() { if(window.__CMS_CORE?.loadPages) return window.__CMS_CORE.loadPages.call(this); },
            savePage() { if(window.__CMS_CORE?.savePage) return window.__CMS_CORE.savePage.call(this); },
            
            loadUsers() { if(window.__CMS_CORE?.loadUsers) return window.__CMS_CORE.loadUsers.call(this); },
            saveUser() { if(window.__CMS_CORE?.saveUser) return window.__CMS_CORE.saveUser.call(this); },
            deleteUser(id) { if(window.__CMS_CORE?.deleteUser) return window.__CMS_CORE.deleteUser.call(this, id); },
            
            loadSettings() { if(window.__CMS_CORE?.loadSettings) return window.__CMS_CORE.loadSettings.call(this); },
            saveSettings() { if(window.__CMS_CORE?.saveSettings) return window.__CMS_CORE.saveSettings.call(this); },
            async loadSystemVersion() {
                try {
                    const res = await fetch('/api/addons/ota/status');
                    if (res.ok) {
                        const json = await res.json();
                        const ver = json.data?.currentCoreVersion || json.data?.coreVersion;
                        if (ver) {
                            this.systemVersion = 'v' + String(ver).replace(/^v/, '');
                        }
                    }
                } catch(_) {}
            },
            
            loadMenus() { if(window.__CMS_CORE?.loadMenus) return window.__CMS_CORE.loadMenus.call(this); },
            loadMenu() { if(window.__CMS_CORE?.loadMenus) return window.__CMS_CORE.loadMenus.call(this); },
            saveMenu() { if(window.__CMS_CORE?.saveMenu) return window.__CMS_CORE.saveMenu.call(this); },
            
            loadPosts() { if(window.__CMS_POST?.loadPosts) return window.__CMS_POST.loadPosts.call(this); },
            savePost(frm) { if(window.__CMS_POST?.savePost) return window.__CMS_POST.savePost.call(this, frm || this.form); },
            deletePost(id) { if(window.__CMS_POST?.deletePost) return window.__CMS_POST.deletePost.call(this, id); },
            
            loadMedia() { if(window.__CMS_MEDIA?.loadMedia) return window.__CMS_MEDIA.loadMedia.call(this); },
            uploadMedia(files) { if(window.__CMS_MEDIA?.uploadMedia) return window.__CMS_MEDIA.uploadMedia.call(this, files); },

            // ============================
            // 3. MERGE LOGIC (Fallback & Modals)
            // ============================
            ...window.__CMS_CORE,
            ...window.__CMS_MEDIA,
            ...window.__CMS_POST,
            ...window.__CMS_MODALS,
            ...window.__CMS_AGENS,
            ...window.__CMS_SUB, // ADD: Merge Logic Modal agar bisa dipanggil dari HTML
            ...window.__CMS_MAG,

            // ============================
            // 4. SMART ACTIONS
            // ============================
            async save() {
                const v = this.view;
                const funcNamePlural = 'save' + v.charAt(0).toUpperCase() + v.slice(1); 
                const funcNameSingular = 'save' + v.slice(0, -1).charAt(0).toUpperCase() + v.slice(1, -1);

                if (typeof this[funcNamePlural] === 'function') {
                    await this[funcNamePlural]();
                } else if (v.endsWith('s') && typeof this[funcNameSingular] === 'function') {
                    await this[funcNameSingular]();
                } 
                else if (['add', 'edit'].includes(v)) {
                    if(this.form.type === 'page') {
                        if(this.savePage) await this.savePage();
                    } else {
                        if(this.savePost) await this.savePost(this.form);
                    }
                } else {
                    console.warn('⚠️ No save function for view:', v);
                }
            },



            // ============================
            // 5. INIT SYSTEM
            // ============================
            init() {
                this.posts = []; this.pages = []; this.mediaList = []; this.usersList = [];
                this.initRouter();
                this.loadSystemVersion();
                
                if (this.token) {
                    try { 
                        let base64 = this.token;
                        if (this.token.includes('.')) {
                            base64 = this.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'); 
                        }
                        const payload = JSON.parse(window.atob(base64));
                        this.userRole = payload.role || 'editor'; 
                        this.userName = payload.n || '';
                        this.userAvatar = payload.a || '';
                        this.userEmail = payload.email || '';
                    } catch(e) { this.userRole = 'editor'; } 

                    // Mutlak: Hanya superadmin dan admin yang boleh mengakses dasbor /admin
                    const isLoginPage = window.location.pathname.includes('/login');
                    const roleLower = String(this.userRole || '').toLowerCase();
                    if (!isLoginPage && roleLower !== 'superadmin' && roleLower !== 'admin') {
                        const u = encodeURIComponent(this.userName || 'me');
                        window.location.href = '/@' + u;
                        return;
                    }

                    setTimeout(() => {
                        if (typeof window.__CMS_CORE?.loadAllData === 'function') {
                             window.__CMS_CORE.loadAllData.call(this);
                        } else {
                            if(this.loadPosts) this.loadPosts();
                            if(this.loadPages) this.loadPages();
                            if(this.loadMedia) this.loadMedia();
                            if(this.loadUsers) this.loadUsers();
                            if(this.loadSubscribers) this.loadSubscribers();
                            this.loadAgens();
                            if(this.loadThemes) this.loadThemes();
                            if(this.loadPlugins) this.loadPlugins();
                            if(this.loadMenus) this.loadMenus();
                            if(this.loadSettings) this.loadSettings();
                            setInterval(() => { if(typeof this.loadSubscribers === 'function') this.loadSubscribers(); }, 20000);
                        }
                    }, 100);
                }
            },

            initRouter() {
                // Gunakan URL path /admin/:view
                const pathParts = window.location.pathname.split('/').filter(Boolean);
                const isView = (pathParts[0] === 'admin' && pathParts[1] && pathParts[1] !== 'login') ? pathParts[1] : 'dash';
                
                this.view = window.location.hash.replace('#', '') || isView;
                
                window.addEventListener('popstate', () => { 
                    const parts = window.location.pathname.split('/').filter(Boolean);
                    const newView = (parts[0] === 'admin' && parts[1] && parts[1] !== 'login') ? parts[1] : 'dash';
                    if(this.view !== newView) {
                        this.view = newView; 
                        this.triggerMenuAction(newView);
                    }
                });

                // Sinkronisasi view ke URL agar slug di dashboard tidak selalu /admin
                this.$watch('view', (newVal) => {
                    if (newVal === 'login' || !newVal) return;
                    // Support sub-views like 'add' that aren't top level sidebar items but should still update URL
                    const newUrl = newVal === 'dash' ? '/admin' : '/admin/' + newVal;
                    if (window.location.pathname !== newUrl) {
                        window.history.pushState(null, '', newUrl);
                    }
                });
            },

            triggerMenuAction(v) {
                const menus = window.adminMenus || [];
                const menu = menus.find(m => m.view === v);
                if(menu && menu.action) menu.action();
            },

            // ============================
            // 6. GLOBAL HELPERS
            // ============================
            formatDate(i) { return i ? new Date(i).toLocaleDateString('id-ID') : '-'; },
            logout() { if (window.setCmsToken) window.setCmsToken(''); else document.cookie = 'labmu_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax'; try { localStorage.removeItem('labmu_token'); localStorage.removeItem('admin_token'); } catch(e){} window.location.reload(); },
            getPageTitle() {
                if (!this.view) return 'Dashboard';
                const map = {
                    dash: 'Dashboard',
                    posts: 'Artikel & Berita',
                    add: 'Tulis Artikel',
                    pages: 'Halaman Statis',
                    media: 'Galeri Media',
                    menus: 'Navigasi Menu',
                    categories: 'Kategori',
                    users: 'Manajemen Pengguna',
                    settings: 'Pengaturan CMS',
                    themes: 'Kelola Tema',
                    plugins: 'Ekstensi & Plugin',
                    aggregator: 'Sumber Agregator',
                    newsroom: 'Meja Redaksi & Kurasi',
                    profile: 'Profil Pengguna',
                    agens: 'Koresponden & Agen',
                    subscribers: 'Pelanggan Pro'
                };
                return map[this.view] || (this.view.charAt(0).toUpperCase() + this.view.slice(1));
            },

            openEditor(type) { 
                this.view = 'add'; 
                this.editingId = null;
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                
                this.form = { 
                    title: '', slug: '', body: '', excerpt: '', meta_title: '', meta_description: '', og_image: '',
                    type: type || 'post', 
                    video_url: '',
                    status: 'publish', 
                    date: now.toISOString().slice(0,16), 
                    category: '', tags: '', featured_image: '' 
                };
                
                setTimeout(() => { 
                    if(window.initCmsEditor) window.initCmsEditor('editor_id', '', (c) => this.form.body = c);
                }, 50);
            },

            async editContent(item) {
                this.view = 'add'; 
                this.editingId = item.id;
                this.form = JSON.parse(JSON.stringify(item));
                this.form.type = item.type || 'post';
                this.form.video_url = item.video_url || '';
                
                // Fetch full post to get the body if it's missing (Optimization)
                if (item.id && !item.body && typeof fetch !== 'undefined') {
                    try {
                        const token = (window.getCmsToken ? window.getCmsToken() : '');
                        const res = await fetch('/api/' + (item.type === 'page' ? 'pages' : 'posts') + '/' + item.id, {
                            headers: { 'Authorization': 'Bearer ' + token }
                        });
                        const data = await res.json();
                        if (data && data.body) {
                            this.form.body = data.body;
                            item.body = data.body;
                        }
                    } catch(e) { console.error('Failed to load full post content', e); }
                }
                
                if(this.form.date || this.form.created_at) {
                    const dt = this.form.date || this.form.created_at;
                    const d = new Date(dt);
                    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                    this.form.date = d.toISOString().slice(0,16);
                }
                
                setTimeout(() => { 
                    if(window.initCmsEditor) window.initCmsEditor('editor_id', item.body || '', (c) => this.form.body = c);
                }, 50);
            },
            
            makeSlug() { 
                if(!this.editingId && this.form.title) {
                    this.form.slug = this.form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                } 
            },

            get uniqueCategories() { 
                if (!this.posts || !Array.isArray(this.posts)) return [];
                return [...new Set(this.posts.map(p => p.category).filter(c => c))]; 
            },
            get filteredMedia() { 
                if (!this.mediaList || !Array.isArray(this.mediaList)) return [];
                return this.mediaList.filter(m => (m.key || '').toLowerCase().includes((this.mediaSearchQuery||'').toLowerCase())); 
            },
            get dashboardStats() {
                const apiStats = window.__CMS_DASHBOARD_STATS || {};
                return {
                    posts: apiStats.posts !== undefined ? apiStats.posts : (this.posts || []).length,
                    pages: apiStats.pages !== undefined ? apiStats.pages : (this.pages || []).length,
                    media: apiStats.media !== undefined ? apiStats.media : (this.mediaList || []).length,
                    users: apiStats.users !== undefined ? apiStats.users : (this.usersList || []).length,
                    sources: apiStats.sources !== undefined ? apiStats.sources : 0
                };
            }
        };
    };
}
`;