export const byocDeployerView = `
<div x-data="{
  activeTab: 'list',
  step: 1,
  isLoading: false,
  isTestingToken: false,
  tokenVerified: false,
  verifiedAccountName: '',
  tokenPermissions: [],
  errorMessage: '',
  successData: null,
  toastMsg: '',
  toastType: 'success',
  showConfirmModal: false,

  // Daftar Proyek (CRUD State)
  projects: [],
  isLoadingProjects: false,
  searchQuery: '',
  showEditModal: false,
  isSavingEdit: false,
  editForm: {
    id: null,
    name: '',
    slug: '',
    customDomain: '',
    status: 'active',
    cfAccountId: '',
    cfApiToken: ''
  },
  showDeleteModal: false,
  isDeletingProject: false,
  deleteTarget: null,
  deleteCloudflareResources: false,

  // Kuota & Paket Pengguna (BYOC Limit Guard)
  quota: {
    role: '',
    plan: 'free',
    planLabel: 'Free / Demo',
    used: 0,
    limit: 1,
    isLimitReached: false
  },

  // Form Fields
  projectName: '',
  slug: '',
  adminEmail: '',
  adminPassword: '',
  adminPasswordConfirm: '',
  adminName: 'Administrator Website',
  accountId: localStorage.getItem('cmsmu_cf_account_id') || '',
  apiToken: localStorage.getItem('cmsmu_cf_api_token') || '',

  // Visibility & Guide Modal Toggles
  showAdminPassword: false,
  showAdminPasswordConfirm: false,
  showApiToken: false,
  showEditApiToken: false,
  showGuideModal: false,
  activeGuideTab: 'token',

  // Provisioning Checklist Steps
  stepsProgress: [
    { title: 'Membuat D1 Database SQL', status: 'pending' },
    { title: 'Membuat R2 Storage Bucket Media', status: 'pending' },
    { title: 'Membuat KV Namespace Cache & Session', status: 'pending' },
    { title: 'Eksekusi Skema DDL Database & Admin Seeder', status: 'pending' },
    { title: 'Mendaftarkan Cloudflare Pages Project', status: 'pending' },
    { title: 'Konfigurasi Telemetri Terpusat (Control Plane)', status: 'pending' }
  ],

  async initDeployer() {
    await this.loadProjects();
    await this.loadSavedCredentials();
  },

  async loadProjects() {
    this.isLoadingProjects = true;
    try {
      const res = await fetch('/api/deployer/projects');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          this.projects = json.data;
        }
        if (json.quota) {
          this.quota = json.quota;
        }
      }
    } catch (e) {
      console.error('Failed to load projects:', e);
    } finally {
      this.isLoadingProjects = false;
    }
  },

  startDeployWizard() {
    if (this.quota && this.quota.isLimitReached) {
      this.showToast('Batas kuota tercapai: Akun Free/Demo dibatasi maksimal 1 website Cloudflare BYOC. Hapus proyek yang ada atau hubungi admin.', 'error');
      this.activeTab = 'list';
      return;
    }
    this.resetForm();
    this.activeTab = 'wizard';
  },

  getFilteredProjects() {
    if (!this.searchQuery.trim()) return this.projects;
    const q = this.searchQuery.toLowerCase().trim();
    return this.projects.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.slug && p.slug.toLowerCase().includes(q)) ||
      (p.productionUrl && p.productionUrl.toLowerCase().includes(q)) ||
      (p.customDomain && p.customDomain.toLowerCase().includes(q))
    );
  },

  openEditModal(proj) {
    this.editForm = {
      id: proj.id,
      name: proj.name || '',
      slug: proj.slug || '',
      customDomain: proj.customDomain || '',
      status: proj.status || 'active',
      cfAccountId: proj.cfAccountId || this.accountId || '',
      cfApiToken: ''
    };
    this.showEditApiToken = false;
    this.showEditModal = true;
  },

  async submitEditProject() {
    if (!this.editForm.name.trim()) {
      this.showToast('Nama proyek wajib diisi!', 'error');
      return;
    }
    this.isSavingEdit = true;
    try {
      const res = await fetch('/api/deployer/projects/' + this.editForm.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.editForm.name.trim(),
          customDomain: this.editForm.customDomain.trim() || null,
          status: this.editForm.status,
          cfAccountId: this.editForm.cfAccountId.trim(),
          cfApiToken: this.editForm.cfApiToken.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan perubahan proyek');
      }
      this.showEditModal = false;
      this.showToast(data.message || 'Proyek berhasil diperbarui!', 'success');
      await this.loadProjects();
    } catch (err) {
      this.showToast(err.message, 'error');
    } finally {
      this.isSavingEdit = false;
    }
  },

  openDeleteModal(proj) {
    this.deleteTarget = proj;
    this.deleteCloudflareResources = false;
    this.showDeleteModal = true;
  },

  async confirmDeleteProject() {
    if (!this.deleteTarget) return;
    this.isDeletingProject = true;
    try {
      const url = '/api/deployer/projects/' + this.deleteTarget.id + '?deleteCloudflare=' + (this.deleteCloudflareResources ? 'true' : 'false');
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghapus proyek');
      }
      this.showDeleteModal = false;
      this.deleteTarget = null;
      this.showToast(data.message || 'Proyek berhasil dihapus!', 'success');
      await this.loadProjects();
    } catch (err) {
      this.showToast(err.message, 'error');
    } finally {
      this.isDeletingProject = false;
    }
  },

  persistCredentialsLocal() {
    if (this.accountId && this.accountId.trim()) {
      localStorage.setItem('cmsmu_cf_account_id', this.accountId.trim());
    }
    if (this.apiToken && this.apiToken.trim()) {
      localStorage.setItem('cmsmu_cf_api_token', this.apiToken.trim());
    }
  },

  async loadSavedCredentials() {
    const localAcc = localStorage.getItem('cmsmu_cf_account_id');
    const localTok = localStorage.getItem('cmsmu_cf_api_token');
    if (localAcc && !this.accountId) this.accountId = localAcc;
    if (localTok && !this.apiToken) this.apiToken = localTok;

    try {
      const res = await fetch('/api/deployer/saved-credentials');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.accountId && !this.accountId) {
            this.accountId = json.data.accountId;
          }
          if (json.data.apiToken && !this.apiToken) {
            this.apiToken = json.data.apiToken;
          }
          this.persistCredentialsLocal();
        }
      }
    } catch (e) {}

    if (this.accountId && this.apiToken && !this.tokenVerified) {
      this.verifyToken(true);
    }
  },

  showToast(msg, type = 'success') {
    this.toastMsg = msg;
    this.toastType = type;
    setTimeout(() => { this.toastMsg = ''; }, 4000);
  },

  updateSlug() {
    this.slug = this.projectName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  async verifyToken(silent = false) {
    if (!this.accountId.trim() || !this.apiToken.trim()) {
      if (!silent) this.showToast('Account ID dan API Token Cloudflare wajib diisi!', 'error');
      return;
    }
    this.persistCredentialsLocal();
    this.isTestingToken = true;
    this.errorMessage = '';
    try {
      const res = await fetch('/api/deployer/verify-cf-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: this.accountId.trim(), apiToken: this.apiToken.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Kredensial Cloudflare tidak valid');
      }
      this.tokenVerified = true;
      this.verifiedAccountName = data.accountName || 'Cloudflare Account';
      this.tokenPermissions = data.permissions || [];
      if (!silent) this.showToast('Koneksi Cloudflare terverifikasi sukses!', 'success');
    } catch (err) {
      this.tokenVerified = false;
      if (!silent) {
        this.errorMessage = err.message;
        this.showToast('Verifikasi gagal: ' + err.message, 'error');
      }
    } finally {
      this.isTestingToken = false;
    }
  },

  goToStep2() {
    if (this.quota && this.quota.isLimitReached) {
      this.showToast('Batas kuota tercapai: Akun Free/Demo dibatasi maksimal 1 website Cloudflare BYOC!', 'error');
      this.activeTab = 'list';
      return;
    }
    if (!this.projectName.trim() || !this.slug.trim()) {
      this.showToast('Nama Website dan Slug Proyek wajib diisi!', 'error');
      return;
    }
    if (!this.adminEmail.trim() || !this.adminPassword) {
      this.showToast('Email dan Password admin website wajib diisi!', 'error');
      return;
    }
    if (this.adminPassword.length < 8) {
      this.showToast('Password admin minimal 8 karakter!', 'error');
      return;
    }
    if (this.adminPassword !== this.adminPasswordConfirm) {
      this.showToast('Konfirmasi password tidak cocok!', 'error');
      return;
    }
    this.step = 2;
    if (this.accountId && this.apiToken && !this.tokenVerified && !this.isTestingToken) {
      this.verifyToken(true);
    }
  },

  goToStep3() {
    if (!this.tokenVerified) {
      this.showToast('Harap verifikasi token Cloudflare terlebih dahulu!', 'error');
      return;
    }
    this.step = 3;
  },

  confirmProvision() {
    if (this.quota && this.quota.isLimitReached) {
      this.showToast('Batas kuota tercapai: Akun Free/Demo hanya 1 website!', 'error');
      this.activeTab = 'list';
      return;
    }
    this.showConfirmModal = true;
  },

  async executeProvision() {
    if (this.quota && this.quota.isLimitReached) {
      this.showToast('Batas kuota tercapai: Akun Free/Demo dibatasi maksimal 1 website Cloudflare BYOC!', 'error');
      this.activeTab = 'list';
      return;
    }
    this.showConfirmModal = false;
    this.step = 4;
    this.isLoading = true;
    this.errorMessage = '';
    this.successData = null;
    this.persistCredentialsLocal();

    // Reset checklist
    this.stepsProgress.forEach(s => s.status = 'pending');
    this.stepsProgress[0].status = 'running';

    try {
      const res = await fetch('/api/deployer/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: this.projectName.trim(),
          slug: this.slug.trim(),
          projectSlug: this.slug.trim(),
          accountId: this.accountId.trim(),
          apiToken: this.apiToken.trim(),
          adminEmail: this.adminEmail.trim(),
          adminPassword: this.adminPassword,
          adminName: this.adminName.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.quotaExceeded && this.quota) {
          this.quota.isLimitReached = true;
        }
        const errObj = new Error(data.error || 'Provisioning gagal dieksekusi');
        if (typeof data.failedStepIndex === 'number') {
          errObj.failedStepIndex = data.failedStepIndex;
        }
        throw errObj;
      }

      // Tandai semua checklist sukses
      this.stepsProgress.forEach(s => s.status = 'done');
      this.successData = data.data || data;
      this.showToast('Selamat! Instance CMSMu berhasil dideploy ke Cloudflare Anda!', 'success');
      await this.loadProjects();
    } catch (err) {
      this.errorMessage = err.message;
      const failedIdx = (typeof err.failedStepIndex === 'number') ? err.failedStepIndex : this.stepsProgress.findIndex(s => s.status === 'running');
      if (failedIdx !== -1 && failedIdx < this.stepsProgress.length) {
        for (let i = 0; i < failedIdx; i++) {
          this.stepsProgress[i].status = 'done';
        }
        this.stepsProgress[failedIdx].status = 'error';
      }
      this.showToast('Provisioning gagal: ' + err.message, 'error');
    } finally {
      this.isLoading = false;
    }
  },

  resetForm() {
    this.step = 1;
    this.projectName = '';
    this.slug = '';
    this.adminEmail = '';
    this.adminPassword = '';
    this.adminPasswordConfirm = '';
    this.successData = null;
    this.errorMessage = '';
  }
}" x-init="initDeployer()" class="space-y-6 max-w-5xl mx-auto pb-12">

  <!-- IN-SYSTEM FLOATING TOAST -->
  <div x-show="toastMsg" x-cloak
       x-transition:enter="transition ease-out duration-300"
       x-transition:enter-start="opacity-0 transform translate-y-2"
       x-transition:enter-end="opacity-100 transform translate-y-0"
       x-transition:leave="transition ease-in duration-200"
       x-transition:leave-start="opacity-100 transform translate-y-0"
       x-transition:leave-end="opacity-0 transform translate-y-2"
       :class="toastType === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'"
       style="position:fixed; bottom:24px; right:24px; padding:12px 20px; border-radius:12px; font-size:13px; font-weight:700; z-index:99999; box-shadow:0 10px 25px rgba(0,0,0,0.25); display:flex; align-items:center; gap:8px;">
    <i :class="toastType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
    <span x-text="toastMsg"></span>
  </div>

  <!-- HEADER & HERO -->
  <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
    <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
          <i class="fas fa-cloud-upload-alt"></i> BYOC Engine (Bring Your Own Cloudflare)
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight m-0">1-Click Cloudflare Deployer</h1>
        <p class="text-slate-300 text-sm mt-2 max-w-xl leading-relaxed">
          Kelola dan deploy website CMSMu instan ke akun Cloudflare Anda sendiri. Otomasi pembuatan D1 Database, R2 Storage, KV Cache, dan Pages Hosting.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button type="button" @click="activeTab = 'list'; loadProjects()" :class="activeTab === 'list' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/10 hover:bg-white/20 text-white border-white/10'" class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border">
          <i class="fas fa-layer-group"></i> Daftar Proyek (<span x-text="projects.length">0</span>)
        </button>
        <button type="button" @click="startDeployWizard()" :class="activeTab === 'wizard' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-white/10 hover:bg-white/20 text-white border-white/10'" class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border">
          <i class="fas fa-plus-circle"></i> Deploy Proyek Baru
        </button>
        <a href="#monitoring" @click="view = 'byoc-monitoring'" class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 backdrop-blur-sm border border-white/10">
          <i class="fas fa-satellite-dish"></i> Activity Monitor
        </a>
      </div>
    </div>
  </div>

  <!-- BANNER TIER & STATUS KUOTA PENGGUNA (BYOC QUOTA BADGE) -->
  <div class="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm transition-colors"
           :class="quota.isLimitReached ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'">
        <i :class="quota.isLimitReached ? 'fas fa-exclamation-triangle' : 'fas fa-shield-alt'"></i>
      </div>
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Paket Akun:</span>
          <span class="px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide border shadow-sm"
                :class="quota.limit === 1 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-purple-50 text-purple-700 border-purple-200'"
                x-text="quota.planLabel || 'Free / Demo'">
          </span>
          <template x-if="quota.limit === 1">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Maks. 1 Website
            </span>
          </template>
        </div>
        <div class="text-xs text-slate-600 font-medium mt-1.5 flex items-center gap-1.5 flex-wrap">
          <span>Penggunaan Kuota:</span>
          <span class="font-bold text-slate-900" x-text="quota.used">0</span>
          <span class="text-slate-400">/</span>
          <span class="font-bold text-slate-900" x-text="quota.limit !== null ? quota.limit : '∞'">1</span>
          <span>Website Aktif</span>
          <template x-if="quota.isLimitReached">
            <span class="text-rose-600 font-bold ml-1.5 flex items-center gap-1">
              <i class="fas fa-times-circle text-[11px]"></i> Kuota Tercapai (Penuh)
            </span>
          </template>
        </div>
      </div>
    </div>

    <!-- Status Indikator / Panduan Kuota -->
    <div class="flex items-center gap-2 self-stretch md:self-auto justify-end">
      <template x-if="quota.isLimitReached">
        <div class="text-right">
          <span class="text-xs text-amber-700 font-bold block flex items-center gap-1 justify-end">
            <i class="fas fa-info-circle"></i> Kuota Akun Penuh
          </span>
          <span class="text-[11px] text-slate-500 block">Hapus website lama untuk deploy baru, atau upgrade akun</span>
        </div>
      </template>
      <template x-if="!quota.isLimitReached">
        <span class="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
          <i class="fas fa-check-circle text-emerald-500"></i> Kuota Tersedia (Bisa Deploy)
        </span>
      </template>
    </div>
  </div>

  <!-- TAB 1: DAFTAR PROYEK (PROJECT LIST, EDIT & DELETE) -->
  <div x-show="activeTab === 'list'" class="space-y-4">
    <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 class="text-lg font-bold text-slate-800 m-0 flex items-center gap-2">
            <i class="fas fa-server text-indigo-600"></i> Daftar Instance Website Terdaftar
          </h2>
          <p class="text-xs text-slate-500 m-0 mt-1">Kelola situs CMSMu yang berjalan di akun Cloudflare Anda</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div class="relative">
            <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input type="text" x-model="searchQuery" placeholder="Cari nama atau slug..." class="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none">
          </div>
          <button type="button" @click="loadProjects()" :disabled="isLoadingProjects" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
            <i class="fas fa-sync-alt" :class="isLoadingProjects ? 'fa-spin' : ''"></i> Refresh
          </button>
          <button type="button" @click="startDeployWizard()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
            <i class="fas fa-plus"></i> Buat Proyek Baru
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <template x-if="isLoadingProjects && projects.length === 0">
        <div class="py-12 text-center space-y-3">
          <i class="fas fa-circle-notch fa-spin text-2xl text-indigo-600"></i>
          <p class="text-xs text-slate-500 font-medium m-0">Memuat daftar proyek Cloudflare...</p>
        </div>
      </template>

      <!-- Empty State -->
      <template x-if="!isLoadingProjects && getFilteredProjects().length === 0">
        <div class="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl">
            <i class="fas fa-cloud-upload-alt"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-800 m-0">Belum Ada Proyek Ditemukan</h3>
            <p class="text-xs text-slate-500 m-0 mt-1 max-w-md mx-auto">
              Anda belum memiliki proyek yang cocok atau belum men-deploy instance CMSMu ke akun Cloudflare.
            </p>
          </div>
          <button type="button" @click="startDeployWizard()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 shadow-sm">
            <i class="fas fa-rocket"></i> Deploy Proyek Pertama Sekarang
          </button>
        </div>
      </template>

      <!-- Project Cards / Table -->
      <template x-if="getFilteredProjects().length > 0">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                <th class="py-3 px-4">Proyek & Slug</th>
                <th class="py-3 px-4">URL & Domain</th>
                <th class="py-3 px-4">Resource Binding</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <template x-for="proj in getFilteredProjects()" :key="proj.id">
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-slate-800 text-sm" x-text="proj.name"></div>
                    <div class="font-mono text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span class="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded" x-text="proj.slug"></span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <a :href="proj.productionUrl" target="_blank" class="font-bold text-indigo-600 hover:underline flex items-center gap-1">
                      <span x-text="proj.productionUrl"></span>
                      <i class="fas fa-external-link-alt text-[10px]"></i>
                    </a>
                    <template x-if="proj.customDomain">
                      <div class="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                        <i class="fas fa-globe"></i> <span x-text="proj.customDomain"></span>
                      </div>
                    </template>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex flex-wrap gap-1">
                      <span class="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-mono text-[10px]" :title="'D1 ID: ' + (proj.d1DatabaseId || '-')">
                        <i class="fas fa-database mr-1"></i><span x-text="proj.slug + '_db'"></span>
                      </span>
                      <span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md font-mono text-[10px]">
                        <i class="fas fa-hdd mr-1"></i><span x-text="proj.r2BucketName || (proj.slug + '-media')"></span>
                      </span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                          :class="{
                            'bg-emerald-50 text-emerald-700 border border-emerald-200': proj.status === 'active',
                            'bg-amber-50 text-amber-700 border border-amber-200': proj.status === 'suspended' || proj.status === 'provisioning',
                            'bg-rose-50 text-rose-700 border border-rose-200': proj.status === 'error'
                          }">
                      <span class="w-1.5 h-1.5 rounded-full"
                            :class="{
                              'bg-emerald-500': proj.status === 'active',
                              'bg-amber-500': proj.status === 'suspended' || proj.status === 'provisioning',
                              'bg-rose-500': proj.status === 'error'
                            }"></span>
                      <span class="uppercase" x-text="proj.status || 'active'"></span>
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <div class="inline-flex items-center justify-end gap-1.5">
                      <a :href="proj.productionUrl" target="_blank" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1" title="Buka Website Publik">
                        <i class="fas fa-external-link-alt"></i> Web
                      </a>
                      <a :href="proj.productionUrl + '/admin'" target="_blank" class="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1" title="Masuk Panel Admin">
                        <i class="fas fa-user-shield"></i> Admin
                      </a>
                      <button type="button" @click="openEditModal(proj)" class="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1" title="Edit Proyek">
                        <i class="fas fa-edit"></i> Edit
                      </button>
                      <button type="button" @click="openDeleteModal(proj)" class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1" title="Hapus Proyek">
                        <i class="fas fa-trash-alt"></i> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>

  <!-- TAB 2: WIZARD DEPLOY PROYEK BARU -->
  <div x-show="activeTab === 'wizard'" x-cloak class="space-y-6">

  <!-- ALERT KUOTA MAKSIMAL TERCAPAI (WIZARD GUARD) -->
  <template x-if="quota && quota.isLimitReached">
    <div class="p-5 bg-rose-50 border-2 border-rose-300 rounded-3xl flex items-start gap-4 text-rose-800 shadow-sm">
      <div class="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 text-xl font-bold">
        <i class="fas fa-ban"></i>
      </div>
      <div class="flex-1">
        <h4 class="text-sm font-extrabold text-rose-900 m-0">Batas Kuota Pembuatan Website Tercapai</h4>
        <p class="text-xs text-rose-700 mt-1 mb-3 leading-relaxed">
          Akun paket <strong>Free / Demo</strong> dibatasi maksimal <strong>1 website Cloudflare BYOC</strong> aktif. Anda saat ini telah memiliki <strong x-text="quota.used">1</strong> website terdaftar.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" @click="activeTab = 'list'" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
            <i class="fas fa-layer-group"></i> Kelola Website Saya
          </button>
          <span class="text-[11px] text-rose-600 font-medium">Hapus proyek lama di tab daftar proyek jika ingin deploy ulang.</span>
        </div>
      </div>
    </div>
  </template>

  <!-- STEPPER PROGRESS BAR -->
  <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
    <div class="grid grid-cols-4 gap-2">
      <!-- Step 1 -->
      <div class="flex items-center gap-3 p-2 rounded-xl transition-all" :class="step >= 1 ? 'bg-indigo-50 text-indigo-900' : 'text-slate-400'">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs" :class="step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'">1</div>
        <div class="hidden sm:block">
          <p class="text-[11px] font-bold uppercase tracking-wider m-0">Langkah 1</p>
          <p class="text-xs font-semibold m-0 truncate">Info Website</p>
        </div>
      </div>
      <!-- Step 2 -->
      <div class="flex items-center gap-3 p-2 rounded-xl transition-all" :class="step >= 2 ? 'bg-indigo-50 text-indigo-900' : 'text-slate-400'">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs" :class="step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'">2</div>
        <div class="hidden sm:block">
          <p class="text-[11px] font-bold uppercase tracking-wider m-0">Langkah 2</p>
          <p class="text-xs font-semibold m-0 truncate">Akun Cloudflare</p>
        </div>
      </div>
      <!-- Step 3 -->
      <div class="flex items-center gap-3 p-2 rounded-xl transition-all" :class="step >= 3 ? 'bg-indigo-50 text-indigo-900' : 'text-slate-400'">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs" :class="step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'">3</div>
        <div class="hidden sm:block">
          <p class="text-[11px] font-bold uppercase tracking-wider m-0">Langkah 3</p>
          <p class="text-xs font-semibold m-0 truncate">Preview Binding</p>
        </div>
      </div>
      <!-- Step 4 -->
      <div class="flex items-center gap-3 p-2 rounded-xl transition-all" :class="step >= 4 ? 'bg-indigo-50 text-indigo-900' : 'text-slate-400'">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs" :class="step >= 4 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'">4</div>
        <div class="hidden sm:block">
          <p class="text-[11px] font-bold uppercase tracking-wider m-0">Langkah 4</p>
          <p class="text-xs font-semibold m-0 truncate">Deploy & Live</p>
        </div>
      </div>
    </div>
  </div>

  <!-- STEP 1 CONTENT -->
  <div x-show="step === 1" x-cloak class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
    <div class="border-b border-slate-100 pb-4">
      <h2 class="text-lg font-bold text-slate-800 m-0">1. Konfigurasi Dasar Website</h2>
      <p class="text-xs text-slate-500 m-0 mt-1">Tentukan nama website, slug URL subdomain, dan buat akun Super Administrator pertama.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-2">Nama Website / Lembaga <span class="text-rose-500">*</span></label>
        <input type="text" x-model="projectName" @input="updateSlug()" placeholder="Contoh: SD Muhammadiyah 1 Surakarta" class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all">
        <p class="text-[11px] text-slate-400 mt-1">Nama ini akan menjadi judul utama situs Anda.</p>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-2">Slug URL Subdomain <span class="text-rose-500">*</span></label>
        <div class="flex items-center">
          <input type="text" x-model="slug" placeholder="sdm1-solo" class="flex-1 border border-slate-200 px-4 py-2.5 rounded-l-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-mono">
          <span class="bg-slate-100 border border-l-0 border-slate-200 px-3 py-2.5 rounded-r-xl text-xs font-semibold text-slate-600">.pages.dev</span>
        </div>
        <p class="text-[11px] text-slate-400 mt-1">Domain sementara Cloudflare Pages sebelum menghubungkan domain custom.</p>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-2">Nama Administrator <span class="text-rose-500">*</span></label>
        <input type="text" x-model="adminName" placeholder="Nama Lengkap Admin" class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all">
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-2">Email Administrator Baru <span class="text-rose-500">*</span></label>
        <input type="email" x-model="adminEmail" placeholder="admin@sdm1.sch.id" class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all">
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-2">Password Administrator <span class="text-rose-500">*</span></label>
        <div class="relative flex items-center">
          <input :type="showAdminPassword ? 'text' : 'password'" x-model="adminPassword" placeholder="Minimal 8 karakter aman" class="w-full border border-slate-200 px-4 py-2.5 pr-11 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all">
          <button type="button" @click="showAdminPassword = !showAdminPassword" class="absolute right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg focus:outline-none transition-colors flex items-center justify-center" :title="showAdminPassword ? 'Sembunyikan Password' : 'Lihat Password'">
            <span x-show="!showAdminPassword"><i class="fas fa-eye text-sm"></i></span>
            <span x-show="showAdminPassword" x-cloak><i class="fas fa-eye-slash text-sm"></i></span>
          </button>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-2">Konfirmasi Password <span class="text-rose-500">*</span></label>
        <div class="relative flex items-center">
          <input :type="showAdminPasswordConfirm ? 'text' : 'password'" x-model="adminPasswordConfirm" placeholder="Ulangi password" class="w-full border border-slate-200 px-4 py-2.5 pr-11 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all">
          <button type="button" @click="showAdminPasswordConfirm = !showAdminPasswordConfirm" class="absolute right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg focus:outline-none transition-colors flex items-center justify-center" :title="showAdminPasswordConfirm ? 'Sembunyikan Password' : 'Lihat Password'">
            <span x-show="!showAdminPasswordConfirm"><i class="fas fa-eye text-sm"></i></span>
            <span x-show="showAdminPasswordConfirm" x-cloak><i class="fas fa-eye-slash text-sm"></i></span>
          </button>
        </div>
      </div>
    </div>

    <div class="flex justify-end pt-4 border-t border-slate-100">
      <button type="button" @click="goToStep2()" :disabled="quota && quota.isLimitReached" :class="(quota && quota.isLimitReached) ? 'opacity-50 cursor-not-allowed bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'" class="px-6 py-2.5 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
        Lanjut ke Akun Cloudflare <i class="fas fa-arrow-right"></i>
      </button>
    </div>
  </div>

  <!-- STEP 2 CONTENT -->
  <div x-show="step === 2" x-cloak class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
    <div class="border-b border-slate-100 pb-4 flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-slate-800 m-0">2. Hubungkan Akun Cloudflare Anda</h2>
        <p class="text-xs text-slate-500 m-0 mt-1">Kredensial disimpan aman dan hanya digunakan untuk mengorkestrasi resource D1, R2, KV, & Pages.</p>
      </div>
      <div x-show="tokenVerified" class="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
        <i class="fas fa-check-circle"></i> Terverifikasi: <span x-text="verifiedAccountName"></span>
      </div>
    </div>

    <!-- BANNER PANDUAN CEPAT & PINTASAN CLOUDFLARE -->
    <div class="p-5 bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-indigo-50/70 border border-amber-200/90 rounded-2xl space-y-3.5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
            <i class="fas fa-key text-base"></i>
          </div>
          <div>
            <h4 class="font-bold text-slate-800 text-xs sm:text-sm m-0">Panduan Pembuatan Token & Account ID Cloudflare</h4>
            <p class="text-[11px] text-slate-600 m-0 mt-0.5 leading-relaxed">
              Cloudflare mewajibkan <strong>Scoped API Token</strong> agar kredensial Anda terisolasi aman (hanya izin D1, R2, KV, & Pages).
            </p>
          </div>
        </div>
        <button type="button" @click="showGuideModal = true" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 shadow-sm self-start sm:self-center">
          <i class="fas fa-book-open"></i> Buka Panduan Lengkap
        </button>
      </div>

      <!-- PINTASAN LANGSUNG -->
      <div class="flex flex-wrap items-center gap-2 pt-3 border-t border-amber-200/60 text-[11px]">
        <span class="text-slate-500 font-semibold flex items-center gap-1">
          <i class="fas fa-bolt text-amber-500"></i> Pintasan Dasbor:
        </span>
        <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener noreferrer" class="px-3 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-700 font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-xs">
          <i class="fas fa-external-link-alt text-[10px]"></i> Buka Halaman API Tokens
        </a>
        <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener noreferrer" class="px-3 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-700 font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-xs">
          <i class="fas fa-external-link-alt text-[10px]"></i> Buka Dasbor Cloudflare (Salin Account ID)
        </a>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-xs font-bold text-slate-700 m-0">Cloudflare Account ID <span class="text-rose-500">*</span></label>
          <button type="button" @click="showGuideModal = true; activeGuideTab = 'account_id'" class="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-medium">
            <i class="fas fa-question-circle"></i> Cara menemukan?
          </button>
        </div>
        <input type="text" x-model="accountId" @input="persistCredentialsLocal()" placeholder="32 karakter hex (contoh: a1b2c3d4...)" class="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all">
        <p class="text-[11px] text-slate-400 mt-1">Tersimpan otomatis agar tidak perlu diinput ulang.</p>
      </div>

      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-xs font-bold text-slate-700 m-0">Cloudflare API Token <span class="text-rose-500">*</span></label>
          <button type="button" @click="showGuideModal = true; activeGuideTab = 'token'" class="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-medium">
            <i class="fas fa-question-circle"></i> Cara membuat?
          </button>
        </div>
        <div class="relative flex items-center">
          <input :type="showApiToken ? 'text' : 'password'" x-model="apiToken" @input="persistCredentialsLocal()" placeholder="Bearer Token Cloudflare..." class="w-full border border-slate-200 px-4 py-2.5 pr-11 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all">
          <button type="button" @click="showApiToken = !showApiToken" class="absolute right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg focus:outline-none transition-colors flex items-center justify-center" :title="showApiToken ? 'Sembunyikan Token' : 'Lihat Token'">
            <span x-show="!showApiToken"><i class="fas fa-eye text-sm"></i></span>
            <span x-show="showApiToken" x-cloak><i class="fas fa-eye-slash text-sm"></i></span>
          </button>
        </div>
        <p class="text-[11px] text-slate-400 mt-1">Token kustom dengan izin Account: D1, R2, KV, & Pages.</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <button type="button" @click="verifyToken()" :disabled="isTestingToken" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50">
        <i class="fas fa-sync-alt" :class="isTestingToken ? 'fa-spin' : ''"></i>
        <span x-text="isTestingToken ? 'Menguji Token...' : 'Uji Koneksi Token Cloudflare'"></span>
      </button>

      <template x-if="tokenVerified">
        <span class="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-1.5">
          <i class="fas fa-check-circle text-emerald-600"></i> Kredensial Tersimpan & Terverifikasi Otomatis (Siap Lanjut)
        </span>
      </template>
    </div>

    <div class="flex justify-between pt-4 border-t border-slate-100">
      <button type="button" @click="step = 1" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
        <i class="fas fa-arrow-left"></i> Kembali
      </button>
      <button type="button" @click="goToStep3()" :disabled="!tokenVerified" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
        Lanjut ke Preview Resource <i class="fas fa-arrow-right"></i>
      </button>
    </div>
  </div>

  <!-- STEP 3 CONTENT -->
  <div x-show="step === 3" x-cloak class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
    <div class="border-b border-slate-100 pb-4">
      <h2 class="text-lg font-bold text-slate-800 m-0">3. Preview Penamaan Sumber Daya & Binding Cloudflare</h2>
      <p class="text-xs text-slate-500 m-0 mt-1">CMSMu akan secara otomatis membuat dan menghubungkan sumber daya Cloudflare berikut di akun Anda:</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- D1 DB -->
      <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg">
          <i class="fas fa-database"></i>
        </div>
        <div>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider m-0">D1 Database</p>
          <p class="text-sm font-mono font-bold text-slate-800 m-0 mt-0.5" x-text="slug + '_db'"></p>
          <p class="text-xs text-slate-500 m-0 mt-1">Menyimpan artikel, pengguna, kategori, tema, dan relasi sistem.</p>
        </div>
      </div>

      <!-- R2 Bucket -->
      <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-lg">
          <i class="fas fa-photo-video"></i>
        </div>
        <div>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider m-0">R2 Storage Bucket</p>
          <p class="text-sm font-mono font-bold text-slate-800 m-0 mt-0.5" x-text="slug + '-media'"></p>
          <p class="text-xs text-slate-500 m-0 mt-1">Penyimpanan media gambar, dokumen PDF, dan aset unggahan.</p>
        </div>
      </div>

      <!-- KV Cache -->
      <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-lg">
          <i class="fas fa-bolt"></i>
        </div>
        <div>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider m-0">KV Cache</p>
          <p class="text-sm font-mono font-bold text-slate-800 m-0 mt-0.5" x-text="slug + '_cache'"></p>
          <p class="text-xs text-slate-500 m-0 mt-1">High-speed Edge cache untuk respons artikel &lt; 50ms di seluruh dunia.</p>
        </div>
      </div>

      <!-- Cloudflare Pages -->
      <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
          <i class="fas fa-globe"></i>
        </div>
        <div>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider m-0">Cloudflare Pages</p>
          <p class="text-sm font-mono font-bold text-slate-800 m-0 mt-0.5" x-text="'https://' + slug + '.pages.dev'"></p>
          <p class="text-xs text-slate-500 m-0 mt-1">Runtime serverless SSR cmsMu-go yang berjalan di global network.</p>
        </div>
      </div>
    </div>

    <div class="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs text-indigo-900">
      <div class="flex items-center gap-2">
        <i class="fas fa-info-circle text-indigo-600"></i>
        <span>Target Akun: <strong x-text="verifiedAccountName"></strong> (<span class="font-mono" x-text="accountId"></span>)</span>
      </div>
      <span class="font-bold text-indigo-700">Estimasi Deploy: ~30-45 Detik</span>
    </div>

    <div class="flex justify-between pt-4 border-t border-slate-100">
      <button type="button" @click="step = 2" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
        <i class="fas fa-arrow-left"></i> Kembali
      </button>
      <button type="button" @click="confirmProvision()" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
        <i class="fas fa-rocket"></i> Mulai Deploy ke Cloudflare
      </button>
    </div>
  </div>

  <!-- STEP 4 CONTENT (PROVISIONING PROGRESS & SUCCESS) -->
  <div x-show="step === 4" x-cloak class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
    <div class="border-b border-slate-100 pb-4">
      <h2 class="text-lg font-bold text-slate-800 m-0">4. Status Eksekusi Deployment</h2>
      <p class="text-xs text-slate-500 m-0 mt-1">Proses otomatisasi pembuatan infrastruktur Cloudflare sedang berlangsung.</p>
    </div>

    <!-- ERROR ALERT -->
    <template x-if="errorMessage">
      <div class="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs space-y-2">
        <div class="font-bold flex items-center gap-2">
          <i class="fas fa-exclamation-triangle text-rose-600"></i> Deployment Terhenti / Gagal
        </div>
        <p class="m-0 font-mono text-[11px]" x-text="errorMessage"></p>
        <div class="pt-2">
          <button type="button" @click="step = 2" class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all">
            Periksa Kembali Kredensial
          </button>
        </div>
      </div>
    </template>

    <!-- CHECKLIST PROGRESS -->
    <div class="space-y-3">
      <template x-for="(s, idx) in stepsProgress" :key="idx">
        <div class="p-4 rounded-2xl border flex items-center justify-between transition-all"
             :class="{
               'bg-slate-50 border-slate-200/80 text-slate-500': s.status === 'pending',
               'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold': s.status === 'running',
               'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold': s.status === 'done',
               'bg-rose-50 border-rose-200 text-rose-900 font-bold': s.status === 'error'
             }">
          <div class="flex items-center gap-3">
            <template x-if="s.status === 'pending'">
              <div class="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] text-slate-400" x-text="idx + 1"></div>
            </template>
            <template x-if="s.status === 'running'">
              <div class="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
            </template>
            <template x-if="s.status === 'done'">
              <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                <i class="fas fa-check"></i>
              </div>
            </template>
            <template x-if="s.status === 'error'">
              <div class="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs">
                <i class="fas fa-times"></i>
              </div>
            </template>
            <span class="text-xs" x-text="s.title"></span>
          </div>

          <span class="text-[11px] uppercase tracking-wider font-bold"
                x-text="s.status === 'done' ? 'Sukses' : (s.status === 'running' ? 'Memproses...' : (s.status === 'error' ? 'Gagal' : 'Menunggu'))">
          </span>
        </div>
      </template>
    </div>

    <!-- SUCCESS SUMMARY CARD -->
    <template x-if="successData">
      <div class="p-6 bg-emerald-50/80 border-2 border-emerald-300 rounded-3xl space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-600/30">
            <i class="fas fa-check-double"></i>
          </div>
          <div>
            <h3 class="text-base font-extrabold text-emerald-950 m-0">Website Berhasil Dideploy!</h3>
            <p class="text-xs text-emerald-800 m-0 mt-0.5">Instance CMSMu Anda telah aktif di jaringan global Cloudflare.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div class="p-3.5 bg-white rounded-xl border border-emerald-200">
            <p class="text-[10px] uppercase font-bold text-slate-400 m-0">URL Website Publik</p>
            <a :href="successData.productionUrl" target="_blank" class="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1.5 mt-1" x-text="successData.productionUrl">
            </a>
          </div>

          <div class="p-3.5 bg-white rounded-xl border border-emerald-200">
            <p class="text-[10px] uppercase font-bold text-slate-400 m-0">URL Panel Admin</p>
            <a :href="successData.adminLoginUrl" target="_blank" class="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1.5 mt-1" x-text="successData.adminLoginUrl">
            </a>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 pt-2">
          <a :href="successData.productionUrl" target="_blank" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
            <i class="fas fa-external-link-alt"></i> Kunjungi Website Baru
          </a>
          <a :href="successData.adminLoginUrl" target="_blank" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
            <i class="fas fa-user-shield"></i> Masuk Panel Admin
          </a>
          <button type="button" @click="loadProjects(); activeTab = 'list'" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
            <i class="fas fa-layer-group"></i> Lihat di Daftar Proyek
          </button>
          <button type="button" @click="resetForm()" class="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all">
            Deploy Proyek Lainnya
          </button>
        </div>
      </div>
    </template>
  </div>

  </div><!-- END TAB 2: WIZARD -->

  <!-- IN-SYSTEM EDIT PROJECT MODAL -->
  <div x-show="showEditModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div @click.away="showEditModal = false" class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
            <i class="fas fa-edit"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800 m-0">Edit Data Proyek</h3>
            <p class="text-xs text-slate-500 m-0">Perbarui nama, custom domain, atau status instance</p>
          </div>
        </div>
        <button type="button" @click="showEditModal = false" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center">
          <i class="fas fa-times text-xs"></i>
        </button>
      </div>

      <div class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">Nama Website <span class="text-rose-500">*</span></label>
          <input type="text" x-model="editForm.name" class="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none">
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">Slug Proyek (Terkunci)</label>
            <input type="text" :value="editForm.slug" disabled class="w-full bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">Status Operasional</label>
            <select x-model="editForm.status" class="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none bg-white">
              <option value="active">Active (Aktif)</option>
              <option value="suspended">Suspended (Ditangguhkan)</option>
              <option value="provisioning">Provisioning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1.5">Custom Domain (Opsional)</label>
          <input type="text" x-model="editForm.customDomain" placeholder="Contoh: www.sdm1solo.sch.id" class="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none">
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">Cloudflare Account ID</label>
            <input type="text" x-model="editForm.cfAccountId" class="w-full border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">Perbarui API Token (Opsional)</label>
            <div class="relative flex items-center">
              <input :type="showEditApiToken ? 'text' : 'password'" x-model="editForm.cfApiToken" placeholder="Kosongkan jika tidak diubah" class="w-full border border-slate-200 px-3.5 py-2 pr-9 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none">
              <button type="button" @click="showEditApiToken = !showEditApiToken" class="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1">
                <span x-show="!showEditApiToken"><i class="fas fa-eye text-xs"></i></span>
                <span x-show="showEditApiToken" x-cloak><i class="fas fa-eye-slash text-xs"></i></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button type="button" @click="showEditModal = false" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all">
          Batal
        </button>
        <button type="button" @click="submitEditProject()" :disabled="isSavingEdit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50">
          <i class="fas fa-save" :class="isSavingEdit ? 'fa-spin' : ''"></i>
          <span x-text="isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan'"></span>
        </button>
      </div>
    </div>
  </div>

  <!-- IN-SYSTEM DELETE CONFIRMATION MODAL (RULE 16: NO NATIVE CONFIRM) -->
  <div x-show="showDeleteModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div @click.away="showDeleteModal = false" class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
      <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
        <i class="fas fa-trash-alt"></i>
      </div>
      <div>
        <h3 class="text-base font-bold text-slate-800 m-0">Hapus Proyek Ini?</h3>
        <p class="text-xs text-slate-500 m-0 mt-1.5 leading-relaxed">
          Anda akan menghapus proyek <strong class="text-slate-800" x-text="deleteTarget ? deleteTarget.name : ''"></strong> (<code class="px-1.5 py-0.5 bg-slate-100 rounded text-rose-600 font-mono" x-text="deleteTarget ? deleteTarget.slug : ''"></code>) dari daftar Control Plane.
        </p>
      </div>

      <label class="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 cursor-pointer">
        <input type="checkbox" x-model="deleteCloudflareResources" class="mt-0.5 rounded border-rose-300 text-rose-600 focus:ring-rose-500">
        <div class="text-[11px] leading-relaxed text-rose-950">
          <span class="font-bold block">Hapus juga seluruh resource di Cloudflare</span>
          Menghapus project Pages, database D1 (<span class="font-mono" x-text="deleteTarget ? deleteTarget.slug + '_db' : ''"></span>), bucket R2, dan KV secara permanen dari akun Cloudflare.
        </div>
      </label>

      <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button type="button" @click="showDeleteModal = false" :disabled="isDeletingProject" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all">
          Batal
        </button>
        <button type="button" @click="confirmDeleteProject()" :disabled="isDeletingProject" class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50">
          <i class="fas fa-trash" :class="isDeletingProject ? 'fa-spin' : ''"></i>
          <span x-text="isDeletingProject ? 'Menghapus...' : 'Ya, Hapus Proyek'"></span>
        </button>
      </div>
    </div>
  </div>

  <!-- IN-SYSTEM CONFIRMATION MODAL (RULE 16: NO BROWSER NATIVE ALERT/CONFIRM) -->
  <div x-show="showConfirmModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div @click.away="showConfirmModal = false" class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
      <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
        <i class="fas fa-rocket"></i>
      </div>
      <div>
        <h3 class="text-base font-bold text-slate-800 m-0">Konfirmasi Pembuatan Sumber Daya</h3>
        <p class="text-xs text-slate-500 m-0 mt-1 leading-relaxed">
          Sistem akan membuat database D1 (<strong x-text="slug + '_db'"></strong>), R2 Bucket (<strong x-text="slug + '-media'"></strong>), KV Namespace, serta project Pages di akun Cloudflare Anda. Lanjutkan proses?
        </p>
      </div>
      <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button type="button" @click="showConfirmModal = false" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all">
          Batal
        </button>
        <button type="button" @click="executeProvision()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
          Ya, Mulai Provisioning
        </button>
      </div>
    </div>
  </div>

  <!-- IN-SYSTEM GUIDE MODAL (PANDUAN PEMBUATAN TOKEN & ACCOUNT ID) -->
  <div x-show="showGuideModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
    <div @click.away="showGuideModal = false" class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
      <!-- HEADER -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
            <i class="fas fa-book-reader"></i>
          </div>
          <div>
            <h3 class="text-base font-extrabold text-slate-800 m-0">Panduan Kredensial Cloudflare</h3>
            <p class="text-xs text-slate-500 m-0 mt-0.5">Langkah resmi membuat Token & menyalin Account ID di dasbor Cloudflare</p>
          </div>
        </div>
        <button type="button" @click="showGuideModal = false" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors">
          <i class="fas fa-times text-sm"></i>
        </button>
      </div>

      <!-- TABS -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2 shrink-0">
        <button type="button" @click="activeGuideTab = 'token'" :class="activeGuideTab === 'token' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
          <i class="fas fa-key"></i> 1. Cara Membuat API Token
        </button>
        <button type="button" @click="activeGuideTab = 'account_id'" :class="activeGuideTab === 'account_id' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
          <i class="fas fa-id-badge"></i> 2. Cara Menemukan Account ID
        </button>
      </div>

      <!-- TAB 1: API TOKEN -->
      <div x-show="activeGuideTab === 'token'" class="space-y-4 overflow-y-auto pr-1 flex-1 text-xs text-slate-600">
        <div class="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-start gap-2.5">
          <i class="fas fa-info-circle text-indigo-600 text-sm mt-0.5 shrink-0"></i>
          <p class="m-0 leading-relaxed text-indigo-950">
            <strong>Mengapa Scoped API Token?</strong> Cloudflare tidak menyediakan sinkronisasi OAuth publik untuk membuat resource backend. Scoped API Token adalah standar resmi paling aman karena hak akses dibatasi ketat tanpa memberi akses ke domain atau kartu kredit Anda.
          </p>
        </div>

        <ol class="space-y-3.5 pl-4 list-decimal m-0 leading-relaxed">
          <li>
            <div>
              <span class="font-bold text-slate-800">Buka halaman API Tokens Cloudflare:</span>
              <p class="mt-1 mb-1.5 text-slate-500">Klik tautan langsung di bawah untuk membuka dasbor manajemen token:</p>
              <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-600 font-semibold rounded-lg transition-colors">
                <i class="fas fa-external-link-alt text-[10px]"></i> dash.cloudflare.com/profile/api-tokens
              </a>
            </div>
          </li>
          <li>
            <div>
              <span class="font-bold text-slate-800">Klik tombol "Create Token":</span>
              <p class="mt-0.5 text-slate-500">Scroll ke paling bawah dan pilih template <strong>"Create Custom Token"</strong> (klik tombol <em>Get started</em>).</p>
            </div>
          </li>
          <li>
            <div>
              <span class="font-bold text-slate-800">Beri Nama Token:</span>
              <p class="mt-0.5 text-slate-500">Contoh: <code class="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono font-bold">CMSMu BYOC Deployer</code></p>
            </div>
          </li>
          <li>
            <div>
              <span class="font-bold text-slate-800">Konfigurasikan 4 Izin Wajib (Permissions):</span>
              <p class="mt-0.5 text-slate-500 mb-2">Tambahkan 4 baris izin berikut di bagian <strong>Permissions</strong>:</p>
              <div class="space-y-1.5 bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px]">
                <div class="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-100">
                  <span class="font-semibold text-slate-700">Account ➔ Workers D1 Storage</span>
                  <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Edit</span>
                </div>
                <div class="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-100">
                  <span class="font-semibold text-slate-700">Account ➔ Workers R2 Storage</span>
                  <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Edit</span>
                </div>
                <div class="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-100">
                  <span class="font-semibold text-slate-700">Account ➔ Workers KV Storage</span>
                  <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Edit</span>
                </div>
                <div class="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-100">
                  <span class="font-semibold text-slate-700">Account ➔ Cloudflare Pages</span>
                  <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Edit</span>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div>
              <span class="font-bold text-slate-800">Pilih Account Resources:</span>
              <p class="mt-0.5 text-slate-500">Pilih <code class="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono font-bold">Include ➔ All accounts</code> (atau pilih akun spesifik Anda).</p>
            </div>
          </li>
          <li>
            <div>
              <span class="font-bold text-slate-800">Selesaikan Pembuatan Token:</span>
              <p class="mt-0.5 text-slate-500">Klik <strong>Continue to summary</strong> ➔ Klik <strong>Create Token</strong>. Salin string token yang muncul dan tempelkan ke kolom input di formulir.</p>
            </div>
          </li>
        </ol>
      </div>

      <!-- TAB 2: ACCOUNT ID -->
      <div x-show="activeGuideTab === 'account_id'" class="space-y-4 overflow-y-auto pr-1 flex-1 text-xs text-slate-600">
        <div class="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start gap-2.5">
          <i class="fas fa-lightbulb text-amber-600 text-sm mt-0.5 shrink-0"></i>
          <p class="m-0 leading-relaxed text-amber-950">
            Account ID adalah 32 karakter hexadecimal unik yang merepresentasikan akun Cloudflare Anda.
          </p>
        </div>

        <div class="space-y-4 leading-relaxed">
          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <h4 class="font-bold text-slate-800 text-xs m-0 flex items-center gap-1.5">
              <i class="fas fa-link text-indigo-600"></i> Cara 1: Lihat dari Bilah URL Browser (Paling Cepat)
            </h4>
            <p class="text-slate-500 m-0">Buka dasbor Cloudflare Anda di browser. Perhatikan URL di address bar:</p>
            <div class="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-xl overflow-x-auto select-all">
              https://dash.cloudflare.com/<span class="text-emerald-400 font-bold underline">a1b2c3d4e5f67890123456789abcdef0</span>/workers-and-pages
            </div>
            <p class="text-[11px] text-slate-400 m-0">Bagian teks hijau 32 karakter hex setelah domain adalah Account ID Anda.</p>
          </div>

          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <h4 class="font-bold text-slate-800 text-xs m-0 flex items-center gap-1.5">
              <i class="fas fa-columns text-indigo-600"></i> Cara 2: Salin dari Sidebar Dasbor Workers & Pages
            </h4>
            <ol class="space-y-1.5 pl-4 list-decimal text-slate-500 m-0">
              <li>Buka menu <strong>Workers & Pages</strong> di dasbor Cloudflare.</li>
              <li>Lihat di sebelah kanan (sidebar <em>Account details</em>).</li>
              <li>Klik <strong>Click to copy</strong> pada bagian <strong>Account ID</strong>.</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
        <a href="https://developers.cloudflare.com/fundamentals/api/get-started/create-token/" target="_blank" rel="noopener noreferrer" class="text-xs text-indigo-600 hover:underline flex items-center gap-1">
          <i class="fas fa-external-link-alt text-[10px]"></i> Dokumentasi Resmi Cloudflare
        </a>
        <button type="button" @click="showGuideModal = false" class="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
          Tutup Panduan
        </button>
      </div>
    </div>
  </div>

</div>
`;
