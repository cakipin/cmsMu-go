import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { SiteFooterProps } from "@cmsmu/schema-sdui";

interface Props {
  props: Partial<SiteFooterProps> & { siteName?: string };
  locale: string;
}

export function NativeSiteFooter({ props, locale }: Props) {
  const isRTL = locale === "ar";
  const siteTitle = props.siteTitle || props.siteName || "cmsMu";
  const copyrightText =
    props.copyrightText ||
    `© ${new Date().getFullYear()} ${siteTitle}. Hak Cipta Dilindungi Undang-Undang.`;

  return (
    <View style={styles.container}>
      <Text style={[styles.brand, isRTL && styles.textRTL]}>{siteTitle}</Text>
      <Text style={[styles.badge, isRTL && styles.textRTL]}>
        Platform CMS Muhammadiyah (React Native SDUI)
      </Text>
      <Text style={[styles.copyright, isRTL && styles.textRTL]}>{copyrightText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 48, // Safe insets padding
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    alignItems: "center",
  },
  brand: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  badge: {
    fontSize: 12,
    color: "#0a6134",
    fontWeight: "600",
    marginBottom: 10,
  },
  copyright: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
  },
  textRTL: {
    textAlign: "right",
  },
});
