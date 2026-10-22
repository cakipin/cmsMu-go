import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cmsMuClient } from "../../../../lib/cmsmu";
import { SiteHeaderBlock } from "../../../../components/blocks/SiteHeader";
import { SiteFooterBlock } from "../../../../components/blocks/SiteFooter";

interface PostDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { locale, slug } = await params;

  let post: any = null;
  try {
    const res = await cmsMuClient.posts.get(slug, { locale });
    if (res && res.data) {
      post = res.data;
    }
  } catch (e) {
    post = null;
  }

  if (!post) {
    notFound();
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
        <article className="container" style={{ maxWidth: "800px" }}>
          {/* Breadcrumb / Back button */}
          <div style={{ marginBottom: "2rem" }}>
            <Link
              href={`/${locale}/posts`}
              style={{
                color: "var(--accent-primary)",
                fontWeight: 600,
                fontSize: "0.875rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: locale === "ar" ? "rotate(180deg)" : "none" }}>
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>{locale === "ar" ? "العودة إلى الأخبار" : "Kembali ke Berita"}</span>
            </Link>
          </div>

          <header style={{ marginBottom: "2.5rem" }}>
            {post.category && (
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--accent-primary)",
                  letterSpacing: "0.05em",
                  display: "inline-block",
                  marginBottom: "0.75rem",
                }}
              >
                {post.category}
              </span>
            )}
            <h1
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontWeight: 800,
                lineHeight: 1.25,
                color: "var(--text-primary)",
                marginBottom: "1.25rem",
              }}
            >
              {post.title}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                paddingBottom: "1.5rem",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <span>Oleh <strong>{post.author || "Admin"}</strong></span>
              <span>•</span>
              <time dateTime={post.createdAt}>
                {new Date(post.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </header>

          {post.featuredImage && (
            <div
              style={{
                marginBottom: "2.5rem",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <img
                src={post.featuredImage}
                alt={post.title}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          )}

          {/* Article Body */}
          <div
            style={{
              fontSize: "1.125rem",
              lineHeight: 1.8,
              color: "var(--text-primary)",
            }}
            dangerouslySetInnerHTML={{ __html: post.body || "" }}
          />
        </article>
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
