with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\document-logistics.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if 'RIGHT CARD' in l or 'Active Document Requests' in l:
        print(f"L{idx+1}: {repr(l)}")
        for j in range(idx, min(len(lines), idx+30)):
            print(f"  {j+1}: {repr(lines[j])}")
        break
