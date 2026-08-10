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
                (function() {
                    const token = localStorage.getItem('labmu_token');
                    const isLoginPage = window.location.pathname.includes('/login');
                    if (!token && !isLoginPage) {
                        window.location.href = '/admin/login'; 
                    }
                })();

                window.adminMenus = [
                    { group: 'Content', title: 'All Posts', view: 'posts', icon: 'fas fa-thumbtack', action: () => typeof loadPosts === 'function' && loadPosts() },
                    { group: 'Content', title: 'Add Post', view: 'add', icon: 'fas fa-plus-circle', action: () => { window.editingId = null; } },
                    { group: 'Content', title: 'Pages', view: 'pages', icon: 'fas fa-copy', action: () => typeof loadPages === 'function' && loadPages() },
                    { group: 'Content', title: 'Add Page', view: 'add-page', icon: 'fas fa-plus-square', action: () => { window.editingPageId = null; } },
                    { group: 'Content', title: 'Media', view: 'media', icon: 'fas fa-photo-video', action: () => typeof loadMedia === 'function' && loadMedia() },
                    { group: 'Appearance', title: 'Themes', view: 'themes', icon: 'fas fa-paint-brush', role: ['admin', 'editor'] },
                    { group: 'Appearance', title: 'Theme Editor', href: '/theme-editor', icon: 'fas fa-laptop-code', role: ['admin'] },
                    { group: 'Appearance', title: 'Menus', view: 'menus', icon: 'fas fa-bars', role: ['admin', 'editor'] },
                    { group: 'System', title: 'Users', view: 'users', icon: 'fas fa-users', role: ['admin'], action: () => typeof loadUsers === 'function' && loadUsers() },
                    { group: 'System', title: 'Settings', view: 'settings', icon: 'fas fa-cog', role: ['admin'] },
                    { group: 'Plugins', title: 'SSO Setup', view: 'sso-setup', icon: 'fas fa-shield-alt', role: ['admin'] }
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
                                }" x-init="updateTime(); setInterval(() => updateTime(), 1000); fetchHijri();" class="flex items-center gap-3 sm:gap-4">
                                    
                                    <!-- Waktu dan Kalender -->
                                    <div class="hidden md:flex flex-col items-end text-right">
                                        <span class="text-xs font-semibold text-slate-800" x-text="currentTime + ' WIB'"></span>
                                        <span class="text-[10px] text-primary font-medium" x-text="currentHijri"></span>
                                    </div>

                                    <!-- Bell Icon -->
                                    <div class="relative">
                                        <button @click="notifOpen = !notifOpen" @click.outside="notifOpen = false" class="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:text-primary hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
                                            <span class="absolute -top-0.5 -right-0.5 z-10 h-2 w-2 rounded-full bg-rose-500">
                                                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                                            </span>
                                            <i class="far fa-bell text-sm"></i>
                                        </button>
                                        
                                        <!-- Notif Dropdown -->
                                        <div x-show="notifOpen" x-transition.opacity.duration.200ms class="absolute -right-2 mt-2.5 flex h-90 w-72 flex-col rounded-xl border border-slate-200 bg-white shadow-xl sm:right-0 sm:w-80" style="display: none;">
                                            <div class="px-4 py-3 border-b border-slate-100">
                                                <h5 class="text-sm font-semibold text-slate-800">Notifikasi</h5>
                                            </div>
                                            <div class="flex h-full flex-col overflow-y-auto px-4 py-3">
                                                <p class="text-xs text-slate-500 text-center py-4">Tidak ada notifikasi baru.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- User Avatar & Dropdown -->
                                    <div class="relative">
                                        <button @click="dropdownOpen = !dropdownOpen" @click.outside="dropdownOpen = false" class="flex items-center gap-2 focus:outline-none">
                                            <span class="hidden text-right lg:block">
                                                <span class="block text-sm font-semibold text-slate-800" x-text="userRole === 'admin' ? 'Administrator' : (userRole || 'Admin')"></span>
                                            </span>
                                            <div class="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm ring-2 ring-white border border-primary/20">
                                                <i class="fas fa-user-astronaut text-sm"></i>
                                            </div>
                                            <i class="fas fa-chevron-down text-xs text-slate-400 ml-1 transition-transform" :class="dropdownOpen ? 'rotate-180' : ''"></i>
                                        </button>

                                        <!-- User Dropdown Menu -->
                                        <div x-show="dropdownOpen" x-transition.opacity.duration.200ms class="absolute right-0 mt-3 flex w-48 flex-col rounded-xl border border-slate-200 bg-white shadow-xl" style="display: none;">
                                            <ul class="flex flex-col gap-1 border-b border-slate-100 p-2">
                                                <li>
                                                    <a href="#" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors">
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
                                ${ssoPage}
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