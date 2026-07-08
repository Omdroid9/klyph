use tauri::State;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};

use crate::{default_hotkey, tray_tooltip, window, AppState, TRAY_ID};

#[tauri::command]
pub fn show_capture_window(app: tauri::AppHandle) -> Result<(), String> {
  window::show_capture_window(&app)
}

#[tauri::command]
pub fn hide_capture_window(app: tauri::AppHandle) -> Result<(), String> {
  window::hide_capture_window(&app)
}

#[tauri::command]
pub fn resize_capture_window(app: tauri::AppHandle, height: f64) -> Result<(), String> {
  window::resize_capture_window(&app, height)
}

#[tauri::command]
pub fn exit_app(app: tauri::AppHandle) {
  window::quit_app(&app);
}

#[tauri::command]
pub fn open_settings_window(app: tauri::AppHandle) -> Result<(), String> {
  window::open_settings_window(&app)
}

#[tauri::command]
pub fn open_history_window(app: tauri::AppHandle) -> Result<(), String> {
  window::show_history_window(&app)
}

#[tauri::command]
pub fn show_library_window(app: tauri::AppHandle) -> Result<(), String> {
  window::show_library_window(&app)
}

#[tauri::command]
pub fn hide_library_window(app: tauri::AppHandle) -> Result<(), String> {
  window::hide_library_window(&app)
}

#[tauri::command]
pub fn get_default_hotkey() -> String {
  default_hotkey().to_string()
}

#[tauri::command]
pub fn get_active_hotkey(state: State<'_, AppState>) -> Result<String, String> {
  state
    .hotkey
    .lock()
    .map(|value| value.clone())
    .map_err(|_| "Unable to read active hotkey".to_string())
}

#[tauri::command]
pub fn set_capture_hotkey(
  app: tauri::AppHandle,
  state: State<'_, AppState>,
  hotkey: String,
) -> Result<(), String> {
  let normalized = hotkey.trim();
  if normalized.is_empty() {
    return Err("Hotkey cannot be empty".to_string());
  }

  let parsed_shortcut: Shortcut = normalized
    .parse()
    .map_err(|_| "Invalid hotkey format. Example: Ctrl+Shift+Space".to_string())?;

  // Only unregister the previous capture shortcut. The library shortcut
  // is owned by a separate slot in AppState and must survive a rebind.
  let previous_capture = state
    .hotkey
    .lock()
    .ok()
    .map(|guard| guard.clone())
    .and_then(|s| s.parse::<Shortcut>().ok());
  if let Some(previous) = previous_capture {
    let _ = app.global_shortcut().unregister(previous);
  }

  if let Err(error) = app.global_shortcut().register(parsed_shortcut) {
    // Never leave the app with zero capture shortcuts after a failed update.
    if let Ok(fallback) = default_hotkey().parse::<Shortcut>() {
      let _ = app.global_shortcut().register(fallback);
      if let Ok(mut value) = state.hotkey.lock() {
        *value = default_hotkey().to_string();
      }
    }
    return Err(error.to_string());
  }

  let mut value = state
    .hotkey
    .lock()
    .map_err(|_| "Unable to update hotkey".to_string())?;
  *value = normalized.to_string();

  Ok(())
}

#[tauri::command]
pub fn update_tray_tooltip(
  app: tauri::AppHandle,
  captures_today: u32,
  last_sync: String,
) -> Result<(), String> {
  let tooltip = tray_tooltip(captures_today, &last_sync);
  if let Some(tray) = app.tray_by_id(TRAY_ID) {
    tray
      .set_tooltip(Some(tooltip))
      .map_err(|error| error.to_string())?;
  }
  Ok(())
}

#[tauri::command]
pub fn open_external_url(url: String) -> Result<(), String> {
  let trimmed = url.trim();
  if trimmed.is_empty() {
    return Err("URL cannot be empty".to_string());
  }

  open::that(trimmed).map_err(|error| error.to_string())?;
  Ok(())
}

/// Parse a local ISO datetime string ("2026-06-15T14:00:00") into components.
/// Returns None if the string is malformed; the caller falls back to no due date.
#[cfg(target_os = "macos")]
fn parse_local_iso(s: &str) -> Option<(i32, u32, u32, u32, u32, u32)> {
  let (date_part, time_part) = s.split_once('T')?;
  let mut d = date_part.split('-');
  let year: i32 = d.next()?.parse().ok()?;
  let month: u32 = d.next()?.parse().ok()?;
  let day: u32 = d.next()?.parse().ok()?;
  let mut t = time_part.split(':');
  let hour: u32 = t.next()?.parse().ok()?;
  let minute: u32 = t.next()?.parse().ok()?;
  let second: u32 = t.next().and_then(|value| value.parse().ok()).unwrap_or(0);
  Some((year, month, day, hour, minute, second))
}

