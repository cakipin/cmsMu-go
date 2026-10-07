export const mediaLogic = {
  mediaList: [],
  selectedItems: [],
  activeMediaItem: null,
  activeMediaMeta: { alt: "", title: "", description: "", filename: "" },
  isUploading: false,
  isSavingMeta: false,
  isDeleting: false,
  mediaSearchQuery: "",

  async loadMedia() {
    try {
      const token = localStorage.getItem("labmu_token");
      if (!token) return;
      let res = await fetch("/api/media?t=" + Date.now(), {
        headers: { Authorization: "Bearer " + token },
      });
      let json = await res.json();
      let rawData = Array.isArray(json)
        ? json
        : json.data || json.results || [];
      this.mediaList = rawData.filter(m => !m.key.endsWith("/"));
      this.selectedItems = [];
      this.activeMediaItem = null;
    } catch (e) {
      console.error("Gagal load media:", e);
      this.mediaList = [];
    }
  },

  toggleSelection(item) {
    const index = this.selectedItems.findIndex(i => i.id === item.id);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }

    if (this.selectedItems.length === 1) {
      this.setActiveItem(this.selectedItems[0]);
    } else {
      this.activeMediaItem = null;
    }
  },

  toggleSelectAll() {
    if (this.selectedItems.length === this.filteredMedia.length) {
      this.selectedItems = [];
      this.activeMediaItem = null;
    } else {
      this.selectedItems = [...this.filteredMedia];
      this.activeMediaItem = null;
    }
  },

  setActiveItem(m) {
    this.activeMediaItem = m;
    const currentFilename = m.key ? m.key.split("/").pop() : "";
    this.activeMediaMeta = {
      alt: m.alt || "",
      title: m.title || "",
      description: m.description || "",
      filename: currentFilename,
    };
  },

  async deleteSelected() {
    if (this.selectedItems.length === 0) return;
    if (
      !confirm(
        `Yakin ingin menghapus ${this.selectedItems.length} file terpilih?`
      )
    )
      return;

    this.isDeleting = true;
    const token = localStorage.getItem("labmu_token");

    for (let item of this.selectedItems) {
      try {
        await fetch("/api/media/" + item.id, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token },
        });
      } catch (e) {
        console.error("Gagal hapus", item.id);
      }
    }

    this.isDeleting = false;
    await this.loadMedia();
  },

  async saveMediaMeta() {
    if (!this.activeMediaItem) return;
    this.isSavingMeta = true;
    try {
      const token = localStorage.getItem("labmu_token");
      const payload = {
        ...this.activeMediaMeta,
        newFilename: this.activeMediaMeta.filename,
      };

      let res = await fetch("/api/media/" + this.activeMediaItem.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Tersimpan!");
        this.activeMediaItem = null;
        await this.loadMedia();
      } else {
        alert("Gagal simpan");
      }
    } catch (e) {
      console.error("Save Error:", e);
      alert("Terjadi kesalahan saat menyimpan.");
    } finally {
      this.isSavingMeta = false;
    }
  },

  // --- FITUR AUTO COMPRESS ---
  // Fungsi bantuan untuk menekan ukuran gambar
  async compressImage(file, quality = 0.7, maxWidth = 1600) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = event => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Logika Resize: Jika lebar melebihi maxWidth, kecilkan proporsional
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Konversi ke Blob
          // Pertahankan format PNG dan WebP agar transparansi (alpha channel) tidak hilang jadi putih/hitam
          const outputType =
            file.type === "image/png" || file.type === "image/webp"
              ? file.type
              : "image/webp";

          canvas.toBlob(
            blob => {
              if (!blob) return reject(new Error("Kompresi gagal"));
              // Buat file baru dari blob
              const newFile = new File([blob], file.name, {
                type: outputType,
                lastModified: Date.now(),
              });
              resolve(newFile);
            },
            outputType,
            quality
          );
        };
        img.onerror = err => reject(err);
      };
      reader.onerror = err => reject(err);
    });
  },

  // UPDATE PADA FUNGSI UPLOAD
  async uploadMedia(e) {
    const files = e.target.files;
    if (!files.length) return;

    this.isUploading = true;
    const token = localStorage.getItem("labmu_token");

    for (let i = 0; i < files.length; i++) {
      let fileToUpload = files[i];

      // Cek apakah file adalah gambar sebelum dikompres
      if (fileToUpload.type.startsWith("image/")) {
        try {
          // Kompres: Kualitas 70% (0.7), Lebar Maksimal 1600px
          console.log(`Mengompres ${fileToUpload.name}...`);
          fileToUpload = await this.compressImage(fileToUpload, 0.7, 1600);
        } catch (err) {
          console.warn("Gagal kompres, upload file asli.", err);
        }
      }

      const fd = new FormData();
      fd.append("file", fileToUpload);

      try {
        await fetch("/api/media", {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          body: fd,
        });
      } catch (err) {
        console.error("Upload fail:", err);
      }
    }

    await this.loadMedia();
    this.isUploading = false;
    e.target.value = "";
  },

  get filteredMedia() {
    return (this.mediaList || []).filter(m =>
      (m.key || "")
        .toLowerCase()
        .includes((this.mediaSearchQuery || "").toLowerCase())
    );
  },

  isSelected(item) {
    return this.selectedItems.some(i => i.id === item.id);
  },
};
