export const commentsPage = `
<template x-if="view === 'comments'">
<div class="exclusive-wrapper" x-data="{
    allComments: [],
    isLoading: false,
    filterStatus: 'all',
    editingComment: null,
    editContent: '',
    
    getToken() {
        return (typeof window !== 'undefined' && window.getCmsToken ? window.getCmsToken() : '') || 
               (typeof document !== 'undefined' && document.cookie.match(/labmu_token=([^;]+)/)?.[1] || '') ||
               (localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '');
    },

    async init() {
        await this.loadComments();
    },

    async loadComments() {
        this.isLoading = true;
        try {
            const headers = { Authorization: 'Bearer ' + this.getToken() };
            const [r1, r2] = await Promise.all([
                fetch('/api/comments/all', { headers }),
                fetch('/api/comments/pending', { headers })
            ]);
            let all = [];
            if (r1.ok) { const d = await r1.json(); if(Array.isArray(d)) all.push(...d); }
            if (r2.ok) { const d = await r2.json(); const ids = new Set(all.map(c=>c.id)); d.forEach(c=>{ if(!ids.has(c.id)) all.push(c); }); }
            all.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
            this.allComments = all;
        } catch(e) { console.error(e); }
        this.isLoading = false;
    },

    get filteredComments() {
        if (this.filterStatus === 'all') return this.allComments;
        return this.allComments.filter(c => c.status === this.filterStatus);
    },

    countByStatus(s) { return this.allComments.filter(c => c.status === s).length; },

    async approve(id) {
        const res = await fetch('/api/comments/' + id + '/approve', { method: 'PUT', headers: { Authorization: 'Bearer ' + this.getToken() } });
        if (res.ok) await this.loadComments();
    },

    async disable(id) {
        const res = await fetch('/api/comments/' + id + '/disable', { method: 'PUT', headers: { Authorization: 'Bearer ' + this.getToken() } });
        if (res.ok) await this.loadComments();
    },

    async deleteComment(id) {
        const confirmed = window.showConfirmDialog
            ? await window.showConfirmDialog({
                title: 'Hapus Komentar',
                message: 'Apakah Anda yakin ingin menghapus komentar ini?',
                type: 'danger',
                confirmText: 'Ya, Hapus'
            })
            : false;
        if (!confirmed) return;
        const res = await fetch('/api/comments/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + this.getToken() } });
        if (res.ok) {
            this.allComments = this.allComments.filter(c => c.id !== id);
            if (window.showToast) window.showToast('Komentar berhasil dihapus', 'success');
        }
    },

    openEdit(c) { this.editingComment = c; this.editContent = c.content; },

    async saveEdit() {
        if (!this.editingComment) return;
        const res = await fetch('/api/comments/' + this.editingComment.id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + this.getToken() },
            body: JSON.stringify({ content: this.editContent })
        });
        if (res.ok) {
            const idx = this.allComments.findIndex(c => c.id === this.editingComment.id);
            if (idx > -1) this.allComments[idx].content = this.editContent;
            this.editingComment = null;
        }
    },

    statusBadge(s) {
        if (s === 'approved') return 'background:#dcfce7;color:#166534;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;';
        if (s === 'pending')  return 'background:#fef9c3;color:#854d0e;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;';
        return 'background:#fee2e2;color:#991b1b;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;';
    },

    statusLabel(s) { return s==='approved'?'Disetujui':s==='pending'?'Menunggu':'Nonaktif'; },
    fmt(d) { return d ? new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '-'; }
}">

    <!-- Header Responsif -->
    <div class="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Komentar</h2>
            <p class="text-slate-500 text-xs sm:text-sm mt-0.5">Kelola semua komentar interaksi dari pembaca</p>
        </div>
        <button @click="loadComments()" class="self-start sm:self-auto flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 min-h-[40px] text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs active:scale-95">
            <i class="fas fa-sync-alt" :class="isLoading ? 'fa-spin text-teal-600' : ''"></i> Refresh
        </button>
    </div>

    <!-- Filter Tabs (Scrollable Horisontal di Mobile) -->
    <div class="flex gap-1.5 sm:gap-2 mb-5 bg-white border border-slate-200 rounded-xl p-1.5 w-full sm:w-fit shadow-xs overflow-x-auto scrollbar-none">
        <button @click="filterStatus='all'" :class="filterStatus==='all'?'bg-teal-600 text-white shadow-xs':'text-slate-600 hover:text-slate-800 hover:bg-slate-50'" class="px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap min-h-[36px]">
            Semua (<span x-text="allComments.length"></span>)
        </button>
        <button @click="filterStatus='approved'" :class="filterStatus==='approved'?'bg-emerald-600 text-white shadow-xs':'text-slate-600 hover:text-slate-800 hover:bg-slate-50'" class="px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap min-h-[36px]">
            Disetujui (<span x-text="countByStatus('approved')"></span>)
        </button>
        <button @click="filterStatus='pending'" :class="filterStatus==='pending'?'bg-amber-500 text-white shadow-xs':'text-slate-600 hover:text-slate-800 hover:bg-slate-50'" class="px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap min-h-[36px]">
            Menunggu (<span x-text="countByStatus('pending')"></span>)
        </button>
        <button @click="filterStatus='disabled'" :class="filterStatus==='disabled'?'bg-rose-500 text-white shadow-xs':'text-slate-600 hover:text-slate-800 hover:bg-slate-50'" class="px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap min-h-[36px]">
            Nonaktif (<span x-text="countByStatus('disabled')"></span>)
        </button>
    </div>

    <!-- Main Container -->
    <div class="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <!-- Loading -->
        <div x-show="isLoading" class="flex items-center justify-center py-16 text-slate-400">
            <i class="fas fa-spinner fa-spin text-2xl mr-3 text-teal-600"></i> Memuat komentar...
        </div>
        
        <!-- Empty State -->
        <div x-show="!isLoading && filteredComments.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400">
            <i class="fas fa-comments text-4xl mb-3 opacity-30 text-teal-600"></i>
            <p class="text-xs sm:text-sm font-medium">Tidak ada komentar ditemukan</p>
        </div>

        <!-- MOBILE VIEW: Vertical Card List (Hidden on md+) -->
        <div x-show="!isLoading && filteredComments.length > 0" class="block md:hidden divide-y divide-slate-100">
            <template x-for="c in filteredComments" :key="c.id">
                <div class="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                    <!-- Penulis & Waktu -->
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex items-center gap-2.5 min-w-0">
                            <img :src="c.user_avatar || ('https://ui-avatars.com/api/?name='+encodeURIComponent(c.user_name||'U')+'&background=random&size=40')" 
                                 class="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0">
                            <div class="min-w-0">
                                <div class="font-bold text-xs text-slate-800 truncate" x-text="c.user_name || 'Anonim'"></div>
                                <div class="text-[10px] text-slate-400 flex items-center gap-1.5">
                                    <span class="capitalize" x-text="c.user_role || 'subscribe'"></span>
                                    <span>&bull;</span>
                                    <span x-text="fmt(c.created_at)"></span>
                                </div>
                            </div>
                        </div>
                        <span :style="statusBadge(c.status)" x-text="statusLabel(c.status)" class="shrink-0"></span>
                    </div>

                    <!-- Target Artikel -->
                    <div class="bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                        <div class="text-[10px] text-slate-400 font-semibold mb-0.5">Artikel:</div>
                        <div class="text-teal-700 font-medium line-clamp-1" x-text="c.post_title || ('#'+c.post_id)"></div>
                    </div>

                    <!-- Isi Komentar Bubble -->
                    <div class="bg-slate-50/80 p-3 rounded-xl border border-slate-100/80">
                        <p class="text-xs text-slate-700 leading-relaxed m-0" x-text="c.content"></p>
                    </div>

                    <!-- Action Buttons Mobile (Min 40px Touch Target) -->
                    <div class="grid grid-cols-3 gap-2 pt-1">
                        <!-- Edit -->
                        <button @click="openEdit(c)" class="min-h-[40px] px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-0 cursor-pointer active:scale-95">
                            <i class="fas fa-edit text-xs"></i> Edit
                        </button>
                        
                        <!-- Approve / Disable Toggle -->
                        <button x-show="c.status !== 'approved'" @click="approve(c.id)" class="min-h-[40px] px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200 cursor-pointer active:scale-95">
                            <i class="fas fa-check text-xs"></i> Setujui
                        </button>
                        <button x-show="c.status === 'approved'" @click="disable(c.id)" class="min-h-[40px] px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-amber-200 cursor-pointer active:scale-95">
                            <i class="fas fa-ban text-xs"></i> Nonaktif
                        </button>

                        <!-- Delete -->
                        <button @click="deleteComment(c.id)" class="min-h-[40px] px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-rose-200 cursor-pointer active:scale-95">
                            <i class="fas fa-trash text-xs"></i> Hapus
                        </button>
                    </div>
                </div>
            </template>
        </div>

        <!-- DESKTOP VIEW: Table (Hidden on mobile) -->
        <div x-show="!isLoading && filteredComments.length > 0" class="hidden md:block overflow-x-auto">
            <table class="w-full border-collapse">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-200">
                        <th class="text-left py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Penulis</th>
                        <th class="text-left py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Komentar</th>
                        <th class="text-left py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Artikel</th>
                        <th class="text-left py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th class="text-left py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Waktu</th>
                        <th class="text-center py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <template x-for="c in filteredComments" :key="c.id">
                        <tr class="hover:bg-slate-50/80 transition-colors">
                            <!-- Author -->
                            <td class="py-3.5 px-4 whitespace-nowrap">
                                <div class="flex items-center gap-2.5">
                                    <img :src="c.user_avatar || ('https://ui-avatars.com/api/?name='+encodeURIComponent(c.user_name||'U')+'&background=random&size=40')" 
                                         class="w-9 h-9 rounded-full object-cover border-2 border-slate-200 shrink-0">
                                    <div>
                                        <div class="font-bold text-xs text-slate-800" x-text="c.user_name || 'Anonim'"></div>
                                        <div class="text-[11px] text-slate-400" x-text="c.user_role || 'subscribe'"></div>
                                    </div>
                                </div>
                            </td>
                            <!-- Content -->
                            <td class="py-3.5 px-4 max-w-[280px]">
                                <p class="text-xs text-slate-700 leading-relaxed line-clamp-3 m-0" x-text="c.content"></p>
                            </td>
                            <!-- Post -->
                            <td class="py-3.5 px-4 max-w-[180px]">
                                <span class="text-xs text-teal-700 font-semibold line-clamp-2" x-text="c.post_title || ('#'+c.post_id)"></span>
                            </td>
                            <!-- Status -->
                            <td class="py-3.5 px-4 whitespace-nowrap">
                                <span :style="statusBadge(c.status)" x-text="statusLabel(c.status)"></span>
                            </td>
                            <!-- Date -->
                            <td class="py-3.5 px-4 whitespace-nowrap">
                                <span class="text-xs text-slate-400" x-text="fmt(c.created_at)"></span>
                            </td>
                            <!-- Actions -->
                            <td class="py-3.5 px-4 text-center">
                                <div class="flex gap-1.5 justify-center items-center">
                                    <!-- Edit -->
                                    <button @click="openEdit(c)" title="Edit"
                                        class="bg-slate-100 hover:bg-slate-200 text-slate-600 border-0 rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer transition-colors">
                                        <i class="fas fa-edit text-xs"></i>
                                    </button>
                                    <!-- Approve (if not approved) -->
                                    <button x-show="c.status !== 'approved'" @click="approve(c.id)" title="Setujui"
                                        class="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer transition-colors">
                                        <i class="fas fa-check text-xs"></i>
                                    </button>
                                    <!-- Disable (if approved) -->
                                    <button x-show="c.status === 'approved'" @click="disable(c.id)" title="Nonaktifkan"
                                        class="bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer transition-colors">
                                        <i class="fas fa-ban text-xs"></i>
                                    </button>
                                    <!-- Delete -->
                                    <button @click="deleteComment(c.id)" title="Hapus"
                                        class="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer transition-colors">
                                        <i class="fas fa-trash text-xs"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Edit Modal (Mobile Friendly) -->
    <div x-show="editingComment" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4" @click.self="editingComment=null" x-transition.opacity>
        <div class="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4" x-show="editingComment">
            <div class="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 class="text-base font-bold text-slate-800 m-0">Edit Komentar</h3>
                <button @click="editingComment=null" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center border-0 cursor-pointer text-sm">&times;</button>
            </div>
            <template x-if="editingComment">
                <div class="space-y-4">
                    <div class="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                        <b class="text-slate-800" x-text="editingComment.user_name"></b> &bull; <span x-text="fmt(editingComment.created_at)"></span>
                    </div>
                    <textarea x-model="editContent" 
                        class="w-full min-h-[120px] p-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-700 resize-y"
                        placeholder="Isi komentar..."></textarea>
                    <div class="flex gap-2.5 justify-end pt-2">
                        <button @click="editingComment=null" class="min-h-[40px] px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs cursor-pointer border-0 transition-colors">Batal</button>
                        <button @click="saveEdit()" class="min-h-[40px] px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs cursor-pointer border-0 shadow-xs transition-colors">Simpan Perubahan</button>
                    </div>
                </div>
            </template>
        </div>
    </div>

</div>
</template>
`;

