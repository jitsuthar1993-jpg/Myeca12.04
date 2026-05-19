package com.myeca.smarttax.ui.app

import android.app.Application
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Login
import androidx.compose.material.icons.outlined.AccountCircle
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.FolderOpen
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Payments
import androidx.compose.material.icons.outlined.SupportAgent
import androidx.compose.material.icons.outlined.UploadFile
import androidx.compose.material.icons.outlined.WorkspacePremium
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.myeca.smarttax.core.network.DashboardResponse
import com.myeca.smarttax.core.network.DocumentItem
import com.myeca.smarttax.core.network.MyeCaUser
import com.myeca.smarttax.core.network.UserService
import com.myeca.smarttax.data.repository.MyeCaRepository
import com.myeca.smarttax.data.repository.acceptedDocumentMimeTypes
import com.myeca.smarttax.ui.screens.TdsScreen
import com.myeca.smarttax.ui.theme.MyeCaColors
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import retrofit2.HttpException

enum class MyeCaTab(val label: String) {
    Home("Home"),
    Services("Services"),
    Tools("Tools"),
    Help("Help/Login"),
    Documents("Documents"),
    Payments("Payments"),
    Account("Account")
}

data class MyeCaUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val isAuthBusy: Boolean = false,
    val isSignedIn: Boolean = false,
    val selectedTab: MyeCaTab = MyeCaTab.Home,
    val token: String? = null,
    val user: MyeCaUser? = null,
    val dashboard: DashboardResponse? = null,
    val services: List<UserService> = emptyList(),
    val documents: List<DocumentItem> = emptyList(),
    val email: String = "",
    val password: String = "",
    val consultationName: String = "",
    val consultationEmail: String = "",
    val consultationMessage: String = "",
    val message: String? = null
)

class MyeCaAppViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = MyeCaRepository(application)
    private val _state = MutableStateFlow(MyeCaUiState())
    val state: StateFlow<MyeCaUiState> = _state

    init {
        restoreSession()
    }

    fun selectTab(tab: MyeCaTab) {
        _state.update { it.copy(selectedTab = tab, message = null) }
    }

    fun updateEmail(value: String) {
        _state.update { it.copy(email = value) }
    }

    fun updatePassword(value: String) {
        _state.update { it.copy(password = value) }
    }

    fun updateConsultationName(value: String) {
        _state.update { it.copy(consultationName = value) }
    }

    fun updateConsultationEmail(value: String) {
        _state.update { it.copy(consultationEmail = value) }
    }

    fun updateConsultationMessage(value: String) {
        _state.update { it.copy(consultationMessage = value) }
    }

    fun signIn() {
        val email = state.value.email.trim()
        val password = state.value.password
        if (email.isBlank() || password.isBlank()) {
            _state.update { it.copy(message = "Enter your email and password to continue.") }
            return
        }
        if (!isValidEmailInput(email)) {
            _state.update { it.copy(message = "Enter a valid email address.") }
            return
        }

        viewModelScope.launch {
            _state.update { it.copy(isAuthBusy = true, message = null) }
            runCatching { repository.signIn(email, password) }
                .onSuccess { session ->
                    _state.update {
                        it.copy(
                            isAuthBusy = false,
                            isSignedIn = true,
                            selectedTab = MyeCaTab.Home,
                            token = session.token,
                            user = session.user,
                            password = "",
                            message = "Signed in to your MyeCA workspace."
                        )
                    }
                    refreshWorkspace(session.token)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            isAuthBusy = false,
                            message = error.message ?: "Unable to sign in. Please try again."
                        )
                    }
                }
        }
    }

    fun signOut() {
        repository.clearSession()
        _state.value = MyeCaUiState(isLoading = false, message = "Signed out.")
    }

    fun refresh() {
        val token = state.value.token ?: return
        viewModelScope.launch { refreshWorkspace(token) }
    }

    fun createServiceRequest(item: MyeCaServiceCatalogItem) {
        val token = state.value.token
        if (token == null) {
            _state.update {
                it.copy(
                    selectedTab = MyeCaTab.Help,
                    message = "Sign in to start ${item.title}."
                )
            }
            return
        }

        viewModelScope.launch {
            _state.update { it.copy(isRefreshing = true, message = null) }
            runCatching { repository.createServiceRequest(token, item) }
                .onSuccess {
                    _state.update { it.copy(message = "${item.title} request created.") }
                    refreshWorkspace(token)
                }
                .onFailure { error ->
                    handleWorkspaceError(error, "Could not create this service request.")
                }
        }
    }

    fun requestPaymentLink(serviceId: String) {
        val token = state.value.token ?: return
        viewModelScope.launch {
            _state.update { it.copy(isRefreshing = true, message = null) }
            runCatching { repository.requestPaymentLink(token, serviceId) }
                .onSuccess {
                    _state.update { it.copy(message = "Payment link request sent.") }
                    refreshWorkspace(token)
                }
                .onFailure { error ->
                    handleWorkspaceError(error, "Could not request a payment link.")
                }
        }
    }

    fun uploadDocument(uri: Uri) {
        val token = state.value.token ?: return
        viewModelScope.launch {
            _state.update { it.copy(isRefreshing = true, message = null) }
            runCatching { repository.uploadDocument(token, uri) }
                .onSuccess {
                    _state.update { it.copy(message = "Document uploaded.") }
                    refreshWorkspace(token)
                }
                .onFailure { error ->
                    handleWorkspaceError(error, "Could not upload this document.")
                }
        }
    }

    fun requestConsultation() {
        val current = state.value
        val name = current.consultationName.trim()
        val email = current.consultationEmail.trim()
        val message = current.consultationMessage.trim()
        if (name.isBlank() || email.isBlank() || message.isBlank()) {
            _state.update { it.copy(message = "Add name, email, and a short message.") }
            return
        }
        if (!isValidEmailInput(email)) {
            _state.update { it.copy(message = "Enter a valid callback email address.") }
            return
        }

        viewModelScope.launch {
            _state.update { it.copy(isRefreshing = true, message = null) }
            runCatching {
                repository.requestConsultation(
                    name = name,
                    email = email,
                    message = message
                )
            }.onSuccess {
                _state.update {
                    it.copy(
                        isRefreshing = false,
                        consultationName = "",
                        consultationEmail = "",
                        consultationMessage = "",
                        message = "Callback request sent."
                    )
                }
            }.onFailure { error ->
                _state.update {
                    it.copy(
                        isRefreshing = false,
                        message = error.message ?: "Could not send callback request."
                    )
                }
            }
        }
    }

    private fun restoreSession() {
        viewModelScope.launch {
            val session = repository.restoreSession()
            if (session == null) {
                _state.update { it.copy(isLoading = false, isSignedIn = false) }
                return@launch
            }

            _state.update {
                it.copy(
                    isLoading = false,
                    isSignedIn = true,
                    token = session.token,
                    user = session.user,
                    selectedTab = MyeCaTab.Home
                )
            }
            refreshWorkspace(session.token)
        }
    }

    private suspend fun refreshWorkspace(token: String) {
        _state.update { it.copy(isRefreshing = true) }
        val dashboardResult = runCatching { repository.dashboard(token) }
        val dashboardError = dashboardResult.exceptionOrNull()
        dashboardError?.let { error ->
            if (isAuthFailure(error)) {
                expireSession()
                return
            }
        }

        val servicesResult = runCatching { repository.userServices(token) }
        val servicesError = servicesResult.exceptionOrNull()
        servicesError?.let { error ->
            if (isAuthFailure(error)) {
                expireSession()
                return
            }
        }

        val documentsResult = runCatching { repository.documents(token) }
        val documentsError = documentsResult.exceptionOrNull()
        documentsError?.let { error ->
            if (isAuthFailure(error)) {
                expireSession()
                return
            }
        }
        val refreshIssue = workspaceRefreshIssueMessage(dashboardError, servicesError, documentsError)

        _state.update {
            it.copy(
                isLoading = false,
                isRefreshing = false,
                dashboard = dashboardResult.getOrDefault(it.dashboard),
                services = servicesResult.getOrDefault(it.services),
                documents = documentsResult.getOrDefault(it.documents),
                message = refreshIssue ?: it.message
            )
        }
    }

    private fun handleWorkspaceError(error: Throwable, fallback: String) {
        if (isAuthFailure(error)) {
            expireSession()
            return
        }
        _state.update {
            it.copy(
                isRefreshing = false,
                message = error.message ?: fallback
            )
        }
    }

    private fun expireSession() {
        repository.clearSession()
        _state.value = sessionExpiredState()
    }
}

