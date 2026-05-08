package `in`.myeca.mobile.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Logout
import androidx.compose.material.icons.outlined.Security
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import `in`.myeca.mobile.domain.model.AccountProfile
import `in`.myeca.mobile.domain.model.AppIcon
import `in`.myeca.mobile.domain.repository.DashboardRepository
import `in`.myeca.mobile.ui.components.IconBadge
import `in`.myeca.mobile.ui.components.MyeCACard
import `in`.myeca.mobile.ui.components.ScreenScaffold
import `in`.myeca.mobile.ui.components.SecondaryAction
import `in`.myeca.mobile.ui.components.StatPill
import `in`.myeca.mobile.ui.navigation.AppRoute
import `in`.myeca.mobile.ui.theme.MyeCABlue
import `in`.myeca.mobile.ui.theme.MyeCADark
import `in`.myeca.mobile.ui.theme.MyeCASlate

@Composable
fun AccountScreen(
    padding: PaddingValues,
    dashboardRepository: DashboardRepository,
    onNavigate: (String) -> Unit
) {
    var profile by remember { mutableStateOf<AccountProfile?>(null) }

    LaunchedEffect(Unit) {
        profile = dashboardRepository.getAccountProfile()
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(bottom = 20.dp)
    ) {
        item {
            ScreenScaffold(
                title = "Account",
                subtitle = "Identity, preferences, documents, and support in one compact profile."
            ) {
                MyeCACard {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        IconBadge(AppIcon.Account, "Account profile")
                        androidx.compose.foundation.layout.Column(modifier = Modifier.weight(1f)) {
                            Text(profile?.name ?: "Loading", color = MyeCADark, fontWeight = FontWeight.SemiBold)
                            Text(profile?.email ?: "", color = MyeCASlate, style = MaterialTheme.typography.bodySmall)
                            Text(if (profile?.verified == true) "Verified" else "Not verified", color = MyeCABlue)
                        }
                    }
                }

                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatPill("Documents", "${profile?.storedDocuments ?: 0} stored", Modifier.weight(1f))
                    StatPill("Services", "${profile?.openServices ?: 0} open", Modifier.weight(1f))
                }

                listOf("Security", "Preferences", "Support").forEachIndexed { index, label ->
                    MyeCACard(onClick = if (label == "Support") ({ onNavigate(AppRoute.Assistant.route) }) else null) {
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Icon(
                                imageVector = if (index == 0) Icons.Outlined.Security else Icons.Outlined.Settings,
                                contentDescription = null,
                                tint = MyeCABlue
                            )
                            Text(label, color = MyeCADark, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }

                SecondaryAction(
                    label = "View onboarding",
                    onClick = { onNavigate(AppRoute.Onboarding.route) },
                    modifier = Modifier.fillMaxWidth()
                )
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Icon(Icons.Outlined.Logout, contentDescription = null, tint = MyeCASlate)
                    Text("Sign out", color = MyeCASlate)
                }
            }
        }
    }
}
