package com.myeca.smarttax

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.enableEdgeToEdge
import androidx.activity.compose.setContent
import com.myeca.smarttax.ui.app.MyeCaApp
import com.myeca.smarttax.ui.theme.MyeCaTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyeCaTheme {
                MyeCaApp()
            }
        }
    }
}
