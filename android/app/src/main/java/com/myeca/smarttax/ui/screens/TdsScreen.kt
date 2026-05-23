package com.myeca.smarttax.ui.screens

import java.math.BigDecimal
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.ExposedDropdownMenuAnchorType
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.myeca.smarttax.ui.theme.MyeCaColors
import com.myeca.smarttax.viewmodel.TdsViewModel
import kotlin.math.roundToLong

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TdsScreen(paddingValues: PaddingValues = PaddingValues(0.dp), viewModel: TdsViewModel = viewModel()) {
    val state by viewModel.state.collectAsState()

    Column(
        modifier = Modifier
            .padding(paddingValues)
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Card(
            colors = CardDefaults.cardColors(containerColor = MyeCaColors.SurfaceSoft),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("Native calculator", style = MaterialTheme.typography.labelLarge, color = MyeCaColors.Blue)
                Text("Estimate TDS", style = MaterialTheme.typography.titleLarge, color = MyeCaColors.Navy)
                Text(
                    "Use this for quick tax deduction checks. It stays local in the app.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MyeCaColors.Muted
                )
            }
        }

        OutlinedTextField(
            label = { Text("Income") },
            value = if (state.income == 0.0) "" else state.income.toString(),
            onValueChange = { viewModel.updateIncome(it.toDoubleOrNull() ?: 0.0) },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier
                .fillMaxWidth()
                .semantics { contentDescription = "Income amount input" }
        )

        var expanded by remember { mutableStateOf(false) }

        ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = !expanded }) {
            OutlinedTextField(
                readOnly = true,
                value = tdsIncomeTypeLabel(state.incomeType),
                onValueChange = {},
                label = { Text("Income Type") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                modifier = Modifier
                    .menuAnchor(ExposedDropdownMenuAnchorType.PrimaryNotEditable, enabled = true)
                    .fillMaxWidth()
                    .semantics { contentDescription = "Income type selector" }
            )
            ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                tdsIncomeTypes.forEach { (type, label) ->
                    DropdownMenuItem(
                        text = { Text(label) },
                        onClick = {
                            viewModel.updateIncomeType(type)
                            expanded = false
                        }
                    )
                }
            }
        }

        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            LabeledSwitch(label = "PAN Provided", checked = state.panProvided, onCheckedChange = viewModel::togglePan)
            LabeledSwitch(label = "Senior Citizen", checked = state.isSenior, onCheckedChange = viewModel::toggleSenior)
            LabeledSwitch(label = "Form 15G/15H", checked = state.form15G15H, onCheckedChange = viewModel::toggleForm15G15H)
        }

        Button(
            onClick = { viewModel.calculate() },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = MyeCaColors.Blue)
        ) {
            Text("Calculate TDS")
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                ResultRow("TDS Rate", formatTdsRate(state.tdsRate))
                ResultRow("Threshold", formatTdsMoney(state.threshold))
                ResultRow("TDS Amount", formatTdsMoney(state.tdsAmount))
                ResultRow("Net Income", formatTdsMoney(state.income - state.tdsAmount))
            }
        }
    }
}

internal val tdsIncomeTypes = listOf(
    "salary" to "Salary",
    "interest" to "Interest",
    "dividend" to "Dividend",
    "rent" to "Rent",
    "commission" to "Commission",
    "professional_fees" to "Professional Fees",
    "contractor_payment" to "Contractor Payment"
)

internal fun tdsIncomeTypeLabel(type: String): String {
    return tdsIncomeTypes.firstOrNull { it.first == type }?.second ?: type
}

internal fun formatTdsMoney(value: Double): String = "Rs ${value.roundToLong()}"

internal fun formatTdsRate(value: Double): String {
    val text = BigDecimal.valueOf(value).stripTrailingZeros().toPlainString()
    return "$text%"
}

@Composable
fun ResultRow(label: String, value: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = MyeCaColors.Muted)
        Text(value, style = MaterialTheme.typography.titleMedium, color = MyeCaColors.Navy)
    }
}

@Composable
fun LabeledSwitch(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
        modifier = Modifier
            .fillMaxWidth()
            .semantics { contentDescription = label }
    ) {
        Text(label, color = MyeCaColors.Navy)
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}
