with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\01-auth\login.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, l in enumerate(lines):
    if '24259' in l or 'student123' in l:
        print(f"{idx+1}: {l.strip()}")
