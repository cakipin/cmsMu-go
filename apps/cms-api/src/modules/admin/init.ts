(window as any).adminMenus = [
  {
    group: "Content",
    title: "All Posts",
    view: "posts",
    icon: "fas fa-thumbtack",
    action: () => (window as any).loadPosts?.(),
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
    action: () => (window as any).loadPages?.(),
  },
  {
    group: "Appearance",
    title: "Themes",
    view: "themes",
    icon: "fas fa-paint-brush",
  },
];
export {};
