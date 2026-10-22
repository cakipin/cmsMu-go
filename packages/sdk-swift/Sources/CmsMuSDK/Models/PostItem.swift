import Foundation

public struct PostItem: Codable, Sendable, Identifiable {
    public let id: Int64
    public let title: String
    public let slug: String
    public let body: String?
    public let excerpt: String?
    public let category: String?
    public let tags: String?
    public let featuredImage: String?
    public let author: String?
    public let views: Int64
    public let createdAt: String
    public let updatedAt: String?

    public init(
        id: Int64,
        title: String,
        slug: String,
        body: String? = nil,
        excerpt: String? = nil,
        category: String? = nil,
        tags: String? = nil,
        featuredImage: String? = nil,
        author: String? = nil,
        views: Int64 = 0,
        createdAt: String,
        updatedAt: String? = nil
    ) {
        self.id = id
        self.title = title
        self.slug = slug
        self.body = body
        self.excerpt = excerpt
        self.category = category
        self.tags = tags
        self.featuredImage = featuredImage
        self.author = author
        self.views = views
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}
