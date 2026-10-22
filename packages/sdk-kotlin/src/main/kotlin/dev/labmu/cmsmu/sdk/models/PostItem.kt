package dev.labmu.cmsmu.sdk.models

data class PostItem(
    val id: Long,
    val title: String,
    val slug: String,
    val body: String? = null,
    val excerpt: String? = null,
    val category: String? = null,
    val tags: String? = null,
    val featuredImage: String? = null,
    val author: String? = null,
    val views: Long = 0,
    val createdAt: String,
    val updatedAt: String? = null
)
