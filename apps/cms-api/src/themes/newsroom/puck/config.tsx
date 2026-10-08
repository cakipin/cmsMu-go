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
  MagazineFooter
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
    MagazineFooter
  }
};

export type { Props };
