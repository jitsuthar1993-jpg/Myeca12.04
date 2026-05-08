package `in`.myeca.mobile.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import `in`.myeca.mobile.domain.model.DashboardSummary
import `in`.myeca.mobile.domain.model.QuickAction
import `in`.myeca.mobile.domain.repository.DashboardRepository
import `in`.myeca.mobile.ui.components.BrandMoment
import `in`.myeca.mobile.ui.components.IconBadge
import `in`.myeca.mobile.ui.components.MyeCACard
import `in`.myeca.mobile.ui.components.PrimaryAction
import `in`.myeca.mobile.ui.components.ScreenScaffold
import `in`.myeca.mobile.ui.components.StatPill
import `in`.myeca.mobile.ui.components.formatIndianCurrency
import `in`.myeca.mobile.ui.navigation.AppRoute
import `in`.myeca.mobile.ui.theme.MyeCADark
import `in`.myeca.mobile.ui.theme.MyeCASlate

@Composable
fun HomeScreen(
    padding: PaddingValues,
    dashboardRepository: DashboardRepository,
    onNavigate: (String) -> Unit
) {
    var summary by remember { mutableStateOf<DashboardSummary?>(null) }
    var actions by remember { mutableStateOf<List<QuickAction>>(emptyList()) }

    LaunchedEffect(Unit) {
        summary = dashboardRepository.getSummary()
        actions = dashboardRepository.getQuickActions()
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(bottom = 20.dp)
    ) {
        item {
            ScreenScaffold(
                title = "Your tax cockpit",
                subtitle = "File, track, calculate, and ask for help in one calm mobile workspace.",
                action = {
                    Icon(Icons.Outlined.Notifications, contentDescription = "Notifications", tint = MyeCASlate)
                }
            ) {
                BrandMoment(
                    title = "Refund estimate",
                    body = "${summary?.assessmentYear ?: "AY 2025-26"} - Deadline ${summary?.deadline ?: "31 Jul"}",
                    metric = formatIndianCurrency(summary?.refundEstimate ?: 0)
                )

                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatPill(
                        label = "Filing status",
                        value = summary?.filingStatus ?: "Loading",
                        modifier = Modifier.weight(1f)
                    )
                    StatPill(
                        label = "Next step",
                        value = "CA review",
                        modifier = Modifier.weight(1f)
                    )
                }

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    actions.chunked(2).forEach { rowActions ->
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            rowActions.forEach { action ->
                                MyeCACard(
                                    modifier = Modifier
                                        .weight(1f)
                                        .semantics { contentDescription = "Open ${action.title}" },
                                    onClick = { onNavigate(action.destination) }
                                ) {
                                    IconBadge(action.icon, action.title)
                                    Text(text = action.title, color = MyeCADark, fontWeight = FontWeight.SemiBold)
                                    Text(text = action.subtitle, color = MyeCASlate, style = MaterialTheme.typography.bodySmall)
                                }
                            }
                            if (rowActions.size == 1) {
                                androidx.compose.foundation.layout.Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }

                MyeCACard {
                    Text(text = "Filing checklist", color = MyeCADark, fontWeight = FontWeight.SemiBold)
                    Text(
                        text = summary?.nextStep ?: "Loading your next filing action.",
                        color = MyeCASlate,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    PrimaryAction(
                        label = "Continue filing",
                        onClick = { onNavigate(AppRoute.File.route) },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
    }
}
