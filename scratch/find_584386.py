with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\document-logistics.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if '584386' in l or '5 8 4 3 8 6' in l:
        print(f"L{idx+1}: {repr(l)}")
        for j in range(max(0, idx-2), min(len(lines), idx+6)):
            print(f"  {j+1}: {repr(lines[j])}")
