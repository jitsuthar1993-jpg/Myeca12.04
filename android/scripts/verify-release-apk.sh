#!/usr/bin/env bash
set -euo pipefail

APK="${1:-app/build/outputs/apk/release/app-release-unsigned.apk}"
REPORT_DIR="${2:-app/build/reports/apk-metadata}"

if [[ -n "${AAPT2:-}" ]]; then
  AAPT2_BIN="$AAPT2"
elif [[ -n "${ANDROID_HOME:-}" && -x "$ANDROID_HOME/build-tools/36.0.0/aapt2" ]]; then
  AAPT2_BIN="$ANDROID_HOME/build-tools/36.0.0/aapt2"
else
  AAPT2_BIN="$(find "${ANDROID_HOME:-$HOME/Android/Sdk}/build-tools" -name aapt2 -type f 2>/dev/null | sort -V | tail -n 1)"
fi

if [[ -z "${AAPT2_BIN:-}" || ! -x "$AAPT2_BIN" ]]; then
  echo "Unable to find aapt2. Set ANDROID_HOME or AAPT2." >&2
  exit 1
fi

if [[ ! -f "$APK" ]]; then
  echo "APK not found: $APK" >&2
  exit 1
fi

mkdir -p "$REPORT_DIR"
BADGING="$REPORT_DIR/release-badging.txt"
MANIFEST="$REPORT_DIR/release-manifest.txt"

"$AAPT2_BIN" dump badging "$APK" > "$BADGING"
"$AAPT2_BIN" dump xmltree --file AndroidManifest.xml "$APK" > "$MANIFEST"

grep -q "package: name='in.myeca.app'" "$BADGING"
grep -q "application-label:'MyeCA'" "$BADGING"
grep -q "minSdkVersion:'24'" "$BADGING"
grep -q "targetSdkVersion:'36'" "$BADGING"
grep -q "uses-permission: name='android.permission.INTERNET'" "$BADGING"
grep -q "allowBackup.*=false" "$MANIFEST"
grep -q "fullBackupContent.*=false" "$MANIFEST"
grep -q "usesCleartextTraffic.*=false" "$MANIFEST"
grep -q "dataExtractionRules" "$MANIFEST"
! grep -q "debuggable" "$MANIFEST"

echo "Verified release APK metadata: $APK"
