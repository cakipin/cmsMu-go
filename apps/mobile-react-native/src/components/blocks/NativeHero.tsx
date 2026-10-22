import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { HeroProps } from "@cmsmu/schema-sdui";

interface Props {
  props: Partial<HeroProps>;
  locale: string;
  onNavigatePosts?: () => void;
}

export function NativeHero({ props, locale, onNavigatePosts }: Props) {
  const isRTL = locale === "ar";
  const title = props.title || "Membangun Peradaban Utama";
  const subtitle = props.subtitle || "Satu platform Content Management System modern untuk website & media.";
  const badgeText = props.badgeText || "";
  const primaryButtonText = props.primaryButtonText || "Jelajahi Berita";

  return (
    <View style={styles.container}>
      {badgeText ? (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      ) : null}

      <Text style={[styles.title, isRTL && styles.textRTL]}>{title}</Text>

      {subtitle ? (
        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>{subtitle}</Text>
      ) : null}

      <View style={[styles.buttonRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={onNavigatePosts}
        >
          <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  badgeContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#e6f4ea",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0a6134",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 34,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 24,
  },
  textRTL: {
    textAlign: "right",
  },
  buttonRow: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#0a6134",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0a6134",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
