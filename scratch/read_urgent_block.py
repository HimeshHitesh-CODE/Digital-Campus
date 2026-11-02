with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\document-logistics.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines[168:196]):
    print(f"L{idx+169}: {repr(l)}")
