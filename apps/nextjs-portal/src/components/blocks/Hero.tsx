import React from "react";
import Link from "next/link";
import type { HeroProps } from "@cmsmu/schema-sdui";

interface Props {
  props: Partial<HeroProps>;
  locale: string;
}

export function HeroBlock({ props, locale }: Props) {
  const title = props.title || "Membangun Peradaban Utama";
  const subtitle = props.subtitle || "Satu platform Content Management System modern dan tangguh.";
  const badgeText = props.badgeText || "";
  const primaryButtonText = props.primaryButtonText || "Jelajahi Fitur";
  const primaryButtonLink = props.primaryButtonLink || `/${locale}/posts`;
  const secondaryButtonText = props.secondaryButtonText || "";
  const secondaryButtonLink = props.secondaryButtonLink || "/admin";

  return (
    <section
      style={{
        padding: "5rem 0",
        backgroundColor: "var(--bg-canvas)",
        borderBottom: "1px solid var(--border-subtle)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="container" style={{ textAlign: "center", maxWidth: "860px" }}>
        {badgeText && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: "var(--accent-light)",
              color: "var(--accent-primary)",
              fontSize: "0.875rem",
              fontWeight: 700,
              marginBottom: "1.75rem",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>{badgeText}</span>
          </div>
        )}

        <h1
          style={{
            fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            marginBottom: "1.25rem",
            color: props.titleColor || "var(--text-primary)",
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              fontSize: "1.125rem",
              lineHeight: 1.7,
              color: props.subtitleColor || "var(--text-secondary)",
              marginBottom: "2.5rem",
            }}
          >
            {subtitle}
          </p>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          {primaryButtonText && (
            <Link
              href={primaryButtonLink}
              style={{
                backgroundColor: "var(--accent-primary)",
                color: "#ffffff",
                padding: "14px 28px",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "1rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(10, 97, 52, 0.25)",
                transition: "transform 0.15s ease",
              }}
            >
              <span>{primaryButtonText}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          )}

          {secondaryButtonText && (
            <Link
              href={secondaryButtonLink}
              style={{
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-strong)",
                padding: "14px 28px",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "1rem",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {secondaryButtonText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
