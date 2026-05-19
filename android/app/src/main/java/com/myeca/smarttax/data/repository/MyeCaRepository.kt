package com.myeca.smarttax.data.repository

import android.content.Context
import android.content.SharedPreferences
import android.net.Uri
import android.provider.OpenableColumns
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import com.myeca.smarttax.BuildConfig
import com.myeca.smarttax.core.network.BasicApiResponse
import com.myeca.smarttax.core.network.ConsultationRequest
import com.myeca.smarttax.core.network.CreateUserServiceMetadata
import com.myeca.smarttax.core.network.CreateUserServiceRequest
import com.myeca.smarttax.core.network.DashboardResponse
import com.myeca.smarttax.core.network.DocumentItem
import com.myeca.smarttax.core.network.MyeCaUser
import com.myeca.smarttax.core.network.NetworkModule
import com.myeca.smarttax.core.network.PaymentLinkRequest
import com.myeca.smarttax.core.network.SupabasePasswordLoginRequest
import com.myeca.smarttax.core.network.SupabaseRefreshTokenRequest
import com.myeca.smarttax.core.network.SupabaseSessionResponse
import com.myeca.smarttax.core.network.SyncUserRequest
import com.myeca.smarttax.core.network.UserService
import com.myeca.smarttax.ui.app.MyeCaServiceCatalogItem
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

data class AppSession(
    val token: String,
    val user: MyeCaUser
)

internal const val MAX_DOCUMENT_UPLOAD_BYTES = 10L * 1024L * 1024L

internal val acceptedDocumentMimeTypes = setOf(
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
)

private val documentMimeTypesByExtension = mapOf(
    "pdf" to "application/pdf",
    "jpg" to "image/jpeg",
    "jpeg" to "image/jpeg",
    "png" to "image/png",
    "doc" to "application/msword",
    "docx" to "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xls" to "application/vnd.ms-excel",
    "xlsx" to "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
)

internal fun documentMimeTypeFromName(fileName: String): String? {
    return documentMimeTypesByExtension[fileName.substringAfterLast('.', "").lowercase(Locale.US)]
}

internal fun isAcceptedDocumentMimeType(mimeType: String): Boolean = mimeType in acceptedDocumentMimeTypes

private data class DocumentFileMeta(
    val name: String?,
    val size: Long?
)

class MyeCaRepository(context: Context) {
    private val appContext = context.applicationContext
    private val sessionStore = createSessionStore(appContext)
    private val api = NetworkModule.myeCaApi
    private val auth = NetworkModule.supabaseAuth

    fun savedToken(): String? = sessionStore.getString(KEY_ACCESS_TOKEN)

    suspend fun restoreSession(): AppSession? {
        val token = savedToken() ?: return null
        return runCatching { appSessionForToken(token) }
            .recoverCatching {
                val refreshToken = sessionStore.getString(KEY_REFRESH_TOKEN) ?: throw it
                val refreshed = auth.refreshToken(
                    apiKey = BuildConfig.SUPABASE_ANON_KEY,
                    request = SupabaseRefreshTokenRequest(refreshToken = refreshToken)
                )
                persistSession(refreshed)
                appSessionForToken(refreshed.accessToken)
            }.getOrElse {
                clearSession()
                null
            }
    }

    suspend fun signIn(email: String, password: String): AppSession {
        val session = auth.signInWithPassword(
            apiKey = BuildConfig.SUPABASE_ANON_KEY,
            request = SupabasePasswordLoginRequest(email = email, password = password)
        )
        val token = session.accessToken
        persistSession(session)

        api.syncAuth(
            authorization = bearer(token),
            request = SyncUserRequest(email = session.user?.email ?: email)
        )
        val user = api.currentUser(bearer(token)).user
        return AppSession(token = token, user = user)
    }

    fun clearSession() {
        sessionStore.clear()
    }

    suspend fun dashboard(token: String): DashboardResponse = api.dashboard(bearer(token))

    suspend fun userServices(token: String): List<UserService> = api.userServices(bearer(token))

    suspend fun documents(token: String): List<DocumentItem> = api.documents(bearer(token)).documents

    suspend fun createServiceRequest(token: String, item: MyeCaServiceCatalogItem): BasicApiResponse {
        return api.createUserService(
            authorization = bearer(token),
            request = CreateUserServiceRequest(
                serviceId = item.id,
                serviceTitle = item.title,
                serviceCategory = item.category,
                paymentAmount = item.price,
                metadata = CreateUserServiceMetadata(
                    requestDescription = "Requested from the native Android app.",
                    requestedAt = utcNow(),
                    originalServicePath = item.path
                )
            )
        )
    }

    suspend fun requestPaymentLink(token: String, serviceId: String): BasicApiResponse {
        return api.requestPaymentLink(
            authorization = bearer(token),
            request = PaymentLinkRequest(
                userServiceId = serviceId,
                note = "Requested from the native Android app."
            )
        )
    }

