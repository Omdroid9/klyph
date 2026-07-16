# Apple Notes Bridge (macOS)

This project now includes a starter local bridge for Apple Notes using the existing `auth-server`.

## Why this approach

Apple Notes does not expose a stable cross-platform public cloud API, so Chute sync uses local macOS automation instead:

- `AppleScript` via `osascript` (default)
- `Shortcuts` CLI via `/usr/bin/shortcuts`

The Notes app handles iCloud sync after the note is created locally.

## API contract

Base URL: same backend used by integrations, default `http://127.0.0.1:8787`.

### `GET /api/apple-notes/status`

Returns bridge capability for the current machine.

Example response:

```json
{
  "ok": true,
  "supported": true,
  "platform": "darwin",
  "methods": {
    "applescript": true,
    "shortcut": true
  }
}
```

### `POST /api/apple-notes/create`

Creates one note.

Request:

```json
{
  "title": "Buy camera batteries",
  "body": "Need AA + AAA for trip.",
  "folder": "Chute",
  "tags": ["personal", "Inbox"],
  "createdAt": "2026-05-04T22:10:00.000Z",
  "sourceUrl": "chute://capture/abc-123",
  "method": "applescript",
  "shortcutName": "Chute Save Note"
}
```

Required fields:

- `title`
- `body`

Optional fields:

- `folder`
- `tags` (string array)
- `createdAt`
- `sourceUrl`
- `method`: `applescript` or `shortcut`
- `shortcutName` (used when `method=shortcut`)

Success response:

```json
{
  "ok": true,
  "method": "applescript",
  "title": "Buy camera batteries"
}
```

Error response:

```json
{
  "ok": false,
  "error": "Apple Notes bridge is only supported on macOS (darwin)."
}
```

## Starter AppleScript implementation

File: `auth-server/apple-notes/create-note.applescript`

Behavior:

- Uses the first Notes account.
- Creates folder if missing.
- Creates a new note with provided title/body.

## Starter Shortcuts implementation

The bridge can call:

```bash
shortcuts run "Chute Save Note" --input-type text --input-path <json-file>
```

Expected shortcut input JSON shape:

```json
{
  "title": "string",
  "body": "string",
  "folder": "string",
  "tags": ["string"],
  "createdAt": "string",
  "sourceUrl": "string"
}
```

Recommended shortcut actions:

1. `Get Dictionary from Input`
2. Read `title`, `body`, and `folder`
3. `Create Note` in Apple Notes

## Chute app settings

Open Settings -> Integrations -> Show Advanced, then configure:

- `Apple Notes Bridge URL`
- `Apple Notes Method`
- `Apple Notes Folder`
- `Shortcut Name` (if using shortcut method)

Use **Test Apple Notes Bridge** to verify server reachability.

## Packaging for external Mac testers

This repo includes a packaging script that creates a portable installer zip:

```powershell
npm run package:apple-bridge
```

Output file:

- `dist/chute-apple-notes-bridge-macos-v0.1.0.zip`

Inside the zip, testers run:

```bash
chmod +x install.sh uninstall.sh
./install.sh
```
