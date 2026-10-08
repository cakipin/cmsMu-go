import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";

export const CallToAction: ComponentConfig<Props["CallToAction"]> = {
  fields: {
    title: { type: "text" },
    description: { type: "textarea" },
    buttonText: { type: "text" },
    buttonLink: { type: "text" },
    footerText: { type: "text" },
  },
  defaultProps: {
    title: "Mulai Bangun & Kelola Website Persyarikatan Anda",
    description:
      "Kelola portal resmi pimpinan, majelis, lembaga, dan amal usaha dengan aman, cepat, dan terstruktur.",
    buttonText: "Masuk Dashboard Admin",
    buttonLink: "/admin",
    footerText:
      "Tersedia untuk seluruh tingkatan pimpinan dan amal usaha Muhammadiyah.",
  },
  render: ({ title, description, buttonText, buttonLink, footerText }) => (
    <section
      id="gabung"
      className="relative overflow-hidden bg-slate-900 py-20 text-center"
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(#10b981 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      ></div>
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-3xl leading-tight font-bold text-white md:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 md:text-xl">
          {description}
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={buttonLink || "/admin"}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-600/30 transition hover:bg-emerald-700"
          >
            <span>{buttonText || "Masuk Dashboard Admin"}</span>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
        <p className="mt-6 text-center text-sm text-slate-400">{footerText}</p>
      </div>
    </section>
  ),
};
