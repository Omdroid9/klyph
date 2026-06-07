import os
import sqlite3
import sys

db_path = os.path.join(os.environ["APPDATA"], "app.klyph", "klyph.db")
if not os.path.exists(db_path):
    print(f"Database not found: {db_path}", file=sys.stderr)
    sys.exit(1)

conn = sqlite3.connect(db_path)
rows = conn.execute(
    "SELECT key, value FROM settings WHERE key IN ('onboarding_complete', 'capture_tour_complete')"
).fetchall()
conn.close()

print(f"DB: {db_path}")
for key, value in rows:
    print(f"  {key} = {value!r}")
if not rows:
    print("  (no onboarding flags — setup should show)")
