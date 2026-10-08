import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";

export const RecentPosts: ComponentConfig<Props["RecentPosts"]> = {
  fields: {
    title: { type: "text" },
    description: { type: "textarea" },
    viewAllText: { type: "text" },
    viewAllLink: { type: "text" }
  },
  defaultProps: {
    title: "Kabar & Wawasan Terbaru",
    description: "Ikuti perkembangan terbaru, kisah inspiratif, dan wawasan seputar ekonomi kreatif di ekosistem digital.",
    viewAllText: "Lihat Semua Artikel",
    viewAllLink: "#"
  },
  render: ({ title, description, viewAllText, viewAllLink }) => (
    <section id="berita" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{title}</h2>
            <p className="text-slate-600 text-lg">{description}</p>
          </div>
          <div>
            <a href={viewAllLink} className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-2 transition-all">
              {viewAllText}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </a>
          </div>
        </div>
        
        <div className="recent-posts-placeholder">
          {/* Fallback layout for builder if recent posts script doesn't run */}
          <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-100 animate-pulse h-80 rounded-2xl"></div>
              <div className="bg-slate-100 animate-pulse h-80 rounded-2xl hidden md:block"></div>
              <div className="bg-slate-100 animate-pulse h-80 rounded-2xl hidden md:block"></div>
          </div>
        </div>
      </div>
    </section>
  )
};
