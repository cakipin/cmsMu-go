import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";
import { ImageField } from "./ImageField";

export const Partners: ComponentConfig<Props["Partners"]> = {
  fields: {
    title: { type: "text" },
    partners: {
      type: "array",
      arrayFields: {
        name: { type: "text" },
        logoUrl: { type: "custom", render: ImageField },
        url: { type: "text" }
      }
    }
  },
  defaultProps: {
    title: "Mendukung Ekosistem Persyarikatan & Amal Usaha Muhammadiyah",
    partners: [
      { name: "Pimpinan Wilayah & Daerah", logoUrl: "", url: "" },
      { name: "Majelis & Lembaga", logoUrl: "", url: "" },
      { name: "Perguruan Tinggi & Sekolah", logoUrl: "", url: "" },
      { name: "Rumah Sakit & Lembaga Layanan", logoUrl: "", url: "" }
    ]
  },
  render: ({ title, partners }) => (
    <section className="bg-white py-12 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-slate-500 font-medium mb-8 uppercase tracking-wider">{title}</p>
        <div className="flex justify-center flex-wrap items-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition duration-300">
          {(partners || []).map((partner, i) => {
            const innerContent = partner.logoUrl ? (
              <img src={partner.logoUrl} alt={partner.name} className="h-10 object-contain grayscale hover:grayscale-0 transition duration-300" />
            ) : (
              <span className="text-2xl font-bold text-slate-800 hover:text-emerald-600 transition">{partner.name}</span>
            );

            if (partner.url && partner.url.trim() !== "") {
              return (
                <a
                  key={i}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center transition-transform duration-200 hover:scale-105"
                  title={partner.name}
                >
                  {innerContent}
                </a>
              );
            }

            return (
              <div key={i} className="flex items-center justify-center">
                {innerContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
};
