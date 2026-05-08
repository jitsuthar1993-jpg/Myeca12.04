package `in`.myeca.mobile.data.network

import `in`.myeca.mobile.BuildConfig

object ApiConfig {
    val baseUrl: String = BuildConfig.MYECA_API_BASE_URL.ensureTrailingSlash()
}

private fun String.ensureTrailingSlash(): String = if (endsWith("/")) this else "$this/"
