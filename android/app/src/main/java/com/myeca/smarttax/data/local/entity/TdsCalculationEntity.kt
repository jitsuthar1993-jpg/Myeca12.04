package com.myeca.smarttax.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "tds_calculations")
data class TdsCalculationEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val timestamp: Long,
    val income: Double,
    val incomeType: String,
    val panProvided: Boolean,
    val isSeniorCitizen: Boolean,
    val form15G15HSubmitted: Boolean,
    val tdsRate: Double,
    val threshold: Double,
    val tdsAmount: Double
)