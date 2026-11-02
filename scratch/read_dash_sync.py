with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\hod-dashboard.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines[104:215]):
    print(f"L{idx+105}: {repr(l)}")
