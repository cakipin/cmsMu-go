# CmsMuSDK (Apple iOS & macOS Swift)

Official Apple Swift Client SDK for cmsMu. Built for iOS 15+, macOS 12+, SwiftUI, and modern Swift Concurrency (`async/await`).

Features:
- 🎨 **Server-Driven UI (SDUI)**: Canvas layout blueprints ready to decode and render in SwiftUI.
- 🌐 **Multi-Language (i18n)**: Direction & RTL detection (`isRtl`) for Arabic and other locales.
- 📰 **Posts API**: Type-safe pagination and query filters with zero external dependencies.

---

## 🚀 Instalasi via Swift Package Manager (SPM)

Tambahkan dependensi paket pada `Package.swift` proyek iOS / macOS Anda:

```swift
dependencies: [
    .package(path: "../packages/sdk-swift") // Atau via Git URL repository
]
```

Atau di Xcode: `File` > `Add Package Dependencies...` > Masukkan path repository `CmsMuSDK`.

---

## 💡 Contoh Penggunaan

```swift
import SwiftUI
import CmsMuSDK

@main
struct MyApp: App {
    let client = CmsMuClient(
        config: CmsMuConfig(
            baseUrl: "https://cms.labmu.dev",
            defaultLocale: "id"
        )
    )

    var body: some Scene {
        WindowGroup {
            ContentView()
                .task {
                    do {
                        // 1. Mengambil layout Server-Driven UI (SDUI)
                        let page = try await client.sdui.getPage(slug: "home", locale: "ar", platform: "mobile")
                        print("Page: \(page.slug), RTL: \(page.isRtl)")

                        // 2. Mengambil daftar postingan warta
                        let posts = try await client.posts.list(page: 1, limit: 10)
                        print("Total: \(posts.total ?? 0), Posts: \(posts.data.count)")

                        // 3. Mengambil master bahasa aktif
                        let locales = try await client.locales.list()
                        for loc in locales {
                            print("Locale: \(loc.code) (\(loc.name)) - isRtl: \(loc.isRtl)")
                        }
                    } catch {
                        print("Error: \(error.localizedDescription)")
                    }
                }
        }
    }
}
```
