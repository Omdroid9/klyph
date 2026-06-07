#!/usr/bin/env bash
set -euo pipefail

LABEL="app.klyph.apple-notes-bridge"
PORT="8787"
SHORTCUT_NAME="Klyph Save Note"
INSTALL_DIR="$HOME/Library/Application Support/Klyph/apple-notes-bridge"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"

usage() {
  cat <<'EOF'
Usage:
  ./install.sh [--port 8787] [--install-dir "<path>"] [--shortcut-name "<name>"] [--label "<launchd-label>"]

Installs and starts the Klyph Apple Notes bridge as a per-user LaunchAgent.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)
      PORT="${2:-}"
      shift 2
      ;;
    --install-dir)
      INSTALL_DIR="${2:-}"
      shift 2
      ;;
    --shortcut-name)
      SHORTCUT_NAME="${2:-}"
      shift 2
      ;;
    --label)
      LABEL="${2:-}"
      shift 2
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

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This installer must run on macOS." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required but not found in PATH." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but not found in PATH." >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_ROOT="$SCRIPT_DIR"
AUTH_SRC="$PACKAGE_ROOT/auth-server"

if [[ ! -f "$AUTH_SRC/server.js" ]]; then
  echo "auth-server/server.js was not found next to install.sh" >&2
  exit 1
fi

mkdir -p "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR/logs"
mkdir -p "$LAUNCH_AGENTS_DIR"

rsync -a --delete "$AUTH_SRC/" "$INSTALL_DIR/auth-server/"

pushd "$INSTALL_DIR/auth-server" >/dev/null
if [[ ! -f ".env" && -f ".env.example" ]]; then
  cp .env.example .env
fi
rm -rf node_modules
npm ci --omit=dev
popd >/dev/null

PLIST_PATH="$LAUNCH_AGENTS_DIR/$LABEL.plist"
NODE_PATH="$(command -v node)"
WORK_DIR="$INSTALL_DIR/auth-server"
STDOUT_PATH="$INSTALL_DIR/logs/stdout.log"
STDERR_PATH="$INSTALL_DIR/logs/stderr.log"

cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE_PATH</string>
    <string>$WORK_DIR/server.js</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$WORK_DIR</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PORT</key>
    <string>$PORT</string>
    <key>APP_BASE_URL</key>
    <string>http://127.0.0.1:$PORT</string>
    <key>APPLE_NOTES_SHORTCUT_NAME</key>
    <string>$SHORTCUT_NAME</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$STDOUT_PATH</string>
  <key>StandardErrorPath</key>
  <string>$STDERR_PATH</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$UID/$LABEL" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$UID" "$PLIST_PATH"
launchctl kickstart -k "gui/$UID/$LABEL" >/dev/null 2>&1 || true

STATUS_URL="http://127.0.0.1:$PORT/api/apple-notes/status"
echo "Installed launch agent: $LABEL"
echo "Status URL: $STATUS_URL"
echo "Waiting for bridge health check..."

for _ in {1..15}; do
  if curl -fsS "$STATUS_URL" >/dev/null 2>&1; then
    echo "Bridge is running."
    exit 0
  fi
  sleep 1
done

echo "Bridge did not report healthy in time. Check logs:"
echo "  $STDOUT_PATH"
echo "  $STDERR_PATH"
exit 1
