package com.myeca.smarttax.core.network

import com.myeca.smarttax.core.network.model.TdsRuleDto
import retrofit2.http.GET

interface SmartTaxApiService {
    @GET("tds/rules")
    suspend fun getTdsRules(): List<TdsRuleDto>
}