    suspend fun uploadDocument(token: String, uri: Uri): BasicApiResponse = withContext(Dispatchers.IO) {
        val fileMeta = queryFileMeta(uri)
        if ((fileMeta.size ?: 0L) > MAX_DOCUMENT_UPLOAD_BYTES) {
            throw IllegalArgumentException("Choose a file up to 10 MB.")
        }

        val fileName = fileMeta.name ?: "myeca-document-${System.currentTimeMillis()}"
        val mimeType = appContext.contentResolver.getType(uri)
            ?: documentMimeTypeFromName(fileName)
            ?: "application/octet-stream"
        if (!isAcceptedDocumentMimeType(mimeType)) {
            throw IllegalArgumentException("Choose a PDF, image, Word, or Excel file.")
        }

        val bytes = appContext.contentResolver.openInputStream(uri)?.use { it.readBytes() }
            ?: throw IllegalArgumentException("Unable to read selected document.")
        if (bytes.size > MAX_DOCUMENT_UPLOAD_BYTES) {
            throw IllegalArgumentException("Choose a file up to 10 MB.")
        }
        val fileBody = bytes.toRequestBody(mimeType.toMediaType())
        val filePart = MultipartBody.Part.createFormData("file", fileName, fileBody)

        api.uploadDocument(
            authorization = bearer(token),
            file = filePart,
            name = textBody(fileName),
            category = textBody("other"),
            year = textBody("2025-26"),
            description = textBody("Uploaded from the native Android app.")
        )
    }

    suspend fun requestConsultation(name: String, email: String, message: String): BasicApiResponse {
        return api.requestConsultation(
            ConsultationRequest(
                name = name,
                email = email,
                service = "Android app callback",
                message = message
            )
        )
    }

    private suspend fun appSessionForToken(token: String): AppSession {
        return AppSession(token = token, user = api.currentUser(bearer(token)).user)
    }

    private fun persistSession(session: SupabaseSessionResponse) {
        sessionStore.save(
            accessToken = session.accessToken,
            refreshToken = session.refreshToken
        )
    }

    private fun queryFileMeta(uri: Uri): DocumentFileMeta {
        val cursor = appContext.contentResolver.query(uri, null, null, null, null)
            ?: return DocumentFileMeta(name = null, size = null)
        return cursor.use {
            if (!it.moveToFirst()) return@use DocumentFileMeta(name = null, size = null)
            val nameIndex = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            val sizeIndex = it.getColumnIndex(OpenableColumns.SIZE)
            DocumentFileMeta(
                name = if (nameIndex >= 0) it.getString(nameIndex) else null,
                size = if (sizeIndex >= 0) it.getLong(sizeIndex) else null
            )
        }
    }

    private fun bearer(token: String) = "Bearer $token"

    private fun textBody(value: String) = value.toRequestBody("text/plain".toMediaType())

    private fun utcNow(): String {
        return SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }.format(Date())
    }

    internal companion object {
        const val LEGACY_SESSION_PREFS_NAME = "myeca_native_session"
        const val SECURE_SESSION_PREFS_NAME = "myeca_native_session_secure"
        const val KEY_ACCESS_TOKEN = "access_token"
        const val KEY_REFRESH_TOKEN = "refresh_token"
    }
}

private interface SessionStore {
    fun getString(key: String): String?
    fun save(accessToken: String, refreshToken: String?)
    fun clear()
}

private class SharedPreferencesSessionStore(
    private val prefs: SharedPreferences,
    private val legacyPrefs: SharedPreferences
) : SessionStore {
    override fun getString(key: String): String? = prefs.getString(key, null)

    override fun save(accessToken: String, refreshToken: String?) {
        prefs.edit()
            .putString(MyeCaRepository.KEY_ACCESS_TOKEN, accessToken)
            .apply {
                if (refreshToken != null) {
                    putString(MyeCaRepository.KEY_REFRESH_TOKEN, refreshToken)
                }
            }
            .apply()
    }

    override fun clear() {
        prefs.edit().clear().apply()
        legacyPrefs.edit().clear().apply()
    }
}

private class MemorySessionStore : SessionStore {
    private val values = mutableMapOf<String, String>()

    override fun getString(key: String): String? = values[key]

    override fun save(accessToken: String, refreshToken: String?) {
        values[MyeCaRepository.KEY_ACCESS_TOKEN] = accessToken
        if (refreshToken != null) {
            values[MyeCaRepository.KEY_REFRESH_TOKEN] = refreshToken
        }
    }

    override fun clear() {
        values.clear()
    }
}

private fun createSessionStore(context: Context): SessionStore {
    val legacyPrefs = context.getSharedPreferences(MyeCaRepository.LEGACY_SESSION_PREFS_NAME, Context.MODE_PRIVATE)
    return runCatching {
        val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)
        val securePrefs = EncryptedSharedPreferences.create(
            MyeCaRepository.SECURE_SESSION_PREFS_NAME,
            masterKeyAlias,
            context,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
        migrateLegacySession(legacyPrefs, securePrefs)
        SharedPreferencesSessionStore(securePrefs, legacyPrefs)
    }.getOrElse {
        legacyPrefs.edit().clear().apply()
        MemorySessionStore()
    }
}

private fun migrateLegacySession(legacyPrefs: SharedPreferences, securePrefs: SharedPreferences) {
    val hasSecureToken = securePrefs.contains(MyeCaRepository.KEY_ACCESS_TOKEN)
    val legacyAccessToken = legacyPrefs.getString(MyeCaRepository.KEY_ACCESS_TOKEN, null)
    if (!hasSecureToken && legacyAccessToken != null) {
        securePrefs.edit()
            .putString(MyeCaRepository.KEY_ACCESS_TOKEN, legacyAccessToken)
            .apply {
                val legacyRefreshToken = legacyPrefs.getString(MyeCaRepository.KEY_REFRESH_TOKEN, null)
                if (legacyRefreshToken != null) {
                    putString(MyeCaRepository.KEY_REFRESH_TOKEN, legacyRefreshToken)
                }
            }
            .apply()
    }
    legacyPrefs.edit().clear().apply()
}
