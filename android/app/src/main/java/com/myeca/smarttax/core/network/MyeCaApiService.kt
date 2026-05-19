package com.myeca.smarttax.core.network

import com.squareup.moshi.Json
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Headers
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

data class SupabasePasswordLoginRequest(
    val email: String,
    val password: String
)

data class SupabaseRefreshTokenRequest(
    @Json(name = "refresh_token") val refreshToken: String
)

data class SupabaseAuthUser(
    val id: String,
    val email: String? = null
)

data class SupabaseSessionResponse(
    @Json(name = "access_token") val accessToken: String,
    @Json(name = "refresh_token") val refreshToken: String? = null,
    @Json(name = "expires_in") val expiresIn: Long? = null,
    val user: SupabaseAuthUser? = null
)

interface SupabaseAuthService {
    @Headers("Content-Type: application/json")
    @POST("auth/v1/token?grant_type=password")
    suspend fun signInWithPassword(
        @Header("apikey") apiKey: String,
        @Body request: SupabasePasswordLoginRequest
    ): SupabaseSessionResponse

    @Headers("Content-Type: application/json")
    @POST("auth/v1/token?grant_type=refresh_token")
    suspend fun refreshToken(
        @Header("apikey") apiKey: String,
        @Body request: SupabaseRefreshTokenRequest
    ): SupabaseSessionResponse
}

data class MyeCaUser(
    val id: String,
    val email: String? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val phoneNumber: String? = null,
    val role: String? = null,
    val status: String? = null,
    val isVerified: Boolean? = null
)

data class SyncUserRequest(
    val email: String? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val phoneNumber: String? = null
)

data class AuthUserResponse(
    val user: MyeCaUser
)

data class AuthSyncResponse(
    val message: String? = null,
    val user: MyeCaUser? = null
)

data class DashboardStats(
    val totalReturns: Int? = null,
    val documentsUploaded: Int? = null,
    val profiles: Int? = null,
    val pendingTasks: Int? = null,
    val savedAmount: Double? = null
)

data class UserService(
    val id: String,
    val serviceId: String? = null,
    val serviceTitle: String? = null,
    val serviceCategory: String? = null,
    val paymentStatus: String? = null,
    val status: String? = null,
    val assignedCaName: String? = null,
    val assignedCaEmail: String? = null
)

data class DashboardResponse(
    val success: Boolean? = null,
    val stats: DashboardStats? = null,
    val activeServices: List<UserService> = emptyList()
)

data class DocumentItem(
    val id: String,
    val name: String? = null,
    val category: String? = null,
    val originalName: String? = null,
    val size: Long? = null,
    val status: String? = null,
    val year: String? = null
)

data class DocumentsResponse(
    val documents: List<DocumentItem> = emptyList()
)

data class CreateUserServiceMetadata(
    val requestDescription: String? = null,
    val source: String = "native_android",
    val requestedAt: String? = null,
    val originalServicePath: String? = null
)

data class CreateUserServiceRequest(
    val serviceId: String,
    val serviceTitle: String,
    val serviceCategory: String,
    val profileId: String? = null,
    val paymentAmount: String? = null,
    val metadata: CreateUserServiceMetadata? = null
)

data class PaymentLinkRequest(
    val userServiceId: String,
    val note: String? = null
)

data class BasicApiResponse(
    val success: Boolean? = null,
    val id: String? = null,
    val message: String? = null
)

data class ConsultationRequest(
    val name: String,
    val phone: String = "",
    val email: String,
    val gstin: String = "",
    val company: String = "",
    val service: String,
    val turnover: String = "",
    val preferredTime: String = "Call now",
    val message: String,
    val source: String = "native_android"
)

interface MyeCaApiService {
    @Headers("Content-Type: application/json")
    @POST("api/v1/auth/sync")
    suspend fun syncAuth(
        @Header("Authorization") authorization: String,
        @Body request: SyncUserRequest
    ): AuthSyncResponse

    @GET("api/v1/auth/me")
    suspend fun currentUser(@Header("Authorization") authorization: String): AuthUserResponse

    @GET("api/user/dashboard")
    suspend fun dashboard(@Header("Authorization") authorization: String): DashboardResponse

    @GET("api/user-services")
    suspend fun userServices(@Header("Authorization") authorization: String): List<UserService>

    @Headers("Content-Type: application/json")
    @POST("api/user-services")
    suspend fun createUserService(
        @Header("Authorization") authorization: String,
        @Body request: CreateUserServiceRequest
    ): BasicApiResponse

    @GET("api/documents")
    suspend fun documents(@Header("Authorization") authorization: String): DocumentsResponse

    @Multipart
    @POST("api/documents/upload")
    suspend fun uploadDocument(
        @Header("Authorization") authorization: String,
        @Part file: MultipartBody.Part,
        @Part("name") name: RequestBody,
        @Part("category") category: RequestBody,
        @Part("year") year: RequestBody,
        @Part("description") description: RequestBody
    ): BasicApiResponse

    @Headers("Content-Type: application/json")
    @POST("api/payments/request-link")
    suspend fun requestPaymentLink(
        @Header("Authorization") authorization: String,
        @Body request: PaymentLinkRequest
    ): BasicApiResponse

    @Headers("Content-Type: application/json")
    @POST("api/consultation-requests")
    suspend fun requestConsultation(@Body request: ConsultationRequest): BasicApiResponse
}
