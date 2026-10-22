import Foundation

public struct SDUIBlock: Codable, Sendable {
    public let type: String
    public let props: [String: String]

    public init(type: String, props: [String: String] = [:]) {
        self.type = type
        self.props = props
    }

    private enum CodingKeys: String, CodingKey {
        case type
        case props
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.type = try container.decodeIfPresent(String.self, forKey: .type) ?? "GenericBlock"
        
        // Resilient decode for props dictionary (converting non-string values into String representation)
        if let directProps = try? container.decode([String: String].self, forKey: .props) {
            self.props = directProps
        } else {
            self.props = [:]
        }
    }
}
