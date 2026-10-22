import React from "react";
import type { SDUIBlock } from "@cmsmu/schema-sdui";
import { NativeSiteHeader } from "./blocks/NativeSiteHeader";
import { NativeHero } from "./blocks/NativeHero";
import { NativePartners } from "./blocks/NativePartners";
import { NativeFeatureGrid } from "./blocks/NativeFeatureGrid";
import { NativeTestimonial } from "./blocks/NativeTestimonial";
import { NativeRecentPosts } from "./blocks/NativeRecentPosts";
import { NativeCallToAction } from "./blocks/NativeCallToAction";
import { NativeSiteFooter } from "./blocks/NativeSiteFooter";

interface Props {
  block: SDUIBlock | any;
  locale: string;
  onOpenLanguageModal?: () => void;
  onSelectPost?: (slug: string) => void;
  onViewAllPosts?: () => void;
}

export function NativeBlockRenderer({
  block,
  locale,
  onOpenLanguageModal,
  onSelectPost,
  onViewAllPosts,
}: Props) {
  if (!block || !block.type) return null;

  switch (block.type) {
    case "SiteHeader":
      return (
        <NativeSiteHeader
          props={block.props}
          locale={locale}
          onOpenLanguageModal={onOpenLanguageModal}
        />
      );

    case "Hero":
      return (
        <NativeHero
          props={block.props}
          locale={locale}
          onNavigatePosts={onViewAllPosts}
        />
      );

    case "Partners":
      return <NativePartners props={block.props} locale={locale} />;

    case "FeatureGrid":
      return <NativeFeatureGrid props={block.props} locale={locale} />;

    case "Testimonial":
      return <NativeTestimonial props={block.props} locale={locale} />;

    case "RecentPosts":
      return (
        <NativeRecentPosts
          props={block.props}
          locale={locale}
          onSelectPost={onSelectPost}
          onViewAllPosts={onViewAllPosts}
        />
      );

    case "CallToAction":
      return <NativeCallToAction props={block.props} locale={locale} />;

    case "SiteFooter":
      return <NativeSiteFooter props={block.props} locale={locale} />;

    default:
      return null;
  }
}
