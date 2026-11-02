import sqlite3

conn = sqlite3.connect(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\backend\campus.db")
cur = conn.cursor()
cur.execute("SELECT pin, secret_key, is_registered FROM roster_keys WHERE pin IN ('24259-CS-025', '24259-AIML-001');")
for r in cur.fetchall():
    print(r)
