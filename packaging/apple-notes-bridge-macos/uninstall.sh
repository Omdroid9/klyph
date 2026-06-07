#!/usr/bin/env bash
set -euo pipefail

LABEL="app.klyph.apple-notes-bridge"
INSTALL_DIR="$HOME/Library/Application Support/Klyph/apple-notes-bridge"
PURGE="false"

usage() {
  cat <<'EOF'
Usage:
  ./uninstall.sh [--label "<launchd-label>"] [--install-dir "<path>"] [--purge]

Stops and removes the LaunchAgent. Use --purge to also delete installed files.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --label)
      LABEL="${2:-}"
      shift 2
      ;;
    --install-dir)
      INSTALL_DIR="${2:-}"
      shift 2
      ;;
    --purge)
      PURGE="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
PLIST_PATH="$LAUNCH_AGENTS_DIR/$LABEL.plist"

launchctl bootout "gui/$UID/$LABEL" >/dev/null 2>&1 || true

if [[ -f "$PLIST_PATH" ]]; then
  rm -f "$PLIST_PATH"
fi

if [[ "$PURGE" == "true" ]]; then
  rm -rf "$INSTALL_DIR"
fi

echo "Uninstalled launch agent: $LABEL"
if [[ "$PURGE" == "true" ]]; then
  echo "Removed files: $INSTALL_DIR"
fi
