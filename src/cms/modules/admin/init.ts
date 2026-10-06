window.adminMenus = [
  {
    group: "Content",
    title: "All Posts",
    view: "posts",
    icon: "fas fa-thumbtack",
    action: () => loadPosts(),
  },
  {
    group: "Content",
    title: "Add Post",
    view: "add",
    icon: "fas fa-plus-circle",
  },
  {
    group: "Content",
    title: "Pages",
    view: "pages",
    icon: "fas fa-copy",
    action: () => loadPages(),
  },
  {
    group: "Appearance",
    title: "Themes",
    view: "themes",
    icon: "fas fa-paint-brush",
  },
  // Menu Plugins
  {
    group: "Plugins",
    title: "All Plugins",
    view: "plugins",
    icon: "fas fa-plug",
    action: () => loadPlugins(),
  },
  {
    group: "Plugins",
    title: "Sync Tarjih",
    href: "/admin/tarjih-sync",
    icon: "fas fa-sync-alt",
  },
];
