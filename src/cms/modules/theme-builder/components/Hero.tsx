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
    backgroundColor: { type: "text" },
  },
  defaultProps: {
    badgeText: "🚀 Platform Content Management System Muhammadiyah",
    title: "Satu Fondasi CMS Terpadu untuk Website & Media Muhammadiyah",
    titleHighlight: "Muhammadiyah",
    titleColor: "text-slate-900",
    description:
      "Platform Content Management System modern, tangguh, dan fleksibel untuk membangun website resmi pimpinan persyarikatan, majelis, lembaga, dan amal usaha Muhammadiyah secara mudah dan terstruktur.",
    descriptionColor: "text-slate-600",
    primaryButtonText: "Jelajahi Fitur",
    primaryButtonLink: "#fitur",
    secondaryButtonText: "Masuk Dashboard",
    secondaryButtonLink: "/admin",
    backgroundImage: "",
    backgroundColor: "bg-slate-50",
  },
  render: ({
    badgeText,
    title,
    titleHighlight,
    titleColor,
    description,
    descriptionColor,
    primaryButtonText,
    primaryButtonLink,
    secondaryButtonText,
    secondaryButtonLink,
    backgroundImage,
    backgroundColor,
  }) => (
    <section
      className={`relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32 ${backgroundColor || "bg-slate-50"}`}
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: backgroundImage ? "cover" : "20px 20px",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {backgroundImage && (
        <div className="absolute inset-0 z-0 bg-white/80 backdrop-blur-sm"></div>
      )}
      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-4 inline-block rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
          {badgeText}
        </div>
        <h1
          className={`mb-6 text-4xl leading-tight font-extrabold tracking-tight md:text-5xl lg:text-6xl ${titleColor || "text-slate-900"}`}
        >
          {title}
        </h1>
        <p
          className={`mx-auto mt-4 mb-10 max-w-3xl text-lg md:text-xl ${descriptionColor || "text-slate-600"}`}
        >
          {description}
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href={primaryButtonLink || "#fitur"}
            className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-600/30 transition hover:bg-emerald-700"
          >
            <span>{primaryButtonText || "Jelajahi Fitur"}</span>
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
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
          <a
            href={secondaryButtonLink || "/admin"}
            className="flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 text-lg font-bold text-slate-700 transition hover:bg-slate-50"
          >
            {secondaryButtonText || "Masuk Dashboard"}
          </a>
        </div>
      </div>
    </section>
  ),
};
