with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\attendance.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("attendance.html total lines:", len(lines))
for idx, l in enumerate(lines):
    if any(k in l for k in ['Medical Appeal', 'Medical Excuse', 'Subject-Wise Biometric Audit', 'Discrepancy Rectification Desk']):
        print(f"Line {idx+1}: {l.strip()[:100]}")