/// Create a reminder in macOS Reminders.app via AppleScript.
/// Values are passed as argv, never interpolated into the script.
/// When `due_date` is a local ISO string ("2026-06-15T14:00:00") the reminder
/// gets a due date; otherwise it is created without one.
#[tauri::command]
pub fn create_apple_reminder(
  list: String,
  title: String,
  body: String,
  due_date: Option<String>,
) -> Result<(), String> {
  #[cfg(target_os = "macos")]
  {
    use std::io::Write;
    use std::process::{Command, Stdio};

    let list = {
      let trimmed = list.trim();
      if trimmed.is_empty() { "Klyph".to_string() } else { trimmed.to_string() }
    };

    let parsed_due = due_date
      .as_deref()
      .and_then(|s| parse_local_iso(s));

    let script = r#"on run argv
  set listName to item 1 of argv
  set reminderTitle to item 2 of argv
  set reminderBody to item 3 of argv
  set hasDue to item 4 of argv
  tell application "Reminders"
    if not (exists list listName) then
      make new list with properties {name:listName}
    end if
    if hasDue is "true" then
      set yr to (item 5 of argv) as integer
      set mo to (item 6 of argv) as integer
      set dy to (item 7 of argv) as integer
      set hr to (item 8 of argv) as integer
      set mn to (item 9 of argv) as integer
      set sc to (item 10 of argv) as integer
      set dueDate to current date
      set year of dueDate to yr
      set month of dueDate to mo
      set day of dueDate to dy
      set hours of dueDate to hr
      set minutes of dueDate to mn
      set seconds of dueDate to sc
      make new reminder at list listName with properties {name:reminderTitle, body:reminderBody, due date:dueDate}
    else
      make new reminder at list listName with properties {name:reminderTitle, body:reminderBody}
    end if
  end tell
end run"#;

    let mut cmd = Command::new("osascript");
    cmd
      .arg("-")
      .arg(&list)
      .arg(&title)
      .arg(&body)
      .stdin(Stdio::piped())
      .stdout(Stdio::piped())
      .stderr(Stdio::piped());

    if let Some((year, month, day, hour, minute, second)) = parsed_due {
      cmd
        .arg("true")
        .arg(year.to_string())
        .arg(month.to_string())
        .arg(day.to_string())
        .arg(hour.to_string())
        .arg(minute.to_string())
        .arg(second.to_string());
    } else {
      cmd.arg("false");
    }

    let mut child = cmd
      .spawn()
      .map_err(|e| format!("Could not launch osascript: {e}"))?;

    {
      let mut stdin = child
        .stdin
        .take()
        .ok_or_else(|| "Could not write AppleScript to osascript".to_string())?;
      stdin
        .write_all(script.as_bytes())
        .map_err(|e| format!("Could not send AppleScript: {e}"))?;
    }

    let output = child
      .wait_with_output()
      .map_err(|e| format!("osascript did not complete: {e}"))?;

    if !output.status.success() {
      let stderr = String::from_utf8_lossy(&output.stderr);
      let message = stderr.trim();
      let detail = if message.is_empty() {
        "Apple Reminders automation failed. Grant Klyph permission to control Reminders in System Settings > Privacy & Security > Automation.".to_string()
      } else {
        message.to_string()
      };
      return Err(detail);
    }

    Ok(())
  }

  #[cfg(not(target_os = "macos"))]
  {
    let _ = (list, title, body, due_date);
    Err("Apple Reminders is only available on macOS.".to_string())
  }
}

/// Create a note in the macOS Notes app via AppleScript, with no external
/// helper process. Values are passed as `osascript` arguments (argv) rather
/// than interpolated into the script, so note content cannot break out of the
/// script or inject AppleScript.
#[tauri::command]
pub fn create_apple_note(folder: String, title: String, body: String) -> Result<(), String> {
  #[cfg(target_os = "macos")]
  {
    use std::io::Write;
    use std::process::{Command, Stdio};

    let folder = {
      let trimmed = folder.trim();
      if trimmed.is_empty() {
        "Klyph".to_string()
      } else {
        trimmed.to_string()
      }
    };

    // argv: 1 = folder, 2 = title, 3 = body (HTML). Notes already treats the
    // first body line as the note title, so do not prepend a duplicate heading.
    let script = r#"on run argv
  set folderName to item 1 of argv
  set noteBody to item 3 of argv
  tell application "Notes"
    set targetAccount to default account
    tell targetAccount
      if not (exists folder folderName) then
        make new folder with properties {name:folderName}
      end if
      make new note at folder folderName with properties {body:noteBody}
    end tell
  end tell
end run"#;

    let mut child = Command::new("osascript")
      .arg("-")
      .arg(&folder)
      .arg(&title)
      .arg(&body)
      .stdin(Stdio::piped())
      .stdout(Stdio::piped())
      .stderr(Stdio::piped())
      .spawn()
      .map_err(|error| format!("Could not launch osascript: {error}"))?;

    {
      let mut stdin = child
        .stdin
        .take()
        .ok_or_else(|| "Could not write AppleScript to osascript".to_string())?;
      stdin
        .write_all(script.as_bytes())
        .map_err(|error| format!("Could not send AppleScript: {error}"))?;
    }

    let output = child
      .wait_with_output()
      .map_err(|error| format!("osascript did not complete: {error}"))?;

    if !output.status.success() {
      let stderr = String::from_utf8_lossy(&output.stderr);
      let message = stderr.trim();
      let detail = if message.is_empty() {
        "Apple Notes automation failed. Grant Klyph permission to control Notes in System Settings > Privacy & Security > Automation.".to_string()
      } else {
        message.to_string()
      };
      return Err(detail);
    }

    Ok(())
  }

  #[cfg(not(target_os = "macos"))]
  {
    let _ = (folder, title, body);
    Err("Apple Notes is only available on macOS.".to_string())
  }
}
