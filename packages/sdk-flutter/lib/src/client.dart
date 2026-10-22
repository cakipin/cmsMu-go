import 'dart:convert';
import 'package:http/http.dart' as http;
import 'models/locale.dart';
import 'models/post.dart';
import 'models/sdui.dart';

/// Konfigurasi klien cmsMu
class CmsMuConfig {
  final String baseUrl;
  final String? token;
  final String defaultLocale;
  final Duration timeout;

  const CmsMuConfig({
    required this.baseUrl,
    this.token,
    this.defaultLocale = 'id',
    this.timeout = const Duration(seconds: 15),
  });
}

/// Service Server-Driven UI (SDUI)
class SduiService {
  final CmsMuClient _client;
  SduiService(this._client);

  /// Mengambil halaman SDUI berdasarkan slug kanvas
  Future<SDUIPage> getPage(
    String slug, {
    String? locale,
    String? platform,
  }) async {
    final queryParams = <String, String>{
      'locale': locale ?? _client.config.defaultLocale,
      if (platform != null) 'platform': platform,
    };

    final uri = Uri.parse('${_client.sanitizedBaseUrl}/api/theme-editor/sdui/${Uri.encodeComponent(slug)}')
        .replace(queryParameters: queryParams);

    final res = await _client.requestJson(uri);
    return SDUIPage.fromJson(res);
  }
}

/// Service Postingan & Warta Berita
class PostsService {
  final CmsMuClient _client;
  PostsService(this._client);

  /// Mengambil daftar postingan dengan paginasi dan filter
  Future<PostsResponse> list({
    int? page,
    int? limit,
    String? category,
    String? locale,
  }) async {
    final queryParams = <String, String>{
      if (page != null) 'page': '$page',
      if (limit != null) 'limit': '$limit',
      if (category != null) 'category': category,
      if (locale != null) 'locale': locale,
    };

    final uri = Uri.parse('${_client.sanitizedBaseUrl}/api/posts')
        .replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);

    final res = await _client.requestJson(uri);
    return PostsResponse.fromJson(res);
  }

  /// Mengambil detail postingan berdasarkan slug
  Future<PostItem> get(
    String slug, {
    String? locale,
  }) async {
    final queryParams = <String, String>{
      if (locale != null) 'locale': locale,
    };

    final uri = Uri.parse('${_client.sanitizedBaseUrl}/api/posts/${Uri.encodeComponent(slug)}')
        .replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);

    final res = await _client.requestJson(uri);
    final data = res['data'] is Map<String, dynamic> ? res['data'] as Map<String, dynamic> : res;
    return PostItem.fromJson(data);
  }
}

/// Service Bahasa & Lokalisasi
class LocalesService {
  final CmsMuClient _client;
  LocalesService(this._client);

  /// Mengambil daftar bahasa aktif dari cmsMu
  Future<List<LocaleItem>> list() async {
    final uri = Uri.parse('${_client.sanitizedBaseUrl}/api/theme-editor/locales');
    final res = await _client.requestJson(uri);
    final list = res['data'] as List<dynamic>? ?? [];
    return list.map((item) => LocaleItem.fromJson(item as Map<String, dynamic>)).toList();
  }
}

/// Klien resmi cmsMu untuk aplikasi Flutter & Dart
class CmsMuClient {
  final CmsMuConfig config;
  final http.Client _httpClient;
  final bool _isCustomClient;

  late final SduiService sdui;
  late final PostsService posts;
  late final LocalesService locales;

  CmsMuClient(
    this.config, {
    http.Client? httpClient,
  })  : _httpClient = httpClient ?? http.Client(),
        _isCustomClient = httpClient != null {
    sdui = SduiService(this);
    posts = PostsService(this);
    locales = LocalesService(this);
  }

  String get sanitizedBaseUrl {
    var url = config.baseUrl.trim();
    while (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
    return url;
  }

  Map<String, String> _buildHeaders() {
    final headers = <String, String>{
      'Accept': 'application/json',
    };
    if (config.token != null && config.token!.isNotEmpty) {
      headers['Authorization'] = 'Bearer ${config.token}';
    }
    return headers;
  }

  Future<Map<String, dynamic>> requestJson(Uri uri) async {
    final response = await _httpClient
        .get(uri, headers: _buildHeaders())
        .timeout(config.timeout);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      var message = 'HTTP ${response.statusCode}';
      try {
        final err = jsonDecode(response.body);
        if (err is Map && (err['message'] != null || err['error'] != null)) {
          message = '${err['message'] ?? err['error']}';
        }
      } catch (_) {}
      throw Exception('[cmsMu SDK Flutter] Request gagal: $message');
    }

    final decoded = jsonDecode(utf8.decode(response.bodyBytes));
    if (decoded is! Map<String, dynamic>) {
      throw Exception('[cmsMu SDK Flutter] Format respon tidak valid (harus objek JSON)');
    }
    return decoded;
  }

  void dispose() {
    if (!_isCustomClient) {
      _httpClient.close();
    }
  }
}
