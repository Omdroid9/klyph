# Klyph beta — quick start (Mac)

Thanks for trying this out. About 5 min to install, 2 min to set up, then it
just sits in your menu bar.

If anything in this guide doesn't match what you see on screen, text me — odds
are it's a bug, not you.

---

## What it is

A hotkey-summoned capture tool. Spotlight crossed with a sticky note. Hit a
hotkey, type a thought, press Enter — it lands in the right place automatically
(Apple Notes today, Slack / Notion / Calendar / Discord optional).

Two windows:

- **Capture overlay**: tiny, always-on-top. Hotkey to open, `Esc` to dismiss.
  You'll spend 99% of your time here.
- **Library**: full-size browser of everything you've captured, with reasoning
  for where each one was routed. Open from the menu bar or `Cmd+Shift+L`.

Marketing page (screenshots, no install needed): **{{ MARKETING_URL }}**

---

## Install

1. Download **`Klyph_0.1.0_universal.dmg`** (the file I sent).
2. Double-click the `.dmg` to open it. Drag **Klyph** into the **Applications**
   folder. Eject the disk image.
3. Open **Applications** in Finder. **Right-click Klyph → Open** (don't
   double-click the first time). macOS will warn that it's from an
   unidentified developer — click **Open**.

   > Why the dance: I haven't paid Apple's $99/yr to code-sign this beta.
   > Right-click → Open is macOS's escape hatch for unsigned dev builds.
   > Standard double-click will work for every launch after the first one.

4. Klyph appears in your menu bar (top-right of the screen) as a small icon.

---

## First-run setup (~2 min)

The app walks you through four steps. The important one is **step 3 — Connect
your apps**.

On that screen you'll see Apple Notes in the destinations list. Click
**Enable** next to it.

macOS will show this prompt:

> **"Klyph" wants access to control "Notes".**
> Allowing control will provide access to documents and data in "Notes", and
> to perform actions within that app.
>
> [Don't Allow]  **[OK]**

**Click OK.**

> If you accidentally click Don't Allow: open **System Settings → Privacy &
> Security → Automation → Klyph** and toggle **Notes** on. Then click Enable
> in Klyph again.

Klyph creates a test note in Apple Notes. Open the **Notes** app and confirm
there's a "Klyph test note" in a folder called **Klyph**. If you see it,
Apple Notes is wired up. Text me a thumbs up.

The other destinations on that screen (Slack, Discord, Notion, Google) are
**optional for this beta** — skip them if you only want to test Apple Notes.
If you want them, the OAuth backend is at: **{{ OAUTH_BACKEND_URL }}**

After step 3, you'll see step 4 about the **capture hotkey** (`Cmd+Shift+Space`
by default). The first time you press it, macOS may show this prompt:

> **Klyph would like to use Accessibility features.**
>
> [Don't Allow]  [Open System Settings]

This is for the global hotkey. Click **Open System Settings**, then toggle
**Klyph** on in the Accessibility list. Come back to Klyph, press the hotkey
again — the capture box will appear.

---

## 60-second smoke test

Once setup is done, do this so we both know it works end-to-end:

1. Press **`Cmd+Shift+Space`** from anywhere (a browser, Finder, wherever).
2. Type exactly: **"Klyph beta test from <your name>"**
3. Press **Enter**.
4. Open the **Apple Notes** app. Look in the **Klyph** folder.
5. You should see your test note there.

Text me **yes** or **no**. If no, jump to the Recovery section below.

---

## Daily use

| Action | How |
|---|---|
| Open capture | `Cmd+Shift+Space` |
| Save & dismiss | `Enter` |
| Save & keep open | `Shift+Enter` |
| Cancel | `Esc` |
| Open Library | `Cmd+Shift+L` or menu bar → Open Library |
| Open Settings | Menu bar → Settings |

**Time parsing**: write "call mom tomorrow at 5pm" and the agent will surface
a Google Calendar suggestion if Calendar is connected. If not, the capture
still lands in Apple Notes with the time text intact.

**The Library window**: every capture is browsable here. The right pane shows
*why* a capture was routed where it was (intent, confidence, notes). You can
reroute or retry anything that didn't land where you expected.

---

## What I'd love feedback on

In priority order:

1. **The macOS permission prompts** — were the wording/timing of the prompts
   clear? Did anything surprise you?
2. **First-run flow** — does step 3 (Connect your apps) make sense, or did you
   want to skip it?
3. **The capture rhythm** — hotkey + type + Enter. Does it feel natural? How
   does it compare to whatever you use today (Notes, Things, Stickies)?
4. **Routing decisions** — when the agent files something somewhere, does it
   land where you expected? The Library's "Why" panel shows reasoning.
5. **Anything that broke, looked off, or made you say "ugh"** — screenshots
   welcome, no detail too small.

Text these to me casually as you notice them, no need for a structured
report.

---

## Recovery — if the test note didn't appear

Run through this checklist top to bottom; one of these will be it.

**1. Is the Apple Notes app set up?**

Open **Notes.app** from Applications. If it asks you to sign in or pick an
account, do that. Klyph needs at least one Notes account configured. iCloud
is fine; "On My Mac" is fine.

**2. Did you allow Notes automation for Klyph?**

Open **System Settings → Privacy & Security → Automation**. Look for **Klyph**
in the list. Underneath Klyph, you should see **Notes** with a toggle. The
toggle must be **on**.

If Klyph isn't in the list at all, the prompt never fired — go back to
onboarding step 3 and click Enable next to Apple Notes again.

**3. Is the bundle identifier `app.klyph`?**

In Finder, right-click `Klyph.app` → Show Package Contents → Contents →
Info.plist. The `CFBundleIdentifier` should be `app.klyph`. If it's
something else, you downloaded the wrong build — text me and I'll send the
right `.dmg`.

**4. Force-quit and relaunch.**

Sometimes macOS caches stale permission state. Right-click the Klyph menu
bar icon → Quit. Reopen from Applications. Try the test note again.

**5. Nothing worked.**

Text me with:
- A screenshot of the System Settings → Privacy & Security → Automation page
- The exact error text you see in Klyph (if any)
- What you saw at each onboarding step

I'll likely have a fix within an hour.

---

## Reset or uninstall

- **Reset onboarding** (start over): Settings has a reset button at the
  bottom. Or, with Klyph quit: delete `~/Library/Application Support/app.klyph/`,
  then relaunch.
- **Uninstall**: drag `Klyph.app` from Applications to Trash. To clean up
  completely: also delete `~/Library/Application Support/app.klyph/` and
  remove Klyph from System Settings → Privacy & Security → Automation
  and Accessibility.

---

## Privacy

- All captures live in `~/Library/Application Support/app.klyph/klyph.db` on
  your Mac. It's a local SQLite file. Nothing gets uploaded except to the
  destinations you enable (Apple Notes, optionally Slack/Notion/etc.).
- Apple Notes traffic is **entirely local** — Klyph talks to the Notes app
  via AppleScript on your machine. No server in the loop.
- OAuth tokens (for Slack/Notion/etc., if you enable them) are stored
  encrypted in a separate local file.
- The OAuth backend ({{ OAUTH_BACKEND_URL }}) is only used to exchange OAuth
  codes for tokens during the initial "Connect" step. Captures themselves
  never pass through it.

Thanks again — let me know what you think.
