import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { cmsMuClient } from "../services/cmsmu";

interface Props {
  slug: string;
  currentLocale: string;
  onBack: () => void;
}

export function PostDetailScreen({ slug, currentLocale, onBack }: Props) {
  const isRTL = currentLocale === "ar";
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    cmsMuClient.posts
      .get(slug, { locale: currentLocale })
      .then(res => {
        if (isMounted && res && res.data) {
          setPost(res.data);
        }
      })
      .catch(() => {
        if (isMounted) setPost(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug, currentLocale]);

  // Membersihkan tag HTML dasar untuk tampilan naskah native
  const stripHtml = (html?: string) => {
    if (!html) return "";
    return html
      .replace(/<p[^>]*>/gi, "")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<br\s*[\/]?>/gi, "\n")
      .replace(/<[^>]+>/gi, "")
      .trim();
  };

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>{isRTL ? "→" : "←"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {post?.title || (currentLocale === "ar" ? "قراءة الخبر" : "Baca Berita")}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0a6134" />
        </View>
      ) : post ? (
        <ScrollView contentContainerStyle={styles.content}>
          {post.category ? (
            <Text style={[styles.category, isRTL && styles.textRTL]}>
              {post.category}
            </Text>
          ) : null}

          <Text style={[styles.title, isRTL && styles.textRTL]}>{post.title}</Text>

          <View style={[styles.metaRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Text style={styles.author}>Oleh {post.author || "Admin"}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.date}>
              {new Date(post.createdAt).toLocaleDateString(isRTL ? "ar-EG" : "id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          {post.featuredImage ? (
            <Image
              source={{ uri: post.featuredImage }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          ) : null}

          <Text style={[styles.bodyText, isRTL && styles.textRTL]}>
            {stripHtml(post.body || post.excerpt)}
          </Text>
        </ScrollView>
      ) : (
        <View style={styles.center}>
          <Text style={styles.notFoundText}>
            {currentLocale === "ar" ? "المقال غير موجود." : "Artikel tidak ditemukan."}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
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
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginHorizontal: 12,
    textAlign: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
    // SOP Aturan 9: Safe Bottom Padding
    paddingBottom: 54,
  },
  category: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0a6134",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 32,
    marginBottom: 12,
  },
  metaRow: {
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  author: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  dot: {
    color: "#cbd5e1",
  },
  date: {
    fontSize: 12,
    color: "#94a3b8",
  },
  featuredImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#1e293b",
  },
  textRTL: {
    textAlign: "right",
  },
  notFoundText: {
    fontSize: 14,
    color: "#94a3b8",
  },
});
