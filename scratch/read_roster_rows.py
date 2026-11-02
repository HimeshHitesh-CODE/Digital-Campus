with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\security-roster.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines[140:220]):
    print(f"L{idx+141}: {l.rstrip()}")
