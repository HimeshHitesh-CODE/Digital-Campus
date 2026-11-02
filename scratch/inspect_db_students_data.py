import sqlite3, os

db_path = 'backend/campus.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT pin, name, attendance_pct, cgpa, backlogs_count FROM students WHERE pin LIKE '24259-CS-%' LIMIT 15")
    rows = cur.fetchall()
    print("Database students rows:", len(rows))
    for r in rows:
        print(" ", r)
    conn.close()
else:
    print("No campus.db found!")
