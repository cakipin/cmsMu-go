import React from "react";
import type { SDUIBlock } from "@cmsmu/schema-sdui";
import { SiteHeaderBlock } from "./blocks/SiteHeader";
import { HeroBlock } from "./blocks/Hero";
import { PartnersBlock } from "./blocks/Partners";
import { FeatureGridBlock } from "./blocks/FeatureGrid";
import { TestimonialBlock } from "./blocks/Testimonial";
import { RecentPostsBlock } from "./blocks/RecentPosts";
import { CallToActionBlock } from "./blocks/CallToAction";
import { SiteFooterBlock } from "./blocks/SiteFooter";

interface Props {
  block: SDUIBlock | any;
  locale: string;
}

export async function CmsMuBlockRenderer({ block, locale }: Props) {
  if (!block || !block.type) return null;

  switch (block.type) {
    case "SiteHeader":
      return <SiteHeaderBlock props={block.props} locale={locale} />;

    case "Hero":
      return <HeroBlock props={block.props} locale={locale} />;

    case "Partners":
      return <PartnersBlock props={block.props} locale={locale} />;

    case "FeatureGrid":
      return <FeatureGridBlock props={block.props} locale={locale} />;

    case "Testimonial":
      return <TestimonialBlock props={block.props} locale={locale} />;

    case "RecentPosts":
      return <RecentPostsBlock props={block.props} locale={locale} />;

    case "CallToAction":
      return <CallToActionBlock props={block.props} locale={locale} />;

    case "SiteFooter":
      return <SiteFooterBlock props={block.props} locale={locale} />;

    default:
      // Fallback untuk custom blocks (seperti MagazineBigGrid, dll)
      return null;
  }
}
