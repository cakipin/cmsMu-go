package dev.labmu.cmsmu.sdk.models

data class SDUIBlock(
    val type: String,
    val props: Map<String, Any?> = emptyMap()
)
