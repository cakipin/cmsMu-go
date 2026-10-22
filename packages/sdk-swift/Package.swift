// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CmsMuSDK",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .watchOS(.v8),
        .tvOS(.v15)
    ],
    products: [
        .library(
            name: "CmsMuSDK",
            targets: ["CmsMuSDK"]
        ),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "CmsMuSDK",
            dependencies: []
        ),
        .testTarget(
            name: "CmsMuSDKTests",
            dependencies: ["CmsMuSDK"]
        ),
    ]
)
