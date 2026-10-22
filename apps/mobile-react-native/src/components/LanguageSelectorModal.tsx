import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { SUPPORTED_LOCALES } from "../services/cmsmu";

interface Props {
  visible: boolean;
  currentLocale: string;
  onSelectLocale: (locale: string) => void;
  onClose: () => void;
}

export function LanguageSelectorModal({
  visible,
  currentLocale,
  onSelectLocale,
  onClose,
}: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.title}>Pilih Bahasa / اختر اللغة</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.list}>
                {SUPPORTED_LOCALES.map(loc => {
                  const isSelected = loc.code === currentLocale;
                  return (
                    <TouchableOpacity
                      key={loc.code}
                      style={[
                        styles.item,
                        isSelected && styles.itemSelected,
                      ]}
                      onPress={() => {
                        onSelectLocale(loc.code);
                        onClose();
                      }}
                    >
                      <View style={styles.itemBadge}>
                        <Text style={styles.itemBadgeText}>{loc.flag}</Text>
                      </View>
                      <Text
                        style={[
                          styles.itemLabel,
                          isSelected && styles.itemLabelSelected,
                        ]}
                      >
                        {loc.label}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "700",
  },
  list: {
    gap: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  itemSelected: {
    backgroundColor: "#e6f4ea",
    borderColor: "#0a6134",
  },
  itemBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  itemLabelSelected: {
    color: "#0a6134",
    fontWeight: "700",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0a6134",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
});
