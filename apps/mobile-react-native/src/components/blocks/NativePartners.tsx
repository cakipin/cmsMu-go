import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import type { PartnersProps } from "@cmsmu/schema-sdui";

interface Props {
  props: Partial<PartnersProps> & { partners?: any[] };
  locale: string;
}

export function NativePartners({ props, locale }: Props) {
  const isRTL = locale === "ar";
  const title = props.title || "Mitra & Kolaborasi";
  const list = props.items && props.items.length > 0 ? props.items : props.partners || [];

  if (list.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isRTL && styles.textRTL]}>{title.toUpperCase()}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        {list.map((item, idx) => (
          <View key={idx} style={styles.partnerChip}>
            {item.logoUrl ? (
              <Image
                source={{ uri: item.logoUrl }}
                style={styles.partnerLogo}
                resizeMode="contain"
              />
            ) : null}
            <Text style={styles.partnerName}>{item.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  title: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#94a3b8",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  textRTL: {
    textAlign: "right",
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
    alignItems: "center",
  },
  partnerChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  partnerLogo: {
    width: 20,
    height: 20,
  },
  partnerName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
});
