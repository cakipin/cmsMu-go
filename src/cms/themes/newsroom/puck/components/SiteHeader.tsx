import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";
import { ImageField } from "./ImageField";

export const SiteHeader: ComponentConfig<Props["SiteHeader"]> = {
  fields: {
    siteTitle: { type: "text" },
    siteTitleHighlight: { type: "text" },
    logoLetter: { type: "text" },
    logoImage: { type: "custom", render: ImageField },
    menuItems: {
      type: "array",
      arrayFields: {
        label: { type: "text" },
        url: { type: "text" }
      }
    },
    ctaText: { type: "text" },
    ctaUrl: { type: "text" },
    headerBgColor1: { type: "text" },
    headerBgColor2: { type: "text" },
    textColor: { type: "text" },
    fontFamily: { type: "select", options: [{label: "Sans (Default)", value: "sans-serif"}, {label: "Serif", value: "serif"}, {label: "Mono", value: "monospace"}] },
    menuPosition: { type: "radio", options: [{label: "Kiri", value: "start"}, {label: "Tengah", value: "center"}, {label: "Kanan", value: "end"}] },
    headerPadding: { type: "select", options: [{label: "Normal", value: "h-20"}, {label: "Kecil", value: "h-16"}, {label: "Besar", value: "h-24"}] }
  },
  defaultProps: {
    siteTitle: "CMS",
    siteTitleHighlight: "Mu",
    logoLetter: "M",
    logoImage: "",
    menuItems: [
      { label: "Fitur Unggulan", url: "#fitur" },
      { label: "Ekosistem", url: "#ekosistem" },
      { label: "Berita & Opini", url: "#berita" },
      { label: "Hubungi Kami", url: "#kontak" }
    ],
    ctaText: "Masuk Dashboard",
    ctaUrl: "/admin",
    headerBgColor1: "#ffffff",
    headerBgColor2: "#ffffff",
    textColor: "#1e293b",
    fontFamily: "sans-serif",
    menuPosition: "center",
    headerPadding: "h-20"
  },
  render: ({ siteTitle, siteTitleHighlight, logoLetter, logoImage, menuItems, ctaText, ctaUrl, headerBgColor1, headerBgColor2, textColor, fontFamily, menuPosition, headerPadding }) => (
    <nav id="navbar" className={`fixed w-full z-50 transition-all duration-300 backdrop-blur-md border-b border-gray-100`} style={{ background: `linear-gradient(90deg, ${headerBgColor1}, ${headerBgColor2})`, color: textColor, fontFamily: fontFamily }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center ${headerPadding}`}>
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">{logoLetter}</div>
            <span className="font-bold text-xl" style={{ color: textColor }}>{siteTitle}<span className="text-green-600 ml-1">{siteTitleHighlight}</span></span>
          </div>
          <div className={`hidden md:flex space-x-6 lg:space-x-8 flex-1 mx-8 justify-${menuPosition}`}>
            {menuItems.map((item, i) => (
              <a key={i} href={item.url} className="hover:text-green-600 font-medium transition" style={{ color: textColor }}>
                {item.label}
              </a>
            ))}
          </div>
          <div className="hidden md:flex">
            <a href={ctaUrl} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full font-semibold transition shadow-lg shadow-green-600/30">
              {ctaText}
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
};
