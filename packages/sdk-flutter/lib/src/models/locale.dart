/// Model bahasa yang didukung cmsMu
class LocaleItem {
  final String code;
  final String name;
  final String direction;
  final int isDefault;
  final int isActive;

  const LocaleItem({
    required this.code,
    required this.name,
    required this.direction,
    required this.isDefault,
    this.isActive = 1,
  });

  bool get isRtl => direction.toLowerCase() == 'rtl';

  factory LocaleItem.fromJson(Map<String, dynamic> json) {
    return LocaleItem(
      code: json['code'] as String? ?? 'id',
      name: json['name'] as String? ?? '',
      direction: json['direction'] as String? ?? 'ltr',
      isDefault: json['isDefault'] as int? ?? 0,
      isActive: json['isActive'] as int? ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'name': name,
      'direction': direction,
      'isDefault': isDefault,
      'isActive': isActive,
    };
  }
}
