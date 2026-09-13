export const commentsPage = `
<template x-if="view === 'comments'">
<div class="exclusive-wrapper" x-data="{
    allComments: [],
    isLoading: false,
    filterStatus: 'all',
    editingComment: null,
    editContent: '',
    
    async init() {
        await this.loadComments();
    },

    async loadComments() {
        this.isLoading = true;
        try {
            const headers = { Authorization: 'Bearer ' + (localStorage.getItem('labmu_token') || '') };
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
        const res = await fetch('/api/comments/' + id + '/approve', { method: 'PUT', headers: { Authorization: 'Bearer ' + (localStorage.getItem('labmu_token')||'') } });
        if (res.ok) await this.loadComments();
    },

    async disable(id) {
        const res = await fetch('/api/comments/' + id + '/disable', { method: 'PUT', headers: { Authorization: 'Bearer ' + (localStorage.getItem('labmu_token')||'') } });
        if (res.ok) await this.loadComments();
    },

    async deleteComment(id) {
        if (!confirm('Yakin ingin menghapus komentar ini?')) return;
        const res = await fetch('/api/comments/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + (localStorage.getItem('labmu_token')||'') } });
        if (res.ok) this.allComments = this.allComments.filter(c => c.id !== id);
    },

    openEdit(c) { this.editingComment = c; this.editContent = c.content; },

    async saveEdit() {
        if (!this.editingComment) return;
        const res = await fetch('/api/comments/' + this.editingComment.id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (localStorage.getItem('labmu_token')||'') },
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

    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
        <div>
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">Komentar</h2>
            <p class="text-slate-500 text-sm mt-1">Kelola semua komentar dari pembaca</p>
        </div>
        <button @click="loadComments()" class="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <i class="fas fa-sync-alt" :class="isLoading ? 'fa-spin text-primary' : ''"></i> Refresh
        </button>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-2 mb-5 bg-white border border-slate-200 rounded-xl p-1.5 w-fit shadow-sm">
        <button @click="filterStatus='all'" :class="filterStatus==='all'?'bg-primary text-white shadow':'text-slate-500 hover:text-slate-700'" class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all">
            Semua (<span x-text="allComments.length"></span>)
        </button>
        <button @click="filterStatus='approved'" :class="filterStatus==='approved'?'bg-emerald-500 text-white shadow':'text-slate-500 hover:text-slate-700'" class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all">
            Disetujui (<span x-text="countByStatus('approved')"></span>)
        </button>
        <button @click="filterStatus='pending'" :class="filterStatus==='pending'?'bg-amber-500 text-white shadow':'text-slate-500 hover:text-slate-700'" class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all">
            Menunggu (<span x-text="countByStatus('pending')"></span>)
        </button>
        <button @click="filterStatus='disabled'" :class="filterStatus==='disabled'?'bg-rose-500 text-white shadow':'text-slate-500 hover:text-slate-700'" class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all">
            Nonaktif (<span x-text="countByStatus('disabled')"></span>)
        </button>
    </div>

    <!-- Table Card -->
    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <!-- Loading -->
        <div x-show="isLoading" class="flex items-center justify-center py-16 text-slate-400">
            <i class="fas fa-spinner fa-spin text-2xl mr-3"></i> Memuat komentar...
        </div>
        <!-- Empty -->
        <div x-show="!isLoading && filteredComments.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400">
            <i class="fas fa-comments text-4xl mb-4 opacity-30"></i>
            <p class="text-sm font-medium">Tidak ada komentar ditemukan</p>
        </div>
        <!-- Table -->
        <div x-show="!isLoading && filteredComments.length > 0" style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="background:#f8fafc;border-bottom:1px solid #e2e8f0;">
                        <th style="text-align:left;padding:12px 16px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;">Penulis</th>
                        <th style="text-align:left;padding:12px 16px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">Komentar</th>
                        <th style="text-align:left;padding:12px 16px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;">Artikel</th>
                        <th style="text-align:left;padding:12px 16px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">Status</th>
                        <th style="text-align:left;padding:12px 16px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;">Waktu</th>
                        <th style="text-align:center;padding:12px 16px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <template x-for="c in filteredComments" :key="c.id">
                        <tr style="border-bottom:1px solid #f1f5f9;" class="hover:bg-slate-50 transition-colors">
                            <!-- Author -->
                            <td style="padding:14px 16px;white-space:nowrap;">
                                <div style="display:flex;align-items:center;gap:10px;">
                                    <img :src="c.user_avatar || ('https://ui-avatars.com/api/?name='+encodeURIComponent(c.user_name||'U')+'&background=random&size=40')" 
                                         style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #e2e8f0;flex-shrink:0;">
                                    <div>
                                        <div style="font-weight:600;font-size:13px;color:#1e293b;" x-text="c.user_name || 'Anonim'"></div>
                                        <div style="font-size:11px;color:#94a3b8;" x-text="c.user_role || 'subscribe'"></div>
                                    </div>
                                </div>
                            </td>
                            <!-- Content -->
                            <td style="padding:14px 16px;max-width:300px;">
                                <p style="font-size:13px;color:#374151;line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;" x-text="c.content"></p>
                            </td>
                            <!-- Post -->
                            <td style="padding:14px 16px;max-width:180px;">
                                <span style="font-size:12px;color:#1e56b0;font-weight:500;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;" x-text="c.post_title || ('#'+c.post_id)"></span>
                            </td>
                            <!-- Status -->
                            <td style="padding:14px 16px;white-space:nowrap;">
                                <span :style="statusBadge(c.status)" x-text="statusLabel(c.status)"></span>
                            </td>
                            <!-- Date -->
                            <td style="padding:14px 16px;white-space:nowrap;">
                                <span style="font-size:12px;color:#94a3b8;" x-text="fmt(c.created_at)"></span>
                            </td>
                            <!-- Actions -->
                            <td style="padding:14px 16px;text-align:center;">
                                <div style="display:flex;gap:6px;justify-content:center;align-items:center;">
                                    <!-- Edit -->
                                    <button @click="openEdit(c)" title="Edit"
                                        style="background:#f1f5f9;color:#475569;border:none;border-radius:6px;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;" 
                                        onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
                                        <i class="fas fa-edit" style="font-size:11px;"></i>
                                    </button>
                                    <!-- Approve (if not approved) -->
                                    <button x-show="c.status !== 'approved'" @click="approve(c.id)" title="Setujui"
                                        style="background:#dcfce7;color:#16a34a;border:none;border-radius:6px;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;"
                                        onmouseover="this.style.background='#bbf7d0'" onmouseout="this.style.background='#dcfce7'">
                                        <i class="fas fa-check" style="font-size:11px;"></i>
                                    </button>
                                    <!-- Disable (if approved) -->
                                    <button x-show="c.status === 'approved'" @click="disable(c.id)" title="Nonaktifkan"
                                        style="background:#fef9c3;color:#ca8a04;border:none;border-radius:6px;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;"
                                        onmouseover="this.style.background='#fde68a'" onmouseout="this.style.background='#fef9c3'">
                                        <i class="fas fa-ban" style="font-size:11px;"></i>
                                    </button>
                                    <!-- Delete -->
                                    <button @click="deleteComment(c.id)" title="Hapus"
                                        style="background:#fee2e2;color:#dc2626;border:none;border-radius:6px;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;"
                                        onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                                        <i class="fas fa-trash" style="font-size:11px;"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Edit Modal -->
    <div x-show="editingComment" style="position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.5);backdrop-filter:blur(4px);" @click.self="editingComment=null" x-transition>
        <div style="background:white;border-radius:16px;width:100%;max-width:520px;padding:24px;box-shadow:0 25px 60px rgba(0,0,0,.2);margin:16px;" x-show="editingComment">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="font-size:16px;font-weight:700;color:#1e293b;">Edit Komentar</h3>
                <button @click="editingComment=null" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:20px;line-height:1;">&times;</button>
            </div>
            <template x-if="editingComment">
                <div>
                    <div style="margin-bottom:12px;padding:10px 12px;background:#f8fafc;border-radius:8px;font-size:13px;color:#475569;">
                        <b x-text="editingComment.user_name"></b> &bull; <span x-text="fmt(editingComment.created_at)"></span>
                    </div>
                    <textarea x-model="editContent" 
                        style="width:100%;min-height:120px;padding:12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;resize:vertical;font-family:inherit;margin-bottom:16px;box-sizing:border-box;outline:none;"
                        onfocus="this.style.borderColor='#1e56b0'" onblur="this.style.borderColor='#e2e8f0'"
                        placeholder="Isi komentar..."></textarea>
                    <div style="display:flex;gap:10px;justify-content:flex-end;">
                        <button @click="editingComment=null" style="background:#f1f5f9;color:#64748b;border:none;border-radius:8px;padding:9px 18px;font-weight:600;cursor:pointer;">Batal</button>
                        <button @click="saveEdit()" style="background:#1e56b0;color:white;border:none;border-radius:8px;padding:9px 18px;font-weight:600;cursor:pointer;">Simpan Perubahan</button>
                    </div>
                </div>
            </template>
        </div>
    </div>

</div>
</template>
`;
