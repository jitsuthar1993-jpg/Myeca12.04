# MyeCA Android

A minimal native Android application for MyeCA, built with Kotlin, Jetpack Compose, Material 3, Retrofit, and the existing MyeCA production APIs.

## Project Structure

```
android/
  app/
    src/main/java/com/myeca/smarttax/
      core/
        network/              # Retrofit clients and MyeCA/Supabase API definitions
      data/
        local/                # Room entities, DAO, Database
        repository/           # MyeCA auth, workspace, document, payment, and callback calls
      domain/
        usecase/              # Business use cases (e.g., CalculateTdsUseCase)
      ui/
        app/                  # Minimal MyeCA app shell and hybrid guest/workspace flow
        screens/              # Existing native tools such as the TDS calculator
        theme/                # MyeCA Material theme
```

## Tech Stack

- Jetpack Compose (Material 3) for UI
- MVVM + StateFlow for state management
- Retrofit + OkHttp + Moshi for networking
- Room for local persistence
- AndroidX Security Crypto for encrypted native session storage
- Kotlin Coroutines for async work
- JUnit + Compose testing for unit/instrumentation tests
- JUnit tests for pure app/catalog/upload rules

## Build & Run

1. Ensure `JAVA_HOME` points to a JDK. Android Studio's bundled JDK works on this machine:
   `C:\Program Files\Android\Android Studio\jbr`
2. Ensure `ANDROID_HOME` points to the Android SDK:
   `%LOCALAPPDATA%\Android\Sdk`
3. From the `android` directory run:
   - Windows PowerShell: `.\gradlew.bat :app:assembleDebug`
   - macOS/Linux: `./gradlew :app:assembleDebug`

## Architecture Notes

- `MyeCaApp` is the primary native shell.
- Guest navigation: Home, Services, Tools, Help/Login.
- Signed-in navigation: Home, Services, Documents, Payments, Account.
- `MyeCaRepository` uses Supabase email/password auth, refreshes saved sessions on app start, and calls the existing MyeCA production APIs with `Authorization: Bearer <token>`.
- Session access/refresh tokens are stored in `EncryptedSharedPreferences`; old plain `myeca_native_session` preferences are migrated and cleared.
- Document upload is limited to the same 10 MB PDF/image/Word/Excel types accepted by the backend.

## Security Notes

- Cleartext HTTP traffic is disabled in the app manifest.
- Android Auto Backup is disabled so local session preferences are not backed up or restored across devices.
- OkHttp request logging is enabled only for debug builds and disabled for release builds.
- Release builds are minified with R8 and include keep rules for Retrofit/Moshi DTOs plus AndroidX Security/Tink.

## Accessibility

- Compose semantics (`contentDescription`) added for key inputs and toggles.
- Material 3 uses the MyeCA blue/navy/teal palette with light surfaces.
- Avoid color-only indicators; use text and icons where applicable.

## Testing

- Unit tests for domain logic (e.g., `CalculateTdsUseCaseTest`).
- Unit tests for MyeCA tabs, catalog, next-action copy, email validation, and upload rules.
- Run: `.\gradlew.bat :app:lintDebug`
- Run: `.\gradlew.bat :app:testDebugUnitTest`
- Run: `.\gradlew.bat :app:assembleDebug`
- Run: `.\gradlew.bat :app:assembleDebugAndroidTest`
- Run: `.\gradlew.bat :app:assembleRelease`

## CI

- GitHub Actions workflow: `.github/workflows/android.yml`
- CI runs lint, unit tests, debug APK assembly, instrumentation test APK assembly, and unsigned release APK assembly from the `android/` project.
- CI uploads `myeca-debug-apk`, `myeca-debug-android-test-apk`, and `myeca-release-unsigned-apk` artifacts.
- CI also uploads lint and unit-test report artifacts to make failures easier to inspect.

## Device QA

- Debug APK output: `app/build/outputs/apk/debug/app-debug.apk`
- Instrumentation test APK output: `app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk`
- Unsigned release APK output: `app/build/outputs/apk/release/app-release-unsigned.apk`
- Manual QA still needs an emulator with hardware virtualization enabled or a physical Android device with USB debugging.
- On this Windows machine, the Android 35 AVD was created but could not boot because firmware virtualization is disabled and the Android Emulator Hypervisor Driver is unavailable.

## Configuration

- `NetworkModule` uses `https://myeca.in/` for app APIs and the public Supabase auth endpoint for email/password sign-in.
- The Supabase anon key is public client configuration, matching the web app.
- Release signing is not configured yet; Play Store distribution still needs a private keystore and signing config.

## Next Steps

- Add Play Store release signing and app icon polish before production release.
- Add native Google OAuth and push notifications after the v1 shell is validated.
- Expand native instrumentation tests for login and workspace flows.
