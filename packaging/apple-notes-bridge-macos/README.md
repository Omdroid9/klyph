# Chute Apple Notes Bridge (macOS Installer Bundle)

This bundle installs the Apple Notes bridge as a per-user macOS LaunchAgent.

## Requirements

- macOS 13+ recommended
- Node.js 20+ and npm
- Apple Notes app signed in to at least one account

## Install

From this bundle folder:

```bash
chmod +x install.sh uninstall.sh
./install.sh
```

Optional install flags:

```bash
./install.sh --port 8787 --shortcut-name "Chute Save Note"
```

## Verify

```bash
curl http://127.0.0.1:8787/api/apple-notes/status
```

## App settings

In Chute settings:

- Apple Notes Bridge URL: `http://127.0.0.1:8787`
- Apple Notes Method: `applescript` (or `shortcut`)
- Apple Notes Folder: `Chute`

## Uninstall

```bash
./uninstall.sh --purge
```
