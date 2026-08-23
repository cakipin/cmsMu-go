// FIX: Tambahkan ekstensi .ts pada SEMUA import agar konsisten dan terbaca loader
import { coreLogic } from './logic/core.logic.ts';
import { mediaLogic } from './logic/media.logic.ts';
import { postLogic } from './logic/post.logic.ts';

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

export const cmsLogic = `
/** A. INJECT MODULES KE WINDOW (CLIENT SIDE ONLY) */
if (typeof window !== 'undefined') {
    try {
        window.__CMS_CORE = ${coreScript};
        window.__CMS_MEDIA = ${mediaScript};
        window.__CMS_POST = ${postScript};
    } catch(e) {
        console.error('❌ CMS Logic Inject Error:', e);
        window.__CMS_CORE={}; window.__CMS_MEDIA={}; window.__CMS_POST={};
    }
}

/** B. MAIN APP */
if (typeof window !== 'undefined') {
    window.cms = function() {
        return {
            // ============================
            // 1. BASE STATE
            // ============================
            token: '' || '',
            userRole: 'admin',
            view: 'dash',
            sidebarOpen: true,
            activeThemeId: null || 'default',
            logoType: 'site_logo',
            isLoggingIn: false,

            // Data Buckets
            posts: [], pages: [], mediaList: [], usersList: [],
            menuList: [], availableThemes: [], selectedItems: [],

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
            form: { title: '', slug: '', body: '', type: 'post', status: 'publish', date: '', category: '', tags: '', featured_image: '' },
            userForm: { username: '', email: '', role: 'editor', password: '', name: '' },
            menuForm: { id: null, label: '', url: '', order_num: 0 },
            settings: { site_title: '', site_desc: '', admin_email: '', site_logo: '', site_favicon: '' },
            loginForm: { username: '', password: '' },

            // ============================
            // 2. EXPLICIT BRIDGING (Jaminan Fitur Muncul)
            // ============================
            // Core Logic Bridges (Wajib ada agar tidak hilang)
            loadPages() { if(window.__CMS_CORE?.loadPages) return window.__CMS_CORE.loadPages.call(this); },
            savePage() { if(window.__CMS_CORE?.savePage) return window.__CMS_CORE.savePage.call(this); },

            loadUsers() { if(window.__CMS_CORE?.loadUsers) return window.__CMS_CORE.loadUsers.call(this); },
            saveUser() { if(window.__CMS_CORE?.saveUser) return window.__CMS_CORE.saveUser.call(this); },
            deleteUser(id) { if(window.__CMS_CORE?.deleteUser) return window.__CMS_CORE.deleteUser.call(this, id); },

            loadSettings() { if(window.__CMS_CORE?.loadSettings) return window.__CMS_CORE.loadSettings.call(this); },
            saveSettings() { if(window.__CMS_CORE?.saveSettings) return window.__CMS_CORE.saveSettings.call(this); },

            loadMenu() { if(window.__CMS_CORE?.loadMenu) return window.__CMS_CORE.loadMenu.call(this); },
            saveMenu() { if(window.__CMS_CORE?.saveMenu) return window.__CMS_CORE.saveMenu.call(this); },

            // Post Logic Bridges
            loadPosts() { if(window.__CMS_POST?.loadPosts) return window.__CMS_POST.loadPosts.call(this); },
            savePost(frm) { if(window.__CMS_POST?.savePost) return window.__CMS_POST.savePost.call(this, frm || this.form); },
            deletePost(id) { if(window.__CMS_POST?.deletePost) return window.__CMS_POST.deletePost.call(this, id); },

            // Media Logic Bridges
            loadMedia() { if(window.__CMS_MEDIA?.loadMedia) return window.__CMS_MEDIA.loadMedia.call(this); },
            uploadMedia(files) { if(window.__CMS_MEDIA?.uploadMedia) return window.__CMS_MEDIA.uploadMedia.call(this, files); },

            // ============================
            // 3. MERGE LOGIC (Fallback)
            // ============================
            ...window.__CMS_CORE,
            ...window.__CMS_MEDIA,
            ...window.__CMS_POST,

            // ============================
            // 4. SMART ACTIONS
            // ============================
            async save() {
                const v = this.view;
                const funcNamePlural = 'save' + v.charAt(0).toUpperCase() + v.slice(1); // saveUsers
                const funcNameSingular = 'save' + v.slice(0, -1).charAt(0).toUpperCase() + v.slice(1, -1); // saveUser

                // Prioritas 1: Cek fungsi eksplisit di komponen ini
                if (typeof this[funcNamePlural] === 'function') {
                    await this[funcNamePlural]();
                } else if (v.endsWith('s') && typeof this[funcNameSingular] === 'function') {
                    await this[funcNameSingular]();
                }
                // Prioritas 2: Routing khusus Editor
                else if (['add', 'edit'].includes(v)) {
                    if(this.form.type === 'page') {
                        if(this.savePage) await this.savePage(); // Core Logic
                    } else {
                        if(this.savePost) await this.savePost(this.form); // Post Logic
                    }
                } else {
                    console.warn('⚠️ No save function for view:', v);
                }
            },

            // ============================
            // 5. INIT SYSTEM
            // ============================
            init() {
                // Initialize Arrays
                this.posts = []; this.pages = []; this.mediaList = []; this.usersList = [];

                this.initRouter();

                if (this.token) {
                    setTimeout(() => {
                        // Coba panggil loadAllData dari Core jika ada
                        if (typeof window.__CMS_CORE?.loadAllData === 'function') {
                             window.__CMS_CORE.loadAllData.call(this);
                        } else {
                            // Fallback Load satu-satu
                            if(this.loadPosts) this.loadPosts();
                            if(this.loadPages) this.loadPages();
                            if(this.loadMedia) this.loadMedia();
                            if(this.loadUsers) this.loadUsers();
                        }
                    }, 100);
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

            // ============================
            // 6. GLOBAL HELPERS
            // ============================
            formatDate(i) { return i ? new Date(i).toLocaleDateString('id-ID') : '-'; },
            logout() { (void 0); window.location.reload(); },
            getPageTitle() {
                if (!this.view) return 'Admin';
                return this.view.charAt(0).toUpperCase() + this.view.slice(1);
            },

            openEditor(type) {
                this.view = 'add';
                this.editingId = null;
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

                this.form = {
                    title: '', slug: '', body: '',
                    type: type || 'post',
                    status: 'publish',
                    date: now.toISOString().slice(0,16),
                    category: '', tags: '', featured_image: ''
                };

                setTimeout(() => {
                    if(window.initCmsEditor) window.initCmsEditor('editor_id', '', (c) => this.form.body = c);
                }, 50);
            },

            editContent(item) {
                this.view = 'add';
                this.editingId = item.id;
                this.form = JSON.parse(JSON.stringify(item));

                if(this.form.date) {
                    const d = new Date(this.form.date);
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
                return {
                    posts: (this.posts || []).length,
                    pages: (this.pages || []).length,
                    media: (this.mediaList || []).length,
                    users: (this.usersList || []).length
                };
            }
        };
    };
}
`;