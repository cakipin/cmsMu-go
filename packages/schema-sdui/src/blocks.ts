import { z } from "zod";

/**
 * 🧭 Arah baca teks (Text Direction)
 */
export const DirectionSchema = z.enum(["ltr", "rtl"]);
export type Direction = z.infer<typeof DirectionSchema>;

/**
 * 🌐 Master Bahasa yang Didukung
 */
export const LocaleCodeSchema = z.enum(["id", "en", "ar"]);
export type LocaleCode = z.infer<typeof LocaleCodeSchema>;

export const LocaleItemSchema = z.object({
  code: z.string(),
  name: z.string(),
  direction: DirectionSchema,
  isDefault: z.number().int().min(0).max(1),
  isActive: z.number().int().min(0).max(1).optional().default(1),
});
export type LocaleItem = z.infer<typeof LocaleItemSchema>;

/**
 * 1. SiteHeader Props Schema
 */
export const SiteHeaderPropsSchema = z.object({
  id: z.string().optional(),
  siteTitle: z.string().optional().default("cmsMu"),
  siteTitleHighlight: z.string().optional().default(""),
  logoImage: z.string().optional().default("/logo-cmsmu.webp"),
  headerScope: z.enum(["all", "home_only", "pages_posts"]).optional().default("all"),
  headerPosition: z.enum(["static", "sticky", "fixed"]).optional().default("static"),
  headerBgColor: z.string().optional().default("#ffffff"),
  headerTextColor: z.string().optional().default(""),
  headerBorderColor: z.string().optional().default("#e2e8f0"),
  headerBorderWidth: z.string().optional().default("1px"),
  headerRadius: z.string().optional().default("none"),
  headerSize: z.string().optional().default("normal"),
  headerWidth: z.string().optional().default("full"),
  headerFontFamily: z.string().optional().default("Plus Jakarta Sans"),
  showThemeToggle: z.string().optional().default("yes"),
  showCta: z.string().optional().default("yes"),
  enableUserDropdown: z.string().optional().default("yes"),
  ctaText: z.string().optional().default("Mulai Sekarang"),
  ctaUrl: z.string().optional().default("/admin"),
  menuItems: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
      })
    )
    .optional()
    .default([
      { label: "Beranda", url: "/" },
      { label: "Berita", url: "/berita" },
      { label: "Panduan", url: "/panduan" },
    ]),
});
export type SiteHeaderProps = z.infer<typeof SiteHeaderPropsSchema>;

/**
 * 2. Hero Props Schema
 */
export const HeroPropsSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional().default("Membangun Peradaban Utama"),
  subtitle: z.string().optional().default(""),
  badgeText: z.string().optional().default(""),
  primaryButtonText: z.string().optional().default(""),
  primaryButtonLink: z.string().optional().default(""),
  secondaryButtonText: z.string().optional().default(""),
  secondaryButtonLink: z.string().optional().default(""),
  backgroundImage: z.string().optional().default(""),
  titleColor: z.string().optional(),
  subtitleColor: z.string().optional(),
});
export type HeroProps = z.infer<typeof HeroPropsSchema>;

/**
 * 3. Partners Props Schema
 */
export const PartnerItemSchema = z.object({
  name: z.string(),
  logoUrl: z.string().optional().default(""),
  url: z.string().optional().default(""),
});

export const PartnersPropsSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional().default("Mitra & Kolaborasi"),
  items: z.array(PartnerItemSchema).optional().default([]),
});
export type PartnersProps = z.infer<typeof PartnersPropsSchema>;

/**
 * 4. FeatureGrid Props Schema
 */
export const FeatureGridItemSchema = z.object({
  title: z.string(),
  description: z.string().optional().default(""),
  icon: z.string().optional().default(""),
  link: z.string().optional().default(""),
});

export const FeatureGridPropsSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional().default("Fitur Unggulan"),
  description: z.string().optional().default(""),
  columns: z.union([z.number(), z.string()]).optional().default(3),
  items: z.array(FeatureGridItemSchema).optional().default([]),
});
export type FeatureGridProps = z.infer<typeof FeatureGridPropsSchema>;

/**
 * 5. Testimonial Props Schema
 */
export const TestimonialItemSchema = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string().optional().default(""),
  avatarUrl: z.string().optional().default(""),
});

