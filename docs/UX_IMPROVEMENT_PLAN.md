# Chute — UX & Product Improvement Plan

> Source: full UX/PM review of the capture window (July 2026) + market analysis.
> Principle behind every item: **Chute is a reflex, not a destination.** Anything
> that adds friction between thought and Enter is a bug, even if it's pretty.

---

## Workstream 1 — The Reflex Window (P0, identity-level)

**Problem:** The capture window is a large, mostly empty app-like surface. The
product promise is a whisper over your work (Spotlight/Raycast scale), and the
current design recreates the context switch it exists to kill.

| # | Task | Detail | Files |
|---|------|--------|-------|
| 1.1 | Compact geometry | Capture window opens at ~640×180, positioned top-center. Grows vertically as content grows (cap ~50% screen height). | `src-tauri/tauri.conf.json`, `src-tauri/src/commands.rs` (resize command), `CaptureWindow.tsx` |
| 1.2 | Single-voice empty state | Remove "Capture anything" heading + subtitle + hint chips. One rotating placeholder teaches the parser: *"Try: call mom tomorrow 5pm"*. Recap strip remains the only empty-state extra. | `CaptureWindow.tsx` |
| 1.3 | Progressive disclosure | Lanes, tags, formatting toolbar, destination row, and keyboard hints render only once `text.length > 0` (fast fade-in, no layout jump — reserve space or animate height). Destinations appear exactly when the routing suggestion becomes meaningful. | `CaptureWindow.tsx`, `index.css` |
| 1.4 | Expanded mode (optional) | `Cmd+E` toggles a tall window for long-form notes; remembered per session. | `CaptureWindow.tsx`, `commands.rs` |

**Acceptance:** empty window ≤ ~200px tall; autofocus + time-to-first-keystroke
unchanged; typing reveals controls without visual jank; hotkey → typed → Enter →
gone still works with zero mouse.

**Effort:** 1–2 sessions. **Risk:** medium (window resize behavior differs per OS/webview).

---

## Workstream 2 — Trust & Clarity Quick Wins (P0, cheap)

**Problem:** State the user must trust (where will this go?) is visually
ambiguous, and several details read as unfinished or user-hostile.

| # | Task | Detail | Files |
|---|------|--------|-------|
| 2.1 | Destination chip contrast | Active chips get filled accent treatment; inactive stay ghost. Unmistakable at a glance. | `index.css`, `CaptureWindow.tsx` |
| 2.2 | Saved toast with Undo | After Enter: "✓ Reminders · tomorrow 5 PM — Undo" (~5s). Undo deletes the capture. Requires a short sync grace period for undoable captures (delay the `request-sync` emit ~5s, or mark capture `pending` until toast expires) so Undo wins the race against the sync engine. | `CaptureWindow.tsx`, `syncManager.ts`, `db.ts` |
| 2.3 | Brand + copy cleanup | Pick one name (recommend **Chute** everywhere; "FlowCapture" dies). Placeholder rewrite; kill the "CAPTURE" badge or make it functional (sync status). | `CaptureWindow.tsx` |
| 2.4 | Defuse "All" | Move behind confirm or into an overflow menu — one accidental click currently sprays a private thought to every connected app. | `CaptureWindow.tsx` |
| 2.5 | Rename "Distraction" | User-facing label → "Park it" (list stays "Parking Lot"). First-run tooltip explains it. | `CaptureWindow.tsx` |
| 2.6 | Char limit sanity | 280 → 2000. Counter hidden until < 100 remaining. | `CaptureWindow.tsx`, `db.ts` (no schema change; TEXT already) |
| 2.7 | Hints that graduate | Keyboard hint row shows for the first ~20 captures (tracked in settings), then collapses to a `?` icon. | `CaptureWindow.tsx` |

**Effort:** 1 session. **Risk:** low. Highest polish-per-hour in the plan.

---

## Workstream 3 — Keyboard-Native Capture (P1, power-user moat)

**Problem:** Lanes, tags, list, destinations are mouse-only; power users' hands
leave home row. Parsing is invisible until the preview line.

