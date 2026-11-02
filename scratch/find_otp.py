with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\document-logistics.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if any(k in l for k in ['5 8 4 3 8 6', '584386', 'Pickup OTP', 'Urgent', 'Bus Pass', 'buspass', 'bus-pass']):
        print(f"Student logistics L{idx+1}: {l.strip()[:100]}")

with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\document-approvals.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if any(k in l for k in ['5 8 4 3 8 6', '584386', 'Pickup OTP', 'Urgent', 'Bus Pass', 'buspass', 'bus-pass']):
        print(f"HOD approvals L{idx+1}: {l.strip()[:100]}")
