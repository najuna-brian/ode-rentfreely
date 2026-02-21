#!/usr/bin/env bash
# ─── Update Pre-Bundle ──────────────────────────────────────────
# Copies the latest RentFreely app bundle into the Formulus APK
# assets so that it ships pre-installed with the app.
#
# Usage:
#   ./scripts/update-pre-bundle.sh [path-to-bundle.zip]
#
# If no path is given, it defaults to the RentFreely workspace bundle.
# ──────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FORMULUS_DIR="$(dirname "$SCRIPT_DIR")"
DEFAULT_BUNDLE="$FORMULUS_DIR/../../RentFreely/app-bundles/bundle-v1.0.0.zip"

BUNDLE_PATH="${1:-$DEFAULT_BUNDLE}"

if [ ! -f "$BUNDLE_PATH" ]; then
  echo "❌ Bundle not found at: $BUNDLE_PATH"
  echo "   Build the RentFreely app first: cd RentFreely/app && npm run zip"
  exit 1
fi

# Android
ANDROID_DEST="$FORMULUS_DIR/android/app/src/main/assets/pre_bundle/bundle.zip"
mkdir -p "$(dirname "$ANDROID_DEST")"
cp "$BUNDLE_PATH" "$ANDROID_DEST"
echo "✅ Android pre-bundle updated ($(du -h "$ANDROID_DEST" | cut -f1))"

# iOS (if needed in the future)
# IOS_DEST="$FORMULUS_DIR/ios/pre_bundle/bundle.zip"
# mkdir -p "$(dirname "$IOS_DEST")"
# cp "$BUNDLE_PATH" "$IOS_DEST"
# echo "✅ iOS pre-bundle updated"

echo "Done! Rebuild the app to include the new bundle."
