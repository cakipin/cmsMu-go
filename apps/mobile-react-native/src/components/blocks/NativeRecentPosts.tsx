import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import type { RecentPostsProps } from "@cmsmu/schema-sdui";
import { cmsMuClient } from "../../services/cmsmu";

interface Props {
  props: Partial<RecentPostsProps>;
  locale: string;
  onSelectPost?: (slug: string) => void;
  onViewAllPosts?: () => void;
}

export function NativeRecentPosts({
  props,
  locale,
  onSelectPost,
  onViewAllPosts,
}: Props) {
  const isRTL = locale === "ar";
  const title = props.title || "Kabar Berita Terkini";
  const limit = typeof props.limit === "number" ? props.limit : parseInt(String(props.limit || 4), 10);

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    cmsMuClient.posts
      .list({ limit, locale })
      .then(res => {
        if (isMounted && res && res.data) {
          setPosts(res.data);
        }
      })
      .catch(() => {
        if (isMounted) setPosts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [limit, locale]);

  return (
    <View style={styles.container}>
      <View style={[styles.headerRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onViewAllPosts} activeOpacity={0.7}>
          <Text style={styles.viewAll}>
            {locale === "ar" ? "عرض الكل" : "Lihat Semua"}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#0a6134" style={{ marginVertical: 20 }} />
      ) : posts.length > 0 ? (
        <View style={styles.list}>
          {posts.map(post => (
            <TouchableOpacity
              key={post.id}
              style={[styles.postCard, { flexDirection: isRTL ? "row-reverse" : "row" }]}
              activeOpacity={0.8}
              onPress={() => onSelectPost?.(post.slug)}
            >
              {post.featuredImage ? (
                <Image
                  source={{ uri: post.featuredImage }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.postImage, styles.placeholderImage]}>
                  <Text style={styles.placeholderText}>cmsMu</Text>
                </View>
              )}
              <View style={[styles.postContent, isRTL && styles.contentRTL]}>
                {post.category ? (
                  <Text style={[styles.category, isRTL && styles.textRTL]}>
                    {post.category}
                  </Text>
                ) : null}
                <Text
                  style={[styles.postTitle, isRTL && styles.textRTL]}
                  numberOfLines={2}
                >
                  {post.title}
                </Text>
                <Text style={[styles.date, isRTL && styles.textRTL]}>
                  {new Date(post.createdAt).toLocaleDateString(isRTL ? "ar-EG" : "id-ID")}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
          {locale === "ar" ? "لا توجد أخبار متاحة حاليا." : "Belum ada warta terbaru."}
        </Text>
      )}
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
  headerRow: {
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },
  viewAll: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0a6134",
  },
  list: {
    gap: 14,
  },
  postCard: {
    alignItems: "center",
    gap: 14,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  postImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
  },
  placeholderImage: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
  },
  postContent: {
    flex: 1,
  },
  contentRTL: {
    alignItems: "flex-end",
  },
  category: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0a6134",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 20,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: "#94a3b8",
  },
  textRTL: {
    textAlign: "right",
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginVertical: 16,
  },
});
