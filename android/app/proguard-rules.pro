# Keep Compose runtime classes
-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**

# Keep Moshi generated adapters (if used)
-keep class com.squareup.moshi.** { *; }
-dontwarn com.squareup.moshi.**

# Retrofit/Moshi reflection models used by the native MyeCA API layer.
-keep interface com.myeca.smarttax.core.network.*Service { *; }
-keep class com.myeca.smarttax.core.network.** { *; }
-keep class com.myeca.smarttax.core.network.model.** { *; }
-keep class kotlin.Metadata { *; }

# Optional compile-time annotation referenced by AndroidX Security/Tink.
-dontwarn com.google.errorprone.annotations.Immutable
