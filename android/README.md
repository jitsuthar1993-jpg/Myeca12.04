# SmartTax Calculator Android

A modern Android application implementing Clean Architecture, MVVM, Jetpack Compose UI, Material 3, Retrofit network layer, Room persistence, robust error handling, testing, CI, accessibility, and dark mode.

## Project Structure

```
android/
  app/
    src/main/java/com/myeca/smarttax/
      core/
        network/              # Retrofit client, API definitions, safe calls
        util/                 # Result wrapper and common utilities
      data/
        local/                # Room entities, DAO, Database
        repository/           # Repositories bridging data sources
      domain/
        usecase/              # Business use cases (e.g., CalculateTdsUseCase)
      ui/
        screens/              # Compose screens (e.g., TdsScreen)
        theme/                # Material theme, dark mode
      viewmodel/              # MVVM ViewModels (e.g., TdsViewModel)
```

## Tech Stack

- Jetpack Compose (Material 3) for UI
- MVVM + StateFlow for state management
- Retrofit + OkHttp + Moshi for networking
- Room for local persistence
- Kotlin Coroutines for async work
- JUnit + Compose testing for unit/instrumentation tests
- GitHub Actions CI for build and tests

## Build & Run

1. Ensure JDK 17 is installed.
2. From the `android` directory run:
   - Windows PowerShell: `./gradlew.bat assembleDebug` (after wrapper is generated)
   - macOS/Linux: `./gradlew assembleDebug`
3. If Gradle wrapper is missing, generate it:
   - Install Gradle locally and run `gradle wrapper` in the `android` directory.

## Architecture Notes

- Use cases contain pure business logic, independent of UI or data layers.
- ViewModels expose immutable `StateFlow` UI state and handle UI events.
- Repositories orchestrate network and database sources.
- `AppResult` is a sealed class to model success/error across boundaries.
- `safeApiCall` converts exceptions into `AppResult.Error`.

## Accessibility

- Compose semantics (`contentDescription`) added for key inputs and toggles.
- Material 3 with dynamic color and dark mode ensures contrast compliance.
- Avoid color-only indicators; use text and icons where applicable.

## Testing

- Unit tests for domain logic (e.g., `CalculateTdsUseCaseTest`).
- Instrumentation tests for Compose screens (e.g., `TdsScreenTest`).
- Run: `./gradlew :app:test` and `./gradlew :app:connectedAndroidTest`.

## CI/CD

- GitHub Actions workflow at `.github/workflows/android.yml` runs build and tests.
- Ensure Gradle wrapper is committed for CI to run successfully.

## Coding Guidelines

- Follow Kotlin style conventions; prefer immutable data and pure functions.
- Keep functions small, focused, and documented when non-obvious.
- Avoid leaking framework types into domain; keep boundaries clean.

## Configuration

- `NetworkModule` uses a placeholder base URL. Replace with your API endpoint.
- Add secrets (if any) via CI environment variables; avoid hardcoding.

## Next Steps

- Wire `TdsRepository` into `TdsViewModel` and add history UI.
- Add more calculators and reuse patterns/components.
- Expand tests for edge cases and error scenarios.