package `in`.myeca.mobile.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import `in`.myeca.mobile.domain.model.AppIcon
import `in`.myeca.mobile.ui.components.IconBadge
import `in`.myeca.mobile.ui.components.MyeCACard
import `in`.myeca.mobile.ui.components.PrimaryAction
import `in`.myeca.mobile.ui.components.ScreenScaffold
import `in`.myeca.mobile.ui.components.SecondaryAction
import `in`.myeca.mobile.ui.components.StatPill
import `in`.myeca.mobile.ui.theme.MyeCADark
import `in`.myeca.mobile.ui.theme.MyeCASlate

@Composable
fun FilingScreen(padding: PaddingValues) {
    val steps = listOf(
        "Choose ITR form" to "Smart recommender for salaried, capital gains, and business income.",
        "Upload documents" to "Form 16, AIS, bank statement, rent receipts, and proofs.",
        "Review calculation" to "Compare old and new regime with clear savings notes.",
        "CA verification" to "Expert checks before final submission."
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(bottom = 20.dp)
    ) {
        item {
            ScreenScaffold(
                title = "File ITR",
                subtitle = "A concise filing entry point for AY 2025-26 with CA review status."
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatPill("Progress", "2 of 4", Modifier.weight(1f))
                    StatPill("Review", "Pending", Modifier.weight(1f))
                }

                steps.forEachIndexed { index, step ->
                    MyeCACard {
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            IconBadge(if (index == 1) AppIcon.Upload else AppIcon.File)
                            androidx.compose.foundation.layout.Column(modifier = Modifier.weight(1f)) {
                                Text(step.first, color = MyeCADark, fontWeight = FontWeight.SemiBold)
                                Text(step.second, color = MyeCASlate, style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }

                PrimaryAction(
                    label = "Start guided filing",
                    onClick = {},
                    modifier = Modifier.fillMaxWidth()
                )
                SecondaryAction(
                    label = "Check ITR status",
                    onClick = {},
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}
