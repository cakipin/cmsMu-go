/**
 * 📝 CONTENT MODULE LOGIC (ISOLATED FEATURE MODULE: Posts, Pages, Editor)
 * Seluruh state, aksi CRUD Posts & Pages, dan helper Editor berada di file ini.
 * Perubahan pada fitur Konten cukup dilakukan di sini tanpa menyentuh Core.
 */

export const postLogic: Record<string, any> & ThisType<any> = {
  posts: [],
  pages: [],
  isLoading: false,
  isLoadingPosts: false,
  isLoadingPages: false,
  editingId: null,
  form: {
    title: "",
    slug: "",
    body: "",
    excerpt: "",
    meta_title: "",
    meta_description: "",
    og_image: "",
    type: "post",
    status: "publish",
    date: "",
    category: "",
    tags: "",
    featured_image: "",
    allow_comments: 1,
  },

  // =========================================
  // 1. DATA PREPARATION (Payload Builder)
  // =========================================
  preparePayload(rawForm: any) {
    const form = JSON.parse(JSON.stringify(rawForm));

    // Ambil konten dari SunEditor jika tersedia
    let currentContent = "";
    if (typeof window !== "undefined" && (window as any).cmsEditor) {
      currentContent = (window as any).cmsEditor.getContents();
    } else {
      currentContent = form.body || "";
    }

    // Normalisasi Status
    const statusInput = (form.status || "draft").toString().toLowerCase();
    const finalStatus =
      statusInput.includes("pub") || statusInput.includes("terbit")
        ? "publish"
        : "draft";

    return {
      id: form.id && form.id !== "null" ? form.id : undefined,
      title: form.title || "Untitled",
      slug: form.slug
        ? form.slug
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]+/g, "")
        : form.title
          ? form.title
              .toString()
              .toLowerCase()
              .trim()
              .replace(/\s+/g, "-")
              .replace(/[^\w\-]+/g, "")
          : "",

      body: currentContent,
      status: finalStatus,
      category:
        form.category && form.category !== "null"
          ? form.category
          : "Uncategorized",
      tags: form.tags && form.tags !== "null" ? form.tags : "",
      featured_image: form.featured_image || "",
      featured_image_caption: form.featured_image_caption || "",
      created_at: form.date
        ? new Date(form.date).toISOString()
        : new Date().toISOString(),
      author: form.author || "Admin",
    };
  },

  // =========================================
  // 2. API ACTIONS (CRUD POSTS & PAGES)
  // =========================================
  async loadPages() {
    this.isLoadingPages = true;
    try {
      const res = await this._fetch("/api/pages");
      const json: any = await res.json();
      this.pages = Array.isArray(json) ? json : json.results || json.data || [];
    } catch (e) {
      this.pages = [];
    } finally {
      this.isLoadingPages = false;
    }
  },

  async loadPosts() {
    this.isLoading = true;
    this.isLoadingPosts = true;
    try {
      const token =
        typeof window !== "undefined" && (window as any).getCmsToken
          ? (window as any).getCmsToken()
          : localStorage.getItem("labmu_token") || "";
      const res = await fetch("/api/posts?t=" + Date.now(), {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) throw new Error("Failed");

      const json: any = await res.json();
      const rawData = Array.isArray(json) ? json : json.results || [];

      this.posts = rawData.map((p: any) => ({
        ...p,
        category:
          p.category && p.category !== "null" ? p.category : "Uncategorized",
        tags: p.tags && p.tags !== "null" ? p.tags : "-",
        status: p.status || "draft",
        body: p.body || "",
      }));
    } catch (e) {
      this.posts = [];
    } finally {
      this.isLoading = false;
      this.isLoadingPosts = false;
    }
  },

  async savePost(formInput: any) {
    const formToProcess = formInput || this.form;
    this.isLoading = true;
    try {
      const token =
        typeof window !== "undefined" && (window as any).getCmsToken
          ? (window as any).getCmsToken()
          : localStorage.getItem("labmu_token") || "";
      const payload = this.preparePayload(formToProcess);
      const isEdit = payload.id !== undefined;
      const url = isEdit ? `/api/posts/${payload.id}` : "/api/posts";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      const result: any = await res.json();

      if (res.ok) {
        if ((window as any).showToast)
          (window as any).showToast("Berhasil disimpan!", "success");
        if (!isEdit) {
          this.view = "posts";
        }
        await this.loadPosts();
        return true;
      } else {
        if ((window as any).showToast)
          (window as any).showToast(
            "Gagal: " + (result.error || "Database Error"),
            "error"
          );
        return false;
      }
    } catch (e) {
      if ((window as any).showToast)
        (window as any).showToast("Kesalahan koneksi.", "error");
      return false;
    } finally {
      this.isLoading = false;
    }
  },

  async deletePost(id: string) {
    if (!id) return;
    if (!confirm("Hapus post ini permanen?")) return;

    try {
      const token =
        typeof window !== "undefined" && (window as any).getCmsToken
          ? (window as any).getCmsToken()
          : localStorage.getItem("labmu_token") || "";
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });

      if (res.ok) {
        this.posts = this.posts.filter((p: any) => p.id !== id);
        await this.loadPosts();
      } else {
        if ((window as any).showToast)
          (window as any).showToast("Gagal menghapus.", "error");
      }
    } catch (e) {
      if ((window as any).showToast)
        (window as any).showToast("Gagal koneksi.", "error");
    }
  },

  // =========================================
  // 3. EDITOR & CONTENT HELPERS
  // =========================================
  openEditor(type: string) {
    this.view = "add";
    this.editingId = null;
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

    this.form = {
      title: "",
      slug: "",
      body: "",
      excerpt: "",
      meta_title: "",
      meta_description: "",
      og_image: "",
      type: type || "post",
      video_url: "",
      status: "publish",
      date: now.toISOString().slice(0, 16),
      category: "",
      tags: "",
      featured_image: "",
    };

    if (!this.posts || this.posts.length === 0) this.loadPosts();

    setTimeout(() => {
      if ((window as any).initCmsEditor)
        (window as any).initCmsEditor(
          "editor_id",
          "",
          (c: any) => (this.form.body = c)
        );
    }, 50);
  },

  async editContent(item: any) {
    this.view = "add";
    this.editingId = item.id;
    this.form = JSON.parse(JSON.stringify(item));
    this.form.type = item.type || "post";
    this.form.video_url = item.video_url || "";

    if (item.id && !item.body && typeof fetch !== "undefined") {
      try {
        const token =
          typeof window !== "undefined" && (window as any).getCmsToken
            ? (window as any).getCmsToken()
            : "";
        const res = await fetch(
          "/api/" + (item.type === "page" ? "pages" : "posts") + "/" + item.id,
          {
            headers: { Authorization: "Bearer " + token },
          }
        );
        const data: any = await res.json();
        if (data && data.body) {
          this.form.body = data.body;
          item.body = data.body;
        }
      } catch (e) {
        console.error("Failed to load full post content", e);
      }
    }

    if (this.form.date || this.form.created_at) {
      const dt = this.form.date || this.form.created_at;
      const d = new Date(dt);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      this.form.date = d.toISOString().slice(0, 16);
    }

    setTimeout(() => {
      if ((window as any).initCmsEditor)
        (window as any).initCmsEditor(
          "editor_id",
          item.body || "",
          (c: string) => (this.form.body = c)
        );
    }, 50);
  },

  editPost(item: any) {
    return this.editContent(item);
  },

  makeSlug() {
    if (!this.editingId && this.form.title) {
      this.form.slug = this.form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
  },

  viewPost(slug: string) {
    if (!slug) {
      if ((window as any).showToast)
        (window as any).showToast("Slug belum ada.", "warning");
      return;
    }
    window.open("/" + slug, "_blank");
  },

  openFeaturedImageSelector() {
    this.mediaSelectorTarget = "featured_image";
    this.view = "media";
    if (this.loadMedia) this.loadMedia();
  },

  setFeaturedImage(url: string) {
    this.form.featured_image = url;
    this.mediaSelectorTarget = null;
    this.view = "add";
  },

  removeFeaturedImage() {
    this.form.featured_image = "";
  },

  addTag(tagName: string) {
    if (!tagName) return;
    const raw = this.form.tags || "";
    const currentTags = raw
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);
    if (!currentTags.includes(tagName)) {
      currentTags.push(tagName);
      this.form.tags = currentTags.join(", ");
    }
  },

  cleanTitle(str: string) {
    if (!str) return "";
    return String(str)
      .replace(/<[^>]+>/g, "")
      .replace(/&#8216;/g, "‘")
      .replace(/&#8217;/g, "’")
      .replace(/&#8220;/g, "“")
      .replace(/&#8221;/g, "”")
      .replace(/&#038;/g, "&")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim();
  },
};

// =========================================
// 4. CLIENT-SIDE EDITOR INIT
// =========================================
if (typeof window !== "undefined") {
  (window as any).initCmsEditor = function (
    elementId: string,
    content: string,
    callback: any
  ) {
    if ((window as any).cmsEditor) {
      try {
        (window as any).cmsEditor.destroy();
      } catch (e) {}
    }

    setTimeout(() => {
      try {
        if ((window as any).SUNEDITOR) {
          const editor = (window as any).SUNEDITOR.create(elementId, {
            display: "block",
            width: "100%",
            height: "500px",
            buttonList: [
              ["undo", "redo"],
              ["font", "fontSize", "formatBlock"],
              ["bold", "underline", "italic", "strike"],
              ["fontColor", "hiliteColor"],
              ["align", "list"],
              ["table", "link", "image", "video", "codeView"],
            ],
          });

          editor.setContents(content || "");
          editor.onChange = (c: string) => {
            if (callback) callback(c);
          };

          (window as any).cmsEditor = editor;
        }
      } catch (e) {
        console.error("Editor Init Error:", e);
      }
    }, 150);
  };
}
