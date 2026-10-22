import Foundation

public struct SDUIPage: Codable, Sendable {
    public let success: Bool
    public let slug: String
    public let locale: String
    public let direction: String
    public let availableLocales: [String]
    public let content: [SDUIBlock]

    public var isRtl: Bool {
        direction.lowercased() == "rtl"
    }

    public init(
        success: Bool,
        slug: String,
        locale: String,
        direction: String,
        availableLocales: [String] = [],
        content: [SDUIBlock] = []
    ) {
        self.success = success
        self.slug = slug
        self.locale = locale
        self.direction = direction
        self.availableLocales = availableLocales
        self.content = content
    }
}
