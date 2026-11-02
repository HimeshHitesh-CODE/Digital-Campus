with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\attendance.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("Lines 150-170:")
for idx, l in enumerate(lines[149:170]):
    print(f"L{idx+150}: {l.rstrip()}")

print("\nLines 335-355:")
for idx, l in enumerate(lines[334:355]):
    print(f"L{idx+335}: {l.rstrip()}")
