package `in`.myeca.mobile

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import org.junit.Rule
import org.junit.Test

class MyeCAAppNavigationTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun appLaunchesToHome() {
        composeRule.onNodeWithText("Your tax cockpit").assertIsDisplayed()
        composeRule.onNodeWithContentDescription("Home tab").assertIsDisplayed()
    }

    @Test
    fun bottomNavigationSwitchesPrimaryTabs() {
        composeRule.onNodeWithContentDescription("File tab").performClick()
        composeRule.onNodeWithText("File ITR").assertIsDisplayed()

        composeRule.onNodeWithContentDescription("Tools tab").performClick()
        composeRule.onNodeWithText("Tax tools").assertIsDisplayed()

        composeRule.onNodeWithContentDescription("Services tab").performClick()
        composeRule.onNodeWithText("Choose the right tax, GST, startup, or notice support without a long sales flow.").assertIsDisplayed()

        composeRule.onNodeWithContentDescription("Account tab").performClick()
        composeRule.onNodeWithText("Identity, preferences, documents, and support in one compact profile.").assertIsDisplayed()
    }

    @Test
    fun quickActionNavigatesToAssistant() {
        composeRule.onNodeWithContentDescription("Open Ask CA").performClick()
        composeRule.onNodeWithText("AI assistant").assertIsDisplayed()
    }
}
