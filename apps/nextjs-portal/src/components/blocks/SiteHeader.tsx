import React from "react";
import Link from "next/link";
import type { SiteHeaderProps } from "@cmsmu/schema-sdui";
import { LanguageSwitcher } from "../LanguageSwitcher";

interface Props {
  props: Partial<SiteHeaderProps>;
  locale: string;
}

export function SiteHeaderBlock({ props, locale }: Props) {
  const siteTitle = props.siteTitle || "cmsMu";
  const siteTitleHighlight = props.siteTitleHighlight || "";
  const logoImage = props.logoImage || "/logo-cmsmu.webp";
  const menuItems = props.menuItems || [
    { label: "Beranda", url: `/${locale}` },
    { label: "Berita", url: `/${locale}/posts` },
  ];
  const ctaText = props.ctaText || "Mulai Sekarang";
  const ctaUrl = props.ctaUrl || "/admin";
  const bgColor = props.headerBgColor || "var(--bg-surface)";
  const textColor = props.headerTextColor || "var(--text-primary)";

  return (
    <header
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderBottom: "1px solid var(--border-subtle)",
        position: props.headerPosition === "sticky" ? "sticky" : "relative",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
          gap: "1.5rem",
        }}
      >
        {/* Brand & Logo */}
        <Link
          href={`/${locale}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontWeight: 800,
            fontSize: "1.25rem",
            color: "inherit",
          }}
        >
          {logoImage && (
            <img
              src={logoImage}
              alt={siteTitle}
              style={{ height: "36px", width: "auto", objectFit: "contain" }}
              onError={e => {
                // Sembunyikan jika URL lokal/kosong
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          )}
          <span>
            {siteTitle}{" "}
            {siteTitleHighlight && (
              <span style={{ color: "var(--accent-primary)" }}>{siteTitleHighlight}</span>
            )}
          </span>
        </Link>

        {/* Navigation Menus */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.75rem",
            fontSize: "0.9375rem",
            fontWeight: 600,
          }}
        >
          {menuItems.map((item, idx) => {
            const url = item.url.startsWith("/") ? `/${locale}${item.url.replace(`/${locale}`, "")}` : item.url;
            return (
              <Link
                key={idx}
                href={url}
                style={{
                  color: "var(--text-secondary)",
                  transition: "color 0.15s ease",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions & Language Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <LanguageSwitcher currentLocale={locale} />
          {props.showCta !== "no" && (
            <Link
              href={ctaUrl}
              style={{
                backgroundColor: "var(--accent-primary)",
                color: "#ffffff",
                padding: "8px 18px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.875rem",
                display: "inline-flex",
                alignItems: "center",
                transition: "opacity 0.15s ease",
              }}
            >
              {ctaText}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
