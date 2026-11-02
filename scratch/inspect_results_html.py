with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\results.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("results.html total lines:", len(lines))
for idx, l in enumerate(lines):
    if any(k in l for k in ['Print Memo', 'Download Consolidated Memo', 'Recounting', 'Re-evaluation', '@media print']):
        print(f"L{idx+1}: {l.strip()[:100]}")
