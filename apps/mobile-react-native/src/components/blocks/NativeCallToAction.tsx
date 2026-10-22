import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { CallToActionProps } from "@cmsmu/schema-sdui";

interface Props {
  props: Partial<CallToActionProps>;
  locale: string;
}

export function NativeCallToAction({ props, locale }: Props) {
  const isRTL = locale === "ar";
  const title = props.title || "Siap Membangun Website & Media Anda?";
  const description = props.description || "Mulai terbitkan artikel dan kelola konten digital sekarang juga.";
  const buttonText = props.buttonText || "Mulai Sekarang";

  return (
    <View style={[styles.container, { backgroundColor: props.bgColor || "#0a6134" }]}>
      <Text style={[styles.title, isRTL && styles.textRTL]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, isRTL && styles.textRTL]}>{description}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, isRTL && styles.buttonRTL]}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
    lineHeight: 28,
  },
  description: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.88)",
    lineHeight: 20,
    marginBottom: 20,
  },
  textRTL: {
    textAlign: "right",
  },
  button: {
    backgroundColor: "#ffffff",
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  buttonRTL: {
    alignSelf: "flex-end",
  },
  buttonText: {
    color: "#0a6134",
    fontSize: 14,
    fontWeight: "800",
  },
});
