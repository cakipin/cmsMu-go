import { pluginMenus } from '../../../registry/admin-menu';

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
import { labmuProSettingsPage } from './blocks/labmu-pro-settings.page'
import { commentsPage } from './blocks/comments.page';
import { profilePage } from './blocks/profile.page';

export function renderAdmin(data: any): string {
    const isLoginView = data.view === 'login';

    const injectedPlugins = pluginMenus.map(p => {
        return `{
            group: "${p.group}",
            title: "${p.title}",
            icon: "${p.icon}",
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
            <title>Admin LabMu</title>
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
            <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js" defer></script>
            <script>
                window.adminMenus = [
                    { group: 'Content', title: 'All Posts', view: 'posts', icon: 'fas fa-thumbtack', action: () => typeof loadPosts === 'function' && loadPosts() },
                    { group: 'Content', title: 'Add Post', view: 'add', icon: 'fas fa-plus-circle', action: () => { window.editingId = null; } },
                    { group: 'Content', title: 'Pages', view: 'pages', icon: 'fas fa-copy', action: () => typeof loadPages === 'function' && loadPages() },
                    { group: 'Content', title: 'Add Page', view: 'add-page', icon: 'fas fa-plus-square', action: () => { window.editingPageId = null; } },
                    { group: 'Content', title: 'Media', view: 'media', icon: 'fas fa-photo-video', action: () => typeof loadMedia === 'function' && loadMedia() },
                    { group: 'Content', title: 'Komentar', view: 'comments', icon: 'fas fa-comments', role: ['administrator', 'editor'] },
                    { group: 'Appearance', title: 'Themes', view: 'themes', icon: 'fas fa-paint-brush', role: ['administrator', 'editor'] },
                    { group: 'Appearance', title: 'Theme Editor', action: () => window.location.href = '/theme-editor?slug=home', icon: 'fas fa-laptop-code', role: ['administrator'] },
                    { group: 'Appearance', title: 'LabMu Pro Settings', view: 'labmu-pro-settings', icon: 'fas fa-crown', role: ['administrator'] },
                    { group: 'Appearance', title: 'Menus', view: 'menus', icon: 'fas fa-bars', role: ['administrator', 'editor'] },
                    { group: 'System', title: 'Users', view: 'users', icon: 'fas fa-users', role: ['administrator'], action: () => typeof loadUsers === 'function' && loadUsers() },
                    { group: 'System', title: 'Settings', view: 'settings', icon: 'fas fa-cog', role: ['administrator'] },
                    { group: 'Plugins', title: 'SSO Setup', view: 'sso-setup', icon: 'fas fa-shield-alt', role: ['administrator'] }
                ];

                const plugins = [${injectedPlugins}];
                window.adminMenus = window.adminMenus.concat(plugins);
            </script>

            <script>${cmsLogic}</script>
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
                                    <!-- Hamburger Toggle BTN -->
                                    <button @click.stop="sidebarOpen = !sidebarOpen" class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
                                        <i class="fas fa-bars text-base"></i>
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
                                                headers: { 'Authorization': 'Bearer ' + '' }
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
                                                    'Authorization': 'Bearer ' + '',
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
                                            <span x-show="unreadCount > 0" class="absolute -top-0.5 -right-0.5 z-10 h-2.5 w-2.5 rounded-full bg-rose-500 flex items-center justify-center text-[8px] text-white font-bold" x-text="unreadCount">
                                            </span>
                                            <i class="far fa-bell text-sm"></i>
                                        </button>

                                        <!-- Notif Dropdown -->
                                        <div x-show="notifOpen" x-transition.opacity.duration.200ms class="absolute -right-2 mt-2.5 flex max-h-90 w-72 flex-col rounded-xl border border-slate-200 bg-white shadow-xl sm:right-0 sm:w-80" style="display: none;">
                                            <div class="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                                <h5 class="text-sm font-semibold text-slate-800">Notifikasi</h5>
                                                <button x-show="unreadCount > 0" @click="markAsRead()" class="text-xs text-primary hover:underline focus:outline-none">Tandai semua dibaca</button>
                                            </div>
                                            <div class="flex flex-col overflow-y-auto px-2 py-2" style="max-height: 300px;">
                                                <template x-if="notifications.length === 0">
                                                    <p class="text-xs text-slate-500 text-center py-4">Tidak ada notifikasi baru.</p>
                                                </template>
                                                <template x-for="n in notifications">
                                                    <div class="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0 relative group">
                                                        <div class="h-8 w-8 rounded-full flex items-center justify-center shrink-0" :class="n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'">
                                                            <i class="fas text-xs" :class="n.type === 'success' ? 'fa-user-plus' : 'fa-sign-in-alt'"></i>
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

                                    <!-- User Avatar & Dropdown -->
                                    <div class="relative">
                                        <button @click="dropdownOpen = !dropdownOpen" @click.outside="dropdownOpen = false" class="flex items-center gap-2 focus:outline-none">
                                            <span class="hidden text-right lg:block">
                                                <span class="block text-sm font-semibold text-slate-800" x-text="userName ? userName : (userRole === 'administrator' ? 'Administrator' : (userRole || 'Admin'))"></span>
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
                                ${pagesBlock}
                                <template x-if="view === 'menus'"><div class="exclusive-wrapper">${menusPage}</div></template>
                                ${labmuProSettingsPage}
                                <template x-if="view === 'profile'"><div class="exclusive-wrapper">${profilePage}</div></template>
                                ${ssoPage}
                                ${commentsPage}
                                ${globalModals}
                            </div>
                        </main>
                        <!-- ===== Main Content End ===== -->

                        <!-- ===== Footer Start ===== -->
                        <footer class="sticky bottom-0 z-40 w-full py-4 px-4 md:px-6 2xl:px-8 border-t border-slate-200 bg-white/90 backdrop-blur-md shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
                            <div class="flex flex-col sm:flex-row items-center justify-between gap-2">
                                <p class="text-xs font-medium text-slate-500 text-center sm:text-left">
                                    &copy; <span x-text="new Date().getFullYear()"></span> CMSMu. All rights reserved.
                                </p>
                                <p class="text-xs font-medium text-slate-500 flex items-center gap-1">
                                    Built with <span class="text-rose-500"><i class="fas fa-heart"></i></span> by Cak Iphin LabMu
                                    <span class="mx-1 opacity-50">|</span>
                                    <span class="font-bold">v.0.1</span>
                                </p>
                            </div>
                        </footer>
                        <!-- ===== Footer End ===== -->

                    </div>
                    <!-- ===== Content Area End ===== -->
                </div>
                <!-- ===== Page Wrapper End ===== -->
            </template>
        </body>
        </html>`;
    } catch (err: any) {
        return `<h1>Render Error: ${err.message}</h1>`;
    }
}
