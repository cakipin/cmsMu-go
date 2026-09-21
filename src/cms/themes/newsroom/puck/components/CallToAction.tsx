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
    title: "Siap Mengembangkan Portal Dakwah & Berita Persyarikatan?",
    description: "Mulai kelola konten, sindikasi media daerah, dan publikasi digital dengan infrastruktur modern CMSMu.",
    buttonText: "Kirim Formulir Pendaftaran",
    buttonLink: "#",
    footerText: "Data portal Anda aman dan terkelola secara terpadu dalam jaringan persyarikatan."
  },
  render: ({ title, description, buttonText, buttonLink, footerText }) => (
    <section id="gabung" className="py-20 bg-slate-900 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">{title}</h2>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          {description}
        </p>
        <div className="bg-white p-8 rounded-2xl max-w-2xl mx-auto shadow-2xl text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
              <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Cth: Ahmad Dahlan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nomor WhatsApp</label>
              <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0812-xxxx-xxxx" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Sektor Usaha Kreatif</label>
            <select className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              <option>Pengembangan Perangkat Lunak & IT</option>
              <option>Kuliner & FnB</option>
              <option>Fashion & Kriya</option>
              <option>Media & Desain</option>
            </select>
          </div>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-green-600/30 text-lg">
            {buttonText}
          </button>
          <p className="text-center text-sm text-slate-500 mt-4">{footerText}</p>
        </div>
      </div>
    </section>
  )
};
