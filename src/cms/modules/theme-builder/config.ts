import type { Config } from "@puckeditor/core";
import type { Props } from "./types";
import { SiteHeader } from "./components/SiteHeader";
import { HeroSlider } from "./components/HeroSlider";
import { Hero } from "./components/Hero";
import { Partners } from "./components/Partners";
import { FeatureGrid } from "./components/FeatureGrid";
import { Testimonial } from "./components/Testimonial";
import { RecentPosts } from "./components/RecentPosts";
import { CallToAction } from "./components/CallToAction";
import { SiteFooter } from "./components/SiteFooter";
import {
  CustomHTML,
  Spacer,
  MagazineHeader,
  MagazineBigGrid,
  MagazineFlexBlock,
  MagazineFooter,
} from "./components/MiscBlocks";

export const puckConfig: Config<Props> = {
  components: {
    SiteHeader,
    HeroSlider,
    Hero,
    Partners,
    FeatureGrid,
    Testimonial,
    RecentPosts,
    CallToAction,
    SiteFooter,
    CustomHTML,
    Spacer,
    MagazineHeader,
    MagazineBigGrid,
    MagazineFlexBlock,
    MagazineFooter,
  },
};

export const defaultHomePuck = {
  content: [
    { type: "SiteHeader", props: { id: "SiteHeader-1" } },
    { type: "Hero", props: { id: "Hero-1" } },
    { type: "Partners", props: { id: "Partners-1" } },
    { type: "FeatureGrid", props: { id: "FeatureGrid-1" } },
    { type: "Testimonial", props: { id: "Testimonial-1" } },
    { type: "RecentPosts", props: { id: "RecentPosts-1" } },
    { type: "CallToAction", props: { id: "CallToAction-1" } },
    { type: "SiteFooter", props: { id: "SiteFooter-1" } },
  ],
  root: {},
  zones: {},
};

export const defaultLandingPuck = {
  content: [
    { type: "SiteHeader", props: { id: "SiteHeader-1" } },
    { type: "HeroSlider", props: { id: "HeroSlider-1" } },
    { type: "FeatureGrid", props: { id: "FeatureGrid-1" } },
    { type: "RecentPosts", props: { id: "RecentPosts-1" } },
    { type: "CallToAction", props: { id: "CallToAction-1" } },
    { type: "SiteFooter", props: { id: "SiteFooter-1" } },
  ],
  root: {},
  zones: {},
};

export type { Props };
