// Simpan helper di luar object agar tidak berat
const startSunEditor = (id: string, content: string, onChange: (c: string) => void) => {
  // ... (Kode SunEditor Om yang sudah fix sebelumnya) ...
  // Pastikan pakai logika retry interval yang tadi
  const build = () => {
    const win = window as any;
    if (typeof win["SUNEDITOR"] === "undefined") return false;
    const target = document.getElementById(id);
    if (!target) return false;
    try {
      if (win["sunEditorInstance"]) {
        try {
          win["sunEditorInstance"].destroy();
        } catch (e) {}
      }
      const editor = win["SUNEDITOR"].create(id, {
        display: "block",
        width: "100%",
        height: "500px",
        buttonList: [
          ["undo", "redo"],
          ["font", "fontSize", "formatBlock"],
          ["bold", "underline", "italic", "strike"],
          ["removeFormat"],
          ["fontColor", "hiliteColor"],
          ["align", "list", "lineHeight"],
          ["table", "link", "image", "video"],
          ["fullScreen", "codeView"],
        ],
        lang: win["SUNEDITOR_LANG"] ? win["SUNEDITOR_LANG"]["en"] : "en",
      });
      editor.onload = () => {
        if (content) editor.setContents(content);
      };
      editor.onBlur = () => {
        onChange(editor.getContents());
      };
      editor.onChange = (c: string) => {
        onChange(c);
      };
      win["sunEditorInstance"] = editor;
      return true;
    } catch (e) {
      return false;
    }
  };
  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (build() || attempts > 50) clearInterval(timer);
  }, 100);
};

const slugify = (text: any) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

