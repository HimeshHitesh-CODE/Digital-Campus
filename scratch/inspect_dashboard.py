with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\dashboard.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("Total lines in dashboard.html:", len(lines))
for idx, l in enumerate(lines):
    if any(k in l for k in ['Block-B', 'Central Campus Grounds', 'Notice Board', 'Schedule Appointment', 'ContactUs', 'Engineering Wing']):
        print(f"Line {idx+1}: {l.strip()[:100]}")
