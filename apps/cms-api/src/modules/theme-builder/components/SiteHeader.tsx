import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";
import { ImageField } from "./ImageField";

export const SiteHeader: ComponentConfig<Props["SiteHeader"]> = {
  fields: {
    // === 1. BRANDING & LOGO ===
    logoType: {
      type: "radio",
      options: [
        { label: "Logo + Nama", value: "both" },
        { label: "Hanya Gambar Logo", value: "image" },
        { label: "Hanya Teks & Inisial", value: "text" },
      ],
    },
    logoImage: { type: "custom", render: ImageField },
    logoHeight: {
      type: "select",
      options: [
        { label: "Sangat Kecil (28px)", value: "28px" },
        { label: "Kecil (36px)", value: "36px" },
        { label: "Sedang (44px) - Default", value: "44px" },
        { label: "Besar (52px)", value: "52px" },
        { label: "Ekstra Besar (64px)", value: "64px" },
      ],
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
        url: { type: "text" },
      },
    },
    menuPosition: {
      type: "radio",
      options: [
        { label: "Kiri", value: "justify-start" },
        { label: "Tengah", value: "justify-center" },
        { label: "Kanan", value: "justify-end" },
      ],
    },
    menuItemSpacing: {
      type: "select",
      options: [
        { label: "Rapat (16px)", value: "space-x-4" },
        { label: "Normal (24px)", value: "space-x-6" },
        { label: "Renggang (32px)", value: "space-x-8" },
      ],
    },
    linkHoverColor: { type: "text" },

    // === 3. TOMBOL CALL TO ACTION (CTA) ===
    showCta: {
      type: "radio",
      options: [
        { label: "Tampilkan", value: "yes" },
        { label: "Sembunyikan", value: "no" },
      ],
    },
    ctaText: { type: "text" },
    ctaUrl: { type: "text" },
    ctaStyle: {
      type: "select",
      options: [
        { label: "Pill Solid", value: "solid" },
        { label: "Garis Tepi (Outline)", value: "outline" },
      ],
    },
    ctaBgColor: { type: "text" },
    ctaTextColor: { type: "text" },

    // === 4. TATA LETAK & PENGATURAN HEADER ===
    headerPosition: {
      type: "radio",
      options: [
        { label: "Melayang (Fixed)", value: "fixed" },
        { label: "Menempel (Sticky)", value: "sticky" },
        { label: "Statis (Ikut Scroll)", value: "static" },
      ],
    },
    headerBgColor1: { type: "text" },
    headerBgColor2: { type: "text" },
    headerGlassmorphism: {
      type: "radio",
      options: [
        { label: "Efek Kaca (Blur)", value: "yes" },
        { label: "Warna Solid", value: "no" },
      ],
    },
    textColor: { type: "text" },
    showBorder: {
      type: "radio",
      options: [
        { label: "Ya", value: "yes" },
        { label: "Tidak", value: "no" },
      ],
    },
    borderColor: { type: "text" },
    headerPadding: {
      type: "select",
      options: [
        { label: "Kompak (64px)", value: "h-16" },
        { label: "Normal (80px)", value: "h-20" },
        { label: "Lapang (96px)", value: "h-24" },
      ],
    },
    containerWidth: {
      type: "select",
      options: [
        { label: "Standar (1280px)", value: "max-w-7xl" },
        { label: "Kompak (1152px)", value: "max-w-6xl" },
        {
          label: "Penuh (Full Width)",
          value: "max-w-full px-4 sm:px-6 lg:px-8",
        },
      ],
    },
    fontFamily: {
      type: "select",
      options: [
        { label: "Sans (Default)", value: "sans-serif" },
        { label: "Serif", value: "serif" },
        { label: "Mono", value: "monospace" },
      ],
    },
    // === 5. PENGATURAN GLOBAL WEBSITE ===
    applyGlobal: {
      type: "radio",
      options: [
        { label: "Aktif di Seluruh Web (Page & Post)", value: "all" },
        { label: "Hanya Halaman Ini", value: "page_only" },
      ],
    },
    syncLogo: {
      type: "radio",
      options: [
        { label: "Sinkronkan ke Logo Utama Website", value: "yes" },
        { label: "Hanya Header Ini", value: "no" },
      ],
    },
  },
  defaultProps: {
    applyGlobal: "all",
    syncLogo: "yes",
    logoType: "both",
    logoImage: "",
    logoHeight: "44px",
    logoLetter: "M",
    siteTitle: "",
    siteTitleHighlight: "",
    highlightColor: "#16a34a",
    menuItems: [
      { label: "Fitur Unggulan", url: "#fitur" },
      { label: "Ekosistem", url: "#ekosistem" },
      { label: "Berita & Opini", url: "#berita" },
      { label: "Hubungi Kami", url: "#kontak" },
    ],
    menuPosition: "justify-center",
    menuItemSpacing: "space-x-6",
    linkHoverColor: "#16a34a",
    showCta: "yes",
    ctaText: "Masuk Dashboard",
    ctaUrl: "/admin",
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
    fontFamily: "sans-serif",
  },
  render: ({
    logoType = "both",
    logoImage = "",
    logoHeight = "44px",
    logoLetter = "M",
    siteTitle = "",
    siteTitleHighlight = "",
    highlightColor = "#16a34a",
    menuItems = [],
    menuPosition = "justify-center",
    menuItemSpacing = "space-x-6",
    linkHoverColor = "#16a34a",
    showCta = "yes",
    ctaText = "Masuk Dashboard",
    ctaUrl = "/admin",
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
    fontFamily = "sans-serif",
  }) => {
    // Normalisasi posisi menu navigasi untuk kompatibilitas data lama
    let resolvedPosition = menuPosition;
    if (menuPosition === "start") resolvedPosition = "justify-start";
    else if (menuPosition === "center") resolvedPosition = "justify-center";
    else if (menuPosition === "end") resolvedPosition = "justify-end";

    // Posisi Header
    let posClass = "fixed top-0 left-0 w-full z-50";
    if (headerPosition === "sticky") posClass = "sticky top-0 w-full z-50";
    else if (headerPosition === "static") posClass = "relative w-full z-50";

    // Glassmorphism & Background Styling
    const bg1 = headerBgColor1 || "#ffffff";
    const bg2 = headerBgColor2 || bg1;
    const isGlass = headerGlassmorphism !== "no";
    const borderStyle =
      showBorder !== "no" ? `1px solid ${borderColor || "#f1f5f9"}` : "none";

    const navStyle: React.CSSProperties = {
      background: `linear-gradient(90deg, ${bg1}, ${bg2})`,
      color: textColor || "#1e293b",
      fontFamily: fontFamily || "sans-serif",
      borderBottom: borderStyle,
      ...(isGlass
        ? { backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }
        : {}),
    };

    // Styling CTA Button
    const isOutline = ctaStyle === "outline";
    const ctaButtonStyle: React.CSSProperties = isOutline
      ? {
          borderColor: ctaBgColor || "#16a34a",
          color: ctaBgColor || "#16a34a",
          backgroundColor: "transparent",
        }
      : {
          backgroundColor: ctaBgColor || "#16a34a",
          color: ctaTextColor || "#ffffff",
          boxShadow: `0 8px 20px -4px ${ctaBgColor || "#16a34a"}44`,
        };

    const hasImage = Boolean(
      logoImage &&
      logoImage.trim().length > 0 &&
      logoImage !== "/logo-cmsmu.webp"
    );
    const showImg = (logoType === "image" || logoType === "both") && hasImage;
    const showText = logoType === "text" || logoType === "both" || !hasImage;

    return (
      <nav
        id="navbar"
        className={`${posClass} transition-all duration-300`}
        style={navStyle}
      >
        <div
          className={`${containerWidth || "max-w-7xl"} mx-auto px-4 sm:px-6 lg:px-8`}
        >
          <div
            className={`flex items-center justify-between ${headerPadding || "h-20"}`}
          >
            {/* 1. BRANDING / LOGO */}
            <a
              href="/"
              className="text-decoration-none group flex flex-shrink-0 items-center gap-2.5"
            >
              {showImg && (
                <img
                  src={logoImage}
                  alt={siteTitle || "Logo"}
                  style={{
                    height: logoHeight || "44px",
                    width: "auto",
                    objectFit: "contain",
                  }}
                  className="transition-transform group-hover:scale-105"
                />
              )}
              {/* Fallback avatar letter jika mode text atau logo image kosong */}
              {!showImg && (
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm"
                  style={{ backgroundColor: highlightColor || "#16a34a" }}
                >
                  {logoLetter || "M"}
                </div>
              )}
              {showText && (
                <span
                  className="text-xl leading-none font-extrabold tracking-tight"
                  style={{ color: textColor || "#1e293b" }}
                >
                  {siteTitle || ""}
                  {siteTitleHighlight ? (
                    <span
                      className="ml-1"
                      style={{ color: highlightColor || "#16a34a" }}
                    >
                      {siteTitleHighlight}
                    </span>
                  ) : null}
                </span>
              )}
            </a>

            {/* 2. DESKTOP NAVIGATION MENU */}
            <div
              className={`mx-8 hidden flex-1 md:flex ${resolvedPosition || "justify-center"}`}
            >
              <div
                className={`flex items-center ${menuItemSpacing || "space-x-6"}`}
              >
                {(menuItems || []).map((item, i) => (
                  <a
                    key={i}
                    href={item.url}
                    className="py-1 text-sm font-medium tracking-wide transition-colors duration-200"
                    style={{ color: textColor || "#1e293b" }}
                    onMouseEnter={e => {
                      if (linkHoverColor)
                        e.currentTarget.style.color = linkHoverColor;
                    }}
                    onMouseLeave={e => {
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
              <div className="hidden items-center md:flex">
                <a
                  href={ctaUrl || "/admin"}
                  style={ctaButtonStyle}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] ${
                    isOutline ? "border-2" : ""
                  }`}
                >
                  {ctaText || "Masuk Dashboard"}
                </a>
              </div>
            )}

            {/* 4. MOBILE HAMBURGER MENU (CSS details/summary: zero-JS, works in SSR & Puck) */}
            <div className="flex items-center md:hidden">
              <details className="relative">
                <summary
                  className="flex cursor-pointer list-none items-center justify-center rounded-lg p-2 transition-colors focus:outline-none"
                  style={{ color: textColor || "#1e293b" }}
                  aria-label="Toggle Navigation Menu"
                >
                  <svg
                    className="h-6 w-6"
                    width="24"
                    height="24"
                    style={{ width: "24px", height: "24px", maxWidth: "24px", maxHeight: "24px" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </summary>
                <div
                  className="absolute right-0 z-50 mt-2 flex w-64 flex-col gap-3 rounded-2xl border p-4 shadow-2xl"
                  style={{
                    backgroundColor: bg1,
                    borderColor: borderColor || "#f1f5f9",
                    color: textColor || "#1e293b",
                  }}
                >
                  {(menuItems || []).map((item, i) => (
                    <a
                      key={i}
                      href={item.url}
                      className="rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-black/5"
                      style={{ color: textColor || "#1e293b" }}
                    >
                      {item.label}
                    </a>
                  ))}
                  {showCta !== "no" && (
                    <div
                      className="mt-1 border-t pt-2"
                      style={{ borderColor: borderColor || "#f1f5f9" }}
                    >
                      <a
                        href={ctaUrl || "/admin"}
                        style={ctaButtonStyle}
                        className={`block w-full rounded-full px-4 py-2.5 text-center text-sm font-semibold transition ${
                          isOutline ? "border-2" : ""
                        }`}
                      >
                        {ctaText || "Masuk Dashboard"}
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
  },
};
