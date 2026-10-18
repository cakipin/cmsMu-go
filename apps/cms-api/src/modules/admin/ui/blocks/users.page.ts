export const usersPage = `
<div x-show="view==='users'" x-init="$watch('view', function(v){ if(v==='users' && (!usersList || usersList.length===0)) loadUsers(); })">
  <!-- Header Users Page -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
    <div>
        <h2 class="text-xl font-bold text-slate-800 m-0">Users</h2>
        <p class="text-xs text-slate-500 m-0 mt-0.5">Kelola tim redaksi, masa aktif langganan, dan kustomisasi nama role pengguna.</p>
    </div>
    <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button @click="loadUsers()" class="btn min-h-[38px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300" title="Refresh Data">
            <i class="fas fa-sync" :class="isLoadingUsers ? 'fa-spin' : ''"></i>
        </button>
        <button @click="openRoleManager()" class="btn min-h-[38px] px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-md shadow-sm text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition-all">
          <i class="fas fa-user-tag"></i> <span>Kelola Role</span>
        </button>
        <button @click="openAddUser()" class="btn min-h-[38px] px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition-all">
          <i class="fas fa-plus"></i> <span>Add User</span>
        </button>
    </div>
  </div>

  <!-- TOOLBAR: FILTER ROLE & PENCARIAN RESPONSIF -->
  <div class="bg-white p-3 rounded-lg border border-slate-200 mb-4 shadow-sm flex flex-col md:flex-row md:items-center gap-2.5 md:gap-3">
    <!-- Input Pencarian (Fleksibel) -->
    <div class="relative flex-1">
      <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
      <input type="text" x-model="searchUser" @input="userPage = 1" placeholder="Cari nama, username, email, atau role..." 
             class="input w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-md border border-slate-300 focus:border-blue-500 outline-none">
    </div>

    <!-- Filter Role Dinamis & Tombol Reset (Sejajar di Desktop) -->
    <div class="flex items-center justify-between md:justify-end gap-2 shrink-0">
      <div class="flex items-center gap-2">
        <label class="text-xs font-semibold text-slate-600 shrink-0">Role:</label>
        <select x-model="filterUserRole" @change="userPage = 1" 
                class="input py-2 px-2.5 text-xs sm:text-sm rounded-md border border-slate-300 bg-white min-w-[150px] md:min-w-[180px] focus:border-blue-500 outline-none">
            <option value="all">Semua Role</option>
            <template x-for="r in rolesList" :key="'filter_' + r.slug">
                <option :value="r.slug" x-text="r.label"></option>
            </template>
        </select>
      </div>
      <button x-show="searchUser || filterUserRole !== 'all'" @click="searchUser=''; filterUserRole='all'; userPage=1" 
              class="btn py-2 px-3 text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md font-medium active:scale-95 transition-all shrink-0">
          Reset
      </button>
    </div>
  </div>

  <div class="card p-0 overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm mb-6">
    <!-- Desktop Table View (Hidden di Mobile) -->
    <div class="hidden md:block overflow-x-auto">
      <table class="wp-table" style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:#f8f9fa; border-bottom:2px solid #ddd;">
            <th style="text-align:left; padding:12px;">User</th>
            <th style="text-align:left;">Email</th>
            <th style="text-align:left;">Role</th>
            <th style="text-align:left;">Registered</th>
            <th width="100" style="text-align:center;">Action</th>
          </tr>
        </thead>
        <tbody>
          <template x-for="u in pagedUsers()" :key="u.id">
            <tr style="border-bottom:1px solid #eee;">
              <td style="padding:12px;">
                  <div style="display:flex; align-items:center; gap:10px;">
                      <div style="width:32px; height:32px; background:#2271b1; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:14px;">
                          <span x-text="(u.username || 'U').charAt(0).toUpperCase()"></span>
                      </div>
                      <div>
                          <div style="font-weight:bold; color:#2271b1;" x-text="u.username || 'Unspecified'"></div>
                          <div style="font-size:11px; color:#666;" x-text="u.name || ''"></div>
                      </div>
                  </div>
              </td>
              <td style="color:#555;">
                  <span x-text="u.email || '-'"></span>
              </td>
              <td>
                  <div>
                      <span class="badge" 
                            :style="getRoleBadgeStyle(u.role)"
                            style="padding:4px 8px; border-radius:4px; font-size:11px; text-transform:uppercase; display:inline-flex; align-items:center; gap:4px;">
                          <span x-text="getRoleLabel(u.role)"></span>
                      </span>
                      <template x-if="isQuotaRole(u.role) && u.subscription_expires_at">
                          <div style="font-size:10px; font-weight:600; margin-top:3px;"
                               :style="new Date(u.subscription_expires_at) < new Date() ? 'color:#dc2626;' : 'color:#059669;'"
                               x-text="new Date(u.subscription_expires_at) < new Date() ? 'Kedaluwarsa' : ('s.d. ' + new Date(u.subscription_expires_at).toLocaleDateString('id-ID'))"></div>
                      </template>
                  </div>
              </td>
              <td style="font-size:12px; color:#888;">
                  <span x-text="u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-'"></span>
              </td>
              <td style="text-align:center;">
                <div style="display:flex; justify-content:center; gap:5px;">
                  <button @click="editUser(u)" class="btn-icon" style="color:#f39c12;" title="Edit User"><i class="fas fa-pencil-alt"></i></button>
                  <button @click="deleteUser(u.id)" class="btn-icon" style="color:#e74c3c;" title="Hapus User"><i class="fas fa-trash-alt"></i></button>
                </div>
              </td>
            </tr>
          </template>
          <tr x-show="filteredUsers().length===0 && !isLoadingUsers">
              <td colspan="5" style="text-align:center; padding:30px; color:#999;">Belum ada user yang sesuai kriteria pencarian.</td>
          </tr>
          <tr x-show="isLoadingUsers">
              <td colspan="5" style="text-align:center; padding:30px; color:#64748b;">
                  <i class="fas fa-spinner fa-spin"></i> Memuat data user...
              </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Vertical Card List View -->
    <div class="block md:hidden divide-y divide-slate-100">
      <template x-for="u in pagedUsers()" :key="'mob_user_' + u.id">
        <div class="p-3.5 bg-white space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                <span x-text="(u.username || 'U').charAt(0).toUpperCase()"></span>
              </div>
              <div class="min-w-0">
                <h4 class="text-sm font-bold text-slate-800 m-0 truncate" x-text="u.username || 'Unspecified'"></h4>
                <div class="text-xs text-slate-500 truncate" x-text="u.name || '-'"></div>
              </div>
            </div>
            <div>
              <span class="badge" 
                    :style="getRoleBadgeStyle(u.role)"
                    style="padding:3px 6px; border-radius:4px; font-size:10px; text-transform:uppercase; display:inline-flex; align-items:center; gap:3px;">
                <span x-text="getRoleLabel(u.role)"></span>
              </span>
            </div>
          </div>

          <div class="text-xs text-slate-600 flex flex-wrap items-center justify-between gap-1 pt-0.5">
            <span class="truncate text-slate-500" x-text="u.email || '-'"></span>
            <span class="text-[11px] text-slate-400" x-text="u.created_at ? ('Reg: ' + new Date(u.created_at).toLocaleDateString('id-ID')) : ''"></span>
          </div>

          <template x-if="isQuotaRole(u.role) && u.subscription_expires_at">
            <div class="text-[11px] font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 w-fit"
                 :style="new Date(u.subscription_expires_at) < new Date() ? 'color:#dc2626;' : 'color:#059669;'"
                 x-text="new Date(u.subscription_expires_at) < new Date() ? 'Kedaluwarsa' : ('Masa Aktif s.d. ' + new Date(u.subscription_expires_at).toLocaleDateString('id-ID'))"></div>
          </template>

          <div class="flex items-center gap-2 pt-1.5 border-t border-slate-50">
            <button type="button" @click="editUser(u)" 
                    class="min-h-[40px] px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md flex items-center justify-center gap-1.5 flex-1 active:scale-95 transition-all">
              <i class="fas fa-pencil-alt text-xs text-amber-600"></i> <span>Edit User</span>
            </button>
            <button type="button" @click="deleteUser(u.id)" 
                    class="min-h-[40px] px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md flex items-center justify-center gap-1 active:scale-95 transition-all">
              <i class="fas fa-trash-alt text-xs"></i> <span>Hapus</span>
            </button>
          </div>
        </div>
      </template>

      <div x-show="filteredUsers().length===0 && !isLoadingUsers" class="p-8 text-center text-slate-400 text-xs">
        Belum ada user yang cocok.
      </div>
      <div x-show="isLoadingUsers" class="p-8 text-center text-slate-400 text-xs">
        <i class="fas fa-spinner fa-spin mr-1"></i> Memuat data user...
      </div>
    </div>

    <!-- FOOTER PAGINATION RESPONSIF -->
    <div x-show="filteredUsers().length > 0" class="flex flex-col sm:flex-row justify-between items-center gap-3 p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
        <div>
            Menampilkan <b x-text="((userPage - 1) * userLimit) + 1"></b> - 
            <b x-text="Math.min(userPage * userLimit, filteredUsers().length)"></b> 
            dari <b x-text="filteredUsers().length"></b> pengguna
        </div>
        
        <div class="flex items-center gap-2">
            <button @click="prevUserPage()" :disabled="userPage === 1" 
                    class="min-h-[38px] px-3 py-1.5 bg-white border border-slate-300 rounded-md shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-chevron-left"></i> Prev
            </button>
            
            <span class="px-2 font-bold text-slate-700" x-text="'Hal ' + userPage + ' / ' + totalUserPages()"></span>
            
            <button @click="nextUserPage()" :disabled="userPage >= totalUserPages()" 
                    class="min-h-[38px] px-3 py-1.5 bg-white border border-slate-300 rounded-md shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    </div>
  </div>

  <!-- MODAL 1: ADD / EDIT USER -->
  <div class="modal-overlay" x-show="showUserModal" x-transition.opacity>
    <div class="modal-box" style="max-width:500px; height:auto; overflow:visible;" @click.away="showUserModal=false">
        <div class="modal-header">
            <h3 style="margin:0; font-size:18px;" x-text="editingUserId ? 'Edit User' : 'Add New User'"></h3>
            <button @click="showUserModal=false" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
        </div>
        <div style="padding:25px;">
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                <div>
                    <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">Username</label>
                    <input x-model="userForm.username" class="input" :disabled="editingUserId" placeholder="Login username...">
                </div>
                <div>
                    <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">Role</label>
                    <select x-model="userForm.role" @change="if(isQuotaRole(userForm.role) && !userForm.subscription_expires_date) applyPlanDuration()" class="input" style="height:38px;">
                        <template x-for="r in rolesList" :key="'form_role_' + r.slug">
                            <option :value="r.slug" x-text="r.label"></option>
                        </template>
                    </select>
                </div>
            </div>

            <!-- Bagian Kuota Berlangganan jika Role memiliki Kuota (Subscriber Pro / Custom VIP) -->
            <div x-show="isQuotaRole(userForm.role)" style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px 14px; border-radius:8px; margin-bottom:15px;" x-transition>
                <label style="font-weight:bold; font-size:12px; color:#0f172a; display:block; margin-bottom:6px;">
                    <i class="fas fa-crown" style="color:#f59e0b;"></i> Kuota Masa Aktif (<span x-text="getRoleLabel(userForm.role)"></span>)
                </label>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div>
                        <label style="font-size:11px; color:#64748b; display:block; margin-bottom:4px;">Paket Kuota:</label>
                        <select x-model="userForm.subscription_plan" @change="applyPlanDuration()" class="input" style="height:36px; font-size:12px;">
                            <option value="1_bulan">1 Bulan (30 Hari)</option>
                            <option value="3_bulan">3 Bulan (90 Hari)</option>
                            <option value="6_bulan">6 Bulan (180 Hari)</option>
                            <option value="1_tahun">1 Tahun (365 Hari)</option>
                            <option value="custom">Kustom Tanggal Manual</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:11px; color:#64748b; display:block; margin-bottom:4px;">Berlaku Sampai (Tanggal):</label>
                        <input type="date" x-model="userForm.subscription_expires_date" class="input" style="height:36px; font-size:12px;">
                    </div>
                </div>
            </div>

            <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">Email Address</label>
            <input x-model="userForm.email" type="email" class="input" placeholder="user@example.com">

            <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">Full Name</label>
            <input x-model="userForm.name" class="input" placeholder="Nama lengkap...">

            <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px; margin-top:15px;">Password</label>
            <input x-model="userForm.password" type="password" class="input" placeholder="********">
            <small x-show="editingUserId" style="color:#e74c3c; display:block; margin-top:-5px;">*Isi HANYA jika ingin mengganti password.</small>

            <div style="margin-top:25px; display:flex; justify-content:flex-end; gap:10px;">
                <button @click="showUserModal=false" class="btn" style="background:#fff; color:#333; border-color:#ccc;">Cancel</button>
                <button @click="saveUser()" class="btn btn-primary">Simpan User</button>
            </div>
        </div>
    </div>
  </div>

  <!-- MODAL 2: KELOLA & RENAME ROLE PENGGUNA (DYNAMIC CUSTOM ROLES) -->
  <div class="modal-overlay" x-show="showRoleModal" x-transition.opacity>
    <div class="modal-box" style="max-width:600px; height:auto; max-height:90vh; overflow-y:auto;" @click.away="showRoleModal=false">
        <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #e2e8f0;">
            <div>
                <h3 style="margin:0; font-size:16px; font-weight:700; color:#0f172a;">Kelola & Rename Role Pengguna</h3>
                <p style="margin:2px 0 0 0; font-size:11px; color:#64748b;">Ubah nama tampilan (label) role atau tambahkan role baru sesuai kebutuhan organisasi.</p>
            </div>
            <button @click="showRoleModal=false" style="background:none; border:none; font-size:22px; color:#64748b; cursor:pointer;">&times;</button>
        </div>

        <div style="padding:20px;">
            <!-- Daftar Role Saat Ini (Editable Label) -->
            <div style="margin-bottom:18px;">
                <label style="font-weight:700; font-size:12px; color:#334155; display:block; margin-bottom:8px;">Daftar Role Aktif (Ubah Nama Label di Kolom Kanan)</label>
                <div style="border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
                    <table style="width:100%; border-collapse:collapse; font-size:12px;">
                        <thead>
                            <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0; text-align:left; color:#475569;">
                                <th style="padding:8px 10px; width:130px;">Kode Role (Slug)</th>
                                <th style="padding:8px 10px;">Nama Tampilan (Label Role)</th>
                                <th style="padding:8px 10px; text-align:center; width:95px;">Masa Aktif?</th>
                                <th style="padding:8px 10px; text-align:center; width:50px;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template x-for="(r, idx) in rolesList" :key="r.slug">
                                <tr style="border-bottom:1px solid #f1f5f9;">
                                    <td style="padding:8px 10px;">
                                        <code style="background:#f1f5f9; color:#334155; padding:2px 6px; border-radius:4px; font-size:11px;" x-text="r.slug"></code>
                                    </td>
                                    <td style="padding:6px 10px;">
                                        <input type="text" x-model="r.label" class="input" style="margin:0; height:32px; font-size:12px; padding:4px 8px;" placeholder="Nama role...">
                                    </td>
                                    <td style="padding:6px 10px; text-align:center;">
                                        <input type="checkbox" x-model="r.hasQuota" :disabled="r.slug === 'superadmin' || r.slug === 'admin'" title="Aktifkan pengaturan tanggal kedaluwarsa untuk role ini">
                                    </td>
                                    <td style="padding:6px 10px; text-align:center;">
                                        <button type="button" x-show="!r.isSystem && r.slug !== 'superadmin' && r.slug !== 'admin'" 
                                                @click="removeCustomRole(r.slug)" 
                                                style="background:none; border:none; color:#ef4444; cursor:pointer; padding:4px;" title="Hapus Role">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                        <span x-show="r.isSystem || r.slug === 'superadmin' || r.slug === 'admin'" style="font-size:10px; color:#94a3b8;" title="Role Inti Sistem">🔒</span>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Form Tambah Role Kustom Baru -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px;">
                <label style="font-weight:700; font-size:12px; color:#0f172a; display:block; margin-bottom:10px;">
                    <i class="fas fa-plus-circle" style="color:#2563eb;"></i> Tambah Role Kustom Baru
                </label>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px;">
                    <div>
                        <label style="font-size:11px; color:#475569; display:block; margin-bottom:4px;">Nama Tampilan Role</label>
                        <input type="text" x-model="newRoleForm.label" @input="makeRoleSlug()" class="input" style="margin:0; height:34px; font-size:12px;" placeholder="Misal: Redaktur / Member VIP">
                    </div>
                    <div>
                        <label style="font-size:11px; color:#475569; display:block; margin-bottom:4px;">Kode Role (Slug Sistem)</label>
                        <input type="text" x-model="newRoleForm.slug" class="input" style="margin:0; height:34px; font-size:12px;" placeholder="Misal: redaktur / member_vip">
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <label style="display:flex; align-items:center; gap:6px; font-size:12px; color:#334155; cursor:pointer; margin:0;">
                        <input type="checkbox" x-model="newRoleForm.hasQuota">
                        <span>Role ini memiliki batas masa aktif / kuota tanggal berlangganan</span>
                    </label>
                    <button type="button" @click="addCustomRole()" class="btn" style="background:#0f172a; color:#fff; padding:6px 12px; font-size:12px; border-radius:6px;">
                        <i class="fas fa-plus"></i> Tambah ke Daftar
                    </button>
                </div>
            </div>

            <!-- Footer Modal -->
            <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:10px; border-top:1px solid #e2e8f0; padding-top:14px;">
                <button type="button" @click="showRoleModal=false" class="btn" style="background:#fff; color:#333; border:1px solid #cbd5e1;">Batal</button>
                <button type="button" @click="saveRolesConfig()" :disabled="isSavingRoles" class="btn btn-primary" style="display:flex; align-items:center; gap:6px;">
                    <i class="fas" :class="isSavingRoles ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                    <span x-text="isSavingRoles ? 'Menyimpan...' : 'Simpan Perubahan Role'"></span>
                </button>
            </div>
        </div>
    </div>
  </div>
</div>
`;