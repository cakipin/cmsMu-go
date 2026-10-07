import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";

export const FeatureGrid: ComponentConfig<Props["FeatureGrid"]> = {
  fields: {
    title: { type: "text" },
    description: { type: "textarea" },
    features: {
      type: "array",
      arrayFields: {
        title: { type: "text" },
        description: { type: "textarea" },
        svgIcon: { type: "textarea" },
      },
    },
  },
  defaultProps: {
    title: "Fitur & Keunggulan Pondasi CMSMu",
    description:
      "Fondasi teknologi portal publikasi modern dengan arsitektur headless, visual page editor, dan manajemen konten terpadu untuk kebutuhan persyarikatan.",
    features: [
      {
        title: "Visual Page Builder (Drag & Drop)",
        description:
          "Mendesain halaman visual, landing page, dan profil lembaga dengan blok komponen interaktif secara instan tanpa perlu menulis kode.",
        svgIcon:
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>',
      },
      {
        title: "Manajemen Berita & Artikel",
        description:
          "Meja kerja penulisan naskah yang rapi dengan editor kaya fitur, kategorisasi terstruktur, tagar, dan optimasi SEO otomatis.",
        svgIcon:
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>',
      },
      {
        title: "Pustaka Media Terpusat",
        description:
          "Pengelolaan berkas foto, dokumen, dan logo secara terpusat berbasis cloud storage dengan pengunggahan cepat dan responsif.",
        svgIcon:
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>',
      },
    ],
  },
  render: ({ title, description, features }) => (
    <section id="manfaat" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
            {title}
          </h2>
          <p className="text-lg text-slate-600">{description}</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {(features || []).map((feature, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-slate-100 bg-slate-50 p-8 transition-all duration-300 hover:border-green-100 hover:shadow-xl"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 transition-transform duration-300 group-hover:scale-110">
                <svg
                  className="h-7 w-7 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  dangerouslySetInnerHTML={{ __html: feature.svgIcon }}
                ></svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
};
