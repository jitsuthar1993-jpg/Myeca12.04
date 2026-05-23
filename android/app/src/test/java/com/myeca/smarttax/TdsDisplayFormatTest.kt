package com.myeca.smarttax

import com.myeca.smarttax.ui.screens.formatTdsMoney
import com.myeca.smarttax.ui.screens.formatTdsRate
import com.myeca.smarttax.ui.screens.tdsIncomeTypeLabel
import org.junit.Assert.assertEquals
import org.junit.Test

class TdsDisplayFormatTest {
    @Test
    fun `income type labels hide internal keys`() {
        assertEquals("Interest", tdsIncomeTypeLabel("interest"))
        assertEquals("Professional Fees", tdsIncomeTypeLabel("professional_fees"))
        assertEquals("Contractor Payment", tdsIncomeTypeLabel("contractor_payment"))
    }

    @Test
    fun `money values render without raw decimal suffixes`() {
        assertEquals("Rs 0", formatTdsMoney(0.0))
        assertEquals("Rs 6000", formatTdsMoney(6000.0))
        assertEquals("Rs 124", formatTdsMoney(123.5))
    }

    @Test
    fun `rate values keep useful decimals only`() {
        assertEquals("10%", formatTdsRate(10.0))
        assertEquals("7.5%", formatTdsRate(7.5))
        assertEquals("7.25%", formatTdsRate(7.25))
    }
}
