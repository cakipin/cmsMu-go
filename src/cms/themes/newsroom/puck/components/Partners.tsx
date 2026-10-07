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
        url: { type: "text" },
      },
    },
  },
  defaultProps: {
    title: "Mendukung Ekosistem Persyarikatan & Amal Usaha Muhammadiyah",
    partners: [
      { name: "Pimpinan Wilayah & Daerah", logoUrl: "", url: "" },
      { name: "Majelis & Lembaga", logoUrl: "", url: "" },
      { name: "Perguruan Tinggi & Sekolah", logoUrl: "", url: "" },
      { name: "Rumah Sakit & Lembaga Layanan", logoUrl: "", url: "" },
    ],
  },
  render: ({ title, partners }) => (
    <section className="border-b border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="mb-8 text-sm font-medium tracking-wider text-slate-500 uppercase">
          {title}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 transition duration-300 hover:opacity-100 md:gap-16">
          {(partners || []).map((partner, i) => {
            const innerContent = partner.logoUrl ? (
              <img
                src={partner.logoUrl}
                alt={partner.name}
                className="h-10 object-contain grayscale transition duration-300 hover:grayscale-0"
              />
            ) : (
              <span className="text-2xl font-bold text-slate-800 transition hover:text-emerald-600">
                {partner.name}
              </span>
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
  ),
};
