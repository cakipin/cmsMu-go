import React from "react";
import type { FeatureGridProps } from "@cmsmu/schema-sdui";

interface Props {
  props: Partial<FeatureGridProps> & { features?: any[] };
  locale: string;
}

// Koleksi ikon SVG kustom cmsMu (Anti-Slop & Zero Keyboard Emoji)
function FeatureIcon({ name }: { name?: string }) {
  const icon = (name || "bolt").toLowerCase();

  if (icon === "shield" || icon.includes("keamanan") || icon.includes("security")) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }

  if (icon === "mobile" || icon.includes("responsif") || icon.includes("phone")) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    );
  }

  if (icon === "globe" || icon.includes("multi") || icon.includes("bahasa")) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }

  // Default: Bolt / Cepat
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function FeatureGridBlock({ props }: Props) {
  const title = props.title || "Fitur Unggulan Platform";
  const description = props.description || "Solusi lengkap dan terintegrasi untuk kebutuhan publikasi modern.";
  const list = props.items && props.items.length > 0 ? props.items : props.features || [];

  return (
    <section
      style={{
        padding: "5rem 0",
        backgroundColor: "var(--bg-canvas)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto 3.5rem auto" }}>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              letterSpacing: "-0.01em",
              marginBottom: "0.75rem",
              color: "var(--text-primary)",
            }}
          >
            {title}
          </h2>
          {description && (
            <p style={{ fontSize: "1.0625rem", color: "var(--text-secondary)" }}>
              {description}
            </p>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
          }}
        >
          {list.map((feat, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: "var(--bg-surface)",
                padding: "2rem",
                borderRadius: "16px",
                border: "1px solid var(--border-subtle)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "var(--accent-light)",
                  color: "var(--accent-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FeatureIcon name={feat.icon || feat.svgIcon} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
