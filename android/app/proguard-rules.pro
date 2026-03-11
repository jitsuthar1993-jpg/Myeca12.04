# Keep Compose runtime classes
-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**

# Keep Moshi generated adapters (if used)
-keep class com.squareup.moshi.** { *; }
-dontwarn com.squareup.moshi.**