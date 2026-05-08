# MyeCA Minimal Android App

A standalone native Android app for MyeCA, built with Kotlin, Jetpack Compose, Material 3, Navigation Compose, Retrofit/OkHttp, Moshi, and mock-first repositories ready for live API integration.

## What Is Included

- Native Compose app with package/application id `in.myeca.mobile`
- Bottom navigation: Home, File, Tools, Services, Account
- Core screens: onboarding/welcome, dashboard, ITR filing shell, calculators, documents, AI assistant, services, and account
- Mock repositories for v1 screen data
- Retrofit service and API config using `MYECA_API_BASE_URL`, defaulting to `https://myeca.in`
- Unit and Compose UI test scaffolding

## Build

```powershell
.\gradlew.bat :app:assembleDebug
```

The lightweight bootstrap scripts download Gradle 8.7 if a local Gradle installation is not available. Android SDK and JDK 17 are still required.

Override the API base URL:

```powershell
.\gradlew.bat :app:assembleDebug -PMYECA_API_BASE_URL=https://staging.myeca.in
```

## Test

```powershell
.\gradlew.bat :app:testDebugUnitTest
.\gradlew.bat :app:connectedDebugAndroidTest
```

## Project Shape

```text
app/src/main/java/in/myeca/mobile/
  MainActivity.kt
  data/
    mock/
    network/
  domain/
    model/
    repository/
  ui/
    components/
    navigation/
    screens/
    theme/
```
