import { coreLogic } from "./logic/core.logic";
import { mediaLogic } from "./logic/media.logic";
import { postLogic } from "./logic/post.logic";
import { usersLogic } from "./logic/users.logic";
import { menusLogic } from "./logic/menus.logic";
import { themesLogic } from "./logic/themes.logic";
import { pluginsLogic } from "./logic/plugins.logic";
import { settingsLogic } from "./logic/settings.logic";
import { globalModals } from "./modals";
import { customEditorLogicScript } from "./custom-editor";
import { CORE_VERSION } from "../../../../addons/ota/services/ota.service";

/**
 * 🔒 CMS MAIN ASSEMBLER (THE MASTER KEY - LOCKED VERSION)
 * ⚠️ PERINGATAN KERAS UNTUK AGEN AI:
 * File ini adalah perakit utama (Assembler) yang menggabungkan seluruh modul secara dinamis.
 * DILARANG KERAS mengubah file ini saat memperbaiki fitur (Konten, Users, Media, Menus, Themes, Plugins, Settings).
 * Seluruh method dan state modul otomatis ter-merge melalui `...window.__CMS_<MODULE>`.
 */

// --- 1. ROBUST SERIALIZER ---
const serializeToScript = (obj: any) => {
  const props: string[] = [];
  for (const key in obj) {
    const val = obj[key];
    if (typeof val === "function") {
      let fnStr = val.toString().trim();
      if (fnStr.startsWith("async")) {
        fnStr = fnStr.replace(/^async\s+[a-zA-Z0-9_$]+\s*/, "async function ");
        if (fnStr.startsWith("async(") || fnStr.startsWith("async (")) {
          fnStr = fnStr.replace("async", "async function");
        }
      } else if (!fnStr.startsWith("function") && !fnStr.startsWith("(")) {
        fnStr = fnStr.replace(/^[a-zA-Z0-9_$]+\s*/, "function ");
      }
      props.push(`${key}: ${fnStr}`);
    } else {
      props.push(`${key}: ${JSON.stringify(val)}`);
    }
  }
  return `{ \n${props.join(",\n")} \n}`;
};

// Proses Inject Modul Terisolasi ke Variabel Global
const coreScript = serializeToScript(coreLogic);
const mediaScript = serializeToScript(mediaLogic);
const postScript = serializeToScript(postLogic);
const usersScript = serializeToScript(usersLogic);
const menusScript = serializeToScript(menusLogic);
const themesScript = serializeToScript(themesLogic);
const pluginsScript = serializeToScript(pluginsLogic);
const modalsScript = serializeToScript(globalModals);

