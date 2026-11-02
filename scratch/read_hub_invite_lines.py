with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\idea-hub.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines[295:340]):
    print(f"L{idx+296}: {repr(l)}")
