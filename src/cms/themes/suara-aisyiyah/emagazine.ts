import { escapeHtml } from "./utils";

export function renderMajalahList(this: any, ctx: any) {
  const list = ctx.data || [];
  const title = "E-Majalah Suara 'Aisyiyah — Edisi Cetak Digital";
  const pagination = ctx.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: list.length,
    limit: 12,
    q: "",
    year: "",
  };

  function makeFilterUrl(chipYear: string) {
    const params = new URLSearchParams();
    if (chipYear) params.set("year", chipYear);
    if (pagination.q) params.set("q", pagination.q);
    const qs = params.toString();
    return "/majalah" + (qs ? "?" + qs : "");
  }

  function makePageUrl(p: number) {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (pagination.q) params.set("q", pagination.q);
    if (pagination.year) params.set("year", pagination.year);
    const qs = params.toString();
    return "/majalah" + (qs ? "?" + qs : "");
  }

  let content = `
    <main class="container sa-style-158" role="main" style="padding-top:40px; padding-bottom:80px;">
        <div style="text-align:center; max-width:700px; margin:0 auto 30px auto;">
            <span style="display:inline-block; background:#e6f4ef; color:#00885e; padding:6px 14px; border-radius:20px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">
                <i class="fas fa-book-open"></i> Edisi Cetak Digital
            </span>
            <h1 style="font-size:32px; font-weight:800; color:#1e293b; margin:0 0 12px 0; font-family:'Playfair Display', serif;">E-Majalah Suara 'Aisyiyah</h1>
            <p style="font-size:16px; color:#64748b; line-height:1.6; margin:0;">
                Nikmati pengalaman membaca majalah bulanan Suara 'Aisyiyah cetak secara digital dengan tampilan lembaran interaktif yang dapat dibaca kapan saja dan di mana saja.
            </p>
        </div>

        <!-- SEARCH BAR & FILTER CHIPS -->
        <div style="max-width:720px; margin:0 auto 32px auto;">
            <form method="GET" action="/majalah" style="display:flex; gap:8px; background:#fff; padding:6px; border-radius:12px; border:1px solid #cbd5e1; box-shadow:0 2px 10px rgba(0,0,0,0.04); align-items:center;">
                <i class="fas fa-search" style="color:#94a3b8; margin-left:12px; font-size:15px;"></i>
                <input type="text" name="q" value="${escapeHtml(pagination.q || "")}" placeholder="Cari judul, topik, nomor edisi, atau tahun..." style="flex:1; border:none; outline:none; font-size:14px; padding:8px 6px; color:#1e293b; background:transparent;">
                ${pagination.year ? `<input type="hidden" name="year" value="${escapeHtml(pagination.year)}">` : ""}
                ${
                  pagination.q
                    ? `
                    <a href="${makeFilterUrl(pagination.year)}" style="color:#94a3b8; padding:6px 10px; text-decoration:none; font-size:14px; display:inline-flex; align-items:center;" title="Hapus pencarian">
                        <i class="fas fa-times-circle"></i>
                    </a>
                `
                    : ""
                }
                <button type="submit" style="background:#059669; color:#fff; border:none; padding:10px 20px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px; transition:background 0.2s;" onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">
                    Cari
                </button>
            </form>

            <!-- Quick Year & Status Filter Chips -->
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:center; margin-top:14px;">
                <span style="font-size:12px; font-weight:700; color:#64748b; margin-right:4px;"><i class="fas fa-filter"></i> Filter:</span>
                ${[
                  { label: "Semua Edisi", val: "" },
                  { label: "2026", val: "2026" },
                  { label: "2022", val: "2022" },
                  { label: "2021", val: "2021" },
                  { label: "2020", val: "2020" },
                  { label: "2019", val: "2019" },
                  { label: "Bebas Akses", val: "free" },
                ]
                  .map(chip => {
                    const isActive = (pagination.year || "") === chip.val;
                    return `
                        <a href="${makeFilterUrl(chip.val)}" style="padding:6px 13px; border-radius:20px; font-size:12px; font-weight:600; text-decoration:none; transition:all 0.2s; ${isActive ? "background:#059669; color:#fff; box-shadow:0 2px 6px rgba(5,150,105,0.3); border:1px solid #059669;" : "background:#fff; color:#475569; border:1px solid #cbd5e1;"}" onmouseover="${!isActive ? "this.style.borderColor='#059669'; this.style.color='#059669';" : ""}" onmouseout="${!isActive ? "this.style.borderColor='#cbd5e1'; this.style.color='#475569';" : ""}">
                            ${escapeHtml(chip.label)}
                        </a>
                    `;
                  })
                  .join("")}
            </div>
        </div>

        <!-- SEARCH / FILTER INFO COUNTER -->
        ${
          pagination.q || pagination.year
            ? `
            <div style="max-width:1200px; margin:0 auto 24px auto; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; font-size:13px; color:#64748b; background:#f8fafc; padding:12px 18px; border-radius:10px; border:1px solid #e2e8f0;">
                <div>
                    Menemukan <strong>${pagination.totalItems}</strong> edisi majalah
                    ${pagination.q ? ` untuk kata kunci "<strong>${escapeHtml(pagination.q)}</strong>"` : ""}
                    ${pagination.year ? ` (kategori: <strong>${pagination.year === "free" ? "Bebas Akses" : "Tahun " + escapeHtml(pagination.year)}</strong>)` : ""}
                </div>
                <a href="/majalah" style="color:#059669; text-decoration:none; font-weight:600; display:inline-flex; align-items:center; gap:5px;">
                    <i class="fas fa-undo"></i> Reset Filter
                </a>
            </div>
        `
            : ""
        }

        ${
          !list.length
            ? `
            <div style="text-align:center; padding:60px 20px; background:#fff; border-radius:16px; border:1px dashed #cbd5e1; max-width:600px; margin:0 auto;">
                <i class="fas fa-book-open" style="font-size:42px; color:#cbd5e1; margin-bottom:15px; display:block;"></i>
                <h3 style="color:#475569; margin:0 0 8px 0;">Tidak Ada Edisi Ditemukan</h3>
                <p style="color:#94a3b8; margin:0 0 18px 0; font-size:14px;">Tidak ada edisi majalah yang sesuai dengan kata kunci atau filter pencarian Anda.</p>
                <a href="/majalah" style="display:inline-flex; align-items:center; gap:6px; background:#059669; color:#fff; padding:8px 18px; border-radius:8px; font-size:13px; font-weight:600; text-decoration:none;">
                    <i class="fas fa-th-large"></i> Lihat Semua Edisi
                </a>
            </div>
        `
            : `
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:28px;">
                ${list
                  .map(
                    (m: any) => `
                    <div class="card" style="background:#fff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 4px 12px rgba(0,0,0,0.04); display:flex; flex-direction:column; transition:transform 0.2s, box-shadow 0.2s;">
                        <a href="/majalah/${escapeHtml(m.slug)}" style="position:relative; display:block; aspect-ratio:3/4; overflow:hidden; background:#f1f5f9;">
                            <img src="${escapeHtml(m.coverImage || "/api/media/file/images/default-cover.jpg")}" alt="${escapeHtml(m.title)}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                            <div style="position:absolute; top:12px; right:12px;">
                                ${
                                  m.isFree === 1
                                    ? `
                                    <span style="background:rgba(2, 132, 199, 0.9); color:#fff; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; backdrop-filter:blur(4px);">
                                        <i class="fas fa-lock-open"></i> Bebas Akses
                                    </span>
                                `
                                    : `
                                    <span style="background:rgba(180, 83, 9, 0.9); color:#fff; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; backdrop-filter:blur(4px);">
                                        <i class="fas fa-crown"></i> Pelanggan Pro
                                    </span>
                                `
                                }
                            </div>
                        </a>
                        <div style="padding:18px; display:flex; flex-direction:column; flex-grow:1; justify-content:space-between;">
                            <div>
                                ${m.editionNumber ? `<div style="font-size:12px; font-weight:700; color:#059669; margin-bottom:4px;">${escapeHtml(m.editionNumber)}</div>` : ""}
                                <h3 style="margin:0 0 8px 0; font-size:16px; font-weight:700; color:#0f172a; line-height:1.4;">
                                    <a href="/majalah/${escapeHtml(m.slug)}" style="text-decoration:none; color:inherit;">${escapeHtml(m.title)}</a>
                                </h3>
                                ${m.publicationDate ? `<div style="font-size:13px; color:#64748b; margin-bottom:12px;"><i class="far fa-calendar-alt"></i> ${escapeHtml(m.publicationDate)}</div>` : ""}
                            </div>
                            <a href="/majalah/${escapeHtml(m.slug)}" style="display:inline-flex; align-items:center; justify-content:center; gap:8px; width:100%; background:#059669; color:#fff; padding:10px; border-radius:8px; font-weight:600; font-size:13px; text-decoration:none; box-sizing:border-box; transition:background 0.2s;" onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">
                                <i class="fas fa-book-reader"></i> Buka E-Majalah
                            </a>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>

            <!-- PAGINATION CONTROLS -->
            ${
              pagination.totalPages > 1
                ? `
                <div style="display:flex; justify-content:center; align-items:center; gap:8px; margin-top:48px; flex-wrap:wrap;">
                    ${
                      pagination.currentPage > 1
                        ? `
                        <a href="${makePageUrl(pagination.currentPage - 1)}" style="display:inline-flex; align-items:center; gap:6px; padding:8px 16px; background:#fff; border:1px solid #cbd5e1; border-radius:8px; color:#334155; font-size:13px; font-weight:600; text-decoration:none; transition:all 0.2s;" onmouseover="this.style.borderColor='#059669'; this.style.color='#059669';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.color='#334155';">
                            <i class="fas fa-chevron-left"></i> Sebelumnya
                        </a>
                    `
                        : `
                        <span style="display:inline-flex; align-items:center; gap:6px; padding:8px 16px; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:8px; color:#94a3b8; font-size:13px; font-weight:600; cursor:not-allowed;">
                            <i class="fas fa-chevron-left"></i> Sebelumnya
                        </span>
                    `
                    }

                    <div style="display:flex; gap:6px; align-items:center;">
                        ${Array.from(
                          { length: pagination.totalPages },
                          (_, i) => i + 1
                        )
                          .map(p => {
                            const isCurrent = p === pagination.currentPage;
                            return `
                                <a href="${makePageUrl(p)}" style="display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:8px; font-size:13px; font-weight:700; text-decoration:none; transition:all 0.2s; ${isCurrent ? "background:#059669; color:#fff; box-shadow:0 2px 6px rgba(5,150,105,0.3);" : "background:#fff; color:#475569; border:1px solid #cbd5e1;"}" onmouseover="${!isCurrent ? "this.style.borderColor='#059669'; this.style.color='#059669';" : ""}" onmouseout="${!isCurrent ? "this.style.borderColor='#cbd5e1'; this.style.color='#475569';" : ""}">
                                    ${p}
                                </a>
                            `;
                          })
                          .join("")}
                    </div>

                    ${
                      pagination.currentPage < pagination.totalPages
                        ? `
                        <a href="${makePageUrl(pagination.currentPage + 1)}" style="display:inline-flex; align-items:center; gap:6px; padding:8px 16px; background:#fff; border:1px solid #cbd5e1; border-radius:8px; color:#334155; font-size:13px; font-weight:600; text-decoration:none; transition:all 0.2s;" onmouseover="this.style.borderColor='#059669'; this.style.color='#059669';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.color='#334155';">
                            Selanjutnya <i class="fas fa-chevron-right"></i>
                        </a>
                    `
                        : `
                        <span style="display:inline-flex; align-items:center; gap:6px; padding:8px 16px; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:8px; color:#94a3b8; font-size:13px; font-weight:600; cursor:not-allowed;">
                            Selanjutnya <i class="fas fa-chevron-right"></i>
                        </span>
                    `
                    }
                </div>
            `
                : ""
            }
        `
        }
    </main>
    `;

  return this._layout(content, title, ctx, "page");
}

function renderFallbackHtml(m: any) {
  const defaultCover = "/api/media/file/images/default-cover.jpg";
  const waText = encodeURIComponent(
    `Assalamu'alaikum Redaksi Suara 'Aisyiyah, saya ingin menanyakan ketersediaan naskah E-Majalah: ${m.title || ""}`
  );
  return `
    <div id="missing-pdf-fallback" style="max-width:860px; width:92%; margin:auto; background:#1e293b; border:1px solid #334155; border-radius:18px; padding:32px 28px; box-shadow:0 20px 40px rgba(0,0,0,0.5); display:flex; flex-direction:column; gap:24px; animation:fadeIn 0.3s ease; box-sizing:border-box;">
        <div style="display:flex; flex-direction:row; gap:28px; align-items:flex-start; flex-wrap:wrap;">
            
            <!-- Cover with 3D Book Effect -->
            <div style="flex-shrink:0; width:190px; margin:0 auto;">
                <div style="position:relative; aspect-ratio:3/4; border-radius:10px; overflow:hidden; box-shadow:-8px 10px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1); background:#0f172a;">
                    <img src="${escapeHtml(m.coverImage || defaultCover)}" alt="${escapeHtml(m.title)}" style="width:100%; height:100%; object-fit:cover; display:block;">
                    <div style="position:absolute; inset:0; background:linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(255,255,255,0.1) 4%, transparent 12%); pointer-events:none;"></div>
                </div>
            </div>

            <!-- Details and Status -->
            <div style="flex:1; min-width:280px; display:flex; flex-direction:column; gap:14px;">
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <span style="display:inline-flex; align-items:center; gap:6px; background:#fef3c7; color:#92400e; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:700;">
                        <i class="fas fa-hourglass-half"></i> Edisi Arsip Digital Sedang Disiapkan
                    </span>
                    ${m.editionNumber ? `<span style="background:#334155; color:#94a3b8; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:600;">${escapeHtml(m.editionNumber)}</span>` : ""}
                </div>

                <h2 style="font-size:24px; font-weight:800; color:#f8fafc; margin:0; line-height:1.3; font-family:'Playfair Display', serif;">
                    ${escapeHtml(m.title)}
                </h2>

                <div style="font-size:13px; color:#94a3b8; display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
                    ${m.publicationDate ? `<span><i class="far fa-calendar-alt"></i> Terbit: ${escapeHtml(m.publicationDate)}</span>` : ""}
                    ${m.isFree === 1 ? `<span style="color:#38bdf8;"><i class="fas fa-lock-open"></i> Bebas Akses</span>` : `<span style="color:#fbbf24;"><i class="fas fa-crown"></i> Pelanggan Pro</span>`}
                </div>

                <div style="background:#0f172a; border-left:4px solid #f59e0b; padding:14px 16px; border-radius:0 8px 8px 0; font-size:13px; color:#cbd5e1; line-height:1.6;">
                    <strong>Pemberitahuan Redaksi:</strong> Naskah berkas PDF lengkap untuk edisi arsip ini sedang dalam proses digitalisasi dan kurasi arsip oleh redaksi Suara 'Aisyiyah. Silakan simak mukadimah redaksi atau telusuri edisi lainnya.
                </div>

                <!-- Action Buttons -->
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-top:6px;">
                    <a href="/majalah" style="background:#059669; color:#fff; padding:10px 18px; border-radius:8px; font-size:13px; font-weight:600; text-decoration:none; display:inline-flex; align-items:center; gap:8px; transition:background 0.2s;" onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">
                        <i class="fas fa-arrow-left"></i> Kembali ke Galeri Majalah
                    </a>
                    <a href="https://wa.me/6281234567890?text=${waText}" target="_blank" style="background:#25D366; color:#fff; padding:10px 16px; border-radius:8px; font-size:13px; font-weight:600; text-decoration:none; display:inline-flex; align-items:center; gap:8px;">
                        <i class="fab fa-whatsapp"></i> Hubungi Redaksi
                    </a>
                </div>

                <!-- Admin Shortcut -->
                <div id="admin-upload-notice" style="display:none; margin-top:6px; padding:10px 14px; background:rgba(59, 130, 246, 0.1); border:1px solid rgba(59, 130, 246, 0.3); border-radius:8px;">
                    <div style="font-size:12px; color:#93c5fd; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
                        <span><i class="fas fa-user-shield"></i> Anda masuk sebagai Pengelola/Redaksi.</span>
                        <a href="/admin/emagazine" style="background:#2563eb; color:#fff; padding:6px 12px; border-radius:6px; font-size:11px; font-weight:600; text-decoration:none; display:inline-flex; align-items:center; gap:5px;">
                            <i class="fas fa-upload"></i> Unggah Berkas di Admin
                        </a>
                    </div>
                </div>

            </div>
        </div>

        <!-- Editorial Preview (if description exists) -->
        ${
          m.description
            ? `
        <div style="background:#0f172a; border:1px solid #334155; border-radius:12px; padding:20px; margin-top:4px;">
            <h3 style="margin:0 0 10px 0; font-size:15px; font-weight:700; color:#38bdf8; display:flex; align-items:center; gap:8px;">
                <i class="fas fa-feather-alt"></i> Mukadimah & Catatan Redaksi Edisi Ini
            </h3>
            <div style="font-size:13px; color:#cbd5e1; line-height:1.7; max-height:260px; overflow-y:auto; padding-right:8px;">
                ${escapeHtml(m.description).replace(/\n/g, "<br>")}
            </div>
        </div>
        `
            : ""
        }

    </div>
    `;
}

export function renderMajalahReader(this: any, ctx: any) {
  const m = ctx.data;
  if (!m) return this.render404(ctx);

  const title = `${escapeHtml(m.title)} — E-Majalah Suara 'Aisyiyah`;
  const previewPages = m.previewPages || 5;
  const isFree = m.isFree === 1;
  const hasPdf = m.hasPdf !== false;

  let content = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>${title}</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <style>
            * { box-sizing: border-box; }
            body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            
            /* Flipbook Styles */
            .flipbook-viewport {
                position: relative;
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 16px 10px;
            }
            .flipbook-container {
                position: relative;
                width: 100%;
                height: 100%;
                max-width: 100%;
                max-height: 100%;
                transition: transform 0.2s ease-out;
                transform-origin: center center;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .st-page-flip {
                margin: 0 auto;
                box-shadow: 0 15px 35px rgba(0,0,0,0.6);
            }
            .flip-page {
                background-color: #fff;
                overflow: hidden;
                position: relative;
            }
            .flip-page[data-density="hard"] {
                background-color: #f1f5f9;
            }
            
            /* Side Arrows */
            .side-nav-btn {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 46px;
                height: 46px;
                border-radius: 50%;
                background: rgba(15, 23, 42, 0.75);
                backdrop-filter: blur(6px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 50;
                transition: all 0.2s ease;
                box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            }
            .side-nav-btn:hover {
                background: #059669;
                border-color: #10b981;
                transform: translateY(-50%) scale(1.08);
            }
            .side-prev { left: 16px; }
            .side-next { right: 16px; }
            @media (max-width: 640px) {
                .side-nav-btn { display: none; }
            }
            @media print {
                body, html, #reader-wrapper { display: none !important; }
            }
            .canvas-protection-shield {
                position: absolute;
                inset: 0;
                z-index: 3;
                background: transparent;
                pointer-events: auto;
                user-select: none;
                -webkit-user-select: none;
            }
        </style>
    </head>
    <body>
    <div id="reader-wrapper" style="background:#0f172a; height:100vh; width:100vw; color:#fff; display:flex; flex-direction:column; overflow:hidden; user-select:none;">
        
        <!-- TOP CONTROLS BAR -->
        <header style="background:#1e293b; border-bottom:1px solid #334155; padding:8px 14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; z-index:100; box-shadow:0 2px 8px rgba(0,0,0,0.3);">
            <!-- Left Info -->
            <div style="display:flex; align-items:center; gap:10px;">
                <a href="/majalah" style="background:#334155; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; text-decoration:none; display:inline-flex; align-items:center; gap:6px; transition:background 0.2s;" onmouseover="this.style.background='#475569'" onmouseout="this.style.background='#334155'">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    <span>Kembali</span>
                </a>
                <div style="max-width:280px;">
                    <h1 style="font-size:14px; font-weight:700; margin:0; color:#f8fafc; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        ${escapeHtml(m.title)}
                    </h1>
                    <div style="font-size:10px; color:#94a3b8;">
                        ${m.editionNumber ? escapeHtml(m.editionNumber) + " &bull; " : ""}
                        ${m.publicationDate ? escapeHtml(m.publicationDate) : ""}
                    </div>
                </div>
            </div>

            <!-- Page Controls -->
            <div id="page-controls-container" style="display:flex; align-items:center; gap:6px;">
                ${
                  hasPdf
                    ? `
                    <button id="prev-page-btn" onclick="flipbookPrev()" title="Halaman Sebelumnya" style="background:#334155; color:#fff; border:none; width:34px; height:34px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; transition:background 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#334155'">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <div style="font-size:12px; font-weight:600; min-width:105px; text-align:center; background:#0f172a; padding:6px 10px; border-radius:6px; border:1px solid #334155;">
                        Halaman <span id="current-page-num" style="color:#34d399; font-weight:700;">1</span> / <span id="total-pages-num">-</span>
                    </div>
                    <button id="next-page-btn" onclick="flipbookNext()" title="Halaman Berikutnya" style="background:#334155; color:#fff; border:none; width:34px; height:34px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; transition:background 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#334155'">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                `
                    : `
                    <div style="font-size:12px; font-weight:600; min-width:105px; text-align:center; background:#0f172a; padding:6px 12px; border-radius:6px; border:1px solid #334155; color:#f59e0b;">
                        <i class="fas fa-archive"></i> Edisi Arsip
                    </div>
                `
                }
            </div>

            <!-- View & Zoom Controls -->
            <div id="view-controls-container" style="display:${hasPdf ? "flex" : "none"}; align-items:center; gap:6px;">
                <button onclick="zoomFlipbook(-0.15)" title="Perkecil" style="background:#334155; color:#fff; border:none; width:34px; height:34px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; transition:background 0.2s;" onmouseover="this.style.background='#475569'" onmouseout="this.style.background='#334155'">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                </button>
                <span id="zoom-level" onclick="resetZoom()" title="Klik untuk reset 100%" style="font-size:11px; color:#cbd5e1; min-width:36px; text-align:center; font-weight:600; cursor:pointer;">100%</span>
                <button onclick="zoomFlipbook(0.15)" title="Perbesar" style="background:#334155; color:#fff; border:none; width:34px; height:34px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; transition:background 0.2s;" onmouseover="this.style.background='#475569'" onmouseout="this.style.background='#334155'">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                </button>
                <button id="fullscreen-btn" onclick="toggleReaderFullscreen()" title="Layar Penuh" style="background:#059669; color:#fff; border:none; width:34px; height:34px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    <span id="fullscreen-icon" style="display:inline-flex; align-items:center; justify-content:center;">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                    </span>
                </button>
            </div>
        </header>

        <!-- VIEWER VIEWPORT -->
        <main class="flipbook-viewport" id="reader-viewport">
            ${
              hasPdf
                ? `
                <!-- Side Arrows for Easy Navigation -->
                <button class="side-nav-btn side-prev" onclick="flipbookPrev()" title="Halaman Sebelumnya">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button class="side-nav-btn side-next" onclick="flipbookNext()" title="Halaman Berikutnya">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>

                <!-- LOADING INDICATOR -->
                <div id="reader-loading" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:50px 20px; width:100%; max-width:340px; z-index:20;">
                    <div style="border:4px solid #334155; border-top:4px solid #059669; border-radius:50%; width:44px; height:44px; animation:spin 0.8s linear infinite; margin-bottom:18px;"></div>
                    <div id="loading-status-text" style="color:#f8fafc; font-size:15px; font-weight:600; margin-bottom:10px; text-align:center;">Mempersiapkan flipbook majalah...</div>
                    <div style="width:100%; height:6px; background:#1e293b; border-radius:4px; overflow:hidden; margin-bottom:8px; box-shadow:inset 0 1px 2px rgba(0,0,0,0.4);">
                        <div id="loading-progress-bar" style="width:10%; height:100%; background:linear-gradient(90deg, #059669, #10b981); transition:width 0.2s ease;"></div>
                    </div>
                    <div id="loading-progress-text" style="color:#94a3b8; font-size:12px;">Menghubungkan berkas digital...</div>
                </div>

                <!-- FLIPBOOK CONTAINER -->
                <div id="flipbook-zoom-container" class="flipbook-container" style="display:none;">
                    <div id="flipbook" class="st-page-flip"></div>
                </div>
            `
                : `
                ${renderFallbackHtml(m)}
            `
            }
        </main>
    </div>

    <!-- Hidden Template for Dynamic Fallback if PDF load fails -->
    <template id="fallback-template">
        ${renderFallbackHtml(m)}
    </template>

    <!-- PDF.js & StPageFlip 3D Engine -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js"></script>

    <script>
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        var hasPdf = ${hasPdf ? "true" : "false"};
        var pdfDoc = null;
        var pageFlip = null;
        var scale = 1.0;
        var maxPreview = ${previewPages};
        var isFree = ${isFree};
        var isSubscriber = false;
        var renderedSet = new Set();

        // Check subscriber or admin auth via Cookie & purge localStorage
        function getAuthCookieToken() {
            var parts = (document.cookie || '').split(';');
            for (var i = 0; i < parts.length; i++) {
                var p = parts[i].trim();
                if (p.indexOf('labmu_token=') === 0) {
                    return decodeURIComponent(p.substring(12));
                }
            }
            return '';
        }

        var token = getAuthCookieToken();
        try {
            if (window.__origLsRemove) {
                window.__origLsRemove.call(window.localStorage, 'labmu_token');
                window.__origLsRemove.call(window.localStorage, 'admin_token');
                window.__origLsRemove.call(window.localStorage, 'labmu_user');
            }
        } catch(e) {}

        // Anti-Copy & Anti-Download Security Protection Suite
        document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; });
        document.addEventListener('selectstart', function(e) { e.preventDefault(); return false; });
        document.addEventListener('dragstart', function(e) { e.preventDefault(); return false; });
        document.addEventListener('copy', function(e) { e.preventDefault(); return false; });

        window.addEventListener('keydown', function(e) {
            var k = (e.key || '').toLowerCase();
            // Cegah Ctrl/Cmd + S (Save), P (Print), C (Copy), U (View Source), A (Select All)
            if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'c', 'u', 'a'].includes(k)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Cegah F12 dan DevTools Shortcut (Ctrl/Cmd + Shift + I/J/C)
            if (k === 'f12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(k))) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, true);

        try {
            if (token) {
                var syncPayload = JSON.parse(atob(token));
                var syncRole = (syncPayload && syncPayload.role ? syncPayload.role : '').toLowerCase();
                if (['admin', 'editor', 'subscriber_pro', 'pro', 'premium'].includes(syncRole)) {
                    isSubscriber = true;
                }
            }
        } catch(e) {}

        function unlockAllPages() {
            isSubscriber = true;
            var lockOverlays = document.querySelectorAll('.magazine-lock-overlay');
            if (lockOverlays.length > 0) {
                lockOverlays.forEach(function(el) {
                    el.remove();
                });
            }
            if (pageFlip) {
                renderSurroundingPages(pageFlip.getCurrentPageIndex());
            }
        }

        function checkAdminShortcut() {
            try {
                if (!token) return;
                var payload = JSON.parse(atob(token));
                if (payload && (payload.role === 'admin' || payload.role === 'editor')) {
                    var notice = document.getElementById('admin-upload-notice');
                    if (notice) notice.style.display = 'block';
                }
            } catch(e) {}
        }
        checkAdminShortcut();

        function showMissingPdfFallback(errMsg) {
            console.warn('PDF load fallback triggered:', errMsg);
            var sideBtns = document.querySelectorAll('.side-nav-btn');
            sideBtns.forEach(function(b) { b.style.display = 'none'; });
            var pageCtrl = document.getElementById('page-controls-container');
            if (pageCtrl) {
                pageCtrl.innerHTML = '<div style="font-size:12px; font-weight:600; min-width:105px; text-align:center; background:#0f172a; padding:6px 12px; border-radius:6px; border:1px solid #334155; color:#f59e0b;"><i class="fas fa-archive"></i> Edisi Arsip</div>';
            }
            var viewCtrl = document.getElementById('view-controls-container');
            if (viewCtrl) viewCtrl.style.display = 'none';

            var tmpl = document.getElementById('fallback-template');
            var vp = document.getElementById('reader-viewport');
            if (tmpl && vp) {
                vp.innerHTML = tmpl.innerHTML;
                checkAdminShortcut();
            }
        }

        var streamUrl = '/api/public/emagazine/${escapeHtml(m.slug)}/stream' + (token ? '?token=' + encodeURIComponent(token) : '');

        fetch('/api/public/emagazine/${escapeHtml(m.slug)}' + (token ? '?token=' + encodeURIComponent(token) : ''))
            .then(function(r) { return r.json(); })
            .then(function(meta) {
                if (meta && meta.isSubscriber) {
                    unlockAllPages();
                }
                if (meta && meta.hasPdf === false && hasPdf) {
                    showMissingPdfFallback('PDF belum diunggah ke storage');
                }
            }).catch(function(){});

        if (hasPdf) {
            // Initialize and Load Document with auth headers for range chunk requests
            var pdfHeaders = {};
            if (token) {
                pdfHeaders['Authorization'] = 'Bearer ' + token;
            }

            var loadingTask = pdfjsLib.getDocument({
                url: streamUrl,
                httpHeaders: pdfHeaders,
                rangeChunkSize: 524288,
                disableAutoFetch: false,
                disableStream: false
            });

            loadingTask.onProgress = function(progress) {
                if (progress && progress.total > 0) {
                    var pct = Math.min(100, Math.round((progress.loaded / progress.total) * 100));
                    var mbLoaded = (progress.loaded / (1024 * 1024)).toFixed(1);
                    var mbTotal = (progress.total / (1024 * 1024)).toFixed(1);
                    var statusElem = document.getElementById('loading-status-text');
                    var barElem = document.getElementById('loading-progress-bar');
                    var textElem = document.getElementById('loading-progress-text');
                    if (statusElem) statusElem.textContent = 'Memuat Majalah: ' + pct + '%';
                    if (barElem) barElem.style.width = Math.max(10, pct) + '%';
                    if (textElem) textElem.textContent = mbLoaded + ' MB / ' + mbTotal + ' MB';
                }
            };

            loadingTask.promise.then(function(doc) {
                pdfDoc = doc;
                var totalElem = document.getElementById('total-pages-num');
                if (totalElem) totalElem.textContent = pdfDoc.numPages;

                // Fetch page 1 dimensions to set aspect ratio
                pdfDoc.getPage(1).then(function(firstPage) {
                    var viewport = firstPage.getViewport({ scale: 1.0 });
                    var pageWidth = Math.round(viewport.width);
                    var pageHeight = Math.round(viewport.height);

                    // Build DOM Elements for Flipbook
                    buildFlipbookDOM(pageWidth, pageHeight);
                });
            }).catch(function(err) {
                console.error('PDF Load Error:', err);
                showMissingPdfFallback(err.message);
            });
        }

        function buildFlipbookDOM(baseWidth, baseHeight) {
            var flipbook = document.getElementById('flipbook');
            flipbook.innerHTML = '';

            for (var i = 1; i <= pdfDoc.numPages; i++) {
                var isHard = (i === 1 || i === pdfDoc.numPages);
                var pageDiv = document.createElement('div');
                pageDiv.className = 'flip-page';
                pageDiv.setAttribute('data-density', isHard ? 'hard' : 'soft');

                var isLocked = (!isFree && !isSubscriber && i > maxPreview);

                pageDiv.innerHTML = '<div style="width:100%; height:100%; background:#fff; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; user-select:none; -webkit-user-select:none;">' +
                    '<canvas id="canvas-page-' + i + '" style="width:100%; height:100%; object-fit:contain; display:block; pointer-events:none; user-select:none;"></canvas>' +
                    '<div class="canvas-protection-shield" oncontextmenu="return false;"></div>' +
                    '<div id="loader-page-' + i + '" style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f8fafc; color:#94a3b8; font-size:12px; gap:8px;">' +
                        '<div style="border:3px solid #e2e8f0; border-top:3px solid #059669; border-radius:50%; width:24px; height:24px; animation:spin 0.8s linear infinite;"></div>' +
                        '<span>Memuat Halaman ' + i + '...</span>' +
                    '</div>' +
                    (isLocked ? (
                        '<div class="magazine-lock-overlay" id="lock-overlay-page-' + i + '" style="position:absolute; inset:0; background:rgba(15,23,42,0.92); backdrop-filter:blur(6px); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; text-align:center; color:#fff; z-index:10;">' +
                            '<div style="width:48px; height:48px; background:#fef3c7; color:#b45309; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:22px; margin-bottom:12px;">' +
                                '<i class="fas fa-lock"></i>' +
                            '</div>' +
                            '<h3 style="font-size:16px; font-weight:700; margin:0 0 8px 0;">Halaman Khusus Pelanggan</h3>' +
                            '<p style="font-size:12px; color:#cbd5e1; margin:0 0 16px 0; line-height:1.5;">Anda telah membaca ' + maxPreview + ' halaman cuplikan gratis. Silakan masuk akun atau berlangganan Pro untuk membuka seluruh edisi.</p>' +
                            '<div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center;">' +
                                '<a href="/admin/login" style="background:#334155; color:#fff; padding:8px 14px; border-radius:6px; font-size:12px; font-weight:600; text-decoration:none;">Masuk</a>' +
                                '<a href="/berlangganan" style="background:#059669; color:#fff; padding:8px 16px; border-radius:6px; font-size:12px; font-weight:700; text-decoration:none;">Langganan Pro</a>' +
                            '</div>' +
                        '</div>'
                    ) : '') +
                '</div>';

                flipbook.appendChild(pageDiv);
            }

            // Calculate responsive dimensions
            var vpWidth = window.innerWidth;
            var vpHeight = window.innerHeight - 60;
            var targetHeight = Math.min(vpHeight * 0.92, 850);
            var aspect = baseWidth / baseHeight;
            var targetWidth = Math.round(targetHeight * aspect);

            if (vpWidth < 768) {
                targetWidth = Math.min(vpWidth * 0.94, 450);
                targetHeight = Math.round(targetWidth / aspect);
            }

            // Initialize StPageFlip
            try {
                pageFlip = new St.PageFlip(flipbook, {
                    width: targetWidth,
                    height: targetHeight,
                    size: 'stretch',
                    minWidth: 260,
                    maxWidth: 750,
                    minHeight: 350,
                    maxHeight: 1100,
                    maxShadowOpacity: 0.45,
                    showCover: true,
                    mobileScrollSupport: false,
                    usePortrait: true
                });

                pageFlip.loadFromHTML(document.querySelectorAll('.flip-page'));

                // Hide loader & display flipbook
                document.getElementById('reader-loading').style.display = 'none';
                document.getElementById('flipbook-zoom-container').style.display = 'flex';

                // Initial render: Cover (Page 1) and upcoming pages
                renderSurroundingPages(0);

                // Events
                pageFlip.on('flip', function(e) {
                    var idx = e.data;
                    updatePageDisplay(idx);
                    renderSurroundingPages(idx);
                });

                pageFlip.on('changeOrientation', function(e) {
                    updatePageDisplay(pageFlip.getCurrentPageIndex());
                });

            } catch (initErr) {
                console.error('PageFlip Init Error:', initErr);
                document.getElementById('reader-loading').style.display = 'none';
                document.getElementById('flipbook-zoom-container').style.display = 'flex';
                renderSurroundingPages(0);
            }
        }

        function updatePageDisplay(pageIdx) {
            var current = pageIdx + 1;
            var displayStr = String(current);
            if (pageFlip && pageFlip.getOrientation() === 'landscape' && pageIdx > 0 && pageIdx < pdfDoc.numPages - 1) {
                displayStr = current + '-' + (current + 1);
            }
            document.getElementById('current-page-num').textContent = displayStr;
        }

        function renderSurroundingPages(pageIdx) {
            var pages = [pageIdx + 1, pageIdx + 2, pageIdx + 3, pageIdx, pageIdx - 1];
            pages.forEach(function(p) {
                if (p >= 1 && p <= pdfDoc.numPages) {
                    if (!isFree && !isSubscriber && p > maxPreview) {
                        var loader = document.getElementById('loader-page-' + p);
                        if (loader) loader.style.display = 'none';
                        return;
                    }
                    renderPageToCanvas(p);
                }
            });
        }

        function renderPageToCanvas(p) {
            if (renderedSet.has(p)) return;
            renderedSet.add(p);

            var canvas = document.getElementById('canvas-page-' + p);
            if (!canvas) return;

            pdfDoc.getPage(p).then(function(page) {
                var viewport = page.getViewport({ scale: 1.5 });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                var ctx = canvas.getContext('2d');

                var renderTask = page.render({ canvasContext: ctx, viewport: viewport });
                renderTask.promise.then(function() {
                    var loader = document.getElementById('loader-page-' + p);
                    if (loader) loader.style.display = 'none';
                }).catch(function(e) {
                    console.error('Page render error ' + p, e);
                });
            });
        }

        // Global Action Controls
        window.flipbookPrev = function() {
            if (pageFlip) pageFlip.flipPrev();
        };

        window.flipbookNext = function() {
            if (pageFlip) pageFlip.flipNext();
        };

        window.zoomFlipbook = function(delta) {
            var newScale = Math.round((scale + delta) * 100) / 100;
            if (newScale < 0.7 || newScale > 2.2) return;
            scale = newScale;
            document.getElementById('zoom-level').textContent = Math.round(scale * 100) + '%';
            var box = document.getElementById('flipbook-zoom-container');
            if (box) box.style.transform = 'scale(' + scale + ')';
        };

        window.resetZoom = function() {
            scale = 1.0;
            document.getElementById('zoom-level').textContent = '100%';
            var box = document.getElementById('flipbook-zoom-container');
            if (box) box.style.transform = 'scale(1)';
        };

        function getFullscreenElement() {
            return document.fullscreenElement ||
                   document.webkitFullscreenElement ||
                   document.mozFullScreenElement ||
                   document.msFullscreenElement || null;
        }

        window.toggleReaderFullscreen = function() {
            var fsElem = getFullscreenElement();
            var docEl = document.documentElement;

            if (!fsElem) {
                if (docEl.requestFullscreen) {
                    docEl.requestFullscreen().catch(function(e) { fallbackElemFullscreen(); });
                } else if (docEl.webkitRequestFullscreen) {
                    docEl.webkitRequestFullscreen();
                } else if (docEl.webkitRequestFullScreen) {
                    docEl.webkitRequestFullScreen();
                } else if (docEl.mozRequestFullScreen) {
                    docEl.mozRequestFullScreen();
                } else if (docEl.msRequestFullscreen) {
                    docEl.msRequestFullscreen();
                } else {
                    fallbackElemFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(function(){});
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        };

        function fallbackElemFullscreen() {
            var elem = document.getElementById('reader-wrapper');
            if (elem) {
                if (elem.requestFullscreen) {
                    elem.requestFullscreen().catch(function(){});
                } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                }
            }
        }

        function updateFullscreenUI() {
            var isFs = !!getFullscreenElement();
            var btn = document.getElementById('fullscreen-btn');
            var icon = document.getElementById('fullscreen-icon');
            if (!btn || !icon) return;

            if (isFs) {
                btn.title = "Keluar Layar Penuh";
                btn.style.background = "#d97706";
                icon.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>';
            } else {
                btn.title = "Layar Penuh";
                btn.style.background = "#059669";
                icon.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
            }

            setTimeout(function() {
                window.dispatchEvent(new Event('resize'));
                if (pageFlip) {
                    try { pageFlip.update(); } catch(e) {}
                }
            }, 150);
        }

        document.addEventListener('fullscreenchange', updateFullscreenUI);
        document.addEventListener('webkitfullscreenchange', updateFullscreenUI);
        document.addEventListener('mozfullscreenchange', updateFullscreenUI);
        document.addEventListener('MSFullscreenChange', updateFullscreenUI);

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight' || e.key === 'PageDown') flipbookNext();
            if (e.key === 'ArrowLeft' || e.key === 'PageUp') flipbookPrev();
        });
    </script>
    </body>
    </html>
    `;

  return content;
}
