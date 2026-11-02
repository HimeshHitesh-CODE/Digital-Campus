with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\students-info.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if any(k in l for k in ['pagination', 'Batch 2024-25', '12', '1 2 3', 'table-wrapper', 'max-h-']):
        print(f"Students Info L{idx+1}: {l.strip()[:100]}")