// EXPORT DEFAULT FUNCTION (Tanpa window.cms =)
export default function cmsStore(): Record<string, any> & ThisType<any> {
  return {
    // --- CORE STATE ---
    token: "",
    userRole: "admin",
    view: "dash",
    sidebarOpen: true,
    isLoading: false,

    // --- DATA STATE (Lengkap untuk cegah ReferenceError) ---
    posts: [],
    pages: [],
    usersList: [],
    mediaList: [],
    menuList: [],
    availableThemes: [],

    // --- UI STATE ---
    selectedItems: [],
    filteredMedia: [],
    activeMediaItem: null,
    activeMediaMeta: { alt: "", title: "", description: "" },

    // --- LOADING FLAGS ---
    isLoadingPosts: false,
    isLoadingPages: false,
    isLoadingUsers: false,
    isUploading: false,
    isUploadingFeatured: false,
    isSavingMeta: false,
    isSavingMenu: false,
    isSavingSettings: false,
    showUserModal: false,
    showMediaSelector: false,

    // --- EDITING STATE ---
    editingId: null,
    quickEditId: null,
    editingUserId: null,
    mediaSearchQuery: "",

    // --- FORMS ---
    form: {
      title: "",
      slug: "",
      body: "",
      type: "post",
      status: "publish",
      date: "",
      category: "",
      tags: "",
      featured_image: "",
    },
    quickForm: {
      title: "",
      slug: "",
      category: "",
      tags: "",
      status: "",
      date: "",
      featured_image: "",
    },
    userForm: {
      username: "",
      email: "",
      role: "editor",
      password: "",
      name: "",
    },
    menuForm: { label: "", url: "", order_num: 0 },
    settings: {
      site_title: "",
      site_desc: "",
      admin_email: "",
      site_logo: "",
      site_favicon: "",
    },

    // --- METHODS ---
    init() {
      console.log("CMS Store Initialized");
      this.initRouter();
    },

    parsePostData(p: any) {
      let attr: any = {};
      try {
        attr =
          typeof p.attributes === "string"
            ? JSON.parse(p.attributes)
            : p.attributes || {};
      } catch (e) {}
      return {
        ...p,
        category: p.category || attr.category || "",
        tags: p.tags || attr.tags || "",
        featured_image: p.featured_image || attr.featured_image || "",
        status: p.status || "draft",
      };
    },

    async loadPosts() {
      if (!this.token) return;
      this.isLoadingPosts = true;
      try {
        let res = await fetch("/api/contents?type=post", {
          headers: { Authorization: this.token },
        });
        let json: any = await res.json();
        this.posts = (json.data || []).map((item: any) => this.parsePostData(item));
      } catch (e) {
      } finally {
        this.isLoadingPosts = false;
      }
    },

    // ... (Masukkan fungsi loadPages, loadMenus, loadUsers, dsb di sini) ...
    async loadPages() {}, // Placeholder
    async loadMenus() {}, // Placeholder
    async loadMedia() {}, // Placeholder

    openEditor(type = "post") {
      this.view = "add";
      this.editingId = null;
      this.form = {
        title: "",
        slug: "",
        body: "",
        type: type,
        status: "publish",
        date: new Date().toISOString().slice(0, 16),
        category: "",
        tags: "",
        featured_image: "",
      };
      startSunEditor("editor", "", (c: string) => {
        this.form.body = c;
      });
    },

    loadPost(post: any) {
      this.quickEditId = null;
      this.editingId = post.id;
      this.view = "add";
      const p = this.parsePostData(post);
      this.form = {
        ...p,
        date: p.created_at
          ? new Date(p.created_at).toISOString().slice(0, 16)
          : "",
      };
      startSunEditor("editor", p.body, (c: string) => {
        this.form.body = c;
      });
    },

    async save() {
      const win = window as any;
      if (win["sunEditorInstance"])
        this.form.body = win["sunEditorInstance"].getContents();
      if (!this.form.title) {
        if (win.showToast) win.showToast("Judul wajib diisi!", "warning");
        return;
      }
      if (!this.form.slug) this.form.slug = slugify(this.form.title);

      const attr = {
        category: this.form.category,
        tags: this.form.tags,
        featured_image: this.form.featured_image,
      };
      const payload = {
        ...this.form,
        attributes: JSON.stringify(attr),
        tags: attr.tags,
        category: attr.category,
        featured_image: attr.featured_image,
      };
      const url = this.editingId
        ? "/api/contents/" + this.editingId
        : "/api/contents";

      try {
        let res = await fetch(url, {
          method: this.editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: this.token,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          if (win.showToast) win.showToast("Tersimpan!", "success");
          this.view = "posts";
          this.loadPosts();
        } else {
          if (win.showToast) win.showToast("Gagal Simpan", "error");
        }
      } catch (e) {
        if (win.showToast) win.showToast("Error Network", "error");
      }
    },

    openQuickEdit(post: any) {
      if (this.quickEditId === post.id) {
        this.quickEditId = null;
        return;
      }
      this.quickForm = this.parsePostData(post);
      try {
        if (post.created_at)
          this.quickForm.date = new Date(post.created_at)
            .toISOString()
            .slice(0, 16);
      } catch (e) {}
      this.quickEditId = post.id;
    },

    cancelQuickEdit() {
      this.quickEditId = null;
    },
    makeSlug() {
      this.quickForm.slug = slugify(this.quickForm.title);
    },
    async saveQuickEdit() {
      /* ... logika saveQuickEdit Om ... */
    },

    toggleSelectAll() {
      if (this.selectedItems.length === this.posts.length)
        this.selectedItems = [];
      else this.selectedItems = this.posts.map((p: any) => p.id);
    },
    async bulkAction(_action: any) {
      if (!confirm("Hapus?")) return;
      // ... logika bulk action ...
      this.selectedItems = [];
    },

    formatDate(input: any) {
      if (!input) return "-";
      try {
        return new Date(input).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch (e) {
        return "-";
      }
    },

    getPageTitle() {
      return this.view === "dash"
        ? "Dashboard"
        : this.view === "posts"
          ? "Artikel"
          : "Admin";
    },

    initRouter() {
      setTimeout(() => this.checkHash(), 300);
      window.addEventListener("hashchange", () => this.checkHash());
    },
    async checkHash() {
      const hash = window.location.hash.replace("#", "");
      if (hash.startsWith("edit/")) {
        /* ... */
      } else if (
        ["posts", "pages", "media", "users", "menus", "settings"].includes(hash)
      ) {
        this.view = hash;
      } else if (hash === "add") this.openEditor("post");
      else this.view = "dash";
    },
  };
}
