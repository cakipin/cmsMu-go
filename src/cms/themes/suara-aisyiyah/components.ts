import type { ThemeContext } from '../types';
import { escapeHtml, renderNumberedPagination } from './utils';
export function renderAgen(this: any, ctx: any) {
    const title = "Daftar Agen & Perwakilan Suara 'Aisyiyah";
    const agens = ctx.data || [];
    const search = ctx.search || '';
    
    let content = `
      <main class="container sa-style-163" role="main" >
        <div class="sa-style-164">
          <h1 class="sa-style-165">Daftar Agen & Perwakilan Suara 'Aisyiyah</h1>
          <p class="sa-style-166">Temukan agen majalah Suara 'Aisyiyah resmi di wilayah Anda.</p>
        </div>
        
        <!-- Form Pencarian -->
        <div class="sa-style-167">
            <form action="/agen" method="GET" class="sa-style-168">
                <input type="text" name="q" value="${escapeHtml(search)}" placeholder="Cari nama, wilayah, atau alamat..." class="sa-style-169">
                <button type="submit" class="sa-style-170">Cari</button>
            </form>
        </div>`;

    if (!agens.length) {
        content += `
        <div class="sa-style-171">
            <h3 class="sa-style-172">Tidak ada agen ditemukan.</h3>
        </div>`;
    } else {
        content += `<div class="sa-style-173">`;
        
        agens.forEach((a:any) => {
            let buttons = '';
            const phoneSource = a.whatsapp || a.phone;
            if (phoneSource) {
                const rawPhones = String(phoneSource).split(/[,\/\n]/);
                for (let p of rawPhones) {
                    p = p.trim();
                    if (!p) continue;
                    const cleanNum = p.replace(/\D/g, '');
                    if (cleanNum.length >= 9) {
                        let waNum = cleanNum;
                        if (waNum.startsWith('0')) waNum = '62' + waNum.substring(1);
                        buttons += `
                        <a href="https://wa.me/${waNum}" target="_blank" rel="noopener" class="sa-style-174">
                            <i class="fab fa-whatsapp sa-style-175" ></i> Hubungi Agen
                        </a>`;
                        break;
                    }
                }
            }
            
            content += `
            <div class="sa-style-176">
                <div>
                    <div class="sa-style-177">
                        <div class="sa-style-178">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div>
                            <h3 class="sa-style-179">${escapeHtml(a.name)}</h3>
                            ${a.area ? `<span class="sa-style-180">
                                <i class="fas fa-map text-sm sa-style-115" ></i> ${escapeHtml(a.area)}
                            </span>` : ''}
                        </div>
                    </div>
                    
                    <div class="sa-style-181">
                        ${a.phone ? `<p class="sa-style-182">
                            <i class="fas fa-phone-alt w-5 text-center text-slate-400 mr-2"></i> ${escapeHtml(a.phone)}
                        </p>` : ''}
                        ${a.whatsapp ? `<p class="sa-style-182">
                            <i class="fab fa-whatsapp w-5 text-center text-slate-400 mr-2"></i> ${escapeHtml(a.whatsapp)}
                        </p>` : ''}
                        ${a.address ? `<p class="sa-style-183">
                            <i class="fas fa-home w-5 text-center text-slate-400 mr-2 mt-1 flex-shrink-0"></i> <span>${escapeHtml(a.address)}</span>
                        </p>` : ''}
                    </div>
                </div>
                
                ${buttons || a.map_link ? `<div class="sa-style-184">
                    ${a.map_link ? `<a href="${escapeHtml(a.map_link)}" target="_blank" class="sa-style-185">
                        <i class="fas fa-map-marked-alt sa-style-175" ></i> Buka Peta
                    </a>` : ''}
                    ${buttons}
                </div>` : ''}
            </div>`;
        });
        
        content += `</div>`;
    }

    if (ctx.pagination && ctx.pagination.totalPages > 1) {
        content += renderNumberedPagination(ctx.pagination);
    }

    content += `</main>`;
    return this._layout(content, title, ctx);
}

