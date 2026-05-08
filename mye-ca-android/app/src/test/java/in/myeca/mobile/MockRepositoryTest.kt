package `in`.myeca.mobile

import `in`.myeca.mobile.data.mock.MockCalculatorRepository
import `in`.myeca.mobile.data.mock.MockDashboardRepository
import `in`.myeca.mobile.ui.components.formatIndianCurrency
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class MockRepositoryTest {
    @Test
    fun dashboardSummaryUsesCurrentFilingSeason() = runTest {
        val summary = MockDashboardRepository().getSummary()

        assertEquals("AY 2025-26", summary.assessmentYear)
        assertEquals("In progress", summary.filingStatus)
    }

    @Test
    fun calculatorsExposeCoreWebsiteTools() = runTest {
        val calculators = MockCalculatorRepository().getCalculators()

        assertTrue(calculators.any { it.title == "Income Tax" })
        assertTrue(calculators.any { it.title == "HRA" })
        assertTrue(calculators.any { it.title == "TDS" })
    }

    @Test
    fun currencyFormatterUsesIndianGrouping() {
        assertEquals("Rs 18,400", formatIndianCurrency(18400))
        assertEquals("Rs 12,34,567", formatIndianCurrency(1234567))
    }
}
