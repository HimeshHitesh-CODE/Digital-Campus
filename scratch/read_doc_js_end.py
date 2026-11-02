with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\document-logistics.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines[90:]):
    print(f"L{idx+91}: {l.rstrip()}")
