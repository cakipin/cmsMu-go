import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import type { Props, PostItem } from "../types";

const defaultSamplePosts: PostItem[] = [
  {
    id: 1,
    title: "Pemberdayaan Ekonomi Umat Melalui Ekosistem Digital Berkemajuan",
    slug: "pemberdayaan-ekonomi-umat",
    excerpt:
      "Langkah terpadu dalam memperkuat kemandirian ekonomi melalui pemanfaatan teknologi dan sinergi amal usaha persyarikatan.",
    created_at: "2026-09-20",
    category: "Ekonomi",
    featured_image:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title:
      "Pengembangan Pendidikan Berkelanjutan Menyongsong Era Kecerdasan Buatan",
    slug: "pengembangan-pendidikan-berkelanjutan",
    excerpt:
      "Transformasi kurikulum dan kesiapan pendidik dalam mengintegrasikan AI untuk melahirkan generasi yang cerdas dan berakhlak mulia.",
    created_at: "2026-09-18",
    category: "Pendidikan",
    featured_image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "Sinergi Layanan Kesehatan & Sosial untuk Masyarakat Luas",
    slug: "sinergi-layanan-kesehatan-sosial",
    excerpt:
      "Komitmen menghadirkan layanan kesehatan yang inklusif, modern, dan menjangkau seluruh lapisan masyarakat hingga pelosok negeri.",
    created_at: "2026-09-15",
    category: "Kesehatan",
    featured_image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
  },
];

export const RecentPosts: ComponentConfig<Props["RecentPosts"]> = {
  fields: {
    title: { type: "text" },
    description: { type: "textarea" },
    viewAllText: { type: "text" },
    viewAllLink: { type: "text" },
    postsCount: {
      type: "select",
      options: [
        { label: "3 Artikel", value: "3" },
        { label: "6 Artikel", value: "6" },
        { label: "9 Artikel", value: "9" },
      ],
    },
  },
  defaultProps: {
    title: "Kabar & Wawasan Terbaru",
    description:
      "Ikuti perkembangan terbaru, wawasan dakwah, dan kisah inspiratif di lingkungan persyarikatan dan amal usaha.",
    viewAllText: "Lihat Semua Artikel",
    viewAllLink: "/kategori/berita",
    postsCount: "3",
  },
  render: ({
    title = "Kabar & Wawasan Terbaru",
    description = "Ikuti perkembangan terbaru, wawasan dakwah, dan kisah inspiratif di lingkungan persyarikatan dan amal usaha.",
    viewAllText = "Lihat Semua Artikel",
    viewAllLink = "/kategori/berita",
    postsCount = "3",
    posts,
  }) => {
    const limit = parseInt(postsCount, 10) || 3;
    const itemsToDisplay =
      posts && posts.length > 0
        ? posts.slice(0, limit)
        : defaultSamplePosts.slice(0, limit);

    return (
      <section id="berita" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                {title}
              </h2>
              <p className="text-lg text-slate-600">{description}</p>
            </div>
            {viewAllText && (
              <div>
                <a
                  href={viewAllLink || "#"}
                  className="group inline-flex items-center gap-2 font-semibold text-emerald-600 transition hover:text-emerald-700"
                >
                  <span>{viewAllText}</span>
                  <svg
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    width="20"
                    height="20"
                    style={{ width: "20px", height: "20px", maxWidth: "20px", maxHeight: "20px" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {itemsToDisplay.map((post, idx) => {
              const postUrl = post.slug
                ? post.slug.startsWith("/")
                  ? post.slug
                  : `/p/${post.slug}`
                : "#";
              const dateStr = post.created_at
                ? new Date(post.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "";

              return (
                <article
                  key={post.id || idx}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500/10 to-teal-500/20 text-emerald-600">
                        <svg
                          className="h-12 w-12 opacity-40"
                          width="48"
                          height="48"
                          style={{ width: "48px", height: "48px", maxWidth: "48px", maxHeight: "48px" }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                          />
                        </svg>
                      </div>
                    )}
                    {post.category && (
                      <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-sm">
                        {post.category}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      {dateStr && (
                        <div className="mb-2 text-xs font-medium text-slate-400">
                          {dateStr}
                        </div>
                      )}
                      <h3 className="mb-3 line-clamp-2 text-lg leading-snug font-bold text-slate-900 transition-colors group-hover:text-emerald-600">
                        <a href={postUrl} className="hover:underline">
                          {post.title}
                        </a>
                      </h3>
                      {post.excerpt && (
                        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-600">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                      <a
                        href={postUrl}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
                      >
                        Baca Selengkapnya
                        <svg
                          className="h-4 w-4"
                          width="16"
                          height="16"
                          style={{ width: "16px", height: "16px", maxWidth: "16px", maxHeight: "16px" }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  },
};
