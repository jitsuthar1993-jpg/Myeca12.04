package com.myeca.smarttax.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.ripple.rememberRipple
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.input.KeyboardOptions
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.*

/**
 * Optimized mobile components with proper touch targets (48x48dp minimum)
 * and accessibility features for SmartTaxCalculator Android app.
 */

/**
 * Optimized touch target wrapper that ensures minimum 48x48dp touch area
 */
@Composable
fun OptimizedTouchTarget(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    contentDescription: String? = null,
    content: @Composable () -> Unit
) {
    Box(
        modifier = modifier
            .sizeIn(minWidth = 48.dp, minHeight = 48.dp)
            .clip(RoundedCornerShape(8.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = rememberRipple(bounded = true),
                enabled = enabled,
                onClick = onClick
            )
            .semantics {
                if (contentDescription != null) {
                    this.contentDescription = contentDescription
                }
                this.role = Role.Button
            },
        contentAlignment = Alignment.Center
    ) {
        content()
    }
}

/**
 * Optimized text field with proper touch targets and accessibility
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OptimizedTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    contentDescription: String = "$label input field",
    supportingText: String? = null,
    isError: Boolean = false,
    errorMessage: String? = null
) {
    Column(modifier = modifier.fillMaxWidth()) {
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            label = { 
                Text(
                    text = label,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            },
            keyboardOptions = keyboardOptions,
            isError = isError,
            supportingText = if (supportingText != null) {
                { Text(supportingText) }
            } else null,
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 56.dp) // Ensure proper touch target
                .semantics {
                    this.contentDescription = contentDescription
                    this.hintText = AnnotatedString(label)
                    if (isError && errorMessage != null) {
                        this.errorText = AnnotatedString(errorMessage)
                    }
                },
            singleLine = true,
            maxLines = 1
        )
        
        if (isError && errorMessage != null) {
            Text(
                text = errorMessage,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(start = 16.dp, top = 4.dp)
            )
        }
    }
}

/**
 * Optimized switch with proper touch target and accessibility
 */
@Composable
fun OptimizedSwitch(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    contentDescription: String = "$label switch"
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = 48.dp) // Ensure minimum touch target
            .clip(RoundedCornerShape(8.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = rememberRipple(bounded = true),
                onClick = { onCheckedChange(!checked) }
            )
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .semantics {
                this.contentDescription = contentDescription
                this.role = Role.Switch
                this.stateDescription = if (checked) "On" else "Off"
            },
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.weight(1f)
        )
        
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            modifier = Modifier.size(48.dp, 32.dp) // Ensure proper switch size
        )
    }
}

/**
 * Optimized button with proper touch target and loading states
 */
@Composable
fun OptimizedButton(
    onClick: () -> Unit,
    text: String,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    loading: Boolean = false,
    contentDescription: String = text
) {
    Button(
        onClick = onClick,
        enabled = enabled && !loading,
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = 48.dp) // Ensure minimum touch target
            .semantics {
                this.contentDescription = contentDescription
                if (loading) {
                    this.stateDescription = "Loading"
                }
            },
        shape = RoundedCornerShape(8.dp)
    ) {
        if (loading) {
            CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                strokeWidth = 2.dp,
                color = MaterialTheme.colorScheme.onPrimary
            )
        } else {
            Text(
                text = text,
                style = MaterialTheme.typography.labelLarge
            )
        }
    }
}

