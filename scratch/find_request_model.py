with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\backend\main.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if 'class DigitalRequestDB' in l:
        for j in range(idx, min(len(lines), idx+25)):
            print(f"L{j+1}: {lines[j].rstrip()}")
        break
