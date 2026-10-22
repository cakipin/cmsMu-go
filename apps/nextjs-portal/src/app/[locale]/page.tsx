import React from "react";
import { cmsMuClient } from "../../lib/cmsmu";
import { CmsMuBlockRenderer } from "../../components/CmsMuBlockRenderer";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  let pageData: any = null;
  try {
    pageData = await cmsMuClient.sdui.getPage("home", { locale });
  } catch (_err) {
    pageData = null;
  }

  if (!pageData || !pageData.content || pageData.content.length === 0) {
    return (
      <main style={{ padding: "6rem 0", textAlign: "center" }}>
        <div className="container">
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Halaman Sedang Dipersiapkan</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Blueprint Server-Driven UI belum tersedia untuk halaman ini.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main dir={pageData.direction || (locale === "ar" ? "rtl" : "ltr")}>
      {pageData.content.map((block: any, idx: number) => (
        <CmsMuBlockRenderer key={block.props?.id || idx} block={block} locale={locale} />
      ))}
    </main>
  );
}
