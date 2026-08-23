import React from "react";
import type { Config } from "@puckeditor/core";

export const puckConfig: Config = {
  components: {
    NewspaperHeader: {
      fields: {
        logoUrl: { type: "text" },
        menuItems: {
          type: "array",
          arrayFields: {
            label: { type: "text" },
            url: { type: "text" }
          }
        }
      },
      defaultProps: {
        logoUrl: "/theme-assets/newspaper-mu/images/logo.png",
        menuItems: [
          { label: "Home", url: "/" },
          { label: "News", url: "/category/news" },
          { label: "Tech", url: "/category/tech" }
        ]
      },
      render: ({ logoUrl, menuItems }) => (
        <div dangerouslySetInnerHTML={{__html: `<!-- NP_HEADER_START -->`}}></div>
      )
    },

    NewspaperBigGrid1: {
      fields: {
        title: { type: "text" },
        categorySlug: { type: "text" }
      },
      defaultProps: {
        title: "Top Stories",
        categorySlug: ""
      },
      render: ({ title, categorySlug }) => (
        <section className="w-full max-w-[1140px] mx-auto px-4 py-8 font-sans">
            <div className="mb-6 relative border-b border-[#222]">
                <h4 className="bg-black text-white font-bold uppercase text-xs tracking-wider px-4 py-2 m-0 inline-block relative top-[1px]">
                    {title}
                </h4>
            </div>
            <div dangerouslySetInnerHTML={{__html: `<!-- NP_BIG_GRID_1_START:${categorySlug} -->`}} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 h-[450px]">
                <div className="md:col-span-2 bg-slate-900 h-full"></div>
                <div className="flex flex-col gap-1 h-full">
                    <div className="bg-slate-800 h-[223px]"></div>
                    <div className="bg-slate-800 h-[223px]"></div>
                </div>
            </div>
            <div dangerouslySetInnerHTML={{__html: `<!-- NP_BIG_GRID_1_END -->`}} />
        </section>
      )
    },

    NewspaperFlexBlock: {
      fields: {
        title: { type: "text" },
        categorySlug: { type: "text" },
        limit: { type: "number" }
      },
      defaultProps: {
        title: "Latest Articles",
        categorySlug: "",
        limit: 4
      },
      render: ({ title, categorySlug, limit }) => (
        <section className="w-full max-w-[1140px] mx-auto px-4 py-8 font-sans">
            <div className="mb-6 relative border-b border-[#222]">
                <h4 className="bg-blue-600 text-white font-bold uppercase text-xs tracking-wider px-4 py-2 m-0 inline-block relative top-[1px]">
                    {title}
                </h4>
            </div>
            <div dangerouslySetInnerHTML={{__html: `<!-- NP_FLEX_BLOCK_START:${categorySlug}:${limit} -->`}} />
            <div className="flex flex-col gap-4">
                <div className="flex gap-4 h-[120px] bg-slate-100">
                    <div className="w-[180px] bg-slate-300"></div>
                    <div className="flex-1 py-2"></div>
                </div>
            </div>
            <div dangerouslySetInnerHTML={{__html: `<!-- NP_FLEX_BLOCK_END -->`}} />
        </section>
      )
    },

    NewspaperFooter: {
      fields: {},
      defaultProps: {},
      render: () => (
        <div dangerouslySetInnerHTML={{__html: `<!-- NP_FOOTER_START -->`}}></div>
      )
    }
  }
};
