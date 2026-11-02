with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\students-info.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if 'Pagination' in l or 'pagination' in l:
        print(f"L{idx+1}: {l.strip()[:100]}")
        for j in range(max(0, idx-2), min(len(lines), idx+15)):
            print(f"  {j+1}: {lines[j].rstrip()}")
