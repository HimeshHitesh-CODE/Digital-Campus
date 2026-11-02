with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\dashboard.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines[34:115]):
    print(f"{idx+35}: {l.rstrip()}")
