@echo off
setlocal
set "ROOT=%~dp0"
set "GRADLE_VERSION=8.7"
set "BOOTSTRAP=%ROOT%.gradle\bootstrap"
set "GRADLE_HOME=%BOOTSTRAP%\gradle-%GRADLE_VERSION%"
set "GRADLE_BAT=%GRADLE_HOME%\bin\gradle.bat"

if not defined JAVA_HOME (
  if exist "%ProgramFiles%\Android\Android Studio\jbr" set "JAVA_HOME=%ProgramFiles%\Android\Android Studio\jbr"
)
if defined JAVA_HOME set "PATH=%JAVA_HOME%\bin;%PATH%"
where java >nul 2>nul
if errorlevel 1 (
  echo Java 17 is required. Install Android Studio or set JAVA_HOME before running this build.
  exit /b 1
)

if not exist "%GRADLE_BAT%" (
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference='Stop';" ^
    "$root='%ROOT%'; $bootstrap=Join-Path $root '.gradle\bootstrap';" ^
    "$zip=Join-Path $bootstrap 'gradle-%GRADLE_VERSION%-bin.zip';" ^
    "New-Item -ItemType Directory -Force -Path $bootstrap | Out-Null;" ^
    "if (!(Test-Path $zip)) { Invoke-WebRequest -Uri 'https://services.gradle.org/distributions/gradle-%GRADLE_VERSION%-bin.zip' -OutFile $zip };" ^
    "Expand-Archive -Path $zip -DestinationPath $bootstrap -Force"
)

call "%GRADLE_BAT%" %*
endlocal
