export const profilePage = `
<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <h2 class="text-xl font-bold text-slate-800">Profil Saya</h2>
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Card Profil (Kiri) -->
    <div class="md:col-span-1">
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden text-center p-6 flex flex-col items-center">
            <div class="h-32 w-32 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold shadow-md border-4 border-white overflow-hidden mb-4 relative group">
                <template x-if="userAvatar">
                    <img :src="userAvatar" alt="Avatar" class="h-full w-full object-cover">
                </template>
                <template x-if="!userAvatar">
                    <i class="fas fa-user-astronaut text-4xl"></i>
                </template>
                
                <!-- Overlay (Visual Feedback, tidak bisa diganti di sini jika SSO) -->
                <div class="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                    <i class="fas fa-camera text-white text-xl"></i>
                </div>
            </div>
            
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
                            alert('Password saat ini dan password baru harus diisi.');
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
                                alert('✅ Password berhasil diubah!');
                                this.pwdForm.currentPassword = '';
                                this.pwdForm.newPassword = '';
                            } else {
                                alert('❌ Gagal: ' + (data.error || 'Terjadi kesalahan'));
                            }
                        } catch (e) {
                            alert('❌ Gagal terhubung ke server');
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