@Composable
fun MyeCaApp(viewModel: MyeCaAppViewModel = viewModel()) {
    val state by viewModel.state.collectAsState()
    val tabs = myeCaTabsFor(state.isSignedIn)

    Scaffold(
        containerColor = MyeCaColors.Surface,
        bottomBar = {
            MyeCaBottomBar(
                tabs = tabs,
                selected = state.selectedTab,
                onSelected = viewModel::selectTab
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MyeCaColors.Surface)
                .padding(paddingValues)
        ) {
            if (state.isLoading) {
                LoadingState()
            } else {
                when (state.selectedTab) {
                    MyeCaTab.Home -> {
                        if (state.isSignedIn) WorkspaceHome(state, viewModel) else GuestHome(state, viewModel)
                    }
                    MyeCaTab.Services -> ServicesScreen(state, viewModel)
                    MyeCaTab.Tools -> ToolsScreen()
                    MyeCaTab.Help -> HelpAndLoginScreen(state, viewModel)
                    MyeCaTab.Documents -> DocumentsScreen(state, viewModel)
                    MyeCaTab.Payments -> PaymentsScreen(state, viewModel)
                    MyeCaTab.Account -> AccountScreen(state, viewModel)
                }
            }
        }
    }
}

private val guestTabs = listOf(MyeCaTab.Home, MyeCaTab.Services, MyeCaTab.Tools, MyeCaTab.Help)
private val signedInTabs = listOf(MyeCaTab.Home, MyeCaTab.Services, MyeCaTab.Documents, MyeCaTab.Payments, MyeCaTab.Account)

internal fun myeCaTabsFor(isSignedIn: Boolean): List<MyeCaTab> = if (isSignedIn) signedInTabs else guestTabs

@Composable
private fun MyeCaBottomBar(tabs: List<MyeCaTab>, selected: MyeCaTab, onSelected: (MyeCaTab) -> Unit) {
    NavigationBar(containerColor = Color.White, tonalElevation = 0.dp) {
        tabs.forEach { tab ->
            NavigationBarItem(
                selected = selected == tab,
                onClick = { onSelected(tab) },
                icon = { Icon(tab.icon(), contentDescription = tab.label) },
                label = { Text(tab.label, maxLines = 1, overflow = TextOverflow.Ellipsis) }
            )
        }
    }
}

@Composable
private fun LoadingState() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
            CircularProgressIndicator(color = MyeCaColors.Blue)
            Text("Preparing MyeCA", style = MaterialTheme.typography.bodyMedium, color = MyeCaColors.Muted)
        }
    }
}

@Composable
private fun GuestHome(state: MyeCaUiState, viewModel: MyeCaAppViewModel) {
    ScreenList {
        item {
            HeaderBlock(
                eyebrow = "MyeCA mobile",
                title = "Tax help, trimmed for your phone",
                subtitle = "Start a filing, compare TDS, request expert help, or sign in to continue your workspace."
            )
        }
        item {
            PrimaryActionCard(
                title = "File with CA review",
                description = "A focused route into ITR, GST, startup, and notice workflows.",
                action = "Browse services",
                onClick = { viewModel.selectTab(MyeCaTab.Services) }
            )
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                MiniMetric("Guest mode", "Services", Modifier.weight(1f))
                MiniMetric("Tools", "TDS", Modifier.weight(1f))
            }
        }
        item {
            MessageBanner(state.message)
        }
    }
}

@Composable
private fun WorkspaceHome(state: MyeCaUiState, viewModel: MyeCaAppViewModel) {
    val stats = state.dashboard?.stats
    val name = listOfNotNull(state.user?.firstName, state.user?.lastName).joinToString(" ").ifBlank {
        state.user?.email ?: "User"
    }

    ScreenList {
        item {
            HeaderBlock(
                eyebrow = "Workspace",
                title = "Welcome, $name",
                subtitle = "Track active services, missing documents, payment status, and CA support."
            )
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                MiniMetric("Active", "${state.services.size}", Modifier.weight(1f))
                MiniMetric("Pending", "${stats?.pendingTasks ?: 0}", Modifier.weight(1f))
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                MiniMetric("Documents", "${stats?.documentsUploaded ?: state.documents.size}", Modifier.weight(1f))
                MiniMetric("Returns", "${stats?.totalReturns ?: 0}", Modifier.weight(1f))
            }
        }
        item {
            PrimaryActionCard(
                title = nextActionTitle(state),
                description = nextActionDescription(state),
                action = "View services",
                onClick = { viewModel.selectTab(MyeCaTab.Services) }
            )
        }
        item {
            SectionTitle("Active services")
        }
        if (state.services.isEmpty()) {
            item {
                EmptyCard(
                    title = "No active services yet",
                    body = "Start a filing or compliance service to build your workspace."
                )
            }
        } else {
            items(state.services.take(4)) { service ->
                ServiceStatusCard(service = service)
            }
        }
        item {
            MessageBanner(state.message)
        }
    }
}

