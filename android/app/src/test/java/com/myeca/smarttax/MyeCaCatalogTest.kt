package com.myeca.smarttax

import com.myeca.smarttax.ui.app.myeCaServices
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class MyeCaCatalogTest {
    @Test
    fun `service catalog has stable unique ids`() {
        assertEquals(myeCaServices.size, myeCaServices.map { it.id }.distinct().size)
        assertTrue(myeCaServices.any { it.id == "itr-filing" })
        assertTrue(myeCaServices.all { it.title.isNotBlank() && it.path.startsWith("/") })
    }
}
