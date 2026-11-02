with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\idea-hub.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines[89:160]):
    print(f"L{idx+90}: {repr(l)}")