@Composable
private fun ServicesScreen(state: MyeCaUiState, viewModel: MyeCaAppViewModel) {
    ScreenList {
        item {
            HeaderBlock(
                eyebrow = "Services",
                title = "Choose the next step",
                subtitle = "Minimal service cards mapped to MyeCA's live service request API."
            )
        }
        items(myeCaServices) { item ->
            CatalogCard(
                item = item,
                signedIn = state.isSignedIn,
                busy = state.isRefreshing,
                onClick = { viewModel.createServiceRequest(item) }
            )
        }
        item {
            MessageBanner(state.message)
        }
    }
}

@Composable
private fun ToolsScreen() {
    Column(modifier = Modifier.fillMaxSize()) {
        HeaderBlock(
            eyebrow = "Tools",
            title = "TDS calculator",
            subtitle = "The existing native calculator is kept and re-themed as the app's first tool.",
            modifier = Modifier.padding(16.dp)
        )
        TdsScreen(PaddingValues(0.dp))
    }
}

@Composable
private fun HelpAndLoginScreen(state: MyeCaUiState, viewModel: MyeCaAppViewModel) {
    ScreenList {
        item {
            HeaderBlock(
                eyebrow = if (state.isSignedIn) "Help" else "Login",
                title = if (state.isSignedIn) "Get support" else "Open your MyeCA workspace",
                subtitle = if (state.isSignedIn) {
                    "Send a callback request or manage your account from the Account tab."
                } else {
                    "Use your MyeCA email and password. Google sign-in is a later native release item."
                }
            )
        }
        if (!state.isSignedIn) {
            item {
                LoginCard(state, viewModel)
            }
        }
        item {
            ConsultationCard(state, viewModel)
        }
        item {
            MessageBanner(state.message)
        }
    }
}

@Composable
private fun DocumentsScreen(state: MyeCaUiState, viewModel: MyeCaAppViewModel) {
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) viewModel.uploadDocument(uri)
    }

    ScreenList {
        item {
            HeaderBlock(
                eyebrow = "Documents",
                title = "Document vault",
                subtitle = "Upload and review files linked to your MyeCA account."
            )
        }
        item {
            Button(
                onClick = { launcher.launch(acceptedDocumentMimeTypes.toTypedArray()) },
                enabled = !state.isRefreshing,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = MyeCaColors.Blue)
            ) {
                Icon(Icons.Outlined.UploadFile, contentDescription = null)
                Spacer(Modifier.size(8.dp))
                Text(if (state.isRefreshing) "Uploading..." else "Upload document")
            }
        }
        if (state.documents.isEmpty()) {
            item { EmptyCard("No documents uploaded", "Use the upload button to add Form 16, AIS, receipts, or other files.") }
        } else {
            items(state.documents) { document ->
                DocumentCard(document)
            }
        }
        item { MessageBanner(state.message) }
    }
}

@Composable
private fun PaymentsScreen(state: MyeCaUiState, viewModel: MyeCaAppViewModel) {
    ScreenList {
        item {
            HeaderBlock(
                eyebrow = "Payments",
                title = "Payment requests",
                subtitle = "Request secure payment links for active service cases."
            )
        }
        if (state.services.isEmpty()) {
            item { EmptyCard("No service payments yet", "Start a service request to see payment status here.") }
        } else {
            items(state.services) { service ->
                PaymentCard(service, state.isRefreshing, viewModel::requestPaymentLink)
            }
        }
        item { MessageBanner(state.message) }
    }
}

@Composable
private fun AccountScreen(state: MyeCaUiState, viewModel: MyeCaAppViewModel) {
    val user = state.user
    ScreenList {
        item {
            HeaderBlock(
                eyebrow = "Account",
                title = user?.email ?: "MyeCA account",
                subtitle = "Identity, role, and secure session controls."
            )
        }
        item {
            InfoCard(
                title = "${user?.firstName ?: "MyeCA"} ${user?.lastName ?: ""}".trim(),
                body = "Role: ${clean(user?.role ?: "user")} | Status: ${clean(user?.status ?: "active")}"
            )
        }
        item {
            OutlinedButton(onClick = viewModel::refresh, modifier = Modifier.fillMaxWidth()) {
                Text("Refresh workspace")
            }
        }
        item {
            Button(
                onClick = viewModel::signOut,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = MyeCaColors.Navy)
            ) {
                Text("Sign out")
            }
        }
        item { MessageBanner(state.message) }
    }
}

