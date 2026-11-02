with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\students-info.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines[279:295]):
    print(f"{idx+280}: {l.rstrip()}")
