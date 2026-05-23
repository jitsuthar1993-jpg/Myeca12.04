#!/usr/bin/env bash
set -euo pipefail

BUNDLE="${1:-app/build/outputs/bundle/release/app-release.aab}"
REPORT_DIR="${2:-app/build/reports/bundle-metadata}"

if [[ ! -f "$BUNDLE" ]]; then
  echo "App bundle not found: $BUNDLE" >&2
  exit 1
fi

if command -v jar >/dev/null 2>&1; then
  JAR_BIN="$(command -v jar)"
elif [[ -n "${JAVA_HOME:-}" && -x "$JAVA_HOME/bin/jar" ]]; then
  JAR_BIN="$JAVA_HOME/bin/jar"
else
  echo "Unable to find jar. Set JAVA_HOME or add jar to PATH." >&2
  exit 1
fi

mkdir -p "$REPORT_DIR"
ENTRIES="$REPORT_DIR/release-bundle-entries.txt"

"$JAR_BIN" tf "$BUNDLE" > "$ENTRIES"

require_entry() {
  local entry="$1"
  if ! grep -qx "$entry" "$ENTRIES"; then
    echo "App bundle missing required entry: $entry" >&2
    exit 1
  fi
}

require_entry "BundleConfig.pb"
require_entry "BUNDLE-METADATA/com.android.tools.build.gradle/app-metadata.properties"
require_entry "base/manifest/AndroidManifest.xml"
require_entry "base/resources.pb"
require_entry "base/assets.pb"
require_entry "base/native.pb"
require_entry "base/dex/classes.dex"

echo "Verified release app bundle structure: $BUNDLE"
