import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { cmsMuClient } from "../services/cmsmu";
import { NativeBlockRenderer } from "../components/NativeBlockRenderer";
import { LanguageSelectorModal } from "../components/LanguageSelectorModal";

interface Props {
  currentLocale: string;
  onChangeLocale: (locale: string) => void;
  onNavigatePost: (slug: string) => void;
  onNavigatePosts: () => void;
}

export function HomeScreen({
  currentLocale,
  onChangeLocale,
  onNavigatePost,
  onNavigatePosts,
}: Props) {
  const [sduiData, setSduiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await cmsMuClient.sdui.getPage("home", {
        platform: "mobile",
        locale: currentLocale,
      });
      setSduiData(res);
    } catch {
      setSduiData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentLocale]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a6134" />
        <Text style={styles.loadingText}>Memuat Konten cmsMu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        // SOP Aturan 9: Wajib Pull-to-Refresh dengan RefreshControl primary theme
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0a6134"]}
            tintColor="#0a6134"
          />
        }
      >
        {sduiData && Array.isArray(sduiData.content) && sduiData.content.length > 0 ? (
          sduiData.content.map((block: any, idx: number) => (
            <NativeBlockRenderer
              key={block.props?.id || idx}
              block={block}
              locale={currentLocale}
              onOpenLanguageModal={() => setLangModalVisible(true)}
              onSelectPost={onNavigatePost}
              onViewAllPosts={onNavigatePosts}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Halaman Belum Tersedia</Text>
            <Text style={styles.emptySubtitle}>
              Blueprint visual canvas untuk halaman ini belum dikonfigurasi.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* In-system Language Modal */}
      <LanguageSelectorModal
        visible={langModalVisible}
        currentLocale={currentLocale}
        onSelectLocale={onChangeLocale}
        onClose={() => setLangModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    // SOP Aturan 9: Safe Bottom Padding untuk navigasi sistem Android
    paddingBottom: 48,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
});
