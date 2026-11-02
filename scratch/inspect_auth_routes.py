with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\backend\main.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if any(k in l for k in ['/auth/hod-login', '/auth/login', '/auth/register', '/auth/verify-pin']):
        print(f"Line {idx+1}: {l.strip()}")
        # print next 30 lines
        for j in range(idx+1, min(idx+35, len(lines))):
            print(f"  {j+1}: {lines[j].rstrip()}")
        print("-" * 50)
