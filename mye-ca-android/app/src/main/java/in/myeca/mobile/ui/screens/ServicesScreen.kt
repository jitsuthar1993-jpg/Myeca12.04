package `in`.myeca.mobile.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import `in`.myeca.mobile.domain.model.ServiceItem
import `in`.myeca.mobile.domain.repository.ServicesRepository
import `in`.myeca.mobile.ui.components.BrandMoment
import `in`.myeca.mobile.ui.components.IconBadge
import `in`.myeca.mobile.ui.components.MyeCACard
import `in`.myeca.mobile.ui.components.PrimaryAction
import `in`.myeca.mobile.ui.components.ScreenScaffold
import `in`.myeca.mobile.ui.navigation.AppRoute
import `in`.myeca.mobile.ui.theme.MyeCADark
import `in`.myeca.mobile.ui.theme.MyeCASlate

@Composable
fun ServicesScreen(
    padding: PaddingValues,
    servicesRepository: ServicesRepository,
    onNavigate: (String) -> Unit
) {
    var services by remember { mutableStateOf<List<ServiceItem>>(emptyList()) }

    LaunchedEffect(Unit) {
        services = servicesRepository.getServices()
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(bottom = 20.dp)
    ) {
        item {
            ScreenScaffold(
                title = "Services",
                subtitle = "Choose the right tax, GST, startup, or notice support without a long sales flow."
            ) {
                BrandMoment(
                    title = "Need expert help?",
                    body = "Book a CA consultation or start a service request.",
                    metric = "CA-reviewed"
                )
            }
        }
        items(services) { service ->
            MyeCACard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 6.dp)
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    IconBadge(service.icon, service.title)
                    androidx.compose.foundation.layout.Column(modifier = Modifier.weight(1f)) {
                        Text(service.title, color = MyeCADark, fontWeight = FontWeight.SemiBold)
                        Text(service.description, color = MyeCASlate, style = MaterialTheme.typography.bodySmall)
                        Text(service.price, color = MyeCADark, style = MaterialTheme.typography.labelLarge)
                    }
                }
            }
        }
        item {
            PrimaryAction(
                label = "Book consultation",
                onClick = { onNavigate(AppRoute.Assistant.route) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 10.dp)
            )
        }
    }
}
