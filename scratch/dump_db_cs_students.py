import sqlite3

conn = sqlite3.connect('backend/campus.db')
cur = conn.cursor()

# Get column names of students table
cur.execute("PRAGMA table_info(students)")
cols = [c[1] for c in cur.fetchall()]
print("Columns in students table:", cols)

cur.execute("SELECT pin, name, attendance_pct, attendance_val, cgpa, backlogs_count, backlogs FROM students WHERE pin LIKE '24259-CS-%' ORDER BY pin ASC")
rows = cur.fetchall()
print(f"\nFetched {len(rows)} CS students:")
for r in rows[:20]:
    print(" ", r)

# Check if any backlog_records exist for CS students
cur.execute("SELECT count(*) FROM backlog_records WHERE pin LIKE '24259-CS-%'")
cs_backlogs_count = cur.fetchone()[0]
print("\nCS backlog_records count:", cs_backlogs_count)

if cs_backlogs_count > 0:
    cur.execute("SELECT pin, semester, subject_code, subject_name, internal_marks, end_exam_marks, total_marks FROM backlog_records WHERE pin LIKE '24259-CS-%' LIMIT 10")
    for b in cur.fetchall():
        print("  Backlog:", b)

conn.close()
