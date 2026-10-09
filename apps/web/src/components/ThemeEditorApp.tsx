import React, { useState, useEffect } from "react";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";
import {
  puckConfig,
  defaultHomePuck,
  defaultLandingPuck,
} from "@cmsmu/cms-api/modules/theme-builder";

function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  try {
    // 1. Coba dari Cookie labmu_token
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i].trim();
      if (c.indexOf("labmu_token=") === 0) {
        return decodeURIComponent(c.substring("labmu_token=".length));
      }
    }
    // 2. Fallback window.getCmsToken jika tersedia
    if ((window as any).getCmsToken) {
      const t = (window as any).getCmsToken();
      if (t) return t;
    }
    // 3. Fallback localStorage
    return (
      localStorage.getItem("labmu_token") ||
      localStorage.getItem("admin_token") ||
      ""
    );
  } catch (e) {
    return "";
  }
}

interface ThemeEditorAppProps {
  slug: string;
}

export default function ThemeEditorApp({ slug }: ThemeEditorAppProps) {
  const [initialData, setInitialData] = useState<any>(null);
  const [currentData, setCurrentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pages, setPages] = useState<
    { id: number; title: string; slug: string }[]
  >([]);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
    type: "success",
  });
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageSlug, setNewPageSlug] = useState("");
  const [newPageTemplate, setNewPageTemplate] = useState<
    "home" | "landing" | "blank"
  >("home");
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [isGlobalHeaderActive, setIsGlobalHeaderActive] =
    useState<boolean>(false);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const triggerToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  useEffect(() => {
    const token = getAuthToken();
    const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    // Fetch global site settings
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings?t=" + Date.now(), {
          headers: authHeader,
          credentials: "include",
        });
        if (res.ok) {
          const result = await res.json();
          const sData = result.data || result;
          if (sData) {
            setSiteSettings(sData);
            const isGlobal = sData.global_header_enabled === "true";
            const sourceSlug = sData.global_header_source_slug || "home";
            setIsGlobalHeaderActive(
              isGlobal &&
                (sourceSlug === slug ||
                  (!sData.global_header_source_slug && slug === "home"))
            );
          }
        }
      } catch (e) {
        console.error("Gagal mengambil pengaturan situs", e);
      }
    };

    // Fetch page list
    const fetchPages = async () => {
      try {
        const res = await fetch("/api/theme-editor/pages", {
          headers: { ...authHeader },
          credentials: "include",
        });
        if (res.ok) {
          const result = await res.json();
          if (result.data) setPages(result.data);
        }
      } catch (e) {
        console.error("Gagal mengambil daftar halaman", e);
      }
    };

    // Fetch data from database
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/theme-editor/page?slug=${encodeURIComponent(slug)}`,
          {
            headers: {
              ...authHeader,
            },
            credentials: "include",
          }
        );

        if (response.status === 401 || response.status === 403) {
          triggerToast(
            "Sesi kedaluwarsa atau gagal memuat data halaman dari server (401/403).",
            "error"
          );
          setIsSessionExpired(true);
          // JANGAN memuat fallback defaultHomePuck/defaultLandingPuck jika halaman sudah ada di database atau jika terjadi galat server, agar data tidak tertimpa!
          return;
        }

        if (!response.ok && response.status !== 404) {
          const errMsg = `Gagal memuat data dari server (HTTP ${response.status}).`;
          triggerToast(errMsg, "error");
          setLoadError(errMsg);
          return;
        }

        if (response.ok) {
          const result = await response.json();
          let parsedData = null;
          if (result.data && result.data.body) {
            try {
              parsedData = JSON.parse(result.data.body);
            } catch (e) {
              console.error("Gagal parse body JSON", e);
            }
          }
          const urlParams =
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search)
              : null;
          const templateParam = urlParams ? urlParams.get("template") : null;
          const getFallback = () => {
            if (templateParam === "landing") return defaultLandingPuck;
            if (templateParam === "blank")
              return { content: [], root: {}, zones: {} };
            if (slug === "home" || templateParam === "home")
              return defaultHomePuck;
            return { content: [], root: {}, zones: {} };
          };

          if (!parsedData) {
            parsedData = getFallback();
          }

          setInitialData(parsedData);
          setCurrentData(parsedData);
        } else if (response.status === 404) {
          // Halaman baru yang belum tersimpan di DB -> inisialisasi dengan layout template awal
          const urlParams =
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search)
              : null;
          const templateParam = urlParams ? urlParams.get("template") : null;
          const fallback =
            templateParam === "landing"
              ? defaultLandingPuck
              : templateParam === "blank"
                ? { content: [], root: {}, zones: {} }
                : slug === "home" || templateParam === "home"
                  ? defaultHomePuck
                  : { content: [], root: {}, zones: {} };
          setInitialData(fallback);
          setCurrentData(fallback);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        const errMsg = "Gagal terhubung ke server saat memuat data halaman.";
        triggerToast(errMsg, "error");
        setLoadError(errMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
    fetchPages();
    fetchData();
  }, [slug]);

  const handlePublish = async (data: any) => {
    setIsSaving(true);
    try {
      const payload = {
        slug: slug,
        body: JSON.stringify(data),
      };

      const token = getAuthToken();
      const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch("/api/theme-editor/page", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.status === 401 || response.status === 403) {
        setIsSessionExpired(true);
        triggerToast(
          "Sesi login Anda telah berakhir (401/403). Silakan buka tab baru untuk login kembali tanpa menutup tab ini agar perubahan tidak hilang.",
          "error"
        );
        return;
      }

      if (response.ok) {
        // Sinkronisasi Logo & Pengaturan Header Global ke /api/settings
        const headerItem = (data?.content || []).find(
          (c: any) => c.type === "SiteHeader"
        );
        if (headerItem && headerItem.props) {
          const settingsUpdates: Record<string, string> = {};

          // 1. Sinkronisasi Logo Utama Website jika ada perubahan logo
          if (
            headerItem.props.logoImage &&
            headerItem.props.logoImage !== "/logo-cmsmu.webp" &&
            headerItem.props.syncLogo !== "no"
          ) {
            settingsUpdates.site_logo = headerItem.props.logoImage;
          }

          // 2. Sinkronisasi Header Global jika diaktifkan
          const shouldBeGlobal =
            isGlobalHeaderActive || headerItem.props.applyGlobal === "all";
          if (shouldBeGlobal) {
            settingsUpdates.global_header_enabled = "true";
            settingsUpdates.global_header_source_slug = slug;
            settingsUpdates.global_header_props = JSON.stringify(
              headerItem.props
            );
          } else if (
            isGlobalHeaderActive === false &&
            siteSettings?.global_header_source_slug === slug
          ) {
            settingsUpdates.global_header_enabled = "false";
          }

          if (Object.keys(settingsUpdates).length > 0) {
            try {
              await fetch("/api/settings", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...authHeader,
                },
                credentials: "include",
                body: JSON.stringify(settingsUpdates),
              });
              setSiteSettings((prev: any) => ({ ...prev, ...settingsUpdates }));
            } catch (errSync) {
              console.error("Gagal menyinkronkan pengaturan global:", errSync);
            }
          }
        }

        triggerToast(
          "Halaman & Pengaturan Header Global berhasil disimpan dan disinkronkan!",
          "success"
        );
      } else {
        const err = await response.json().catch(() => ({}));
        triggerToast(
          "Gagal menyimpan halaman: " + (err.error || response.statusText),
          "error"
        );
      }
    } catch (error: any) {
      triggerToast("Error: " + error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPageSlug && newPageSlug.trim() !== "") {
      const formattedSlug = newPageSlug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      if (formattedSlug) {
        window.location.href = `?slug=${formattedSlug}&template=${newPageTemplate}`;
      }
    }
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSlug = e.target.value;
    if (selectedSlug) {
      window.location.href = `?slug=${selectedSlug}`;
    }
  };

  if (isSessionExpired && !initialData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-rose-100">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Sesi Admin Kedaluwarsa
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Sesi Anda telah berakhir. Untuk mencegah data halaman tertimpa oleh template default, editor dinonaktifkan sementara. Silakan login kembali di tab baru.
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href="/admin/login"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition inline-block"
            >
              Login di Tab Baru ↗
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loadError && !initialData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-200">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Gagal Memuat Halaman
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {loadError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !initialData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-gray-500">
          Memuat Editor...
        </div>
      </div>
    );
  }

  // Cek apakah slug saat ini ada di daftar pages, jika tidak tambahkan sementara
  let displayPages = [...pages];

  if (!displayPages.find(p => p.slug === "home")) {
    displayPages.unshift({ id: -1, title: "Beranda Utama", slug: "home" });
  }

  if (!displayPages.find(p => p.slug === slug)) {
    displayPages.push({ id: 0, title: slug + " (Baru)", slug: slug });
  }

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      {/* In-System Toast Notification (SOP 16) */}
      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 999999,
            padding: "12px 20px",
            borderRadius: "12px",
            color: "#ffffff",
            fontWeight: "600",
            fontSize: "13px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            background:
              toast.type === "success"
                ? "#059669"
                : toast.type === "error"
                  ? "#e11d48"
                  : "#2563eb",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            transition: "all 0.3s ease",
          }}
        >
          <span>
            {toast.type === "success"
              ? "✓"
              : toast.type === "error"
                ? "✕"
                : "ℹ"}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modal Buat Halaman Baru (SOP 16) */}
      {showNewPageModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999998,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#1e293b",
              }}
            >
              Buat Halaman Visual Baru
            </h3>
            <p
              style={{
                margin: "0 0 16px 0",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              Masukkan slug unik untuk halaman baru (contoh:{" "}
              <code>tentang-kami</code>, <code>kontak</code>).
            </p>
            <form onSubmit={handleCreateNewPageSubmit}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#475569",
                  marginBottom: "6px",
                }}
              >
                Slug Halaman (URL):
              </label>
              <input
                type="text"
                value={newPageSlug}
                onChange={e => setNewPageSlug(e.target.value)}
                placeholder="contoh: landing-page-v2, tentang-kami"
                required
                autoFocus
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  marginBottom: "14px",
                  boxSizing: "border-box",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#475569",
                  marginBottom: "6px",
                }}
              >
                Pilihan Layout Awal:
              </label>
              <select
                value={newPageTemplate}
                onChange={(e: any) => setNewPageTemplate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  marginBottom: "20px",
                  boxSizing: "border-box",
                  background: "#ffffff",
                  color: "#1e293b",
                }}
              >
                <option value="home">
                  Template Beranda Standar (Header, Hero, Fitur, Berita, Footer)
                </option>
                <option value="landing">
                  Template Landing Page (Header, Slider, Fitur, Berita, CTA,
                  Footer)
                </option>
                <option value="blank">
                  Kanvas Kosong (Rancang Tata Letak Sendiri Bebas)
                </option>
              </select>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowNewPageModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#0d9488",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Buat & Buka Editor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sesi Kedaluwarsa Saat Desain Aktif (Proteksi Anti-Data-Loss) */}
      {isSessionExpired && initialData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "440px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#1e293b",
              }}
            >
              Sesi Admin Kedaluwarsa
            </h3>
            <p
              style={{
                margin: "0 0 16px 0",
                fontSize: "13px",
                color: "#64748b",
                lineHeight: "1.5",
              }}
            >
              Sesi login Anda telah berakhir. Untuk mencegah kehilangan pekerjaan desain Anda, <b>JANGAN</b> tutup tab ini. Silakan buka tautan login di tab baru, selesaikan proses login, lalu kembali ke tab ini dan klik <b>Publish</b> lagi.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <a
                href="/admin/login"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  background: "#0d9488",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Login di Tab Baru ↗
              </a>
              <button
                type="button"
                onClick={() => setIsSessionExpired(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#64748b",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Tutup & Lanjutkan Desain
              </button>
            </div>
          </div>
        </div>
      )}

      <Puck
        config={puckConfig}
        data={initialData}
        onChange={data => setCurrentData(data)}
        onPublish={handlePublish}
        iframe={{ enabled: true, syncHostStyles: true }}
        overrides={{
          iframe: ({ children, document }: any) => {
            React.useEffect(() => {
              if (!document) return;
              if (!document.getElementById("puck-tailwind-cdn")) {
                const script = document.createElement("script");
                script.id = "puck-tailwind-cdn";
                script.src = "https://cdn.tailwindcss.com";
                document.head.appendChild(script);
              }
              if (!document.getElementById("puck-fonts")) {
                const link = document.createElement("link");
                link.id = "puck-fonts";
                link.rel = "stylesheet";
                link.href =
                  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";
                document.head.appendChild(link);
              }
              if (!document.getElementById("puck-fa")) {
                const link = document.createElement("link");
                link.id = "puck-fa";
                link.rel = "stylesheet";
                link.href =
                  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
                document.head.appendChild(link);
              }
              if (!document.getElementById("puck-svg-reset")) {
                const style = document.createElement("style");
                style.id = "puck-svg-reset";
                style.innerHTML = "svg { max-width: 100%; }";
                document.head.appendChild(style);
              }
            }, [document]);

            return <>{children}</>;
          },
          headerActions: ({ children }) => (
            <>
              <a
                href="/admin"
                style={{
                  marginRight: "auto",
                  color: "#475569",
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
                title="Kembali ke Dashboard Admin"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </a>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginLeft: "auto",
                  marginRight: "16px",
                }}
              >
                <select
                  value={slug}
                  onChange={handlePageChange}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background: "#f3f4f6",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {displayPages.map(p => (
                    <option key={p.slug} value={p.slug}>
                      {p.title} (/{p.slug})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setNewPageSlug("");
                    setShowNewPageModal(true);
                  }}
                  style={{
                    background: "#0d9488",
                    color: "white",
                    border: "none",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  + Baru
                </button>

                <a
                  href={slug === "home" ? "/" : `/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    background: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    textDecoration: "none",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                  title="Lihat Pratinjau Halaman Langsung (Tab Baru)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Preview</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const nextState = !isGlobalHeaderActive;
                    setIsGlobalHeaderActive(nextState);
                    triggerToast(
                      nextState
                        ? "Header Global AKTIF untuk halaman ini (klik Publish untuk menerapkan ke seluruh web)."
                        : "Header Global NONAKTIF.",
                      "info"
                    );
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    border: isGlobalHeaderActive
                      ? "1px solid #059669"
                      : "1px solid #cbd5e1",
                    background: isGlobalHeaderActive ? "#ecfdf5" : "#f8fafc",
                    color: isGlobalHeaderActive ? "#065f46" : "#64748b",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  title="Aktifkan agar header halaman ini tampil di seluruh website (seluruh halaman dan postingan)"
                >
                  <span style={{ fontSize: "13px" }}>🌐</span>
                  <span>
                    {isGlobalHeaderActive
                      ? "Header Global: AKTIF"
                      : "Header Global: Nonaktif"}
                  </span>
                </button>
              </div>

              {children}
            </>
          ),
        }}
      />
    </div>
  );
}