@Composable
private fun LoginCard(state: MyeCaUiState, viewModel: MyeCaAppViewModel) {
    Card(colors = cardColors(), elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedTextField(
                value = state.email,
                onValueChange = viewModel::updateEmail,
                label = { Text("Email") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = state.password,
                onValueChange = viewModel::updatePassword,
                label = { Text("Password") },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                modifier = Modifier.fillMaxWidth()
            )
            Button(
                onClick = viewModel::signIn,
                enabled = !state.isAuthBusy,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = MyeCaColors.Blue)
            ) {
                Icon(Icons.AutoMirrored.Outlined.Login, contentDescription = null)
                Spacer(Modifier.size(8.dp))
                Text(if (state.isAuthBusy) "Signing in..." else "Sign in")
            }
        }
    }
}

@Composable
private fun ConsultationCard(state: MyeCaUiState, viewModel: MyeCaAppViewModel) {
    Card(colors = cardColors(), elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Request a callback", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            OutlinedTextField(
                value = state.consultationName,
                onValueChange = viewModel::updateConsultationName,
                label = { Text("Name") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = state.consultationEmail,
                onValueChange = viewModel::updateConsultationEmail,
                label = { Text("Email") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = state.consultationMessage,
                onValueChange = viewModel::updateConsultationMessage,
                label = { Text("What do you need help with?") },
                minLines = 3,
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedButton(onClick = viewModel::requestConsultation, modifier = Modifier.fillMaxWidth()) {
                Text("Send request")
            }
        }
    }
}

@Composable
private fun HeaderBlock(eyebrow: String, title: String, subtitle: String, modifier: Modifier = Modifier) {
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .background(MyeCaColors.Blue, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text("M", color = Color.White, fontWeight = FontWeight.Bold)
            }
            Text(eyebrow.uppercase(), style = MaterialTheme.typography.labelMedium, color = MyeCaColors.Blue)
        }
        Text(title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = MyeCaColors.Navy)
        Text(subtitle, style = MaterialTheme.typography.bodyMedium, color = MyeCaColors.Muted)
    }
}

@Composable
private fun PrimaryActionCard(title: String, description: String, action: String, onClick: () -> Unit) {
    Card(colors = CardDefaults.cardColors(containerColor = MyeCaColors.Blue), elevation = CardDefaults.cardElevation(0.dp)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color.White)
            Text(description, style = MaterialTheme.typography.bodyMedium, color = Color.White.copy(alpha = 0.82f))
            Button(
                onClick = onClick,
                colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = MyeCaColors.Blue)
            ) {
                Text(action)
            }
        }
    }
}

@Composable
private fun CatalogCard(item: MyeCaServiceCatalogItem, signedIn: Boolean, busy: Boolean, onClick: () -> Unit) {
    Card(colors = cardColors(), elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(item.category.uppercase(), style = MaterialTheme.typography.labelSmall, color = MyeCaColors.Teal)
            Text(item.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text(item.description, style = MaterialTheme.typography.bodyMedium, color = MyeCaColors.Muted)
            Text(item.price, style = MaterialTheme.typography.labelLarge, color = MyeCaColors.Navy)
            Button(
                onClick = onClick,
                enabled = !busy,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = MyeCaColors.Blue)
            ) {
                Text(if (signedIn) "Start request" else "Sign in to start")
            }
        }
    }
}

@Composable
private fun ServiceStatusCard(service: UserService) {
    InfoCard(
        title = service.serviceTitle ?: service.serviceId ?: "Service request",
        body = "${clean(service.status ?: "pending")} | ${service.assignedCaName ?: "CA not assigned yet"}"
    )
}

@Composable
private fun DocumentCard(document: DocumentItem) {
    InfoCard(
        title = document.name ?: document.originalName ?: "Document",
        body = "${clean(document.category ?: "other")} | ${clean(document.status ?: "active")}"
    )
}

