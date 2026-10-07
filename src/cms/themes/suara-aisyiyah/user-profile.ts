import type { ThemeContext } from "../types";
import { escapeHtml, date, category as getCategory, image } from "./utils";

export function renderUserProfile(this: any, ctx: ThemeContext) {
  const cx = ctx as any;
  const user = cx.profileUser || {};
  const magazines = Array.isArray(cx.magazines) ? cx.magazines : [];
  const proPosts = Array.isArray(cx.proPosts) ? cx.proPosts : [];
  const subscriptions = Array.isArray(cx.subscriptions) ? cx.subscriptions : [];

  const username = escapeHtml(user.username || "");
  const displayName = escapeHtml(user.name || user.username || "Pengguna");
  const role = String(user.role || "subscriber").toLowerCase();
  const isSubscriberPro =
    role === "subscriber_pro" || role === "pro" || role === "premium";
  const expiresAt =
    user.subscriptionExpiresAt || user.subscription_expires_at || null;

  let expiresFormatted = "";
  let daysRemaining = 0;
  if (expiresAt) {
    const expDate = new Date(expiresAt);
    if (!isNaN(expDate.getTime())) {
      expiresFormatted = expDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const now = new Date();
      const diffTime = expDate.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  const initial = (displayName.charAt(0) || "U").toUpperCase();
  const avatarUrl = user.avatar ? escapeHtml(user.avatar) : "";

  let content = `
    <main class="container" role="main" style="max-width: 1100px; margin: 30px auto 60px; padding: 0 16px;">
        <!-- 1. USER PROFILE HEADER CARD -->
        <div class="user-profile-header-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 28px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
                <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
                    <!-- Avatar -->
                    <div style="width: 76px; height: 76px; border-radius: 50%; overflow: hidden; border: 3px solid #059669; box-shadow: 0 4px 12px rgba(5,150,105,0.25); flex-shrink: 0; background: #059669; display: flex; align-items: center; justify-content: center;">
                        ${
                          avatarUrl
                            ? `
                            <img src="${avatarUrl}" alt="${displayName}" style="width:100%; height:100%; object-fit:cover;" onerror="this.outerHTML='<span style=\\'color:#fff; font-size:32px; font-weight:800;\\'>${initial}</span>'">
                        `
                            : `
                            <span style="color: #ffffff; font-size: 32px; font-weight: 800;">${initial}</span>
                        `
                        }
                    </div>

                    <!-- Details -->
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.2;">
                                ${displayName}
                            </h1>
                            ${
                              isSubscriberPro
                                ? `
                                <span style="background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(5,150,105,0.3);">
                                    ⭐ SUBSCRIBER PRO
                                </span>
                            `
                                : `
                                <span style="background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; border: 1px solid #cbd5e1;">
                                    ${role.toUpperCase()}
                                </span>
                            `
                            }
                        </div>
                        <div style="font-size: 14px; color: #64748b; margin-top: 4px; font-weight: 500;">
                            @${username} ${user.email ? `&bull; ${escapeHtml(user.email)}` : ""}
                        </div>
                    </div>
                </div>

                <!-- Subscription Status Capsule -->
                <div style="background: ${isSubscriberPro ? "#f0fdf4" : "#f8fafc"}; border: 1px solid ${isSubscriberPro ? "#a7f3d0" : "#e2e8f0"}; border-radius: 12px; padding: 14px 20px; text-align: right; min-width: 200px;">
                    <div style="font-size: 11px; font-weight: 700; color: ${isSubscriberPro ? "#059669" : "#64748b"}; text-transform: uppercase; letter-spacing: 0.5px;">
                        ${isSubscriberPro ? "Status Langganan Aktif" : "Status Akun"}
                    </div>
                    ${
                      isSubscriberPro && expiresFormatted
                        ? `
                        <div style="font-size: 15px; font-weight: 800; color: #064e3b; margin-top: 3px;">
                            ${daysRemaining > 0 ? `Sisa ${daysRemaining} Hari` : "Hari Terakhir"}
                        </div>
                        <div style="font-size: 12px; color: #047857; margin-top: 2px;">
                            s/d ${expiresFormatted}
                        </div>
                    `
                        : `
                        <div style="font-size: 14px; font-weight: 700; color: #334155; margin-top: 3px;">
                            ${isSubscriberPro ? "Aktif Permanen" : "Paket Gratis"}
                        </div>
                        ${
                          !isSubscriberPro
                            ? `
                            <a href="/berlangganan" style="display: inline-block; margin-top: 6px; font-size: 12px; font-weight: 700; color: #059669; text-decoration: none;">
                                Upgrade ke Pro &rarr;
                            </a>
                        `
                            : ""
                        }
                    `
                    }
                </div>
            </div>
        </div>

        <!-- 2. PROFILE TAB NAVIGATION -->
        <div style="display: flex; gap: 8px; border-bottom: 2px solid #e2e8f0; margin-bottom: 24px; overflow-x: auto; padding-bottom: 4px;">
            <button type="button" class="profile-tab-btn active" onclick="switchProfileTab('emagazine', this)" style="padding: 10px 18px; border: none; background: none; font-size: 14px; font-weight: 700; cursor: pointer; color: #059669; border-bottom: 3px solid #059669; margin-bottom: -6px; display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;">
                <span>📖 E-Majalah Digital</span>
                <span style="background: #d1fae5; color: #065f46; font-size: 11px; padding: 2px 7px; border-radius: 12px;">${magazines.length}</span>
            </button>
            <button type="button" class="profile-tab-btn" onclick="switchProfileTab('pro-posts', this)" style="padding: 10px 18px; border: none; background: none; font-size: 14px; font-weight: 600; cursor: pointer; color: #64748b; margin-bottom: -6px; display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;">
                <span>⭐ Konten & Artikel Pro</span>
                <span style="background: #f1f5f9; color: #475569; font-size: 11px; padding: 2px 7px; border-radius: 12px;">${proPosts.length}</span>
            </button>
            <button type="button" class="profile-tab-btn" onclick="switchProfileTab('subscription', this)" style="padding: 10px 18px; border: none; background: none; font-size: 14px; font-weight: 600; cursor: pointer; color: #64748b; margin-bottom: -6px; display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;">
                <span>💳 Status Langganan & Invoice</span>
            </button>
            <button type="button" class="profile-tab-btn owner-only-tab" onclick="switchProfileTab('settings', this)" style="padding: 10px 18px; border: none; background: none; font-size: 14px; font-weight: 600; cursor: pointer; color: #64748b; margin-bottom: -6px; display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;">
                <span>⚙️ Pengaturan Akun</span>
            </button>
        </div>

        <!-- 3. TAB CONTENT SECTIONS -->

        <!-- TAB 1: E-MAGAZINE DIGITAL -->
        <div id="tab-emagazine" class="profile-tab-content" style="display: block;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                <div>
                    <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0;">Koleksi E-Majalah Suara 'Aisyiyah</h3>
                    <p style="font-size: 13px; color: #64748b; margin: 4px 0 0 0;">Sebagai Pelanggan Pro, Anda memiliki akses membaca penuh seluruh edisi majalah digital.</p>
                </div>
                <a href="/majalah" style="font-size: 13px; font-weight: 700; color: #059669; text-decoration: none;">Lihat Semua Edisi &rarr;</a>
            </div>

            ${
              !magazines.length
                ? `
                <div style="text-align: center; padding: 48px 16px; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 12px;">
                    <div style="font-size: 40px; color: #94a3b8; margin-bottom: 10px;">📖</div>
                    <h4 style="font-size: 16px; color: #334155; margin-bottom: 4px;">Belum Ada Edisi Majalah</h4>
                    <p style="font-size: 13px; color: #64748b;">Edisi majalah digital akan segera diperbarui oleh redaksi.</p>
                </div>
            `
                : `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;">
                    ${magazines
                      .map(
                        (m: any) => `
                        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; flex-direction: column; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='none'">
                            <div style="aspect-ratio: 3/4; width: 100%; background: #f1f5f9; overflow: hidden; position: relative;">
                                <img src="${escapeHtml(m.coverImage || m.cover_image || "")}" alt="${escapeHtml(m.title)}" style="width:100%; height:100%; object-fit:cover;" loading="lazy">
                                ${
                                  isSubscriberPro
                                    ? `
                                    <span style="position: absolute; top: 10px; right: 10px; background: #059669; color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                                        AKSES PENUH
                                    </span>
                                `
                                    : `
                                    <span style="position: absolute; top: 10px; right: 10px; background: #d97706; color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 12px;">
                                        PREVIEW
                                    </span>
                                `
                                }
                            </div>
                            <div style="padding: 14px; display: flex; flex-direction: column; flex: 1;">
                                <div style="font-size: 11px; font-weight: 700; color: #059669; text-transform: uppercase;">
                                    ${escapeHtml(m.editionNumber || m.edition_number || "Edisi Digital")}
                                </div>
                                <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 4px 0 10px 0; line-height: 1.4; flex: 1;">
                                    ${escapeHtml(m.title)}
                                </h4>
                                <a href="/majalah/${escapeHtml(m.slug)}" style="background: #059669; color: #ffffff; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; text-align: center; text-decoration: none; display: block; transition: background 0.2s;" onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">
                                    Baca Majalah &rarr;
                                </a>
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `
            }
        </div>

        <!-- TAB 2: KONTEN & ARTIKEL PRO -->
        <div id="tab-pro-posts" class="profile-tab-content" style="display: none;">
            <div style="margin-bottom: 20px;">
                <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0;">Artikel & Kajian Eksklusif</h3>
                <p style="font-size: 13px; color: #64748b; margin: 4px 0 0 0;">Konten mendalam pilihan untuk menambah wawasan dan inspirasi Anda.</p>
            </div>

            ${
              !proPosts.length
                ? `
                <div style="text-align: center; padding: 48px 16px; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 12px;">
                    <div style="font-size: 40px; color: #94a3b8; margin-bottom: 10px;">⭐</div>
                    <h4 style="font-size: 16px; color: #334155; margin-bottom: 4px;">Konten Khusus Belum Tersedia</h4>
                    <p style="font-size: 13px; color: #64748b;">Artikel dan video eksklusif Pro akan muncul di sini.</p>
                </div>
            `
                : `
                <div class="card-grid">
                    ${proPosts
                      .map((p: any, i: number) => {
                        const isVideo =
                          p.type === "video" ||
                          (p.video_url && String(p.video_url).trim() !== "");
                        const catName = getCategory(p);
                        const catSlug = catName
                          .toLowerCase()
                          .replace(/\s+/g, "-");
                        return `
                        <div class="grid-post">
                            <a href="/${escapeHtml(p.slug)}" class="post-img-wrap" style="position: relative;">
                                <img src="${image(p, i)}" alt="${escapeHtml(p.title)}" loading="lazy">
                                ${
                                  isVideo
                                    ? `
                                    <span style="position: absolute; bottom: 8px; right: 8px; background: #dc2626; color: #ffffff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
                                        <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> VIDEO
                                    </span>
                                `
                                    : ""
                                }
                            </a>
                            <div class="grid-post-content">
                                <div style="margin-bottom: 6px;">
                                    <a href="/${catSlug}" class="cat-tag" style="font-size: 11px; padding: 2px 8px; text-decoration: none;">${catName}</a>
                                </div>
                                <h4><a href="/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a></h4>
                                ${
                                  p.excerpt
                                    ? `
                                    <p style="font-size: 13px; margin: 6px 0 10px 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; opacity: 0.85;">
                                        ${escapeHtml(p.excerpt)}
                                    </p>
                                `
                                    : ""
                                }
                                <div class="post-meta"><span>${date(p.created_at)}</span></div>
                            </div>
                        </div>
                        `;
                      })
                      .join("")}
                </div>
            `
            }
        </div>

        <!-- TAB 3: STATUS LANGGANAN & INVOICE -->
        <div id="tab-subscription" class="profile-tab-content" style="display: none;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">Detail Keanggotaan Anda</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    <div style="background: #f8fafc; padding: 14px 18px; border-radius: 10px; border: 1px solid #e2e8f0;">
                        <div style="font-size: 12px; color: #64748b; font-weight: 600;">Paket Saat Ini</div>
                        <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 4px;">
                            ${escapeHtml(user.subscriptionPlan || user.subscription_plan || (isSubscriberPro ? "Subscriber Pro" : "Gratis"))}
                        </div>
                    </div>
                    <div style="background: #f8fafc; padding: 14px 18px; border-radius: 10px; border: 1px solid #e2e8f0;">
                        <div style="font-size: 12px; color: #64748b; font-weight: 600;">Masa Berlaku</div>
                        <div style="font-size: 16px; font-weight: 800; color: #059669; margin-top: 4px;">
                            ${expiresFormatted ? expiresFormatted : isSubscriberPro ? "Aktif" : "Tidak Aktif"}
                        </div>
                    </div>
                    <div style="background: #f8fafc; padding: 14px 18px; border-radius: 10px; border: 1px solid #e2e8f0;">
                        <div style="font-size: 12px; color: #64748b; font-weight: 600;">Sisa Waktu Kuota</div>
                        <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 4px;">
                            ${daysRemaining > 0 ? `${daysRemaining} Hari Lagi` : isSubscriberPro ? "Aktif" : "-"}
                        </div>
                    </div>
                </div>

                <div style="margin-top: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
                    <div style="font-size: 13px; color: #64748b;">
                        Perpanjang masa aktif sekarang untuk terus menikmati majalah digital dan konten pro tanpa jeda.
                    </div>
                    <a href="/berlangganan" style="background: #059669; color: #ffffff; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 6px rgba(5,150,105,0.3);">
                        Perpanjang / Pilih Paket &rarr;
                    </a>
                </div>
            </div>

            <!-- Invoice / Riwayat Transaksi -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">Riwayat Pembayaran & Invoice</h3>
                ${
                  !subscriptions.length
                    ? `
                    <div style="text-align: center; padding: 32px 16px; color: #64748b; font-size: 13px;">
                        Belum ada riwayat transaksi pembayaran online yang tercatat untuk akun ini.
                    </div>
                `
                    : `
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 2px solid #e2e8f0; color: #64748b;">
                                    <th style="padding: 10px 12px;">ID / Tanggal</th>
                                    <th style="padding: 10px 12px;">Paket</th>
                                    <th style="padding: 10px 12px;">Nominal</th>
                                    <th style="padding: 10px 12px;">Status</th>
                                    <th style="padding: 10px 12px;">Bukti</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${subscriptions
                                  .map(
                                    (s: any) => `
                                    <tr style="border-bottom: 1px solid #f1f5f9;">
                                        <td style="padding: 12px; font-weight: 600; color: #0f172a;">
                                            #INV-${s.id}<br>
                                            <span style="font-size: 11px; color: #64748b; font-weight: 400;">${date(s.createdAt || s.created_at)}</span>
                                        </td>
                                        <td style="padding: 12px; font-weight: 600; text-transform: capitalize;">
                                            ${escapeHtml(s.plan ? s.plan.replace("_", " ") : "Paket Langganan")}
                                        </td>
                                        <td style="padding: 12px; font-weight: 700; color: #059669;">
                                            ${s.amount ? `Rp ${Number(s.amount).toLocaleString("id-ID")}` : "-"}
                                        </td>
                                        <td style="padding: 12px;">
                                            ${
                                              s.status === "approved" ||
                                              s.status === "active"
                                                ? `
                                                <span style="background: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 12px;">Lunas / Aktif</span>
                                            `
                                                : s.status === "pending"
                                                  ? `
                                                <span style="background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 12px;">Verifikasi</span>
                                            `
                                                  : `
                                                <span style="background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 12px;">${escapeHtml(s.status)}</span>
                                            `
                                            }
                                        </td>
                                        <td style="padding: 12px;">
                                            ${
                                              s.paymentProof || s.payment_proof
                                                ? `
                                                <a href="${escapeHtml(s.paymentProof || s.payment_proof)}" target="_blank" style="color: #059669; font-weight: 600; text-decoration: none;">
                                                    Lihat Struk
                                                </a>
                                            `
                                                : "-"
                                            }
                                        </td>
                                    </tr>
                                `
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                `
                }
            </div>
        </div>

        <!-- TAB 4: PENGATURAN PROFIL -->
        <div id="tab-settings" class="profile-tab-content" style="display: none;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px; max-width: 680px; margin: 0 auto;">
                <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Perbarui Informasi Akun</h3>
                <p style="font-size: 13px; color: #64748b; margin: 0 0 20px 0;">Kelola nama tampilan, username, alamat email, foto avatar, dan kata sandi akun Anda.</p>

                <div id="profile-alert" style="display: none; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; font-weight: 600;"></div>

                <form id="public-profile-form" onsubmit="handleUpdateProfile(event)" style="display: flex; flex-direction: column; gap: 18px;">
                    <!-- Foto Avatar Upload (Maksimal 1MB) -->
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px;">Foto Profil (Avatar)</label>
                        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                            <div id="avatar-preview-box" style="width: 72px; height: 72px; border-radius: 50%; overflow: hidden; border: 2px solid #059669; background: #f1f5f9; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                                <img id="avatar-preview-img" src="${avatarUrl || ""}" alt="Avatar" style="width:100%; height:100%; object-fit:cover; ${!avatarUrl ? "display:none;" : ""}" onerror="this.style.display='none'; document.getElementById('avatar-preview-fallback').style.display='block';">
                                <span id="avatar-preview-fallback" style="font-size: 26px; font-weight: 800; color: #059669; ${avatarUrl ? "display:none;" : ""}">${initial}</span>
                            </div>
                            <div style="flex: 1; min-width: 220px;">
                                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                    <label for="prof-avatar-file" style="display: inline-flex; align-items: center; gap: 6px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #334155; cursor: pointer; transition: background 0.15s;">
                                        <span>📁 Pilih Berkas Avatar</span>
                                    </label>
                                    <input type="file" id="prof-avatar-file" accept="image/jpeg,image/png,image/webp" style="display: none;" onchange="handleAvatarFileSelect(this)">
                                    <span id="avatar-upload-status" style="font-size: 12px; color: #64748b;">Maksimal 1 MB (JPG, PNG, WebP)</span>
                                </div>
                                <input type="hidden" id="prof-avatar" value="${avatarUrl}">
                            </div>
                        </div>
                    </div>

                    <!-- Username -->
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">Username Akun (@username)</label>
                        <div style="display: flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #ffffff;">
                            <span style="padding: 10px 14px; background: #f8fafc; border-right: 1px solid #cbd5e1; color: #059669; font-weight: 800; font-size: 14px;">@</span>
                            <input type="text" id="prof-username" value="${escapeHtml(user.username || "")}" required style="width: 100%; padding: 10px 14px; border: none; font-size: 14px; outline: none; box-sizing: border-box;" placeholder="contoh: cakipin atau zainal.arifin">
                        </div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Gunakan huruf kecil, angka, titik, atau garis bawah tanpa spasi. Link profil Anda: <strong id="preview-profile-url">/@${escapeHtml(user.username || "")}</strong></div>
                    </div>

                    <!-- Nama Lengkap -->
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">Nama Lengkap</label>
                        <input type="text" id="prof-name" value="${displayName}" required style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; background: #ffffff;">
                    </div>

                    <!-- Email -->
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">Alamat Email</label>
                        <input type="email" id="prof-email" value="${escapeHtml(user.email || "")}" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; background: #ffffff;">
                    </div>

                    <button type="submit" id="btn-save-profile" style="background: #059669; color: #ffffff; padding: 11px 22px; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.2s; align-self: flex-start; box-shadow: 0 2px 6px rgba(5,150,105,0.3);">
                        Simpan Perubahan
                    </button>
                </form>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;">

                <h4 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">Ganti Password</h4>
                <p style="font-size: 13px; color: #64748b; margin: 0 0 16px 0;">Masukkan password baru jika Anda ingin memperbarui keamanan akun Anda.</p>

                <form id="public-password-form" onsubmit="handleChangePassword(event)" style="display: flex; flex-direction: column; gap: 16px;">
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">Password Saat Ini</label>
                        <input type="password" id="prof-old-pass" required placeholder="Masukkan password saat ini" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; background: #ffffff;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">Password Baru</label>
                        <input type="password" id="prof-new-pass" required placeholder="Minimal 6 karakter" minlength="6" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; background: #ffffff;">
                    </div>
                    <button type="submit" id="btn-save-pass" style="background: #334155; color: #ffffff; padding: 11px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.2s; align-self: flex-start;">
                        Perbarui Password
                    </button>
                </form>
            </div>
        </div>
    </main>

    <script>
        function switchProfileTab(tabId, btn) {
            document.querySelectorAll('.profile-tab-content').forEach(function(el) {
                el.style.display = 'none';
            });
            document.querySelectorAll('.profile-tab-btn').forEach(function(b) {
                b.style.color = '#64748b';
                b.style.borderBottom = 'none';
                b.classList.remove('active');
            });

            var target = document.getElementById('tab-' + tabId);
            if (target) target.style.display = 'block';

            if (btn) {
                btn.style.color = '#059669';
                btn.style.borderBottom = '3px solid #059669';
                btn.classList.add('active');
            }
        }

        // Live update URL link preview saat username diketik
        var usernameInput = document.getElementById('prof-username');
        if (usernameInput) {
            usernameInput.addEventListener('input', function() {
                var val = this.value.trim().replace(/^@/, '');
                var previewEl = document.getElementById('preview-profile-url');
                if (previewEl) previewEl.textContent = '/@' + (val || 'username');
            });
        }

        // Handle Avatar File Selection & Upload (Max 1MB)
        function getProfileCookieToken() {
            var match = document.cookie.match(/(?:^|;\s*)labmu_token=([^;]+)/);
            if (match) return decodeURIComponent(match[1]);
            try {
                var local = localStorage.getItem('labmu_token') || localStorage.getItem('admin_token');
                if (local) {
                    setProfileCookieToken(local);
                    return local;
                }
            } catch(e) {}
            return '';
        }
        function setProfileCookieToken(token) {
            if (!token) {
                document.cookie = 'labmu_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
            } else {
                document.cookie = 'labmu_token=' + encodeURIComponent(token) + '; Path=/; Max-Age=2592000; SameSite=Lax';
            }
            try {
                localStorage.removeItem('labmu_token');
                localStorage.removeItem('admin_token');
                localStorage.removeItem('labmu_user');
            } catch(e) {}
        }

        async function handleAvatarFileSelect(input) {
            var file = input.files && input.files[0];
            if (!file) return;

            var alertEl = document.getElementById('profile-alert');
            var statusEl = document.getElementById('avatar-upload-status');
            var previewImg = document.getElementById('avatar-preview-img');
            var previewFallback = document.getElementById('avatar-preview-fallback');
            var token = getProfileCookieToken();

            // Validasi Ukuran: Maksimal 1MB (1024 * 1024 bytes = 1048576 bytes)
            var MAX_BYTES = 1024 * 1024;
            if (file.size > MAX_BYTES) {
                alertEl.style.display = 'block';
                alertEl.style.background = '#fee2e2';
                alertEl.style.color = '#991b1b';
                alertEl.style.border = '1px solid #fecaca';
                alertEl.textContent = 'Ukuran berkas melebihi batas maksimal 1MB! (Ukuran berkas Anda: ' + (file.size / (1024 * 1024)).toFixed(2) + ' MB)';
                input.value = '';
                return;
            }

            // Tampilkan preview instan
            if (previewImg) {
                previewImg.src = URL.createObjectURL(file);
                previewImg.style.display = 'block';
                if (previewFallback) previewFallback.style.display = 'none';
            }

            // Langsung unggah ke backend
            if (statusEl) statusEl.textContent = 'Mengunggah avatar...';
            var formData = new FormData();
            formData.append('avatar', file);

            try {
                var res = await fetch('/api/public/profile/upload-avatar', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    body: formData
                });
                var data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Gagal mengunggah foto avatar');

                document.getElementById('prof-avatar').value = data.url;
                if (data.token) {
                    setProfileCookieToken(data.token);
                }

                if (statusEl) {
                    statusEl.textContent = '✓ Foto avatar berhasil diunggah!';
                    statusEl.style.color = '#059669';
                }
                alertEl.style.display = 'block';
                alertEl.style.background = '#d1fae5';
                alertEl.style.color = '#065f46';
                alertEl.style.border = '1px solid #a7f3d0';
                alertEl.textContent = 'Foto avatar berhasil diunggah dan disimpan!';
            } catch (err) {
                if (statusEl) {
                    statusEl.textContent = 'Gagal upload: ' + err.message;
                    statusEl.style.color = '#dc2626';
                }
                alertEl.style.display = 'block';
                alertEl.style.background = '#fee2e2';
                alertEl.style.color = '#991b1b';
                alertEl.style.border = '1px solid #fecaca';
                alertEl.textContent = err.message;
            }
        }

        async function handleUpdateProfile(e) {
            e.preventDefault();
            var alertEl = document.getElementById('profile-alert');
            var btn = document.getElementById('btn-save-profile');
            var token = getProfileCookieToken();
            if (!token) {
                alert('Sesi login telah berakhir. Silakan masuk kembali.');
                return;
            }

            var name = document.getElementById('prof-name').value;
            var username = document.getElementById('prof-username').value;
            var email = document.getElementById('prof-email').value;
            var avatar = document.getElementById('prof-avatar').value;

            btn.disabled = true;
            btn.textContent = 'Menyimpan...';

            try {
                var res = await fetch('/api/public/profile/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ name: name, username: username, email: email, avatar: avatar })
                });
                var data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Gagal menyimpan profil');

                if (data.token) {
                    setProfileCookieToken(data.token);
                }

                alertEl.style.display = 'block';
                alertEl.style.background = '#d1fae5';
                alertEl.style.color = '#065f46';
                alertEl.style.border = '1px solid #a7f3d0';
                alertEl.textContent = 'Profil berhasil diperbarui!';

                // Jika username berubah, redirect ke URL profil baru
                setTimeout(function() {
                    if (data.usernameChanged && data.newUsername) {
                        window.location.href = '/@' + encodeURIComponent(data.newUsername);
                    } else {
                        window.location.reload();
                    }
                }, 1000);
            } catch (err) {
                alertEl.style.display = 'block';
                alertEl.style.background = '#fee2e2';
                alertEl.style.color = '#991b1b';
                alertEl.style.border = '1px solid #fecaca';
                alertEl.textContent = err.message;
            } finally {
                btn.disabled = false;
                btn.textContent = 'Simpan Perubahan';
            }
        }

        async function handleChangePassword(e) {
            e.preventDefault();
            var alertEl = document.getElementById('profile-alert');
            var btn = document.getElementById('btn-save-pass');
            var token = getProfileCookieToken();
            if (!token) {
                alert('Sesi login telah berakhir. Silakan masuk kembali.');
                return;
            }

            var oldPassword = document.getElementById('prof-old-pass').value;
            var newPassword = document.getElementById('prof-new-pass').value;

            btn.disabled = true;
            btn.textContent = 'Memproses...';

            try {
                var res = await fetch('/api/public/profile/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ oldPassword: oldPassword, newPassword: newPassword })
                });
                var data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Gagal mengganti password');

                alertEl.style.display = 'block';
                alertEl.style.background = '#d1fae5';
                alertEl.style.color = '#065f46';
                alertEl.style.border = '1px solid #a7f3d0';
                alertEl.textContent = 'Password berhasil diganti!';
                document.getElementById('public-password-form').reset();
            } catch (err) {
                alertEl.style.display = 'block';
                alertEl.style.background = '#fee2e2';
                alertEl.style.color = '#991b1b';
                alertEl.style.border = '1px solid #fecaca';
                alertEl.textContent = err.message;
            } finally {
                btn.disabled = false;
                btn.textContent = 'Perbarui Password';
            }
        }
    </script>
    `;

  return this._layout(content, `Profil @${username}`, ctx);
}
