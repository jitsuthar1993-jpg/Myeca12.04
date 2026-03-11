package com.myeca.smarttax.core.network

import com.myeca.smarttax.core.util.AppResult
import retrofit2.HttpException
import java.io.IOException

suspend fun <T> safeApiCall(block: suspend () -> T): AppResult<T> {
    return try {
        AppResult.Success(block())
    } catch (e: HttpException) {
        AppResult.Error("HTTP ${e.code()}: ${e.message()}", e)
    } catch (e: IOException) {
        AppResult.Error("Network error: ${e.message}", e)
    } catch (e: Exception) {
        AppResult.Error(e.message, e)
    }
}