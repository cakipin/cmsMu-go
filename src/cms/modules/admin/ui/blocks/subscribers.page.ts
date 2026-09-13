export const subscribersPage = `
<div  x-init="loadSubscribers()">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="margin:0; color:#1e293b; font-size:24px; font-weight:700;">Pelanggan Pro</h2>
        <div style="display:flex; gap:10px;">
            <input x-model="searchSubscriber" @keyup.debounce.500ms="loadSubscribers()" type="text" class="input" placeholder="Cari nama/email..." style="width:250px;">
            <button @click="loadSubscribers()" class="btn" style="background:#059669; color:#fff; border-color:#047857;">
                <i class="fas fa-sync"></i> Refresh
            </button>
        </div>
    </div>

    <!-- TABEL SUBSCRIBERS -->
    <div class="card" style="padding:0; overflow-x:auto;">
        <table class="table" style="width:100%; border-collapse:collapse;">
            <thead>
                <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0; text-align:left;">
                    <th style="padding:15px; font-weight:600; color:#475569;">User</th>
                    <th style="padding:15px; font-weight:600; color:#475569;">Role Saat Ini</th>
                    <th style="padding:15px; font-weight:600; color:#475569;">Paket Kuota</th>
                    <th style="padding:15px; font-weight:600; color:#475569;">Masa Aktif</th>
                    <th style="padding:15px; font-weight:600; color:#475569;">Bukti Transfer</th>
                    <th style="padding:15px; font-weight:600; color:#475569;">Status</th>
                    <th style="padding:15px; font-weight:600; color:#475569; text-align:right;">Aksi</th>
                </tr>
            </thead>
            <tbody>
                <template x-for="sub in subscribersList" :key="(sub.sub_id || 'usr') + '_' + sub.user_id">
                    <tr style="border-bottom:1px solid #e2e8f0; transition:background 0.2s;" class="hover:bg-gray-50">
                        <td style="padding:15px;">
                            <div style="font-weight:600; color:#1e293b;" x-text="sub.name || sub.username"></div>
                            <div style="font-size:12px; color:#64748b;" x-text="sub.email"></div>
                        </td>
                        <td style="padding:15px;">
                            <span style="font-size:11px; font-weight:700; padding:4px 8px; border-radius:4px; text-transform:uppercase;" 
                                :style="['subscriber_pro', 'pro', 'premium'].includes(sub.role) ? 'background:#fef3c7; color:#92400e; border:1px solid #f59e0b;' : 'background:#f1f5f9; color:#475569;'"
                                x-text="['subscriber_pro', 'pro'].includes(sub.role) ? '⭐ SUBSCRIBER PRO' : (sub.role || 'SUBSCRIBER').toUpperCase()"></span>
                        </td>
                        <td style="padding:15px;">
                            <div style="font-weight:700; color:#0f172a;" x-text="sub.plan === '1_tahun' ? '1 Tahun' : (sub.plan === '6_bulan' ? '6 Bulan' : (sub.plan === '3_bulan' ? '3 Bulan' : '1 Bulan'))"></div>
                            <div style="font-size:11px; color:#64748b;" x-text="sub.amount ? ('Rp ' + Number(sub.amount).toLocaleString('id-ID')) : ''"></div>
                        </td>
                        <td style="padding:15px; font-size:13px;">
                            <template x-if="sub.expires_at || sub.user_expires_at">
                                <div style="font-weight:600;" 
                                     :style="new Date(sub.expires_at || sub.user_expires_at) < new Date() ? 'color:#dc2626;' : 'color:#059669;'"
                                     x-text="new Date(sub.expires_at || sub.user_expires_at) < new Date() ? 'Kedaluwarsa' : ('s.d. ' + new Date(sub.expires_at || sub.user_expires_at).toLocaleDateString('id-ID'))"></div>
                            </template>
                            <template x-if="!sub.expires_at && !sub.user_expires_at">
                                <span style="color:#94a3b8; font-size:12px;">-</span>
                            </template>
                        </td>
                        <td style="padding:15px;">
                            <template x-if="sub.payment_proof && sub.payment_proof.startsWith('{')">
                                <span style="display:inline-flex; align-items:center; gap:5px; background:#dcfce7; color:#166534; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700;">
                                    <i class="fas fa-bolt"></i> Otomatis
                                </span>
                            </template>
                            <template x-if="sub.payment_proof && !sub.payment_proof.startsWith('{')">
                                <a :href="sub.payment_proof" target="_blank" style="display:inline-flex; align-items:center; gap:5px; background:#e0f2fe; color:#0369a1; padding:6px 10px; border-radius:6px; font-size:12px; font-weight:600; text-decoration:none;">
                                    <i class="fas fa-file-invoice-dollar"></i> Lihat Bukti
                                </a>
                            </template>
                            <template x-if="!sub.payment_proof">
                                <span style="font-size:12px; color:#94a3b8;">Tidak ada</span>
                            </template>
                        </td>
                        <td style="padding:15px;">
                            <span style="font-size:12px; font-weight:bold; padding:4px 8px; border-radius:4px;"
                                :style="(sub.status === 'approved' || sub.status === 'active') ? 'background:#dcfce7; color:#166534;' : (sub.status === 'rejected' ? 'background:#fee2e2; color:#991b1b;' : 'background:#fef3c7; color:#92400e;')"
                                x-text="sub.status.toUpperCase()"></span>
                        </td>
                        <td style="padding:15px; text-align:right;">
                            <template x-if="sub.status === 'pending'">
                                <div style="display:inline-flex; gap:5px;">
                                    <button @click="approveSub(sub.sub_id)" title="Setujui Sebagai Subscriber Pro" style="background:#10b981; color:#fff; border:none; border-radius:6px; width:30px; height:30px; cursor:pointer;">
                                        <i class="fas fa-check"></i>
                                    </button>
                                    <button @click="rejectSub(sub.sub_id)" title="Tolak" style="background:#ef4444; color:#fff; border:none; border-radius:6px; width:30px; height:30px; cursor:pointer;">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </template>
                            <button @click="deleteSub(sub.sub_id)" title="Hapus" style="background:#f1f5f9; color:#94a3b8; border:none; border-radius:6px; width:30px; height:30px; cursor:pointer; margin-left:5px;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </template>
                <tr x-show="subscribersList.length === 0">
                    <td colspan="7" style="padding:30px; text-align:center; color:#64748b;">Belum ada pendaftar langganan.</td>
                </tr>
            </tbody>
        </table>
    </div>

</div>
`;
