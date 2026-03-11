package com.myeca.smarttax

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Scaffold
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import com.myeca.smarttax.ui.theme.SmartTaxTheme
import com.myeca.smarttax.ui.screens.TdsScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SmartTaxTheme {
                AppRoot()
            }
        }
    }
}

@Composable
fun AppRoot() {
    Scaffold(
        topBar = { TopAppBar(title = { Text("TDS Calculator") }) }
    ) { padding ->
        TdsScreen(padding)
    }
}