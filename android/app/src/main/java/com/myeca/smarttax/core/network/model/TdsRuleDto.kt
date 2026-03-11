package com.myeca.smarttax.core.network.model

data class TdsRuleDto(
    val incomeType: String,
    val baseRate: Double,
    val threshold: Double,
    val assessmentYear: String
)