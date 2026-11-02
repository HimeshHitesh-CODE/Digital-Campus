with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\attendance.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("Lines 510-575:")
for idx, l in enumerate(lines[509:575]):
    print(f"L{idx+510}: {l.rstrip()}")
