import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { cmsMuClient } from "../services/cmsmu";

interface Props {
  currentLocale: string;
  onSelectPost: (slug: string) => void;
  onBack: () => void;
}

export function PostsScreen({ currentLocale, onSelectPost, onBack }: Props) {
  const isRTL = currentLocale === "ar";
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await cmsMuClient.posts.list({ limit: 30, locale: currentLocale });
      if (res && res.data) {
        setPosts(res.data);
      }
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentLocale]);

  useEffect(() => {
    setLoading(true);
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, [fetchPosts]);

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>{isRTL ? "→" : "←"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentLocale === "ar" ? "أحدث الأخبار" : "Warta & Berita"}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0a6134" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          // SOP Aturan 9: Wajib Pull-to-Refresh
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0a6134"]}
              tintColor="#0a6134"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => onSelectPost(item.slug)}
            >
              {item.featuredImage ? (
                <Image
                  source={{ uri: item.featuredImage }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : null}
              <View style={styles.cardBody}>
                {item.category ? (
                  <Text style={[styles.category, isRTL && styles.textRTL]}>
                    {item.category}
                  </Text>
                ) : null}
                <Text style={[styles.title, isRTL && styles.textRTL]}>{item.title}</Text>
                {item.excerpt ? (
                  <Text
                    style={[styles.excerpt, isRTL && styles.textRTL]}
                    numberOfLines={2}
                  >
                    {item.excerpt}
                  </Text>
                ) : null}
                <View
                  style={[
                    styles.footerRow,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                >
                  <Text style={styles.author}>{item.author || "Admin"}</Text>
                  <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleDateString(isRTL ? "ar-EG" : "id-ID")}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {currentLocale === "ar"
                  ? "لا توجد مقالات متاحة حاليا."
                  : "Belum ada berita yang tersedia."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: 16,
    gap: 16,
    // SOP Aturan 9: Safe Bottom Padding
    paddingBottom: 48,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#f1f5f9",
  },
  cardBody: {
    padding: 16,
  },
  category: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0a6134",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 22,
    marginBottom: 8,
  },
  excerpt: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 12,
  },
  footerRow: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  author: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  date: {
    fontSize: 11,
    color: "#94a3b8",
  },
  textRTL: {
    textAlign: "right",
  },
  empty: {
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
  },
});
