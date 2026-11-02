import sqlite3

conn = sqlite3.connect('backend/campus.db')
cur = conn.cursor()

# Check tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cur.fetchall()
print("Tables in campus.db:", tables)

# Check backlog_records
if ('backlog_records',) in tables:
    cur.execute("SELECT * FROM backlog_records LIMIT 20")
    b_rows = cur.fetchall()
    print("\nSample backlog_records count:", len(b_rows))
    for b in b_rows[:10]:
        print(" ", b)

# Count students
cur.execute("SELECT count(*) FROM students WHERE pin LIKE '24259-CS-%'")
count_cs = cur.fetchone()[0]
print("\nTotal CS students in database:", count_cs)

conn.close()