/**
 * Optimized card with consistent elevation and spacing
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OptimizedCard(
    modifier: Modifier = Modifier,
    elevation: Dp = 4.dp,
    contentPadding: PaddingValues = PaddingValues(16.dp),
    content: @Composable () -> Unit
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = elevation),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
        )
    ) {
        Column(
            modifier = Modifier.padding(contentPadding),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            content()
        }
    }
}

/**
 * Optimized dropdown menu with proper touch targets
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OptimizedDropdownMenu(
    selectedValue: String,
    onValueChange: (String) -> Unit,
    options: List<String>,
    label: String,
    modifier: Modifier = Modifier,
    contentDescription: String = "$label dropdown menu"
) {
    var expanded by remember { mutableStateOf(false) }
    
    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = !expanded },
        modifier = modifier
    ) {
        OutlinedTextField(
            readOnly = true,
            value = selectedValue,
            onValueChange = {},
            label = { Text(label) },
            trailingIcon = { 
                ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) 
            },
            modifier = Modifier
                .menuAnchor()
                .fillMaxWidth()
                .heightIn(min = 56.dp) // Ensure proper touch target
                .semantics {
                    this.contentDescription = contentDescription
                    this.role = Role.DropdownList
                },
            colors = OutlinedTextFieldDefaults.colors()
        )
        
        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
            modifier = Modifier.fillMaxWidth()
        ) {
            options.forEach { option ->
                DropdownMenuItem(
                    text = { 
                        Text(
                            text = option,
                            modifier = Modifier.fillMaxWidth()
                        )
                    },
                    onClick = { 
                        onValueChange(option)
                        expanded = false
                    },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}

/**
 * Optimized number input field with proper validation
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OptimizedNumberInput(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    prefix: String = "₹",
    decimalPlaces: Int = 2,
    maxValue: Double = Double.MAX_VALUE,
    contentDescription: String = "$label amount input"
) {
    var isError by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    
    // Validate input
    LaunchedEffect(value) {
        isError = false
        errorMessage = null
        
        if (value.isNotEmpty()) {
            try {
                val number = value.toDouble()
                if (number > maxValue) {
                    isError = true
                    errorMessage = "Amount cannot exceed ₹${maxValue.toInt()}"
                }
            } catch (e: NumberFormatException) {
                isError = true
                errorMessage = "Please enter a valid number"
            }
        }
    }
    
    OptimizedTextField(
        value = value,
        onValueChange = { newValue ->
            // Only allow numbers and decimal points
            if (newValue.isEmpty() || newValue.matches(Regex("^\\d*\\.?\\d*$"))) {
                onValueChange(newValue)
            }
        },
        label = label,
        keyboardOptions = KeyboardOptions(
            keyboardType = androidx.compose.ui.text.input.KeyboardType.Decimal
        ),
        modifier = modifier,
        contentDescription = contentDescription,
        isError = isError,
        errorMessage = errorMessage,
        supportingText = "Enter amount in rupees"
    )
}

/**
 * Responsive layout wrapper that adapts to different screen sizes
 */
@Composable
fun ResponsiveLayout(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    BoxWithConstraints(modifier = modifier) {
        val isSmallScreen = maxWidth < 600.dp
        val isMediumScreen = maxWidth in 600.dp..900.dp
        val isLargeScreen = maxWidth > 900.dp
        
        val horizontalPadding = when {
            isSmallScreen -> 16.dp
            isMediumScreen -> 24.dp
            else -> 32.dp
        }
        
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = horizontalPadding)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            content()
        }
    }
}

/**
 * Screen size utilities for responsive design
 */
object ScreenSize {
    @Composable
    fun isSmallScreen(): Boolean {
        return LocalConfiguration.current.screenWidthDp < 600
    }
    
    @Composable
    fun isMediumScreen(): Boolean {
        val width = LocalConfiguration.current.screenWidthDp
        return width in 600..900
    }
    
    @Composable
    fun isLargeScreen(): Boolean {
        return LocalConfiguration.current.screenWidthDp > 900
    }
    
    @Composable
    fun getScreenWidth(): Dp {
        return LocalConfiguration.current.screenWidthDp.dp
    }
    
    @Composable
    fun getScreenHeight(): Dp {
        return LocalConfiguration.current.screenHeightDp.dp
    }
}

/**
 * Preview annotations for different screen sizes
 */
@Preview(name = "Small Phone", device = "spec:width=360dp,height=640dp,dpi=320")
@Preview(name = "Large Phone", device = "spec:width=414dp,height=896dp,dpi=480")
@Preview(name = "Tablet", device = "spec:width=768dp,height=1024dp,dpi=320")
annotation class DevicePreviews