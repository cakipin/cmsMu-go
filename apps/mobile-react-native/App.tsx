import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { HomeScreen } from "./src/screens/HomeScreen";
import { PostsScreen } from "./src/screens/PostsScreen";
import { PostDetailScreen } from "./src/screens/PostDetailScreen";

export default function App() {
  const [currentLocale, setCurrentLocale] = useState("id");
  const [activeTab, setActiveTab] = useState<"home" | "posts">("home");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const isRTL = currentLocale === "ar";

  const renderContent = () => {
    if (selectedSlug) {
      return (
        <PostDetailScreen
          slug={selectedSlug}
          currentLocale={currentLocale}
          onBack={() => setSelectedSlug(null)}
        />
      );
    }

    if (activeTab === "posts") {
      return (
        <PostsScreen
          currentLocale={currentLocale}
          onSelectPost={slug => setSelectedSlug(slug)}
          onBack={() => setActiveTab("home")}
        />
      );
    }

    return (
      <HomeScreen
        currentLocale={currentLocale}
        onChangeLocale={loc => setCurrentLocale(loc)}
        onNavigatePost={slug => setSelectedSlug(slug)}
        onNavigatePosts={() => setActiveTab("posts")}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.body}>{renderContent()}</View>

      {/* Bottom Navigation Tab Bar (Hanya tampil jika tidak di layar detail artikel) */}
      {!selectedSlug && (
        <View
          style={[
            styles.tabBar,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <TouchableOpacity
            style={[styles.tabItem, activeTab === "home" && styles.tabItemActive]}
            onPress={() => setActiveTab("home")}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, activeTab === "home" && styles.tabIconActive]}>
              ⌂
            </Text>
            <Text style={[styles.tabLabel, activeTab === "home" && styles.tabLabelActive]}>
              {currentLocale === "ar" ? "الرئيسية" : "Beranda"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "posts" && styles.tabItemActive]}
            onPress={() => setActiveTab("posts")}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, activeTab === "posts" && styles.tabIconActive]}>
              📰
            </Text>
            <Text style={[styles.tabLabel, activeTab === "posts" && styles.tabLabelActive]}>
              {currentLocale === "ar" ? "الأخبار" : "Warta"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  body: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingVertical: 8,
    paddingHorizontal: 24,
    justifyContent: "space-around",
    alignItems: "center",
    // SOP Aturan 9: Safe Bottom Insets
    paddingBottom: Platform.OS === "ios" ? 20 : 12,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: "#e6f4ea",
  },
  tabIcon: {
    fontSize: 18,
    color: "#64748b",
    marginBottom: 2,
  },
  tabIconActive: {
    color: "#0a6134",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
  tabLabelActive: {
    color: "#0a6134",
    fontWeight: "700",
  },
});
