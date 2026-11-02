import sqlite3
import os

db_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\backend\campus.db"
print("campus.db exists:", os.path.exists(db_path))
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [r[0] for r in cur.fetchall()]
    print("Tables:", tables)
    for t in tables:
        try:
            cur.execute(f"PRAGMA table_info({t});")
            cols = [c[1] for c in cur.fetchall()]
            cur.execute(f"SELECT count(*) FROM {t};")
            cnt = cur.fetchone()[0]
            print(f"Table {t}: count={cnt}, cols={cols}")
        except Exception as e:
            print(f"Table {t} error:", e)
