import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";
import { ImageField } from "./ImageField";

export const SiteFooter: ComponentConfig<Props["SiteFooter"]> = {
  fields: {
    siteName: { type: "text" },
    copyrightText: { type: "text" },
    logoType: {
      type: "radio",
      options: [
        { label: "Logo + Nama", value: "both" },
        { label: "Hanya Gambar Logo", value: "image" },
        { label: "Hanya Teks & Inisial", value: "text" }
      ]
    },
    logoImage: { type: "custom", render: ImageField },
    logoHeight: {
      type: "select",
      options: [
        { label: "Kecil (28px)", value: "28px" },
        { label: "Sedang (36px) - Default", value: "36px" },
        { label: "Besar (44px)", value: "44px" }
      ]
    },
    logoLetter: { type: "text" },
    highlightColor: { type: "text" }
  },
  defaultProps: {
    siteName: "CMSMu",
    copyrightText: "© 2026 CMSMu - Content Management System Muhammadiyah. Hak Cipta Dilindungi.",
    logoType: "both",
    logoImage: "",
    logoHeight: "36px",
    logoLetter: "M",
    highlightColor: "#059669"
  },
  render: ({
    siteName = "CMSMu",
    copyrightText = "© 2026 CMSMu - Content Management System Muhammadiyah. Hak Cipta Dilindungi.",
    logoType = "both",
    logoImage = "",
    logoHeight = "36px",
    logoLetter = "M",
    highlightColor = "#059669"
  }) => {
    const hasImage = Boolean(logoImage && logoImage.trim().length > 0);
    const showImg = (logoType === "image" || logoType === "both") && hasImage;
    const showText = logoType === "text" || logoType === "both" || !hasImage;

    return (
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            {showImg && (
              <img
                src={logoImage}
                alt={siteName}
                style={{ height: logoHeight || "36px", width: "auto", objectFit: "contain" }}
              />
            )}
            {(!showImg || logoType === "text") && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: highlightColor || "#059669" }}
              >
                {logoLetter || (siteName ? siteName[0] : "M")}
              </div>
            )}
            {showText && (
              <span className="font-bold text-lg text-slate-900">{siteName}</span>
            )}
          </div>
          <p className="text-slate-500 text-sm text-center md:text-right">
            {copyrightText}
          </p>
        </div>
      </footer>
    );
  }
};
