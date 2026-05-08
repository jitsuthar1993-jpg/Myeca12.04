package `in`.myeca.mobile.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val MyeCABlue = Color(0xFF315EFB)
val MyeCADark = Color(0xFF0F172A)
val MyeCASlate = Color(0xFF64748B)
val MyeCABackground = Color(0xFFF8FAFC)
val MyeCABorder = Color(0xFFE2E8F0)
val MyeCASuccess = Color(0xFF047857)
val MyeCAWarning = Color(0xFFB45309)

private val MyeCAColorScheme = lightColorScheme(
    primary = MyeCABlue,
    onPrimary = Color.White,
    secondary = MyeCADark,
    onSecondary = Color.White,
    background = MyeCABackground,
    onBackground = MyeCADark,
    surface = Color.White,
    onSurface = MyeCADark,
    surfaceVariant = Color(0xFFF1F5F9),
    onSurfaceVariant = MyeCASlate,
    outline = MyeCABorder
)

@Composable
fun MyeCATheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = MyeCAColorScheme,
        content = content
    )
}
