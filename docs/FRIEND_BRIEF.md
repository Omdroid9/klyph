# Chute beta — quick start

Thanks for trying this out. Should take ~5 min to install and ~5 to set up,
then it just sits in your tray.

---

## What it is

A hotkey-summoned capture tool. Something like Apple Spotlight crossed with a
sticky note. Hit a hotkey, type a thought, press Enter, and it gets filed
into the right place automatically (Notion, Calendar, Reminders, Slack, etc.).

Two windows:

- **Capture overlay**: tiny, transparent, always-on-top. Opened with a hotkey,
  dismissed with `Esc`. You'll spend 99% of your time here.
- **Library window**: full-size. Browse everything you've captured, see where
  each one went and why the agent routed it there. Open from the tray or with
  `Ctrl+Shift+L`.

Marketing site with screenshots: **{{ MARKETING_URL }}**

---

## Install (Windows)

1. Download **`Chute_0.1.0_x64-setup.exe`** (the file I sent).
2. Double-click. Windows SmartScreen will yell at you. Click **More info**
   then **Run anyway**. Standard stuff for unsigned beta builds; I'll code-sign
   before any wider release.
3. Launch **Chute** from the Start menu or the system tray.

If your antivirus flags it, that's also expected for unsigned builds. Whitelist
once and you're set.

---

## First-run setup (~5 min)

The app walks you through it. The only step that needs anything from me is
**step 3, Connect your apps**.

On that screen:

- Set **OAuth Backend URL** to: **{{ OAUTH_BACKEND_URL }}**
- Hit **Connect** for each app you want:
  - **Discord**: ready
  - **Google** (Tasks + Calendar): ready
  - Slack / Notion: not configured for this beta, skip
- macOS only: **Apple Notes** works without any setup

You can change all of this later in Settings, Integrations.

---

## Daily use

| Action | How |
|---|---|
| Open capture | `Ctrl+Shift+Space` |
| Save & dismiss | `Enter` |
| Save & keep open | `Shift+Enter` |
| Cancel | `Esc` |
| Open Library | `Ctrl+Shift+L` or tray, Open Library |
| Open Settings | Tray, Settings |

**Time parsing**: write something like "call mom tomorrow at 5pm" and it
auto-suggests Google Calendar with the time pre-filled.

**Routing**: the agent decides where each capture goes based on its content.
In the Library window, the right pane shows the reasoning (intent, confidence,
notes) and lets you reroute or retry anything that failed.

---

## What I'd love feedback on

Rough priority order:

1. **First-run flow.** Does the onboarding make sense? Where did you get stuck
   or want to skip?
2. **The capture rhythm.** Does hotkey + type + Enter feel natural? How does
   it compare to whatever you use today (Apple Notes, Things, etc.)?
3. **Routing decisions.** When the agent files something somewhere, does it
   land where you expected? The Library's "Why" panel shows reasoning; tell me
   anywhere it's confidently wrong.
4. **The Library.** Does it feel like a useful companion to the overlay, or a
   half-baked second app?
5. **Anything that broke, looked off, or made you say "ugh".** Screenshots
   welcome. No detail too small.

Text these to me casually as you notice them, no need for a structured report.

---

## Reset or uninstall

- **Reset onboarding** (start over): Settings has a reset button at the
  bottom. Or close the app, delete `%APPDATA%\com.usechute.app\`, relaunch.
- **Uninstall**: Windows Settings, Apps, Chute, Uninstall. Clean, no
  registry junk left behind.

---

## Privacy

- All captures live in `%APPDATA%\com.usechute.app\chute.db` on your
  machine. It's a local SQLite file. Nothing gets uploaded to anyone except the
  destinations you enable (Notion, Calendar, etc.).
- OAuth tokens are stored encrypted in a separate local file.
- The OAuth backend I'm running ({{ OAUTH_BACKEND_URL }}) is only used to
  exchange OAuth codes for tokens during the initial Connect. Captures
  themselves never pass through it.

Thanks again, let me know what you think.
