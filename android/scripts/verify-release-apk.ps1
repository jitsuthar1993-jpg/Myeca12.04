param(
    [string]$Apk = "app/build/outputs/apk/release/app-release-unsigned.apk",
    [string]$ReportDir = "app/build/reports/apk-metadata",
    [string]$Aapt2 = $env:AAPT2
)

$ErrorActionPreference = "Stop"
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$apkPath = if ([System.IO.Path]::IsPathRooted($Apk)) { $Apk } else { Join-Path $projectRoot $Apk }
$reportPath = if ([System.IO.Path]::IsPathRooted($ReportDir)) { $ReportDir } else { Join-Path $projectRoot $ReportDir }

if (-not $Aapt2) {
    $androidHome = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { Join-Path $env:LOCALAPPDATA "Android\Sdk" }
    $preferred = Join-Path $androidHome "build-tools\36.0.0\aapt2.exe"
    if (Test-Path $preferred) {
        $Aapt2 = $preferred
    } else {
        $Aapt2 = Get-ChildItem (Join-Path $androidHome "build-tools") -Filter aapt2.exe -Recurse -ErrorAction SilentlyContinue |
            Sort-Object FullName -Descending |
            Select-Object -First 1 -ExpandProperty FullName
    }
}

if (-not $Aapt2 -or -not (Test-Path $Aapt2)) {
    throw "Unable to find aapt2. Set ANDROID_HOME or AAPT2."
}

if (-not (Test-Path $apkPath)) {
    throw "APK not found: $apkPath"
}

New-Item -ItemType Directory -Force -Path $reportPath | Out-Null
$badgingPath = Join-Path $reportPath "release-badging.txt"
$manifestPath = Join-Path $reportPath "release-manifest.txt"

& $Aapt2 dump badging $apkPath | Set-Content -Path $badgingPath
& $Aapt2 dump xmltree --file AndroidManifest.xml $apkPath | Set-Content -Path $manifestPath

$badging = Get-Content $badgingPath -Raw
$manifest = Get-Content $manifestPath -Raw
$checks = @(
    @{ Name = "package"; Pass = $badging -match "package: name='in\.myeca\.app'" },
    @{ Name = "label"; Pass = $badging -match "application-label:'MyeCA'" },
    @{ Name = "minSdk"; Pass = $badging -match "minSdkVersion:'24'" },
    @{ Name = "targetSdk"; Pass = $badging -match "targetSdkVersion:'36'" },
    @{ Name = "internet"; Pass = $badging -match "uses-permission: name='android\.permission\.INTERNET'" },
    @{ Name = "allowBackup false"; Pass = $manifest -match "allowBackup.*=false" },
    @{ Name = "fullBackupContent false"; Pass = $manifest -match "fullBackupContent.*=false" },
    @{ Name = "cleartext false"; Pass = $manifest -match "usesCleartextTraffic.*=false" },
    @{ Name = "dataExtractionRules"; Pass = $manifest -match "dataExtractionRules" },
    @{ Name = "not debuggable"; Pass = $manifest -notmatch "debuggable" }
)

foreach ($check in $checks) {
    if ($check.Pass) {
        Write-Output "OK $($check.Name)"
    } else {
        throw "Release APK metadata check failed: $($check.Name)"
    }
}

Write-Output "Verified release APK metadata: $apkPath"
