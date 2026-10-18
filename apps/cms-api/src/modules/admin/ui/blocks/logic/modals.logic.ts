export const modalsLogic: Record<string, any> & ThisType<any> = {
  // ============================================
  // 1. STATE VARIABLES
  // ============================================
  showMediaSelector: false,
  mediaTab: "library", // 'library' | 'upload'

  // Data List
  mediaList: [],

  // Item yang sedang dipilih/aktif
  activeMediaItem: null,

  // Form Metadata (Untuk Edit Sidebar & Upload Baru)
  activeMediaMeta: {
    title: "",
    alt: "",
    caption: "",
    description: "",
  },

  // State Upload
  uploadFile: null,
  uploadPreview: null,

  // Flags Loading
  isUploadingFeatured: false,
  isSavingMeta: false,

  // Callback internal (jika dipanggil via event)
  _mediaCallback: null,

  // ============================================
  // 2. INITIALIZATION & LOAD
  // ============================================
  initModals() {
    // Listener untuk membuka modal dari mana saja
    window.addEventListener("open-media-modal", (e: any) => {
      this.showMediaSelector = true;
      this.mediaTab = "library";
      this._mediaCallback = e.detail?.callback;

      // Reset state
      this.activeMediaItem = null;
      this.mediaList = [];
      this.uploadFile = null;
      this.uploadPreview = null;
      this.activeMediaMeta = {
        title: "",
        alt: "",
        caption: "",
        description: "",
      };

      this.loadMedia();
    });
  },

  async loadMedia() {
    try {
      // Gunakan token dari parent scope (cms)
      const headers = { Authorization: this.token };
      const res = await fetch("/api/media", { headers });

      if (res.status === 401 && typeof this.logout === "function")
        return this.logout();

      const json: any = await res.json();
      this.mediaList = Array.isArray(json) ? json : json.results || [];
    } catch (e) {
      console.error("Gagal load media", e);
    }
  },

  // ============================================
  // 3. SELECTION LOGIC
  // ============================================
  setActiveItem(item: any) {
    this.activeMediaItem = item;

    // Populate form sidebar dengan data existing
    this.activeMediaMeta = {
      title: item.title || (item.key ? item.key.split("/").pop() : ""),
      alt: item.alt || "",
      caption: item.caption || "",
      description: item.description || "",
    };
  },

  openMediaSelector() {
    // Helper manual jika dipanggil langsung tanpa event
    this.showMediaSelector = true;
    this.mediaTab = "library";
    this.loadMedia();
  },

  // ============================================
  // 4. UPLOAD LOGIC (WITH METADATA)
  // ============================================
  onFileSelect(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    this.uploadFile = file;
    this.uploadPreview = URL.createObjectURL(file);

    // Auto-fill title dari nama file
    this.activeMediaMeta.title = file.name.split(".")[0].replace(/-/g, " ");
  },

  async uploadFeaturedImage(e: any = null) {
    // Support upload langsung dari input file (jika ada event) atau dari tombol Upload Action
    const file = e ? e.target.files[0] : this.uploadFile;

    if (!file) {
      if ((window as any).showToast) (window as any).showToast("Pilih file terlebih dahulu.", "warning");
      return;
    }

    this.isUploadingFeatured = true;
    const fd = new FormData();
    fd.append("file", file);

    // Kirim Metadata
    fd.append("title", this.activeMediaMeta.title);
    fd.append("alt", this.activeMediaMeta.alt);
    fd.append("caption", this.activeMediaMeta.caption);
    fd.append("description", this.activeMediaMeta.description);

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { Authorization: this.token },
        body: fd,
      });

      if (res.ok) {
        const result: any = await res.json();
        await this.loadMedia(); // Refresh grid

        // Pindah ke tab library & pilih gambar baru
        this.mediaTab = "library";
        const newUrl = result.url || result.file_url;
        const newImg = this.mediaList.find((m: any) => m.url === newUrl);
        if (newImg) this.setActiveItem(newImg);

        // Reset form upload
        this.uploadFile = null;
        this.uploadPreview = null;
      } else {
        if ((window as any).showToast) (window as any).showToast("Gagal upload gambar.", "error");
      }
    } catch (err) {
      if ((window as any).showToast) (window as any).showToast("Error koneksi saat upload.", "error");
    } finally {
      this.isUploadingFeatured = false;
    }
  },

  // ============================================
  // 5. UPDATE METADATA LOGIC
  // ============================================
  async saveActiveMeta() {
    if (!this.activeMediaItem) return;
    this.isSavingMeta = true;

    try {
      // Optimistic update (Update tampilan lokal dulu)
      Object.assign(this.activeMediaItem, this.activeMediaMeta);

      // Kirim ke server
      // Endpoint disesuaikan: bisa /api/media/meta atau PUT /api/media/:id
      // Kita coba kirim key/id file
      const payload = {
        key: this.activeMediaItem.key,
        ...this.activeMediaMeta,
      };

      await fetch("/api/media/meta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token,
        },
        body: JSON.stringify(payload),
      });

      if ((window as any).showToast) (window as any).showToast("Info gambar tersimpan!", "success");
    } catch (e) {
      console.warn("Backend save meta error (UI Updated Locally)", e);
      // Tidak perlu alert error keras jika backend belum siap sepenuhnya, cukup log
    } finally {
      this.isSavingMeta = false;
    }
  },

  // ============================================
  // 6. CONFIRMATION LOGIC
  // ============================================
  confirmFeaturedImage() {
    if (!this.activeMediaItem) return;

    // Skenario 1: Dipanggil via Event Callback (dari Editor Page baru)
    if (this._mediaCallback && typeof this._mediaCallback === "function") {
      this._mediaCallback(this.activeMediaItem.url, this.activeMediaMeta);
    }
    // Skenario 2: Dipanggil langsung (Legacy/Fallback)
    else {
      this.form.featured_image = this.activeMediaItem.url;
      // Update juga meta di form post jika field-nya ada
      if (typeof this.form.featured_image_alt !== "undefined") {
        this.form.featured_image_alt = this.activeMediaMeta.alt;
      }
      if (typeof this.form.featured_image_caption !== "undefined") {
        this.form.featured_image_caption = this.activeMediaMeta.caption;
      }
    }

    this.showMediaSelector = false;
  },
};
