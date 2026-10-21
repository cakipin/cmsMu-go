import React, { useState, useEffect } from "react";
import {
  BLOCK_CATALOG,
  validateCanvasPageData,
  BUILTIN_CANVAS_PRESETS,
  type CanvasPresetItem
} from "@cmsmu/cms-api/modules/theme-builder/engine/schema";
import { renderBlockToHtml } from "@cmsmu/cms-api/modules/theme-builder/engine/renderer";

// 🏛️ Clean Bespoke SVG Icons - Ciri Khas cmsMu (Zero Keyboard Emoji)
function IconVisualMode({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  );
}

function IconCodeMode({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconTemplates({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconImport({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconExport({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconCopy({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconDownload({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16" />
      <path d="M12 4v12" />
      <path d="m6 10 6 6 6-6" />
    </svg>
  );
}

function IconCheck({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconClose({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconUploadFile({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <polyline points="9 15 12 12 15 15" />
    </svg>
  );
}

function IconStudioMenu({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

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

  // 🎛️ Mode Editor: Visual Canvas vs Code JSON
  const [editorMode, setEditorMode] = useState<"visual" | "code">("visual");
  const [rawJsonText, setRawJsonText] = useState<string>("");
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);

  // 🗂️ Modal & Template States
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);
  const [isFeatureMenuOpen, setIsFeatureMenuOpen] = useState<boolean>(false);
  const [importTab, setImportTab] = useState<"file" | "paste">("file");
  const [importInputText, setImportInputText] = useState<string>("");
  const [importError, setImportError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

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
        const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

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

  // Auto-close dropdown fitur studio saat klik di luar
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest("#studio-feature-dropdown-container")) {
        setIsFeatureMenuOpen(false);
      }
    };
    if (isFeatureMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isFeatureMenuOpen]);

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
      const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
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

  // 🔄 Beralih ke Mode Code JSON
  const handleSwitchToCode = () => {
    const fullPayload = {
      content: blocks,
      root: { props: { title: currentSlug } },
      zones: {},
    };
    setRawJsonText(JSON.stringify(fullPayload, null, 2));
    setJsonParseError(null);
    setEditorMode("code");
  };

  // 🎨 Terapkan Perubahan Code JSON ke Canvas Visual
  const handleApplyCodeToVisual = (): boolean => {
    try {
      const parsed = JSON.parse(rawJsonText);
      const validation = validateCanvasPageData(parsed);
      if (!validation.valid || !validation.cleanData) {
        setJsonParseError(validation.error || "Validasi format JSON gagal.");
        triggerToast(validation.error || "Format JSON tidak valid.", "error");
        return false;
      }
      setBlocks(validation.cleanData.content);
      setSelectedBlockIdx(validation.cleanData.content.length > 0 ? 0 : null);
      setJsonParseError(null);
      setEditorMode("visual");
      triggerToast("Perubahan JSON berhasil diterapkan ke canvas visual!", "success");
      return true;
    } catch (e: any) {
      const msg = `Sintaks JSON tidak valid: ${e.message}`;
      setJsonParseError(msg);
      triggerToast(msg, "error");
      return false;
    }
  };

  // 🧹 Format Indentasi Teks JSON
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      setRawJsonText(JSON.stringify(parsed, null, 2));
      setJsonParseError(null);
      triggerToast("Format JSON dirapikan", "info");
    } catch (e: any) {
      setJsonParseError(`Gagal merapikan: ${e.message}`);
    }
  };

  // ➕ Sisipkan Snippet Blok Baru di Code Mode
  const handleInsertBlockSnippet = (blockType: string) => {
    const catalog = BLOCK_CATALOG[blockType];
    if (!catalog) return;
    try {
      const parsed = JSON.parse(rawJsonText);
      if (!Array.isArray(parsed.content)) {
        parsed.content = [];
      }
      const newBlock = {
        type: blockType,
        props: {
          id: `${blockType}-${Date.now()}`,
          ...catalog.defaultProps,
        },
      };
      parsed.content.push(newBlock);
      setRawJsonText(JSON.stringify(parsed, null, 2));
      setJsonParseError(null);
      triggerToast(`Blok '${catalog.name}' disisipkan ke JSON`, "info");
    } catch (e: any) {
      triggerToast("Perbaiki error sintaks JSON terlebih dahulu sebelum menyisipkan blok.", "error");
    }
  };

  // 📁 Pilih Template Preset Bawaan
  const handleSelectPreset = (preset: CanvasPresetItem) => {
    const validation = validateCanvasPageData(preset.data);
    if (!validation.valid || !validation.cleanData) {
      triggerToast("Gagal memuat template: Data tidak valid.", "error");
      return;
    }
    setBlocks(validation.cleanData.content);
    setSelectedBlockIdx(0);
    setIsPresetModalOpen(false);
    triggerToast(`Template '${preset.name}' berhasil dimuat!`, "success");
  };

  // ⬆️ Handler Upload Berkas .json
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      setImportError("Berkas harus berformat .json");
      return;
    }
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        setImportInputText(text);
        const parsed = JSON.parse(text);
        const validation = validateCanvasPageData(parsed);
        if (!validation.valid) {
          setImportError(validation.error || "Struktur JSON tidak valid.");
        } else {
          setImportError(null);
        }
      } catch (err: any) {
        setImportError(`Berkas JSON rusak: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ⬆️ Terapkan Import JSON ke Canvas
  const handleApplyImport = () => {
    try {
      if (!importInputText.trim()) {
        setImportError("Teks atau berkas JSON belum dimasukkan.");
        return;
      }
      const parsed = JSON.parse(importInputText);
      const validation = validateCanvasPageData(parsed);
      if (!validation.valid || !validation.cleanData) {
        setImportError(validation.error || "Validasi JSON gagal.");
        return;
      }
      setBlocks(validation.cleanData.content);
      setSelectedBlockIdx(validation.cleanData.content.length > 0 ? 0 : null);
      setIsImportModalOpen(false);
      setImportInputText("");
      setImportError(null);
      triggerToast("Template JSON berhasil diimpor ke canvas!", "success");
    } catch (err: any) {
      setImportError(`Sintaks JSON tidak valid: ${err.message}`);
    }
  };

  // ⬇️ Unduh Berkas JSON Halaman
  const handleDownloadExportJson = () => {
    const exportData = {
      generator: "cmsMu Native Canvas Studio",
      exportedAt: new Date().toISOString(),
      slug: currentSlug,
      content: blocks,
      root: { props: { title: currentSlug } },
      zones: {},
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cmsmu-template-${currentSlug}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast("Berkas JSON berhasil diunduh!", "success");
  };

  // 📋 Salin JSON ke Clipboard
  const handleCopyExportJson = () => {
    const exportData = {
      content: blocks,
      root: { props: { title: currentSlug } },
      zones: {},
    };
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    setCopySuccess(true);
    triggerToast("JSON berhasil disalin ke clipboard!", "success");
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Aksi Penyimpanan ke D1
  const handleSave = async () => {
    // Jika sedang di Code mode, sinkronkan kode terlebih dahulu
    if (editorMode === "code") {
      const ok = handleApplyCodeToVisual();
      if (!ok) return;
    }

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
      const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
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
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between z-20 shrink-0">
        {/* Left: Brand & Page Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/admin"
            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center transition-colors"
            title="Kembali ke Dashboard"
          >
            <i className="fas fa-arrow-left text-xs"></i>
          </a>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white hidden md:inline">cmsMu Canvas</span>
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
                  className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0"
                  title="Halaman ini sedang aktif sebagai Beranda Utama (/)"
                >
                  <i className="fas fa-home text-xs"></i>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSetAsHomepage}
                  disabled={isSettingHome}
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  title={isSettingHome ? "Mengatur Beranda..." : "Jadikan halaman ini sebagai Beranda Utama (/)"}
                >
                  <i className={`fas ${isSettingHome ? "fa-spinner fa-spin" : "fa-home"} text-xs`}></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Center: Viewport Switcher (Icon-Only with Tooltips) */}
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 gap-1">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all ${
              viewport === "desktop" ? "bg-slate-800 text-emerald-400 shadow-xs border border-slate-700" : "text-slate-400 hover:text-slate-200"
            }`}
            title="Tampilan Desktop (1024px+)"
          >
            <i className="fas fa-desktop text-xs"></i>
          </button>
          <button
            type="button"
            onClick={() => setViewport("tablet")}
            className={`w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all ${
              viewport === "tablet" ? "bg-slate-800 text-emerald-400 shadow-xs border border-slate-700" : "text-slate-400 hover:text-slate-200"
            }`}
            title="Tampilan Tablet (768px)"
          >
            <i className="fas fa-tablet-alt text-xs"></i>
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all ${
              viewport === "mobile" ? "bg-slate-800 text-emerald-400 shadow-xs border border-slate-700" : "text-slate-400 hover:text-slate-200"
            }`}
            title="Tampilan Mobile (375px)"
          >
            <i className="fas fa-mobile-alt text-xs"></i>
          </button>
        </div>

        {/* Right: Studio Feature Dropdown, Live Preview, and Save Button */}
        <div className="flex items-center gap-2">
          {/* 🛠️ Dropdown Fitur Studio (Single Button for Visual/Code, Presets, Import, Export) */}
          <div className="relative" id="studio-feature-dropdown-container">
            <button
              type="button"
              onClick={() => setIsFeatureMenuOpen(prev => !prev)}
              className={`h-8 px-2.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                isFeatureMenuOpen
                  ? "bg-slate-800 text-emerald-400 border-emerald-500/50 shadow-xs"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700"
              }`}
              title="Fitur Studio (Mode Editor, Template & JSON)"
            >
              <IconStudioMenu className="w-4 h-4 text-emerald-400" />
              <i className="fas fa-chevron-down text-[9px] text-slate-400"></i>
            </button>

            {isFeatureMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={e => e.stopPropagation()}
              >
                <div className="px-2.5 py-1.5 border-b border-slate-800 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Fitur Studio cmsMu
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">v0.1.5</span>
                </div>

                {/* Mode Editor Switcher */}
                <div className="p-1 space-y-1">
                  <div className="text-[10px] text-slate-500 font-semibold px-1.5 pt-1 uppercase">
                    Mode Editor
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (editorMode === "code") {
                        handleApplyCodeToVisual();
                      } else {
                        setEditorMode("visual");
                      }
                      setIsFeatureMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      editorMode === "visual"
                        ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                        : "hover:bg-slate-800 text-slate-300 border border-transparent"
                    }`}
                  >
                    <IconVisualMode className="w-4 h-4 text-emerald-400" />
                    <div className="text-left">
                      <div className="font-bold">Mode Visual Canvas</div>
                      <div className="text-[10px] text-slate-400 font-normal">Pratinjau visual & drag/drop</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSwitchToCode();
                      setIsFeatureMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      editorMode === "code"
                        ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/30"
                        : "hover:bg-slate-800 text-slate-300 border border-transparent"
                    }`}
                  >
                    <IconCodeMode className="w-4 h-4 text-cyan-400" />
                    <div className="text-left">
                      <div className="font-bold">Mode Code JSON</div>
                      <div className="text-[10px] text-slate-400 font-normal">Edit langsung blueprint JSON</div>
                    </div>
                  </button>
                </div>

                <div className="border-t border-slate-800 my-1"></div>

                {/* Templates & JSON Actions */}
                <div className="p-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFeatureMenuOpen(false);
                      setIsPresetModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <IconTemplates className="w-4 h-4 text-amber-400" />
                    <span>Pustaka Template Resmi...</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFeatureMenuOpen(false);
                      setImportInputText("");
                      setImportError(null);
                      setIsImportModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <IconImport className="w-4 h-4 text-cyan-400" />
                    <span>Import Template JSON...</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFeatureMenuOpen(false);
                      setCopySuccess(false);
                      setIsExportModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <IconExport className="w-4 h-4 text-emerald-400" />
                    <span>Export Template JSON...</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Buka Live Tab Baru */}
          <a
            href={currentSlug === activeHomeSlug ? "/" : `/${currentSlug}`}
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 flex items-center justify-center transition-colors"
            title="Buka Halaman Live di Tab Baru"
          >
            <i className="fas fa-external-link-alt text-xs"></i>
          </a>

          {/* Tombol Simpan Halaman */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Simpan Perubahan Halaman"
          >
            <i className={`fas ${isSaving ? "fa-spinner fa-spin" : "fa-save"} text-xs`}></i>
            <span className="hidden sm:inline">{isSaving ? "Menyimpan..." : "Simpan"}</span>
          </button>
        </div>
      </header>

      {/* 💻 MODE LIVE CODE JSON STUDIO */}
      {editorMode === "code" ? (
        <div className="flex flex-1 overflow-hidden relative bg-slate-950">
          {/* Quick Block Reference Palette */}
          <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Kamus Blok cmsMu</span>
              <span className="text-[10px] text-cyan-400 font-mono">1-Click Insert</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {Object.keys(BLOCK_CATALOG).map(bType => {
                const b = BLOCK_CATALOG[bType];
                return (
                  <button
                    key={bType}
                    type="button"
                    onClick={() => handleInsertBlockSnippet(bType)}
                    className="w-full p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 text-left transition-all cursor-pointer group flex items-center justify-between"
                    title={`Sisipkan cuplikan blok ${b.name} ke JSON`}
                  >
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                        {b.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{bType}</div>
                    </div>
                    <i className="fas fa-plus text-[10px] text-slate-500 group-hover:text-cyan-400 shrink-0"></i>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main JSON Editor Panel */}
          <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {/* Editor Subheader Bar */}
            <div className="h-11 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                  <IconCodeMode className="w-3.5 h-3.5" />
                  Live JSON Blueprint Studio
                </span>
                {jsonParseError ? (
                  <span className="text-[11px] text-rose-400 font-medium flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    <i className="fas fa-times-circle text-[10px]"></i> Sintaks Invalid
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <IconCheck className="w-3 h-3" /> Format Valid
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFormatJson}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Rapikan Indentasi Teks JSON"
                >
                  <i className="fas fa-align-left text-[10px]"></i>
                  <span>Format Indent</span>
                </button>
                <button
                  type="button"
                  onClick={handleApplyCodeToVisual}
                  className="px-3 py-1 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-md shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Terapkan JSON dan kembali ke Visual Canvas"
                >
                  <IconVisualMode className="w-3.5 h-3.5" />
                  <span>Terapkan ke Visual</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {jsonParseError && (
              <div className="bg-rose-950/80 border-b border-rose-800/80 px-4 py-2 text-xs text-rose-200 flex items-center gap-2 shrink-0">
                <i className="fas fa-exclamation-triangle text-rose-400 text-sm"></i>
                <span className="font-mono">{jsonParseError}</span>
              </div>
            )}

            {/* Code Textarea Area */}
            <div className="flex-1 relative overflow-hidden p-3 bg-slate-950">
              <textarea
                value={rawJsonText}
                onChange={e => {
                  setRawJsonText(e.target.value);
                  try {
                    JSON.parse(e.target.value);
                    setJsonParseError(null);
                  } catch (err: any) {
                    setJsonParseError(err.message);
                  }
                }}
                spellCheck={false}
                className="w-full h-full bg-slate-900/95 text-emerald-300 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/80 resize-none leading-relaxed shadow-inner"
                placeholder="Tempel atau ketik kode JSON blueprint halaman di sini..."
              />
            </div>
          </main>
        </div>
      ) : (
        /* WORKSPACE 3-PANEL LAYOUT */
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
                                            {(subField.options || []).map((opt: { label: string; value: string }) => (
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
                        {(field.options || []).map((opt: { label: string; value: string }) => (
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
      )}

      {/* ⬆️ MODAL IMPORT JSON TEMPLATE */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <IconImport className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Import Template JSON</h3>
                  <p className="text-[11px] text-slate-400">
                    Muat tata letak halaman dari berkas atau teks JSON standar cmsMu.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2">
              <button
                type="button"
                onClick={() => setImportTab("file")}
                className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  importTab === "file"
                    ? "border-cyan-500 text-cyan-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Unggah Berkas (.json)
              </button>
              <button
                type="button"
                onClick={() => setImportTab("paste")}
                className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  importTab === "paste"
                    ? "border-cyan-500 text-cyan-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Tempel Teks JSON
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3">
              {importTab === "file" ? (
                <div>
                  <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50 group">
                    <IconUploadFile className="w-9 h-9 text-slate-500 group-hover:text-cyan-400 mb-2 transition-colors" />
                    <span className="text-xs font-bold text-white mb-0.5">
                      Klik untuk memilih berkas .json
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Format standar cmsMu (berkas template hasil export)
                    </span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {importInputText && !importError && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-mono">
                        <IconCheck className="w-3.5 h-3.5" /> Berkas JSON terbaca ({importInputText.length} karakter)
                      </span>
                      <button
                        type="button"
                        onClick={() => setImportInputText("")}
                        className="text-slate-400 hover:text-white text-[11px] cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <textarea
                    rows={8}
                    value={importInputText}
                    onChange={e => {
                      setImportInputText(e.target.value);
                      setImportError(null);
                    }}
                    placeholder={`{\n  "content": [\n    { "type": "SiteHeader", "props": { ... } }\n  ]\n}`}
                    className="w-full bg-slate-950 text-emerald-300 font-mono text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* Error Message */}
              {importError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                  <i className="fas fa-exclamation-triangle text-rose-400 text-xs mt-0.5 shrink-0"></i>
                  <span>{importError}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyImport}
                disabled={!importInputText.trim()}
                className="px-4 py-1.5 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <IconCheck className="w-3.5 h-3.5" />
                <span>Terapkan ke Canvas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⬇️ MODAL EXPORT JSON TEMPLATE */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <IconExport className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Export Template JSON Halaman</h3>
                  <p className="text-[11px] text-slate-400">
                    Halaman: <span className="font-mono text-emerald-400">{currentSlug}</span> ({blocks.length} blok aktif)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-2">
              <p className="text-xs text-slate-400 leading-relaxed">
                Salin blueprint JSON ini atau unduh sebagai berkas cadangan untuk digunakan kembali di website cabang, sekolah lain, atau lingkungan staging.
              </p>
              <textarea
                readOnly
                value={JSON.stringify(
                  {
                    generator: "cmsMu Native Canvas Studio",
                    exportedAt: new Date().toISOString(),
                    slug: currentSlug,
                    content: blocks,
                    root: { props: { title: currentSlug } },
                    zones: {},
                  },
                  null,
                  2
                )}
                className="w-full h-72 font-mono text-xs p-3.5 rounded-xl bg-slate-950 text-emerald-300 border border-slate-800 focus:outline-none resize-none leading-relaxed select-all"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                {blocks.length} Blok • Standar JSON cmsMu
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyExportJson}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copySuccess ? (
                    <>
                      <IconCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <IconCopy className="w-3.5 h-3.5" />
                      <span>Salin JSON</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadExportJson}
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <IconDownload className="w-3.5 h-3.5" />
                  <span>Unduh Berkas .json</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📁 MODAL PUSTAKA TEMPLATE RESMI CMSMU */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <IconTemplates className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Pustaka Template Resmi cmsMu</h3>
                  <p className="text-[11px] text-slate-400">
                    Pilih blueprint siap pakai untuk halaman <span className="font-mono text-emerald-400">{currentSlug}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPresetModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Body: Preset Cards */}
            <div className="p-4 sm:p-5 space-y-3 max-h-[65vh] overflow-y-auto">
              {BUILTIN_CANVAS_PRESETS.map((preset: CanvasPresetItem) => (
                <div
                  key={preset.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {preset.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="px-4 py-2 text-xs font-bold bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 self-end sm:self-center"
                  >
                    <IconCheck className="w-3.5 h-3.5" />
                    <span>Pakai Template</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                {BUILTIN_CANVAS_PRESETS.length} Template Standar cmsMu
              </span>
              <button
                type="button"
                onClick={() => setIsPresetModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

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
