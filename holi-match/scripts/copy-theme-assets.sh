#!/usr/bin/env bash
#
# Copies the active theme's assets/ directory into /public/
# so Next.js can serve them as static files.
#
# Usage:  THEME=holi ./scripts/copy-theme-assets.sh
#         (defaults to "holi" if THEME is not set)
#
# The script:
#   1. Reads THEME from environment (default: holi)
#   2. Removes any previously copied theme assets from /public/
#   3. Copies themes/$THEME/assets/* into /public/ preserving subdirectory structure
#
# After running, /public/backgrounds/holi-match-2-bkg1.png is available at
# /backgrounds/holi-match-2-bkg1.png in the browser.

set -euo pipefail

THEME="${THEME:-holi}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ASSETS_DIR="$PROJECT_ROOT/themes/$THEME/assets"
PUBLIC_DIR="$PROJECT_ROOT/public"

if [ ! -d "$ASSETS_DIR" ]; then
  echo "Error: Theme assets directory not found: $ASSETS_DIR" >&2
  exit 1
fi

# Asset subdirectories managed by this script.
# Only these are cleaned/copied — other files in /public/ are left alone.
ASSET_DIRS="avatars backgrounds branding cards decks favicon sounds"

mkdir -p "$PUBLIC_DIR"

echo "Copying theme assets: $THEME → public/"

for dir in $ASSET_DIRS; do
  # Clean previous copy
  rm -rf "$PUBLIC_DIR/$dir"
  # Copy if source exists
  if [ -d "$ASSETS_DIR/$dir" ]; then
    cp -r "$ASSETS_DIR/$dir" "$PUBLIC_DIR/$dir"
    echo "  ✓ $dir/"
  fi
done

echo "Done."
