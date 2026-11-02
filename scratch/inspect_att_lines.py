with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\attendance.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("attendance.html total lines:", len(lines))
# Check File Medical Appeal
for idx, l in enumerate(lines):
    if any(k in l for k in ['File Medical Appeal', 'Medical Appeal Modal', 'Subject-Wise Biometric Audit', 'Discrepancy Rectification Desk']):
        print(f"L{idx+1}: {l.strip()[:100]}")
