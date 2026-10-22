# cmsmu_sdk (Flutter / Dart)

Official Flutter & Dart Client SDK for cmsMu. Provides out-of-the-box support for:
- 🎨 **Server-Driven UI (SDUI)**: Canvas layout blueprints ready to render in Flutter widgets.
- 🌐 **Multi-Language (i18n)**: Seamless locale switching (`id`, `en`, `ar` with RTL detection).
- 📰 **Posts & Warta API**: Type-safe pagination and query filters.

---

## 🚀 Instalasi

Tambahkan pada `pubspec.yaml` proyek Flutter Anda:

```yaml
dependencies:
  cmsmu_sdk:
    path: ../packages/sdk-flutter # atau via Git repository
```

Lalu jalankan:
```bash
flutter pub get
```

---

## 💡 Contoh Penggunaan

```dart
import 'package:flutter/material.dart';
import 'package:cmsmu_sdk/cmsmu_sdk.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final client = CmsMuClient(
    const CmsMuConfig(
      baseUrl: 'https://cms.labmu.dev',
      defaultLocale: 'id',
    ),
  );

  // 1. Mengambil Layout Server-Driven UI (SDUI)
  final page = await client.sdui.getPage('home', locale: 'ar', platform: 'mobile');
  print('Page Title: ${page.slug}, Direction: ${page.direction}, RTL: ${page.isRtl}');
  for (final block in page.content) {
    print('Block: ${block.type} with props: ${block.props.keys}');
  }

  // 2. Mengambil Daftar Berita
  final postsRes = await client.posts.list(page: 1, limit: 10);
  print('Total posts: ${postsRes.total}, Loaded: ${postsRes.data.length}');

  // 3. Mengambil Daftar Bahasa yang Tersedia
  final locales = await client.locales.list();
  for (final loc in locales) {
    print('Locale: ${loc.code} (${loc.name}) - Direction: ${loc.direction}');
  }
}
```
