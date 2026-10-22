package dev.labmu.cmsmu.sdk.models

data class PostsResponse(
    val success: Boolean,
    val data: List<PostItem>,
    val total: Long? = null,
    val page: Int? = null,
    val limit: Int? = null
)
