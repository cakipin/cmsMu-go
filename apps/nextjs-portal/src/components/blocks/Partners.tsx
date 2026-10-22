import React from "react";
import type { PartnersProps } from "@cmsmu/schema-sdui";

interface Props {
  props: Partial<PartnersProps> & { partners?: any[] };
  locale: string;
}

export function PartnersBlock({ props }: Props) {
  const title = props.title || "Mitra & Kolaborasi";
  // Dukung array items maupun partners dari skema canvas
  const list = props.items && props.items.length > 0 ? props.items : props.partners || [];

  if (list.length === 0) return null;

  return (
    <section
      style={{
        padding: "3rem 0",
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="container" style={{ textAlign: "center" }}>
        <p
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
            marginBottom: "1.75rem",
          }}
        >
          {title}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2.5rem",
            flexWrap: "wrap",
          }}
        >
          {list.map((partner, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                opacity: 0.85,
                transition: "opacity 0.2s ease",
              }}
            >
              {partner.logoUrl ? (
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  style={{
                    maxHeight: "36px",
                    maxWidth: "140px",
                    objectFit: "contain",
                    filter: "grayscale(100%)",
                  }}
                  onError={e => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : null}
              <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
