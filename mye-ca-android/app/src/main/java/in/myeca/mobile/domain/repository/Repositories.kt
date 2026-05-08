package `in`.myeca.mobile.domain.repository

import `in`.myeca.mobile.domain.model.AccountProfile
import `in`.myeca.mobile.domain.model.AssistantMessage
import `in`.myeca.mobile.domain.model.CalculatorItem
import `in`.myeca.mobile.domain.model.DashboardSummary
import `in`.myeca.mobile.domain.model.DocumentItem
import `in`.myeca.mobile.domain.model.QuickAction
import `in`.myeca.mobile.domain.model.ServiceItem

interface DashboardRepository {
    suspend fun getSummary(): DashboardSummary
    suspend fun getQuickActions(): List<QuickAction>
    suspend fun getAccountProfile(): AccountProfile
}

interface CalculatorRepository {
    suspend fun getCalculators(): List<CalculatorItem>
}

interface ServicesRepository {
    suspend fun getServices(): List<ServiceItem>
}

interface DocumentsRepository {
    suspend fun getDocuments(): List<DocumentItem>
}

interface AssistantRepository {
    suspend fun getStarterMessages(): List<AssistantMessage>
}
