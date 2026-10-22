import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { FeatureGridProps } from "@cmsmu/schema-sdui";

interface Props {
  props: Partial<FeatureGridProps> & { features?: any[] };
  locale: string;
}

function FeatureSymbol({ name }: { name?: string }) {
  const n = (name || "bolt").toLowerCase();
  let tag = "⚡"; // fallback tag
  let color = "#0a6134";

  if (n.includes("shield") || n.includes("keamanan")) {
    tag = "🛡";
    color = "#0284c7";
  } else if (n.includes("mobile") || n.includes("responsif")) {
    tag = "📱";
    color = "#8b5cf6";
  }

  // Menampilkan badge simbol geometri kustom
  return (
    <View style={[styles.symbolBox, { backgroundColor: color + "18" }]}>
      <Text style={[styles.symbolText, { color }]}>{tag}</Text>
    </View>
  );
}

export function NativeFeatureGrid({ props, locale }: Props) {
  const isRTL = locale === "ar";
  const title = props.title || "Fitur Unggulan Platform";
  const description = props.description || "Solusi lengkap dan terintegrasi untuk publikasi modern.";
  const list = props.items && props.items.length > 0 ? props.items : props.features || [];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isRTL && styles.textRTL]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, isRTL && styles.textRTL]}>{description}</Text>
      ) : null}

      <View style={styles.grid}>
        {list.map((item, idx) => (
          <View key={idx} style={styles.card}>
            <FeatureSymbol name={item.icon || item.svgIcon} />
            <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>{item.title}</Text>
            <Text style={[styles.cardDesc, isRTL && styles.textRTL]}>{item.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 20,
  },
  textRTL: {
    textAlign: "right",
  },
  grid: {
    gap: 12,
  },
  card: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  symbolBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  symbolText: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
});
