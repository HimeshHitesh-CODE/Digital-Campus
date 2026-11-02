with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\document-logistics.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if 'urgentToggle' in l or 'Urgent' in l:
        print(f"L{idx+1}: {l.strip()}")
        for j in range(max(0, idx-2), min(len(lines), idx+10)):
            print(f"  {j+1}: {lines[j].rstrip()}")
