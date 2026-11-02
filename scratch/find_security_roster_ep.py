with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\backend\main.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if '/security-roster' in l:
        print(f"L{idx+1}: {l.strip()}")
        for j in range(idx+1, min(len(lines), idx+30)):
            print(f"  {j+1}: {lines[j].rstrip()}")
        break
