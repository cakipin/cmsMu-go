import Foundation

public struct LocaleItem: Codable, Sendable, Identifiable {
    public var id: String { code }
    public let code: String
    public let name: String
    public let direction: String
    public let isDefault: Int
    public let isActive: Int

    public var isRtl: Bool {
        direction.lowercased() == "rtl"
    }

    public init(
        code: String,
        name: String,
        direction: String,
        isDefault: Int = 0,
        isActive: Int = 1
    ) {
        self.code = code
        self.name = name
        self.direction = direction
        self.isDefault = isDefault
        self.isActive = isActive
    }
}