export const cmsLogic = `
/** A. INJECT MODULES KE WINDOW (CLIENT SIDE ONLY) */
if (typeof window !== 'undefined') {
    try {
        window.__CMS_CORE = ${coreScript};
        window.__CMS_MEDIA = ${mediaScript};
        window.__CMS_POST = ${postScript};
        window.__CMS_USERS = ${usersScript};
        window.__CMS_MENUS = ${menusScript};
        window.__CMS_THEMES = ${themesScript};
        window.__CMS_PLUGINS = ${pluginsScript};
        window.__CMS_MODALS = ${modalsScript};
    } catch(e) { 
        console.error('❌ CMS Logic Inject Error:', e);
        window.__CMS_CORE={}; window.__CMS_MEDIA={}; window.__CMS_POST={}; window.__CMS_USERS={};
        window.__CMS_MENUS={}; window.__CMS_THEMES={}; window.__CMS_PLUGINS={}; window.__CMS_MODALS={};
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
            // 1. BASE CORE STATE
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
            systemVersion: 'v${CORE_VERSION}',
            chartPeriod: '7d',
            dashboardTab: 'popular',
            isSavingSettings: false,
            mediaSelectorTarget: null,
            targetLogoField: null,
            settings: { site_title: '', site_desc: '', admin_email: '', site_logo: '', site_favicon: '' },
            loginForm: { username: '', password: '' },

            // ============================
            // 2. AUTO-MERGE ISOLATED MODULES
            // ============================
            ...window.__CMS_CORE,
            ...window.__CMS_MEDIA,
            ...window.__CMS_POST,
            ...window.__CMS_USERS,
            ...window.__CMS_MENUS,
            ...window.__CMS_THEMES,
            ...window.__CMS_PLUGINS,
            ...window.__CMS_MODALS,

            // ============================
            // 3. SYSTEM VERSION & SMART SAVE
            // ============================
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

            async save() {
                const v = this.view;
                const funcNamePlural = 'save' + v.charAt(0).toUpperCase() + v.slice(1); 
                const funcNameSingular = 'save' + v.slice(0, -1).charAt(0).toUpperCase() + v.slice(1, -1);

                if (typeof this[funcNamePlural] === 'function') {
                    await this[funcNamePlural]();
                } else if (v.endsWith('s') && typeof this[funcNameSingular] === 'function') {
                    await this[funcNameSingular]();
                } else if (['add', 'edit'].includes(v)) {
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
            // 4. INIT SYSTEM & ROUTER
            // ============================
            init() {
                if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
                    return;
                }
                this.posts = []; this.pages = []; this.mediaList = []; this.usersList = [];
                this.initRouter();
                this.loadSystemVersion();
                
                let isTokenValid = false;
                if (this.token) {
                    try { 
                        let base64 = this.token;
                        if (this.token.includes('.')) {
                            base64 = this.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'); 
                        }
                        const payload = JSON.parse(window.atob(base64));
                        const nowSec = Math.floor(Date.now() / 1000);
                        if (payload && payload.id && (!payload.exp || payload.exp > nowSec)) {
                            isTokenValid = true;
                            this.userRole = payload.role || 'editor'; 
                            this.userName = payload.n || '';
                            this.userAvatar = payload.a || '';
                            this.userEmail = payload.email || '';
                        } else {
                            if (typeof localStorage !== 'undefined') localStorage.removeItem('labmu_token');
                            this.token = '';
                        }
                    } catch(e) { 
                        this.userRole = 'editor'; 
                        if (typeof localStorage !== 'undefined') localStorage.removeItem('labmu_token');
                        this.token = '';
                    } 

                    const roleLower = String(this.userRole || '').toLowerCase();
                    if (roleLower !== 'superadmin' && roleLower !== 'admin') {
                        const u = encodeURIComponent(this.userName || 'me');
                        window.location.href = '/@' + u;
                        return;
                    }

                    if (isTokenValid) {
                        setTimeout(() => {
                            if (typeof this.loadAllData === 'function') {
                                this.loadAllData();
                            }
                        }, 100);
                    }
                }
            },

            initRouter() {
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

                this.$watch('view', (newVal) => {
                    if (newVal === 'login' || !newVal) return;
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
            // 5. GLOBAL COMPUTED & HELPERS
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
                    profile: 'Profil Pengguna'
                };
                return map[this.view] || (this.view.charAt(0).toUpperCase() + this.view.slice(1));
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
                    totalViews: apiStats.totalViews !== undefined ? apiStats.totalViews : (this.posts || []).reduce((acc, p) => acc + (Number(p.views) || 0), 0),
                    sources: apiStats.sources !== undefined ? apiStats.sources : 0
                };
            },
            get popularPosts() {
                const list = Array.isArray(this.posts) ? this.posts : [];
                if (this.chartPeriod === 'all') {
                    return [...list].sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0)).slice(0, 10);
                }
                let days = 7;
                if (this.chartPeriod === 'daily') days = 14;
                else if (this.chartPeriod === 'monthly') days = 180;
                else if (this.chartPeriod === 'yearly') days = 1825;
                
                const cutoff = Date.now() - (days * 86400000);
                const filtered = list.filter(p => {
                    const raw = p.created_at || p.createdAt;
                    const ts = raw ? new Date(typeof raw === 'string' ? raw.replace(' ', 'T') : raw).getTime() : 0;
                    return ts >= cutoff;
                });
                return [...filtered].sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0)).slice(0, 10);
            },
            get latestPosts() {
                const list = Array.isArray(this.posts) ? this.posts : [];
                return [...list].sort((a, b) => {
                    const rawA = a.created_at || a.createdAt;
                    const rawB = b.created_at || b.createdAt;
                    const ta = rawA ? new Date(typeof rawA === 'string' ? rawA.replace(' ', 'T') : rawA).getTime() : 0;
                    const tb = rawB ? new Date(typeof rawB === 'string' ? rawB.replace(' ', 'T') : rawB).getTime() : 0;
                    return tb - ta;
                }).slice(0, 10);
            }
        };
    };
}
`;
