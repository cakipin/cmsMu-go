export const sidebarBlock = `
<!-- Mobile Overlay -->
<div x-show="sidebarOpen" class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300" @click="sidebarOpen = false"></div>

<aside 
  :class="sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:w-20 lg:translate-x-0'"
  class="fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden overflow-x-hidden bg-[#0f172a] duration-300 ease-in-out lg:static shrink-0 shadow-xl"
>
  <!-- SIDEBAR HEADER -->
  <div class="flex items-center px-4 py-5.5 lg:py-6.5 mt-2 mb-2" :class="sidebarOpen ? 'justify-between' : 'justify-center'">
    <a href="/" class="text-white text-2xl font-black tracking-tight flex items-center gap-3">
      <div class="bg-primary/20 p-2 rounded-lg text-primary flex items-center justify-center min-w-[40px]">
          <i class="fas fa-flask text-xl"></i>
      </div>
      <span x-show="sidebarOpen" class="whitespace-nowrap transition-opacity duration-300">CMSMu</span>
    </a>
    <button class="block lg:hidden text-white" @click.stop="sidebarOpen = false" x-show="sidebarOpen">
      <i class="fas fa-arrow-left"></i>
    </button>
  </div>
  <!-- SIDEBAR HEADER -->

  <div class="no-scrollbar flex flex-col overflow-y-auto overflow-x-hidden duration-300 ease-linear">
    <nav class="mt-2 py-4 px-4 w-64 lg:w-auto" :class="!sidebarOpen ? 'lg:px-2' : ''">
      
      <div>
        <h3 class="mb-3 ml-3 text-xs font-bold uppercase tracking-widest text-slate-400" x-show="sidebarOpen">MENU</h3>
        <h3 class="mb-3 text-center text-xs font-bold uppercase tracking-widest text-slate-400 lg:block hidden" x-show="!sidebarOpen">...</h3>
        <ul class="mb-6 flex flex-col gap-1">
          <li>
            <a class="group relative flex items-center gap-3 rounded-xl py-3 text-sm font-semibold text-slate-300 duration-200 ease-in-out hover:bg-slate-800 hover:text-white" 
               :class="[view=='dash'?'bg-slate-800 text-white':'', sidebarOpen ? 'px-4' : 'px-0 justify-center']" 
               @click="view='dash'; if(window.innerWidth < 1024) sidebarOpen = false;" title="Dashboard" href="javascript:void(0);">
              <i class="fas fa-tachometer-alt w-5 text-center text-lg transition-colors group-hover:text-primary" :class="view=='dash'?'text-primary':''"></i> 
              <span x-show="sidebarOpen" class="whitespace-nowrap">Dashboard</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Loop Menus -->
      <template x-for="groupName in ['Content', 'Appearance', 'System', 'Plugins']">
        <div x-show="(window.adminMenus || []).some(m => m.group === groupName)">
          <h3 class="mb-3 ml-3 mt-6 text-xs font-bold uppercase tracking-widest text-slate-400" x-text="groupName" x-show="sidebarOpen"></h3>
          <h3 class="mb-3 mt-6 text-center text-xs font-bold uppercase tracking-widest text-slate-400 lg:block hidden" x-show="!sidebarOpen">...</h3>
          
          <ul class="mb-6 flex flex-col gap-1">
            <template x-for="menu in (window.adminMenus || []).filter(m => m.group === groupName)">
              <template x-if="!menu.role || menu.role.includes(userRole)">
                <li>
                  <template x-if="!menu.href">
                    <a class="group relative flex items-center gap-3 rounded-xl py-3 text-sm font-semibold text-slate-300 duration-200 ease-in-out hover:bg-slate-800 hover:text-white" 
                       :class="[view == menu.view ? 'bg-slate-800 text-white' : '', sidebarOpen ? 'px-4' : 'px-0 justify-center']" 
                       @click="view = menu.view; if(menu.action) menu.action(); if(window.innerWidth < 1024) sidebarOpen = false;" 
                       :title="menu.title" href="javascript:void(0);">
                      <i :class="menu.icon + ' w-5 text-center text-lg transition-colors group-hover:text-primary'" :class="view==menu.view?'text-primary':''"></i> 
                      <span x-text="menu.title" x-show="sidebarOpen" class="whitespace-nowrap"></span>
                    </a>
                  </template>

                  <template x-if="menu.href">
                    <a :href="menu.href" class="group relative flex items-center gap-3 rounded-xl py-3 text-sm font-semibold text-slate-300 duration-200 ease-in-out hover:bg-slate-800 hover:text-white" 
                       :class="sidebarOpen ? 'px-4' : 'px-0 justify-center'"
                       :title="menu.title">
                      <i :class="menu.icon + ' w-5 text-center text-lg transition-colors group-hover:text-primary'"></i> 
                      <span x-text="menu.title" x-show="sidebarOpen" class="whitespace-nowrap"></span>
                    </a>
                  </template>
                </li>
              </template>
            </template>
          </ul>
        </div>
      </template>
    </nav>
  </div>
</aside>
`;