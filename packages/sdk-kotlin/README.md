# cmsMu Android & Kotlin SDK

Official Kotlin & Android Client SDK for cmsMu. Provides coroutine-friendly (`suspend fun`) access to:
- 🎨 **Server-Driven UI (SDUI)**: Canvas layout blueprints for Android & Jetpack Compose.
- 🌐 **Multi-Language (i18n)**: Direction & RTL detection (`isRtl`) for Arabic and other locales.
- 📰 **Posts API**: Pagination and category filtering.

---

## 🚀 Setup

Tambahkan dependensi pada `build.gradle.kts` proyek Android / Kotlin Anda:

```kotlin
dependencies {
    implementation(project(":packages:sdk-kotlin"))
    // Atau via Maven repository jika sudah dipublish
}
```

---

## 💡 Contoh Penggunaan

```kotlin
import dev.labmu.cmsmu.sdk.CmsMuClient
import dev.labmu.cmsmu.sdk.CmsMuConfig
import kotlinx.coroutines.runBlocking

fun main() = runBlocking {
    val client = CmsMuClient(
        CmsMuConfig(
            baseUrl = "https://cms.labmu.dev",
            defaultLocale = "id"
        )
    )

    // 1. Mengambil layout Server-Driven UI (SDUI)
    val page = client.sdui.getPage(slug = "home", locale = "ar", platform = "mobile")
    println("Page: ${page.slug}, Direction: ${page.direction}, isRtl: ${page.isRtl}")

    // 2. Mengambil daftar warta / postingan
    val posts = client.posts.list(page = 1, limit = 10)
    println("Success: ${posts.success}")

    // 3. Mengambil master bahasa aktif
    val locales = client.locales.list()
    locales.forEach {
        println("Locale: ${it.code} (${it.name})")
    }
}
```
