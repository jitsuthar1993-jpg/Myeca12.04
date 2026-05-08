package `in`.myeca.mobile.domain.model

data class DashboardSummary(
    val assessmentYear: String,
    val refundEstimate: Int,
    val filingStatus: String,
    val deadline: String,
    val nextStep: String
)

data class QuickAction(
    val id: String,
    val title: String,
    val subtitle: String,
    val icon: AppIcon,
    val destination: String
)

data class CalculatorItem(
    val id: String,
    val title: String,
    val subtitle: String,
    val icon: AppIcon,
    val helperText: String
)

data class ServiceItem(
    val id: String,
    val title: String,
    val description: String,
    val price: String,
    val icon: AppIcon
)

data class DocumentItem(
    val id: String,
    val title: String,
    val status: String,
    val verified: Boolean
)

data class AccountProfile(
    val name: String,
    val email: String,
    val verified: Boolean,
    val storedDocuments: Int,
    val openServices: Int
)

data class AssistantMessage(
    val id: String,
    val role: String,
    val text: String
)

enum class AppIcon {
    Account,
    Assistant,
    Business,
    Calculator,
    File,
    Home,
    Security,
    Trending,
    Upload,
    Wallet
}
