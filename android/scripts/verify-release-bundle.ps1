param(
    [string]$Bundle = "app/build/outputs/bundle/release/app-release.aab",
    [string]$ReportDir = "app/build/reports/bundle-metadata"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $Bundle -PathType Leaf)) {
    throw "App bundle not found: $Bundle"
}

Add-Type -AssemblyName System.IO.Compression.FileSystem

New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null
$entriesPath = Join-Path $ReportDir "release-bundle-entries.txt"

$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $Bundle))
try {
    $entries = $zip.Entries | ForEach-Object { $_.FullName }
}
finally {
    $zip.Dispose()
}

$entries | Set-Content -Path $entriesPath -Encoding UTF8

$requiredEntries = @(
    "BundleConfig.pb",
    "BUNDLE-METADATA/com.android.tools.build.gradle/app-metadata.properties",
    "base/manifest/AndroidManifest.xml",
    "base/resources.pb",
    "base/assets.pb",
    "base/native.pb",
    "base/dex/classes.dex"
)

foreach ($entry in $requiredEntries) {
    if ($entries -notcontains $entry) {
        throw "App bundle missing required entry: $entry"
    }
}

Write-Host "Verified release app bundle structure: $Bundle"
