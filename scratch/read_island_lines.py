with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\js\dc-dynamic-island.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines[80:190]):
    print(f"{idx+81}: {l.rstrip()}")
