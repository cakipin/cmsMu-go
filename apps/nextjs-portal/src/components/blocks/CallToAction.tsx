import React from "react";
import Link from "next/link";
import type { CallToActionProps } from "@cmsmu/schema-sdui";

interface Props {
  props: Partial<CallToActionProps>;
  locale: string;
}

export function CallToActionBlock({ props, locale }: Props) {
  const title = props.title || "Siap Membangun Website & Media Anda?";
  const description = props.description || "Mulai terbitkan artikel dan kelola konten digital Anda sekarang juga.";
  const buttonText = props.buttonText || "Mulai Sekarang";
  const buttonLink = props.buttonLink || "/admin";
  const bgColor = props.bgColor || "var(--accent-primary)";
  const textColor = props.textColor || "#ffffff";

  return (
    <section
      style={{
        padding: "5rem 0",
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <div className="container" style={{ textAlign: "center", maxWidth: "720px" }}>
        <h2
          style={{
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
            fontWeight: 800,
            lineHeight: 1.25,
            marginBottom: "1rem",
            color: "inherit",
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            style={{
              fontSize: "1.125rem",
              lineHeight: 1.7,
              opacity: 0.9,
              marginBottom: "2.5rem",
            }}
          >
            {description}
          </p>
        )}
        <div>
          <Link
            href={buttonLink}
            style={{
              backgroundColor: "#ffffff",
              color: "var(--accent-primary)",
              padding: "16px 36px",
              borderRadius: "12px",
              fontWeight: 800,
              fontSize: "1.0625rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
              transition: "transform 0.15s ease",
            }}
          >
            <span>{buttonText}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
