package `in`.myeca.mobile.data

import `in`.myeca.mobile.data.mock.MockAssistantRepository
import `in`.myeca.mobile.data.mock.MockCalculatorRepository
import `in`.myeca.mobile.data.mock.MockDashboardRepository
import `in`.myeca.mobile.data.mock.MockDocumentsRepository
import `in`.myeca.mobile.data.mock.MockServicesRepository
import `in`.myeca.mobile.data.network.MyeCAApiClient
import `in`.myeca.mobile.domain.repository.AssistantRepository
import `in`.myeca.mobile.domain.repository.CalculatorRepository
import `in`.myeca.mobile.domain.repository.DashboardRepository
import `in`.myeca.mobile.domain.repository.DocumentsRepository
import `in`.myeca.mobile.domain.repository.ServicesRepository

class AppContainer {
    val apiClient = MyeCAApiClient.create()
    val dashboardRepository: DashboardRepository = MockDashboardRepository()
    val calculatorRepository: CalculatorRepository = MockCalculatorRepository()
    val servicesRepository: ServicesRepository = MockServicesRepository()
    val documentsRepository: DocumentsRepository = MockDocumentsRepository()
    val assistantRepository: AssistantRepository = MockAssistantRepository()
}
