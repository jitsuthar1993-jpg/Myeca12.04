package `in`.myeca.mobile.ui.screens

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import `in`.myeca.mobile.ui.components.BrandMoment
import `in`.myeca.mobile.ui.components.MyeCACard
import `in`.myeca.mobile.ui.components.ScreenScaffold
import `in`.myeca.mobile.ui.theme.MyeCADark
import `in`.myeca.mobile.ui.theme.MyeCASlate

@Composable
fun OnboardingScreen(padding: PaddingValues) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(bottom = 20.dp)
    ) {
        item {
            ScreenScaffold(
                title = "Welcome to MyeCA",
                subtitle = "A minimalist mobile workspace for Indian tax, GST, documents, and CA support."
            ) {
                BrandMoment(
                    title = "File, track, and ask",
                    body = "Upload documents, estimate tax, and keep every next step visible.",
                    metric = "Smart tax solutions"
                )
                listOf(
                    "CA-reviewed filing",
                    "Secure document vault",
                    "Tax calculators",
                    "AI assistant shell"
                ).forEach { item ->
                    MyeCACard {
                        Text(item, color = MyeCADark, fontWeight = FontWeight.SemiBold)
                        Text("Ready in the native app shell for live backend wiring.", color = MyeCASlate, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }
}
