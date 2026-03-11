package com.myeca.smarttax.data.repository

import com.myeca.smarttax.core.network.SmartTaxApiService
import com.myeca.smarttax.core.network.safeApiCall
import com.myeca.smarttax.core.util.AppResult
import com.myeca.smarttax.data.local.dao.TdsDao
import com.myeca.smarttax.data.local.entity.TdsCalculationEntity
import com.myeca.smarttax.core.network.model.TdsRuleDto
import kotlinx.coroutines.flow.Flow

class TdsRepository(
    private val dao: TdsDao,
    private val api: SmartTaxApiService
) {
    suspend fun saveCalculation(entity: TdsCalculationEntity): Long = dao.insert(entity)
    fun recentCalculations(limit: Int = 20): Flow<List<TdsCalculationEntity>> = dao.getRecentCalculations(limit)

    suspend fun refreshTdsRules(): AppResult<List<TdsRuleDto>> = safeApiCall {
        api.getTdsRules()
    }

    suspend fun clearHistory() = dao.clearAll()
}