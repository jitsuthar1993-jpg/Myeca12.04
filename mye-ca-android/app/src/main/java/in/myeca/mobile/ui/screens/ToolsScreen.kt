package `in`.myeca.mobile.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Search
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
import `in`.myeca.mobile.domain.model.CalculatorItem
import `in`.myeca.mobile.domain.repository.CalculatorRepository
import `in`.myeca.mobile.ui.components.BrandMoment
import `in`.myeca.mobile.ui.components.IconBadge
import `in`.myeca.mobile.ui.components.MyeCACard
import `in`.myeca.mobile.ui.components.ScreenScaffold
import `in`.myeca.mobile.ui.theme.MyeCADark
import `in`.myeca.mobile.ui.theme.MyeCASlate

@Composable
fun ToolsScreen(
    padding: PaddingValues,
    calculatorRepository: CalculatorRepository
) {
    var calculators by remember { mutableStateOf<List<CalculatorItem>>(emptyList()) }

    LaunchedEffect(Unit) {
        calculators = calculatorRepository.getCalculators()
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(bottom = 20.dp)
    ) {
        item {
            ScreenScaffold(
                title = "Tax tools",
                subtitle = "Quick calculators for savings, loans, deductions, and compliance."
            ) {
                MyeCACard {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Icon(Icons.Outlined.Search, contentDescription = "Search calculators", tint = MyeCASlate)
                        Text("Search calculator", color = MyeCASlate)
                    }
                }
                BrandMoment(
                    title = "Savings snapshot",
                    body = "Use calculators before filing to avoid missed deductions.",
                    metric = "Rs 32,000"
                )
            }
        }
        items(calculators) { calculator ->
            MyeCACard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 6.dp)
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    IconBadge(calculator.icon, calculator.title)
                    androidx.compose.foundation.layout.Column(modifier = Modifier.weight(1f)) {
                        Text(calculator.title, color = MyeCADark, fontWeight = FontWeight.SemiBold)
                        Text(calculator.subtitle, color = MyeCASlate, style = MaterialTheme.typography.bodySmall)
                        Text(calculator.helperText, color = MyeCASlate, style = MaterialTheme.typography.labelMedium)
                    }
                }
            }
        }
    }
}
