package `in`.myeca.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import `in`.myeca.mobile.ui.MyeCAApp
import `in`.myeca.mobile.ui.theme.MyeCATheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MyeCATheme {
                MyeCAApp()
            }
        }
    }
}
