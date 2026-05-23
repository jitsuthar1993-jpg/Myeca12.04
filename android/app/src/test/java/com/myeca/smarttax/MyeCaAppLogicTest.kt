package com.myeca.smarttax

import com.myeca.smarttax.core.network.DocumentItem
import com.myeca.smarttax.core.network.UserService
import com.myeca.smarttax.ui.app.MyeCaTab
import com.myeca.smarttax.ui.app.MyeCaUiState
import com.myeca.smarttax.ui.app.consultationValidationMessage
import com.myeca.smarttax.ui.app.isAuthFailure
import com.myeca.smarttax.ui.app.isValidEmailInput
import com.myeca.smarttax.ui.app.myeCaTabsFor
import com.myeca.smarttax.ui.app.nextActionDescription
import com.myeca.smarttax.ui.app.nextActionTitle
import com.myeca.smarttax.ui.app.sessionExpiredState
import com.myeca.smarttax.ui.app.workspaceRefreshIssueMessage
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import retrofit2.HttpException
import retrofit2.Response

class MyeCaAppLogicTest {
    @Test
    fun `guest tabs match public app flow`() {
        assertEquals(
            listOf(MyeCaTab.Home, MyeCaTab.Services, MyeCaTab.Tools, MyeCaTab.Help),
            myeCaTabsFor(isSignedIn = false)
        )
    }

    @Test
    fun `signed in tabs match workspace flow`() {
        assertEquals(
            listOf(MyeCaTab.Home, MyeCaTab.Services, MyeCaTab.Documents, MyeCaTab.Payments, MyeCaTab.Account),
            myeCaTabsFor(isSignedIn = true)
        )
    }

    @Test
    fun `next action starts with service when workspace is empty`() {
        val state = MyeCaUiState(isLoading = false, isSignedIn = true)

        assertEquals("Start your first service", nextActionTitle(state))
        assertTrue(nextActionDescription(state).contains("Choose ITR"))
    }

    @Test
    fun `next action asks for documents when service exists without documents`() {
        val state = MyeCaUiState(
            isLoading = false,
            isSignedIn = true,
            services = listOf(UserService(id = "svc-1", serviceTitle = "ITR Filing"))
        )

        assertEquals("Add missing documents", nextActionTitle(state))
        assertTrue(nextActionDescription(state).contains("Upload Form 16"))
    }

    @Test
    fun `next action reviews cases when service and documents exist`() {
        val state = MyeCaUiState(
            isLoading = false,
            isSignedIn = true,
            services = listOf(UserService(id = "svc-1", serviceTitle = "ITR Filing")),
            documents = listOf(DocumentItem(id = "doc-1", name = "Form 16"))
        )

        assertEquals("Review active cases", nextActionTitle(state))
        assertTrue(nextActionDescription(state).contains("Check status"))
    }

    @Test
    fun `email validation rejects obvious invalid input`() {
        assertFalse(isValidEmailInput(""))
        assertFalse(isValidEmailInput("not-an-email"))
        assertFalse(isValidEmailInput("user@example"))
        assertFalse(isValidEmailInput("user name@example.com"))
        assertFalse(isValidEmailInput("user@.example.com"))
        assertFalse(isValidEmailInput("user@example..com"))
        assertFalse(isValidEmailInput("user@example.c"))
        assertFalse(isValidEmailInput("user@example-.com"))
        assertTrue(isValidEmailInput(" user@example.com "))
        assertTrue(isValidEmailInput("user+tax@example.co.in"))
    }

    @Test
    fun `consultation validation requires usable callback details`() {
        assertEquals(
            "Add name, email, and a short message.",
            consultationValidationMessage("", "user@example.com", "Need help")
        )
        assertEquals(
            "Enter a valid callback email address.",
            consultationValidationMessage("Aarav", "bad-email", "Need help")
        )
        assertEquals(
            null,
            consultationValidationMessage("Aarav", "user@example.com", "Need help with ITR")
        )
    }

    @Test
    fun `session expiry state returns user to login`() {
        val state = sessionExpiredState()

        assertFalse(state.isSignedIn)
        assertFalse(state.isLoading)
        assertEquals(MyeCaTab.Help, state.selectedTab)
        assertTrue(state.message.orEmpty().contains("Sign in again"))
    }

    @Test
    fun `auth failure only treats unauthorized responses as expired session`() {
        assertTrue(isAuthFailure(httpException(401)))
        assertTrue(isAuthFailure(httpException(403)))
        assertFalse(isAuthFailure(httpException(500)))
        assertFalse(isAuthFailure(IllegalStateException("network down")))
    }

    @Test
    fun `workspace refresh message appears only when refresh has errors`() {
        assertEquals(null, workspaceRefreshIssueMessage(null, null, null))
        assertTrue(
            workspaceRefreshIssueMessage(null, IllegalStateException("network down"), null)
                .orEmpty()
                .contains("Could not refresh")
        )
    }

    private fun httpException(code: Int): HttpException {
        val body = "error".toResponseBody(null)
        return HttpException(Response.error<String>(code, body))
    }
}
