package com.myeca.smarttax

import com.myeca.smarttax.core.network.MyeCaApiService
import com.myeca.smarttax.core.network.SupabaseAuthService
import com.myeca.smarttax.core.network.httpLoggingLevelFor
import okhttp3.logging.HttpLoggingInterceptor
import org.junit.Assert.assertEquals
import org.junit.Test
import retrofit2.http.GET
import retrofit2.http.POST

class MyeCaNetworkConfigTest {
    @Test
    fun `http logging is enabled only for debug builds`() {
        assertEquals(HttpLoggingInterceptor.Level.BASIC, httpLoggingLevelFor(debug = true))
        assertEquals(HttpLoggingInterceptor.Level.NONE, httpLoggingLevelFor(debug = false))
    }

    @Test
    fun `native app uses production API base urls`() {
        assertEquals("https://myeca.in/", BuildConfig.MYECA_API_BASE_URL)
        assertEquals("https://vedumlohmacaghuebduy.supabase.co/", BuildConfig.SUPABASE_URL)
    }

    @Test
    fun `mye ca api service keeps approved endpoint paths`() {
        assertEquals("api/v1/auth/sync", postPath<MyeCaApiService>("syncAuth"))
        assertEquals("api/v1/auth/me", getPath<MyeCaApiService>("currentUser"))
        assertEquals("api/user/dashboard", getPath<MyeCaApiService>("dashboard"))
        assertEquals("api/user-services", getPath<MyeCaApiService>("userServices"))
        assertEquals("api/user-services", postPath<MyeCaApiService>("createUserService"))
        assertEquals("api/documents", getPath<MyeCaApiService>("documents"))
        assertEquals("api/documents/upload", postPath<MyeCaApiService>("uploadDocument"))
        assertEquals("api/payments/request-link", postPath<MyeCaApiService>("requestPaymentLink"))
        assertEquals("api/consultation-requests", postPath<MyeCaApiService>("requestConsultation"))
    }

    @Test
    fun `supabase auth service keeps password and refresh endpoints`() {
        assertEquals("auth/v1/token?grant_type=password", postPath<SupabaseAuthService>("signInWithPassword"))
        assertEquals("auth/v1/token?grant_type=refresh_token", postPath<SupabaseAuthService>("refreshToken"))
    }

    private inline fun <reified T> getPath(methodName: String): String {
        return method<T>(methodName).getAnnotation(GET::class.java)?.value.orEmpty()
    }

    private inline fun <reified T> postPath(methodName: String): String {
        return method<T>(methodName).getAnnotation(POST::class.java)?.value.orEmpty()
    }

    private inline fun <reified T> method(methodName: String) =
        T::class.java.declaredMethods.single { it.name == methodName }
}
