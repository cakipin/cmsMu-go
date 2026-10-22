import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { TestimonialProps } from "@cmsmu/schema-sdui";

interface Props {
  props: Partial<TestimonialProps> & { testimonials?: any[] };
  locale: string;
}

export function NativeTestimonial({ props, locale }: Props) {
  const isRTL = locale === "ar";
  const title = props.title || "Apa Kata Mereka?";
  const subtitle = props.subtitle || "Pengalaman para administrator & redaktur.";
  const list = props.items && props.items.length > 0 ? props.items : props.testimonials || [];

  if (list.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isRTL && styles.textRTL]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>{subtitle}</Text>
      ) : null}

      <View style={styles.list}>
        {list.map((item, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={[styles.quote, isRTL && styles.textRTL]}>
              &ldquo;{item.quote}&rdquo;
            </Text>
            <View style={[styles.authorRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.initials || (item.author ? item.author.slice(0, 2).toUpperCase() : "MU")}
                </Text>
              </View>
              <View>
                <Text style={[styles.authorName, isRTL && styles.textRTL]}>{item.author}</Text>
                {item.role ? (
                  <Text style={[styles.authorRole, isRTL && styles.textRTL]}>{item.role}</Text>
                ) : null}
              </View>
            </View>
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
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
  },
  textRTL: {
    textAlign: "right",
  },
  list: {
    gap: 14,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  quote: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 22,
    color: "#334155",
    marginBottom: 16,
  },
  authorRow: {
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0a6134",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  authorRole: {
    fontSize: 12,
    color: "#94a3b8",
  },
});
