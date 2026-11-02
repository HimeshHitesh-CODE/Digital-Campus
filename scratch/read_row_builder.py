with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\students-info.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines[414:500]):
    print(f"{idx+415}: {l.rstrip()}")
