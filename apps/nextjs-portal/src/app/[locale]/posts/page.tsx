import React from "react";
import Link from "next/link";
import { cmsMuClient } from "../../../lib/cmsmu";
import { SiteHeaderBlock } from "../../../components/blocks/SiteHeader";
import { SiteFooterBlock } from "../../../components/blocks/SiteFooter";

interface PostsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PostsListingPage({ params }: PostsPageProps) {
  const { locale } = await params;

  let posts: any[] = [];
  try {
    const res = await cmsMuClient.posts.list({ limit: 20, locale });
    if (res && res.data) {
      posts = res.data;
    }
  } catch (e) {
    posts = [];
  }

  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <div dir={direction}>
      <SiteHeaderBlock
        props={{
          siteTitle: "cmsMu",
          headerScope: "all",
          menuItems: [
            { label: locale === "ar" ? "الرئيسية" : "Beranda", url: `/${locale}` },
            { label: locale === "ar" ? "الأخبار" : "Berita", url: `/${locale}/posts` },
          ],
        }}
        locale={locale}
      />

      <main style={{ padding: "4rem 0", flex: 1, backgroundColor: "var(--bg-canvas)" }}>
        <div className="container">
          <header style={{ marginBottom: "3rem", textAlign: locale === "ar" ? "right" : "left" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: "0.5rem",
              }}
            >
              {locale === "ar" ? "أحدث الأخبار والمقالات" : "Warta & Kabar Terkini"}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem" }}>
              {locale === "ar"
                ? "تابع آخر المستجدات والأنشطة الرقمية."
                : "Informasi dan publikasi resmi seputar persyarikatan dan umat."}
            </p>
          </header>

          {posts.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
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
                  }}
                >
                  {post.featuredImage && (
                    <div style={{ height: "200px", overflow: "hidden", backgroundColor: "var(--border-subtle)" }}>
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div style={{ padding: "1.75rem", display: "flex", flexDirection: "column", flex: 1 }}>
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
                    <h2
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        lineHeight: 1.4,
                        marginBottom: "0.75rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      <Link href={`/${locale}/posts/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt && (
                      <p
                        style={{
                          fontSize: "0.9375rem",
                          color: "var(--text-secondary)",
                          lineHeight: 1.6,
                          marginBottom: "1.25rem",
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
                padding: "4rem 2rem",
                textAlign: "center",
                backgroundColor: "var(--bg-surface)",
                borderRadius: "16px",
                border: "1px dashed var(--border-strong)",
                color: "var(--text-muted)",
              }}
            >
              <p>{locale === "ar" ? "لا توجد مقالات متاحة حاليا." : "Belum ada artikel yang tersedia."}</p>
            </div>
          )}
        </div>
      </main>

      <SiteFooterBlock
        props={{
          siteTitle: "cmsMu",
        }}
        locale={locale}
      />
    </div>
  );
}
