export const profilePage = `
<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <h2 class="text-xl font-bold text-slate-800">Profil Saya</h2>
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Card Profil (Kiri) -->
    <div class="md:col-span-1" x-data="{
        isUploadingAvatar: false,
        async uploadAvatar(event) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;

            // Validasi ukuran client-side: maks 2MB
            if (file.size > 2 * 1024 * 1024) {
                if (window.showToast) window.showToast('Ukuran foto profil maksimal 2MB!', 'warning');
                event.target.value = '';
                return;
            }

            this.isUploadingAvatar = true;
            try {
                const formData = new FormData();
                formData.append('avatar', file);

                const token = (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') ||
                              (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '') ||
                              (localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '');

                const res = await fetch('/api/users/profile-avatar', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    body: formData
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    // Update reactive Alpine state (mengubah avatar di profil, topbar, dan sidebar sekaligus)
                    userAvatar = data.url;
                    if (data.token) {
                        localStorage.setItem('labmu_token', data.token);
                        document.cookie = 'labmu_token=' + encodeURIComponent(data.token) + '; path=/; max-age=2592000; SameSite=Lax';
                    }
                    if (window.showToast) window.showToast(data.message || 'Foto profil berhasil diperbarui!', 'success');
                } else {
                    if (window.showToast) window.showToast('Gagal: ' + (data.error || 'Terjadi kesalahan saat unggah'), 'error');
                }
            } catch (err: any) {
                if (window.showToast) window.showToast('Gagal mengunggah: ' + err.message, 'error');
            } finally {
                this.isUploadingAvatar = false;
                event.target.value = '';
            }
        }
    }">
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden text-center p-6 flex flex-col items-center">
            <!-- Hidden file input -->
            <input type="file" x-ref="avatarInput" @change="uploadAvatar($event)" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden">

            <div @click="!isUploadingAvatar && $refs.avatarInput.click()" 
                 :class="{ 'opacity-60 cursor-wait': isUploadingAvatar, 'cursor-pointer hover:ring-4 hover:ring-primary/20': !isUploadingAvatar }"
                 class="h-32 w-32 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold shadow-md border-4 border-white overflow-hidden mb-3 relative group transition-all"
                 title="Klik untuk ganti foto profil">
                
                <template x-if="userAvatar">
                    <img :src="userAvatar" alt="Avatar" class="h-full w-full object-cover">
                </template>
                <template x-if="!userAvatar">
                    <i class="fas fa-user-astronaut text-4xl"></i>
                </template>
                
                <!-- Overlay Hover Feedback -->
                <div x-show="!isUploadingAvatar" class="absolute inset-0 bg-black/50 hidden group-hover:flex flex-col items-center justify-center transition-all opacity-0 group-hover:opacity-100 text-white">
                    <i class="fas fa-camera text-xl mb-1"></i>
                    <span class="text-[10px] font-semibold tracking-wider uppercase">Ganti Foto</span>
                </div>

                <!-- Loading Spinner Overlay -->
                <div x-show="isUploadingAvatar" class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white" style="display: none;">
                    <i class="fas fa-spinner fa-spin text-2xl mb-1"></i>
                    <span class="text-[10px] font-semibold uppercase">Mengunggah...</span>
                </div>
            </div>

            <!-- Tombol Aksi Tambahan di Bawah Avatar -->
            <button type="button" 
                    @click="!isUploadingAvatar && $refs.avatarInput.click()" 
                    :disabled="isUploadingAvatar"
                    class="mb-4 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-primary hover:text-primary-dark hover:bg-primary/5 rounded-full transition-colors border border-primary/20">
                <i class="fas" :class="isUploadingAvatar ? 'fa-spinner fa-spin' : 'fa-camera'"></i>
                <span x-text="isUploadingAvatar ? 'Mengunggah...' : 'Ganti Foto Profil'"></span>
            </button>
            
            <h3 class="text-xl font-bold text-slate-800" x-text="userName || (userRole === 'admin' ? 'Administrator' : 'Pengelola')"></h3>
            <p class="text-sm font-medium text-slate-500 mb-4" x-text="userEmail || 'Tidak ada email'"></p>
            
            <span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold capitalize" x-text="userRole"></span>
        </div>
    </div>
    
    <!-- Detail (Kanan) -->
    <div class="md:col-span-2">
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100">
                <h4 class="text-lg font-semibold text-slate-800">Informasi Pribadi</h4>
                <p class="text-xs text-slate-500 mt-1">Data dasar ini disinkronisasikan secara otomatis dari Muhammadiyah ID.</p>
            </div>
            <div class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                    <input type="text" readonly :value="userName" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 focus:outline-none cursor-not-allowed">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" readonly :value="userEmail" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 focus:outline-none cursor-not-allowed">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Peran (Role)</label>
                    <input type="text" readonly :value="userRole" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 focus:outline-none cursor-not-allowed capitalize">
                </div>
                
                <div class="pt-4 border-t border-slate-100 mt-6" x-data="{ 
                    pwdForm: { currentPassword: '', newPassword: '' }, 
                    isSavingPwd: false,
                    async changePassword() {
                        if (!this.pwdForm.currentPassword || !this.pwdForm.newPassword) {
                            if (window.showToast) window.showToast('Password saat ini dan password baru harus diisi.', 'warning');
                            return;
                        }
                        this.isSavingPwd = true;
                        try {
                            const res = await fetch('/api/users/profile-password', {
                                method: 'PUT',
                                headers: { 
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + ((typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '') || (localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || ''))
                                },
                                body: JSON.stringify(this.pwdForm)
                            });
                            const data = await res.json();
                            if (res.ok && data.success) {
                                if (window.showToast) window.showToast('Password berhasil diubah!', 'success');
                                this.pwdForm.currentPassword = '';
                                this.pwdForm.newPassword = '';
                            } else {
                                if (window.showToast) window.showToast('Gagal: ' + (data.error || 'Terjadi kesalahan'), 'error');
                            }
                        } catch (e) {
                            if (window.showToast) window.showToast('Gagal terhubung ke server', 'error');
                        } finally {
                            this.isSavingPwd = false;
                        }
                    }
                }">
                    <h4 class="text-md font-semibold text-slate-800 mb-3"><i class="fas fa-lock mr-2 text-slate-400"></i>Ganti Password</h4>
                    <p class="text-xs text-slate-500 mb-4">Ubah password Anda untuk login manual. (Catatan: Jika Anda menggunakan SSO Muhammadiyah ID, login tetap menggunakan password SSO Anda).</p>
                    
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Password Saat Ini</label>
                            <input type="password" x-model="pwdForm.currentPassword" class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Masukkan password saat ini">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
                            <input type="password" x-model="pwdForm.newPassword" class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Masukkan password baru">
                        </div>
                        <button @click="changePassword()" :disabled="isSavingPwd" class="mt-2 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors flex items-center gap-2">
                            <i class="fas fa-spinner fa-spin" x-show="isSavingPwd"></i>
                            <span x-text="isSavingPwd ? 'Menyimpan...' : 'Update Password'"></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;
