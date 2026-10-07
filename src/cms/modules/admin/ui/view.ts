import { pluginMenus, renderPluginViews, renderPluginScripts } from '../../../registry/admin-menu';

// ... (Import blocks lainnya tetap sama) ...
import { adminStyles } from './blocks/styles';
import { sidebarBlock } from './blocks/sidebar';
import { dashboardPage } from './blocks/dashboard.page';
import { pagesBlock } from './blocks/pages';
import { menusPage } from './blocks/menus.page';
import { themesPage } from './blocks/themes.page';
import { pluginsPage } from './blocks/plugins.page';
import { globalModals } from './blocks/modals';
import { cmsLogic } from './blocks/cms.logic';
import { ssoPage } from './blocks/sso.page';
import { loginPage } from './pages/login.page';
import { commentsPage } from './blocks/comments.page';
import { profilePage } from './blocks/profile.page';

import { subscribersPage } from './blocks/subscribers.page';
import { subscribersLogic } from './blocks/subscribers.logic';
import { emagazinePage } from './blocks/emagazine.page';
import { seoPage } from './blocks/seo.page';
import { CORE_VERSION } from '../../../addons/ota/services/ota.service';


export function renderAdmin(data: any): string {
    const isLoginView = data.view === 'login';
    const renderedPluginViews = renderPluginViews();

    const injectedPlugins = pluginMenus.map(p => {
        return `{
            group: "${p.group}",
            title: "${p.title}",
            icon: "${p.icon}",
            ${p.pluginId ? `pluginId: "${p.pluginId}",` : ''}
            ${p.view ? `view: "${p.view}",` : ''}
            ${p.href ? `href: "${p.href}",` : ''}
            ${p.role ? `role: ${JSON.stringify(p.role)},` : ''}
            ${p.actionCode ? `action: function() { ${p.actionCode} }` : ''}
        }`;
    }).join(',');

    try {
        return `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Portal Redaksi Dashboard</title>
            <link rel="icon" id="admin-favicon" href="/favicon.svg">
            <script>
                window.updateFavicon = function(url) {
                    if (!url) return;
                    try {
                        var head = document.head || document.getElementsByTagName('head')[0];
                        var existingLinks = document.querySelectorAll("link[rel*='icon']");
                        for (var i = 0; i < existingLinks.length; i++) {
                            if (existingLinks[i].parentNode) existingLinks[i].parentNode.removeChild(existingLinks[i]);
                        }
                        var link = document.createElement('link');
                        link.id = 'admin-favicon';
                        link.rel = 'icon';
                        link.type = url.endsWith('.svg') ? 'image/svg+xml' : (url.endsWith('.png') ? 'image/png' : 'image/x-icon');
                        link.href = url + (url.indexOf('?') === -1 ? '?v=' + Date.now() : '&v=' + Date.now());
                        head.appendChild(link);
                    } catch(e) {}
                };

                (function() {
                    try {
                        fetch('/api/settings').then(function(r){ return r.json(); }).then(function(d){
                            var data = (d && d.data) ? d.data : d;
                            if (data && data.site_favicon) {
                                window.updateFavicon(data.site_favicon);
                            }
                        }).catch(function(){});
                    } catch(e){}
                })();

                window.addEventListener('settings-updated', function(e) {
                    if (e.detail && e.detail.site_favicon) {
                        window.updateFavicon(e.detail.site_favicon);
                    }
                });

            </script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
                tailwind.config = {
                    theme: {
                        extend: {
                            colors: {
                                primary: '#0d9488', // teal-600
                                'primary-hover': '#0f766e', // teal-700
                                'primary-light': '#ccfbf1', // teal-50
                            }
                        }
                    }
                }
            </script>
            <style>
                ${adminStyles}
                [x-cloak] { display: none !important; }
                /* Custom scrollbar untuk sidebar agar rapi */
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            </style>
            
            <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
            <script>
                if (window.pdfjsLib) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                }

                // Global Cookie Session & Anti-LocalStorage Helper (CMS Mu)
                (function() {
                    try {
                        var origGet = Storage.prototype.getItem;
                        var origSet = Storage.prototype.setItem;
                        var origRemove = Storage.prototype.removeItem;
                        window.__origLsRemove = origRemove;

                        function getCookieVal(name) {
                            var parts = (document.cookie || '').split(';');
                            for (var i = 0; i < parts.length; i++) {
                                var p = parts[i].trim();
                                if (p.indexOf(name + '=') === 0) {
                                    return decodeURIComponent(p.substring(name.length + 1));
                                }
                            }
                            return '';
                        }

                        Storage.prototype.getItem = function(k) {
                            if (k === 'labmu_token' || k === 'admin_token') {
                                return getCookieVal('labmu_token');
                            }
                            return origGet.apply(this, arguments);
                        };

                        Storage.prototype.setItem = function(k, v) {
                            if (k === 'labmu_token' || k === 'admin_token') {
                                document.cookie = 'labmu_token=' + encodeURIComponent(v) + '; Path=/; Max-Age=2592000; SameSite=Lax';
                                origRemove.call(this, 'labmu_token');
                                origRemove.call(this, 'admin_token');
                                return;
                            }
                            return origSet.apply(this, arguments);
                        };

                        Storage.prototype.removeItem = function(k) {
                            if (k === 'labmu_token' || k === 'admin_token' || k === 'labmu_user') {
                                origRemove.call(this, k);
                                return;
                            }
                            return origRemove.apply(this, arguments);
                        };
                    } catch(e) {}
                })();

                window.getCmsToken = function() {
                    var parts = (document.cookie || '').split(';');
                    for (var i = 0; i < parts.length; i++) {
                        var p = parts[i].trim();
                        if (p.indexOf('labmu_token=') === 0) {
                            return decodeURIComponent(p.substring(12));
                        }
                    }
                    return '';
                };

                window.setCmsToken = function(token) {
                    if (!token) {
                        document.cookie = 'labmu_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
                    } else {
                        document.cookie = 'labmu_token=' + encodeURIComponent(token) + '; Path=/; Max-Age=2592000; SameSite=Lax';
                    }
                    try {
                        if (window.__origLsRemove) {
                            window.__origLsRemove.call(window.localStorage, 'labmu_token');
                            window.__origLsRemove.call(window.localStorage, 'admin_token');
                            window.__origLsRemove.call(window.localStorage, 'labmu_user');
                        }
                    } catch(e) {}
                };

                // Helper sanitasi konten berita dari link dan iklan (menggunakan DOM browser langsung)
                window.cleanNewsroomContent = function(html) {
                    if (!html) return '';
                    try {
                        var doc = new DOMParser().parseFromString(html, 'text/html');
                        // Hapus elemen berbahaya dan iklan
                        var toRemove = doc.querySelectorAll('script, style, iframe, ins, noscript, .ads, .ad-banner, .advertisement, .wp-block-embed, .sharedaddy, .jp-relatedposts');
                        toRemove.forEach(function(el) { el.remove(); });
                        // Unwrap seluruh hyperlink <a>teks</a> menjadi teks biasa
                        var links = doc.querySelectorAll('a');
                        links.forEach(function(a) {
                            var span = doc.createTextNode(a.textContent || '');
                            a.parentNode && a.parentNode.replaceChild(span, a);
                        });
                        var out = doc.body.innerHTML.trim();
                        // Bersihkan atribut dir dan caption kosong via DOM
                        var wpCaptions = doc.querySelectorAll('.wp-caption, div[class*="wp-caption"]');
                        wpCaptions.forEach(function(cap) {
                            if (!cap.textContent.trim() && !cap.querySelector('img')) cap.remove();
                        });
                        var allElements = doc.body.querySelectorAll('*');
                        allElements.forEach(function(el) {
                            if (el.hasAttribute('dir')) el.removeAttribute('dir');
                        });
                        // Hapus paragraf kosong
                        var allP = doc.body.querySelectorAll('p');
                        allP.forEach(function(p) {
                            if (!p.textContent.trim() && !p.querySelector('img, iframe, video')) {
                                p.remove();
                            }
                        });
                        return doc.body.innerHTML.trim();
                    } catch(e) {
                        return html;
                    }
                };

                // In-System Toast System (SOP 16)
                window.showToast = function(message, type, duration) {
                    type = type || 'info';
                    duration = duration || 3500;
                    var container = document.getElementById('cms-toast-container');
                    if (!container) return;
                    var toast = document.createElement('div');
                    toast.className = 'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all transform translate-y-2 opacity-0 duration-200 max-w-md';
                    
                    var icon = 'fa-info-circle text-blue-500';
                    var bg = 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50';
                    if (type === 'success') {
                        icon = 'fa-check-circle text-emerald-500';
                        bg = 'bg-white border-emerald-200 text-slate-800 shadow-emerald-500/10';
                    } else if (type === 'error' || type === 'danger') {
                        icon = 'fa-exclamation-circle text-rose-500';
                        bg = 'bg-white border-rose-200 text-slate-800 shadow-rose-500/10';
                    } else if (type === 'warning') {
                        icon = 'fa-exclamation-triangle text-amber-500';
                        bg = 'bg-white border-amber-200 text-slate-800 shadow-amber-500/10';
                    }
                    
                    toast.className += ' ' + bg;
                    toast.innerHTML = '<i class="fas ' + icon + ' text-base shrink-0"></i><span class="flex-1">' + message + '</span>';
                    container.appendChild(toast);
                    
                    requestAnimationFrame(function() {
                        toast.classList.remove('translate-y-2', 'opacity-0');
                    });
                    
                    setTimeout(function() {
                        toast.classList.add('opacity-0', 'translate-y-2');
                        setTimeout(function() { toast.remove(); }, 200);
                    }, duration);
                };

                // In-System Confirmation Modal (SOP 16)
                window.showConfirmDialog = function(options) {
                    return new Promise(function(resolve) {
                        options = options || {};
                        var modal = document.getElementById('cms-confirm-modal');
                        var card = document.getElementById('cms-confirm-card');
                        var titleEl = document.getElementById('cms-confirm-title');
                        var msgEl = document.getElementById('cms-confirm-message');
                        var okBtn = document.getElementById('cms-confirm-ok-btn');
                        var cancelBtn = document.getElementById('cms-confirm-cancel-btn');
                        var okText = document.getElementById('cms-confirm-ok-text');
                        var iconWrap = document.getElementById('cms-confirm-icon-wrap');
                        var iconEl = document.getElementById('cms-confirm-icon');
                        
                        if (!modal) {
                            resolve(confirm(options.message || 'Apakah Anda yakin?'));
                            return;
                        }
                        
                        titleEl.textContent = options.title || 'Konfirmasi Tindakan';
                        msgEl.textContent = options.message || 'Apakah Anda yakin ingin melanjutkan?';
                        okText.textContent = options.confirmText || 'Ya, Lanjutkan';
                        
                        if (options.type === 'danger' || options.isDestructive) {
                            okBtn.className = 'px-5 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors flex items-center gap-2';
                            iconWrap.className = 'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 text-rose-600';
                            iconEl.className = 'fas fa-trash-alt text-xl';
                        } else {
                            okBtn.className = 'px-5 py-2 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-colors flex items-center gap-2';
                            iconWrap.className = 'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-teal-50 text-teal-600';
                            iconEl.className = 'fas fa-question-circle text-xl';
                        }
                        
                        modal.classList.remove('hidden');
                        requestAnimationFrame(function() {
                            card.classList.remove('scale-95', 'opacity-0');
                        });
                        
                        function cleanup() {
                            card.classList.add('scale-95', 'opacity-0');
                            setTimeout(function() { modal.classList.add('hidden'); }, 150);
                            okBtn.onclick = null;
                            cancelBtn.onclick = null;
                        }
                        
                        okBtn.onclick = function() {
                            cleanup();
                            resolve(true);
                        };
                        cancelBtn.onclick = function() {
                            cleanup();
                            resolve(false);
                        };
                    });
                };

                // Global Safety Net (SOP 16): Native Alert & Confirm Override
                window.alert = function(msg) {
                    if (window.showToast) {
                        window.showToast(String(msg), 'info');
                    }
                };

                // Migrasi sisa localStorage ke Cookie lalu musnahkan penyimpanan fisik lokal
                (function() {
                    try {
                        if (window.__origLsRemove) {
                            window.__origLsRemove.call(window.localStorage, 'labmu_token');
                            window.__origLsRemove.call(window.localStorage, 'admin_token');
                            window.__origLsRemove.call(window.localStorage, 'labmu_user');
                        }
                    } catch(e) {}

                    const token = window.getCmsToken();
                    const isLoginPage = window.location.pathname.includes('/login');
                    if (!token && !isLoginPage) {
                        window.location.href = '/admin/login'; 
                        return;
                    }
                    if (token) {
                        try {
                            let base64 = token;
                            if (token.includes('.')) {
                                base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
                            }
                            const payload = JSON.parse(atob(base64));
                            const role = String(payload.role || '').toLowerCase();
                            // Mutlak: Hanya superadmin dan admin yang boleh mengakses dasbor /admin
                            if (role !== 'superadmin' && role !== 'admin') {
                                const u = payload.username || 'me';
                                window.location.replace('/@' + encodeURIComponent(u));
                                return;
                            }
                        } catch(e){}
                    }
                })();
            </script>
            <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js" defer></script>

            <script>
                window.adminMenus = [
                    { group: 'Content', title: 'All Posts', view: 'posts', icon: 'fas fa-thumbtack', action: () => typeof loadPosts === 'function' && loadPosts() },
                    { group: 'Content', title: 'Add Post', view: 'add', icon: 'fas fa-plus-circle', action: () => { window.editingId = null; } },
                    { group: 'Content', title: 'Pages', view: 'pages', icon: 'fas fa-copy', action: () => typeof loadPages === 'function' && loadPages() },
                    { group: 'Content', title: 'Add Page', view: 'add-page', icon: 'fas fa-plus-square', action: () => { window.editingPageId = null; } },
                    { group: 'Content', title: 'Media', view: 'media', icon: 'fas fa-photo-video', action: () => typeof loadMedia === 'function' && loadMedia() },
                    { group: 'Content', title: 'Komentar', view: 'comments', icon: 'fas fa-comments', role: ['admin', 'editor'] },
                    { group: 'Appearance', title: 'Themes', view: 'themes', icon: 'fas fa-paint-brush', role: ['admin', 'editor'] },
                    { group: 'Appearance', title: 'Theme Editor', action: () => window.location.href = '/theme-editor?slug=home', icon: 'fas fa-laptop-code', role: ['admin'] },
                    { group: 'Appearance', title: 'Menus', view: 'menus', icon: 'fas fa-bars', role: ['admin', 'editor'] },
                    
                    { group: 'System', title: 'Users', view: 'users', icon: 'fas fa-users', role: ['admin'], action: () => typeof loadUsers === 'function' && loadUsers() },
                    { group: 'System', title: 'Settings', view: 'settings', icon: 'fas fa-cog', role: ['admin'] },
                    { group: 'System', title: 'SEO & Analytics', view: 'seo', icon: 'fas fa-chart-pie', role: ['admin'] },
                    { group: 'Plugins', title: 'Kelola Plugins', view: 'plugins', icon: 'fas fa-puzzle-piece', role: ['admin'], action: () => typeof loadPlugins === 'function' && loadPlugins() },
                    { group: 'Plugins', title: 'SSO Setup', view: 'sso-setup', icon: 'fas fa-shield-alt', role: ['admin'], pluginId: 'sso-muhammadiyah' }
                ];

                const plugins = [${injectedPlugins}]; 
                window.adminMenus = window.adminMenus.concat(plugins);
                window.__CMS_CORE_VERSION = '${CORE_VERSION}';
                window.__CMS_OTA_ENDPOINT = '/api/addons/ota';
            </script>

            <!-- CMSMu Core Logic with Local Fallback Safety -->
            <script>${cmsLogic}</script>

            <!-- Dynamic OTA Runtime Script (Loads active D1 bundle if updated via OTA) -->
            <script src="/api/addons/ota/bundle/admin.js" defer></script>

            <!-- Plugins Client Scripts -->
            ${renderPluginScripts()}
        </head>
        <body x-data="cms()" x-init="init()" x-cloak class="bg-slate-50 text-slate-800 font-sans">
            
            <template x-if="${isLoginView} || !token">
                ${loginPage}
            </template>

            <template x-if="token && !${isLoginView}">
                <!-- ===== Page Wrapper Start ===== -->
                <div class="flex h-screen overflow-hidden">
                    
                    <!-- ===== Sidebar Start ===== -->
                    ${sidebarBlock}
                    <!-- ===== Sidebar End ===== -->

                    <!-- ===== Content Area Start ===== -->
                    <div class="relative flex flex-col flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
                        
                        <!-- ===== Header / Topbar Start ===== -->
                        <header class="sticky top-0 z-40 flex w-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-slate-100">
                            <div class="flex flex-grow items-center justify-between px-4 py-2 md:px-6 2xl:px-8">
                                <div class="flex items-center gap-3">
                                    <!-- Sidebar Window Show/Hide Toggle BTN -->
                                    <button @click.stop="sidebarOpen = !sidebarOpen" class="rounded-lg p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20" title="Buka / Tutup Sidebar">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-colors duration-200" :class="sidebarOpen ? 'text-teal-600' : 'text-slate-500'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                            <rect width="18" height="18" x="3" y="3" rx="2.5" />
                                            <path d="M9 3v18" />
                                        </svg>
                                    </button>
                                    
                                    <h3 x-text="getPageTitle()" class="text-lg font-bold text-slate-800 hidden sm:block tracking-tight"></h3>
                                </div>

                                <div x-data="{
                                    dropdownOpen: false,
                                    notifOpen: false,
                                    currentTime: '',
                                    currentHijri: 'Memuat...',
                                    notifications: [],
                                    unreadCount: 0,
                                    async fetchNotifications() {
                                        try {
                                            const res = await fetch('/api/notifications', {
                                                headers: { 'Authorization': 'Bearer ' + (window.getCmsToken ? window.getCmsToken() : '') }
                                            });
                                            if (res.ok) {
                                                const data = await res.json();
                                                if (data.success) {
                                                    this.notifications = data.data;
                                                    this.unreadCount = this.notifications.length;
                                                }
                                            }
                                        } catch(e) {}
                                    },
                                    async markAsRead(id = null) {
                                        try {
                                            const res = await fetch('/api/notifications/read', {
                                                method: 'POST',
                                                headers: {
                                                    'Authorization': 'Bearer ' + (window.getCmsToken ? window.getCmsToken() : ''),
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({ id })
                                            });
                                            if (res.ok) {
                                                this.fetchNotifications();
                                            }
                                        } catch(e) {}
                                    },
                                    async fetchHijri() {
                                        try {
                                            const res = await fetch('https://api-khgt.labmu.workers.dev');
                                            const contentType = res.headers.get('content-type');
                                            if (res.ok && contentType && contentType.includes('application/json')) {
                                                const data = await res.json();
                                                this.currentHijri = data.hijri || data.tanggal || data.date || this.fallbackHijri();
                                            } else {
                                                this.currentHijri = this.fallbackHijri();
                                            }
                                        } catch (e) {
                                            this.currentHijri = this.fallbackHijri();
                                        }
                                    },
                                    fallbackHijri() {
                                        try {
                                            return new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
                                        } catch(err) {
                                            return new Date().toLocaleDateString('id-ID');
                                        }
                                    },
                                    updateTime() {
                                        this.currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                                    }
                                }" x-init="updateTime(); setInterval(() => updateTime(), 1000); fetchHijri(); fetchNotifications(); setInterval(() => fetchNotifications(), 15000);" class="flex items-center gap-3 sm:gap-4">
                                    
                                    <!-- Waktu dan Kalender -->
                                    <div class="hidden md:flex flex-col items-end text-right">
                                        <span class="text-xs font-semibold text-slate-800" x-text="currentTime + ' WIB'"></span>
                                        <span class="text-[10px] text-primary font-medium" x-text="currentHijri"></span>
                                    </div>

                                    <!-- Bell Icon -->
                                    <div class="relative">
                                        <button @click="notifOpen = !notifOpen" @click.outside="notifOpen = false" class="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:text-primary hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
                                            <span x-show="unreadCount > 0" class="absolute -top-1 -right-1 z-10 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white font-black shadow-sm" x-text="unreadCount">
                                            </span>
                                            <i class="far fa-bell text-sm"></i>
                                        </button>
                                        
                                        <!-- Notif Dropdown -->
                                        <div x-show="notifOpen" x-transition.opacity.duration.200ms class="absolute -right-2 mt-2.5 flex max-h-90 w-72 flex-col rounded-xl border border-slate-200 bg-white shadow-xl sm:right-0 sm:w-80 z-50" style="display: none;">
                                            <div class="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                                <h5 class="text-sm font-semibold text-slate-800">Notifikasi</h5>
                                                <button x-show="unreadCount > 0" @click="markAsRead()" class="text-xs text-primary hover:underline focus:outline-none">Tandai semua dibaca</button>
                                            </div>
                                            <div class="flex flex-col overflow-y-auto px-2 py-2" style="max-height: 300px;">
                                                <template x-if="notifications.length === 0">
                                                    <p class="text-xs text-slate-500 text-center py-4">Tidak ada notifikasi baru.</p>
                                                </template>
                                                <template x-for="n in notifications">
                                                    <div @click="if(n.link) { window.location.href = '/admin/' + n.link; markAsRead(n.id); notifOpen = false; }" class="flex items-start gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-50 last:border-0 relative group cursor-pointer">
                                                        <div class="h-8 w-8 rounded-full flex items-center justify-center shrink-0" :class="n.type === 'warning' ? 'bg-amber-100 text-amber-600' : (n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600')">
                                                            <i class="fas text-xs" :class="n.type === 'warning' ? 'fa-gem' : (n.type === 'success' ? 'fa-user-plus' : 'fa-bell')"></i>
                                                        </div>
                                                        <div class="flex-1 min-w-0 pr-6">
                                                            <p class="text-xs font-semibold text-slate-800 truncate" x-text="n.title"></p>
                                                            <p class="text-[11px] text-slate-500 leading-tight" x-text="n.message"></p>
                                                            <p class="text-[9px] text-slate-400 mt-1" x-text="new Date(n.created_at).toLocaleString('id-ID')"></p>
                                                        </div>
                                                        <button @click.stop="markAsRead(n.id)" class="absolute right-2 top-2 text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none" title="Tandai sudah dibaca">
                                                            <i class="fas fa-times text-xs"></i>
                                                        </button>
                                                    </div>
                                                </template>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Quick Purge Cache Button -->
                                    <button @click="purgeCacheGlobal()" :disabled="isPurgingCache" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50" title="Bersihkan Seluruh Cache Sistem (KV & Cloudflare)">
                                        <i class="fas" :class="isPurgingCache ? 'fa-spinner fa-spin' : 'fa-broom'"></i>
                                        <span x-text="isPurgingCache ? 'Purging...' : 'Purge Cache'">Purge Cache</span>
                                    </button>

                                    <!-- User Avatar & Dropdown -->
                                    <div class="relative">
                                        <button @click="dropdownOpen = !dropdownOpen" @click.outside="dropdownOpen = false" class="flex items-center gap-2 focus:outline-none">
                                            <span class="hidden text-right lg:block">
                                                <span class="block text-sm font-semibold text-slate-800" x-text="userName ? userName : (userRole === 'admin' ? 'Administrator' : (userRole || 'Admin'))"></span>
                                            </span>
                                            <div class="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm ring-2 ring-white border border-primary/20 overflow-hidden">
                                                <template x-if="userAvatar">
                                                    <img :src="userAvatar" alt="Avatar" class="h-full w-full object-cover">
                                                </template>
                                                <template x-if="!userAvatar">
                                                    <i class="fas fa-user-astronaut text-sm"></i>
                                                </template>
                                            </div>
                                            <i class="fas fa-chevron-down text-xs text-slate-400 ml-1 transition-transform" :class="dropdownOpen ? 'rotate-180' : ''"></i>
                                        </button>

                                        <!-- User Dropdown Menu -->
                                        <div x-show="dropdownOpen" x-transition.opacity.duration.200ms class="absolute right-0 mt-3 flex w-48 flex-col rounded-xl border border-slate-200 bg-white shadow-xl" style="display: none;">
                                            <ul class="flex flex-col gap-1 border-b border-slate-100 p-2">
                                                <li>
                                                    <a href="#" @click.prevent="view = 'profile'; dropdownOpen = false;" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors">
                                                        <i class="far fa-user w-4 text-center"></i> Profil Saya
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="#" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors">
                                                        <i class="fas fa-cog w-4 text-center"></i> Pengaturan
                                                    </a>
                                                </li>
                                            </ul>
                                            <div class="p-2">
                                                <button @click="logout()" class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors">
                                                    <i class="fas fa-sign-out-alt w-4 text-center"></i> Logout
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </header>
                        <!-- ===== Header End ===== -->

                        <!-- ===== Main Content Start ===== -->
                        <main class="flex-grow pb-10">
                            <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-8">
                                ${dashboardPage}
                                <template x-if="view === 'subscribers'"><div class="exclusive-wrapper">${subscribersPage}</div></template>
                                <template x-if="view === 'emagazine'"><div class="exclusive-wrapper">${emagazinePage}</div></template>
                                ${pagesBlock}
                                <template x-if="view === 'menus'"><div class="exclusive-wrapper">${menusPage}</div></template>
                                <template x-if="view === 'profile'"><div class="exclusive-wrapper">${profilePage}</div></template>
                                <template x-if="view === 'sso-setup'"><div class="exclusive-wrapper">${ssoPage}</div></template>
                                ${commentsPage}
                                <template x-if="view === 'seo'"><div class="exclusive-wrapper">${seoPage}</div></template>
                                ${renderedPluginViews}
                                ${globalModals}
                            </div>
                        </main>
                        <!-- ===== Main Content End ===== -->

                        <!-- ===== Footer Start ===== -->
                        <footer class="sticky bottom-0 z-40 w-full py-4 px-4 md:px-6 2xl:px-8 border-t border-slate-200 bg-white/90 backdrop-blur-md shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
                            <div class="flex flex-col sm:flex-row items-center justify-between gap-2">
                                <p class="text-xs font-medium text-slate-500 text-center sm:text-left">
                                    &copy; <span x-text="new Date().getFullYear()"></span> <span x-text="(settings && settings.site_title) ? settings.site_title : 'Portal Redaksi'"></span>. All rights reserved.
                                </p>
                                <p class="text-xs font-medium text-slate-500 flex items-center gap-1">
                                    Built with <span class="text-rose-500"><i class="fas fa-heart"></i></span> <span x-text="(settings && settings.site_title) ? settings.site_title : 'Cloud Native'"></span>
                                    <span class="mx-1 opacity-50">|</span> 
                                    <span class="font-bold" x-text="systemVersion">v${CORE_VERSION}</span>
                                </p>
                            </div>
                        </footer>
                        <!-- ===== Footer End ===== -->

                    </div>
                    <!-- ===== Content Area End ===== -->
                </div>
                <!-- ===== Page Wrapper End ===== -->
                <!-- In-System Toast Notification Container (SOP 16) -->
                <div id="cms-toast-container" class="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2 pointer-events-none"></div>

                <!-- In-System Confirmation Modal (SOP 16) -->
                <div id="cms-confirm-modal" class="fixed inset-0 z-[99998] hidden flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all">
                    <div id="cms-confirm-card" class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 transform transition-all scale-95 opacity-0 duration-200">
                        <div class="flex items-start gap-4">
                            <div id="cms-confirm-icon-wrap" class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 text-rose-600">
                                <i id="cms-confirm-icon" class="fas fa-trash-alt text-xl"></i>
                            </div>
                            <div class="flex-1">
                                <h4 id="cms-confirm-title" class="text-base font-bold text-slate-800">Konfirmasi Tindakan</h4>
                                <p id="cms-confirm-message" class="text-sm text-slate-600 mt-1 whitespace-pre-line"></p>
                            </div>
                        </div>
                        <div class="flex justify-end gap-3 mt-6">
                            <button id="cms-confirm-cancel-btn" class="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Batal</button>
                            <button id="cms-confirm-ok-btn" class="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors flex items-center gap-2">
                                <span id="cms-confirm-ok-text">Ya, Lanjutkan</span>
                            </button>
                        </div>
                    </div>
                </div>
            </template>
        </body>
        </html>`;
    } catch (err: any) {
        return `<h1>Render Error: ${err.message}</h1>`;
    }
}