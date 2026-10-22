import React from "react";
import Link from "next/link";
import type { SiteFooterProps } from "@cmsmu/schema-sdui";

interface Props {
  props: Partial<SiteFooterProps> & { siteName?: string };
  locale: string;
}

export function SiteFooterBlock({ props, locale }: Props) {
  const siteTitle = props.siteTitle || props.siteName || "cmsMu";
  const copyrightText =
    props.copyrightText ||
    `© ${new Date().getFullYear()} ${siteTitle}. Hak Cipta Dilindungi Undang-Undang.`;

  return (
    <footer
      style={{
        backgroundColor: "var(--bg-surface)",
        color: "var(--text-secondary)",
        borderTop: "1px solid var(--border-subtle)",
        padding: "3.5rem 0 2.5rem 0",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
            paddingBottom: "2rem",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)" }}>
              {siteTitle}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "2px 8px",
                borderRadius: "6px",
                backgroundColor: "var(--border-subtle)",
                fontWeight: 600,
              }}
            >
              Next.js SDUI Client
            </span>
          </div>

          <nav style={{ display: "flex", alignItems: "center", gap: "1.5rem", fontSize: "0.875rem" }}>
            <Link href={`/${locale}`}>Beranda</Link>
            <Link href={`/${locale}/posts`}>Warta</Link>
            <Link href="/admin">Dashboard CMS</Link>
          </nav>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            paddingTop: "2rem",
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
          }}
        >
          <p>{copyrightText}</p>
          <p>
            Ditenagai oleh <strong>cmsMu Core Engine</strong> &amp; Cloudflare Edge.
          </p>
        </div>
      </div>
    </footer>
  );
}
