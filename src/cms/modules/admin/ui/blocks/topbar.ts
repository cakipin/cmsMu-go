export const topbarBlock = `
<header class="topbar">
  <div style="display:flex; align-items:center; gap:15px;">
    <button @click="sidebarOpen = !sidebarOpen" class="btn-icon"><i class="fas fa-bars"></i></button>
    <b x-text="getPageTitle()" style="font-size:16px;"></b>
    
    <a href="/" target="_blank" class="btn" style="padding: 4px 10px; font-size:11px; display:flex; align-items:center; gap:5px; text-decoration:none; background:#fff; color:#2271b1; border-color:#2271b1;">
      <i class="fas fa-home"></i> View Site
    </a>
  </div>
  
  <div style="display:flex; align-items:center; gap:20px;">
    <!-- Notifications Bell -->
    <div x-data="{
        notifs: [],
        show: false,
        loading: false,
        async fetchNotifs() {
            try {
                let items = [];
                const token = localStorage.getItem('labmu_token') || '';
                const headers = { Authorization: 'Bearer ' + token };
                
                // 1. Fetch system notifs (Login members, etc)
                const res = await fetch('/api/notifications', { headers });
                if (res.ok) {
                    const data = await res.json();
                    if(data.data) items.push(...data.data.map(n => ({...n, kind: 'system'})));
                }
                // 2. Fetch pending comments
                const res2 = await fetch('/api/comments/pending', { headers });
                if (res2.ok) {
                    const pending = await res2.json();
                    items.push(...pending.map(c => ({
                        id: c.id, 
                        title: 'Komentar Tertunda', 
                        message: c.user_name + ' berkomentar pada &quot;' + c.post_title + '&quot;:<br><i>' + c.content.substring(0,50) + (c.content.length>50?'...':'') + '</i>', 
                        created_at: c.created_at, 
                        kind: 'comment'
                    })));
                }
                // Sort by date descending
                items.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
                this.notifs = items;
            } catch(e) {}
        },
        async markRead(id) {
            const token = localStorage.getItem('labmu_token') || '';
            await fetch('/api/notifications/read', { 
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }, 
                body: JSON.stringify({id}) 
            });
            await this.fetchNotifs();
        },
        async handleComment(id, action) {
            this.loading = true;
            const token = localStorage.getItem('labmu_token') || '';
            const headers = { Authorization: 'Bearer ' + token };
            if(action === 'approve') {
                await fetch('/api/comments/' + id + '/approve', { method: 'PUT', headers });
            } else {
                await fetch('/api/comments/' + id, { method: 'DELETE', headers });
            }
            await this.fetchNotifs();
            this.loading = false;
        },
        init() {
            this.fetchNotifs();
            setInterval(() => this.fetchNotifs(), 30000);
        }
    }" style="position:relative;">
        <button @click="show = !show" style="background:none; border:none; cursor:pointer; position:relative; color:#64748b;">
            <i class="fas fa-bell fa-lg"></i>
            <span x-show="notifs.length > 0" x-text="notifs.length" style="position:absolute; top:-8px; right:-8px; background:#ef4444; color:white; font-size:10px; font-weight:bold; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center;"></span>
        </button>
        
        <div x-show="show" @click.away="show = false" style="position:absolute; right:0; top:30px; width:340px; background:white; border:1px solid #e2e8f0; border-radius:8px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); z-index:50;">
            <div style="padding:12px; border-bottom:1px solid #e2e8f0; font-weight:bold; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:14px; color:#1e293b;">Notifikasi</span>
                <button @click="markRead(null)" style="font-size:11px; color:#3b82f6; background:none; border:none; cursor:pointer;">Tandai baca</button>
            </div>
            <div style="max-height:300px; overflow-y:auto; overflow-x:hidden;" class="no-scrollbar">
                <template x-if="notifs.length === 0">
                    <div style="padding:20px; text-align:center; color:#94a3b8; font-size:13px;">Tidak ada notifikasi baru</div>
                </template>
                <template x-for="n in notifs" :key="n.kind + '-' + n.id">
                    <div style="padding:12px; border-bottom:1px solid #f1f5f9; display:flex; flex-direction:column; gap:8px;" :style="n.kind==='comment' ? 'background:#fffbeb;' : ''">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                            <div style="flex:1;">
                                <div style="font-weight:600; font-size:13px; margin-bottom:4px; color:#1e293b;" x-text="n.title"></div>
                                <div style="font-size:12px; color:#475569; line-height:1.4;" x-html="n.message"></div>
                                <div style="font-size:10px; color:#94a3b8; margin-top:6px;" x-text="new Date(n.created_at).toLocaleString('id-ID')"></div>
                            </div>
                            <template x-if="n.kind === 'system'">
                                <button @click="markRead(n.id)" style="background:none; border:none; color:#cbd5e1; cursor:pointer; height:fit-content; margin-top:4px;" title="Tandai dibaca"><i class="fas fa-check-circle"></i></button>
                            </template>
                        </div>
                        <template x-if="n.kind === 'comment'">
                            <div style="display:flex; gap:8px; margin-top:4px;">
                                <button @click="handleComment(n.id, 'approve')" :disabled="loading" style="background:#10b981; color:white; border:none; border-radius:4px; padding:4px 8px; font-size:11px; font-weight:600; cursor:pointer;">Setujui</button>
                                <button @click="handleComment(n.id, 'reject')" :disabled="loading" style="background:#ef4444; color:white; border:none; border-radius:4px; padding:4px 8px; font-size:11px; font-weight:600; cursor:pointer;">Tolak</button>
                            </div>
                        </template>
                    </div>
                </template>
            </div>
        </div>
    </div>

    <div style="text-align:right;">
        <div style="font-weight:bold; font-size:12px;" x-text="userRole === 'admin' ? 'Admin' : 'Editor'">Admin</div>
        <div style="font-size:10px; color:#888;">Online</div>
    </div>
    <i class="fas fa-user-circle fa-2x" style="color:#cbd5e1;"></i>
  </div>
</header>
`;