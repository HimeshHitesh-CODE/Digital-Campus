with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\css\top-nav.css", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines[:80]):
    print(f"{idx+1}: {l.rstrip()}")
