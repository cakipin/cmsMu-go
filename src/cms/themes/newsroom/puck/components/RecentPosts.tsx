import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";

export const RecentPosts: ComponentConfig<Props["RecentPosts"]> = {
  fields: {
    title: { type: "text" },
    description: { type: "textarea" },
    viewAllText: { type: "text" },
    viewAllLink: { type: "text" },
  },
  defaultProps: {
    title: "Kabar & Wawasan Terbaru",
    description:
      "Ikuti perkembangan terbaru, kisah inspiratif, dan wawasan seputar ekonomi kreatif di ekosistem digital.",
    viewAllText: "Lihat Semua Artikel",
    viewAllLink: "#",
  },
  render: ({ title, description, viewAllText, viewAllLink }) => (
    <section id="berita" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
          <div className="max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              {title}
            </h2>
            <p className="text-lg text-slate-600">{description}</p>
          </div>
          <div>
            <a
              href={viewAllLink}
              className="flex items-center gap-2 font-semibold text-green-600 transition-all hover:text-green-700"
            >
              {viewAllText}
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                ></path>
              </svg>
            </a>
          </div>
        </div>

        <div className="recent-posts-placeholder">
          {/* Fallback layout for builder if recent posts script doesn't run */}
          <div className="grid gap-8 md:grid-cols-3">
            <div className="h-80 animate-pulse rounded-2xl bg-slate-100"></div>
            <div className="hidden h-80 animate-pulse rounded-2xl bg-slate-100 md:block"></div>
            <div className="hidden h-80 animate-pulse rounded-2xl bg-slate-100 md:block"></div>
          </div>
        </div>
      </div>
    </section>
  ),
};
