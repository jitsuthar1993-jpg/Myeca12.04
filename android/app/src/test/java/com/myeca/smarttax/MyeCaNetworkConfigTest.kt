package com.myeca.smarttax

import com.myeca.smarttax.core.network.httpLoggingLevelFor
import okhttp3.logging.HttpLoggingInterceptor
import org.junit.Assert.assertEquals
import org.junit.Test

class MyeCaNetworkConfigTest {
    @Test
    fun `http logging is enabled only for debug builds`() {
        assertEquals(HttpLoggingInterceptor.Level.BASIC, httpLoggingLevelFor(debug = true))
        assertEquals(HttpLoggingInterceptor.Level.NONE, httpLoggingLevelFor(debug = false))
    }
}
