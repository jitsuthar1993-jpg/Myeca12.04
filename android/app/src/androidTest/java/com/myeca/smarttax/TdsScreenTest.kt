package com.myeca.smarttax

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithText
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.myeca.smarttax.ui.screens.TdsScreen
import com.myeca.smarttax.ui.theme.SmartTaxTheme
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class TdsScreenTest {
    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun screenRendersInputsAndCalculateButton() {
        composeRule.setContent {
            SmartTaxTheme {
                TdsScreen()
            }
        }

        composeRule.onNodeWithContentDescription("Income amount input").assertIsDisplayed()
        composeRule.onNodeWithContentDescription("Income type selector").assertIsDisplayed()
        composeRule.onNodeWithText("Calculate TDS").assertIsDisplayed()
    }
}