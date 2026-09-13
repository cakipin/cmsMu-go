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

interface ThemeEditorAppProps {
  slug: string;
}

export default function ThemeEditorApp({ slug }: ThemeEditorAppProps) {
  const [initialData, setInitialData] = useState<any>(null);
  const [currentData, setCurrentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<{id: number, title: string, slug: string}[]>([]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('labmu_token') || '' : '';
    
    // Fetch page list
    const fetchPages = async () => {
      try {
        const res = await fetch('/api/theme-editor/pages', {
          headers: { 'Authorization': `Bearer ${token}` }
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
            'Authorization': `Bearer ${token}`
          }
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
    try {
      const payload = {
        slug: slug,
        body: JSON.stringify(data),
      };

      const token = typeof window !== 'undefined' ? localStorage.getItem('labmu_token') || '' : '';
      const response = await fetch("/api/theme-editor/page", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Halaman berhasil disimpan!");
      } else {
        const err = await response.json();
        alert("Gagal menyimpan halaman: " + (err.error || response.statusText));
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  const handleCreateNewPage = () => {
    const newSlug = window.prompt("Masukkan slug untuk halaman baru (contoh: contact-us):");
    if (newSlug && newSlug.trim() !== "") {
      const formattedSlug = newSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
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
    <div style={{ height: '100vh', width: '100vw' }}>
      <Puck
        config={puckConfig}
        data={initialData}
        onChange={(data) => setCurrentData(data)}
        onPublish={handlePublish}
        iframe={{ enabled: true, syncHostStyles: true }}
        overrides={{
          headerActions: ({ children }) => (
            <>
              <a href="/admin" style={{ marginRight: 'auto', color: '#6b7280', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                &larr; Kembali ke Admin
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
                  onClick={handleCreateNewPage}
                  style={{
                    background: '#2563eb',
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
              </div>
              
              {children}
            </>
          )
        }}
      />
    </div>
  );
}
