with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\dashboard.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines[95:135]):
    print(f"{idx+96}: {l.rstrip()}")
