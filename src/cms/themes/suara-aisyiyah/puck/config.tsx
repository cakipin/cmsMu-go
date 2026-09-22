import React from "react";
import type { Config } from "@puckeditor/core";

function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i].trim();
      if (c.indexOf('labmu_token=') === 0) {
        return decodeURIComponent(c.substring('labmu_token='.length));
      }
    }
    if ((window as any).getCmsToken) {
      const t = (window as any).getCmsToken();
      if (t) return t;
    }
    return localStorage.getItem('labmu_token') || localStorage.getItem('admin_token') || '';
  } catch (e) {
    return '';
  }
}

const ImageField = ({ value, onChange, name }: any) => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState<{ text: string; isError: boolean } | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMsg(null);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch('/api/media', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        onChange(data.url);
        setStatusMsg({ text: "Gambar berhasil diunggah!", isError: false });
      } else {
        setStatusMsg({ text: "Gagal: " + (data.error || "Gagal mengunggah gambar"), isError: true });
      }
    } catch (err: any) {
      setStatusMsg({ text: "Error upload: " + (err.message || "Gagal menghubungi server"), isError: true });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 8, color: '#374151', textTransform: 'capitalize' }}>
        {name ? name.replace(/([A-Z])/g, ' $1').trim() : 'Image Upload'}
      </label>
      
      {value && (
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <img
            src={value}
            alt="Preview"
            style={{ width: '100%', maxHeight: 120, objectFit: 'contain', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', padding: 4 }}
          />
          <button
            type="button"
            onClick={() => {
              onChange('');
              setStatusMsg(null);
            }}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 11,
              cursor: 'pointer'
            }}
            title="Hapus Logo"
          >
            Hapus
          </button>
        </div>
      )}

      <input 
        type="file" 
        accept="image/*" 
        onChange={handleUpload} 
        disabled={isUploading}
        style={{ width: '100%', fontSize: 13, display: 'block', marginBottom: 8 }}
      />

      {isUploading && (
        <div style={{ fontSize: 12, color: '#0284c7', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Mengunggah file...</span>
        </div>
      )}

      {statusMsg && (
        <div style={{ fontSize: 12, color: statusMsg.isError ? '#dc2626' : '#16a34a', marginBottom: 8 }}>
          {statusMsg.text}
        </div>
      )}

      <input 
        type="text" 
        value={value || ''} 
        onChange={(e) => {
          onChange(e.target.value);
          setStatusMsg(null);
        }} 
        placeholder="Atau tempelkan URL gambar (contoh: /logo-cmsmu.webp)"
        style={{ width: '100%', padding: '6px 8px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 4, boxSizing: 'border-box' }}
      />
    </div>
  );
};

type Props = {
  SiteHeader: {
    logoType?: "both" | "image" | "text";
    logoImage: string;
    logoHeight?: string;
    siteTitle: string;
    siteTitleHighlight: string;
    highlightColor?: string;
    logoLetter: string;
    menuItems: { label: string; url: string }[];
    menuPosition?: string;
    menuItemSpacing?: string;
    linkHoverColor?: string;
    showCta?: "yes" | "no";
    ctaText: string;
    ctaUrl: string;
    ctaStyle?: "solid" | "outline";
    ctaBgColor?: string;
    ctaTextColor?: string;
    headerPosition?: "fixed" | "sticky" | "static";
    headerBgColor1: string;
    headerBgColor2: string;
    headerGlassmorphism?: "yes" | "no";
    textColor: string;
    showBorder?: "yes" | "no";
    borderColor?: string;
    fontFamily: string;
    headerPadding: string;
    containerWidth?: string;
  };
  HeroSlider: {
    slides: { image: string; title: string; subtitle: string; buttonText: string; buttonLink: string }[];
    sliderHeight: string;
    textPosition: string;
    overlayOpacity: number;
    titleColor: string;
    titleSize: string;
  };
  Hero: {
    badgeText: string;
    title: string;
    titleHighlight: string;
    titleColor: string;
    description: string;
    descriptionColor: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    backgroundImage: string;
    backgroundColor: string;
  };
  Partners: {
    title: string;
    partners: { name: string; logoUrl?: string }[];
  };
  FeatureGrid: {
    title: string;
    description: string;
    features: { title: string; description: string; svgIcon: string }[];
  };
  Testimonial: {
    title: string;
    subtitle: string;
    testimonials: { quote: string; author: string; role: string; initials: string; bgColor: string }[];
  };
  RecentPosts: {
    title: string;
    description: string;
    viewAllText: string;
    viewAllLink: string;
  };
  CallToAction: {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    footerText: string;
  };
  SiteFooter: {
    siteName: string;
    copyrightText: string;
  };
  CustomHTML: {
    html: string;
  };
  Spacer: {
    height: number;
  };
  MagazineHeader: {
    logoUrl: string;
    menuItems: { label: string; url: string }[];
  };
  MagazineBigGrid: {
    title: string;
    categorySlug: string;
  };
  MagazineFlexBlock: {
    title: string;
    categorySlug: string;
    limit: number;
  };
  MagazineFooter: {};
};

export const puckConfig: Config<Props> = {
  components: {
    SiteHeader: {
      fields: {
        // === 1. BRANDING & LOGO ===
        logoType: {
          type: "radio",
          options: [
            { label: "Logo + Nama", value: "both" },
            { label: "Hanya Gambar Logo", value: "image" },
            { label: "Hanya Teks & Inisial", value: "text" }
          ]
        },
        logoImage: { type: "custom", render: ImageField },
        logoHeight: {
          type: "select",
          options: [
            { label: "Sangat Kecil (28px)", value: "28px" },
            { label: "Kecil (36px)", value: "36px" },
            { label: "Sedang (44px) - Default", value: "44px" },
            { label: "Besar (52px)", value: "52px" },
            { label: "Ekstra Besar (64px)", value: "64px" }
          ]
        },
        logoLetter: { type: "text" },
        siteTitle: { type: "text" },
        siteTitleHighlight: { type: "text" },
        highlightColor: { type: "text" },

        // === 2. MENU NAVIGASI ===
        menuItems: {
          type: "array",
          arrayFields: {
            label: { type: "text" },
            url: { type: "text" }
          }
        },
        menuPosition: {
          type: "radio",
          options: [
            { label: "Kiri", value: "justify-start" },
            { label: "Tengah", value: "justify-center" },
            { label: "Kanan", value: "justify-end" }
          ]
        },
        menuItemSpacing: {
          type: "select",
          options: [
            { label: "Rapat (16px)", value: "space-x-4" },
            { label: "Normal (24px)", value: "space-x-6" },
            { label: "Renggang (32px)", value: "space-x-8" }
          ]
        },
        linkHoverColor: { type: "text" },

        // === 3. TOMBOL CALL TO ACTION (CTA) ===
        showCta: {
          type: "radio",
          options: [
            { label: "Tampilkan", value: "yes" },
            { label: "Sembunyikan", value: "no" }
          ]
        },
        ctaText: { type: "text" },
        ctaUrl: { type: "text" },
        ctaStyle: {
          type: "select",
          options: [
            { label: "Pill Solid", value: "solid" },
            { label: "Garis Tepi (Outline)", value: "outline" }
          ]
        },
        ctaBgColor: { type: "text" },
        ctaTextColor: { type: "text" },

        // === 4. TATA LETAK & PENGATURAN HEADER ===
        headerPosition: {
          type: "radio",
          options: [
            { label: "Melayang (Fixed)", value: "fixed" },
            { label: "Menempel (Sticky)", value: "sticky" },
            { label: "Statis (Ikut Scroll)", value: "static" }
          ]
        },
        headerBgColor1: { type: "text" },
        headerBgColor2: { type: "text" },
        headerGlassmorphism: {
          type: "radio",
          options: [
            { label: "Efek Kaca (Blur)", value: "yes" },
            { label: "Warna Solid", value: "no" }
          ]
        },
        textColor: { type: "text" },
        showBorder: {
          type: "radio",
          options: [
            { label: "Ya", value: "yes" },
            { label: "Tidak", value: "no" }
          ]
        },
        borderColor: { type: "text" },
        headerPadding: {
          type: "select",
          options: [
            { label: "Kompak (64px)", value: "h-16" },
            { label: "Normal (80px)", value: "h-20" },
            { label: "Lapang (96px)", value: "h-24" }
          ]
        },
        containerWidth: {
          type: "select",
          options: [
            { label: "Standar (1280px)", value: "max-w-7xl" },
            { label: "Kompak (1152px)", value: "max-w-6xl" },
            { label: "Penuh (Full Width)", value: "max-w-full px-4 sm:px-6 lg:px-8" }
          ]
        },
        fontFamily: {
          type: "select",
          options: [
            { label: "Sans (Default)", value: "sans-serif" },
            { label: "Serif", value: "serif" },
            { label: "Mono", value: "monospace" }
          ]
        }
      },
      defaultProps: {
        logoType: "both",
        logoImage: "/logo-cmsmu.webp",
        logoHeight: "44px",
        logoLetter: "M",
        siteTitle: "Ekraf",
        siteTitleHighlight: "Mu",
        highlightColor: "#16a34a",
        menuItems: [
          { label: "Keunggulan", url: "#manfaat" },
          { label: "Kisah Sukses", url: "#testimoni" },
          { label: "Berita & Artikel", url: "#berita" },
          { label: "Daftar Inkubasi", url: "#gabung" }
        ],
        menuPosition: "justify-center",
        menuItemSpacing: "space-x-6",
        linkHoverColor: "#16a34a",
        showCta: "yes",
        ctaText: "Mulai Bergabung",
        ctaUrl: "#gabung",
        ctaStyle: "solid",
        ctaBgColor: "#16a34a",
        ctaTextColor: "#ffffff",
        headerPosition: "fixed",
        headerBgColor1: "#ffffff",
        headerBgColor2: "#ffffff",
        headerGlassmorphism: "yes",
        textColor: "#1e293b",
        showBorder: "yes",
        borderColor: "#f1f5f9",
        headerPadding: "h-20",
        containerWidth: "max-w-7xl",
        fontFamily: "sans-serif"
      },
      render: ({
        logoType = "both",
        logoImage = "",
        logoHeight = "44px",
        logoLetter = "M",
        siteTitle = "Ekraf",
        siteTitleHighlight = "Mu",
        highlightColor = "#16a34a",
        menuItems = [],
        menuPosition = "justify-center",
        menuItemSpacing = "space-x-6",
        linkHoverColor = "#16a34a",
        showCta = "yes",
        ctaText = "Mulai Bergabung",
        ctaUrl = "#gabung",
        ctaStyle = "solid",
        ctaBgColor = "#16a34a",
        ctaTextColor = "#ffffff",
        headerPosition = "fixed",
        headerBgColor1 = "#ffffff",
        headerBgColor2 = "#ffffff",
        headerGlassmorphism = "yes",
        textColor = "#1e293b",
        showBorder = "yes",
        borderColor = "#f1f5f9",
        headerPadding = "h-20",
        containerWidth = "max-w-7xl",
        fontFamily = "sans-serif"
      }) => {
        let resolvedPosition = menuPosition;
        if (menuPosition === "start") resolvedPosition = "justify-start";
        else if (menuPosition === "center") resolvedPosition = "justify-center";
        else if (menuPosition === "end") resolvedPosition = "justify-end";

        let posClass = "fixed top-0 left-0 w-full z-50";
        if (headerPosition === "sticky") posClass = "sticky top-0 w-full z-50";
        else if (headerPosition === "static") posClass = "relative w-full z-50";

        const bg1 = headerBgColor1 || "#ffffff";
        const bg2 = headerBgColor2 || bg1;
        const isGlass = headerGlassmorphism !== "no";
        const borderStyle = showBorder !== "no" ? `1px solid ${borderColor || "#f1f5f9"}` : "none";

        const navStyle: React.CSSProperties = {
          background: `linear-gradient(90deg, ${bg1}, ${bg2})`,
          color: textColor || "#1e293b",
          fontFamily: fontFamily || "sans-serif",
          borderBottom: borderStyle,
          ...(isGlass ? { backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" } : {})
        };

        const isOutline = ctaStyle === "outline";
        const ctaButtonStyle: React.CSSProperties = isOutline
          ? {
              borderColor: ctaBgColor || "#16a34a",
              color: ctaBgColor || "#16a34a",
              backgroundColor: "transparent"
            }
          : {
              backgroundColor: ctaBgColor || "#16a34a",
              color: ctaTextColor || "#ffffff",
              boxShadow: `0 8px 20px -4px ${(ctaBgColor || "#16a34a")}44`
            };

        const hasImage = Boolean(logoImage && logoImage.trim().length > 0);
        const showImg = (logoType === "image" || logoType === "both") && hasImage;
        const showText = logoType === "text" || logoType === "both" || !hasImage;

        return (
          <nav id="navbar" className={`${posClass} transition-all duration-300`} style={navStyle}>
            <div className={`${containerWidth || "max-w-7xl"} mx-auto px-4 sm:px-6 lg:px-8`}>
              <div className={`flex justify-between items-center ${headerPadding || "h-20"}`}>
                
                {/* 1. BRANDING / LOGO */}
                <a href="/" className="flex-shrink-0 flex items-center gap-2.5 text-decoration-none group">
                  {showImg && (
                    <img
                      src={logoImage}
                      alt={siteTitle || "Logo"}
                      style={{ height: logoHeight || "44px", width: "auto", objectFit: "contain" }}
                      className="transition-transform group-hover:scale-105"
                    />
                  )}
                  {(!showImg || logoType === "text") && (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: highlightColor || "#16a34a" }}
                    >
                      {logoLetter || "M"}
                    </div>
                  )}
                  {showText && (
                    <span className="font-extrabold text-xl tracking-tight leading-none" style={{ color: textColor || "#1e293b" }}>
                      {siteTitle || "Ekraf"}
                      <span className="ml-1" style={{ color: highlightColor || "#16a34a" }}>
                        {siteTitleHighlight || "Mu"}
                      </span>
                    </span>
                  )}
                </a>

                {/* 2. DESKTOP NAVIGATION MENU */}
                <div className={`hidden md:flex flex-1 mx-8 ${resolvedPosition || "justify-center"}`}>
                  <div className={`flex items-center ${menuItemSpacing || "space-x-6"}`}>
                    {(menuItems || []).map((item, i) => (
                      <a
                        key={i}
                        href={item.url}
                        className="font-medium text-sm tracking-wide transition-colors duration-200 py-1"
                        style={{ color: textColor || "#1e293b" }}
                        onMouseEnter={(e) => {
                          if (linkHoverColor) e.currentTarget.style.color = linkHoverColor;
                        }}
                        onMouseLeave={(e) => {
                          if (textColor) e.currentTarget.style.color = textColor;
                        }}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>

                {/* 3. CTA BUTTON (DESKTOP) */}
                {showCta !== "no" && (
                  <div className="hidden md:flex items-center">
                    <a
                      href={ctaUrl || "#gabung"}
                      style={ctaButtonStyle}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] ${
                        isOutline ? "border-2" : ""
                      }`}
                    >
                      {ctaText || "Mulai Bergabung"}
                    </a>
                  </div>
                )}

                {/* 4. MOBILE HAMBURGER MENU */}
                <div className="md:hidden flex items-center">
                  <details className="relative">
                    <summary
                      className="list-none cursor-pointer p-2 rounded-lg transition-colors flex items-center justify-center focus:outline-none"
                      style={{ color: textColor || "#1e293b" }}
                      aria-label="Toggle Navigation Menu"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </summary>
                    <div
                      className="absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl p-4 border flex flex-col gap-3 z-50"
                      style={{
                        backgroundColor: bg1,
                        borderColor: borderColor || "#f1f5f9",
                        color: textColor || "#1e293b"
                      }}
                    >
                      {(menuItems || []).map((item, i) => (
                        <a
                          key={i}
                          href={item.url}
                          className="font-medium text-sm py-2 px-3 rounded-lg hover:bg-black/5 transition"
                          style={{ color: textColor || "#1e293b" }}
                        >
                          {item.label}
                        </a>
                      ))}
                      {showCta !== "no" && (
                        <div className="pt-2 border-t mt-1" style={{ borderColor: borderColor || "#f1f5f9" }}>
                          <a
                            href={ctaUrl || "#gabung"}
                            style={ctaButtonStyle}
                            className={`block text-center w-full px-4 py-2.5 rounded-full text-sm font-semibold transition ${
                              isOutline ? "border-2" : ""
                            }`}
                          >
                            {ctaText || "Mulai Bergabung"}
                          </a>
                        </div>
                      )}
                    </div>
                  </details>
                </div>

              </div>
            </div>
          </nav>
        );
      }
    },

    HeroSlider: {
      fields: {
        sliderHeight: { type: "select", options: [{label: "Medium (600px)", value: "600px"}, {label: "Large (80vh)", value: "80vh"}, {label: "Full Screen", value: "100vh"}] },
        textPosition: { type: "radio", options: [{label: "Kiri", value: "left"}, {label: "Tengah", value: "center"}, {label: "Kanan", value: "right"}] },
        overlayOpacity: { type: "number" },
        titleColor: { type: "text" },
        titleSize: { type: "select", options: [{label: "Normal", value: "3.5rem"}, {label: "Besar", value: "4.5rem"}] },
        slides: {
          type: "array",
          arrayFields: {
            title: { type: "text" },
            subtitle: { type: "textarea" },
            image: { type: "custom", render: ImageField },
            buttonText: { type: "text" },
            buttonLink: { type: "text" }
          }
        }
      },
      defaultProps: {
        sliderHeight: "600px",
        textPosition: "center",
        overlayOpacity: 50,
        titleColor: "#ffffff",
        titleSize: "3.5rem",
        slides: [
          {
            title: "Solusi Ekonomi Digital",
            subtitle: "Memberdayakan UMKM melalui teknologi yang amanah dan transparan.",
            image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=2000",
            buttonText: "Pelajari Lebih Lanjut",
            buttonLink: "#"
          }
        ]
      },
      render: ({ slides, sliderHeight, textPosition, overlayOpacity, titleColor, titleSize }) => {
        const uid = `muslider_${Math.random().toString(36).slice(2, 7)}`;

        // Migration map: translate old Tailwind DB values → valid CSS values
        const heightMap: Record<string, string> = {
          'h-[600px]': '600px', 'h-[800px]': '800px', 'h-screen': '100vh',
          '600px': '600px', '80vh': '80vh', '100vh': '100vh'
        };
        const height = heightMap[sliderHeight] || sliderHeight || '600px';

        const posMap: Record<string, string> = {
          'items-start text-left': 'left', 'items-center text-center': 'center', 'items-end text-right': 'right',
          'left': 'left', 'center': 'center', 'right': 'right'
        };
        const pos = posMap[textPosition] || 'center';

        const fontMap: Record<string, string> = {
          'text-4xl md:text-6xl': '3.5rem', 'text-5xl md:text-7xl': '4.5rem',
          '3.5rem': '3.5rem', '4.5rem': '4.5rem'
        };
        const fontSize = fontMap[titleSize] || titleSize || '3.5rem';

        const overlayColor = `rgba(15,23,42,${(overlayOpacity ?? 50) / 100})`;
        const textAlign = pos;
        const alignItems = pos === 'left' ? 'flex-start' : pos === 'right' ? 'flex-end' : 'center';


        const slidesHtml = (slides || []).map((slide: any, idx: number) => `
          <div class="${uid}-slide${idx === 0 ? ' active' : ''}">
            ${slide.image ? `<img src="${slide.image}" alt="${slide.title || ''}" class="${uid}-bg" />` : `<div class="${uid}-bg" style="background:#1e293b"></div>`}
            <div class="${uid}-overlay"></div>
            <div class="${uid}-content" style="align-items:${alignItems};text-align:${textAlign};">
              <h2 class="${uid}-title" style="color:${titleColor ?? '#fff'};font-size:${fontSize}">${slide.title || ''}</h2>
              <p class="${uid}-desc">${slide.subtitle || ''}</p>
              ${slide.buttonText ? `<a href="${slide.buttonLink || '#'}" class="${uid}-btn">${slide.buttonText}</a>` : ''}
            </div>
          </div>
        `).join('');

        const dotsHtml = (slides || []).length > 1 ? `
          <button class="${uid}-nav prev" onclick="${uid}_move(-1)">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button class="${uid}-nav next" onclick="${uid}_move(1)">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
          <div class="${uid}-dots">
            ${(slides || []).map((_: any, i: number) => `<button class="${uid}-dot${i===0?' active':''}" onclick="${uid}_set(${i})"></button>`).join('')}
          </div>
        ` : '';

        const html = `
<style>
  .${uid}-wrap{position:relative;width:100%;height:${height};overflow:hidden;background:#0f172a;font-family:'Plus Jakarta Sans',sans-serif;}
  .${uid}-slide{position:absolute;inset:0;opacity:0;transition:opacity 0.8s ease-in-out;z-index:0;}
  .${uid}-slide.active{opacity:1;z-index:10;}
  .${uid}-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:1;}
  .${uid}-overlay{position:absolute;inset:0;background-color:${overlayColor};z-index:2;}
  .${uid}-content{position:relative;z-index:3;display:flex;flex-direction:column;height:100%;justify-content:center;color:#fff;padding:0 20px;max-width:900px;margin:0 auto;}
  .${uid}-title{font-weight:800;margin-bottom:1.5rem;line-height:1.1;text-shadow:0 4px 10px rgba(0,0,0,0.5);}
  .${uid}-desc{font-size:1.25rem;margin-bottom:2.5rem;color:#e2e8f0;max-width:700px;text-shadow:0 2px 5px rgba(0,0,0,0.5);}
  .${uid}-btn{display:inline-block;padding:14px 32px;border-radius:50px;font-weight:700;font-size:1.1rem;text-decoration:none;background:#16a34a;color:#fff;transition:all 0.3s;box-shadow:0 10px 15px -3px rgba(22,163,74,0.4);}
  .${uid}-btn:hover{background:#15803d;transform:translateY(-2px);}
  .${uid}-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:20;background:rgba(0,0,0,0.3);color:#fff;border:1px solid rgba(255,255,255,0.2);width:50px;height:50px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);transition:background 0.3s;}
  .${uid}-nav:hover{background:rgba(0,0,0,0.7);}
  .${uid}-nav.prev{left:20px;} .${uid}-nav.next{right:20px;}
  .${uid}-dots{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);z-index:20;display:flex;gap:12px;}
  .${uid}-dot{width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,0.4);border:none;cursor:pointer;transition:background 0.3s;}
  .${uid}-dot.active{background:#fff;}
  @media(max-width:768px){.${uid}-title{font-size:2.25rem!important;}.${uid}-desc{font-size:1rem;}.${uid}-nav{display:none;}}
</style>
<div class="${uid}-wrap">
  ${slidesHtml}
  ${dotsHtml}
</div>
<script>
(function(){
  var cur=0, timer;
  function slides(){ return document.querySelectorAll('.${uid}-slide'); }
  function dots(){ return document.querySelectorAll('.${uid}-dot'); }
  function go(n){
    var s=slides(),d=dots();
    if(!s.length) return;
    s[cur].classList.remove('active');
    if(d[cur]) d[cur].classList.remove('active');
    cur=(n+s.length)%s.length;
    s[cur].classList.add('active');
    if(d[cur]) d[cur].classList.add('active');
    clearInterval(timer); timer=setInterval(function(){go(cur+1);},5000);
  }
  window['${uid}_move']=function(step){go(cur+step);};
  window['${uid}_set']=function(i){go(i);};
  function init(){ clearInterval(timer); timer=setInterval(function(){go(cur+1);},5000); }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',init); } else { init(); }
  setTimeout(init,500);
})();
<\/script>`;

        return <div dangerouslySetInnerHTML={{ __html: html }} />;
      }
    },
    Hero: {
      fields: {
        badgeText: { type: "text" },
        title: { type: "text" },
        titleHighlight: { type: "text" },
        titleColor: { type: "text" },
        description: { type: "textarea" },
        descriptionColor: { type: "text" },
        primaryButtonText: { type: "text" },
        primaryButtonLink: { type: "text" },
        secondaryButtonText: { type: "text" },
        secondaryButtonLink: { type: "text" },
        backgroundImage: { type: "custom", render: ImageField },
        backgroundColor: { type: "text" }
      },
      defaultProps: {
        badgeText: "🚀 Mendorong Kemandirian Umat",
        title: "Bangun Bisnis Kreatif Anda Menuju Ekosistem",
        titleHighlight: "Berkemajuan",
        titleColor: "text-slate-900",
        description: "Lembaga Ekonomi Kreatif Muhammadiyah hadir untuk mendampingi pelaku UMKM, kreator, dan inovator digital dengan pendekatan syariah, teknologi modern, dan jaringan global.",
        descriptionColor: "text-slate-600",
        primaryButtonText: "Daftar Inkubasi Sekarang",
        primaryButtonLink: "#gabung",
        secondaryButtonText: "Baca Berita Terbaru",
        secondaryButtonLink: "#berita",
        backgroundImage: "",
        backgroundColor: "bg-slate-50"
      },
      render: ({ badgeText, title, titleHighlight, titleColor, description, descriptionColor, primaryButtonText, primaryButtonLink, secondaryButtonText, secondaryButtonLink, backgroundImage, backgroundColor }) => (
        <section className={`relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden ${backgroundColor || 'bg-slate-50'}`} style={{ 
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
          backgroundSize: backgroundImage ? 'cover' : '20px 20px',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          {backgroundImage && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-0"></div>}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-100 text-green-700 font-semibold text-sm border border-green-200">
              {badgeText}
            </div>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight ${titleColor || 'text-slate-900'}`}>
              {title.split(' Menuju Ekosistem')[0]} <br className="hidden md:block" />
              Menuju Ekosistem <span className="text-green-600">{titleHighlight}</span>
            </h1>
            <p className={`mt-4 text-lg md:text-xl max-w-3xl mx-auto mb-10 ${descriptionColor || 'text-slate-600'}`}>
              {description}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href={primaryButtonLink} className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold text-lg transition shadow-xl shadow-green-600/30 flex items-center justify-center gap-2">
                {primaryButtonText}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </a>
              <a href={secondaryButtonLink} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-full font-bold text-lg transition flex items-center justify-center">
                {secondaryButtonText}
              </a>
            </div>
          </div>
        </section>
      )
    },
    Partners: {
      fields: {
        title: { type: "text" },
        partners: {
          type: "array",
          arrayFields: {
            name: { type: "text" },
            logoUrl: { type: "custom", render: ImageField }
          }
        }
      },
      defaultProps: {
        title: "Dipercaya & Berkolaborasi Dengan",
        partners: [
          { name: "SatuMu", logoUrl: "" },
          { name: "Suara Muhammadiyah", logoUrl: "" },
          { name: "BTM", logoUrl: "" },
          { name: "Lazismu", logoUrl: "" }
        ]
      },
      render: ({ title, partners }) => (
        <section className="bg-white py-12 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-slate-500 font-medium mb-8 uppercase tracking-wider">{title}</p>
            <div className="flex justify-center flex-wrap gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition duration-300">
              {partners.map((partner, i) => (
                <div key={i} className="flex items-center justify-center">
                  {partner.logoUrl ? (
                    <img src={partner.logoUrl} alt={partner.name} className="h-10 object-contain" />
                  ) : (
                    <span className="text-2xl font-bold text-slate-800">{partner.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    },
    FeatureGrid: {
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        features: {
          type: "array",
          arrayFields: {
            title: { type: "text" },
            description: { type: "textarea" },
            svgIcon: { type: "textarea" }
          }
        }
      },
      defaultProps: {
        title: "Mengapa Bergabung Bersama Kami?",
        description: "Kami memadukan prinsip ekonomi Islam dengan literasi digital untuk memastikan bisnis Anda tumbuh secara etis dan eksponensial.",
        features: [
          {
            title: "Akselerasi Digital",
            description: "Pendampingan integrasi sistem, dari pengelolaan server awan, otomasi database, hingga optimasi antarmuka digital UMKM.",
            svgIcon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>'
          },
          {
            title: "Jaringan Saudagar",
            description: "Akses eksklusif ke ribuan pelaku usaha dalam ekosistem persyarikatan untuk kolaborasi silang dan rantai pasok.",
            svgIcon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>'
          },
          {
            title: "Pendampingan Syariah",
            description: "Memastikan model bisnis, pendanaan, dan operasional Anda sesuai dengan prinsip ekonomi Islam yang amanah.",
            svgIcon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>'
          }
        ]
      },
      render: ({ title, description, features }) => (
        <section id="manfaat" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{title}</h2>
              <p className="text-slate-600 text-lg">{description}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:border-green-100 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: feature.svgIcon }}></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    },
    Testimonial: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "textarea" },
        testimonials: {
          type: "array",
          arrayFields: {
            quote: { type: "textarea" },
            author: { type: "text" },
            role: { type: "text" },
            initials: { type: "text" },
            bgColor: { type: "text" }
          }
        }
      },
      defaultProps: {
        title: "Mereka yang Tumbuh Bersama Kami",
        subtitle: "Bukti nyata dari pelaku ekonomi kreatif dan UMKM yang telah merasakan manfaat dari program inkubasi dan jaringan EkrafMu.",
        testimonials: [
          {
            quote: "Sejak bergabung dengan EkrafMu, omset bisnis pakaian muslim kami meningkat 300%. Pendampingan digitalisasinya sangat aplikatif.",
            author: "Hafiz Ahmad",
            role: "Founder, HijrahWear",
            initials: "HA",
            bgColor: "bg-green-600"
          },
          {
            quote: "Jaringan saudagar Muhammadiyah benar-benar membuka pintu. Kami mendapat pemasok bahan baku yang amanah dan kompetitif.",
            author: "Siti Aminah",
            role: "CEO, Kuliner Berkah",
            initials: "SA",
            bgColor: "bg-green-500"
          },
          {
            quote: "Sistem kasir awan yang dikembangkan bersama tim IT EkrafMu menyelesaikan masalah pencatatan keuangan kami yang berantakan.",
            author: "Budi Santoso",
            role: "Owner, Kopi Nusantara",
            initials: "BS",
            bgColor: "bg-green-700"
          }
        ]
      },
      render: ({ title, subtitle, testimonials }) => (
        <section id="testimoni" className="py-20 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{title}</h2>
                <p className="text-slate-600 text-lg">{subtitle}</p>
              </div>
              <div className="hidden md:flex gap-4">
                <button className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-green-600 hover:border-green-600 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <button className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-green-600 hover:border-green-600 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testi, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition duration-300 relative">
                  <div className="absolute top-8 right-8 text-slate-200">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"></path>
                    </svg>
                  </div>
                  <div className="flex justify-center text-yellow-400 gap-1 mb-6">
                    {[1,2,3,4,5].map(star => (
                      <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    ))}
                  </div>
                  <p className="text-slate-700 mb-8 italic z-10 relative leading-relaxed">
                    "{testi.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${testi.bgColor} flex items-center justify-center text-white font-bold`}>
                      {testi.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{testi.author}</h4>
                      <p className="text-sm text-slate-500">{testi.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    },
    RecentPosts: {
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        viewAllText: { type: "text" },
        viewAllLink: { type: "text" }
      },
      defaultProps: {
        title: "Kabar & Wawasan Terbaru",
        description: "Ikuti perkembangan terbaru, kisah inspiratif, dan wawasan seputar ekonomi kreatif di ekosistem digital.",
        viewAllText: "Lihat Semua Artikel",
        viewAllLink: "#"
      },
      render: ({ title, description, viewAllText, viewAllLink }) => (
        <section id="berita" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{title}</h2>
                <p className="text-slate-600 text-lg">{description}</p>
              </div>
              <div>
                <a href={viewAllLink} className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-2 transition-all">
                  {viewAllText}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </a>
              </div>
            </div>
            
            <div className="recent-posts-placeholder">
              {/* Fallback layout for builder if recent posts script doesn't run */}
              <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-slate-100 animate-pulse h-80 rounded-2xl"></div>
                  <div className="bg-slate-100 animate-pulse h-80 rounded-2xl hidden md:block"></div>
                  <div className="bg-slate-100 animate-pulse h-80 rounded-2xl hidden md:block"></div>
              </div>
            </div>
          </div>
        </section>
      )
    },
    CallToAction: {
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        buttonText: { type: "text" },
        buttonLink: { type: "text" },
        footerText: { type: "text" }
      },
      defaultProps: {
        title: "Siap Mengelevasi Skala Bisnis Anda?",
        description: "Bergabunglah dengan ratusan inovator lainnya. Pendaftaran batch inkubasi bulan ini segera ditutup.",
        buttonText: "Kirim Profil Usaha",
        buttonLink: "#",
        footerText: "Data Anda aman dan dikelola secara rahasia."
      },
      render: ({ title, description, buttonText, buttonLink, footerText }) => (
        <section id="gabung" className="py-20 bg-slate-900 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">{title}</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              {description}
            </p>
            <div className="bg-white p-8 rounded-2xl max-w-2xl mx-auto shadow-2xl text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
                  <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Cth: Ahmad Dahlan" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nomor WhatsApp</label>
                  <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0812-xxxx-xxxx" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Sektor Usaha Kreatif</label>
                <select className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                  <option>Pengembangan Perangkat Lunak & IT</option>
                  <option>Kuliner & FnB</option>
                  <option>Fashion & Kriya</option>
                  <option>Media & Desain</option>
                </select>
              </div>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-green-600/30 text-lg">
                {buttonText}
              </button>
              <p className="text-center text-sm text-slate-500 mt-4">{footerText}</p>
            </div>
          </div>
        </section>
      )
    },
    SiteFooter: {
      fields: {
        siteName: { type: "text" },
        copyrightText: { type: "text" }
      },
      defaultProps: {
        siteName: "EkrafMu",
        copyrightText: "© 2026 Lembaga Ekonomi Kreatif Muhammadiyah. Hak Cipta Dilindungi."
      },
      render: ({ siteName, copyrightText }) => (
        <footer className="bg-white border-t border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">M</div>
              <span className="font-bold text-lg text-slate-900">{siteName}</span>
            </div>
            <p className="text-slate-500 text-sm">
              {copyrightText}
            </p>
          </div>
        </footer>
      )
    },
    CustomHTML: {
      fields: {
        html: { type: "textarea" }
      },
      defaultProps: {
        html: "<div class='text-center p-8 bg-slate-100 rounded-lg'>Halo, ini Custom HTML!</div>"
      },
      render: ({ html }) => (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      )
    },
    Spacer: {
      fields: {
        height: { type: "number" },
      },
      defaultProps: {
        height: 40,
      },
      render: ({ height }) => (
        <div style={{ height: `${height}px` }} aria-hidden="true" />
      ),
    },

    // --- MAGAZINE BLOCKS (Migrated from Newspaper Theme) ---
    MagazineHeader: {
      fields: {
        logoUrl: { type: "text" },
        menuItems: {
          type: "array",
          arrayFields: {
            label: { type: "text" },
            url: { type: "text" }
          }
        }
      },
      defaultProps: {
        logoUrl: "/theme-assets/labmu-pro/images/logo.png",
        menuItems: [
          { label: "Home", url: "/" },
          { label: "News", url: "/category/news" },
          { label: "Tech", url: "/category/tech" }
        ]
      },
      render: ({ logoUrl, menuItems }) => (
        <div dangerouslySetInnerHTML={{__html: `<!-- MAGAZINE_HEADER_START -->`}}></div>
      )
    },

    MagazineBigGrid: {
      fields: {
        title: { type: "text" },
        categorySlug: { type: "text" }
      },
      defaultProps: {
        title: "Top Stories",
        categorySlug: ""
      },
      render: ({ title, categorySlug }) => (
        <section className="w-full max-w-[1140px] mx-auto px-4 py-8 font-sans">
            <div className="mb-6 relative border-b border-[#222]">
                <h4 className="bg-black text-white font-bold uppercase text-xs tracking-wider px-4 py-2 m-0 inline-block relative top-[1px]">
                    {title}
                </h4>
            </div>
            <div dangerouslySetInnerHTML={{__html: `<!-- MAGAZINE_BIG_GRID_START:${categorySlug} -->`}} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 h-[450px]">
                <div className="md:col-span-2 bg-slate-900 h-full text-white p-6 flex flex-col justify-end"><span className="text-xl font-bold">Primary Article Preview</span></div>
                <div className="flex flex-col gap-1 h-full">
                    <div className="bg-slate-800 h-[223px] text-white p-4 flex flex-col justify-end">Preview 1</div>
                    <div className="bg-slate-800 h-[223px] text-white p-4 flex flex-col justify-end">Preview 2</div>
                </div>
            </div>
            <div dangerouslySetInnerHTML={{__html: `<!-- MAGAZINE_BIG_GRID_END -->`}} />
        </section>
      )
    },

    MagazineFlexBlock: {
      fields: {
        title: { type: "text" },
        categorySlug: { type: "text" },
        limit: { type: "number" }
      },
      defaultProps: {
        title: "Latest Articles",
        categorySlug: "",
        limit: 4
      },
      render: ({ title, categorySlug, limit }) => (
        <section className="w-full max-w-[1140px] mx-auto px-4 py-8 font-sans">
            <div className="mb-6 relative border-b border-[#222]">
                <h4 className="bg-green-600 text-white font-bold uppercase text-xs tracking-wider px-4 py-2 m-0 inline-block relative top-[1px]">
                    {title}
                </h4>
            </div>
            <div dangerouslySetInnerHTML={{__html: `<!-- MAGAZINE_FLEX_BLOCK_START:${categorySlug}:${limit} -->`}} />
            <div className="flex flex-col gap-4">
                <div className="flex gap-4 h-[120px] bg-slate-100 p-2">
                    <div className="w-[180px] bg-slate-300"></div>
                    <div className="flex-1 py-2"><span className="font-bold text-slate-800">Article Title Preview</span></div>
                </div>
            </div>
            <div dangerouslySetInnerHTML={{__html: `<!-- MAGAZINE_FLEX_BLOCK_END -->`}} />
        </section>
      )
    },

    MagazineFooter: {
      fields: {},
      defaultProps: {},
      render: () => (
        <div dangerouslySetInnerHTML={{__html: `<!-- MAGAZINE_FOOTER_START -->`}}></div>
      )
    }

  },
};
