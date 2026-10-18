export const mediaLogic: Record<string, any> & ThisType<any> = {
  mediaList: [],
  selectedItems: [],
  activeMediaItem: null,
  activeMediaMeta: { alt: "", title: "", description: "", filename: "" },
  isUploading: false,
  isSavingMeta: false,
  isDeleting: false,
  mediaSearchQuery: "",

  cropperInstance: null,
  cropRatio: 16/9,
  uploadPreview: null,
  uploadFile: null,
  isCropModalOpen: false,

  initImageCropper(imageElement: any, ratio = 16/9) {
      if (this.cropperInstance) this.cropperInstance.destroy();
      const win = window as any;
      if (win.Cropper) {
          this.cropperInstance = new win.Cropper(imageElement, {
              aspectRatio: ratio,
              viewMode: 1,
              autoCropArea: 0.9,
              responsive: true
          });
      }
  },

  destroyCropper() {
      if (this.cropperInstance) {
          this.cropperInstance.destroy();
          this.cropperInstance = null;
      }
  },

  setCropRatio(ratio: number) {
      this.cropRatio = ratio;
      if (this.cropperInstance) {
          this.cropperInstance.setAspectRatio(ratio);
      }
  },

  rotateCropper(degree: number) {
      if (this.cropperInstance) this.cropperInstance.rotate(degree);
  },

  flipCropper() {
      if (this.cropperInstance) {
          const scaleX = this.cropperInstance.getData().scaleX || 1;
          this.cropperInstance.scaleX(-scaleX);
      }
  },

  resetCropper() {
      if (this.cropperInstance) this.cropperInstance.reset();
  },

  async getCroppedBlob(maxWidth = 1600, quality = 0.8): Promise<Blob | null> {
      if (!this.cropperInstance) return null;
      const canvas = this.cropperInstance.getCroppedCanvas({
          maxWidth: maxWidth,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high'
      });
      return new Promise(resolve => {
          canvas.toBlob((blob: Blob | null) => resolve(blob), 'image/webp', quality);
      });
  },

  async loadMedia() {
    try {
      const token = localStorage.getItem("labmu_token");
      if (!token) return;
      let res = await fetch("/api/media?t=" + Date.now(), {
        headers: { Authorization: "Bearer " + token },
      });
      let json: any = await res.json();
      let rawData = Array.isArray(json)
        ? json
        : json.data || json.results || [];
      this.mediaList = rawData.filter((m: any) => !m.key.endsWith("/"));
      this.selectedItems = [];
      this.activeMediaItem = null;
    } catch (e) {
      console.error("Gagal load media:", e);
      this.mediaList = [];
    }
  },

  toggleSelection(item: any) {
    const index = this.selectedItems.findIndex((i: any) => i.id === item.id);
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

  setActiveItem(m: any) {
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
        if ((window as any).showToast) (window as any).showToast("Tersimpan!", "success");
        this.activeMediaItem = null;
        await this.loadMedia();
      } else {
        if ((window as any).showToast) (window as any).showToast("Gagal simpan", "error");
      }
    } catch (e) {
      console.error("Save Error:", e);
      if ((window as any).showToast) (window as any).showToast("Terjadi kesalahan saat menyimpan.", "error");
    } finally {
      this.isSavingMeta = false;
    }
  },

  // --- FITUR AUTO COMPRESS ---
  // Fungsi bantuan untuk menekan ukuran gambar
  async compressImage(file: File, quality = 0.7, maxWidth = 1600): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target?.result;
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
          if (ctx) ctx.drawImage(img, 0, 0, width, height);

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
  async uploadMedia(e: any) {
    const files = e.target.files;
    if (!files.length) return;

    if (files.length === 1 && files[0].type.startsWith("image/")) {
        this.uploadFile = files[0];
        this.uploadPreview = URL.createObjectURL(files[0]);
        this.isCropModalOpen = true;
        this.cropRatio = 16/9; // default
        
        this.$nextTick(() => {
            if (this.$refs.libraryCropperImage) {
                this.initImageCropper(this.$refs.libraryCropperImage, this.cropRatio);
            }
        });
        e.target.value = "";
        return;
    }

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

  async processSingleUpload(useCrop: boolean) {
      if (!this.uploadFile) return;
      this.isCropModalOpen = false;
      this.isUploading = true;
      
      let finalFile = this.uploadFile;
      let newName = finalFile.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 40) || 'image';

      if (useCrop && this.cropperInstance) {
          try {
              const blob = await this.getCroppedBlob(1600, 0.8);
              if (blob) {
                  finalFile = new File([blob], newName + '.webp', { type: 'image/webp', lastModified: Date.now() });
              }
          } catch (err) {
              console.warn('Gagal crop, upload file asli', err);
          }
      } else {
          try {
              finalFile = await this.compressImage(finalFile, 0.7, 1600);
          } catch (err) {
              console.warn('Gagal kompres', err);
          }
      }

      const token = localStorage.getItem("labmu_token");
      const fd = new FormData();
      fd.append("file", finalFile);

      try {
          await fetch("/api/media", {
              method: "POST",
              headers: { Authorization: "Bearer " + token },
              body: fd,
          });
      } catch (err) {
          console.error("Upload fail:", err);
      }
      
      this.destroyCropper();
      this.uploadFile = null;
      this.uploadPreview = null;
      await this.loadMedia();
      this.isUploading = false;
  },

  get filteredMedia() {
    return (this.mediaList || []).filter((m: any) =>
      (m.key || "")
        .toLowerCase()
        .includes((this.mediaSearchQuery || "").toLowerCase())
    );
  },

  isSelected(item: any) {
    return this.selectedItems.some((i: any) => i.id === item.id);
  },
};
