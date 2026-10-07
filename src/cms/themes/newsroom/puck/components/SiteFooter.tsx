import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";

export const SiteFooter: ComponentConfig<Props["SiteFooter"]> = {
  fields: {
    siteName: { type: "text" },
    copyrightText: { type: "text" },
  },
  defaultProps: {
    siteName: "CMSMu",
    copyrightText:
      "© 2026 CMSMu - Content Management System Muhammadiyah. Hak Cipta Dilindungi.",
  },
  render: ({ siteName, copyrightText }) => (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
            M
          </div>
          <span className="text-lg font-bold text-slate-900">{siteName}</span>
        </div>
        <p className="text-sm text-slate-500">{copyrightText}</p>
      </div>
    </footer>
  ),
};
