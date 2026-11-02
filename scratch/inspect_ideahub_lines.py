with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\idea-hub.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("idea-hub.html total lines:", len(lines))
for idx, l in enumerate(lines):
    if any(k in l for k in ['Sync GitHub', '34 Squads', '8 Branches', '12 Finalists', 'Flagship Collegiate Challenge', 'Available for Projects']):
        print(f"L{idx+1}: {l.strip()[:100]}")
