# Chute

Chute is a Tauri v2 desktop capture app (Rust + React + TypeScript) optimized for fast thought/task capture.

## Features in this build
- Global hotkey capture window (`Ctrl+Shift+Space` on Windows, `Cmd+Shift+Space` on macOS)
- System tray app with quick actions
- Local SQLite storage
- History window with edit support
- Per-capture list + destination routing
- Sync engine for Slack, Discord, Notion, and Google Tasks
- Starter Apple Notes bridge path for macOS (local automation)
- OAuth-first integrations UI with Advanced manual fallback

## Run the desktop app
```bash
npm install
npm run tauri dev
```

## OAuth bridge server (for one-click Connect buttons)
Chute desktop uses a small backend service for OAuth token exchange for Slack/Discord/Notion/Google.

### 1) Install and run auth server
```bash
npm run auth:install
npm run auth:dev
```

The server runs at `http://127.0.0.1:8787` by default.

### 2) Configure environment variables
```bash
cd auth-server
copy .env.example .env
```

Set provider client IDs/secrets in `auth-server/.env`.

### 3) Configure provider redirect URLs
Set redirect URLs in each provider dashboard to match `.env` defaults:
- `http://127.0.0.1:8787/oauth/slack/callback`
- `http://127.0.0.1:8787/oauth/discord/callback`
- `http://127.0.0.1:8787/oauth/notion/callback`
- `http://127.0.0.1:8787/oauth/google/callback`

### 4) Connect from the app
Open Chute Settings -> Integrations -> click `Connect` for each provider.

## Hosting the OAuth bridge (so users don't run a local server)
For real distribution, host the bridge once and point the app at it (Settings -> Integrations -> OAuth Backend URL).

The bridge is a stateless-except-for-sessions Express app and ships with a `Dockerfile` (`auth-server/Dockerfile`) so it runs on any Docker host, plus a Render blueprint (`auth-server/render.yaml`).

Steps (any host):
1. Deploy `auth-server/` (Docker image or Node `npm start`). On Render: New -> Blueprint -> select `auth-server/render.yaml`.
2. Set env vars in the host dashboard: `APP_BASE_URL` (the public HTTPS URL of the service) and the provider client IDs/secrets. `PORT` is injected by most hosts.
3. Register each provider's redirect URL as `<APP_BASE_URL>/oauth/<provider>/callback` (https), e.g. `https://your-bridge.example.com/oauth/google/callback`.
4. In the app, set OAuth Backend URL to `APP_BASE_URL` and click Connect.

Caveats:
- The bridge keeps OAuth sessions in memory, so run a **single instance** (no autoscaling).
- Apple Notes endpoints only work on a macOS host; they report "unsupported" elsewhere, which is expected.

## Notes
- Apple Notes sync uses a local macOS bridge (AppleScript/Shortcuts). See `docs/APPLE_NOTES_BRIDGE.md`.
- Mac tester package can be generated with `npm run package:apple-bridge`.
- Advanced manual webhook/token inputs are still available under `Show Advanced`.
- Notion parent supports both page IDs and database IDs.

## Sync reliability semantics
Chute retries failed syncs and records the last error per capture (shown in History).

- **Google Calendar is idempotent.** Events use a deterministic id derived from the capture id, so a retried request whose response was lost will not create a duplicate event.
- **Slack, Discord, Google Tasks, and Notion are at-least-once.** These APIs expose no client-set id or idempotency key, so in the rare case where a request reaches the provider but the response is lost, a retry can create a duplicate. This is a provider limitation, not a bug.
- Editing a capture does not re-post to destinations it has already synced to; it only syncs destinations that are newly enabled or not yet sent.

## Testing
```bash
npm test          # run unit tests once (Vitest)
npm run test:watch
```
Covered: natural-language reminder parsing, sync gating rules (including the calendar requires-a-time guard), and Google Calendar idempotency.

## Friend / beta testing
- **Build an installer:** `npm run friend:build`
- **Tester guide:** [docs/FRIEND_TESTING.md](docs/FRIEND_TESTING.md)
- Host the OAuth bridge (see above) and give testers your public **OAuth Backend URL** — localhost auth only works on the same machine running `npm run auth:dev`.

## Marketing website
Apple-style product page with app mockups for advertising / beta signups:
```bash
npm run website:dev     # preview at http://localhost:5173
npm run website:build   # static files in website/dist/
```
Update the download link in `website/index.html` (#download) with your installer or GitHub Release URL.

## Production rollout (small beta)
- Follow the full checklist in `docs/PRODUCTION_CHECKLIST.md`.
- Minimum command checklist:
  - `npm run beta:check`
  - `npm run lint`
  - `npm run build`
  - `npm run tauri dev`
  - `npm run tauri build`
- If any secret/client secret was shared in screenshots or chat, rotate it before distributing builds.
