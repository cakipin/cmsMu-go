import React from "react";
import Link from "next/link";
import type { RecentPostsProps } from "@cmsmu/schema-sdui";
import { cmsMuClient } from "../../lib/cmsmu";

interface Props {
  props: Partial<RecentPostsProps>;
  locale: string;
}

export async function RecentPostsBlock({ props, locale }: Props) {
  const title = props.title || "Kabar & Wawasan Terbaru";
  const subtitle = props.subtitle || "Ikuti perkembangan terbaru dan artikel pilihan secara berkala.";
  const limit = typeof props.limit === "number" ? props.limit : parseInt(String(props.limit || 6), 10);

  let posts: any[] = [];
  try {
    const res = await cmsMuClient.posts.list({ limit, locale });
    if (res && res.data) {
      posts = res.data;
    }
  } catch (e) {
    // Graceful fallback jika API offline saat build
    posts = [];
  }

  return (
    <section
      style={{
        padding: "5rem 0",
        backgroundColor: "var(--bg-canvas)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "3rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                letterSpacing: "-0.01em",
                marginBottom: "0.5rem",
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

          <Link
            href={`/${locale}/posts`}
            style={{
              color: "var(--accent-primary)",
              fontWeight: 700,
              fontSize: "0.9375rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>Lihat Semua Berita</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {posts.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            {posts.map(post => (
              <article
                key={post.id}
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                {post.featuredImage && (
                  <div style={{ height: "180px", overflow: "hidden", backgroundColor: "var(--border-subtle)" }}>
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                  {post.category && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--accent-primary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {post.category}
                    </span>
                  )}
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      lineHeight: 1.4,
                      marginBottom: "0.75rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    <Link href={`/${locale}/posts/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  {post.excerpt && (
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                        marginBottom: "1rem",
                        flex: 1,
                      }}
                    >
                      {post.excerpt}
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.8125rem",
                      color: "var(--text-muted)",
                      paddingTop: "0.75rem",
                      borderTop: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span>{post.author || "Admin"}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "id-ID")}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              backgroundColor: "var(--bg-surface)",
              borderRadius: "16px",
              border: "1px dashed var(--border-strong)",
              color: "var(--text-muted)",
            }}
          >
            Belum ada warta untuk bahasa ini.
          </div>
        )}
      </div>
    </section>
  );
}
