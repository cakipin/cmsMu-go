export const usersPage = `
<div x-show="view==='users'" x-init="$watch('view', function(v){ if(v==='users' && (!usersList || usersList.length===0)) loadUsers(); })">
  <!-- Header Users Page -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
    <div>
        <h2 class="text-xl font-bold text-slate-800 m-0">Users</h2>
        <p class="text-xs text-slate-500 m-0 mt-0.5">Kelola tim redaksi dan hak akses pengguna.</p>
    </div>
    <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button @click="loadUsers()" class="btn min-h-[38px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300" title="Refresh Data">
            <i class="fas fa-sync" :class="isLoadingUsers ? 'fa-spin' : ''"></i>
        </button>
        <button @click="openAddUser()" class="btn min-h-[38px] px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition-all">
          <i class="fas fa-plus"></i> <span>Add User</span>
        </button>
    </div>
  </div>

  <!-- TOOLBAR: FILTER ROLE & PENCARIAN RESPONSIF -->
  <div class="bg-white p-3 rounded-lg border border-slate-200 mb-4 space-y-2.5 shadow-sm">
    <div class="relative w-full">
      <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
      <input type="text" x-model="searchUser" @input="userPage = 1" placeholder="Cari nama, username, email..." 
             class="input w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-md border border-slate-300 focus:border-blue-500 outline-none">
    </div>

    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 flex-1">
        <label class="text-xs font-semibold text-slate-600 shrink-0">Role:</label>
        <select x-model="filterUserRole" @change="userPage = 1" 
                class="input flex-1 sm:flex-initial py-1.5 px-2.5 text-xs rounded-md border border-slate-300 bg-white">
            <option value="all">Semua Role</option>
            <option value="superadmin">Superadmin</option>
            <option value="admin">Administrator</option>
            <option value="editor">Editor</option>
            <option value="penulis">Penulis</option>
            <option value="subscriber">Subscriber (Biasa)</option>
            <option value="subscriber_pro">⭐ Subscriber Pro</option>
        </select>
      </div>
      <button x-show="searchUser || filterUserRole !== 'all'" @click="searchUser=''; filterUserRole='all'; userPage=1" 
              class="btn py-1.5 px-3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md font-medium active:scale-95 transition-all">
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
                            :style="u.role=='admin' ? 'background:#2271b1; color:#fff;' : (u.role=='editor' ? 'background:#d1e7dd; color:#0f5132;' : (['subscriber_pro', 'pro'].includes(u.role) ? 'background:#fef3c7; color:#92400e; border:1px solid #f59e0b; font-weight:700;' : (['subscriber', 'subscribe'].includes(u.role) ? 'background:#e2e8f0; color:#475569;' : 'background:#fff3cd; color:#664d03;')))"
                            style="padding:4px 8px; border-radius:4px; font-size:11px; text-transform:uppercase; display:inline-flex; align-items:center; gap:4px;">
                          <span x-show="['subscriber_pro', 'pro'].includes(u.role)">⭐</span>
                          <span x-text="['subscriber_pro', 'pro'].includes(u.role) ? 'SUBSCRIBER PRO' : u.role"></span>
                      </span>
                      <template x-if="['subscriber_pro', 'pro'].includes(u.role) && u.subscription_expires_at">
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
                  <button @click="editUser(u)" class="btn-icon" style="color:#f39c12;"><i class="fas fa-pencil-alt"></i></button>
                  <button @click="deleteUser(u.id)" class="btn-icon" style="color:#e74c3c;"><i class="fas fa-trash-alt"></i></button>
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
                    :style="u.role=='admin' ? 'background:#2271b1; color:#fff;' : (u.role=='editor' ? 'background:#d1e7dd; color:#0f5132;' : (['subscriber_pro', 'pro'].includes(u.role) ? 'background:#fef3c7; color:#92400e; border:1px solid #f59e0b; font-weight:700;' : (['subscriber', 'subscribe'].includes(u.role) ? 'background:#e2e8f0; color:#475569;' : 'background:#fff3cd; color:#664d03;')))"
                    style="padding:3px 6px; border-radius:4px; font-size:10px; text-transform:uppercase; display:inline-flex; align-items:center; gap:3px;">
                <span x-show="['subscriber_pro', 'pro'].includes(u.role)">⭐</span>
                <span x-text="['subscriber_pro', 'pro'].includes(u.role) ? 'PRO' : u.role"></span>
              </span>
            </div>
          </div>

          <div class="text-xs text-slate-600 flex flex-wrap items-center justify-between gap-1 pt-0.5">
            <span class="truncate text-slate-500" x-text="u.email || '-'"></span>
            <span class="text-[11px] text-slate-400" x-text="u.created_at ? ('Reg: ' + new Date(u.created_at).toLocaleDateString('id-ID')) : ''"></span>
          </div>

          <template x-if="['subscriber_pro', 'pro'].includes(u.role) && u.subscription_expires_at">
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
                    <select x-model="userForm.role" class="input" style="height:38px;">
                        <option value="admin">Administrator</option>
                        <option value="editor">Editor</option>
                        <option value="penulis">Penulis</option>
                        <option value="subscriber">Subscriber (Biasa)</option>
                        <option value="subscriber_pro">⭐ Subscriber Pro (Berbayar)</option>
                    </select>
                </div>
            </div>

            <!-- Bagian Kuota Berlangganan jika Subscriber Pro -->
            <div x-show="userForm.role === 'subscriber_pro'" style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px 14px; border-radius:8px; margin-bottom:15px;" x-transition>
                <label style="font-weight:bold; font-size:12px; color:#0f172a; display:block; margin-bottom:6px;">
                    <i class="fas fa-crown" style="color:#f59e0b;"></i> Kuota Berlangganan (Subscriber Pro)
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
</div>
`;