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
- Room for local persistence, with KSP for Room compiler code generation
- AndroidX Security Crypto for encrypted native session storage
- Kotlin Coroutines for async work
- JUnit + Compose testing for unit/instrumentation tests
- JUnit tests for pure app/catalog/upload rules
- Android Gradle Plugin 8.13.x, Kotlin 2.1.x, compile/target SDK 36

## Build & Run

1. Ensure `JAVA_HOME` points to a JDK 17 install. Android Studio's bundled JDK works on this machine:
   `C:\Program Files\Android\Android Studio\jbr`
2. Ensure `ANDROID_HOME` points to the Android SDK:
   `%LOCALAPPDATA%\Android\Sdk`
3. Install the Android API 36 platform in Android Studio SDK Manager or with `sdkmanager "platforms;android-36"`.
4. From the `android` directory run:
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
- Release signing is optional and only enabled when private keystore settings are provided outside the repository.

## Release Signing

Unsigned release builds remain the default and produce `app/build/outputs/apk/release/app-release-unsigned.apk`.

To sign a release build, provide all four values as environment variables or Gradle properties from outside Git:

- `MYECA_RELEASE_STORE_FILE`
- `MYECA_RELEASE_STORE_PASSWORD`
- `MYECA_RELEASE_KEY_ALIAS`
- `MYECA_RELEASE_KEY_PASSWORD`

The keystore path is resolved from the Android project root when relative. Files under `android/keystores/` and Android `.jks` or `.keystore` files are ignored by Git.

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
- Run: `.\gradlew.bat :app:bundleRelease`
- Run after release assembly:
  - Windows PowerShell: `.\scripts\verify-release-apk.ps1`
  - Windows PowerShell: `.\scripts\verify-release-bundle.ps1`
  - macOS/Linux: `bash scripts/verify-release-apk.sh`
  - macOS/Linux: `bash scripts/verify-release-bundle.sh`

## CI

- GitHub Actions workflow: `.github/workflows/android.yml`
- CI runs lint, unit tests, debug APK assembly, instrumentation test APK assembly, unsigned release APK assembly, and unsigned release app bundle generation from the `android/` project.
- CI installs the Android API 36 platform and build tools before running Gradle.
- CI verifies the unsigned release APK metadata for app id `in.myeca.app`, app label `MyeCA`, SDK 24/36, internet permission, disabled backup, disabled cleartext traffic, and non-debuggable release output.
- CI verifies the unsigned release app bundle contains the expected base module, manifest, resources, dex, and bundle metadata.
- CI uploads `myeca-debug-apk`, `myeca-debug-android-test-apk`, `myeca-release-unsigned-apk`, and `myeca-release-unsigned-aab` artifacts.
- CI also uploads lint, unit-test, and release metadata report artifacts to make failures easier to inspect.

## Device QA

- Debug APK output: `app/build/outputs/apk/debug/app-debug.apk`
- Instrumentation test APK output: `app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk`
- Unsigned release APK output: `app/build/outputs/apk/release/app-release-unsigned.apk`
- Unsigned release app bundle output: `app/build/outputs/bundle/release/app-release.aab`
- Manual QA still needs an emulator with hardware virtualization enabled or a physical Android device with USB debugging.
- On this Windows machine, the Android 35 AVD was created but could not boot because firmware virtualization is disabled and the Android Emulator Hypervisor Driver is unavailable.

## Configuration

- `NetworkModule` uses `https://myeca.in/` for app APIs and the public Supabase auth endpoint for email/password sign-in.
- The Supabase anon key is public client configuration, matching the web app.
- Play Store distribution still needs a private upload keystore and store listing assets.

## Next Steps

- Add native Google OAuth and push notifications after the v1 shell is validated.
- Complete Play Store listing assets and run manual device QA.
- Expand native instrumentation tests for login and workspace flows.
