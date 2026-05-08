package `in`.myeca.mobile.ui.navigation

sealed class AppRoute(val route: String, val label: String) {
    data object Home : AppRoute("home", "Home")
    data object File : AppRoute("file", "File")
    data object Tools : AppRoute("tools", "Tools")
    data object Services : AppRoute("services", "Services")
    data object Account : AppRoute("account", "Account")
    data object Documents : AppRoute("documents", "Documents")
    data object Assistant : AppRoute("assistant", "Assistant")
    data object Onboarding : AppRoute("onboarding", "Welcome")
}
