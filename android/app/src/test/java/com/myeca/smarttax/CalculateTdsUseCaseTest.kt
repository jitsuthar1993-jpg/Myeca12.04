package com.myeca.smarttax

import com.myeca.smarttax.domain.usecase.CalculateTdsUseCase
import org.junit.Assert.assertEquals
import org.junit.Test

class CalculateTdsUseCaseTest {
    private val useCase = CalculateTdsUseCase()

    @Test
    fun `interest with PAN above threshold computes TDS`() {
        val result = useCase(
            income = 60000.0,
            incomeType = "interest",
            panProvided = true,
            isSeniorCitizen = false,
            form15G15HSubmitted = false
        )
        assertEquals(10.0, result.tdsRate, 0.0)
        assertEquals(40000.0, result.threshold, 0.0)
        assertEquals(6000.0, result.tdsAmount, 0.0)
    }

    @Test
    fun `no PAN enforces 20 percent minimum`() {
        val result = useCase(
            income = 100000.0,
            incomeType = "rent",
            panProvided = false,
            isSeniorCitizen = false,
            form15G15HSubmitted = false
        )
        assertEquals(20.0, result.tdsRate, 0.0)
        assertEquals(240000.0, result.threshold, 0.0)
        assertEquals(0.0, result.tdsAmount, 0.0) // below threshold
    }

    @Test
    fun `form 15G_15H suppresses interest TDS`() {
        val result = useCase(
            income = 80000.0,
            incomeType = "interest",
            panProvided = true,
            isSeniorCitizen = true,
            form15G15HSubmitted = true
        )
        assertEquals(0.0, result.tdsRate, 0.0)
        assertEquals(50000.0, result.threshold, 0.0)
        assertEquals(0.0, result.tdsAmount, 0.0)
    }
}