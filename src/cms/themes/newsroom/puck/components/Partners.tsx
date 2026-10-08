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
        logoUrl: { type: "custom", render: ImageField }
      }
    }
  },
  defaultProps: {
    title: "Dipercaya & Berkolaborasi Dengan",
    partners: [
      { name: "SatuMu", logoUrl: "" },
      { name: "Suara Muhammadiyah", logoUrl: "" },
      { name: "BTM", logoUrl: "" },
      { name: "Lazismu", logoUrl: "" }
    ]
  },
  render: ({ title, partners }) => (
    <section className="bg-white py-12 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-slate-500 font-medium mb-8 uppercase tracking-wider">{title}</p>
        <div className="flex justify-center flex-wrap gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition duration-300">
          {partners.map((partner, i) => (
            <div key={i} className="flex items-center justify-center">
              {partner.logoUrl ? (
                <img src={partner.logoUrl} alt={partner.name} className="h-10 object-contain" />
              ) : (
                <span className="text-2xl font-bold text-slate-800">{partner.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
};
