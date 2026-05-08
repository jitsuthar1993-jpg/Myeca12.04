package `in`.myeca.mobile.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.SmartToy
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import `in`.myeca.mobile.domain.model.AssistantMessage
import `in`.myeca.mobile.domain.repository.AssistantRepository
import `in`.myeca.mobile.ui.components.MyeCACard
import `in`.myeca.mobile.ui.components.PrimaryAction
import `in`.myeca.mobile.ui.components.ScreenScaffold
import `in`.myeca.mobile.ui.theme.MyeCABlue
import `in`.myeca.mobile.ui.theme.MyeCADark
import `in`.myeca.mobile.ui.theme.MyeCASlate

@Composable
fun AssistantScreen(
    padding: PaddingValues,
    assistantRepository: AssistantRepository
) {
    var messages by remember { mutableStateOf<List<AssistantMessage>>(emptyList()) }

    LaunchedEffect(Unit) {
        messages = assistantRepository.getStarterMessages()
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(bottom = 20.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            ScreenScaffold(
                title = "AI assistant",
                subtitle = "A calm chat layer for tax questions, document checks, and next-step guidance."
            ) {
                MyeCACard {
                    Icon(Icons.Outlined.SmartToy, contentDescription = null, tint = MyeCABlue)
                    Text("Ask about salary income, HRA, AIS, Form 16, or old vs new regime.", color = MyeCADark)
                }
            }
        }

        items(messages) { message ->
            val isAssistant = message.role == "assistant"
            Text(
                text = message.text,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(if (isAssistant) Color.White else Color(0xFFEFF6FF))
                    .padding(16.dp),
                color = if (isAssistant) MyeCADark else MyeCABlue,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = if (isAssistant) FontWeight.Normal else FontWeight.SemiBold
            )
        }

        item {
            MyeCACard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp)
            ) {
                Text("Quick reply", color = MyeCADark, fontWeight = FontWeight.SemiBold)
                Text("Live assistant calls can connect here after backend auth is finalized.", color = MyeCASlate)
                PrimaryAction("Type your question", onClick = {}, modifier = Modifier.fillMaxWidth())
            }
        }
    }
}
