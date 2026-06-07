import json
import os
import sqlite3
import sys

APP_DIR = os.path.join(os.environ["APPDATA"], "app.klyph")
DB_PATH = os.path.join(APP_DIR, "klyph.db")
SECURE_STORE_PATH = os.path.join(APP_DIR, "secure-settings.json")

ONBOARDING_KEYS = ("onboarding_complete", "capture_tour_complete", "capture_draft")
INTEGRATION_KEYS = (
    "slack_webhook_url",
    "discord_webhook_url",
    "notion_token",
    "notion_page_id",
    "google_tasks_access_token",
    "google_tasks_refresh_token",
    "google_tasks_list_id",
    "google_calendar_id",
)
SECURE_INTEGRATION_KEYS = set(INTEGRATION_KEYS)


def main() -> int:
    if not os.path.exists(DB_PATH):
        print(f"Database not found: {DB_PATH}", file=sys.stderr)
        return 1

    keys_to_clear = ONBOARDING_KEYS + INTEGRATION_KEYS
    placeholders = ",".join("?" for _ in keys_to_clear)

    conn = sqlite3.connect(DB_PATH)
    conn.execute(f"DELETE FROM settings WHERE key IN ({placeholders})", keys_to_clear)
    conn.commit()
    conn.close()

    if os.path.exists(SECURE_STORE_PATH):
        try:
            with open(SECURE_STORE_PATH, encoding="utf-8") as handle:
                secure_data = json.load(handle)
            if isinstance(secure_data, dict):
                for key in SECURE_INTEGRATION_KEYS:
                    secure_data.pop(key, None)
                with open(SECURE_STORE_PATH, "w", encoding="utf-8") as handle:
                    json.dump(secure_data, handle, indent=2)
        except (OSError, json.JSONDecodeError) as error:
            print(f"Warning: could not update secure store: {error}", file=sys.stderr)

    print("Reset initial setup:")
    print("  - onboarding + capture tour")
    print("  - saved integration credentials")
    print("  - capture draft")
    return 0


if __name__ == "__main__":
    sys.exit(main())
