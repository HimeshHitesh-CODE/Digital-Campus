with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\students-info.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines[240:280]):
    print(f"{idx+241}: {l.rstrip()}")
