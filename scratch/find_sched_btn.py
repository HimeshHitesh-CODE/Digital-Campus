with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\dashboard.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if 'Schedule Appointment' in l:
        print(f"L{idx+1}: {l.strip()}")
        for j in range(max(0, idx-5), min(len(lines), idx+6)):
            print(f"  {j+1}: {lines[j].rstrip()}")
