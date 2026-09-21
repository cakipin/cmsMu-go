import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";
import { ImageField } from "./ImageField";

export const Hero: ComponentConfig<Props["Hero"]> = {
  fields: {
    badgeText: { type: "text" },
    title: { type: "text" },
    titleHighlight: { type: "text" },
    titleColor: { type: "text" },
    description: { type: "textarea" },
    descriptionColor: { type: "text" },
    primaryButtonText: { type: "text" },
    primaryButtonLink: { type: "text" },
    secondaryButtonText: { type: "text" },
    secondaryButtonLink: { type: "text" },
    backgroundImage: { type: "custom", render: ImageField },
    backgroundColor: { type: "text" }
  },
  defaultProps: {
    badgeText: "🚀 Platform Content Management System Muhammadiyah",
    title: "Satu Fondasi CMS Terpadu untuk Website & Media Muhammadiyah",
    titleHighlight: "Muhammadiyah",
    titleColor: "text-slate-900",
    description: "CMSMu hadir sebagai Content Management System modern, tangguh, dan fleksibel untuk membangun website resmi pimpinan persyarikatan, majelis, lembaga, dan amal usaha Muhammadiyah secara mudah dan terstruktur.",
    descriptionColor: "text-slate-600",
    primaryButtonText: "Jelajahi Fitur",
    primaryButtonLink: "#fitur",
    secondaryButtonText: "Masuk Dashboard",
    secondaryButtonLink: "/admin",
    backgroundImage: "",
    backgroundColor: "bg-slate-50"
  },
  render: ({ badgeText, title, titleHighlight, titleColor, description, descriptionColor, primaryButtonText, primaryButtonLink, secondaryButtonText, secondaryButtonLink, backgroundImage, backgroundColor }) => (
    <section className={`relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden ${backgroundColor || 'bg-slate-50'}`} style={{ 
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
      backgroundSize: backgroundImage ? 'cover' : '20px 20px',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {backgroundImage && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-0"></div>}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm border border-emerald-200">
          {badgeText}
        </div>
        <h1 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight ${titleColor || 'text-slate-900'}`}>
          {title}
        </h1>
        <p className={`mt-4 text-lg md:text-xl max-w-3xl mx-auto mb-10 ${descriptionColor || 'text-slate-600'}`}>
          {description}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href={primaryButtonLink} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-bold text-lg transition shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2">
            {primaryButtonText}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </a>
          <a href={secondaryButtonLink} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-full font-bold text-lg transition flex items-center justify-center">
            {secondaryButtonText}
          </a>
        </div>
      </div>
    </section>
  )
};
