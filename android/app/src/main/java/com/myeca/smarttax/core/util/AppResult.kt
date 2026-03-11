package com.myeca.smarttax.core.util

sealed class AppResult<out T> {
    data class Success<T>(val data: T) : AppResult<T>()
    data class Error(val message: String?, val cause: Throwable? = null) : AppResult<Nothing>()
}

inline fun <T> AppResult<T>.onSuccess(block: (T) -> Unit): AppResult<T> {
    if (this is AppResult.Success) block(this.data)
    return this
}

inline fun <T> AppResult<T>.onError(block: (String?, Throwable?) -> Unit): AppResult<T> {
    if (this is AppResult.Error) block(this.message, this.cause)
    return this
}