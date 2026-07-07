#!/bin/bash
# Build static export for demo distribution
# Usage: cd abtg-options && ./demo/build-demo.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DEMO_DIST="$SCRIPT_DIR/dist"

echo "=== ABTG Options Visualizer — Demo Build ==="
echo ""

cd "$PROJECT_DIR"

# Clean previous build
rm -rf "$DEMO_DIST"
rm -rf .next out

echo "[1/3] Building static export..."
DEMO_BUILD=true npm run build

echo "[2/3] Copying to demo/dist/..."
if [ -d "out" ]; then
  cp -r out "$DEMO_DIST"
else
  echo "ERROR: 'out' directory not found. Static export may have failed."
  echo "Make sure next.config.js supports output: 'export' when DEMO_BUILD=true."
  exit 1
fi

echo "[3/3] Build complete!"
echo ""
echo "Output: $DEMO_DIST"
echo ""
echo "Per mandare ai tester, zippare:"
echo "  demo/dist/"
echo "  demo/sample-trades.json"
echo "  demo/test-scenarios.md"
echo "  demo/README.md"
echo ""
echo "I tester possono aprire dist/index.html nel browser."
