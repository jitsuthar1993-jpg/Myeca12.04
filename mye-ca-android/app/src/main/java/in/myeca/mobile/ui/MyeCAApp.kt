package `in`.myeca.mobile.ui

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AccountCircle
import androidx.compose.material.icons.outlined.Calculate
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Work
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import `in`.myeca.mobile.data.AppContainer
import `in`.myeca.mobile.ui.navigation.AppRoute
import `in`.myeca.mobile.ui.screens.AccountScreen
import `in`.myeca.mobile.ui.screens.AssistantScreen
import `in`.myeca.mobile.ui.screens.DocumentVaultScreen
import `in`.myeca.mobile.ui.screens.FilingScreen
import `in`.myeca.mobile.ui.screens.HomeScreen
import `in`.myeca.mobile.ui.screens.OnboardingScreen
import `in`.myeca.mobile.ui.screens.ServicesScreen
import `in`.myeca.mobile.ui.screens.ToolsScreen

@Composable
fun MyeCAApp(
    container: AppContainer = remember { AppContainer() }
) {
    val navController = rememberNavController()
    val bottomRoutes = listOf(
        AppRoute.Home,
        AppRoute.File,
        AppRoute.Tools,
        AppRoute.Services,
        AppRoute.Account
    )
    val currentRoute = navController.currentBackStackEntryAsState().value?.destination?.route

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            if (currentRoute in bottomRoutes.map { it.route }) {
                NavigationBar {
                    bottomRoutes.forEach { route ->
                        NavigationBarItem(
                            selected = currentRoute == route.route,
                            onClick = {
                                navController.navigate(route.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = {
                                Icon(
                                    imageVector = when (route) {
                                        AppRoute.Home -> Icons.Outlined.Home
                                        AppRoute.File -> Icons.Outlined.Description
                                        AppRoute.Tools -> Icons.Outlined.Calculate
                                        AppRoute.Services -> Icons.Outlined.Work
                                        AppRoute.Account -> Icons.Outlined.AccountCircle
                                        else -> Icons.Outlined.Home
                                    },
                                    contentDescription = "${route.label} tab"
                                )
                            },
                            label = { Text(route.label) }
                        )
                    }
                }
            }
        }
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = AppRoute.Home.route,
            modifier = Modifier.fillMaxSize()
        ) {
            composable(AppRoute.Home.route) {
                HomeScreen(
                    padding = padding,
                    dashboardRepository = container.dashboardRepository,
                    onNavigate = navController::navigate
                )
            }
            composable(AppRoute.File.route) {
                FilingScreen(padding = padding)
            }
            composable(AppRoute.Tools.route) {
                ToolsScreen(
                    padding = padding,
                    calculatorRepository = container.calculatorRepository
                )
            }
            composable(AppRoute.Services.route) {
                ServicesScreen(
                    padding = padding,
                    servicesRepository = container.servicesRepository,
                    onNavigate = navController::navigate
                )
            }
            composable(AppRoute.Account.route) {
                AccountScreen(
                    padding = padding,
                    dashboardRepository = container.dashboardRepository,
                    onNavigate = navController::navigate
                )
            }
            composable(AppRoute.Documents.route) {
                DocumentVaultScreen(
                    padding = padding,
                    documentsRepository = container.documentsRepository
                )
            }
            composable(AppRoute.Assistant.route) {
                AssistantScreen(
                    padding = padding,
                    assistantRepository = container.assistantRepository
                )
            }
            composable(AppRoute.Onboarding.route) {
                OnboardingScreen(padding = padding)
            }
        }
    }
}
