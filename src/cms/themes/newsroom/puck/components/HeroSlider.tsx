import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";
import { ImageField } from "./ImageField";

export const HeroSlider: ComponentConfig<Props["HeroSlider"]> = {
  fields: {
    sliderHeight: {
      type: "select",
      options: [
        { label: "Medium (600px)", value: "600px" },
        { label: "Large (80vh)", value: "80vh" },
        { label: "Full Screen", value: "100vh" },
      ],
    },
    textPosition: {
      type: "radio",
      options: [
        { label: "Kiri", value: "left" },
        { label: "Tengah", value: "center" },
        { label: "Kanan", value: "right" },
      ],
    },
    overlayOpacity: { type: "number" },
    titleColor: { type: "text" },
    titleSize: {
      type: "select",
      options: [
        { label: "Normal", value: "3.5rem" },
        { label: "Besar", value: "4.5rem" },
      ],
    },
    slides: {
      type: "array",
      arrayFields: {
        title: { type: "text" },
        subtitle: { type: "textarea" },
        image: { type: "custom", render: ImageField },
        buttonText: { type: "text" },
        buttonLink: { type: "text" },
      },
    },
  },
  defaultProps: {
    sliderHeight: "600px",
    textPosition: "center",
    overlayOpacity: 50,
    titleColor: "#ffffff",
    titleSize: "3.5rem",
    slides: [
      {
        title: "Solusi Ekonomi Digital",
        subtitle:
          "Memberdayakan UMKM melalui teknologi yang amanah dan transparan.",
        image:
          "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=2000",
        buttonText: "Pelajari Lebih Lanjut",
        buttonLink: "#",
      },
    ],
  },
  render: ({
    slides,
    sliderHeight,
    textPosition,
    overlayOpacity,
    titleColor,
    titleSize,
  }) => {
    const uid = `muslider_${Math.random().toString(36).slice(2, 7)}`;

    const heightMap: Record<string, string> = {
      "h-[600px]": "600px",
      "h-[800px]": "800px",
      "h-screen": "100vh",
      "600px": "600px",
      "80vh": "80vh",
      "100vh": "100vh",
    };
    const height = heightMap[sliderHeight] || sliderHeight || "600px";

    const posMap: Record<string, string> = {
      "items-start text-left": "left",
      "items-center text-center": "center",
      "items-end text-right": "right",
      left: "left",
      center: "center",
      right: "right",
    };
    const pos = posMap[textPosition] || "center";

    const fontMap: Record<string, string> = {
      "text-4xl md:text-6xl": "3.5rem",
      "text-5xl md:text-7xl": "4.5rem",
      "3.5rem": "3.5rem",
      "4.5rem": "4.5rem",
    };
    const fontSize = fontMap[titleSize] || titleSize || "3.5rem";

    const overlayColor = `rgba(15,23,42,${(overlayOpacity ?? 50) / 100})`;
    const textAlign = pos;
    const alignItems =
      pos === "left" ? "flex-start" : pos === "right" ? "flex-end" : "center";

    const slidesHtml = (slides || [])
      .map(
        (slide: any, idx: number) => `
      <div class="${uid}-slide${idx === 0 ? " active" : ""}">
        ${slide.image ? `<img src="${slide.image}" alt="${slide.title || ""}" class="${uid}-bg" />` : `<div class="${uid}-bg" style="background:#1e293b"></div>`}
        <div class="${uid}-overlay"></div>
        <div class="${uid}-content" style="align-items:${alignItems};text-align:${textAlign};">
          <h2 class="${uid}-title" style="color:${titleColor ?? "#fff"};font-size:${fontSize}">${slide.title || ""}</h2>
          <p class="${uid}-desc">${slide.subtitle || ""}</p>
          ${slide.buttonText ? `<a href="${slide.buttonLink || "#"}" class="${uid}-btn">${slide.buttonText}</a>` : ""}
        </div>
      </div>
    `
      )
      .join("");

    const dotsHtml =
      (slides || []).length > 1
        ? `
      <button class="${uid}-nav prev" onclick="${uid}_move(-1)">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <button class="${uid}-nav next" onclick="${uid}_move(1)">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </button>
      <div class="${uid}-dots">
        ${(slides || []).map((_: any, i: number) => `<button class="${uid}-dot${i === 0 ? " active" : ""}" onclick="${uid}_set(${i})"></button>`).join("")}
      </div>
    `
        : "";

    const html = `
<style>
  .${uid}-wrap{position:relative;width:100%;height:${height};overflow:hidden;background:#0f172a;font-family:'Plus Jakarta Sans',sans-serif;}
  .${uid}-slide{position:absolute;inset:0;opacity:0;transition:opacity 0.8s ease-in-out;z-index:0;}
  .${uid}-slide.active{opacity:1;z-index:10;}
  .${uid}-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:1;}
  .${uid}-overlay{position:absolute;inset:0;background-color:${overlayColor};z-index:2;}
  .${uid}-content{position:relative;z-index:3;display:flex;flex-direction:column;height:100%;justify-content:center;color:#fff;padding:0 20px;max-width:900px;margin:0 auto;}
  .${uid}-title{font-weight:800;margin-bottom:1.5rem;line-height:1.1;text-shadow:0 4px 10px rgba(0,0,0,0.5);}
  .${uid}-desc{font-size:1.25rem;margin-bottom:2.5rem;color:#e2e8f0;max-width:700px;text-shadow:0 2px 5px rgba(0,0,0,0.5);}
  .${uid}-btn{display:inline-block;padding:14px 32px;border-radius:50px;font-weight:700;font-size:1.1rem;text-decoration:none;background:#16a34a;color:#fff;transition:all 0.3s;box-shadow:0 10px 15px -3px rgba(22,163,74,0.4);}
  .${uid}-btn:hover{background:#15803d;transform:translateY(-2px);}
  .${uid}-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:20;background:rgba(0,0,0,0.3);color:#fff;border:1px solid rgba(255,255,255,0.2);width:50px;height:50px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);transition:background 0.3s;}
  .${uid}-nav:hover{background:rgba(0,0,0,0.7);}
  .${uid}-nav.prev{left:20px;} .${uid}-nav.next{right:20px;}
  .${uid}-dots{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);z-index:20;display:flex;gap:12px;}
  .${uid}-dot{width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,0.4);border:none;cursor:pointer;transition:background 0.3s;}
  .${uid}-dot.active{background:#fff;}
  @media(max-width:768px){.${uid}-title{font-size:2.25rem!important;}.${uid}-desc{font-size:1rem;}.${uid}-nav{display:none;}}
</style>
<div class="${uid}-wrap">
  ${slidesHtml}
  ${dotsHtml}
</div>
<script>
(function(){
  var cur=0, timer;
  function slides(){ return document.querySelectorAll('.${uid}-slide'); }
  function dots(){ return document.querySelectorAll('.${uid}-dot'); }
  function go(n){
    var s=slides(),d=dots();
    if(!s.length) return;
    s[cur].classList.remove('active');
    if(d[cur]) d[cur].classList.remove('active');
    cur=(n+s.length)%s.length;
    s[cur].classList.add('active');
    if(d[cur]) d[cur].classList.add('active');
    clearInterval(timer); timer=setInterval(function(){go(cur+1);},5000);
  }
  window['${uid}_move']=function(step){go(cur+step);};
  window['${uid}_set']=function(i){go(i);};
  function init(){ clearInterval(timer); timer=setInterval(function(){go(cur+1);},5000); }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',init); } else { init(); }
  setTimeout(init,500);
})();
<\\/script>`;

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  },
};
