package `in`.myeca.mobile.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AccountBalanceWallet
import androidx.compose.material.icons.outlined.AccountCircle
import androidx.compose.material.icons.outlined.Business
import androidx.compose.material.icons.outlined.Calculate
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Security
import androidx.compose.material.icons.outlined.SmartToy
import androidx.compose.material.icons.outlined.TrendingUp
import androidx.compose.material.icons.outlined.UploadFile
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import `in`.myeca.mobile.domain.model.AppIcon
import `in`.myeca.mobile.ui.theme.MyeCABlue
import `in`.myeca.mobile.ui.theme.MyeCABorder
import `in`.myeca.mobile.ui.theme.MyeCADark
import `in`.myeca.mobile.ui.theme.MyeCASlate

@Composable
fun ScreenScaffold(
    title: String,
    subtitle: String,
    modifier: Modifier = Modifier,
    action: (@Composable () -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    Column(
        modifier = modifier
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 20.dp, vertical = 18.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.SemiBold,
                    color = MyeCADark
                )
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MyeCASlate,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
            action?.invoke()
        }
        content()
    }
}

@Composable
fun MyeCACard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier.then(
            if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier
        ),
        shape = RoundedCornerShape(18.dp),
        border = BorderStroke(1.dp, MyeCABorder),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            content = content
        )
    }
}

@Composable
fun BrandMoment(
    title: String,
    body: String,
    metric: String,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(22.dp))
            .background(Brush.linearGradient(listOf(MyeCABlue, Color(0xFF143E9F))))
            .padding(18.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text(text = "MyeCA", color = Color.White.copy(alpha = 0.78f), style = MaterialTheme.typography.labelMedium)
        Text(text = title, color = Color.White, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
        Text(text = body, color = Color.White.copy(alpha = 0.82f), style = MaterialTheme.typography.bodyMedium)
        Text(text = metric, color = Color.White, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun IconBadge(icon: AppIcon, contentDescription: String? = null) {
    Box(
        modifier = Modifier
            .size(44.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(Color(0xFFEFF6FF))
            .semantics {
                if (contentDescription != null) this.contentDescription = contentDescription
            },
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = icon.asImageVector(),
            contentDescription = null,
            tint = MyeCABlue,
            modifier = Modifier.size(22.dp)
        )
    }
}

@Composable
fun StatPill(label: String, value: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(1.dp, MyeCABorder, RoundedCornerShape(16.dp))
            .padding(14.dp)
    ) {
        Text(text = label, style = MaterialTheme.typography.labelMedium, color = MyeCASlate)
        Spacer(modifier = Modifier.height(4.dp))
        Text(text = value, style = MaterialTheme.typography.titleMedium, color = MyeCADark, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun PrimaryAction(label: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Button(
        onClick = onClick,
        modifier = modifier.semantics { contentDescription = label },
        colors = ButtonDefaults.buttonColors(containerColor = MyeCABlue),
        shape = RoundedCornerShape(14.dp)
    ) {
        Text(label)
    }
}

@Composable
fun SecondaryAction(label: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.semantics { contentDescription = label },
        shape = RoundedCornerShape(14.dp)
    ) {
        Text(label)
    }
}

fun AppIcon.asImageVector(): ImageVector = when (this) {
    AppIcon.Account -> Icons.Outlined.AccountCircle
    AppIcon.Assistant -> Icons.Outlined.SmartToy
    AppIcon.Business -> Icons.Outlined.Business
    AppIcon.Calculator -> Icons.Outlined.Calculate
    AppIcon.File -> Icons.Outlined.Description
    AppIcon.Home -> Icons.Outlined.Home
    AppIcon.Security -> Icons.Outlined.Security
    AppIcon.Trending -> Icons.Outlined.TrendingUp
    AppIcon.Upload -> Icons.Outlined.UploadFile
    AppIcon.Wallet -> Icons.Outlined.AccountBalanceWallet
}
