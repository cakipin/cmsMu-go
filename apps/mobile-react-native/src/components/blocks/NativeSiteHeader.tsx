import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import type { SiteHeaderProps } from "@cmsmu/schema-sdui";

interface Props {
  props: Partial<SiteHeaderProps>;
  locale: string;
  onOpenLanguageModal?: () => void;
}

export function NativeSiteHeader({ props, locale, onOpenLanguageModal }: Props) {
  const isRTL = locale === "ar";
  const siteTitle = props.siteTitle || "cmsMu";
  const logoImage = props.logoImage || "https://cms.labmu.dev/logo-cmsmu.webp";

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: isRTL ? "row-reverse" : "row",
          backgroundColor: props.headerBgColor || "#ffffff",
        },
      ]}
    >
      <View style={[styles.brand, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Image
          source={{ uri: logoImage }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: props.headerTextColor || "#0f172a" }]}>
          {siteTitle}
        </Text>
      </View>

      <View style={[styles.actions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <TouchableOpacity
          onPress={onOpenLanguageModal}
          style={styles.langButton}
          activeOpacity={0.7}
        >
          <Text style={styles.langButtonText}>{locale.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  brand: {
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  actions: {
    alignItems: "center",
    gap: 10,
  },
  langButton: {
    backgroundColor: "#e6f4ea",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  langButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0a6134",
  },
});
