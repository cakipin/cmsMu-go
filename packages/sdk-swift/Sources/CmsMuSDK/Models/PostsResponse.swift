import Foundation

public struct PostsResponse: Codable, Sendable {
    public let success: Bool
    public let data: [PostItem]
    public let total: Int?
    public let page: Int?
    public let limit: Int?

    public init(
        success: Bool,
        data: [PostItem],
        total: Int? = nil,
        page: Int? = nil,
        limit: Int? = nil
    ) {
        self.success = success
        self.data = data
        self.total = total
        self.page = page
        self.limit = limit
    }
}
