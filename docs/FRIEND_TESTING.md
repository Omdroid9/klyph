# Friend testing guide

Use this when sending Chute to someone who is **not** setting up the dev environment.

## What you send

1. **Installer** — built on your machine:
   ```powershell
   npm run friend:build
   ```
   Pick the `.msi` or `.exe` from the path printed at the end (under `src-tauri/target/release/bundle/`).

2. **This doc** (or a short message with the same info).

3. **OAuth backend URL** — see below. Without this, Connect buttons will fail.

---

## OAuth (required for Slack / Discord / Notion / Google)

The desktop app does **not** embed provider secrets. A small auth server exchanges OAuth codes for tokens.

### Recommended: you host the bridge

1. Deploy `auth-server/` (Render blueprint: `auth-server/render.yaml`, or any Node/Docker host).
2. Set env vars on the host: `APP_BASE_URL`, provider client IDs/secrets.
3. Register redirect URLs like `https://YOUR-HOST/oauth/slack/callback` (and discord, notion, google).
4. Give your friend the public URL, e.g. `https://klyph-auth.onrender.com`.

**In the app:** Settings → Integrations → **OAuth Backend URL** → paste your HTTPS URL → Connect.

They can also set this during onboarding step 3 if you tell them the URL upfront.

### Not recommended for friends

`http://127.0.0.1:8787` only works if **they** run `npm run auth:dev` on their PC. Skip this for casual testers.

---

## What your friend should do

### Install

1. Run the installer (Windows may show SmartScreen for unsigned builds — “More info” → “Run anyway” is normal for beta).
2. Launch **Chute** from the Start menu or tray.

### First run

1. **Onboarding** opens automatically — walk through welcome → tour → connect apps → hotkey.
2. On **Connect your apps**, set **OAuth Backend URL** to the URL you provided, then click **Connect** for each app they use.
3. Finish setup. **Configured** means tokens are saved; captures sync when **Send to** chips are enabled on the capture window.

### Daily use

| Action | How |
|--------|-----|
| Open capture | `Ctrl+Shift+Space` (Windows) / `Cmd+Shift+Space` (Mac) |
| Save & close | `Enter` |
| Save & keep open | `Shift+Enter` |
| Dismiss | `Esc` |
| History | Tray → View All Captures |
| Settings | Tray → Settings |

### Timed reminders

Text like **“call mom tomorrow at 5pm”** parses a time. If Google is connected, **Google Calendar** is suggested automatically.

### If sync does not work

- Settings → Integrations: provider must show **Configured** (not just connected during setup).
- On capture: enable **Send to** for that app (chips under the prompt).
- Check History for per-capture sync errors.

---

## What you should verify before sending

Run on a **clean machine** (or after reset):

```powershell
npm run beta:check
npm run friend:build
```

Manual checklist:

- [ ] Hotkey opens capture quickly
- [ ] Save clears the prompt
- [ ] Connect works against **your hosted** OAuth URL (not localhost)
- [ ] At least one destination (e.g. Slack or Notion) receives a test capture
- [ ] Onboarding completes and does not reopen every launch

Reset local onboarding (your dev machine only):

```powershell
npm run dev:reset
# or: python scripts/reset-onboarding.py
```

---

## Feedback to collect

Ask your friend to note:

1. Install friction (SmartScreen, missing tray icon, etc.)
2. Onboarding — anything confusing?
3. Connect flow — which apps, any errors?
4. Capture → did it arrive where expected?
5. OS version (e.g. Windows 11 24H2)

---

## Security reminder

- Do **not** commit `auth-server/.env` or share client secrets in chat.
- Rotate any secret that appeared in screenshots or messages before wider distribution.
