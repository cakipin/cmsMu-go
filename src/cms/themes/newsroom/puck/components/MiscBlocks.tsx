import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";

export const CustomHTML: ComponentConfig<Props["CustomHTML"]> = {
  fields: {
    html: { type: "textarea" }
  },
  defaultProps: {
    html: "<div class='text-center p-8 bg-slate-100 rounded-lg'>Halo, ini Custom HTML!</div>"
  },
  render: ({ html }) => (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  )
};

export const Spacer: ComponentConfig<Props["Spacer"]> = {
  fields: {
    height: { type: "number" }
  },
  defaultProps: {
    height: 40
  },
  render: ({ height }) => (
    <div style={{ height: `${height}px` }} aria-hidden="true" />
  )
};

export const MagazineHeader: ComponentConfig<Props["MagazineHeader"]> = {
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
    logoUrl: "/theme-assets/labmu-pro/images/logo.png",
    menuItems: [
      { label: "Home", url: "/" },
      { label: "News", url: "/category/news" },
      { label: "Tech", url: "/category/tech" }
    ]
  },
  render: () => (
    <div dangerouslySetInnerHTML={{ __html: `<!-- MAGAZINE_HEADER_START -->` }} />
  )
};

export const MagazineBigGrid: ComponentConfig<Props["MagazineBigGrid"]> = {
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
      <div dangerouslySetInnerHTML={{ __html: `<!-- MAGAZINE_BIG_GRID_START:${categorySlug} -->` }} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 h-[450px]">
        <div className="md:col-span-2 bg-slate-900 h-full text-white p-6 flex flex-col justify-end">
          <span className="text-xl font-bold">Primary Article Preview</span>
        </div>
        <div className="flex flex-col gap-1 h-full">
          <div className="bg-slate-800 h-[223px] text-white p-4 flex flex-col justify-end">Preview 1</div>
          <div className="bg-slate-800 h-[223px] text-white p-4 flex flex-col justify-end">Preview 2</div>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: `<!-- MAGAZINE_BIG_GRID_END -->` }} />
    </section>
  )
};

export const MagazineFlexBlock: ComponentConfig<Props["MagazineFlexBlock"]> = {
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
        <h4 className="bg-green-600 text-white font-bold uppercase text-xs tracking-wider px-4 py-2 m-0 inline-block relative top-[1px]">
          {title}
        </h4>
      </div>
      <div dangerouslySetInnerHTML={{ __html: `<!-- MAGAZINE_FLEX_BLOCK_START:${categorySlug}:${limit} -->` }} />
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 h-[120px] bg-slate-100 p-2">
          <div className="w-[180px] bg-slate-300"></div>
          <div className="flex-1 py-2">
            <span className="font-bold text-slate-800">Article Title Preview</span>
          </div>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: `<!-- MAGAZINE_FLEX_BLOCK_END -->` }} />
    </section>
  )
};

export const MagazineFooter: ComponentConfig<Props["MagazineFooter"]> = {
  fields: {},
  defaultProps: {},
  render: () => (
    <div dangerouslySetInnerHTML={{ __html: `<!-- MAGAZINE_FOOTER_START -->` }} />
  )
};
