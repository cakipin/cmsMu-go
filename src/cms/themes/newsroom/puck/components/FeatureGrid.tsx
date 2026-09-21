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
        svgIcon: { type: "textarea" }
      }
    }
  },
  defaultProps: {
    title: "Fitur & Keunggulan Platform CMSMu",
    description: "Fondasi teknologi portal publikasi modern dengan arsitektur headless, visual page editor, dan integrasi ekosistem digital Muhammadiyah.",
    features: [
      {
        title: "Sindikasi Media Otomatis",
        description: "Tarik dan himpun ribuan artikel berita dari portal wilayah, daerah, dan majelis Muhammadiyah melalui WP REST API & RSS Feed otomatis.",
        svgIcon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>'
      },
      {
        title: "Meja Kurasi Redaksi",
        description: "Antrean terpadu untuk tim redaksi menyeleksi, menyunting, dan menerbitkan berita sindikasi dengan scoring kepercayaan dan filter wilayah.",
        svgIcon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>'
      },
      {
        title: "SSO Muhammadiyah ID",
        description: "Integrasi identitas digital terpadu berbasis OAuth 2.0 untuk akses aman bagi warga persyarikatan, kontributor, dan redaktur.",
        svgIcon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>'
      }
    ]
  },
  render: ({ title, description, features }) => (
    <section id="manfaat" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{title}</h2>
          <p className="text-slate-600 text-lg">{description}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:border-green-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: feature.svgIcon }}></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
};
