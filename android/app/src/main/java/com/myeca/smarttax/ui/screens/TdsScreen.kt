package com.myeca.smarttax.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.KeyboardOptions
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.myeca.smarttax.viewmodel.TdsViewModel
import com.myeca.smarttax.viewmodel.TdsUiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TdsScreen(paddingValues: PaddingValues = PaddingValues(0.dp), viewModel: TdsViewModel = viewModel()) {
    val state by viewModel.state.collectAsState()

    Column(
        modifier = Modifier
            .padding(paddingValues)
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
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
        val types = listOf("salary","interest","dividend","rent","commission","professional_fees","contractor_payment")

        ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = !expanded }) {
            OutlinedTextField(
                readOnly = true,
                value = state.incomeType,
                onValueChange = {},
                label = { Text("Income Type") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth()
                    .semantics { contentDescription = "Income type selector" }
            )
            ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                types.forEach {
                    DropdownMenuItem(
                        text = { Text(it) },
                        onClick = { viewModel.updateIncomeType(it); expanded = false }
                    )
                }
            }
        }

        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            LabeledSwitch(label = "PAN Provided", checked = state.panProvided, onCheckedChange = viewModel::togglePan)
            LabeledSwitch(label = "Senior Citizen", checked = state.isSenior, onCheckedChange = viewModel::toggleSenior)
            LabeledSwitch(label = "Form 15G/15H", checked = state.form15G15H, onCheckedChange = viewModel::toggleForm15G15H)
        }

        Button(onClick = { viewModel.calculate() }, modifier = Modifier.fillMaxWidth()) {
            Text("Calculate TDS")
        }

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                ResultRow("TDS Rate", "${state.tdsRate}%")
                ResultRow("Threshold", "₹${state.threshold}")
                ResultRow("TDS Amount", "₹${state.tdsAmount}")
                ResultRow("Net Income", "₹${state.income - state.tdsAmount}")
            }
        }
    }
}

@Composable
fun ResultRow(label: String, value: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, style = MaterialTheme.typography.bodyMedium)
        Text(value, style = MaterialTheme.typography.titleMedium)
    }
}

@Composable
fun LabeledSwitch(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.semantics { contentDescription = label }) {
        Text(label)
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}