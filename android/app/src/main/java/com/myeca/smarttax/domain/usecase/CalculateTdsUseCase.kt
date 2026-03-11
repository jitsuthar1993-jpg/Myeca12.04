package com.myeca.smarttax.domain.usecase

data class TdsResult(
    val tdsAmount: Double,
    val tdsRate: Double,
    val threshold: Double
)

class CalculateTdsUseCase {
    operator fun invoke(
        income: Double,
        incomeType: String,
        panProvided: Boolean,
        isSeniorCitizen: Boolean,
        form15G15HSubmitted: Boolean
    ): TdsResult {
        if (incomeType == "salary") return TdsResult(0.0, 0.0, 0.0)

        val (baseRate, threshold) = when (incomeType) {
            "interest" -> 10.0 to if (isSeniorCitizen) 50_000.0 else 40_000.0
            "dividend" -> 10.0 to 5_000.0
            "rent" -> 10.0 to 240_000.0
            "commission" -> 5.0 to 15_000.0
            "professional_fees" -> 10.0 to 30_000.0
            "contractor_payment" -> 1.0 to 30_000.0
            else -> 0.0 to 0.0
        }

        if (incomeType == "interest" && form15G15HSubmitted) {
            return TdsResult(0.0, 0.0, threshold)
        }

        val rate = if (panProvided) baseRate else maxOf(baseRate, 20.0)
        val applicable = income > threshold
        val tds = if (applicable) income * rate / 100.0 else 0.0
        return TdsResult(tds, rate, threshold)
    }
}