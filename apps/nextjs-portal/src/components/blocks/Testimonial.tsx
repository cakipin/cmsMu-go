import React from "react";
import type { TestimonialProps } from "@cmsmu/schema-sdui";

interface Props {
  props: Partial<TestimonialProps> & { testimonials?: any[] };
  locale: string;
}

export function TestimonialBlock({ props }: Props) {
  const title = props.title || "Dipercaya Pengelola Website & Media";
  const subtitle = props.subtitle || "Pengalaman para administrator dan redaktur.";
  const list = props.items && props.items.length > 0 ? props.items : props.testimonials || [];

  if (list.length === 0) return null;

  return (
    <section
      style={{
        padding: "5rem 0",
        backgroundColor: "var(--bg-surface)",
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
          {subtitle && (
            <p style={{ fontSize: "1.0625rem", color: "var(--text-secondary)" }}>
              {subtitle}
            </p>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
          }}
        >
          {list.map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: "var(--bg-canvas)",
                padding: "2rem",
                borderRadius: "16px",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1.5rem",
              }}
            >
              <p
                style={{
                  fontSize: "1.0625rem",
                  lineHeight: 1.7,
                  color: "var(--text-primary)",
                  fontStyle: "italic",
                }}
              >
                &ldquo;{item.quote}&rdquo;
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "9999px",
                    backgroundColor: "var(--accent-primary)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.9375rem",
                  }}
                >
                  {item.initials || (item.author ? item.author.slice(0, 2).toUpperCase() : "MU")}
                </div>
                <div>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {item.author}
                  </h4>
                  {item.role && (
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                      {item.role}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
