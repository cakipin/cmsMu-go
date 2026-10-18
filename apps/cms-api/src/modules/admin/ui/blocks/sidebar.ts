export const sidebarBlock = `
<!-- Mobile Overlay -->
<div x-show="sidebarOpen" class="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300" @click="sidebarOpen = false"></div>

<aside 
  :class="sidebarOpen ? 'translate-x-0 w-56' : '-translate-x-full w-56 lg:w-[64px] lg:translate-x-0'"
  class="fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden overflow-x-hidden bg-gradient-to-b from-[#2b323c] via-[#222730] to-[#1a1e24] border-r border-slate-700/60 duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] lg:static shrink-0 shadow-2xl transition-[width,transform]"
>
  <!-- SIDEBAR HEADER (Dynamic Brand synced with Settings) -->
  <div class="flex items-center px-3.5 py-3 border-b border-slate-700/40" :class="sidebarOpen ? 'justify-between' : 'justify-center'">
    <a href="/admin" class="flex items-center gap-2.5 overflow-hidden text-decoration-none group" :title="(settings && settings.site_title) ? settings.site_title : 'cmsMu Dashboard'">
      <!-- Logo Container -->
      <template x-if="settings && (settings.site_logo || settings.logo)">
        <img :src="settings.site_logo || settings.logo" class="w-8 h-8 object-contain rounded-lg shrink-0 ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-200" :alt="settings.site_title || 'cmsMu'">
      </template>
      <template x-if="!settings || (!settings.site_logo && !settings.logo)">
        <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-sky-600 text-white shadow-md shrink-0 ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-200">
          <i class="fas fa-layer-group text-sm"></i>
        </div>
      </template>

      <!-- Brand Text -->
      <div x-show="sidebarOpen" class="flex flex-col text-left leading-none transition-opacity duration-200 overflow-hidden">
        <span class="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
          <span x-text="(settings && settings.site_title) ? settings.site_title : 'cmsMu'" class="truncate"></span>
          <span class="text-[9px] font-medium px-1 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded leading-none shrink-0">CMS</span>
        </span>
        <span class="text-[10px] text-slate-400 font-normal tracking-wide mt-1 truncate max-w-[135px]" x-text="(settings && settings.site_desc) ? settings.site_desc : 'CMS Dashboard'"></span>
      </div>
    </a>
    <button class="block lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors" @click.stop="sidebarOpen = false" x-show="sidebarOpen" title="Tutup Menu">
      <i class="fas fa-times text-sm"></i>
    </button>
  </div>
  <!-- SIDEBAR HEADER END -->

  <!-- SIDEBAR NAVIGATION: pb-8 untuk safe-area navigasi gesture Android/iOS -->
  <div class="no-scrollbar flex flex-col overflow-y-auto overflow-x-hidden duration-200 flex-1 py-2 pb-8">
    <nav class="px-2" :class="!sidebarOpen ? 'lg:px-1.5' : ''">
      
      <!-- MENU UTAMA -->
      <div>
        <h3 class="mb-1 ml-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400/80" x-show="sidebarOpen">MENU</h3>
        <ul class="mb-1.5 flex flex-col gap-0.5">
          <li class="relative group">
            <a class="relative flex items-center rounded-xl py-2 min-h-[38px] text-[13px] font-medium text-slate-300 duration-150 ease-in-out hover:bg-[#323a46] hover:text-white transition-colors" 
               :class="[view=='dash'?'bg-[#374151] text-white shadow-sm border-l-2 border-teal-400':'', sidebarOpen ? 'px-2.5 gap-2.5' : 'px-0 justify-center w-full']" 
               @click="view='dash'; if(window.innerWidth < 1024) sidebarOpen = false;" title="Dashboard" href="javascript:void(0);">
              <i class="fas fa-tachometer-alt w-5 text-center text-sm transition-colors group-hover:text-teal-400" :class="view=='dash'?'text-teal-400':''"></i> 
              <span x-show="sidebarOpen" class="whitespace-nowrap transition-opacity">Dashboard</span>
            </a>

            <!-- Floating Tooltip saat sidebar ditutup (Icon-Only Rail) -->
            <div x-show="!sidebarOpen" class="fixed left-[68px] px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-md shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-700/60 hidden lg:block">
              <span>Dashboard</span>
            </div>
          </li>
        </ul>
      </div>

      <!-- LOOP MENU GRUP -->
      <template x-for="groupName in ['Content', 'Appearance', 'System']">
        <div x-show="(window.adminMenus || []).some(m => m.group === groupName && (!m.role || m.role.includes(userRole) || userRole === 'superadmin' || (userRole === 'admin' && m.role.includes('admin'))) && (!m.pluginId || isPluginActive(m.pluginId)))">
          <!-- Label Grup Saat Expanded -->
          <h3 class="mb-1 ml-2 mt-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400/80" x-text="groupName" x-show="sidebarOpen"></h3>
          <!-- Garis Pemisah Halus Saat Rail Collapsed -->
          <div class="border-t border-slate-700/40 my-1.5 mx-1 hidden lg:block" x-show="!sidebarOpen"></div>
          
          <ul class="mb-1.5 flex flex-col gap-0.5">
            <template x-for="menu in (window.adminMenus || []).filter(m => m.group === groupName)">
              <template x-if="(!menu.role || menu.role.includes(userRole) || userRole === 'superadmin' || (userRole === 'admin' && menu.role.includes('admin'))) && (!menu.pluginId || isPluginActive(menu.pluginId))">
                <li class="relative group">
                  <template x-if="!menu.href">
                    <a class="relative flex items-center rounded-xl py-2 min-h-[38px] text-[13px] font-medium text-slate-300 duration-150 ease-in-out hover:bg-[#323a46] hover:text-white transition-colors" 
                       :class="[(view == menu.view || (menu.view === 'settings' && ['settings', 'seo', 'plugins', 'sso-setup', 'ota'].includes(view))) ? 'bg-[#374151] text-white shadow-sm border-l-2 border-teal-400' : '', sidebarOpen ? 'px-2.5 gap-2.5' : 'px-0 justify-center w-full']" 
                       @click="view = menu.view; if(menu.action) menu.action(); if(window.innerWidth < 1024) sidebarOpen = false;" 
                       :title="menu.title" href="javascript:void(0);">
                      <i :class="[menu.icon + ' w-5 text-center text-sm transition-colors group-hover:text-teal-400', (view == menu.view || (menu.view === 'settings' && ['settings', 'seo', 'plugins', 'sso-setup', 'ota'].includes(view))) ? 'text-teal-400' : '']"></i> 
                      
                      <span x-text="menu.title" x-show="sidebarOpen" class="whitespace-nowrap flex-grow transition-opacity truncate"></span>
                      
                      <!-- Badge counter -->
                      <template x-if="menu.badge && $data[menu.badge] > 0">
                          <span x-show="sidebarOpen" x-text="$data[menu.badge]" class="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-auto shadow-sm whitespace-nowrap"></span>
                      </template>
                      <!-- Minimal Dot Badge for rail -->
                      <template x-if="menu.badge && $data[menu.badge] > 0">
                          <span x-show="!sidebarOpen" class="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full lg:block hidden shadow-sm border border-[#222730]"></span>
                      </template>
                    </a>
                  </template>

                  <template x-if="menu.href">
                    <a :href="menu.href" class="relative flex items-center rounded-xl py-2 min-h-[38px] text-[13px] font-medium text-slate-300 duration-150 ease-in-out hover:bg-[#323a46] hover:text-white transition-colors" 
                       :class="sidebarOpen ? 'px-2.5 gap-2.5' : 'px-0 justify-center w-full'"
                       :title="menu.title">
                      <i :class="menu.icon + ' w-5 text-center text-sm transition-colors group-hover:text-teal-400'"></i> 
                      <span x-text="menu.title" x-show="sidebarOpen" class="whitespace-nowrap transition-opacity truncate"></span>
                    </a>
                  </template>

                  <!-- Floating Tooltip saat Icon-Only Rail -->
                  <div x-show="!sidebarOpen" class="fixed left-[68px] px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-md shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-700/60 hidden lg:block">
                    <span x-text="menu.title"></span>
                  </div>

                </li>
              </template>
            </template>
          </ul>
        </div>
      </template>
    </nav>
  </div>

  <!-- USER PROFILE STRIP (Bottom Rail / Expanded) dengan Safe-Area Navigation Gestures -->
  <div class="border-t border-slate-700/40 p-2.5 pb-6 lg:pb-2.5 bg-black/20">
    <div class="flex items-center gap-2.5" :class="sidebarOpen ? 'px-1' : 'justify-center'">
      <div @click="view='profile'; if(window.innerWidth < 1024) sidebarOpen = false;" 
           class="h-9 w-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs ring-1 ring-white/10 shrink-0 cursor-pointer hover:ring-teal-400 transition-all">
        <template x-if="userAvatar">
          <img :src="userAvatar" alt="Avatar" class="h-full w-full object-cover rounded-full">
        </template>
        <template x-if="!userAvatar">
          <i class="fas fa-user text-xs"></i>
        </template>
      </div>
      <div x-show="sidebarOpen" @click="view='profile'; if(window.innerWidth < 1024) sidebarOpen = false;" 
           class="flex flex-col text-left leading-none overflow-hidden flex-1 cursor-pointer group">
        <span class="text-xs font-semibold text-white group-hover:text-teal-300 transition-colors truncate" x-text="userName || 'Administrator'">Administrator</span>
        <span class="text-[10px] text-teal-400 capitalize mt-1" x-text="userRole || 'Admin'">Admin</span>
      </div>
      <button x-show="sidebarOpen" @click="logout()" 
              class="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all shrink-0" 
              title="Logout">
        <i class="fas fa-sign-out-alt text-sm"></i>
      </button>
    </div>
  </div>

</aside>
`;