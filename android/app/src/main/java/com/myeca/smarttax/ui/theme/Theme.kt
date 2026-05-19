package com.myeca.smarttax.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

object MyeCaColors {
    val Blue = Color(0xFF315EFB)
    val BlueDark = Color(0xFF2040D8)
    val Navy = Color(0xFF0F172A)
    val Teal = Color(0xFF0F766E)
    val Success = Color(0xFF047857)
    val Amber = Color(0xFFB45309)
    val Surface = Color(0xFFF6F9FD)
    val SurfaceSoft = Color(0xFFEEF4FF)
    val Border = Color(0xFFE2E8F0)
    val Muted = Color(0xFF64748B)
}

private val MyeCaLightColorScheme = lightColorScheme(
    primary = MyeCaColors.Blue,
    onPrimary = Color.White,
    primaryContainer = MyeCaColors.SurfaceSoft,
    onPrimaryContainer = MyeCaColors.BlueDark,
    secondary = MyeCaColors.Teal,
    onSecondary = Color.White,
    tertiary = MyeCaColors.Success,
    background = MyeCaColors.Surface,
    onBackground = MyeCaColors.Navy,
    surface = Color.White,
    onSurface = MyeCaColors.Navy,
    surfaceVariant = Color(0xFFF8FAFC),
    onSurfaceVariant = MyeCaColors.Muted,
    outline = MyeCaColors.Border,
    error = Color(0xFFDC2626)
)

private val MyeCaShapes = Shapes(
    extraSmall = androidx.compose.foundation.shape.RoundedCornerShape(8.dp),
    small = androidx.compose.foundation.shape.RoundedCornerShape(8.dp),
    medium = androidx.compose.foundation.shape.RoundedCornerShape(12.dp),
    large = androidx.compose.foundation.shape.RoundedCornerShape(16.dp),
    extraLarge = androidx.compose.foundation.shape.RoundedCornerShape(20.dp)
)

@Composable
fun SmartTaxTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = MyeCaLightColorScheme,
        shapes = MyeCaShapes,
        typography = androidx.compose.material3.Typography(),
        content = content
    )
}
