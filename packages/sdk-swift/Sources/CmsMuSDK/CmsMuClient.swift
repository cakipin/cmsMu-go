import Foundation

public struct CmsMuConfig: Sendable {
    public let baseUrl: String
    public let token: String?
    public let defaultLocale: String

    public init(
        baseUrl: String,
        token: String? = nil,
        defaultLocale: String = "id"
    ) {
        self.baseUrl = baseUrl
        self.token = token
        self.defaultLocale = defaultLocale
    }
}

public final class CmsMuClient: Sendable {
    public let config: CmsMuConfig
    public let session: URLSession

    public var sanitizedBaseUrl: String {
        var url = config.baseUrl.trimmingCharacters(in: .whitespacesAndNewlines)
        while url.hasSuffix("/") {
            url.removeLast()
        }
        return url
    }

    public lazy var sdui: SduiService = SduiService(client: self)
    public lazy var posts: PostsService = PostsService(client: self)
    public lazy var locales: LocalesService = LocalesService(client: self)

    public init(config: CmsMuConfig, session: URLSession = .shared) {
        self.config = config
        self.session = session
    }

    private func createRequest(path: String, queryItems: [URLQueryItem]? = nil) throws -> URLRequest {
        guard var components = URLComponents(string: "\(sanitizedBaseUrl)\(path.hasPrefix("/") ? path : "/\(path)")") else {
            throw URLError(.badURL)
        }
        if let queryItems = queryItems, !queryItems.isEmpty {
            components.queryItems = queryItems
        }
        guard let url = components.url else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if let token = config.token, !token.isEmpty {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        return request
    }

    fileprivate func fetch<T: Decodable>(_ type: T.Type, path: String, queryItems: [URLQueryItem]? = nil) async throws -> T {
        let request = try createRequest(path: path, queryItems: queryItems)
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            var errorMessage = "HTTP \(httpResponse.statusCode)"
            if let errorObj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let msg = errorObj["message"] as? String ?? errorObj["error"] as? String {
                errorMessage = msg
            }
            throw NSError(
                domain: "CmsMuSDK",
                code: httpResponse.statusCode,
                userInfo: [NSLocalizedDescriptionKey: "[cmsMu SDK Swift] Request error: \(errorMessage)"]
            )
        }

        let decoder = JSONDecoder()
        return try decoder.decode(T.self, from: data)
    }
}

// MARK: - SDUI Service
public final class SduiService: Sendable {
    private let client: CmsMuClient
    fileprivate init(client: CmsMuClient) {
        self.client = client
    }

    public func getPage(
        slug: String,
        locale: String? = nil,
        platform: String? = nil
    ) async throws -> SDUIPage {
        var queryItems = [
            URLQueryItem(name: "locale", value: locale ?? client.config.defaultLocale)
        ]
        if let platform = platform {
            queryItems.append(URLQueryItem(name: "platform", value: platform))
        }

        let encodedSlug = slug.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? slug
        return try await client.fetch(
            SDUIPage.self,
            path: "/api/theme-editor/sdui/\(encodedSlug)",
            queryItems: queryItems
        )
    }
}

// MARK: - Posts Service
public final class PostsService: Sendable {
    private let client: CmsMuClient
    fileprivate init(client: CmsMuClient) {
        self.client = client
    }

    public func list(
        page: Int? = nil,
        limit: Int? = nil,
        category: String? = nil,
        locale: String? = nil
    ) async throws -> PostsResponse {
        var queryItems: [URLQueryItem] = []
        if let page = page { queryItems.append(URLQueryItem(name: "page", value: "\(page)")) }
        if let limit = limit { queryItems.append(URLQueryItem(name: "limit", value: "\(limit)")) }
        if let category = category { queryItems.append(URLQueryItem(name: "category", value: category)) }
        if let locale = locale { queryItems.append(URLQueryItem(name: "locale", value: locale)) }

        return try await client.fetch(
            PostsResponse.self,
            path: "/api/posts",
            queryItems: queryItems.isEmpty ? nil : queryItems
        )
    }

    public func get(slug: String, locale: String? = nil) async throws -> PostItem {
        var queryItems: [URLQueryItem] = []
        if let locale = locale { queryItems.append(URLQueryItem(name: "locale", value: locale)) }

        struct SinglePostWrapper: Decodable {
            let success: Bool
            let data: PostItem
        }

        let encodedSlug = slug.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? slug
        let res = try await client.fetch(
            SinglePostWrapper.self,
            path: "/api/posts/\(encodedSlug)",
            queryItems: queryItems.isEmpty ? nil : queryItems
        )
        return res.data
    }
}

// MARK: - Locales Service
public final class LocalesService: Sendable {
    private let client: CmsMuClient
    fileprivate init(client: CmsMuClient) {
        self.client = client
    }

    public func list() async throws -> [LocaleItem] {
        struct LocalesWrapper: Decodable {
            let success: Bool
            let data: [LocaleItem]
        }

        let res = try await client.fetch(LocalesWrapper.self, path: "/api/theme-editor/locales")
        return res.data
    }
}
