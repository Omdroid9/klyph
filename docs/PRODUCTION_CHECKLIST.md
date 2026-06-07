# Klyph Production Checklist (Small Beta)

Use this checklist to ship Klyph safely to a small set of users (friends, team, pilot customers) with low/no fixed cost.

## Phase 1: Security Baseline (must pass before sharing binaries)

1. Secrets storage
- Sensitive app settings are stored in Tauri Store (`secure-settings.json`) and migrated out of SQLite automatically.
- Keep `auth-server/.env` local and never commit it.

2. Repository hygiene
- Confirm `.gitignore` excludes `.env*`, `auth-server/.env*`, `src-tauri/target/`, and database files.
- Rotate any provider secret that was ever shown in screenshots, chat, or commits.

3. OAuth backend hardening
- Set strong, unique secrets for Slack/Discord/Notion/Google in `auth-server/.env`.
- Restrict deployment access to HTTPS only for public users.
- Add a rate limit/reverse proxy if backend is publicly reachable.

## Phase 2: Reliability (must pass before external testers)

1. Clean builds
- Frontend: `npm run lint` and `npm run build`
- Desktop (dev sanity): `npm run tauri dev`
- Packaging smoke test: `npm run tauri build`

2. Core flow validation
- Hotkey opens capture quickly.
- `Enter` saves and hides.
- `Shift+Enter` saves and keeps open.
- `Esc` closes without saving.
- Capture text clears after save.

3. Integrations validation
- Slack, Discord, Google each pass connect + test send.
- Backfill unsynced captures works.
- Offline capture and later sync works.

4. Data safety
- Verify DB initializes from empty install.
- Verify schema migrations on existing users.
- Verify sensitive keys are not present in SQLite `settings`.

## Phase 3: Distribution (small beta)

1. Release channels
- Windows first (single target).
- macOS second (signing/notarization required for smoother install trust).

2. Installer strategy (low cost)
- Keep updater disabled initially.
- Ship manual installer links (GitHub Releases is fine for early beta).
- Keep a short changelog per version.

3. Support
- Add in-app "Report issue" link.
- Keep one feedback channel (Discord/Slack/email).
- Capture crash logs and repro steps for each bug.

## Phase 4: Public-ready polish

1. Auth UX
- Production-host OAuth backend so end users never paste client IDs/secrets.
- Keep "Advanced" manual fields hidden by default.

2. Performance
- Measure hotkey-to-window latency.
- Track idle memory footprint and startup time.

3. Safety controls
- Add integration-level toggles and clear sync status.
- Add "Export captures" and "Delete all local data" actions.

## Free / low-cost deployment suggestion

1. Desktop app binaries: GitHub Releases.
2. OAuth backend:
- Free tiers: Render/Fly.io/Railway (small usage).
- Env vars only in host dashboard (never in client app).
3. Domain/TLS:
- Optional initially; required before broader rollout.

## Launch gate (definition of done for beta)

All items below must be true:
- Security baseline complete.
- Core flow and integration tests pass on at least 2 clean machines.
- One rollback plan exists (previous installer still available).
- One-page onboarding doc exists for first-time users.