export function renderKonsultasi(this: any, ctx: any) {
    const title = "Layanan Konsultasi Agama & Keluarga — Suara 'Aisyiyah";
    const selectedCat = ctx.selectedCategory === 'keluarga' ? 'keluarga' : 'agama';

    const content = `
    <main class="container konsultasi-wrapper" role="main" style="max-width: 760px; margin: 40px auto; padding: 0 20px;">
        <div class="konsultasi-card" style="background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; overflow: hidden;">
            <!-- Header Banner -->
            <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; padding: 35px 25px; text-align: center;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; margin-bottom: 12px; font-size: 26px;">
                    <i class="fas fa-comments"></i>
                </div>
                <h1 style="margin: 0 0 8px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Layanan Konsultasi</h1>
                <p style="margin: 0; font-size: 14px; opacity: 0.92; max-width: 580px; margin: 0 auto; line-height: 1.5;">
                    Sampaikan pertanyaan atau permasalahan Anda. Redaksi dan tim pakar Suara 'Aisyiyah siap memberikan bimbingan dan jawaban sesuai tuntunan syariat dan keilmuan.
                </p>
            </div>

            <!-- Form Body -->
            <div style="padding: 30px 25px;">
                <!-- In-system Feedback Alert -->
                <div id="konsultasi-alert" style="display: none; padding: 14px 18px; border-radius: 10px; margin-bottom: 22px; font-size: 14px; line-height: 1.5;"></div>

                <form id="konsultasi-form" onsubmit="handleKonsultasiSubmit(event)">
                    <!-- Kategori Konsultasi (Pill Selector) -->
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 14px; font-weight: 700; margin-bottom: 10px; color: #1e293b;" class="konsultasi-label">
                            Pilih Jenis Konsultasi <span style="color: #dc2626;">*</span>
                        </label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <label class="konsultasi-cat-label" style="display: flex; align-items: center; gap: 10px; padding: 14px; border: 2px solid ${selectedCat === 'agama' ? '#059669' : '#e2e8f0'}; background: ${selectedCat === 'agama' ? '#f0fdf4' : '#ffffff'}; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
                                <input type="radio" name="category" value="agama" ${selectedCat === 'agama' ? 'checked' : ''} onchange="updateKonsultasiCategory(this)" style="accent-color: #059669; width: 18px; height: 18px;">
                                <div>
                                    <div style="font-weight: 700; font-size: 14px; color: #1e293b;" class="konsultasi-cat-title">📖 Konsultasi Agama</div>
                                    <div style="font-size: 12px; color: #64748b;" class="konsultasi-cat-desc">Fikih, ibadah, akidah & muamalah</div>
                                </div>
                            </label>
                            <label class="konsultasi-cat-label" style="display: flex; align-items: center; gap: 10px; padding: 14px; border: 2px solid ${selectedCat === 'keluarga' ? '#059669' : '#e2e8f0'}; background: ${selectedCat === 'keluarga' ? '#f0fdf4' : '#ffffff'}; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
                                <input type="radio" name="category" value="keluarga" ${selectedCat === 'keluarga' ? 'checked' : ''} onchange="updateKonsultasiCategory(this)" style="accent-color: #059669; width: 18px; height: 18px;">
                                <div>
                                    <div style="font-weight: 700; font-size: 14px; color: #1e293b;" class="konsultasi-cat-title">👨‍👩‍👧 Konsultasi Keluarga</div>
                                    <div style="font-size: 12px; color: #64748b;" class="konsultasi-cat-desc">Pernikahan, parenting & relasi keluarga</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Row: Nama & Nomor HP -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px;">
                        <div>
                            <label for="k-name" style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 6px; color: #1e293b;" class="konsultasi-label">Nama Asli / Samaran <span style="color: #dc2626;">*</span></label>
                            <input type="text" id="k-name" name="name" required placeholder="Misal: Fulanah / Hamba Allah" class="konsultasi-input" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; outline: none;">
                        </div>
                        <div>
                            <label for="k-phone" style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 6px; color: #1e293b;" class="konsultasi-label">Nomor HP / WhatsApp <span style="color: #dc2626;">*</span></label>
                            <input type="tel" id="k-phone" name="phone" required placeholder="08xxxxxxxxxx" class="konsultasi-input" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; outline: none;">
                        </div>
                    </div>

                    <!-- Row: Email & Asal Daerah -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px;">
                        <div>
                            <label for="k-email" style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 6px; color: #1e293b;" class="konsultasi-label">Email <span style="color: #dc2626;">*</span></label>
                            <input type="email" id="k-email" name="email" required placeholder="nama@email.com" class="konsultasi-input" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; outline: none;">
                        </div>
                        <div>
                            <label for="k-region" style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 6px; color: #1e293b;" class="konsultasi-label">Asal Daerah / Kota <span style="color: #dc2626;">*</span></label>
                            <input type="text" id="k-region" name="region" required placeholder="Misal: Yogyakarta / Surabaya" class="konsultasi-input" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; outline: none;">
                        </div>
                    </div>

                    <!-- Pertanyaan Konsultasi -->
                    <div style="margin-bottom: 24px;">
                        <label for="k-question" style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 6px; color: #1e293b;" class="konsultasi-label">Pertanyaan Konsultasi <span style="color: #dc2626;">*</span></label>
                        <textarea id="k-question" name="question" required rows="6" placeholder="Tuliskan pertanyaan atau uraian permasalahan Anda secara lengkap dan jelas di sini..." class="konsultasi-input" style="width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; outline: none; resize: vertical; line-height: 1.6;"></textarea>
                        <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;" class="konsultasi-note">
                            <i class="fas fa-shield-alt"></i> Kerahasiaan identitas dan data pribadi Anda dijamin oleh Redaksi Suara 'Aisyiyah.
                        </p>
                    </div>

                    <!-- Tombol Kirim -->
                    <button type="submit" id="k-submit-btn" style="width: 100%; padding: 14px 20px; background: #059669; color: #ffffff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s;" onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">
                        <i class="fas fa-paper-plane"></i> <span>Kirim Pertanyaan Konsultasi</span>
                    </button>
                </form>
            </div>
        </div>
    </main>

    <script>
    function updateKonsultasiCategory(radio) {
        document.querySelectorAll('.konsultasi-cat-label').forEach(function(l) {
            l.style.borderColor = '#e2e8f0';
            l.style.background = '#ffffff';
        });
        var parent = radio.closest('.konsultasi-cat-label');
        if (parent) {
            parent.style.borderColor = '#059669';
            parent.style.background = '#f0fdf4';
        }
    }

    async function handleKonsultasiSubmit(e) {
        e.preventDefault();
        var form = e.target;
        var btn = document.getElementById('k-submit-btn');
        var alertBox = document.getElementById('konsultasi-alert');
        if (!btn || !alertBox) return;

        var origBtnText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim pertanyaan...';
        alertBox.style.display = 'none';

        try {
            var formData = new FormData(form);
            var res = await fetch('/api/public/konsultasi', {
                method: 'POST',
                body: formData
            });
            var data = await res.json();

            if (data.success) {
                alertBox.style.display = 'block';
                alertBox.style.background = '#ecfdf5';
                alertBox.style.border = '1px solid #a7f3d0';
                alertBox.style.color = '#065f46';
                alertBox.innerHTML = '<i class="fas fa-check-circle" style="color:#059669; margin-right:6px;"></i> ' + data.message;
                form.reset();
                var radio = form.querySelector('input[name="category"]:checked');
                if (radio) updateKonsultasiCategory(radio);
                window.scrollTo({ top: alertBox.offsetTop - 80, behavior: 'smooth' });
            } else {
                alertBox.style.display = 'block';
                alertBox.style.background = '#fef2f2';
                alertBox.style.border = '1px solid #fecaca';
                alertBox.style.color = '#991b1b';
                alertBox.innerHTML = '<i class="fas fa-exclamation-circle" style="color:#dc2626; margin-right:6px;"></i> ' + (data.message || 'Gagal mengirim konsultasi.');
            }
        } catch (err) {
            alertBox.style.display = 'block';
            alertBox.style.background = '#fef2f2';
            alertBox.style.border = '1px solid #fecaca';
            alertBox.style.color = '#991b1b';
            alertBox.innerHTML = '<i class="fas fa-exclamation-circle" style="color:#dc2626; margin-right:6px;"></i> Terjadi gangguan koneksi. Silakan coba lagi.';
        } finally {
            btn.disabled = false;
            btn.innerHTML = origBtnText;
        }
    }
    </script>
    `;

    return this._layout(content, title, ctx);
}
export function renderBerlangganan(this: any, ctx: ThemeContext) {
    const cx = ctx as any;
    const cfg = cx.data?.plansConfig || {};
    const rawPlans = (cfg.plans && Array.isArray(cfg.plans)) ? cfg.plans : [
        { id: '1_bulan', name: '1 Bulan', months: 1, price: 50000, badge: '', desc: 'Akses Penuh 30 Hari', active: true },
        { id: '3_bulan', name: '3 Bulan', months: 3, price: 135000, badge: 'HEMAT 10%', desc: 'Rp 45.000 / bln', active: true },
        { id: '6_bulan', name: '6 Bulan', months: 6, price: 255000, badge: 'HEMAT 15%', desc: 'Rp 42.500 / bln', active: true },
        { id: '1_tahun', name: '1 Tahun', months: 12, price: 480000, badge: '⭐ PALING HEMAT', desc: 'Rp 40.000 / bln (20% Off)', active: true }
    ];
    const plans = rawPlans.filter((p: any) => p.active !== false);
    const bank1 = cfg.bank1 || { name: 'Bank Syariah Indonesia (BSI)', account: '8877665544', holder: "Suara 'Aisyiyah" };
    const bank2 = cfg.bank2 || { name: '', account: '', holder: '' };
    const rawWhatsapp = cfg.whatsapp || '081234567890';
    let cleanWa = rawWhatsapp.replace(/\D/g, '');
    if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.slice(1);
    const whatsapp = cleanWa;
    const instructions = cfg.instructions || 'Transfer sesuai nominal paket ke rekening resmi di atas, kemudian lakukan konfirmasi via WhatsApp atau kirim bukti transfer melalui formulir di bawah ini.';

    const content = `
      <main class="container sa-style-189" role="main" style="max-width:860px; margin:40px auto; padding:0 20px;">
        <div style="background:#ffffff; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.06); border:1px solid #e2e8f0; overflow:hidden;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg, #059669 0%, #047857 100%); color:#ffffff; padding:35px 30px; text-align:center;">
                <div style="display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; background:rgba(255,255,255,0.2); border-radius:50%; margin-bottom:15px; font-size:28px;">
                    <i class="fas fa-crown"></i>
                </div>
                <h1 style="margin:0 0 10px 0; font-size:28px; font-weight:800; letter-spacing:-0.5px;">Berlangganan Pelanggan Pro</h1>
                <p style="margin:0; font-size:15px; opacity:0.92; max-width:600px; margin:0 auto; line-height:1.5;">
                    Nikmati akses tanpa batas ke seluruh artikel premium, berpartisipasi dalam diskusi komentar, dan baca seluruh edisi E-Majalah Suara 'Aisyiyah.
                </p>
            </div>

            <div style="padding:30px;">
                <div id="berlangganan-alert" style="display:none; padding:14px 18px; border-radius:10px; font-size:14px; margin-bottom:24px; font-weight:600;"></div>

                <!-- 1. PILIHAN PAKET KUOTA BERLANGGANAN -->
                <div style="margin-bottom:30px;">
                    <label style="font-size:16px; font-weight:700; color:#0f172a; display:block; margin-bottom:14px;">
                        1. Pilih Paket Kuota Berlangganan:
                    </label>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:14px;">
                        ${plans.map((p: any, idx: number) => `
                        <div class="plan-card" onclick="selectPlan('${p.id}', ${p.price}, '${p.name}')" id="card-${p.id}"
                            style="border:2px solid ${idx === 0 ? '#059669' : '#e2e8f0'}; background:${idx === 0 ? '#f0fdf4' : '#ffffff'}; border-radius:12px; padding:18px 14px; text-align:center; cursor:pointer; transition:all 0.2s;">
                            ${p.badge ? `<span style="background:#e0f2fe; color:#0369a1; font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px; display:inline-block; margin-bottom:4px;">${p.badge}</span>` : ''}
                            <div style="font-size:14px; font-weight:700; color:#1e293b; margin-bottom:6px;">${(p.name || '').toUpperCase()}</div>
                            <div style="font-size:22px; font-weight:800; color:${idx === 0 ? '#059669' : '#0f172a'};">Rp ${Number(p.price).toLocaleString('id-ID')}</div>
                            <div style="font-size:11px; color:#64748b; margin-top:4px;">${p.desc || ''}</div>
                        </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 2. STATUS SESI PENGGUNA -->
                <!-- A. Container Jika SUDAH Login -->
                <div id="logged-user-container" style="display:none; margin-bottom:25px;">
                    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:12px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:42px; height:42px; border-radius:50%; background:#059669; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:18px;">
                                <i class="fas fa-user-check"></i>
                            </div>
                            <div>
                                <div style="font-size:14px; color:#64748b;">Masuk sebagai Akun Pelanggan:</div>
                                <div style="font-size:16px; font-weight:700; color:#0f172a;" id="logged-user-name">Pengguna</div>
                                <div style="font-size:12px; color:#059669; font-weight:600;" id="logged-user-meta"></div>
                            </div>
                        </div>
                        <div>
                            <button type="button" onclick="logoutSubscriber()" style="background:#fff; border:1px solid #cbd5e1; color:#64748b; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">
                                <i class="fas fa-sign-out-alt"></i> Ganti Akun
                            </button>
                        </div>
                    </div>
                </div>

                <!-- B. Container Jika BELUM Login (Opsi SSO & Login) -->
                <div id="guest-auth-container" style="display:none; margin-bottom:30px; background:#f0fdf4; border:1px solid #86efac; border-radius:14px; padding:24px; text-align:center;">
                    <h3 style="margin:0 0 8px 0; color:#166534; font-size:18px; font-weight:700;">
                        <i class="fas fa-lock"></i> Masuk Akun untuk Berlangganan
                    </h3>
                    <p style="margin:0 0 20px 0; color:#15803d; font-size:14px;">
                        Silakan masuk dengan akun Anda agar paket berlangganan langsung terhubung secara otomatis ke profil Anda.
                    </p>

                    <div style="display:flex; flex-wrap:gap:12px; justify-content:center; align-items:center; gap:12px;">
                        <!-- Tombol Masuk SSO Muhammadiyah ID -->
                        <button type="button" onclick="loginWithSSO()" style="background:#059669; color:#ffffff; border:none; padding:12px 22px; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 6px -1px rgba(5,150,105,0.3); transition:all 0.2s;">
                            <i class="fas fa-id-card"></i> Masuk dengan Muhammadiyah ID (SSO)
                        </button>

                        <!-- Tombol Masuk Biasa -->
                        <a href="/admin/login?redirect=/berlangganan" style="background:#ffffff; color:#1e293b !important; border:1px solid #cbd5e1; padding:12px 20px; border-radius:10px; font-size:14px; font-weight:600; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
                            <i class="fas fa-sign-in-alt" style="color:#059669 !important;"></i> Masuk Password
                        </a>
                    </div>

                    <div style="margin-top:20px; padding-top:16px; border-top:1px dashed #86efac; display:flex; flex-direction:column; align-items:center; gap:8px;">
                        <span style="font-size:13px; color:#166534; font-weight:600;">Belum memiliki akun Suara 'Aisyiyah?</span>
                        <a href="/daftar?redirect=/berlangganan" style="background:#10b981; color:#ffffff; padding:10px 22px; border-radius:10px; font-size:13px; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:8px; box-shadow:0 2px 6px rgba(16,185,129,0.35);">
                            <i class="fas fa-user-plus"></i> Daftar Akun Baru Sekarang &rarr;
                        </a>
                    </div>
                </div>

                <!-- 3. DETAIL REKENING TRANSFER BANK RESMI (MODE MANUAL) -->
                <div style="margin-bottom:30px;">
                    <label style="font-size:16px; font-weight:700; color:#0f172a; display:block; margin-bottom:14px;">
                        2. Rekening Resmi Pembayaran (Transfer Bank Manual):
                    </label>

                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px; margin-bottom:20px;">
                        <!-- Bank 1 -->
                        <div style="background:#f8fafc; border:2px solid #059669; border-radius:14px; padding:20px; position:relative; box-shadow:0 4px 12px rgba(5,150,105,0.06);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <div style="font-size:13px; font-weight:800; color:#059669; text-transform:uppercase; letter-spacing:0.5px;">
                                    <i class="fas fa-university"></i> ${bank1.name || 'Bank Syariah Indonesia (BSI)'}
                                </div>
                                <span style="background:#dcfce7; color:#166534; font-size:10px; font-weight:700; padding:2px 8px; border-radius:6px;">UTAMA</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #cbd5e1; border-radius:10px; padding:10px 14px; margin-bottom:10px;">
                                <span style="font-family:monospace; font-size:20px; font-weight:800; color:#0f172a; letter-spacing:1px;" id="bank1-acc">${bank1.account || '8877665544'}</span>
                                <button type="button" onclick="copyAccount('${bank1.account || '8877665544'}', this)" style="background:#059669; color:#ffffff; border:none; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                                    <i class="fas fa-copy"></i> Salin
                                </button>
                            </div>
                            <div style="font-size:13px; color:#64748b;">
                                Atas Nama: <strong style="color:#1e293b;">${bank1.holder || "Suara 'Aisyiyah"}</strong>
                            </div>
                        </div>

                        ${bank2 && bank2.name && bank2.account ? `
                        <!-- Bank 2 -->
                        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:14px; padding:20px; position:relative;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <div style="font-size:13px; font-weight:800; color:#334155; text-transform:uppercase; letter-spacing:0.5px;">
                                    <i class="fas fa-university"></i> ${bank2.name}
                                </div>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #cbd5e1; border-radius:10px; padding:10px 14px; margin-bottom:10px;">
                                <span style="font-family:monospace; font-size:20px; font-weight:800; color:#0f172a; letter-spacing:1px;" id="bank2-acc">${bank2.account}</span>
                                <button type="button" onclick="copyAccount('${bank2.account}', this)" style="background:#334155; color:#ffffff; border:none; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                                    <i class="fas fa-copy"></i> Salin
                                </button>
                            </div>
                            <div style="font-size:13px; color:#64748b;">
                                Atas Nama: <strong style="color:#1e293b;">${bank2.holder || "Suara 'Aisyiyah"}</strong>
                            </div>
                        </div>
                        ` : ''}
                    </div>

                    <!-- Ringkasan Nominal Transfer -->
                    <div style="background:#f0fdf4; border:1px solid #86efac; border-radius:12px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                        <div>
                            <div style="font-size:13px; color:#166534; font-weight:600;">Paket Terpilih:</div>
                            <div style="font-size:17px; font-weight:800; color:#0f172a;" id="summary-plan-label">${plans[0]?.name || '1 Bulan'}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:13px; color:#166534; font-weight:600;">Total Nominal Transfer:</div>
                            <div style="font-size:24px; font-weight:900; color:#059669;" id="summary-plan-amount">Rp ${Number(plans[0]?.price || 50000).toLocaleString('id-ID')}</div>
                        </div>
                    </div>
                </div>

                <!-- 4. PETUNJUK PEMBAYARAN MANUAL -->
                <div style="margin-bottom:30px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
                    <h4 style="margin:0 0 10px 0; font-size:15px; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-info-circle" style="color:#059669;"></i> Petunjuk Pembayaran Manual
                    </h4>
                    <p style="margin:0 0 12px 0; font-size:13px; color:#475569; line-height:1.6;">
                        ${instructions}
                    </p>
                    <ol style="margin:0; padding-left:20px; font-size:13px; color:#475569; line-height:1.6;">
                        <li>Lakukan transfer sesuai nominal paket ke salah satu rekening resmi di atas.</li>
                        <li>Simpan bukti transfer (struk ATM atau tangkapan layar m-Banking).</li>
                        <li>Lakukan konfirmasi cepat melalui <strong>WhatsApp Resmi</strong> atau kirim melalui formulir di bawah ini.</li>
                    </ol>
                </div>

                <!-- 5. DUA JALUR KONFIRMASI PEMBAYARAN -->
                <div style="display:flex; flex-direction:column; gap:24px;">
                    <!-- A. Jalur WhatsApp (Direkomendasikan) -->
                    <div style="border:2px solid #22c55e; background:#f0fdf4; border-radius:14px; padding:24px; text-align:center;">
                        <div style="display:inline-flex; align-items:center; justify-content:center; width:52px; height:52px; border-radius:50%; background:#22c55e; color:#ffffff; font-size:26px; margin-bottom:12px;">
                            <i class="fab fa-whatsapp"></i>
                        </div>
                        <h3 style="margin:0 0 8px 0; font-size:18px; font-weight:800; color:#166534;">
                            Konfirmasi Cepat via WhatsApp
                        </h3>
                        <p style="margin:0 auto 18px auto; max-width:540px; font-size:13px; color:#15803d; line-height:1.5;">
                            Kirimkan bukti transfer langsung ke admin WhatsApp Suara 'Aisyiyah agar akun Anda dapat segera diverifikasi dan diaktifkan.
                        </p>
                        <a id="btn-wa-confirm" href="#" target="_blank" rel="noopener noreferrer"
                            style="display:inline-flex; align-items:center; gap:10px; background:#22c55e; color:#ffffff !important; padding:14px 28px; border-radius:10px; font-size:15px; font-weight:700; text-decoration:none; box-shadow:0 4px 12px rgba(34,197,94,0.35); transition:all 0.2s;">
                            <i class="fab fa-whatsapp" style="font-size:20px;"></i> Konfirmasi Pembayaran via WhatsApp &rarr;
                        </a>
                    </div>

                    <!-- B. Jalur Formulir Konfirmasi Manual / Upload Bukti -->
                    <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:24px;">
                        <div style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="toggleManualForm()">
                            <h4 style="margin:0; font-size:16px; font-weight:700; color:#1e293b; display:flex; align-items:center; gap:8px;">
                                <i class="fas fa-file-invoice-dollar" style="color:#059669;"></i> Atau Kirim Bukti Transfer via Formulir Web
                            </h4>
                            <span id="manual-form-toggle-icon" style="font-size:14px; color:#64748b;"><i class="fas fa-chevron-down"></i></span>
                        </div>

                        <form id="manual-confirm-form" onsubmit="submitManualConfirmation(event)" style="display:none; margin-top:20px; border-top:1px solid #e2e8f0; padding-top:20px;">
                            <!-- Form fields jika belum login -->
                            <div id="guest-input-fields" style="display:none; margin-bottom:18px;">
                                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:14px;">
                                    <div>
                                        <label style="font-size:13px; font-weight:600; color:#475569; display:block; margin-bottom:5px;">Nama Lengkap *</label>
                                        <input type="text" id="mf-name" style="width:100%; height:40px; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; box-sizing:border-box;" placeholder="Nama Lengkap...">
                                    </div>
                                    <div>
                                        <label style="font-size:13px; font-weight:600; color:#475569; display:block; margin-bottom:5px;">Username Baru *</label>
                                        <input type="text" id="mf-username" style="width:100%; height:40px; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; box-sizing:border-box;" placeholder="Username baru...">
                                    </div>
                                </div>
                                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px;">
                                    <div>
                                        <label style="font-size:13px; font-weight:600; color:#475569; display:block; margin-bottom:5px;">Email Aktif *</label>
                                        <input type="email" id="mf-email" style="width:100%; height:40px; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; box-sizing:border-box;" placeholder="email@contoh.com">
                                    </div>
                                    <div>
                                        <label style="font-size:13px; font-weight:600; color:#475569; display:block; margin-bottom:5px;">Password Login *</label>
                                        <input type="password" id="mf-password" style="width:100%; height:40px; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; box-sizing:border-box;" placeholder="Minimal 6 karakter...">
                                    </div>
                                </div>
                            </div>

                            <div style="margin-bottom:18px;">
                                <label style="font-size:13px; font-weight:600; color:#475569; display:block; margin-bottom:5px;">Bank Tujuan Transfer *</label>
                                <select id="mf-target-bank" style="width:100%; height:42px; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; box-sizing:border-box; background:#fff;">
                                    <option value="${bank1.name || 'BSI'}">${bank1.name || 'Bank Syariah Indonesia (BSI)'} - ${bank1.account || '8877665544'}</option>
                                    ${bank2 && bank2.name ? `<option value="${bank2.name}">${bank2.name} - ${bank2.account}</option>` : ''}
                                </select>
                            </div>

                            <div style="margin-bottom:20px;">
                                <label style="font-size:13px; font-weight:600; color:#475569; display:block; margin-bottom:5px;">Upload Foto / Tangkapan Layar Bukti Transfer *</label>
                                <input type="file" id="mf-proof-file" accept="image/*" style="width:100%; font-size:13px;" onchange="handleProofFileChange(this)">
                                <input type="hidden" id="mf-proof-url">
                                <div id="mf-proof-preview" style="display:none; margin-top:10px;">
                                    <img id="mf-proof-img" src="" alt="Bukti Transfer" style="max-height:180px; border-radius:8px; border:1px solid #cbd5e1;">
                                </div>
                                <div id="mf-upload-status" style="font-size:12px; color:#059669; font-weight:600; margin-top:4px;"></div>
                            </div>

                            <button type="submit" id="mf-submit-btn" style="width:100%; background:#059669; color:#ffffff; border:none; padding:14px; border-radius:10px; font-size:15px; font-weight:700; cursor:pointer; box-shadow:0 4px 10px rgba(5,150,105,0.25); transition:all 0.2s;">
                                <i class="fas fa-paper-plane"></i> Kirim Konfirmasi Pembayaran
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <script>
            let selectedPlan = '${plans[0]?.id || '1_bulan'}';
            let selectedAmount = ${plans[0]?.price || 50000};
            let selectedLabel = '${plans[0]?.name || '1 Bulan'}';
            let whatsappTarget = '${whatsapp}';
            let currentUser = null;

            function getCookieToken() {
                const match = document.cookie.match(/(?:^|;\s*)labmu_token=([^;]+)/);
                if (match) return decodeURIComponent(match[1]);
                try {
                    const local = localStorage.getItem('labmu_token');
                    if (local) {
                        document.cookie = 'labmu_token=' + encodeURIComponent(local) + '; Path=/; Max-Age=2592000; SameSite=Lax';
                        localStorage.removeItem('labmu_token');
                        return local;
                    }
                } catch(e) {}
                return '';
            }

            function initAuth() {
                const token = getCookieToken();
                try { localStorage.removeItem('labmu_token'); localStorage.removeItem('admin_token'); } catch(e){}
                const loggedBox = document.getElementById('logged-user-container');
                const guestBox = document.getElementById('guest-auth-container');
                const guestInputs = document.getElementById('guest-input-fields');

                if (token) {
                    try {
                        const payload = JSON.parse(atob(token));
                        if (payload && payload.id) {
                            currentUser = payload;
                            loggedBox.style.display = 'block';
                            guestBox.style.display = 'none';
                            if (guestInputs) guestInputs.style.display = 'none';

                            document.getElementById('logged-user-name').innerText = payload.n || payload.username || 'Pengguna';
                            const roleText = payload.role === 'subscriber_pro' ? '⭐ SUBSCRIBER PRO (Aktif)' : ('Status: ' + (payload.role || 'Subscriber').toUpperCase());
                            document.getElementById('logged-user-meta').innerText = roleText;
                            updateWhatsAppLink();
                            return;
                        }
                    } catch (e) {}
                }

                // Jika Guest
                loggedBox.style.display = 'none';
                guestBox.style.display = 'block';
                if (guestInputs) guestInputs.style.display = 'block';
                updateWhatsAppLink();
            }

            function selectPlan(plan, amount, label) {
                selectedPlan = plan;
                selectedAmount = amount;
                selectedLabel = label;

                // Update styling card
                document.querySelectorAll('.plan-card').forEach(card => {
                    card.style.border = '2px solid #e2e8f0';
                    card.style.background = '#ffffff';
                });
                const activeCard = document.getElementById('card-' + plan);
                if (activeCard) {
                    activeCard.style.border = '2px solid #059669';
                    activeCard.style.background = '#f0fdf4';
                }

                // Update ringkasan transfer
                document.getElementById('summary-plan-label').innerText = label;
                document.getElementById('summary-plan-amount').innerText = 'Rp ' + Number(amount).toLocaleString('id-ID');

                updateWhatsAppLink();
            }

            function updateWhatsAppLink() {
                const btn = document.getElementById('btn-wa-confirm');
                if (!btn) return;

                const userName = currentUser ? (currentUser.n || currentUser.username || 'Pelanggan') : (document.getElementById('mf-name')?.value || 'Pelanggan');
                const userEmail = currentUser ? (currentUser.email || currentUser.username || '-') : (document.getElementById('mf-email')?.value || '-');
                const targetBank = document.getElementById('mf-target-bank')?.value || '${bank1.name || 'BSI'}';

                const text = "Assalamu'alaikum Admin Suara 'Aisyiyah,%0A%0ASaya ingin konfirmasi pembayaran langganan Pelanggan Pro:%0A" +
                    "- Nama: " + encodeURIComponent(userName) + "%0A" +
                    "- Akun / Email: " + encodeURIComponent(userEmail) + "%0A" +
                    "- Paket: " + encodeURIComponent(selectedLabel) + " (Rp " + Number(selectedAmount).toLocaleString('id-ID') + ")%0A" +
                    "- Bank Tujuan: " + encodeURIComponent(targetBank) + "%0A%0A" +
                    "Berikut saya lampirkan bukti transfer. Mohon bantuannya untuk verifikasi & aktivasi akun. Terima kasih!";

                btn.href = 'https://wa.me/' + whatsappTarget + '?text=' + text;
            }

            function copyAccount(accNumber, btnEl) {
                navigator.clipboard.writeText(accNumber).then(() => {
                    const originalHtml = btnEl.innerHTML;
                    btnEl.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
                    btnEl.style.background = '#16a34a';
                    setTimeout(() => {
                        btnEl.innerHTML = originalHtml;
                        btnEl.style.background = '';
                    }, 2000);
                }).catch(() => {
                    const alertBox = document.getElementById('berlangganan-alert');
                    alertBox.style.display = 'block';
                    alertBox.style.background = '#fef3c7';
                    alertBox.style.color = '#92400e';
                    alertBox.innerText = 'No. Rekening: ' + accNumber;
                });
            }

            function toggleManualForm() {
                const form = document.getElementById('manual-confirm-form');
                const icon = document.getElementById('manual-form-toggle-icon');
                if (form.style.display === 'none' || !form.style.display) {
                    form.style.display = 'block';
                    icon.innerHTML = '<i class="fas fa-chevron-up"></i>';
                } else {
                    form.style.display = 'none';
                    icon.innerHTML = '<i class="fas fa-chevron-down"></i>';
                }
            }

            function handleProofFileChange(input) {
                const file = input.files[0];
                const statusEl = document.getElementById('mf-upload-status');
                const previewEl = document.getElementById('mf-proof-preview');
                const imgEl = document.getElementById('mf-proof-img');
                const urlEl = document.getElementById('mf-proof-url');

                if (!file) {
                    urlEl.value = '';
                    previewEl.style.display = 'none';
                    statusEl.innerText = '';
                    return;
                }

                statusEl.innerText = 'Mempersiapkan bukti transfer...';
                statusEl.style.color = '#0284c7';

                const reader = new FileReader();
                reader.onload = function(e) {
                    urlEl.value = e.target.result;
                    imgEl.src = e.target.result;
                    previewEl.style.display = 'block';
                    statusEl.innerText = 'Bukti transfer siap dikirim (' + Math.round(file.size / 1024) + ' KB)';
                    statusEl.style.color = '#059669';
                };
                reader.readAsDataURL(file);
            }

            async function submitManualConfirmation(e) {
                e.preventDefault();
                const btn = document.getElementById('mf-submit-btn');
                const alertBox = document.getElementById('berlangganan-alert');
                const proofUrl = document.getElementById('mf-proof-url').value;

                if (!proofUrl) {
                    alertBox.style.display = 'block';
                    alertBox.style.background = '#fee2e2';
                    alertBox.style.color = '#991b1b';
                    alertBox.innerHTML = '<i class="fas fa-exclamation-circle"></i> Mohon lampirkan foto atau tangkapan layar bukti transfer terlebih dahulu.';
                    alertBox.scrollIntoView({ behavior: 'smooth' });
                    return;
                }

                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim Konfirmasi...';

                let payload = {
                    plan: selectedPlan,
                    amount: selectedAmount,
                    targetBank: document.getElementById('mf-target-bank').value,
                    payment_proof: proofUrl
                };

                if (currentUser && currentUser.id) {
                    payload.userId = currentUser.id;
                    payload.name = currentUser.n || currentUser.username;
                    payload.email = currentUser.email;
                } else {
                    payload.name = document.getElementById('mf-name').value;
                    payload.username = document.getElementById('mf-username').value;
                    payload.email = document.getElementById('mf-email').value;
                    payload.password = document.getElementById('mf-password').value;

                    if (!payload.username || !payload.email || !payload.password) {
                        alertBox.style.display = 'block';
                        alertBox.style.background = '#fee2e2';
                        alertBox.style.color = '#991b1b';
                        alertBox.innerHTML = '<i class="fas fa-exclamation-circle"></i> Harap lengkapi Nama, Username, Email, dan Password.';
                        btn.disabled = false;
                        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Konfirmasi Pembayaran';
                        return;
                    }
                }

                try {
                    const token = getCookieToken();
                    const headers = { 'Content-Type': 'application/json' };
                    if (token) headers['Authorization'] = 'Bearer ' + token;

                    const res = await fetch('/api/public/subscribers/register', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(payload)
                    });

                    const json = await res.json();
                    if (!res.ok || !json.success) {
                        throw new Error(json.error || 'Gagal mengirim konfirmasi pembayaran');
                    }

                    alertBox.style.display = 'block';
                    alertBox.style.background = '#dcfce7';
                    alertBox.style.border = '1px solid #86efac';
                    alertBox.style.color = '#166534';
                    alertBox.innerHTML = '<div style="font-size:15px; font-weight:800; margin-bottom:6px;"><i class="fas fa-check-circle"></i> Konfirmasi Pembayaran Berhasil Dikirim!</div>' +
                        '<div style="font-size:13px; font-weight:normal; line-height:1.5;">' +
                        'Terima kasih! Bukti transfer Anda telah tersimpan dan sedang menunggu verifikasi admin. Anda juga dapat mempercepat proses aktivasi dengan menghubungi WhatsApp kami.' +
                        '</div>';
                    alertBox.scrollIntoView({ behavior: 'smooth' });

                    document.getElementById('manual-confirm-form').reset();
                    document.getElementById('mf-proof-preview').style.display = 'none';
                    document.getElementById('mf-upload-status').innerText = '';
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-check"></i> Konfirmasi Terkirim';
                } catch (err) {
                    alertBox.style.display = 'block';
                    alertBox.style.background = '#fee2e2';
                    alertBox.style.color = '#991b1b';
                    alertBox.innerText = 'Gagal: ' + err.message;
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Konfirmasi Pembayaran';
                }
            }

            async function loginWithSSO() {
                try {
                    sessionStorage.setItem('sso_return_url', window.location.pathname);
                    const res = await fetch('/api/settings?t=' + Date.now());
                    const json = await res.json();
                    const config = json.data || json;
                    const clientId = config.sso_client_id?.trim();
                    
                    if (!clientId) {
                        const alertBox = document.getElementById('berlangganan-alert');
                        alertBox.style.display = 'block';
                        alertBox.style.background = '#fef3c7';
                        alertBox.style.color = '#92400e';
                        alertBox.innerText = 'SSO Muhammadiyah ID belum dikonfigurasi oleh Admin.';
                        return;
                    }
                    
                    const redirectUri = window.location.origin + '/admin/sso/callback';
                    const authUrl = 'https://dias.muhammadiyah.or.id/oauth/authorize?client_id=' + encodeURIComponent(clientId) +
                                    '&redirect_uri=' + encodeURIComponent(redirectUri) +
                                    '&response_type=code' +
                                    '&scope=openid+profile+email';
                    window.location.href = authUrl;
                } catch (e) {
                    const alertBox = document.getElementById('berlangganan-alert');
                    alertBox.style.display = 'block';
                    alertBox.style.background = '#fee2e2';
                    alertBox.style.color = '#991b1b';
                    alertBox.innerText = 'Gagal menginisiasi SSO: ' + e.message;
                }
            }

            function logoutSubscriber() {
                document.cookie = 'labmu_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
                try { localStorage.removeItem('labmu_token'); localStorage.removeItem('admin_token'); } catch(e){}
                currentUser = null;
                initAuth();
            }

            // Jalankan deteksi login saat DOM siap
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initAuth);
            } else {
                initAuth();
            }
        </script>
      </main>
    `;
    return this._layout(content, 'Berlangganan', ctx);
}
