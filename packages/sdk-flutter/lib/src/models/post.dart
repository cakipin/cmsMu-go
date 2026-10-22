/// Model postingan / artikel cmsMu
class PostItem {
  final int id;
  final String title;
  final String slug;
  final String? body;
  final String? excerpt;
  final String? category;
  final String? tags;
  final String? featuredImage;
  final String? author;
  final int views;
  final String createdAt;
  final String? updatedAt;

  const PostItem({
    required this.id,
    required this.title,
    required this.slug,
    this.body,
    this.excerpt,
    this.category,
    this.tags,
    this.featuredImage,
    this.author,
    this.views = 0,
    required this.createdAt,
    this.updatedAt,
  });

  factory PostItem.fromJson(Map<String, dynamic> json) {
    return PostItem(
      id: json['id'] is int ? json['id'] as int : int.tryParse('${json['id']}') ?? 0,
      title: json['title'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      body: json['body'] as String?,
      excerpt: json['excerpt'] as String?,
      category: json['category'] as String?,
      tags: json['tags'] as String?,
      featuredImage: json['featuredImage'] as String?,
      author: json['author'] as String?,
      views: json['views'] is int ? json['views'] as int : int.tryParse('${json['views']}') ?? 0,
      createdAt: json['createdAt'] as String? ?? '',
      updatedAt: json['updatedAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'slug': slug,
      'body': body,
      'excerpt': excerpt,
      'category': category,
      'tags': tags,
      'featuredImage': featuredImage,
      'author': author,
      'views': views,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}

/// Response list postingan dengan meta paginasi
class PostsResponse {
  final bool success;
  final List<PostItem> data;
  final int? total;
  final int? page;
  final int? limit;

  const PostsResponse({
    required this.success,
    required this.data,
    this.total,
    this.page,
    this.limit,
  });

  factory PostsResponse.fromJson(Map<String, dynamic> json) {
    final list = json['data'] as List<dynamic>? ?? [];
    return PostsResponse(
      success: json['success'] as bool? ?? false,
      data: list.map((item) => PostItem.fromJson(item as Map<String, dynamic>)).toList(),
      total: json['total'] as int?,
      page: json['page'] as int?,
      limit: json['limit'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'data': data.map((e) => e.toJson()).toList(),
      'total': total,
      'page': page,
      'limit': limit,
    };
  }
}