| # | Task | Detail |
|---|------|--------|
| 3.1 | Inline token syntax | `#work` → tag, `/slack` (or `>slack`) → destination, existing `@time`. Tokens stripped from saved content, applied as metadata. Extend `parser.ts`; reuse routing engine. |
| 3.2 | Autocomplete popover | Typing `#` or `/` opens a keyboard-navigable suggestion list (tags, lists, connected destinations). |
| 3.3 | Parse feedback highlight | Recognized tokens get a highlight layer behind the transparent textarea (standard overlay trick) so users *see* Chute understanding them — the Todoist/Fantastical wow. Full pill editing is out of scope for v1. |
| 3.4 | Cheap shortcuts now | `Cmd+1/2/3` tags, `Cmd+D` cycle destination presets. Can ship inside WS2 if desired. |

**Effort:** 2–3 sessions. **Risk:** medium-high (overlay alignment across webviews).
**Payoff:** the habit-forming flow; also makes a demo video sing.

---

## Workstream 4 — Voice Capture (P1, the launch headline)

**Problem/opportunity:** Dictation apps (Superwhisper, Wispr Flow) are booming
but stop at transcription; Chute's routing engine is the missing half. On-device
keeps the privacy story intact.

| # | Task | Detail |
|---|------|--------|
| 4.1 | Whisper in Rust | `whisper-rs` (whisper.cpp). Model download-on-first-use (~75MB quantized `base.en`) rather than bundling; store in app data dir. |
| 4.2 | Hold-to-talk | Hold the global hotkey (or a second hotkey) → record; release → transcribe → text lands in the capture box through the normal parser/routing. Recording indicator + mic permission flow. |
| 4.3 | Mac first, Windows after | WASAPI capture differs; don't block the Mac launch on it. |

**Effort:** 3–5 sessions. **Risk:** high (native audio, model distribution, latency tuning).
**Decision needed:** model size vs. accuracy; auto-download UX.

---

## Workstream 5 — Recall & Lock-in (P2, retention layer)

**Problem:** Chute is a write-only chute; nothing accumulates value, so nothing
prevents churn.

| # | Task | Detail |
|---|------|--------|
| 5.1 | `?` recall search | `?groceries` in the capture box searches everything ever captured (SQLite FTS5). Results keyboard-navigable; Enter copies/opens. The more you capture, the more leaving costs. |
| 5.2 | Context-aware routing | Record the frontmost app at capture time (macOS `NSWorkspace` via a Tauri command). Show it in History; add `app` as a rule field ("captures while in Figma → work"). No competitor does this. |
| 5.3 | Recap enrichment | Add a soft monthly stat to the recap strip ("142 thoughts this month"); no streak-guilt mechanics. |

**Effort:** 2–3 sessions total, independently shippable pieces. **Risk:** low-medium.

---

## Workstream 6 — Ship & Distribution (parallel track, from product roadmap)

Unchanged from the July roadmap; listed so sequencing is honest:

1. Apple Developer ID signing + notarization ($99/yr) — kills the Gatekeeper scare.
2. Tauri updater — beta iteration without re-downloads.
3. OAuth bridge off Render free tier (cold start ruins first connect).
4. Launch assets: demo video (voice → route is the money shot), Product Hunt / Show HN.

---

## Suggested sequencing

| Sprint | Contents | Outcome |
|--------|----------|---------|
| **1. "The Reflex Update"** | WS2 (all) + WS1 (1.1–1.3) | The app finally *feels* like its promise. Best effort-to-impact. |
| **2. Ship-ready + tokens** | WS6 (signing/updater) + WS3 | Distributable to strangers; power-user flow. |
| **3. Voice** | WS4 | The launch headline. |
| **4. Lock-in** | WS5 + launch (WS6.4) | Retention layer live before/at public launch. |

## Open decisions (need Omkar's call)

1. **Brand:** Chute everywhere, or is "FlowCapture" the intended product name?
2. **"All" button:** confirm-dialog, overflow menu, or delete entirely?
3. **Char limit:** 2000 OK?
4. **Voice model:** auto-download `base.en` on first use vs. explicit opt-in download in Settings?
