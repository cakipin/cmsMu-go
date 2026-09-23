export type Props = {
  SiteHeader: {
    logoType?: "both" | "image" | "text";
    logoImage: string;
    logoHeight?: string;
    siteTitle: string;
    siteTitleHighlight: string;
    highlightColor?: string;
    logoLetter: string;
    menuItems: { label: string; url: string }[];
    menuPosition?: string;
    menuItemSpacing?: string;
    linkHoverColor?: string;
    showCta?: "yes" | "no";
    ctaText: string;
    ctaUrl: string;
    ctaStyle?: "solid" | "outline";
    ctaBgColor?: string;
    ctaTextColor?: string;
    headerPosition?: "fixed" | "sticky" | "static";
    headerBgColor1: string;
    headerBgColor2: string;
    headerGlassmorphism?: "yes" | "no";
    textColor: string;
    showBorder?: "yes" | "no";
    borderColor?: string;
    fontFamily: string;
    headerPadding: string;
    containerWidth?: string;
    applyGlobal?: "all" | "page_only";
    syncLogo?: "yes" | "no";
  };
  HeroSlider: {
    slides: { image: string; title: string; subtitle: string; buttonText: string; buttonLink: string }[];
    sliderHeight: string;
    textPosition: string;
    overlayOpacity: number;
    titleColor: string;
    titleSize: string;
  };
  Hero: {
    badgeText: string;
    title: string;
    titleHighlight: string;
    titleColor: string;
    description: string;
    descriptionColor: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    backgroundImage: string;
    backgroundColor: string;
  };
  Partners: {
    title: string;
    partners: { name: string; logoUrl?: string; url?: string }[];
  };
  FeatureGrid: {
    title: string;
    description: string;
    features: { title: string; description: string; svgIcon: string }[];
  };
  Testimonial: {
    title: string;
    subtitle: string;
    testimonials: { quote: string; author: string; role: string; initials: string; bgColor: string }[];
  };
  RecentPosts: {
    title: string;
    description: string;
    viewAllText: string;
    viewAllLink: string;
  };
  CallToAction: {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    footerText: string;
  };
  SiteFooter: {
    siteName: string;
    copyrightText: string;
  };
  CustomHTML: {
    html: string;
  };
  Spacer: {
    height: number;
  };
  MagazineHeader: {
    logoUrl: string;
    menuItems: { label: string; url: string }[];
  };
  MagazineBigGrid: {
    title: string;
    categorySlug: string;
  };
  MagazineFlexBlock: {
    title: string;
    categorySlug: string;
    limit: number;
  };
  MagazineFooter: {};
};
