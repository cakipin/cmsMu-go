/// Blok Server-Driven UI (SDUI) kanvas cmsMu
class SDUIBlock {
  final String type;
  final Map<String, dynamic> props;

  const SDUIBlock({
    required this.type,
    required this.props,
  });

  factory SDUIBlock.fromJson(Map<String, dynamic> json) {
    return SDUIBlock(
      type: json['type'] as String? ?? 'GenericBlock',
      props: json['props'] is Map<String, dynamic>
          ? json['props'] as Map<String, dynamic>
          : <String, dynamic>{},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'props': props,
    };
  }
}

/// Halaman Server-Driven UI (SDUI) kanvas cmsMu
class SDUIPage {
  final bool success;
  final String slug;
  final String locale;
  final String direction;
  final List<String> availableLocales;
  final List<SDUIBlock> content;
  final Map<String, List<SDUIBlock>>? zones;

  const SDUIPage({
    required this.success,
    required this.slug,
    required this.locale,
    required this.direction,
    required this.availableLocales,
    required this.content,
    this.zones,
  });

  bool get isRtl => direction.toLowerCase() == 'rtl';

  factory SDUIPage.fromJson(Map<String, dynamic> json) {
    final contentRaw = json['content'] as List<dynamic>? ?? [];
    final contentList = contentRaw
        .map((b) => SDUIBlock.fromJson(b as Map<String, dynamic>))
        .toList();

    final localesRaw = json['availableLocales'] as List<dynamic>? ?? [];
    final localesList = localesRaw.map((e) => e.toString()).toList();

    Map<String, List<SDUIBlock>>? parsedZones;
    if (json['zones'] is Map<String, dynamic>) {
      parsedZones = {};
      (json['zones'] as Map<String, dynamic>).forEach((key, val) {
        if (val is List) {
          parsedZones![key] = val
              .map((b) => SDUIBlock.fromJson(b as Map<String, dynamic>))
              .toList();
        }
      });
    }

    return SDUIPage(
      success: json['success'] as bool? ?? false,
      slug: json['slug'] as String? ?? '',
      locale: json['locale'] as String? ?? 'id',
      direction: json['direction'] as String? ?? 'ltr',
      availableLocales: localesList,
      content: contentList,
      zones: parsedZones,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'slug': slug,
      'locale': locale,
      'direction': direction,
      'availableLocales': availableLocales,
      'content': content.map((e) => e.toJson()).toList(),
      if (zones != null)
        'zones': zones!.map((k, v) => MapEntry(k, v.map((e) => e.toJson()).toList())),
    };
  }
}
