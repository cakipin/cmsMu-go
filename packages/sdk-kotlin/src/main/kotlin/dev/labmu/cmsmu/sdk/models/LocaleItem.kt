package dev.labmu.cmsmu.sdk.models

data class LocaleItem(
    val code: String,
    val name: String,
    val direction: String,
    val isDefault: Int,
    val isActive: Int = 1
) {
    val isRtl: Boolean
        get() = direction.equals("rtl", ignoreCase = true)
}
