import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";

export const SiteFooter: ComponentConfig<Props["SiteFooter"]> = {
  fields: {
    siteName: { type: "text" },
    copyrightText: { type: "text" }
  },
  defaultProps: {
    siteName: "CMSMu",
    copyrightText: "© 2026 CMSMu - Content Management System Muhammadiyah. Hak Cipta Dilindungi."
  },
  render: ({ siteName, copyrightText }) => (
    <footer className="bg-white border-t border-slate-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">M</div>
          <span className="font-bold text-lg text-slate-900">{siteName}</span>
        </div>
        <p className="text-slate-500 text-sm">
          {copyrightText}
        </p>
      </div>
    </footer>
  )
};
