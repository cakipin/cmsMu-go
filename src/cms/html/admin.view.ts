import { cmsLogic } from "../cms.logic";

/**
 * 🖥️ ADMIN VIEW MODULE
 * Memisahkan tampilan HTML dari routing utama (index.ts).
 */
export const adminView = () => `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Labmu CMS Admin</title>
    
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/css/suneditor.min.css" rel="stylesheet">
    
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f0f1; margin: 0; }
        .app-layout { display: grid; height: 100vh; transition: 0.3s; }
        
        /* Sidebar */
        .sidebar { background: #1d2327; color: #fff; overflow-y: auto; transition: 0.3s; }
        .sidebar a { display: flex; align-items: center; padding: 12px 15px; color: #fff; text-decoration: none; border-bottom: 1px solid #2c3338; cursor: pointer; }
        .sidebar a:hover, .sidebar a.active { background: #2271b1; color: white; }
        .sidebar i { width: 25px; text-align: center; }
        
        /* Content */
        .main-content { padding: 20px; overflow-y: auto; }
        
        /* Tables */
        .table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .table th, .table td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
        .table th { background: #f8f9fa; font-weight: 600; color: #333; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .badge-success { background: #d1fae5; color: #065f46; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        
        /* Utils */
        .btn { padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; font-size: 14px; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; }
        .btn-primary { background: #2271b1; color: white; }
        .btn-icon { background: none; border: none; cursor: pointer; padding: 5px; }
        .animate-fade { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        /* Alpine Utility */
        [x-cloak] { display: none !important; }
    </style>
</head>
<body x-data="cms()" x-init="init()" x-cloak>

    <div x-show="!token" style="display:flex; justify-content:center; align-items:center; height:100vh; background:#f0f0f1;">
        <div style="background:white; padding:40px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1); width:350px;">
            <h2 style="text-align:center; margin-bottom:20px; color:#333;">Login Admin</h2>
            <form @submit.prevent="login()">
                <input type="text" x-model="loginForm.username" placeholder="Username" style="width:100%; padding:10px; margin-bottom:15px; border:1px solid #ddd; border-radius:4px; box-sizing:border-box;">
                <input type="password" x-model="loginForm.password" placeholder="Password" style="width:100%; padding:10px; margin-bottom:20px; border:1px solid #ddd; border-radius:4px; box-sizing:border-box;">
                <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center;" :disabled="isLoggingIn">
                    <span x-text="isLoggingIn ? 'Masuk...' : 'Login'"></span>
                </button>
            </form>
        </div>
    </div>

    <div x-show="token" class="app-layout" :style="sidebarOpen ? 'grid-template-columns: 240px 1fr' : 'grid-template-columns: 60px 1fr'">
        
        <aside class="sidebar">
            <div style="padding:15px; font-weight:bold; font-size:1.2em; border-bottom:1px solid #444; display:flex; justify-content:space-between; align-items:center;">
                <span x-show="sidebarOpen">LABMU CMS</span>
                <i class="fas fa-bars" @click="sidebarOpen = !sidebarOpen" style="cursor:pointer;"></i>
            </div>
            <nav>
                <a @click="view='dash'" :class="view==='dash'?'active':''"><i class="fas fa-tachometer-alt"></i> <span x-show="sidebarOpen">Dashboard</span></a>
                <a @click="view='posts'; loadPosts()" :class="view==='posts'?'active':''"><i class="fas fa-th-list"></i> <span x-show="sidebarOpen">Artikel</span></a>
                <a @click="view='pages'; loadPages()" :class="view==='pages'?'active':''"><i class="fas fa-file-alt"></i> <span x-show="sidebarOpen">Halaman</span></a>
                <a @click="view='media'; loadMedia()" :class="view==='media'?'active':''"><i class="fas fa-images"></i> <span x-show="sidebarOpen">Media</span></a>
                <a @click="view='users'; loadUsers()" :class="view==='users'?'active':''"><i class="fas fa-users"></i> <span x-show="sidebarOpen">Users</span></a>
                <a @click="view='settings'; loadSettings()" :class="view==='settings'?'active':''"><i class="fas fa-cog"></i> <span x-show="sidebarOpen">Settings</span></a>
                <a @click="logout()"><i class="fas fa-sign-out-alt"></i> <span x-show="sidebarOpen">Keluar</span></a>
            </nav>
        </aside>

        <main class="main-content">
            
            <div style="margin-bottom:20px; border-bottom:1px solid #ddd; padding-bottom:10px;">
                <h2 style="margin:0; font-size:24px;" x-text="getPageTitle()"></h2>
            </div>

            <div x-show="view === 'dash'" class="animate-fade">
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:20px;">
                    <div style="background:white; padding:20px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                        <h3>Total Artikel</h3>
                        <p style="font-size:2em; margin:0;" x-text="dashboardStats.posts || 0"></p>
                    </div>
                    <div style="background:white; padding:20px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                        <h3>Total Halaman</h3>
                        <p style="font-size:2em; margin:0;" x-text="dashboardStats.pages || 0"></p>
                    </div>
                     <div style="background:white; padding:20px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                        <h3>Total Media</h3>
                        <p style="font-size:2em; margin:0;" x-text="dashboardStats.media || 0"></p>
                    </div>
                </div>
            </div>

            <div x-show="view === 'posts'" class="animate-fade">
                <div style="text-align:right; margin-bottom:15px;">
                    <button @click="openEditor('post')" class="btn btn-primary"><i class="fas fa-plus"></i> Buat Artikel</button>
                </div>
                
                <div x-show="isLoadingPosts" style="text-align:center; padding:50px;">
                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                </div>

                <div x-show="!isLoadingPosts && posts.length > 0">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Judul</th>
                                <th>Status</th>
                                <th>Tanggal</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template x-for="post in posts" :key="post.id">
                                <tr>
                                    <td>
                                        <div x-text="post.title" style="font-weight:bold;"></div>
                                        <small x-text="'/' + post.slug" style="color:#666;"></small>
                                    </td>
                                    <td><span class="badge" :class="post.status==='publish'?'badge-success':'badge-warning'" x-text="post.status"></span></td>
                                    <td x-text="formatDate(post.date)"></td>
                                    <td>
                                        <button @click="editContent(post)" class="btn-icon" style="color:#2271b1;"><i class="fas fa-edit"></i></button>
                                        <button @click="deleteContent(post.id, 'post')" class="btn-icon" style="color:red;"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
                <div x-show="!isLoadingPosts && posts.length === 0" style="padding:20px; text-align:center;">Belum ada artikel.</div>
            </div>

            <div x-show="view === 'pages'" class="animate-fade">
                <div style="text-align:right; margin-bottom:15px;">
                    <button @click="openEditor('page')" class="btn btn-primary"><i class="fas fa-plus"></i> Buat Halaman</button>
                </div>

                <div x-show="isLoadingPages" style="text-align:center; padding:50px;">
                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                </div>

                <div x-show="!isLoadingPages && pages.length > 0">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Judul Halaman</th>
                                <th>Slug</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template x-for="page in pages" :key="page.id">
                                <tr>
                                    <td x-text="page.title" style="font-weight:bold;"></td>
                                    <td x-text="'/' + page.slug"></td>
                                    <td>
                                        <button @click="editContent(page)" class="btn-icon" style="color:#2271b1;"><i class="fas fa-edit"></i></button>
                                        <button @click="deleteContent(page.id, 'page')" class="btn-icon" style="color:red;"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
                <div x-show="!isLoadingPages && pages.length === 0" style="padding:20px; text-align:center;">Belum ada halaman.</div>
            </div>

            <div x-show="view === 'add'" class="animate-fade">
                <div style="background:white; padding:20px; border-radius:8px; border:1px solid #ddd;">
                    
                    <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                         <input type="text" x-model="form.title" @input="makeSlug()" placeholder="Tambahkan Judul..." 
                           style="width:70%; font-size:20px; padding:10px; border:1px solid #ddd; border-radius:4px;">
                         
                         <div>
                            <button @click="view = (form.type==='page'?'pages':'posts')" class="btn" style="background:#eee; color:#333;">Batal</button>
                            <button @click="save()" class="btn btn-primary">
                                <i class="fas" :class="isSavingMeta ? 'fa-spinner fa-spin' : 'fa-save'"></i> Simpan
                            </button>
                         </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 3fr 1fr; gap:20px;">
                        <div>
                            <textarea id="editor_id" style="width:100%; height:500px; display:none;"></textarea>
                        </div>
                        
                        <div style="background:#f9f9f9; padding:15px; border-radius:4px; height:fit-content;">
                            <div style="margin-bottom:15px;">
                                <label><strong>Status</strong></label>
                                <select x-model="form.status" style="width:100%; padding:8px; margin-top:5px;">
                                    <option value="publish">Publish</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                             <div style="margin-bottom:15px;">
                                <label><strong>Slug</strong></label>
                                <input type="text" x-model="form.slug" style="width:100%; padding:8px; margin-top:5px; color:#666;">
                            </div>
                            <div style="margin-bottom:15px;">
                                <label><strong>Thumbnail</strong></label>
                                <div @click="openMediaSelector()" style="border:2px dashed #ccc; padding:10px; text-align:center; cursor:pointer; background:white; margin-top:5px;">
                                    <img x-show="form.featured_image" :src="form.featured_image" style="max-width:100%;">
                                    <span x-show="!form.featured_image" style="font-size:0.8em; color:#888;">+ Pilih Gambar</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div x-show="view === 'media'" class="animate-fade">
                <h2>Media Library</h2>
                <p>Fitur media akan tampil di sini...</p>
                </div>

             <div x-show="view === 'users'" class="animate-fade">
                <h2>User Management</h2>
                 </div>

            <div x-show="view === 'settings'" class="animate-fade">
                <h2>Pengaturan Situs</h2>
                 </div>

        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/suneditor.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/suneditor@latest/src/lang/en.js"></script>
    
    <script>
        ${cmsLogic}
    </script>
    
    <script src="//unpkg.com/alpinejs" defer></script>

</body>
</html>
`;