@Composable
private fun PaymentCard(service: UserService, busy: Boolean, onRequestLink: (String) -> Unit) {
    Card(colors = cardColors(), elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(service.serviceTitle ?: service.serviceId ?: "Service request", fontWeight = FontWeight.Bold)
            Text("Payment: ${clean(service.paymentStatus ?: "pending")}", color = MyeCaColors.Muted)
            Button(
                onClick = { onRequestLink(service.id) },
                enabled = !busy && service.paymentStatus != "paid",
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = MyeCaColors.Teal)
            ) {
                Text(if (service.paymentStatus == "paid") "Paid" else "Request payment link")
            }
        }
    }
}

@Composable
private fun InfoCard(title: String, body: String) {
    Card(colors = cardColors(), elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)) {
        Row(Modifier.padding(16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .background(MyeCaColors.SurfaceSoft, MaterialTheme.shapes.medium),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Outlined.WorkspacePremium, contentDescription = null, tint = MyeCaColors.Blue)
            }
            Column(Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(body, color = MyeCaColors.Muted, maxLines = 2, overflow = TextOverflow.Ellipsis)
            }
        }
    }
}

@Composable
private fun MiniMetric(label: String, value: String, modifier: Modifier = Modifier) {
    Card(modifier = modifier, colors = cardColors(), elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(label.uppercase(), style = MaterialTheme.typography.labelSmall, color = MyeCaColors.Muted)
            Text(value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = MyeCaColors.Navy)
        }
    }
}

@Composable
private fun EmptyCard(title: String, body: String) {
    Card(colors = cardColors(), elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(title, fontWeight = FontWeight.Bold)
            Text(body, color = MyeCaColors.Muted)
        }
    }
}

@Composable
private fun MessageBanner(message: String?) {
    if (message.isNullOrBlank()) return
    Surface(color = MyeCaColors.SurfaceSoft, shape = MaterialTheme.shapes.medium) {
        Text(
            text = message,
            color = MyeCaColors.BlueDark,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(14.dp)
        )
    }
}

@Composable
private fun SectionTitle(value: String) {
    Text(value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = MyeCaColors.Navy)
}

@Composable
private fun ScreenList(content: androidx.compose.foundation.lazy.LazyListScope.() -> Unit) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        content = {
            content()
            item { Spacer(Modifier.height(8.dp)) }
        }
    )
}

internal fun nextActionTitle(state: MyeCaUiState): String {
    return when {
        state.services.isEmpty() -> "Start your first service"
        state.documents.isEmpty() -> "Add missing documents"
        else -> "Review active cases"
    }
}

internal fun nextActionDescription(state: MyeCaUiState): String {
    return when {
        state.services.isEmpty() -> "Choose ITR, GST, company setup, or notice support to create a case."
        state.documents.isEmpty() -> "Upload Form 16, AIS, receipts, or other files to help your CA move faster."
        else -> "Your workspace is ready. Check status, CA assignment, and payment actions."
    }
}

private fun clean(value: String): String = value.replace("_", " ").replaceFirstChar { it.uppercase() }

internal fun isValidEmailInput(value: String): Boolean {
    val email = value.trim()
    if (email.isBlank() || email.any { it.isWhitespace() }) return false
    val parts = email.split("@")
    if (parts.size != 2 || parts.any { it.isBlank() }) return false
    return "." in parts[1].trim('.')
}

internal fun isAuthFailure(error: Throwable): Boolean {
    return error is HttpException && error.code() in setOf(401, 403)
}

internal fun sessionExpiredState(): MyeCaUiState {
    return MyeCaUiState(
        isLoading = false,
        selectedTab = MyeCaTab.Help,
        message = "Your session expired. Sign in again to continue."
    )
}

internal fun workspaceRefreshIssueMessage(
    dashboardError: Throwable?,
    servicesError: Throwable?,
    documentsError: Throwable?
): String? {
    return if (dashboardError != null || servicesError != null || documentsError != null) {
        "Could not refresh all workspace data. Check your connection and try again."
    } else {
        null
    }
}

@Composable
private fun cardColors() = CardDefaults.cardColors(containerColor = Color.White)

private fun MyeCaTab.icon(): ImageVector = when (this) {
    MyeCaTab.Home -> Icons.Outlined.Home
    MyeCaTab.Services -> Icons.Outlined.WorkspacePremium
    MyeCaTab.Tools -> Icons.Outlined.Description
    MyeCaTab.Help -> Icons.Outlined.SupportAgent
    MyeCaTab.Documents -> Icons.Outlined.FolderOpen
    MyeCaTab.Payments -> Icons.Outlined.Payments
    MyeCaTab.Account -> Icons.Outlined.AccountCircle
}
