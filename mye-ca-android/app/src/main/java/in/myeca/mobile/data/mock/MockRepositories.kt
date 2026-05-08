package `in`.myeca.mobile.data.mock

import `in`.myeca.mobile.domain.model.AccountProfile
import `in`.myeca.mobile.domain.model.AppIcon
import `in`.myeca.mobile.domain.model.AssistantMessage
import `in`.myeca.mobile.domain.model.CalculatorItem
import `in`.myeca.mobile.domain.model.DashboardSummary
import `in`.myeca.mobile.domain.model.DocumentItem
import `in`.myeca.mobile.domain.model.QuickAction
import `in`.myeca.mobile.domain.model.ServiceItem
import `in`.myeca.mobile.domain.repository.AssistantRepository
import `in`.myeca.mobile.domain.repository.CalculatorRepository
import `in`.myeca.mobile.domain.repository.DashboardRepository
import `in`.myeca.mobile.domain.repository.DocumentsRepository
import `in`.myeca.mobile.domain.repository.ServicesRepository
import `in`.myeca.mobile.ui.navigation.AppRoute

class MockDashboardRepository : DashboardRepository {
    override suspend fun getSummary(): DashboardSummary = DashboardSummary(
        assessmentYear = "AY 2025-26",
        refundEstimate = 18400,
        filingStatus = "In progress",
        deadline = "31 Jul",
        nextStep = "Upload Form 16 and AIS for CA review"
    )

    override suspend fun getQuickActions(): List<QuickAction> = listOf(
        QuickAction("file", "File ITR", "Start guided filing", AppIcon.File, AppRoute.File.route),
        QuickAction("calc", "Tax Calc", "Compare regimes", AppIcon.Calculator, AppRoute.Tools.route),
        QuickAction("docs", "Upload Docs", "Store Form 16 and AIS", AppIcon.Upload, AppRoute.Documents.route),
        QuickAction("assistant", "Ask CA", "Chat with tax assistant", AppIcon.Assistant, AppRoute.Assistant.route)
    )

    override suspend fun getAccountProfile(): AccountProfile = AccountProfile(
        name = "Arjun Mehta",
        email = "arjun@example.com",
        verified = true,
        storedDocuments = 8,
        openServices = 2
    )
}

class MockCalculatorRepository : CalculatorRepository {
    override suspend fun getCalculators(): List<CalculatorItem> = listOf(
        CalculatorItem("income-tax", "Income Tax", "Old vs new regime", AppIcon.Wallet, "Estimate yearly tax"),
        CalculatorItem("hra", "HRA", "Rent exemption", AppIcon.Home, "Check eligible savings"),
        CalculatorItem("sip", "SIP", "Future corpus", AppIcon.Trending, "Plan investment growth"),
        CalculatorItem("emi", "EMI", "Loan planning", AppIcon.Security, "Estimate monthly payments"),
        CalculatorItem("tds", "TDS", "Deduction check", AppIcon.File, "Track deduction and refund"),
        CalculatorItem("capital-gains", "Capital Gains", "Equity and property", AppIcon.Business, "Estimate taxable gains")
    )
}

class MockServicesRepository : ServicesRepository {
    override suspend fun getServices(): List<ServiceItem> = listOf(
        ServiceItem("itr", "ITR Filing", "CA-reviewed return in four steps", "From Rs 999", AppIcon.File),
        ServiceItem("gst", "GST Registration", "Documents, filing, and activation", "Rs 2,999", AppIcon.Business),
        ServiceItem("company", "Company Setup", "Private Limited, LLP, and OPC", "Rs 7,999", AppIcon.Business),
        ServiceItem("notice", "Notice Help", "Draft a response with a CA", "Rs 2,999", AppIcon.Security),
        ServiceItem("tax-planning", "Tax Planning", "Salary and investment review", "From Rs 1,499", AppIcon.Trending)
    )
}

class MockDocumentsRepository : DocumentsRepository {
    override suspend fun getDocuments(): List<DocumentItem> = listOf(
        DocumentItem("form16", "Form 16", "Matched and ready", true),
        DocumentItem("ais", "AIS / 26AS", "Review required", false),
        DocumentItem("rent", "Rent receipts", "Uploaded today", true),
        DocumentItem("bank", "Bank statement", "OCR completed", true)
    )
}

class MockAssistantRepository : AssistantRepository {
    override suspend fun getStarterMessages(): List<AssistantMessage> = listOf(
        AssistantMessage("1", "user", "Compare the new regime with my salary and rent details."),
        AssistantMessage(
            "2",
            "assistant",
            "Upload Form 16 and rent receipts. I can estimate HRA benefit, compare regimes, and flag CA review items."
        )
    )
}
