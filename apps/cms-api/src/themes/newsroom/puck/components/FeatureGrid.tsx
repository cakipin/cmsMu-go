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
    title: "Mengapa Bergabung Bersama Kami?",
    description: "Kami memadukan prinsip ekonomi Islam dengan literasi digital untuk memastikan bisnis Anda tumbuh secara etis dan eksponensial.",
    features: [
      {
        title: "Akselerasi Digital",
        description: "Pendampingan integrasi sistem, dari pengelolaan server awan, otomasi database, hingga optimasi antarmuka digital UMKM.",
        svgIcon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>'
      },
      {
        title: "Jaringan Saudagar",
        description: "Akses eksklusif ke ribuan pelaku usaha dalam ekosistem persyarikatan untuk kolaborasi silang dan rantai pasok.",
        svgIcon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>'
      },
      {
        title: "Pendampingan Syariah",
        description: "Memastikan model bisnis, pendanaan, dan operasional Anda sesuai dengan prinsip ekonomi Islam yang amanah.",
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
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" style={{ width: "56px", height: "56px", minWidth: "56px", minHeight: "56px" }}>
                <svg className="w-7 h-7 text-green-600" width="28" height="28" style={{ width: "28px", height: "28px", maxWidth: "28px", maxHeight: "28px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: feature.svgIcon }}></svg>
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
