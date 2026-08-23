import { adminStyles } from './blocks/styles';
import { sidebarBlock } from './blocks/sidebar';
import { dashboardPage } from './blocks/dashboard.page';
import { pagesBlock } from './blocks/pages';
import { menusPage } from './blocks/menus.page';
import { globalModals } from './blocks/modals';
import { cmsLogic } from './blocks/cms.logic';
import { loginPage } from './pages/login.page';

export function renderAdmin(data: any): string {
    const isLoginView = data.view === 'login';

    try {
        return `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin LabMu</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <link href="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/css/suneditor.min.css" rel="stylesheet">
            <style>
                ${adminStyles}
                [x-cloak] { display: none !important; }
            </style>
            <script src="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/suneditor.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/suneditor@latest/src/lang/en.js"></script>

            <script>
                (function() {
                    const token = '';
                    const isLoginPage = window.location.pathname.includes('/login');
                    if (!token && !isLoginPage) {
                        window.location.href = '/admin/login';
                    }
                })();

                /** * [ADDON SYSTEM] Inisialisasi Sidebar Otomatis
                 * Kita siapkan di awal agar bisa dipush oleh plugin manapun
                */
                window.adminMenus = window.adminMenus || [
                    { group: 'Content', title: 'All Posts', view: 'posts', icon: 'fas fa-thumbtack', action: () => typeof loadPosts === 'function' && loadPosts() },
                    { group: 'Content', title: 'Add Post', view: 'add', icon: 'fas fa-plus-circle', action: () => { window.editingId = null; } },
                    { group: 'Content', title: 'Pages', view: 'pages', icon: 'fas fa-copy', action: () => typeof loadPages === 'function' && loadPages() },
                    { group: 'Content', title: 'Add Page', view: 'add-page', icon: 'fas fa-plus-square', action: () => { window.editingPageId = null; } },
                    { group: 'Content', title: 'Media', view: 'media', icon: 'fas fa-photo-video', action: () => typeof loadMedia === 'function' && loadMedia() },
                    { group: 'Appearance', title: 'Themes', view: 'themes', icon: 'fas fa-paint-brush', role: ['admin', 'editor'] },
                    { group: 'Appearance', title: 'Menus', view: 'menus', icon: 'fas fa-bars', role: ['admin', 'editor'] },
                    { group: 'System', title: 'Users', view: 'users', icon: 'fas fa-users', role: ['admin'], action: () => typeof loadUsers === 'function' && loadUsers() },
                    { group: 'System', title: 'Settings', view: 'settings', icon: 'fas fa-cog', role: ['admin'] }
                ];
            </script>

            <script>${cmsLogic}</script>
            <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
        </head>
        <body x-data="cms()" x-init="init()" x-cloak>

            <template x-if="${isLoginView} || !token">
                ${loginPage}
            </template>

            <template x-if="token && !${isLoginView}">
                <div class="app-layout"
                     :style="sidebarOpen ? 'grid-template-columns: 240px 1fr' : 'grid-template-columns: 60px 1fr'"
                     style="display:grid; height:100vh;">

                    ${sidebarBlock}

                    <div style="display:flex; flex-direction:column; overflow:hidden;">
                        <header style="background:#fff; padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:15px;">
                                <button @click="sidebarOpen = !sidebarOpen" style="border:none; background:none; cursor:pointer;">
                                    <i class="fas fa-bars"></i>
                                </button>
                                <h3 x-text="getPageTitle()" style="margin:0; font-size: 16px;"></h3>
                            </div>
                            <div style="display:flex; align-items:center; gap:10px;">
                                 <button @click="logout()" style="font-size:12px; cursor:pointer; background:#f44336; color:white; border:none; padding:5px 10px; border-radius:4px;">
                                    <i class="fas fa-sign-out-alt"></i> Logout
                                 </button>
                            </div>
                        </header>

                        <main style="flex:1; overflow-y:auto; padding:20px;">
                            ${dashboardPage}
                            ${pagesBlock}
                            <template x-if="view === 'menus'"><div class="exclusive-wrapper">${menusPage}</div></template>
                            ${globalModals}
                        </main>
                    </div>
                </div>
            </template>
        </body>
        </html>`;
    } catch (err: any) {
        return `<h1>Render Error: ${err.message}</h1>`;
    }
}