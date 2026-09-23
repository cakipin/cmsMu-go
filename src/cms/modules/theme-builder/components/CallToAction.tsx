import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";

export const CallToAction: ComponentConfig<Props["CallToAction"]> = {
  fields: {
    title: { type: "text" },
    description: { type: "textarea" },
    buttonText: { type: "text" },
    buttonLink: { type: "text" },
    footerText: { type: "text" }
  },
  defaultProps: {
    title: "Mulai Bangun & Kelola Website Persyarikatan Anda",
    description: "Gunakan fondasi CMSMu untuk mengelola portal resmi pimpinan, majelis, lembaga, dan amal usaha Muhammadiyah dengan aman, cepat, dan terstruktur.",
    buttonText: "Masuk Dashboard Admin",
    buttonLink: "/admin",
    footerText: "Tersedia untuk seluruh tingkatan pimpinan dan amal usaha Muhammadiyah."
  },
  render: ({ title, description, buttonText, buttonLink, footerText }) => (
    <section id="gabung" className="py-20 bg-slate-900 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">{title}</h2>
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={buttonLink || '/admin'}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-full transition shadow-xl shadow-emerald-600/30 text-lg inline-flex items-center gap-2"
          >
            <span>{buttonText || 'Masuk Dashboard Admin'}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
        <p className="text-center text-sm text-slate-400 mt-6">{footerText}</p>
      </div>
    </section>
  )
};
