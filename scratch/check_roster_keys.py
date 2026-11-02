import sqlite3

conn = sqlite3.connect(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\backend\campus.db")
cur = conn.cursor()
cur.execute("SELECT is_registered, count(*) FROM roster_keys GROUP BY is_registered;")
print("roster_keys registration counts:", cur.fetchall())

cur.execute("SELECT count(*) FROM students WHERE password IS NOT NULL AND password != '';")
print("students with password:", cur.fetchone()[0])
