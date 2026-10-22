package dev.labmu.cmsmu.sdk.models

data class SDUIPage(
    val success: Boolean,
    val slug: String,
    val locale: String,
    val direction: String,
    val availableLocales: List<String>,
    val content: List<SDUIBlock>,
    val zones: Map<String, List<SDUIBlock>>? = null
) {
    val isRtl: Boolean
        get() = direction.equals("rtl", ignoreCase = true)
}
