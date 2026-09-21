import React, { useState, useEffect } from "react";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";
import { puckConfig } from "../cms/themes/newsroom/puck/config";

const defaultHomePuck = {
  content: [
    { type: "SiteHeader", props: { id: "SiteHeader-1" } },
    { type: "Hero", props: { id: "Hero-1" } },
    { type: "Partners", props: { id: "Partners-1" } },
    { type: "FeatureGrid", props: { id: "FeatureGrid-1" } },
    { type: "Testimonial", props: { id: "Testimonial-1" } },
    { type: "RecentPosts", props: { id: "RecentPosts-1" } },
    { type: "CallToAction", props: { id: "CallToAction-1" } },
    { type: "SiteFooter", props: { id: "SiteFooter-1" } }
  ],
  root: {},
  zones: {}
};

function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    // 1. Coba dari Cookie labmu_token
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i].trim();
      if (c.indexOf('labmu_token=') === 0) {
        return decodeURIComponent(c.substring('labmu_token='.length));
      }
    }
    // 2. Fallback window.getCmsToken jika tersedia
    if ((window as any).getCmsToken) {
      const t = (window as any).getCmsToken();
      if (t) return t;
    }
    // 3. Fallback localStorage
    return localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '';
  } catch (e) {
    return '';
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
  const [pages, setPages] = useState<{id: number, title: string, slug: string}[]>([]);
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageSlug, setNewPageSlug] = useState('');

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  useEffect(() => {
    const token = getAuthToken();
    const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // Fetch page list
    const fetchPages = async () => {
      try {
        const res = await fetch('/api/theme-editor/pages', {
          headers: { ...authHeader },
          credentials: 'include'
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
        const response = await fetch(`/api/theme-editor/page?slug=${encodeURIComponent(slug)}`, {
          headers: {
            ...authHeader
          },
          credentials: 'include'
        });
        if (response.ok) {
          const result = await response.json();
          // Jika ada body JSON, parsing
          if (result.data && result.data.body) {
            try {
              const parsed = JSON.parse(result.data.body);
              setInitialData(parsed);
              setCurrentData(parsed);
            } catch (e) {
              console.error("Gagal parse body JSON", e);
              if (slug === 'home') {
                 setInitialData(defaultHomePuck);
                 setCurrentData(defaultHomePuck);
              } else {
                 setInitialData({ content: [], root: {}, zones: {} });
                 setCurrentData({ content: [], root: {}, zones: {} });
              }
            }
          } else {
             if (slug === 'home') {
                 setInitialData(defaultHomePuck);
                 setCurrentData(defaultHomePuck);
              } else {
                 setInitialData({ content: [], root: {}, zones: {} });
                 setCurrentData({ content: [], root: {}, zones: {} });
              }
          }
        } else {
           if (slug === 'home') {
               setInitialData(defaultHomePuck);
               setCurrentData(defaultHomePuck);
            } else {
               setInitialData({ content: [], root: {}, zones: {} });
               setCurrentData({ content: [], root: {}, zones: {} });
            }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (slug === 'home') {
           setInitialData(defaultHomePuck);
           setCurrentData(defaultHomePuck);
        } else {
           setInitialData({ content: [], root: {}, zones: {} });
           setCurrentData({ content: [], root: {}, zones: {} });
        }
      } finally {
        setIsLoading(false);
      }
    };

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
      const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await fetch("/api/theme-editor/page", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        triggerToast("Halaman berhasil disimpan dan dipublikasikan!", "success");
      } else {
        const err = await response.json().catch(() => ({}));
        triggerToast("Gagal menyimpan halaman: " + (err.error || response.statusText), "error");
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
      const formattedSlug = newPageSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      if (formattedSlug) {
        window.location.href = `?slug=${formattedSlug}`;
      }
    }
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSlug = e.target.value;
    if (selectedSlug) {
      window.location.href = `?slug=${selectedSlug}`;
    }
  };

  if (isLoading || !initialData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-gray-500">Memuat Editor...</div>
      </div>
    );
  }

  // Cek apakah slug saat ini ada di daftar pages, jika tidak tambahkan sementara
  let displayPages = [...pages];
  
  if (!displayPages.find(p => p.slug === 'home')) {
    displayPages.unshift({ id: -1, title: 'Beranda Utama', slug: 'home' });
  }

  if (!displayPages.find(p => p.slug === slug)) {
    displayPages.push({ id: 0, title: slug + ' (Baru)', slug: slug });
  }

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* In-System Toast Notification (SOP 16) */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 999999,
          padding: '12px 20px',
          borderRadius: '12px',
          color: '#ffffff',
          fontWeight: '600',
          fontSize: '13px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          background: toast.type === 'success' ? '#059669' : (toast.type === 'error' ? '#e11d48' : '#2563eb'),
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          transition: 'all 0.3s ease'
        }}>
          <span>{toast.type === 'success' ? '✓' : (toast.type === 'error' ? '✕' : 'ℹ')}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modal Buat Halaman Baru (SOP 16) */}
      {showNewPageModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999998,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>
              Buat Halaman Visual Baru
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>
              Masukkan slug unik untuk halaman baru (contoh: <code>tentang-kami</code>, <code>kontak</code>).
            </p>
            <form onSubmit={handleCreateNewPageSubmit}>
              <input
                type="text"
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                placeholder="contoh: landing-page-v2"
                required
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  marginBottom: '16px',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewPageModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0d9488',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Buat & Buka Editor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Puck
        config={puckConfig}
        data={initialData}
        onChange={(data) => setCurrentData(data)}
        onPublish={handlePublish}
        iframe={{ enabled: true, syncHostStyles: true }}
        overrides={{
          headerActions: ({ children }) => (
            <>
              <a 
                href="/admin" 
                style={{ 
                  marginRight: 'auto', 
                  color: '#475569', 
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  width: '32px',
                  height: '32px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  textDecoration: 'none'
                }}
                title="Kembali ke Dashboard Admin"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </a>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', marginRight: '16px' }}>
                <select 
                  value={slug}
                  onChange={handlePageChange}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {displayPages.map(p => (
                    <option key={p.slug} value={p.slug}>
                      {p.title} (/{p.slug})
                    </option>
                  ))}
                </select>
                <button 
                  onClick={() => { setNewPageSlug(''); setShowNewPageModal(true); }}
                  style={{
                    background: '#0d9488',
                    color: 'white',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  + Baru
                </button>

                <a
                  href={slug === 'home' ? '/' : `/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  title="Lihat Pratinjau Halaman Langsung (Tab Baru)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Preview</span>
                </a>
              </div>
              
              {children}
            </>
          )
        }}
      />
    </div>
  );
}
