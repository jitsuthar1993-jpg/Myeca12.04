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
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.UploadFile
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
import `in`.myeca.mobile.domain.model.DocumentItem
import `in`.myeca.mobile.domain.repository.DocumentsRepository
import `in`.myeca.mobile.ui.components.MyeCACard
import `in`.myeca.mobile.ui.components.PrimaryAction
import `in`.myeca.mobile.ui.components.ScreenScaffold
import `in`.myeca.mobile.ui.components.StatPill
import `in`.myeca.mobile.ui.theme.MyeCABlue
import `in`.myeca.mobile.ui.theme.MyeCADark
import `in`.myeca.mobile.ui.theme.MyeCASlate
import `in`.myeca.mobile.ui.theme.MyeCASuccess
import `in`.myeca.mobile.ui.theme.MyeCAWarning

@Composable
fun DocumentVaultScreen(
    padding: PaddingValues,
    documentsRepository: DocumentsRepository
) {
    var documents by remember { mutableStateOf<List<DocumentItem>>(emptyList()) }

    LaunchedEffect(Unit) {
        documents = documentsRepository.getDocuments()
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(bottom = 20.dp)
    ) {
        item {
            ScreenScaffold(
                title = "Document vault",
                subtitle = "Store Form 16, AIS, proofs, and statements in a private filing workspace."
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatPill("Storage", "2.4 MB", Modifier.weight(1f))
                    StatPill("Encrypted", "Active", Modifier.weight(1f))
                }
            }
        }

        items(documents) { document ->
            MyeCACard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 6.dp)
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Icon(
                        imageVector = Icons.Outlined.CheckCircle,
                        contentDescription = null,
                        tint = if (document.verified) MyeCASuccess else MyeCAWarning
                    )
                    androidx.compose.foundation.layout.Column(modifier = Modifier.weight(1f)) {
                        Text(document.title, color = MyeCADark, fontWeight = FontWeight.SemiBold)
                        Text(document.status, color = MyeCASlate, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }

        item {
            MyeCACard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp)
            ) {
                Icon(Icons.Outlined.UploadFile, contentDescription = null, tint = MyeCABlue)
                Text("Upload a new document", color = MyeCADark, fontWeight = FontWeight.SemiBold)
                Text("Attach documents to the filing workspace for future live OCR and CA checks.", color = MyeCASlate)
                PrimaryAction("Upload document", onClick = {}, modifier = Modifier.fillMaxWidth())
            }
        }
    }
}
