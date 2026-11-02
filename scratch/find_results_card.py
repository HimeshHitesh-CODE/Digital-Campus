with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\results.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines[375:440]):
    print(f"L{idx+376}: {repr(l)}")