export const TestimonialPropsSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional().default("Apa Kata Mereka?"),
  subtitle: z.string().optional().default(""),
  items: z.array(TestimonialItemSchema).optional().default([]),
});
export type TestimonialProps = z.infer<typeof TestimonialPropsSchema>;

/**
 * 6. RecentPosts Props Schema
 */
export const RecentPostsPropsSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional().default("Warta & Kabar Terbaru"),
  subtitle: z.string().optional().default(""),
  limit: z.union([z.number(), z.string()]).optional().default(6),
  category: z.string().optional().default("all"),
  showExcerpt: z.string().optional().default("yes"),
});
export type RecentPostsProps = z.infer<typeof RecentPostsPropsSchema>;

/**
 * 7. CallToAction Props Schema
 */
export const CallToActionPropsSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional().default("Bergabung Bersama Kami"),
  description: z.string().optional().default(""),
  buttonText: z.string().optional().default("Hubungi Kami"),
  buttonLink: z.string().optional().default("#"),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
});
export type CallToActionProps = z.infer<typeof CallToActionPropsSchema>;

/**
 * 8. SiteFooter Props Schema
 */
export const FooterLinkItemSchema = z.object({
  label: z.string(),
  url: z.string(),
});

export const FooterSocialItemSchema = z.object({
  platform: z.string(),
  url: z.string(),
});

export const SiteFooterPropsSchema = z.object({
  id: z.string().optional(),
  siteTitle: z.string().optional().default("cmsMu"),
  description: z.string().optional().default(""),
  copyrightText: z.string().optional().default(""),
  links: z.array(FooterLinkItemSchema).optional().default([]),
  socialLinks: z.array(FooterSocialItemSchema).optional().default([]),
});
export type SiteFooterProps = z.infer<typeof SiteFooterPropsSchema>;

/**
 * 🧩 Universal Block Discriminated Schemas
 */
export const SiteHeaderBlockSchema = z.object({
  type: z.literal("SiteHeader"),
  props: SiteHeaderPropsSchema,
});

export const HeroBlockSchema = z.object({
  type: z.literal("Hero"),
  props: HeroPropsSchema,
});

export const PartnersBlockSchema = z.object({
  type: z.literal("Partners"),
  props: PartnersPropsSchema,
});

export const FeatureGridBlockSchema = z.object({
  type: z.literal("FeatureGrid"),
  props: FeatureGridPropsSchema,
});

export const TestimonialBlockSchema = z.object({
  type: z.literal("Testimonial"),
  props: TestimonialPropsSchema,
});

export const RecentPostsBlockSchema = z.object({
  type: z.literal("RecentPosts"),
  props: RecentPostsPropsSchema,
});

export const CallToActionBlockSchema = z.object({
  type: z.literal("CallToAction"),
  props: CallToActionPropsSchema,
});

export const SiteFooterBlockSchema = z.object({
  type: z.literal("SiteFooter"),
  props: SiteFooterPropsSchema,
});

/**
 * 📦 Generic or Custom Block Schema (Fallback untuk custom blocks)
 */
export const GenericBlockSchema = z.object({
  type: z.string(),
  props: z.record(z.string(), z.any()),
});

/**
 * 🔄 SDUI Block Union
 */
export const SDUIBlockSchema = z.union([
  SiteHeaderBlockSchema,
  HeroBlockSchema,
  PartnersBlockSchema,
  FeatureGridBlockSchema,
  TestimonialBlockSchema,
  RecentPostsBlockSchema,
  CallToActionBlockSchema,
  SiteFooterBlockSchema,
  GenericBlockSchema,
]);
export type SDUIBlock = z.infer<typeof SDUIBlockSchema>;

/**
 * 📑 SDUI Page Response Schema
 */
export const SDUIPageSchema = z.object({
  success: z.boolean(),
  slug: z.string(),
  locale: z.string(),
  direction: DirectionSchema,
  availableLocales: z.array(z.string()),
  root: z
    .object({
      props: z
        .object({
          title: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  content: z.array(SDUIBlockSchema),
  zones: z.record(z.string(), z.array(SDUIBlockSchema)).optional(),
});
export type SDUIPage = z.infer<typeof SDUIPageSchema>;
