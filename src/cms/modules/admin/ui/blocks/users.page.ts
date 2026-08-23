export const usersPage = `
<div x-show="view==='users'">
  <div style="display:flex; justify-content:space-between; margin-bottom:20px; align-items:center;">
    <div>
        <h2 style="margin:0;">Users</h2>
        <p style="margin:5px 0 0 0; color:#666; font-size:13px;">Kelola tim dan hak akses.</p>
    </div>
    <button @click="openAddUser()" class="btn"><i class="fas fa-plus"></i> Add New User</button>
  </div>

  <div class="card" style="padding:0; overflow:hidden;">
    <table class="wp-table" style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="background:#f8f9fa; border-bottom:2px solid #ddd;">
          <th style="text-align:left; padding:12px;">User</th>
          <th style="text-align:left;">Email</th> <th style="text-align:left;">Role</th>
          <th style="text-align:left;">Registered</th>
          <th width="100" style="text-align:center;">Action</th>
        </tr>
      </thead>
      <tbody>
        <template x-for="u in usersList">
          <tr style="border-bottom:1px solid #eee;">

            <td style="padding:12px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:32px; height:32px; background:#2271b1; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:14px;">
                        <span x-text="u.username.charAt(0).toUpperCase()"></span>
                    </div>
                    <div>
                        <div style="font-weight:bold; color:#2271b1;" x-text="u.username"></div>
                        <div style="font-size:11px; color:#666;" x-text="u.name"></div>
                    </div>
                </div>
            </td>

            <td style="color:#555;">
                <span x-text="u.email || '-'"></span>
            </td>

            <td>
                <span class="badge"
                      :style="u.role=='administrator' ? 'background:#2271b1; color:#fff' : (u.role=='editor' ? 'background:#d1e7dd; color:#0f5132' : (u.role=='subscriber' ? 'background:#e2e8f0; color:#475569' : 'background:#fff3cd; color:#664d03'))"
                      style="padding:4px 8px; border-radius:4px; font-size:11px; text-transform:capitalize;"
                      x-text="u.role">
                </span>
            </td>

            <td style="font-size:12px; color:#888;">
                <span x-text="u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'"></span>
            </td>

            <td style="text-align:center;">
              <div style="display:flex; justify-content:center; gap:5px;">
                <button @click="editUser(u)" class="btn-icon" style="color:#f39c12;"><i class="fas fa-pencil-alt"></i></button>
                <button @click="deleteUser(u.id)" class="btn-icon" style="color:#e74c3c;"><i class="fas fa-trash-alt"></i></button>
              </div>
            </td>
          </tr>
        </template>
        <tr x-show="usersList.length===0 && !isLoadingUsers">
            <td colspan="5" style="text-align:center; padding:30px; color:#999;">Belum ada user.</td>
        </tr>
      </tbody>
    </table>
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
                        <option value="subscriber">Subscriber</option>
                    </select>
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