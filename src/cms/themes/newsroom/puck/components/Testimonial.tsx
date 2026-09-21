import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";

export const Testimonial: ComponentConfig<Props["Testimonial"]> = {
  fields: {
    title: { type: "text" },
    subtitle: { type: "textarea" },
    testimonials: {
      type: "array",
      arrayFields: {
        quote: { type: "textarea" },
        author: { type: "text" },
        role: { type: "text" },
        initials: { type: "text" },
        bgColor: { type: "text" }
      }
    }
  },
  defaultProps: {
    title: "Dipercaya Pengelola Website Persyarikatan",
    subtitle: "Pengalaman para administrator, redaktur, dan pengelola media dalam menggunakan CMSMu untuk portal resmi mereka.",
    testimonials: [
      {
        quote: "Pengelolaan artikel dan halaman profil ranting kami jadi sangat mudah dan terstruktur sejak beralih ke CMSMu.",
        author: "H. Ahmad Fauzi",
        role: "Admin Pimpinan Cabang Muhammadiyah",
        initials: "AF",
        bgColor: "bg-emerald-600"
      },
      {
        quote: "Visual page editornya sangat intuitif. Kami bisa mendesain halaman profil sekolah dan informasi kegiatan dalam hitungan menit.",
        author: "Siti Rahmawati, S.Pd.",
        role: "Humas Perguruan Muhammadiyah",
        initials: "SR",
        bgColor: "bg-emerald-500"
      },
      {
        quote: "Performa website sangat ringan dan cepat, memudahkan tim redaktur menerbitkan agenda dakwah dan kabar persyarikatan setiap hari.",
        author: "Bambang Irawan",
        role: "Pengelola Portal Majelis",
        initials: "BI",
        bgColor: "bg-emerald-700"
      }
    ]
  },
  render: ({ title, subtitle, testimonials }) => (
    <section id="testimoni" className="py-20 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{title}</h2>
            <p className="text-slate-600 text-lg">{subtitle}</p>
          </div>
          <div className="hidden md:flex gap-4">
            <button className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-green-600 hover:border-green-600 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-green-600 hover:border-green-600 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {(testimonials || []).map((testi, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition duration-300 relative">
              <div className="absolute top-8 right-8 text-slate-200">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"></path>
                </svg>
              </div>
              <div className="flex justify-center text-yellow-400 gap-1 mb-6">
                {[1,2,3,4,5].map(star => (
                  <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                ))}
              </div>
              <p className="text-slate-700 mb-8 italic z-10 relative leading-relaxed">
                "{testi.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${testi.bgColor} flex items-center justify-center text-white font-bold`}>
                  {testi.initials}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{testi.author}</h4>
                  <p className="text-sm text-slate-500">{testi.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
};
