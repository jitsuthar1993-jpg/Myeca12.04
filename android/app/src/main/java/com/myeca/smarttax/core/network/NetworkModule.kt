package com.myeca.smarttax.core.network

import com.myeca.smarttax.BuildConfig
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit

object NetworkModule {
    private val moshi: Moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    private val logging: HttpLoggingInterceptor = HttpLoggingInterceptor().apply {
        level = httpLoggingLevelFor(BuildConfig.DEBUG)
    }

    private val okHttpClient: OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(logging)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    private fun retrofit(baseUrl: String): Retrofit = Retrofit.Builder()
        .baseUrl(baseUrl)
        .client(okHttpClient)
        .addConverterFactory(MoshiConverterFactory.create(moshi))
        .build()

    val api: SmartTaxApiService = retrofit(BuildConfig.MYECA_API_BASE_URL).create(SmartTaxApiService::class.java)
    val myeCaApi: MyeCaApiService = retrofit(BuildConfig.MYECA_API_BASE_URL).create(MyeCaApiService::class.java)
    val supabaseAuth: SupabaseAuthService = retrofit(BuildConfig.SUPABASE_URL).create(SupabaseAuthService::class.java)
}

internal fun httpLoggingLevelFor(debug: Boolean): HttpLoggingInterceptor.Level {
    return if (debug) HttpLoggingInterceptor.Level.BASIC else HttpLoggingInterceptor.Level.NONE
}
