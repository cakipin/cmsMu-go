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
        { label: "Hanya Teks & Inisial", value: "text" },
      ],
    },
    logoImage: { type: "custom", render: ImageField },
    logoHeight: {
      type: "select",
      options: [
        { label: "Kecil (28px)", value: "28px" },
        { label: "Sedang (36px) - Default", value: "36px" },
        { label: "Besar (44px)", value: "44px" },
      ],
    },
    logoLetter: { type: "text" },
    highlightColor: { type: "text" },
  },
  defaultProps: {
    siteName: "Portal Redaksi",
    copyrightText: "© 2026 Hak Cipta Dilindungi.",
    logoType: "both",
    logoImage: "",
    logoHeight: "36px",
    logoLetter: "M",
    highlightColor: "#059669",
  },
  render: ({
    siteName = "Portal Redaksi",
    copyrightText = "© 2026 Hak Cipta Dilindungi.",
    logoType = "both",
    logoImage = "",
    logoHeight = "36px",
    logoLetter = "M",
    highlightColor = "#059669",
  }) => {
    const hasImage = Boolean(logoImage && logoImage.trim().length > 0);
    const showImg = (logoType === "image" || logoType === "both") && hasImage;
    const showText = logoType === "text" || logoType === "both" || !hasImage;

    return (
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-3">
            {showImg && (
              <img
                src={logoImage}
                alt={siteName}
                style={{
                  height: logoHeight || "36px",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            )}
            {(!showImg || logoType === "text") && (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: highlightColor || "#059669" }}
              >
                {logoLetter || (siteName ? siteName[0] : "M")}
              </div>
            )}
            {showText && (
              <span className="text-lg font-bold text-slate-900">
                {siteName}
              </span>
            )}
          </div>
          <p className="text-center text-sm text-slate-500 md:text-right">
            {copyrightText}
          </p>
        </div>
      </footer>
    );
  },
};
