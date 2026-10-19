import React, { useState, useEffect } from "react";
import { BLOCK_CATALOG } from "@cmsmu/cms-api/modules/theme-builder/engine/schema";
import { renderBlockToHtml } from "@cmsmu/cms-api/modules/theme-builder/engine/renderer";

function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i].trim();
      if (c.indexOf("labmu_token=") === 0) {
        return decodeURIComponent(c.substring("labmu_token=".length));
      }
    }
    if ((window as any).getCmsToken) {
      const t = (window as any).getCmsToken();
      if (t) return t;
    }
    return (
      localStorage.getItem("labmu_token") ||
      localStorage.getItem("admin_token") ||
      ""
    );
  } catch (e) {
    return "";
  }
}

interface CmsMuCanvasAppProps {
  slug: string;
}

export default function CmsMuCanvasApp({ slug: initialSlug }: CmsMuCanvasAppProps) {
  const [currentSlug, setCurrentSlug] = useState<string>(initialSlug || "home");
  const [pagesList, setPagesList] = useState<Array<{ id: number; title: string; slug: string }>>([]);
  const [activeHomeSlug, setActiveHomeSlug] = useState<string>("home");
  const [isSettingHome, setIsSettingHome] = useState<boolean>(false);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number | null>(0);
  const [realPosts, setRealPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" }>({
    show: false,
    message: "",
    type: "success",
  });

  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  // Muat daftar halaman & data halaman aktif dari endpoint
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = getAuthToken();
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

        // 0. Muat daftar seluruh halaman untuk Dropdown Page Switcher
        try {
          const pagesRes = await fetch(`/api/theme-editor/pages?t=${Date.now()}`, {
            headers: authHeader,
            credentials: "include",
          });
          if (pagesRes.ok) {
            const pagesJson = await pagesRes.json();
            if (Array.isArray(pagesJson.data)) {
              setPagesList(pagesJson.data);
            }
            if (pagesJson.activeHomeSlug || pagesJson.homeSlug) {
              setActiveHomeSlug(pagesJson.activeHomeSlug || pagesJson.homeSlug);
            }
          }
        } catch (e) {
          console.warn("Gagal memuat daftar halaman:", e);
        }

        // 1. Muat artikel riil untuk hidrasi RecentPosts dan MagazineBigGrid
        try {
          const postsRes = await fetch(`/api/posts?limit=9&t=${Date.now()}`, {
            headers: authHeader,
            credentials: "include",
          });
          if (postsRes.ok) {
            const postsData = await postsRes.json();
            if (Array.isArray(postsData)) {
              setRealPosts(postsData);
            }
          }
        } catch (e) {
          console.warn("Gagal fetch real posts untuk canvas preview:", e);
        }

        // 2. Muat data halaman builder
        const res = await fetch(`/api/theme-editor/page?slug=${encodeURIComponent(currentSlug)}&t=${Date.now()}`, {
          headers: authHeader,
          credentials: "include",
        });

        if (res.ok) {
          const result = await res.json();
          if (result.data && result.data.body) {
            try {
              const parsed = JSON.parse(result.data.body);
              if (Array.isArray(parsed.content)) {
                // Normalisasi setiap blok dengan menggabungkan defaultProps dari schema jika prop kosong
                const normalized = parsed.content.map((blk: any) => {
                  const catalog = BLOCK_CATALOG[blk.type];
                  const mergedProps = {
                    ...(catalog?.defaultProps || {}),
                    ...(blk.props || {}),
                  };
                  if (blk.type === "SiteHeader") {
                    if (mergedProps.siteTitle?.includes("CMS Teruji") || !mergedProps.siteTitle) {
                      mergedProps.siteTitle = "cmsMu";
                    }
                    if (mergedProps.headerTextColor === "#334155") {
                      mergedProps.headerTextColor = "";
                    }
                  }
                  return {
                    ...blk,
                    props: mergedProps,
                  };
                });
                setBlocks(normalized);
                if (normalized.length > 0) setSelectedBlockIdx(0);
              } else {
                setBlocks([]);
              }
            } catch (e) {
              console.error("Gagal parse body JSON:", e);
              setBlocks([]);
            }
          } else {
            setBlocks([]);
          }
        }
      } catch (err) {
        console.error("Gagal memuat halaman canvas:", err);
        triggerToast("Gagal memuat data halaman", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentSlug]);

  // Auto-scroll halus ke blok yang sedang aktif di canvas
  useEffect(() => {
    if (selectedBlockIdx !== null) {
      const el = document.getElementById(`canvas-block-${selectedBlockIdx}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedBlockIdx]);

  // Aksi ganti halaman dari dropdown
  const handleSwitchPage = (newSlug: string) => {
    if (!newSlug || newSlug === currentSlug) return;
    setCurrentSlug(newSlug);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("slug", newSlug);
      window.history.pushState({}, "", url.toString());
    }
  };

  // Aksi Jadikan Beranda Utama (set_homepage)
  const handleSetAsHomepage = async () => {
    setIsSettingHome(true);
    try {
      const token = getAuthToken();
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("/api/theme-editor/set-homepage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        credentials: "include",
        body: JSON.stringify({ slug: currentSlug }),
      });
      if (res.ok) {
        setActiveHomeSlug(currentSlug);
        triggerToast(`Halaman '/${currentSlug}' resmi dijadikan Beranda Utama (/)!`, "success");
      } else {
        triggerToast("Gagal mengatur Beranda Utama.", "error");
      }
    } catch (e) {
      triggerToast("Koneksi gagal saat mengatur Beranda.", "error");
    } finally {
      setIsSettingHome(false);
    }
  };

  // Aksi Penyimpanan ke D1
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        slug: currentSlug,
        body: JSON.stringify({
          content: blocks,
          root: {},
          zones: {},
        }),
      };

      const token = getAuthToken();
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("/api/theme-editor/page", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        triggerToast("Halaman berhasil disimpan & disinkronkan ke Live!", "success");
      } else {
        triggerToast("Gagal menyimpan halaman.", "error");
      }
    } catch (e) {
      triggerToast("Koneksi gagal saat menyimpan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Aksi Manajemen Blok
  const handleAddBlock = (type: string) => {
    const catalog = BLOCK_CATALOG[type];
    if (!catalog) return;
    const newBlock = {
      type,
      props: {
        id: `${type}-${Date.now()}`,
        ...catalog.defaultProps,
      },
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockIdx(blocks.length);
    triggerToast(`Blok '${catalog.name}' ditambahkan`, "info");
  };

  const handleMoveBlock = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === blocks.length - 1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    setBlocks(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
    setSelectedBlockIdx(targetIdx);
  };

  const handleDeleteBlock = (idx: number) => {
    setBlocks(prev => prev.filter((_, i) => i !== idx));
    setSelectedBlockIdx(null);
  };

  const handlePropChange = (field: string, val: any) => {
    if (selectedBlockIdx === null) return;
    setBlocks(prev => {
      const copy = [...prev];
      const target = copy[selectedBlockIdx];
      if (target) {
        copy[selectedBlockIdx] = {
          ...target,
          props: {
            ...target.props,
            [field]: val,
          },
        };
      }
      return copy;
    });
  };

  const selectedBlock = selectedBlockIdx !== null ? blocks[selectedBlockIdx] : null;
  const selectedManifest = selectedBlock ? BLOCK_CATALOG[selectedBlock.type] : null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans select-none">
      {/* 🔝 TOP NAVIGATION BAR */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <a
            href="/admin"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            title="Kembali ke Dashboard"
          >
            <i className="fas fa-arrow-left text-xs"></i>
          </a>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">cmsMu Canvas</span>
            {/* Dropdown Pilih Halaman */}
            <div className="flex items-center gap-1.5">
              <select
                id="page-switcher-select"
                value={currentSlug}
                onChange={e => handleSwitchPage(e.target.value)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-emerald-400 border border-emerald-500/40 focus:outline-none focus:border-emerald-400 cursor-pointer"
                title="Pilih Halaman untuk Diedit"
              >
                {pagesList.length > 0 ? (
                  pagesList.map(p => (
                    <option key={p.id} value={p.slug} className="bg-slate-900 text-slate-100">
                      {p.slug}
                    </option>
                  ))
                ) : (
                  <option value={currentSlug}>{currentSlug}</option>
                )}
              </select>

              {currentSlug === activeHomeSlug ? (
                <span
                  className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1"
                  title="Halaman ini sedang aktif sebagai Beranda Utama (/)"
                >
                  <i className="fas fa-home text-[10px]"></i> Beranda Aktif
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSetAsHomepage}
                  disabled={isSettingHome}
                  className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 transition-colors cursor-pointer flex items-center gap-1"
                  title="Jadikan halaman ini sebagai Beranda Utama (/)"
                >
                  <i className="fas fa-home text-[10px]"></i>
                  <span>{isSettingHome ? "Mengatur..." : "Jadikan Beranda"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-all ${
              viewport === "desktop" ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <i className="fas fa-desktop mr-1.5"></i> Desktop
          </button>
          <button
            type="button"
            onClick={() => setViewport("tablet")}
            className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-all ${
              viewport === "tablet" ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <i className="fas fa-tablet-alt mr-1.5"></i> Tablet
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-all ${
              viewport === "mobile" ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <i className="fas fa-mobile-alt mr-1.5"></i> Mobile
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={currentSlug === activeHomeSlug ? "/" : `/${currentSlug}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <i className="fas fa-external-link-alt text-[10px]"></i>
            <span>Buka Live</span>
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <i className={`fas ${isSaving ? "fa-spinner fa-spin" : "fa-save"}`}></i>
            <span>{isSaving ? "Menyimpan..." : "Simpan Halaman"}</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE 3-PANEL LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 📦 PANEL KIRI: KATALOG BLOK & STRUKTUR HALAMAN */}
        <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Susunan Blok</span>
            <span className="text-[11px] font-mono text-slate-500">{blocks.length} blok</span>
          </div>

          {/* List Blok Aktif */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {blocks.map((blk, idx) => (
              <div
                key={blk.props?.id || idx}
                onClick={() => setSelectedBlockIdx(idx)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${
                  selectedBlockIdx === idx
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-bold"
                    : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <i className={`fas ${BLOCK_CATALOG[blk.type]?.icon || "fa-cube"} text-slate-400 text-[11px]`}></i>
                  <span className="truncate">{BLOCK_CATALOG[blk.type]?.name || blk.type}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleMoveBlock(idx, "up")}
                    disabled={idx === 0}
                    className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-20 cursor-pointer"
                    title="Geser ke atas"
                  >
                    <i className="fas fa-chevron-up text-[10px]"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveBlock(idx, "down")}
                    disabled={idx === blocks.length - 1}
                    className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-20 cursor-pointer"
                    title="Geser ke bawah"
                  >
                    <i className="fas fa-chevron-down text-[10px]"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBlock(idx)}
                    className="w-5 h-5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 flex items-center justify-center cursor-pointer"
                    title="Hapus blok"
                  >
                    <i className="fas fa-trash-alt text-[10px]"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tombol Tambah Blok */}
          <div className="p-3 border-t border-slate-800 bg-slate-950">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Tambah Blok Baru
            </span>
            <div className="grid grid-cols-1 gap-1.5 max-h-52 overflow-y-auto pr-1">
              {Object.keys(BLOCK_CATALOG).map(bType => {
                const item = BLOCK_CATALOG[bType];
                return (
                  <button
                    key={bType}
                    type="button"
                    onClick={() => handleAddBlock(bType)}
                    className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80 hover:border-emerald-500/40 text-[11px] text-slate-200 hover:text-white text-left flex items-center justify-between transition-all cursor-pointer group"
                    title={`Tambah ${item.name}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded bg-slate-800 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 transition-colors">
                        <i className={`fas ${item.icon} text-[10px]`}></i>
                      </div>
                      <span className="truncate font-medium">{item.name}</span>
                    </div>
                    <i className="fas fa-plus text-[10px] text-slate-500 group-hover:text-emerald-400 shrink-0"></i>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* 🖥️ PANEL TENGAH: LIVE CANVAS PREVIEW */}
        <main className="flex-1 bg-slate-950 overflow-y-auto flex flex-col items-center p-6 relative scroll-smooth">
          {/* Scoped CSS Injector for Canvas Content */}
          <style dangerouslySetInnerHTML={{ __html: `
            .cmsmu-canvas-content {
              box-sizing: border-box;
              font-family: inherit;
              width: 100%;
            }
            .cmsmu-canvas-content * {
              box-sizing: border-box;
            }
            .cmsmu-canvas-content img {
              max-width: 100%;
            }
            .cmsmu-canvas-content header img {
              max-height: 44px !important;
              height: 44px !important;
              width: auto !important;
              object-fit: contain !important;
              display: block !important;
            }
            .cmsmu-canvas-content footer img {
              max-height: 32px !important;
              height: 32px !important;
              width: auto !important;
              object-fit: contain !important;
              display: block !important;
            }
            .cmsmu-canvas-content .cmsmu-header-outer {
              position: relative !important;
              top: 0 !important;
            }
            .cmsmu-canvas-content .cmsmu-fixed-spacer {
              display: none !important;
            }
            .cmsmu-viewport-mobile .cmsmu-nav-desktop {
              display: none !important;
            }
            .cmsmu-viewport-mobile .cmsmu-mobile-btn {
              display: inline-flex !important;
            }
          `}} />

          {/* Viewport Width Indicator */}
          <div className="mb-3 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              {viewport === "desktop" ? "Desktop (Full Width / 1024px+)" : viewport === "tablet" ? "Tablet Frame (768px)" : "Mobile Frame (375px)"}
            </span>
          </div>

          <div
            className={`transition-all duration-300 bg-white text-slate-900 shadow-2xl rounded-xl border border-slate-800 overflow-hidden flex flex-col h-fit ${
              viewport === "desktop" ? "w-full max-w-5xl" : viewport === "tablet" ? "w-[768px]" : "w-[375px] cmsmu-viewport-mobile"
            }`}
          >
            {isLoading ? (
              <div className="p-16 text-center text-slate-400">
                <i className="fas fa-spinner fa-spin text-2xl text-emerald-600 mb-2"></i>
                <p className="text-xs">Memuat canvas...</p>
              </div>
            ) : blocks.length === 0 ? (
              <div className="p-16 text-center text-slate-400 border-2 border-dashed border-slate-200 m-8 rounded-xl">
                <i className="fas fa-layer-group text-4xl text-slate-300 mb-3 block"></i>
                <h4 className="text-base font-bold text-slate-700">Halaman Masih Kosong</h4>
                <p className="text-xs text-slate-500 mt-1">Pilih blok dari panel kiri untuk mulai menyusun halaman visual Anda.</p>
              </div>
            ) : (
              blocks.map((blk, idx) => {
                const isSelected = selectedBlockIdx === idx;
                const htmlMarkup = renderBlockToHtml(blk, { latestPosts: realPosts });
                return (
                  <div
                    key={blk.props?.id || idx}
                    id={`canvas-block-${idx}`}
                    onClick={() => setSelectedBlockIdx(idx)}
                    className={`relative group cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "ring-4 ring-emerald-500 ring-offset-4 ring-offset-white z-20 shadow-2xl scale-[1.005]"
                        : "hover:ring-2 hover:ring-slate-300"
                    }`}
                  >
                    {/* Badge Label Blok */}
                    <div
                      className={`absolute top-2 left-2 z-20 px-2.5 py-1 rounded-md text-[10px] font-bold shadow-md transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-emerald-600 text-white opacity-100 shadow-emerald-600/40"
                          : "bg-slate-900/80 text-white opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <i className={`fas ${BLOCK_CATALOG[blk.type]?.icon || "fa-cube"} text-[9px]`}></i>
                      <span>{BLOCK_CATALOG[blk.type]?.name || blk.type}</span>
                      {isSelected && (
                        <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-800 text-[9px] uppercase tracking-wider font-mono">
                          Aktif
                        </span>
                      )}
                    </div>

                    {/* Preview HTML */}
                    <div className="cmsmu-canvas-content" dangerouslySetInnerHTML={{ __html: htmlMarkup }} />
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* ⚙️ PANEL KANAN: DYNAMIC PROPERTY INSPECTOR */}
        <aside className="w-80 bg-slate-950 border-l border-slate-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pengaturan Blok</span>
            {selectedManifest && (
              <span className="text-[11px] font-mono text-emerald-400 font-bold">{selectedManifest.name}</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!selectedBlock || !selectedManifest ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <i className="fas fa-mouse-pointer text-2xl text-slate-600 mb-2 block"></i>
                <span>Klik salah satu blok pada canvas untuk mengedit teks dan pengaturannya.</span>
              </div>
            ) : (
              Object.keys(selectedManifest.fields).map(fieldKey => {
                const field = selectedManifest.fields[fieldKey];
                const curVal = selectedBlock.props?.[fieldKey] ?? "";

                if (field.type === "array") {
                  const arrVal = Array.isArray(curVal) ? curVal : [];
                  return (
                    <div key={fieldKey} className="space-y-3 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300 block">
                          {field.label} ({arrVal.length})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newItem: Record<string, any> = {};
                            if (field.arrayFields) {
                              Object.keys(field.arrayFields).forEach(subKey => {
                                newItem[subKey] = field.arrayFields![subKey].defaultValue || "";
                              });
                            }
                            handlePropChange(fieldKey, [...arrVal, newItem]);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all"
                        >
                          <i className="fas fa-plus text-[9px]"></i>
                          <span>Tambah</span>
                        </button>
                      </div>

                      {arrVal.length > 0 ? (
                        <div className="space-y-2.5">
                          {arrVal.map((item: any, itemIdx: number) => {
                            const itemTitle = item.name || item.title || item.label || item.author || `Item #${itemIdx + 1}`;
                            return (
                              <div
                                key={itemIdx}
                                className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2.5 shadow-sm"
                              >
                                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                                  <span className="text-[11px] font-bold text-emerald-400 truncate max-w-[180px]">
                                    #{itemIdx + 1}: {itemTitle}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextArr = [...arrVal];
                                      nextArr.splice(itemIdx, 1);
                                      handlePropChange(fieldKey, nextArr);
                                    }}
                                    className="text-slate-500 hover:text-rose-400 text-xs p-1 transition-colors"
                                    title="Hapus sub-item ini"
                                  >
                                    <i className="fas fa-trash-alt text-[10px]"></i>
                                  </button>
                                </div>

                                {field.arrayFields &&
                                  Object.keys(field.arrayFields).map(subKey => {
                                    const subField = field.arrayFields![subKey];
                                    const subVal = item[subKey] ?? "";

                                    return (
                                      <div key={subKey} className="space-y-1">
                                        <label className="text-[10px] font-medium text-slate-400 block">
                                          {subField.label}
                                        </label>

                                        {subField.type === "textarea" ? (
                                          <textarea
                                            rows={2}
                                            value={subVal}
                                            onChange={e => {
                                              const nextArr = [...arrVal];
                                              nextArr[itemIdx] = { ...nextArr[itemIdx], [subKey]: e.target.value };
                                              handlePropChange(fieldKey, nextArr);
                                            }}
                                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                                          />
                                        ) : subField.type === "select" ? (
                                          <select
                                            value={subVal}
                                            onChange={e => {
                                              const nextArr = [...arrVal];
                                              nextArr[itemIdx] = { ...nextArr[itemIdx], [subKey]: e.target.value };
                                              handlePropChange(fieldKey, nextArr);
                                            }}
                                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                                          >
                                            {(subField.options || []).map(opt => (
                                              <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                              </option>
                                            ))}
                                          </select>
                                        ) : (
                                          <input
                                            type="text"
                                            value={subVal}
                                            placeholder={subField.placeholder || ""}
                                            onChange={e => {
                                              const nextArr = [...arrVal];
                                              nextArr[itemIdx] = { ...nextArr[itemIdx], [subKey]: e.target.value };
                                              handlePropChange(fieldKey, nextArr);
                                            }}
                                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                                          />
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-[11px]">
                          Belum ada item ditambahkan.
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={fieldKey} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">{field.label}</label>

                    {field.type === "textarea" ? (
                      <textarea
                        rows={3}
                        value={curVal}
                        onChange={e => handlePropChange(fieldKey, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={curVal}
                        onChange={e => handlePropChange(fieldKey, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                      >
                        {(field.options || []).map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "color" ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={typeof curVal === "string" && curVal.startsWith("#") && curVal.length === 7 ? curVal : "#ffffff"}
                          onChange={e => handlePropChange(fieldKey, e.target.value)}
                          className="w-8 h-8 rounded border border-slate-700 bg-slate-900 cursor-pointer p-0.5 shrink-0"
                          title="Pilih Warna"
                        />
                        <input
                          type="text"
                          value={curVal}
                          placeholder={fieldKey === "headerTextColor" ? "Otomatis (Adaptif)" : "#ffffff"}
                          onChange={e => handlePropChange(fieldKey, e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                        />
                        {fieldKey === "headerTextColor" && curVal && (
                          <button
                            type="button"
                            onClick={() => handlePropChange(fieldKey, "")}
                            className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-emerald-400 border border-slate-700 cursor-pointer shrink-0"
                            title="Kembalikan ke Warna Kontras Otomatis"
                          >
                            Auto
                          </button>
                        )}
                      </div>
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        value={curVal}
                        onChange={e =>
                          handlePropChange(
                            fieldKey,
                            field.type === "number" ? parseInt(e.target.value, 10) || 0 : e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>

      {/* Floating Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 border transition-all ${
            toast.type === "error"
              ? "bg-rose-900/90 text-rose-100 border-rose-700"
              : toast.type === "info"
              ? "bg-slate-800/90 text-slate-100 border-slate-700"
              : "bg-emerald-900/90 text-emerald-100 border-emerald-700"
          }`}
        >
          <i
            className={`fas ${
              toast.type === "error"
                ? "fa-exclamation-triangle text-rose-400"
                : toast.type === "info"
                ? "fa-info-circle text-sky-400"
                : "fa-check-circle text-emerald-400"
            }`}
          ></i>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
