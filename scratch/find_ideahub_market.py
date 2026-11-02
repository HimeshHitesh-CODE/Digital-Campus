with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\idea-hub.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if any(k in l for k in ['Sync GitHub', '34 Squads', 'Flagship Collegiate Challenge', '8 Branches', '12 Finalists']):
        print(f"Idea Hub L{idx+1}: {l.strip()[:100]}")

with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\marketplace.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if any(k in l for k in ['Campus Verifier On', 'Verifier']):
        print(f"Marketplace L{idx+1}: {l.strip()[:100]}")
