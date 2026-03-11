package com.myeca.smarttax.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardOptions
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.myeca.smarttax.ui.components.*
import com.myeca.smarttax.viewmodel.TdsViewModel
import com.myeca.smarttax.viewmodel.TdsUiState

/**
 * Optimized TDS Calculator Screen with proper mobile optimization:
 * - Touch targets ≥ 48x48dp
 * - Proper accessibility
 * - Responsive design
 * - Performance optimizations
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OptimizedTdsScreen(
    paddingValues: PaddingValues = PaddingValues(0.dp),
    viewModel: TdsViewModel = viewModel()
) {
    val state by viewModel.state.collectAsState()
    var expanded by remember { mutableStateOf(false) }
    val incomeTypes = listOf(
        "salary" to "Salary",
        "interest" to "Interest",
        "dividend" to "Dividend",
        "rent" to "Rent",
        "commission" to "Commission",
        "professional_fees" to "Professional Fees",
        "contractor_payment" to "Contractor Payment"
    )
    
    ResponsiveLayout(
        modifier = Modifier.padding(paddingValues)
    ) {
        // Income Amount Input
        OptimizedNumberInput(
            value = if (state.income == 0.0) "" else state.income.toString(),
            onValueChange = { value ->
                viewModel.updateIncome(value.toDoubleOrNull() ?: 0.0)
            },
            label = "Income Amount",
            prefix = "₹",
            decimalPlaces = 2,
            maxValue = 10_00_00_000.0, // 10 Crores max
            contentDescription = "Enter your income amount in rupees"
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        // Income Type Dropdown
        OptimizedDropdownMenu(
            selectedValue = incomeTypes.find { it.first == state.incomeType }?.second ?: "Select Type",
            onValueChange = { displayName ->
                val type = incomeTypes.find { it.second == displayName }?.first ?: "salary"
                viewModel.updateIncomeType(type)
            },
            options = incomeTypes.map { it.second },
            label = "Income Type",
            contentDescription = "Select the type of income"
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Toggle Options Section
        Text(
            text = "Additional Options",
            style = MaterialTheme.typography.titleMedium,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        Column(
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            OptimizedSwitch(
                checked = state.panProvided,
                onCheckedChange = viewModel::togglePan,
                label = "PAN Provided",
                contentDescription = "Toggle if PAN is provided"
            )
            
            OptimizedSwitch(
                checked = state.isSenior,
                onCheckedChange = viewModel::toggleSenior,
                label = "Senior Citizen",
                contentDescription = "Toggle if senior citizen"
            )
            
            OptimizedSwitch(
                checked = state.form15G15H,
                onCheckedChange = viewModel::toggleForm15G15H,
                label = "Form 15G/15H Submitted",
                contentDescription = "Toggle if Form 15G/15H is submitted"
            )
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Calculate Button
        OptimizedButton(
            onClick = { viewModel.calculate() },
            text = "Calculate TDS",
            loading = state.isLoading,
            contentDescription = "Calculate Tax Deducted at Source"
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Results Section
        if (state.tdsAmount > 0 || state.tdsRate > 0) {
            OptimizedCard(
                elevation = 6.dp,
                contentPadding = PaddingValues(20.dp)
            ) {
                Text(
                    text = "TDS Calculation Results",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
                
                Column(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    ResultRow(
                        label = "TDS Rate",
                        value = "${state.tdsRate}%",
                        description = "Applicable TDS rate"
                    )
                    
                    ResultRow(
                        label = "Threshold Amount",
                        value = "₹${state.threshold.toInt()}",
                        description = "Minimum amount for TDS deduction"
                    )
                    
                    Divider()
                    
                    ResultRow(
                        label = "TDS Amount",
                        value = "₹${state.tdsAmount.toInt()}",
                        valueStyle = MaterialTheme.typography.titleMedium,
                        description = "Total TDS amount to be deducted"
                    )
                    
                    ResultRow(
                        label = "Net Income",
                        value = "₹${(state.income - state.tdsAmount).toInt()}",
                        valueStyle = MaterialTheme.typography.titleLarge,
                        description = "Income after TDS deduction"
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Additional Information
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.secondaryContainer,
                contentColor = MaterialTheme.colorScheme.onSecondaryContainer
            )
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "💡 TDS Information",
                    style = MaterialTheme.typography.titleSmall
                )
                
                Text(
                    text = "• TDS is deducted at source by the payer",
                    style = MaterialTheme.typography.bodySmall
                )
                
                Text(
                    text = "• Different rates apply to different income types",
                    style = MaterialTheme.typography.bodySmall
                )
                
                Text(
                    text = "• Form 15G/15H can prevent TDS deduction for eligible taxpayers",
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}

/**
 * Enhanced result row with accessibility and visual improvements
 */
@Composable
private fun ResultRow(
    label: String,
    value: String,
    description: String? = null,
    valueStyle: androidx.compose.ui.text.TextStyle = MaterialTheme.typography.bodyLarge,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
            )
            
            if (description != null) {
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    modifier = Modifier.semantics {
                        this.contentDescription = description
                    }
                )
            }
        }
        
        Text(
            text = value,
            style = valueStyle,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.semantics {
                this.contentDescription = "$label is $value"
            }
        )
    }
}

/**
 * Preview for different screen sizes
 */
@DevicePreviews
@Composable
fun OptimizedTdsScreenPreview() {
    SmartTaxTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            OptimizedTdsScreen()
        }
    }
}

/**
 * Loading state preview
 */
@Preview(name = "Loading State")
@Composable
fun OptimizedTdsScreenLoadingPreview() {
    SmartTaxTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            // Mock loading state
            val mockViewModel = TdsViewModel().apply {
                // Simulate loading state
            }
            OptimizedTdsScreen(viewModel = mockViewModel)
        }
    }
}