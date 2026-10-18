/**
 * 👥 USERS MODULE LOGIC (ISOLATED FEATURE MODULE)
 * Seluruh state, filter, paginasi, manajemen role dinamis (Rename/Custom Role),
 * dan aksi CRUD pengguna berada di file ini.
 * Perubahan pada fitur Users cukup dilakukan di sini tanpa menyentuh Core.
 */

export const usersLogic: Record<string, any> & ThisType<any> = {
  usersList: [],
  isLoadingUsers: false,
  showUserModal: false,
  showRoleModal: false,
  isSavingRoles: false,
  editingUserId: null,
  searchUser: "",
  filterUserRole: "all",
  userPage: 1,
  userLimit: 10,

  // Daftar Role Dinamis (Bisa di-rename & ditambah via Modal Kelola Role, tersimpan di tabel settings)
  rolesList: [
    {
      slug: "superadmin",
      label: "Superadmin",
      hasQuota: false,
      isSystem: true,
    },
    {
      slug: "admin",
      label: "Administrator",
      hasQuota: false,
      isSystem: true,
    },
    {
      slug: "editor",
      label: "Editor",
      hasQuota: false,
      isSystem: false,
    },
    {
      slug: "penulis",
      label: "Penulis",
      hasQuota: false,
      isSystem: false,
    },
    {
      slug: "subscriber",
      label: "Subscriber (Biasa)",
      hasQuota: false,
      isSystem: false,
    },
    {
      slug: "subscriber_pro",
      label: "⭐ Subscriber Pro",
      hasQuota: true,
      isSystem: false,
    },
  ],

  newRoleForm: {
    slug: "",
    label: "",
    hasQuota: false,
  },

  userForm: {
    username: "",
    email: "",
    role: "editor",
    password: "",
    name: "",
    subscription_plan: "1_bulan",
    subscription_expires_date: "",
  },

  // --- ROLE HELPERS ---
  getRoleObj(slug: string) {
    const norm = String(slug || "").toLowerCase();
    const list = Array.isArray(this.rolesList) ? this.rolesList : [];
    const found = list.find((r: any) => String(r.slug).toLowerCase() === norm);
    if (found) return found;
    if (norm === "pro") {
      return (
        list.find((r: any) => r.slug === "subscriber_pro") || {
          slug: "subscriber_pro",
          label: "⭐ Subscriber Pro",
          hasQuota: true,
        }
      );
    }
    if (norm === "subscribe") {
      return (
        list.find((r: any) => r.slug === "subscriber") || {
          slug: "subscriber",
          label: "Subscriber",
          hasQuota: false,
        }
      );
    }
    return {
      slug: norm || "user",
      label: slug || "User",
      hasQuota: false,
      isSystem: false,
    };
  },

  getRoleLabel(slug: string) {
    const obj = this.getRoleObj(slug);
    return obj ? obj.label : slug || "User";
  },

  isQuotaRole(slug: string) {
    const norm = String(slug || "").toLowerCase();
    if (norm === "subscriber_pro" || norm === "pro") return true;
    const obj = this.getRoleObj(norm);
    return Boolean(obj && obj.hasQuota);
  },

  getRoleBadgeStyle(slug: string) {
    const norm = String(slug || "").toLowerCase();
    if (norm === "superadmin")
      return "background:#0f172a; color:#fff; font-weight:700;";
    if (norm === "admin")
      return "background:#2271b1; color:#fff; font-weight:600;";
    if (norm === "editor") return "background:#d1e7dd; color:#0f5132;";
    if (this.isQuotaRole(norm))
      return "background:#fef3c7; color:#92400e; border:1px solid #f59e0b; font-weight:700;";
    if (norm === "subscriber" || norm === "subscribe")
      return "background:#e2e8f0; color:#475569;";
    return "background:#ede9fe; color:#5b21b6; border:1px solid #ddd6fe; font-weight:600;";
  },

  async loadRolesConfig() {
    try {
      const raw = this.settings?.custom_user_roles;
      if (raw) {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.rolesList = parsed;
          return;
        }
      }
      const res = await this._fetch("/api/settings");
      if (res.ok) {
        const json: any = await res.json();
        const data = json.data || json || {};
        if (data.custom_user_roles) {
          const parsed =
            typeof data.custom_user_roles === "string"
              ? JSON.parse(data.custom_user_roles)
              : data.custom_user_roles;
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.rolesList = parsed;
          }
        }
      }
    } catch (e) {
      console.warn("Gagal memuat custom_user_roles:", e);
    }
  },

  openRoleManager() {
    this.loadRolesConfig();
    this.newRoleForm = { slug: "", label: "", hasQuota: false };
    this.showRoleModal = true;
  },

  makeRoleSlug() {
    if (this.newRoleForm.label) {
      this.newRoleForm.slug = String(this.newRoleForm.label)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
    }
  },

  addCustomRole() {
    const win = window as any;
    const label = String(this.newRoleForm.label || "").trim();
    const slug =
      String(this.newRoleForm.slug || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]+/g, "_")
        .replace(/^_+|_+$/g, "") ||
      label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

    if (!label || !slug) {
      if (win.showToast)
        win.showToast("Nama Role dan Kode Role wajib diisi!", "warning");
      return;
    }

    const exists = this.rolesList.some(
      (r: any) => String(r.slug).toLowerCase() === slug
    );
    if (exists) {
      if (win.showToast)
        win.showToast(`Kode role "${slug}" sudah terdaftar!`, "warning");
      return;
    }

    this.rolesList.push({
      slug,
      label,
      hasQuota: Boolean(this.newRoleForm.hasQuota),
      isSystem: false,
    });

    this.newRoleForm = { slug: "", label: "", hasQuota: false };
    if (win.showToast)
      win.showToast(
        `Role "${label}" ditambahkan ke daftar. Klik Simpan Perubahan untuk menyimpan.`,
        "info"
      );
  },

  removeCustomRole(slug: string) {
    const win = window as any;
    const target = this.rolesList.find((r: any) => r.slug === slug);
    if (!target) return;
    if (target.isSystem || slug === "superadmin" || slug === "admin") {
      if (win.showToast)
        win.showToast(
          "Role sistem utama (Superadmin/Admin) hanya boleh di-rename, tidak boleh dihapus!",
          "warning"
        );
      return;
    }
    this.rolesList = this.rolesList.filter((r: any) => r.slug !== slug);
  },

  async saveRolesConfig() {
    const win = window as any;
    this.isSavingRoles = true;
    try {
      const serialized = JSON.stringify(this.rolesList);
      this.settings = {
        ...(this.settings || {}),
        custom_user_roles: serialized,
      };
      const res = await this._fetch("/api/settings", {
        method: "POST",
        body: JSON.stringify({ custom_user_roles: serialized }),
      });
      if (res.ok) {
        if (win.showToast)
          win.showToast("Konfigurasi & Nama Role berhasil disimpan!", "success");
        this.showRoleModal = false;
      } else {
        if (win.showToast)
          win.showToast("Gagal menyimpan konfigurasi role", "error");
      }
    } catch (e: any) {
      if (win.showToast)
        win.showToast("Gagal menyimpan role: " + e.message, "error");
    } finally {
      this.isSavingRoles = false;
    }
  },

  // --- FILTER & PAGINATION ---
  filteredUsers() {
    const list = Array.isArray(this.usersList) ? this.usersList : [];
    const q = String(this.searchUser || "")
      .toLowerCase()
      .trim();
    const role = String(this.filterUserRole || "all").toLowerCase();
    return list.filter((u: any) => {
      const uRole = String(u.role || "").toLowerCase();
      const matchRole =
        role === "all" ||
        uRole === role ||
        (role === "subscriber_pro" &&
          ["subscriber_pro", "pro"].includes(uRole)) ||
        (role === "subscriber" && ["subscriber", "subscribe"].includes(uRole));
      const matchSearch =
        !q ||
        String(u.username || "")
          .toLowerCase()
          .includes(q) ||
        String(u.name || "")
          .toLowerCase()
          .includes(q) ||
        String(u.email || "")
          .toLowerCase()
          .includes(q) ||
        String(this.getRoleLabel(u.role) || "")
          .toLowerCase()
          .includes(q);
      return matchRole && matchSearch;
    });
  },

  pagedUsers() {
    const filtered = this.filteredUsers();
    const page = Math.max(1, Number(this.userPage) || 1);
    const limit = Math.max(1, Number(this.userLimit) || 10);
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  },

  totalUserPages() {
    const total = this.filteredUsers().length;
    const limit = Math.max(1, Number(this.userLimit) || 10);
    return Math.max(1, Math.ceil(total / limit));
  },

  prevUserPage() {
    if (this.userPage > 1) this.userPage--;
  },

  nextUserPage() {
    if (this.userPage < this.totalUserPages()) this.userPage++;
  },

  applyPlanDuration() {
    if (!this.userForm) return;
    const plan = this.userForm.subscription_plan;
    if (plan === "custom") return;
    const now = new Date();
    let months = 1;
    if (plan === "3_bulan") months = 3;
    else if (plan === "6_bulan") months = 6;
    else if (plan === "1_tahun") months = 12;
    now.setMonth(now.getMonth() + months);
    this.userForm.subscription_expires_date = now.toISOString().split("T")[0];
  },

  async loadUsers() {
    this.isLoadingUsers = true;
    this.loadRolesConfig();
    try {
      const res = await this._fetch("/api/users");
      const json: any = await res.json();
      const rawUsers = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : [];
      this.usersList = rawUsers;

      // Sinkronkan role unik dari DB jika ada role baru yang belum terdaftar di rolesList
      for (const u of rawUsers) {
        const rSlug = String(u.role || "").trim();
        if (
          rSlug &&
          !["pro", "subscribe"].includes(rSlug.toLowerCase()) &&
          !this.rolesList.some(
            (r: any) => String(r.slug).toLowerCase() === rSlug.toLowerCase()
          )
        ) {
          this.rolesList.push({
            slug: rSlug,
            label: rSlug.charAt(0).toUpperCase() + rSlug.slice(1),
            hasQuota: Boolean(u.subscription_expires_at),
            isSystem: false,
          });
        }
      }
    } catch (e) {
      this.usersList = [];
    } finally {
      this.isLoadingUsers = false;
    }
  },

  openAddUser() {
    this.editingUserId = null;
    this.userForm = {
      username: "",
      email: "",
      role: "editor",
      password: "",
      name: "",
      subscription_plan: "1_bulan",
      subscription_expires_date: "",
    };
    this.applyPlanDuration();
    this.showUserModal = true;
  },

  editUser(user: any) {
    this.editingUserId = user.id;
    const expDate = user.subscription_expires_at
      ? String(user.subscription_expires_at).split("T")[0]
      : "";
    this.userForm = {
      ...user,
      password: "",
      subscription_plan: user.subscription_plan || "1_bulan",
      subscription_expires_date: expDate,
    };
    if (this.isQuotaRole(user.role) && !expDate) {
      this.applyPlanDuration();
    }
    this.showUserModal = true;
  },

  async saveUser() {
    const endpoint = this.editingUserId
      ? "/api/users/" + this.editingUserId
      : "/api/users";
    const method = this.editingUserId ? "PUT" : "POST";

    try {
      const payload = { ...this.userForm };
      if (this.isQuotaRole(payload.role)) {
        if (payload.subscription_expires_date) {
          payload.subscription_expires_at = new Date(
            payload.subscription_expires_date + "T23:59:59.000Z"
          ).toISOString();
        }
      } else {
        payload.subscription_plan = null;
        payload.subscription_expires_at = null;
      }

      const res = await this._fetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        this.showUserModal = false;
        this.loadUsers();
        if ((window as any).showToast)
          (window as any).showToast("Data user berhasil disimpan!", "success");
      } else {
        const err: any = await res.json();
        if ((window as any).showToast)
          (window as any).showToast(
            "Gagal simpan user: " + (err.error || "Unknown Error"),
            "error"
          );
      }
    } catch (e) {
      console.error(e);
    }
  },

  async deleteUser(id: string) {
    const win = window as any;
    const confirmed = win.showConfirmDialog
      ? await win.showConfirmDialog({
          title: "Hapus Pengguna",
          message: "Apakah Anda yakin ingin menghapus pengguna ini?",
          type: "danger",
          confirmText: "Ya, Hapus",
        })
      : false;
    if (!confirmed) return;
    try {
      const res = await this._fetch("/api/users/" + id, { method: "DELETE" });
      if (res.ok) {
        this.loadUsers();
        if (win.showToast) win.showToast("Pengguna berhasil dihapus", "success");
      } else {
        const err: any = await res.json().catch(() => ({}));
        if (win.showToast)
          win.showToast(err.error || "Gagal menghapus user", "error");
      }
    } catch (e) {
      if (win.showToast) win.showToast("Gagal hapus user", "error");
    }
  },
};
